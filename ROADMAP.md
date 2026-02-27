I've been learning Swedish and struggling to memorise vocabulary — so I built something to help.

Svenska Flashcards is a free web app based on the Kelly List, a research-backed frequency list of the 8,425 most important Swedish words ranked by how often they appear in real everyday language. The app covers all CEFR levels from A1 (beginner) to C2 (mastery), shows 25 words per session, and remembers which words you're still learning so they come back more often.

It also has a live leaderboard so you can compete with friends.

🔗 svenska-flashcards.netlify.app

What I learned building this:
— How to set up a GitHub repository and auto-deploy pipeline
— How serverless functions work
— How to connect a live PostgreSQL database
— That building something for yourself is the best way to learn

Built with the help of Claude (Anthropic) as both a coding partner and a learning tool.

Sources and credits:
📚 Kelly List — Språkbanken Text, University of Gothenburg (CC-BY-4.0)
📖 Translations — Folkets Lexikon, KTH Royal Institute of Technology (CC-BY-SA-2.5)

If you're learning Swedish — or any language — I hope this helps. And if you're curious about building something with AI assistance, happy to share more about the process.

# Svenska Flashcards — Project Roadmap

A Swedish vocabulary flashcard web app based on the Kelly List (8,425 words, CEFR A1–C2).
Built as a learning project — both for learning Swedish and for learning how to build websites.

---

## Tech Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Frontend | HTML / CSS / JavaScript | Single-file app, no framework |
| Hosting | Netlify | Static site hosting, free tier |
| Functions | Netlify Serverless Functions | Save and read scores (no exposed DB credentials) |
| Database | Neon (PostgreSQL) | Stores leaderboard scores |
| Dictionary | Folkets Lexikon (KTH) | Swedish → English translations, CC-BY-SA-2.5 |
| Word list | Kelly List (Språkbanken) | 8,425 words ranked by frequency, CC-BY-4.0 |

---

## What's Been Built

### v1 — Core flashcard app
- All 8,425 Kelly List words embedded in the HTML
- CEFR levels A1–C2, switchable by button
- Card flip animation (Swedish front, English + example back)
- ✓ Got it / ✗ Still learning scoring
- Shuffle, Skip, Back navigation
- Search across all levels
- Progress bar

### v2 — Leaderboard + smart sessions
- **Name screen** on first visit, name remembered in browser localStorage
- **25-word sessions** — picks 25 words per round instead of showing all 1,400+
- **Spaced repetition weighting** — words you mark ✗ come back more often (weight 5), words you know come back less (weight 1), unseen words have medium weight (weight 3). Stored in localStorage per device.
- **Score saving** — after each round, score sent to Neon database via Netlify Function
- **Leaderboard** — shown automatically after every round, pulls live scores from database
- **Card peek fix** — back of card cleared before flip resets so next answer can't bleed through

---

## Known Limitations (to fix later)

### 🔴 High priority
- [ ] **Spaced repetition is device-only** — word weights stored in localStorage, not synced to database. If you play on phone, your laptop doesn't know what you've learned. Fix: store weights in the `scores` table or a new `progress` table in Neon, keyed by player name.

### 🟡 Medium priority
- [ ] **No proper user accounts** — player name is just a text string, anyone can type the same name. Fix: add email magic-link login via Supabase Auth or Netlify Identity.
- [ ] **No streak tracking** — would be motivating to show "you've played 5 days in a row". Needs a `sessions` table with dates.
- [ ] **No per-level progress** — show how many words in each level you've "mastered" (got right 3+ times). Needs progress tracking in DB.
- [ ] **Search doesn't use weighted sessions** — search mode still shows all results. Should cap at 25 too.

### 🟢 Nice to have
- [ ] **Mobile app** — wrap in a PWA (Progressive Web App) so users can "Add to Home Screen". Just needs a manifest.json and service worker. No app store needed.
- [ ] **Audio pronunciation** — Forvo API or similar for Swedish pronunciation on card flip.
- [ ] **Dark mode** — toggle between light and dark themes.
- [ ] **Keyboard shortcuts** — space to flip, left/right arrows for ✗/✓.
- [ ] **Friends / groups** — filter leaderboard to only show people you know.
- [ ] **Native app** — when the web app is solid, wrap in React Native or Flutter for iOS/Android. The backend (Netlify + Neon) stays the same.

---

## File Structure

```
svenska-flashcards/
├── index.html                    ← entire frontend (HTML + CSS + JS + all word data)
├── package.json                  ← tells Netlify to install @neondatabase/serverless
├── ROADMAP.md                    ← this file
└── netlify/
    └── functions/
        ├── save-score.js         ← POST: saves a score to Neon DB
        └── get-scores.js         ← GET: returns top 50 scores from Neon DB
```

---

## Database Schema

```sql
CREATE TABLE scores (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,          -- player's chosen name
  level     TEXT NOT NULL,          -- A1, A2, B1, B2, C1, C2
  correct   INTEGER NOT NULL,       -- number correct (out of 25)
  total     INTEGER NOT NULL,       -- always 25 for now
  pct       INTEGER NOT NULL,       -- percentage score
  played_at TIMESTAMPTZ DEFAULT NOW()
);
```

Future tables to add:
```sql
-- For syncing spaced repetition across devices
CREATE TABLE progress (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  word_key   TEXT NOT NULL,   -- e.g. "A1|hus"
  weight     INTEGER DEFAULT 3,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, word_key)
);
```

---

## Deployment

1. Push changes to GitHub (`svenska-flashcards` repo)
2. Netlify auto-deploys on every push (connected via GitHub integration)
3. Environment variables needed in Netlify:
   - `NETLIFY_DATABASE_URL` — set automatically by Neon integration
   - `NETLIFY_DATABASE_URL_UNPOOLED` — set automatically by Neon integration

---

## Credits

- **Kelly List** — Språkbanken Text, University of Gothenburg — CC-BY-4.0
- **Folkets Lexikon** — KTH Royal Institute of Technology — CC-BY-SA-2.5
- Built with Claude (Anthropic) as a learning project
