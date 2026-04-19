import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
};

/** Validate YYYY-MM-DD format and actual date validity */
function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

/** Return a JSON error response */
function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return errorResponse("Method not allowed. Use GET.", 405);
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const WEIGHTS_API_KEY = Deno.env.get("WEIGHTS_API_KEY");

    if (!WEIGHTS_API_KEY) {
      console.error("WEIGHTS_API_KEY secret is not configured.");
      return errorResponse("API key not configured on server.", 500);
    }

    // --- Authentication ---
    // Accept key from "Authorization: Bearer <key>" or "x-api-key: <key>"
    const authHeader = req.headers.get("authorization") ?? "";
    const xApiKey = req.headers.get("x-api-key") ?? "";
    const providedKey = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : xApiKey.trim();

    if (!providedKey || providedKey !== WEIGHTS_API_KEY) {
      return errorResponse("Unauthorized: invalid or missing API key.", 401);
    }

    // --- Parse query parameters ---
    const url = new URL(req.url);
    const params = url.searchParams;

    const userId = params.get("user_id");
    if (!userId) {
      return errorResponse("Missing required parameter: user_id.", 400);
    }

    const daysParam = params.get("days");
    const startDateParam = params.get("start_date");
    const endDateParam = params.get("end_date");
    const orderParam = (params.get("order") ?? "asc").toLowerCase();
    const limitParam = params.get("limit");

    // Validate order
    if (orderParam !== "asc" && orderParam !== "desc") {
      return errorResponse("Invalid value for 'order'. Use 'asc' or 'desc'.", 400);
    }

    // Validate limit
    const limit = limitParam ? parseInt(limitParam, 10) : 100;
    if (isNaN(limit) || limit <= 0 || limit > 1000) {
      return errorResponse("Invalid 'limit'. Must be an integer between 1 and 1000.", 400);
    }

    // Resolve date range — `days` takes precedence over start/end
    let startDate: string;
    let endDate: string;

    if (daysParam !== null) {
      const days = parseInt(daysParam, 10);
      if (isNaN(days) || days <= 0 || days > 3650) {
        return errorResponse("Invalid 'days'. Must be an integer between 1 and 3650.", 400);
      }
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - (days - 1));
      endDate = end.toISOString().split("T")[0];
      startDate = start.toISOString().split("T")[0];
    } else {
      // Require both start_date and end_date
      if (!startDateParam || !endDateParam) {
        return errorResponse(
          "Provide either 'days' or both 'start_date' and 'end_date'.",
          400,
        );
      }
      if (!isValidDate(startDateParam)) {
        return errorResponse("Invalid 'start_date'. Use YYYY-MM-DD format.", 400);
      }
      if (!isValidDate(endDateParam)) {
        return errorResponse("Invalid 'end_date'. Use YYYY-MM-DD format.", 400);
      }
      if (startDateParam > endDateParam) {
        return errorResponse("'start_date' must not be after 'end_date'.", 400);
      }
      startDate = startDateParam;
      endDate = endDateParam;
    }

    // --- Query database with service role (bypasses RLS) ---
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from("weights")
      .select("id, weight, body_fat, date, created_at")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: orderParam === "asc" })
      .limit(limit);

    if (error) {
      console.error("Database query failed:", error);
      return errorResponse(`Database error: ${error.message}`, 500);
    }

    return new Response(
      JSON.stringify({
        data: data ?? [],
        meta: {
          user_id: userId,
          start_date: startDate,
          end_date: endDate,
          count: data?.length ?? 0,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return errorResponse(`Internal server error: ${err.message}`, 500);
  }
});
