// Guide · Part 3 · Building applications.
// Sources (read-only): JanelKit/docs/lenguaje.md (Componentes, Props y eventos, Slots,
// Estilos en la etiqueta, Ciclo de vida, Contexto, persisted, History, Navegación, Varias
// ventanas, Trabajo asíncrono, Temporizadores) and docs/api.md, cross-checked against
// packages/janelkit/src/janelkit and by running every complete example headless.
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
          ['Parent → child: content', 'Slot', '<Card><Text>Inside the card</Text></Card>']
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

<Row gap={8}>
  <Text>Count: {count}</Text>
  <Button on:click={count += 1}>Add</Button>
</Row>` },
          { path: 'src/App.janel', code: `<script lang="python">
from components.Counter import Counter
</script>

<Window title="Two counters" width={360} height={200}>
  <Column padding={24} gap={12}>
    <Counter />
    <Counter />
  </Column>
</Window>` }
        ],
        explanation: [
          'from components.Counter import Counter loads src/components/Counter.janel. from components import Counter does the same; from .Counter import Counter is relative to the importing file.',
          'Counter’s root is a Row, not a Window: components used inside others become part of a window.',
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

<Text>Hello, {name}{"!" if excited else "."}</Text>` },
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import state
from components.Greeting import Greeting

who = state("Ada")
</script>

<Window title="Props" width={380} height={220}>
  <Column padding={24} gap={12}>
    <TextField bind:value={who} label="Name" />
    <Greeting name={who} />
    <Greeting name="Grace" excited />
  </Column>
</Window>` }
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

<Row gap={8}>
  <TextField bind:value={draft} label="New name" />
  <Button on:click={save}>Save</Button>
</Row>` },
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import state
from components.NameEditor import NameEditor

name = state("Ada")

def accept(value):
    name.value = value
</script>

<Window title="Events" width={420} height={200}>
  <Column padding={24} gap={12}>
    <Text>Saved: {name}</Text>
    <NameEditor name={name} on:saved={accept} />
  </Column>
</Window>` }
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
        body: 'A prop passes a value; a slot passes a piece of template. In the child, <Slot /> marks where the parent’s content goes, and <Slot name="footer"> is a named slot. Content written inside a <Slot> tag is the fallback, shown when the parent supplies nothing.\n\nIn the parent, elements without a slot attribute go to the default slot; an element with slot="footer" goes to that slot. Slot content belongs to the parent: it sees the parent’s state and functions, even though the child decides where it appears.',
        files: [
          { path: 'src/components/Card.janel', code: `<script lang="python">
from janelkit import prop
title = prop()
</script>

<Column class="card">
  <Text class="title">{title}</Text>
  <Slot />
  <Row gap={8}><Slot name="footer"><Text>No actions</Text></Slot></Row>
</Column>

