// Where a documented feature comes from. Shown as a badge on every page that has one,
// so readers never confuse built-in controls with optional packages.
export const origins = {
  core: {
    package: 'janelkit',
    kind: 'Core',
    summary: 'Included with janelkit. Nothing extra to install.'
  },
  desktop: {
    package: 'janelkit-desktop',
    kind: 'Optional package',
    install: 'pip install janelkit-desktop',
    summary: 'System services: native dialogs, clipboard and notifications. It adds no interface controls.'
  },
  i18n: {
    package: 'janelkit-i18n',
    kind: 'Optional package',
    install: 'pip install janelkit-i18n',
    summary: 'Translation catalogs, plurals and locale-aware formatting.'
  },
  vscode: {
    package: 'janelkit-vscode',
    kind: 'Editor extension',
    install: 'code --install-extension janelkit.janelkit-janel',
    summary: 'Syntax highlighting for .janel files in Visual Studio Code.'
  }
};
