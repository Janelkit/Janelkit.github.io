// Guide · Part 4 · Advanced interface.
// Sources (read-only): JanelKit/docs/lenguaje.md (Colecciones reactivas, Listas grandes,
// Desplazamiento, Accesibilidad, Papel, teclado y accesibilidad: as), docs/flex.md and
// docs/api.md, cross-checked against packages/janelkit/src/janelkit/reactivity.
export const advancedDocs = [
  {
    slug: 'accessibility',
    title: 'Accessibility and keyboard',
    description: 'Make every action reachable from the keyboard and understandable to screen readers.',
    learn: [
      'How keyboard focus moves through a window, and how to check it.',
      'How screen readers name controls, and when you must add a label.',
      'How to give a custom clickable box the right role.',
      'How to add keyboard shortcuts.'
    ],
    sections: [
      {
        id: 'why',
        title: 'Who depends on this',
        body: 'Some people use only the keyboard; others hear the interface through a screen reader, a program that reads out each control. Both depend on two things your template decides: the order in which controls receive focus, and the name each control announces. Built-in controls handle most of this for you. Your job is to name things that have no visible text and to check the result.'
      },
      {
        id: 'keyboard',
        title: 'Focus follows the template order',
        body: 'Tab and Shift+Tab move the keyboard focus through the controls in the order they appear in the template. A <column>, <row> or flex with on:click also joins that order and is activated with Space or Enter, like a button. The focused element always shows a ring in the --primary color; you can restyle it with an outline rule, but keep it visible.\n\ntabindex={0} adds a box to the Tab order; tabindex={-1} removes it, although code can still focus it with a ref. disabled={True} on a box removes it from the order and ignores its events.',
        steps: [
          'Put the mouse away and reach every action with Tab, Shift+Tab, Space and Enter.',
          'Check that the order matches the visual order. If it does not, reorder the template.',
          'Check that you can always see where the focus is.'
        ]
      },
      {
        id: 'names',
        title: 'Every control needs a name',
        body: 'Screen readers announce a control’s text: the caption of a button, checkbox, option or tab, or the placeholder of an empty field. label="…" on any element sets or replaces that name. Use it on fields without visible text, on icon-only actions and on clickable cards. Images use alt to describe what they show.',
        language: 'janel',
        code: `<!-- query and note come from the script; open is a function. -->
<textfield bind:value={query} placeholder="Search…" label="Search notes" />
<row class="card" on:click={open(note)} label={f"Open {note['title']}"}>…</row>
<image src="logo.png" alt="Company logo" />`,
        pitfalls: [
          'A clickable flex box, or one with as="button", that has no text or label produces a compile warning: a screen reader would not know what it is. A clickable <row> or <column> gets no such warning, so check those yourself.',
          'Color and position alone do not tell anyone what a control does.'
        ]
      },
      {
        id: 'roles',
        title: 'Give custom boxes a role with as',
        body: 'When you build a control from a flex box, as tells the keyboard and screen readers what it is. It changes behavior and meaning, not appearance. A plain <button> is still the clearest choice for a simple action; use as when you build a tab, a menu item or a switch of your own.',
        table: { headers: ['as', 'In the Tab order', 'Keyboard', 'Announced as'], rows: [
          ['(none)', 'Only with on:click', 'Like button', 'Like button when clickable'],
          ['box', 'No', '—', 'Ignored'],
          ['button', 'Yes', 'Space (on release) or Enter → on:click', '<button>'],
          ['link', 'Yes', 'Enter', 'Link'],
          ['checkbox, switch', 'Yes', 'Space', '<checkbox>, with checked'],
          ['tab, menuitem, option', 'With tabindex', 'Space or Enter; arrows are yours to program with on:keydown', 'With selected'],
          ['listitem, list, menu, tablist, dialog, heading, region', 'No', '—', 'Its role']
        ] },
        language: 'janel',
        code: `<!-- muted is a Boolean state. -->
<flex as="switch" checked={muted} on:click={muted = not muted} label="Mute notifications" class="toggle">
  <text>{"Muted" if muted else "Sound on"}</text>
</flex>`,
        explanation: [
          'as="switch" puts the box in the Tab order and makes Space activate it.',
          'checked={muted} tells the screen reader the current state and enables the :checked style.',
          'label gives the switch a stable name, while the <text> shows the current state.'
        ]
      },
      {
        id: 'shortcuts',
        title: 'Shortcuts for frequent actions',
        body: '<shortcut keys="Ctrl+S" on:activate={save} /> listens to its window’s keyboard and takes no space. Keys are written as in Qt: Ctrl+Shift+N, F5, Esc. A <shortcut> inside an {#if} is only active while its branch exists. For keys inside a single field, use that field’s on:keydown instead.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
saved = state(0)
</script>

<window title="Shortcuts" width={380} height={200}>
  <column padding={24} gap={12}>
    <shortcut keys="Ctrl+S" on:activate={saved += 1} />
    <text>Press Ctrl+S. Saved {saved} times.</text>
  </column>
</window>`,
        expected: 'Each Ctrl+S increases the number, wherever the focus is in the window.',
        see: ['forms']
      }
    ],
    summary: [
      'Tab order follows the template; keep focus visible.',
      'Name every control without visible text with label; describe images with alt.',
      'Use as on custom boxes and <shortcut> for frequent actions.'
    ]
  },
  {
    slug: 'large-lists',
    title: 'Large lists',
    description: 'Show thousands of rows with <list>, understand how its rows live and die, and control scrolling.',
    learn: [
      'When to use <list> instead of <scroll>.',
      'The rules a <list> follows and why typed text must live in state.',
      'How to follow new rows, load older ones and scroll from code.'
    ],
    sections: [
      {
        id: 'scroll-or-list',
        title: '<scroll> creates everything; <list> creates what you see',
        body: '<scroll> creates every row up front, which is simple and fine for dozens of rows. <list> is virtualized: it creates only the rows on screen plus a margin, and reuses that work as you scroll. Use it for hundreds or thousands of rows, such as a log, a chat or a table of records. With 10,000 rows, creating the list takes about 40 ms.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
rows = state([{"id": n, "title": f"Item {n}"} for n in range(1, 2001)])
</script>

<window title="Two thousand rows" width={440} height={360}>
  <list gap={4} padding={12}>
    {#each rows as row (row["id"])}
      <text>{row["title"]}</text>
    {/each}
  </list>
</window>`,
        expected: 'A scrollable window shows Item 1, Item 2 and so on, smoothly, up to Item 2000.',
        explanation: [
          'The state holds 2,000 dictionaries, but only the rows on screen get a view.',
          'The key row["id"] lets the list keep track of each row while you scroll.',
          'gap and padding are set on the <list> itself, like on a <column>.'
        ]
      },
      {
        id: 'rules',
        title: 'The rules of a <list>',
        body: 'A <list> contains exactly one {#each}, with a key. Inside the rows, everything works as usual: index, handlers, components and reactive collections. Rows take the full width of the list; the list accepts gap, padding, background, border and radius, and takes the free space of its container by default.\n\n{:else} is not available inside a <list>. Show the empty state with an {#if} outside it.',
        language: 'janel',
        code: `<!-- tasks is a list state of dictionaries with "id" and "title". -->
{#if not tasks}
  <text>No tasks yet.</text>
{/if}
<list>
  {#each tasks as task (task["id"])}
    <text>{task["title"]}</text>
  {/each}
</list>`
      },
      {
        id: 'row-lifetime',
        title: 'Rows lose their view when they scroll away',
        body: 'Each row is created, its Python part and its view, the first time it becomes visible. The Python part lives until the item leaves the list. The view is destroyed when the row scrolls off screen and rebuilt when it comes back. While a row has no view, what it shows is not recalculated; it catches up once when it returns. Its effects, timers and tasks keep running.\n\nThat is why anything the user types in a row must be stored in state with bind:, not only in the control: the control itself may be rebuilt.',
        pitfalls: [
          'Text typed into a field without bind: is lost when its row scrolls away and back.',
          'If every row reads the same state, such as the selected id, give each row a computed for its part (is this row selected?). A binding that reads only a computed is skipped when the answer does not change, so selecting another row updates only the two rows involved.'
        ]
      },
      {
        id: 'scrolling',
        title: 'Follow new rows and scroll from code',
        body: 'follow makes the list start at the bottom and stay there as rows arrive, while the user is at the bottom; if they scroll up to read, it stays put. Inserting rows at the top keeps what was on screen in place. on:top and on:bottom fire when the user reaches either end; on:scroll reports the position, at most once per frame, as {"top": bool, "bottom": bool, "y": pixels, "height": content height}.\n\nWith a ref, code can scroll: scroll_to_end(), which with follow also resumes following, scroll_to_start(), and scroll_to(index), which scrolls just enough to show that row.\n\n<scroll> accepts the same follow, on:top, on:bottom and on:scroll, for content that is not a list of equal rows: a short log, a long form, a document. With its ref, scroll_to(element) takes the ref of an element inside it and scrolls just enough to show it whole; if it is already visible, nothing moves.',
        language: 'janel',
        code: `<!-- messages is a list state; load_older is a script function; feed = ref(). -->
<list follow ref={feed} on:top={load_older} on:scroll={at_bottom = event["bottom"]}>
  {#each messages as m (m["id"])}
    <text>{m["text"]}</text>
  {/each}
</list>
<button on:click={feed.scroll_to_end()} enabled={not at_bottom}>Jump to latest</button>`,
        see: ['refs']
      },
      {
        id: 'changes',
        title: 'How large changes are applied',
        body: 'Adding rows anywhere, in any amount, is applied in blocks and keeps the scroll position. Removing or moving a few rows is applied one by one, animated with <list animate>. From 64 removals or moves at once, such as sorting or replacing the list, the change is applied in one go: the visible rows are rebuilt and the row that was at the top stays at the top.'
      }
    ],
    summary: [
      'Use <list> for hundreds of rows or more; it creates only what is visible.',
      'One keyed {#each}, no {:else}; keep typed text in state.',
      'follow, on:top, on:scroll and a ref control scrolling.'
    ]
  },
  {
    slug: 'reactivity-in-depth',
    title: 'Reactivity in depth',
    description: 'Exactly when state notifies, who owns a reactive collection, and how to group or hide reads.',
    learn: [
      'Who owns a reactive collection and why the original is not updated.',
      'When an assignment notifies and when it does not.',
      'How to group writes with batch and read without subscribing with peek and untracked.',
      'How objects with state attributes and @computed methods behave in templates.'
    ],
    sections: [
      {
        id: 'collection-ownership',
        title: 'Mutate the reactive collection, not its input',
        body: 'Built-in lists, dictionaries and sets become reactive containers when stored in state, including nested ones and new ones inserted later. They remain subclasses of list, dict and set, so append, remove, sort, item assignment, deletion and set operations update the interface without replacing the whole value.\n\nConversion copies the containers. The list you passed to state is not the list the state now owns. Change data through items.value, or through a row obtained from it. Each collection notifies separately: editing one task dictionary updates what reads that dictionary, not every reader of the outer list.\n\nTuples, your own subclasses of collections and other objects are not converted. Prefer replacing such a value. If you change one in place on purpose, call the state’s notify() afterwards.',
        language: 'python',
        code: `# Ordinary Python: who owns the data after state() copies it.
from janelkit import state

original = [{"title": "First", "done": False}]
todos = state(original)

original[0]["done"] = True          # edits the original, not the reactive copy
assert todos.value[0]["done"] is False

todos.value[0]["done"] = True       # edits the reactive copy: readers update
assert todos.value[0]["done"] is True`,
        expected: 'Running the snippet prints nothing: both assertions pass, showing that only changes through todos.value reach the reactive copy.',
        pitfalls: [
          'Changing an attribute of a custom object is not observable. Replace the value, or call notify().'
        ]
      },
      {
        id: 'equality',
        title: 'When an assignment notifies',
        body: 'Assigning a value equal to the current one, of the same type, is ignored: nothing updates. Assigning the very same object again is also ignored, so it cannot replace notify() after an in-place change. Values of different types count as a change even when they compare equal, such as 1 and True.\n\nA binding subscribes to the state it reads while it is evaluated, including reads made inside helper functions it calls. A plain read made earlier, before the binding existed, does not become a subscription.'
      },
      {
        id: 'batch',
        title: 'Group related writes with batch',
        body: 'with batch(): delays observer work until the outermost batch ends. Assignments still happen at once, so Python code inside the block reads the new values; only the reaction waits. It is not a transaction: an error does not undo the writes.\n\nEvent handlers and timer callbacks are already batched. Use batch in shared functions that may run outside a handler. Do not hold a batch across await.',
        language: 'python',
        code: `# Ordinary Python: the effect sees both names change together.
from janelkit import state, effect, batch

first = state("Ada")
last = state("Lovelace")
seen = []
watcher = effect(lambda: seen.append((first.value, last.value)))

with batch():
    first.value = "Grace"
    last.value = "Hopper"

assert seen == [("Ada", "Lovelace"), ("Grace", "Hopper")]
watcher.dispose()`,
        explanation: [
          'effect runs once immediately, recording ("Ada", "Lovelace").',
          'Without batch, it would also run between the two assignments and record ("Grace", "Lovelace").',
          'An effect created outside a component must be stopped with dispose().'
        ]
      },
      {
        id: 'untracked',
        title: 'Read without subscribing',
        body: 'state.peek() reads a value without subscribing to it. with untracked(): turns off tracking for every read in its block, including the contents of collections. Use them for incidental information, such as context added to a log line, that should not cause a rerun.\n\nA reactive list returned by peek() is still reactive: calling len or iterating it outside untracked can subscribe again. Wrap the whole read in untracked.',
        language: 'python',
        code: `# Ordinary Python: only request triggers the effect; notes is context.
from janelkit import state, effect, untracked

request = state(0)
notes = state(["draft"])
logs = []

def record():
    current = request.value
    with untracked():
        count = len(notes.value)
    logs.append((current, count))

watcher = effect(record)
notes.value.append("review")        # does not rerun record
request.value = 1                   # reruns record
assert logs == [(0, 1), (1, 2)]
watcher.dispose()`,
        pitfalls: [
          'peek and untracked do not freeze data, silence existing subscribers or allow writes from worker threads.'
        ]
      },
      {
        id: 'reactive-objects',
        title: 'Objects with state of their own',
        body: 'Not all data is the application’s shared data. An object that exists several times, such as one Camera per camera or one Connection per server, can keep its own state as attributes. A template uses them directly: {camera.frames}, {#if hub.ready} and {#each hub.errors as e} show the value and update. Inside an operation, ask for the value: {camera.frames.value * 2}.\n\n@computed on a method gives each instance its own computed, which lives as long as the instance: camera.health.value in Python, {camera.health} in the template.',
        language: 'python',
        code: `# Ordinary Python: state attributes and a derived value per instance.
from janelkit import computed, state

class Camera:
    def __init__(self, name):
        self.name = name
        self.frames = state(0)
        self.dropped = state(0)

    @computed
    def health(self):
        total = self.frames.value + self.dropped.value
        return 1.0 if total == 0 else self.frames.value / total

front, back = Camera("front"), Camera("back")
front.frames.value = 9
front.dropped.value = 1
assert front.health.value == 0.9
assert back.health.value == 1.0     # each instance has its own computed`,
        pitfalls: [
          'For the data several views or windows share, prefer a store of janelkit-store: one instance per application, actions and a fresh instance in each test.'
        ],
        see: ['store']
      }
    ],
    summary: [
      'state copies collections; change them through .value.',
      'Equal values of the same type do not notify; call notify() after changing custom objects.',
      'batch groups reactions; peek and untracked read without subscribing.',
      'State attributes work in templates; @computed on a method gives each instance its own value.'
    ]
  }
];
