import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

webpush.setVapidDetails(
  "mailto:example@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const hourParam = url.searchParams.get("hour");
    const body = await req.json().catch(() => ({}));

    let usersToNotify: string[] = [];

    if (body.test && body.userId) {
      // Test mode
      usersToNotify = [body.userId];
    } else if (hourParam) {
      // Cron mode
      const hour = parseInt(hourParam);
      
      // 1. Get users who enabled reminder at this hour
      const { data: settings, error: settingsError } = await supabase
        .from("settings")
        .select("user_id")
        .eq("reminder_enabled", true)
        .eq("reminder_time", hour);

      if (settingsError) throw settingsError;
      if (!settings || settings.length === 0) {
        return new Response(JSON.stringify({ message: "No users to notify for this hour" }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const allUserIds = settings.map((s) => s.user_id);

      // 2. Filter out users who already have a record for today (Taiwan Time)
      // Taiwan is UTC+8
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
        headers: { "Content-Type": "application/json" },
      });
    }

    if (usersToNotify.length === 0) {
      return new Response(JSON.stringify({ message: "Everyone has recorded their weight!" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Fetch subscriptions for these users
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("user_id, endpoint, p256dh, auth")
      .in("user_id", usersToNotify);

    if (subError) throw subError;

    // 4. Send notifications
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
          // If subscription is expired or invalid, we should remove it
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
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
