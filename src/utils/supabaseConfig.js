export function checkSupabaseConfig(url, key) {
  if (!url || !key) return { configured: false, error: 'Falta configurar o URL e a chave pública do Supabase.' };
  let publicKey = /^sb_publishable_[A-Za-z0-9_-]+$/.test(key);
  if (!publicKey) {
    try { publicKey = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role === 'anon'; }
    catch { /* Secret and unknown keys fail closed. */ }
  }
  if (!publicKey) return { configured: false, error: 'Usa uma chave pública publishable ou anon; nunca uma chave administrativa.' };
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password || (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)))) throw new Error();
  } catch { return { configured: false, error: 'O URL Supabase não é válido.' }; }
  return { configured: true, error: '' };
}
