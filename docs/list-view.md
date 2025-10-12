# List View Component

The List View component (`<e2-list-view>`) is a versatile list control that supports multiple view modes and selection management, designed for building desktop-like web applications such as level editors and file browsers.

## Features

- **Multiple View Modes**: List, Details, and Icons views
- **Selection Management**: Single or multi-select with keyboard modifiers
- **Flexible Data Binding**: Support for simple items or complex objects with custom columns
- **Event System**: Rich events for item interactions and selection changes
- **Theming**: Full support for light/dark/auto themes
- **Keyboard Navigation**: Standard selection patterns with Ctrl/Shift modifiers

## Basic Usage

### Simple List View

```html
<e2-list-view id="file-list" view-mode="list"></e2-list-view>

<script>
const listView = document.getElementById('file-list');

// Set items
listView.items = [
  { id: '1', label: 'Document.txt', icon: '📄' },
  { id: '2', label: 'Image.png', icon: '🖼️' },
  { id: '3', label: 'Audio.mp3', icon: '🔊' }
];

// Listen for selection changes
listView.addEventListener('listview-selection-change', (event) => {
  console.log('Selected items:', event.detail.selectedItems);
});
</script>
```

### Details View with Columns

```html
<e2-list-view id="file-details" view-mode="details" multi-select></e2-list-view>

<script>
const detailsView = document.getElementById('file-details');

// Define columns
detailsView.columns = [
  { id: 'label', label: 'Name', width: '40%' },
  { id: 'type', label: 'Type', width: '20%' },
  { id: 'size', label: 'Size', width: '20%' },
  { id: 'modified', label: 'Modified', width: '20%' }
];

// Set items with data
detailsView.items = [
  {
    id: '1',
    label: 'level1.json',
    icon: '📄',
    data: {
      type: 'Level',
      size: '2.4 KB',
      modified: '2024-01-15'
    }
  },
  // ... more items
];
</script>
```

### Icons View

```html
<e2-list-view id="icon-view" view-mode="icons" multi-select></e2-list-view>

<script>
const iconView = document.getElementById('icon-view');

iconView.items = [
  { id: '1', label: 'Sprite Editor', icon: '🎮' },
  { id: '2', label: 'Level Designer', icon: '🏗️' },
  { id: '3', label: 'Asset Manager', icon: '📁' }
];
</script>
```

## Properties

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `view-mode` | `'list' \| 'details' \| 'icons'` | `'list'` | Display mode for the list |
| `multi-select` | `boolean` | `false` | Enable multi-selection |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color theme |
| `disabled` | `boolean` | `false` | Disable interaction |

### JavaScript Properties

| Property | Type | Description |
|----------|------|-------------|
| `items` | `ListViewItem[]` | Array of items to display |
| `columns` | `ListViewColumn[]` | Column definitions for details view |
| `selectedItems` | `ListViewItem[]` | Currently selected items (read-only) |
| `selectedIds` | `string[]` | IDs of selected items (read-only) |

## Data Types

### ListViewItem

```typescript
interface ListViewItem {
  id: string;           // Unique identifier
  label: string;        // Display label
  icon?: string;        // Optional icon (emoji or text)
  data?: Record<string, any>; // Custom data for columns
  selected?: boolean;   // Initial selection state
  disabled?: boolean;   // Disable interaction
}
```

### ListViewColumn

```typescript
interface ListViewColumn {
  id: string;           // Data property to display
  label: string;        // Column header text
  width?: string | number; // Column width (CSS or pixels)
  sortable?: boolean;   // Enable column sorting (future)
  renderer?: (item: ListViewItem, value: any) => string; // Custom renderer
}
```

## Methods

### Selection Management

```javascript
// Select items
listView.selectItem('item-1');
listView.selectAll();
listView.setSelectedItems(['item-1', 'item-3']);

// Deselect items
listView.deselectItem('item-1');
listView.deselectAll();
listView.toggleItemSelection('item-1');
```

### Item Management

```javascript
// Add/remove items
listView.addItem({ id: 'new-item', label: 'New File' });
listView.removeItem('item-1');

// Update items
listView.updateItem('item-1', { label: 'Updated Label' });

// Get items
const item = listView.getItem('item-1');

// Refresh display
listView.refresh();
```

### Navigation

```javascript
// Scroll to specific item
listView.scrollToItem('item-5');
```

## Context Menu Integration

