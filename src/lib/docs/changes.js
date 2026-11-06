// Reference · Changes and migration.
// Sources (read-only): JanelKit/docs/cambios.md (0.2.0.0, 0.1.1, 0.1.0), docs/api.md
// (Política de versiones, Paquetes del ecosistema), docs/desarrollo.md (janel migrate) and
// the «Cambios» section of every package README.
export const changesDocs = [
  {
    slug: 'changes',
    title: 'Changes and migration',
    description: 'What changed in JanelKit 0.2, how to move a 0.1 project with janel migrate, and what each version number promises.',
    sections: [
      {
        id: 'migrate',
        title: 'Move a 0.1 project with janel migrate',
        body: 'janel migrate updates a project to the installed version of JanelKit. Without --write it only shows the changes, as a diff; with --write it applies them. With --tests it also updates the templates inside your .py tests and find("Text"). It lists separately what you must review by hand.\n\nFor 0.2 it writes the built-in elements in lowercase (<Text> becomes <text>, also when closing and in the selectors of <style>), without touching the tags of imported components, and moves the imports of navigation to janelkit_router and those of persisted to janelkit_store, adding Pages and Sections to the imports when the template uses them.',
        language: 'shell',
        code: `pip install --upgrade janelkit janelkit-router janelkit-store
janel migrate              # shows the changes as a diff
janel migrate --write --tests`,
        pitfalls: [
          'Install the packages you now need (janelkit-router, janelkit-store) before running the application; janel migrate changes imports, it does not install anything.',
          'The 0.1 names in uppercase still compile in 0.2, with a warning, when the script does not import a component with that name. They stop working in 0.3.'
        ]
      },
      {
        id: 'breaking',
        title: 'What 0.2 changes',
        body: 'Each change that can break existing code, with how to migrate.',
        table: { headers: ['Before', 'Now', 'How to migrate'], rows: [
          ['<Text>, <Button>, <Column>…: built-in elements in uppercase, like components. A component of yours named Button hid <Button>.', 'Built-in elements are lowercase, as in HTML: <text>, <button>, <column>, <textfield>… Uppercase is only for imported components. FORMAT_VERSION is 2.', 'janel migrate --write (with --tests, also the tests).'],
          ['from janelkit import pages, sections, navigation, and <Pages>, <Sections> without imports.', 'They are in janelkit-router, with the same API. The type of sections() is SectionSet. Importing them from janelkit raises an error that says so.', 'pip install janelkit-router; from janelkit_router import pages, navigation, sections, and Pages and Sections if the template uses them. janel migrate does it.'],
          ['from janelkit import persisted, Persisted.', 'They are in janelkit-store, with the same API.', 'pip install janelkit-store; from janelkit_store import persisted. janel migrate does it.'],
          ['from janelkit import History: undo and redo with step() and add().', 'Removed: the core does not include undo and redo. Importing it raises an ImportError that explains this.', 'Record each step as a pair of functions (undo, redo) in a class of your own. The kanban and hoja challenges of the repository have one of about 100 lines that uses only the public API.'],
          ['from janelkit_desktop import notify, the tray icon, app.notifications().', 'Removed from janelkit-desktop, which keeps dialogs and the clipboard.', 'Show a notice inside the window, for example an {#if} with a timeout.'],
          ['pip install janelkit installed all of PySide6, Essentials and Add-ons (about 640 MB on Windows).', 'It installs PySide6-Essentials only (about 200 MB): Qt Quick, the controls and everything JanelKit uses. <video> no longer uses QtMultimedia; each frame is drawn as a Qt Quick texture, with the same API.', 'Nothing, unless your application imports Add-ons modules (QtMultimedia to open cameras, QtCharts, QtWebEngine…): pip install PySide6-Addons.'],
          ['<textfield></textfield>, opened and closed with nothing inside, compiled.', 'It is an error: elements without content are self-closing.', '<textfield ... />.'],
          ['In janelkit.inspect, .text of a textfield or textarea was what was typed, and find(text=...) found the field.', '.text is None in fields, and find(text=...) does not find them.', 'Read what was typed with .value; find the field by placeholder, label or id.'],
          ['<text format="markdown"> applied the HTML in the text.', 'It does not interpret HTML: it is shown as written, and code shows as written.', 'For HTML, format="html". Escaping by hand with &lt; still works and can be removed.']
        ] }
      },
      {
        id: 'new',
        title: 'What 0.2 adds',
        body: 'The new features of the core and the ecosystem, and where each one is explained.',
        table: { headers: ['New', 'Read'], rows: [
          ['janelkit-router and janelkit-store, new packages built only on the public API', 'Ecosystem'],
          ['janelkit.ext hosts (Host, Container, Child, Gate), session(), on_write, own, and components shipped in installed packages', 'Build your own package'],
          ['@computed on methods: each instance gets its own computed', 'Reactivity in depth'],
          ['<window screen={i} fullscreen={bool}>, screens and Screen; open_window(..., single=True)', 'Windows and screens'],
          ['is_visible(), and when= in interval and timeout', 'Timers'],
          ['follow, on:top, on:bottom and on:scroll in <scroll>, and the scroll helpers of its ref', 'Refs and Large lists'],
          ['image_x and image_y in <video> pointer events; frames.stalled and stall_after', 'Video and frames'],
          ['Timer.runs, skipped and last_duration; subscriber_count; repr of Effect and Scope', 'Timers and the Python API'],
          ['janel migrate', 'CLI and tooling']
        ] }
      },
      {
        id: 'fixed',
        title: 'What 0.2 fixes',
        body: 'janelkit.inspect and components whose root is a built-in element: a page that was only <text>other</text> did not appear in app.texts() or find("text"), and click() or value did not work on a component whose root is a <button> or a <textfield>. Now the element is found by both names, find("Other") and find("text"), and is driven as the control it is. Content passed through slots is found and driven the same way.'
      },
      {
        id: 'policy',
        title: 'What each version number promises',
        body: 'A version has four numbers, E.S.M.m, for example 0.2.3.1. The first two are decided by a person; the last two are calculated by the continuous integration from the prefix of each commit.\n\nWhen the series changes, much of the public API may break, and every change is announced with how to migrate and, when possible, janel migrate does it. Within a series, if a major version breaks or removes something public, it is announced with how to migrate and, when viable, the old form keeps working with a warning (a DeprecationWarning or a compiler warning) until the next series. FORMAT_VERSION, the version of the .janel format, only rises when a file that compiled stops compiling or changes meaning; new syntax does not change it.',
        table: { headers: ['Level', 'Rises when…'], rows: [
          ['Stable (#.0.0.0)', 'JanelKit is stable according to its use and community: 1.0.0.0.'],
          ['Series (0.#.0.0)', 'A strong change of architecture or paradigm that breaks, such as 0.2: a smaller core, with navigation and stores in their own packages.'],
          ['Major (0.0.#.0)', 'New public API, something that breaks or is removed, a change of behavior.'],
          ['Minor (0.0.0.#)', 'A fix or improvement that neither adds nor removes API: errors, performance, messages.']
        ] },
        see: ['overview']
      },
      {
        id: 'public',
        title: 'What is public',
        body: 'Only the public API follows this policy: the names exported by janelkit; the listed names of janelkit.compiler, janelkit.diagnostics, janelkit.inspect and janelkit.ext; the .janel format and its supported CSS; the janel commands and their options; the environment variables JANELKIT_DEV, JANELKIT_EXIT_AFTER_MS, JANELKIT_DATA_DIR and QT_QUICK_CONTROLS_STYLE; and jktheme in your own .qml files. Everything else is internal and may change without notice, including the generated QML. Being importable does not make something public.',
        see: ['python-api']
      },
      {
        id: 'older',
        title: 'Earlier versions',
        body: '0.1.1 fixed what the first real project with JanelKit found, a vision application with several cameras: timers and effects created after an await now belong to their component, dataclasses work in a .janel script, a state used as an attribute in the template shows its value and updates, and app.screenshot() and element.screenshot() capture views in tests. 0.1.0 was the first public version.\n\nThe complete history, in Spanish, is docs/cambios.md in the JanelKit repository, and each package lists its own in the Changes section of its README.'
      }
    ]
  }
];
