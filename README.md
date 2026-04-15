# The Factory Ledger

**Event management for The Factory at Franklin, TN — 2026**

A brutalist-styled, client-side event tracker built with vanilla JavaScript, Tailwind CSS, and localStorage. No backend, no login, no dependencies to install.

**Live site:** https://deafgecko.github.io/factory-events2/

---

## Features

- **Create & Edit Events** — Log event name, category, status, date, start/end time, location, tech specs, and liaison contact info
- **Recurring Series** — Generate weekly, monthly (same week-of-month pattern), or annual series through year-end in one click
- **Month Filter Bar** — Jump to any month at a glance; filter the ledger instantly
- **Live Search** — Real-time search across event names and details
- **Archive System** — Soft-delete events into an archive accessible from Settings; restore any time
- **Delete Controls** — Delete a single entry or terminate an entire recurring series
- **Persistent Storage** — All data lives in `localStorage` — no server needed

## Stack

| Layer | Tool |
|---|---|
| Markup | HTML5 |
| Styles | Tailwind CSS (CDN) + custom CSS |
| Icons | Lucide (CDN) |
| Fonts | Playfair Display, Space Mono (Google Fonts) |
| Logic | Vanilla JavaScript |
| Storage | `localStorage` |

## File Structure

```
factory-events2/
├── index.html    # App shell, modals, and layout
├── scripts.js    # All app logic (CRUD, series generation, search, archive)
└── styles.css    # Custom factory aesthetic on top of Tailwind
```

## Usage

Open `index.html` directly in a browser — no build step needed.

- **+ New Event** — opens the log entry modal
- **Month tabs** — filter the ledger by month (click again to show all)
- **Search bar** — filters visible entries in real time
- **Settings gear** — opens the archive panel

## License

MIT
