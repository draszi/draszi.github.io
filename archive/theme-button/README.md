# Archived theme button

Saved for future reuse; these files are not loaded by the portfolio.

- `button.html`: insert after the A SVG inside `.logo`.
- `button.css`: logo alignment, 9px crescent/sun, initial bounce, subsequent wiggle, reduced-motion support. Uses the site’s `--bg` and `--accent-bg` variables.
- `button.js`: load after the markup; tracks device theme until a manual choice, then stores that choice in localStorage.
- `init.html`: optional early theme initialization in the document head to avoid a theme flash.

When restoring, make dark palette styles target `:root[data-theme='dark']` instead of only the device media query. Set light/dark `color-scheme` accordingly. Preserve a visible keyboard focus outline for the button.
