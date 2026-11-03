// Source: read-only JanelKit README.md, docs/alcance.md and packages/*/README.md,
// cross-checked against packages/janelkit-desktop/src and packages/janelkit-i18n/src.
// The package READMEs are the source of truth; these pages present them in English.
export const packageDocs = [
  {
    slug: 'overview',
    title: 'Core and packages',
    description: 'What ships with janelkit, what the optional packages add, and how to tell them apart.',
    sections: [
      {
        id: 'what-you-already-have',
        title: 'Everything to build an app is already in the core',
        body: 'Installing janelkit gives you the whole framework: the .janel language, the compiler, reactivity, components, every built-in element and control, layout, styles and themes, windows, navigation, async work, persistence, undo, testing tools and the janel command. Button, TextField, List, Tabs, Image, Video and the other elements in templates come from the core. None of them require an extra package.\n\nOptional packages add services that not every application needs. Use this table when you are unsure whether something needs an install.',
        table: { headers: ['I need…', 'It lives in', 'Install'], rows: [
          ['Windows, layout, controls (Button, TextField, List, Tabs, Image, Video…)', 'janelkit (core)', 'Already installed'],
          ['State, computed values, components, navigation, async work, timers', 'janelkit (core)', 'Already installed'],
          ['Saved preferences (persisted), undo and redo (History), themes', 'janelkit (core)', 'Already installed'],
          ['Interface language and right-to-left layout (locale)', 'janelkit (core)', 'Already installed'],
          ['Headless tests (janelkit.inspect) and the janel command', 'janelkit (core)', 'Already installed'],
          ['Native file dialogs, clipboard, system notifications', 'janelkit-desktop', 'pip install janelkit-desktop'],
          ['Translation catalogs, plurals, number, currency and date formats', 'janelkit-i18n', 'pip install janelkit-i18n'],
          ['.janel syntax highlighting in VS Code', 'janelkit-vscode', 'VS Code extension']
        ] }
      },
      {
        id: 'how-the-line-is-drawn',
        title: 'How the line between core and packages is drawn',
        body: 'A feature belongs in the core when an application cannot be written, run or composed without it, when it needs internal details that must stay private, or when everything else relies on its behavior. That is why controls, layout and state management are core.\n\nA feature becomes a package when it can be built entirely on the public API and only some applications need it. Packages never import framework internals, and the core never imports them; the repository tests enforce both rules.\n\nOne split surprises people: the interface language is core, but translations are not. The current language and its writing direction change the layout of every element, so janelkit.locale lives in the core. Catalogs, plurals and formats live in janelkit-i18n, which changes that core language when you switch.',
        pitfalls: [
          'Do not install janelkit-desktop to get controls or windows. It contains only dialogs, clipboard and notifications.',
          'Do not import dialogs, clipboard, notify, t or i18n from janelkit. Since 0.1.0 they are imported from their packages.'
        ]
      },
      {
        id: 'versions',
        title: 'Each package has its own version',
        body: 'Every package is published separately, with its own version number and changelog. Each one declares the range of core versions it supports. During the 0.x series a package 0.1.x works with janelkit 0.1 and requires Python 3.10 or newer. Installing a package installs a compatible core if you do not have one.',
        table: { headers: ['Package', 'Version', 'Works with janelkit', 'Python'], rows: [
          ['janelkit-desktop', '0.1.x', '≥ 0.1, < 0.2', '≥ 3.10'],
          ['janelkit-i18n', '0.1.x', '≥ 0.1, < 0.2', '≥ 3.10'],
          ['janelkit-vscode', '0.1.0', 'Any (editor only)', 'Not required']
        ] }
      },
      {
        id: 'planned',
        title: 'Planned packages are not available yet',
        body: 'The project roadmap mentions more packages. They do not exist yet, so do not install them or generate code that imports them. They are listed here so you know what is coming and do not mistake a plan for a feature.',
        table: { headers: ['Name', 'Intended purpose', 'Status'], rows: [
          ['janelkit-kit', 'Rich components: sortable tables, charts, date pickers, trees, dockable panels', 'Idea'],
          ['janelkit-router', 'Address-based navigation with parameters, forward history, nested routes', 'Idea'],
          ['janelkit-vision', 'Cameras, a frame processing pipeline, capture and recording on top of Video and Frames', 'Planned'],
          ['janelkit-lsp', 'Live diagnostics, completion and go-to-definition in editors', 'Idea'],
          ['janel package', 'Executables and installers from the command line', 'Manual recipe today']
        ] }
      }
    ]
  },
  {
    slug: 'janelkit-desktop',
    title: 'janelkit-desktop',
    origin: 'desktop',
    description: 'Native file dialogs, the system clipboard and notifications, without blocking your window.',
    sections: [
      {
        id: 'what-it-adds',
        title: 'What it adds, and what it does not',
        body: 'janelkit-desktop gives your application three system services: dialogs to open, save and confirm; the clipboard; and system notifications. Dialogs are awaited with await, so the window keeps responding while the user decides.\n\nDespite its name, it is not "the desktop part" of JanelKit. The whole framework is for desktop applications. Windows, layout and every control are in the core. If you are looking for Button, TextField or List, you already have them.',
        language: 'shell',
        code: 'pip install janelkit-desktop'
      },
      {
        id: 'complete-example',
        title: 'A complete example: open and copy a note',
        body: 'This component opens a text file with a native dialog, shows it in an editable area, and copies it to the clipboard with a notification. It uses all three services. Replace src/App.janel in a project where janelkit-desktop is installed.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state, background
from janelkit_desktop import clipboard, dialogs, notify

text = state("")

async def open_note():
    path = await dialogs.open_file("Open note", filters=["Text (*.txt *.md)", "All files (*)"])
    if path is not None:
        text.value = await background(path.read_text, encoding="utf-8")

def copy_note():
    clipboard.copy(text.value)
    notify("Copied", "The note is on the clipboard")
</script>

<Window title="Notes" width={520} height={360}>
  <Column padding={24} gap={12}>
    <Row gap={8}>
      <Button on:click={open_note}>Open…</Button>
      <Button on:click={copy_note} enabled={len(text) > 0}>Copy</Button>
    </Row>
    <TextArea bind:value={text} placeholder="Open a file or type here" label="Note" flex={1} />
  </Column>
</Window>`,
        explanation: [
          'open_note is an async def handler, because dialogs are awaited. The window stays responsive while the dialog is open.',
          'open_file returns a Path, or None if the user cancels. Always check for None before using the result.',
          'Reading the file runs in background so a large file does not freeze the window.',
          'copy_note is an ordinary function: copying to the clipboard and sending a notification do not need to be awaited.'
        ],
        expected: 'Open… shows the system file dialog. Choosing a file fills the text area; canceling leaves it unchanged. Copy is enabled once there is text, places it on the clipboard and shows a system notification titled Copied.'
      },
      {
        id: 'dialogs',
        title: 'Dialogs',
        body: 'Every dialog is asynchronous: call it with await from an async def handler. Dialogs are native where the platform provides them, appear over your window, and close on their own if the component that opened them is unmounted. filters is a list of Qt name filters such as "Images (*.png *.jpg)"; folder sets the starting folder.',
        table: { headers: ['Function', 'Returns', 'When canceled'], rows: [
          ['open_file(title="Abrir", filters=None, folder=None)', 'Path', 'None'],
          ['open_files(title="Abrir", filters=None, folder=None)', 'list[Path]', 'Empty list'],
          ['save_file(title="Guardar", filters=None, folder=None, name=None)', 'Path (name is the suggested file name)', 'None'],
          ['choose_folder(title="Elegir carpeta", folder=None)', 'Path', 'None'],
          ['message(text, title="", details=None)', 'None, once closed', '—'],
          ['confirm(text, title="", details=None)', 'True if accepted', 'False']
        ] },
        pitfalls: [
          'Default titles are Spanish in 0.1. Pass a title explicitly in an English application.',
          'Calling a dialog without await does not show it and returns a coroutine, not a path.'
        ]
      },
      {
        id: 'clipboard',
        title: 'Clipboard',
        body: 'clipboard.copy(text) places text on the system clipboard, clipboard.paste() returns the current text (an empty string when there is none), and clipboard.clear() empties it. paste() is reactive: used in a template, it updates when the clipboard changes, including changes made by other applications. Only text is supported.',
        language: 'janel',
        code: `<!-- Partial template; the script imports clipboard from janelkit_desktop. -->
<Text>On the clipboard: {clipboard.paste()}</Text>`
      },
      {
        id: 'notifications',
        title: 'Notifications',
        body: 'notify(title, message="", *, on_click=None) shows a system notification with a tray icon. When the user clicks it, your window comes to the front and on_click is called. On systems without a tray the notification is not visible, but it is still recorded, so your tests can check it.',
        language: 'python',
        code: `# Partial script: open_inbox is a function in the same script.
from janelkit_desktop import notify

notify("New message", "Ada sent you a file", on_click=open_inbox)`
      },
      {
        id: 'testing',
        title: 'Testing dialogs and notifications',
        body: 'Importing janelkit-desktop adds three methods to the MountedApp of janelkit.inspect, so tests can answer dialogs and read notifications without real windows. This test targets the complete example above.',
        table: { headers: ['Method', 'What it does'], rows: [
          ['app.dialogs()', 'Open dialogs, oldest first.'],
          ['app.answer_dialog(result)', 'Answers the most recent dialog: a path for file and folder dialogs, True to accept or False to cancel.'],
          ['app.notifications()', 'Sent notifications as {"title", "message"} dictionaries, oldest first.']
        ] },
        language: 'python',
        code: `from janelkit import inspect

def test_cancel_keeps_text_and_copy_notifies():
    with inspect.mount("src/App.janel") as app:
        app.find(text="Open…").click()
        app.answer_dialog(False)                 # the user cancels
        app.find("TextArea").type("Hello")
        app.find(text="Copy").click()
        assert app.notifications()[-1]["title"] == "Copied"`
      },
      {
        id: 'migration',
        title: 'Moving from older code',
        body: 'Before 0.1.0 these services were modules of the core. If older code imports them from janelkit, change the import. Nothing else changes. All three services need a running application.',
        language: 'python',
        code: `# Before
from janelkit import dialogs, clipboard, notify
# Since janelkit-desktop 0.1.0
from janelkit_desktop import dialogs, clipboard, notify`
      }
    ]
  },
  {
    slug: 'janelkit-i18n',
    title: 'janelkit-i18n',
    origin: 'i18n',
    description: 'Translate your interface with JSON catalogs, plurals and locale-aware formats, and switch language live.',
    sections: [
      {
        id: 'what-it-adds',
        title: 'What it adds',
        body: 'janelkit-i18n translates the text of your interface. You write one JSON catalog per language, call t("key") in templates, and switch language while the app runs: every translated text updates without a restart. It also formats numbers, currency and dates following the rules of the active language.\n\nThe interface language itself belongs to the core (janelkit.locale), because it controls writing direction. In Arabic, Hebrew or Persian the whole interface mirrors. i18n.set checks that a catalog exists and then changes that core language.',
        language: 'shell',
        code: 'pip install janelkit-i18n'
      },
      {
        id: 'catalogs',
        title: 'Write one catalog per language',
        body: 'A catalog is a JSON file named after its language, such as en.json or es.json, inside a folder of your project. Values may contain {placeholders}. A plural entry is a dictionary with one and other, plus an optional zero; it is chosen with the n parameter.',
        language: 'json',
        code: `{
  "hello": "Hello, {name}",
  "files": {"zero": "No files", "one": "{n} file", "other": "{n} files"}
}`
      },
      {
        id: 'load-and-use',
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
          'default is the language used when a key is missing in the active one. If the key is missing there too, the key itself is shown and a warning is logged.',
          'set changes the active language. It raises I18nError when there is no catalog for that language.'
        ]
      },
      {
        id: 'templates',
        title: 'Translate and format in templates',
        body: 't is reactive: in a template it updates as soon as the language changes, like any state. The formatting helpers follow the active language through Qt.',
        language: 'janel',
        code: `<!-- Partial template; the script imports i18n and t from janelkit_i18n,
     and defines files, total, price and today. -->
<Text>{t("hello", name="Ada")}</Text>
<Text>{t("files", n=len(files))}</Text>
<Text>{i18n.number(total, 2)} · {i18n.currency(price, "€")} · {i18n.date(today, "long")}</Text>
<Button on:click={i18n.set("ar")}>العربية</Button>`,
        expected: 'With English active you see Hello, Ada and, for three files, 3 files. The Arabic button switches every translated text at once and mirrors the layout from right to left.'
      },
      {
        id: 'reference',
        title: 'Reference',
        body: 'The package exports three names.',
        table: { headers: ['Name', 'Description'], rows: [
          ['t(key, **params)', 'Translates key into the active language. Reactive in templates.'],
          ['i18n', 'Languages and catalogs: load(folder), add(language, dict), set(language), reset(); language and rtl (from janelkit.locale), languages, default (fallback language, "es"); formats number(x, decimals), currency(x, symbol), date(value, "short" | "long").'],
          ['I18nError', 'Raised for an invalid catalog or a language without a catalog.']
        ] },
        pitfalls: [
          'Do not import t or i18n from janelkit. Since 0.1.0 they come from janelkit_i18n.',
          'Do not change janelkit.locale directly to switch translations; call i18n.set so the catalog is checked first.'
        ]
      }
    ]
  },
  {
    slug: 'janelkit-vscode',
    title: 'VS Code extension',
    origin: 'vscode',
    description: 'Syntax highlighting, comments, bracket closing and folding for .janel files.',
    sections: [
      {
        id: 'what-it-does',
        title: 'What it does',
        body: 'A .janel file mixes three languages, and the extension colors each one correctly: Python in the script, in {expressions} and in {#if}, {#each}, {#key} and {#hidden} blocks; CSS in style; and the template with its on:, bind:, class: and transition: directives highlighted.\n\nIt also adds <!-- --> comments with Ctrl+/, automatic closing of brackets and quotes, and folding of script, style and {#…} blocks.'
      },
      {
        id: 'install',
        title: 'Install it',
        body: 'Search for JanelKit in the Extensions view of VS Code, or install it from a terminal. VS Code 1.80 or newer is required. The extension does not install JanelKit; to run applications you still need pip install janelkit.',
        language: 'shell',
        code: `code --install-extension janelkit.janelkit-janel

# Or build it from the repository (requires Node.js):
cd packages/janelkit-vscode
npx @vscode/vsce package
code --install-extension janelkit-janel-0.1.0.vsix`
      },
      {
        id: 'errors',
        title: 'Errors are reported by janel, not by the editor',
        body: 'The extension only colors code. It does not complete names or mark errors yet. Run janel dev or janel build to see errors with file, line, column and suggestions; in the integrated terminal of VS Code you can click a location to jump to it. Live diagnostics and completion are planned for a separate janelkit-lsp package.'
      }
    ]
  }
];
