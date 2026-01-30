# KeyValue Editor Component

The KeyValue Editor provides a form-like interface for editing key-value pairs with comprehensive schema support, validation, and multiple input types. It's designed for creating property panels, configuration editors, and object inspectors in desktop-like applications.

## Components

- [`<e2-keyvalue-editor>`](#e2-keyvalue-editor) - Main key-value editor component

## `<e2-keyvalue-editor>`

A flexible form component that automatically generates appropriate input controls based on data types and JSON Schema definitions. Supports nested objects, validation, and a wide range of input types including HTML5 form controls.

### Attributes

| Attribute  | Type                          | Default  | Description                                           |
| ---------- | ----------------------------- | -------- | ----------------------------------------------------- |
| `theme`    | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme mode for the editor                             |
| `disabled` | boolean                       | `false`  | Disables the entire editor and all its inputs        |
| `readonly` | boolean                       | `false`  | Makes all inputs read-only while maintaining styling  |
| `compact`  | boolean                       | `false`  | Uses tighter spacing for more compact display        |

## Context Menu Integration

The KeyValueEditor component has built-in integration with the E2 context menu system. When you right-click on the KeyValueEditor, it automatically provides information about which field was clicked through the `componentContext` property of the `context-menu-show` event.

### KeyValueEditorContext

When a context menu is triggered from a KeyValueEditor, the `context-menu-show` event will include a `componentContext` property with the following structure:

```typescript
interface KeyValueEditorContext {
  componentType: 'keyvalue-editor';  // Always 'keyvalue-editor'
  componentId: string;               // The ID of the KeyValueEditor element
  component: HTMLElement;            // Reference to the KeyValueEditor element
  key: string | null;                // The field name that was right-clicked, or null if empty area
  value: any;                        // The current value of the field
  path: string[];                    // Path array for nested fields (e.g., ['graphics', 'resolution'])
  fieldType: string | null;          // The type of input field (text, number, checkbox, etc.)
}
```

### Usage Example

```javascript
// Set up a context menu for the KeyValueEditor
const editor = document.querySelector('#config-editor');

// Listen for context menu events
document.addEventListener('context-menu-show', (event) => {
  const { componentContext } = event.detail;

  if (componentContext?.componentType === 'keyvalue-editor') {
    const kvContext = componentContext;

    if (kvContext.key) {
      // Right-clicked on a specific field
      console.log(`Right-clicked on field: ${kvContext.key}`);
      console.log(`Current value: ${JSON.stringify(kvContext.value)}`);
      console.log(`Field type: ${kvContext.fieldType}`);
      console.log(`Field path: [${kvContext.path.join(', ')}]`);

      // Show different context menu options based on the field
      updateContextMenuForField(kvContext);
    } else {
      // Right-clicked on empty area of the editor
      console.log('Right-clicked on empty editor area');
      updateContextMenuForEmptyArea();
    }
  }
});

function updateContextMenuForField(fieldContext) {
  // Enable/disable menu items based on the field type and value
  const copyValueItem = document.querySelector('#copy-value-item');
  const resetFieldItem = document.querySelector('#reset-field-item');
  const deleteFieldItem = document.querySelector('#delete-field-item');

  copyValueItem.disabled = fieldContext.value == null;
  resetFieldItem.disabled = fieldContext.fieldType === 'readonly';
  deleteFieldItem.disabled = fieldContext.path.includes('required');
}
```

### Complete Integration Example

```html
<!-- KeyValueEditor with context menu -->
<e2-keyvalue-editor id="configEditor" header-title="Configuration"></e2-keyvalue-editor>

<e2-context-menu target="#configEditor">
  <e2-context-menu-item id="edit-field" label="Edit Field" value="edit"></e2-context-menu-item>
  <e2-context-menu-item id="copy-key" label="Copy Key" value="copy-key"></e2-context-menu-item>
  <e2-context-menu-item id="copy-value" label="Copy Value" value="copy-value"></e2-context-menu-item>
  <e2-context-menu-separator></e2-context-menu-separator>
  <e2-context-menu-item id="reset-field" label="Reset to Default" value="reset"></e2-context-menu-item>
  <e2-context-menu-item id="delete-field" label="Delete Field" value="delete"></e2-context-menu-item>
  <e2-context-menu-separator></e2-context-menu-separator>
  <e2-context-menu-item id="add-field" label="Add New Field" value="add-field"></e2-context-menu-item>
  <e2-context-menu-item id="field-props" label="Field Properties" value="properties"></e2-context-menu-item>
</e2-context-menu>
```

```javascript
const editor = document.getElementById('configEditor');
let rightClickedField = null;

// Update menu items based on context
document.addEventListener('context-menu-show', (event) => {
  const { componentContext } = event.detail;

  if (componentContext?.componentType === 'keyvalue-editor') {
    const fieldContext = componentContext;
    rightClickedField = fieldContext;

    // Update menu items based on what was clicked
    const editItem = document.getElementById('edit-field');
    const copyKeyItem = document.getElementById('copy-key');
    const copyValueItem = document.getElementById('copy-value');
    const resetItem = document.getElementById('reset-field');
    const deleteItem = document.getElementById('delete-field');
    const addFieldItem = document.getElementById('add-field');
    const propertiesItem = document.getElementById('field-props');

    if (fieldContext.key) {
      // Right-clicked on a field
      editItem.disabled = false;
      copyKeyItem.disabled = false;
      copyValueItem.disabled = fieldContext.value == null;
      resetItem.disabled = false;
      deleteItem.disabled = false;
      propertiesItem.disabled = false;
    } else {
      // Right-clicked on empty area
      editItem.disabled = true;
      copyKeyItem.disabled = true;
      copyValueItem.disabled = true;
      resetItem.disabled = true;
      deleteItem.disabled = true;
      propertiesItem.disabled = true;
    }
  }
});

// Handle menu item clicks
document.addEventListener('context-menu-item-click', (event) => {
  const { value } = event.detail;

  if (!rightClickedField) return;

  switch (value) {
    case 'edit':
      // Focus the field for editing
      focusField(rightClickedField.key);
      break;
    case 'copy-key':
      navigator.clipboard.writeText(rightClickedField.key);
      break;
    case 'copy-value':
      navigator.clipboard.writeText(JSON.stringify(rightClickedField.value));
      break;
    case 'reset':
      resetFieldToDefault(rightClickedField.key);
      break;
    case 'delete':
      deleteField(rightClickedField.key);
      break;
    case 'add-field':
      showAddFieldDialog();
      break;
    case 'properties':
      showFieldProperties(rightClickedField);
      break;
  }
});

function deleteField(fieldKey) {
  const currentValue = editor.value;
  delete currentValue[fieldKey];
  editor.value = { ...currentValue }; // Trigger re-render
}

function resetFieldToDefault(fieldKey) {
  // Reset to schema default if available
  const schema = editor.schema;
  const fieldDefault = schema?.properties?.[fieldKey]?.default;
  if (fieldDefault !== undefined) {
    const currentValue = editor.value;
    currentValue[fieldKey] = fieldDefault;
    editor.value = { ...currentValue };
  }
}
```

### Events

#### `keyvalue-change`

Fired when any value in the editor changes.

```typescript
interface KeyValueChangeEvent extends CustomEvent {
  detail: {
    key: string;
    oldValue: any;
    newValue: any;
    path: string[];
    isValid: boolean;
  };
}
```

#### `keyvalue-validation`

Fired when validation occurs (on value change or explicit validation).

```typescript
interface KeyValueValidationEvent extends CustomEvent {
  detail: {
    isValid: boolean;
    errors: KeyValueValidationError[];
  };
}
```

### CSS Custom Properties

```css
:root {
  --spacing: 12px;
  --border-radius: 6px;
  --error-color: #dc3545;
  --success-color: #198754;
  --warning-color: #ffc107;
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --border-color: #dee2e6;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --font-family: system-ui, sans-serif;
  --font-size: 14px;

  /* Dark theme variants */
  --bg-primary-dark: #1e1e1e;
  --bg-secondary-dark: #252526;
  --bg-tertiary-dark: #2d2d30;
  --border-color-dark: #3e3e42;
  --text-primary-dark: #e6edf3;
  --text-secondary-dark: #cccccc;
  --error-color-dark: #f85149;
  --success-color-dark: #51cf66;
  --warning-color-dark: #ffd43b;
}
```

### Basic Usage

```html
<e2-keyvalue-editor id="editor"></e2-keyvalue-editor>

<script>
  const editor = document.getElementById('editor');

  // Set initial data
  editor.value = {
    name: 'My Project',
    version: '1.0.0',
    enabled: true,
    priority: 5
  };

  // Listen for changes
  editor.addEventListener('keyvalue-change', event => {
    console.log('Changed:', event.detail);
  });
</script>
```

### Schema-Based Usage

```html
<e2-keyvalue-editor id="schema-editor"></e2-keyvalue-editor>

<script>
  const editor = document.getElementById('schema-editor');

  // Define JSON Schema
  const schema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Project Name',
        description: 'The display name for this project',
        minLength: 1,
        maxLength: 50
      },
      priority: {
        type: 'integer',
        title: 'Priority Level',
        minimum: 1,
        maximum: 10,
        description: 'Priority from 1 (low) to 10 (high)'
      },
      color: {
        type: 'string',
        format: 'color',
        title: 'Theme Color',
        description: 'Primary color for the project theme'
      },
      category: {
        type: 'string',
        title: 'Category',
        enum: ['web', 'mobile', 'desktop', 'game'],
        description: 'Project category'
      },
      settings: {
        type: 'object',
        title: 'Settings',
        properties: {
          autoSave: {
            type: 'boolean',
            title: 'Auto Save',
            description: 'Automatically save changes'
          },
          interval: {
            type: 'integer',
            title: 'Save Interval (minutes)',
            minimum: 1,
            maximum: 60
          }
        }
      }
    },
    required: ['name', 'priority']
  };

  // Set schema and initial data
  editor.schema = schema;
  editor.value = {
    name: 'My Project',
    priority: 5,
    color: '#3498db',
    category: 'web',
    settings: {
      autoSave: true,
      interval: 5
    }
  };

  // Validate on change
  editor.addEventListener('keyvalue-validation', event => {
    if (!event.detail.isValid) {
      console.log('Validation errors:', event.detail.errors);
    }
  });
</script>
```

### TypeScript API

```typescript
// Access the editor element
const editor = document.querySelector('e2-keyvalue-editor') as KeyValueEditorElement;

// Properties
editor.theme = 'dark';
editor.disabled = false;
editor.readonly = true;
editor.compact = true;

// Data management
editor.setValue({
  key1: 'value1',
  key2: 123,
  nested: { prop: true }
});

const data = editor.getValue();

// Schema management
editor.setSchema({
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' }
  }
});

// Validation
const result = editor.validate();
console.log('Is valid:', result.isValid);
console.log('Errors:', result.errors);

// Focus specific field
editor.focusField('name');

// Event handling
editor.addEventListener('keyvalue-change', (event: KeyValueChangeEvent) => {
  const { key, oldValue, newValue, path, isValid } = event.detail;
  console.log(`${key} changed from ${oldValue} to ${newValue}`);
});
```

## Supported Input Types

The KeyValue Editor automatically selects appropriate input controls based on data types and schema information:

### Automatic Type Detection

- **Boolean values**: Checkbox
- **Numbers**: Number input (or range slider with min/max constraints)
- **Strings**: Text input (with pattern-based detection for emails, URLs, etc.)
- **Enums**: Dropdown select
- **Objects**: Collapsible nested sections
- **Functions**: Clickable buttons that execute the function

### Schema Format Support

Use the `format` property in your JSON Schema to specify input types:

```javascript
{
  email: { type: 'string', format: 'email' },        // Email input
  website: { type: 'string', format: 'url' },        // URL input
  phone: { type: 'string', format: 'tel' },          // Phone input
  birthday: { type: 'string', format: 'date' },      // Date picker
  meeting: { type: 'string', format: 'time' },       // Time picker
  deadline: { type: 'string', format: 'date-time' }, // DateTime picker
  themeColor: { type: 'string', format: 'color' }    // Color picker
}
```

### Range Sliders

Number inputs automatically become range sliders when min/max constraints are specified:

```javascript
{
  volume: {
    type: 'integer',
    minimum: 0,
    maximum: 100,
    title: 'Volume Level'
  }
}
```

### Long Text Areas

Text inputs automatically become textareas for longer content:

```javascript
{
  description: {
    type: 'string',
    maxLength: 500,
    title: 'Description'
  }
}
```

## Function Buttons

The KeyValue Editor can render function members as clickable buttons. When a field's value is a function, it is automatically displayed as a button that executes the function when clicked.

### Basic Usage

```javascript
const editor = document.querySelector('e2-keyvalue-editor');

editor.value = {
  counter: 0,
  name: 'Widget',
  increment: function() {
    this.counter++;
    return this.counter;
  },
  reset: function() {
    this.counter = 0;
    return 0;
  },
  greet: function() {
    return `Hello from ${this.name}!`;
  }
};
```

### Function Context

Functions are called with the entire value object as their `this` context, allowing them to:
- Access other properties in the object
- Modify other properties (changes will trigger `keyvalue-change` events)
- Return values that can be captured via events

```javascript
const data = {
  volume: 50,
  muted: false,
  increaseVolume: function() {
    if (this.volume < 100) {
      this.volume += 10;
    }
    return this.volume;
  },
  toggleMute: function() {
    this.muted = !this.muted;
    return this.muted;
  }
};
```

### Schema Support

You can provide schema information for function fields to customize their display:

```javascript
editor.schema = {
  type: 'object',
  properties: {
    counter: {
      type: 'number',
      title: 'Counter Value'
    },
    increment: {
      title: 'Increment Counter',
      description: 'Increases the counter by 1'
    },
    reset: {
      title: 'Reset Counter',
      description: 'Resets the counter to 0'
    }
  }
};
```

### Function Call Events

When a function button is clicked, a `keyvalue-function-call` event is dispatched:

```typescript
interface KeyValueFunctionCallEvent extends CustomEvent {
  detail: {
    key: string;      // The function name
    path: string[];   // Path to the function (for nested objects)
    result: any;      // The return value of the function
  };
}
```

```javascript
editor.addEventListener('keyvalue-function-call', event => {
  const { key, result } = event.detail;
  console.log(`Function "${key}" returned:`, result);
});
```

### Complete Example

```html
<e2-keyvalue-editor id="widget-editor"></e2-keyvalue-editor>

<script>
  const editor = document.getElementById('widget-editor');

  // Create an object with both data and function members
  const widget = {
    name: 'Counter Widget',
    count: 0,
    enabled: true,

    // Functions that manipulate the widget state
    increment: function() {
      if (this.enabled) {
        this.count++;
      }
      return this.count;
    },

    decrement: function() {
      if (this.enabled && this.count > 0) {
        this.count--;
      }
      return this.count;
    },

    reset: function() {
      this.count = 0;
      return 'Counter reset';
    },

    toggle: function() {
      this.enabled = !this.enabled;
      return this.enabled ? 'Enabled' : 'Disabled';
    },

    getStatus: function() {
      return `${this.name}: ${this.count} (${this.enabled ? 'enabled' : 'disabled'})`;
    }
  };

  // Set up schema with descriptions
  editor.schema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Widget Name'
      },
      count: {
        type: 'number',
        title: 'Count'
      },
      enabled: {
        type: 'boolean',
        title: 'Enabled'
      },
      increment: {
        title: 'Increment',
        description: 'Increase count by 1'
      },
      decrement: {
        title: 'Decrement',
        description: 'Decrease count by 1'
      },
      reset: {
        title: 'Reset',
        description: 'Reset count to 0'
      },
      toggle: {
        title: 'Toggle Enabled',
        description: 'Toggle the enabled state'
      },
      getStatus: {
        title: 'Get Status',
        description: 'Get current widget status'
      }
    }
  };

  editor.value = widget;

  // Log function calls and their results
  editor.addEventListener('keyvalue-function-call', event => {
    const { key, result } = event.detail;
    console.log(`${key}() called - returned:`, result);
  });

  // Log value changes triggered by functions
  editor.addEventListener('keyvalue-change', event => {
    const { key, newValue } = event.detail;
    console.log(`Property "${key}" changed to:`, newValue);
  });
</script>
```

### Use Cases

Function buttons are particularly useful for:
- **Interactive debugging**: Add helper functions to inspect or manipulate object state
- **Game entity editors**: Add functions like `spawn()`, `destroy()`, `reset()`
- **Configuration panels**: Add functions like `loadDefaults()`, `validate()`, `export()`
- **Property panels**: Add functions like `refresh()`, `recalculate()`, `apply()`

## Validation

The KeyValue Editor uses the [jsonschema](https://www.npmjs.com/package/jsonschema) library for comprehensive validation:

### Built-in Validation Rules

- **Type validation**: Ensures values match expected types
- **Required fields**: Validates presence of required properties
- **String constraints**: minLength, maxLength, pattern matching
- **Number constraints**: minimum, maximum, multipleOf
- **Enum validation**: Ensures values are from allowed set
- **Format validation**: Email, URL, date formats, etc.

### Custom Error Messages

The editor provides user-friendly error messages:

```javascript
// Schema with validation
{
  email: {
    type: 'string',
    format: 'email',
    title: 'Email Address'
  }
}

// Results in user-friendly messages like:
// "Must be a valid email address"
// instead of technical jsonschema errors
```

### Validation Events

```typescript
editor.addEventListener('keyvalue-validation', event => {
  const { isValid, errors } = event.detail;

  if (!isValid) {
    errors.forEach(error => {
      console.log(`Field "${error.key}": ${error.message}`);
    });
  }
});
```

## Nested Objects

The editor supports one level of nesting using collapsible sections:

```javascript
const data = {
  projectName: 'My App',
  database: {
    host: 'localhost',
    port: 5432,
    ssl: true
  },
  api: {
    endpoint: 'https://api.example.com',
    timeout: 30000,
    retries: 3
  }
};

const schema = {
  type: 'object',
  properties: {
    projectName: { type: 'string', title: 'Project Name' },
    database: {
      type: 'object',
      title: 'Database Configuration',
      properties: {
        host: { type: 'string', title: 'Host' },
        port: { type: 'integer', title: 'Port', minimum: 1, maximum: 65535 },
        ssl: { type: 'boolean', title: 'Use SSL' }
      }
    },
    api: {
      type: 'object',
      title: 'API Configuration',
      properties: {
        endpoint: { type: 'string', format: 'url', title: 'Endpoint URL' },
        timeout: { type: 'integer', title: 'Timeout (ms)', minimum: 1000 },
        retries: { type: 'integer', title: 'Retry Attempts', minimum: 0, maximum: 10 }
      }
    }
  }
};
```

## Complete Example

```html
<!DOCTYPE html>
<html>
  <head>
    <title>KeyValue Editor Example</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        margin: 0;
        padding: 20px;
        background: #f5f5f5;
      }

      .editor-container {
        max-width: 600px;
        margin: 0 auto;
      }

      .controls {
        margin-bottom: 20px;
        padding: 15px;
        background: white;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .output {
        margin-top: 20px;
        padding: 15px;
        background: #1e1e1e;
        color: #e6edf3;
        border-radius: 6px;
        font-family: monospace;
        font-size: 12px;
        white-space: pre-wrap;
      }

      e2-keyvalue-editor {
        background: white;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    </style>
  </head>
  <body>
    <div class="editor-container">
      <h1>Application Configuration</h1>

      <div class="controls">
        <label>
          <input type="checkbox" id="readonly-toggle">
          Read-only mode
        </label>

        <label style="margin-left: 20px;">
          <input type="checkbox" id="compact-toggle">
          Compact layout
        </label>

        <select id="theme-select" style="margin-left: 20px;">
          <option value="auto">Auto Theme</option>
          <option value="light">Light Theme</option>
          <option value="dark">Dark Theme</option>
        </select>
      </div>

      <e2-keyvalue-editor id="config-editor" theme="light"></e2-keyvalue-editor>

      <div class="output" id="output">
        Current configuration will appear here...
      </div>
    </div>

    <script src="../build/e2.min.js"></script>
    <script>
      const editor = document.getElementById('config-editor');
      const output = document.getElementById('output');
      const readonlyToggle = document.getElementById('readonly-toggle');
      const compactToggle = document.getElementById('compact-toggle');
      const themeSelect = document.getElementById('theme-select');

      // Application configuration schema
      const configSchema = {
        type: 'object',
        properties: {
          appName: {
            type: 'string',
            title: 'Application Name',
            description: 'The display name of your application',
            minLength: 1,
            maxLength: 50
          },
          version: {
            type: 'string',
            title: 'Version',
            pattern: '^\\d+\\.\\d+\\.\\d+$',
            description: 'Semantic version (e.g., 1.2.3)'
          },
          environment: {
            type: 'string',
            title: 'Environment',
            enum: ['development', 'staging', 'production'],
            description: 'Deployment environment'
          },
          features: {
            type: 'object',
            title: 'Feature Flags',
            properties: {
              analytics: {
                type: 'boolean',
                title: 'Analytics Tracking',
                description: 'Enable user analytics'
              },
              darkMode: {
                type: 'boolean',
                title: 'Dark Mode Support',
                description: 'Enable dark theme option'
              },
              notifications: {
                type: 'boolean',
                title: 'Push Notifications',
                description: 'Enable push notifications'
              }
            }
          },
          ui: {
            type: 'object',
            title: 'UI Configuration',
            properties: {
              primaryColor: {
                type: 'string',
                format: 'color',
                title: 'Primary Color',
                description: 'Main theme color'
              },
              fontSize: {
                type: 'integer',
                title: 'Base Font Size',
                minimum: 12,
                maximum: 24,
                description: 'Base font size in pixels'
              },
              animations: {
                type: 'boolean',
                title: 'Enable Animations',
                description: 'Enable UI transitions and animations'
              }
            }
          },
          contact: {
            type: 'object',
            title: 'Contact Information',
            properties: {
              email: {
                type: 'string',
                format: 'email',
                title: 'Support Email',
                description: 'Contact email for support'
              },
              website: {
                type: 'string',
                format: 'url',
                title: 'Website URL',
                description: 'Official website'
              },
              phone: {
                type: 'string',
                format: 'tel',
                title: 'Phone Number',
                description: 'Support phone number'
              }
            }
          }
        },
        required: ['appName', 'version', 'environment']
      };

      // Initial configuration
      const initialConfig = {
        appName: 'My Awesome App',
        version: '1.0.0',
        environment: 'development',
        features: {
          analytics: true,
          darkMode: true,
          notifications: false
        },
        ui: {
          primaryColor: '#3498db',
          fontSize: 16,
          animations: true
        },
        contact: {
          email: 'support@example.com',
          website: 'https://example.com',
          phone: '+1-555-123-4567'
        }
      };

      // Set up editor
      editor.schema = configSchema;
      editor.value = initialConfig;

      // Update output display
      function updateOutput() {
        const config = editor.getValue();
        const validation = editor.validate();

        output.textContent = JSON.stringify({
          data: config,
          validation: {
            isValid: validation.isValid,
            errors: validation.errors
          }
        }, null, 2);
      }

      // Event listeners
      editor.addEventListener('keyvalue-change', event => {
        console.log('Configuration changed:', event.detail);
        updateOutput();
      });

      editor.addEventListener('keyvalue-validation', event => {
        console.log('Validation result:', event.detail);
        updateOutput();
      });

      // Control handlers
      readonlyToggle.addEventListener('change', e => {
        editor.readonly = e.target.checked;
      });

      compactToggle.addEventListener('change', e => {
        editor.compact = e.target.checked;
      });

      themeSelect.addEventListener('change', e => {
        editor.theme = e.target.value;
      });

      // Initial output
      updateOutput();
    </script>
  </body>
</html>
```

This comprehensive example demonstrates all the key features of the KeyValue Editor component including schema validation, nested objects, various input types, theming, and real-time updates.
