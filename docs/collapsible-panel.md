# Collapsible Panel Component

The collapsible panel component provides a space-saving container that can be collapsed to a thin bar or expanded to show its full content. It's ideal for tool panels, property inspectors, and sidebar content in desktop-like applications.

## `<e2-collapsible-panel>`

A panel that can be collapsed to save space while maintaining access to expand it back to full size. Supports both horizontal and vertical orientations.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme mode for the panel |
| `disabled` | boolean | `false` | Disables panel interaction |
| `collapsed` | boolean | `false` | Controls whether the panel is collapsed |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Panel orientation and collapse direction |

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
    <label>Width: <input type="number" value="100"></label>
    <label>Height: <input type="number" value="100"></label>
    <label>Color: <input type="color" value="#ff0000"></label>
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
      <div style="height: 150px; background: #1e1e1e; color: #fff; padding: 10px; font-family: monospace;">
        > Ready<br>
        > Loading assets...<br>
        > Game initialized
      </div>
    </e2-collapsible-panel>
  </div>
</div>
```

### TypeScript API

```typescript
// Access the panel element
const panel = document.querySelector('e2-collapsible-panel') as CollapsiblePanel;

// Control panel state programmatically
panel.collapsed = true;  // Collapse the panel
panel.expand();          // Expand the panel
panel.collapse();        // Collapse the panel
panel.toggle();          // Toggle between collapsed/expanded

// Change orientation
panel.orientation = 'horizontal';

// Set theme
panel.theme = 'dark';

// Listen for toggle events
panel.addEventListener('collapsible-panel-toggle', (event) => {
  const { panelId, collapsed, orientation } = event.detail;
  console.log(`Panel ${panelId} is now ${collapsed ? 'collapsed' : 'expanded'}`);

  // Save panel state to localStorage
  localStorage.setItem(`panel-${panelId}-collapsed`, collapsed.toString());
});
```

### CSS Styling Examples

#### Custom Panel Colors

```css
e2-collapsible-panel {
  --panel-bg: #fafafa;
  --panel-border: #e0e0e0;
  --panel-header-bg: #f5f5f5;
}

e2-collapsible-panel.theme-dark {
  --panel-bg-dark: #1a1a1a;
  --panel-border-dark: #404040;
  --panel-header-bg-dark: #252525;
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
  transition: width 0.3s ease, height 0.3s ease;
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
    <e2-collapsible-panel class="sidebar" orientation="horizontal">
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
      <p>This is the main editing area. The panels around it can be collapsed to save space.</p>

      <div style="width: 400px; height: 300px; background: white; border: 2px solid #ccc; margin: 20px 0;">
        <div style="padding: 20px; text-align: center; color: #666;">
          Canvas Area<br>
          <small>Click tools in the sidebar to select them</small>
        </div>
      </div>
    </div>

    <!-- Right Properties Panel -->
    <e2-collapsible-panel orientation="horizontal" style="width: 280px;">
      <span slot="title">⚙️ Properties</span>
      <div class="properties-grid">
        <label>
          Width:
          <input type="number" value="32" min="1">
        </label>
        <label>
          Height:
          <input type="number" value="32" min="1">
        </label>
        <label>
          X Position:
          <input type="number" value="0">
        </label>
        <label>
          Y Position:
          <input type="number" value="0">
        </label>
        <label>
          Color:
          <input type="color" value="#ff0000">
        </label>
        <label>
          Opacity:
          <input type="range" min="0" max="100" value="100">
        </label>
      </div>
    </e2-collapsible-panel>
  </div>

  <!-- Bottom Console Panel -->
  <e2-collapsible-panel class="bottom-panel" orientation="vertical" collapsed>
    <span slot="title">💻 Console</span>
    <div class="console-output" id="console">
      > Editor initialized<br>
      > Ready for input<br>
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
        btn.style.background = btn.textContent.includes(tool) ? '#e3f2fd' : 'white';
      });
    }

    function log(message) {
      const console = document.getElementById('console');
      console.innerHTML += `> ${message}<br>`;
      console.scrollTop = console.scrollHeight;
    }

    // Listen for panel toggle events
    document.addEventListener('collapsible-panel-toggle', (event) => {
      const { panelId, collapsed } = event.detail;
      log(`Panel ${collapsed ? 'collapsed' : 'expanded'}`);
    });

    // Initialize with some console messages
    setTimeout(() => log('Canvas ready'), 1000);
    setTimeout(() => log('All systems operational'), 2000);
  </script>
</body>
</html>
```
