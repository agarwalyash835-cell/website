# Grovix website

Static marketing site for Grovix Ventures: licensed, ISBN-certified ebooks for AI and LLM training.

- `index.html`: page content and sections
- `styles.css`: design tokens (colours, fonts) live in `:root` at the top
- `script.js`: mobile menu, scroll reveals, contact form (opens a pre-filled email to `CONTACT_EMAIL`)
- `assets/logo.svg`, `favicon.svg`: boxed "GV" serif logo mark

No build step. Open `index.html` in a browser, or deploy the folder to any static host (GitHub Pages, Netlify, Vercel).


## Hosting

Served by GitHub Pages from the root of this branch. The `CNAME` file sets the custom domain (grovix.co.in), and `.nojekyll` serves files as-is. Every push to the branch updates the live site.
