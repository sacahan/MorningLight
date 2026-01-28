import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

    let VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT");
    if (!VAPID_SUBJECT) {
      console.warn("VAPID_SUBJECT not set, using default.");
      VAPID_SUBJECT = "mailto:admin@example.com";
    }
    if (!VAPID_SUBJECT.startsWith("mailto:") && !VAPID_SUBJECT.startsWith("http")) {
      VAPID_SUBJECT = `mailto:${VAPID_SUBJECT}`;
    }

    try {
      webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
      );
    } catch (e) {
      console.error("WebPush setup failed:", e);
      throw new Error(`WebPush setup failed: ${e.message}`);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const url = new URL(req.url);
    const hourParam = url.searchParams.get("hour");
    const body = await req.json().catch(() => ({}));

    // Manual JWT verification
    const authHeader = req.headers.get("Authorization");
    let user = null;
    let authDebugError = null;
    let tokenDebug = "none";
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        tokenDebug = token.substring(0, 10) + "...";
        const { data: { user: u }, error: authError } = await supabase.auth.getUser(token);
        if (u) user = u;
        if (authError) {
          authDebugError = authError.message;
          console.log("Auth error:", authError);
        }
      } catch (err) {
        authDebugError = "Exception: " + err.message;
      }
    }

    let usersToNotify: string[] = [];

    if (body.test && body.userId) {
      if (!user) {
        // Return debug info in 401 response
        return new Response(JSON.stringify({
          error: "Unauthorized: Please login first",
          debug_error: authDebugError,
          debug_token: tokenDebug,
          debug_project_url: SUPABASE_URL.substring(0, 20) + "..."
        }), {
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
      // Cron mode
      const hour = parseInt(hourParam);

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
      return new Response(JSON.stringify({ message: "Everyone has recorded their weight or no test user detected!" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("user_id, endpoint, p256dh, auth")
      .in("user_id", usersToNotify);

    if (subError) throw subError;

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
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
