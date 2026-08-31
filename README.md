# Mostar city — cinematic scroll story

A single standalone page that tells a three-screen cinematic story of **Mostar**,
driven entirely by scroll. Vanilla **HTML + CSS + JavaScript** — no frameworks,
no build step. Every photograph and the display font are loaded from remote URLs.

**Live preview locally:** serve the folder and open it (see [Running](#running)).

---

## How it works

The whole scene is a `position: sticky` stage pinned inside a tall
(`100vh + 2500px`) section. As you scroll through those 2500px, a single
`requestAnimationFrame` loop reads the scroll offset, smooths it with `lerp`
inertia, and writes the **CSS custom properties**. The stylesheet binds those
variables to GPU-friendly `transform` / `opacity` / `filter` values, so the
browser composites the animation without per-frame layout work.

### Choreography (scrubbed across ~2500px)

1. **0–650px** — the title rises and fades; the intro paragraph sinks away.
2. **560–1620px** — the bridge widens and launches upward, the split-frame halves
   part symmetrically, a river close-up fades in, a blue veil + blur ramp up, and
   the first story panel appears.
3. **1760–2500px** — the bazaar layer gains saturation and the old-town panel
   fades in with its “Open old town notes” pill, where the scroll rests.

Pointer movement adds a subtle parallax to every layer.
`prefers-reduced-motion` bypasses the scroll smoothing and pointer parallax.

---

## Running

Any static file server works. With Python:

```bash
python -m http.server 5500
# then open http://localhost:5500
```

Scroll slowly to scrub the story; move the mouse for parallax.

---

## Assets

All photographs and pin icons are loaded from their original remote hosts
(Figma-published site + CloudFront). An internet connection is required.

### Font note (Ogg Medium)

The display serif **Ogg Medium** is served from a local copy in
[`fonts/`](fonts/). Its original CloudFront URL is reachable but does **not**
send an `Access-Control-Allow-Origin` header, and browsers require CORS for
web fonts — so the cross-origin `@font-face` fails (“A network error occurred”)
and the page silently falls back to a system serif. The local copy renders it
reliably; the remote URL is kept as a fallback `src`.

---

## Files

| File | Purpose |
|---|---|
| `index.html` | DOM structure and copy |
| `styles.css` | `:root` variables, layered scene, UI, media queries |
| `script.js`  | scroll-driven animation engine |
| `fonts/`     | local Ogg Medium woff2 |

---

## Structure at a glance

```
main.site-shell
└─ section.cinema-scroll               ← tall scroll rig
   └─ div.stage                        ← sticky, 100vh
      ├─ div.world                     ← layered scene (sky, back stack, bridge…)
      ├─ section.intro-copy
      ├─ section.story-panel-bridge
      └─ section.story-panel-bazaar
```
