---
type: "architecture"
date: "2026-09-15T20:01:49.013267+00:00"
question: "Where are the active public flow, event data, social URLs, booking links, and hero media defined?"
contributor: "graphify"
outcome: "useful"
---

# Q: Where are the active public flow, event data, social URLs, booking links, and hero media defined?

## Answer

The public flow is composed in src/App.jsx as Hero, About, Gallery, Archive, Events, Activity, Booking, and Footer. Events read confirmed local fallbacks from src/data/defaultEvents.js and optionally Supabase through src/hooks/useEvents.js. External destinations and YouTube content are centralized in src/config/site.js. Hero media references are centralized there and rendered by src/sections/Hero.jsx. The private event editor is lazy-loaded at /admin.

## Outcome

- Signal: useful