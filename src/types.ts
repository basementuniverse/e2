/**
 * Common types and interfaces used across editor elements
 */

// Base interface for custom element events
export interface EditorElementEvent extends CustomEvent {
  target: HTMLElement;
}

// Toolbar related types
export interface ToolbarButtonClickEvent extends EditorElementEvent {
  detail: {
    buttonId: string;
    button: HTMLElement;
  };
}

// Menu related types
export interface MenuItemClickEvent extends EditorElementEvent {
  detail: {
    itemId: string;
    item: HTMLElement;
    value?: any;
  };
}

// List/Tree view related types
export interface ListItemSelectEvent extends EditorElementEvent {
  detail: {
    itemId: string;
    item: HTMLElement;
    selected: boolean;
    value?: any;
  };
}

export interface TreeItemExpandEvent extends EditorElementEvent {
  detail: {
    itemId: string;
    item: HTMLElement;
    expanded: boolean;
  };
}

// Panel related types
export interface PanelToggleEvent extends EditorElementEvent {
  detail: {
    panelId: string;
    panel: HTMLElement;
    collapsed: boolean;
  };
}

export interface CollapsiblePanelToggleEvent extends EditorElementEvent {
  detail: {
    panelId: string;
    panel: HTMLElement;
    collapsed: boolean;
    orientation: 'horizontal' | 'vertical';
  };
}

// Common properties for all editor elements
export interface EditorElementProperties {
  id?: string;
  disabled?: boolean;
  hidden?: boolean;
}

// Theme support
export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeableElement {
  theme: Theme;
  applyTheme(theme: Theme): void;
}
