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
