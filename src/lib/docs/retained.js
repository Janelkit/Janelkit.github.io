// CLI workflow and retained AI-agent guidance.
export const retainedDocs = [
  {
    "slug": "cli",
    "title": "CLI and tooling",
    "group": "Reference",
    "description": "Scaffold, reload, validate, inspect generated output, and test application behavior.",
    "sections": [
      {
        "id": "commands",
        "title": "The everyday commands",
        "body": "janel new scaffolds a project and accepts --path DIR. janel dev optionally accepts a project folder. janel build validates every .janel file, including unused components, writes generated QML to build/qml by default, and exits with code 1 on compilation errors. build accepts -o DIR. janel migrate updates a project to the installed version of JanelKit: without --write it shows the changes as a diff, with --write it applies them, and with --tests it also updates your tests. Every command accepts --help. Build does not create an executable or installer.\n\njanel build does not load the generated QML in Qt. It can succeed even when Qt rejects a color at startup. Follow it with a startup or mount check and application tests.",
        "language": "shell",
        "code": "janel new my-app\ncd my-app\njanel dev\njanel build\njanel compile src/App.janel\njanel parse src/App.janel\njanel migrate --write --tests",
        "explanation": [
          "new creates the application scaffold; dev runs the development edit loop.",
          "migrate moves a project to a new version, such as the lowercase elements and package imports of 0.2.",
          "build compiles all project components; compile and parse help isolate a single-file problem."
        ],
        "expected": "The scaffold is created, dev runs the application, and build writes generated QML. None of these commands creates a standalone executable.",
        "pitfalls": [
          "Do not edit generated QML as application source or treat build success as proof of startup."
        ]
      },
      {
        "id": "diagnostics-and-reload",
        "title": "Diagnose source, not generated internals",
        "body": "Diagnostics include file, line, column, and suggestions when available. parse exposes the AST; compile exposes generated QML. Treat those outputs as debugging aids, not stable runtime interfaces.\n\njanel dev reloads the view when you save a .janel file, in the same process, keeping the window's position and size and the state of every component whose script did not change: what was typed in a form, the page of a list. A component whose script changed starts from zero, and the console says which. Adding lines or styles does not lose state. Invalid edits show the errors in the console and in an error window, and keep the last working view open. Saving a .py or a .qml file of the project restarts the process. Reload does not preserve focus, text selection, or windows opened with open_window."
      },
      {
        "id": "choose-a-check",
        "title": "Choose the check for the failure stage",
        "body": "Use the smallest check that addresses your question, then widen validation. Passing an earlier stage does not prove the later stages work.",
        "table": {
          "headers": [
            "Question",
            "Command or check",
            "What it does not prove"
          ],
          "rows": [
            [
              "Is the file structurally valid?",
              "janel parse src/App.janel",
              "Element names and runtime behavior"
            ],
            [
              "Can the component compile?",
              "janel compile src/App.janel",
              "Qt startup or user interactions"
            ],
            [
              "Can every project component compile?",
              "janel build",
              "Qt startup, service results or packaging"
            ],
            [
              "Does the view load and respond?",
              "Headless mount and application tests",
              "Native desktop appearance or installer behavior"
            ],
            [
              "Does the distributed application work?",
              "Run the packaged application on each supported platform",
              "Other platforms you did not test"
            ]
          ]
        },
        "see": [
          "testing",
          "troubleshooting"
        ]
      },
      {
        "id": "options-and-output",
        "title": "Use explicit paths and keep output separate",
        "body": "The core CLI provides these command forms. Every command accepts --help; janel --version prints the installed framework version. CLI diagnostics and help are currently in Spanish. Packages can register additional commands, so inspect your installed help before assuming a plugin command exists.",
        "language": "shell",
        "code": "janel --version\njanel --help\njanel new my-app --path .\njanel dev my-app\njanel build my-app -o generated-qml\njanel compile my-app/src/App.janel -o App.qml\njanel parse my-app/src/App.janel\njanel migrate my-app --write",
        "pitfalls": [
          "The destination passed to compile -o is a file; build -o takes a directory.",
          "A successful command can still print warnings. Read stderr as well as the exit code."
        ]
      },
      {
        "id": "delivery-boundary",
        "title": "Keep development, testing and distribution separate",
        "body": "A reliable release sequence compiles the project, runs application tests, launches the application, and then exercises the packaged artifact. janel build is the compilation step only. Distribution needs an external packager and explicit inclusion of application resources and the Qt runtime; the next section gives a recipe with PyInstaller.",
        "steps": [
          "Use dev while editing; check the terminal when an update fails.",
          "Run build from a known project directory and read its warnings.",
          "Run python -m pytest in the application environment.",
          "Review the running application with keyboard and representative data.",
          "Verify the packaged artifact on each platform you actually support."
        ],
        "see": [
          "testing",
          "troubleshooting"
        ]
      },
      {
        "id": "pyinstaller",
        "title": "Distribute an executable with PyInstaller",
        "body": "PyInstaller builds a folder with an executable that runs without Python installed. This recipe was tested on Windows 11 with Python 3.10, PySide6 6.8 and PyInstaller 6.22, packaging the files example of the repository; on Linux and macOS the steps are the same, with : instead of ; in --add-data. Run it from the project folder, the one with main.py and src, with the application's environment active. The result is dist/MyApp/: distribute the whole folder, the executable plus _internal/.",
        "language": "shell",
        "code": "pip install pyinstaller\n\n# Windows (\";\" separates --add-data). On Linux and macOS use \"src:src\" and \\ for line breaks.\npyinstaller --noconfirm --windowed --name MyApp ^\n  --add-data \"src;src\" ^\n  --collect-data janelkit --collect-submodules janelkit ^\n  --paths src ^\n  --hidden-import services.storage ^\n  main.py",
        "table": {
          "headers": ["Option", "Why"],
          "rows": [
            ["--add-data \"src;src\"", "Copies the .janel files (and your own .qml) into the package. main.py looks for them in src next to itself, as in development."],
            ["--collect-data janelkit", "Includes the Janel QML module and the other resources of the janelkit package."],
            ["--collect-submodules janelkit", "JanelKit imports parts of itself on demand; PyInstaller does not see them when it analyzes main.py."],
            ["--paths src + --hidden-import services.x", "Modules imported only from your .janel files are invisible to PyInstaller: name them, one per module, so they are included with their dependencies."],
            ["--windowed", "No console window on Windows and macOS. Leave it out while you test the package, to see errors."]
          ]
        },
        "pitfalls": [
          "Check the package before shipping it: with QT_QPA_PLATFORM=offscreen and JANELKIT_EXIT_AFTER_MS=1500 the executable starts, mounts the view and exits by itself; exit code 0 means it worked, 1 that a .janel file, a module or a QML type is missing.",
          "--onefile, a single executable, starts more slowly: it unpacks everything at each start.",
          "Signing the executable and building installers (MSI, DMG, AppImage) are outside this recipe."
        ]
      }
    ],
    "learn": [
      "Choose the right command for development or diagnosis.",
      "Distinguish parsing, compilation, startup checks and executable packaging.",
      "Understand reload boundaries and preserve actionable diagnostics."
    ],
    "summary": [
      "Use dev for the edit loop and build for project-wide compilation.",
      "parse and compile expose different stages; neither is a complete application test.",
      "Generated QML is output, not an executable or a stable application API."
    ]
  },
  {
    "slug": "ai-agents",
    "title": "Guide for AI coding agents",
    "group": "Reference",
    "description": "Ground generated code in the framework, verify behavior, and integrate external work safely.",
    "sections": [
      {
        "id": "read-before-generating",
        "title": "Learn the actual framework first",
        "body": "This is a guide for coding agents building JanelKit applications, not a native AI or LLM SDK. Start with the project README, docs/api.md, docs/lenguaje.md, and docs/estilos.md. Check the installed version and its migration notes before borrowing examples. Generate Python expressions, not JavaScript; use .value in scripts, direct state names in templates, a single template root, explicit props and events, and stable keys for changing lists. Keep services in ordinary Python modules so they can be reviewed and tested separately.\n\nFor JanelKit 0.2, write built-in elements in lowercase (<text>, <button>, <column>) and imported components with a capital letter. Import navigation from janelkit_router (pages, sections, navigation, Pages, Sections), stores and persisted from janelkit_store, dialogs and clipboard from janelkit_desktop, and t and i18n from janelkit_i18n; never from janelkit. History and notify no longer exist. The plain-text index of this site is /llms.txt, and the whole documentation is /llms-full.txt."
      },
      {
        "id": "public-api-contract",
        "title": "Respect the public contract",
        "body": "Use the exports documented in docs/api.md. Do not import runtime internals, depend on generated QML, or assume private compiler structures are stable. Treat requested APIs as unverified until found in the versioned documentation. Distinguish implemented ecosystem packages from proposals. Never run untrusted .janel scripts as if they were harmless markup: they execute Python with application privileges. Keep credentials in application-managed configuration rather than component examples."
      },
      {
        "id": "external-service-pattern",
        "title": "Integrate an external service as ordinary async work",
        "body": "An external model or network service is an application dependency, not a built-in JanelKit feature. For an asynchronous client, await the application service directly from an async handler or task. For a synchronous client, put the call behind background and return plain data. The snippet below is an integration skeleton: services.assistant.generate_reply is an application-owned synchronous function you must implement using your chosen provider. It is not supplied by JanelKit. Render loading and error states, and do not assume canceling the UI task stops a provider request or worker thread.",
        "language": "python",
        "code": "from janelkit import state, task, background\nfrom services.assistant import generate_reply  # Implement in your application.\n\nprompt = state(\"\")\n\n@task\nasync def reply(text):\n    return await background(generate_reply, text)\n\ndef send():\n    text = prompt.value.strip()\n    if text:\n        reply.run(text)\n\n# Template wiring:\n# <textfield bind:value={prompt} on:submit={send} label=\"Prompt\" />\n# <button on:click={send} enabled={not reply.loading}>Send</button>\n# Render reply.loading, reply.error, and reply.value explicitly."
      },
      {
        "id": "verification-loop",
        "title": "Verify generated work and disclose limits",
        "body": "Run janel build for compilation checks, then test user-visible behavior with janelkit.inspect and application tests. Include successful results, empty input, failure, repeated submissions, and component unmount during a request. For streaming services, keep state updates on the UI loop and batch updates rather than creating a new control for every token. Show untrusted output as plain text or with format=\"markdown\", which does not interpret HTML; never with format=\"html\". Report what you actually executed and what remains untested, especially alpha APIs and platform-specific packaging.",
        "language": "shell",
        "code": "janel build\npython -m pytest\n# Inspect generated output only when diagnosing a compilation issue:\njanel compile src/App.janel"
      }
    ]
  }
];
