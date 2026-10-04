# Images

All images are **replaceable local files**. Nothing on the site points at an
external URL, so the demo keeps working offline.

## Drop real photos here

| File | Used by | Recommended size |
| --- | --- | --- |
| `assets/shop-hero.jpg` | Shop page banner (`shop.html`) | 1920 x 760 or larger, dark cinematic gym / athlete photo with empty space on the left |
| `assets/categories-hero.jpg` | Categories page banner (`categories.html`) | 1920 x 760 or larger, wide dark shelf / gym wall shot with empty space on the left |
| `assets/category-featured.jpg` | Categories "Why Choose the Right Category?" block | 1200 x 900 or larger |
| `assets/categories/*.jpg` | Categories category cards | 800 x 800, square — see `assets/categories/README.md` |
| `assets/products/*.jpg` | Shop page product cards | 800 x 800, square, product on a plain light background |
| `assets/hero.jpg` | Home page hero (`index.html`) | 1920 x 900 or larger |
| `assets/category-*.jpg` | Home page category cards | 800 x 1000 |
| `assets/store.jpg` | Home page store section | 1200 x 900 |
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

## Until the photos exist

Missing images are handled by a built-in fallback: each card shows a clean
placeholder (a simple jar outline with the product name) and does **not** break
the layout. The hero keeps its dark gradient background, so the banner stays
readable without `shop-hero.jpg`.

Replace the placeholder artwork and sample product data with verified business
photos and details before the site goes live (see `rules.md` section 3 —
Business Accuracy).
