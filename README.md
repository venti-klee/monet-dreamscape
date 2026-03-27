# Monet's Dreamscape / 莫奈的画境

An impressionist-style side-scrolling platformer built entirely with HTML5 Canvas. Explore six paintings by Claude Monet, collect hidden treasures, and uncover the love story between Monet and Camille Doncieux.

**[Play Now](https://s85m9uuq.mule.page/)**

![Main Menu](docs/screenshots/01_menu.png)

---

## About

Players control a luminous spirit navigating through worlds crafted from Monet's real paintings. Each level features a unique gameplay mechanic inspired by the painting's theme — from lantern-lit studios to wind-swept gardens to parasol gliding across hilltops.

The game tells the chronological love story of Claude Monet and Camille Doncieux through voiced dialogue (English TTS with bilingual subtitles), progressing from their first meeting in a Paris studio to Monet's later years at Giverny.

## Screenshots

| Level Select | Gameplay |
|:---:|:---:|
| ![Level Select](docs/screenshots/02_levelselect.png) | ![Gameplay](docs/screenshots/03_gameplay.png) |

| Voiceover & Exploration | Painting Reveal |
|:---:|:---:|
| ![Walking](docs/screenshots/04_walking.png) | ![Painting Reveal](docs/screenshots/07_painting_reveal.png) |

| Gallery | Gallery Detail |
|:---:|:---:|
| ![Gallery](docs/screenshots/08_gallery.png) | ![Gallery Detail](docs/screenshots/09_gallery_detail.png) |

## The Six Levels

| # | Painting | Year | Mechanic |
|---|----------|------|----------|
| 1 | Woman in the Green Dress | 1866 | **Light & Shadow** — Player carries a lantern; dark zones hide platforms until illuminated |
| 2 | Women in the Garden | 1866 | **Wind Gusts** — Periodic wind pushes the player and sways platforms |
| 3 | Woman with a Parasol | 1875 | **Parasol Glide** — Hold jump to glide; updraft zones launch player upward |
| 4 | Water Lilies | 1906 | **Disappearing Lily Pads** — Platforms fade after standing on them |
| 5 | Impression, Sunrise | 1872 | **Tidal Cycle** — Water rises and falls, submerging lower platforms |
| 6 | The Japanese Bridge | 1899 | **Season Shift** — Environment transitions through spring, summer, and autumn |

## Controls

| Key | Action |
|-----|--------|
| `Arrow Left/Right` or `A/D` | Move |
| `Arrow Up` / `Space` / `W` | Jump (hold to glide in Level 3) |
| `ESC` | Pause / Resume |
| `Tab` / `B` | Open Backpack |

Touch controls are displayed automatically on mobile devices.

## Features

- **6 levels** based on real Monet paintings, each with a unique gameplay mechanic
- **Bilingual** — Chinese/English toggle (menu + in-game)
- **Voiced dialogue** between Monet and Camille (42 voice lines, English TTS + bilingual subtitles)
- **Progressive painting reveal** — Background transforms from grayscale sketch to full color as items are collected
- **Procedural music** — Generated in real-time via Web Audio API (no audio files needed)
- **Collectibles** — 3 paint tube keys + 5 souvenirs per level, with persistent album
- **Painting gallery** — View unlocked masterworks with descriptions
- **AI-generated sprites** — 8-frame character animation with runtime background removal
- **3-layer parallax** scrolling with atmospheric effects (fog, light beams, vignette, noise)
- **Mobile-friendly** — Responsive layout with virtual touch controls

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Rendering | HTML5 Canvas 2D API |
| Audio | Web Audio API (procedural generation) |
| Voice | edge-tts (Microsoft Edge TTS) |
| Art Assets | MuleRouter API / AI image generation |
| Persistence | localStorage |
| Deployment | Static files — no server required |

## Project Structure

```
src/
├── index.html              # HTML structure and UI elements
├── style.css               # Styles with z-index layer management
├── game.js                 # Game engine (~4800 lines, single-file architecture)
├── water_lilies.jpg        # Level 4 background
├── impression_sunrise.jpg  # Level 5 background
├── japanese_bridge.jpg     # Level 6 background
├── green_dress.jpg         # Level 1 background
├── women_garden.jpg        # Level 2 background
├── parasol.jpg             # Level 3 background
├── sprite_sheet_v3.png     # 8-frame character sprite (idle, walk, jump, fall)
├── vo/                     # Voice-over audio (42 MP3 files)
│   ├── l1_v1.mp3 ~ l1_v6.mp3    # Level 1 dialogue
│   ├── l2_v1.mp3 ~ l2_v6.mp3    # Level 2 dialogue
│   ├── ...
│   └── l6_v1.mp3 ~ l6_v6.mp3    # Level 6 dialogue
├── souvenirs/              # Souvenir collectible images (30 JPGs)
│   ├── sv_l1_1.jpg ~ sv_l1_5.jpg
│   ├── ...
│   └── sv_l6_1.jpg ~ sv_l6_5.jpg
└── paintings/              # High-res painting images for reveal (6 JPGs)
    ├── painting_l1.jpg ~ painting_l6.jpg
```

## Running Locally

The game is pure static files with no build step:

```bash
# Python
cd src && python3 -m http.server 8080

# Node.js
cd src && npx serve .

# Then open http://localhost:8080
```

## Architecture Highlights

### Single-File Game Engine
The entire game logic lives in `game.js` — physics, rendering, level data, i18n, audio, UI state management. This was a deliberate choice for zero-dependency deployment on static hosting platforms.

### Sprite Processing Pipeline
AI-generated character sprites have black backgrounds. A two-pass runtime pipeline handles this:
1. **Pass 1**: Scan all frames to find content bounding boxes, compute maximum uniform dimensions
2. **Pass 2**: Extract each frame centered in uniform canvas, remove dark pixels with gradient alpha falloff

This ensures all animation frames share identical dimensions, preventing size jitter during state transitions.

### Progressive Painting System
Three reveal modes add visual variety across levels:
- **Global Fade** — Entire background desaturates→saturates via CSS filter
- **Radial Spread** — Color radiates outward from each collection point
- **Layer Reveal** — Horizontal bands reveal bottom-to-top

### Procedural Music
No music files are shipped. The Web Audio API generates ambient music in real-time:
- Layer 1: Chord pad (sustained harmonic foundation)
- Layer 2: Pentatonic melody (randomly generated)
- Layer 3: Bass (chord root notes)
- Layer 4: Filtered white noise texture

## Design Philosophy

The visual design draws from museum aesthetics — warm parchment tones (#f5ead0) for text, deep gallery blacks (#0a0a12) for backgrounds. Georgia serif typography echoes classical art catalogues. Liberal use of transparency and blur filters recreates the luminous quality of Impressionist painting.

The narrative follows the real chronology of Monet and Camille's relationship, grounding the platforming mechanics in emotional context rather than arbitrary challenge progression.

## License

This project is for educational and artistic purposes. Painting imagery is based on public domain works by Claude Monet (1840–1926). AI-generated assets were created using MuleRouter API.

---

*Built with HTML5 Canvas, Web Audio API, and a love for Impressionism.*
