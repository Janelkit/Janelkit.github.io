# JanelKit Website

English presentation and documentation site built with Svelte 5 + SvelteKit. JanelKit itself is a separate Python desktop framework and is never modified by this site.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. For production:

```sh
npm run check
npm test
npm run build
npm run preview
```

`build/` is a fully prerendered static site. Deploy it on a static host supporting directory indexes. No Python server is required. To install test browsers: `npx playwright install chromium`.

## GitHub Pages

The only publishing workflow is `.github/workflows/deploy.yml`. On each push to
`main` (or a manual run from Actions), it installs the locked dependencies, checks
SvelteKit and the documentation content, builds the static site, and deploys
`build/` to GitHub Pages. It does not build the README with Jekyll.

In the repository's **Settings → Pages → Build and deployment**, select
**GitHub Actions** as the source. This repository is the account site
`Janelkit.github.io`, so it is served at the domain root without a repository
base path. Changes must be committed and pushed to `main` before the workflow
can publish them.

## Documentation checks

`npm run test:content` checks the page schema and structure: required teaching blocks (goals, explained examples, expected results, common mistakes, key points), the chapter order, that every cross-link and written path exists, that every old `/docs/` URL redirects, that package pages cover their package's exports, and coverage of the 47 top-level public names captured from JanelKit 0.1.0. `npm test` also runs the browser suite.

To verify the examples against a real JanelKit installation, use an interpreter with JanelKit and PySide6 installed (the website itself does not need Python). From the website folder, with the framework checked out next to it:

```sh
node scripts/export_doc_examples.mjs
QT_QPA_PLATFORM=offscreen python scripts/validate_doc_examples.py
```

The validator compiles and mounts every complete component, fails on compiler warnings and logged errors, runs every "Ordinary Python" snippet, and replays the behavior promised in "What you should see" for the registered examples. Fragments are counted but cannot run alone. Output stays under `artifacts/doc-validation/`. `validate_doc_examples.py` is a local helper (ignored by git); add a behavior to it whenever you write an expected result for a complete example.

## Edit

- Palette: `src/lib/theme.css` (all semantic color tokens).
- Layout and responsive rules: `src/app.css`.
- Landing page: `src/routes/+page.svelte`.
- Documentation structure: `src/lib/docs.js` places pages in three areas (Guide, Reference, Packages) and orders them; page content lives in topic modules in `src/lib/docs/`. Each page gets the URL `/<area>/<slug>/`; old `/docs/<slug>/` URLs redirect.
- Where a feature comes from (core or an optional package): `src/lib/origins.js`.
- Lesson formatting: `src/lib/components/DocSection.svelte` and `src/lib/lessons.css`.
- Authoring rules: `DOCUMENTATION_GUIDELINES.md`.
- Agent index/full text: `/llms.txt` and `/llms-full.txt`, generated from the same catalog.
- Components: `src/lib/components/`.
- Design rationale and palette: `DESIGN.md`.
- Content provenance: `CONTENT_SOURCES.md`.

The brand uses a provisional typographic wordmark. Google Fonts are optional remote resources with fallbacks. The Guide is an ordered learning path; the Reference and Packages areas are for lookup. They are not a full translation of every upstream platform detail. The interactive counter is a browser simulation of the documented desktop example, explicitly labeled in the UI.
