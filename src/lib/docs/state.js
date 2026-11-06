// Sources (read-only): JanelKit/docs/api.md and docs/lenguaje.md (0.2), cross-checked
// against janelkit.__all__ (tests/content.test.js) and the public implementations.
export const stateDocs = [
  {
    slug: 'python-api', title: 'Python API reference', group: 'Reference',
    description: 'Every public top-level export, its purpose and boundaries, plus the supported tooling modules.',
    sections: [
      {
        id: 'public-contract', title: 'Read this reference as a public contract',
        body: 'This reference covers every janelkit.__all__ name of JanelKit 0.2. Import these APIs from janelkit, not internals. Types describe factory results or handler payloads, not necessarily manually constructed objects. Signatures omit self and use descriptive parameter names.\n\nJanelKit renders Python desktop applications through Qt Quick: no browser runtime or built-in AI is implied. Scripts execute trusted Python without sandboxing. Guide paths below are plain text.',
      },
      {
        id: 'application-api', title: 'Application entry and version', body: 'Application entry APIs.',
        table: { headers: ['Export and kind', 'Signature / value', 'Behavior, use, and caveat'], rows: [
          ['run — function', 'run(entry, argv=None) -> int', 'Compile the root .janel path, open its window, and run the Qt event loop. Return the exit code; pass it to SystemExit. Resolve entry relative to main.py, not an assumed working directory. Guide: /guide/installation.'],
          ['__version__ — string', '__version__', 'The package version, such as 0.2.0.0. Use for diagnostics and compatibility reporting; it is not the .janel format version. Guide: /guide/installation.']
        ] }
      },
      {
        id: 'reactivity-api', title: 'Reactive factories and observable types', body: 'Factories make observable values; capitalized types identify the resulting objects. All ordinary reactive writes belong on the UI thread; a write from another thread raises WrongThreadError. persisted and Persisted moved to janelkit-store in 0.2 (/ecosystem/store/reference), and History was removed (/reference/changes). Guides: /guide/state and /guide/computed.',
        table: { headers: ['Export and kind', 'Signature / interface', 'Behavior, use, and caveat'], rows: [
          ['state — function', 'state(initial) -> State', 'Create writable observable data; built-in nested list/dict/set containers are copied into reactive equivalents. Use for UI-owned changing data, not durable storage.'],
          ['State — type', 'State(initial); value, set(new), update(fn), peek(), notify()', 'value tracks reads; set and update replace and return None. peek reads without tracking the State; notify signals custom in-place mutation. Equal same-type assignments normally do not notify. For debugging, subscriber_count is how many effects and computed values read it now; it should drop when what uses it is unmounted.'],
          ['computed — decorator / function', 'computed(fn) -> Computed', 'Wrap a zero-argument synchronous calculation. Read its answer instead of keeping a second writable copy. The function runs lazily and must not perform external work. On a method of a class (@computed def total(self)), each instance gets its own computed: obj.total.value.'],
          ['Computed — type', 'Computed(fn); value, peek()', 'Read-only cached derived value with dynamically tracked dependencies. peek avoids subscribing its caller. Immutable equal answers can suppress downstream work; mutable answers do not get that equality shortcut.'],
          ['effect — function', 'effect(fn) -> Effect', 'Run fn now and after tracked reads change. A returned callable is cleanup before rerun and disposal. Component-setup effects are owned automatically; service effects need explicit disposal.'],
          ['Effect — type', 'Effect(fn, on_error=None); dispose()', 'The observer handle returned by effect. Direct construction additionally accepts an error callback. dispose unsubscribes and cleans up; use for controlling a service lifetime, not deriving a value. Its repr says which function it runs, how many sources it reads and whether it is disposed or waiting because it is not seen.'],
          ['batch — context manager factory', 'batch() -> context manager', 'Group synchronous writes until the outermost context exits. Values change immediately; observer work waits. Not rollback or an async transaction.'],
          ['untracked — context manager factory', 'untracked() -> context manager', 'Suppress dependency collection for synchronous reads in its block. Use for incidental context, not to silence existing subscribers or permit worker-thread writes.'],
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
          ['before_leave — registration function / decorator', 'before_leave(fn) -> fn', 'Consult a synchronous or async guard before the user closes its window with the X, and before a host discards the component (a page of janelkit-router). False vetoes leaving. Programmatic window.close bypasses this question.'],
          ['is_visible — function', 'is_visible() -> Computed', 'Whether the component is seen: False on a covered page, in a section that is not the current one, inside a {#hidden} that hides it, or in a <list> row out of view. The root of a window is always seen; minimizing does not count. Call it during setup; pass it to interval(..., when=...) to pause work nobody sees.'],
          ['provide — function', 'provide(key, value) -> None', 'Expose a value to descendants. Sharing the object does not make plain data reactive; provide State when consumers must observe changes.'],
          ['inject — function', 'inject(key, default omitted) -> value', 'Read the nearest ancestor provider. Without a provider or default, raise LookupError. Use ancestry-dependent context, not an assumed global registry.'],
          ['ref — factory', 'ref() -> Ref', 'Create a handle for ref={name} on an element. Use for imperative focus or supported list scrolling, not as a replacement for data binding.'],
          ['Ref — type', 'value, exists, focused; focus(), blur(), select_all()', 'value is reactive and holds Qt object or None; focused is not reactive. Missing targets make actions no-ops. <list> and <scroll> targets support scroll_to_start(), scroll_to_end() and scroll_to(…): a row index in a <list>, the ref of an element inside a <scroll>. Qt object internals are not stable framework API.']
        ] }
      },
      {
        id: 'input-events-api', title: 'Event payload types, not handler factories', body: 'These types describe payloads received by box event handlers. All support type, prevent(), and stop(). prevent suppresses the default action; stop suppresses propagation. In async handlers call them before the first await. Guide: /guide/events.',
        table: { headers: ['Export and kind', 'Payload fields', 'When to use and caveat'], rows: [
          ['PointerEvent — payload type', 'x, y, window_x, window_y, image_x, image_y, button, buttons, pointer, clicks, ctrl, shift, alt, meta', 'For click, double-click, context menu, and pointer events on boxes and <video>. Local and window coordinates differ; pointer identifies mouse, touch, pen, or keyboard. image_x and image_y are the image pixel on a <video> (None outside the image, without a frame or from the keyboard) and None on other elements. Do not construct a synthetic payload to simulate real input.'],
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
          ['interval — function / decorator', 'interval(ms, fn, when=None) or @interval(ms, when=None) -> Timer', 'Start repeated callbacks in milliseconds. Each invocation batches synchronous writes. An async callback skips overlapping ticks rather than launching unlimited parallel invocations. With when= (a state, a computed, is_visible() or a function that reads them), it counts only while the condition holds, and from zero when it holds again.'],
          ['timeout — function / decorator', 'timeout(ms, fn, when=None) or @timeout(ms, when=None) -> Timer', 'Schedule one callback after the delay. Keep the Timer to stop or restart a pending notice or debounce-like action. when= as in interval. It needs the Qt event loop to advance.'],
          ['Timer — type', 'active, ms, start(), restart(), stop(), __call__(); runs, skipped, last_duration', 'Normally obtained from interval/timeout. active is reactive; changing ms takes effect on next start. stop() wins over when=: a timer stopped by hand does not start again by itself. Calling the object invokes fn now. Callback errors are logged and repeating timers continue. runs, skipped (ticks skipped while an async run was still going) and last_duration (seconds, async part included) are for measuring and are not reactive.']
        ] }
      },
      {
        id: 'windows-screens-api', title: 'Secondary windows and screens', body: 'Components passed here are imported .janel component definitions, not arbitrary Python view classes. Props and on_event callbacks use keyword arguments. Page stacks and sections are not in the core since 0.2: see janelkit-router (/ecosystem/router/reference). Guide: /guide/windows.',
        table: { headers: ['Export and kind', 'Signature / interface', 'Behavior, use, and caveat'], rows: [
          ['open_window — function', 'open_window(component, *, modal=False, theme=None, single=False, **props_and_events) -> window handle', 'Open a component in another desktop window. Handle: reactive is_open, close(), focus(), instance. It inherits context and closes with its owner; modal blocks the owner. single=True brings an already open window of that component to the front and returns it instead of opening another. close() bypasses before_leave.'],
          ['screens — reactive value', 'screens.value -> list[Screen]', 'The connected screens, read-only and reactive: it changes when a screen is connected or disconnected, the primary one changes or a resolution changes. Empty until the application starts. Use with <window screen={i} fullscreen={bool}>.'],
          ['Screen — type', 'index, name, width, height, x, y, primary, scale', 'One screen of screens. Position and size are logical pixels of the virtual desktop; scale is physical pixels per logical pixel. Choose a screen by index or by name.']
        ] }
      },
      {
        id: 'theme-locale-video-api', title: 'Global services and video frames', body: 'locale/theme are singleton services; Frames is a stream type. Guides: /guide/styles and /guide/video.',
        table: { headers: ['Export and kind', 'Signature / interface', 'Behavior, use, and caveat'], rows: [
          ['locale — singleton', 'language, rtl; set(language), reset()', 'Observe or change interface language and Qt default locale, including RTL mirroring. Does not load translation catalogs: translation functions belong to the janelkit-i18n package, whose i18n.set() also changes this language.'],
          ['theme — singleton', 'name, names, tokens; set(name), toggle(), define(name, base="light", **tokens), extend(name=None, **tokens), reset()', 'Read reactive theme data, switch light/dark, define a named palette, or extend tokens. reset restores defaults. Use documented tokens and supported CSS; this is not a browser stylesheet engine.'],
          ['Frames — type', 'Frames(color="rgb", stall_after=1.5); push(image), latest(), clear(), next(), async iteration; size, fps, stalled', 'Stream latest-only frames to <video>. Colors: rgb/bgr/rgba/bgra. push accepts compatible buffers or QImage, copies display data, and is thread-safe. size, fps and stalled are reactive: stalled is True after stall_after seconds without a push, and fps drops to 0 with it. Async consumption yields latest input objects. Does not open cameras or provide built-in vision models.']
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
        body: 'janelkit.inspect is the supported testing interface. janelkit.ext is for packages that extend the framework. These names are public module entry points, not additional exports from janelkit.__all__. Packages add helpers to MountedApp when imported: janelkit-desktop adds dialogs() and answer_dialog(), janelkit-store adds store() and mutations(). Guides: /guide/testing and /ecosystem/build-your-own.',
        table: { headers: ['Name and kind', 'Signature / interface', 'Purpose and caveat'], rows: [
          ['inspect.mount — context manager', 'mount(entry, headless=True) -> context yielding MountedApp', 'Mount trusted application source without a visible window and clean up on exit. Each mount opens a new session with a temporary data folder unless JANELKIT_DATA_DIR is explicitly set. headless=False shows a real window, for screenshots with fonts. Qt and project dependencies still need installation.'],
          ['MountedApp — inspection type', 'find(tag=None, **criteria), find_all(...), texts(), get(name), namespace, process(), wait(seconds=0, until=None, timeout=5), key(keys), windows(), screenshot(path=None)', 'Find controls by text/id/placeholder/label; find requires one visible match. find_all also accepts visible_only=True. get reads the script namespace; process/wait advance work, key sends a shortcut, windows inspects secondary windows, screenshot returns the window as a QImage and saves it when given a path.'],
          ['Element — inspection type', 'tag, id, text, label, value, visible, enabled, prop(name)', 'Read control data; text is what an element shows and None in fields, whose input is value. Actions: click(), type(text), submit(), check(bool=True), slide(value), choose(option), focus(), key(keys), hover()/unhover(), press()/release(), double_click(), right_click(), drag_to(target, x=None, y=None, cancel=False), screenshot(path=None). click, double_click, right_click, hover, press and release accept x= and y= relative to the element; click(x=, y=) is a real mouse click at that point. Actions exercise supported controls; .item exposes unstable Qt internals.'],
          ['InspectError — exception type', 'InspectError, an AssertionError subtype', 'Signals missing/ambiguous matches, disabled controls, or unsupported actions. Make selectors explicit rather than ignoring this failure.'],
          ['ext.app — function', 'app() -> running application or None', 'Extension access to public engine, qt_app, and main_window(). No running app means None. Qt interfaces themselves follow Qt, not the JanelKit component contract.'],
          ['ext.inspector — decorator', 'inspector(name)(fn)', 'Register fn(app, *args) as a MountedApp inspection method. Use for the testing helpers of a package instead of monkey-patching runtime internals.'],
          ['ext hosts, sessions and writes — names', 'Host, Container, Child, Gate, ask_to_leave, is_component, Scope, session, Session, on_write, own', 'The extension points janelkit-router and janelkit-store are built with: mount components inside a .qml element, keep data per application, and watch state writes. Explained in /ecosystem/build-your-own.'],
          ['janelkit.commands — entry-point group', 'name = "package.cli:configure"', 'A package declares configure(parser), adds arguments, and sets parser.set_defaults(func=execute). execute(args) returns an exit code. Broken plugins or attempts to replace core commands are ignored with a warning.']
        ] }
      }
    ]
  }
];
