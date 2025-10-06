# E2 - Editor Elements

A lightweight, portable collection of custom HTML elements designed for building desktop-like web applications such as level editors, sprite editors, and similar development tools.

## Quick Start

### Using in HTML (CDN/Direct)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
    <link rel="stylesheet" href="main.css" />
    <script src="e2.min.js"></script>
  </head>
  <body>
    <main>
      <e2-app id="my-app" theme="dark">
        <!-- Your app UI -->
      </e2-app>
    </main>
  </body>
</html>
```

### Using with NPM/Webpack/TypeScript

```bash
npm install @basementuniverse/e2
```

```typescript
import '@basementuniverse/e2';
```

## Components

- [App](docs/app.md)
- [Toolbar](docs/toolbar.md)
- [Toolbar Menu](docs/toolbar-menu.md)
- [Context Menu](docs/context-menu.md)
- [Collapsible Panel](docs/collapsible-panel.md)
- [Split Panel](docs/split-panel.md)
- [Tabs](docs/tabs.md)
- [Dialog](docs/dialog.md)
- [Notifications](docs/notification.md)
- [Status Bar](docs/status-bar.md)

## Notes

For list views, tree views, JSON viewing, JSON editing etc. consider using:

- [native-json-editor](https://www.npmjs.com/package/native-json-editor)
- [jsoneditor](https://www.npmjs.com/package/jsoneditor)
- [dat.gui](https://www.npmjs.com/package/dat.gui)

## Theming

All components support three theme modes:

- `light` - Light theme
- `dark` - Dark theme
- `auto` - System preference