The ListView component has built-in integration with the E2 context menu system. When you right-click on the ListView, it automatically provides information about which list item was clicked (if any) through the `componentContext` property of the `context-menu-show` event.

### ListViewContext

When a context menu is triggered from a ListView, the `context-menu-show` event will include a `componentContext` property with the following structure:

```typescript
interface ListViewContext {
  componentType: 'list-view';         // Always 'list-view' for ListView components
  componentId: string;                // The ID of the ListView element
  component: HTMLElement;             // Reference to the ListView element
  item: ListViewItem | null;          // The clicked list item, or null if clicked on empty area
  itemId: string | null;              // The ID of the clicked item, or null if clicked on empty area
}
```

### Usage Example

```javascript
// Set up a context menu for the list view
const listView = document.querySelector('#myListView');

// Listen for context menu events
document.addEventListener('context-menu-show', (event) => {
  const { componentContext } = event.detail;

  if (componentContext?.componentType === 'list-view') {
    const listContext = componentContext;

    if (listContext.item) {
      // Right-clicked on a specific list item
      console.log(`Right-clicked on: ${listContext.item.label}`);
      console.log('Item data:', listContext.item.data);

      // You can access all properties of the clicked ListViewItem
      const hasIcon = listContext.item.icon;
      const isDisabled = listContext.item.disabled;

      // Show different context menu options based on the item
      updateContextMenuForItem(listContext.item);
    } else {
      // Right-clicked on empty area of the list view
      console.log('Right-clicked on empty list area');
      updateContextMenuForEmptyArea();
    }
  }
});

function updateContextMenuForItem(item) {
  // Enable/disable menu items based on the clicked list item
  const openItem = document.querySelector('#open-menu-item');
  const editItem = document.querySelector('#edit-menu-item');
  const deleteItem = document.querySelector('#delete-menu-item');

  openItem.disabled = false;
  editItem.disabled = item.disabled;
  deleteItem.disabled = item.disabled;
}
```

### Complete Integration Example

```html
<!-- ListView with context menu -->
<e2-list-view id="fileList" view-mode="details" multi-select></e2-list-view>

<e2-context-menu target="#fileList">
  <e2-context-menu-item id="open-item" label="Open" value="open"></e2-context-menu-item>
  <e2-context-menu-item id="edit-item" label="Edit" value="edit"></e2-context-menu-item>
  <e2-context-menu-separator></e2-context-menu-separator>
  <e2-context-menu-item id="copy-item" label="Copy" value="copy"></e2-context-menu-item>
  <e2-context-menu-item id="cut-item" label="Cut" value="cut"></e2-context-menu-item>
  <e2-context-menu-item id="paste-item" label="Paste" value="paste"></e2-context-menu-item>
  <e2-context-menu-separator></e2-context-menu-separator>
  <e2-context-menu-item id="rename-item" label="Rename" value="rename"></e2-context-menu-item>
  <e2-context-menu-item id="delete-item" label="Delete" value="delete"></e2-context-menu-item>
  <e2-context-menu-separator></e2-context-menu-separator>
  <e2-context-menu-item id="properties-item" label="Properties" value="properties"></e2-context-menu-item>
</e2-context-menu>
```

