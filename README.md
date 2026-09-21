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

The editor is available at `/admin`. It has no public registration flow and only renders editing controls for a signed-in Supabase user whose `app_metadata.role` is `admin`.

1. Create a Supabase project and run `supabase/events.sql` in its SQL editor.
2. Create the artist's user in Supabase Auth.
3. Assign `{ "role": "admin" }` to that user's app metadata using a trusted Dashboard/Admin API flow, then refresh the user's session.
4. Add the Supabase URL and publishable key to `.env.local` using the names above.
5. Configure the production host to rewrite `/admin` to `/index.html`, since this is a Vite single-page application.

Without Supabase configuration, the public site uses the confirmed local fallback event and `/admin` shows setup guidance rather than exposing an insecure editor.
