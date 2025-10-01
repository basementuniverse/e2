# E2 - Editor Elements

A lightweight, portable collection of custom HTML elements designed for building desktop-like web applications such as level editors, sprite editors, and similar development tools.

## Quick Start

### Using in HTML (CDN/Direct)

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Editor</title>
</head>
<body>
    <!-- Your editor UI -->
    <e2-toolbar>
        <e2-toolbar-button label="New" icon="📄"></e2-toolbar-button>
        <e2-toolbar-button label="Save" icon="💾"></e2-toolbar-button>
        <e2-toolbar-separator></e2-toolbar-separator>
        <e2-toolbar-button label="Play" icon="▶️"></e2-toolbar-button>
    </e2-toolbar>

    <!-- Load the library -->
    <script src="path/to/e2/build/e2.min.js"></script>
</body>
</html>
```

### Using with NPM/Webpack/TypeScript

```bash
npm install @basementuniverse/e2
```

```typescript
// Import in your main file
import '@basementuniverse/e2';

// Or import specific utilities
import { generateId, applyTheme } from '@basementuniverse/e2';

// TypeScript types are included
import type { ToolbarButtonClickEvent } from '@basementuniverse/e2';
```

## Notes

For list views, tree views, JSON viewing, JSON editing etc. consider using:

- [native-json-editor](https://www.npmjs.com/package/native-json-editor)
- [jsoneditor](https://www.npmjs.com/package/jsoneditor)
- [dat.gui](https://www.npmjs.com/package/dat.gui)

## Components

- [Toolbar](docs/toolbar.md)
- [Collapsible Panel](docs/collapsible-panel.md)

## Theming

All components support three theme modes:

- `light` - Light theme (default)
- `dark` - Dark theme
- `auto` - System preference

### CSS Custom Properties

```css
:root {
    /* Toolbar */
    --toolbar-bg: #f0f0f0;
    --toolbar-border: #ccc;
    --toolbar-bg-dark: #2d2d2d;
    --toolbar-border-dark: #555;

    /* Buttons */
    --button-hover-bg: rgba(0, 0, 0, 0.1);
    --button-active-bg: rgba(0, 0, 0, 0.2);
    --button-hover-bg-dark: rgba(255, 255, 255, 0.1);
    --button-active-bg-dark: rgba(255, 255, 255, 0.2);

    /* Text */
    --text-color: #333;
    --text-color-dark: #fff;

    /* Separators */
    --separator-color: #ccc;
    --separator-color-dark: #555;

    /* Typography */
    --font-family: system-ui, sans-serif;
    --font-size: 14px;
}
```
