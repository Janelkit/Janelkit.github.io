// Ecosystem · overview and extension points.
// Sources (read-only): JanelKit/docs/arquitectura.md (Qué va en el núcleo, Paquetes del
// repositorio, Lo que el núcleo ofrece a las extensiones), docs/api.md (janelkit.ext,
// Paquetes del ecosistema) and the README of every package.
export const ecosystemDocs = [
  {
    slug: 'overview',
    title: 'The JanelKit ecosystem',
    description: 'What ships with janelkit, what each package adds, and how they fit together.',
    sections: [
      {
        id: 'what-you-already-have',
        title: 'Everything to build a one-screen app is in the core',
        body: 'pip install janelkit gives you the .janel language and its compiler, reactivity, components, every built-in element and control, layout, styles and themes, windows and screens, async work and timers, video, headless testing and the janel command. A one-screen application needs nothing else.\n\nThe packages add what not every application needs. Each one is installed on its own, documented in its own section here, and uses only the public API of the core, like a package you could write yourself.',
        table: { headers: ['I need…', 'It lives in', 'Install'], rows: [
          ['Windows, layout, controls (<button>, <textfield>, <list>, <tabs>, <image>, <video>…)', 'janelkit (core)', 'Already installed'],
          ['State, computed values, components, async work, timers, several windows and screens', 'janelkit (core)', 'Already installed'],
          ['Interface language and right-to-left layout (locale), themes', 'janelkit (core)', 'Already installed'],
          ['Headless tests (janelkit.inspect) and the janel command', 'janelkit (core)', 'Already installed'],
          ['Several screens in one window: page stacks with Back, a sidebar with sections', 'janelkit-router', 'pip install janelkit-router'],
          ['Data shared by several views or windows, remembered between sessions', 'janelkit-store', 'pip install janelkit-store'],
          ['Native file and message dialogs, the clipboard', 'janelkit-desktop', 'pip install janelkit-desktop'],
          ['Translation catalogs, plurals, number, currency and date formats', 'janelkit-i18n', 'pip install janelkit-i18n'],
          ['.janel syntax highlighting in VS Code', 'janelkit-vscode', 'VS Code extension']
        ] }
      },
      {
        id: 'how-the-line-is-drawn',
        title: 'How the line between core and packages is drawn',
        body: 'A feature belongs in the core when an application cannot be written, run or composed without it, when it needs internal details that must stay private, or when everything else relies on its behavior. That is why controls, layout and reactivity are core: like HTML elements, the controls are what the platform gives you.\n\nA feature becomes a package when it can be built entirely on the public API and only some applications need it. Packages never import framework internals, and the core never imports them; the repository tests enforce both rules.\n\nOne split surprises people: the interface language is core, but translations are not. The current language and its writing direction change the layout of every element, so janelkit.locale lives in the core. Catalogs, plurals and formats live in janelkit-i18n, which changes that core language when you switch.',
        pitfalls: [
          'Do not install janelkit-desktop to get controls or windows. It contains only dialogs and the clipboard.',
          'Do not import pages, persisted, dialogs, clipboard, t or i18n from janelkit. They come from janelkit_router, janelkit_store, janelkit_desktop and janelkit_i18n.'
        ]
      },
      {
        id: 'names',
        title: 'Lowercase is the core, uppercase is imported',
        body: 'In a template, a lowercase tag is something the core gives you: <text>, <button>, <column>. A tag with a capital letter is something your script imports, whether it comes from your project or from a package: <TodoItem>, <Pages>. So a package can add elements without ever clashing with the core’s, and you always know where a tag comes from by reading the script.'
      },
      {
        id: 'versions',
        title: 'One series for every package',
        body: 'A version has four numbers, E.S.M.m. The packages share the series with the core, the first two numbers: janelkit-router 0.2.x.x works with janelkit 0.2.x.x, and each package declares it (janelkit>=0.2,<0.3). When the series changes, every package moves to it, even without changes of its own, so compatibility shows in the number. The last two numbers belong to each package and follow the same policy for its own API. The continuous integration tests every package against the core of the same branch, so no core version that breaks a package of the repository is published.',
        table: { headers: ['Package', 'Version', 'Works with janelkit', 'Python'], rows: [
          ['janelkit-router', '0.2.x.x', '≥ 0.2, < 0.3', '≥ 3.10'],
          ['janelkit-store', '0.2.x.x', '≥ 0.2, < 0.3', '≥ 3.10'],
          ['janelkit-desktop', '0.2.x.x', '≥ 0.2, < 0.3', '≥ 3.10'],
          ['janelkit-i18n', '0.2.x.x', '≥ 0.2, < 0.3', '≥ 3.10'],
          ['janelkit-vscode', '0.1.0', 'Any (editor only)', 'Not required']
        ] },
        see: ['changes']
      }
    ]
  },
  {
    slug: 'build-your-own',
    title: 'Build your own package',
    description: 'The public extension points of the core: the same ones janelkit-router, janelkit-store and janelkit-desktop are built with.',
    sections: [
      {
        id: 'rules',
        title: 'The rules every package follows',
        body: 'The packages of the ecosystem have no private access to the core. Everything they do, a package of yours can do too, with three rules.',
        steps: [
          'Use only the public API: the names exported by janelkit, and those of janelkit.compiler, janelkit.diagnostics, janelkit.inspect and janelkit.ext. Being importable does not make a module public.',
          'Share the series: version your package E.S.x.x and require the same series of the core, such as janelkit>=0.2,<0.3.',
          'Never make the core depend on you: an application that does not install your package must not notice it.'
        ],
        see: ['python-api']
      },
      {
        id: 'components',
        title: 'Ship components and elements',
        body: 'An installed package can ship .janel components and .qml elements in its Python package folder. Applications import them by the package name, like any component: from my_package import Card uses Card.janel (or Card.qml) from the folder of my_package when it is not in the project’s src/. janel build writes their QML in build/qml/_paquetes/. Write them with a capital letter in templates, as every imported tag.',
        language: 'python',
        code: `# my_package/__init__.py ships Card.janel next to it.
# In an application:
from my_package import Card      # then <Card title="Hello" /> in the template`
      },
      {
        id: 'hosts',
        title: 'Mount components from Python: hosts',
        body: 'A .qml element whose root is a JkDeck (import Janel) shows one of its children at a time and grows to fill its place. If it also declares a property JkHost name, then <Element name={obj} /> hands the element to obj, a janelkit.ext.Host, which mounts components inside it. This is how <Pages> and <Sections> of janelkit-router are made.',
        table: { headers: ['Name', 'What it is'], rows: [
          ['Host', 'Base of a host. obj.attach(container) is called when the element exists, and obj.detach(container) when it is destroyed.'],
          ['Container', 'What attach receives: item (the Qt object), visibility (the gate of where it is, or None), mount(Component, visibility=None, context=None, **props_and_on_events) and nested(item).'],
          ['Child', 'What mount returns: name, instance (its namespace), item, visibility, leave_guards() and dispose().'],
          ['Gate', 'A visibility gate: Gate(parent=None), set_open(bool), reactive visible. While it, or one outside it, is closed, what its components show waits, and is_visible() reads it.'],
          ['ask_to_leave', 'ask_to_leave(guards, proceed, refuse=None) asks the before_leave guards in order and calls proceed if none returns False.'],
          ['is_component', 'is_component(value): whether value is a component imported from a .janel, what mount and open_window accept.']
        ] }
      },
      {
        id: 'session-and-writes',
        title: 'Keep data per application: session and writes',
        body: 'Data that belongs to an application, not to the Python process, lives in its session: one per run() and a new one per inspect.mount(), each with its own data folder, so a test never sees what the previous one left. To know who changes what, a package can watch every state write before it happens. This is how janelkit-store is made.',
        table: { headers: ['Name', 'What it is'], rows: [
          ['session / Session', 'session() returns the running application’s session, or None: name, data_dir, data (a dictionary for packages, one key each) and on_end(fn).'],
          ['on_write', 'on_write(fn) calls fn(target, owner, before) just before every state write; if fn raises, the write does not happen. Returns a function that removes it. Costs nothing while nobody listens.'],
          ['own', 'own(target, owner) marks a State or reactive collection, and everything inside it, as belonging to owner; what is inserted later inherits it.'],
          ['Scope', 'A scope for what belongs to no component: Scope(); with scope.active(): makes what is created inside its own; dispose() releases it all.'],
          ['__jk_bind__', 'If the attribute at the end of bind:value={obj.field} is managed by a descriptor that defines __jk_bind__(self, obj, value), bind: writes through it and may refuse.'],
          ['app', 'app() returns the running application, or None: engine (the QQmlEngine), qt_app and main_window().']
        ] }
      },
      {
        id: 'tests-and-commands',
        title: 'Extend tests and the janel command',
        body: '@inspector("name") on fn(app, *args) adds the method MountedApp.name to janelkit.inspect; janelkit-desktop adds dialogs() and answer_dialog() this way, and janelkit-store adds store() and mutations().\n\nA package declares janel subcommands as entry points of the janelkit.commands group. The entry point’s name is the command’s, and it points at configure(parser), which adds its arguments and sets parser.set_defaults(func=run); run(args) returns the exit code, and the first line of configure’s docstring is the help. A plugin that fails to load, or tries to redefine a JanelKit command, is ignored with a warning.',
        language: 'shell',
        code: `# pyproject.toml of your package
[project.entry-points."janelkit.commands"]
package = "janelkit_package.cli:configure"`
      }
    ]
  }
];
