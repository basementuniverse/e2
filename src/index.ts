/**
 * E2 - A collection of custom HTML elements for building editors
 *
 * This library provides a set of reusable UI components designed specifically
 * for creating level editors, sprite editors, and similar desktop-like web applications.
 */

// Import and register all custom elements
import './elements/panel/collapsible-panel';
import './elements/toolbar/toolbar';
import './elements/toolbar/toolbar-button';
import './elements/toolbar/toolbar-separator';

// Export types and interfaces for TypeScript users
export * from './types';

// Export utility functions if any
export * from './utils';

// Version information
export const VERSION = '1.0.0';

// Auto-registration message for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log(
    `E2 v${VERSION} loaded - Custom elements registered automatically`
  );
}
