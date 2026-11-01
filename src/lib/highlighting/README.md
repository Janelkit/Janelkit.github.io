# Code highlighting

`janel.tmLanguage.json` is an unchanged copy of the JanelKit VS Code extension's
`packages/janelkit-vscode/syntaxes/janel.tmLanguage.json`. Its MIT license is
preserved in `LICENSE`. The source repository is read-only; updating the grammar
means copying a reviewed version here, not editing the extension.

`index.js` registers that TextMate grammar with Shiki, alongside Python, CSS and
shell grammars. The Python and CSS grammars also highlight embedded `<script>`
and `<style>` sections in `.janel` files. Only these languages are loaded.

`CodeBlock.svelte` renders tokens as escaped text, not raw HTML. Highlighting is
included in prerendered pages, so it remains visible without JavaScript. Copy
uses the original source, not the token markup. The existing documentation
language metadata selects the grammar; unknown languages remain plain text.

The theme maps TextMate scopes to `--syntax-*` variables in `src/lib/theme.css`.
Both color palettes must maintain at least 4.5:1 contrast on `--code-bg`.

Verification: `npm run test:content`, `npm run check`, `npm run build`, and
`npx playwright test tests/highlighting.spec.js` (or `npm test` for the full suite).
