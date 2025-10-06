# Split Panel

Resizable split panel components that allow you to create adjustable layouts with draggable dividers.

## Components

- `<e2-split-panel-container>` - Container that manages multiple resizable panels
- `<e2-split-panel>` - Individual panel that can be resized

## Basic Usage

### Horizontal Split (Side by Side)

```html
<e2-split-panel-container orientation="horizontal">
  <e2-split-panel size="30">
    <h3>Left Panel</h3>
    <p>This panel takes 30% of the width</p>
  </e2-split-panel>
  <e2-split-panel size="70">
    <h3>Right Panel</h3>
    <p>This panel takes 70% of the width</p>
  </e2-split-panel>
</e2-split-panel-container>
```

### Vertical Split (Stacked)

```html
<e2-split-panel-container orientation="vertical">
  <e2-split-panel size="40">
    <h3>Top Panel</h3>
    <p>This panel takes 40% of the height</p>
  </e2-split-panel>
  <e2-split-panel size="60">
    <h3>Bottom Panel</h3>
    <p>This panel takes 60% of the height</p>
  </e2-split-panel>
</e2-split-panel-container>
```

### Three Panel Layout

```html
<e2-split-panel-container orientation="horizontal">
  <e2-split-panel size="25" min-size="15" max-size="40">
    <h3>Sidebar</h3>
  </e2-split-panel>
  <e2-split-panel size="50" min-size="30">
    <h3>Main Content</h3>
  </e2-split-panel>
  <e2-split-panel size="25" min-size="15" max-size="35">
    <h3>Inspector</h3>
  </e2-split-panel>
</e2-split-panel-container>
```

## Container Attributes

### `<e2-split-panel-container>`

| Attribute     | Type                          | Default        | Description                |
| ------------- | ----------------------------- | -------------- | -------------------------- |
| `orientation` | `'horizontal' \| 'vertical'`  | `'horizontal'` | Layout direction of panels |
| `theme`       | `'light' \| 'dark' \| 'auto'` | `'auto'`       | Visual theme               |
| `disabled`    | `boolean`                     | `false`        | Disables panel resizing    |

## Panel Attributes

### `<e2-split-panel>`

| Attribute   | Type                          | Default  | Description                           |
| ----------- | ----------------------------- | -------- | ------------------------------------- |
| `size`      | `number`                      | `50`     | Panel size as percentage of container |
| `min-size`  | `number`                      | `10`     | Minimum size as percentage            |
| `max-size`  | `number`                      | `90`     | Maximum size as percentage            |
| `resizable` | `boolean`                     | `true`   | Whether panel can be resized          |
| `theme`     | `'light' \| 'dark' \| 'auto'` | `'auto'` | Visual theme                          |
| `disabled`  | `boolean`                     | `false`  | Disables panel interactions           |

## Properties & Methods

### SplitPanelContainer

#### Properties

- `orientation: SplitPanelOrientation` - Get/set layout orientation
- `theme: Theme` - Get/set visual theme
- `disabled: boolean` - Get/set disabled state

#### Methods

- `resizePanel(panelId: string, size: number): void` - Programmatically resize a panel
- `getPanelSizes(): { [panelId: string]: number }` - Get current sizes of all panels
- `resetPanelSizes(): void` - Reset all panels to equal sizes
- `applyTheme(theme: Theme): void` - Apply theme styling

### SplitPanel

#### Properties

- `size: number` - Get/set panel size percentage
- `minSize: number` - Get/set minimum size percentage
- `maxSize: number` - Get/set maximum size percentage
- `resizable: boolean` - Get/set resizable state
- `theme: Theme` - Get/set visual theme
- `disabled: boolean` - Get/set disabled state

#### Methods

- `getCurrentSize(): number` - Get current computed size percentage
- `applyTheme(theme: Theme): void` - Apply theme styling

## Events

All events bubble up from the split panel container:

### `split-panel-resize-start`

Fired when a resize operation begins.

```typescript
interface SplitPanelResizeStartEvent {
  detail: {
    containerId: string;
    container: HTMLElement;
    panelId: string;
    panel: HTMLElement;
    startSize: number;
  };
}
```

### `split-panel-resize`

Fired continuously during resize operations.

