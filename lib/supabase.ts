import { createClient } from '@supabase/supabase-js';

/**
 * Safely access environment variables.
 * This prevents the fatal 'process is not defined' error in standard browser ESM environments.
 */
const safeGetEnv = (key: string): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore error
  }
  return undefined;
};

// Configuration - Favor environment variables for production/Vercel
const supabaseUrl = safeGetEnv('SUPABASE_URL') || 'https://vzlfhjzqxqolxropbzkj.supabase.co';
const supabaseAnonKey = safeGetEnv('SUPABASE_ANON_KEY') || 'your-placeholder-anon-key'; 

// Basic validation to prevent app hanging/crashing on invalid init
const isValidConfig = supabaseUrl && 
                     supabaseAnonKey && 
                     !supabaseAnonKey.includes('placeholder') &&
                     supabaseAnonKey !== 'invalid-key-prevent-crash';

export const supabase = createClient(
  supabaseUrl, 
  isValidConfig ? supabaseAnonKey : 'invalid-key-prevent-crash'
);

/**
 * Helper to get the current profile from the database
 */
export async function getCurrentProfile() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.warn('Profile not found for user:', user.id);
      return null;
    }

    return profile;
  } catch (e) {
    console.error('Error in getCurrentProfile:', e);
    return null;
  }
}