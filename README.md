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
    <editor-toolbar>
        <editor-toolbar-button label="New" icon="📄"></editor-toolbar-button>
        <editor-toolbar-button label="Save" icon="💾"></editor-toolbar-button>
        <editor-toolbar-separator></editor-toolbar-separator>
        <editor-toolbar-button label="Play" icon="▶️"></editor-toolbar-button>
    </editor-toolbar>

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

## Components

@todo

## Component Documentation

### Toolbar Button

```html
<editor-toolbar-button
    label="Save"
    icon="💾"
    id="save-btn"
    theme="auto"
    active
    disabled>
</editor-toolbar-button>
```

**Attributes:**
- `label` - Text label for the button
- `icon` - Icon (emoji or text) to display
- `theme` - Theme: "light", "dark", or "auto"
- `active` - Whether button appears pressed/active
- `disabled` - Whether button is disabled

**Events:**
- `toolbar-button-click` - Fired when button is clicked

**JavaScript API:**
```javascript
const button = document.querySelector('#save-btn');
button.label = 'Save File';
button.active = true;

button.addEventListener('toolbar-button-click', (event) => {
    console.log('Button clicked:', event.detail.buttonId);
});
```

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
