# Collapsible Panel Component

The collapsible panel component provides a space-saving container that can be collapsed to a thin bar or expanded to show its full content. It's ideal for tool panels, property inspectors, and sidebar content in desktop-like applications.

## `<e2-collapsible-panel>`

A panel that can be collapsed to save space while maintaining access to expand it back to full size. Supports both horizontal and vertical orientations.

### Attributes

| Attribute       | Type                          | Default      | Description                                                      |
| --------------- | ----------------------------- | ------------ | ---------------------------------------------------------------- |
| `theme`         | `'light' \| 'dark' \| 'auto'` | `'auto'`     | Theme mode for the panel                                         |
| `disabled`      | boolean                       | `false`      | Disables panel interaction                                       |
| `collapsed`     | boolean                       | `false`      | Controls whether the panel is collapsed                          |
| `orientation`   | `'horizontal' \| 'vertical'`  | `'vertical'` | Panel orientation and collapse direction                         |
| `resize-left`   | boolean                       | `false`      | Enables resizing from the left edge (horizontal panels only)     |
| `resize-right`  | boolean                       | `false`      | Enables resizing from the right edge (horizontal panels only)    |
| `resize-top`    | boolean                       | `false`      | Enables resizing from the top edge (vertical panels only)       |
| `resize-bottom` | boolean                       | `false`      | Enables resizing from the bottom edge (vertical panels only)    |
| `min-width`     | number                        | `100`        | Minimum width constraint for horizontal resizing (px)           |
| `max-width`     | number                        | `800`        | Maximum width constraint for horizontal resizing (px)           |
| `min-height`    | number                        | `100`        | Minimum height constraint for vertical resizing (px)            |
| `max-height`    | number                        | `600`        | Maximum height constraint for vertical resizing (px)            |

### Events

#### `collapsible-panel-toggle`

Fired when the panel is toggled between collapsed and expanded states.

```typescript
interface CollapsiblePanelToggleEvent extends CustomEvent {
  detail: {
    panelId: string;
    panel: HTMLElement;
    collapsed: boolean;
    orientation: 'horizontal' | 'vertical';
  };
}
```

#### `collapsible-panel-resize-start`

Fired when a resize operation begins.

```typescript
interface CollapsiblePanelResizeStartEvent extends CustomEvent {
  detail: {
    panelId: string;
    panel: HTMLElement;
    startWidth: number;
    startHeight: number;
    edge: 'left' | 'right' | 'top' | 'bottom';
  };
}
```

#### `collapsible-panel-resize`

Fired during resize operations (real-time updates).

```typescript
interface CollapsiblePanelResizeEvent extends CustomEvent {
  detail: {
    panelId: string;
    panel: HTMLElement;
    width?: number;
    height?: number;
    edge: 'left' | 'right' | 'top' | 'bottom';
  };
}
```

#### `collapsible-panel-resize-end`

Fired when a resize operation completes.

```typescript
interface CollapsiblePanelResizeEndEvent extends CustomEvent {
  detail: {
    panelId: string;
    panel: HTMLElement;
    finalWidth: number;
    finalHeight: number;
    edge: 'left' | 'right' | 'top' | 'bottom';
  };
}
```

### CSS Custom Properties

```css
:root {
  /* Panel background and borders */
  --panel-bg: #ffffff;
  --panel-border: #ccc;
  --panel-bg-dark: #2d2d2d;
  --panel-border-dark: #555;

  /* Panel header */
  --panel-header-bg: #f8f8f8;
  --panel-header-bg-dark: #3a3a3a;
  --panel-header-hover-bg: #e8e8e8;
  --panel-header-hover-bg-dark: #404040;

  /* Panel content */
  --panel-padding: 12px;

  /* Panel icons */
  --panel-collapsed-icon: "☰";
  --panel-expanded-icon: "✕";

  /* Resize handles */
  --resize-handle-color: #999;
  --resize-handle-color-dark: #666;

  /* Text colors */
  --text-color: #333;
  --text-color-dark: #fff;

  /* Typography */
  --font-family: system-ui, sans-serif;
  --font-size: 14px;
}
```

### Slots

The collapsible panel supports two content slots:

- **Default slot**: Main panel content
- **`title` slot**: Custom title content in the header

