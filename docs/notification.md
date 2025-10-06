# Notification Components

The E2 notification system provides toast-style notifications for displaying temporary messages to users. The system consists of notification elements and containers for managing positioning and lifecycle.

## Components

- [`<e2-notification>`](#e2-notification) - Individual notification/toast element
- [`<e2-notification-container>`](#e2-notification-container) - Container for managing notification positioning

## Features

- **Toast notifications** - Non-blocking messages that appear temporarily
- **Multiple types** - Info, success, warning, and error notifications
- **Auto-dismiss** - Configurable timeout with progress indicator
- **Manual dismissal** - Optional close button for user control
- **Position management** - Flexible positioning with container support
- **Theme support** - Light, dark, and auto themes
- **Event system** - Custom events for all interactions
- **Promise-based API** - Async/await friendly
- **Programmatic creation** - Utility functions for dynamic toasts
- **Animation support** - Smooth show/hide transitions

## Basic Usage

### Declarative Approach

```html
<!-- Define notifications in markup -->
<e2-notification
  id="success-notification"
  type="success"
  title="Success"
  message="Operation completed successfully!"
  timeout="5000"
  dismissible>
</e2-notification>

<!-- Container for positioning -->
<e2-notification-container
  position="top-right"
  max-notifications="5">
</e2-notification-container>

<script>
// Show the notification
async function showSuccess() {
  const notification = document.getElementById('success-notification');
  await notification.show();
}
</script>
```

### Programmatic Approach

```javascript
// Using createToast utility
createToast('success', 'File saved successfully!', {
  title: 'Success',
  timeout: 3000
});

// Using Toast API (more convenient)
Toast.success('Operation completed!');
Toast.error('Something went wrong!', { persistent: true });
Toast.warning('Please check your input');
Toast.info('Welcome to the application!');
```

## e2-notification

Individual notification element that displays toast messages.

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Notification type/style |
| `title` | `string` | `''` | Optional title text |
| `message` | `string` | `'This is a notification message.'` | Main message content |
| `timeout` | `number` | `5000` | Auto-dismiss time in ms (0 = no auto-dismiss) |
| `dismissible` | `boolean` | `true` | Whether user can manually close |
| `persistent` | `boolean` | `false` | Prevents auto-dismiss (overrides timeout) |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme variant |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `show()` | `Promise<void>` | Show notification, resolves when hidden |
| `hide()` | `void` | Hide notification with animation |
| `dismiss()` | `void` | Dismiss notification (hide + remove event) |

### Properties (Runtime)

| Property | Type | Description |
|----------|------|-------------|
| `visible` | `boolean` | Whether notification is currently visible |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `notification-show` | `{ notificationId, notification, type }` | Notification is shown |
| `notification-hide` | `{ notificationId, notification, type }` | Notification is hidden |
| `notification-dismiss` | `{ notificationId, notification, type }` | User dismissed notification |
| `notification-click` | `{ notificationId, notification, type }` | Notification was clicked |

### Example

```html
<!-- Basic notification -->
<e2-notification
  id="my-notification"
  type="warning"
  title="Warning"
  message="Please save your work before continuing."
  timeout="0"
  dismissible>
</e2-notification>

<script>
// Show the notification
document.getElementById('my-notification').show();

// Listen for events
document.addEventListener('notification-dismiss', (e) => {
  console.log('Notification dismissed:', e.detail.notificationId);
});

// Create dynamically
const notification = document.createElement('e2-notification');
notification.type = 'success';
notification.message = 'Dynamic notification!';
notification.timeout = 3000;
document.body.appendChild(notification);
await notification.show();
notification.remove(); // Clean up
</script>
```

## e2-notification-container

Container that manages positioning and lifecycle of notifications.

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `position` | `'top-left' \| 'top-right' \| 'top-center' \| 'bottom-left' \| 'bottom-right' \| 'bottom-center'` | `'top-right'` | Container position |
| `max-notifications` | `number` | `5` | Maximum visible notifications |
| `stack-direction` | `'up' \| 'down'` | `'down'` | How new notifications stack |
| `spacing` | `'small' \| 'medium' \| 'large'` | `'medium'` | Gap between notifications |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme for contained notifications |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `addNotification(notification)` | `void` | Add notification to container |
| `removeNotification(notification)` | `void` | Remove notification from container |
| `clear()` | `void` | Remove all notifications |
| `getNotificationCount()` | `number` | Get count of visible notifications |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `notification-container-update` | `{ containerId, container, position, count }` | Container content changed |

### Example

```html
<!-- Bottom-right container with custom settings -->
<e2-notification-container
  id="toast-container"
  position="bottom-right"
  max-notifications="3"
  stack-direction="up"
  spacing="large">
</e2-notification-container>

<script>
const container = document.getElementById('toast-container');

// Add notification to container
const notification = document.createElement('e2-notification');
notification.type = 'info';
notification.message = 'Added to container';
container.addNotification(notification);
notification.show();

// Listen for container updates
container.addEventListener('notification-container-update', (e) => {
  console.log('Container has', e.detail.count, 'notifications');
});

// Clear all notifications
container.clear();
</script>
```

## Utility Functions

### createToast()

Create and show a toast notification programmatically.

```typescript
function createToast(
  type: 'info' | 'success' | 'warning' | 'error',
  message: string,
  options?: CreateToastOptions
): Promise<void>

interface CreateToastOptions {
  title?: string;
  timeout?: number;
  dismissible?: boolean;
  persistent?: boolean;
  container?: HTMLElement | string;
}
```

**Example:**
```javascript
// Basic toast
createToast('success', 'File saved!');

// With options
createToast('error', 'Connection failed', {
  title: 'Network Error',
  persistent: true,
  container: '#my-container'
});
```

### Toast API

Convenient API for common toast types.

```javascript
// Simple calls
Toast.info('Information message');
Toast.success('Success message');
Toast.warning('Warning message');
Toast.error('Error message');

// With options
Toast.success('Saved successfully!', {
  title: 'Success',
  timeout: 2000
});

Toast.error('Critical error occurred', {
  persistent: true,
  dismissible: false
});
```

## Theming

Notifications support the standard E2 theming system with CSS custom properties.

### Theme Properties

```css
:root {
  /* Background and borders */
  --notification-bg: #ffffff;
  --notification-border: #e0e0e0;
  --notification-shadow: rgba(0, 0, 0, 0.1);

  /* Text colors */
  --notification-text: #333333;
  --notification-title: #1a1a1a;

  /* Icon colors by type */
  --notification-icon-info: #3b82f6;
  --notification-icon-success: #10b981;
  --notification-icon-warning: #f59e0b;
  --notification-icon-error: #ef4444;

  /* Interactive elements */
  --notification-close-hover: #f0f0f0;
  --notification-close-active: #e0e0e0;
}

/* Dark theme automatically applied */
.theme-dark {
  --notification-bg: #374151;
  --notification-border: #4b5563;
  --notification-text: #e5e7eb;
  --notification-title: #f9fafb;
  --notification-close-hover: #4b5563;
  --notification-close-active: #6b7280;
}
```

### Custom Styling

```css
/* Custom notification styles */
e2-notification {
  --notification-bg: #f0f9ff;
  --notification-border: #0ea5e9;
}

/* Type-specific styling */
e2-notification[type="success"] {
  --notification-bg: #f0fdf4;
  --notification-border: #22c55e;
}

/* Container positioning */
e2-notification-container {
  --container-spacing: 20px;
  --notification-gap: 12px;
}
```

## Advanced Usage

### Error Handling with Notifications

```javascript
async function saveData() {
  try {
    await api.save(data);
    Toast.success('Data saved successfully!');
  } catch (error) {
    Toast.error(`Failed to save: ${error.message}`, {
      persistent: true,
      title: 'Save Error'
    });
  }
}
```

### Progress Notifications

```javascript
function showProgress() {
  const notification = document.createElement('e2-notification');
  notification.type = 'info';
  notification.title = 'Processing...';
  notification.message = 'Please wait while we process your request.';
  notification.timeout = 10000; // Shows progress bar
  notification.dismissible = false;

  document.querySelector('e2-notification-container').appendChild(notification);
  return notification.show();
}
```

### Multiple Containers

```html
<!-- Different containers for different areas -->
<e2-notification-container
  id="main-notifications"
  position="top-right">
</e2-notification-container>

<e2-notification-container
  id="status-notifications"
  position="bottom-center"
  max-notifications="1">
</e2-notification-container>

<script>
// Route to specific containers
createToast('info', 'General message', {
  container: '#main-notifications'
});

createToast('success', 'Status update', {
  container: '#status-notifications'
});
</script>
```

### Event-Driven Workflows

```javascript
// Complex notification workflow
document.addEventListener('notification-click', async (e) => {
  if (e.detail.type === 'error') {
    // Show error details on click
    const details = await getErrorDetails(e.detail.notificationId);
    Toast.info(details, { title: 'Error Details' });
  }
});

document.addEventListener('notification-dismiss', (e) => {
  // Log dismissal for analytics
  analytics.track('notification_dismissed', {
    type: e.detail.type,
    id: e.detail.notificationId
  });
});
```

## Best Practices

### 1. Appropriate Timing

```javascript
// Good: Reasonable timeouts
Toast.success('Saved!', { timeout: 3000 });
Toast.info('Processing...', { timeout: 5000 });

// Good: Persistent for critical errors
Toast.error('Connection lost', { persistent: true });

// Avoid: Too short for reading
Toast.warning('Important message', { timeout: 1000 }); // Too fast
```

### 2. Message Clarity

```javascript
// Good: Clear, actionable messages
Toast.success('Document saved successfully');
Toast.error('Unable to connect to server. Check your internet connection.');

// Avoid: Vague messages
Toast.error('Error occurred'); // Not helpful
```

### 3. Container Management

```javascript
// Good: Use containers for positioning
const container = document.querySelector('e2-notification-container');
if (!container) {
  // Create container if none exists
  const newContainer = document.createElement('e2-notification-container');
  newContainer.position = 'top-right';
  document.body.appendChild(newContainer);
}

// Good: Limit notification count
container.maxNotifications = 5;
```

### 4. Cleanup

```javascript
// Good: Clean up dynamic notifications
const notification = document.createElement('e2-notification');
// ... configure notification
await notification.show();
notification.remove(); // Clean up DOM

// Good: Use utility functions (auto-cleanup)
Toast.success('Message'); // Automatically cleaned up
```

## Accessibility

The notification system includes built-in accessibility features:

- **ARIA labels** on close buttons
- **Keyboard navigation** support
- **Screen reader** compatible
- **High contrast** theme support
- **Reduced motion** respects user preferences

### Custom Accessibility

```html
<!-- Enhanced accessibility -->
<e2-notification
  type="error"
  title="Validation Error"
  message="Please correct the highlighted fields."
  role="alert"
  aria-live="assertive">
</e2-notification>
```

## Browser Support

- **Modern browsers** with Custom Elements v1 support
- **Chrome/Edge** 67+
- **Firefox** 63+
- **Safari** 10.1+

## Migration Guide

If upgrading from other notification systems:

```javascript
// From other libraries to E2
// Old way
showNotification('success', 'Message');

// New E2 way
Toast.success('Message');

// Old way with config
showNotification('error', 'Message', { duration: 5000 });

// New E2 way
Toast.error('Message', { timeout: 5000 });
```
