# Tab Components

The E2 tab system provides a flexible and powerful way to create tabbed interfaces in your applications. It consists of three main components that work together:

- `<e2-tab-container>` - The main container that manages tabs and panels
- `<e2-tab>` - Individual tab elements that users click to switch content
- `<e2-tab-panel>` - Content panels that show/hide based on tab selection

## Basic Usage

```html
<e2-tab-container>
  <e2-tab slot="tabs" label="First Tab">First Tab</e2-tab>
  <e2-tab slot="tabs" label="Second Tab">Second Tab</e2-tab>

  <e2-tab-panel slot="panels">
    <h3>First Tab Content</h3>
    <p>This is the content for the first tab.</p>
  </e2-tab-panel>

  <e2-tab-panel slot="panels">
    <h3>Second Tab Content</h3>
    <p>This is the content for the second tab.</p>
  </e2-tab-panel>
</e2-tab-container>
```

## Tab Container (`<e2-tab-container>`)

The tab container manages the overall tab interface and handles tab switching logic.

### Attributes

| Attribute      | Type                                     | Default  | Description                          |
| -------------- | ---------------------------------------- | -------- | ------------------------------------ |
| `theme`        | `'light' \| 'dark' \| 'auto'`            | `'auto'` | Visual theme                         |
| `disabled`     | `boolean`                                | `false`  | Disables the entire tab interface    |
| `active-tab`   | `string`                                 | -        | ID of the currently active tab       |
| `tab-position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`  | Position of tabs relative to content |
| `closable`     | `boolean`                                | `false`  | Makes all tabs closable by default   |

### Properties

```typescript
// Theme control
theme: Theme
applyTheme(theme: Theme): void

// Tab management
activeTabId: string | null
tabs: NodeListOf<HTMLElement>
panels: NodeListOf<HTMLElement>
tabPosition: 'top' | 'bottom' | 'left' | 'right'
closable: boolean
disabled: boolean

// Programmatic control
selectTabById(tabId: string): void
addTab(label: string, content?: string, tabId?: string, panelId?: string): { tabId: string; panelId: string }
removeTabById(tabId: string): void
```

### Events

| Event                  | Detail                    | Description                              |
| ---------------------- | ------------------------- | ---------------------------------------- |
| `tab-select`           | `TabSelectEvent`          | Fired when a tab is selected             |
| `tab-close`            | `TabCloseEvent`           | Fired when a tab is closed (preventable) |
| `tab-container-change` | `TabContainerChangeEvent` | Fired when the active tab changes        |

### Examples

#### Different Tab Positions

```html
<!-- Tabs on top (default) -->
<e2-tab-container tab-position="top">
  <!-- tabs and panels -->
</e2-tab-container>

<!-- Tabs on bottom -->
<e2-tab-container tab-position="bottom">
  <!-- tabs and panels -->
</e2-tab-container>

<!-- Tabs on left -->
<e2-tab-container tab-position="left">
  <!-- tabs and panels -->
</e2-tab-container>

<!-- Tabs on right -->
<e2-tab-container tab-position="right">
  <!-- tabs and panels -->
</e2-tab-container>
```

#### Closable Tabs

```html
<e2-tab-container closable>
  <e2-tab slot="tabs" label="Document 1" closable>Document 1</e2-tab>
  <e2-tab slot="tabs" label="Document 2" closable>Document 2</e2-tab>

  <e2-tab-panel slot="panels">Content 1</e2-tab-panel>
  <e2-tab-panel slot="panels">Content 2</e2-tab-panel>
</e2-tab-container>
```

#### Programmatic Control

```javascript
const tabContainer = document.querySelector('e2-tab-container');

// Add a new tab
const { tabId, panelId } = tabContainer.addTab('New Tab', '<p>New content</p>');

// Select a tab by ID
tabContainer.selectTabById('my-tab-id');

// Remove a tab
tabContainer.removeTabById('my-tab-id');

// Get current active tab
console.log(tabContainer.activeTabId);

// Get all tabs
console.log(tabContainer.tabs.length);
```

## Tab (`<e2-tab>`)

Individual tab elements that users click to switch between content panels.

### Attributes

| Attribute  | Type                          | Default  | Description                          |
| ---------- | ----------------------------- | -------- | ------------------------------------ |
| `theme`    | `'light' \| 'dark' \| 'auto'` | `'auto'` | Visual theme                         |
| `disabled` | `boolean`                     | `false`  | Disables the tab                     |
| `active`   | `boolean`                     | `false`  | Whether this tab is currently active |
| `closable` | `boolean`                     | `false`  | Shows a close button                 |
| `icon`     | `string`                      | -        | Icon to display (emoji or text)      |
| `label`    | `string`                      | -        | Tab label text                       |
| `panel`    | `string`                      | -        | ID of the associated panel           |

### Properties

```typescript
// Appearance
theme: Theme
icon: string
label: string
active: boolean
closable: boolean
disabled: boolean

// Association
panel: string | null

// Actions
click(): void
close(): void
applyTheme(theme: Theme): void
```

### Events

| Event       | Detail                    | Description                        |
| ----------- | ------------------------- | ---------------------------------- |
| `tab-click` | `{ tabId, tab, panelId }` | Fired when tab is clicked          |
| `tab-close` | `{ tabId, tab, panelId }` | Fired when close button is clicked |

### Examples

#### Tabs with Icons

```html
<e2-tab slot="tabs" label="Home" icon="🏠">Home</e2-tab>
<e2-tab slot="tabs" label="Settings" icon="⚙️">Settings</e2-tab>
<e2-tab slot="tabs" label="Profile" icon="👤">Profile</e2-tab>
```

#### Closable Tabs

```html
<e2-tab slot="tabs" label="Document" icon="📄" closable>Document</e2-tab>
```

