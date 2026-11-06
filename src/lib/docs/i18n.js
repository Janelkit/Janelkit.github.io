// Ecosystem · janelkit-i18n.
// Sources (read-only): JanelKit/packages/janelkit-i18n/README.md and src/janelkit_i18n,
// docs/lenguaje.md (Idioma y dirección de escritura). The complete example is compiled
// and run against janelkit-i18n 0.2 by scripts/validate_doc_examples.py.
export const i18nDocs = [
  {
    slug: 'i18n',
    title: 'janelkit-i18n',
    description: 'Translate your interface with JSON catalogs, plurals and locale-aware formats, and switch language while the application runs.',
    sections: [
      {
        id: 'what-it-adds',
        title: 'What it adds',
        body: 'janelkit-i18n translates the text of your interface. You write one catalog per language, call t("key") in templates, and switch language while the application runs: every translated text updates without a restart. It also formats numbers, currency and dates following the rules of the active language.\n\nThe interface language itself belongs to the core (janelkit.locale), because it controls the writing direction of every element. In Arabic, Hebrew or Persian the whole interface mirrors. i18n.set checks that a catalog exists and then changes that core language.'
      },
      {
        id: 'in-a-minute',
        title: 'In one minute',
        body: 'Install it next to janelkit with pip install janelkit-i18n. This component adds two small catalogs from Python and switches between them. A real application keeps its catalogs in JSON files and loads them with i18n.load, as the next page shows.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
from janelkit_i18n import i18n, t

i18n.add("en", {"hello": "Hello, {name}", "files": {"zero": "No files", "one": "{n} file", "other": "{n} files"}})
i18n.add("es", {"hello": "Hola, {name}", "files": {"zero": "Ningún archivo", "one": "{n} archivo", "other": "{n} archivos"}})
i18n.default = "en"
i18n.set("en")

count = state(0)

def switch():
    i18n.set("es" if i18n.language == "en" else "en")
</script>

<column padding={24} gap={12}>
  <text>{t("hello", name="Ada")}</text>
  <text>{t("files", n=count)}</text>
  <row gap={8}>
    <button on:click={count += 1}>Add a file</button>
    <button on:click={switch}>Switch language</button>
  </row>
</column>`,
        explanation: [
          'add registers a catalog from a dictionary; load does the same from a folder of JSON files.',
          't is reactive: it reads the active language, so every text updates when set changes it.',
          'files is a plural entry: n chooses zero, one or other.'
        ],
        expected: 'Hello, Ada and No files. Add a file shows 1 file, then 2 files. Switch language shows Hola, Ada and 2 archivos.'
      },
      {
        id: 'how-it-is-built',
        title: 'Built on the public API',
        body: 'janelkit-i18n depends on nothing internal to the core; a repository test checks it. The language and the writing direction come from janelkit.locale, which is public, and t is reactive because it reads it.',
        see: ['build-your-own']
      },
      {
        id: 'versions',
        title: 'Versions and changes',
        body: 'janelkit-i18n shares the series with the core: 0.2.x.x works with janelkit 0.2.x.x, and 0.1.x with janelkit 0.1.x, both with Python 3.10 or later.\n\n0.2.0.0 joins the 0.2 series; its API does not change. In 0.1.0 translations left the core: change from janelkit import t, i18n to from janelkit_i18n import t, i18n.',
        see: ['changes']
      }
    ]
  },
  {
    slug: 'i18n-catalogs',
    title: 'Catalogs',
    description: 'One JSON file per language, with placeholders and plurals, loaded once before the application starts.',
    sections: [
      {
        id: 'catalogs',
        title: 'Write one catalog per language',
        body: 'A catalog is a JSON file named after its language, such as en.json or es.json, inside a folder of your project. Values may contain {placeholders}, filled with the keyword arguments of t. A plural entry is a dictionary with one and other, plus an optional zero; it is chosen with the n parameter.',
        language: 'json',
        code: `{
  "hello": "Hello, {name}",
  "files": {"zero": "No files", "one": "{n} file", "other": "{n} files"}
}`
      },
      {
        id: 'load',
        title: 'Load catalogs once, use them anywhere',
        body: 'Load the catalogs before the application starts, then use t in any component. The fallback language for missing keys is Spanish by default; set i18n.default for an English application.',
        language: 'python',
        code: `# main.py
from pathlib import Path
from janelkit import run
from janelkit_i18n import i18n

if __name__ == "__main__":
    root = Path(__file__).parent
    i18n.load(root / "locales")   # locales/en.json, es.json, ar.json…
    i18n.default = "en"           # fallback for missing keys
    i18n.set("en")
    raise SystemExit(run(root / "src" / "App.janel"))`,
        explanation: [
          'load reads every catalog in the folder. add(language, dict) does the same from Python data.',
          'default is the language used when a key is missing in the active one. If the key is missing there too, the key itself is shown and a warning is logged to the janelkit logger.',
          'set changes the active language. It raises I18nError when there is no catalog for that language.'
        ],
        pitfalls: [
          'Do not change janelkit.locale directly to switch translations; call i18n.set so the catalog is checked first.'
        ]
      }
    ]
  },
  {
    slug: 'i18n-formats',
    title: 'Formats and writing direction',
    description: 'Numbers, currency and dates in the rules of the active language, and interfaces that mirror from right to left.',
    sections: [
      {
        id: 'formats',
        title: 'Format with the rules of the language',
        body: 'The formatting helpers follow the active language through Qt’s QLocale, and they are reactive in templates like t. number(x, decimals) groups thousands and uses the right decimal mark, currency(x, symbol) places the symbol where the language expects it, and date(value, "short" | "long") writes a date or a datetime.',
        language: 'janel',
        code: `<!-- Partial template; the script imports i18n and t from janelkit_i18n,
     and defines total, price and today. -->
<text>{i18n.number(total, 2)} · {i18n.currency(price, "€")} · {i18n.date(today, "long")}</text>`
      },
      {
        id: 'right-to-left',
        title: 'Right-to-left languages',
        body: 'When the active language is written from right to left, such as Arabic, Hebrew or Persian, the whole interface mirrors: rows, text alignment and the indicators of the controls. You do not write anything for it. i18n.rtl, the same as janelkit.locale.rtl, tells you whether the active language is one of them, for the rare case where your own drawing must change.',
        language: 'janel',
        code: `<!-- Partial template: a button that switches to Arabic. -->
<button on:click={i18n.set("ar")}>العربية</button>`,
        see: ['python-api']
      },
      {
        id: 'example',
        title: 'A complete example',
        body: 'apps/examples/idiomas, in the JanelKit repository, switches between Spanish, English and Arabic while running, with plurals, formats and a mirrored layout.'
      }
    ]
  },
  {
    slug: 'i18n-reference',
    title: 'Reference',
    description: 'Every public name of janelkit-i18n.',
    sections: [
      {
        id: 'names',
        title: 'Public names',
        body: 'Import them from janelkit_i18n.',
        table: { headers: ['Name', 'Description'], rows: [
          ['t', 't(key, **params) translates key into the active language. Reactive in templates.'],
          ['i18n', 'Languages and catalogs: load(folder), add(language, dict), set(language), reset(); language and rtl (from janelkit.locale), languages, default (the fallback language, "es"); formats number(x, decimals), currency(x, symbol), date(value, "short" | "long").'],
          ['I18n', 'The type of i18n.'],
          ['I18nError', 'Raised for an invalid catalog or a language without a catalog.']
        ] },
        pitfalls: [
          'Do not import t or i18n from janelkit. Since 0.1.0 they come from janelkit_i18n.'
        ]
      }
    ]
  }
];