```javascript
const listView = document.getElementById('fileList');
let rightClickedItem = null;

// Sample data
listView.items = [
  { id: 'doc1', label: 'Document.pdf', icon: '📄', data: { type: 'PDF', size: '2.3 MB' } },
  { id: 'img1', label: 'Photo.jpg', icon: '🖼️', data: { type: 'Image', size: '1.2 MB' } },
  { id: 'vid1', label: 'Video.mp4', icon: '🎥', data: { type: 'Video', size: '45 MB' } }
];

// Columns for details view
listView.columns = [
  { id: 'label', label: 'Name', width: '40%' },
  { id: 'type', label: 'Type', width: '30%' },
  { id: 'size', label: 'Size', width: '30%' }
];

// Update menu items based on context
document.addEventListener('context-menu-show', (event) => {
  const { componentContext } = event.detail;

  if (componentContext?.componentType === 'list-view') {
    const listContext = componentContext;
    rightClickedItem = listContext.item;

    // Update menu items based on what was clicked
    const openItem = document.getElementById('open-item');
    const editItem = document.getElementById('edit-item');
    const copyItem = document.getElementById('copy-item');
    const cutItem = document.getElementById('cut-item');
    const renameItem = document.getElementById('rename-item');
    const deleteItem = document.getElementById('delete-item');
    const propertiesItem = document.getElementById('properties-item');

    if (rightClickedItem) {
      // Right-clicked on an item
      openItem.disabled = false;
      editItem.disabled = rightClickedItem.disabled;
      copyItem.disabled = false;
      cutItem.disabled = rightClickedItem.disabled;
      renameItem.disabled = rightClickedItem.disabled;
      deleteItem.disabled = rightClickedItem.disabled;
      propertiesItem.disabled = false;
    } else {
      // Right-clicked on empty area
      openItem.disabled = true;
      editItem.disabled = true;
      copyItem.disabled = true;
      cutItem.disabled = true;
      renameItem.disabled = true;
      deleteItem.disabled = true;
      propertiesItem.disabled = true;
    }
  }
});

// Handle menu item clicks
document.addEventListener('context-menu-item-click', (event) => {
  const { value } = event.detail;

  switch (value) {
    case 'open':
      if (rightClickedItem) {
        console.log(`Opening: ${rightClickedItem.label}`);
      }
      break;
    case 'edit':
      if (rightClickedItem) {
        console.log(`Editing: ${rightClickedItem.label}`);
      }
      break;
    case 'copy':
      if (rightClickedItem) {
        console.log(`Copying: ${rightClickedItem.label}`);
      }
      break;
    case 'delete':
      if (rightClickedItem) {
        console.log(`Deleting: ${rightClickedItem.label}`);
        listView.removeItem(rightClickedItem.id);
      }
      break;
    case 'properties':
      if (rightClickedItem) {
        console.log(`Properties for: ${rightClickedItem.label}`, rightClickedItem.data);
      }
      break;
  }
});
```

## Events

### Selection Events

```javascript
// Selection changed
listView.addEventListener('listview-selection-change', (event) => {
  const { selectedItems, addedItems, removedItems } = event.detail;
  console.log('Selection changed:', {
    selected: selectedItems.length,
    added: addedItems.length,
    removed: removedItems.length
  });
});
```

### Item Interaction Events

```javascript
// Item clicked
listView.addEventListener('listview-item-click', (event) => {
  const { item, ctrlKey, shiftKey, altKey } = event.detail;
  console.log('Item clicked:', item.label, {
    ctrl: ctrlKey,
    shift: shiftKey,
    alt: altKey
  });
});

// Item double-clicked
listView.addEventListener('listview-item-double-click', (event) => {
  const { item } = event.detail;
  console.log('Item double-clicked:', item.label);
  // Typically used to open/edit the item
});
```

## Styling

The ListView component uses CSS custom properties for theming:

```css
e2-list-view {
  --listview-bg: #fff;
  --listview-border: #ccc;
  --listview-header-bg: #f5f5f5;
  --listview-item-hover-bg: #f0f0f0;
  --listview-item-selected-bg: #0078d4;
  --listview-item-selected-text: #fff;
}

/* Dark theme variants */
e2-list-view.theme-dark {
  --listview-bg-dark: #1e1e1e;
  --listview-border-dark: #555;
  --listview-header-bg-dark: #2d2d2d;
  --listview-item-hover-bg-dark: #2d2d2d;
  --listview-item-selected-bg-dark: #0078d4;
  --listview-item-selected-text-dark: #fff;
}
```

## View Modes

### List View
- Displays items in a simple vertical list
- Shows icon (if provided) and label
- Compact layout suitable for large numbers of items

### Details View
- Table-like layout with columns
- Requires `columns` property to be set
- Shows additional data from `item.data` properties
- Sortable columns (future enhancement)

### Icons View
- Grid layout with large icons
- Items arranged in a flexible grid
- Suitable for visual browsing of items
- Icons displayed at larger size (32px)

## Selection Behavior

### Single Selection (default)
- Click an item to select it
- Previous selection is cleared
- Only one item can be selected at a time

### Multi-Selection (`multi-select` attribute)
- Click to select/deselect items
- Ctrl+Click to toggle individual items
- Shift+Click to select ranges
- Standard desktop selection behavior

## Best Practices

1. **Performance**: For large datasets (>1000 items), consider implementing virtual scrolling
2. **Accessibility**: Items are keyboard navigable and screen reader friendly
3. **Icons**: Use consistent icon sizing and style across items
4. **Columns**: In details view, provide meaningful column widths
5. **Events**: Handle double-click events for primary actions (open, edit)

## Examples

See the [ListView demo](list-view.html) for complete working examples of all features and view modes.
