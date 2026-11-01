// Source-grounded guides retained from the original documentation.
export const retainedDocs = [
  {
    "slug": "installation",
    "title": "Installation",
    "group": "Getting started",
    "description": "Create an environment, scaffold a project, and open your first desktop window.",
    "sections": [
      {
        "id": "requirements",
        "title": "Prepare Python",
        "body": "Use Python 3.10 or newer and a virtual environment. JanelKit uses PySide6 for Qt Quick and qasync to integrate asynchronous Python work with the Qt event loop. Activate the environment before installing packages.",
        "language": "shell",
        "code": "python -m venv .venv\n# Windows:\n.venv\\Scripts\\activate\n# Linux / macOS:\n# source .venv/bin/activate\npip install janelkit"
      },
      {
        "id": "create-project",
        "title": "Create and run a project",
        "body": "The janel new command creates a starter with main.py, src/App.janel, sample components and services, and project configuration. It refuses to overwrite a nonempty directory. Running python main.py is the canonical application entry point; development mode is optional, not a prerequisite for launching the app.",
        "language": "shell",
        "code": "janel new my-app\ncd my-app\npython main.py"
      },
      {
        "id": "entry-point",
        "title": "Understand the entry point",
        "body": "The public run(entry, argv=None) function compiles the root component, opens its window, and runs the Qt event loop. It returns an exit code, which SystemExit passes back to the operating system. Resolve the component relative to main.py so the entry point does not depend on the current working directory.",
        "language": "python",
        "code": "from pathlib import Path\nfrom janelkit import run\n\nif __name__ == \"__main__\":\n    entry = Path(__file__).parent / \"src\" / \"App.janel\"\n    raise SystemExit(run(entry))"
      },
      {
        "id": "development-mode",
        "title": "Make your first edit",
        "body": "Run janel dev from the project folder, then edit src/App.janel. Saving a .janel file reloads the view; components whose scripts have not changed can retain state. Saving a Python or custom QML file restarts the process.",
        "language": "shell",
        "code": "janel dev\n# Before sharing your changes:\njanel build"
      }
    ]
  },
  {
    "slug": "cli",
    "title": "CLI and tooling",
    "group": "Reference",
    "description": "Scaffold, reload, validate, inspect generated output, and test application behavior.",
    "sections": [
      {
        "id": "commands",
        "title": "The everyday commands",
        "body": "janel new scaffolds a project and accepts --path DIR. janel dev optionally accepts a project folder. janel build validates every .janel file, including unused components, writes generated QML to build/qml by default, and exits with code 1 on compilation errors. build accepts -o DIR. Every command accepts --help. Build does not create an executable or installer.",
        "language": "shell",
        "code": "janel new my-app\ncd my-app\njanel dev\njanel build\njanel compile src/App.janel\njanel parse src/App.janel"
      },
      {
        "id": "diagnostics-and-reload",
        "title": "Diagnose source, not generated internals",
        "body": "Diagnostics include file, line, column, and suggestions when available. parse exposes the AST; compile exposes generated QML. Treat those outputs as debugging aids, not stable runtime interfaces. During development, invalid edits keep the last working view open. A changed component script resets that component state; unchanged scripts may retain state. Reload does not preserve focus, text selection, or secondary windows."
      },
      {
        "id": "headless-tests",
        "title": "Test the interface through public inspection",
        "body": "janelkit.inspect.mount creates an application without a visible window and cleans it up on context exit. find requires one visible matching element; find_all returns all matches. Actions exercise real events and bindings, and app.wait lets asynchronous work and timers advance. The test below targets the counter from Introduction. Install pytest separately to run application tests.",
        "language": "python",
        "code": "from janelkit.inspect import mount\n\ndef test_counter():\n    with mount(\"src/App.janel\", headless=True) as app:\n        app.find(\"Button\", text=\"Increment\").click()\n        assert \"You clicked 1 times.\" in app.texts()"
      }
    ]
  },
  {
    "slug": "ecosystem",
    "title": "Ecosystem",
    "group": "Reference",
    "description": "Understand the core, optional companion packages, and editor tooling.",
    "sections": [
      {
        "id": "core-boundary",
        "title": "A core with public extension points",
        "body": "The janelkit package owns the language, compiler, reactivity, components, basic controls, themes, navigation, windows, tasks, persisted state, History, inspection, and essential CLI. Optional services that can use the public API belong in companion packages. The source describes independently versioned ecosystem packages with explicit compatible core ranges. Do not infer that a proposed package exists merely because it appears in the roadmap."
      },
      {
        "id": "internationalization",
        "title": "Translations with janelkit-i18n",
        "body": "The optional janelkit-i18n package provides i18n and t for JSON catalogs, plurals, locale-aware number and date formatting, and runtime language switching. Core janelkit.locale owns interface language and right-to-left direction; i18n.set updates it. The following initialization belongs in main.py before run(), with an application-owned locales directory. Supply matching catalog keys before using t in components.",
        "language": "python",
        "code": "from pathlib import Path\nfrom janelkit_i18n import i18n\n\ni18n.load(Path(__file__).parent / \"locales\")\ni18n.set(\"en\")\n\n# Inside a component script:\n# from janelkit_i18n import t\n# In its template: <Text>{t(\"greeting\", name=\"Ada\")}</Text>"
      },
      {
        "id": "desktop-services",
        "title": "Native services with janelkit-desktop",
        "body": "The optional janelkit-desktop package provides dialogs, clipboard, and notify. Native file dialogs are asynchronous and close if their owning component unmounts. An open_file result is a Path or None when canceled. Read the selected file in background instead of blocking the UI. The following is component-script code; add a button with on:click={open_note} and display text in its template.",
        "language": "python",
        "code": "from janelkit import state, background\nfrom janelkit_desktop import dialogs\n\ntext = state(\"\")\n\nasync def open_note():\n    path = await dialogs.open_file(\"Open note\", filters=[\"Text (*.txt)\"])\n    if path is not None:\n        text.value = await background(path.read_text, encoding=\"utf-8\")"
      },
      {
        "id": "editors-and-roadmap",
        "title": "Editor tooling",
        "body": "The repository includes a VS Code extension for .janel syntax highlighting, including Python and styles. The public compiler check_file and check_source APIs provide structured diagnostics without executing a component script, making them useful for editors and other development tools."
      }
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
        "body": "This is a guide for coding agents building JanelKit applications, not a native AI or LLM SDK. Start with the project README, docs/api.md, docs/lenguaje.md, and docs/estilos.md. Check the installed version and its migration notes before borrowing examples. Generate Python expressions, not JavaScript; use .value in scripts, direct state names in templates, a single template root, explicit props and events, and stable keys for changing lists. Keep services in ordinary Python modules so they can be reviewed and tested separately."
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
        "code": "from janelkit import state, task, background\nfrom services.assistant import generate_reply  # Implement in your application.\n\nprompt = state(\"\")\n\n@task\nasync def reply(text):\n    return await background(generate_reply, text)\n\ndef send():\n    text = prompt.value.strip()\n    if text:\n        reply.run(text)\n\n# Template wiring:\n# <TextField bind:value={prompt} on:submit={send} label=\"Prompt\" />\n# <Button on:click={send} enabled={not reply.loading}>Send</Button>\n# Render reply.loading, reply.error, and reply.value explicitly."
      },
      {
        "id": "verification-loop",
        "title": "Verify generated work and disclose limits",
        "body": "Run janel build for compilation checks, then test user-visible behavior with janelkit.inspect and application tests. Include successful results, empty input, failure, repeated submissions, and component unmount during a request. For streaming services, keep state updates on the UI loop and batch updates rather than creating a new control for every token. Prefer plain text for untrusted output; Qt Markdown also accepts HTML, so escape ampersands and less-than signs before displaying untrusted Markdown. Report what you actually executed and what remains untested, especially alpha APIs and platform-specific packaging.",
        "language": "shell",
        "code": "janel build\npython -m pytest\n# Inspect generated output only when diagnosing a compilation issue:\njanel compile src/App.janel"
      }
    ]
  }
];
