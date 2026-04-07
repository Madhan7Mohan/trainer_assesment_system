import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL="https://upyygnhfawtfdgisjhil.supabase.co",
  import.meta.env.VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweXlnbmhmYXd0ZmRnaXNqaGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTQ3OTQsImV4cCI6MjA4Njk3MDc5NH0.DYqniJwxaZwjhqv40l5d51-Br4MN1dEDzsppYG8v0M8"
);