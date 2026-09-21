# DJ M4RQUEZ website

React and Vite website for DJ M4RQUEZ.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

Production images and videos are stored under `public/assets/`.

## Site configuration

Public links and safe fallbacks live in `src/config/site.js`. Optional deployment values belong in `.env.local`:

```sh
VITE_BOOKING_WHATSAPP=351913235224
VITE_BOOKING_EMAIL=
VITE_YOUTUBE_VIDEO_ID=5Jwva63JP8g
VITE_YOUTUBE_VIDEO_TITLE=M4rquez-Ramboya
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Do not put a Supabase secret/service key or a YouTube API key in a `VITE_*` variable; Vite sends those values to the browser.

### Booking

The Booking section opens one native modal with four field groups. Required: event, date, city, contact name and either a telephone or an email. WhatsApp prepares an encoded message for the official Beat Wave booking number above; the visitor reviews and sends it in WhatsApp. The site does not send messages or save personal information to storage/backend. Closing the sheet clears the form.

`VITE_BOOKING_WHATSAPP` overrides the confirmed public number in `src/config/site.js`. `VITE_BOOKING_EMAIL` intentionally has no default: the secondary email button remains disabled until the official address is provided. Once configured, it opens the visitor's email application with subject/body; it is not a server email service. Restart Vite after changing environment values; production variables are embedded at build time. `VITE_BOOKING_URL` remains supported for legacy link consumers; the homepage booking flow uses the local sheet.

Run message/validation tests with `node --test tests/booking.test.js`.

### Video playback

The Hero uses a muted inline MP4, its poster and a single initial autoplay attempt. It pauses off screen/in a hidden tab, respects reduced motion, and offers explicit playback if blocked. There are no scroll/touch retry loops.

The YouTube thumbnail is loaded lazily; the official IFrame API and embed are only loaded after a click. The player uses `youtube-nocookie.com`, an explicit page origin and `strict-origin-when-cross-origin`. Playback is confirmed by the API's `PLAYING` event, not iframe `load`. API/network errors, YouTube error codes and a 15-second playback timeout retain the thumbnail with a direct video link. Blocked autoplay offers another explicit play action. The initial image is 16:9; active playback has a 200px minimum height to meet YouTube's player minimum on narrow screens.

Do not add a `no-referrer` policy or iframe sandbox to this player. If a host adds CSP later, explicitly allow the YouTube API/scripts, nocookie frame, thumbnail and their required media resources. No CSP or browser privacy protections have been disabled here.

The activity section uses a known real upload as its default and accepts a new YouTube video ID from configuration. To automate the latest upload later, use the YouTube Data API from a trusted server or CI job with a server-only `YOUTUBE_API_KEY`, then update `VITE_YOUTUBE_VIDEO_ID` and `VITE_YOUTUBE_VIDEO_TITLE` during deployment. The browser does not scrape YouTube.

## Private events editor

The editor is available at `/admin`. There is no public registration flow. It verifies the user with Supabase Auth before displaying editing controls. Only the two confirmed, non-anonymous accounts in `src/config/admin.js` are accepted: `lachefbino@gmail.com` and `marquesandre112005@gmail.com`. Neither `app_metadata` nor `user_metadata` grants access or is required. The frontend guard is not a substitute for RLS.

1. Identify the **existing DJ M4rquez Supabase project**; inspect its schema, policies and Auth users before any remote change. Do not create a replacement project.
2. Review `supabase/events.sql` against that inspection. It preserves the existing table and records and restricts writes to the two approved identities. Its private helper checks the current `auth.users` row for `auth.uid()`, confirmed email and non-anonymous status. Keep the `private` schema out of Data API exposed schemas. Unknown policies stop the script for review. The incremental migration in `supabase/migrations/20260921192134_event_admin_confirmed_allowlist.sql` only replaces this helper; it does not change events, policies or data.
3. Prepare the invitation flow and Auth configuration described in `docs/AUTH_INVITE_QA.md` before inviting either approved account. No metadata role assignment is needed. The SQL does not create users. Do not disable email confirmation.
4. Set the correct project's public URL and publishable key in ignored `.env.local`. `VITE_SUPABASE_ANON_KEY` is also supported for a legacy public anon key; prefer the existing `VITE_SUPABASE_PUBLISHABLE_KEY`. Missing settings show setup guidance. Secret/service-role keys in these configuration fields are rejected by the build.
5. `vercel.json` prepares SPA rewrites for `/admin` and `/auth/setup-password`, plus activation-only privacy headers. This does not replace authentication or RLS. No deployment is part of this change; the production origin remains unconfirmed.

The editor supports individual create/update/delete, explicit deletion confirmation, validation and server-confirmed success. Failed saves preserve the form. Duplicate dates/names/locations in the loaded list are rejected; the UUID primary key also protects retry inserts. Concurrent creation by two admins with different UUIDs is not prevented by a new database unique constraint: adding one would require auditing existing records first.

The existing text date column is retained: legacy `26 AGO 2026` is readable and new edits use `2026-08-26`. The public agenda includes today in `Europe/Lisbon`, excludes past/hidden/invalid entries and sorts chronologically. It refreshes on return to the tab and every minute while visible. Supabase is authoritative when reads succeed, including an empty result. Failure/missing configuration displays a visible notice and only valid upcoming local fallback entries; the historical Midnight event is no longer shown as upcoming. The admin never saves to a local fallback.

Validation: `node --test tests/*.test.js`, `npm run build`, `git diff --check`. See `docs/ADMIN_EVENTS_QA.md` for the tested scenarios and remaining remote work. `tests/fixtures/admin.html` is an explicitly labelled, development-only simulation; it uses no real Supabase credentials or remote writes and is not included in the production build. The PostgreSQL test `tests/events-rls.sql` must only run in a disposable local database, never in the real Supabase project.

### Invitation activation

`/auth/setup-password` accepts only `token_hash` and `type=invite`, removes the query/hash from the address bar immediately, and calls the official `verifyOtp` method. `detectSessionInUrl` remains disabled. The form is shown only after a fresh `getUser` verifies the approved identity. Passwords are submitted only via `auth.updateUser`, with identity checks before and after; success navigates to `/admin`, which independently checks authorization again. A non-secret, short-lived sessionStorage marker allows refresh after successful verification. Passwords and invitation hashes are never stored by this flow.

See `docs/AUTH_INVITE_QA.md` for the exact email template, development URLs, current validation evidence and remaining browser/real-invitation checks. Earlier QA documents record the earlier metadata-based rule; this document and the current helper supersede that authorization detail. No invitations have been sent.
