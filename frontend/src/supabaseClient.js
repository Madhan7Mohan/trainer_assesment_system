import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://upyygnhfawtfdgisjhil.supabase.co";
const supabaseKey = "sb_publishable_gdSp7fmc_HWzzINqj7qUDg_ukjK7GlM";

export const supabase = createClient(supabaseUrl, supabaseKey);
