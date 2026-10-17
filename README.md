<div align="center">

# ARSENAL OSINT

**RECON · INTEL · ARCHIVE**

A complete, **local-first** OSINT workspace — a searchable catalog of 750+ curated tools,
hands-on field guides & playbooks, and a node-graph + map tool for organizing a case.
All in one site. **Nothing leaves your browser.**

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Tailwind CSS 3](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-C9A56B)](./LICENSE)
[![Local-first](https://img.shields.io/badge/100%25-Local--first-5BB8A6)](#privacy)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](#contributing)

<img src="./readme_images/Screenshot%202026-10-16%20234149.png" alt="ARSENAL OSINT — home page" width="100%" />

</div>

---

## Table of contents

- [Highlights](#highlights)
- [Screenshots](#screenshots)
- [Introduction](#introduction)
  - [What's in the site?](#whats-in-the-site)
  - [How does the OSINT Mapping tool work?](#how-does-the-osint-mapping-tool-work)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Setting up Google Maps (optional)](#setting-up-google-maps-optional)
- [OpenStreetMap mode](#openstreetmap-mode)
- [Saving, opening, and the "Continue recent" list](#saving-opening-and-the-continue-recent-list)
- [Running with Docker](#running-with-docker)
- [Deployment](#deployment)
- [Features in depth](#features-in-depth)
- [Project layout](#project-layout)
- [Privacy](#privacy)
- [License](#license)
- [Contributing](#contributing)
- [Support](#support)

---

## Highlights

- 🧰 **750+ curated tools** across 26 disciplines — searchable, filterable, and install-ready.
- 📚 **Field guides & playbooks** — 11 hand-written tutorials plus end-to-end workflows.
- 🗺️ **Mapping tool** — click-to-pin locations, satellite & terrain basemaps, batch geocoding.
- 🕸️ **Link analysis** — a node graph for people, accounts, phones, vehicles and more.
- 🧠 **Analysis** — timeline, competing hypotheses, network analytics and evidence grading.
- 📄 **Reports** — export a full case report (Markdown, HTML, print / PDF) with an evidence appendix.
- 🔒 **Local-first** — no backend, no accounts, no analytics. Your case never leaves your machine.

---

## Screenshots

<table>
  <tr>
    <td width="50%">
      <img src="./readme_images/Screenshot%202026-10-16%20234149.png" alt="Home page" width="100%" />
      <p align="center"><sub><b>Home</b> — the entry point to the arsenal.</sub></p>
    </td>
    <td width="50%">
      <img src="./readme_images/Screenshot%202026-10-16%20234204.png" alt="Playbooks" width="100%" />
      <p align="center"><sub><b>Playbooks</b> — end-to-end investigation workflows.</sub></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="./readme_images/Screenshot%202026-10-16%20234413.png" alt="Tools catalog" width="100%" />
      <p align="center"><sub><b>Tools</b> — 750+ tools, filtered by category or method.</sub></p>
    </td>
    <td width="50%">
      <img src="./readme_images/Screenshot%202026-10-16%20234711.png" alt="Mapping tool" width="100%" />
      <p align="center"><sub><b>Map</b> — pins, basemaps and pin-to-identifier links.</sub></p>
    </td>
  </tr>
</table>

---

## Introduction

**ARSENAL OSINT** is a single web app that brings together the things an investigator
actually needs at the desk: a fast way to **find the right tool**, a way to **learn the
method**, and a workspace to **assemble the picture**.

> The **OSINT Mapping Tool** is just one of the sections — you can open it any time from the
> **Mapping Tool** tab in the header.

### What's in the site?

Everything is client-side. There is no server to trust and no database to leak.

| Section | What it is |
| --- | --- |
| **Home** | A quick overview of the site and the methodology behind it. |
| **Tools** | A searchable catalog of **750+ curated OSINT / security tools**, vendored from [awesome-osint-arsenal](https://github.com/rawfilejson/awesome-osint-arsenal) (MIT) as static JSON. Filter by category or install method, mark favourites, jump straight to a tool. You install things yourself — the catalog tells you how. |
| **Field Guides** | 11 concise tutorials — the OSINT cycle, SOCMINT, GEOINT, dorking, reverse image search, metadata, email/phone recon, OPSEC and more — organised into **Fundamentals, Disciplines, Techniques and Tradecraft**. |
| **Playbooks** | End-to-end workflows that chain guides + tools into a repeatable process, each with a shareable URL. |
| **Glossary & Reference** | A 60-term OSINT vocabulary and a printable quick-reference sheet (dorks, metadata commands, geo helpers, OPSEC checklist). |
| **Mapping Tool** | The investigation workspace: node graph, map, timeline, analysis and reports. |

### How does the OSINT Mapping tool work?

**Information tab (link analysis).** Every node is one piece of information — an Instagram
account, a phone number, a licence plate, a family member. Drag from a node's handle to
another node to wire them together; drop the wire on empty space and it *spawns a new,
already-connected node* (Blender-style). Right-click the canvas for the same quick-add.
Each identifier type has its own form fields, brand icons, and support for custom icons.

**Map tab.** Click anywhere to drop a pin — the geocoder fills in the name and address and
picks a fitting icon. A search bar finds places, pins link back to identifiers with notes,
and you can switch between **Google Maps** (richer POI data, needs an API key) and
**OpenStreetMap** (no key) from the gear icon. Basemaps include streets, satellite, hybrid,
terrain and light/dark.

**Analysis & reporting.** A timeline merges dated events with pin visits (with playback), a
competing-hypotheses board weighs supporting and refuting evidence, a network view ranks key
connectors and finds paths between findings, and the whole case exports to a report with an
evidence appendix and source grading.

Everything saves to a single `.osint.json` file.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | **React 19** |
| Framework | **Next.js 16** (App Router) |
| Styling | **Tailwind CSS 3** |
| Node graph | [`@xyflow/react`](https://reactflow.dev) |
| Maps | [`@vis.gl/react-google-maps`](https://visgl.github.io/react-google-maps/), [`leaflet`](https://leafletjs.com) + `react-leaflet` |
| State | React Context (no Redux) |
| Storage | Local JSON files + `localStorage` |

---

## Getting started

You need **Node.js 18+**.

```bash
git clone https://github.com/adce626/arsenalosint
cd arsenalosint
npm install
npm run dev
```

Then open <http://localhost:5173>.

Production build:

```bash
npm run build
npm run start
```

---

## Setting up Google Maps (optional)

The **Map** tab works out of the box with OpenStreetMap — a key is only needed for the
Google provider, which gives richer place data (ratings, hours, phone, website).

1. In [Google Cloud Console](https://console.cloud.google.com/), enable the
   **Maps JavaScript API**, **Geocoding API** and **Places API**.
2. Create an **API key** and (recommended) restrict it to HTTP referrers
   `http://localhost:5173/*`.
3. Optionally create a **Map ID**.

You can supply the key in two ways:

- **In-app** — paste it in the map settings; it is stored in `localStorage`.
- **Config file** — copy the example and fill it in:

  ```bash
  cp public/app.config.example.json public/app.config.json
  ```

  ```json
  {
    "googleMaps": {
      "apiKey": "AIzaSy…",
      "mapId": "…"
    }
  }
  ```

`public/app.config.json` is gitignored, and a value saved in `localStorage` wins over the file.

---

## OpenStreetMap mode

No key, no signup. Open the gear icon on the map and set the provider to **OpenStreetMap**.

- Tiles come from `openstreetmap.org`; search and reverse geocoding use **Nominatim**.
- The map viewport survives tab switches.
- POI detection is coarser than Google's, but it is perfect for offline-friendly, key-free use.

---

## Saving, opening, and the "Continue recent" list

- **Save** downloads the project as `<name>.osint.json`.
- **Open Project** on the landing page loads one back in.
- A periodic snapshot is written to `localStorage`, so an accidental reload doesn't lose work.
- Up to **5 recent projects** are kept per browser, each with an "unsaved" badge.
- `.osint.json` files are gitignored.

---

## Running with Docker

```bash
cp .env.example .env          # set GOOGLE_MAPS_API_KEY / GOOGLE_MAPS_MAP_ID (blank is fine for OSM-only)
docker compose up --build
```

Then open <http://localhost:5173>. The container auto-generates `public/app.config.json`
from `.env`. Re-run `docker compose up` after changing `.env`; stop with `docker compose down`.

---

## Deployment

The app deploys to **Vercel** with zero configuration (framework auto-detected as Next.js):

1. **Add New → Project** and pick `adce626/arsenalosint`.
2. Name it `arsenal-osint` and **Deploy**.
3. Every push to `main` redeploys automatically.

`output: 'standalone'` in `next.config` is for self-hosting (Docker / VPS); Vercel ignores it
and builds natively, so it is harmless.

---

## Features in depth

### Information tab

- **20 built-in identifier types** across Social, Contact, Personal, Vehicle and Other, each
  with its own typed fields.
- **Connections** — drag a handle to wire nodes, drag to empty space for a quick-add, or
  right-click the canvas.
- **Brand icons** (Instagram, Facebook, X/Twitter, YouTube, TikTok, LinkedIn, Snapchat,
  Discord, Telegram, Google, Spotify, WhatsApp) plus custom uploads stored per browser.
- **Keyboard shortcuts** — `Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z` or `Ctrl/Cmd+Y` redo
  (20 steps), `Ctrl/Cmd+C/V` copy/paste, `Ctrl/Cmd+D` duplicate, `Del`/`Backspace` delete.
- **Multi-select** by marquee or `Shift+click` counts as one undo step.

### Map tab

- **Click-to-pin** with geocoder autofill.
- **Ten built-in place icons** (coffee, food, gym, home, movie, park, amusement park, school,
  shopping, clothes, library) in light and dark variants.
- **Pin card** with notes, linked identifiers and a live-map link (the Google card also shows
  rating, hours, phone and website).
- **Connect pins** toggle draws a dashed line in drop order with a customizable colour.
- **Basemap switcher** — streets, satellite, hybrid, terrain, dark and light.

### Cross-linking

Pins ↔ identifiers, each link carrying its own note. Clicking an identifier chip jumps to it
and hover-pulses the matching pin.

---

## Project layout

```text
src/
├─ app/                    # Next.js App Router
│  ├─ layout.jsx · providers.jsx · not-found.jsx · globals.css
│  ├─ (site)/              # public site: home, tools, guides, guides/[lessonId]
│  └─ mapping/page.jsx     # the investigation workspace
├─ components/
│  ├─ site/                # header, footer, tools catalog, guides, playbooks UI
│  ├─ ui/                  # shared primitives
│  └─ …                    # mapping-tool UI (graph, map, timeline, analysis)
├─ content/
│  ├─ tools/               # catalog.js (server-only) + meta.js + filter.js + the tools JSON
│  └─ basics/              # field-guide lessons
├─ context/                # React Context providers
├─ lib/utils.js
├─ styles/ · images/
├─ utils/                  # geo, reports, import/export, analytics
└─ identifierTypes.js · identifierIcons.js · mapIcons.js · pinColors.js · site.config.js
public/
├─ app.config.example.json # committed — copy to app.config.json (gitignored)
├─ manifest.webmanifest · sw.js
```

The tools catalog imports a ~400 KB JSON file and is **server-only**, so it never ships in the
client JS bundle.

---

## Privacy

- **No backend, no accounts, no analytics.** Nothing is ever uploaded.
- In **Google** mode the only outbound calls are the browser's own tile/Places requests, made
  with *your* key.
- In **OpenStreetMap** mode, requests go to `openstreetmap.org` and
  `nominatim.openstreetmap.org`.
- Settings and custom icons live in `localStorage`; projects are plain files on your disk.
- `.gitignore` keeps `app.config.json` and `*.osint.json` out of commits.

---

## License

[GPL-3.0](./LICENSE).

---

## Contributing

Pull requests are welcome. The one hard rule: **nothing may ship data off the user's machine**
— no analytics, no remote sync, no third-party tracking.

---

## Support

If this project is useful to you, you can support it with crypto:

| Network | Address |
| --- | --- |
| Ethereum | `0x59bFD011AaAeA85AF644A574a11836673CAcfCD4` |
| Litecoin | `LYxKNT7TAWZAM96Vz2HRxyUmvZbqEqiofe` |

<div align="center">
<sub>Built for investigators who like to keep their evidence to themselves.</sub>
</div>
