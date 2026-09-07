import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Server-only client using the service role key. This app is single-tenant
 * (no end-user auth), so all reads/writes go through Route Handlers with
 * this client rather than relying on RLS + an anon client in the browser.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Supabase server credentials are not set (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
    }
    _client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return _client;
}
