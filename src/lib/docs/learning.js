// Provenance: read-only local JanelKit/README.md, docs/lenguaje.md and docs/tutorial.md.
// Implementation cross-checks: packages/janelkit/src/janelkit/runtime/component.py;
// compiler/__init__.py, compiler/expressions.py, compiler/sfc_parser.py;
// qt_backend/application.py and cli/scaffolding.py. These guides describe that alpha source.
export const learningDocs = [
  {
    slug: 'introduction',
    title: 'Introduction',
    group: 'Getting started',
    description: 'Learn what a desktop interface is and how Python becomes a reactive JanelKit window.',
    sections: [
      {
        id: 'what-is-janelkit', title: 'From a Python program to a window',
        body: 'A graphical user interface, or GUI, lets someone operate a program through visible controls such as buttons and text fields instead of typing Python commands. JanelKit is a framework: a collection of tools and conventions for building those interfaces. You describe what a window contains and write ordinary Python to decide what happens when someone uses it.\n\nJanelKit makes desktop applications, not websites. Qt is the underlying application and graphics toolkit; its Qt Quick system renders, or draws, the interface. PySide6 connects Python to Qt. You do not need a browser, a JavaScript program, or handwritten QML to build the examples here. QML is the interface description language JanelKit generates for Qt internally.'
      },
      {
        id: 'first-window', title: 'Read a complete small application',
        body: 'A component is a named piece of interface together with its logic. A .janel file defines one component. This complete application component can replace src/App.janel in a generated project. The first part creates data; the middle describes the visible controls; the last sets spacing. You will learn to create and run the surrounding project in First app.\n\nA template is the description of the interface outside script and style sections. It is declarative: it says what should be visible for the current data, rather than issuing a sequence of drawing commands. Read the example from top to bottom before changing anything.',
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
          'The import supplies state, which wraps a value so JanelKit can notice changes. count starts at zero.',
          'Window creates the application window. A property is a named setting on an element: title, width and height are properties here.',
          'Column arranges its children vertically. Text displays a sentence, replacing {count} with the current number.',
          'An event is a notification that something happened, such as a click. on:click connects the button event to an action that increases count.',
          'The page class connects the Column to a style rule. Padding leaves space around its contents; gap separates its children.'
        ],
        expected: 'A desktop window titled Hello, JanelKit shows You clicked 0 times. and an Increment button. Each click increases the displayed number.'
      },
      {
        id: 'reactive-data', title: 'Why the text changes by itself',
        body: 'State is data the interface can observe. Reactive means that a change to observed data can update the interface automatically. A binding is a connection between an expression and the property or text that displays its result. The {count} expression creates such a connection. When count changes, the text is recalculated without you finding the label and changing it manually.\n\nInside Python functions, read and write state through .value. In template expressions, a direct state name is automatically unwrapped to its contained value, so {count} displays the number. The inline event action count += 1 is special template syntax that writes back to state. It is not an instruction to replace count with an ordinary Python integer.'
      },
      {
        id: 'file-parts', title: 'Give each part one responsibility',
        body: 'The script holds Python imports, state and functions. The template describes elements and their relationships. The optional style section contains CSS rules: a notation for appearance such as spacing and text color. JanelKit implements a CSS subset, not a browser styling system.\n\nA file has at most one script and one style section. The template needs one root containing everything else. An application entry may use Window; nested components must not. Extract smaller components when interface sections repeat or become difficult to understand.'
      },
      {
        id: 'scope-and-trust', title: 'Know what runs and what is still changing',
        body: 'JanelKit is a 0.1 alpha: minor versions in the 0.x series can break compatibility with migration notes. These lessons describe the checked local source, not guaranteed future behavior.\n\nEach instance, meaning one use of a component, executes its script once and owns separate local state; clicks do not rerun initialization. Imported Python modules still follow normal sharing rules. Scripts and expressions are trusted project code without a security sandbox.',
        pitfalls: ['Do not load a stranger’s .janel file as if it were harmless text; it can execute Python.', 'Do not assume familiar-looking tags mean browser HTML or that arbitrary CSS is supported.', 'A normal Python variable is not a replacement for reactive state when later changes must update the screen.']
      },
      {
        id: 'practice', title: 'Try a prediction before a change',
        body: 'Predict what changing state(0) to state(10) will do, then change the button caption. The starting number belongs to data; the caption belongs to presentation. Neither change requires replacing the event system.\n\nNext, increase by two and click three times after a fresh launch. Explain the result: the event changes state, and the text binding reads that state. This same pattern appears in larger forms and lists.',
        steps: ['Continue to First app to create a project and run this component.', 'Change only the starting count, save, and check the initial display after restarting.', 'Restore zero, change the increment amount to two, and verify three clicks display six.']
      }
    ]
  },
  {
    slug: 'how-it-works', title: 'How it works', group: 'Getting started',
    description: 'Follow startup, compilation, Python bindings and a click through the desktop runtime.',
    sections: [
      {
        id: 'startup', title: 'main.py hands control to JanelKit',
        body: 'Like a command-line script, a desktop program needs a starting point. main.py calls run with the root component path. run prepares the component, creates its window and processes input until exit. It returns an exit code, not a window.\n\nThis complete Python launcher requires src/App.janel; it is not a standalone component. Using __file__ locates the component relative to main.py rather than the terminal’s current directory.',
        language: 'python',
        code: `from pathlib import Path
from janelkit import run

if __name__ == "__main__":
    entry = Path(__file__).parent / "src" / "App.janel"
    raise SystemExit(run(entry))`,
        explanation: ['Path constructs the component filename without manually joining platform-specific separators.', 'The __main__ guard starts the application when this file is executed directly.', 'run compiles the entry, opens the interface and runs Qt’s event loop. SystemExit returns its result to the operating system.'],
        expected: 'Running python main.py opens the interface defined by src/App.janel and keeps the process alive while the application runs.'
      },
      {
        id: 'template-tree', title: 'The template becomes a tree',
        body: 'Think of a template as a family tree: Window contains Column, which contains Text and Button. A containing element is the parent; elements inside are children. Row arranges children horizontally and Column vertically. Tags define nesting; indentation helps people read it.\n\nParsing recognizes sections, elements, expressions and source locations. The resulting abstract syntax tree is a structured description the compiler understands. You need not manipulate it; its source locations let diagnostics point back to your file.'
      },
      {
        id: 'compile-and-render', title: 'Compilation and evaluation are different jobs',
        body: 'The compiler checks the component, analyzes its script and lowers the template into an intermediate representation: a description convenient for generating the interface. It produces QML plus tables that tell the Python runtime about bindings, handlers and dynamic regions. Imported .janel components are resolved and compiled too. QML is generated interface machinery, not a translation of your Python application logic into JavaScript.\n\nQt Quick loads the generated QML and renders the controls. Meanwhile, the Python runtime evaluates template expressions and executes your functions. A bridge exposes the resulting values to Qt through properties that can announce changes. This division explains why you can inspect generated QML without needing to write QML to build an ordinary app.'
      },
      {
        id: 'instances', title: 'Creation runs the script once',
        body: 'Creating an instance executes its script in a fresh namespace, the collection of names belonging to that instance, then activates its bindings. Defining a function does not execute its body; a later event calls it.\n\nOne component file can describe many instances with independent state. Removing a child through a conditional and showing it again creates a new instance and reruns its script. An ordinary click that changes state does not.'
      },
      {
        id: 'update-cycle', title: 'Trace one click through the event loop',
        body: 'An event loop waits for work such as keyboard input, pointer input and timers, then dispatches it to the appropriate code. Qt supplies that loop; JanelKit integrates asynchronous Python work through qasync. A button click reaches the Python handler through the bridge. The handler changes state, and the bindings that read that state become candidates for recalculation. The affected bridge properties notify Qt, which updates the visible result.\n\nChanges made by an event handler are batched, meaning they are grouped instead of treating every assignment as an unrelated interface update. You do not need a manual redraw call. A long blocking function still prevents the interface thread from processing input; automatic reactivity does not turn slow synchronous work into background work.',
        pitfalls: ['Do not add your own infinite while loop to keep the window alive; run already runs the event loop.', 'Do not put slow disk or network work directly in a click handler and expect the window to remain responsive.', 'Do not expect a state update to execute the entire component script again.']
      },
      {
        id: 'inspect-pipeline', title: 'Inspect one layer at a time',
        body: 'parse shows the parsed structure; compile shows generated QML. build validates project components and writes QML into build/qml, but does not produce an executable. You still need to run the application to exercise its behavior.\n\nExercise: run parse on the counter, misspell Button and retry, then restore it. Compare compile output with your template. You need not understand every generated line: your template is the source, while QML is generated machinery, not another file to maintain.',
        language: 'shell', code: `janel parse src/App.janel
janel compile src/App.janel
janel build`
      }
    ]
  },
  {
    slug: 'first-app', title: 'First app', group: 'Getting started',
    description: 'Create a project, replace its starter with a counter and verify every interaction.',
    sections: [
      {
        id: 'create-project', title: '1. Create a project folder',
        body: 'Use an activated Python environment with JanelKit installed. The source tutorial requires Python 3.10 or newer; the Installation guide covers environment setup. Run these commands in a terminal, the application where you type shell commands, not at the Python >>> prompt. janel is the command installed with JanelKit.\n\nnew creates a named folder containing main.py and a src directory with the starter component, sample components and services. cd changes the terminal’s working directory into that folder. If the target already contains files, scaffolding refuses to overwrite it. Pick a fresh name rather than deleting an existing project to make the command succeed.',
        language: 'shell', code: `janel new first-counter
cd first-counter
python main.py`,
        expected: 'The generated starter window opens. Close it before replacing the starter so the next launch is easy to recognize.',
        pitfalls: ['If janel is not found, confirm the environment used for installation is active.', 'Run project commands from first-counter, the folder containing main.py, not from src.', 'Do not paste shell commands inside App.janel or the Python interpreter.']
      },
      {
        id: 'find-files', title: '2. Locate the two files you need',
        body: 'Open the project in a text editor. main.py launches it; src/App.janel defines the root interface. src/components holds smaller components, and src/services holds ordinary Python modules. This counter needs neither.\n\nLeave main.py unchanged and replace all of src/App.janel below. Partial replacement can leave conflicting imports or roots. Unused sample files may remain because this app does not import them. Save as App.janel, not App.janel.txt; no external resources are required.'
      },
      {
        id: 'complete-counter', title: '3. Paste the complete counter',
        body: 'This entire src/App.janel file increases or resets a number. Reset is disabled at zero, calculated from count rather than maintained separately.\n\nFunctions use ordinary Python and write count.value. Template expressions automatically unwrap count, using the number without .value. Both text and enabled read the same state, so the sentence and button availability stay consistent.',
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
        explanation: ['from janelkit import state supplies the only framework function needed by this component.', 'count = state(0) establishes the initial value once for this instance.', 'increment and reset are named handlers. Defining them does not execute them.', 'Window supplies the title and preferred dimensions; Column groups the sentence and action row.', 'on:click={increment} passes a callable. JanelKit calls it when the button is activated.', 'enabled={count > 0} reads the current number and disables Reset at zero.', 'The two class rules add outer space, vertical separation and horizontal separation between buttons.']
      },
      {
        id: 'run-and-check', title: '4. Run and check visible behavior',
        body: 'From the project folder, run python main.py again. The title should now identify your counter instead of the starter. The initial sentence includes zero, and Reset is disabled. Click Increment twice: the sentence changes after each click and Reset becomes available. Click Reset: zero returns and the button disables again.\n\nThese checks verify more than whether a window exists. They exercise startup, event connections, Python state updates and two reactive bindings. Close the application and launch again to confirm that count starts at zero. Ordinary state is held in memory for this instance; this tutorial has not implemented saving between launches.',
        language: 'shell', code: `python main.py`,
        expected: 'My first counter shows You clicked 0 times. initially. Two increments show You clicked 2 times. Reset restores zero and becomes disabled.',
        steps: ['Verify the initial number and disabled Reset button.', 'Click Increment twice and check the number after each click.', 'Click Reset and check both the sentence and button availability.', 'Close and reopen the app to confirm the initial value returns.']
      },
      {
        id: 'edit-loop', title: '5. Use development mode deliberately',
        body: 'Close the app and run janel dev from the project folder. Saving a .janel file reloads its view; unchanged scripts can retain state. Python file edits restart the process. Restart explicitly to test initial values.\n\nChange the title and save, then change increment to add two. Script changes affect initialization during reload. Development convenience is not persistence: retaining data during reload does not save it between launches.' ,
        language: 'shell', code: `janel dev`
      },
      {
        id: 'practice-and-debug', title: '6. Extend the app without losing the model',
        body: 'Exercise: add Decrement without allowing negative numbers. Write the rule in a function in the existing script, then connect another Button inside Row. Do not add another script or Window. Test zero and positive values.\n\nWhen something fails, read the terminal’s file, line and column. Compilation may catch misspelled names, while Python exceptions may appear only when a handler runs. janel build checks structure, not every possible interaction.',
        pitfalls: ['In Python handlers use count.value; in template text use count.', 'A function that sets a number but is never connected to on:click cannot respond to the button.', 'If an edit appears ignored, check which project folder and application process you are actually running.']
      }
    ]
  },
  {
    slug: 'template-syntax', title: 'Template syntax', group: 'Template language',
    description: 'Read tags, attributes, Python expressions, classes and formatting without assuming HTML or JavaScript.',
    sections: [
      {
        id: 'elements-and-text', title: 'Elements describe controls, not web pages',
        body: 'An element is one item in the template, written with a tag such as Text or Button. Paired tags enclose content; a self-closing tag ends with /> when it has no content. Text, Button and Checkbox use their enclosed text as their caption. Whitespace in template text is collapsed rather than preserving every line break and indentation space.\n\nAn attribute is the written setting on a tag, such as title="Preview". It supplies an element property. Property names and tag names must be supported by JanelKit; a familiar HTML attribute does not become valid automatically. Keep one root element and nest additional controls beneath it. Template comments use <!-- comment --> and do not appear in the interface.'
      },
      {
        id: 'attribute-forms', title: 'Distinguish literals, expressions and shorthand',
        body: 'Quoted literals supply text; braces supply Python expression results. width={420} expresses a number; enabled={count > 0} expresses a changing Boolean. Python uses True and False. A bare attribute such as flat means flat={True}, not a string.\n\nThe shorthand {enabled} means enabled={enabled}, matching property and expression names. This partial snippet assumes count and enabled exist in the script. Place it inside a root container; it is not a complete file.',
        language: 'janel',
        code: `<!-- Partial template: count and enabled are defined in the script. -->
<Button text="Save" enabled={count > 0} />
<Button flat>Quiet action</Button>
<Button {enabled}>Continue</Button>`,
        explanation: ['text="Save" supplies a constant caption.', 'enabled={count > 0} supplies the result of a comparison, not the comparison as a string.', 'flat is a Boolean attribute, while {enabled} is a shorthand attribute referencing a name.'],
        expected: 'Save is enabled only above zero; Quiet action uses the flat property; Continue follows the script’s enabled value.'
      },
      {
        id: 'python-expressions', title: 'Use Python expressions, not JavaScript',
        body: 'Inside braces, use Python operators and builtins: len(items), not ready, ready and valid, or "Ready" if ready else "Wait". JavaScript forms such as ===, && and condition ? yes : no are not this language. A normal text expression computes a value; assignments and compound statements do not belong in displayed text. Event attributes have their own limited inline statement support, explained in Events.\n\nJanelKit rewrites expression name lookups and compiles Python expressions, then evaluates them in the component’s runtime context. This is not a claim that expressions are safe for untrusted input. Do not take user-entered text and treat it as template source or feed it to eval. Component scripts and template logic are trusted application code, not a sandboxed formula language.'
      },
      {
        id: 'unwrapping-and-format', title: 'Read reactive names and format text',
        body: 'A direct name referring to state, computed data or a component prop is unwrapped automatically in the template. A prop is an input supplied by a parent component; the child reads it rather than owning its updates. Unwrapping applies to names, not every attribute chain. For a state stored on a module, an ordinary expression may need that attribute’s .value; importing the state by name is often clearer.\n\nText interpolation supports Python-style format specifications and conversions, like an f-string. The complete example below uses two decimal places and repr. None displays as empty text. Formatting syntax belongs in text interpolation, not arbitrarily appended to a property expression.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
price = state(12.5)
name = state("Ada")
</script>

<Window title="Formatting" width={360} height={220}>
  <Column padding={24} gap={12}>
    <Text>Price: {price:.2f}</Text>
    <Text>Name: {name!r}</Text>
    <Button on:click={price += 1}>Increase price</Button>
  </Column>
</Window>`,
        expected: 'The window initially shows Price: 12.50 and Name: \'Ada\'. Increase price changes the first line to Price: 13.50.'
      },
      {
        id: 'classes', title: 'Classes select style rules',
        body: 'A class is a name used to match an element with a style rule. class="card selected" applies two names. An expression can return a string, a nested list of class choices, or a dictionary whose truthy values select names. class:selected={chosen} applies selected only while chosen is true. Define the corresponding rules in the component’s style section; unknown classes produce warnings.\n\nThe following partial snippet assumes chosen is defined as reactive state in the existing script. Add the Column inside your existing root, and merge the rules into your one style section. The ordinary Python dictionary in the class expression is data used to choose class names, not a separate CSS block.',
        language: 'janel',
        code: `<!-- Partial template; requires chosen = state(False). -->
<Column class={["card", {"selected": chosen}]}>
  <Text>Selection preview</Text>
</Column>

<!-- Merge these rules into the existing style section. -->
<style>
.card { padding: 16px; }
.selected { background: var(--surface); }
</style>`
      },
      {
        id: 'syntax-practice', title: 'Practice translating an intention into syntax',
        body: 'Exercise: add Text showing Discount available above fifteen, otherwise Regular price. Use a Python conditional expression. Add a Boolean button property and explain whether it is constant or reactive.\n\nDebug the right layer: unmatched tags concern structure, missing names concern name resolution, and formatting nonnumeric values with .2f concerns runtime types. Source locations help, but you still need to understand the value your expression produces.',
        pitfalls: ['Do not write {price.value} for a directly imported state name; price is already unwrapped there.', 'enabled="False" is not the recommended way to express a Python Boolean; use enabled={False}.', 'Do not assume a template lambda sees the original state object: direct state names are unwrapped inside it too.', 'Do not paste a partial snippet with its own style block alongside an existing style block without merging them.']
      }
    ]
  },
  {
    slug: 'control-flow', title: 'Control flow', group: 'Template language',
    description: 'Choose branches, repeat keyed rows and deliberately recreate interface regions.',
    sections: [
      {
        id: 'choose-branch', title: 'Choose visible content with if',
        body: 'Control flow means choosing which instructions or interface descriptions apply. You know Python if statements; template if blocks perform a related job for visible content. {#if condition} begins a branch, {:else if condition} adds another test, {:else} supplies a fallback and {/if} closes the block. Tests use Python truth values.\n\nPlace blocks inside the component’s root container. JanelKit selects the first matching branch rather than displaying all true branches. This partial snippet belongs inside the counter’s Column and uses its existing count state. With zero it displays the fallback; with one through four it displays Some clicks; with five or more it displays the first branch.',
        language: 'janel',
        code: `<!-- Partial template inside the counter's Column. -->
{#if count >= 5}
  <Text>Five or more clicks</Text>
{:else if count > 0}
  <Text>Some clicks</Text>
{:else}
  <Text>No clicks yet</Text>
{/if}`,
        explanation: ['count >= 5 is checked first, so larger values do not also select the second branch.', 'The final else needs no condition and handles zero in this counter.', 'The closing /if marks the end of the conditional region.'],
        expected: 'The message changes from No clicks yet to Some clicks after the first increment, then to Five or more clicks at five.'
      },
      {
        id: 'branch-lifetime', title: 'A removed branch is actually unmounted',
        body: 'Mounting means creating a piece of live interface and connecting its reactive behavior. Unmounting means removing it and releasing its bindings and child components. An inactive if branch is not merely an invisible object waiting behind the active one. Changing branches destroys the outgoing content and creates the incoming content. The examples here use no exit transitions that could delay final cleanup.\n\nConsequently, local state in a child component inside a removed branch is lost. Showing the branch again creates a fresh child instance. Store important data in a longer-lived parent when it must survive that removal. JanelKit also has a hidden block for preserving content across visibility changes, but do not assume if has those preservation semantics.'
      },
      {
        id: 'complete-list', title: 'Repeat rows from Python data',
        body: 'An each block creates a region per iterable item. The name after as identifies the current item; the optional second name holds its zero-based index. These names exist only within the row. This complete app uses dictionary id fields as keys.\n\nRemove and reverse edit the reactive list through its unwrapped template name. Removing the final item activates else. Unlike a one-time Python print loop, this region stays connected and adjusts when data changes.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
items = state([
    {"id": 1, "name": "Bread"},
    {"id": 2, "name": "Milk"},
])
</script>

<Window title="A small list" width={420} height={320}>
  <Column padding={24} gap={12}>
    <Button on:click={items.reverse()}>Reverse order</Button>
    {#each items as item, i (item["id"])}
      <Row gap={8}>
        <Text>{i + 1}. {item["name"]}</Text>
        <Button on:click={items.remove(item)}>Remove</Button>
      </Row>
    {:else}
      <Text>The list is empty.</Text>
    {/each}
  </Column>
</Window>`,
        expected: 'Bread and Milk appear as numbered rows. Reverse order swaps them and updates their positions. Removing both rows shows The list is empty.'
      },
      {
        id: 'keys-identity', title: 'A key is identity, not a position',
        body: 'A key identifies a logical item across changes. Choose a unique, stable, hashable value, such as an integer or string identifier. Hashable means usable as a Python dictionary key; lists and dictionaries are not.\n\nWithout explicit keys, rows use positions, potentially attaching editing state or focus to the wrong item after sorting. Avoid index keys for changing lists. item["id"] preserves identity when reordered; updated data under the same key updates that row. Removal still destroys it.'
      },
      {
        id: 'key-remount', title: 'Use key when recreation is the goal',
        body: 'An each key preserves row identities. A key block instead recreates its contents when its expression changes, useful for discarding an editor’s local draft. Remount means unmounting old content and mounting new content.\n\nThis partial template requires generation state and belongs inside your root. Incrementing generation recreates TextField, losing text stored only in that control. A parent-owned bound value survives and supplies the recreated field: this boundary changes content lifetime, not parent-state lifetime.',
        language: 'janel',
        code: `<!-- Partial template; requires generation = state(0). -->
<Button on:click={generation += 1}>Recreate field</Button>
{#key generation}
  <TextField placeholder="Temporary draft" label="Temporary draft" />
{/key}`
      },
      {
        id: 'flow-exercises', title: 'Test empty data and identity changes',
        body: 'Exercise: show the item count above the list. Remove, reverse and empty the list; explain why item identity differs from displayed position. Start with empty data and check the fallback immediately.\n\nType in the key example before recreating the field. Repeat with a parent-owned bound state to distinguish control lifetime from data lifetime. For virtualized List controls, consult their separate rules: their each region does not support this ordinary each else fallback.',
        pitfalls: ['Do not generate a new random key on every evaluation; that discards stable identity.', 'Do not use repeated names as keys unless your data model guarantees uniqueness.', 'Do not assign directly to an each item name in an inline handler; mutate its data or update the parent collection.', 'Do not expect child-local state to survive an if removal or a changed key block.']
      }
    ]
  },
  {
    slug: 'events', title: 'Events', group: 'Template language',
    description: 'Connect user actions to Python, understand event arguments and bind input accessibly.',
    sections: [
      {
        id: 'handler-reference', title: 'An event connects an action to code',
        body: 'An event announces something that happened: a Button was clicked, a TextField received input, or a Checkbox changed its checked state. A handler is the function or inline action that responds. Writing on:click={save} connects an existing Python callable to the button; the handler is selected and called when the event arrives.\n\nIn a script function, read and change state with .value. Keeping several steps in a named function is usually easier to read and test than squeezing them into an attribute. The following partial example adds a handler to an existing script and a button to its template. It assumes count is already declared as state and is not a complete component by itself.',
        language: 'python', code: `# Partial script: count is an existing state.
def reset():
    count.value = 0

# Connect in the template with:
# <Button on:click={reset}>Reset</Button>`,
        explanation: ['def reset creates a callable without resetting immediately.', 'The function body uses count.value because it executes as script-side Python.', 'on:click={reset} refers to that callable and lets the runtime invoke it later.'],
        expected: 'When connected to the counter, activating Reset changes the existing count to zero.'
      },
      {
        id: 'inline-actions', title: 'Inline actions run when the event occurs',
        body: 'An inline handler such as on:click={count += 1} can perform a simple assignment or call. Direct assignments to script state names write their contained values. Multiple simple actions can be separated by semicolons. Compound statements such as if, for and def belong in a script function instead of an inline handler.\n\nJanelKit distinguishes a callable reference from an inline call. A name, attribute, index, lambda or conditional expression is treated as a callable-producing expression. A call such as on:click={save()} is an inline action executed on the click, not during initial rendering. If make_handler(x) returns another function, on:click={make_handler(x)} executes that factory but does not then invoke its return value. Choose an explicit script function when this distinction becomes confusing.',
        language: 'janel', code: `<!-- Partial template; count and draft are existing states. -->
<Button on:click={count += 1}>Increment</Button>
<Button on:click={count = 0; draft = ""}>Clear both</Button>`
      },
      {
        id: 'event-arguments', title: 'Understand what the control sends',
        body: 'Different events supply different arguments. TextField input and submit supply text; Checkbox change supplies a Boolean. A callable handler receives the positional arguments its signature accepts, so def submit(): and def submit(text): are both useful for a field’s submit event. The former can read bound state; the latter can use the supplied text.\n\nIn an inline handler, event names the single argument, or a tuple when there are multiple positional arguments. It is not automatically a browser event object. For a Checkbox it is the checked Boolean, so on:change={done = event} writes that value. Do not assume every control has event.target.value. The event name also shadows a script variable named event inside an inline handler.',
        language: 'janel', code: `<!-- Partial template; done is a Boolean state. -->
<Checkbox checked={done} on:change={done = event}>Done</Checkbox>`
      },
      {
        id: 'two-way-binding', title: 'Bind input in both directions',
        body: 'A value expression sends data to a control. Two-way binding also sends user edits back: bind:value={name} connects a field to state, and bind:checked={done} connects a checkbox. Other labels can then update without a separate input handler.\n\nTargets must be writable states, not computed values, read-only props or row variables. Paths ending in a state are supported; start with direct names. This complete app binds both controls and uses submitted text to store a trimmed greeting.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit import state
name = state("")
done = state(False)
message = state("Type a name, then press Enter.")

def greet(text):
    message.value = f"Hello, {text.strip() or 'friend'}!"
</script>

<Window title="Input and events" width={460} height={340}>
  <Column padding={24} gap={12}>
    <Text>Your name</Text>
    <TextField bind:value={name} on:submit={greet}
      placeholder="Type a name" label="Your name" />
    <Text>Current name: {name}</Text>
    <Checkbox bind:checked={done}>Finished</Checkbox>
    <Text>Status: {"finished" if done else "in progress"}</Text>
    <Text>{message}</Text>
  </Column>
</Window>`,
        expected: 'Typing Ada immediately updates Current name: Ada. Enter shows Hello, Ada!. Checking Finished changes the status to finished.'
      },
      {
        id: 'accessibility', title: 'Make actions understandable without a mouse',
        body: 'Accessibility supports different input methods and assistive tools. Screen readers need meaningful control names. Button and Checkbox captions provide names; label sets or overrides an accessible name. A placeholder is only an empty-field hint. This example includes visible Your name text and an explicit field label.\n\nUse Tab and Shift+Tab to check template-order navigation and visible focus. Check Enter submission. Prefer descriptive actions to unexplained symbols. Clickable containers without meaningful text also need labels; styling alone cannot communicate purpose.'
      },
      {
        id: 'event-practice', title: 'Practice both input and programmatic changes',
        body: 'Exercise: add Clear, setting name.value to an empty string and done.value to False. Check the controls themselves, not just their summaries: this verifies Python-to-control binding. Typing verifies the reverse direction. Submit an empty name to test the fallback.\n\nHandlers run on the interface thread. Async handlers are supported, but blocking operations still need a background-work approach. Keep initial handlers short, and inspect logged source locations when they fail.',
        pitfalls: ['Do not use count.set inside a template lambda expecting count to remain a state object; direct names are unwrapped.', 'Do not bind directly to a plain Boolean or string declared without state.', 'Do not assume event is always an object: inspect the documented arguments for that particular event.', 'Do not confuse a successful initial launch with tested events; activate every action and check both directions of input binding.'],
        steps: ['Type a name and confirm the live summary changes.', 'Press Enter and confirm the greeting uses submitted text.', 'Toggle Finished with mouse and keyboard.', 'Add Clear and verify state changes are reflected in the controls.']
      }
    ]
  }
];
