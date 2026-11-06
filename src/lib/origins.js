// Where a documented feature comes from. Shown as a badge on every page that has one,
// so readers never confuse what ships with janelkit with what a package adds.
export const origins = {
  core: {
    package: 'janelkit',
    kind: 'Core',
    summary: 'Included with janelkit. Nothing extra to install.'
  },
  router: {
    package: 'janelkit-router',
    kind: 'Ecosystem package',
    install: 'pip install janelkit-router',
    summary: 'Navigation between screens: page stacks that keep their state, parallel sections, results with await and transitions.'
  },
  store: {
    package: 'janelkit-store',
    kind: 'Ecosystem package',
    install: 'pip install janelkit-store',
    summary: 'Shared application data: stores with actions, controlled writes and change tracking, one instance per application, and persistence.'
  },
  desktop: {
    package: 'janelkit-desktop',
    kind: 'Ecosystem package',
    install: 'pip install janelkit-desktop',
    summary: 'System services: native file and message dialogs, and the clipboard. It adds no interface controls.'
  },
  i18n: {
    package: 'janelkit-i18n',
    kind: 'Ecosystem package',
    install: 'pip install janelkit-i18n',
    summary: 'Translation catalogs, plurals, locale-aware number, currency and date formats, and language switching at run time.'
  },
  vscode: {
    package: 'janelkit-vscode',
    kind: 'Editor extension',
    install: 'code --install-extension janelkit.janelkit-janel',
    summary: 'Syntax highlighting for .janel files in Visual Studio Code.'
  }
};
