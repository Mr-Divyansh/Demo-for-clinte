# Images

All images are **replaceable local files**. Nothing on the site points at an
external URL, so the demo keeps working offline.

## Current state: placeholder art, not real photos

Every `.jpg` in this folder is **generated placeholder artwork**, not real
photography. Each one is deliberately abstract (brand gradient + a generic tub
outline) and carries a small **"SAMPLE IMAGE"** caption, so it can never be
mistaken for a real product photo or a real store.

No product names are baked into the artwork — the cards already print the
product/category name directly beneath each image, so a second copy inside the
picture would just be clutter.

This is intentional and follows `rules.md` 3 (never invent business data) and
`rules.md` 15 (the demo must not pretend placeholder data is real). Real
product photography was not available, so the site ships honest stand-ins that
can be swapped for the real files with **no code change** — the paths below are
already wired into the HTML and JS.

**Replace these before launch.** Overwriting a file with the same name and the
same aspect ratio is the entire migration step; the `onerror` fallbacks and the
inline SVG placeholder in `js/shop.js` then simply stop triggering.

## Drop real photos here

| File | Used by | Recommended size |
| --- | --- | --- |
| `assets/shop-hero.jpg` | Shop page banner (`shop.html`) | 1920 x 760 or larger, dark cinematic gym / athlete photo with empty space on the left |
| `assets/about-hero.jpg` | About page banner (`about.html`) | 1920 x 760 or larger, dark cinematic gym / athlete photo with empty space on the left |
| `assets/contact-hero.jpg` | Contact page banner (`contact.html`) | 1920 x 760 or larger, dark cinematic gym / athlete photo with empty space on the left |
| `assets/categories-hero.jpg` | Categories page banner (`categories.html`) | 1920 x 760 or larger, wide dark shelf / gym wall shot with empty space on the left |
| `assets/category-featured.jpg` | Categories "Why Choose the Right Category?" block | 1200 x 900 or larger |
| `assets/categories/*.jpg` | Categories category cards | 800 x 800, square — see `assets/categories/README.md` |
| `assets/products/*.jpg` | Shop page product cards | 800 x 800, square, product on a plain light background |
| `assets/hero.jpg` | Home page hero (`index.html`) | 1920 x 900 or larger |
| `assets/category-*.jpg` | Home page category cards | 800 x 1000 |
| `assets/store.jpg` | Home page store section **and** About page "Our Story" + "Visit Our Store" sections | 1200 x 900 |
| `assets/instagram-*.jpg` | Home page Instagram grid | 600 x 600 (square) |

### Expected product image filenames

These paths are already wired up in `js/shop.js` — just save the file with the
same name and it appears automatically:

```text
assets/products/whey-protein.jpg
assets/products/creatine.jpg
assets/products/mass-gainer.jpg
assets/products/pre-workout.jpg
assets/products/iso-whey.jpg
assets/products/bcaa.jpg
assets/products/glutamine.jpg
assets/products/multivitamin.jpg
assets/products/mass-gainer-advanced.jpg
assets/products/c4.jpg
assets/products/zma.jpg
assets/products/whey-isolate.jpg
```

## If an image is ever missing

The files present right now are placeholders, but the site must also survive a
genuinely **missing** file. That is handled by a built-in fallback: each card
shows a clean placeholder (a simple jar outline with the product name) and does
**not** break the layout. The hero keeps its dark gradient background, so the
banner stays readable without `shop-hero.jpg`.

So deleting any `.jpg` is safe — the layout degrades gracefully rather than
showing a broken-image icon.

Replace the placeholder artwork and sample product data with verified business
photos and details before the site goes live (see `rules.md` section 3 —
Business Accuracy).