#### Custom Panel Association

```html
<e2-tab slot="tabs" label="Custom" panel="my-custom-panel">Custom</e2-tab>
<!-- ... -->
<e2-tab-panel slot="panels" id="my-custom-panel">Custom content</e2-tab-panel>
```

## Tab Panel (`<e2-tab-panel>`)

Content containers that show/hide based on the selected tab.

### Attributes

| Attribute            | Type                          | Default                  | Description                             |
| -------------------- | ----------------------------- | ------------------------ | --------------------------------------- |
| `theme`              | `'light' \| 'dark' \| 'auto'` | `'auto'`                 | Visual theme                            |
| `disabled`           | `boolean`                     | `false`                  | Disables the panel                      |
| `active`             | `boolean`                     | `false`                  | Whether this panel is currently visible |
| `loading`            | `boolean`                     | `false`                  | Shows loading state                     |
| `data-empty-message` | `string`                      | `'No content available'` | Message shown when panel is empty       |

### Properties

```typescript
// State
theme: Theme
active: boolean
disabled: boolean
loading: boolean
emptyMessage: string

// Content management
show(): void
hide(): void
clearContent(): void
setContent(content: string): void
appendContent(content: string): void
prependContent(content: string): void

// Scrolling
scrollToTop(): void
scrollToBottom(): void
scrollToElement(element: Element): void

// Theme
applyTheme(theme: Theme): void
```

### Examples

#### Loading State

```html
<e2-tab-panel slot="panels" loading>
  <!-- Content will be hidden, loading message shown -->
</e2-tab-panel>
```

```javascript
const panel = document.querySelector('e2-tab-panel');

// Show loading
panel.loading = true;

// Load content asynchronously
fetchContent().then(content => {
  panel.setContent(content);
  panel.loading = false;
});
```

#### Custom Empty Message

```html
<e2-tab-panel slot="panels" data-empty-message="No items found">
  <!-- When empty, will show "No items found" -->
</e2-tab-panel>
```

#### Dynamic Content Management

```javascript
const panel = document.querySelector('e2-tab-panel');

// Replace all content
panel.setContent('<p>New content</p>');

// Add content to end
panel.appendContent('<p>Additional content</p>');

// Add content to beginning
panel.prependContent('<h2>Title</h2>');

// Clear all content
panel.clearContent();

// Scroll to top
panel.scrollToTop();
```

## Event Handling

The tab system provides several events for responding to user interactions:

```javascript
const tabContainer = document.querySelector('e2-tab-container');

// Listen for tab selection
tabContainer.addEventListener('tab-select', event => {
  console.log('Selected tab:', event.detail.tabId);
  console.log('Previous tab:', event.detail.previousTabId);
});

// Listen for tab close attempts
tabContainer.addEventListener('tab-close', event => {
  // Prevent closing if unsaved changes
  if (hasUnsavedChanges(event.detail.tabId)) {
    event.preventDefault();

    if (confirm('Discard unsaved changes?')) {
      // Manually remove the tab
      tabContainer.removeTabById(event.detail.tabId);
    }
  }
});

// Listen for container changes
tabContainer.addEventListener('tab-container-change', event => {
  updateUI(event.detail.activeTabId);
});
```

## Styling

The tab components can be styled using CSS custom properties:

```css
e2-tab-container {
  /* Container */
  --tab-container-bg: #ffffff;
  --tab-container-border: #ddd;
  --tab-container-border-radius: 4px;

  /* Tab list */
  --tab-list-bg: #f8f8f8;
  --tab-list-border: #ddd;

  /* Individual tabs */
  --tab-bg: #f8f8f8;
  --tab-bg-hover: #e8e8e8;
  --tab-bg-active: #ffffff;
  --tab-color: #333;
  --tab-color-active: #000;
  --tab-border: #ddd;

  /* Tab panels */
  --tab-panel-bg: #ffffff;
  --tab-panel-color: #333;
  --tab-panel-padding: 16px;

  /* Close buttons */
  --tab-close-color: #666;
  --tab-close-bg-hover: rgba(0, 0, 0, 0.1);

  /* Dark theme variants */
  --tab-container-bg-dark: #1e1e1e;
  --tab-container-border-dark: #555;
  --tab-list-bg-dark: #2d2d2d;
  --tab-list-border-dark: #555;
  --tab-bg-dark: #2d2d2d;
  --tab-bg-hover-dark: #3d3d3d;
  --tab-bg-active-dark: #1e1e1e;
  --tab-color-dark: #ccc;
  --tab-color-active-dark: #fff;
  --tab-panel-bg-dark: #1e1e1e;
  --tab-panel-color-dark: #fff;
  --tab-close-color-dark: #aaa;
  --tab-close-bg-hover-dark: rgba(255, 255, 255, 0.1);
}
```

## Best Practices

### Tab Organization

- Keep tab labels short and descriptive
- Use icons to save space and improve recognition
- Group related functionality in adjacent tabs
- Consider the logical flow of user tasks

### Performance

- Use lazy loading for tab content that isn't immediately needed
- Consider virtual scrolling for tabs with large amounts of content
- Limit the number of simultaneously open tabs

### Accessibility

- Ensure tab labels are descriptive for screen readers
- Use proper semantic HTML within tab panels
- Consider keyboard navigation patterns
- Provide alternative access methods for critical functionality

### User Experience

- Preserve tab state when possible (scroll position, form data)
- Provide clear visual feedback for active tabs
- Consider auto-saving content in closable tabs
- Use consistent tab positioning throughout your application

## Browser Support

The tab components work in all modern browsers that support:

- Custom Elements v1
- Shadow DOM v1
- ES6 Classes
- CSS Custom Properties

For older browsers, consider using polyfills or alternative implementations.
