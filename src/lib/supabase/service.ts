import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Creates a Supabase client with the service role key (bypasses RLS).
 * Falls back to reading .env.local directly if env var isn't loaded.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    try {
      const envPath = join(process.cwd(), ".env.local");
      const envContent = readFileSync(envPath, "utf-8");
      const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
      if (match) key = match[1].trim();
    } catch {
      // ignore
    }
  }

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not found");
  }

  return createClient(url, key);
}