### Usage

#### Basic Panel

```html
<e2-collapsible-panel>
  <span slot="title">Properties</span>
  <div>
    <label>Width: <input type="number" value="100" /></label>
    <label>Height: <input type="number" value="100" /></label>
    <label>Color: <input type="color" value="#ff0000" /></label>
  </div>
</e2-collapsible-panel>
```

#### Horizontal Panel

```html
<e2-collapsible-panel orientation="horizontal" collapsed>
  <span slot="title">Tools</span>
  <div style="width: 200px;">
    <button>Brush</button>
    <button>Eraser</button>
    <button>Fill</button>
  </div>
</e2-collapsible-panel>
```

#### Custom Icons

```html
<style>
  .arrow-panel {
    --panel-collapsed-icon: "▶";
    --panel-expanded-icon: "▼";
  }

  .folder-panel {
    --panel-collapsed-icon: "📁";
    --panel-expanded-icon: "📂";
  }
</style>

<!-- Panel with arrow icons -->
<e2-collapsible-panel class="arrow-panel">
  <span slot="title">Arrow Panel</span>
  <div>This panel uses arrow icons for collapse/expand.</div>
</e2-collapsible-panel>

<!-- Panel with folder icons -->
<e2-collapsible-panel class="folder-panel">
  <span slot="title">Files</span>
  <div>This panel uses folder icons to represent open/closed state.</div>
</e2-collapsible-panel>
```

#### Resizable Panels

Panels can be made resizable by enabling specific edges. The resize constraints depend on the panel orientation:

- **Vertical panels**: Can only be resized vertically (top/bottom edges)
- **Horizontal panels**: Can only be resized horizontally (left/right edges)

```html
<!-- Resizable vertical panel -->
<e2-collapsible-panel
  orientation="vertical"
  resize-bottom
  min-height="150"
  max-height="400"
  style="width: 300px; height: 250px;">
  <span slot="title">Resizable Properties Panel</span>
  <div>
    <p>Drag the thick bottom border to resize vertically.</p>
    <p>Size will be remembered when collapsed/expanded.</p>
  </div>
</e2-collapsible-panel>

<!-- Resizable horizontal panel -->
<e2-collapsible-panel
  orientation="horizontal"
  resize-right
  min-width="200"
  max-width="500"
  style="width: 300px; height: 200px;">
  <span slot="title">Resizable Tools Panel</span>
  <div>
    <p>Drag the thick right border to resize horizontally.</p>
  </div>
</e2-collapsible-panel>

<!-- Multi-edge resizable panel -->
<e2-collapsible-panel
  orientation="vertical"
  resize-top
  resize-bottom
  min-height="100"
  max-height="600"
  style="width: 250px; height: 300px;">
  <span slot="title">Multi-Edge Resizable</span>
  <div>
    <p>This panel can be resized from both top and bottom edges.</p>
  </div>
</e2-collapsible-panel>
```

#### Multiple Panels Layout

```html
<div style="display: flex; height: 400px;">
  <!-- Left sidebar -->
  <e2-collapsible-panel orientation="horizontal" style="flex-shrink: 0;">
    <span slot="title">Assets</span>
    <div style="width: 250px; padding: 10px;">
      <h3>Sprites</h3>
      <ul>
        <li>player.png</li>
        <li>enemy.png</li>
        <li>background.png</li>
      </ul>
    </div>
  </e2-collapsible-panel>

  <!-- Main content area -->
  <div style="flex-grow: 1; background: #f0f0f0; padding: 20px;">
    <h2>Main Editor Area</h2>
  </div>

  <!-- Bottom panel -->
  <div style="position: absolute; bottom: 0; left: 0; right: 0;">
    <e2-collapsible-panel orientation="vertical" collapsed>
      <span slot="title">Console</span>
      <div
        style="height: 150px; background: #1e1e1e; color: #fff; padding: 10px; font-family: monospace;"
      >
        > Ready<br />
        > Loading assets...<br />
        > Game initialized
      </div>
    </e2-collapsible-panel>
  </div>
</div>
```

### TypeScript API

