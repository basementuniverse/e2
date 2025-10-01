# E2 - Project Instructions

## Project Overview

**E2** ("Editor Elements") is a lightweight, portable collection of custom HTML elements (Web Components) designed specifically for building desktop-like web applications such as level editors, sprite editors, and similar development tools. The library prioritizes simplicity, portability, and small bundle size.

## Project Goals & Philosophy

### Primary Goals
- **Purpose-built for editors**: Specifically designed for creating level editors, sprite editors, and similar desktop-like web applications
- **Small and portable**: Minified bundle should be small and usable directly in browsers or with build tools
- **Easy integration**: Works with vanilla HTML/JS, TypeScript, webpack, or any framework
- **Not highly generalized**: Focused on specific use cases rather than being a general-purpose UI library

### Design Principles
- Use Web Components standard (Custom Elements)
- Minimal dependencies (no external runtime dependencies)
- Built-in theming support (light/dark/auto)
- Event-driven architecture with custom events
- CSS custom properties for easy customization
- TypeScript support with complete type definitions

## Architecture & Structure

### Build System
- **Entry point**: `src/index.ts` - imports and registers all components
- **Output**:
  - Development: `build/e2.js`
  - Production: `build/e2.min.js` (minified)
- **Format**: UMD (Universal Module Definition) for maximum compatibility
- **TypeScript**: Full type definitions generated in `build/`

### File Organization
```
src/
├── index.ts              # Main entry point with auto-registration
├── types.ts              # TypeScript interfaces and event types
├── utils.ts              # Utility functions (theming, IDs, events)
└── elements/             # Component implementations
    ├── toolbar/          # Toolbar components
    │   ├── toolbar.ts
    │   ├── toolbar-button.ts
    │   └── toolbar-separator.ts
    ├── menu/            # Menu components (placeholders)
    ├── listview/        # List view components (placeholders)
    ├── treeview/        # Tree view components (placeholders)
    └── panel/           # Panel components (placeholders)
```

### Component Naming Convention
- Custom elements use `editor-` prefix (e.g., `editor-toolbar`, `editor-toolbar-button`)
- TypeScript classes use PascalCase with `Element` suffix (e.g., `ToolbarElement`)
- File names use kebab-case matching the element name

## Current Implementation Status

### ✅ Fully Implemented Components

#### Toolbar System
- **`<editor-toolbar>`**: Container for toolbar items
  - Flexbox layout with gap spacing
  - Theme support (light/dark/auto)
  - CSS custom properties for styling
  - Disabled state support

- **`<editor-toolbar-button>`**: Interactive toolbar button
  - Icon and label support
  - Active/disabled states
  - Click events (`toolbar-button-click`)
  - Hover and active styling
  - Programmatic API (properties and methods)

- **`<editor-toolbar-separator>`**: Visual separator
  - Simple 1px vertical line
  - Theme-aware coloring
  - Consistent spacing

### 🚧 Placeholder Components (Not Yet Implemented)
- Menu system (`<editor-menu>`, `<editor-menu-item>`)
- List view (`<editor-listview>`, `<editor-listview-item>`)
- Tree view (`<editor-treeview>`, `<editor-treeview-item>`)
- Collapsible panels (`<editor-collapsible-panel>`)

## Development Patterns

### Component Implementation Pattern
Each component follows this structure:
1. **Class definition**: Extends `HTMLElement`
2. **Observed attributes**: Static array of attribute names to watch
3. **Shadow DOM**: Use `getShadowRoot()` utility for consistent setup
4. **Styling**: Inline styles with CSS custom properties
5. **Event handling**: Custom events with detailed payloads
6. **Theme support**: Implement theme property and `applyTheme()` method
7. **Registration**: Check if element exists before defining

### Event System
- Use custom events that bubble up
- Include detailed information in `event.detail`
- Follow naming convention: `{component}-{action}` (e.g., `toolbar-button-click`)
- Events should be cancelable when appropriate

### Theming System
- Support three modes: `light`, `dark`, `auto`
- Use `applyTheme()` utility function
- CSS custom properties for all colors and dimensions
- Theme classes: `.theme-light`, `.theme-dark`, `.theme-auto`

### TypeScript Integration
- Define interfaces for all events in `types.ts`
- Export all types from main `index.ts`
- Use proper typing for all properties and methods
- Provide complete type definitions for consumers

## Build Commands

```bash
# Development build (unminified)
npm run build:dev

# Production build (minified)
npm run build

# Watch mode for development
npm run watch

# Development server
npm run serve
```

## Testing & Demo

- **Demo file**: `resources/demo.html` - Shows working examples
- **Test approach**: Manual testing via demo page
- **Browser testing**: Modern browsers with Custom Elements v1 support

## Future Implementation Priorities

1. **Menu System**: Dropdown menus with keyboard navigation
2. **List View**: Selectable list with multi-select support
3. **Tree View**: Expandable tree with lazy loading support
4. **Collapsible Panels**: Accordion-style panels with animation
5. **Enhanced Theming**: More theme options and CSS custom properties
6. **Accessibility**: ARIA attributes and keyboard navigation
7. **Documentation**: Inline JSDoc comments and API documentation

## Key Implementation Notes

### Web Components Best Practices
- Always check if custom element is already defined before registering
- Use Shadow DOM for style encapsulation
- Implement proper lifecycle callbacks
- Handle attribute changes reactively
- Dispatch meaningful custom events

### Bundle Size Considerations
- Avoid external dependencies
- Use tree-shaking friendly exports
- Minimize CSS in components
- Consider lazy loading for complex components

### API Design Principles
- Properties should reflect to attributes where appropriate
- Methods should be intuitive and chainable when possible
- Events should provide all necessary context
- CSS custom properties should have sensible defaults

## Integration Examples

### Direct HTML Usage
```html
<script src="path/to/e2s.min.js"></script>
<editor-toolbar>
  <editor-toolbar-button label="Save" icon="💾"></editor-toolbar-button>
</editor-toolbar>
```

### TypeScript/Webpack Usage
```typescript
import '@basementuniverse/e2';
import type { ToolbarButtonClickEvent } from '@basementuniverse/e2';
```

This instructions file should be referenced when working on this project to maintain consistency with the established patterns and goals.
