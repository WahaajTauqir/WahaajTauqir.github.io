# Muhammad Wahaaj Tauqir Portfolio

Personal portfolio blending research in trustworthy and explainable AI with
production software engineering, computer vision, and immersive systems.

The site is designed as a lightweight, dependency-free static experience for
GitHub Pages. The resume carries the official record. This page is the showcase.

## Structure

| Section | Purpose |
| --- | --- |
| Hero | Identity, a scalable News rail, and the visual "new world" moment (portrait, orbits, particle field). |
| At a glance | One line each for the engineering track and the research track. |
| 01 · Software Engineering | Six work cards (Computer Vision, Explainable Systems, Cinematic Sequences, Hyper Casual Games, AR, VR), tech matrix, career track. |
| 02 · Research | Three outcome cards (publication, patent application, applied system) and research tools. |
| 03 · Recognition & Credentials | Awards and certifications, every item linked to its source. |
| 04 · Contact | Email, LinkedIn, footer links. |

Every section uses the same skeleton: index → title → one-line summary → content.

## Cards

Both grids share one `.portfolio-card` component:

```
visual (SVG glyph) → kicker → title → summary → meta (where the link goes)
```

Card glyphs live in the `<svg class="glyph-sprite">` at the bottom of
`index.html` as `<symbol>` elements and are referenced with `<use href="#glyph-…">`.
They inherit the card accent through `currentColor`.

To replace a glyph with a screenshot, swap the `<svg>` inside `.card-visual` for
an `<img>` (add `loading="lazy"` and an `alt`) and give `.card-visual img`
`object-fit: cover` in `styles.css`.

## Files

- `index.html`: content and the glyph sprite
- `styles.css`: design system, components, responsive rules
- `script.js`: reveal-on-scroll, tilt/magnetic hover, particle field (fades out after the hero)
- `assets/`: portrait and favicon
