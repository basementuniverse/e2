# Toolbar Menu

The `<e2-toolbar-menu>` element creates a dropdown menu button for use within toolbars, allowing you to create menu bar-style interfaces.

## Basic Usage

```html
<e2-toolbar>
  <e2-toolbar-menu label="File">
    <e2-context-menu-item
      label="New"
      icon="📄"
      value="new"
    ></e2-context-menu-item>
    <e2-context-menu-item
      label="Open"
      icon="📁"
      value="open"
    ></e2-context-menu-item>
    <e2-context-menu-separator></e2-context-menu-separator>
    <e2-context-menu-item
      label="Save"
      icon="💾"
      value="save"
      shortcut="Ctrl+S"
    ></e2-context-menu-item>
  </e2-toolbar-menu>
</e2-toolbar>
```

## Attributes

| Attribute  | Type                          | Default  | Description                               |
| ---------- | ----------------------------- | -------- | ----------------------------------------- |
| `label`    | string                        | `''`     | The text displayed on the menu button     |
| `icon`     | string                        | `''`     | Optional icon to display before the label |
| `theme`    | `'light' \| 'dark' \| 'auto'` | `'auto'` | Visual theme                              |
| `disabled` | boolean                       | `false`  | Whether the menu is disabled              |

## Properties

| Property | Type    | Description                                        |
| -------- | ------- | -------------------------------------------------- |
| `label`  | string  | Gets/sets the menu button label                    |
| `icon`   | string  | Gets/sets the menu button icon                     |
| `theme`  | Theme   | Gets/sets the visual theme                         |
| `isOpen` | boolean | Whether the dropdown is currently open (read-only) |

## Methods

| Method     | Description                           |
| ---------- | ------------------------------------- |
| `open()`   | Opens the dropdown menu               |
| `close()`  | Closes the dropdown menu              |
| `toggle()` | Toggles the dropdown menu open/closed |

## Events

| Event               | Detail             | Description                    |
| ------------------- | ------------------ | ------------------------------ |
| `toolbar-menu-show` | `{ menuId, menu }` | Fired when the dropdown opens  |
| `toolbar-menu-hide` | `{ menuId, menu }` | Fired when the dropdown closes |

## Menu Items

The toolbar menu uses the same context menu items as the regular context menu:

- `<e2-context-menu-item>` - Clickable menu items
- `<e2-context-menu-separator>` - Visual separators between items

Menu items fire `context-menu-item-click` events when clicked.

## Styling

The toolbar menu inherits styling from both toolbar buttons and context menus. It supports the same CSS custom properties for theming:

```css
/* Button styling */
:host {
  --button-hover-bg: rgba(0, 0, 0, 0.1);
  --button-active-bg: rgba(0, 0, 0, 0.2);
}

/* Dropdown styling */
:host {
  --context-menu-bg: #ffffff;
  --context-menu-border: #d0d0d0;
  --context-menu-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

## JavaScript Usage

```javascript
// Listen for menu events
document.addEventListener('toolbar-menu-show', event => {
  const { menuId, menu } = event.detail;
  console.log(`Menu opened: ${menuId}`);
});

document.addEventListener('toolbar-menu-hide', event => {
  const { menuId, menu } = event.detail;
  console.log(`Menu closed: ${menuId}`);
});

// Listen for menu item clicks
document.addEventListener('context-menu-item-click', event => {
  const { value, itemId, menuId } = event.detail;
  console.log(`Item clicked: ${value} in menu ${menuId}`);
});

// Programmatic control
const menu = document.querySelector('e2-toolbar-menu');
menu.open();
menu.close();
menu.toggle();
```

## Accessibility

- Dropdown opens/closes with click or Enter/Space keys
- Arrow keys navigate through menu items
- Escape key closes the dropdown
- Menu stays within viewport bounds automatically
- Supports keyboard navigation and screen readers

## Browser Support

Same as the base E2 library - modern browsers with custom element support.
