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
        "body": "janel new scaffolds a project and accepts --path DIR. janel dev optionally accepts a project folder. janel build validates every .janel file, including unused components, writes generated QML to build/qml by default, and exits with code 1 on compilation errors. build accepts -o DIR. Every command accepts --help. Build does not create an executable or installer.\n\nIn 0.1.0, build does not load the generated QML in Qt. It can succeed even when Qt rejects a color at startup. Follow it with a startup or mount check and application tests.",
        "language": "shell",
        "code": "janel new my-app\ncd my-app\njanel dev\njanel build\njanel compile src/App.janel\njanel parse src/App.janel",
        "explanation": [
          "new creates the application scaffold; dev runs the development edit loop.",
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
        "body": "Diagnostics include file, line, column, and suggestions when available. parse exposes the AST; compile exposes generated QML. Treat those outputs as debugging aids, not stable runtime interfaces. During development, invalid edits keep the last working view open. A changed component script resets that component state; unchanged scripts may retain state. Reload does not preserve focus, text selection, or secondary windows."
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
        "body": "The core CLI provides these command forms. Every command accepts --help; janel --version prints the installed framework version. CLI diagnostics and help are currently in Spanish. Optional packages can register additional commands, so inspect your installed help before assuming a plugin command exists.",
        "language": "shell",
        "code": "janel --version\njanel --help\njanel new my-app --path .\njanel dev my-app\njanel build my-app -o generated-qml\njanel compile my-app/src/App.janel -o App.qml\njanel parse my-app/src/App.janel",
        "pitfalls": [
          "The destination passed to compile -o is a file; build -o takes a directory.",
          "A successful command can still print warnings. Read stderr as well as the exit code."
        ]
      },
      {
        "id": "delivery-boundary",
        "title": "Keep development, testing and distribution separate",
        "body": "A reliable release sequence compiles the project, runs application tests, launches the application, and then exercises the packaged artifact. janel build is the compilation step only. Distribution needs an external packager and explicit inclusion of application resources and the Qt runtime; the packaging chapter will describe that separate workflow.",
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