```typescript
// Access the panel element
const panel = document.querySelector(
  'e2-collapsible-panel'
) as CollapsiblePanel;

// Control panel state programmatically
panel.collapsed = true; // Collapse the panel
panel.expand(); // Expand the panel
panel.collapse(); // Collapse the panel
panel.toggle(); // Toggle between collapsed/expanded

// Change orientation
panel.orientation = 'horizontal';

// Configure resizing
panel.resizeRight = true; // Enable right edge resizing
panel.resizeBottom = true; // Enable bottom edge resizing
panel.minWidth = 200; // Set minimum width
panel.maxWidth = 600; // Set maximum width
panel.minHeight = 150; // Set minimum height
panel.maxHeight = 400; // Set maximum height

// Set theme
panel.theme = 'dark';

// Listen for toggle events
panel.addEventListener('collapsible-panel-toggle', event => {
  const { panelId, collapsed, orientation } = event.detail;
  console.log(
    `Panel ${panelId} is now ${collapsed ? 'collapsed' : 'expanded'}`
  );

  // Save panel state to localStorage
  localStorage.setItem(`panel-${panelId}-collapsed`, collapsed.toString());
});

// Listen for resize events
panel.addEventListener('collapsible-panel-resize-start', event => {
  const { panelId, startWidth, startHeight, edge } = event.detail;
  console.log(`Started resizing panel ${panelId} on ${edge} edge`);
});

panel.addEventListener('collapsible-panel-resize', event => {
  const { panelId, width, height, edge } = event.detail;
  console.log(`Resizing panel ${panelId}: ${width}x${height}`);
});

panel.addEventListener('collapsible-panel-resize-end', event => {
  const { panelId, finalWidth, finalHeight, edge } = event.detail;
  console.log(`Finished resizing panel ${panelId}: ${finalWidth}x${finalHeight}`);

  // Save final size to localStorage
  localStorage.setItem(`panel-${panelId}-width`, finalWidth.toString());
  localStorage.setItem(`panel-${panelId}-height`, finalHeight.toString());
});
```

### CSS Styling Examples

#### Custom Panel Colors

```css
e2-collapsible-panel {
  --panel-bg: #fafafa;
  --panel-border: #e0e0e0;
  --panel-header-bg: #f5f5f5;
  --resize-handle-color: #bbb;
}

e2-collapsible-panel.theme-dark {
  --panel-bg-dark: #1a1a1a;
  --panel-border-dark: #404040;
  --panel-header-bg-dark: #252525;
  --resize-handle-color-dark: #777;
}
```

#### Custom Panel Icons

You can customize the collapse/expand icons using CSS custom properties:

```css
/* Use arrow icons instead of burger/close */
.arrow-icons {
  --panel-collapsed-icon: "▶";
  --panel-expanded-icon: "▼";
}

/* Use plus/minus icons */
.plus-minus-icons {
  --panel-collapsed-icon: "+";
  --panel-expanded-icon: "−";
}

/* Use chevron icons */
.chevron-icons {
  --panel-collapsed-icon: "›";
  --panel-expanded-icon: "‹";
}

/* Use custom emoji icons */
.emoji-icons {
  --panel-collapsed-icon: "📁";
  --panel-expanded-icon: "📂";
}
```

#### Resize Handle Styling

```css
/* Custom resize handle colors */
.custom-resize-panel {
  --resize-handle-color: #007acc;
  --resize-handle-color-dark: #4fc3f7;
}

/* Make resize handles more prominent */
.prominent-resize {
  --resize-handle-color: #ff6b35;
}

/* Hide resize handles until hover */
.subtle-resize {
  --resize-handle-color: transparent;
}

.subtle-resize:hover {
  --resize-handle-color: #999;
}
```

#### Fixed Width Horizontal Panel

```css
.sidebar-panel {
  width: 300px;
  height: 100vh;
}

.sidebar-panel[collapsed] {
  width: 32px;
}
```

#### Animated Transitions

```css
e2-collapsible-panel {
  transition:
    width 0.3s ease,
    height 0.3s ease;
}
```

