import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { brokeredPreviewStorage } from "@/integrations/supabase/previewAuthStorage";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"];
const supabaseKey =
  import.meta.env["VITE_SUPABASE_ANON_KEY"] ??
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase: SupabaseClient<Database> | null =
  isSupabaseConfigured && supabaseUrl && supabaseKey
    ? createClient<Database>(supabaseUrl, supabaseKey, {
        auth: {
          storage: brokeredPreviewStorage(),
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        global: {
          fetch: (input, init) => {
            const headers = new Headers(
              typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
            );
            if (init?.headers) {
              new Headers(init.headers).forEach((value, key) => headers.set(key, value));
            }
            if (supabaseKey.startsWith("sb_") && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
              headers.delete("Authorization");
            }
            headers.set("apikey", supabaseKey);
            return fetch(input, { ...init, headers });
          },
        },
      })
    : null;