<style>
.card { padding: 16px; gap: 8px; border: 1px solid var(--border); border-radius: var(--radius); }
.title { font-weight: 600; }
</style>` },
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import state
from components.Card import Card

message = state("Ready")
</script>

<Window title="Slots" width={420} height={320}>
  <Column padding={24} gap={12}>
    <Card title="Task">
      <Text>{message}</Text>
      <Button slot="footer" on:click={message = "Done"}>Finish</Button>
    </Card>
    <Card title="Empty card" />
  </Column>
</Window>` }
        ],
        explanation: [
          '<Text>{message}</Text> has no slot attribute, so it goes to the default <Slot />.',
          'The Button with slot="footer" replaces the fallback text of the footer slot.',
          'The second card supplies nothing, so its footer shows the fallback No actions.',
          'message belongs to App; the card only decides where the content appears.'
        ],
        expected: 'The first card shows Ready and a Finish button; the second shows No actions. Finish changes Ready to Done.',
        pitfalls: [
          'Passing content to a slot name the child does not declare is a compile error: <Card> no admite el slot \'header\' ("does not accept the slot"), followed by a hint that lists the slots the child declares.',
          'Filling one named slot twice is also a compile error. Wrap several elements for one slot in a Row or Column with that slot attribute.'
        ]
      },
      {
        id: 'tag-attributes',
        title: 'Style and wire a component like an element',
        body: 'When a component’s root is a box (flex, Column or Row), attributes on its tag that it does not declare as props pass to that root: class, style, id, label, flex, width, height, visible, ref and native events such as on:click. That lets you use a component like a built-in element, and the parent’s style rules, including :hover, apply to the root.\n\nIf the component declares a prop or event with the same name, the declaration wins. Setting inherit_attrs = False in the child’s script turns this off. When the root is not a box, layout attributes go to an outer box that wraps the component, and an undeclared event is a compile error.',
        files: [
          { path: 'src/components/Tile.janel', code: `<script lang="python">
from janelkit import prop
title = prop()
</script>

<Column class="tile">
  <Text>{title}</Text>
</Column>

<style>
.tile { padding: 16px; border-radius: var(--radius); background: var(--surface); }
</style>` },
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import state
from components.Tile import Tile

opened = state(0)
</script>

<Window title="Tiles" width={380} height={240}>
  <Column padding={24} gap={12}>
    <Tile title="Reports" class="featured" on:click={opened += 1} label="Open reports" />
    <Text>Opened {opened} times</Text>
  </Column>
</Window>

<style>
.featured { border: 1px solid var(--primary); }
.featured:hover { background: var(--surface-alt); }
</style>` }
        ],
        explanation: [
          'Tile declares only title. class, on:click and label pass to its root Column.',
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
        body: 'on_mount(fn), on_destroy(fn) and before_leave(fn) register a function for the current component; each also works as a decorator. Registration must happen while the script runs, at the top level or in a helper called from it. The same rule applies to provide, inject, pages, sections and navigation. A later button click is too late: calling them from a handler raises RuntimeError.',
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

<Column padding={24} gap={12}>
  <TextField ref={field} bind:value={name} label="Name" />
  <Text>Hello, {name}</Text>
</Column>`,
        explanation: [
          'ref() creates a handle; ref={field} attaches it to the TextField when the field exists.',
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

<Text>Close the window to see the cleanup order.</Text>`,
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

<Column padding={24} gap={12}>
  <Text>Channel: {channel}</Text>
  <Button on:click={channel = "sports"}>Choose sports</Button>
  <Button on:click={stop_watching}>Stop watching</Button>
</Column>`,
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
          'Hiding is not destroying. Content inside {#hidden}, a page covered by another page and an inactive section stay alive and keep their effects, timers and tasks running.',
          'before_leave asks permission to leave a page; it is not a cleanup hook. Release resources in on_destroy.'
        ],
        see: ['async', 'timers', 'navigation']
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
          ['Python module with state', 'The whole application', 'A cart, the signed-in user, settings, a data service.'],
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

<Text>Cart: {len(items)} item(s)</Text>` },
          { path: 'src/App.janel', code: `<script lang="python">
from services import cart
from services.cart import items
from components.CartBadge import CartBadge
</script>

<Window title="Shop" width={420} height={260}>
  <Column padding={24} gap={12}>
    <CartBadge />
    <Row gap={8}>
      <Button on:click={cart.add("Apple")}>Add an apple</Button>
      <Button on:click={cart.clear()}>Empty the cart</Button>
    </Row>
    <Text>{", ".join(items) or "The cart is empty."}</Text>
  </Column>
</Window>` }
        ],
        explanation: [
          'cart.py creates items once, the first time it is imported. Both components get the same object.',
          'CartBadge only reads; App changes the cart through the module’s functions, so the rules for changing it live in one place.',
          'Import the state by name (from services.cart import items) to use it in templates without .value: templates unwrap names, not attributes.'
        ],
        expected: 'Cart: 0 item(s) and The cart is empty. at first. Each Add an apple updates both lines: Cart: 1 item(s) and Apple. Empty the cart resets both.',
        pitfalls: [
          'Module state lives as long as the Python process. In tests that mount the app several times in one process, it is not reset between mounts; give the module a reset function.',
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

<Text>Workspace: {workspace}</Text>` },
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import provide, state
from components.WorkspaceBadge import WorkspaceBadge

workspace = state("Studio")
provide("workspace", workspace)
</script>

<Window title="Context" width={380} height={200}>
  <Column padding={24} gap={12}>
    <WorkspaceBadge />
    <Button on:click={workspace = "Lab"}>Change workspace</Button>
  </Column>
</Window>` }
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
        body: 'A component in the middle can provide the same key with another value. Its descendants receive the nearer value, while the rest of the tree keeps the original. That is how two panels can show two different projects with the same components. Pages inherit context from the component that creates their stack, and a secondary window inherits from the component that opens it.',
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
      'Prefer props; use a module for application-wide data; use context for data tied to a subtree.',
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
          ['select_all()', 'Selects all the text of a TextField or TextArea.'],
          ['scroll_to_start() / scroll_to_end() / scroll_to(index)', 'Scrolls a <List>. scroll_to_end also resumes following new rows in a follow list.'],
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

<Column padding={24} gap={12}>
  <TextField ref={field} bind:value={name} label="Name" />
  <Row gap={8}>
    <Button on:click={field.focus()}>Edit name</Button>
    <Button on:click={field.select_all()}>Select all</Button>
  </Row>
</Column>`,
        explanation: [
          'ref={field} attaches the handle when the TextField is created.',
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

<Column padding={24} gap={12}>
  <Button on:click={editing = not editing}>{"Done" if editing else "Rename"}</Button>
  {#if editing}
    <TextField ref={field} bind:value={name} label="Name" />
  {:else}
    <Text>Name: {name}</Text>
  {/if}
</Column>`,
        explanation: [
          'The effect reads field.exists, so it reruns when the field is created or destroyed.',
          'Each Rename creates a new TextField; the effect focuses it and selects its text.',
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
          'select_all() on an element without text raises TypeError; the scroll helpers only work on <List>.',
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
    slug: 'navigation',
    title: 'Navigation and windows',
    description: 'Move between screens with page stacks, keep independent sections, return results, ask before leaving and open more windows.',
    learn: [
      'Which tool fits: a page stack, sections or a second window.',
      'How push, pop, replace and reset change the stack.',
      'How a page returns a result to the page that opened it.',
      'How to ask before leaving a page with unsaved changes.'
    ],
    sections: [
      {
        id: 'choose',
        title: 'Three kinds of movement',
        body: 'A page stack models a journey with Back: a list, then a detail, then back to the same list. Sections model separate destinations, such as a sidebar with Projects and People, each keeping its own journey. A second window is a real operating-system window for a separate tool. All three use your .janel components, with props and events; there are no URLs.',
        table: { headers: ['Tool', 'Shows', 'Keeps'], rows: [
          ['pages(...) + <Pages>', 'The top page of a stack', 'The pages underneath, alive, for Back.'],
          ['sections(...) + <Sections>', 'One destination at a time', 'Every destination’s whole stack.'],
          ['open_window(...)', 'Another window', 'Its own component, until it is closed.']
        ] }
      },
      {
        id: 'stack',
        title: 'A stack of pages',
        body: 'pages(First) creates a stack during setup, starting with the component First; <Pages stack={nav} /> shows its top page and takes the free space. A page gets its stack with navigation() during its own setup, without receiving it as a prop.\n\npush shows a new page on top. The page underneath stays alive, so when the user comes back with pop, it is exactly as it was left.',
        files: [
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import pages
from pages.Home import Home

nav = pages(Home)
</script>

<Window title="Pages" width={420} height={260}>
  <Pages stack={nav} />
</Window>` },
          { path: 'src/pages/Home.janel', code: `<script lang="python">
from janelkit import navigation, state
from pages.Detail import Detail

nav = navigation()
draft = state("")
</script>

<Column padding={24} gap={12}>
  <TextField bind:value={draft} placeholder="Type something" label="Draft" />
  <Button on:click={nav.push(Detail)}>Open detail</Button>
</Column>` },
          { path: 'src/pages/Detail.janel', code: `<script lang="python">
from janelkit import navigation
nav = navigation()
</script>

<Column padding={24} gap={12}>
  <Text>Detail page</Text>
  <Button on:click={nav.pop()}>Back</Button>
</Column>` }
        ],
        explanation: [
          'App only creates the stack and shows it. Home is the first page.',
          'Home and Detail call navigation() to reach the same stack.',
          'Home stays alive under Detail, so its draft survives the trip.'
        ],
        expected: 'Type a draft, click Open detail, then Back: Home reappears with the same draft.'
      },
      {
        id: 'commands',
        title: 'push, pop, replace and reset',
        body: 'Each operation decides which pages are kept. A discarded page is destroyed and its cleanups run; a covered page is kept, and its effects and tasks keep running. Keyword arguments are the new page’s props, and on_name arguments connect its events: nav.push(Detail, item=item, on_deleted=remove).',
        table: { headers: ['Call', 'Effect on the stack'], rows: [
          ['push(Page, **props)', 'Adds Page on top; keeps the current page underneath.'],
          ['pop()', 'Discards the top page. Does nothing on the first page.'],
          ['back(value)', 'Like pop, and delivers value to whoever awaited the push.'],
          ['replace(Page, **props)', 'Discards the current page and shows Page in its place.'],
          ['reset(Page, **props)', 'Discards every page and starts again from Page.']
        ] },
        language: 'janel',
        code: `<!-- In the component that owns nav = pages(Home): a header with Back. -->
<Row gap={8}>
  <Button on:click={nav.pop()} enabled={nav.can_go_back}>← Back</Button>
  <Text>{nav.current}</Text>
</Row>
<Pages stack={nav} transition:slide />`,
        explanation: [
          'nav.can_go_back, nav.current (the name of the visible page) and nav.depth are reactive.',
          'transition:slide animates pages forward and back; fade and scale also exist.',
          'Alt+Left and the mouse’s Back button go back in the innermost visible stack.'
        ],
        pitfalls: [
          'push always creates a new instance; it never reuses an existing page of the same type.',
          'Do not reset just to switch between destinations users expect to return to; use sections.'
        ]
      },
      {
        id: 'results',
        title: 'Wait for a page to return a result',
        body: 'push can be awaited. await nav.push(Picker) waits until Picker calls nav.back(value) and returns that value, or None if the page was left another way. Use it in an async def handler, as if you were calling a function that happens to show a screen.',
        files: [
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import pages
from pages.Home import Home
nav = pages(Home)
</script>

<Window title="Results" width={400} height={240}>
  <Pages stack={nav} />
</Window>` },
          { path: 'src/pages/Home.janel', code: `<script lang="python">
from janelkit import navigation, state
from pages.Picker import Picker

nav = navigation()
chosen = state("nobody")

async def choose():
    person = await nav.push(Picker)
    if person is not None:
        chosen.value = person
</script>

<Column padding={24} gap={12}>
  <Text>Chosen: {chosen}</Text>
  <Button on:click={choose}>Choose a person</Button>
</Column>` },
          { path: 'src/pages/Picker.janel', code: `<script lang="python">
from janelkit import navigation
nav = navigation()
</script>

<Column padding={24} gap={8}>
  <Text>Pick one</Text>
  <Button on:click={nav.back("Ada")}>Ada</Button>
  <Button on:click={nav.back("Grace")}>Grace</Button>
</Column>` }
        ],
        expected: 'Chosen: nobody at first. Choose a person shows the picker; clicking Grace returns to Home with Chosen: Grace.'
      },
      {
        id: 'sections',
        title: 'Sections: destinations that keep their place',
        body: 'sections(name=Component, …) creates one stack per destination; <Sections of={areas} /> shows the current one. areas.show("people") switches without discarding anything: each section keeps its pages and their state. A section is created the first time it is shown. areas.current is reactive, areas.names lists the names, and inside a section navigation() returns that section’s stack.',
        files: [
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import sections
from pages.Home import Home

areas = sections(projects=Home, people=Home)
</script>

<Window title="Sections" width={480} height={300}>
  <Column>
    <Row gap={8} padding={8}>
      <Button on:click={areas.show("projects")}>Projects</Button>
      <Button on:click={areas.show("people")}>People</Button>
      <Text>Now in {areas.current}</Text>
    </Row>
    <Sections of={areas} />
  </Column>
</Window>` },
          { path: 'src/pages/Home.janel', code: `<script lang="python">
from janelkit import navigation
from pages.Detail import Detail
nav = navigation()
</script>

<Column padding={24} gap={12}>
  <Text>Home page</Text>
  <Button on:click={nav.push(Detail)}>Open detail</Button>
</Column>` },
          { path: 'src/pages/Detail.janel', code: `<script lang="python">
from janelkit import navigation
nav = navigation()
</script>

<Column padding={24} gap={12}>
  <Text>Detail page</Text>
  <Button on:click={nav.pop()}>Back</Button>
</Column>` }
        ],
        expected: 'Open detail in Projects, switch to People: People shows its own Home page. Switch back: Projects is still on the detail page.',
        pitfalls: [
          'Switching sections never asks before_leave, because nothing is discarded.'
        ]
      },
      {
        id: 'before-leave',
        title: 'Ask before leaving a page',
        body: 'before_leave(fn) registers a question in a page or any component inside it. When the page is about to be discarded (pop, back, replace, reset, Alt+Left) or its window is closed with the X, fn is called; returning False keeps the user where they are. fn can be async, for example to show a confirmation dialog.\n\npop, back, replace and reset can be awaited: they return True if the page was left and False if a guard refused.',
        files: [
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import pages
from pages.Home import Home
nav = pages(Home)
</script>

<Window title="Guards" width={420} height={260}>
  <Pages stack={nav} />
</Window>` },
          { path: 'src/pages/Home.janel', code: `<script lang="python">
from janelkit import navigation
from pages.Editor import Editor
nav = navigation()
</script>

<Column padding={24} gap={12}>
  <Text>Home page</Text>
  <Button on:click={nav.push(Editor)}>Edit</Button>
</Column>` },
          { path: 'src/pages/Editor.janel', code: `<script lang="python">
from janelkit import navigation, state, before_leave

nav = navigation()
unsaved = state(True)
status = state("You have unsaved changes.")

@before_leave
def may_leave():
    return not unsaved.value

async def go_back():
    if not await nav.pop():
        status.value = "Leaving was refused: discard or save first."
</script>

<Column padding={24} gap={12}>
  <Text>{status}</Text>
  <Button on:click={go_back}>Back</Button>
  <Button on:click={unsaved = False}>Discard changes</Button>
</Column>` }
        ],
        explanation: [
          'may_leave returns False while there are unsaved changes, so the first Back is refused.',
          'await nav.pop() returns False in that case, and the editor explains why.',
          'After Discard changes the guard returns True, and Back leaves.'
        ],
        expected: 'Edit, then Back: the editor stays and says Leaving was refused. Discard changes, then Back: Home page appears.',
        pitfalls: [
          'Closing a window from code with close() does not ask. Only user navigation and the X do.',
          'A guard is not a cleanup: if it refuses, the page must keep working. Release resources in on_destroy.'
        ]
      },
      {
        id: 'windows',
        title: 'Open another window',
        body: 'open_window(Component, **props) opens an imported component in its own window. Keyword arguments are its props and on_name arguments its events; modal=True blocks the opener while it is open, and theme="dark" gives it its own theme. The window inherits context from the component that opens it, and closes on its own when that component is destroyed.\n\nopen_window returns a handle with a reactive is_open, close(), focus() and instance. Each call opens a new window: keep the handle if you want to reuse one.',
        files: [
          { path: 'src/components/Settings.janel', code: `<Window title="Settings" width={360} height={220}>
  <Column padding={24}>
    <Text>Settings window</Text>
  </Column>
</Window>` },
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit import open_window, state
from components.Settings import Settings

window = state(None)

def open_settings():
    window.value = open_window(Settings, modal=True, theme="dark")
</script>

<Window title="Main" width={380} height={200}>
  <Column padding={24} gap={12}>
    <Button on:click={open_settings}>Open settings</Button>
  </Column>
</Window>` }
        ],
        expected: 'Open settings shows a separate dark window; while it is open, the main window does not respond. Closing it returns control to the main window.'
      }
    ],
    summary: [
      'Stacks give Back; sections keep separate journeys; open_window opens real windows.',
      'Await push to receive a result; await pop and friends to know whether the page was left.',
      'before_leave can refuse user navigation; it is not a cleanup hook.'
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

<Column padding={24} gap={12}>
  <Button enabled={not busy} on:click={save}>Save</Button>
  <Text>{message}</Text>
</Column>`,
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

<Column padding={24} gap={12}>
  <TextField bind:value={query} label="Name" />
  <Row gap={8}>
    <Button on:click={lookup.run(query)}>Look up</Button>
    <Button on:click={lookup.cancel()}>Cancel</Button>
  </Row>
  {#if lookup.loading}
    <Text>Loading…</Text>
  {:else if lookup.error is not None}
    <Text>Error: {lookup.error}</Text>
  {:else}
    <Text>{lookup.value or "No result yet"}</Text>
  {/if}
</Column>`,
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

<Column padding={24} gap={12}>
  <TextField bind:value={name} label="Name" />
  <Button on:click={formatted.run(name)}>Format</Button>
  <Text>{"Working…" if formatted.loading else formatted.value or ""}</Text>
</Column>`,
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

<Text>{message}</Text>`,
        expected: 'Loading… appears first and changes to Ready.',
        pitfalls: [
          'Create long-lived tasks and timers during setup. Work created after an await is not automatically owned by the component.'
        ]
      },
      {
        id: 'testing',
        title: 'Test the waiting',
        body: 'In tests, app.wait(seconds, until=condition) runs the event loop until the condition holds or the time runs out. A plain time.sleep in a test would block the very loop that should finish the work. Test the success path, the error path and cancellation separately.',
        language: 'python',
        code: `# tests/test_lookup.py, for the @task example above saved as src/App.janel
from janelkit.inspect import mount

def test_lookup():
    with mount("src/App.janel") as app:
        lookup = app.get("lookup")
        app.find(text="Look up").click()
        assert lookup.loading
        app.wait(2, until=lambda: not lookup.loading)
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
    description: 'Repeat work with interval, delay it with timeout, debounce input, and know when timers stop.',
    learn: [
      'How interval repeats a function and timeout runs one later.',
      'How to stop, restart and change a timer.',
      'How to debounce typing with timeout.restart.',
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

<Column padding={24} gap={12}>
  <Text>Ticks: {ticks}</Text>
  <Text>Running: {clock.active}</Text>
  <Row gap={8}>
    <Button on:click={clock.stop()}>Stop</Button>
    <Button on:click={clock.restart()}>Restart</Button>
  </Row>
</Column>`,
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

<Column padding={24} gap={12}>
  <TextField bind:value={query} on:input={debounce.restart()} label="Search" />
  <Text>Searched for: {searched}</Text>
</Column>`,
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
        body: 'A timer’s function can be async def, for example to fetch data with background. If a tick is still running when the next one is due, the next one is skipped instead of starting in parallel. An error in the function is logged with its name, and the timer keeps going.',
        language: 'python',
        code: `# In a component script; read_processes is a blocking function of yours.
from janelkit import state, interval, background

processes = state([])

@interval(1000)
async def refresh():
    processes.value = await background(read_processes)`
      },
      {
        id: 'ownership',
        title: 'When timers stop',
        body: 'A timer created in a component stops when the component is destroyed. A timer created in an ordinary module, outside any component, runs until you call stop(). Timers need the application’s event loop: they do not tick during a blocking function, and they do not tick in a plain Python script without the application running.',
        pitfalls: [
          'Do not write a while loop with time.sleep to repeat work; it freezes the window. Use interval.',
          'stop() prevents future ticks; it does not cancel an async tick that is already running.',
          'A timer inside {#hidden} or on a covered page keeps running. Stop it yourself if it should pause.'
        ],
        see: ['lifecycle', 'async']
      }
    ],
    summary: [
      'interval repeats, timeout runs once; both start when created and return a Timer.',
      'stop, start and restart control them; active is reactive.',
      'restart on each keystroke debounces input; component timers stop with the component.'
    ]
  },
  {
    slug: 'persistence',
    title: 'Saving data and undo',
    description: 'Remember small values between launches with persisted, and let users undo and redo their changes with History.',
    learn: [
      'How persisted saves a value automatically between launches.',
      'Which values can be saved, where they are stored and when.',
      'How History records undoable steps and tracks unsaved changes.'
    ],
    sections: [
      {
        id: 'persisted',
        title: 'persisted: state that survives a restart',
        body: 'persisted(key, initial) works like state, with one difference: it is saved. When created, it loads the saved value, or uses initial if there is none. Every change, including changes inside lists and dictionaries, is saved automatically. Use it for preferences and small data: the theme, the last open section, recent files.\n\nThe key belongs to the whole application: two persisted("prefs.theme", …) calls in different files return the same object, and the second default is ignored.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import persisted

name = persisted("lesson.name", "")
</script>

<Column padding={24} gap={12}>
  <TextField bind:value={name} placeholder="Your name" label="Your name" />
  <Text>Hello, {name or "visitor"}.</Text>
  <Button on:click={name = ""}>Forget my name</Button>
</Column>`,
        explanation: [
          'name behaves like state: bind:, .value and plain names in the template all work.',
          'Typing saves the value; there is no save button and no file to manage.',
          'Forget my name saves an empty string; it does not delete the key.'
        ],
        expected: 'Typing Ada shows Hello, Ada. Closing and reopening the application shows Ada in the field again.',
        pitfalls: [
          'Do not store secrets: values are plain JSON files, not encrypted storage.',
          'Do not reuse a key for different kinds of data; the first value loaded wins.'
        ]
      },
      {
        id: 'prefs-module',
        title: 'Keep preferences together in one module',
        body: 'Gather persisted values in a module such as src/services/prefs.py, and import them where needed. bind:value={prefs.theme} binds to the module’s value. To show it in a template without .value, import it by name: from services.prefs import theme. Templates unwrap names, not attributes.',
        language: 'python',
        code: `# src/services/prefs.py
from janelkit import persisted

theme = persisted("prefs.theme", "light")
recent = persisted("prefs.recent", [])

def opened(path):
    recent.value.insert(0, str(path))   # changes in place are saved too
    del recent.value[10:]`
      },
      {
        id: 'json-and-keys',
        title: 'What can be saved, and how keys are written',
        body: 'Only JSON values: strings, numbers, booleans, None, lists and dictionaries. A value JSON cannot represent, such as a date, a set or your own object, raises TypeError when created or assigned. Some values are converted silently instead: tuples come back as lists, and dictionary keys come back as strings, so {1: "a"} is {"1": "a"} after a restart. Convert dates and paths to strings yourself, and use string keys. When you change the shape of saved data, migrate it yourself or use a new key.\n\nKeys use ASCII letters, digits, dots, underscores and hyphens, and start with a letter or digit. Use dots to group them: prefs.theme, editor.font_size.'
      },
      {
        id: 'where-and-when',
        title: 'Where and when it is written',
        body: 'Each key is a file named <key>.json in the user’s data folder plus the project name: %APPDATA%\\<project> on Windows, ~/Library/Application Support/<project> on macOS, ~/.config/<project> on Linux. The environment variable JANELKIT_DATA_DIR changes the folder.\n\nChanges are grouped and written at most every 300 ms, and once more when the application closes. Writing replaces the file in one step, so a crash never leaves half a file. Each change rewrites the whole key, which is why persisted is for small values; documents and databases belong in their own files.',
        pitfalls: [
          'Tests with janelkit.inspect.mount use an empty temporary folder, so they never touch real data. To test that a value survives two mounts, set JANELKIT_DATA_DIR.'
        ]
      },
      {
        id: 'history',
        title: 'History: undo and redo',
        body: 'History records changes in named steps. Everything that changes inside with history.step(label): is recorded: each state assigned and each reactive list, dictionary or set modified. undo() returns them to how they were before the step; redo() reapplies it. Changes outside a step are not recorded, so keep things like the selection or the cursor out of it.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import History, state

count = state(0)
history = History(limit=100)

def add():
    with history.step("Add one"):
        count.value += 1
</script>

<Column padding={24} gap={12}>
  <Text>Count: {count} · unsaved: {history.modified}</Text>
  <Row gap={8}>
    <Button on:click={add}>Add one</Button>
    <Button enabled={history.can_undo} on:click={history.undo()}>Undo</Button>
    <Button enabled={history.can_redo} on:click={history.redo()}>Redo</Button>
  </Row>
  <Shortcut keys="Ctrl+Z" on:activate={history.undo()} />
</Column>`,
        explanation: [
          'Each Add one is one step named "Add one".',
          'can_undo, can_redo and modified are reactive, so the buttons and the text follow.',
          'Ctrl+Z calls the same undo() as the button.'
        ],
        expected: 'Add one shows Count: 1 · unsaved: True. Undo returns to Count: 0 · unsaved: False; Redo goes back to 1.'
      },
      {
        id: 'history-details',
        title: 'Saved markers, limits and custom actions',
        body: 'mark_saved() marks the current position as saved: modified becomes False there, and also when undo or redo returns to it. It does not write any file. clear() forgets all steps, for example after opening another document. A new step discards whatever could be redone, and limit keeps only the most recent steps. Nested steps merge into one, and a step that changes nothing is not recorded.\n\nFor changes History cannot see, such as a plain dictionary or a file, record what you already did with history.add(label, undo=fn, redo=fn).',
        pitfalls: [
          'A step is not a transaction: if the code inside fails, the changes made so far stay.',
          'Do not hold a step open across await.',
          'History lives in memory; it does not survive a restart, even if the data it changed is persisted.'
        ]
      }
    ],
    summary: [
      'persisted is state that saves itself as JSON; use it for small values.',
      'Keys are global to the application; values must be JSON.',
      'History records named steps for undo and redo, and tracks unsaved changes.'
    ]
  }
];
