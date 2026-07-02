import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazily-instantiated Supabase browser client.
 *
 * Credentials are read from Vite environment variables:
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_ANON_KEY
 *
 * The client is created only when both values are present. This keeps the app
 * runnable in local / demo environments (where the lead insert is simulated)
 * without crashing on a missing configuration.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
} else if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    "[ClimateSmart] Supabase credentials are not configured. " +
      "Lead submissions will be simulated locally. Set VITE_SUPABASE_URL " +
      "and VITE_SUPABASE_ANON_KEY to enable live inserts.",
  );
}

/** Returns the shared Supabase client, or `null` when not configured. */
export function getSupabaseClient(): SupabaseClient | null {
  return client;
}

/** True when a live Supabase connection is available. */
export function isSupabaseConfigured(): boolean {
  return client !== null;
}