```typescript
interface SplitPanelResizeEvent {
  detail: {
    containerId: string;
    container: HTMLElement;
    panelId: string;
    panel: HTMLElement;
    size: number;
    minSize: number;
    maxSize: number;
  };
}
```

### `split-panel-resize-end`

Fired when a resize operation completes.

```typescript
interface SplitPanelResizeEndEvent {
  detail: {
    containerId: string;
    container: HTMLElement;
    panelId: string;
    panel: HTMLElement;
    finalSize: number;
  };
}
```

## Event Handling Examples

```javascript
const container = document.querySelector('e2-split-panel-container');

// Listen for resize start
container.addEventListener('split-panel-resize-start', event => {
  console.log(`Started resizing panel: ${event.detail.panelId}`);
  console.log(`Initial size: ${event.detail.startSize}%`);
});

// Listen for resize updates
container.addEventListener('split-panel-resize', event => {
  console.log(`Panel ${event.detail.panelId} size: ${event.detail.size}%`);
});

// Listen for resize end
container.addEventListener('split-panel-resize-end', event => {
  console.log(`Finished resizing panel: ${event.detail.panelId}`);
  console.log(`Final size: ${event.detail.finalSize}%`);

  // Save panel sizes to localStorage
  const sizes = event.detail.container.getPanelSizes();
  localStorage.setItem('panelSizes', JSON.stringify(sizes));
});
```

## Styling

The split panel components use CSS custom properties for theming:

### Container Variables

```css
e2-split-panel-container {
  --container-bg: #f5f5f5;
  --container-bg-dark: #1e1e1e;
  --handle-size: 4px;
  --handle-bg: #ccc;
  --handle-hover-bg: #999;
  --handle-active-bg: #666;
  --handle-bg-dark: #555;
  --handle-hover-bg-dark: #777;
  --handle-active-bg-dark: #999;
}
```

### Panel Variables

```css
e2-split-panel {
  --panel-bg: #ffffff;
  --panel-bg-dark: #2d2d2d;
  --panel-border: #e0e0e0;
  --panel-border-dark: #555;
  --panel-padding: 8px;
  --text-color-dark: #fff;
}
```

## Advanced Usage

### Nested Split Panels

You can nest split panel containers for complex layouts:

```html
<e2-split-panel-container orientation="horizontal">
  <e2-split-panel size="30">
    <h3>Sidebar</h3>
  </e2-split-panel>
  <e2-split-panel size="70">
    <e2-split-panel-container orientation="vertical">
      <e2-split-panel size="60">
        <h3>Main Content</h3>
      </e2-split-panel>
      <e2-split-panel size="40">
        <h3>Console</h3>
      </e2-split-panel>
    </e2-split-panel-container>
  </e2-split-panel>
</e2-split-panel-container>
```

### Programmatic Control

```javascript
const container = document.querySelector('e2-split-panel-container');

// Resize a specific panel
container.resizePanel('sidebar-panel', 25);

// Get all panel sizes
const sizes = container.getPanelSizes();
console.log(sizes); // { "sidebar-panel": 25, "main-panel": 75 }

// Reset to equal sizes
container.resetPanelSizes();

// Change orientation
container.orientation = 'vertical';

// Apply dark theme
container.theme = 'dark';
```

### Persistence

Save and restore panel sizes:

```javascript
// Save sizes
const container = document.querySelector('e2-split-panel-container');
const sizes = container.getPanelSizes();
localStorage.setItem('splitPanelSizes', JSON.stringify(sizes));

// Restore sizes
window.addEventListener('load', () => {
  const savedSizes = JSON.parse(
    localStorage.getItem('splitPanelSizes') || '{}'
  );
  Object.entries(savedSizes).forEach(([panelId, size]) => {
    container.resizePanel(panelId, size);
  });
});
```

## Browser Compatibility

- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

Requires support for:

- Custom Elements v1
- Shadow DOM v1
- CSS Custom Properties

## Accessibility

The split panel components include:

- Proper cursor indicators (col-resize/row-resize)
- Keyboard navigation support (Tab to focus handles)
- Semantic HTML structure
- ARIA attributes for screen readers

### Keyboard Controls

- **Tab**: Navigate between resize handles
- **Enter/Space**: Start keyboard resize mode
- **Arrow Keys**: Resize panels when in keyboard mode
- **Escape**: Exit keyboard resize mode
