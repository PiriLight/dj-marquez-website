import { checkSupabaseConfig } from '../utils/supabaseConfig.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const configuration = checkSupabaseConfig(supabaseUrl, supabasePublishableKey);
export const isSupabaseConfigured = configuration.configured;
export const supabaseConfigurationError = configuration.error;

let clientPromise;

export function getSupabaseClient() {
  if (!isSupabaseConfigured) return Promise.resolve(null);

  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      }),
    ).catch((error) => { clientPromise = undefined; throw error; });
  }

  return clientPromise;
}
