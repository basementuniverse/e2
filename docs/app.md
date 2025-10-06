# E2 App Element

The `<e2-app>` element is a wrapper component that provides comprehensive CSS styling and theming for E2 applications. It serves as the foundation for editor-like applications by providing consistent typography, form controls, and theme management.

## Features

- **Complete CSS Reset**: Provides a clean foundation for editor applications
- **Comprehensive Form Styling**: All HTML form controls are styled consistently
- **Theme Support**: Light, dark, and auto (system preference) themes
- **CSS Custom Properties**: Extensive customization through CSS variables
- **Typography System**: Consistent heading, paragraph, and text styling
- **Utility Classes**: Common styling utilities for quick customization

## Usage

### Basic Usage

```html
<script src="path/to/e2.min.js"></script>

<e2-app theme="light">
  <e2-toolbar>
    <e2-toolbar-button label="Save" icon="💾"></e2-toolbar-button>
  </e2-toolbar>

  <main>
    <!-- Your editor content here -->
    <input type="text" placeholder="This input is automatically styled" />
    <button>This button is automatically styled</button>
  </main>
</e2-app>
```

### TypeScript Usage

```typescript
import '@basementuniverse/e2';

const app = document.querySelector('e2-app') as any;
app.theme = 'dark';
```

## Attributes

| Attribute | Type                          | Default  | Description                               |
| --------- | ----------------------------- | -------- | ----------------------------------------- |
| `theme`   | `'light' \| 'dark' \| 'auto'` | `'auto'` | Sets the theme for the entire application |

## Properties

| Property | Type    | Description               |
| -------- | ------- | ------------------------- |
| `theme`  | `Theme` | Get/set the current theme |

## Methods

| Method                            | Parameters                        | Description                     |
| --------------------------------- | --------------------------------- | ------------------------------- |
| `applyTheme(theme)`               | `theme: Theme`                    | Apply a specific theme          |
| `setCSSVariable(property, value)` | `property: string, value: string` | Set a custom CSS property       |
| `getCSSVariable(property)`        | `property: string`                | Get a custom CSS property value |

## CSS Custom Properties

The `<e2-app>` element provides extensive CSS custom properties for customization:

### Layout

- `--app-width`: Application width (default: `100%`)
- `--app-height`: Application height (default: `100vh`)
- `--app-padding`: Application padding (default: `0`)
- `--app-margin`: Application margin (default: `0`)

### Typography

- `--font-family`: Base font family
- `--font-size`: Base font size (default: `14px`)
- `--line-height`: Base line height (default: `1.4`)
- `--font-weight`: Base font weight (default: `400`)

### Colors (Light Theme)

- `--bg-primary`: Primary background color
- `--bg-secondary`: Secondary background color
- `--bg-tertiary`: Tertiary background color
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color
- `--text-muted`: Muted text color
- `--border-color`: Default border color
- `--border-color-hover`: Hover border color
- `--accent-color`: Accent/brand color
- `--accent-color-hover`: Accent hover color
- `--success-color`: Success color
- `--warning-color`: Warning color
- `--danger-color`: Danger/error color

### Form Controls

- `--input-bg`: Input background color
- `--input-border`: Input border color
- `--input-border-focus`: Input focus border color
- `--input-text`: Input text color
- `--input-placeholder`: Input placeholder color
- `--input-padding`: Input padding (default: `6px 12px`)
- `--input-border-radius`: Input border radius (default: `4px`)
- `--input-font-size`: Input font size (default: `14px`)

### Buttons

- `--button-bg`: Button background color
- `--button-bg-hover`: Button hover background color
- `--button-border`: Button border color
- `--button-text`: Button text color
- `--button-padding`: Button padding (default: `6px 12px`)
- `--button-border-radius`: Button border radius (default: `4px`)

### Shadows

- `--shadow-sm`: Small shadow
- `--shadow`: Default shadow
- `--shadow-lg`: Large shadow

### Transitions

- `--transition-fast`: Fast transition (default: `0.15s ease-in-out`)
- `--transition-normal`: Normal transition (default: `0.3s ease-in-out`)

## Styled Elements

The `<e2-app>` element automatically styles the following HTML elements:

### Typography

- `h1, h2, h3, h4, h5, h6` - Headings with consistent sizing and spacing
- `p` - Paragraphs with proper margins
- `small` - Small text with muted color
- `strong` - Bold text
- `a` - Links with accent color and hover effects

### Form Controls

- `input[type="text|email|password|number|search|url|tel|date|time|datetime-local"]` - Text inputs
- `textarea` - Multi-line text areas
- `select` - Dropdown selects
- `input[type="checkbox|radio"]` - Checkboxes and radio buttons
- `input[type="range"]` - Range sliders
- `input[type="file"]` - File inputs
- `button, input[type="button|submit|reset"]` - Buttons

### Form Structure

- `label` - Form labels
- `fieldset` - Field groupings
- `legend` - Fieldset legends

## Utility Classes

The `<e2-app>` element provides utility classes for common styling needs:

### Text Colors

- `.text-primary` - Primary text color
- `.text-secondary` - Secondary text color
- `.text-muted` - Muted text color

### Backgrounds

- `.bg-primary` - Primary background
- `.bg-secondary` - Secondary background

### Borders and Effects

- `.border` - Default border
- `.rounded` - Rounded corners
- `.shadow` - Default shadow
- `.shadow-sm` - Small shadow
- `.shadow-lg` - Large shadow

## Customization Examples

### Custom Theme Colors

```javascript
const app = document.querySelector('e2-app');

// Set custom accent color
app.setCSSVariable('accent-color', '#6f42c1');
app.setCSSVariable('accent-color-hover', '#5a2d91');

// Set custom background colors
app.setCSSVariable('bg-primary', '#fafafa');
app.setCSSVariable('bg-secondary', '#f0f0f0');
```

### Custom CSS

```css
e2-app {
  /* Override any CSS custom property */
  --font-family: 'Inter', system-ui, sans-serif;
  --input-border-radius: 8px;
  --button-border-radius: 8px;
}

/* Add custom styles that inherit the theme */
e2-app .my-custom-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 16px;
  border-radius: var(--input-border-radius);
}
```

## Themes

### Light Theme

The default light theme uses bright backgrounds with dark text, suitable for well-lit environments.

### Dark Theme

The dark theme uses dark backgrounds with light text, reducing eye strain in low-light conditions.

### Auto Theme

The auto theme automatically switches between light and dark based on the user's system preference using the `prefers-color-scheme` media query.

## Best Practices

1. **Always wrap your editor application** in `<e2-app>` for consistent styling
2. **Use CSS custom properties** for customization instead of overriding styles
3. **Leverage utility classes** for quick styling adjustments
4. **Test both light and dark themes** to ensure good contrast and readability
5. **Use the provided form styling** by using standard HTML form elements

## Browser Support

The `<e2-app>` element works in all modern browsers that support:

- Custom Elements v1
- CSS Custom Properties
- CSS Grid and Flexbox
- ES6 Classes

## Examples

See the [app demo](../demos/app.html) for a comprehensive example of all features and styling options.
