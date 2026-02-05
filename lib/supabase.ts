import { createClient } from '@supabase/supabase-js';

// Access environment variables with a fallback check
const getEnv = (key: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  // Check window for common shims
  if ((window as any).process?.env?.[key]) {
    return (window as any).process.env[key];
  }
  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL') || 'https://vzlfhjzqxqolxropbzkj.supabase.co';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Initialize with an explicit check to avoid silent failures
if (!supabaseAnonKey) {
  console.warn("Supabase Anon Key is missing. Database operations will fail.");
}

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey || 'missing-key-placeholder'
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
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    return profile;
  } catch (e) {
    console.error('Unexpected error in getCurrentProfile:', e);
    return null;
  }
}