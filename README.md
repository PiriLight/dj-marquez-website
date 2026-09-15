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
VITE_BOOKING_URL=https://final-booking-destination.example
VITE_YOUTUBE_VIDEO_ID=5Jwva63JP8g
VITE_YOUTUBE_VIDEO_TITLE=M4rquez-Ramboya
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Do not put a Supabase secret/service key or a YouTube API key in a `VITE_*` variable; Vite sends those values to the browser.

The activity section uses a known real upload as its default and accepts a new YouTube video ID from configuration. To automate the latest upload later, use the YouTube Data API from a trusted server or CI job with a server-only `YOUTUBE_API_KEY`, then update `VITE_YOUTUBE_VIDEO_ID` and `VITE_YOUTUBE_VIDEO_TITLE` during deployment. The browser does not scrape YouTube.

## Private events editor

The editor is available at `/admin`. It has no public registration flow and only renders editing controls for a signed-in Supabase user whose `app_metadata.role` is `admin`.

1. Create a Supabase project and run `supabase/events.sql` in its SQL editor.
2. Create the artist's user in Supabase Auth.
3. Assign `{ "role": "admin" }` to that user's app metadata using a trusted Dashboard/Admin API flow, then refresh the user's session.
4. Add the Supabase URL and publishable key to `.env.local` using the names above.
5. Configure the production host to rewrite `/admin` to `/index.html`, since this is a Vite single-page application.

Without Supabase configuration, the public site uses the confirmed local fallback event and `/admin` shows setup guidance rather than exposing an insecure editor.
