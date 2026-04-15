# The Factory Ledger

This is the event ledger for The Factory at Franklin, TN.

You open it, you see your events. All of them, laid out like a ledger — because that's what it is. A running record of what's happening at the venue, when it's happening, and who's running it.

**Live:** https://deafgecko.github.io/factory-events2/

---

## What it does

You hit **+ New Event** and a form slides in. You give the event a name, pick a category — Corporate, Private, Public, or Internal — set a status like Drafting or Confirmed, pick the date and time, drop in the location, list out your tech specs for load-in, and add a liaison with their phone and email. Hit **Authorize Entry** and it's in the ledger.

If the event repeats, you tell it that. Weekly, monthly on the same week pattern, or annual — it generates the whole series through the end of the year so you're not entering the same thing over and over.

Up top there's a row of month tabs. Click one and the ledger jumps to that month. Click it again and you're back to everything. The search bar does exactly what you'd expect — start typing and it filters right there on the page.

When an event is done, you can archive it instead of deleting it. It disappears from the main ledger but it's not gone. You open Settings and it's all there, ready to restore if you need it. If you do want to delete, you can kill a single entry or wipe out an entire recurring series in one shot.

Nothing here touches a server. No login, no database, no build step. It all runs in the browser and saves to `localStorage`.

---

## How to run it

Download the files and open `index.html` in a browser. That's it.

---

## What's in the box

```
index.html   — the layout and all the modals
scripts.js   — every bit of logic: CRUD, series, search, archive
styles.css   — the factory look on top of Tailwind
```

Built with HTML, vanilla JavaScript, Tailwind CSS, and Lucide icons — all loaded from CDN, nothing to install.

---

MIT License
