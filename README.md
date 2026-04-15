# The Factory Ledger

A personal project — a brutalist event ledger I built to practice working with localStorage, dynamic DOM rendering, and recurring date logic in vanilla JavaScript.

The theme is The Factory at Franklin, TN, but this is just a learning build. No real venue, no real client.

**Live:** https://deafgecko.github.io/factory-events2/

---

## What I built

You can create events with a name, category, status, date, time range, location, tech specs, and a liaison contact. Events save to `localStorage` so they persist between sessions without any backend.

I also worked out recurring series logic — weekly, monthly by week-of-month pattern, and annual — generating every occurrence through year-end automatically.

On top of that: live search, a month filter bar, and a soft-delete archive system so nothing is permanently gone until you decide it is.

---

## Stack

HTML, vanilla JavaScript, Tailwind CSS (CDN), Lucide icons (CDN). No build tools, no frameworks, no installs.

```
index.html   — layout and modals
scripts.js   — all the logic: CRUD, series generation, search, archive
styles.css   — custom styles layered on Tailwind
```

---

MIT License
