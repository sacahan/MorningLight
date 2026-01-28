import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

// 取得環境變數
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;

// 設定 Web Push VAPID 詳細資訊
// FIXME: 建議將 mailto 更改為實際的管理員信箱
webpush.setVapidDetails(
  "mailto:" + VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);


// 初始化 Supabase Client (使用 Service Role Key 以獲得管理權限)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 解析請求 URL 和參數
    const url = new URL(req.url);
    const hourParam = url.searchParams.get("hour");
    const body = await req.json().catch(() => ({}));

    let usersToNotify: string[] = [];

    // 判斷執行模式
    if (body.test && body.userId) {
      // 測試模式：只發送給指定的使用者 (通常用於前端測試按鈕)
      usersToNotify = [body.userId];
    } else if (hourParam) {
      // 排程模式：根據傳入的小時參數，找出需要接收提醒的使用者
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

      // 查詢這些使用者今天的體重記錄
      const { data: weights, error: weightsError } = await supabase
        .from("weights")
        .select("user_id")
        .in("user_id", allUserIds)
        .eq("date", today);

      if (weightsError) throw weightsError;

      // 找出已經記錄過的使用者 ID
      const usersWithWeight = new Set(weights.map((w) => w.user_id));
      // 篩選出尚未記錄的使用者 (即將發送通知的目標)
      usersToNotify = allUserIds.filter((id) => !usersWithWeight.has(id));
    } else {
      return new Response(JSON.stringify({ error: "Missing hour parameter or test body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (usersToNotify.length === 0) {
      return new Response(JSON.stringify({ message: "Everyone has recorded their weight!" }), {
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
