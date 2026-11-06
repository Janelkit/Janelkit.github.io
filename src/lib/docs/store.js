// Ecosystem · janelkit-store.
// Sources (read-only): JanelKit/packages/janelkit-store/README.md and src/janelkit_store
// (_store.py, _files.py), docs/lenguaje.md (Datos compartidos y estado que se recuerda) and
// docs/patrones.md (Datos compartidos). Every complete example and every "Ordinary Python"
// snippet is run against janelkit-store 0.2 by scripts/validate_doc_examples.py.
export const storeDocs = [
  {
    slug: 'store',
    title: 'janelkit-store',
    description: 'The shared data of an application in one place: a class with reactive fields, actions that group and record each change, controlled writes, one instance per application, and persistence.',
    sections: [
      {
        id: 'what-it-adds',
        title: 'What it adds',
        body: 'Most applications have data that several views or windows read and change: the signed-in user, the open documents, a cart. A store keeps that data in one class. Its fields are reactive and are read without .value, its methods are actions that group their changes and record them, and use(Class) gives every view and window the same instance, without provide or props. A strict store can only be changed by its own methods, and a store can save itself to disk.',
        table: { headers: ['What you keep', 'Where'], rows: [
          ['What only one component uses (a draft, whether a panel is open)', 'state in its <script>'],
          ['What several views or windows share (the user, the documents, the cart)', 'A store'],
          ['An object with state of its own that exists several times (a camera, a connection)', 'A class with state attributes, or a store with key='],
          ['A single preference that is remembered', 'persisted']
        ] }
      },
      {
        id: 'in-a-minute',
        title: 'In one minute',
        body: 'Install it next to janelkit with pip install janelkit-store. Declare the store as a class decorated with @store, usually in src/stores. Every annotated attribute is a field; every method is an action. Any component gets the application’s instance with use(Cart).',
        files: [
          { path: 'src/stores/cart.py', language: 'python', code: `from janelkit import computed
from janelkit_store import field, store

@store(strict=True)
class Cart:
    items: list[dict] = []
    note: str = field("", bind=True)    # in a strict store, only marked fields accept bind:

    @computed
    def total(self) -> float:           # derived and cached
        return sum(item["price"] for item in self.items)

    def add(self, name, price):         # every method is an action
        self.items.append({"name": name, "price": price})

    def clear(self):
        self.items.clear()` },
          { path: 'src/components/CartBadge.janel', code: `<script lang="python">
from janelkit_store import use
from stores.cart import Cart

cart = use(Cart)
</script>

<text>{len(cart.items)} item(s) · {cart.total:.2f} €</text>` },
          { path: 'src/App.janel', code: `<script lang="python">
from janelkit_store import use
from stores.cart import Cart
from components.CartBadge import CartBadge

cart = use(Cart)
</script>

<window title="Shop" width={420} height={260}>
  <column padding={24} gap={12}>
    <CartBadge />
    <row gap={8}>
      <button on:click={cart.add("Apple", 0.5)}>Add an apple</button>
      <button on:click={cart.clear()}>Empty the cart</button>
    </row>
    <textfield bind:value={cart.note} label="Note" placeholder="A note for the order" />
  </column>
</window>` }
        ],
        explanation: [
          'use(Cart) returns the same instance in App and in CartBadge, so both see every change.',
          'Fields and derived values are read without .value, in Python and in the template: cart.items, cart.total.',
          'cart.add(...) is an action: its changes are applied together and recorded as one Mutation.',
          'note is marked bind=True, so bind:value can write it even though the store is strict.'
        ],
        expected: 'The badge shows 0 item(s) · 0.00 €. Each Add an apple adds one item and 0.50 €; Empty the cart returns to 0 item(s) · 0.00 €.'
      },
      {
        id: 'how-it-is-built',
        title: 'Built on the public API',
        body: 'janelkit-store uses only the public API of the core: janelkit.ext.session() for one instance per application and its data folder, on_write and own to know which field each write belongs to (and to enforce strict mode), Scope so that what a store creates belongs to it, @computed on methods, and bind: through descriptors (__jk_bind__).',
        see: ['build-your-own']
      },
      {
        id: 'versions',
        title: 'Versions and changes',
        body: 'janelkit-store shares the series with the core: janelkit-store 0.2.x.x works with janelkit 0.2.x.x and Python 3.10 or later. The last two numbers are its own.\n\n0.2.0.0 is its first version: store, field, use, subscribe, snapshot, reset and mutations. persisted used to be part of the core: change from janelkit import persisted to from janelkit_store import persisted. janel migrate makes the change for you.',
        see: ['changes']
      }
    ]
  },
  {
    slug: 'store-fields',
    title: 'Fields, derived values and actions',
    description: 'What a store class is made of, and what happens when its methods change it.',
    sections: [
      {
        id: 'fields',
        title: 'Fields',
        body: 'Each annotated attribute of the class is a reactive field with its default value, copied for each instance, so two instances never share a list. Fields are read and written as ordinary attributes, without .value, in Python and in the template. Nested data, such as a card inside a list, belongs to the field that contains it.\n\nAn attribute whose name starts with an underscore is internal: it is not reactive, not recorded and not saved. field(default, bind=False, persist=True) gives a field options; the next pages explain them.',
        language: 'python',
        code: `from janelkit_store import field, store

@store
class Session:
    user: str | None = None
    recent: list[str] = []
    theme: str = field("light", persist=False)
    _cache: dict = {}        # internal: not reactive, not recorded, not saved`
      },
      {
        id: 'derived',
        title: 'Derived values',
        body: '@computed, from the core, on a method gives a cached value that is read without .value and is not assigned: cart.total. It is recalculated only when a field it read changes, and only when someone reads it.'
      },
      {
        id: 'actions',
        title: 'Actions',
        body: 'Every method is an action, except setup, teardown and the __dunder__ methods. An action groups its changes in a batch, so what depends on them is recalculated once, and records them as one Mutation. An action called inside another action of the same store becomes part of it. In an async method, what changes after an await still belongs to that action. What an action creates, such as an effect, a timeout or a task, belongs to the store and lives as long as it does.',
        language: 'python',
        code: `from janelkit import background
from janelkit_store import store

@store
class Library:
    books: list[dict] = []
    loading: bool = False

    async def load(self):
        self.loading = True
        self.books = await background(read_catalog)   # still the action "load"
        self.loading = False`
      },
      {
        id: 'setup',
        title: 'setup and teardown',
        body: 'setup(self), or setup(self, key) for a store with keys, runs when an instance is created, and teardown(self) when it is released. They are not actions: what they change is not recorded. A store does not define __init__: the initial values are the class defaults, and setup prepares the rest. A store can use another one with use(Other) inside a method or in setup.',
        pitfalls: [
          'Do not define __init__ in a store; it is refused. Put preparation in setup.',
          'Do not keep a reference to a value read from another store inside a field; read it when you need it, through use().'
        ]
      }
    ]
  },
  {
    slug: 'store-strict',
    title: 'Controlled writes',
    description: 'strict=True: outside its methods, a store can only be read.',
    sections: [
      {
        id: 'strict',
        title: 'Only the store changes the store',
        body: 'In a store declared with @store(strict=True), code outside its methods can only read. cart.items.append(x) from a view, or cart.items[0]["price"] = 9, raises a StoreError that says what to do, and the write does not happen. bind: is only allowed on fields declared with field(..., bind=True); a bind: to another field is logged as a bind: error.\n\nWithout strict, which is the default, any code can write; a write that does not go through an action is recorded as having no action.',
        language: 'python',
        code: `# Ordinary Python: a store works without Qt, which is also how its logic is tested.
from janelkit_store import StoreError, field, store

@store(strict=True)
class Cart:
    items: list = []
    note: str = field("", bind=True)

    def add(self, name):
        self.items.append(name)

cart = Cart()                  # a loose instance, without an application
cart.add("apple")
assert cart.items == ["apple"]

try:
    cart.items.append("pear")  # outside an action
    raise AssertionError("a strict store must refuse this write")
except StoreError:
    pass
assert cart.items == ["apple"]`,
        explanation: [
          'Cart() creates a loose instance, outside any application, which is how a store is tested with plain Python.',
          'add is an action, so its append is allowed.',
          'The append from outside raises StoreError and leaves the list as it was.'
        ],
        pitfalls: [
          'Strict mode protects the data, not the rules: an action can still put the store in a wrong state. Test the actions.'
        ]
      }
    ]
  },
  {
    slug: 'store-use',
    title: 'One instance per application',
    description: 'use() gives every view and window the same instance; key= gives one per key; tests start fresh.',
    sections: [
      {
        id: 'use',
        title: 'use(): the instance of the running application',
        body: 'use(Cart) returns the instance of the running application: the same one in every view and window. It is created the first time it is asked for and released when the application closes. Without a running application, use raises StoreError.\n\nIn tests with janelkit.inspect.mount, each mount starts with new instances: a test never sees the data of the previous one. Cart() creates a loose instance, without an application, and Cart(items=[...]) gives it initial values.'
      },
      {
        id: 'keys',
        title: 'One instance per key',
        body: 'use(Document, key=path) returns one instance per key, for data that exists several times, such as open documents. setup(self, key) receives the key. When asked for in the script of a component, a keyed instance is released, with its teardown, when the last component that asked for it is destroyed.',
        language: 'python',
        code: `from janelkit_store import store, use

@store
class Document:
    text: str = ""
    path: str = ""

    def setup(self, key):
        self.path = key

# In the script of an editor component:
document = use(Document, key=path.value)`,
        pitfalls: [
          'A keyed instance lives while some component uses it. To keep it when no view shows it, ask for it from a component that stays mounted.'
        ]
      }
    ]
  },
  {
    slug: 'store-tracking',
    title: 'Tracking changes',
    description: 'Follow every change with subscribe, copy the fields with snapshot, go back to the defaults with reset, and log every action.',
    sections: [
      {
        id: 'mutations',
        title: 'Every action produces a Mutation',
        body: 'Each action that changes something produces a Mutation: store (the class name), key, action (the method, "bind:field" or None) and changes, one Change per field with field, kind ("set" if it was assigned, "mutate" if it was changed in place), old and new. The copies in old and new are only made while someone observes, with subscribe or JANELKIT_STORE_LOG; otherwise they are None.\n\nsubscribe(instance, fn) calls fn(mutation) after each action that changes something and returns a function that cancels it. snapshot(instance) is a copy of the public fields, and reset(instance) returns them to their defaults as an action named reset.',
        language: 'python',
        code: `# Ordinary Python: follow every change of a store.
from janelkit_store import reset, snapshot, store, subscribe

@store
class Counter:
    count: int = 0

    def add(self):
        self.count += 1

counter = Counter()
seen = []
cancel = subscribe(counter, seen.append)

counter.add()
change = seen[0].changes[0]
assert seen[0].action == "add"
assert (change.field, change.kind, change.old, change.new) == ("count", "set", 0, 1)
assert snapshot(counter) == {"count": 1}

reset(counter)
assert counter.count == 0
cancel()`,
        explanation: [
          'subscribe observes the instance, so the Change carries the old and new values.',
          'snapshot returns plain data, safe to save or compare.',
          'reset is an action too, so subscribers see it.'
        ]
      },
      {
        id: 'log',
        title: 'Log every action',
        body: 'With the environment variable JANELKIT_STORE_LOG=1, every Mutation is logged to the janelkit_store logger. mutations() returns the mutations of the running application, from the oldest to the newest; in tests, app.mutations() does the same for the mounted application.'
      }
    ]
  },
  {
    slug: 'store-persistence',
    title: 'Persistence',
    description: 'Save a store with persist=, or a single value with persisted, between launches of the application.',
    sections: [
      {
        id: 'persist',
        title: 'A store that saves itself',
        body: '@store(persist="cart") saves the public fields in cart.json, in the data folder, and reads them when the instance is created. field(..., persist=False) leaves a field out.',
        language: 'python',
        code: `from janelkit_store import field, store

@store(persist="cart")
class Cart:
    items: list[dict] = []
    coupon: str = field("", persist=False)   # not saved`
      },
      {
        id: 'persisted',
        title: 'persisted: one value that survives a restart',
        body: 'persisted(key, initial) works like state, with one difference: it is saved. When created, it loads the saved value, or uses initial if there is none. Every change, including changes inside lists and dictionaries, is saved automatically. Use it for preferences and small data: the theme, the last open section, recent files.\n\nThe key belongs to the whole application: two persisted("prefs.theme", …) calls in different files return the same object, and the second default is ignored.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
from janelkit_store import persisted

name = persisted("lesson.name", "")
</script>

<column padding={24} gap={12}>
  <textfield bind:value={name} placeholder="Your name" label="Your name" />
  <text>Hello, {name or "visitor"}.</text>
  <button on:click={name = ""}>Forget my name</button>
</column>`,
        explanation: [
          'name behaves like state: bind:, .value and plain names in the template all work.',
          'Typing saves the value; there is no save button and no file to manage.',
          'Forget my name saves an empty string; it does not delete the key.'
        ],
        expected: 'Typing Ada shows Hello, Ada. Closing and reopening the application shows Ada in the field again.',
        pitfalls: [
          'Do not store secrets: values are plain JSON files, not encrypted storage.',
          'Do not reuse a key for different kinds of data; the first value loaded wins.'
        ]
      },
      {
        id: 'prefs-module',
        title: 'Keep preferences together in one module',
        body: 'Gather persisted values in a module such as src/services/prefs.py, and import them where needed. bind:value={prefs.theme} binds to the module’s value. To show it in a template without .value, import it by name: from services.prefs import theme.',
        language: 'python',
        code: `# src/services/prefs.py
from janelkit_store import persisted

theme = persisted("prefs.theme", "light")
recent = persisted("prefs.recent", [])

def opened(path):
    recent.value.insert(0, str(path))   # changes in place are saved too
    del recent.value[10:]`
      },
      {
        id: 'json-and-keys',
        title: 'What can be saved, and how keys are written',
        body: 'Only JSON values: strings, numbers, booleans, None, lists and dictionaries with string keys. A value JSON cannot represent, such as a date, a set or your own object, raises TypeError when created or assigned. Some values change shape on the way: tuples come back as lists, and dictionary keys come back as strings, so {1: "a"} is {"1": "a"} after a restart. Convert dates and paths to strings yourself. When you change the shape of saved data, migrate it yourself or use a new key.\n\nKeys use ASCII letters, digits, dots, underscores and hyphens, and start with a letter or digit. Use dots to group them: prefs.theme, editor.font_size.'
      },
      {
        id: 'where-and-when',
        title: 'Where and when it is written',
        body: 'Each key, and each persisted store, is a file named <key>.json in the data folder of the session: JANELKIT_DATA_DIR if it is set, the temporary folder of janelkit.inspect.mount in tests, or the user’s data folder plus the project name: %APPDATA%\\<project> on Windows, ~/Library/Application Support/<project> on macOS, ~/.config/<project> on Linux.\n\nChanges are grouped and written at most every 300 ms, and once more when the application closes. Writing replaces the file in one step, so a crash never leaves half a file. Each change rewrites the whole file, which is why this is for small and medium data; documents and databases belong in their own files. .flush() writes what is pending at once.',
        pitfalls: [
          'Tests with janelkit.inspect.mount use an empty temporary folder, so they never touch real data. To test that a value survives two mounts, set JANELKIT_DATA_DIR.'
        ]
      }
    ]
  },
  {
    slug: 'store-testing',
    title: 'Testing stores',
    description: 'Test a store with plain Python, and check what a view did to it in a headless test.',
    sections: [
      {
        id: 'plain-python',
        title: 'The logic, without Qt',
        body: 'A loose instance, Store(), needs no application: call its actions and check its fields with plain asserts, as in the examples of Controlled writes and Tracking changes. Keep most tests there; they are fast and point at the exact rule that broke.'
      },
      {
        id: 'mounted',
        title: 'What a view did to the store',
        body: 'When imported, the package adds two methods to janelkit.inspect: app.store(Class, key=None) returns the instance of the mounted application, and app.mutations() its mutations, from the oldest to the newest. Each mount starts with fresh instances and an empty temporary data folder.',
        language: 'python',
        code: `# tests/test_cart.py, for the example in Overview.
from janelkit.inspect import mount
from stores.cart import Cart

def test_add_an_apple():
    with mount("src/App.janel") as app:
        app.find("button", text="Add an apple").click()
        assert len(app.store(Cart).items) == 1
        assert [m.action for m in app.mutations()] == ["add"]`,
        explanation: [
          'The click goes through the real button, like a user.',
          'app.store(Cart) is the same instance the views use.',
          'The list of actions shows that the view changed the store through add, not directly.'
        ]
      },
      {
        id: 'examples',
        title: 'Examples',
        body: 'apps/examples/carrito, in the JanelKit repository, shares one strict store between two windows and logs every change. apps/examples/preferencias remembers preferences with persisted.'
      }
    ]
  },
  {
    slug: 'store-reference',
    title: 'Reference',
    description: 'Every public name of janelkit-store.',
    sections: [
      {
        id: 'names',
        title: 'Public names',
        body: 'Import them from janelkit_store.',
        table: { headers: ['Name', 'Description'], rows: [
          ['store', 'Class decorator: @store, @store(strict=True, persist="key").'],
          ['field', 'field(default, bind=False, persist=True): a field with options.'],
          ['use', 'use(Class, key=None): the instance of the running application. Without one, StoreError.'],
          ['subscribe', 'subscribe(instance, fn) -> cancel: fn(mutation) after each action that changes something.'],
          ['snapshot', 'snapshot(instance) -> dict: a copy of the public fields.'],
          ['reset', 'reset(instance): the fields return to their defaults (an action named reset).'],
          ['mutations', 'mutations(): the mutations of the running application.'],
          ['Mutation', 'What subscribers receive: store, key, action, changes.'],
          ['Change', 'One field of a Mutation: field, kind ("set" or "mutate"), old, new.'],
          ['StoreError', 'A write outside an action in a strict store, use() without an application, a class declared wrongly.'],
          ['persisted', 'persisted(key, initial): a state that is remembered between launches. The same key gives the same object.'],
          ['Persisted', 'The type of persisted: a State with key, file and flush().']
        ] }
      }
    ]
  }
];
