import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('placeholder')
);

// Fallback dummy URL so createClient does not throw on module initialization
const safeUrl = isSupabaseConfigured ? supabaseUrl : 'https://example-uniflow.supabase.co';
const safeKey = isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy';

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Creates a temporary signed URL for a private document in the 'documents' bucket
 */
export async function getSignedDocumentUrl(
  filePath: string,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  if (!isSupabaseConfigured || !filePath) return null;
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('blob:')) {
    return filePath;
  }

  try {
    const cleanPath = filePath.replace(/^documents\//, '');
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(cleanPath, expiresInSeconds);

    if (error) {
      console.warn('Signed URL retrieval warning:', error.message);
      return null;
    }
    return data?.signedUrl || null;
  } catch (err) {
    console.error('Exception generating signed URL:', err);
    return null;
  }
}

/**
 * Uploads a document privately to Supabase storage bucket 'documents'.
 */
export async function uploadDocumentToStorage(
  file: File,
  path: string
): Promise<{ url: string; path: string; error?: any }> {
  if (!isSupabaseConfigured) {
    const localUrl = URL.createObjectURL(file);
    return { url: localUrl, path: `local/${file.name}` };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const fullPath = `${path}/${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.warn('Storage upload notice:', error.message);
      return { url: '', path: fullPath, error };
    }

    // Attempt to generate signed URL for private bucket access
    const { data: signedData, error: signedErr } = await supabase.storage
      .from('documents')
      .createSignedUrl(data.path, 86400); // 24 hours

    let accessibleUrl = signedData?.signedUrl;
    if (!accessibleUrl || signedErr) {
      // Fallback to public URL if bucket is public
      accessibleUrl = supabase.storage.from('documents').getPublicUrl(data.path).data.publicUrl;
    }

    return {
      url: accessibleUrl,
      path: data.path,
    };
  } catch (err) {
    console.error('Storage upload exception:', err);
    return { url: '', path, error: err };
  }
}
