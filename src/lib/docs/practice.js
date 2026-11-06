// Source-verified quality chapters; framework checkout stays read-only.
export const practiceDocs = [
  {
    "slug": "testing",
    "title": "Testing your application",
    "description": "Check compilation, click real controls headlessly, and test behavior rather than generated internals.",
    "sections": [
      {
        "id": "validation-vs-behavior",
        "title": "Compilation and behavior are different checks",
        "body": "A compiler check asks whether a component uses valid syntax, supported elements, and valid references. A behavior test asks whether the application does what a user expects. Both matter. A component may compile and still add the wrong item or forget to clear an input.\n\nStart by running janel build from the application folder. This validates all .janel components, including components not currently used, and writes generated QML. It does not click controls, prove business logic, or package an executable.\n\njanel build does not ask Qt to load the generated view. A misspelled color such as blu can pass compilation and still prevent startup. Add a mount test, then exercise behavior; do not interpret a successful build as a startup guarantee.",
        "code": "janel build\n# For a single component diagnostic:\njanel parse src/App.janel\njanel compile src/App.janel",
        "language": "shell",
        "explanation": [
          "build is the quick project-wide validity check. Fix compile errors before looking for a visual behavior bug.",
          "parse exposes the parsed structure; compile shows generated QML. These are debugging outputs, not files you should edit as application source."
        ],
        "expected": "A successful build completes without compiler errors and writes output to build/qml by default. That success alone does not mean the application behavior has been tested.",
        "see": [
          "cli",
          "troubleshooting",
          "style-reference"
        ]
      },
      {
        "id": "a-testable-example",
        "title": "Give a small component an observable behavior",
        "body": "For this example, save the following complete component as src/App.janel in a scaffolded project. The count-label and increment IDs give the test stable ways to find the controls. An ID is a lookup label, not a reactive value.\n\nThe requirement is concrete: after one click, the text should be Count: 1. A useful test can describe that outcome without depending on generated QML classes or private runtime attributes.",
        "code": "<script lang=\"python\">\nfrom janelkit import state\ncount = state(0)\n\ndef increment():\n    count.value += 1\n</script>\n\n<window title=\"Testable counter\" width={420} height={260}>\n  <column>\n    <text id=\"count-label\">Count: {count}</text>\n    <button id=\"increment\" on:click={increment}>Increment</button>\n  </column>\n</window>",
        "language": "janel",
        "standalone": true,
        "expected": "The window starts at Count: 0. Clicking Increment changes it to Count: 1.",
        "explanation": [
          "The inspector finds the <text> and <button> by their element names whether they are written here, passed through a slot or the root of a child component.",
          "Stable IDs let the test identify a control without depending on the wording of its caption."
        ]
      },
      {
        "id": "first-headless-test",
        "title": "Write your first headless interaction test",
        "body": "Headless means the interface is constructed without showing a visible window. The public janelkit.inspect.mount helper manages this lifetime with a Python with block. Once inside, find selects an element and click drives its real event path. On leaving the block, the application is cleaned up.\n\nSave the following Python file as tests/test_counter.py. Install pytest in your application environment and run python -m pytest from the project root. These are desktop application tests; they do not use the website browser test runner.",
        "code": "from janelkit.inspect import mount\n\ndef test_increment_updates_label():\n    with mount(\"src/App.janel\", headless=True) as app:\n        assert app.find(\"text\", id=\"count-label\").text == \"Count: 0\"\n        app.find(\"button\", id=\"increment\").click()\n        assert app.find(\"text\", id=\"count-label\").text == \"Count: 1\"",
        "language": "python",
        "explanation": [
          "mount locates the component file relative to the test process working directory. Run from the app root, or resolve an absolute path deliberately.",
          "find requires a single visible match. The element type plus ID avoids selecting an unrelated button with similar text.",
          "The first assertion confirms the initial state; the second proves the click changed user-visible output.",
          "The with block disposes the mounted application even when an assertion fails."
        ],
        "expected": "pytest reports a passing test. If increment stops changing state, the final assertion fails with the old displayed text.",
        "pitfalls": [
          "Do not import janelkit.runtime or inspect generated QML to test a public behavior. Those are internal contracts.",
          "A test that only checks a Python variable can miss a broken binding between that state and the interface."
        ]
      },
      {
        "id": "more-actions",
        "title": "Exercise the same controls the user does",
        "body": "The inspector supports more than clicks. type replaces the existing text, submit sends a field submission, check changes a boolean, choose selects an option, slide changes a slider, and key sends keyboard input. find_all is useful when multiple matches are expected. app.texts() collects every visible <text>, including the root of a child component and text passed through a slot. In fields, .text is None: read what was typed with .value, and find a field by placeholder, label or id, because find(text=...) does not match fields. click(x=, y=) clicks a point of the element, and screenshot(path) captures the window or one element.\n\nFor async work, app.wait(seconds, until=...) processes the application while waiting for a result. Test success, error, loading, repeated requests, and the component disappearing during work. A timeout should fail the test rather than silently accepting an incomplete operation.\n\napp.wait(seconds) runs the application for that long. app.wait(until=lambda: ..., timeout=2.0) runs it until the condition holds, and fails with InspectError if timeout seconds (5 by default) pass first. Keep assertions inside the with block: Qt items are destroyed when the mount closes.",
        "table": {
          "headers": [
            "Behavior",
            "Public inspection tool",
            "What to assert"
          ],
          "rows": [
            [
              "Enter a name",
              "element.type(\"Ada\")",
              "The bound greeting changes"
            ],
            [
              "Submit a form",
              "field.submit()",
              "The item appears and draft clears"
            ],
            [
              "Toggle a choice",
              "checkbox.check(True)",
              "State and visible status agree"
            ],
            [
              "Choose an option",
              "select.choose(value)",
              "The correct value is displayed"
            ],
            [
              "Keyboard shortcut",
              "app.key(\"Ctrl+Z\")",
              "The previous edit is restored"
            ],
            [
              "Await a task",
              "app.wait(until=condition)",
              "The result or error state appears"
            ]
          ]
        }
      },
      {
        "id": "test-isolation",
        "title": "Keep tests independent from real user data",
        "body": "Tests must not overwrite personal preferences or make paid service requests accidentally. Each mount starts a new session with an empty temporary data folder, so persisted values and the stores of janelkit-store never touch real data, and a test never sees what the previous one left. If you deliberately test persistence across two mounts, set JANELKIT_DATA_DIR to a directory owned by that test. Do not aim it at real application data.\n\nMove file parsing, validation, and service logic into ordinary Python functions and test those independently. Then keep a smaller set of UI tests to prove the components connect to those functions correctly. Replace external network services at your application service boundary in tests; do not fake a successful framework interaction instead of exercising it.",
        "steps": [
          "Write the expected user-visible behavior first.",
          "Run the test and confirm it fails for the missing behavior, not because of a broken import or path.",
          "Implement the smallest component change that satisfies the behavior.",
          "Run that test, the rest of your application tests, and janel build.",
          "Manually review keyboard behavior and the packaged application on each platform you support."
        ],
        "pitfalls": [
          "A headless test is not a substitute for checking readability, keyboard focus, and native platform behavior.",
          "Canceling a UI task does not stop a synchronous worker or an external provider request; design service tests around that boundary."
        ]
      },
      {
        "id": "known-inspector-limits",
        "title": "What the inspector covers, and what it does not",
        "body": "The inspector finds every element by its element name, also when it is the root of a child component or passed through a slot: a component whose root is a <button> is found as find(\"button\") and as find(\"Name\"), and click() and type() drive it as the control it is. A few things still need care.",
        "table": {
          "headers": [
            "Situation",
            "What to do"
          ],
          "rows": [
            [
              "An element stops working after the with block",
              "Read and interact with elements before the mount closes: its Qt items are destroyed with it."
            ],
            [
              "A screenshot of a headless mount on Windows has no fonts or video",
              "Mount with headless=False to look at a capture; keep assertions on texts and values."
            ],
            [
              "The application opens a native dialog",
              "With janelkit-desktop, answer it with app.answer_dialog(result)."
            ],
            [
              "A page of janelkit-router, or a store of janelkit-store",
              "Find a page by its component name; read a store with app.store(Class). Both packages document their test helpers."
            ]
          ]
        },
        "pitfalls": [
          "Do not replace a failed UI action with a state assignment and report that the interaction passed.",
          "Offscreen tests do not verify native dialogs, platform notifications, visual contrast or the distributed executable."
        ],
        "see": [
          "components",
          "forms",
          "troubleshooting"
        ]
      }
    ],
    "learn": [
      "Separate compilation checks from startup and behavior tests.",
      "Write a repeatable headless test with stable element IDs.",
      "Know what the inspector covers and what still needs a manual check."
    ],
    "summary": [
      "A successful build is not proof that Qt can load the view or that behavior is correct.",
      "Assert visible behavior inside the mount block, using stable IDs.",
      "Test ordinary Python separately and review native behavior manually."
    ]
  },
  {
    "slug": "troubleshooting",
    "title": "Errors and troubleshooting",
    "description": "Learn to read diagnostics and distinguish template, state, layout, and lifetime problems.",
    "sections": [
      {
        "id": "read-diagnostic",
        "title": "Read the location before changing code",
        "body": "A diagnostic tells you where a problem was detected: file, line, and column, followed by a message. It may show the source line, a caret pointing to the position, and a suggestion. Start at that location. A misspelled state name can look like a broken renderer if you skip the original message.\n\nThere are different stages of failure. Parsing checks the file structure. Compilation validates template names and produces the view description. Script execution runs your Python setup. Event handling runs Python later, when a user acts. An async task may store an error in its .error property instead of throwing it during setup.",
        "table": {
          "headers": [
            "Stage",
            "Example cause",
            "First check"
          ],
          "rows": [
            [
              "File structure",
              "Two script sections or multiple template roots",
              "The .janel component sections"
            ],
            [
              "Template compile",
              "Unknown tag, event, property, or undefined name",
              "Spelling and the documented element API"
            ],
            [
              "Qt startup",
              "Generated QML contains a color or assignment Qt rejects",
              "Mount or run the application; build alone does not load QML"
            ],
            [
              "Python setup",
              "Missing imported module or top-level exception",
              "Traceback pointing into the script"
            ],
            [
              "Event handling",
              "A function assumes a missing argument",
              "Handler signature and event payload"
            ],
            [
              "Async work",
              "Service request fails",
              "task.error and application logging"
            ],
            [
              "Styling",
              "Unsupported CSS declaration",
              "Compiler warnings and supported-property reference"
            ]
          ]
        }
      },
      {
        "id": "state-not-updating",
        "title": "The value changes, but the view does not",
        "body": "First ask which value the template actually reads. In a Python script, change count.value, not a replacement variable called count. In the template, a direct state name is unwrapped automatically, so use {count}. For a module attribute that is a state, direct-name unwrapping does not apply in the same way: import the state name directly or read the attribute value explicitly.\n\nWhen a state wraps a list or dictionary, mutate the reactive value you got back, not the original container passed to state. The framework copies supported containers into reactive versions. If you use an unsupported custom mutable object, the framework cannot infer every internal mutation; consider immutable replacement or the documented notify() escape hatch.",
        "code": "# In a component script:\nfrom janelkit import state\ncount = state(0)\n\ndef increment():\n    count.value += 1\n\n# In its template:\n# <text>{count}</text>\n# <button on:click={increment}>Increment</button>",
        "language": "python",
        "explanation": [
          "count refers to the reactive wrapper. Reassigning count = 1 loses that wrapper rather than updating it.",
          "count.value += 1 tells the wrapper about a new value, allowing dependent bindings to update.",
          "The callback reference increment is passed to on:click so the action runs when clicked."
        ],
        "expected": "Each click updates the displayed count. Unrelated template bindings do not need to be updated manually.",
        "pitfalls": [
          "Python templates use and, or, not, True, False, and None. JavaScript operators such as && and === are not valid Python expressions."
        ]
      },
      {
        "id": "function-calls",
        "title": "A callback did not run when you expected",
        "body": "A handler can be a function reference, such as on:click={save}, or inline code, such as on:click={save()}. Both are valid but have different expression forms. A bare callable is invoked by the framework; inline code executes when the event occurs. If setup calls save() in the script, however, that is ordinary Python setup and happens immediately.\n\nA computed value is for deriving a result, not performing a side effect. Calling a service or mutating state from a computed function can create confusing evaluation timing. Put user actions in handlers and intentional reactive side effects in effect. If an event carries a value, check the documented payload rather than assuming every event is a mouse object."
      },
      {
        "id": "lifetime-surprises",
        "title": "An input resets or a resource keeps running",
        "body": "A conditional #if destroys the inactive branch and its component instances. Recreating a branch starts new local state. A #key change deliberately recreates its contents. In contrast, #hidden, list rows out of view and the covered pages of janelkit-router keep Python instances alive while their visible updates wait.\n\nCheck who owns the resource. An effect or timer created during component setup is tied to that component lifetime. A timer created in an ordinary module may not have that owner and may require explicit stopping. The before_leave hook guards closing a window with the X and leaving a page of janelkit-router; it is not a universal “before any unmount” callback.",
        "steps": [
          "Identify whether the element is hidden, virtualized, or actually destroyed.",
          "Check whether editable data belongs in a parent or a service instead of in a disposable child.",
          "Register lifecycle hooks during script setup, not inside a later click handler.",
          "Use on_destroy or a returned on_mount cleanup for explicit resource disposal."
        ],
        "pitfalls": [
          "A <list> row scrolling off-screen does not imply its Python instance, effects, or tasks have been destroyed.",
          "Do not rely on before_leave to intercept a branch removed by #if."
        ]
      },
      {
        "id": "responsive-and-blocking",
        "title": "The window freezes or the layout does not fit",
        "body": "An async def function still runs on the UI thread. A blocking library call inside it can freeze the interface before the next await yields. Put synchronous blocking work behind await background(fn, ...) and assign its returned result on the UI loop. A worker must not mutate state or touch controls.\n\nFor layout problems, simplify to a <window> with one <row> or <column>. Check the parent main axis before adding flex={1}; check content minimum sizes before assuming a field will shrink. Unsupported style declarations warn when the rule matches an element; unsupported selectors and at-rules are compile errors. A rule matching nothing may stay silent. Read the supported style subset rather than adding more unrelated rules.",
        "steps": [
          "Run janel build and resolve errors and warnings.",
          "Reduce the failing behavior to one component and one interaction.",
          "Keep the terminal open to read script and event exceptions.",
          "Use janelkit.inspect to write a failing test for the observed bug.",
          "After the fix, test the initial view, repeated actions, empty values, and teardown."
        ],
        "expected": "A minimal reproducible example reveals whether the issue is data ownership, invalid syntax, layout constraints, or work blocking the UI. Report the source component and exact diagnostic rather than only a screenshot of the final symptom.",
        "see": [
          "style-reference",
          "testing",
          "async",
          "layout"
        ]
      },
      {
        "id": "confirmed-limitations",
        "title": "Check the known limitations before blaming your app",
        "body": "These behaviors have been reproduced in JanelKit 0.2. Keep the reproduction small and include your installed version in a bug report; do not assume a future fix is already available.",
        "table": {
          "headers": [
            "Symptom",
            "Confirmed behavior",
            "Safe next step"
          ],
          "rows": [
            [
              "Build passes, window refuses to open",
              "Bare color names are not validated against Qt at compile time",
              "Replace questionable names with hex colors or known theme tokens; mount again."
            ],
            [
              "A style rule has no effect and no warning",
              "Rules that match nothing are not checked; a component-name selector such as Card does not style its root",
              "Use a class on the component tag, and check the supported-style reference."
            ],
            [
              "A dictionary key changes after restarting",
              "persisted and stores of janelkit-store save JSON, which converts non-text keys to strings",
              "Use string keys before saving; test a save-and-reload round trip."
            ],
            [
              "A transition ignores ease-in or a delay",
              "Only the property and duration are used",
              "Use the supported transition form; do not depend on the ignored words."
            ]
          ]
        },
        "pitfalls": [
          "class=\"misspelled\" and class={...} do not trigger the missing-class warning; that warning currently applies to class:name.",
          "The missing accessible-name warning is implemented for clickable flex boxes, not every clickable <row> or <column>. Review keyboard access and labels yourself."
        ],
        "see": [
          "style-reference",
          "testing",
          "store-persistence",
          "accessibility"
        ]
      }
    ],
    "learn": [
      "Locate the stage where an error occurs before changing code.",
      "Distinguish state, lifetime, layout and blocking-work problems.",
      "Recognize confirmed limitations and produce a small reproduction."
    ],
    "summary": [
      "Start with the exact diagnostic and the stage that produced it.",
      "Check ownership and lifetime before changing reactive code.",
      "Compilation, Qt startup, user interactions and packaging need separate checks."
    ]
  }
];
