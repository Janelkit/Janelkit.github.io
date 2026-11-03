// Source: local JanelKit docs/api.md, docs/lenguaje.md and public implementations.
export const stateDocs = [
  {
    slug: 'persistence', title: 'Persistence and history', group: 'Reactivity',
    description: 'Remember small JSON values across launches and record deliberate undoable edits.',
    sections: [
      {
        id: 'persisted-basics', title: 'Remember a value between application sessions',
        body: 'Normal state starts again on relaunch. persisted(key, initial) loads saved JSON, falling back to initial without a readable valid file. Use it like State, including bindings and nested collection edits.\n\nThe same key returns the same object across the application process; a second default is ignored, not a reset. Assign a replacement explicitly to reset. Choose namespaced keys. This shared object provides neither cross-process synchronization nor database locking.',
        explanation: ['Persistence is about surviving a later launch, while reactivity is about updating the current interface.', 'An application-wide preference does not become component-local merely because persisted is called inside a component script.'],
        pitfalls: ['Do not use one key for unrelated schemas; the first object and any loaded data win.', 'Do not use persisted for secrets: these are ordinary JSON files, not encrypted credential storage.']
      },
      {
        id: 'preferences-example', title: 'A complete preference editor',
        body: 'Running this complete component can write preferences to disk. For isolation, use a disposable project and set JANELKIT_DATA_DIR to a disposable directory before launching. Replace src/App.janel and run python main.py. Changing a value schedules saving; merely displaying its default does not.',
        code: `<script lang="python">
from janelkit import persisted
name = persisted("lesson.name", "")
</script>

<Column padding={24} gap={12}>
  <TextField bind:value={name} placeholder="Your name" label="Your name" />
  <Text>Hello, {name or "visitor"}.</Text>
  <Button on:click={name = ""}>Clear preference</Button>
</Column>`, language: 'janel', standalone: true,
        expected: 'Typing Ada updates the greeting immediately. After a normal close and relaunch with the same data directory, the field still contains Ada. Clear preference saves an empty string, rather than deleting the storage key.'
      },
      {
        id: 'json-and-keys', title: 'Design JSON-shaped data and valid keys',
        body: 'Use strings, numbers, booleans, None, lists, and string-keyed dictionaries. Convert dates, Paths, custom objects, and sets explicitly. Tuples reload as lists; numeric dictionary keys can become strings. Circular structures cannot serialize.\n\nPython JSON serialization is not schema validation. Unsupported values can raise TypeError during creation or change notification; rejected in-place changes are not necessarily rolled back. Validate replacement data first. Loaded JSON is not checked against the new default’s type: migrate changed schemas yourself or use a new key.\n\nKeys start with an ASCII letter or digit, followed by ASCII letters, digits, dots, underscores, or hyphens. prefs.theme is valid; ../theme, slashes, spaces, and leading underscores are invalid and raise ValueError.'
      },
      {
        id: 'storage-lifecycle', title: 'Understand storage location and write timing',
        body: 'Each key maps to <data directory>/<key>.json. JANELKIT_DATA_DIR overrides the directory; otherwise the project name sits under APPDATA on Windows, Library/Application Support on macOS, or XDG_CONFIG_HOME / .config on Linux. Persisted.file is its Path; .key is its identifier.\n\nQt groups changes with a 300 millisecond timer and flushes pending values at shutdown. Without Qt running, changes can flush immediately. flush() writes pending data and returns None, but does not create an unchanged default’s file. Temporary-file replacement avoids partial JSON replacement; it is not database durability or conflict resolution. I/O failures are logged, not successful-save receipts.\n\nEach saved update rewrites the key’s complete JSON: use small preferences, not large documents or databases. Inspection mounts use temporary storage unless JANELKIT_DATA_DIR overrides isolation.'
      },
      {
        id: 'history-example', title: 'Make deliberate changes undoable',
        body: 'History is an in-memory undo journal, not persistence. with history.step(label): records State assignments and reactive list, dictionary, and set mutations as one named user action. Changes outside a step are not recorded. Keep cursor movement and incidental status messages outside document-edit steps. The following complete component needs no saved data and can be tried independently.',
        code: `<script lang="python">
from janelkit import History, state
count = state(0)
history = History(limit=100)

def add():
    with history.step("Add one"):
        count.value += 1
</script>

<Column padding={24} gap={12}>
  <Text>Count: {count}; modified: {history.modified}</Text>
  <Button on:click={add}>Add one</Button>
  <Button enabled={history.can_undo} on:click={history.undo()}>Undo</Button>
  <Button enabled={history.can_redo} on:click={history.redo()}>Redo</Button>
</Column>`, language: 'janel', standalone: true,
        expected: 'Add one changes the count to 1 and modified to True. Undo returns to 0 and modified False; Redo returns to 1. undo() and redo() return the step label, or None when there is no available step.'
      },
      {
        id: 'history-boundaries', title: 'History limits, saved markers, and custom actions',
        body: 'Steps shallowly snapshot touched collections, recording nested dictionaries separately when changed. Undo/redo retain collection objects and notify in a batch. Nested steps merge; unchanged results are omitted. A new edit discards redo; limit bounds retained steps.\n\ncan_undo, can_redo, undo_label, redo_label, and modified are reactive. mark_saved() marks the current position without writing a file; undoing back makes modified False. clear() forgets steps without resetting modified. Establish a newly loaded document baseline with clear and mark_saved.\n\nadd(label, undo=fn, redo=fn) records callbacks for an already performed unobservable action; it does not run redo immediately. You own correctness and external consequences. step is not rollback-on-error; do not hold it across await. Custom mutations are not automatically captured. Undoing persisted data can schedule a save, but the journal itself does not survive relaunch.'
      }
    ]
  },
  {
    slug: 'python-api', title: 'Python API reference', group: 'Reference',
    description: 'Every public top-level export, its purpose and boundaries, plus the supported tooling modules.',
    sections: [
      {
        id: 'public-contract', title: 'Read this reference as a public contract',
        body: 'This reference covers every janelkit.__all__ name in the local alpha. Import these APIs from janelkit, not internals. Types describe factory results or handler payloads, not necessarily manually constructed objects. Signatures omit self and use descriptive parameter names.\n\nJanelKit renders Python desktop applications through Qt Quick: no browser runtime or built-in AI is implied. Scripts execute trusted Python without sandboxing. Guide paths below are plain text.',
      },
      {
        id: 'application-api', title: 'Application entry and version', body: 'Application entry APIs.',
        table: { headers: ['Export and kind', 'Signature / value', 'Behavior, use, and caveat'], rows: [
          ['run — function', 'run(entry, argv=None) -> int', 'Compile the root .janel path, open its window, and run the Qt event loop. Return the exit code; pass it to SystemExit. Resolve entry relative to main.py, not an assumed working directory. Guide: /guide/installation.'],
          ['__version__ — string', '__version__', 'The package version, 0.1.0 in the inspected source. Use for diagnostics and compatibility reporting; it is not the .janel format version. Guide: /guide/installation.']
        ] }
      },
      {
        id: 'reactivity-api', title: 'Reactive factories and observable types', body: 'Factories make observable values; capitalized types identify the resulting objects. All ordinary reactive writes belong on the UI thread. Guides: /guide/state and /guide/computed.',
        table: { headers: ['Export and kind', 'Signature / interface', 'Behavior, use, and caveat'], rows: [
          ['state — function', 'state(initial) -> State', 'Create writable observable data; built-in nested list/dict/set containers are copied into reactive equivalents. Use for UI-owned changing data, not durable storage.'],
          ['State — type', 'State(initial); value, set(new), update(fn), peek(), notify()', 'value tracks reads; set and update replace and return None. peek reads without tracking the State; notify signals custom in-place mutation. Equal same-type assignments normally do not notify.'],
          ['computed — decorator / function', 'computed(fn) -> Computed', 'Wrap a zero-argument synchronous calculation. Read its answer instead of keeping a second writable copy. The function runs lazily and must not perform external work.'],
          ['Computed — type', 'Computed(fn); value, peek()', 'Read-only cached derived value with dynamically tracked dependencies. peek avoids subscribing its caller. Immutable equal answers can suppress downstream work; mutable answers do not get that equality shortcut.'],
          ['effect — function', 'effect(fn) -> Effect', 'Run fn now and after tracked reads change. A returned callable is cleanup before rerun and disposal. Component-setup effects are owned automatically; service effects need explicit disposal.'],
          ['Effect — type', 'Effect(fn, on_error=None); dispose()', 'The observer handle returned by effect. Direct construction additionally accepts an error callback. dispose unsubscribes and cleans up; use for controlling a service lifetime, not deriving a value.'],
          ['batch — context manager factory', 'batch() -> context manager', 'Group synchronous writes until the outermost context exits. Values change immediately; observer work waits. Not rollback or an async transaction.'],
          ['untracked — context manager factory', 'untracked() -> context manager', 'Suppress dependency collection for synchronous reads in its block. Use for incidental context, not to silence existing subscribers or permit worker-thread writes.'],
          ['persisted — function', 'persisted(key, initial) -> Persisted', 'Return process-shared state for a JSON storage key, loading a prior value and saving changes. Later uses of the key ignore their default. Guide: /guide/persistence.'],
          ['Persisted — State subtype', 'value, set, update, peek, notify; key, file, flush()', 'Use the persisted factory rather than its low-level constructor requiring file. flush writes pending JSON now, returning None; serialization and I/O constraints still apply. Guide: /guide/persistence.'],
          ['History — type', 'History(limit=100)', 'step(label), add(label, undo, redo), undo(), redo(), clear(), mark_saved(). Reactive can_undo/can_redo, labels, and modified describe an in-memory edit journal. Saved markers are not disk saves. Guide: /guide/persistence.']
        ] }
      },
      {
        id: 'components-api', title: 'Component inputs and outgoing events', body: 'Declare these at script top level. Guide: /guide/components.',
        table: { headers: ['Export and kind', 'Signature / interface', 'Behavior, use, and caveat'], rows: [
          ['prop — declaration function', 'prop(default omitted) -> Prop', 'Declare a required parent input; supplying a default makes it optional. Read with .value in Python and a direct name in templates. Annotate the declaration for supported type checks.'],
          ['Prop — type', 'value; peek()', 'Reactive read-only input handle. Do not instantiate it manually or assign to value. Request parent-owned changes with an event rather than treating a prop as local writable state.'],
          ['PropError — exception type', 'PropError', 'Signals an attempted prop write. Catch only when intentionally handling invalid ownership; normally fix the child to emit a request instead.'],
          ['event — declaration function', 'event() -> Event', 'Declare an outgoing event consumed through on:name in the parent. Use events to report actions or request changes; an event is not a persisted message queue.'],
          ['Event — type', 'emit(*args, **kwargs); connected', 'emit calls the connected handler; connected reports whether one exists. An unconnected event does nothing. Obtain handles through declarations, not direct manual construction.']
        ] }
      },
      {
        id: 'lifecycle-api', title: 'Lifecycle, ancestry, and element references', body: 'Register lifecycle and ancestry APIs during component-script execution, not from a later click callback. References are declared during setup and used once their target exists. Guide: /guide/components.',
        table: { headers: ['Export and kind', 'Signature / interface', 'Behavior, use, and caveat'], rows: [
          ['on_mount — registration function / decorator', 'on_mount(fn) -> fn', 'Run after the component view exists; an optional returned cleanup runs at unmount. Useful for focus and resource setup. Do not assume elements exist during initial script execution.'],
          ['on_destroy — registration function / decorator', 'on_destroy(fn) -> fn', 'Register teardown; callbacks run in reverse registration order. Use to release resources owned by the component, not to save work for an unknown later application phase.'],
          ['before_leave — registration function / decorator', 'before_leave(fn) -> fn', 'Consult a synchronous or async guard before discarding the containing page or closing its window with X. False vetoes leaving. Programmatic window.close bypasses this question.'],
          ['provide — function', 'provide(key, value) -> None', 'Expose a value to descendants. Sharing the object does not make plain data reactive; provide State when consumers must observe changes.'],
          ['inject — function', 'inject(key, default omitted) -> value', 'Read the nearest ancestor provider. Without a provider or default, raise LookupError. Use ancestry-dependent context, not an assumed global registry.'],
          ['ref — factory', 'ref() -> Ref', 'Create a handle for ref={name} on an element. Use for imperative focus or supported list scrolling, not as a replacement for data binding.'],
          ['Ref — type', 'value, exists, focused; focus(), blur(), select_all()', 'value is reactive and holds Qt object or None; focused is not reactive. Missing targets make actions no-ops. List targets support scroll_to_start(), scroll_to_end(), scroll_to(index). Qt object internals are not stable framework API.']
        ] }
      },
      {
        id: 'input-events-api', title: 'Event payload types, not handler factories', body: 'These types describe payloads received by box event handlers. All support type, prevent(), and stop(). prevent suppresses the default action; stop suppresses propagation. In async handlers call them before the first await. Guide: /guide/events.',
        table: { headers: ['Export and kind', 'Payload fields', 'When to use and caveat'], rows: [
          ['PointerEvent — payload type', 'x, y, window_x, window_y, button, buttons, pointer, clicks, ctrl, shift, alt, meta', 'For click, double-click, context menu, and pointer events on boxes. Local and window coordinates differ; pointer identifies mouse, touch, pen, or keyboard. Do not construct a synthetic payload to simulate real input.'],
          ['DragEvent — payload type', 'PointerEvent fields plus data and dropped', 'For dragstart, dragover, drop, dragend. Set data at dragstart; it reaches subsequent handlers. dropped reports successful receipt at dragend, not file saving.'],
          ['KeyEvent — payload type', 'key, code, text, repeat, modifiers', 'For keydown and keyup; key uses names such as Enter and ArrowUp. Distinguish a logical key from inserted text, especially for shortcuts and non-text keys.'],
          ['WheelEvent — payload type', 'dx, dy, x, y, modifiers', 'For wheel gestures; deltas are pixels and positive dy is downward. Prevent default scrolling only when your handler supplies an intentional alternative.'],
          ['FocusEvent — payload type', 'reason', 'For focus and blur; reason is tab, click, or code. These events do not bubble like ordinary pointer events. Use for focus-related behavior, not tracking all global keyboard activity.'],
          ['ResizeEvent — payload type', 'width, height', 'For element resize, also readable by event["width"]. Use the element dimensions rather than assuming they represent the entire window.']
        ] }
      },
      {
        id: 'async-timers-api', title: 'Async operations and timers', body: 'Coroutines run on the UI thread through Qt and qasync. Awaiting does not make blocking Python work nonblocking. Component-owned operations cancel or stop on unmount. Guide: /guide/async.',
        table: { headers: ['Export and kind', 'Signature / interface', 'Behavior, use, and caveat'], rows: [
          ['spawn — function', 'spawn(awaitable, on_error=None) -> asyncio.Task', 'Schedule without awaiting immediately. Retain the task for cancellation if needed. Component-owned tasks cancel at unmount; service-owned work needs an owner and error policy.'],
          ['background — function', 'background(fn, *args, **kwargs) -> awaitable Future', 'Run synchronous fn in a worker and await its result. Pass ordinary data; workers must not touch state or UI. Canceling the await cannot interrupt already-running thread work.'],
          ['task — decorator / function', 'task(fn) -> Task', 'Wrap an async operation with observable loading, error, and result. Decoration does not start work: call .run. Prefer this over an effect for explicit asynchronous user operations.'],
          ['Task — type', 'Task(fn); run(*args, **kwargs), cancel(); loading, error, value', 'run returns an asyncio.Task and cancels the prior run. Reactive value is initially None and error holds failures. cancel does not undo external effects or forcibly stop a worker.'],
          ['interval — function / decorator', 'interval(ms, fn) or @interval(ms) -> Timer', 'Start repeated callbacks in milliseconds. Each invocation batches synchronous writes. An async callback skips overlapping ticks rather than launching unlimited parallel invocations.'],
          ['timeout — function / decorator', 'timeout(ms, fn) or @timeout(ms) -> Timer', 'Schedule one callback after the delay. Keep the Timer to stop or restart a pending notice or debounce-like action. It needs the Qt event loop to advance.'],
          ['Timer — type', 'Timer(ms, fn, repeat); active, ms, start(), restart(), stop(), __call__()', 'Normally obtained from interval/timeout. active is reactive; changing ms takes effect on next start. Calling the object invokes fn now. Callback errors are logged and repeating timers continue.']
        ] }
      },
      {
        id: 'navigation-windows-api', title: 'Navigation stacks and secondary windows', body: 'Components passed here are imported .janel component definitions, not arbitrary Python view classes. Create stacks during component setup. Props and on_event callbacks use keyword arguments. Guide: /guide/navigation.',
        table: { headers: ['Export and kind', 'Signature / interface', 'Behavior, use, and caveat'], rows: [
          ['pages — factory', 'pages(first, **props_and_events) -> PageStack', 'Create a component-owned stack displayed by <Pages stack={nav} />. Pushing preserves underlying pages; discarding a page unmounts it. No URL or browser history is implied.'],
          ['PageStack — type', 'push(C, **kwargs), pop(), back(value=None), replace(C, **kwargs), reset(C, **kwargs)', 'Await push for a back(value) result. Await the other navigation results for True/False guard outcomes. Reactive current, depth, can_go_back describe the stack; page is its visible instance. Obtain it through pages/navigation.'],
          ['navigation — function', 'navigation() -> PageStack', 'Get the enclosing page stack during script setup, including from descendants. Use to return a page result without passing the stack through every prop. Requires a page context.'],
          ['sections — factory', 'sections(**named_components) -> Sections', 'Create parallel named stacks displayed by <Sections of={sections_handle} />. Each section is initialized when first shown and retained afterward. Switching sections does not discard pages.'],
          ['Sections — type', 'show(name), [name], stack, names, current', 'show selects a section; indexing accesses its PageStack and stack accesses the visible one. current is reactive. Use the factory rather than manually supplying internal owner arguments.'],
          ['open_window — function', 'open_window(component, *, modal=False, theme=None, **props_and_events) -> window handle', 'Open a component in another desktop window. Handle: reactive is_open, close(), focus(), instance. It inherits context and closes with its owner; modal blocks the owner. close() bypasses before_leave.']
        ] }
      },
      {
        id: 'theme-locale-video-api', title: 'Global services and video frames', body: 'locale/theme are singleton services; Frames is a stream type. Guides: /guide/styles and /packages/overview.',
        table: { headers: ['Export and kind', 'Signature / interface', 'Behavior, use, and caveat'], rows: [
          ['locale — singleton', 'language, rtl; set(language), reset()', 'Observe or change interface language and Qt default locale, including RTL mirroring. Does not load translation catalogs: translation functions belong to the optional janelkit-i18n package.'],
          ['theme — singleton', 'name, names, tokens; set(name), toggle(), define(name, base="light", **tokens), extend(name=None, **tokens), reset()', 'Read reactive theme data, switch light/dark, define a named palette, or extend tokens. reset restores defaults. Use documented tokens and supported CSS; this is not a browser stylesheet engine.'],
          ['Frames — type', 'Frames(color="rgb"); push(image), latest(), clear(), next(), async iteration; size, fps', 'Stream latest-only frames to Video. Colors: rgb/bgr/rgba/bgra. push accepts compatible buffers or QImage, copies display data, and is thread-safe. size/fps are reactive; async consumption yields latest input objects. Does not open cameras or provide built-in vision models.']
        ] }
      },
      {
        id: 'compiler-diagnostics', title: 'Compiler and diagnostic entry points', body: 'Import these from janelkit.compiler and janelkit.diagnostics, not from the top-level package. Compile/check inspect trusted source without executing its component script; mounting and running do execute it. Guide: /guide/cli.',
        table: { headers: ['Name and kind', 'Signature / interface', 'Purpose and boundary'], rows: [
          ['compile_file / compile_source — functions', 'compile_file(path, roots=None, as_window=True); compile_source(source, file="<memoria>", roots=None)', 'Return CompiledComponent or raise JanelError. roots supplies component search roots. File compilation can disable root-window wrapping for reusable components; source compilation has no public as_window parameter.'],
          ['check_file / check_source — functions', 'check_file(path, roots=None, as_window=True); check_source(source, file="<memoria>", roots=None)', 'Return list[Diagnostic] for editor validation without running component scripts or launching a window. Use severity to distinguish warnings from errors instead of treating every message as fatal.'],
          ['CompiledComponent — result type', 'qml, file, files, warnings, all_warnings', 'Generated QML and source/dependency information; all_warnings includes dependency warnings. Other compiler result attributes and generated-QML internals are not public integration contracts.'],
          ['FORMAT_VERSION — integer', 'FORMAT_VERSION', 'The supported .janel language-format version, separate from package __version__. Useful for tooling compatibility; adding syntax need not increment it.'],
          ['JanelError — exception type', 'JanelError(diagnostics); diagnostics, first', 'Contains one or more Diagnostic objects. Report the structured location and suggestion rather than showing only a generic compilation failure.'],
          ['Diagnostic — data type', 'message, location, hint, severity; format()', 'Structured compiler feedback; severity is error or warning. format returns a human-readable report including source context when available.'],
          ['SourceLocation — data type', 'file, line, column', 'Identifies source positions. Line and column count from one; do not interpret them as zero-based editor offsets.']
        ] }
      },
      {
        id: 'inspection-extension-api', title: 'Inspection, extension hooks, and package boundaries',
        body: 'janelkit.inspect is the supported testing interface. janelkit.ext is for optional packages extending the framework. These names are public module entry points, not additional exports from janelkit.__all__. The optional desktop package supplies dialogs, clipboard, and notifications; importing their names from the core is not supported. Guide: /guide/cli and /packages/overview.',
        table: { headers: ['Name and kind', 'Signature / interface', 'Purpose and caveat'], rows: [
          ['inspect.mount — context manager', 'mount(entry, headless=True) -> context yielding MountedApp', 'Mount trusted application source without a visible window and clean up on exit. Persistence is isolated unless JANELKIT_DATA_DIR is explicitly set. Qt and project dependencies still need installation.'],
          ['MountedApp — inspection type', 'find(tag=None, **criteria), find_all(...), texts(), get(name), namespace, process(), wait(seconds=0, until=None, timeout=5), key(keys), windows()', 'Find controls by text/id/placeholder/label; find requires one visible match. find_all also accepts visible_only=True. get reads the script namespace; process/wait advance work, key sends a shortcut, windows inspects secondary windows.'],
          ['Element — inspection type', 'tag, id, text, label, value, visible, enabled, prop(name)', 'Read control data. Actions: click(), type(text), submit(), check(bool=True), slide(value), choose(option), focus(), key(keys), hover()/unhover(), press()/release(), double_click(), right_click(), drag_to(target, x=None, y=None, cancel=False). Actions exercise supported controls; .item exposes unstable Qt internals.'],
          ['InspectError — exception type', 'InspectError, an AssertionError subtype', 'Signals missing/ambiguous matches, disabled controls, or unsupported actions. Make selectors explicit rather than ignoring this failure.'],
          ['ext.app — function', 'app() -> running application or None', 'Extension access to public engine, qt_app, and main_window(). No running app means None. Qt interfaces themselves follow Qt, not the JanelKit component contract.'],
          ['ext.inspector — decorator', 'inspector(name)(fn)', 'Register fn(app, *args) as a MountedApp inspection method. Use for optional-package testing helpers instead of monkey-patching runtime internals.'],
          ['janelkit.commands — entry-point group', 'name = "package.cli:configure"', 'A package declares configure(parser), adds arguments, and sets parser.set_defaults(func=execute). execute(args) returns an exit code. Broken plugins or attempts to replace core commands are ignored with a warning.']
        ] }
      }
    ]
  }
];
