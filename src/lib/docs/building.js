// Guide · Part 3 · Building applications.
// Sources (read-only): JanelKit/docs/lenguaje.md (Componentes, Props y eventos, Slots,
// Estilos en la etiqueta, Ciclo de vida, Contexto, Preguntar antes de salir, Varias
// ventanas, Trabajo asíncrono, Temporizadores), docs/patrones.md (Vistas ocultas) and
// docs/api.md (0.2), cross-checked against packages/janelkit/src/janelkit and by running
// every complete example headless. Page stacks and persisted moved to ./router.js and
// ./store.js with their packages.
export const buildingDocs = [
  {
    slug: 'components',
    title: 'Components',
    description: 'Split an interface into files: give each piece inputs (props), let it report actions (events), and pass it content (slots).',
    learn: [
      'When to extract a component and how to import it.',
      'How props pass data in, and why a child cannot change them.',
      'How events report actions back to the parent.',
      'How slots let the parent supply content, and how styles reach a component’s root.'
    ],
    sections: [
      {
        id: 'why',
        title: 'Why split an interface into components',
        body: 'A component is one .janel file: a named piece of interface with its own data and logic. You already wrote one, App.janel. Extract a new component when a piece repeats, when a file becomes hard to read, or when a piece has a clear job of its own, such as a list row, a card or an editor.\n\nEach use of a component is an instance with its own script run and its own state. A component talks to its parent through a small, explicit contract: props are the data it receives, events are the actions it reports, and slots are the content the parent places inside it.',
        table: { headers: ['Direction', 'Mechanism', 'Example'], rows: [
          ['Parent → child: data', 'Prop', '<Greeting name="Ada" />'],
          ['Child → parent: something happened', 'Event', '<NameEditor on:saved={accept} />'],
          ['Parent → child: content', '<slot>', '<Card><text>Inside the card</text></Card>']
        ] }
      },
      {
        id: 'first-component',
        title: 'Your first component, used twice',
        body: 'Save the child in src/components and import it in the parent’s script with Python syntax. Use it as a tag whose name starts with a capital letter. The compiler finds the .janel file, compiles it once and checks every use.\n\nThe two counters below come from the same file but are separate instances: each has its own count.',
        files: [
          { path: 'src/components/Counter.janel', code: `<script lang="python">
from janelkit import state
count = state(0)
</script>

<row gap={8}>
  <text>Count: {count}</text>
  <button on:click={count += 1}>Add</button>
</row>` },
          { path: 'src/App.janel', code: `<script lang="python">
from components.Counter import Counter
</script>

<window title="Two counters" width={360} height={200}>
  <column padding={24} gap={12}>
    <Counter />
    <Counter />
  </column>
</window>` }
        ],
        explanation: [
          'from components.Counter import Counter loads src/components/Counter.janel. from components import Counter does the same; from .Counter import Counter is relative to the importing file.',
          'Counter’s root is a <row>, not a <window>: components used inside others become part of a window.',
          'Each <Counter /> runs Counter’s script again, so each gets its own count.'
        ],
        expected: 'Two lines show Count: 0. Clicking the first Add changes only the first line to Count: 1.'
      },
      {
        id: 'props',
        title: 'Props: data the parent passes in',
        body: 'A prop is an input chosen by the parent. In the child, declare it at the top level of the script: name = prop() makes it required, name = prop(default) makes it optional. A type annotation such as name: str = prop() lets the compiler reject wrong literal values, and wrong values that arrive while running are logged.\n\nIn the child, read a prop like state: name.value in Python, {name} in the template. In the parent, a quoted value or a fixed literal is passed once; an expression in braces is re-evaluated, so the child updates when the parent’s data changes.',
        files: [
          { path: 'src/components/Greeting.janel', code: `<script lang="python">
from janelkit import prop

name: str = prop()            # required
excited: bool = prop(False)   # optional, False by default
</script>

<text>Hello, {name}{"!" if excited else "."}</text>` },
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import state
from components.Greeting import Greeting

who = state("Ada")
</script>

<window title="Props" width={380} height={220}>
  <column padding={24} gap={12}>
    <textfield bind:value={who} label="Name" />
    <Greeting name={who} />
    <Greeting name="Grace" excited />
  </column>
</window>` }
        ],
        explanation: [
          'name={who} is an expression, so the first greeting follows the text field.',
          'name="Grace" is a constant. excited is a bare attribute, which means excited={True}.',
          'Leaving out a required prop, or passing a prop the child does not declare, is a compile error that names the problem.'
        ],
        expected: 'Hello, Ada. and Hello, Grace! at first. Replacing the name with Lin changes the first line to Hello, Lin.',
        pitfalls: [
          'Props are read-only in the child: assigning name.value raises PropError. Copy the value into local state to edit it, or ask the parent with an event.',
          'Declare props at the top level of the script, never inside a function.'
        ]
      },
      {
        id: 'events',
        title: 'Events: the child reports, the parent decides',
        body: 'A child does not change its parent’s data. It reports what happened, and the parent decides what to do. Declare saved = event() in the child and call saved.emit(value); the parent listens with on:saved={handler}, and the handler receives the emitted values. An event nobody listens to does nothing.\n\nThis keeps one owner for each piece of data. Below, the editor keeps a local draft while the user types; only Save sends the result up, and the parent updates its own state.',
        files: [
          { path: 'src/components/NameEditor.janel', code: `<script lang="python">
from janelkit import prop, event, state

name = prop()
saved = event()
draft = state(name.value)     # a local copy the user can edit

def save():
    saved.emit(draft.value.strip())
</script>

<row gap={8}>
  <textfield bind:value={draft} label="New name" />
  <button on:click={save}>Save</button>
</row>` },
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import state
from components.NameEditor import NameEditor

name = state("Ada")

def accept(value):
    name.value = value
</script>

<window title="Events" width={420} height={200}>
  <column padding={24} gap={12}>
    <text>Saved: {name}</text>
    <NameEditor name={name} on:saved={accept} />
  </column>
</window>` }
        ],
        explanation: [
          'draft starts as a copy of the prop. Typing changes the draft, not the parent.',
          'saved.emit(...) calls the parent’s handler with the cleaned-up text.',
          'accept is the parent’s decision: it stores the value in the parent’s own state.'
        ],
        expected: 'Typing Ada Byron in the field leaves Saved: Ada unchanged. Clicking Save changes it to Saved: Ada Byron.',
        pitfalls: [
          'The draft copies the prop once, when the editor is created. If the parent changes name later, the draft does not follow; recreate the editor with {#key} if that is what you need.'
        ]
      },
      {
        id: 'slots',
        title: 'Slots: content the parent places inside',
        body: 'A prop passes a value; a slot passes a piece of template. In the child, <slot /> marks where the parent’s content goes, and <slot name="footer"> is a named slot. Content written inside a <slot> tag is the fallback, shown when the parent supplies nothing.\n\nIn the parent, elements without a slot attribute go to the default slot; an element with slot="footer" goes to that slot. <slot> content belongs to the parent: it sees the parent’s state and functions, even though the child decides where it appears.',
        files: [
          { path: 'src/components/Card.janel', code: `<script lang="python">
from janelkit import prop
title = prop()
</script>

<column class="card">
  <text class="title">{title}</text>
  <slot />
  <row gap={8}><slot name="footer"><text>No actions</text></slot></row>
</column>

<style>
.card { padding: 16px; gap: 8px; border: 1px solid var(--border); border-radius: var(--radius); }
.title { font-weight: 600; }
</style>` },
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import state
from components.Card import Card

message = state("Ready")
</script>

<window title="Slots" width={420} height={320}>
  <column padding={24} gap={12}>
    <Card title="Task">
      <text>{message}</text>
      <button slot="footer" on:click={message = "Done"}>Finish</button>
    </Card>
    <Card title="Empty card" />
  </column>
</window>` }
        ],
        explanation: [
          '<text>{message}</text> has no slot attribute, so it goes to the default <slot />.',
          'The <button> with slot="footer" replaces the fallback text of the footer slot.',
          'The second card supplies nothing, so its footer shows the fallback No actions.',
          'message belongs to App; the card only decides where the content appears.'
        ],
        expected: 'The first card shows Ready and a Finish button; the second shows No actions. Finish changes Ready to Done.',
        pitfalls: [
          'Passing content to a slot name the child does not declare is a compile error: <Card> no admite el slot \'header\' ("does not accept the slot"), followed by a hint that lists the slots the child declares.',
          'Filling one named slot twice is also a compile error. Wrap several elements for one slot in a <row> or <column> with that slot attribute.'
        ]
      },
      {
        id: 'tag-attributes',
        title: 'Style and wire a component like an element',
        body: 'When a component’s root is a box (flex, <column> or <row>), attributes on its tag that it does not declare as props pass to that root: class, style, id, label, flex, width, height, visible, ref and native events such as on:click. That lets you use a component like a built-in element, and the parent’s style rules, including :hover, apply to the root.\n\nIf the component declares a prop or event with the same name, the declaration wins. Setting inherit_attrs = False in the child’s script turns this off. When the root is not a box, layout attributes go to an outer box that wraps the component, and an undeclared event is a compile error.',
        files: [
          { path: 'src/components/Tile.janel', code: `<script lang="python">
from janelkit import prop
title = prop()
</script>

<column class="tile">
  <text>{title}</text>
</column>

<style>
.tile { padding: 16px; border-radius: var(--radius); background: var(--surface); }
</style>` },
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import state
from components.Tile import Tile

opened = state(0)
</script>

<window title="Tiles" width={380} height={240}>
  <column padding={24} gap={12}>
    <Tile title="Reports" class="featured" on:click={opened += 1} label="Open reports" />
    <text>Opened {opened} times</text>
  </column>
</window>

<style>
.featured { border: 1px solid var(--primary); }
.featured:hover { background: var(--surface-alt); }
</style>` }
        ],
        explanation: [
          'Tile declares only title. class, on:click and label pass to its root <column>.',
          'App’s .featured rule styles Tile’s root, including the :hover state.',
          'on:click works without Tile declaring an event, because the root is a box.'
        ],
        expected: 'The tile has an accent border and changes background under the pointer. Each click increases Opened 0 times.'
      },
      {
        id: 'lifetime',
        title: 'Decide where state should live',
        body: 'A component keeps its local state for as long as the instance exists. Updating a prop does not run the child’s script again, so values copied from props during setup do not follow later changes. Removing a component with {#if} destroys its state; {#hidden} keeps it; {#key} recreates it on purpose.\n\nBefore building a component, decide who owns each value. Data the rest of the application needs belongs in the parent or in a shared module; temporary edits belong in the child until the user confirms them.',
        steps: [
          'List the values the parent owns and declare a prop for each.',
          'Keep temporary edits in local state.',
          'Emit an event at the moment of decision, such as Save.',
          'Test two instances side by side, and removing and showing the component again.'
        ],
        see: ['conditions-and-lists', 'sharing-data']
      }
    ],
    summary: [
      'A component is a .janel file; import it by its path under src and use it as a tag.',
      'Props pass data in and are read-only; events report actions out.',
      'Slots pass content in; tag attributes reach a component’s root box.'
    ]
  },
  {
    slug: 'lifecycle',
    title: 'Lifecycle and effects',
    description: 'What happens when a component is created, shown, updated and removed, how to run code at each moment, and who cleans up.',
    learn: [
      'The moments in a component’s life and what to do in each.',
      'How on_mount, on_destroy and cleanup functions work.',
      'How effects react to changes, and how to stop them.',
      'Which work stops on its own when a component is removed.'
    ],
    sections: [
      {
        id: 'moments',
        title: 'Four moments in a component’s life',
        body: 'Setup runs the script: state, functions and registrations are created. Mount happens when the view exists, so controls can be focused. Updates happen many times while the instance lives; they never run the script again. Destroy happens when the instance is removed: an {#if} branch closes, a list row is deleted, a page is discarded, the application closes.',
        table: { headers: ['Moment', 'Happens', 'Do here'], rows: [
          ['Setup', 'Once, when the instance is created', 'Create state, define functions, register hooks.'],
          ['Mount', 'Once, when the view exists', 'Focus a field, measure, start work that needs the view.'],
          ['Update', 'Every time read data changes', 'Nothing by hand: bindings and effects react.'],
          ['Destroy', 'Once, when the instance is removed', 'Release what you started: connections, subscriptions.']
        ] }
      },
      {
        id: 'register-during-setup',
        title: 'Register hooks while the script runs',
        body: 'on_mount(fn), on_destroy(fn) and before_leave(fn) register a function for the current component; each also works as a decorator. Registration must happen while the script runs, at the top level or in a helper called from it. The same rule applies to provide, inject and is_visible, and to the page stacks of janelkit-router. A later button click is too late: calling them from a handler raises RuntimeError.',
        pitfalls: [
          'Do not call on_destroy inside a click handler to attach cleanup after an operation. Register it during setup.'
        ]
      },
      {
        id: 'on-mount',
        title: 'on_mount: when the view exists',
        body: 'During setup the controls do not exist yet. on_mount runs once, after the component’s view and its children’s views exist; children mount before their parent. If the function returns another function, that one is a cleanup that runs when the component is destroyed. Return the function itself, not the result of calling it.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state, ref, on_mount

name = state("Ada")
field = ref()

@on_mount
def prepare():
    field.focus()
    field.select_all()
    print("mounted")
    return lambda: print("mount cleanup")
</script>

<column padding={24} gap={12}>
  <textfield ref={field} bind:value={name} label="Name" />
  <text>Hello, {name}</text>
</column>`,
        explanation: [
          'ref() creates a handle; ref={field} attaches it to the <textfield> when the field exists.',
          'In on_mount the field exists, so focus() and select_all() act on it.',
          'The returned lambda is stored and called when the component is destroyed.'
        ],
        expected: 'The window opens with the name selected and ready to be replaced, and prints mounted. Closing it prints mount cleanup.',
        see: ['refs']
      },
      {
        id: 'cleanup-order',
        title: 'on_destroy, and the order of cleanups',
        body: 'on_destroy(fn) runs fn when the component is destroyed. Cleanups run in the reverse order of registration: the last thing registered is released first. on_destroy registers during setup; an effect registers when it is created; a mount cleanup registers later, when on_mount runs. So in the example below the mount cleanup runs first and the destroy callback last.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import on_destroy, effect, on_mount

on_destroy(lambda: print("destroy callback"))

def observe():
    return lambda: print("effect cleanup")
effect(observe)

@on_mount
def mounted():
    return lambda: print("mount cleanup")
</script>

<text>Close the window to see the cleanup order.</text>`,
        expected: 'Closing the window prints mount cleanup, then effect cleanup, then destroy callback.',
        pitfalls: [
          'Destroy callbacks are not awaited. Do not rely on an async on_destroy to finish saving data.',
          'Write each cleanup so it releases only its own resource, without depending on the order of others.'
        ]
      },
      {
        id: 'effects',
        title: 'Effects: do something when data changes',
        body: 'An effect is for acting outside the interface when data changes: logging, saving a preference, keeping a connection in sync. It is not for calculating a value; use computed for that. effect(fn) runs fn at once and records the state it reads; whenever one of those changes, it runs fn again. If fn returns a function, that is its cleanup, called before the next run and when the effect ends.\n\nAn effect created in a component ends with the component. You can end it earlier with dispose() on the object effect returns. An effect created in an ordinary module, outside any component, has no owner: keep it and call dispose() yourself.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state, effect
channel = state("news")

def watch_channel():
    name = channel.value
    print("Start", name)
    return lambda: print("Stop", name)

watcher = effect(watch_channel)

def stop_watching():
    watcher.dispose()
</script>

<column padding={24} gap={12}>
  <text>Channel: {channel}</text>
  <button on:click={channel = "sports"}>Choose sports</button>
  <button on:click={stop_watching}>Stop watching</button>
</column>`,
        explanation: [
          'The effect reads channel, so it reruns whenever channel changes.',
          'The returned lambda remembers the name of the run that created it, so it stops the right channel.',
          'watcher.dispose() ends the effect early; the label keeps updating because it is a binding, not part of the effect.'
        ],
        expected: 'Setup prints Start news. Choosing sports prints Stop news, then Start sports. Stop watching prints Stop sports; the label still changes, but the effect no longer runs.',
        pitfalls: [
          'Do not write a state that the same effect reads and changes every time: that is an endless loop.',
          'Only reads made while fn runs synchronously count. Reads after an await are not tracked.'
        ],
        see: ['computed', 'reactivity-in-depth']
      },
      {
        id: 'owned-work',
        title: 'What stops on its own',
        body: 'Work started by a component belongs to it and is released when it is destroyed. A list row releases its own work when the row is deleted. Only resources that JanelKit does not know about, such as a socket or a file you opened yourself, need an explicit cleanup.',
        table: { headers: ['Started in a component', 'When the component is destroyed'], rows: [
          ['effect(...)', 'Disposed; its last cleanup runs.'],
          ['@task, spawn(...), async handlers', 'Cancelled.'],
          ['interval(...), timeout(...)', 'Stopped.'],
          ['open_window(...)', 'The window closes.'],
          ['A connection or file you opened', 'Nothing: release it in on_destroy or in a cleanup.']
        ] },
        pitfalls: [
          'Hiding is not destroying. Content inside {#hidden}, a list row scrolled out of view, and a covered page or inactive section of janelkit-router stay alive. What they show waits and catches up when they are seen again, but their effects, timers and tasks keep running. is_visible() tells a component whether it is seen; see Timers.',
          'before_leave asks permission to close a window or leave a page; it is not a cleanup hook. Release resources in on_destroy.'
        ],
        see: ['async', 'timers', 'windows']
      }
    ],
    summary: [
      'Setup runs once; mount happens when the view exists; destroy releases the instance.',
      'Register hooks during setup; cleanups run in reverse order of registration.',
      'Effects react to the state they read; work started in a component stops with it.'
    ]
  },
  {
    slug: 'sharing-data',
    title: 'Sharing data',
    description: 'Choose between props, a shared Python module and context to give several components access to the same data.',
    learn: [
      'Three ways to share data, and when each one fits.',
      'How a Python module holds state for the whole application.',
      'How provide and inject share a value with one part of the tree.'
    ],
    sections: [
      {
        id: 'three-ways',
        title: 'Three ways to share, three different reaches',
        body: 'Props reach one child, explicitly. A Python module reaches the whole application: every component that imports it sees the same objects, because Python imports a module only once. Context reaches the descendants of one component, which is useful when the value depends on where a component sits, such as the current project in one of several panels.',
        table: { headers: ['Mechanism', 'Reach', 'Use it for'], rows: [
          ['Prop', 'One child', 'A direct, visible input. The default choice.'],
          ['Python module with state', 'The whole application', 'A data service, the shared values of a small app, objects with state of their own.'],
          ['A store (janelkit-store)', 'The whole application, every window', 'The application’s data: the user, the documents, a cart. Actions, change tracking and a fresh instance in each test.'],
          ['provide / inject', 'Descendants of one component', 'A value that depends on position in the tree, without passing it through every level.']
        ] }
      },
      {
        id: 'module-store',
        title: 'A shared module: one source of truth for the whole app',
        body: 'Put state and the functions that change it in an ordinary module under src/services. Every component that imports it reads and changes the same data, and every binding that reads it updates. The module has no interface, so it is also easy to test with plain Python.',
        files: [
          { path: 'src/services/cart.py', language: 'python', code: `from janelkit import state

items = state([])

def add(name):
    items.value.append(name)

def clear():
    items.value.clear()` },
          { path: 'src/components/CartBadge.janel', code: `<script lang="python">
from services.cart import items
</script>

<text>Cart: {len(items)} item(s)</text>` },
          { path: 'src/App.janel', code: `<script lang="python">
from services import cart
from services.cart import items
from components.CartBadge import CartBadge
</script>

<window title="Shop" width={420} height={260}>
  <column padding={24} gap={12}>
    <CartBadge />
    <row gap={8}>
      <button on:click={cart.add("Apple")}>Add an apple</button>
      <button on:click={cart.clear()}>Empty the cart</button>
    </row>
    <text>{", ".join(items) or "The cart is empty."}</text>
  </column>
</window>` }
        ],
        explanation: [
          'cart.py creates items once, the first time it is imported. Both components get the same object.',
          'CartBadge only reads; App changes the cart through the module’s functions, so the rules for changing it live in one place.',
          'Import the state by name (from services.cart import items) to use it in templates without .value: templates unwrap names, not attributes.'
        ],
        expected: 'Cart: 0 item(s) and The cart is empty. at first. Each Add an apple updates both lines: Cart: 1 item(s) and Apple. Empty the cart resets both.',
        see: ['store'],
        pitfalls: [
          'Module state lives as long as the Python process. In tests that mount the app several times in one process, it is not reset between mounts; give the module a reset function, or use a store, whose use() gives each mount a fresh instance.',
          'An effect or timer created at the top level of a module has no component owner; stop it yourself.'
        ]
      },
      {
        id: 'provide-inject',
        title: 'Context: share with one part of the tree',
        body: 'provide(key, value) makes a value available to every descendant of the current component. inject(key) in any descendant, at any depth, returns the value from the nearest ancestor that provides it. Without a provider it raises LookupError; inject(key, default) returns the default instead. Both are called during setup.\n\nThe value is shared as is. To make it reactive, share a state, or an object that contains states, not a plain string.',
        files: [
          { path: 'src/components/WorkspaceBadge.janel', code: `<script lang="python">
from janelkit import inject
workspace = inject("workspace")
</script>

<text>Workspace: {workspace}</text>` },
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import provide, state
from components.WorkspaceBadge import WorkspaceBadge

workspace = state("Studio")
provide("workspace", workspace)
</script>

<window title="Context" width={380} height={200}>
  <column padding={24} gap={12}>
    <WorkspaceBadge />
    <button on:click={workspace = "Lab"}>Change workspace</button>
  </column>
</window>` }
        ],
        explanation: [
          'App provides the state object itself, under the key "workspace".',
          'WorkspaceBadge injects that same object, so its text follows the changes.',
          'Nothing in between had to pass the value as a prop.'
        ],
        expected: 'Workspace: Studio at first; Workspace: Lab after the click.'
      },
      {
        id: 'override',
        title: 'Override context for one subtree',
        body: 'A component in the middle can provide the same key with another value. Its descendants receive the nearer value, while the rest of the tree keeps the original. That is how two panels can show two different projects with the same components. A secondary window inherits context from the component that opens it, and the pages of a janelkit-router stack inherit it from the component that creates the stack.',
        language: 'python',
        code: `# Script of a middle component, such as a preview panel.
from janelkit import provide, state

preview_workspace = state("Preview")
provide("workspace", preview_workspace)   # its descendants now see "Preview"`,
        pitfalls: [
          'inject chooses the value once, during setup. Change the contents of the shared state, not which object is provided.',
          'Use a default only for optional values. A missing required provider should fail loudly, so the error points at the real mistake.'
        ]
      }
    ],
    summary: [
      'Prefer props; use a store or a module for application-wide data; use context for data tied to a subtree.',
      'A module with state is one shared source of truth; change it through its functions.',
      'provide and inject share the object itself; share state to keep it reactive.'
    ]
  },
  {
    slug: 'refs',
    title: 'Refs: control an element from code',
    description: 'Reach a specific element from Python to move focus, select text or scroll a list, and react when it appears or disappears.',
    learn: [
      'When code needs a handle to an element instead of state.',
      'How a ref attaches, detaches and reports whether its element exists.',
      'Which helpers a ref offers, and their limits.'
    ],
    sections: [
      {
        id: 'when',
        title: 'State describes, refs act',
        body: 'Almost everything on screen follows state: you change data and the interface updates. A few actions are not data but commands to one element: put the cursor in this field, select its text, scroll this list to the end. For those, give the element a ref.\n\nfield = ref() in the script creates an empty handle; ref={field} on an element attaches it. field.value is reactive: None until the element exists, the element once it does, and None again when it is destroyed.',
        table: { headers: ['Member', 'What it does'], rows: [
          ['focus() / blur()', 'Gives or removes keyboard focus.'],
          ['select_all()', 'Selects all the text of a <textfield> or <textarea>.'],
          ['scroll_to_start() / scroll_to_end() / scroll_to(…)', 'Scrolls a <list> or a <scroll>. In a <list>, scroll_to takes a row index; in a <scroll>, the ref of an element inside it, which it brings fully into view. scroll_to_end also resumes following new rows with follow.'],
          ['exists', 'True while the element exists. Reactive.'],
          ['focused', 'Whether the element, or something inside it, has focus. Not reactive: read it in a handler.'],
          ['value', 'The underlying Qt Quick item, or None. A Qt interface, not JanelKit’s: last resort only.']
        ] }
      },
      {
        id: 'focus-a-field',
        title: 'Focus a field from a button',
        body: 'The methods do nothing while the element does not exist, so calling them too early fails silently. During setup the view does not exist yet; call them from on_mount or from a handler.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state, ref

name = state("Ada Lovelace")
field = ref()
</script>

<column padding={24} gap={12}>
  <textfield ref={field} bind:value={name} label="Name" />
  <row gap={8}>
    <button on:click={field.focus()}>Edit name</button>
    <button on:click={field.select_all()}>Select all</button>
  </row>
</column>`,
        explanation: [
          'ref={field} attaches the handle when the <textfield> is created.',
          'Each button sends one command to that specific field.',
          'name still holds the text; the ref only controls the element.'
        ],
        expected: 'Edit name puts the cursor in the field. Select all selects Ada Lovelace, so typing replaces it.',
        see: ['lifecycle']
      },
      {
        id: 'conditional',
        title: 'React when an element appears',
        body: 'A component’s on_mount runs once, so it does not run again when a field inside {#if} appears later. The ref knows: exists changes when the element is created or destroyed. An effect that reads it runs at each change, which lets you focus a field every time it appears, with no delays or guesses.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state, ref, effect

editing = state(False)
name = state("Ada")
field = ref()

def focus_when_shown():
    if field.exists:
        field.focus()
        field.select_all()

effect(focus_when_shown)
</script>

<column padding={24} gap={12}>
  <button on:click={editing = not editing}>{"Done" if editing else "Rename"}</button>
  {#if editing}
    <textfield ref={field} bind:value={name} label="Name" />
  {:else}
    <text>Name: {name}</text>
  {/if}
</column>`,
        explanation: [
          'The effect reads field.exists, so it reruns when the field is created or destroyed.',
          'Each Rename creates a new <textfield>; the effect focuses it and selects its text.',
          'name belongs to the component, not to the field, so the text survives each Done.'
        ],
        expected: 'Rename shows the field with Ada selected. Type Grace and click Done: Name: Grace. Rename again shows Grace selected.'
      },
      {
        id: 'limits',
        title: 'Limits',
        body: 'A ref points to one element. It is not a way to read values: read state instead, which is reactive and testable.',
        pitfalls: [
          'One ref reused inside {#each} points to the last row created, not to every row.',
          'select_all() on an element without text raises TypeError; the scroll helpers only work on <list> and <scroll>.',
          'A ref on a component whose root is a box targets that root, not an input inside the component.',
          'Prefer the helpers to ref.value: Qt’s item API is not part of JanelKit’s contract and may change.'
        ],
        see: ['large-lists']
      }
    ],
    summary: [
      'Use state for what is shown and refs for commands to one element.',
      'A ref is None until its element exists; exists is reactive.',
      'focus, blur, select_all and the scroll helpers do nothing while the element is missing.'
    ]
  },
  {
    slug: 'windows',
    title: 'Windows and screens',
    description: 'Open more windows, keep one of each kind, choose the screen a window uses, go full screen and ask before a window closes.',
    learn: [
      'How open_window opens a component in its own window, with props and events.',
      'How single=True brings an open window to the front instead of opening another.',
      'How to choose a screen and go full screen with <window screen> and fullscreen.',
      'How before_leave asks before the user closes a window.'
    ],
    sections: [
      {
        id: 'open-window',
        title: 'Open another window',
        body: 'open_window(Component, **props) opens an imported component in its own window. Keyword arguments are its props and on_name arguments its events, as in a template: on_saved=accept listens to saved = event(). A state passed as a prop stays reactive in the new window, and an unknown prop is a TypeError that lists the ones available.\n\nmodal=True blocks the window that opened it while it is open, and theme="dark" gives it its own theme without changing the application’s. The new window inherits context (inject) from the component that opens it, stays in front of its window, and closes on its own when that component is destroyed. Closing the main window closes the windows it opened.',
        files: [
          { path: 'src/components/Settings.janel', code: `<window title="Settings" width={360} height={220}>
  <column padding={24}>
    <text>Settings window</text>
  </column>
</window>` },
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import open_window, state
from components.Settings import Settings

window = state(None)

def open_settings():
    window.value = open_window(Settings, modal=True, theme="dark")
</script>

<window title="Main" width={380} height={200}>
  <column padding={24} gap={12}>
    <button on:click={open_settings}>Open settings</button>
  </column>
</window>` }
        ],
        explanation: [
          'Settings is an ordinary component. Its <window> root sets the title and size of its own window.',
          'open_window returns a handle with a reactive is_open, close(), focus() and instance (the component’s namespace).',
          'Each call opens a new window unless you ask for single=True, described next.'
        ],
        expected: 'Open settings shows a separate dark window; while it is open, the main window does not respond. Closing it returns control to the main window.'
      },
      {
        id: 'single',
        title: 'One window of each kind',
        body: 'Settings, About or a log viewer should open once. open_window(Settings, single=True) checks whether a window of that component is already open: if it is, it brings it to the front and returns it instead of opening another. The props of the second call are not applied. This is what a menu item or a shortcut needs, because the user may press it twice.',
        language: 'python',
        code: `# In the main component's script.
from janelkit import open_window
from components.About import About

def show_about():
    open_window(About, single=True)   # a second call focuses the open window`,
        pitfalls: [
          'single=True compares components, not props: opening Document for two different files with single=True shows the first one twice. Keep it for windows that exist once.'
        ]
      },
      {
        id: 'screens',
        title: 'Choose the screen, and go full screen',
        body: 'screens is the reactive list of connected screens. Each Screen has index, name, width, height, x and y (logical pixels of the virtual desktop), primary and scale (physical pixels per logical pixel). It changes by itself when a screen is connected or disconnected, when the primary one changes or when a resolution changes, so a template that reads it stays up to date.\n\n<window screen={i}> opens the window on that screen, by index or by name, and fullscreen={True} shows it full screen. Both follow state: changing screen while full screen leaves full screen, moves the window and enters again. If the screen does not exist, the window stays where it is.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state, screens

target = state(0)
presenting = state(False)
</script>

<window title="Presenter" width={480} height={320} screen={target} fullscreen={presenting}>
  <column padding={24} gap={12}>
    <text>{len(screens)} screen(s) connected</text>
    {#each screens as s (s.index)}
      <button on:click={target = s.index}>{s.name}: {s.width} × {s.height}{" (primary)" if s.primary else ""}</button>
    {/each}
    <switch bind:checked={presenting}>Full screen</switch>
  </column>
</window>`,
        explanation: [
          'screens is unwrapped in the template like a state, so {#each screens} lists the Screen objects.',
          'Each button moves the window to that screen by setting target.',
          'The switch writes presenting, and fullscreen follows it.'
        ],
        expected: 'The window lists every connected screen with its size. Clicking one moves the window there; turning on Full screen fills that screen, and turning it off restores the window.',
        pitfalls: [
          'screens is empty until the application starts, so read it in the template or after mounting, not at import time.',
          'Index 0 is not always the primary screen. Use s.primary, or a screen’s name, when it matters which one you get.'
        ]
      },
      {
        id: 'before-leave',
        title: 'Ask before a window closes',
        body: 'before_leave(fn) registers a question in the script of a component. When the user closes the window that shows it with the X, fn is called; if it returns False, the window stays open. fn can be async, for example to ask with a confirmation dialog. Closing the main window also asks the windows it opened.\n\nClosing from code with handle.close() does not ask: your code already decided. The same before_leave is also asked by a host that is about to discard the component, such as a page of janelkit-router when the user goes back.',
        language: 'python',
        code: `# In the script of an editor component.
from janelkit import state, before_leave

unsaved = state(False)

@before_leave
def may_close():
    return not unsaved.value     # False keeps the window open`,
        pitfalls: [
          'A guard is not a cleanup: when it refuses, the window must keep working. Release resources in on_destroy.',
          'Keep the question quick and honest. A guard that always returns False traps the user.'
        ],
        see: ['router-leaving', 'lifecycle']
      }
    ],
    summary: [
      'open_window opens a component in its own window; props and on_ events work as in templates.',
      'single=True reuses an open window; modal=True blocks its opener.',
      'screens lists the screens; <window screen fullscreen> places the window and follows state.',
      'before_leave asks before the user closes a window with the X.'
    ]
  },
  {
    slug: 'async',
    title: 'Async work',
    description: 'Keep the window responsive while waiting: async handlers, tasks with loading and error states, background threads and cancellation.',
    learn: [
      'Why waiting must not block the interface thread.',
      'How async handlers and @task keep the window responsive.',
      'How to run blocking code in background, and what workers may not touch.',
      'What cancellation does, and what it cannot undo.'
    ],
    sections: [
      {
        id: 'blocking',
        title: 'Waiting is not the same as blocking',
        body: 'The window can only repaint and react to clicks while its thread is free. A function that sleeps, downloads or reads a large file on that thread freezes the whole window until it finishes.\n\nasync def lets a function wait without blocking: at each await, the thread is free to do other work, and the function continues later. JanelKit runs asyncio on Qt’s event loop (through qasync), so coroutines run on the interface thread and can change state directly after an await. Async does not mean another thread: code between awaits still runs on the interface thread, so a long calculation inside async def still freezes the window. For that, use background.',
        table: { headers: ['Your situation', 'Use'], rows: [
          ['A library with async functions (httpx, aiohttp…)', 'An async def handler that awaits it.'],
          ['Loading and error states shown on screen', '@task, with .loading, .error and .value.'],
          ['A blocking function (requests, file I/O, heavy CPU)', 'await background(fn, ...) inside async code.'],
          ['Start something without waiting for it', 'spawn(coroutine).'],
          ['Repeat something, or do it later', 'interval and timeout (see Timers).']
        ] },
        pitfalls: [
          'Adding async to a function does not make the blocking code inside it non-blocking.',
          'Never call asyncio.run or time.sleep in a handler: the application already runs the event loop, and sleeping blocks it.'
        ]
      },
      {
        id: 'async-handler',
        title: 'An async event handler',
        body: 'Any handler can be async def. JanelKit starts the coroutine for you when the event happens, so the template does not change. Errors are logged with the handler’s location. This example waits with asyncio.sleep instead of calling a real service, so it runs anywhere.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
import asyncio
from janelkit import state

busy = state(False)
message = state("Ready")

async def save():
    busy.value = True
    try:
        message.value = "Saving…"
        await asyncio.sleep(0.5)       # stands in for a real save
        message.value = "Saved"
    finally:
        busy.value = False
</script>

<column padding={24} gap={12}>
  <button enabled={not busy} on:click={save}>Save</button>
  <text>{message}</text>
</column>`,
        explanation: [
          'busy disables the button while a save is in progress, so it cannot start twice.',
          'While save is waiting, the window keeps responding.',
          'finally clears busy even if the save fails or is cancelled.'
        ],
        expected: 'Save shows Saving… and disables the button; half a second later it shows Saved and the button is enabled again.'
      },
      {
        id: 'task',
        title: '@task: loading, error and result for the screen',
        body: '@task turns an async function into a Task object with three reactive properties the template can show: loading, error and value. task.run(...) starts it, cancelling any previous run that is still going; task.cancel() stops it. The decorator does not start anything by itself.\n\nWhile a new run loads, the previous successful value is kept. A failure stores the exception in error and keeps the old value; you decide what to show.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
import asyncio
from janelkit import state, task

query = state("Ada")

@task
async def lookup(text):
    await asyncio.sleep(0.3)
    if not text.strip():
        raise ValueError("Enter a name")
    return "Hello, " + text.strip()
</script>

<column padding={24} gap={12}>
  <textfield bind:value={query} label="Name" />
  <row gap={8}>
    <button on:click={lookup.run(query)}>Look up</button>
    <button on:click={lookup.cancel()}>Cancel</button>
  </row>
  {#if lookup.loading}
    <text>Loading…</text>
  {:else if lookup.error is not None}
    <text>Error: {lookup.error}</text>
  {:else}
    <text>{lookup.value or "No result yet"}</text>
  {/if}
</column>`,
        explanation: [
          'lookup.run(query) starts a run with the current text; the {#if} chain shows its state.',
          'Raising an exception is the normal way to report a failure: it ends up in lookup.error.',
          'Clicking Look up again while loading cancels the previous run before starting a new one.'
        ],
        expected: 'Look up shows Loading… and then Hello, Ada. Emptying the field and looking up again shows Error: Enter a name.'
      },
      {
        id: 'background',
        title: 'background: run blocking code in another thread',
        body: 'await background(fn, *args) runs an ordinary function in a worker thread and gives you its result. Use it for libraries without async support, file access and heavy calculations. The worker must not touch state or the interface: read what you need first, pass it as arguments, and assign the result after the await, back on the interface thread.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
import time
from janelkit import state, task, background

name = state("Ada")

def slow_upper(text):        # an ordinary blocking function
    time.sleep(0.3)
    return text.upper()

@task
async def formatted(text):
    return await background(slow_upper, text)
</script>

<column padding={24} gap={12}>
  <textfield bind:value={name} label="Name" />
  <button on:click={formatted.run(name)}>Format</button>
  <text>{"Working…" if formatted.loading else formatted.value or ""}</text>
</column>`,
        explanation: [
          'slow_upper knows nothing about JanelKit: it receives a string and returns a string.',
          'background runs it in a worker, so the window keeps responding during the sleep.',
          'The result returns to the interface thread and becomes formatted.value.'
        ],
        expected: 'Format shows Working… and then ADA, and the window keeps responding meanwhile.',
        pitfalls: [
          'Writing state from a worker raises a wrong-thread error. Return the data instead.',
          'Do not pass a reactive list to a worker to change it; pass a plain copy.'
        ]
      },
      {
        id: 'cancellation',
        title: 'Cancellation stops the waiting, not the world',
        body: 'Cancelling a task, or destroying the component that owns it, delivers CancelledError at the next await. Let it propagate; use finally for small cleanups. A worker thread started by background cannot be stopped: it runs to the end, but its result is discarded. Cancellation is not a rollback: a request already sent to a server may still take effect.',
        pitfalls: [
          'Do not catch BaseException or CancelledError to carry on as if nothing happened.',
          'A task does not restart when its input state changes; call run again with the new input.'
        ]
      },
      {
        id: 'spawn',
        title: 'spawn: start work without waiting for it',
        body: 'spawn(coroutine) starts a coroutine and returns immediately, for example to load data when a component mounts. When called during setup, in a synchronous handler or in on_mount, the work belongs to the component and is cancelled if the component is destroyed first. Errors are logged, or passed to spawn(coroutine, on_error=fn).',
        language: 'janel', standalone: true,
        code: `<script lang="python">
import asyncio
from janelkit import state, on_mount, spawn

message = state("Loading…")

async def load():
    await asyncio.sleep(0.3)
    message.value = "Ready"

@on_mount
def start():
    spawn(load())
</script>

<text>{message}</text>`,
        expected: 'Loading… appears first and changes to Ready.',
        pitfalls: [
          'Create long-lived tasks and timers during setup. Work created after an await is not automatically owned by the component.'
        ]
      },
      {
        id: 'testing',
        title: 'Test the waiting',
        body: 'In tests, app.wait(until=condition, timeout=2) runs the event loop until the condition holds, and fails with InspectError if the timeout passes first; app.wait(seconds) just runs it for that long. A plain time.sleep in a test would block the very loop that should finish the work. Test the success path, the error path and cancellation separately.',
        language: 'python',
        code: `# tests/test_lookup.py, for the @task example above saved as src/App.janel
from janelkit.inspect import mount

def test_lookup():
    with mount("src/App.janel") as app:
        lookup = app.get("lookup")
        app.find(text="Look up").click()
        assert lookup.loading
        app.wait(until=lambda: not lookup.loading, timeout=2)
        assert lookup.value == "Hello, Ada"`,
        see: ['testing', 'timers']
      }
    ],
    summary: [
      'Never block the interface thread: await async work, run blocking code in background.',
      '@task gives the screen loading, error and value; run starts it, cancel stops it.',
      'Work started by a component is cancelled with it; cancellation does not undo side effects.'
    ]
  },
  {
    slug: 'timers',
    title: 'Timers',
    description: 'Repeat work with interval, delay it with timeout, debounce input, pause a timer while nobody sees it, and know when timers stop.',
    learn: [
      'How interval repeats a function and timeout runs one later.',
      'How to stop, restart and change a timer.',
      'How to debounce typing with timeout.restart.',
      'How when= and is_visible() pause a timer while its component is not seen.',
      'When timers stop on their own and when you must stop them.'
    ],
    sections: [
      {
        id: 'interval',
        title: 'interval: repeat every few milliseconds',
        body: 'interval(ms, fn), or @interval(ms) as a decorator, calls fn every ms milliseconds and returns a Timer. It starts as soon as it is created, so create it during setup. All the state changes of one tick are grouped, so updating fifty values in a tick redraws once.\n\nTimer.active is reactive. stop() pauses it; start() and restart() start counting again from zero. To change the period, set timer.ms and call restart().',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state, interval

ticks = state(0)

@interval(1000)
def clock():
    ticks.value += 1
</script>

<column padding={24} gap={12}>
  <text>Ticks: {ticks}</text>
  <text>Running: {clock.active}</text>
  <row gap={8}>
    <button on:click={clock.stop()}>Stop</button>
    <button on:click={clock.restart()}>Restart</button>
  </row>
</column>`,
        explanation: [
          '@interval(1000) turns clock into a Timer that calls the function every second.',
          'clock.active is reactive, so Running follows Stop and Restart.',
          'Restart starts a fresh one-second wait, it does not reset ticks.'
        ],
        expected: 'Ticks goes up once per second and Running says True. Stop freezes the count and shows Running: False; Restart resumes.'
      },
      {
        id: 'timeout',
        title: 'timeout: do it once, later',
        body: 'timeout(ms, fn) calls fn once after ms milliseconds. Like interval, it starts when it is created and returns a Timer. restart() starts the wait again from zero, which is exactly what debouncing needs: wait until the user stops typing, then act once.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state, timeout

query = state("")
searched = state("nothing yet")

def search():
    searched.value = query.value or "nothing yet"

debounce = timeout(400, search)
debounce.stop()        # do not search until the user types
</script>

<column padding={24} gap={12}>
  <textfield bind:value={query} on:input={debounce.restart()} label="Search" />
  <text>Searched for: {searched}</text>
</column>`,
        explanation: [
          'timeout starts counting at creation; stop() waits for the first keystroke instead.',
          'Every keystroke calls restart(), so the search runs 400 ms after the last one, not after each.',
          'To show a message for a few seconds, create timeout(3000, lambda: notice.set("")) after setting it.'
        ],
        expected: 'Typing ada quickly shows Searched for: ada shortly after the last letter, once.'
      },
      {
        id: 'async-ticks',
        title: 'Async callbacks skip, they do not pile up',
        body: 'A timer’s function can be async def, for example to fetch data with background. If a tick is still running when the next one is due, the next one is skipped instead of starting in parallel. An error in the function is logged with its name, and the timer keeps going.\n\nThe timer measures itself: runs counts the completed runs, skipped the ticks skipped because the previous run was still going, and last_duration is the duration in seconds of the last complete run, async part included. They are not reactive; read them to find out whether a cycle fits in its period. If skipped keeps growing, it does not.',
        language: 'python',
        code: `# In a component script; read_processes is a blocking function of yours.
from janelkit import state, interval, background

processes = state([])

@interval(1000)
async def refresh():
    processes.value = await background(read_processes)`
      },
      {
        id: 'when',
        title: 'Count only while it matters: when=',
        body: 'A component that is not seen still runs its timers: inside {#hidden}, in a list row scrolled out of view, or on a page or section of janelkit-router that is not shown. To avoid work nobody sees, pass a condition: interval(ms, fn, when=condition), and the same for timeout. The condition can be a state, a computed, is_visible() or a function that reads them, such as lambda: visible.value and camera.ready.value. While it is false the timer does not count; when it becomes true again, it counts from zero. stop() wins over when=: a timer stopped by hand does not start again by itself.\n\nis_visible() returns a computed that says whether the component is seen. It is False in a covered page, in a section that is not the current one, inside a {#hidden} that hides it and in a <list> row out of view. The root of a window is always seen; minimizing does not count. Call it in the script, like on_mount.',
        language: 'python',
        code: `# In a component script; read_cpu is a function of yours.
from janelkit import state, interval, is_visible

cpu = state(0.0)
visible = is_visible()

@interval(250, when=visible)
def sample():
    cpu.value = read_cpu()`,
        explanation: [
          'visible is a computed, so the timer follows it without any code of yours.',
          'The same visible can drive an effect, for example to release a camera while the view is hidden.'
        ],
        pitfalls: [
          'when= pauses the timer, not the rest of the script. An effect that saves data keeps running while hidden, which is usually what you want.'
        ],
        see: ['real-time']
      },
      {
        id: 'ownership',
        title: 'When timers stop',
        body: 'A timer created in a component stops when the component is destroyed, also when it was created after an await in a handler or a task. A timer created in an ordinary module, outside any component, runs until you call stop(); JanelKit keeps it alive even if you do not keep a reference. Timers need the application’s event loop: they do not tick during a blocking function, and they do not tick in a plain Python script without the application running.',
        pitfalls: [
          'Do not write a while loop with time.sleep to repeat work; it freezes the window. Use interval.',
          'stop() prevents future ticks; it does not cancel an async tick that is already running.',
          'A timer inside {#hidden}, in a list row out of view or on a covered page keeps running. Give it when=is_visible() if it should pause.'
        ],
        see: ['lifecycle', 'async']
      }
    ],
    summary: [
      'interval repeats, timeout runs once; both start when created and return a Timer.',
      'stop, start and restart control them; active is reactive.',
      'restart on each keystroke debounces input; when= pauses a timer while its component is not seen.'
    ]
  }
];
