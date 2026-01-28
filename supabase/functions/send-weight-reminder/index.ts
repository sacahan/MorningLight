import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // 1. 處理 CORS Preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

    // 容錯處理：如果沒有設定 VAPID_SUBJECT，使用預設值避免崩潰
    let VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT");
    if (!VAPID_SUBJECT) {
      console.warn("VAPID_SUBJECT not set, using default.");
      VAPID_SUBJECT = "mailto:admin@example.com";
    }
    // 確保格式是 URL 或 mailto
    if (!VAPID_SUBJECT.startsWith("mailto:") && !VAPID_SUBJECT.startsWith("http")) {
      VAPID_SUBJECT = `mailto:${VAPID_SUBJECT}`;
    }

    // 設定 Web Push (包在 try-catch 中避免 crash)
    try {
      webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
      );
    } catch (e) {
      console.error("WebPush valid details setup failed:", e);
      throw new Error(`WebPush setup failed: ${e.message}`);
    }

    // 初始化 Supabase Context (使用 Service Role Key 以獲得管理權限)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 解析請求
    const url = new URL(req.url);
    const hourParam = url.searchParams.get("hour");
    const body = await req.json().catch(() => ({}));

    // 手動驗證 JWT (因為我們會暫時關閉 Edge Function 原生的 Verify JWT 以避免 401 問題)
    const authHeader = req.headers.get("Authorization");
    let user = null;
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        // 只有 User Token 才能解析出 User，Anon Key 會回傳 null
        const { data: { user: u }, error: authError } = await supabase.auth.getUser(token);
        if (u) user = u;
        if (authError) {
          console.log("Auth check warning:", authError.message);
        }
      } catch (err) {
        console.error("Error verifying JWT:", err);
      }
    }

    let usersToNotify: string[] = [];

    if (body.test && body.userId) {
      // 測試模式
      // 安全性檢查：如果是測試模式，確保呼叫者只能測試自己的 ID
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized: Please login first to send test notification" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (user.id !== body.userId) {
        return new Response(JSON.stringify({ error: "Forbidden: You can only test your own notifications" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      usersToNotify = [body.userId];
    } else if (hourParam) {
      // Cron 模式
      const hour = parseInt(hourParam);

      // 1. 查詢在這個時間點開啟提醒的使用者
      const { data: settings, error: settingsError } = await supabase
        .from("settings")
        .select("user_id")
        .eq("reminder_enabled", true)
        .eq("reminder_time", hour);

      if (settingsError) throw settingsError;
      if (!settings || settings.length === 0) {
        return new Response(JSON.stringify({ message: "No users to notify for this hour" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const allUserIds = settings.map((s) => s.user_id);

      // 2. 過濾掉今天已經記錄過體重的使用者
      // 台灣時間是 UTC+8
      const now = new Date();
      const taiwanTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      const today = taiwanTime.toISOString().split("T")[0];

      const { data: weights, error: weightsError } = await supabase
        .from("weights")
        .select("user_id")
        .in("user_id", allUserIds)
        .eq("date", today);

      if (weightsError) throw weightsError;

      const usersWithWeight = new Set(weights.map((w) => w.user_id));
      usersToNotify = allUserIds.filter((id) => !usersWithWeight.has(id));
    } else {
      return new Response(JSON.stringify({ error: "Missing hour parameter or test body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (usersToNotify.length === 0) {
      return new Response(JSON.stringify({ message: "Everyone has recorded their weight or no test user found!" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. 取得這些使用者的推播訂閱資訊 (Push Subscription)
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("user_id, endpoint, p256dh, auth")
      .in("user_id", usersToNotify);

    if (subError) throw subError;

    // 4. 發送通知
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        const payload = JSON.stringify({
          title: "Morning Light ☀️",
          body: "早安！別忘了記錄今天的體重喔，小光在等你呢！",
        });

        try {
          await webpush.sendNotification(pushSubscription, payload);
          return { user_id: sub.user_id, success: true };
        } catch (err) {
          // 如果訂閱失效 (404 Not Found 或 410 Gone)，則從資料庫中移除該訂閱
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
          }
          return { user_id: sub.user_id, success: false, error: err.message };
        }
      })
    );

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // 捕捉所有未預期的錯誤，並回傳 500 JSON 以及詳細錯誤訊息
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
