import { createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import python from 'shiki/langs/python.mjs';
import css from 'shiki/langs/css.mjs';
import shell from 'shiki/langs/shellscript.mjs';
import grammar from './janel.tmLanguage.json' with { type: 'json' };

// Reuse the VS Code extension's TextMate grammar; see README.md and LICENSE.
// CSS variables let the existing theme switch recolor SSR output without retokenizing.
const theme = {
  name: 'janelkit',
  settings: [
    { settings: { foreground: 'var(--code-text)', background: 'var(--code-bg)' } },
    { scope: ['comment'], settings: { foreground: 'var(--syntax-comment)' } },
    { scope: ['keyword', 'storage'], settings: { foreground: 'var(--syntax-keyword)' } },
    { scope: ['string'], settings: { foreground: 'var(--syntax-string)' } },
    { scope: ['constant', 'support.constant'], settings: { foreground: 'var(--syntax-number)' } },
    { scope: ['entity.name.function', 'support.function'], settings: { foreground: 'var(--syntax-function)' } },
    { scope: ['entity.name.tag'], settings: { foreground: 'var(--syntax-tag)' } },
    { scope: ['entity.other.attribute-name', 'support.type.property-name'], settings: { foreground: 'var(--syntax-attribute)' } },
    { scope: ['punctuation'], settings: { foreground: 'var(--syntax-punctuation)' } }
  ]
};
const highlighter = createHighlighterCoreSync({
  langs: [python, css, shell, { ...grammar, name: 'janel' }],
  themes: [theme],
  engine: createJavaScriptRegexEngine({ target: 'ES2018' })
});

export function highlightCode(code, language = 'text') {
  const aliases = { py: 'python', sh: 'shellscript', bash: 'shellscript', shell: 'shellscript' };
  const lang = aliases[language] || language;
  if (!highlighter.getLoadedLanguages().includes(lang)) return [{ content: code }];
  const lines = highlighter.codeToTokensBase(code, { lang, theme: 'janelkit' });
  const newlines = code.match(/\r\n|\r|\n/g) || [];
  return lines.flatMap((line, index) => index < lines.length - 1
    ? [...line, { content: newlines[index] }]
    : line);
}
