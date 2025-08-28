import { createClient } from '@supabase/supabase-js';

let cachedClient = null;

export async function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  try {
    if (window.electron?.ipcRenderer?.invoke) {
      const settings = await window.electron.ipcRenderer.invoke('get-settings');
      if (settings) {
        supabaseUrl = settings.supabaseUrl || supabaseUrl;
        supabaseAnonKey = settings.supabaseAnonKey || supabaseAnonKey;
      }
    } else if (window.electronAPI?.getSettings) {
      const settings = await window.electronAPI.getSettings();
      if (settings) {
        supabaseUrl = settings.supabaseUrl || supabaseUrl;
        supabaseAnonKey = settings.supabaseAnonKey || supabaseAnonKey;
      }
    }
  } catch (error) {
    console.error('Failed to load settings for Supabase:', error);
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}

export function resetSupabaseClient() {
  cachedClient = null;
}


