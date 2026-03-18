import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we are using placeholder values
export const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (isMockMode) {
  console.warn('⚠️ Supabase URL or Anon Key is missing. The app will run in MOCK MODE.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
