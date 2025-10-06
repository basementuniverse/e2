# Dialog Components

The E2 dialog system provides a set of components built on the native HTML `<dialog>` element, offering modal and non-modal dialogs with consistent theming and a promise-based API.

## Components

- [`<e2-dialog>`](#e2-dialog) - Base dialog component for custom content
- [`<e2-confirm>`](#e2-confirm) - Confirmation dialogs with yes/no options
- [`<e2-alert>`](#e2-alert) - Alert/notification dialogs
- [`<e2-prompt>`](#e2-prompt) - Input dialogs with validation

## Features

- **Native dialog support** - Built on HTML5 `<dialog>` element
- **Promise-based API** - Async/await friendly
- **Theme support** - Light, dark, and auto themes
- **Event system** - Custom events for all interactions
- **Accessibility** - Proper ARIA attributes and keyboard navigation
- **Validation** - Built-in input validation for prompts
- **Customizable** - CSS custom properties for styling

## Common Properties

All dialog components share these common properties:

| Property | Type                          | Default        | Description       |
| -------- | ----------------------------- | -------------- | ----------------- |
| `theme`  | `'light' \| 'dark' \| 'auto'` | `'auto'`       | Theme mode        |
| `id`     | `string`                      | auto-generated | Unique identifier |

## Common Methods

| Method              | Description                 |
| ------------------- | --------------------------- |
| `applyTheme(theme)` | Apply a theme to the dialog |

## e2-dialog

Basic dialog component that wraps the native `<dialog>` element with theming and enhanced functionality.

### Properties

| Property   | Type      | Default | Description                   |
| ---------- | --------- | ------- | ----------------------------- |
| `title`    | `string`  | `''`    | Dialog title                  |
| `modal`    | `boolean` | `false` | Whether dialog is modal       |
| `closable` | `boolean` | `true`  | Whether close button is shown |
| `width`    | `string`  | `auto`  | Dialog width (CSS value)      |
| `height`   | `string`  | `auto`  | Dialog height (CSS value)     |

### Methods

| Method                | Description                             |
| --------------------- | --------------------------------------- |
| `show()`              | Show dialog (non-modal)                 |
| `showModal()`         | Show dialog (modal)                     |
| `close(returnValue?)` | Close dialog with optional return value |

### Events

| Event           | Detail                               | Description                |
| --------------- | ------------------------------------ | -------------------------- |
| `dialog-show`   | `{ dialogId, dialog, modal? }`       | Dialog is shown            |
| `dialog-close`  | `{ dialogId, dialog, returnValue? }` | Dialog is closed           |
| `dialog-cancel` | `{ dialogId, dialog }`               | Dialog cancelled (ESC key) |

### Example

```html
<e2-dialog id="my-dialog" title="Settings" closable width="400px">
  <p>Dialog content goes here.</p>

  <div slot="footer">
    <button onclick="document.getElementById('my-dialog').close()">
      Close
    </button>
  </div>
</e2-dialog>

<script>
  const dialog = document.getElementById('my-dialog');
  dialog.showModal();
</script>
```

## e2-confirm

Confirmation dialog with promise-based API for yes/no decisions.

### Properties

| Property       | Type      | Default           | Description          |
| -------------- | --------- | ----------------- | -------------------- |
| `title`        | `string`  | `'Confirm'`       | Dialog title         |
| `message`      | `string`  | `'Are you sure?'` | Confirmation message |
| `confirm-text` | `string`  | `'OK'`            | Confirm button text  |
| `cancel-text`  | `string`  | `'Cancel'`        | Cancel button text   |
| `danger`       | `boolean` | `false`           | Use danger styling   |

### Methods

| Method   | Returns            | Description                            |
| -------- | ------------------ | -------------------------------------- |
| `show()` | `Promise<boolean>` | Show dialog, returns true if confirmed |

### Events

| Event                    | Detail                                   | Description     |
| ------------------------ | ---------------------------------------- | --------------- |
| `confirm-dialog-show`    | `{ dialogId, dialog }`                   | Dialog is shown |
| `confirm-dialog-confirm` | `{ dialogId, dialog, confirmed: true }`  | User confirmed  |
| `confirm-dialog-cancel`  | `{ dialogId, dialog, confirmed: false }` | User cancelled  |
| `confirm-dialog-close`   | `{ dialogId, dialog, confirmed }`        | Dialog closed   |

### Example

```html
<e2-confirm
  id="delete-confirm"
  title="Delete File"
  message="Are you sure you want to delete this file? This action cannot be undone."
  confirm-text="Delete"
  cancel-text="Cancel"
  danger
>
</e2-confirm>

<script>
  async function deleteFile() {
    const confirm = document.getElementById('delete-confirm');
    const shouldDelete = await confirm.show();

    if (shouldDelete) {
      console.log('File deleted');
    } else {
      console.log('Delete cancelled');
    }
  }

  // Or create dynamically
  async function quickConfirm() {
    const confirm = document.createElement('e2-confirm');
    confirm.title = 'Save Changes?';
    confirm.message = 'You have unsaved changes. Save before closing?';
    confirm.confirmText = 'Save';
    confirm.cancelText = 'Discard';
    document.body.appendChild(confirm);

    const result = await confirm.show();
    document.body.removeChild(confirm);
    return result;
  }
</script>
```

## e2-alert

Alert dialog for displaying messages and notifications.

### Properties

| Property      | Type                                          | Default                       | Description   |
| ------------- | --------------------------------------------- | ----------------------------- | ------------- |
| `title`       | `string`                                      | auto (based on type)          | Dialog title  |
| `message`     | `string`                                      | `'This is an alert message.'` | Alert message |
| `button-text` | `string`                                      | `'OK'`                        | Button text   |
| `type`        | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'`                      | Alert type    |

### Methods

| Method   | Returns         | Description                          |
| -------- | --------------- | ------------------------------------ |
| `show()` | `Promise<void>` | Show dialog, resolves when dismissed |

### Events

| Event                  | Detail                 | Description           |
| ---------------------- | ---------------------- | --------------------- |
| `alert-dialog-show`    | `{ dialogId, dialog }` | Dialog is shown       |
| `alert-dialog-dismiss` | `{ dialogId, dialog }` | User dismissed dialog |
| `alert-dialog-close`   | `{ dialogId, dialog }` | Dialog closed         |

### Example

```html
<e2-alert
  id="error-alert"
  type="error"
  title="Error Occurred"
  message="Something went wrong while processing your request."
  button-text="OK"
>
</e2-alert>

<script>
  async function showError() {
    const alert = document.getElementById('error-alert');
    await alert.show();
    console.log('Error alert dismissed');
  }

  // Different alert types
  async function showSuccess() {
    const alert = document.createElement('e2-alert');
    alert.type = 'success';
    alert.title = 'Success!';
    alert.message = 'Your changes have been saved.';
    alert.buttonText = 'Great!';
    document.body.appendChild(alert);

    await alert.show();
    document.body.removeChild(alert);
  }
</script>
```

## e2-prompt

Input dialog with validation for collecting user input.

### Properties

| Property        | Type      | Default            | Description                   |
| --------------- | --------- | ------------------ | ----------------------------- |
| `title`         | `string`  | `'Input Required'` | Dialog title                  |
| `message`       | `string`  | `''`               | Prompt message                |
| `placeholder`   | `string`  | `''`               | Input placeholder             |
| `default-value` | `string`  | `''`               | Default input value           |
| `confirm-text`  | `string`  | `'OK'`             | Confirm button text           |
| `cancel-text`   | `string`  | `'Cancel'`         | Cancel button text            |
| `required`      | `boolean` | `false`            | Input is required             |
| `multiline`     | `boolean` | `false`            | Use textarea instead of input |
| `pattern`       | `string`  | `''`               | Validation pattern (regex)    |
| `min-length`    | `number`  | `0`                | Minimum input length          |
| `max-length`    | `number`  | `''`               | Maximum input length          |

### Methods

| Method   | Returns                   | Description                                           |
| -------- | ------------------------- | ----------------------------------------------------- |
| `show()` | `Promise<string \| null>` | Show dialog, returns input value or null if cancelled |

### Properties (Runtime)

| Property | Type     | Description         |
| -------- | -------- | ------------------- |
| `value`  | `string` | Current input value |

### Events

| Event                   | Detail                              | Description               |
| ----------------------- | ----------------------------------- | ------------------------- |
| `prompt-dialog-show`    | `{ dialogId, dialog }`              | Dialog is shown           |
| `prompt-dialog-confirm` | `{ dialogId, dialog, value }`       | User confirmed with input |
| `prompt-dialog-cancel`  | `{ dialogId, dialog, value: null }` | User cancelled            |
| `prompt-dialog-close`   | `{ dialogId, dialog, value }`       | Dialog closed             |

### Example

```html
<e2-prompt
  id="name-prompt"
  title="Enter Your Name"
  message="What should we call you?"
  placeholder="Your name here..."
  required
  min-length="2"
  max-length="50"
>
</e2-prompt>

<script>
  async function getName() {
    const prompt = document.getElementById('name-prompt');
    const name = await prompt.show();

    if (name) {
      console.log(`Hello, ${name}!`);
    } else {
      console.log('No name provided');
    }
  }

  // Email validation example
  async function getEmail() {
    const prompt = document.createElement('e2-prompt');
    prompt.title = 'Enter Email';
    prompt.message = 'Please provide your email address:';
    prompt.placeholder = 'user@example.com';
    prompt.required = true;
    prompt.setAttribute(
      'pattern',
      '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'
    );
    document.body.appendChild(prompt);

    const email = await prompt.show();
    document.body.removeChild(prompt);
    return email;
  }

  // Multiline comment example
  async function getComment() {
    const prompt = document.createElement('e2-prompt');
    prompt.title = 'Leave a Comment';
    prompt.message = 'Please share your thoughts:';
    prompt.multiline = true;
    prompt.setAttribute('max-length', '500');
    document.body.appendChild(prompt);

    const comment = await prompt.show();
    document.body.removeChild(prompt);
    return comment;
  }
</script>
```

## Theming

All dialog components support theming through CSS custom properties:

```css
:root {
  /* Dialog container */
  --dialog-bg: #ffffff;
  --dialog-border: #e0e0e0;
  --dialog-shadow: rgba(0, 0, 0, 0.25);
  --dialog-backdrop: rgba(0, 0, 0, 0.5);

  /* Text colors */
  --text-color: #333333;
  --text-secondary: #666666;

  /* Buttons */
  --button-bg: #f8f9fa;
  --button-border: #e0e0e0;
  --button-hover: #e9ecef;
  --confirm-bg: #007bff;
  --danger-bg: #dc3545;

  /* Inputs (prompt dialogs) */
  --input-bg: #ffffff;
  --input-border: #d0d7de;
  --input-border-focus: #0969da;
}
```

### Theme Classes

Apply theme classes to the body or individual dialogs:

```css
.theme-dark {
  --dialog-bg: #2d2d2d;
  --dialog-border: #555555;
  --text-color: #ffffff;
  /* ... other dark theme variables */
}
```

## Best Practices

### 1. Promise-based Usage

Always use await/async with dialog methods:

```javascript
// Good
const result = await confirmDialog.show();
if (result) {
  // Handle confirmation
}

// Avoid
confirmDialog.show().then(result => {
  // This works but async/await is cleaner
});
```

### 2. Cleanup Dynamic Dialogs

Remove dynamically created dialogs from the DOM:

```javascript
const dialog = document.createElement('e2-confirm');
document.body.appendChild(dialog);

const result = await dialog.show();

// Important: Clean up
document.body.removeChild(dialog);
```

### 3. Event Handling

Use events for complex workflows:

```javascript
const dialog = document.getElementById('my-dialog');

dialog.addEventListener('dialog-show', e => {
  console.log('Dialog opened');
});

dialog.addEventListener('dialog-close', e => {
  console.log('Dialog closed with:', e.detail.returnValue);
});
```

### 4. Validation in Prompts

Use built-in validation attributes:

```javascript
const prompt = document.createElement('e2-prompt');
prompt.required = true;
prompt.setAttribute('pattern', '[0-9]+'); // Numbers only
prompt.setAttribute('min-length', '3');
prompt.setAttribute('max-length', '10');
```

### 5. Accessibility

The dialogs handle accessibility automatically, but you can enhance it:

```html
<e2-dialog title="Settings" role="dialog" aria-label="Application Settings">
  <!-- Content -->
</e2-dialog>
```

## Browser Support

Dialog components require browsers that support:

- Custom Elements v1
- Native `<dialog>` element
- CSS Custom Properties
- ES6 Promises

For older browsers, consider using polyfills for `<dialog>` element support.
