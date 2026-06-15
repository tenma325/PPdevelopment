# tenma325 Portfolio — Neural / Glassmorphism / Gold-on-Black

3 つの個人開発サイト（Kaikei.family / ギャル行政課 / devepopment）を、  
高級感ある一枚の界面に接続したポートフォリオ・インデックス。

## Concept

- **Background**: #0a0a0a + 32px dot grid + Canvas neural particle field + Blender-rendered hero image
- **Typography**: Playfair Display Italic (headings) + Inter (UI/body)
- **Palette**: Base Gold `#a78b71`, Light Gold `#c9b8a0`, Hover Gold `#e8d5b7`
- **Surfaces**: Glassmorphism — `rgba(255,255,255,0.03)`, `backdrop-filter: blur(10px)`, 1px border
- **Motion**: `cubic-bezier(0.4, 0, 0.2, 1)`, reveal `power4.out`-style, pulsing SVG neural lines

## Structure

1. Fixed glass nav
2. Hero: big italic headline + central neural hub + 3 satellite text cards + SVG connections + live pill
3. Works: bold typographic list (no images) with updated Japanese taglines
4. Capabilities: 4-column feature grid
5. Services: 3-tier pricing cards
6. Process: 2-column Discover / Build cards
7. Footer: 5-column layout + digest form

## Works Copy

- **Kaikei.family** — 「家族みんなで、おカネの流れを。」
- **ギャル行政課** — 「かたい役所を、やさしくひらく。」
- **devepopment** — 「つくる楽しさに、ときめきを。」

## Local Server

```bash
cd C:/Users/user/portfolio-hub
python -m http.server 8765 --bind 0.0.0.0
```

Open: http://127.0.0.1:8765/index.html

## Files

- `index.html` — markup
- `styles.css` — design system + layout
- `script.js` — Canvas neural field + reveal + parallax
- `assets/kaikei-thumb.jpg, assets/gyaru-gov-thumb.jpg, assets/devepopment-thumb.jpg` — Blender 3D render
- `screenshots taken via browser_vision + Pillow crop` — Blender scene script
- `assets/mark.svg` — favicon
- `Modelfile` — ollama portfolio-hub-design config