## Complete Example

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Collapsible Panel Example</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        margin: 0;
        padding: 0;
        height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .editor-layout {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .sidebar {
        flex-shrink: 0;
        border-right: 1px solid #ccc;
      }

      .main-content {
        flex: 1;
        padding: 20px;
        background: #f9f9f9;
        overflow: auto;
      }

      .bottom-panel {
        border-top: 1px solid #ccc;
      }

      /* Panel content styling */
      .properties-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding: 15px;
      }

      .properties-grid label {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .tool-list {
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .tool-list button {
        padding: 8px 12px;
        border: 1px solid #ccc;
        background: white;
        cursor: pointer;
        border-radius: 4px;
      }

      .tool-list button:hover {
        background: #f0f0f0;
      }

      .console-output {
        height: 120px;
        background: #1e1e1e;
        color: #00ff00;
        padding: 10px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        overflow-y: auto;
      }
    </style>
  </head>
  <body>
    <div class="editor-layout">
      <!-- Left Sidebar -->
      <e2-collapsible-panel
        class="sidebar"
        orientation="horizontal"
        resize-right
        min-width="150"
        max-width="400"
        style="width: 200px;">
        <span slot="title">🔧 Tools</span>
        <div class="tool-list">
          <button onclick="selectTool('brush')">🖌️ Brush</button>
          <button onclick="selectTool('eraser')">🧽 Eraser</button>
          <button onclick="selectTool('fill')">🪣 Fill</button>
          <button onclick="selectTool('select')">⚪ Select</button>
        </div>
      </e2-collapsible-panel>

      <!-- Main Content -->
      <div class="main-content">
        <h1>Level Editor</h1>
        <p>
          This is the main editing area. The panels around it can be collapsed
          to save space.
        </p>

        <div
          style="width: 400px; height: 300px; background: white; border: 2px solid #ccc; margin: 20px 0;"
        >
          <div style="padding: 20px; text-align: center; color: #666;">
            Canvas Area<br />
            <small>Click tools in the sidebar to select them</small>
          </div>
        </div>
      </div>

      <!-- Right Properties Panel -->
      <e2-collapsible-panel
        orientation="horizontal"
        resize-left
        min-width="200"
        max-width="400"
        style="width: 280px;">
        <span slot="title">⚙️ Properties</span>
        <div class="properties-grid">
          <label>
            Width:
            <input type="number" value="32" min="1" />
          </label>
          <label>
            Height:
            <input type="number" value="32" min="1" />
          </label>
          <label>
            X Position:
            <input type="number" value="0" />
          </label>
          <label>
            Y Position:
            <input type="number" value="0" />
          </label>
          <label>
            Color:
            <input type="color" value="#ff0000" />
          </label>
          <label>
            Opacity:
            <input type="range" min="0" max="100" value="100" />
          </label>
        </div>
      </e2-collapsible-panel>
    </div>

    <!-- Bottom Console Panel -->
    <e2-collapsible-panel
      class="bottom-panel"
      orientation="vertical"
      resize-top
      min-height="100"
      max-height="300"
      collapsed
      style="height: 150px;">
      <span slot="title">💻 Console</span>
      <div class="console-output" id="console">
        > Editor initialized<br />
        > Ready for input<br />
      </div>
    </e2-collapsible-panel>

    <script src="../build/e2.min.js"></script>
    <script>
      let selectedTool = 'brush';

      function selectTool(tool) {
        selectedTool = tool;
        log(`Selected tool: ${tool}`);

        // Update UI to show selected tool
        document.querySelectorAll('.tool-list button').forEach(btn => {
          btn.style.background = btn.textContent.includes(tool)
            ? '#e3f2fd'
            : 'white';
        });
      }

      function log(message) {
        const console = document.getElementById('console');
        console.innerHTML += `> ${message}<br>`;
        console.scrollTop = console.scrollHeight;
      }

      // Listen for panel toggle events
      document.addEventListener('collapsible-panel-toggle', event => {
        const { panelId, collapsed } = event.detail;
        log(`Panel ${collapsed ? 'collapsed' : 'expanded'}`);
      });

      // Listen for panel resize events
      document.addEventListener('collapsible-panel-resize-end', event => {
        const { panelId, finalWidth, finalHeight, edge } = event.detail;
        log(`Panel resized: ${finalWidth}x${finalHeight} (${edge} edge)`);
      });

      // Initialize with some console messages
      setTimeout(() => log('Canvas ready'), 1000);
      setTimeout(() => log('All systems operational'), 2000);
    </script>
  </body>
</html>
```
