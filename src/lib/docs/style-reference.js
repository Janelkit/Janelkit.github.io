// Reference · Styles: everything <style> accepts in JanelKit 0.2, and nothing more.
// Sources (read-only), checked line by line:
//   packages/janelkit/src/janelkit/styling/compiler.py  (SUPPORTED: properties, values, elements)
//   packages/janelkit/src/janelkit/styling/parser.py    (selectors, PSEUDO_CLASSES)
//   packages/janelkit/src/janelkit/styling/theme.py     (tokens)
//   packages/janelkit/src/janelkit/compiler/cascade.py  (scope and precedence)
//   packages/janelkit/src/janelkit/compiler/lowering.py (inline style, _INLINE)
// and a 118-case probe compiled and mounted against JanelKit 0.1.0 (style_probe.py); the
// unsupported CSS and the known problems were checked again against 0.2.0.0.
// tests/content.test.js fails if a property, pseudo-class or inline property in the
// framework is missing from this page.
const BOXES = 'Boxes';
const SCROLLS = 'Scroll areas';
const TEXTS = 'Text controls';
const ANY = 'Any element except <window>';
const EVERY = 'Every element';

export const styleReferenceDocs = [
  {
    slug: 'style-reference',
    title: 'Style reference',
    description: 'Every selector, value, property and token that <style> accepts, which elements each property affects, and what is not supported.',
    sections: [
      {
        id: 'how-to-read',
        title: 'How to read this page',
        body: '<style> is not CSS. It is a fixed list of CSS-like properties that JanelKit translates to Qt Quick. This page lists all of it: if a selector, property or value is not here, JanelKit does not support it.\n\nEvery declaration ends in one of three outcomes. Knowing which one helps when a style seems to do nothing.',
        table: { headers: ['Outcome', 'When', 'What you see'], rows: [
          ['Applied', 'The property, its value and the element are all supported.', 'The style changes the element.'],
          ['Warning, then ignored', 'Unknown property, invalid value, or a property that does not apply to that element.', 'A compile warning with file, line and column, for example propiedad de estilo no soportada: \'filter\' ("unsupported style property"). The rest of the file still works.'],
          ['Compile error', 'An unsupported selector, an at-rule (@media, @keyframes…), nesting, or a rule without braces.', 'The component does not compile. The message lists the selectors that are supported.']
        ] },
        pitfalls: [
          'A warning is only produced when the rule applies to at least one element. A rule that matches nothing is never checked, so a typo there stays silent.',
          'A few invalid values are accepted at compile time and stop the application at startup. They are listed in Known problems at the end of this page.'
        ],
        see: ['styles']
      },
      {
        id: 'element-groups',
        title: 'Element groups',
        body: 'The Applies to column of the property tables uses these groups. A property used on an element outside its group produces a warning such as \'box-shadow\' no tiene efecto en <button> ("has no effect on").',
        table: { headers: ['Group', 'Elements'], rows: [
          [BOXES, 'flex, <column>, <row>'],
          [SCROLLS, '<scroll>, <list>'],
          [TEXTS, '<text>, <button>, <textfield>, <textarea>, <checkbox>, <switch>, <select>, <radiogroup>, <tabs>'],
          ['Fields', '<button>, <textfield>, <textarea>, <select>'],
          [ANY, 'All built-in elements except <window>: the groups above plus <slider>, <progressbar>, <image>, <video>, <spacer>, <shortcut>, and <Pages> and <Sections> of janelkit-router. Also your own .qml elements.'],
          [EVERY, 'All of the above and <window>.']
        ] }
      },
      {
        id: 'selectors',
        title: 'Selectors',
        body: 'A rule starts with one or more selectors separated by commas. Selectors only see elements written in the same component; see Scope and precedence.',
        table: { headers: ['Selector', 'Example', 'Matches'], rows: [
          ['Class', '.title', 'Elements whose class includes title, from class="…", class:title={…} or class={…}.'],
          ['Element', 'button, flex, column', 'Every element of that type in this component. Built-in elements only: lowercase, as in the template.'],
          ['Compound', '.button.primary, flex.card', 'Elements that meet every part at once.'],
          ['Pseudo-class', '.row:hover', 'Elements in that state; see the next table.'],
          ['Descendant', '.card .title', 'A .title at any depth inside a .card, also through {#if} and {#each}.'],
          ['Child', '.menu > .item', 'An .item whose direct parent is a .menu.'],
          ['List', '.a, .b', 'Elements that match either selector.']
        ] },
        pitfalls: [
          'These are compile errors: ids (#main), the universal selector (*), attribute selectors ([disabled]), sibling combinators (+ and ~), :not(), :nth-child(), :empty, :root and pseudo-elements (::before, ::placeholder).',
          'A selector naming a component, such as Card { … }, compiles without a warning but applies nothing. Put a class on the tag instead: <Card class="highlight" />.',
          'Only /* … */ comments are allowed. A // line is read as a selector and is a compile error.'
        ]
      },
      {
        id: 'pseudo-classes',
        title: 'Pseudo-classes (states)',
        body: 'States are tracked by the view, so hovering never calls Python. A rule with a pseudo-class can change any supported property, and transition animates the change.',
        table: { headers: ['Pseudo-class', 'Active while', 'Notes'], rows: [
          [':hover', 'The pointer is over the element or one of its children.', 'On a box with on:click it replaces the default hover highlight.'],
          [':pressed', 'The element is being pressed with the mouse or a finger.', ':active is accepted as another name. On a box with on:click, Space also counts.'],
          [':focus', 'The element has keyboard focus.', ''],
          [':focus-visible', 'The element has focus and got it from the keyboard.', 'Boxes only take focus from the keyboard, so on boxes it equals :focus.'],
          [':focus-within', 'The element or something inside it has focus.', ''],
          [':disabled', 'enabled={False}.', ''],
          [':checked', 'checked is true.', '<checkbox>, <switch>, and boxes with a checked attribute.'],
          [':selected', 'selected is true.', 'Boxes with a selected attribute.'],
          [':expanded', 'expanded is true.', 'Boxes with an expanded attribute.'],
          [':first-child', 'First visible child of its container.', 'Also inside {#each}.'],
          [':last-child', 'Last visible child of its container.', 'Also inside {#each}.'],
          [':dragging', 'The element is being dragged.', 'Set by the drag and drop engine.'],
          [':drag-over', 'A dragged element is over this drop zone.', 'Set by the drag and drop engine.']
        ] }
      },
      {
        id: 'scope-and-precedence',
        title: 'Scope and precedence',
        body: 'Styles are local to the component. A rule affects the elements written in that component’s template, including content it passes into a child’s slots, and never the inside of another component. Theme tokens and inherited text properties are how styles cross that boundary.\n\nWhen several rules set the same property on one element, JanelKit decides like CSS, with two additions for attributes and inline styles.',
        steps: [
          'The more specific rule wins: more classes and pseudo-classes first, then more element names. .card:hover .actions beats .actions even if it comes earlier.',
          'With equal specificity, the rule that comes later in <style> wins.',
          'An attribute written on the element (gap={4}) beats rules without state, but rules with state (pseudo-classes, class:x, class={…}) beat the attribute.',
          'A rule that depends on a conditional or dynamic class of the element itself (class:x, class={…}) is applied above the others.',
          'An inline style= beats every rule, including states: :hover cannot change a property set inline.'
        ],
        pitfalls: [
          'In slot content, a descendant selector can use the fixed classes of ancestors outside the slot, but not their states or conditional classes. The compiler warns and ignores that rule.',
          'There is no global stylesheet and no !important. Share appearance through theme tokens, custom properties or a component.'
        ]
      },
      {
        id: 'values',
        title: 'Values',
        body: 'Each property accepts one of these value types. The property tables say which.',
        table: { headers: ['Type', 'Accepted', 'Not accepted (warning)'], rows: [
          ['Length', '16px, 16, 0.5px, -8px. Pixels; the unit is optional.', '.5 (needs a leading 0), em, rem, vw, vh, %, calc(), min(), max(), clamp()'],
          ['Percentage', '50% — only where a property table says so: width, height, flex-basis, top, right, bottom, left, inset.', 'Percentages anywhere else, such as padding or max-width.'],
          ['Color', '#rgb, #rrggbb, #aarrggbb (alpha first), rgb(255, 0, 0), rgba(255, 0, 0, 0.5), and Qt’s color names such as red, darkslategray and transparent.', 'hsl(), hwb(), lab(), oklch(), rgb(255 0 0) with spaces, rgb(… / 50%), percentages inside rgb(), gradients, currentColor (see Known problems).'],
          ['Theme token', 'var(--primary), var(--space-4). Follows the active theme.', ''],
          ['Custom property', 'var(--accent), or var(--accent, var(--primary)) with a fallback.', ''],
          ['Number', 'Unitless numbers where stated: opacity 0.5, line-height 1.4, flex-shrink 1.', '50% for opacity, .5'],
          ['Duration', '200ms, 0.2s, .2s', ''],
          ['Angle', '45deg, 0.25turn, 45 (degrees)', 'rad, grad']
        ] },
        pitfalls: [
          'Eight-digit hex colors are #aarrggbb, alpha first. The browser’s #rrggbbaa gives a different color.',
          'Write 0.5, not .5. A number that starts with a dot is rejected, except inside rgba() and in durations.'
        ]
      },
      {
        id: 'color-background-border',
        title: 'Color, background and borders',
        body: 'On a <window>, background sets the window color and border does not apply.',
        table: { headers: ['Property', 'Applies to', 'Values and notes'], rows: [
          ['color', `${TEXTS}; ${BOXES} (inherited by the <text> inside)`, 'Color.'],
          ['background, background-color', `${BOXES}, ${SCROLLS}, <text>, Fields, <window>`, 'Color. A <text> with background, padding and border-radius makes a badge.'],
          ['border', `${BOXES}, ${SCROLLS}, <text>, Fields`, 'Width and color in any order: 1px solid #ccc, 1px var(--border). solid is optional; none or 0 removes it. A color alone means 1px.'],
          ['border-width', 'Same as border', 'Length.'],
          ['border-color', 'Same as border', 'Color.'],
          ['border-radius', 'Same as border', 'One length. Two to four lengths (one per corner, as in CSS) only on Boxes. No percentages.'],
          ['border-top, border-right, border-bottom, border-left', BOXES, 'Like border, for one side: separators.'],
          ['border-top-width, border-right-width, border-bottom-width, border-left-width', BOXES, 'Length.'],
          ['border-top-color, border-right-color, border-bottom-color, border-left-color', BOXES, 'Color.']
        ] },
        pitfalls: [
          'Only solid borders exist. dashed and dotted are not supported, and without a color they stop the application at startup (see Known problems).'
        ]
      },
      {
        id: 'spacing',
        title: 'Spacing',
        body: 'Padding is the space inside an element, margin the space outside it, and gap the space between the children of a container. Prefer gap on the container over margins on each child.',
        table: { headers: ['Property', 'Applies to', 'Values and notes'], rows: [
          ['padding', `${BOXES}, ${SCROLLS}, ${TEXTS}`, 'One to four lengths, as in CSS. On <scroll> and <list> it pads the content inside.'],
          ['padding-top, padding-right, padding-bottom, padding-left', 'Same as padding', 'Length.'],
          ['margin', ANY, 'One to four values: lengths, negative lengths or auto. auto pushes the element (margin-left: auto). Margins never collapse.'],
          ['margin-top, margin-right, margin-bottom, margin-left', ANY, 'Length or auto.'],
          ['gap', `${BOXES}, ${SCROLLS}`, 'One length between children. For two values use row-gap and column-gap.'],
          ['row-gap, column-gap', BOXES, 'Length: between lines and between columns when wrapping.']
        ] }
      },
      {
        id: 'flex-layout',
        title: 'Flex layout',
        body: 'Layout follows a subset of CSS flexbox. flex uses the web defaults (row, align-items: stretch, children shrink); <column> and <row> are shortcuts with their own defaults. The Layout chapter explains how they behave.',
        table: { headers: ['Property', 'Applies to', 'Values and notes'], rows: [
          ['flex-direction, direction', 'flex', 'row (default), column, row-reverse, column-reverse.'],
          ['flex-wrap', BOXES, 'nowrap, wrap.'],
          ['align-items', `${BOXES}, <scroll>`, 'start, center, end, stretch; baseline only on Boxes. flex-start and flex-end are accepted as start and end.'],
          ['justify-content', `${BOXES}, <scroll>`, 'start, center, end, space-between, space-around, space-evenly.'],
          ['align-content', BOXES, 'The justify-content values plus stretch: distributes wrapped lines.'],
          ['align-self', ANY, 'auto, start, center, end, stretch.'],
          ['flex', ANY, '1 (= 1 1 0), 1 0 200px (grow, shrink, basis), auto (= 1 1 auto), none (= 0 0 auto). Grow must be a whole number.'],
          ['flex-grow', ANY, 'Whole number. On its own it keeps the basis at auto, as in CSS.'],
          ['flex-shrink', ANY, 'Number.'],
          ['flex-basis', ANY, 'Length, percentage, auto or content.'],
          ['order', ANY, 'Whole number, may be negative.'],
          ['overflow', BOXES, 'visible, hidden (clips, without rounding the corners), auto and scroll (make the box scrollable).']
        ] },
        see: ['layout']
      },
      {
        id: 'sizing',
        title: 'Size',
        body: 'Without a size, an element takes its natural size, and in a <column>, text, fields and boxes stretch to the full width. Set a size only when the layout needs one.',
        table: { headers: ['Property', 'Applies to', 'Values and notes'], rows: [
          ['width, height', EVERY, 'Length; percentage of the container; 100% fills the available space; auto and fit-content keep the natural size. On a <window>, a length only.'],
          ['min-width, max-width, min-height, max-height', EVERY, 'Length only, no percentages.']
        ] }
      },
      {
        id: 'position',
        title: 'Position',
        body: 'Elements are placed by the layout of their container. position takes an element out of that order, for overlays, badges and pop-up menus.',
        table: { headers: ['Property', 'Applies to', 'Values and notes'], rows: [
          ['position', ANY, 'static (default), relative, absolute, fixed. No sticky.'],
          ['top, right, bottom, left', ANY, 'Length, percentage of the containing box, or auto.'],
          ['inset', ANY, 'One to four values, like margin. inset: 0 covers the containing box.'],
          ['z-index', ANY, 'Whole number or auto. Orders siblings only, not the whole window.']
        ] },
        explanation: [
          'relative moves the element from its place without moving the others, and becomes the reference for absolute elements inside it.',
          'absolute leaves the flow and is placed against the nearest ancestor box with a position, or the window if there is none.',
          'fixed is placed against the window and follows it when resized: use it for overlays and dialogs.',
          'An absolute or fixed box blocks the pointer for what is underneath it.'
        ]
      },
      {
        id: 'typography',
        title: 'Text',
        body: 'Properties set on a box are inherited by the <text> elements inside it; see Inherited text. On a <window>, font properties apply to the whole window.',
        table: { headers: ['Property', 'Applies to', 'Values and notes'], rows: [
          ['font-size', `${TEXTS}, ${BOXES}, <window>`, 'Length.'],
          ['font-weight', `${TEXTS}, ${BOXES}, <window>`, '1 to 1000, normal (400), bold (700), lighter (300), bolder (800). lighter and bolder are fixed weights, not relative to the parent.'],
          ['font-family', `${TEXTS}, ${BOXES}, <window>`, 'One family name, quoted or not, or a token such as var(--font-family). No fallback list.'],
          ['font-style', `${TEXTS}, ${BOXES}, <window>`, 'italic, normal.'],
          ['letter-spacing', `${TEXTS}, ${BOXES}`, 'Length.'],
          ['text-transform', `${TEXTS}, ${BOXES}`, 'none, uppercase, lowercase, capitalize.'],
          ['text-align', `<text>, <textfield>, <textarea>, ${BOXES}`, 'left, center, right, justify.'],
          ['line-height', `<text>, ${BOXES}`, 'Unitless factor, such as 1.4. Lengths are rejected.'],
          ['white-space', `<text>, ${BOXES}`, 'normal, nowrap (one line). pre-wrap is accepted and behaves like normal.'],
          ['text-overflow', `<text>, ${BOXES}`, 'ellipsis, clip.'],
          ['user-select', '<text>', 'text (the text can be selected and copied), auto, none.']
        ] }
      },
      {
        id: 'effects',
        title: 'Effects and interaction',
        body: 'These properties change how an element looks or reacts without changing the layout. Most of them only exist on Boxes, so wrap a control in a <column> to give it a shadow or an outline.',
        table: { headers: ['Property', 'Applies to', 'Values and notes'], rows: [
          ['opacity', EVERY, 'Number from 0 to 1, written 0.5.'],
          ['transform', ANY, 'scale(n), rotate(45deg), translate(x, y), translateX(x), translateY(y), none, combined with spaces. Always from the center; it does not affect layout. Replaces the whole transform, as in CSS.'],
          ['box-shadow', BOXES, 'x y [blur [spread]] [color]: 0 2px 8px rgba(0, 0, 0, 0.15). Default color is black at 25 %. One shadow; extra shadows produce a warning and are ignored. No inset. none removes it.'],
          ['outline', BOXES, 'A ring that takes no space: 2px solid var(--primary). Width defaults to 2px. A rule with outline replaces the default focus ring.'],
          ['outline-width, outline-color, outline-offset', BOXES, 'Length, color, length. A negative offset draws the ring inside.'],
          ['cursor', ANY, 'default, auto, pointer, text, move, grab, grabbing, not-allowed, wait, progress, crosshair, help, ew-resize, ns-resize, nesw-resize, nwse-resize, col-resize, row-resize.'],
          ['pointer-events', BOXES, 'auto, none: the box ignores the mouse (no :hover, click or cursor); its children still receive it.'],
          ['visibility', BOXES, 'visible, hidden: keeps its space but is not drawn and receives no events.'],
          ['transition', ANY, 'property duration, separated by commas: background 200ms, opacity 0.3s, or all 150ms. Animates color, background, background-color, border-color, opacity, width, height, border-radius and transform; on Boxes also box-shadow, outline and outline-color. Always eases out.']
        ] },
        pitfalls: [
          'transition ignores a timing function or delay: ease-in and 100ms after the duration compile without a warning and have no effect.',
          'scale takes one factor. scale(1, 2), skew(), rotate(1rad) and transform-origin are not supported.'
        ]
      },
      {
        id: 'inherited-text',
        title: 'Inherited text',
        body: 'color, font-family, font-size, font-weight, font-style, letter-spacing, text-transform, text-align, line-height, white-space and text-overflow set on a box are inherited by every <text> inside it, at any depth, also inside other components and slot content, unless the <text> sets its own.\n\nThe text of Qt controls such as <button> and <textfield> does not inherit: style those directly.',
        language: 'css',
        code: `/* One rule recolors all the text of the selected row. */
.row:selected { background: var(--primary); color: var(--on-primary); }`
      },
      {
        id: 'custom-properties',
        title: 'Custom properties',
        body: '--name: value on a box defines a variable for that box and everything inside it, including other components. It can change with states and classes. var(--name) reads it.\n\nvar(--name) looks for a custom property only if this component defines it or the call has a fallback. Otherwise it is read as a theme token. To read a variable that the parent component sets, give it a fallback: var(--button-bg, var(--surface)).',
        language: 'css',
        code: `.card { --accent: var(--primary); border-left: 3px solid var(--accent); }
.card.alert { --accent: var(--danger); }
.card:hover { --accent: var(--success); }
.title { color: var(--accent); }`,
        pitfalls: [
          'Custom properties can only be defined on Boxes (flex, <column>, <row>). On another element they produce a warning.'
        ]
      },
      {
        id: 'inline-style',
        title: 'Inline styles',
        body: 'style="gap: 4px; background: #222" accepts every property on this page for one element, with the same values.\n\nstyle={{…}} takes a dictionary computed in Python and updates when its data changes. It accepts fewer properties: background, background-color, color, border-color, border-width, border-radius, opacity, gap, padding, font-size, width, height, top, right, bottom, left, z-index, and custom properties --name on Boxes. Numbers are pixels; text such as "50%" is a percentage where the property allows it.',
        language: 'janel',
        code: `<flex style={{"width": f"{progress}%", "background": color, "--accent": accent}} />`,
        pitfalls: [
          'Inline styles beat every rule, including :hover. Put values that should change with state in <style>.',
          'Dictionary keys must be fixed strings; for classes use class={…}.'
        ]
      },
      {
        id: 'tokens',
        title: 'Theme tokens',
        body: 'Tokens are the values of the active theme. Use them with var(--name); they change when the theme changes. A token name with underscores in Python is written with hyphens in CSS: brand_dark is var(--brand-dark). A var(--x) that does not exist in the active theme produces a warning with its location when the application starts.',
        table: { headers: ['Token', 'Light', 'Dark', 'Use'], rows: [
          ['--bg', '#f5f6f8', '#14161a', 'Window background'],
          ['--surface', '#ffffff', '#1e2127', 'Cards and fields'],
          ['--surface-alt', '#eef0f4', '#272b33', 'Secondary areas'],
          ['--text', '#1b1f24', '#e6e8ec', 'Main text'],
          ['--text-muted', '#626b78', '#99a1ad', 'Secondary text'],
          ['--border', '#d5dae1', '#373c46', 'Borders'],
          ['--primary / --on-primary', '#3b5bdb / #ffffff', '#7b93ff / #0d1330', 'Accent and text on it'],
          ['--danger / --on-danger', '#e03131 / #ffffff', '#ff6b6b / #1f0606', 'Destructive actions'],
          ['--success', '#2b8a3e', '#51cf66', 'Success'],
          ['--warning', '#e8590c', '#ffa94d', 'Warnings'],
          ['--hover / --pressed', '#10000000 / #24000000', '#1affffff / #33ffffff', 'Translucent interaction layers'],
          ['--radius-sm, --radius, --radius-lg', '4, 8, 14', 'same', 'Corner radii'],
          ['--font-family', 'empty: system font', 'same', 'Font'],
          ['--font-size-sm, --font-size, --font-size-lg, --font-size-xl', '12, 14, 18, 24', 'same', 'Font sizes'],
          ['--space-1 … --space-6', '4, 8, 12, 16, 24, 32', 'same', 'Spacing']
        ] },
        language: 'python',
        code: `from janelkit import theme

theme.set("dark")                          # or "light"; theme.toggle() switches
theme.extend("light", brand="#7048e8")     # add or change tokens; without a name, in every theme
theme.define("sepia", base="light", bg="#f4ecd8", text="#433422")`,
        see: ['styles']
      },
      {
        id: 'not-supported',
        title: 'Common CSS that is not supported',
        body: 'Each item below was compiled against JanelKit 0.2. The Result column says what happens; the last column gives the closest supported way.',
        table: { headers: ['CSS', 'Result', 'Use instead'], rows: [
          ['@media, @keyframes, @font-face, @import, nesting', 'Compile error', 'A computed value with class:x or style={…}; transition for animations.'],
          ['display (none, grid, flex)', 'Warning', '{#if} or {#hidden} to hide; flex or <column>/<row> for layout; flex-wrap for grids.'],
          ['grid-template-*, place-items, justify-items', 'Warning', 'flex-wrap with flex: 1 1 200px on the items.'],
          ['position: sticky', 'Warning', 'Put the header outside the <scroll>.'],
          ['em, rem, vw, vh, calc(), min(), clamp()', 'Warning', 'Pixels, theme tokens, percentages where allowed, or values computed in Python with style={…}.'],
          ['hsl(), modern rgb() syntax, gradients', 'Warning', 'Hex or rgb()/rgba() with commas.'],
          ['background-image, url()', 'Warning', '<image> inside an absolute box.'],
          ['text-decoration, text-shadow, word-break', 'Warning', 'No equivalent.'],
          ['font shorthand', 'Warning', 'font-size, font-weight, font-family and font-style separately.'],
          ['border-style, dashed and dotted borders', 'Warning', 'Solid borders only.'],
          ['box-shadow: inset, several shadows', 'Warning', 'One outer shadow.'],
          ['filter, backdrop-filter, clip-path, mix-blend-mode', 'Warning', 'No equivalent.'],
          ['transform: skew(), scale(x, y), transform-origin', 'Warning', 'scale(n), rotate(), translate().'],
          ['animation, transition-timing-function, transition-delay', 'Warning for the properties; ignored inside transition', 'transition with a state or class change.'],
          ['overflow-x, overflow-y', 'Warning', 'overflow on a box, or a <scroll>.'],
          ['aspect-ratio, box-sizing', 'Warning', 'Explicit width and height.'],
          ['scrollbar-*', 'Warning', 'No equivalent.'],
          ['!important', 'Warning (invalid value)', 'A more specific selector, or style=.']
        ] }
      },
      {
        id: 'known-problems',
        title: 'Known problems in 0.2',
        body: 'These values compile without any warning and janel build accepts them, but the application then fails to start with Qt rechazó el QML generado: Invalid property assignment ("Qt rejected the generated QML"). The error points at the element, so the fix is quick once you know the cause.',
        table: { headers: ['Written', 'What happens', 'Write instead'], rows: [
          ['A misspelled color name: color: blu', 'The application does not start.', 'Check the spelling, or use a hex value or a token.'],
          ['A CSS color name Qt does not know: rebeccapurple', 'The application does not start.', '#663399.'],
          ['A border style without a color: border: 2px dashed', 'dashed is read as a color name; the application does not start.', 'border: 2px solid var(--border).'],
          ['outline: 2px dotted', 'Same as above.', 'outline: 2px solid var(--primary).'],
          ['currentColor in a border or color', 'Read as a color name; the application does not start.', 'The same token as the text color.']
        ] },
        pitfalls: [
          'Also silent, without stopping the application: a rule whose selector matches nothing (including Card { … } for a component), and a timing function or delay inside transition.'
        ]
      }
    ]
  }
];
