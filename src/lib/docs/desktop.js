// Ecosystem · janelkit-desktop.
// Sources (read-only): JanelKit/packages/janelkit-desktop/README.md and
// src/janelkit_desktop (dialogs.py, clipboard.py). The complete example is compiled and
// mounted against janelkit-desktop 0.2 by scripts/validate_doc_examples.py.
export const desktopDocs = [
  {
    slug: 'desktop',
    title: 'janelkit-desktop',
    description: 'Native file and message dialogs and the system clipboard, awaited without blocking your window.',
    sections: [
      {
        id: 'what-it-adds',
        title: 'What it adds, and what it does not',
        body: 'janelkit-desktop gives your application two system services that almost every desktop application needs: native dialogs to open, save, choose a folder, show a message and confirm; and the clipboard. Dialogs are awaited with await, so the window keeps responding while the user decides, and the result arrives as a Path, a list, a bool or None when the user cancels.\n\nDespite its name, it is not "the desktop part" of JanelKit. The whole framework is for desktop applications: windows, layout and every control are in the core. If you are looking for <button>, <textfield> or <list>, you already have them.'
      },
      {
        id: 'complete-example',
        title: 'In one minute: open and copy a note',
        body: 'Install it next to janelkit with pip install janelkit-desktop. This component opens a text file with a native dialog, shows it in an editable area, and copies it to the clipboard. Replace src/App.janel in a project where janelkit-desktop is installed.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state, background
from janelkit_desktop import clipboard, dialogs

text = state("")

async def open_note():
    path = await dialogs.open_file("Open note", filters=["Text (*.txt *.md)", "All files (*)"])
    if path is not None:
        text.value = await background(path.read_text, encoding="utf-8")

def copy_note():
    clipboard.copy(text.value)
</script>

<window title="Notes" width={520} height={360}>
  <column padding={24} gap={12}>
    <row gap={8}>
      <button on:click={open_note}>Open…</button>
      <button on:click={copy_note} enabled={len(text) > 0}>Copy</button>
    </row>
    <textarea bind:value={text} placeholder="Open a file or type here" label="Note" flex={1} />
    <text>On the clipboard: {clipboard.paste()}</text>
  </column>
</window>`,
        explanation: [
          'open_note is an async def handler, because dialogs are awaited. The window stays responsive while the dialog is open.',
          'open_file returns a Path, or None if the user cancels. Always check for None before using the result.',
          'Reading the file runs in background so a large file does not freeze the window.',
          'clipboard.paste() is reactive, so the last line follows the clipboard, also when another application changes it.'
        ],
        expected: 'Open… shows the system file dialog. Choosing a file fills the text area; canceling leaves it unchanged. Copy is enabled once there is text and places it on the clipboard, and the last line shows it.'
      },
      {
        id: 'how-it-is-built',
        title: 'Built on the public API',
        body: 'janelkit-desktop uses janelkit and janelkit.ext only, nothing internal to the core; a repository test checks it. Its test helpers are added to janelkit.inspect with janelkit.ext.inspector.',
        see: ['build-your-own']
      },
      {
        id: 'versions',
        title: 'Versions and changes',
        body: 'janelkit-desktop shares the series with the core: 0.2.x.x works with janelkit 0.2.x.x, and 0.1.x with janelkit 0.1.x, both with Python 3.10 or later.\n\nIn 0.2.0.0 notifications were removed: notify, the system tray icon and app.notifications() in janelkit.inspect. The package keeps what almost every desktop application needs: file, folder, message and confirmation dialogs, and the clipboard. To tell the user something inside the application, show a notice in the window itself, for example with an {#if} and a timeout. Importing notify raises an error that explains this.\n\nIn 0.1.0 these services left the core: change from janelkit import dialogs, clipboard to from janelkit_desktop import dialogs, clipboard.',
        see: ['changes']
      }
    ]
  },
  {
    slug: 'desktop-dialogs',
    title: 'Dialogs',
    description: 'Open, save, choose a folder, show a message and confirm, with await.',
    sections: [
      {
        id: 'functions',
        title: 'Every dialog is awaited',
        body: 'Call a dialog with await from an async def handler. Dialogs are native where the platform provides them, appear over your window, and close on their own if the component that opened them is destroyed while they are open. filters is a list of Qt name filters such as "Images (*.png *.jpg)"; folder sets the starting folder.',
        table: { headers: ['Function', 'Returns', 'When canceled'], rows: [
          ['open_file(title="Abrir", filters=None, folder=None)', 'Path', 'None'],
          ['open_files(title="Abrir", filters=None, folder=None)', 'list[Path]', 'Empty list'],
          ['save_file(title="Guardar", filters=None, folder=None, name=None)', 'Path (name is the suggested file name)', 'None'],
          ['choose_folder(title="Elegir carpeta", folder=None)', 'Path', 'None'],
          ['message(text, title="", details=None)', 'None, once closed', '—'],
          ['confirm(text, title="", details=None)', 'True if accepted', 'False']
        ] },
        pitfalls: [
          'The default titles are Spanish. Pass a title explicitly in an English application.',
          'Calling a dialog without await does not show it and returns a coroutine, not a path.'
        ]
      },
      {
        id: 'confirm',
        title: 'Ask before something irreversible',
        body: 'confirm shows OK and Cancel and returns True only when the user accepts. Together with before_leave, from the core, it asks before a window closes or, with janelkit-router, before a page is left.',
        language: 'python',
        code: `# In a component script; items and selected are states of yours.
from janelkit_desktop import dialogs

async def delete():
    if await dialogs.confirm("Delete the selected note?", details="This cannot be undone."):
        items.value.remove(selected.value)`,
        see: ['windows', 'router-leaving']
      }
    ]
  },
  {
    slug: 'desktop-clipboard',
    title: 'Clipboard',
    description: 'Copy, paste and clear text, with a paste() that follows the system clipboard.',
    sections: [
      {
        id: 'clipboard',
        title: 'Copy, paste and clear',
        body: 'clipboard.copy(text) places text on the system clipboard, clipboard.paste() returns the current text (an empty string when there is none), and clipboard.clear() empties it. paste() is reactive: used in a template, it updates when the clipboard changes, including changes made by other applications. Only text is supported, and every function needs a running application.',
        language: 'janel',
        code: `<!-- Partial template; the script imports clipboard from janelkit_desktop. -->
<text>On the clipboard: {clipboard.paste()}</text>
<button on:click={clipboard.copy(order_id)}>Copy the order number</button>`
      },
      {
        id: 'selectable-text',
        title: 'Or let the user select the text',
        body: 'For text the user may want to copy by hand, such as an order number or an error message, the core already has <text selectable>: it is selected with the mouse or Ctrl+A and copied with Ctrl+C, without this package.',
        see: ['elements']
      }
    ]
  },
  {
    slug: 'desktop-testing',
    title: 'Testing dialogs',
    description: 'Answer dialogs in headless tests, without real windows.',
    sections: [
      {
        id: 'answer',
        title: 'Answer the dialog the user would see',
        body: 'Importing janelkit-desktop adds two methods to the MountedApp of janelkit.inspect, so tests can answer dialogs without real windows. Your application imports the package, so the methods are there in its tests. This test targets the example in Overview.',
        table: { headers: ['Method', 'What it does'], rows: [
          ['app.dialogs()', 'Open dialogs, oldest first.'],
          ['app.answer_dialog(result)', 'Answers the most recent dialog: a path for file and folder dialogs, True to accept or False to cancel.']
        ] },
        language: 'python',
        code: `from janelkit import inspect

def test_cancel_keeps_the_text():
    with inspect.mount("src/App.janel") as app:
        app.find("textarea").type("Hello")
        app.find(text="Open…").click()
        app.answer_dialog(False)                 # the user cancels
        assert app.find("textarea").value == "Hello"`,
        explanation: [
          'The click opens a real dialog object, without showing a native window in a headless test.',
          'answer_dialog(False) cancels it, so open_file returns None and the text stays.'
        ]
      },
      {
        id: 'kinds',
        title: 'Which dialog is open',
        body: 'dialogs.pending() lists the dialogs open now, and dialogs.kind(d) says the type of one: "MessageDialog", "FileDialog" or "FolderDialog". Use them to check that the right dialog opened before answering it.'
      },
      {
        id: 'examples',
        title: 'Examples',
        body: 'In the JanelKit repository, apps/examples/files chooses a folder, apps/challenges/gestor asks for confirmations, and apps/challenges/hoja opens and saves CSV files and uses the clipboard.'
      }
    ]
  }
];
