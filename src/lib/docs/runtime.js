// Source provenance (read-only local JanelKit checkout): docs/lenguaje.md;
// docs/api.md; packages/janelkit/src/janelkit/{lifecycle,tasks,timers,pages,windows}.py;
// runtime/component.py; reactivity/effects.py; qt_backend/application.py.
// Examples informed by apps/examples/todo-components, compra, books and
// packages/janelkit/tests/test_lifecycle_qt.py. Examples below are original English adaptations.
// Scope cleanup is reverse insertion order, not a universal hook-category order.
export const runtimeDocs = [
  {
    slug: 'components', title: 'Components', group: 'Components',
    description: 'Build reusable pieces with private state, read-only inputs, events, slots, and scoped styles.',
    sections: [
      {
        id: 'instance-model', title: 'Think of a component as a small Python program',
        body: 'A component is a .janel file describing one piece of an interface. Its script sets up data and functions; its template describes the controls that use them. You do not write a loop that repeatedly redraws the window. JanelKit observes reactive values and updates the affected bindings for you.\n\nThe script executes once per instance, not once per click or screen update. Two uses of the same file receive separate namespaces and separate local state. The complete App.janel below is a useful starting point: pressing Add changes count, and only the dependent text needs updating. In Python use count.value; in the template a direct reactive name is automatically unwrapped.',
        file: 'src/App.janel', language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
count = state(0)
def add():
    count.value += 1
</script>
<Column padding={24} gap={12}>
  <Text>Count: {count}</Text>
  <Button on:click={add}>Add</Button>
</Column>`,
        explanation: ['The state object survives button clicks because the script is not re-executed.', 'The template has one root. A root application without Window receives an implicit window; nested components must not use Window as their root.'],
        expected: 'The counter begins at zero. Every Add click increases the displayed number by one.',
        pitfalls: ['An ordinary Python integer is not reactive. Use state for a value the interface must observe.']
      },
      {
        id: 'extract-file', title: 'Extract a child and import it by filename',
        body: 'Extraction is useful when a panel repeats or becomes difficult to understand in one file. First create a child file with one template root. Then import that component in the parent script and use its capitalized name as a tag. The import resembles Python, but JanelKit resolves the .janel file itself.\n\nMulti-file example: save the two labeled files below under src. Absolute component imports start from the entry component directory, so components.Counter means src/components/Counter.janel here. Relative imports resolve from the importing component. Both counters share compiled code but not local state. The compiler also validates component props and events before the application runs.',
        file: 'Multi-file: src/components/Counter.janel + src/App.janel', language: 'janel',
        code: `<!-- src/components/Counter.janel -->
<script>
from janelkit import state
count = state(0)
</script>
<Row gap={8}>
  <Text>{count}</Text>
  <Button on:click={count += 1}>Add</Button>
</Row>

<!-- src/App.janel -->
<script>
from components.Counter import Counter
</script>
<Column padding={24} gap={12}>
  <Counter />
  <Counter />
</Column>`,
        steps: ['Create src/components/Counter.janel using the first labeled block.', 'Replace src/App.janel with the second block.', 'Run the normal project entry point, then click only the first counter.'],
        expected: 'Only the clicked counter changes. The other instance remains at zero.'
      },
      {
        id: 'input-contract', title: 'Declare required inputs and sensible defaults',
        body: 'A prop is an input chosen by the parent. Declare name = prop() for a required input, or name = prop(default) for an optional input. Declarations belong at script top level. For example, title: str = prop() requires a title, while compact: bool = prop(False) permits the parent to omit compact.\n\nInside Python, read title.value; inside the template, write {title}. A parent expression such as title={heading} is reactive, whereas title="Welcome" is constant. Type annotations allow literal checks at compilation and incoming-value checks at runtime. Runtime mismatches are logged rather than stopping the application. Container annotations such as list[str] check the container type, not every member.',
        language: 'python',
        code: `from janelkit import prop

title: str = prop()          # Required input.
compact: bool = prop(False)  # Optional input.
subtitle: str | None = prop(None)`,
        pitfalls: ['This is a child-script excerpt, not a standalone application: the parent must supply title.', 'Do not declare props inside a handler or helper function. The compiler discovers top-level declarations.']
      },
      {
        id: 'events-and-ownership', title: 'Send requests upward instead of assigning props',
        body: 'Props are read-only in the child: assigning title.value raises PropError. This gives each value a clear owner. A child reports what happened through an event, and the parent decides how to change its own state. Declare saved = event() and call saved.emit(value); the parent connects on:saved={handler}. An event with no listener does nothing.\n\nMulti-file example: the editor copies its initial input into a local draft. Typing changes only that draft; Save emits a proposed name. The parent accepts it by assigning its own name state. This is an intentional snapshot: initializing draft from name.value does not automatically replace the draft when a later prop arrives.',
        file: 'Multi-file: src/components/NameEditor.janel + src/App.janel', language: 'janel',
        code: `<!-- src/components/NameEditor.janel -->
<script>
from janelkit import prop, event, state
name = prop()
saved = event()
draft = state(name.value)
def save():
    saved.emit(draft.value.strip())
</script>
<Row gap={8}>
  <TextField bind:value={draft} />
  <Button on:click={save}>Save</Button>
</Row>

<!-- src/App.janel -->
<script>
from janelkit import state
from components.NameEditor import NameEditor
name = state("Ada")
def accept(value):
    name.value = value
</script>
<Column padding={24} gap={12}>
  <Text>Saved: {name}</Text>
  <NameEditor name={name} on:saved={accept} />
</Column>`,
        explanation: ['event() produces an Event with emit(*args, **kwargs) and connected.', 'Read-only prevents replacing the prop, not all mutation inside an object passed through it. Prefer explicit events for parent-owned collection changes too.'],
        expected: 'Typing leaves Saved: Ada unchanged. Save updates the parent label to the edited name.'
      },
      {
        id: 'slots', title: 'Let the parent supply content with slots',
        body: 'A prop passes a value; a slot passes template content. This is useful for a card whose frame stays the same while its contents vary. Put <Slot /> in the child for default content, and <Slot name="footer"> for a named location. Content inside the Slot tag is a fallback used when nothing is supplied.\n\nMulti-file example: the card owns the arrangement, while the parent owns message and its event handler. Expressions inside supplied content resolve in the parent scope, even though the card chooses where to display them. A slot is not a way to reach private child variables. Its content is created and destroyed with the outlet that displays it.',
        file: 'Multi-file: src/components/Card.janel + src/App.janel', language: 'janel',
        code: `<!-- src/components/Card.janel -->
<Column padding={16} gap={8}>
  <Slot />
  <Slot name="footer"><Text>No actions</Text></Slot>
</Column>

<!-- src/App.janel -->
<script>
from janelkit import state
from components.Card import Card
message = state("Ready")
</script>
<Column padding={24}>
  <Card>
    <Column><Text>{message}</Text></Column>
    <Row slot="footer">
      <Button on:click={message = "Done"}>Finish</Button>
    </Row>
  </Card>
</Column>`,
        expected: 'Finish appears in the footer and changes the parent-owned message from Ready to Done.',
        pitfalls: ['A supplied slot name must exist in the child. Group several footer elements inside one Row or Column.']
      },
      {
        id: 'style-boundaries', title: 'Keep styles local without treating the child as untouchable',
        body: 'Component styles own their internal elements; reusing class names elsewhere does not deliberately style every matching descendant application-wide. There is an intentional exception at the root: for flex, Column, or Row roots, supported tag attributes fall through. Parent classes can style that root, and tag-specified styling wins there. Declared props or events take precedence over fallthrough.\n\nThis is JanelKit’s CSS subset, not unrestricted browser CSS. Do not rely on reaching arbitrary child internals.',
        language: 'css', code: `/* An example rule inside Card.janel's style section. */
.card { padding: 16px; gap: 8px; background: var(--surface); }
/* A parent can apply a class to <Card class="featured">. */
.featured { border: 1px solid var(--primary); }`,
        pitfalls: ['The CSS block is explanatory, not an additional complete Card example.', 'Non-box roots use an outer wrapper for a limited set of layout attributes. inherit_attrs = False disables ordinary root fallthrough.']
      },
      {
        id: 'identity-and-reset', title: 'Decide when local state should survive',
        body: 'Removing an editor’s if branch destroys its local draft; showing it again creates fresh state. A hidden block instead preserves the instance. A key block deliberately recreates content when its key changes, useful when selecting another document should reset its editor.\n\nIn changing lists, stable unique each keys associate local state with an item rather than its position. Decide whether a draft belongs to a document, row, or screen before choosing the block.',
        explanation: ['A prop update does not rerun the child script. A new instance does.', 'Keep reusable visual behavior local, and keep application records in their owner rather than duplicating authoritative copies in every child.']
      },
      {
        id: 'component-practice', title: 'Build one boundary at a time',
        body: 'Extract one meaningful piece at a time. List its inputs and reported actions before adding synchronization. Test NameEditor with two instances sharing a parent name: their drafts begin alike but remain independent. Saving one updates the parent without overwriting the other draft. If that is wrong for your product, design an explicit reset rather than assuming a prop update reruns setup.',
        steps: ['List parent-owned values and declare props for them.', 'Keep temporary edits in local state.', 'Emit an event at the decision point, such as Save.', 'Inspect a two-instance case and a destroy/recreate case before reusing the component widely.']
      }
    ]
  },
  {
    slug: 'lifecycle', title: 'Lifecycle and effects', group: 'Components',
    description: 'Understand setup, view mounting, reactive updates and teardown, run effects, and know who cleans up what.',
    sections: [
      {
        id: 'five-moments', title: 'Separate five different moments',
        body: 'Setup runs the component script and creates state, handlers, and registrations. View mounting happens later, when Qt controls exist. Reactive updates happen repeatedly while the instance lives, but do not execute the script again. Conditional destruction removes a component whose branch or row no longer exists. Application exit releases the application’s mounted components and their owned resources.\n\nThese moments answer different questions. Create state during setup; focus a field after mounting; recalculate derived display values reactively; release a connection during destruction. Do not use app exit as your only cleanup point: an editor can disappear hundreds of times without closing the application. Conversely, hiding a retained page is not the same as destroying it.',
        table: {headers: ['Moment', 'What to do'], rows: [['Script setup', 'Declare state and register hooks.'], ['View mount', 'Use element references.'], ['Reactive change', 'Update affected bindings or effects.'], ['Instance destruction', 'Dispose owned work and resources.'], ['Application shutdown', 'Unmount remaining application views.']]},
        explanation: ['The instance lifetime and the visible-control lifetime are related but not identical, especially in virtualized lists.', 'A state change is not a mount event.']
      },
      {
        id: 'registration-context', title: 'Register hooks while the script is running',
        body: 'The public signatures are on_mount(fn), on_destroy(fn), and before_leave(fn); each also works as a decorator. They register a function for the current component. Registration must happen during script execution, either at top level or in a helper called synchronously from that setup code. Calling these registration APIs from a later button handler raises RuntimeError.\n\nRegistration and execution are separate. A decorated mount function is recorded now but called later. A destroy callback is recorded now but called when the scope is disposed. That later callback is not a new script-registration opportunity. The same setup-context rule applies to provide, inject, pages, sections, and navigation. Capture the objects you need during setup and use them later in ordinary functions.',
        pitfalls: ['Do not call on_destroy inside a click handler to attach cleanup after an operation.', 'An active reactive ownership scope is not the same thing as the temporary script setup context.']
      },
      {
        id: 'mount-example', title: 'Use on_mount when a control must already exist',
        body: 'The complete example below creates the reference during setup and uses it during mounting. The field exists by then, so focus and select_all can act on a real control. Mount callbacks run once for the component instance, with children mounted before their parent. Several callbacks in one component run in registration order.\n\nA synchronous on_mount callback may return a callable, which is stored as teardown cleanup. Return the function itself, not the result of calling it. Mounting can also launch an async function, owned by the component. However, the runtime does not collect a cleanup callable eventually returned by an async mount coroutine. For predictable cleanup, register synchronously and keep teardown synchronous.',
        file: 'src/App.janel', language: 'janel', standalone: true,
        code: `<script>
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
  <TextField ref={field} bind:value={name} />
  <Text>Hello, {name}</Text>
</Column>`,
        expected: 'The name field is populated and its text selected after mounting. Closing the inspected application invokes mount cleanup.'
      },
      {
        id: 'effect-lifetime', title: 'An effect follows what it actually reads',
        body: 'effect(fn) runs fn immediately and records reactive reads made during that synchronous execution. When a recorded source changes, the effect runs again. Before each new run it calls the previous returned cleanup, if any; disposal calls the final cleanup. Dependencies are cleared and recollected on every run, so a conditional read can change which states matter.\n\nThis is not a list of variable names guessed from the function body. A value must actually be read while dependency collection is active. Cleanup reads are untracked, and asynchronous work after an await is not an extension of this synchronous collection window. Keep an effect’s tracked decision synchronous; launch deliberate async work separately. Avoid effects that unconditionally modify the same state they read.',
        file: 'src/App.janel', language: 'janel', standalone: true,
        code: `<script>
from janelkit import state, effect
room = state("alpha")
def watch():
    selected = room.value
    print("connect", selected)
    return lambda: print("disconnect", selected)
watcher = effect(watch)
</script>
<Column padding={24} gap={12}>
  <Text>Room: {room}</Text>
  <Button on:click={room = "beta"}>Switch room</Button>
</Column>`,
        expected: 'Setup prints connect alpha. The first switch prints disconnect alpha before connect beta. Destruction prints disconnect beta.',
        explanation: ['The cleanup captures selected, the value associated with that particular run.', 'Effect.dispose() allows early disposal; an effect created during setup is also disposed with its component.']
      },
      {
        id: 'stop-an-effect', title: 'Use an effect for an action, and stop it when you are done',
        body: 'An effect is for doing something outside the interface when data changes: logging, saving a preference, keeping a connection in sync. It is not for calculating a value; that is what computed is for. effect(fn) runs fn immediately and again whenever the state it read changes. If fn returns a function, that function is the cleanup: it runs before the next run and when the effect ends.\n\nAn effect created in a component script ends with the component. You can also end it earlier: effect returns an Effect object whose dispose() unsubscribes it and runs the last cleanup. An effect created in an ordinary module, outside any component, has no owner, so you must keep it and call dispose() yourself.',
        file: 'src/App.janel', language: 'janel', standalone: true,
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
          'The returned lambda is the cleanup. It remembers the name of the run that created it.',
          'watcher.dispose() ends the effect early; the label keeps updating because it is a binding, not part of the effect.'
        ],
        expected: 'Setup prints Start news. Choosing sports prints Stop news, then Start sports. Stop watching prints Stop sports; later changes to channel still update the label but no longer run the effect.',
        pitfalls: [
          'Do not write a state that the same effect reads and increments: that creates an endless loop.',
          'Hiding a component with {#hidden} does not stop its effects. Only removing it does.'
        ]
      },
      {
        id: 'cleanup-order', title: 'Cleanup order follows registration, not hook names',
        body: 'The actual scope implementation records resources in insertion order and disposes them in reverse order. on_destroy adds its callback during setup. An effect adds its observer when constructed. A mount-returned cleanup is added later, when the mount callback runs. For the sequence below, destruction prints mount cleanup, effect cleanup, then destroy callback, matching the source lifecycle test.\n\nThis does not establish an absolute rule that every mount cleanup precedes every child cleanup. All resources share ownership scopes, and later registrations can change their relative position. Component child scopes, template bindings, timers, and tasks participate in the same ownership mechanism. Design each cleanup to release its own resource without depending on unrelated siblings or still-live controls.',
        file: 'src/App.janel', language: 'janel', standalone: true,
        code: `<script>
from janelkit import on_destroy, effect, on_mount
on_destroy(lambda: print("destroy callback"))
def observe():
    return lambda: print("effect cleanup")
effect(observe)
@on_mount
def mounted():
    return lambda: print("mount cleanup")
</script>
<Text>Close to observe cleanup order.</Text>`,
        expected: 'Unmount prints mount cleanup, effect cleanup, destroy callback in that order.',
        pitfalls: ['Destroy callbacks are not awaited. Do not rely on async on_destroy to finish saving data during teardown.']
      },
      {
        id: 'automatic-disposal', title: 'Know which work the component owns',
        body: 'An effect or task created during setup belongs to the component’s reactive scope. Spawned handler work is attached to the event template’s scope; removing an each row cancels work owned by that row. Timers created during setup capture the current scope and stop automatically when it is disposed. Async timer callbacks are spawned into that captured scope, so pending callbacks are also canceled on disposal.\n\nCancellation is a request delivered to a coroutine, not a synchronous join and not a way to kill a worker thread. Likewise, Timer.stop() stops future ticks but is not itself cancellation of an already-running async tick. Keep cleanup small, synchronous, and safe if called once after partial setup. Non-framework resources such as an external subscription still need an explicit cleanup callable.',
        pitfalls: ['A timer created outside component ownership lives until you stop it.', 'Do not assume a task you created in an unrelated global service automatically belongs to the screen that displays its result.']
      },
      {
        id: 'hidden-versus-destroyed', title: 'Hidden content keeps working; removed content is released',
        body: 'An if block retains only its active branch. Switching away destroys that branch and its component state; returning starts fresh. A hidden block is lazy until first shown, then keeps its content alive while invisible. Hidden template updates wait and catch up once on return, but script effects, timers, and tasks continue running. Retained pages beneath the stack top behave similarly.\n\nAn exit transition can delay final release while its outgoing view animates. A virtualized list can also drop an offscreen row’s Qt view while retaining its Python instance. Do not interpret every loss of visibility or every ref becoming empty as final component destruction. Choose whether background activity should continue explicitly rather than guessing from what is currently painted.',
        explanation: ['Use if to release a temporary component; use hidden when preserving local state matters.', 'Use on_destroy for actual ownership cleanup, not for detecting tab switches.']
      },
      {
        id: 'leave-not-unmount', title: 'before_leave is a veto, not a general unmount callback',
        body: 'before_leave(fn) asks permission before discarding a page through pop, back, replace, or reset, and when the user closes its window with the X. Returning exactly False prevents the action; an async callback may await a confirmation first. The navigation operation can be awaited to learn whether leaving succeeded.\n\nIt is not queried for ordinary if-branch destruction, and switching sections preserves the section rather than requesting permission to discard it. Programmatic window.close() bypasses these guards. Main-window close checks include the windows it opened. Therefore a guard is useful for protecting an unsaved draft during supported user navigation, but it cannot replace actual cleanup or guarantee a final save on every possible process exit. Save deliberately before leaving; release resources with lifecycle cleanup.',
        pitfalls: ['Register guards during setup, even though they execute later.', 'Never put essential resource release only in before_leave: staying on the page must leave the resource usable.']
      }
    ]
  },
  {
    slug: 'context-refs', title: 'Context and refs', group: 'Components',
    description: 'Share values through ancestors and safely reach controls after their views exist.',
    sections: [
      {
        id: 'choose-sharing', title: 'Choose between props, context, and a module',
        body: 'Props expose direct parent-to-child contracts. Context supplies values associated with ancestry, such as the current workspace, without making intermediate layout components forward them mechanically. A global module suits application-wide objects independent of ancestry.\n\nPrefer explicit props for small reusable widgets. Remember that a module singleton is shared through Python’s module cache: importing it from two component instances does not create independent workspaces, unlike their local state.',
        table: {headers: ['Mechanism', 'Use it for'], rows: [['Prop', 'A direct, explicit input.'], ['Ancestor context', 'A value belonging to a particular subtree.'], ['Python module', 'An application-wide store or service.']]},
        explanation: ['Context describes ancestry, not a global variable registry.', 'Use a specific key such as workspace rather than an ambiguous key such as data.']
      },
      {
        id: 'provide-inject', title: 'Provide an object and inject that same object',
        body: 'provide(key, value) stores a value on the current component for its descendants. inject(key, default) walks ancestors from nearest to farthest. Without a default, a missing provider raises LookupError. Both calls belong in script setup, including helpers called synchronously from that setup. The current component is not its own ancestor.\n\nMulti-file example: App provides a State object, and Badge receives that exact object rather than a frozen copy of its current value. Template reading therefore remains reactive. Passing a plain string would share a plain string; context does not automatically turn arbitrary values into reactive state. Use a State or an object containing States when updates should be observed.',
        file: 'Multi-file: src/App.janel + src/components/Badge.janel', language: 'janel',
        code: `<!-- src/App.janel -->
<script>
from janelkit import provide, state
from components.Badge import Badge
workspace = state("Studio")
provide("workspace", workspace)
</script>
<Column padding={24} gap={12}>
  <Badge />
  <Button on:click={workspace = "Lab"}>Change workspace</Button>
</Column>

<!-- src/components/Badge.janel -->
<script>
from janelkit import inject
workspace = inject("workspace")
</script>
<Column><Text>Workspace: {workspace}</Text></Column>`,
        expected: 'The badge begins with Workspace: Studio and changes to Workspace: Lab after the click.'
      },
      {
        id: 'nearest-ancestor', title: 'Override context for just one subtree',
        body: 'An intermediate component can provide the same key with a different object. Descendants under it receive the nearer value; siblings outside it still receive the original ancestor’s value. This makes two workspaces or differently configured previews possible without global switches.\n\nAn injected value is chosen during setup. Updating a shared State’s value is reactive, but replacing a provider dictionary entry later is not a subscription that makes already-initialized children run inject again. Preserve the shared object and change its reactive contents instead. Likewise, an optional default should be meaningful: inject("theme", "light") is reasonable for an optional theme, while silently inventing a workspace can hide a broken component placement. Require essential dependencies so the missing-provider error points to a real problem.',
        language: 'python',
        code: `# Intermediate component's script excerpt:
from janelkit import provide, inject, state
outer_workspace = inject("workspace")
preview_workspace = state("Preview")
provide("workspace", preview_workspace)
# Children of this component receive preview_workspace.`,
        pitfalls: ['This excerpt requires an ancestor provider and is not a standalone component.', 'Injecting an object does not make a defensive copy or restrict its mutation.']
      },
      {
        id: 'context-and-ownership', title: 'Sharing a service does not transfer its ownership',
        body: 'Injecting a connection does not transfer ownership. Its creator should decide when to close it; descendants should not register competing shutdown callbacks. Decide who may mutate shared state too.\n\nPages inherit context from the stack’s declaring component. A secondary window inherits from the owner associated with its imported component reference. These component relationships matter even across OS windows: visual position does not determine ancestry.',
        explanation: ['Pass commands or a small service object when descendants should not manipulate a whole store freely.', 'Use props and events when that contract is clearer than implicit context.']
      },
      {
        id: 'ref-timing', title: 'A reference starts empty, then attaches to a view',
        body: 'ref() creates a Ref for an element’s ref={name} attribute. Its value is None before the element exists, becomes the Qt item when attached, and returns to None when that item is destroyed. The exists property reads this reactive presence state. Creating the Ref is not creating a control.\n\nThe complete example registers focus during setup but performs it at mount time. Unlike a prop or State name, the field variable here is a Ref object with explicit methods. Prefer these public helpers to manipulating its raw Qt value. focus(), blur(), and select_all() do nothing when the reference has no live item, so a premature focus call can silently accomplish nothing rather than wait for mounting.',
        file: 'src/App.janel', language: 'janel', standalone: true,
        code: `<script>
from janelkit import state, ref, on_mount
name = state("Ada Lovelace")
field = ref()
@on_mount
def ready():
    field.focus()
    field.select_all()
</script>
<Column padding={24} gap={12}>
  <TextField ref={field} bind:value={name} />
  <Button on:click={field.focus()}>Focus name</Button>
  <Text>Field exists: {field.exists}</Text>
</Column>`,
        expected: 'The field exists after mounting. Focus name returns keyboard focus to it; the initial name is selected by the mount callback.'
      },
      {
        id: 'conditional-refs', title: 'Watch conditional presence without remounting the parent',
        body: 'A parent’s on_mount runs only once, so it will not run again merely because a field inside an if branch appears later. The field’s Ref can express that later arrival. An effect that reads field.exists will run initially while it is absent and again when the field attaches or detaches.\n\nThis complete example focuses the field whenever its branch creates a new control. Hiding it destroys the control and clears the reference; showing it again creates a fresh control backed by the same parent name State. The state survives because it belongs to the still-live parent. This separates data lifetime from control lifetime without guessing a delay or scheduling arbitrary sleeps.',
        file: 'src/App.janel', language: 'janel', standalone: true,
        code: `<script>
from janelkit import state, ref, effect
shown = state(False)
name = state("Ada")
field = ref()
def focus_when_present():
    if field.exists:
        field.focus()
effect(focus_when_present)
</script>
<Column padding={24} gap={12}>
  <Button on:click={shown = not shown}>Toggle field</Button>
  {#if shown}
    <TextField ref={field} bind:value={name} />
  {/if}
</Column>`,
        expected: 'Toggle field creates and focuses the input. Toggling twice more restores it with the parent-owned name still intact.'
      },
      {
        id: 'ref-helpers', title: 'Use the helper suited to the control',
        body: 'Ref.focus() and blur() control keyboard focus. select_all() is for text inputs; calling it on a live element without that capability raises TypeError. For a List reference, scroll_to_start(), scroll_to_end(), and scroll_to(index) provide list-specific navigation. scroll_to_end also resumes following new items on a follow list.\n\nThe focused property answers whether the item or a descendant currently has keyboard focus, but it is not reactive; read it in a handler rather than expecting a label to track it automatically. The value property exposes QQuickItem or None, an underlying Qt interface rather than a stable JanelKit-specific control API. Use it only when the documented helpers cannot express the operation, and check presence before touching it.',
        pitfalls: ['A single Ref reused inside each points to the last created row, not a collection of row references.', 'A ref on a box-root component targets that root box, not an arbitrary private input inside the child.']
      },
      {
        id: 'inspect-sharing', title: 'Verify scope and timing with observable behavior',
        body: 'Test context with two branches, one under an override and one outside it. Change their States independently to catch accidental global sharing. Test refs before and after conditional creation and removal.\n\nInspection mounts headlessly and unmounts on context-manager exit. app.get("field") retrieves the Ref, app.find locates a rendered control, and app.process handles pending events. These assertions verify actual presence rather than merely how the screen looks.',
        language: 'python',
        code: `# Run after saving the conditional-ref App.janel above.
from janelkit.inspect import mount
with mount("src/App.janel", headless=True) as app:
    field = app.get("field")
    assert field.value is None
    app.find("Button", text="Toggle field").click()
    app.process()
    assert field.exists
    app.find("Button", text="Toggle field").click()
    app.process()
    assert field.value is None`
      }
    ]
  },
  {
    slug: 'navigation', title: 'Navigation', group: 'Components',
    description: 'Choose page stacks, persistent sections, or separate windows, and protect deliberate departures.',
    sections: [
      {
        id: 'three-containers', title: 'Choose the kind of movement your user needs',
        body: 'A stack models a journey: list, detail, then Back to the same list. Sections model destinations such as Projects and People, each retaining its journey. A secondary window is a real OS window for a separate tool or modal editor.\n\nChoose stacks for Back, sections for independent histories, and open_window for another window. All use imported .janel components, props, and events rather than URL routes, but differ in ownership and leave behavior.',
        table: {headers: ['Tool', 'Display', 'What is retained'], rows: [['pages + Pages', 'Top page in one container', 'Earlier pages below it.'], ['sections + Sections', 'One selected destination', 'Each destination’s whole stack.'], ['open_window', 'Separate OS window', 'An independently mounted owned component.']]},
        explanation: ['A Tabs control is only a tab bar; it does not create retained page stacks by itself.']
      },
      {
        id: 'first-stack', title: 'Create a stack and display its top page',
        body: 'pages(first, **props) creates a PageStack during the owner’s setup. <Pages stack={nav} /> creates its display area. A page script calls navigation() during its own setup to retrieve that stack; the component declaring the stack uses its nav variable instead. navigation() outside a page tree raises LookupError.\n\nMulti-file example: save all three files below. Home creates a new Detail page when requested; Detail returns with pop. A pushed page is a new instance. The page underneath stays alive, preserving its state. Props and context are passed through component mechanisms, not a browser address bar. Pages normally occupies the available free space in its container.',
        file: 'Multi-file: src/App.janel + src/pages/Home.janel + src/pages/Detail.janel', language: 'janel',
        code: `<!-- src/App.janel -->
<script>
from janelkit import pages
from pages.Home import Home
nav = pages(Home)
</script>
<Column><Pages stack={nav} /></Column>

<!-- src/pages/Home.janel -->
<script>
from janelkit import navigation, state
from pages.Detail import Detail
nav = navigation()
draft = state("")
</script>
<Column padding={24} gap={12}>
  <TextField bind:value={draft} placeholder="A retained draft" />
  <Button on:click={nav.push(Detail)}>Open detail</Button>
</Column>

<!-- src/pages/Detail.janel -->
<script>
from janelkit import navigation
nav = navigation()
</script>
<Column padding={24} gap={12}>
  <Text>Detail</Text>
  <Button on:click={nav.pop()}>Back</Button>
</Column>`,
        expected: 'Type a draft on Home, open Detail, then press Back. Home reappears with the same draft.'
      },
      {
        id: 'stack-commands', title: 'Distinguish push, pop, replace, and reset',
        body: 'push(Component, **kwargs) adds a new entry without discarding the current one. pop() discards only the top entry and does nothing at depth one. back(value=None) also discards the top entry, optionally delivering a result. replace(Component, **kwargs) discards the current page before creating its replacement. reset(Component, **kwargs) discards the whole history and establishes a new first page.\n\nDiscarding releases component resources; covering a page does not. Covered template work waits until visible, but its script effects and ongoing tasks can continue. Observe nav.current for the top component name, nav.depth for the number of entries, and nav.can_go_back for enabling a Back button. Avoid using nav.page internals as your normal communication mechanism; props, events, and returned results provide clearer boundaries.',
        pitfalls: ['Calling push repeatedly creates repeated instances; it does not find and reuse an existing page of that type.', 'Do not reset a history merely to switch destinations if users expect to return to it.']
      },
      {
        id: 'page-input-results', title: 'Pass inputs in, and optionally wait for a result',
        body: 'Navigation keywords supply declared props; on_saved=accept connects saved = event(). Unknown names raise TypeError listing declarations. Passing a State preserves its reactivity.\n\npush returns an awaitable handle. choice = await nav.push(Picker) waits until Picker calls nav.back(choice); ordinary pop, replace, or reset delivers None instead. The caller remains alive while another screen collects input, much like awaiting a Python function. Continue in an async handler, never a blocking waiting loop.',
        language: 'python',
        code: `# Caller page script excerpt; Picker is an imported .janel component.
async def choose():
    choice = await nav.push(Picker)
    if choice is not None:
        selected.value = choice

# Picker page handler excerpt:
def choose_ada():
    nav.back("Ada")`,
        pitfalls: ['These are coordinated page excerpts, not standalone files. The caller needs selected state and a Picker import.']
      },
      {
        id: 'parallel-sections', title: 'Preserve independent journeys with sections',
        body: 'sections(a=A, b=B) creates named stacks during setup, initially selecting the first named destination. <Sections of={areas} /> displays the selected stack. areas.show("people") switches to that destination without discarding another section. The first visible page tree for a section is created lazily when it is first shown.\n\nAfter that, its whole stack is retained. areas["people"] accesses a named stack, areas.stack accesses the visible one, areas.current is reactive, and areas.names lists names. Each page obtains its own section’s stack through navigation(). Changing sections does not ask before_leave because it preserves the pages. Multi-file adaptation: reuse Home and Detail from the previous complete stack example and replace only App.janel with this version; the two Home instances keep independent drafts and histories.',
        file: 'Multi-file adaptation: src/App.janel; reuses src/pages/Home.janel and Detail.janel above', language: 'janel',
        code: `<script>
from janelkit import sections
from pages.Home import Home
areas = sections(projects=Home, people=Home)
</script>
<Column>
  <Row gap={8}>
    <Button on:click={areas.show("projects")}>Projects</Button>
    <Button on:click={areas.show("people")}>People</Button>
  </Row>
  <Sections of={areas} />
</Column>`,
        expected: 'Open Detail in Projects, switch to People, then return. Projects is still on Detail; People has its own Home draft.'
      },
      {
        id: 'guarded-departure', title: 'Wait for permission before chaining a departure',
        body: 'before_leave(fn) registers a setup-time guard on a page or one of its descendants. The guard may return exactly False or asynchronously resolve to False to veto supported departure. Guards are collected from the page and descendants; reset checks the pages it would discard. A result other than False allows progression.\n\npop, back, replace, and reset return awaitable success handles: await them to receive True after leaving or False after refusal. Do not test the handle itself as a boolean. If a guard needs a dialog, the result may arrive later. The complete App below demonstrates an async veto without extra packages: the X is refused while locked. It is a window-close example, not a generic interception of every component destruction.',
        file: 'src/App.janel', language: 'janel', standalone: true,
        code: `<script>
import asyncio
from janelkit import state, before_leave
locked = state(True)
@before_leave
async def may_leave():
    await asyncio.sleep(0)
    return not locked.value
</script>
<Column padding={24} gap={12}>
  <Text>Closing locked: {locked}</Text>
  <Button on:click={locked = False}>Allow closing</Button>
</Column>`,
        expected: 'Closing with the X is vetoed initially. After Allow closing, the same close request is permitted.',
        pitfalls: ['An if branch removal is not a guarded navigation.', 'Programmatic window.close() does not ask before_leave; do not use it when your flow requires a confirmation first.']
      },
      {
        id: 'secondary-window', title: 'Open a real second window',
        body: 'open_window(Component, modal=False, theme=None, **props_and_events) opens an imported component in a separate window. The returned handle exposes reactive is_open, close(), focus(), and instance. A modal window blocks interaction with its opener while it is open. A theme override applies to that window rather than switching the whole application.\n\nMulti-file example: save both files below. The imported Settings reference belongs to App, so the window inherits App’s ancestor context and is closed automatically when App is disposed. close() is an explicit command and bypasses leave guards; user X-close is the guarded path. Opening repeatedly creates multiple windows unless your application retains and reuses a handle.',
        file: 'Multi-file: src/App.janel + src/components/Settings.janel', language: 'janel',
        code: `<!-- src/App.janel -->
<script>
from janelkit import open_window
from components.Settings import Settings
def open_settings():
    open_window(Settings, modal=True, theme="dark")
</script>
<Button on:click={open_settings}>Settings</Button>

<!-- src/components/Settings.janel -->
<Window title="Settings" width={360} height={240}>
  <Column padding={24}><Text>Settings window</Text></Column>
</Window>`,
        expected: 'Settings opens a separate dark modal window. Close it to interact with the main window again.'
      },
      {
        id: 'navigation-checklist', title: 'Make history and loss of state predictable',
        body: 'Choose whether Back restores an instance, sidebar selection preserves history, and closing a tool discards data. Then test those decisions.\n\nPages supports slide, fade, and scale transitions. Alt+Left and mouse Back navigate the visible innermost stack when focus or pointer context is inside it; a more specific page handler takes precedence. Provide an obvious Back control too, and guard destructive departures independently of animation.',
        steps: ['Verify pop at the first page does not remove it.', 'Push a detail and return; confirm the earlier draft survives.', 'Replace or reset and confirm discarded components run cleanup.', 'If a guard is asynchronous, await the operation before starting dependent navigation.']
      }
    ]
  },
  {
    slug: 'async', title: 'Async work', group: 'Async work',
    description: 'Keep the window responsive using coroutines, observable tasks, safe workers, and owned timers.',
    sections: [
      {
        id: 'ui-thread', title: 'Waiting is not the same thing as blocking',
        body: 'The interface needs its event loop to process typing, painting, and clicks. A synchronous function that sleeps or waits for slow I/O on that thread prevents those activities. async def allows cooperative waiting: while a coroutine is suspended at an await, the Qt-integrated asyncio loop can do other work. JanelKit uses qasync so these coroutines run on the UI thread.\n\nAsync does not mean a separate thread. Code before and after await still runs on the interface thread, and a long CPU loop inside async def still freezes it. Use await for genuinely asynchronous libraries, or move blocking functions to background. After a normal await resumes, you can assign UI state directly; you do not need to send that assignment to another thread.',
        explanation: ['asyncio.sleep yields to the event loop; time.sleep blocks the calling thread.', 'Never call asyncio.run inside an event handler: the application already owns its event loop.'],
        pitfalls: ['Adding async to a function declaration does not make synchronous work inside it non-blocking.']
      },
      {
        id: 'async-handler', title: 'Start with a small async event handler',
        body: 'A function connected to an event may be async def. JanelKit calls it and automatically spawns the returned coroutine, so the button does not need to await anything in its template. Both on:click={save} and an inline call returning a coroutine are supported. Errors are logged with the source handler location.\n\nThis complete example uses a short asyncio delay instead of a network service. It therefore runs without an API key or another project file. The busy state disables repeat clicks while one save is pending. finally releases the busy flag on ordinary completion or cancellation. This pattern is enough for a simple action; use a task when the template needs a standard result, error, and loading interface.',
        file: 'src/App.janel', language: 'janel', standalone: true,
        code: `<script>
import asyncio
from janelkit import state
busy = state(False)
message = state("Ready")
async def save():
    busy.value = True
    try:
        message.value = "Saving"
        await asyncio.sleep(0.1)
        message.value = "Saved"
    finally:
        busy.value = False
</script>
<Column padding={24} gap={12}>
  <Button enabled={not busy} on:click={save}>Save</Button>
  <Text>{message}</Text>
</Column>`,
        expected: 'Save briefly shows Saving, disables the button, then displays Saved and enables the button again.'
      },
      {
        id: 'task-state', title: 'Use a task when loading and failure are part of the screen',
        body: 'The task decorator replaces an async function with a Task object. Task.run(*args, **kwargs) starts it and cancels any previous run. It returns an asyncio.Task; results for display live on the wrapper’s reactive value, loading, and error properties. Calling the wrapper also invokes run.\n\nInitially value and error are None and loading is False. Starting a run sets loading True and clears error, while retaining the last successful value. Success replaces value and clears loading. Failure stores the exception in error and clears loading, without replacing that previous successful value. Cancel clears loading but does not clear value or error. These details let you intentionally keep old results visible while a replacement loads rather than accidentally present them as new.',
        file: 'src/App.janel', language: 'janel', standalone: true,
        code: `<script>
import asyncio
from janelkit import state, task
query = state("Ada")
@task
async def lookup(text):
    await asyncio.sleep(0.1)
    if not text.strip():
        raise ValueError("Enter a name")
    return "Hello, " + text.strip()
</script>
<Column padding={24} gap={12}>
  <TextField bind:value={query} />
  <Button on:click={lookup.run(query)}>Look up</Button>
  <Button on:click={lookup.cancel()}>Cancel</Button>
  {#if lookup.loading}
    <Text>Loading</Text>
  {:else if lookup.error is not None}
    <Text>Error: {lookup.error}</Text>
  {:else}
    <Text>{lookup.value or "No result yet"}</Text>
  {/if}
</Column>`,
        expected: 'Look up produces Hello, Ada. Clearing the field and looking up exposes Enter a name as a visible error.'
      },
      {
        id: 'worker-boundary', title: 'Run blocking functions in background, then apply the result',
        body: 'await background(fn, *args, **kwargs) schedules a normal function in a thread-pool worker and returns its result to the awaiting coroutine. The worker must not touch UI controls or reactive state. Read the input on the UI thread first, pass plain arguments, and return plain output. Assign the result after await, when execution has resumed on the UI thread.\n\nThis complete example makes blocking behavior easy to recognize by using time.sleep inside the worker. The sleep is illustrative; real workers might read a large file or call a synchronous library. Thread offloading keeps the UI thread available, but does not promise multicore acceleration for pure-Python CPU loops. Shared mutable arguments also remain your responsibility: take a suitable plain snapshot instead of passing a live reactive collection to mutate.',
        file: 'src/App.janel', language: 'janel', standalone: true,
        code: `<script>
import time
from janelkit import state, task, background
name = state("Ada")
def blocking_format(text):
    time.sleep(0.1)
    return text.upper()
@task
async def formatted(text):
    return await background(blocking_format, text)
</script>
<Column padding={24} gap={12}>
  <TextField bind:value={name} />
  <Button on:click={formatted.run(name)}>Format</Button>
  <Text>Working: {formatted.loading}</Text>
  <Text>{formatted.value}</Text>
</Column>`,
        expected: 'Format displays ADA after a short wait while the UI remains available.',
        pitfalls: ['Reactive writes from a worker raise the runtime’s wrong-thread error.', 'Reading reactive state in another thread does not collect reactive dependencies; pass captured inputs instead.']
      },
      {
        id: 'cancellation', title: 'Cancellation stops waiting, not every physical operation',
        body: 'Task.cancel() requests asyncio cancellation of the active run and sets loading False immediately. run first cancels the previous run before starting another. A coroutine normally receives CancelledError at a suspension point; let it propagate, using finally for small resource cleanup. Swallowing cancellation and continuing to publish results defeats the ownership contract and can produce stale updates.\n\nA running background thread cannot be forcibly stopped by canceling the coroutine awaiting it. The worker may finish its file write or network request even though the UI no longer awaits its result. With normal cancellation propagation, that canceled task does not publish the abandoned result. Cancellation is therefore not a rollback. Make external side effects deliberate, and use cooperative worker protocols or service-specific cancellation where needed rather than claiming a Cancel button undoes them.',
        explanation: ['Component disposal requests cancellation of its owned async work; cancellation completion happens through the event loop.', 'Task cancellation preserves the previous value. If the UI should erase it, design an explicit display policy.'],
        pitfalls: ['Do not catch BaseException to turn CancelledError into success.', 'Do not assume an async operation is automatically restarted when one of its input states changes; call run with the new input explicitly.']
      },
      {
        id: 'spawn-ownership', title: 'Use spawn for deliberate fire-and-forget work',
        body: 'spawn(awaitable, on_error=None) starts a coroutine and returns an asyncio.Task without requiring the caller to await it. It attaches a cancellation handle when called with an active component or template scope, such as setup, a synchronous event handler, or a synchronous mount callback. Unhandled errors are logged, or sent to on_error.\n\nCreate owned tasks at those clear entry points. The runtime’s active scope is a synchronous stack, not a context automatically re-established throughout every later async continuation. Do not assume a new nested spawn, effect, or timer created after an await will acquire the original component’s ownership. Await helper coroutines directly within the already-owned operation, or construct long-lived Task and timer objects during setup. This keeps ownership explicit without needing internal APIs.',
        file: 'src/App.janel', language: 'janel', standalone: true,
        code: `<script>
import asyncio
from janelkit import state, on_mount, spawn
message = state("Starting")
async def load():
    await asyncio.sleep(0.1)
    message.value = "Ready"
@on_mount
def start():
    spawn(load())
</script>
<Text>{message}</Text>`,
        expected: 'The initial message changes to Ready. If the instance is disposed first, its owned spawned coroutine receives cancellation.'
      },
      {
        id: 'timers', title: 'Schedule future ticks instead of writing a polling loop',
        body: 'interval(ms, fn) repeats a callback; timeout(ms, fn) schedules one call. Both also work as decorators and return Timer objects. They start when created, so create them during component setup or a synchronous mount callback, with the application running. Component-owned timers stop on disposal.\n\nTimer.active is reactive. stop() prevents future ticks; start() and restart() start counting again from zero. Changing ms takes effect on the next restart. Each synchronous tick batches its state changes. An async callback is spawned into the timer’s captured scope, and later ticks are skipped while that callback is still running, rather than queued. An error is logged and does not permanently stop an interval. stop() alone does not cancel an already-running async callback.',
        file: 'src/App.janel', language: 'janel', standalone: true,
        code: `<script>
from janelkit import state, interval, timeout
ticks = state(0)
notice = state("Welcome")
@interval(1000)
def clock():
    ticks.value += 1
clear_notice = timeout(3000, lambda: notice.set(""))
</script>
<Column padding={24} gap={12}>
  <Text>Ticks: {ticks}</Text>
  <Text>{notice}</Text>
  <Button on:click={clock.stop()}>Stop</Button>
  <Button on:click={clock.restart()}>Restart</Button>
</Column>`,
        expected: 'Ticks advances approximately once per second and Welcome clears after three seconds. Stop pauses future ticks; Restart starts a fresh interval.'
      },
      {
        id: 'inspect-async', title: 'Test completion, error, and cancellation separately',
        body: 'Verify loading, success, error, cancellation, and disposal while waiting. app.wait(seconds, until=predicate) runs the integrated event loop; synchronous sleeping would block the completion you need.\n\nAfter saving the task-state App.janel, run these assertions. For background workers, separately verify abandoned results do not reach the UI and understand any unavoidable side effects. Responsiveness alone does not establish thread safety, and cancellation does not prove a remote action was undone.',
        language: 'python',
        code: `from janelkit.inspect import mount
with mount("src/App.janel", headless=True) as app:
    lookup = app.get("lookup")
    app.find("Button", text="Look up").click()
    assert lookup.loading
    app.wait(1, until=lambda: not lookup.loading)
    assert lookup.error is None
    assert lookup.value == "Hello, Ada"
    app.find("Button", text="Look up").click()
    app.find("Button", text="Cancel").click()
    assert not lookup.loading`,
        steps: ['Test with a small deterministic delay before connecting a real service.', 'Add an error path that the user can recover from.', 'Trigger a replacement run and then cancel a pending run.', 'Remove the owning component while waiting and check resource cleanup.']
      }
    ]
  }
];
