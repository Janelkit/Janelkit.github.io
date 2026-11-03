// Guide · Part 5 · Under the hood.
// Sources (read-only): JanelKit/README.md (Cómo funciona), docs/lenguaje.md and
// packages/janelkit/src/janelkit (compiler, runtime, qt_backend).
export const internalsDocs = [
  {
    slug: 'how-it-works', title: 'How it works',
    description: 'Follow a .janel file from source to window, and one click from the mouse to the updated screen.',
    learn: [
      'The stages a .janel file goes through before a window appears.',
      'Which parts run in Python and which in Qt.',
      'What happens, step by step, between a click and the updated text.',
      'How to inspect each stage when something goes wrong.'
    ],
    sections: [
      {
        id: 'overview',
        title: 'The whole journey in one picture',
        body: 'You can build applications without knowing any of this. It becomes useful when you need to understand an error, a performance question or why a value did not update. The journey has two halves: compiling the file once, and running it while the window is open.',
        table: { headers: ['Stage', 'What happens', 'Where'], rows: [
          ['1. Parse', 'The file is split into script, template and style, and the template becomes a tree with source locations.', 'Compiler (Python)'],
          ['2. Analyze and lower', 'Names are checked, imported components are found, and the tree becomes an intermediate representation.', 'Compiler (Python)'],
          ['3. Generate', 'QML for Qt Quick is generated, plus tables describing bindings, handlers and dynamic regions.', 'Compiler (Python)'],
          ['4. Run the script', 'Each component instance runs its script once and gets its own namespace.', 'Runtime (Python)'],
          ['5. Bind and draw', 'Every {expression} is evaluated in Python; Qt Quick draws the controls from the generated QML.', 'Runtime and Qt'],
          ['6. React', 'Input arrives, handlers change state, and only the affected bindings are recalculated.', 'Runtime and Qt']
        ] }
      },
      {
        id: 'compile-and-render',
        title: 'Compilation and evaluation are different jobs',
        body: 'The compiler checks the component, analyzes its script and lowers the template into an intermediate representation: a description convenient for generating the interface. It produces QML plus tables that tell the Python runtime about bindings, handlers and dynamic regions. Imported .janel components are resolved and compiled too. QML is generated interface machinery, not a translation of your Python application logic into JavaScript.\n\nQt Quick loads the generated QML and draws the controls. Meanwhile, the Python runtime evaluates template expressions and executes your functions. A bridge exposes the resulting values to Qt through properties that announce changes. This division explains why you can inspect generated QML without needing to write QML to build an ordinary app.'
      },
      {
        id: 'instances',
        title: 'Creation runs the script once',
        body: 'Creating an instance executes its script in a fresh namespace, the collection of names belonging to that instance, then activates its bindings. Defining a function does not execute its body; a later event calls it.\n\nOne component file can describe many instances with independent state. Removing a child through a conditional and showing it again creates a new instance and reruns its script. An ordinary click that changes state does not.'
      },
      {
        id: 'update-cycle',
        title: 'Trace one click through the event loop',
        body: 'An event loop waits for work such as keyboard input, pointer input and timers, then dispatches it to the appropriate code. Qt supplies that loop; JanelKit integrates asynchronous Python work through qasync. A button click reaches the Python handler through the bridge. The handler changes state, and the bindings that read that state become candidates for recalculation. The affected bridge properties notify Qt, which updates the visible result.\n\nChanges made by an event handler are batched, meaning they are grouped instead of treating every assignment as an unrelated interface update. You do not need a manual redraw call. A long blocking function still prevents the interface thread from processing input; automatic reactivity does not turn slow synchronous work into background work.',
        explanation: [
          'Qt receives the mouse click and finds the Button under the pointer.',
          'The bridge calls the Python handler connected with on:click.',
          'The handler writes count.value; every binding that read count is marked for recalculation.',
          'When the handler returns, the batch ends: each affected binding is evaluated once in Python.',
          'Only the bridge properties whose values changed notify Qt, which redraws those controls.'
        ],
        pitfalls: [
          'Do not add your own infinite while loop to keep the window alive; run already runs the event loop.',
          'Do not put slow disk or network work directly in a click handler and expect the window to remain responsive.',
          'Do not expect a state update to execute the entire component script again.'
        ]
      },
      {
        id: 'inspect-pipeline',
        title: 'Inspect one layer at a time',
        body: 'janel parse shows the parsed tree or the structural errors, with line and column; janel compile shows the generated QML. janel build validates every component of the project and writes the QML to build/qml, but does not produce an executable. You still need to run the application to exercise its behavior.\n\nEach layer catches different mistakes. Parsing checks structure: unclosed tags, misplaced blocks. Compiling also checks meaning: unknown elements, properties and names. Try it: misspell Button as Buton in the counter, run parse, then compile.',
        language: 'shell', code: `janel parse src/App.janel
janel compile src/App.janel
janel build`,
        expected: 'With Buton, parse still prints the tree, because the structure is valid. compile stops with an error at the exact line and column and suggests <Button>. In version 0.1 diagnostics are written in Spanish: error: elemento desconocido <Buton> … sugerencia: ¿quisiste decir <Button>?',
        pitfalls: [
          'A successful parse does not mean the file is correct; compile or build checks much more.',
          'Generated QML is machinery, not a file to edit or depend on. Your template is the source.'
        ],
        see: ['cli', 'troubleshooting']
      }
    ],
    summary: [
      'The compiler turns a .janel file into QML plus binding tables; your logic stays in Python.',
      'Each instance runs its script once; clicks call handlers and update only affected bindings.',
      'janel parse, compile and build let you inspect each stage.'
    ]
  }
];
