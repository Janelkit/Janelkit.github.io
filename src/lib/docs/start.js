// Guide · Part 1 · Start.
// Sources (read-only): JanelKit/README.md, docs/lenguaje.md (Secciones, El script),
// docs/tutorial.md, docs/desarrollo.md, packages/janelkit/pyproject.toml and the
// starter template in packages/janelkit/src/janelkit/templates/starter/.
export const startDocs = [
  {
    slug: 'introduction',
    title: 'What is JanelKit?',
    description: 'A Python framework for desktop applications: what it does, what it is not, and the pieces every app is made of.',
    learn: [
      'What JanelKit is for and who it is written for.',
      'The pieces of every JanelKit application, and which ones you write.',
      'What JanelKit is not, so familiar-looking syntax does not mislead you.'
    ],
    sections: [
      {
        id: 'what-it-is',
        title: 'A framework for desktop windows, written in Python',
        body: 'A graphical user interface, or GUI, lets people use a program through windows, buttons and text fields instead of typing commands. JanelKit is a framework for building those interfaces in Python. A framework is a library plus a structure: it handles drawing, input and updates, and you describe what your application contains and what it should do.\n\nThe applications are desktop programs for Windows, macOS and Linux. They are not websites and do not run in a browser. You describe each window in a .janel file and write its behavior in ordinary Python, so you can use any Python library you already know.'
      },
      {
        id: 'the-pieces',
        title: 'Every app has five pieces; you write three',
        body: 'Each piece has one job. You write the logic, the template and, optionally, the styles. JanelKit and Qt do the rest. Keeping these jobs apart is what makes a JanelKit file easy to read: data and functions in one place, the visible structure in another, appearance in a third.',
        table: { headers: ['Piece', 'Its job', 'Who writes it'], rows: [
          ['Script (Python)', 'Holds the data and the functions: what the window knows and what happens on a click.', 'You'],
          ['Template', 'Describes what the window contains: which elements, in which order, showing which data.', 'You'],
          ['Styles', 'Describe how it looks: spacing, colors, sizes. Optional.', 'You'],
          ['JanelKit', 'Compiles your file, runs your Python and keeps the window in step with your data.', 'Provided'],
          ['Qt Quick (through PySide6)', 'Draws the window and its controls and delivers keyboard and mouse input.', 'Provided']
        ] }
      },
      {
        id: 'first-look',
        title: 'A first look at a .janel file',
        body: 'This is a complete JanelKit component: a window with a sentence and a button that counts clicks. Read it from top to bottom. You do not need to understand every line yet; the next chapters run it and explain each part.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
count = state(0)
</script>

<Window title="Hello, JanelKit" width={480} height={320}>
  <Column class="page">
    <Text>You clicked {count} times.</Text>
    <Button variant="primary" on:click={count += 1}>Increment</Button>
  </Column>
</Window>

<style>
.page { padding: 24px; gap: 16px; }
</style>`,
        explanation: [
          'The script is Python. state(0) creates a number the window watches; the name count refers to it.',
          'The template describes the window: a Column (a vertical stack) containing a Text and a Button.',
          '{count} inside the text shows the current number. When count changes, the sentence updates by itself.',
          'on:click={count += 1} says what happens when the button is clicked: add one to count.',
          'The style section gives the Column some inner space (padding) and space between its children (gap).'
        ],
        expected: 'A desktop window titled Hello, JanelKit shows You clicked 0 times. and an Increment button. Each click increases the number.',
        see: ['first-app', 'anatomy']
      },
      {
        id: 'not-a-browser',
        title: 'What JanelKit is not',
        body: 'Some of the syntax looks like the web, because it borrows ideas that work well there: tags in angle brackets, a style section, values in braces. The meaning is different, and assuming otherwise causes most early mistakes.\n\nThe tags are desktop elements, not HTML: <Button> is a JanelKit control and <div> does not exist. Expressions in braces are Python, not JavaScript. Styles are a supported subset of CSS-like properties, not a full browser stylesheet. You never write JavaScript or QML, the language Qt uses to describe interfaces; JanelKit generates the QML internally.',
        pitfalls: [
          'Do not reach for HTML tags or attributes; use the built-in elements and their documented properties.',
          'Write Python inside braces: True and False, and, or, not, len(items). JavaScript operators such as === and && are errors.',
          'Do not paste browser CSS and expect it all to work; unsupported properties produce a warning and are ignored.'
        ]
      },
      {
        id: 'before-you-start',
        title: 'What you need, and what to know before you start',
        body: 'You need Python 3.10 or newer, and you should be comfortable reading basic Python: variables, functions, lists, dictionaries and imports. No web, HTML or CSS experience is required.\n\nJanelKit is in alpha (version 0.1). During the 0.x series a minor version may change the public API; every change comes with migration notes. A .janel script is ordinary Python and runs with your program’s permissions: there is no sandbox, so never open a .janel file you do not trust.',
        see: ['installation']
      }
    ],
    summary: [
      'JanelKit builds desktop applications in Python; it is not a web framework.',
      'You write a script (data and functions), a template (what the window contains) and optional styles.',
      'Braces hold Python expressions, tags are desktop elements, and styles are a CSS-like subset.'
    ]
  },
  {
    slug: 'installation',
    title: 'Installation',
    description: 'Prepare Python, install JanelKit in a virtual environment, and check that everything works.',
    learn: [
      'Why to use a virtual environment and how to create one.',
      'What pip install janelkit installs, including the janel command.',
      'How to check the installation and fix the most common problem.'
    ],
    sections: [
      {
        id: 'virtual-environment',
        title: 'Create a virtual environment',
        body: 'A virtual environment is a private folder of Python packages for one project, so the versions it needs do not collide with other projects. Create it once, then activate it every time you open a new terminal to work on the project. While it is active, python and pip refer to that environment.',
        language: 'shell',
        code: `python -m venv .venv

# Windows
.venv\\Scripts\\activate
# Linux / macOS
source .venv/bin/activate`,
        expected: 'The terminal prompt now starts with (.venv). If you open a new terminal later, run the activate line again.',
        explanation: [
          'python -m venv .venv creates the environment in a folder named .venv inside your project.',
          'Activating changes the current terminal only: python and pip now point inside .venv.',
          'Packages installed now stay inside .venv and do not affect other projects.'
        ]
      },
      {
        id: 'install',
        title: 'Install JanelKit',
        body: 'Install the janelkit package with pip. It brings two dependencies: PySide6, the official Python binding for Qt, which draws the windows; and qasync, which lets asynchronous Python code run alongside Qt. It also installs the janel command, which creates and checks projects.\n\nEverything the Guide teaches is in this one package, including every built-in control. Optional packages exist for dialogs, translations and editor support, but you do not need them to start.',
        language: 'shell',
        code: 'pip install janelkit',
        see: ['overview']
      },
      {
        id: 'check',
        title: 'Check that it works',
        body: 'Two quick checks confirm that Python can import the framework and that the janel command is available in this terminal.',
        language: 'shell',
        code: `python -c "import janelkit; print(janelkit.__version__)"
janel --version`,
        expected: 'Both commands print the installed version, such as 0.1.0. janel --help lists the commands: new, parse, compile, dev and build (in version 0.1 their descriptions are in Spanish).',
        pitfalls: [
          'janel: command not found usually means the virtual environment is not active in this terminal. Activate it and try again.',
          'If import janelkit fails but pip said it installed, you probably installed into a different Python. Use python -m pip install janelkit with the same python you run.'
        ]
      },
      {
        id: 'editor',
        title: 'Optional: color .janel files in your editor',
        body: 'Any text editor works. In Visual Studio Code, the JanelKit extension colors the three languages of a .janel file (Python, the template and the styles) and adds comment, bracket and folding support. It only colors code; errors are reported by the janel command.',
        see: ['janelkit-vscode']
      }
    ],
    summary: [
      'Work inside an activated virtual environment.',
      'pip install janelkit installs the framework, PySide6, qasync and the janel command.',
      'Check with import janelkit and janel --help before creating a project.'
    ]
  },
  {
    slug: 'first-app',
    title: 'Your first app',
    description: 'Create a project, understand its files, write a counter, run it, and change it while it runs.',
    learn: [
      'How to create and run a project with janel new and python main.py.',
      'What each file in a new project is for.',
      'How main.py starts the application.',
      'How to write, run and check a complete component.',
      'How janel dev reloads your changes while you work.'
    ],
    sections: [
      {
        id: 'create-project',
        title: '1. Create a project',
        body: 'Run these commands in a terminal, with your virtual environment active. janel new creates a folder with a working starter application. cd moves into it. python main.py runs the application.\n\nThe starter is a small demo: a greeting that uses what you type, a click counter and a theme button. In version 0.1 its texts are in Spanish; that is only the sample content.',
        language: 'shell',
        code: `janel new first-counter
cd first-counter
python main.py`,
        expected: 'A window opens with a greeting, a text field, a Clicks counter and a button to switch between light and dark theme. Close it before continuing.',
        pitfalls: [
          'janel new refuses to write into a folder that already has files. Choose a new name instead of deleting an existing project.',
          'Run python main.py from the project folder, the one that contains main.py, not from src.'
        ]
      },
      {
        id: 'project-files',
        title: '2. Know what each file is for',
        body: 'Open the folder in your editor. You will spend almost all your time in src. Its folder is added to Python’s import path, so a component can import from services or components by name.',
        table: { headers: ['Path', 'What it is for'], rows: [
          ['main.py', 'Starts the application. You rarely change it.'],
          ['src/App.janel', 'The root component: the main window of your application.'],
          ['src/components/', 'Smaller reusable components. The starter has Counter.janel.'],
          ['src/pages/', 'Screens used with navigation. Empty at first.'],
          ['src/services/', 'Ordinary Python modules without interface, such as users.py. Business logic belongs here.'],
          ['assets/', 'Images and other files your application uses.'],
          ['pyproject.toml, README.md, .gitignore', 'Project metadata, notes and version-control settings.']
        ] }
      },
      {
        id: 'main-py',
        title: '3. How main.py starts everything',
        body: 'A desktop program needs a starting point, just like a script. main.py calls run with the path of the root component. run compiles it, opens its window and then waits for clicks and key presses until the user closes the window. It returns an exit code, which SystemExit hands back to the operating system.',
        language: 'python', file: 'main.py',
        code: `from pathlib import Path

from janelkit import run

if __name__ == "__main__":
    raise SystemExit(run(Path(__file__).parent / "src" / "App.janel"))`,
        explanation: [
          'Path(__file__).parent is the folder that contains main.py, so the path works no matter which folder the terminal is in.',
          'The __main__ guard runs the application only when this file is executed directly.',
          'run keeps the process alive while the window is open. You never write your own loop to keep a window on screen.'
        ]
      },
      {
        id: 'write-counter',
        title: '4. Replace App.janel with a counter',
        body: 'Replace the whole content of src/App.janel with the component below. Replacing only part of it can leave two scripts or two roots, which is an error. The starter files in components and services can stay; this counter does not import them.\n\nThe counter has two buttons. Reset is disabled while the count is zero; that rule is written once, as an expression, instead of being updated by hand.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state

count = state(0)

def increment():
    count.value += 1

def reset():
    count.value = 0
</script>

<Window title="My first counter" width={420} height={260}>
  <Column class="page">
    <Text>You clicked {count} times.</Text>
    <Row class="actions">
      <Button variant="primary" on:click={increment}>Increment</Button>
      <Button on:click={reset} enabled={count > 0}>Reset</Button>
    </Row>
  </Column>
</Window>

<style>
.page { padding: 24px; gap: 16px; }
.actions { gap: 8px; }
</style>`,
        explanation: [
          'count = state(0) creates the number once, when the window is created.',
          'increment and reset are ordinary Python functions. Inside Python you read and write the number through count.value.',
          'In the template you write count, not count.value: JanelKit reads the value for you.',
          'on:click={increment} connects the button to the function. Defining a function does not run it; the click does.',
          'enabled={count > 0} is recalculated whenever count changes, so Reset turns on and off by itself.',
          'Row places the two buttons side by side; Column stacks the sentence above them.'
        ],
        see: ['state', 'events']
      },
      {
        id: 'run-and-check',
        title: '5. Run it and check every behavior',
        body: 'Run the application again from the project folder. Do not stop at "a window appeared": click each button and check the result. That is how you know the event connections and the data both work.',
        language: 'shell',
        code: 'python main.py',
        steps: [
          'Check the title is My first counter, the sentence says 0 and Reset is disabled.',
          'Click Increment twice. The sentence changes after each click and Reset becomes enabled.',
          'Click Reset. The sentence returns to 0 and Reset is disabled again.',
          'Close and reopen the application. It starts at 0: ordinary state lives in memory, not on disk.'
        ],
        expected: 'You clicked 0 times. at first; You clicked 2 times. after two clicks; back to 0 after Reset, with Reset disabled.'
      },
      {
        id: 'dev-mode',
        title: '6. Work faster with janel dev',
        body: 'janel dev runs the application and watches your files. Saving a .janel file reloads its view in place; a component whose script did not change keeps its state, so you can adjust the layout without clicking back to where you were. Saving a .py file restarts the application. If an edit has an error, the error is printed and the last working view stays open.',
        language: 'shell',
        code: 'janel dev',
        steps: [
          'Start janel dev, click Increment a few times, then change the window title and save. The title changes; the count is kept.',
          'Change increment to add 2 and save. The script changed, so the component restarts from 0 with the new rule.'
        ],
        pitfalls: [
          'Keeping state during a reload is a development convenience, not saving. To test initial values, restart the application.'
        ],
        see: ['cli']
      },
      {
        id: 'extend',
        title: '7. Practice: add a Decrement button',
        body: 'Add a Decrement button that never takes the count below zero. Write the rule in a new function in the existing script and add one more Button inside the Row. Do not add a second script or a second Window.\n\nIf something fails, read the terminal: errors give the file, line and column, and often suggest the name you meant. Compilation catches structural mistakes such as a misspelled element; an error inside a function only appears when that function runs.',
        pitfalls: [
          'In Python functions write count.value; in the template write count.',
          'A function that is never connected with on:click never runs.',
          'If an edit seems ignored, check that you saved the file in the project you are actually running.'
        ]
      }
    ],
    summary: [
      'janel new creates a project; python main.py runs it; janel dev reloads it as you work.',
      'Your code lives in src: App.janel is the main window, components and services hold the rest.',
      'Test behavior, not just startup: click everything and check what changes.'
    ]
  },
  {
    slug: 'anatomy',
    title: 'Anatomy of a .janel file',
    description: 'The three sections of a component, the rules each one follows, and how the template forms a tree.',
    learn: [
      'The three sections of a .janel file and which ones are required.',
      'When the script runs, and what it may contain.',
      'How the template forms a tree with a single root.',
      'Where Window may and may not be used.'
    ],
    sections: [
      {
        id: 'three-sections',
        title: 'One file, up to three sections',
        body: 'A .janel file describes one component: a named piece of interface together with its logic. It has up to three sections, in any order. Only the template is required. Keeping logic, structure and appearance in separate sections lets you read each one on its own.',
        table: { headers: ['Section', 'Required', 'Rules'], rows: [
          ['<script lang="python"> … </script>', 'No', 'At most one. lang is optional and only python is accepted.'],
          ['Template', 'Yes', 'Everything outside script and style. It must have exactly one root element.'],
          ['<style> … </style>', 'No', 'At most one. A supported subset of CSS-like properties.']
        ] }
      },
      {
        id: 'script',
        title: 'The script runs once per instance',
        body: 'An instance is one use of a component. When an instance is created, its script runs once, in a fresh namespace of its own. Two instances of the same component never share their local state. Clicks and other updates do not run the script again; they call the functions it defined.\n\nThe script is ordinary Python. It can import any library and any module of your project: the src folder is on the import path, so from services.users import display_name works. Syntax errors are reported when the file is compiled, with file, line and column.',
        language: 'janel', file: 'src/App.janel',
        code: `<script lang="python">
from janelkit import state
from services.users import display_name   # src/services/users.py

name = state("")
</script>

<Column padding={24} gap={12}>
  <TextField bind:value={name} placeholder="Your name" label="Your name" />
  <Text>Hello, {display_name(name)}</Text>
</Column>`,
        explanation: [
          'services/users.py is an ordinary Python module with no interface. The starter project includes it.',
          'name = state("") runs once, when this component is created.',
          'The Text calls display_name with the current name every time name changes. The script itself does not run again.'
        ],
        expected: 'In a project created with janel new, the window first shows Hello, invitado (the starter’s default name, in Spanish). Typing ada lovelace changes it to Hello, Ada Lovelace.',
        pitfalls: [
          'Code at the top of the script runs once. Put work that must happen on a click inside a function connected to that click.',
          'The script is trusted code with your program’s permissions. Do not load .janel files from untrusted sources.'
        ]
      },
      {
        id: 'template-tree',
        title: 'The template is a tree with one root',
        body: 'Elements contain other elements, like folders inside folders. An element that contains others is their parent; the elements inside are its children. Indentation only helps people read; the tags decide the nesting. A paired tag such as <Column> … </Column> encloses its children; an element with no children can close itself with />.\n\nThe template must have exactly one root, the element that contains everything else. Comments are written <!-- like this --> and do not appear in the window.',
        language: 'janel', standalone: true,
        code: `<!-- Window is the root; everything else is inside it. -->
<Window title="A tree" width={360} height={220}>
  <Column padding={24} gap={8}>
    <Text>First child of the Column</Text>
    <Row gap={8}>
      <Button>Left</Button>
      <Button>Right</Button>
    </Row>
  </Column>
</Window>`,
        explanation: [
          'Window is the root. It has one child, a Column.',
          'The Column has two children: a Text and a Row.',
          'The Row has two children, the buttons, placed side by side.'
        ],
        expected: 'A window with a line of text and, below it, two buttons next to each other.'
      },
      {
        id: 'window-root',
        title: 'Window belongs only to the main component',
        body: 'The root component of the application, src/App.janel, may use Window as its root to set the title and size. If it does not, JanelKit wraps it in a 640 by 480 window and the content fills it. Components used inside other components must not have Window as their root: they become part of a window, they do not open one.\n\nTo open a second window, use open_window, covered with navigation.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
count = state(0)
</script>

<!-- No Window here: JanelKit opens a 640 × 480 window for it. -->
<Column padding={24} gap={12}>
  <Text>Count: {count}</Text>
  <Button on:click={count += 1}>Add one</Button>
</Column>`,
        expected: 'A 640 by 480 window with the count and an Add one button.',
        see: ['navigation']
      },
      {
        id: 'style-section',
        title: 'The style section is local to the component',
        body: 'Style rules apply to the elements written in this component’s template, never to the inside of another component. A rule such as .page { padding: 24px; } matches every element with class="page". Note the dot: it belongs in the rule, not in the class attribute.',
        language: 'janel',
        code: `<Column class="page">
  <Text>Styled by the rule below</Text>
</Column>

<style>
.page { padding: 24px; gap: 12px; }
</style>`,
        see: ['styles']
      },
      {
        id: 'practice',
        title: 'Practice: find the parts',
        body: 'Open the src/App.janel that janel new created. Identify the script, the root element and the style section. Then open src/components/Counter.janel: its root is a Row, not a Window, because it is used inside App.janel.',
        pitfalls: [
          'Two script or two style sections in one file are an error. Merge them.',
          'Two top-level elements are an error. Wrap them in a Column or Row.',
          'A Window inside a component that another component uses is an error.'
        ]
      }
    ],
    summary: [
      'A .janel file has a template and, optionally, one script and one style section.',
      'The script runs once per instance; later updates call its functions.',
      'The template is a tree with one root; only the main component may use Window.'
    ]
  }
];
