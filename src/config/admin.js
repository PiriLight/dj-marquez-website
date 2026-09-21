// UI guard only. The database repeats these two approved identities in its RLS helper.
// A confirmed Auth identity is required; neither metadata field grants access.
export const ADMIN_EMAILS = Object.freeze(['lachefbino@gmail.com', 'marquesandre112005@gmail.com']);

export function isApprovedAdmin(user) {
  return Boolean(user?.id && !user.is_anonymous && user.email_confirmed_at && ADMIN_EMAILS.includes(user.email?.toLowerCase()));
}
