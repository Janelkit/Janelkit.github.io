// Sources: JanelKit/docs/estilos.md and docs/lenguaje.md; original source used read-only.
export const interfaceDocs = [
  {
    "slug": "glossary",
    "title": "Glossary",
    "group": "Getting started",
    "description": "A plain-language dictionary for the words used throughout these guides.",
    "sections": [
      {
        "id": "interface-vocabulary",
        "title": "Words for what you see",
        "body": "You do not need a history of web development to learn a desktop UI framework. Start with the visual objects: a window contains elements; containers arrange them; controls let the user act. These words describe responsibilities, not separate programming languages.",
        "table": {
          "headers": [
            "Term",
            "Meaning in JanelKit"
          ],
          "rows": [
            [
              "GUI / user interface",
              "The visible window and controls a person uses to interact with your Python program."
            ],
            [
              "Framework",
              "A library plus a structure for your app: it handles rendering, events, and connections so you describe the application behavior."
            ],
            [
              "Element / tag",
              "One template building block, written with angle brackets, such as <Text> or <Column>."
            ],
            [
              "Container",
              "An element that arranges children, such as Row, Column, or flex."
            ],
            [
              "Control",
              "A building block that displays information or accepts input: Button, TextField, Checkbox."
            ],
            [
              "Property / attribute",
              "A named setting on an element or component, such as width={400} or title=\"Notes\"."
            ],
            [
              "Parent / child",
              "An outer element or component and something it contains. This is a relationship in the interface tree."
            ]
          ]
        }
      },
      {
        "id": "component-vocabulary",
        "title": "Words for organizing your code",
        "body": "A component is a reusable part of an interface. A .janel file packages its setup logic, template, and optional styles. Instantiating a component means creating one use of it; two uses normally have independent local state.",
        "table": {
          "headers": [
            "Term",
            "Meaning in JanelKit"
          ],
          "rows": [
            [
              "Single-file component",
              "One .janel file containing a script, one template root, and optionally style rules."
            ],
            [
              "Template",
              "A declaration of which elements exist and how their properties depend on Python values."
            ],
            [
              "Declarative",
              "Describe what the interface should represent instead of manually changing each visual object."
            ],
            [
              "Instance",
              "One live use of a component, with its own Python setup and local state."
            ],
            [
              "Prop",
              "An input supplied by a parent to a child component, declared with prop()."
            ],
            [
              "Custom event",
              "A child-to-parent notification declared with event() and emitted with .emit(...)."
            ],
            [
              "Slot",
              "A position in a child template where the parent can supply interface content."
            ]
          ]
        }
      },
      {
        "id": "reactivity-vocabulary",
        "title": "Words for changing data",
        "body": "Reactivity connects data changes to the output that depends on them. Think of a formula that knows which input cells it reads: changing one input invalidates the relevant result, not every unrelated value. That comparison explains dependency tracking; it does not mean JanelKit is a spreadsheet engine.",
        "table": {
          "headers": [
            "Term",
            "Meaning in JanelKit"
          ],
          "rows": [
            [
              "State",
              "A tracked value created with state(...); read or write .value in Python."
            ],
            [
              "Binding",
              "A connection from a Python expression to an element property or displayed text."
            ],
            [
              "Two-way binding",
              "An input and state update each other, expressed with bind:value or bind:checked."
            ],
            [
              "Dependency",
              "A reactive value read while calculating another value, binding, or effect."
            ],
            [
              "Computed value",
              "A cached value derived from reactive inputs with @computed."
            ],
            [
              "Effect",
              "A function rerun for a side effect when the reactive values it reads change."
            ],
            [
              "Batch",
              "A group of state changes whose dependent effects are flushed together."
            ]
          ]
        }
      },
      {
        "id": "runtime-vocabulary",
        "title": "Words for execution and lifetime",
        "body": "The script setup runs when a component instance is created; reactive updates do not rerun the whole script. Mounting concerns the visible view becoming available. Unmounting or destroying an instance releases its owned resources. Hiding a view does not always destroy it: preserved pages and hidden blocks can remain alive.",
        "table": {
          "headers": [
            "Term",
            "Meaning in JanelKit"
          ],
          "rows": [
            [
              "Qt Quick / PySide6",
              "The rendering system and Python bindings used to display desktop interfaces."
            ],
            [
              "Compiler / generated QML",
              "The transformation from .janel source into Qt view declarations and runtime information. User expressions still evaluate in Python."
            ],
            [
              "Event loop",
              "The loop that processes input, timers, and scheduled work so the window remains interactive."
            ],
            [
              "UI thread",
              "The thread responsible for the interface; state changes that affect it belong here."
            ],
            [
              "Coroutine / async",
              "A Python operation that can pause at await so other work can continue. It is not automatically another thread."
            ],
            [
              "Background worker",
              "A separate thread used for blocking work; return plain results rather than touching state or UI there."
            ],
            [
              "Cleanup",
              "Stopping or releasing something the component started when its owner is destroyed."
            ]
          ]
        }
      },
      {
        "id": "use-the-words",
        "title": "Check your understanding",
        "body": "Imagine a search form. The TextField is a control, the Column around it is a container, and the whole SearchPanel.janel file is a component. Its query is state. bind:value connects the field to that state. A Button click is an event. The function called by that click is a handler. A task can represent the search loading state and result.\n\nPractice: identify those same responsibilities in the first-app guide before learning another API. If a word is unfamiliar, return to this page rather than assuming it means exactly what it means in a browser framework.",
        "explanation": [
          "A framework API is easier to remember when you know which responsibility it serves: data, appearance, communication, or lifetime.",
          "You can use Python modules for ordinary services. Not every function or data structure needs to become a component."
        ],
        "expected": "You can describe which data a small component owns, which input it receives, which events it reports, and when its resources should stop.",
        "pitfalls": [
          "Do not confuse this Svelte website with the desktop runtime it documents. The site is a browser app; JanelKit builds Python desktop apps."
        ]
      }
    ]
  },
  {
    "slug": "controls",
    "title": "Layout and controls",
    "group": "Interface",
    "description": "Choose the right building block for text, input, scrolling, selection, and accessible desktop interaction.",
    "sections": [
      {
        "id": "building-blocks",
        "title": "A control is a piece of the interface",
        "body": "A control is an interactive or visual building block: a button, a text field, or a checkbox. A container arranges other elements. A property configures a building block; an event reports something that happened to it. You do not import built-in template elements into Python. Write <Button> in the template and import state in the script when a value must change.\n\nTags are case-sensitive. Built-in controls and user components start with capital letters; lowercase flex is a reserved layout primitive. An unknown tag or property is a compile error with valid alternatives, not an invitation to fall back to arbitrary HTML.",
        "table": {
          "headers": [
            "Element",
            "Purpose",
            "Start with"
          ],
          "rows": [
            [
              "Window",
              "The root application window",
              "title, width, height"
            ],
            [
              "Column / Row",
              "Vertical / horizontal arrangement",
              "gap, padding, flex"
            ],
            [
              "flex",
              "General CSS-like flexible box",
              "direction, wrap, align, justify"
            ],
            [
              "Text",
              "Display a label or formatted text",
              "text content, selectable, format"
            ],
            [
              "Button",
              "Invoke an action",
              "on:click, enabled, variant"
            ],
            [
              "Spacer",
              "Consume remaining space",
              "Place between siblings"
            ]
          ]
        }
      },
      {
        "id": "input-controls",
        "title": "Connect inputs to application data",
        "body": "An input has a current value, but your application also needs that value in Python. bind:value connects the control and a state in both directions. A checkbox represents True or False, so its property is checked rather than value. Give inputs a label that explains their purpose; a placeholder disappears when text is entered and is not always enough context.",
        "code": "<script lang=\"python\">\nfrom janelkit import state\nname = state(\"\")\nsubscribed = state(False)\n</script>\n\n<Window title=\"A small form\" width={460} height={300}>\n  <Column class=\"page\">\n    <Text>Your name</Text>\n    <TextField bind:value={name} placeholder=\"Ada\" label=\"Your name\" />\n    <Checkbox bind:checked={subscribed}>Receive updates</Checkbox>\n    <Text>Hello, {name or \"visitor\"}.</Text>\n    <Text>Updates enabled: {subscribed}</Text>\n  </Column>\n</Window>\n\n<style>\n.page { padding: 24px; gap: 12px; }\n</style>",
        "language": "janel",
        "standalone": true,
        "explanation": [
          "name starts as an empty string. The TextField writes each user edit back to name through bind:value.",
          "subscribed starts as False. bind:checked writes the checkbox boolean to that state.",
          "The labels read these states, so their content changes without a manual refresh function."
        ],
        "expected": "Typing Ada changes the greeting to Hello, Ada. Toggling Receive updates changes the displayed boolean.",
        "pitfalls": [
          "Using checked={subscribed} alone is one-way input: it does not express the same two-way state contract as bind:checked.",
          "Use Python False and True, not JavaScript false and true."
        ]
      },
      {
        "id": "choose-an-input",
        "title": "Choose an input by the type of value",
        "body": "Prefer the control whose meaning matches the data. TextField is for short single-line text; TextArea is for longer text. Slider is a numeric position in a range. Select, RadioGroup, and Tabs choose one option. Checkbox and Switch choose a boolean.\n\nOptions can be strings or dictionaries with label and value. With dictionaries, the user sees the label while Python receives the value. Tabs renders the tab bar only: you choose the content with conditional template blocks.",
        "table": {
          "headers": [
            "Element",
            "Important properties",
            "User update / binding"
          ],
          "rows": [
            [
              "TextField",
              "value, placeholder, readonly",
              "on:input(text), on:submit(text); bind:value"
            ],
            [
              "TextArea",
              "value, placeholder, readonly",
              "on:input(text); bind:value"
            ],
            [
              "Checkbox / Switch",
              "checked, text",
              "on:change(bool); bind:checked"
            ],
            [
              "Slider",
              "value, min, max, step",
              "on:change(number); bind:value"
            ],
            [
              "Select",
              "options, value, placeholder",
              "on:change(value); bind:value"
            ],
            [
              "RadioGroup",
              "options, value, horizontal",
              "on:change(value); bind:value"
            ],
            [
              "Tabs",
              "options, value",
              "on:change(value); bind:value"
            ],
            [
              "ProgressBar",
              "value, max, indeterminate",
              "Display only; update from state"
            ]
          ]
        }
      },
      {
        "id": "scroll-or-list",
        "title": "Choose Scroll or List deliberately",
        "body": "Scroll is a vertical scrolling column that creates all its contents. Use it for a settings page or a modest list. List is virtualized: it creates the visible row views plus a margin rather than every view at once. This is useful for hundreds or thousands of records, but it has a more specific contract.\n\nList must contain exactly one keyed #each. Put its empty-state #if outside List because the inner {:else} branch is not supported there. Store editable row values in reactive state: a row view may be destroyed when it scrolls away and reconstructed when it returns, while the row Python instance remains until that item is removed. Effects and tasks can therefore keep running while a virtualized row has no visible view.",
        "code": "<script lang=\"python\">\nfrom janelkit import state\nrows = state([{\"id\": i, \"title\": f\"Item {i}\"} for i in range(200)])\n</script>\n\n<Window title=\"A longer list\" width={440} height={360}>\n  <List>\n    {#each rows as row (row[\"id\"])}\n      <Text>{row[\"title\"]}</Text>\n    {/each}\n  </List>\n</Window>",
        "language": "janel",
        "standalone": true,
        "expected": "A scrollable window shows the numbered items. Rows appear as you scroll without constructing all row views at once."
      },
      {
        "id": "accessibility-and-media",
        "title": "Make controls understandable without a mouse",
        "body": "An accessible name is the description a screen reader can announce. Most controls use their text; label overrides or supplies that name. Image uses alt. A clickable flex box can use as=\"button\" to express keyboard and screen-reader semantics; the role does not supply its colors or shape. Standard Button is often the clearest choice for a simple action.\n\nShortcut handles a window keyboard action without occupying layout space. It exists only while its template branch exists. Image displays a file or URL; Video displays a Frames source supplied by Python. Rendering live camera frames and opening a camera are separate concerns: camera acquisition is not a built-in control.",
        "table": {
          "headers": [
            "Element / property",
            "Why use it?",
            "Example"
          ],
          "rows": [
            [
              "label",
              "Give an input/action a meaningful name",
              "label=\"Search notes\""
            ],
            [
              "Image / alt",
              "Describe meaningful images",
              "alt=\"Project diagram\""
            ],
            [
              "Shortcut",
              "Provide a keyboard action",
              "keys=\"Ctrl+S\", on:activate={save}"
            ],
            [
              "as=\"button\"",
              "Add semantics to a custom flex box",
              "Keyboard activation and focus behavior"
            ],
            [
              "ProgressBar / indeterminate",
              "Show work with unknown progress",
              "indeterminate={True}"
            ]
          ]
        },
        "pitfalls": [
          "A decorative icon alone is not an accessible button name. Supply text or label.",
          "Tabs does not create matching content panels automatically.",
          "Never display untrusted model output as Qt HTML. Prefer plain Text; Markdown also accepts HTML, so escape untrusted markup."
        ]
      }
    ]
  },
  {
    "slug": "styling",
    "title": "Styling and themes",
    "group": "Interface",
    "description": "Learn layout, spacing, selectors, and color tokens without assuming you know CSS.",
    "sections": [
      {
        "id": "supported-css",
        "title": "Start with a box, not a stylesheet",
        "body": "A layout answers two questions: where should each item go, and how much space may it take? A style answers how it should look: color, spacing, border, or text size. JanelKit translates its supported CSS-like declarations into Qt Quick properties. It is not a browser and does not implement all CSS.\n\nA stylesheet is a set of rules inside the optional <style> section. A rule has a selector, then braces containing property: value; declarations. The selector .page means “elements in this component whose class includes page.” The dot belongs in the stylesheet, not in class=\"page\".",
        "code": "<Window title=\"A little space\" width={440} height={280}>\n  <Column class=\"page\">\n    <Text class=\"heading\">A readable interface</Text>\n    <Text>Padding gives content room to breathe.</Text>\n    <Button variant=\"primary\">Continue</Button>\n  </Column>\n</Window>\n\n<style>\n.page { padding: 24px; gap: 16px; }\n.heading { font-size: 24px; font-weight: 600; }\n</style>",
        "language": "janel",
        "standalone": true,
        "explanation": [
          "Column places its children from top to bottom. It is a layout container, not an item that displays text itself.",
          "padding: 24px puts space between the container edge and its children. gap: 16px puts space between neighboring children.",
          "class=\"heading\" connects the first Text to .heading. font-size changes the text size; font-weight changes its emphasis."
        ],
        "expected": "The window contains a title, a description, and a button, arranged vertically with visible space between them.",
        "pitfalls": [
          "Writing class=\".page\" does not match .page: class names in the template do not include the leading dot.",
          "Pasting an entire browser CSS framework into <style> will not make its unsupported properties work. Check warnings."
        ]
      },
      {
        "id": "axes",
        "title": "Understand rows, columns, and the main axis",
        "body": "The main axis is the direction a container places its children. In Row it runs left to right; in Column it runs top to bottom. The cross axis runs perpendicular to that direction. gap separates items along the layout, align-items controls cross-axis alignment, and justify-content positions items along the main axis.\n\nThe lowercase <flex> is the general-purpose box. It defaults to a row whose children can shrink, with cross-axis stretching. Row and Column are convenience boxes with different defaults: a Row centers children vertically, while a Column makes text and boxes fill its width and leaves controls at their natural width. Do not assume all three are interchangeable.",
        "table": {
          "headers": [
            "Tool",
            "Question it answers",
            "Example"
          ],
          "rows": [
            [
              "padding",
              "How far from the box edge?",
              "padding: 24px"
            ],
            [
              "gap",
              "How far between siblings?",
              "gap: 12px"
            ],
            [
              "align-items",
              "Where along the cross axis?",
              "align-items: center"
            ],
            [
              "justify-content",
              "Where along the main axis?",
              "justify-content: space-between"
            ],
            [
              "align-self",
              "Override alignment for one child?",
              "align-self: stretch"
            ],
            [
              "margin",
              "Space outside this particular child?",
              "margin-left: auto"
            ]
          ]
        }
      },
      {
        "id": "sharing-space",
        "title": "Let flexible content share the available space",
        "body": "flex={1} lets an element take a share of remaining space along its parent main axis. In a Row that means width; in a Column it means height. Two siblings with flex values 2 and 1 divide remaining space in a two-to-one ratio when the container has a size imposed from outside. If the container only sizes to its contents, there may be no remaining space to divide.\n\nUse a fixed width for a sidebar and a flexible main area. In a simple layout the compiler can select a Qt layout fast path automatically; that is an implementation optimization, not another layout API you must learn.",
        "code": "<Window title=\"Workspace\" width={700} height={420}>\n  <Row class=\"workspace\">\n    <Column class=\"sidebar\">\n      <Text>Navigation</Text>\n    </Column>\n    <Column class=\"main\">\n      <Text>Your content belongs here.</Text>\n    </Column>\n  </Row>\n</Window>\n\n<style>\n.workspace { gap: 16px; padding: 20px; }\n.sidebar { width: 180px; align-self: stretch; background: var(--surface-alt); padding: 16px; }\n.main { flex: 1; align-self: stretch; padding: 16px; }\n</style>",
        "language": "janel",
        "standalone": true,
        "expected": "Resizing the window keeps the sidebar near its preferred width while the main area uses the remaining horizontal room. At very small sizes, content minimums can limit shrinking."
      },
      {
        "id": "selectors-and-scope",
        "title": "Choose elements with selectors",
        "body": "An element selector such as Text matches Text elements authored in this component. A class selector such as .muted matches a named class; a combined selector such as .button.primary requires both classes. A space selects descendants, while > selects direct children. A pseudo-class selects a state: .card:hover applies while the pointer is over the card.\n\nRules are local to the component that wrote the template. A parent rule cannot reach inside a child component to restyle its private elements. Content passed to a slot still belongs to the parent that authored it. Some text and custom variable values can inherit through containers; that does not make all selectors global. For matching rules, greater specificity wins; equally specific rules later in the stylesheet win.",
        "code": ".card { padding: 16px; border: 1px solid var(--border); }\n.card:hover { border-color: var(--primary); }\n.card .subtitle { color: var(--text-muted); }\n.card > .title { font-size: 18px; }",
        "language": "css",
        "pitfalls": [
          "A browser :active habit can be misleading: JanelKit documents :pressed, with :active as an alias.",
          "A dynamic inline style takes priority over stylesheet states. If hover seems ineffective, check style= on the element."
        ]
      },
      {
        "id": "theme-tokens",
        "title": "Use named colors rather than repeated values",
        "body": "A token is a named design value. var(--primary) means “use the active theme primary color,” not “read a Python variable named primary.” Theme bindings update when the theme changes. This keeps colors coordinated and lets a preference change the whole application.\n\nJanelKit starts with its light theme; dark is also built in. theme.set(name) selects a theme, theme.toggle() switches light and dark, theme.extend(...) changes tokens, and theme.define(name, base=..., ...) creates a named theme. The website palette and a desktop application theme are separate systems: changing this site does not change the colors of a Python app.",
        "code": "<script lang=\"python\">\nfrom janelkit import theme\n</script>\n\n<Window title=\"Theme explorer\" width={440} height={280}>\n  <Column class=\"page\">\n    <Text>Current theme: {theme.name}</Text>\n    <Button on:click={theme.toggle()}>Toggle light / dark</Button>\n  </Column>\n</Window>\n\n<style>\n.page { padding: 24px; gap: 16px; background: var(--bg); }\nText { color: var(--text); }\n</style>",
        "language": "janel",
        "standalone": true,
        "explanation": [
          "The Python script imports the public theme object. It does not create a second theme manager.",
          "The button handler calls theme.toggle() when clicked. It does not run during initial script setup.",
          "theme.name and the var(...) colors follow the active theme, so the label and the view update together."
        ],
        "table": {
          "headers": [
            "Tokens",
            "Typical role"
          ],
          "rows": [
            [
              "--bg, --surface, --surface-alt",
              "Window and container backgrounds"
            ],
            [
              "--text, --text-muted",
              "Primary and secondary text"
            ],
            [
              "--primary, --on-primary",
              "Accent and text placed on that accent"
            ],
            [
              "--danger, --success, --warning",
              "Status colors"
            ],
            [
              "--border, --radius",
              "Borders and corners"
            ],
            [
              "--font-size, --font-size-xl",
              "Text sizing"
            ],
            [
              "--space-1 through --space-6",
              "Consistent spacing"
            ]
          ]
        },
        "expected": "Clicking Toggle light / dark changes the theme name and the window colors. This is a desktop app behavior, not a browser theme switch."
      },
      {
        "id": "limits-and-practice",
        "title": "Stay inside the supported subset",
        "body": "Supported numeric sizes use pixels or plain numbers; width and height also support percentages and auto. Flex wrapping, borders, shadows, focus outlines, transforms, and supported property transitions are available. Browser features such as display: grid, position: sticky, rem/em units, and @keyframes are not supported by the current implementation and produce warnings.\n\nPractice: change the first example gap from 16px to 28px, then change padding separately. Predict whether each change moves the outer edge spacing or the distance between items before running it. Next, add class:highlighted={condition} to a box and a .highlighted rule. Conditional classes change appearance without requiring you to manually assign Qt properties.",
        "pitfalls": [
          "width and height are preferred sizes within a layout, not a guarantee that content will fit every possible window.",
          "Do not remove keyboard focus outlines just to make screenshots cleaner. Visible focus is part of usability.",
          "Colors in eight-digit hex form follow the documented #aarrggbb format. Do not assume browser #rrggbbaa ordering."
        ]
      }
    ]
  }
];
