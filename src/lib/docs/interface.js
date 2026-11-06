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
              "One template building block, written with angle brackets, such as <text> or <column>."
            ],
            [
              "Container",
              "An element that arranges children, such as <row>, <column>, or flex."
            ],
            [
              "Control",
              "A building block that displays information or accepts input: <button>, <textfield>, <checkbox>."
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
              "<slot>",
              "A position in a child template where the parent can supply interface content."
            ],
            [
              "Built-in element / component tag",
              "Lowercase tags such as <text> and <button> are built into JanelKit. A tag with a capital letter, such as <TodoItem> or <Pages>, is a component the script imports, from the project or from a package."
            ],
            [
              "Package",
              "An add-on of the ecosystem, such as janelkit-router or janelkit-store, installed on its own and built only on the public API of the core."
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
            ],
            [
              "Store",
              "With janelkit-store, a class that holds the data several views or windows share: reactive fields, actions that record each change, and one instance per application."
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
            ],
            [
              "Frames",
              "A stream of images for <video>, pushed from any thread; only the latest one is shown, and images never go through state."
            ],
            [
              "Session",
              "What lasts one run of an application, or one test mount: packages keep their per-application data in it, including a data folder."
            ]
          ]
        }
      },
      {
        "id": "use-the-words",
        "title": "Check your understanding",
        "body": "Imagine a search form. The <textfield> is a control, the <column> around it is a container, and the whole SearchPanel.janel file is a component. Its query is state. bind:value connects the field to that state. A <button> click is an event. The function called by that click is a handler. A task can represent the search loading state and result.\n\nPractice: identify those same responsibilities in the first-app guide before learning another API. If a word is unfamiliar, return to this page rather than assuming it means exactly what it means in a browser framework.",
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
];
