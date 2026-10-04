# Category & banner images — `categories.html`

The Categories page is fully built and works without any of these files: every
`<img>` hides itself on error, so the dark card gradient shows instead and the
layout never breaks. Drop the real photography in and it replaces itself.

| File | Used by | Recommended size |
| --- | --- | --- |
| `../categories-hero.jpg` | Page banner (`categories.html`) | 1920 x 760 or larger, wide dark shot of a supplement shelf / gym wall with empty space on the **left** for the text |
| `../category-featured.jpg` | "Why Choose the Right Category?" block | 1200 x 900 or larger (portrait or square crop is fine) |
| `protein.jpg` | Protein card + popular card | 800 x 800, square |
| `creatine.jpg` | Creatine card + popular card | 800 x 800, square |
| `mass-gainer.jpg` | Mass Gainer card + popular card | 800 x 800, square |
| `pre-workout.jpg` | Pre-Workout card + popular card | 800 x 800, square |
| `bcaa.jpg` | BCAA / EAA card | 800 x 800, square |
| `vitamins-wellness.jpg` | Vitamins & Wellness card | 800 x 800, square |
| `amino-acids.jpg` | Amino Acids card | 800 x 800, square |
| `other-supplements.jpg` | Other Supplements card | 800 x 800, square |

## Guidance

- **Dark, low-contrast backgrounds.** Each card has a dark scrim baked into the
  CSS, so a light or busy photo will fight the white text. Match the tone of the
  Shop banner for a consistent feel.
- **Subject centred.** Text sits in the bottom-left of every card, so keep faces,
  tubs and scoops out of that corner.
- **Consistent crop.** All cards use `object-fit: cover`, so any square image
  fills the card cleanly.

## Still to confirm

The eight **product counts** on the cards are placeholders — real category
counts are not available yet. Replace each `<span class="cat-card__count">` in
`categories.html` with a live count from the product API before launch.
