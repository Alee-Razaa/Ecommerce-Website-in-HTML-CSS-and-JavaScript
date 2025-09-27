# Cara — E‑commerce Website (HTML, CSS, JavaScript)

A modern, responsive e‑commerce frontend implementing a polished shopping experience with dynamic product grids, search suggestions, rewards, cart badge, newsletter signup, accessibility and SEO best practices.

- Repository: [Alee-Razaa/Ecommerce-Website-in-HTML-CSS-and-JavaScript](https://github.com/Alee-Razaa/Ecommerce-Website-in-HTML-CSS-and-JavaScript)
- Tech composition: HTML (41.2%), JavaScript (30.6%), CSS (28.2%)

## Table of contents
- Features
- Pages
- Architecture
- Getting started
- Scripts and data
- Accessibility and SEO
- Customization
- Roadmap
- Screenshots and docs
- Acknowledgments

## Features

User experience
- Responsive layout with modular CSS (tokens, base, components, pages)
- Modern header with:
  - Global search and suggestions
  - Mobile navigation with overlay and accessible toggles
  - Cart badge indicator
  - Rewards quick access
  - Theme toggle (light/dark) with persistent preference
- Home sections:
  - Hero CTA
  - Weekly deals banner with countdown timer
  - Featured products (dynamic)
  - New arrivals (dynamic)
  - Personalized recommendations (dynamic)
  - Newsletter signup

Commerce and content
- Product grids load dynamically with skeleton placeholders
- Shop, blog, about, contact, rewards, and cart pages
- Promotions, seasonal banners, and quick links
- Client‑side storage for preferences and shopping cart badge

Performance
- Preconnect to external resources
- Lazy‑loaded images where applicable
- ES modules with graceful warning for legacy browsers

Accessibility
- Landmark roles and aria labels
- “Skip to content” link
- Keyboard‑navigable menus and buttons
- Descriptive labels and alt text patterns

SEO
- Meta description and keywords
- Open Graph and Twitter cards
- Schema.org structured data (WebSite + SearchAction)

## Pages

Core entry:
- index.html (root): modernized homepage

Legacy/template pages and assets (kept under a subfolder):
- Build-and-Deploy-Ecommerce-Website-main/
  - shop.html
  - blog.html
  - about.html
  - contact.html
  - Reward.html
  - cart.html
  - img/, pay/ and other static assets

Internal links from the homepage point to these pages (e.g., Shop, Blog, About, Contact, Rewards, Cart).

## Architecture

High‑level structure:
```
/
├─ index.html
├─ styles/
│  ├─ tokens.css
│  ├─ base.css
│  └─ components/
│     ├─ header.css
│     ├─ buttons.css
│     ├─ product-card.css
│     └─ … (plus pages/home.css)
├─ scripts/
│  ├─ app.js
│  ├─ theme.js
│  ├─ ui/
│  │  ├─ search.js
│  │  └─ productGrid.js
│  └─ data/
│     └─ productService.js
├─ data/
└─ Build-and-Deploy-Ecommerce-Website-main/
   ├─ index.html (legacy template)
   ├─ shop.html, blog.html, about.html, contact.html, Reward.html, cart.html
   └─ img/, pay/, …
```

Key homepage integrations (index.html):
- Styles: `./styles/tokens.css`, `./styles/base.css`, `./styles/components/*.css`, `./styles/pages/home.css`
- Scripts:
  - `./scripts/theme.js` (theme toggle + persistence)
  - `./scripts/ui/search.js` (global search + suggestions UI)
  - `./scripts/data/productService.js` (product fetching/utilities)
  - `./scripts/ui/productGrid.js` (dynamic grid rendering + skeleton states)
  - `./scripts/app.js` (homepage orchestration)
- SEO: Open Graph, Twitter cards, and JSON‑LD structured data
- Accessibility: skip link, ARIA roles/labels, semantic sections

## Getting started

Prerequisites
- Any modern browser (ES modules supported)
- Optional: a local HTTP server for best results

Run locally
1. Clone the repository
2. Open `index.html` in your browser
   - Recommended: use a local server (e.g., VS Code “Live Server”, `python -m http.server`, or similar) to avoid CORS issues with dynamic imports or fetches.

Recommended local server commands
- Python 3: `python -m http.server 8080`
- Node (serve): `npx serve .`

Then visit `http://localhost:8080/`

## Scripts and data

- scripts/theme.js
  - Handles theme toggle UI and persists selection
- scripts/ui/search.js
  - Enhances global search with suggestions and ARIA listbox semantics
- scripts/data/productService.js
  - Centralizes product fetching and mapping for:
    - Featured products
    - New arrivals
    - Recommendations
- scripts/ui/productGrid.js
  - Renders product cards into grids with loading skeletons and “Add to Cart” controls
- scripts/app.js
  - Bootstraps homepage sections (featured, arrivals, recommendations, weekly deals timer)

Note: The homepage references category and page links (Shop, Blog, etc.) under `Build-and-Deploy-Ecommerce-Website-main/`.

## Accessibility and SEO

Accessibility
- “Skip to main content” link
- Role attributes on header, nav, main, footer
- Keyboard‑navigable controls (menu toggle, search, theme)
- Proper labelling for inputs and interactive elements

SEO
- `<meta name="description">` and `keywords`
- Open Graph and Twitter meta tags with preview imagery
- Schema.org JSON‑LD (WebSite + SearchAction) for richer search features

## Customization

- Branding: replace logos in `Build-and-Deploy-Ecommerce-Website-main/img/`
- Colors and spacing: edit `styles/tokens.css`
- Components: update CSS under `styles/components/`
- Page content: modify `index.html` and pages under `Build-and-Deploy-Ecommerce-Website-main/`
- Product data source: adjust endpoints or data transformations in `scripts/data/productService.js`

## Roadmap

- Integrate backend (auth, orders, persistent cart)
- Payment gateway integration
- Blog CMS integration
- Product reviews and ratings persistence
- Advanced filters and sorting in Shop
- Enhanced analytics and A/B experiments

## Screenshots and docs

- Existing images and a project document are available in the current README history:
  - [Shoping web application Doc with project images.pdf](https://github.com/user-attachments/files/18515017/Untitled.document.pdf)

You can add updated screenshots by placing them under a repo folder (e.g., `assets/`) and referencing them here.

## Acknowledgments

- The legacy template pages (under `Build-and-Deploy-Ecommerce-Website-main/`) originate from an e‑commerce tutorial and are preserved for reference and assets.
- Icons by Font Awesome.

---
Built with: HTML5, CSS3, JavaScript (modules)
