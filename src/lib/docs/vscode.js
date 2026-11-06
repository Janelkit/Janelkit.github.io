// Ecosystem · janelkit-vscode.
// Source (read-only): JanelKit/packages/janelkit-vscode/README.md and package.json.
export const vscodeDocs = [
  {
    slug: 'vscode',
    title: 'VS Code extension',
    description: 'Syntax highlighting, comments, bracket closing and folding for .janel files.',
    sections: [
      {
        id: 'what-it-does',
        title: 'What it does',
        body: 'A .janel file mixes three languages, and the extension colors each one as such: Python in the script, in {expressions} and in the {#if}, {#each}, {#key} and {#hidden} blocks; CSS in style; and the template, with its on:, bind:, class: and transition: directives highlighted.\n\nIt also adds <!-- --> comments with Ctrl+/, automatic closing of brackets, parentheses and quotes, and folding of script, style and {#…} blocks. The code on this website is colored with the same grammar.'
      },
      {
        id: 'install',
        title: 'Install it',
        body: 'Search for JanelKit in the Extensions view of VS Code, or install it from a terminal. VS Code 1.80 or newer is required. The extension does not install JanelKit; to run applications you still need pip install janelkit.',
        language: 'shell',
        code: `code --install-extension janelkit.janelkit-janel

# Or build it from the repository (requires Node.js):
cd packages/janelkit-vscode
npx @vscode/vsce package
code --install-extension janelkit-janel-0.1.0.vsix`
      },
      {
        id: 'errors',
        title: 'Errors are reported by janel, not by the editor',
        body: 'The extension only colors code: it does not complete names or mark errors. Run janel dev or janel build to see errors with file, line, column and suggestions; in the integrated terminal of VS Code you can click a location to jump to it. Editors and tools can also call janelkit.compiler.check_file to get the same diagnostics without running anything.',
        see: ['cli']
      }
    ]
  }
];
