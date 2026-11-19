---
name: landing-design
description: Visual identity, layout and motion rules for the Sketchboard landing page. Use before adding or changing sections, styles, copy, icons or animations in this repo.
---

# Sketchboard landing design

The page should feel like the app: a black board, a fine grid and a single white stroke drawn by hand.

## Tokens (src/styles/global.css)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#000000` | Page and board |
| `--panel` / `--panel-2` | `#121212` / `#1d1d1d` | Panels, cards, hover |
| `--line` / `--line-strong` | `#292929` / `#5a5a5a` | Grid, borders |
| `--text` / `--ink` | `#ffffff` | Text, active state, strokes |
| `--muted` | `#989898` | Secondary text |
| `--ok` | `#30d158` | Only for "saved" status |

Radius: `--radius` (10px) for panels, `999px` for pills and buttons. Grid: `--grid` (48px; 40px inside the app mock).

## Type
- Inter Tight Variable, weight 800 with negative tracking (-0.04em to -0.055em) for headings and the wordmark.
- JetBrains Mono only for data: hex values, file names, shortcuts, calculation results, eyebrows.

## Layout
- Sections are `section.block` with a `.wrap` inside (max 1120px, 16px safe-area gutter).
- Grids of items use `gap: 1px` over `background: var(--line)` to draw hairline dividers, not individual card borders.
- Must work at 400px wide without horizontal scroll.

## Motion
- One orchestrated moment per section; everything else subtle.
- Hero: letters rise in sequence, the wave draws itself, the background can be scribbled on, the grid lights up near the cursor.
- LiveDemo: the app in a loop (select text tool, write `12 × 4`, accept `= 48`, status saves). Runs only while visible.
- Lines and the icon S draw with `pathLength`. Entrances use `ease: [0.22, 1, 0.36, 1]`, 0.6 to 0.8s, stagger ~70ms.
- Always honor `prefers-reduced-motion`; never leave content invisible without JavaScript.

## Copy
- pt-BR, direct, from the user's side ("Baixar para macOS", "Workspace salvo"). No exclamation marks, no buzzwords.
- Feature claims must match what the app does today.

## Icon
`public/icon.svg` is copied from `build/icon.svg` in the app repo. If the app icon changes, copy it again and update `AppTile.astro` and `DrawIcon.tsx`.
