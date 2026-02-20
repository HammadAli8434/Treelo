import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://ljxqeuuvjplmhteifdqa.supabase.co";

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.warn(
    "Supabase anon key is missing. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
  );
}   

export const supabase = createClient(supabaseUrl, supabaseAnonKey ?? "");