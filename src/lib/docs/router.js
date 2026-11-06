// Ecosystem · janelkit-router.
// Sources (read-only): JanelKit/packages/janelkit-router/README.md and src/janelkit_router,
// docs/lenguaje.md (Navegación entre pantallas, Preguntar antes de salir) and docs/api.md
// (janelkit.ext). Every complete example is compiled and run headless against
// janelkit-router 0.2 by scripts/validate_doc_examples.py.
export const routerDocs = [
  {
    slug: 'router',
    title: 'janelkit-router',
    description: 'Navigation between screens: page stacks that keep their state, parallel sections, results with await, questions before leaving and transitions.',
    sections: [
      {
        id: 'what-it-adds',
        title: 'What it adds',
        body: 'A desktop application with more than one screen needs to move between them. janelkit-router gives you two tools, both made of your ordinary .janel components with props and events; there are no URLs. A page stack models a journey with Back: a list, then a detail, then back to the same list as you left it. Sections model separate destinations, such as a sidebar with Projects and People, each keeping its own journey.\n\nA second operating-system window is not navigation: open_window, in the core, opens one.',
        table: { headers: ['Tool', 'Shows', 'Keeps'], rows: [
          ['pages(...) + <Pages>', 'The top page of a stack', 'The pages underneath, alive, for Back.'],
          ['sections(...) + <Sections>', 'One destination at a time', 'Every destination’s whole stack.'],
          ['open_window(...) (core)', 'Another window', 'Its own component, until it is closed.']
        ] },
        see: ['windows']
      },
      {
        id: 'in-a-minute',
        title: 'In one minute',
        body: 'Install it next to janelkit with pip install janelkit-router. pages(First) creates a stack during setup, starting with the component First, and <Pages stack={nav} /> shows its top page and takes the free space. Pages and Sections are elements of this package: import them in the script, like a component, and write them with a capital letter.\n\nA page gets its stack with navigation() during its own setup, without receiving it as a prop. push shows a new page on top; the page underneath stays alive, so when the user comes back with pop, it is exactly as it was left.',
        files: [
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit_router import pages, Pages
from pages.Home import Home

nav = pages(Home)
</script>

<window title="Pages" width={420} height={260}>
  <Pages stack={nav} />
</window>` },
          { path: 'src/pages/Home.janel', code: `<script lang="python">
from janelkit import state
from janelkit_router import navigation
from pages.Detail import Detail

nav = navigation()
draft = state("")
</script>

<column padding={24} gap={12}>
  <textfield bind:value={draft} placeholder="Type something" label="Draft" />
  <button on:click={nav.push(Detail)}>Open detail</button>
</column>` },
          { path: 'src/pages/Detail.janel', code: `<script lang="python">
from janelkit_router import navigation
nav = navigation()
</script>

<column padding={24} gap={12}>
  <text>Detail page</text>
  <button on:click={nav.pop()}>Back</button>
</column>` }
        ],
        explanation: [
          'App only creates the stack and shows it. Home is the first page.',
          'Home and Detail call navigation() to reach the same stack.',
          'Home stays alive under Detail, so its draft survives the trip.'
        ],
        expected: 'Type a draft, click Open detail, then Back: Home reappears with the same draft.'
      },
      {
        id: 'how-it-is-built',
        title: 'Built on the public API',
        body: 'janelkit-router uses only the public API of the core, like any package you could write. Pages and Sections are .qml elements whose root is a JkDeck and that declare a JkHost property; PageStack and SectionSet are hosts (janelkit.ext.Host) that mount the pages with Container.mount. A repository test checks that it never imports anything internal.',
        see: ['build-your-own']
      },
      {
        id: 'versions',
        title: 'Versions and changes',
        body: 'janelkit-router shares the series with the core: janelkit-router 0.2.x.x works with janelkit 0.2.x.x and Python 3.10 or later. The last two numbers are its own.\n\n0.2.0.0 is its first version. Until 0.1, navigation was part of the core: change from janelkit import pages, navigation, sections to from janelkit_router import pages, navigation, sections, and import the elements you use (from janelkit_router import Pages, Sections). The type of sections() is now called SectionSet. janel migrate makes these changes for you.',
        see: ['changes']
      }
    ]
  },
  {
    slug: 'router-stacks',
    title: 'Page stacks',
    description: 'push, pop, replace and reset; props and events for pages; results with await; how pages fill their space; transitions and the Back keys.',
    sections: [
      {
        id: 'commands',
        title: 'push, pop, replace and reset',
        body: 'Each operation decides which pages are kept. A discarded page is destroyed and its on_destroy callbacks run; a covered page is kept. Keyword arguments are the new page’s props, and on_name arguments connect its events, as in open_window: nav.push(Detail, item=item, on_deleted=remove). Pages inherit context (inject) from the component that declares the stack.',
        table: { headers: ['Call', 'Effect on the stack'], rows: [
          ['push(Page, **props)', 'Adds Page on top; keeps the current page underneath.'],
          ['pop()', 'Discards the top page. Does nothing on the first page.'],
          ['back(value)', 'Like pop, and delivers value to whoever awaited the push.'],
          ['replace(Page, **props)', 'Discards the current page and shows Page in its place.'],
          ['reset(Page, **props)', 'Discards every page and starts again from Page.']
        ] },
        language: 'janel',
        code: `<!-- In the component that owns nav = pages(Home): a header with Back. -->
<row gap={8}>
  <button on:click={nav.pop()} enabled={nav.can_go_back}>← Back</button>
  <text>{nav.current}</text>
</row>
<Pages stack={nav} transition:slide />`,
        explanation: [
          'nav.can_go_back, nav.current (the name of the visible page) and nav.depth are reactive; nav.page is the visible page’s instance.',
          'transition:slide animates the page that enters: from the right going forward, from the left going back.'
        ],
        pitfalls: [
          'push always creates a new instance; it never reuses an existing page of the same type.',
          'Do not reset just to switch between destinations users expect to return to; use sections.'
        ]
      },
      {
        id: 'results',
        title: 'Wait for a page to return a result',
        body: 'push can be awaited. await nav.push(Picker) waits until Picker calls nav.back(value) and returns that value, or None if the page was left another way (pop, replace or reset). Use it in an async def handler, as if you were calling a function that happens to show a screen.',
        files: [
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit_router import pages, Pages
from pages.Home import Home
nav = pages(Home)
</script>

<window title="Results" width={400} height={240}>
  <Pages stack={nav} />
</window>` },
          { path: 'src/pages/Home.janel', code: `<script lang="python">
from janelkit import state
from janelkit_router import navigation
from pages.Picker import Picker

nav = navigation()
chosen = state("nobody")

async def choose():
    person = await nav.push(Picker)
    if person is not None:
        chosen.value = person
</script>

<column padding={24} gap={12}>
  <text>Chosen: {chosen}</text>
  <button on:click={choose}>Choose a person</button>
</column>` },
          { path: 'src/pages/Picker.janel', code: `<script lang="python">
from janelkit_router import navigation
nav = navigation()
</script>

<column padding={24} gap={8}>
  <text>Pick one</text>
  <button on:click={nav.back("Ada")}>Ada</button>
  <button on:click={nav.back("Grace")}>Grace</button>
</column>` }
        ],
        expected: 'Chosen: nobody at first. Choose a person shows the picker; clicking Grace returns to Home with Chosen: Grace.'
      },
      {
        id: 'page-size',
        title: 'Pages fill their space',
        body: 'Each page fills its <Pages> (and each section its <Sections>) and shrinks with the window down to the minimum of its content; what should scroll, scrolls with overflow: auto. The root of a page can change that with CSS, like a block in a column.',
        language: 'css',
        code: `.page { max-width: 720px; margin: 0 auto; }   /* a centered column */
.page { width: 400px; height: 300px; }         /* fixed size, top left */
.page { align-self: center; }                  /* its natural width, centered */
.page { margin: 24px; }                        /* fills, with a margin around */`
      },
      {
        id: 'transitions-and-keys',
        title: 'Transitions, and Back from the keyboard and mouse',
        body: '<Pages stack={nav} transition:slide /> animates the page that enters. fade and scale also exist, and the duration can be given in milliseconds: transition:fade={150}. In <Sections>, the transition applies when the section changes and to the pages of each one.\n\nAlt+Left and the mouse’s Back button go back to the previous page in the innermost visible stack. Alt+Left acts when the focus is inside the stack, and the mouse button when the press is over it. If an element of the page already uses Alt+Left, for example to move a card, the element wins.'
      },
      {
        id: 'covered-pages',
        title: 'Covered pages wait',
        body: 'While a page is covered, what it shows waits, as in {#hidden}: its texts, styles and lists are not recalculated when data changes, and they catch up once when the page is seen again. Its script keeps running, timers included. A page that polls a device or a camera should pause while covered: is_visible() is False there, and interval(ms, fn, when=is_visible()) stops counting.',
        see: ['timers', 'real-time']
      }
    ]
  },
  {
    slug: 'router-sections',
    title: 'Sections',
    description: 'Parallel destinations, such as a sidebar or tabs, each with its own page stack that is kept while another one is shown.',
    sections: [
      {
        id: 'sections',
        title: 'Destinations that keep their place',
        body: 'An application with a sidebar or tabs has several sections, and each one needs its own stack. sections(name=Component, …) creates them; <Sections of={areas} /> shows the current one. areas.show("people") switches without discarding anything: each section keeps its pages and their state. Inside a section, navigation() returns that section’s stack.',
        files: [
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit_router import sections, Sections
from pages.Home import Home

areas = sections(projects=Home, people=Home)
</script>

<window title="Sections" width={480} height={300}>
  <column>
    <row gap={8} padding={8}>
      <button on:click={areas.show("projects")}>Projects</button>
      <button on:click={areas.show("people")}>People</button>
      <text>Now in {areas.current}</text>
    </row>
    <Sections of={areas} />
  </column>
</window>` },
          { path: 'src/pages/Home.janel', code: `<script lang="python">
from janelkit_router import navigation
from pages.Detail import Detail
nav = navigation()
</script>

<column padding={24} gap={12}>
  <text>Home page</text>
  <button on:click={nav.push(Detail)}>Open detail</button>
</column>` },
          { path: 'src/pages/Detail.janel', code: `<script lang="python">
from janelkit_router import navigation
nav = navigation()
</script>

<column padding={24} gap={12}>
  <text>Detail page</text>
  <button on:click={nav.pop()}>Back</button>
</column>` }
        ],
        explanation: [
          'sections(projects=Home, people=Home) creates two stacks, each starting with its own Home page.',
          'Home calls navigation(), so Open detail pushes onto the stack of the section it belongs to.',
          'areas.current is reactive, so the header follows the switch.'
        ],
        expected: 'Open detail in Projects, switch to People: People shows its own Home page. Switch back: Projects is still on the detail page.'
      },
      {
        id: 'lifetime',
        title: 'When sections are created, and what they cost',
        body: 'A section is created the first time it is shown. Switching to another one keeps it whole, with all its pages and their state, so coming back costs the same as showing it. While it is not shown, what it shows waits, as in {#hidden}: a data change in another section does not recalculate it.\n\nEach section is a stack: areas["people"] gives it by name and areas.stack gives the visible one. areas.current, the name of the visible section, is reactive, and areas.names lists the names.',
        pitfalls: [
          'Switching sections never asks before_leave, because nothing is discarded.',
          'The script of a hidden section keeps running. Pause its timers with when=is_visible().'
        ]
      }
    ]
  },
  {
    slug: 'router-leaving',
    title: 'Ask before leaving',
    description: 'Keep the user on a page with unsaved changes, and know whether a navigation happened.',
    sections: [
      {
        id: 'before-leave',
        title: 'A guard on the page',
        body: 'before_leave(fn), from the core, registers a question in a page or in any component inside it. When the page is about to be discarded (pop, back, replace, reset, Alt+Left) or its window is closed with the X, fn is called; returning False keeps the user where they are.\n\npop, back, replace and reset can be awaited: they return True if the page was left and False if a guard refused. The answer can arrive after a dialog.',
        files: [
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit_router import pages, Pages
from pages.Home import Home
nav = pages(Home)
</script>

<window title="Guards" width={420} height={260}>
  <Pages stack={nav} />
</window>` },
          { path: 'src/pages/Home.janel', code: `<script lang="python">
from janelkit_router import navigation
from pages.Editor import Editor
nav = navigation()
</script>

<column padding={24} gap={12}>
  <text>Home page</text>
  <button on:click={nav.push(Editor)}>Edit</button>
</column>` },
          { path: 'src/pages/Editor.janel', code: `<script lang="python">
from janelkit import state, before_leave
from janelkit_router import navigation

nav = navigation()
unsaved = state(True)
status = state("You have unsaved changes.")

@before_leave
def may_leave():
    return not unsaved.value

async def go_back():
    if not await nav.pop():
        status.value = "Leaving was refused: discard or save first."
</script>

<column padding={24} gap={12}>
  <text>{status}</text>
  <button on:click={go_back}>Back</button>
  <button on:click={unsaved = False}>Discard changes</button>
</column>` }
        ],
        explanation: [
          'may_leave returns False while there are unsaved changes, so the first Back is refused.',
          'await nav.pop() returns False in that case, and the editor explains why.',
          'After Discard changes the guard returns True, and Back leaves.'
        ],
        expected: 'Edit, then Back: the editor stays and says Leaving was refused. Discard changes, then Back: Home page appears.'
      },
      {
        id: 'ask-with-a-dialog',
        title: 'Ask with a dialog',
        body: 'The guard can be async, so it can ask the user. With janelkit-desktop, dialogs.confirm shows a native confirmation and returns True or False.',
        language: 'python',
        code: `from janelkit import before_leave
from janelkit_desktop import dialogs

@before_leave
async def leave():
    return not changes.value or await dialogs.confirm("There are unsaved changes. Leave anyway?")`,
        see: ['desktop-dialogs']
      },
      {
        id: 'chain',
        title: 'Chain navigations',
        body: 'To navigate somewhere that requires leaving the current page first, wait for the answer. A detail page with changes may ask to stay, and then the second step must not happen.',
        language: 'python',
        code: `async def go_to_card(project_id, card_id):
    if await nav.reset(Projects):        # a detail with changes may refuse
        nav.push(Project, ident=project_id, focus=card_id)`,
        pitfalls: [
          'Closing a window from code with close() does not ask. Only user navigation and the X do.',
          'A guard is not a cleanup: if it refuses, the page must keep working. Release resources in on_destroy.'
        ]
      }
    ]
  },
  {
    slug: 'router-testing',
    title: 'Testing navigation',
    description: 'Find pages by their component name and drive the stack from a test.',
    sections: [
      {
        id: 'find-pages',
        title: 'Find pages and drive the stack',
        body: 'With janelkit.inspect, a page is found by the name of its component: app.find("Detail"). The stack is a name in the script, so a test can read it and drive it: app.get("nav").push(...). A covered page and a hidden section do not appear in find, exactly as the user cannot reach them.',
        language: 'python',
        code: `# tests/test_navigation.py, for the stack example in Overview.
from janelkit.inspect import mount

def test_the_draft_survives_the_detail_page():
    with mount("src/App.janel") as app:
        app.find(label="Draft").type("hello")
        app.find("button", text="Open detail").click()
        assert app.find("Detail")
        app.find("button", text="Back").click()
        assert app.find(label="Draft").value == "hello"`,
        explanation: [
          'The draft is typed on Home, then Home is covered by Detail.',
          'find("Detail") succeeds only while the Detail page is the visible one.',
          'After Back, the same Home instance is visible again, with its draft.'
        ]
      },
      {
        id: 'example-app',
        title: 'A larger example',
        body: 'apps/challenges/gestor, in the JanelKit repository, is a project manager built with sections, pages, results with await and questions before leaving. Its tests show how to drive each of them.'
      }
    ]
  },
  {
    slug: 'router-reference',
    title: 'Reference',
    description: 'Every public name of janelkit-router.',
    sections: [
      {
        id: 'names',
        title: 'Public names',
        body: 'Import them from janelkit_router. pages, sections and navigation are called during the setup of a component, like on_mount.',
        table: { headers: ['Name', 'Description'], rows: [
          ['pages', 'nav = pages(Home, **props) creates a page stack that starts with Home, an imported component.'],
          ['PageStack', 'The type of pages(): push(C, **props_and_on_events) (awaitable: await returns the value of back(value)), pop(), back(value=None), replace(...), reset(...) (the four are awaitable: True if the page was left, False if a before_leave refused); reactive current, depth and can_go_back; page, the visible instance.'],
          ['navigation', 'nav = navigation() in the script of a page, or of a component inside it, returns its stack.'],
          ['sections', 'areas = sections(a=A, b=B) creates parallel sections, each with its own stack.'],
          ['SectionSet', 'The type of sections(): show(name), [name] (its stack), stack (the visible one’s), names; reactive current.'],
          ['<Pages stack={nav} />', 'Shows the top page. Accepts transition: and the common properties (flex, width, class…).'],
          ['<Sections of={areas} />', 'Shows the visible section. Same as <Pages>.']
        ] }
      }
    ]
  }
];
