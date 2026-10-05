const fs = require('fs');

// Build the new index.html in parts, then splice in the icon sprite.
// Written with explicit LF + utf8 so it matches the rest of the repo.

const HEAD = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Speed Boost Nutrition | Premium Sports Nutrition</title>
  <meta name="description" content="Speed Boost Nutrition \u2014 protein, creatine, mass gainers, pre-workout and wellness supplements." />
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/home.css" />

  <!--
    ICON SPRITE
    Icons come from Reicon (reicon.dev) \u2014 the same library behind the
    "Reicon" VS Code extension. They are inlined below as SVG <symbol>s
    so the page needs no icon font, no CDN and no extra request.
    Use one with:  <svg class="icon"><use href="#i-arrow-right"></use></svg>
  -->
</head>

<body>

  <a class="skip-link" href="#main">Skip to main content</a>

  <!--SPRITE-->

  <!-- ================= HEADER (same as every other page) ================= -->
  <header>
    <div class="container nav">

      <a class="logo" href="index.html">
        <div class="logo-mark">SB</div>
        SPEED <span>BOOST</span> NUTRITION
      </a>

      <nav class="nav-links" aria-label="Main">
        <a class="active" href="index.html" aria-current="page">Home</a>
        <a href="shop.html">Shop</a>
        <a href="categories.html">Categories</a>
        <a href="about.html">About</a>
        <a href="contact.html">Contact</a>
      </nav>

      <div class="nav-actions">
        <button class="icon-btn" type="button" aria-label="Search products">
          <svg class="icon" aria-hidden="true"><use href="#i-search"></use></svg>
        </button>

        <button class="icon-btn" type="button" aria-label="Cart">
          <svg class="icon" aria-hidden="true"><use href="#i-shopping-cart"></use></svg>
          <span class="cart-count" data-cart-count>0</span>
        </button>

        <a class="login-btn" href="#">Login / Sign Up</a>
      </div>

    </div>
  </header>


  <!-- ================= HERO ================= -->
  <main id="main">

    <section class="hero">
      <div class="container hero-content">

        <div class="hero-copy">
          <div class="eyebrow">Premium Nutrition Supplements</div>

          <h1>
            Fuel Your<br />
            <span>Performance</span>
          </h1>

          <p>
            Quality nutrition products for your fitness journey.
            Shop protein, creatine, mass gainers, pre-workout and more.
          </p>

          <div class="hero-buttons">
            <a class="btn btn-primary" href="shop.html">
              Shop Now
              <svg class="icon" aria-hidden="true"><use href="#i-arrow-right"></use></svg>
            </a>
            <a class="btn btn-outline" href="#featured">View Products</a>
          </div>

          <ul class="hero-features">
            <li class="hero-feature">
              <span class="hero-feature-icon">
                <svg class="icon" aria-hidden="true"><use href="#i-wallet"></use></svg>
              </span>
              Cash on Delivery
            </li>

            <li class="hero-feature">
              <span class="hero-feature-icon">
                <svg class="icon" aria-hidden="true"><use href="#i-truck"></use></svg>
              </span>
              All India Delivery
            </li>

            <li class="hero-feature">
              <span class="hero-feature-icon">
                <svg class="icon" aria-hidden="true"><use href="#i-shield-check"></use></svg>
              </span>
              Quality Products
            </li>
          </ul>
        </div>

        <div class="hero-panel" aria-hidden="true">
          <div class="hero-panel-card">
            <svg class="hero-panel-icon"><use href="#i-dumbbell"></use></svg>
            <div class="hero-panel-text">
              <strong>Train with intent</strong>
              <span>Protein &middot; Creatine &middot; Gainers</span>
            </div>
          </div>

          <div class="hero-panel-card">
            <svg class="hero-panel-icon"><use href="#i-bolt"></use></svg>
            <div class="hero-panel-text">
              <strong>Fuel every session</strong>
              <span>Pre-Workout &middot; Hydration</span>
            </div>
          </div>
        </div>

      </div>
    </section>

`;

fs.writeFileSync('part-head.html', HEAD, 'utf8');
console.log('head part: ' + HEAD.length + ' bytes');
console.log('CRLF present: ' + HEAD.includes('\r'));