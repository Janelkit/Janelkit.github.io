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

`npm run test:content` checks the page schema and structure: required teaching blocks (goals, explained examples, expected results, common mistakes, key points), the chapter order, that every cross-link and written path exists, and that every published address still redirects (`/docs/…` of the first site, `/packages/…` and the guide chapters that became packages in 0.2). With the framework checked out next to the website, it also checks the site against it: the documented version is the framework's series, the Python reference names every `janelkit.__all__` name (`tests/fixtures/public-api.json` must match it), each package section names every export of its package, no example uses a 0.1 element name (`LEGACY_TAGS`), no example imports a package name from `janelkit`, and the style reference covers every supported property. `npm test` also runs the browser suite.

To verify the examples against a real JanelKit installation, use an interpreter with janelkit and the four packages installed (janelkit-router, janelkit-store, janelkit-desktop, janelkit-i18n); the framework's own development environment has them. The website itself does not need Python. From the website folder, with the framework checked out next to it:

```sh
node scripts/export_doc_examples.mjs
QT_QPA_PLATFORM=offscreen ../Janelkit/.venv/Scripts/python scripts/validate_doc_examples.py
```

The validator compiles and mounts every complete component, fails on compiler warnings and logged errors, runs every "Ordinary Python" snippet, and replays the behavior promised in "What you should see" for the registered examples. Fragments are counted but cannot run alone. Output stays under `artifacts/doc-validation/`. `validate_doc_examples.py` is a local helper (ignored by git); add a behavior to it whenever you write an expected result for a complete example.

## Edit

- Palette: `src/lib/theme.css` (all semantic color tokens).
- Layout and responsive rules: `src/app.css`.
- Landing page: `src/routes/+page.svelte`.
- Documentation structure: `src/lib/docs.js` places pages in three areas (Guide, Reference, Ecosystem) and orders them; page content lives in topic modules in `src/lib/docs/`. Guide and Reference pages get `/<area>/<slug>/`; each package is a section of the Ecosystem with its own base (`/ecosystem/router/`, `/ecosystem/router/sections/`). Older addresses are listed in `redirects` and keep working. One route, `src/routes/[...path]/`, serves every page and redirect.
- The documented version: `version` in `src/lib/docs.js` (header, page notices and `llms.txt`).
- Where a feature comes from (the core or a package of the ecosystem): `src/lib/origins.js`.
- Page layout: `src/lib/components/DocPage.svelte`; lesson formatting: `src/lib/components/DocSection.svelte` and `src/lib/lessons.css`.
- Authoring rules: `DOCUMENTATION_GUIDELINES.md`.
- Agent index/full text: `/llms.txt` and `/llms-full.txt`, generated from the same catalog.
- Components: `src/lib/components/`.
- Design rationale and palette: `DESIGN.md`.
- Content provenance: `CONTENT_SOURCES.md`.

The brand uses a provisional typographic wordmark. Google Fonts are optional remote resources with fallbacks. The Guide is an ordered learning path of the core; the Reference is for lookup, and the Ecosystem has one section per package, read in order within each package. They are not a full translation of every upstream platform detail. The interactive counter is a browser simulation of the documented desktop example, explicitly labeled in the UI.
