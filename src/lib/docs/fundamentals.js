// Guide · Part 2 · Fundamentals.
// Sources (read-only): JanelKit/docs/lenguaje.md (Expresiones, Atributos, Manejadores,
// Texto, Bloques, Elementos disponibles, Accesibilidad), docs/estilos.md and docs/api.md,
// cross-checked against packages/janelkit/src/janelkit (compiler and qml/Janel).
export const fundamentalsDocs = [
  {
    slug: 'elements',
    title: 'Built-in elements',
    description: 'Every element you can write in a template, grouped by purpose. All of them ship with janelkit.',
    learn: [
      'Which elements exist and what each family is for.',
      'Why built-in tags are lowercase and imported ones start with a capital letter.',
      'The properties every element accepts.',
      'How text between tags becomes a caption.'
    ],
    sections: [
      {
        id: 'all-included',
        title: 'Everything here is already installed',
        body: 'Every element on this page is part of the core janelkit package. You do not install anything else and you do not import elements in the script: write <button> in the template and it works. The packages of the ecosystem add services, and a few components of their own such as <Pages> in janelkit-router, but every control is here.\n\nTags are case-sensitive. As in HTML, lowercase tags are what the platform gives you: the built-in elements, such as <text>, <button> and <flex>. A tag that starts with a capital letter is a component your script imports, from your project or from a package: <TodoItem>, <Pages>. So a component of yours may be called Button without clashing with <button>. An unknown tag, property or event is a compile error that lists the valid options and suggests the closest name.',
        see: ['overview']
      },
      {
        id: 'families',
        title: 'Elements grouped by what they are for',
        body: 'Choose an element by the job it does. The next chapters use these elements, and Forms explains every input control in detail.',
        table: { headers: ['Family', 'Elements', 'Use them to'], rows: [
          ['Window', '<window>', 'Open the application window, with its title, size and screen.'],
          ['Layout', '<column>, <row>, flex, <spacer>, <scroll>', 'Arrange other elements vertically, horizontally, with free space, or in a scrolling area.'],
          ['Text and media', '<text>, <image>, <video>', 'Show text (plain, Markdown or HTML), pictures, or live video frames.'],
          ['Actions', '<button>, <shortcut>', 'Run something on a click or on a key combination.'],
          ['Input', '<textfield>, <textarea>, <checkbox>, <switch>, <slider>, <select>, <radiogroup>, <tabs>', 'Let the user type text, toggle a value, pick a number or choose an option.'],
          ['Feedback', '<progressbar>', 'Show progress, or that work is ongoing.'],
          ['Collections', '<list>', 'Show hundreds or thousands of rows efficiently.']
        ] }
      },
      {
        id: 'tour',
        title: 'A tour in one window',
        body: 'This component uses one element from most families. Run it, then change one thing at a time to see what each element does.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
progress = state(0.3)
dark = state(False)
</script>

<window title="Element tour" width={460} height={320}>
  <column padding={24} gap={12}>
    <text format="markdown">**Built-in elements** need no imports.</text>
    <progressbar value={progress} />
    <row gap={8}>
      <button on:click={progress = min(progress + 0.1, 1)}>More progress</button>
      <spacer />
      <switch bind:checked={dark}>Dark mode</switch>
    </row>
    <text>Progress: {progress:.0%} · dark mode {"on" if dark else "off"}</text>
  </column>
</window>`,
        explanation: [
          '<text> with format="markdown" renders the two asterisks as bold text.',
          '<progressbar> goes from 0 to its max, which defaults to 1, so 0.3 shows a bar 30 % full.',
          '<spacer> takes the free space in the <row> and pushes the <switch> to the right edge.',
          'The <switch> writes True or False into dark; the last line reads both states.'
        ],
        expected: 'The bar starts 30 % full and the last line says Progress: 30% · dark mode off. More progress fills the bar in steps until 100%. The <switch> changes the last line to dark mode on (it does not change the theme; that is shown in Styles).'
      },
      {
        id: 'common-properties',
        title: 'Properties every element accepts',
        body: 'Besides its own properties, every element except <window> accepts the ones below. id, class and style are written the same way on any element.',
        table: { headers: ['Property', 'What it does'], rows: [
          ['width, height', 'Preferred size in pixels, or a percentage of the container.'],
          ['flex', 'Share of the free space along the container’s direction. Explained in Layout.'],
          ['visible', 'False hides the element and frees its space. The element still exists.'],
          ['enabled', 'False disables a control: it ignores input and looks inactive.'],
          ['opacity', 'Transparency from 0 (invisible) to 1 (opaque).'],
          ['label', 'The name a screen reader announces. Needed when there is no visible text.'],
          ['id', 'A stable name, used to find the element in tests.'],
          ['class, style', 'Connect the element to style rules, or style it directly. Explained in Styles.']
        ] }
      },
      {
        id: 'text-content',
        title: 'Text between tags is the caption',
        body: 'For <text>, <button> and <checkbox>, the text between the tags is what they show: <button>Save</button>. It can include expressions: <button>Clicks: {count}</button>. Spaces and line breaks are collapsed into single spaces, so you can wrap long text over several lines. Loose text directly inside a container becomes a <text>.\n\n<text> shows plain text by default. format="markdown" renders bold, italics, links, code and lists, and shows any HTML inside the text as written, so text written by other people can be shown directly; format="html" renders Qt’s subset of HTML. Clicking a link emits on:link with its URL; if nobody listens, it opens in the browser. <text> cannot be selected by default, like a label in a desktop application; add selectable to let the user select and copy it.',
        language: 'janel',
        code: `<text>Plain text</text>
<text format="markdown">Some **bold** and a [link](https://example.com)</text>
<text selectable>Order 4815-16 (the user can copy this)</text>`,
        pitfalls: [
          'format="html" applies the HTML in the text. Never show text from other people with format="html"; use plain text or format="markdown", which does not interpret HTML.'
        ]
      },
      {
        id: 'all-elements',
        title: 'Every element at a glance',
        body: 'The table lists each element with its own properties, its events and the values it can bind. Events written with a name in parentheses send that value to your handler, for example on:submit(text). Do not memorize it; come back when you need a detail.',
        table: { headers: ['Element', 'Properties', 'Events', 'bind:'], rows: [
          ['<window>', 'title, width, height, minWidth, minHeight, background, screen, fullscreen', 'on:activate, on:deactivate', '—'],
          ['<column>, <row>', 'gap, padding', 'on:click and pointer and keyboard events', '—'],
          ['flex', 'direction, wrap, gap, padding, align, justify, as, tabindex, disabled, title, checked, selected, expanded, style', 'on:click, pointer, wheel, keyboard, focus and resize events', '—'],
          ['<scroll>', 'gap, padding, follow', 'on:top, on:bottom, on:scroll(info)', '—'],
          ['<list>', 'gap, padding, animate, follow', 'on:top, on:bottom, on:scroll(info)', '—'],
          ['<text>', 'text, color, format (plain, markdown, html), selectable', 'on:link(url)', '—'],
          ['<button>', 'text, variant (default, primary, danger, ghost), flat', 'on:click', '—'],
          ['<textfield>', 'value, placeholder, readonly', 'on:input(text), on:submit(text), on:keydown, on:keyup, on:focus, on:blur', 'value'],
          ['<textarea>', 'value, placeholder, readonly', 'on:input(text), on:keydown, on:keyup, on:focus, on:blur', 'value'],
          ['<checkbox>', 'checked, text', 'on:change(checked)', 'checked'],
          ['<switch>', 'checked, text', 'on:change(checked)', 'checked'],
          ['<slider>', 'value, min (0), max (100), step', 'on:change(value)', 'value'],
          ['<select>', 'options, value, placeholder', 'on:change(value), on:keydown, on:keyup, on:focus, on:blur', 'value'],
          ['<radiogroup>', 'options, value, horizontal', 'on:change(value)', 'value'],
          ['<tabs>', 'options, value', 'on:change(value)', 'value'],
          ['<progressbar>', 'value, max (1), indeterminate', '—', '—'],
          ['<image>', 'src, fit (contain, cover, fill, none), alt', '—', '—'],
          ['<video>', 'source (a Frames object), fit (contain, cover, fill)', 'on:click, on:dblclick, on:contextmenu and pointer events, with image_x and image_y', '—'],
          ['<shortcut>', 'keys', 'on:activate', '—'],
          ['<spacer>', '—', '—', '—']
        ] },
        see: ['forms', 'layout', 'large-lists', 'video']
      }
    ],
    summary: [
      'All elements are in the core: no install, no import.',
      'Built-in elements are lowercase; a tag with a capital letter is an imported component.',
      'Unknown tags and properties are compile errors with suggestions.'
    ]
  },
  {
    slug: 'state',
    title: 'Reactive state',
    description: 'Make the window follow your data: create state, read and change it, and know where to write .value.',
    learn: [
      'Why an ordinary Python variable cannot update the window.',
      'How state works, and where you write .value and where you do not.',
      'How lists and dictionaries in state update the window when you change them.'
    ],
    sections: [
      {
        id: 'why-state',
        title: 'An ordinary variable cannot update the window',
        body: 'When the window is first shown, every {expression} is evaluated and displayed. If you later assign a new value to an ordinary variable, nothing tells the window to look again, so the screen keeps the old value.\n\nstate(initial) solves this. It returns a small container that remembers who read it. The binding {count} reads it while being displayed; when the container’s value changes, JanelKit recalculates exactly the bindings that read it and updates them. Reactive means exactly this: the interface follows the data by itself, without code that finds a label and changes its text.',
        explanation: [
          'A binding is the connection between an expression in the template and the property or text that shows its result.',
          'Reading state while a binding is evaluated subscribes that binding. Changing the state asks only the subscribed bindings to update.'
        ]
      },
      {
        id: 'counter',
        title: 'A counter, line by line',
        body: 'This component keeps a number in state and changes it in two ways: from a Python function and from an action written in the template.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state

count = state(0)

def add_one():
    count.value += 1
</script>

<window title="Reactive counter" width={420} height={240}>
  <column padding={24} gap={12}>
    <text>Count: {count}</text>
    <text>Doubled: {count * 2}</text>
    <button on:click={add_one}>Add one</button>
    <button on:click={count = 0}>Reset</button>
  </column>
</window>`,
        explanation: [
          'count = state(0) creates the container. The name count refers to the container, not to the number.',
          'In Python, the number is count.value. add_one reads it and writes it back increased by one.',
          'In the template, count already means the number: {count} and {count * 2} show it and its double.',
          'on:click={count = 0} is an action in the template. Assigning to a state name there changes its value; it does not replace the container.'
        ],
        expected: 'Count: 0 and Doubled: 0 at first. Each Add one increases both lines (1 and 2, then 2 and 4). Reset sets both back to 0.'
      },
      {
        id: 'value-rule',
        title: 'The one rule: .value in Python, plain name in the template',
        body: 'In script code, read and write through .value. In the template, write the plain name: JanelKit unwraps it for you. This is the most common source of early errors, so it helps to know where each kind of code lives.',
        table: { headers: ['Where', 'Read', 'Change'], rows: [
          ['Python functions in the script', 'count.value', 'count.value = 5, count.value += 1'],
          ['Template expressions {…}', 'count', 'Not possible: expressions only read.'],
          ['Template actions on:click={…}', 'count', 'count = 5, count += 1'],
          ['Other helpers in Python', 'count.peek() reads without subscribing', 'count.set(5); count.update(lambda n: n + 1)']
        ] },
        language: 'python',
        code: `# Ordinary Python: this works in a script or in any module.
from janelkit import state

score = state(10)
score.value = 20                       # replace the value
score.set(25)                          # the same, as a method
score.update(lambda current: current + 5)
assert score.value == 30`,
        pitfalls: [
          'Writing count = 1 inside a Python function replaces the container with a plain number; the window stops updating. Write count.value = 1.',
          'Writing {count.value} in the template fails: count is already the number there.',
          'update expects a function that returns the new value. update(lambda rows: rows.append(x)) stores None, because append returns None.'
        ]
      },
      {
        id: 'collections',
        title: 'Lists and dictionaries are reactive too',
        body: 'When state holds a list, a dictionary or a set, it converts it, and anything nested inside, into a reactive version. You can then change it in place: append, remove, sort, item assignment and deletion all update the window, without building a new list.\n\nThe conversion makes a copy. Change the collection through items.value, not the original list you passed to state; editing the original has no effect on the window.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state

items = state(["Bread", "Milk"])

def add():
    items.value.append(f"Item {len(items.value) + 1}")
</script>

<window title="Shopping" width={360} height={280}>
  <column padding={24} gap={8}>
    <text>{len(items)} items: {", ".join(items)}</text>
    <button on:click={add}>Add an item</button>
    <button on:click={items.clear()}>Clear</button>
  </column>
</window>`,
        explanation: [
          'items.value.append(...) changes the list in place; the <text> that reads it updates.',
          'In the template, items is the list itself, so len(items) and ", ".join(items) work as usual.',
          'on:click={items.clear()} calls a list method as an action when the button is clicked.'
        ],
        expected: '2 items: Bread, Milk at first. Add an item adds Item 3, then Item 4. Clear shows 0 items.',
        see: ['conditions-and-lists', 'reactivity-in-depth']
      },
      {
        id: 'instances',
        title: 'Each component has its own state',
        body: 'state created in a component’s script belongs to that instance. If a window shows the same component twice, each copy has its own count. State created in an ordinary Python module, outside a component, is shared by everything that imports it; that is how you share data across components, and it is covered with components.',
        pitfalls: [
          'A plain variable is never made reactive just because the template mentions it. Use state for anything that changes while the window is open.',
          'Do not create new state inside a handler when you mean to update existing state.'
        ],
        see: ['components']
      }
    ],
    summary: [
      'state(initial) is a container the window watches.',
      'Python code uses .value; template expressions and actions use the plain name.',
      'Lists, dictionaries and sets in state update the window when changed in place.'
    ]
  },
  {
    slug: 'expressions',
    title: 'Expressions and attributes',
    description: 'What you can write inside braces, the forms an attribute can take, and how to format values.',
    learn: [
      'Which Python is allowed inside {…}, and why JavaScript is not.',
      'The difference between a literal, an expression, a Boolean attribute and a shorthand.',
      'How to format numbers and text like an f-string.',
      'What happens when an expression has a mistake.'
    ],
    sections: [
      {
        id: 'python-in-braces',
        title: 'Braces hold one Python expression',
        body: 'An expression is Python that produces a value: count * 2, len(items) > 0, "Ready" if ready else "Wait". Inside braces you can write any expression, including calls to your own functions. You cannot write statements such as assignments, if blocks or loops; those belong in script functions, or in event actions, which are covered in Events.\n\nExpressions are evaluated in Python, in the component’s namespace. The generated QML never runs your logic. The table translates the habits people bring from JavaScript.',
        table: { headers: ['Intention', 'Write (Python)', 'Not (JavaScript)'], rows: [
          ['Equal', 'a == b', 'a === b'],
          ['And, or, not', 'a and b, a or b, not a', 'a && b, a || b, !a'],
          ['Choose a value', '"Yes" if ok else "No"', 'ok ? "Yes" : "No"'],
          ['True, false, nothing', 'True, False, None', 'true, false, null'],
          ['Length', 'len(items)', 'items.length']
        ] }
      },
      {
        id: 'attribute-forms',
        title: 'Four ways to write an attribute',
        body: 'An attribute sets a property of an element. Quoted values are text. Braces hold an expression: if it is a fixed Python literal such as {420}, it is written into the window once; otherwise it becomes a binding that updates when its data changes. A bare attribute is True, and {name} is short for name={name}.',
        table: { headers: ['Form', 'Example', 'Meaning'], rows: [
          ['Literal', 'title="Notes"', 'Text. Numeric properties also accept width="640".'],
          ['Expression', 'width={420}, enabled={count > 0}', 'A Python value. Reactive when it reads state.'],
          ['Boolean', 'flat', 'The same as flat={True}.'],
          ['Shorthand', '{enabled}', 'The same as enabled={enabled}.']
        ] },
        language: 'janel',
        code: `<!-- count and enabled are defined in the script. -->
<button text="Save" enabled={count > 0} />
<button flat>Quiet action</button>
<button {enabled}>Continue</button>`,
        pitfalls: [
          'enabled="False" is the text "False", not a Boolean. Write enabled={False}.'
        ]
      },
      {
        id: 'unwrapping',
        title: 'Which names are unwrapped',
        body: 'A plain name that refers to state, a computed value or a component prop is replaced by its value: {count + 1} means count.value + 1. Only direct names are unwrapped. If a state lives on another object, such as a module, reach its value explicitly with .value, or import the state by name so it becomes a direct name.\n\nNames are looked up when the expression runs. Inside a row of a list, a lambda always sees that row’s item.',
        language: 'janel',
        code: `<!-- prefs is a module that defines theme = state("light"). -->
<text>Theme: {prefs.theme.value}</text>`,
        pitfalls: [
          'Inside a template lambda, state names are already numbers or strings, so lambda: count.set(0) fails. Pass a script function instead.'
        ]
      },
      {
        id: 'formatting',
        title: 'Format values like an f-string',
        body: 'Text interpolation accepts Python format specifications and conversions, exactly as in an f-string: {price:.2f}, {total:,}, {ratio:.0%}, {name!r}, {n:>4}. None is shown as empty text. Colons inside brackets, parentheses or strings do not start a format, so {items[1:3]} works; a lambda needs parentheses.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
price = state(1234.5)
ratio = state(0.256)
name = state("Ada")
</script>

<window title="Formatting" width={380} height={240}>
  <column padding={24} gap={8}>
    <text>Price: {price:,.2f}</text>
    <text>Share: {ratio:.0%}</text>
    <text>Name: {name!r}</text>
    <button on:click={price += 100}>Raise the price</button>
  </column>
</window>`,
        expected: 'Price: 1,234.50, Share: 26% and Name: \'Ada\'. Raise the price changes the first line to Price: 1,334.50.',
        explanation: [
          ':,.2f adds thousands separators and keeps two decimals.',
          ':.0% multiplies by 100, rounds to whole numbers and adds the percent sign.',
          '!r shows the value as Python would write it, here with quotes.',
          'Formatting only applies to text between tags, not to attribute expressions.'
        ]
      },
      {
        id: 'mistakes',
        title: 'What happens when an expression is wrong',
        body: 'A name that the script does not define is a compile error that points at the line and suggests the closest name. Diagnostics are written in Spanish for now, for example: \'cuont\' no está definido — ¿quisiste decir \'count\'? (\'cuont\' is not defined, did you mean \'count\'?). This check is turned off if the script uses from x import * or globals(). An expression that raises an exception while running, such as formatting text with .2f, is logged with its file and line, and the application keeps running.\n\nExpressions are trusted code, like the script. Never build template source from text the user typed.',
        steps: [
          'Misspell a state name in a {…} and run the app: read the suggestion in the terminal.',
          'Write {"Discount" if price > 15 else "Regular price"} in a <text> and change price to cross 15.'
        ],
        see: ['troubleshooting']
      }
    ],
    summary: [
      'Braces contain one Python expression; statements belong in functions.',
      'Quotes are text, braces are Python, a bare attribute is True.',
      'State names are unwrapped; text can be formatted like an f-string.'
    ]
  },
  {
    slug: 'events',
    title: 'Events',
    description: 'Run Python when the user acts: connect handlers, write actions in the template and read what each control sends.',
    learn: [
      'How on:event connects a user action to Python.',
      'The difference between passing a function and writing an action.',
      'What each control sends to its handler.'
    ],
    sections: [
      {
        id: 'what-is-an-event',
        title: 'An event connects an action to code',
        body: 'An event announces that something happened: a button was clicked, a field received text, a checkbox changed. on:click={save} connects the click of a button to the function save. A handler is the code that runs in response. JanelKit calls it when the event arrives, never earlier.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state

count = state(0)
last = state("nothing yet")

def reset():
    count.value = 0
    last.value = "reset"

def moved(value):
    last.value = f"slider at {value:.0f}"
</script>

<window title="Events" width={460} height={300}>
  <column padding={24} gap={12}>
    <text>Count: {count}</text>
    <row gap={8}>
      <button on:click={count += 1}>Add one</button>
      <button on:click={reset}>Reset</button>
    </row>
    <slider min={0} max={10} step={1} on:change={moved} label="Level" />
    <text>Last action: {last}</text>
  </column>
</window>`,
        explanation: [
          'on:click={count += 1} is an action written in the template. It runs as is on each click.',
          'on:click={reset} passes the function itself. Defining reset does nothing; each click calls it.',
          '<slider> sends its new value with on:change, so moved receives it as its argument.',
          'Handlers change state; the <text> elements that read that state update by themselves.'
        ],
        expected: 'Add one increases the count, Reset sets it to 0 and the last line to Last action: reset. Moving the slider to 3 shows Last action: slider at 3.'
      },
      {
        id: 'function-or-action',
        title: 'A function or an action',
        body: 'JanelKit decides from what you write. A name, an attribute, an index, a lambda or x if c else y is a function: it is called when the event happens. Anything else, such as a call or an assignment, is an action: it is executed as written when the event happens.\n\nActions may contain calls and simple statements such as assignments and +=, separated by semicolons. Assigning to a name is only allowed when that name is state in the script. Compound statements such as if, for and def are not allowed; write a function instead.',
        table: { headers: ['You write', 'Kind', 'On each click'], rows: [
          ['on:click={save}', 'Function', 'Calls save().'],
          ['on:click={lambda: remove(item["id"])}', 'Function', 'Calls the lambda.'],
          ['on:click={save()}', 'Action', 'Runs save().'],
          ['on:click={count = 0; query = ""}', 'Action', 'Runs both assignments.'],
          ['on:click={make_handler(x)}', 'Action', 'Runs make_handler(x) and ignores what it returns.']
        ] },
        pitfalls: [
          'on:click={make_handler(x)} does not call the function that make_handler returns. Write on:click={make_handler(x)()} or use a lambda.',
          'Assigning to a prop or to a list row variable in an action is a compile error. Change the item in place instead: todo["done"] = True.'
        ]
      },
      {
        id: 'event-values',
        title: 'What each control sends',
        body: 'Many events carry a value. A <textfield> sends its text with on:input and on:submit; a <checkbox> or <switch> sends True or False with on:change; <slider>, <select>, <radiogroup> and <tabs> send the new value. A handler function receives the arguments its signature accepts, so def submit(): and def submit(text): both work for on:submit.\n\nIn an action, the value is available as event: a single value, or a tuple when the event has several. It is not a browser event object.',
        language: 'janel',
        code: `<!-- done is a Boolean state; query is a text state. -->
<checkbox checked={done} on:change={done = event}>Done</checkbox>
<textfield value={query} on:submit={search(event)} label="Search" />`,
        pitfalls: [
          'Do not expect event.target.value; event is the value itself.',
          'Inside an action, event hides any script variable with the same name.'
        ],
        see: ['forms', 'reactivity-in-depth']
      },
      {
        id: 'handlers-and-time',
        title: 'Handlers run on the interface thread',
        body: 'Handlers run on the same thread that draws the window, so the window waits while a handler runs. Keep them short. Changes made by one handler are grouped and the window updates once at the end, so you never need a manual redraw.\n\nFor slow work such as reading a large file or calling a web service, use an async def handler and the tools in Async work; the window stays responsive while it waits.',
        see: ['async']
      },
      {
        id: 'practice',
        title: 'Practice: two ways to reset',
        body: 'Add a Reset button with an action, on:click={count = 0}, and another that calls a function. Then make Reset also clear the last-action text. Which version is easier to read once the rule has two steps?',
        pitfalls: [
          'Starting the app is not testing it. Activate every control and check what changed.'
        ]
      }
    ],
    summary: [
      'on:event={function} calls the function; on:event={action} runs the action.',
      'Controls send values: text, True or False, the chosen option.',
      'Handlers run on the interface thread; move slow work to async handlers.'
    ]
  },
  {
    slug: 'forms',
    title: 'Forms and two-way binding',
    description: 'Connect input controls to state in both directions, choose the right control for each value, and handle the keyboard in fields.',
    learn: [
      'What bind:value and bind:checked do, and when to use them.',
      'Which input control matches each kind of value.',
      'How options work in <select>, <radiogroup> and <tabs>.',
      'How to react to keys such as Enter and Escape in a field.'
    ],
    sections: [
      {
        id: 'two-way-binding',
        title: 'bind: keeps a control and a state in step',
        body: 'value={name} sends data one way, from state to the control. bind:value={name} sends it both ways: the control shows the state, and every edit the user makes is written back to it. Use bind:checked for <checkbox> and <switch>, and bind:value for the rest. Anything else that reads the state, such as a summary line, follows the user’s input without any handler.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state

name = state("")
size = state("M")
volume = state(40)
agree = state(False)
message = state("Type a name and press Enter.")

def greet(text):
    message.value = f"Hello, {text.strip() or 'friend'}!"
</script>

<window title="A small form" width={480} height={420}>
  <column padding={24} gap={12}>
    <textfield bind:value={name} on:submit={greet} placeholder="Ada" label="Your name" />
    <select options={["S", "M", "L"]} bind:value={size} label="Size" />
    <slider bind:value={volume} min={0} max={100} step={10} label="Volume" />
    <checkbox bind:checked={agree}>I agree</checkbox>
    <text>{name or "Nobody"} · size {size} · volume {volume:.0f} · {"agreed" if agree else "not agreed"}</text>
    <text>{message}</text>
    <button on:click={name = ""; agree = False}>Clear</button>
  </column>
</window>`,
        explanation: [
          'Each bind: connects one control to one state. Typing, choosing, sliding and ticking all write to state immediately.',
          'The summary line reads the four states, so it changes as the user works.',
          'on:submit={greet} runs when the user presses Enter in the field; greet receives the submitted text.',
          'Clear changes the states from the template. Because the binding goes both ways, the field and the checkbox are cleared too.'
        ],
        expected: 'Typing Ada changes the summary to Ada · size M · volume 40 · not agreed. Enter shows Hello, Ada!. Clear empties the field and unticks the checkbox.',
        pitfalls: [
          'bind: needs writable state. It cannot target a plain variable, a computed value, a prop or a list row variable.',
          'checked={agree} on its own is one-way: the checkbox shows agree but does not write to it.'
        ]
      },
      {
        id: 'choose-control',
        title: 'Choose the control by the kind of value',
        body: 'The right control makes the expected value obvious to the user. Pick it by the type of data you need.',
        table: { headers: ['You need', 'Use', 'Binding'], rows: [
          ['A short line of text', '<textfield>', 'bind:value (str)'],
          ['Several lines of text', '<textarea>', 'bind:value (str)'],
          ['Yes or no, in a form', '<checkbox>', 'bind:checked (bool)'],
          ['On or off, a setting that applies at once', '<switch>', 'bind:checked (bool)'],
          ['A number in a range', '<slider> (min, max, step)', 'bind:value (number)'],
          ['One option from a long list', '<select>', 'bind:value'],
          ['One option from a few, all visible', '<radiogroup>', 'bind:value'],
          ['Which section is shown', '<tabs>', 'bind:value'],
          ['Progress of a task', '<progressbar> (display only)', '—']
        ] }
      },
      {
        id: 'options',
        title: 'Options: plain text or label and value',
        body: '<select>, <radiogroup> and <tabs> take a list of options. Plain strings are shown and stored as they are. Dictionaries with label and value let the user see a readable label while your Python receives a different value, such as an identifier.\n\nThe user’s choice appears immediately. If Python changes the bound state, the control follows Python. <tabs> only draws the bar of tabs: choose the content to show with {#if}.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
tab = state("general")
plan = state(2)
</script>

<window title="Options" width={460} height={300}>
  <column padding={24} gap={12}>
    <tabs options={[{"label": "General", "value": "general"}, {"label": "Billing", "value": "billing"}]} bind:value={tab} />
    {#if tab == "general"}
      <text>General settings</text>
    {:else}
      <radiogroup options={[{"label": "Basic", "value": 1}, {"label": "Pro", "value": 2}]} bind:value={plan} />
      <text>Plan number {plan}</text>
    {/if}
  </column>
</window>`,
        expected: 'General settings is shown first. Choosing Billing shows the plan choice with Pro selected and Plan number 2; choosing Basic shows Plan number 1.',
        see: ['conditions-and-lists']
      },
      {
        id: 'keyboard-in-fields',
        title: 'React to keys in a field',
        body: '<textfield>, <textarea> and <select> also send keyboard and focus events: on:keydown, on:keyup, on:focus and on:blur. The keydown handler receives a KeyEvent whose key is a name such as Enter, Escape or ArrowDown. event.prevent() stops the key from reaching the field, so it is not typed.\n\nTextArea sends on:input only for changes made by the user, not for changes that come from Python.',
        language: 'janel',
        code: `<!-- cancel and save are script functions; draft is a text state. -->
<textfield bind:value={draft}
  on:keydown={event.key == "Escape" and cancel()}
  on:blur={save()} label="Title" />`,
        explanation: [
          'event.key == "Escape" and cancel() calls cancel only when the key is Escape.',
          'on:blur runs when the field loses focus, a common moment to save an edit.'
        ],
        see: ['accessibility']
      },
      {
        id: 'labels',
        title: 'Give every input a name',
        body: 'A placeholder disappears as soon as the user types, and screen readers may not announce it. Give each input a label, the name a screen reader announces, and when possible a visible <text> above it. Then check the form with the keyboard alone: Tab moves through the controls in template order, Enter submits a field.',
        pitfalls: [
          'Do not rely on the placeholder as the only description of a field.',
          'Test both directions of each binding: type in the control, and change the state from a button.'
        ],
        see: ['accessibility']
      }
    ],
    summary: [
      'bind:value and bind:checked connect a control and a state in both directions.',
      'Pick the control by the value: text, Boolean, number or one of several options.',
      'Options can be strings, or dictionaries with label and value.'
    ]
  },
  {
    slug: 'conditions-and-lists',
    title: 'Conditions and lists',
    description: 'Show content only when it applies, repeat it for every item of a list, and control when it is recreated.',
    learn: [
      'How {#if} chooses what is shown, and that removed content is destroyed.',
      'How {#each} repeats content and why every changing list needs a key.',
      'When to recreate content with {#key}, and when to keep it with {#hidden}.'
    ],
    sections: [
      {
        id: 'if',
        title: 'Show content with {#if}',
        body: 'A block decides which part of the template exists. {#if condition} starts a branch, {:else if condition} adds another test, {:else} is the fallback and {/if} closes the block. Conditions use Python truthiness, and only the first matching branch is shown.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
count = state(0)
</script>

<window title="Conditions" width={380} height={220}>
  <column padding={24} gap={12}>
    <button on:click={count += 1}>Click</button>
    {#if count >= 5}
      <text>Five or more clicks</text>
    {:else if count > 0}
      <text>Some clicks</text>
    {:else}
      <text>No clicks yet</text>
    {/if}
  </column>
</window>`,
        explanation: [
          'count >= 5 is tested first, so five clicks do not also match the second branch.',
          '{:else} needs no condition; here it covers zero.'
        ],
        expected: 'No clicks yet at first, Some clicks after the first click, Five or more clicks from the fifth.'
      },
      {
        id: 'if-destroys',
        title: 'A hidden branch does not exist',
        body: 'Only the active branch exists. Switching branches destroys the old content, stops its bindings and creates the new content from scratch. A component inside a removed branch loses its local state; showing it again creates a fresh instance whose script runs again.\n\nKeep data that must survive in the parent, or use {#hidden}, described below.'
      },
      {
        id: 'each',
        title: 'Repeat content with {#each}',
        body: '{#each items as item, i (key)} creates one row for every item of an iterable. item is the current element and i, optional, is its position from zero. Both exist only inside the block. The key in parentheses identifies each item, and {:else} is shown when the list is empty.\n\nThe rows stay connected to the data: adding, removing or reordering items updates only the affected rows.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
items = state([
    {"id": 1, "name": "Bread"},
    {"id": 2, "name": "Milk"},
])
</script>

<window title="A small list" width={420} height={320}>
  <column padding={24} gap={12}>
    <button on:click={items.reverse()}>Reverse order</button>
    {#each items as item, i (item["id"])}
      <row gap={8}>
        <text>{i + 1}. {item["name"]}</text>
        <button on:click={items.remove(item)}>Remove</button>
      </row>
    {:else}
      <text>The list is empty.</text>
    {/each}
  </column>
</window>`,
        expected: 'Bread and Milk appear as numbered rows. Reverse order swaps them and renumbers them. Removing both shows The list is empty.'
      },
      {
        id: 'keys',
        title: 'A key is an identity, not a position',
        body: 'Without a key, rows are matched by position. After sorting or deleting, text typed in a field or the keyboard focus can end up on the wrong item. With a key, each row keeps its identity: its local state, its focus and what was typed stay with the item.\n\nUse a value that is unique, stable and hashable, such as an id number or string. If an item changes but keeps its key, its row is updated in place.',
        pitfalls: [
          'Do not use the index i as the key of a list that changes order.',
          'Do not generate a random key on each render; that throws identity away.',
          'Lists and dictionaries are not hashable and cannot be keys.'
        ]
      },
      {
        id: 'key-and-hidden',
        title: 'Recreate with {#key}, keep with {#hidden}',
        body: '{#key expression} destroys and recreates its content whenever the expression changes. Use it to reset a component’s local state, for example an editor’s draft when another note is selected.\n\n{#hidden condition} is the opposite of {#if}: it hides its content while the condition is true without destroying it. When shown again, the content keeps what was typed, its scroll position and its state. It is created the first time it is shown. While hidden, its template stops updating and catches up once when shown, but its script keeps running: effects, timers and tasks continue.',
        language: 'janel',
        code: `<!-- selected_id and current come from the script; tab is a text state. -->
{#key selected_id}
  <NoteEditor note={current} />
{/key}

{#hidden tab != "search"}
  <SearchPanel />
{/hidden}`,
        explanation: [
          'Choosing another note changes selected_id, so NoteEditor is recreated with an empty draft.',
          'Switching tabs only hides SearchPanel; coming back finds the search exactly as it was.'
        ],
        pitfalls: [
          'Use {#hidden} for content that is toggled often and is costly to build or has state that matters. For everything else, {#if} frees memory.'
        ]
      },
      {
        id: 'several-elements',
        title: 'Several elements in one branch or row',
        body: 'When a branch or a row contains several elements, they are grouped in an implicit container with the parent’s direction, gap and alignment. Usually this is invisible; if you need to control their layout, wrap them in your own <column> or <row>. Blocks go inside the root element, never around it.',
        steps: [
          'Show the number of items above the list with {len(items)}.',
          'Empty the list and check that the {:else} text appears.',
          'Type into a field in a keyed row, reverse the list, and confirm the text moved with its item.'
        ]
      }
    ],
    summary: [
      '{#if} shows one branch; removed content is destroyed.',
      '{#each} repeats content; give changing lists a stable key.',
      '{#key} recreates content; {#hidden} keeps it alive while hidden.'
    ]
  },
  {
    slug: 'computed',
    title: 'Computed values',
    description: 'Derive values from state instead of storing copies, and let JanelKit keep them correct.',
    learn: [
      'Why derived data should be computed, not stored.',
      'How @computed tracks what it reads and caches its result.',
      'When to use state, computed or an effect.'
    ],
    sections: [
      {
        id: 'derive',
        title: 'Calculate an answer instead of storing it',
        body: 'If a total is always price times quantity, storing it in a third state means remembering to update it every time either input changes. Sooner or later one place forgets. @computed expresses the relationship once: the function returns the answer, and JanelKit keeps it up to date.\n\nThe decorator turns the function into a Computed object. Read it like state: total.value in Python, total in the template. Do not call it and do not assign to it.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state, computed

quantity = state(1)
price = state(12)

@computed
def total():
    return quantity.value * price.value
</script>

<window title="Computed" width={420} height={220}>
  <column padding={24} gap={12}>
    <text>{quantity} × {price} credits = {total} credits</text>
    <button on:click={quantity += 1}>Add one</button>
    <button on:click={price = 10}>Discount</button>
  </column>
</window>`,
        explanation: [
          'quantity and price are the source of truth; total is read-only derived data.',
          'Inside the function, read inputs with .value, as in any Python code.',
          'In the template, {total} shows the current answer.'
        ],
        expected: '1 × 12 credits = 12 credits at first. Add one shows 2 × 12 credits = 24 credits. Discount then shows 2 × 10 credits = 20 credits.'
      },
      {
        id: 'how-it-tracks',
        title: 'It follows what it actually reads',
        body: 'You do not declare dependencies. While the function runs, JanelKit records which state it reads; when any of those changes, the cached result is marked stale and recalculated the next time someone reads it. Each run records its dependencies again, so a condition decides what matters: below, while show_net is False, changes to net are ignored.',
        language: 'python',
        code: `# Ordinary Python: the branch taken decides the dependencies.
from janelkit import state, computed

show_net = state(False)
gross = state(120)
net = state(100)

@computed
def displayed():
    return net.value if show_net.value else gross.value

assert displayed.value == 120
show_net.value = True
assert displayed.value == 100`,
        explanation: [
          'Computed values are lazy: they calculate on first read, not on creation.',
          'They are cached: reading them twice without changes does not recalculate.',
          'When a recalculated number, string or tuple equals the previous one, the bindings that read it are not updated.'
        ]
      },
      {
        id: 'rules',
        title: 'Keep computed functions pure',
        body: 'A computed function should only calculate and return. It must be synchronous and must not change state, start timers, write files or call web services. Those are actions, not answers, and belong in event handlers, effects or async tasks.',
        pitfalls: [
          'Do not write state inside a computed function; that creates loops and surprises.',
          'Returning the same list object does not prove its contents are unchanged; prefer returning new values.',
          'total() is an error: total is a Computed object, read total.value.'
        ]
      },
      {
        id: 'which-tool',
        title: 'state, computed or effect?',
        body: 'Three tools look similar but answer different questions. Ask what the value is for.',
        table: { headers: ['Question', 'Tool', 'Example'], rows: [
          ['Is it data the user or the program sets?', 'state', 'The text typed in a field, the selected item.'],
          ['Can it be calculated from other data?', 'computed', 'A total, a filtered list, a count of pending tasks.'],
          ['Must something happen outside when data changes?', 'effect', 'Log a change, save a preference, sync with a service.']
        ] },
        see: ['lifecycle', 'reactivity-in-depth']
      },
      {
        id: 'practice',
        title: 'Practice: a filtered list',
        body: 'Combine a list in state, a search text bound to a <textfield>, and a computed that returns only the items containing the search text. Show the computed list with {#each} and its length in a <text>. The filtered list is never stored: it is always calculated from the two inputs.',
        pitfalls: [
          'Do not keep a second filtered list in state and update it by hand; that is exactly what computed replaces.'
        ]
      }
    ],
    summary: [
      '@computed derives a value from state; read it with .value or by name in the template.',
      'It tracks what it reads, calculates lazily and caches the result.',
      'Keep it pure: calculations only, no side effects.'
    ]
  },
  {
    slug: 'layout',
    title: 'Layout',
    description: 'Arrange elements with <column>, <row> and flex, share free space, push items apart, wrap grids and scroll.',
    learn: [
      'How <column>, <row> and flex place their children along a main axis.',
      'The default behavior of each, so layouts are predictable.',
      'How flex shares free space and how <spacer> and margins push items apart.',
      'How to wrap a grid and when to scroll.'
    ],
    sections: [
      {
        id: 'boxes',
        title: 'Three boxes that arrange their children',
        body: 'A layout answers two questions: where each element goes, and how much space it takes. <column> stacks its children from top to bottom. <row> places them from left to right. flex, lowercase, is the general box behind both: a row by default, configurable with direction and the full set of flexbox properties.\n\nThe direction a box places its children is its main axis: vertical in a <column>, horizontal in a <row>. The other direction is the cross axis. gap separates children along the main axis; padding separates them from the box edge.',
        language: 'janel', standalone: true,
        code: `<window title="Boxes" width={460} height={300}>
  <column padding={24} gap={12}>
    <text>A Column stacks its children.</text>
    <textfield placeholder="Fields fill the width" label="Example field" />
    <button>Buttons keep their size</button>
    <row gap={8}>
      <text>A Row centers its children vertically:</text>
      <button>One</button>
      <button>Two</button>
    </row>
  </column>
</window>`,
        expected: 'The text and the field stretch across the window; the button keeps its natural width. In the last line, the text and two buttons sit side by side, vertically centered.'
      },
      {
        id: 'defaults',
        title: 'Know the defaults',
        body: 'Most layout surprises come from defaults. In a <column>, <text>, <textfield>, <textarea>, <column>, <row> and <scroll> take the full width, like blocks, while buttons and checkboxes keep their natural size. In a <row>, children are centered vertically. In both, only children with flex shrink when space is short. flex follows web defaults instead: a row, children stretched across, and every child allowed to shrink down to its content.\n\nLeftover space is not spread between children: it stays at the end unless justify-content says otherwise. The root element fills the whole window.',
        table: { headers: ['Property', 'Question it answers', 'Example'], rows: [
          ['gap', 'How far apart are siblings?', 'gap: 12px'],
          ['padding', 'How far from the box edge?', 'padding: 24px'],
          ['justify-content', 'Where along the main axis?', 'start, center, end, space-between, space-around, space-evenly'],
          ['align-items', 'Where along the cross axis?', 'start, center, end, stretch, baseline'],
          ['align-self', 'Override the alignment of one child?', 'align-self: stretch'],
          ['flex', 'How much free space does a child take?', 'flex: 1'],
          ['margin', 'Space outside one child; auto pushes it away.', 'margin-left: auto']
        ] }
      },
      {
        id: 'share-space',
        title: 'Share free space with flex',
        body: 'flex={1} on a child, or flex: 1 in a rule, gives it the free space along the main axis: height in a <column>, width in a <row>. Several flexible children share it in proportion, regardless of their content: flex 2 and flex 1 get two thirds and one third.\n\nThe container needs a size that comes from outside, such as filling the window or being stretched. A box that only wraps its content has no free space to share. A fixed width for a sidebar and flex: 1 for the main area is the most common desktop layout.',
        language: 'janel', standalone: true,
        code: `<window title="Workspace" width={700} height={420}>
  <row class="workspace">
    <column class="sidebar">
      <text>Navigation</text>
    </column>
    <column class="main">
      <text>Your content goes here.</text>
    </column>
  </row>
</window>

<style>
.workspace { gap: 16px; padding: 20px; }
.sidebar { width: 180px; align-self: stretch; background: var(--surface-alt); padding: 16px; }
.main { flex: 1; align-self: stretch; padding: 16px; }
</style>`,
        explanation: [
          'The <row> is the root, so it fills the window and has free width to share.',
          'The sidebar asks for 180 pixels; align-self: stretch makes it as tall as the <row>.',
          'flex: 1 gives the main area all the remaining width.'
        ],
        expected: 'Resizing the window keeps the sidebar at 180 pixels while the main area grows and shrinks.'
      },
      {
        id: 'push-apart',
        title: 'Push items apart with <spacer> or margin',
        body: '<spacer> takes the free space in its container and pushes its siblings to the ends. It is the simplest way to build a toolbar with actions on both sides. margin-left: auto on one child does the same from a style rule.',
        language: 'janel', standalone: true,
        code: `<window title="Toolbar" width={520} height={160}>
  <column padding={16} gap={12}>
    <row gap={8}>
      <button>New</button>
      <button>Open</button>
      <spacer />
      <button variant="primary">Save</button>
    </row>
  </column>
</window>`,
        expected: 'New and Open sit on the left; Save sits at the right edge, whatever the window width.'
      },
      {
        id: 'wrap',
        title: 'Wrap a grid without Python',
        body: 'flex-wrap: wrap lets children flow onto new lines when they do not fit. With flex: 1 1 200px each card starts at 200 pixels and grows to fill its line; the grid reflows as the window is resized, with no code.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
cards = [f"Card {n}" for n in range(1, 9)]
</script>

<window title="Grid" width={640} height={360}>
  <flex class="grid">
    {#each cards as card}
      <column class="card"><text>{card}</text></column>
    {/each}
  </flex>
</window>

<style>
.grid { flex-wrap: wrap; gap: 12px; padding: 16px; align-items: start; }
.card { flex: 1 1 200px; padding: 16px; background: var(--surface); border-radius: var(--radius); }
</style>`,
        expected: 'Eight cards arranged in rows of about three. Narrowing the window moves cards to new lines.'
      },
      {
        id: 'scroll-and-size',
        title: '<scroll>, and sizes',
        body: '<scroll> is a <column> that scrolls vertically when its content is taller than the space it has; by default it takes the free space of its container. It creates all its content, which is right for settings pages and modest lists. For hundreds or thousands of rows use <list>, which only creates the visible rows.\n\nwidth and height set a preferred size in pixels; 100% takes the available space and other percentages are relative to the container. min-width, max-width, min-height and max-height limit how far an element grows or shrinks. A preferred size is a request, not a guarantee that content fits every window.',
        pitfalls: [
          'flex: 1 has no effect when the container only wraps its content: there is no free space to share. Give the container a size, flex or align-self: stretch.',
          'Do not nest a <scroll> inside a box that grows with its content; the <scroll> then never needs to scroll.',
          'Spacing between children belongs in gap on the container, not in margins on every child.'
        ],
        see: ['large-lists', 'styles']
      }
    ],
    summary: [
      '<column> stacks, <row> lines up, flex is the general box; gap and padding set spacing.',
      'flex shares free space; <spacer> and margin auto push items apart.',
      'flex-wrap builds grids; <scroll> scrolls, <list> handles very long lists.'
    ]
  },
  {
    slug: 'styles',
    title: 'Styles and themes',
    description: 'Write style rules, apply classes conditionally, react to hover and focus, and use theme colors that switch between light and dark.',
    learn: [
      'How a style rule selects elements and which properties exist.',
      'How to apply classes from Python data.',
      'How states such as hover and focus change appearance without Python.',
      'How theme tokens and the theme API make colors consistent and switchable.'
    ],
    sections: [
      {
        id: 'rules',
        title: 'A rule selects elements and sets properties',
        body: 'The style section holds rules. A rule has a selector, which says which elements it applies to, followed by braces with property: value; declarations. .page matches elements whose class includes page. Values are numbers in pixels (16px or 16), colors (#rrggbb, #aarrggbb, names, rgb() and rgba()) or theme tokens such as var(--primary).\n\nJanelKit is not a browser. It supports a list of properties and translates them to Qt Quick. An unsupported property or value produces a warning with its location and is ignored. The check happens when a rule is applied to an element, so a rule that matches nothing is never checked.',
        language: 'janel', standalone: true,
        code: `<window title="A little style" width={440} height={260}>
  <column class="page">
    <text class="heading">A readable interface</text>
    <text class="muted">Padding gives content room to breathe.</text>
    <button variant="primary">Continue</button>
  </column>
</window>

<style>
.page { padding: 24px; gap: 16px; }
.heading { font-size: var(--font-size-xl); font-weight: 600; }
.muted { color: var(--text-muted); }
</style>`,
        explanation: [
          'class="page" connects the <column> to the .page rule. The dot belongs only in the rule.',
          'var(--font-size-xl) and var(--text-muted) are theme tokens: named values from the active theme.',
          'variant="primary" is a <button> property, not a style rule; <button> also has default, danger and ghost.'
        ],
        expected: 'A large title, a softer line of text and an accent button, stacked with even spacing.'
      },
      {
        id: 'classes',
        title: 'Apply classes from your data',
        body: 'class="card selected" applies two classes. class:selected={condition} applies selected only while the condition is true. class={…} accepts a string, a list (which may be nested) or a dictionary of class: condition. Each form updates when the data it reads changes.\n\nA conditional class (class:name) with no matching rule produces a compile warning. A misspelled name in class="…" or class={…} does not, so if a style seems to have no effect, check the spelling on both sides.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
chosen = state(False)
</script>

<window title="Classes" width={400} height={240}>
  <column padding={24} gap={12}>
    <column class="card" class:chosen={chosen}>
      <text>This card follows the checkbox</text>
    </column>
    <checkbox bind:checked={chosen}>Choose the card</checkbox>
  </column>
</window>

<style>
.card { padding: 16px; border: 1px solid var(--border); border-radius: var(--radius); }
.chosen { border-color: var(--primary); background: var(--surface-alt); }
</style>`,
        expected: 'The card has a thin border. Ticking the checkbox gives it the accent border and a different background; unticking removes them.'
      },
      {
        id: 'selectors',
        title: 'Selectors, scope and which rule wins',
        body: 'Rules are local: they apply to elements written in this component’s template, including content it passes into a child’s slot, never to the inside of another component. When several rules match, the more specific one wins, counting classes and pseudo-classes first, then elements; with equal specificity, the later rule wins. Attributes written on the element, such as gap={4}, beat plain rules; rules with a state, a class: or a class={…} beat attributes.',
        table: { headers: ['Selector', 'Matches'], rows: [
          ['.title', 'Elements with class title.'],
          ['<button>', 'Every <button> in this component (also flex).'],
          ['.a, .b', 'Elements with class a, and elements with class b.'],
          ['.button.primary', 'Elements with both classes.'],
          ['.card .title', 'A .title anywhere inside a .card.'],
          ['.menu > .item', 'An .item that is a direct child of a .menu.'],
          ['.row:hover', 'A .row while the pointer is over it.']
        ] },
        language: 'css',
        code: `/* Inside the <style> section of a component. */
.card { padding: 16px; border: 1px solid var(--border); }
.card:hover { border-color: var(--primary); }
.card .subtitle { color: var(--text-muted); }
.card > .title { font-size: 18px; }`,
        explanation: [
          'The first rule styles every .card; the second only while the pointer is over one.',
          '.card .subtitle matches a subtitle at any depth inside a card; .card > .title only a title that is a direct child.'
        ]
      },
      {
        id: 'states',
        title: 'Change appearance on hover, press and focus',
        body: 'A pseudo-class applies a rule while an element is in a state. States are handled by the view, so hovering never calls Python. Add transition to animate the change. On a box with on:click, a :hover rule replaces the default highlight and an outline rule replaces the default focus ring.',
        table: { headers: ['Pseudo-class', 'Applies while'], rows: [
          [':hover', 'the pointer is over the element or one of its children'],
          [':pressed (or :active)', 'it is being pressed; on a clickable box, also with Space'],
          [':focus', 'it has keyboard focus'],
          [':focus-visible', 'it has focus that arrived from the keyboard'],
          [':focus-within', 'it or something inside it has focus'],
          [':disabled', 'enabled={False}'],
          [':checked, :selected, :expanded', 'the attribute is true'],
          [':first-child, :last-child', 'it is the first or last visible child of its container']
        ] },
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
opened = state(0)
</script>

<window title="States" width={400} height={240}>
  <column padding={24} gap={12}>
    <row class="tile" on:click={opened += 1} label="Open the tile">
      <text>Hover or click this tile</text>
    </row>
    <text>Opened {opened} times</text>
  </column>
</window>

<style>
.tile { padding: 16px; border-radius: var(--radius); background: var(--surface); transition: background 150ms; }
.tile:hover { background: var(--surface-alt); }
.tile:pressed { background: var(--pressed); }
</style>`,
        expected: 'The tile changes color smoothly under the pointer and darkens while pressed. Each click, or Space after reaching it with Tab, increases the count.'
      },
      {
        id: 'inline-style',
        title: 'Inline styles for computed values',
        body: 'style="gap: 4px; background: #222" styles one element with the same properties as a rule. style={{"width": f"{percent}%", "background": color}} takes values computed in Python and updates when they change. Inline styles beat rules and states, so a :hover rule cannot override them.',
        language: 'janel',
        code: `<!-- percent is a number state. -->
<flex style={{"width": f"{percent}%", "background": "var(--primary)", "height": 8}} />`,
        pitfalls: [
          'If a :hover rule seems ignored, check whether the same property is set in style= on the element.'
        ]
      },
      {
        id: 'themes',
        title: 'Theme tokens and the theme API',
        body: 'A token is a named design value from the active theme. var(--primary) means "the accent color of the current theme". When the theme changes, every token updates, so colors stay consistent across the application. JanelKit has a light theme, used by default, and a dark one.\n\nThe theme object switches and customizes themes. theme.name is reactive, so the template can show it.',
        table: { headers: ['Tokens', 'Use'], rows: [
          ['--bg, --surface, --surface-alt', 'Backgrounds: window, cards and fields, secondary areas'],
          ['--text, --text-muted', 'Main and secondary text'],
          ['--border', 'Borders'],
          ['--primary, --on-primary', 'Accent color and text on it'],
          ['--danger, --on-danger, --success, --warning', 'Status colors'],
          ['--hover, --pressed', 'Translucent layers for interaction'],
          ['--radius-sm, --radius, --radius-lg', 'Corner radii (4, 8, 14)'],
          ['--font-family, --font-size-sm, --font-size, --font-size-lg, --font-size-xl', 'Typography (12, 14, 18, 24)'],
          ['--space-1 … --space-6', 'Spacing (4, 8, 12, 16, 24, 32)']
        ] },
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import theme
</script>

<window title="Themes" width={420} height={240}>
  <column class="page">
    <text>Current theme: {theme.name}</text>
    <button on:click={theme.toggle()}>Switch light / dark</button>
  </column>
</window>

<style>
.page { padding: 24px; gap: 16px; background: var(--bg); }
</style>`,
        explanation: [
          'theme.toggle() switches between light and dark when the button is clicked.',
          'theme.set("dark") selects a theme by name; theme.extend(brand="#7048e8") adds or changes tokens; theme.define("sepia", base="light", bg="#f4ecd8") creates a new theme.',
          'Token names with underscores are written with hyphens in styles: brand_dark becomes var(--brand-dark).'
        ],
        expected: 'Current theme: light at first. The button switches the whole window to the dark palette and the text to Current theme: dark.'
      },
      {
        id: 'limits',
        title: 'Stay inside the supported subset',
        body: 'Supported: colors and backgrounds, borders per side and radii per corner, padding and margin, gap, the flexbox properties, fonts and text properties, opacity, transform, box-shadow, outline, cursor, overflow, position (relative, absolute, fixed) with z-index, and transitions of color, background, border color, opacity, size, radius and transform. An unsupported property or value produces a warning and is ignored; an unsupported selector or an at-rule such as @media or @keyframes is a compile error. The Style reference lists every property, value and element.\n\nText properties such as color and font-size set on a box are inherited by the <text> elements inside it, even inside child components. A box can also define its own variables, --accent: var(--primary), read with var(--accent) by what it contains.',
        pitfalls: [
          'Eight-digit hex colors are #aarrggbb (alpha first), not the browser’s #rrggbbaa.',
          'A misspelled color name such as blu compiles, but the application then refuses to start. Prefer theme tokens over color names.',
          'Do not remove focus outlines to make screenshots cleaner; visible focus is how keyboard users find their place.'
        ],
        see: ['style-reference', 'accessibility']
      }
    ],
    summary: [
      'Rules select elements by class, element or state; they are local to the component.',
      'class:x={condition} and class={…} apply classes from data.',
      'Use theme tokens for colors and sizes so the whole app can switch themes.'
    ]
  }
];
