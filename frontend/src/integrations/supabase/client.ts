// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nfsjiosxzzvmouelmlaa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mc2ppb3N4enp2bW91ZWxtbGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNzE4NjIsImV4cCI6MjA2Njg0Nzg2Mn0.Juwt09VCyNDBi-anAy276hq-4iva3PNUzA0EUTje8V4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});