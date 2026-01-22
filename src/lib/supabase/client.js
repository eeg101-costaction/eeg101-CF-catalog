/**
 * Supabase Client Configuration (Client-Side)
 *
 * This file initializes the Supabase client for use in client components.
 * Uses the anon key which has restricted permissions.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
