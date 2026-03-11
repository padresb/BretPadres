# CLAUDE.md — BretPadres Consulting Website

This file provides guidance for AI assistants working in this repository.

## Project Overview

**BretPadres** is a static consulting firm website for Bret Padres Cybersecurity Consulting, deployed on Cloudflare Workers. It is a **pure frontend project** (HTML, CSS, vanilla JavaScript) with no build step, no package manager, and no backend.

- **Business:** Cybersecurity consulting — Digital Forensics, Incident Response, Expert Witness & Litigation Support
- **Contact:** info@bretpadres.com | Las Vegas, United States
- **Deployment:** Cloudflare Workers via Wrangler CLI

---

## Repository Structure

```
BretPadres/
├── index.html          # Main landing page (1322 lines)
├── contact.html        # Contact/engagement page (872 lines)
├── _worker.js          # Cloudflare Worker — HTTP caching control
├── wrangler.jsonc      # Cloudflare Wrangler deployment config
├── .assetsignore       # Files excluded from Cloudflare static asset serving
└── README.md           # Minimal project header
```

No subdirectories, no build artifacts, no node_modules. All code lives in the files above.

---

## Development Workflow

### Making Changes

Since there is no build step, edits to `.html` files are immediately reflected. There is no `npm install`, `npm build`, or compilation required.

```bash
# Edit files directly
# Then deploy with Wrangler:
npx wrangler deploy
# or if wrangler is installed globally:
wrangler deploy
```

### Local Preview

```bash
npx wrangler dev
```

This serves the site locally using the Cloudflare Workers runtime, including the `_worker.js` logic.

### Deployment

Deployment uses Cloudflare Wrangler. The `wrangler.jsonc` config defines:
- **Worker name:** `bretpadres`
- **Compatibility date:** `2025-09-27`
- **Entry point:** `_worker.js`
- **Assets directory:** `.` (project root)

Files listed in `.assetsignore` (`_worker.js`, `wrangler.jsonc`, `.assetsignore`) are **not** served to clients as static assets.

---

## Code Architecture

### HTML Files

Both HTML files are **self-contained** — all CSS is embedded in `<style>` tags and all JavaScript is embedded in `<script>` tags at the bottom of the file. There are no external `.css` or `.js` files.

**Shared structure** between `index.html` and `contact.html`:
- Fixed header with navigation and mobile hamburger menu
- Canvas-based animated particle network background in hero section
- Consistent color palette and typography via CSS variables
- Footer with navigation links

**index.html** sections (in order):
1. `<header>` — Fixed top nav with scroll-state detection
2. Hero — Animated particle canvas, typing effect, CTA buttons
3. Stats — Animated counters (Years Experience, Cases, Confidentiality, Response)
4. Services — 3 feature cards
5. "Why Choose Us" — Feature list + terminal simulation animation
6. CTA — Contact prompt
7. `<footer>`

**contact.html** sections (in order):
1. `<header>` — Same nav as index
2. Hero banner — Gradient heading, particle canvas
3. Contact grid — Info cards (left) + contact form (right)
4. Response time banner
5. `<footer>`

### CSS Conventions

All CSS uses a consistent design system defined via CSS custom properties at the `:root` level:

```css
:root {
  --primary: #0a0e1a;       /* Dark navy background */
  --secondary: #0d1224;     /* Slightly lighter navy */
  --accent: #0066cc;        /* Blue accent */
  --cyan: #00d4ff;          /* Cyan highlight */
  --warm: #ff9900;          /* Orange/amber accent */
  --text: #e8eaf0;          /* Primary text */
  --text-muted: #8892a4;    /* Secondary/muted text */
}
```

**Design language:** Dark theme, glassmorphism (backdrop-filter blur + semi-transparent backgrounds), glow effects on interactive elements, smooth 0.3s transitions.

**Responsive breakpoints:**
- Desktop: above 768px (max-width 1200px centered)
- Tablet/Mobile: ≤768px — hamburger menu appears, grid collapses
- Small mobile: ≤480px — further layout adjustments

**Animation classes:**
- `.fade-up` — element starts hidden/translated, triggers on scroll
- `.visible` — applied by IntersectionObserver to trigger animations
- `.stagger-1` through `.stagger-4` — delayed animation variants

### JavaScript Conventions

All scripts are wrapped in IIFEs:
```js
(function() {
  'use strict';
  // ...
})();
```

**Key patterns used:**
- `class Particle` — Canvas particle animation with mouse-tracking
- `IntersectionObserver` — Triggers `.visible` class when elements enter viewport
- `requestAnimationFrame` — Animation loops for particles and typing effects
- `data-target` / `data-suffix` attributes — Drive counter animations from HTML
- `mailto:` form action — Contact form submits via client email, no backend

**Particle animation** (shared between both pages):
- Creates a `<canvas>` that fills the hero section
- Particles move, connect with lines when within 150px of each other
- Mouse position tracked for interactive repulsion/attraction
- Responsive — redraws on window resize

**Typing effect** (index.html only):
- Cycles through an array of service description strings
- Types forward, pauses, deletes backward, repeats

**Terminal animation** (index.html only):
- Simulates a forensics tool terminal running commands
- Uses `setTimeout` chains to display output line by line

---

## Cloudflare Worker (`_worker.js`)

The worker intercepts all HTTP responses:

```js
// HTML files: no caching (ensures updates are always fresh)
Cache-Control: no-store, no-cache, must-revalidate

// All other assets: pass through with default caching
```

This prevents browsers and CDN edge nodes from serving stale HTML while still allowing efficient caching of non-HTML assets.

---

## Key Conventions to Follow

### When editing HTML/CSS:

1. **Keep all CSS inline** in `<style>` tags within the same HTML file — do not create external `.css` files.
2. **Keep all JS inline** in `<script>` tags at the bottom of `<body>` — do not create external `.js` files.
3. **Use existing CSS variables** rather than hardcoding colors. Reference the `:root` block.
4. **Maintain the dark theme** — all new UI elements should match the existing navy/cyan/orange palette.
5. **Wrap new JS in IIFEs** matching the existing code style.
6. **Test responsiveness** at 768px and 480px breakpoints.

### When adding new pages:

1. Copy the header and footer HTML verbatim from an existing page to ensure consistency.
2. Copy the particle canvas hero section if the page needs an animated hero.
3. Ensure the new page is reachable from the nav links in all other pages.
4. Add the new `.html` file to `.assetsignore` only if it should NOT be served as a static file (very rare — usually you want it served).

### When editing the worker (`_worker.js`):

- The worker must remain compatible with Cloudflare Workers runtime (not Node.js).
- The `compatibility_date` in `wrangler.jsonc` pins the runtime API version — do not change it unless intentional.

### Do not:

- Add a package manager (`npm init`, `yarn`, `pnpm`) unless explicitly requested.
- Add a JavaScript framework (React, Vue, etc.) unless explicitly requested.
- Create a build system or bundler configuration.
- Modify `.assetsignore` to accidentally expose the worker or config files.
- Hardcode new contact details — if the business email or location changes, update it in both `index.html` and `contact.html`.

---

## No Testing Infrastructure

There are no automated tests. Manual testing is performed by:
1. Running `npx wrangler dev` and visually inspecting in a browser
2. Checking responsive layout at 768px and 480px viewport widths
3. Verifying the contact form `mailto:` link opens the client's email app

---

## Git Conventions

Commit messages in this repo are short and descriptive:
```
Add Cloudflare Worker to disable HTML caching
Changed to more dynamic typing effect
Add wrangler config and assetsignore for worker deployment
```

Use plain imperative or past-tense short phrases. No conventional commits format required.
