/**
 * TreeView Element
 * A hierarchical tree component supporting expand/collapse, selection, and multi-select
 */

import {
  EditorElementProperties,
  Theme,
  TreeViewCollapseEvent,
  TreeViewExpandEvent,
  TreeViewItem,
  TreeViewItemClickEvent,
  TreeViewItemDoubleClickEvent,
  TreeViewSelectionChangeEvent,
} from '../../types';
import {
  applyEffectiveTheme,
  applyTheme,
  dispatchCustomEvent,
  generateId,
  getShadowRoot,
  setupThemeInheritance,
} from '../../utils';

export class TreeView extends HTMLElement implements EditorElementProperties {
  private _theme: Theme = 'auto';
  private _themeCleanup?: () => void;
  private _items: TreeViewItem[] = [];
  private _multiSelect: boolean = false;
  private _selectedItems: Set<string> = new Set();
  private _expandedItems: Set<string> = new Set();

  static get observedAttributes(): string[] {
    return ['theme', 'disabled', 'multi-select'];
  }

  constructor() {
    super();
    this.setupElement();
  }

  private setupElement(): void {
    const shadowRoot = getShadowRoot(this);

    shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid var(--treeview-border, #ccc);
          background: var(--treeview-bg, #fff);
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size, 14px);
          overflow: auto;
          min-height: 100px;
          box-sizing: border-box;
        }

        :host *,
        :host *::before,
        :host *::after {
          box-sizing: border-box;
        }

        :host(.theme-dark) {
          background: var(--treeview-bg-dark, #1e1e1e);
          border-color: var(--treeview-border-dark, #555);
          color: var(--text-color-dark, #fff);
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
        }

        .treeview-container {
          width: 100%;
          height: 100%;
          padding: 2px;
        }

        .tree-item {
          display: block;
          user-select: none;
        }

        .tree-item-content {
          display: flex;
          align-items: center;
          padding: 2px 4px;
          cursor: pointer;
          border-radius: 3px;
          min-height: 22px;
          max-width: 100%;
        }

        .tree-item-content:hover {
          background: var(--treeview-item-hover-bg, #f0f0f0);
        }

        :host(.theme-dark) .tree-item-content:hover {
          background: var(--treeview-item-hover-bg-dark, #2d2d2d);
        }

        .tree-item-content.selected {
          background: var(--treeview-item-selected-bg, #0078d4);
          color: var(--treeview-item-selected-text, #fff);
        }

        :host(.theme-dark) .tree-item-content.selected {
          background: var(--treeview-item-selected-bg-dark, #0078d4);
          color: var(--treeview-item-selected-text-dark, #fff);
        }

        .tree-item-content.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }

        .tree-item-expand {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 4px;
          cursor: pointer;
          font-size: 12px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .tree-item-expand:hover {
          background: var(--treeview-expand-hover-bg, rgba(0, 0, 0, 0.1));
        }

        :host(.theme-dark) .tree-item-expand:hover {
          background: var(--treeview-expand-hover-bg-dark, rgba(255, 255, 255, 0.1));
        }

        .tree-item-expand.has-children::before {
          content: '▶';
          transition: transform 0.2s ease;
        }

        .tree-item-expand.expanded::before {
          transform: rotate(90deg);
        }

        .tree-item-icon {
          width: 16px;
          height: 16px;
          margin-right: 6px;
          flex-shrink: 0;
          font-size: 14px;
          text-align: center;
          line-height: 16px;
        }

        .tree-item-label {
          flex: 1;
          min-width: 0;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }

        .tree-item-children {
          margin-left: 16px;
          border-left: 1px dotted var(--treeview-guide-color, #ccc);
          position: relative;
          max-width: calc(100% - 16px);
        }

        :host(.theme-dark) .tree-item-children {
          border-left-color: var(--treeview-guide-color-dark, #555);
        }

        .tree-item-children.collapsed {
          display: none;
        }

        .tree-item-children::before {
          content: '';
          position: absolute;
          left: -1px;
          top: 0;
          bottom: 0;
          width: 1px;
          background: var(--treeview-guide-color, #ccc);
        }

        :host(.theme-dark) .tree-item-children::before {
          background: var(--treeview-guide-color-dark, #555);
        }

        .empty-message {
          padding: 20px;
          text-align: center;
          color: var(--treeview-empty-text, #666);
          font-style: italic;
        }

        :host(.theme-dark) .empty-message {
          color: var(--treeview-empty-text-dark, #999);
        }
      </style>
      <div class="treeview-container">
        <div class="tree-content"></div>
      </div>
    `;

    this.setupEventListeners();
    this.setupTheme();
  }

  private setupEventListeners(): void {
    const container = this.shadowRoot!.querySelector(
      '.tree-content'
    ) as HTMLElement;

    container.addEventListener('click', e => {
      this.handleClick(e);
    });

    container.addEventListener('dblclick', e => {
      this.handleDoubleClick(e);
    });
  }

  private setupTheme(): void {
    this._themeCleanup = setupThemeInheritance(this, theme => {
      this._theme = theme;
      applyTheme(this, theme);
    });
  }

  private handleClick(e: Event): void {
    const target = e.target as HTMLElement;

    // Handle expand/collapse click
    if (target.classList.contains('tree-item-expand')) {
      e.stopPropagation();
      const itemElement = target.closest('.tree-item') as HTMLElement;
      const itemId = itemElement.dataset.itemId;
      if (itemId) {
        this.toggleExpanded(itemId);
      }
      return;
    }

    // Handle item selection click
    const itemContent = target.closest('.tree-item-content') as HTMLElement;
    if (itemContent) {
      const itemElement = itemContent.closest('.tree-item') as HTMLElement;
      const itemId = itemElement.dataset.itemId;
      if (itemId) {
        const item = this.findItemById(itemId);
        if (item && !item.disabled) {
          this.handleItemClick(itemId, e as MouseEvent);
        }
      }
    }
  }

  private handleDoubleClick(e: Event): void {
    const target = e.target as HTMLElement;
    const itemContent = target.closest('.tree-item-content') as HTMLElement;

    if (itemContent) {
      const itemElement = itemContent.closest('.tree-item') as HTMLElement;
      const itemId = itemElement.dataset.itemId;
      if (itemId) {
        const item = this.findItemById(itemId);
        if (item && !item.disabled) {
          this.dispatchItemDoubleClick(item, itemId);
        }
      }
    }
  }

  private handleItemClick(itemId: string, event: MouseEvent): void {
    const item = this.findItemById(itemId);
    if (!item) return;

    const wasSelected = this._selectedItems.has(itemId);
    const addedItems: TreeViewItem[] = [];
    const removedItems: TreeViewItem[] = [];

    if (this._multiSelect && (event.ctrlKey || event.metaKey)) {
      // Toggle selection with Ctrl/Cmd
      if (wasSelected) {
        this._selectedItems.delete(itemId);
        removedItems.push(item);
      } else {
        this._selectedItems.add(itemId);
        addedItems.push(item);
      }
    } else {
      // Single selection or clear and select
      const previouslySelected = Array.from(this._selectedItems);
      this._selectedItems.clear();

      // Add previously selected items to removed list
      previouslySelected.forEach(id => {
        const prevItem = this.findItemById(id);
        if (prevItem) removedItems.push(prevItem);
      });

      if (!wasSelected || previouslySelected.length > 1) {
        this._selectedItems.add(itemId);
        addedItems.push(item);
      }
    }

    this.updateSelection();

    // Dispatch events
    this.dispatchSelectionChange(addedItems, removedItems);
    this.dispatchItemClick(item, itemId, event);
  }

  private toggleExpanded(itemId: string): void {
    const item = this.findItemById(itemId);
    if (!item || !item.children || item.children.length === 0) return;

    const wasExpanded = this._expandedItems.has(itemId);

    if (wasExpanded) {
      this._expandedItems.delete(itemId);
      this.dispatchCollapseEvent(item, itemId);
    } else {
      this._expandedItems.add(itemId);
      this.dispatchExpandEvent(item, itemId);
    }

    this.render();
  }

  private findItemById(
    id: string,
    items: TreeViewItem[] = this._items
  ): TreeViewItem | null {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = this.findItemById(id, item.children);
        if (found) return found;
      }
    }
    return null;
  }

  private updateSelection(): void {
    const allItems = this.shadowRoot!.querySelectorAll('.tree-item-content');
    allItems.forEach(element => {
      const itemElement = element.closest('.tree-item') as HTMLElement;
      const itemId = itemElement.dataset.itemId;
      if (itemId) {
        element.classList.toggle('selected', this._selectedItems.has(itemId));
      }
    });
  }

  private render(): void {
    const container = this.shadowRoot!.querySelector(
      '.tree-content'
    ) as HTMLElement;

    if (this._items.length === 0) {
      container.innerHTML =
        '<div class="empty-message">No items to display</div>';
      return;
    }

    container.innerHTML = this.renderItems(this._items);
  }

  private renderItems(items: TreeViewItem[], level: number = 0): string {
    return items.map(item => this.renderItem(item, level)).join('');
  }

  private renderItem(item: TreeViewItem, level: number): string {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = this._expandedItems.has(item.id);
    const isSelected = this._selectedItems.has(item.id);
    const isDisabled = item.disabled;

    let html = `
      <div class="tree-item" data-item-id="${item.id}">
        <div class="tree-item-content ${isSelected ? 'selected' : ''} ${
      isDisabled ? 'disabled' : ''
    }">
          <div class="tree-item-expand ${hasChildren ? 'has-children' : ''} ${
      isExpanded ? 'expanded' : ''
    }"></div>
    `;

    if (item.icon) {
      html += `<div class="tree-item-icon">${item.icon}</div>`;
    }

    html += `
          <div class="tree-item-label">${this.escapeHtml(item.label)}</div>
        </div>
    `;

    if (hasChildren) {
      html += `
        <div class="tree-item-children ${isExpanded ? '' : 'collapsed'}">
          ${this.renderItems(item.children!, level + 1)}
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Event dispatchers
  private dispatchExpandEvent(item: TreeViewItem, itemId: string): void {
    dispatchCustomEvent<TreeViewExpandEvent['detail']>(this, 'tree-expand', {
      treeViewId: this.id || generateId(),
      treeView: this,
      item,
      itemId,
    });
  }

  private dispatchCollapseEvent(item: TreeViewItem, itemId: string): void {
    dispatchCustomEvent<TreeViewCollapseEvent['detail']>(
      this,
      'tree-collapse',
      {
        treeViewId: this.id || generateId(),
        treeView: this,
        item,
        itemId,
      }
    );
  }

  private dispatchSelectionChange(
    addedItems: TreeViewItem[],
    removedItems: TreeViewItem[]
  ): void {
    const selectedItems = Array.from(this._selectedItems)
      .map(id => this.findItemById(id)!)
      .filter(Boolean);

    dispatchCustomEvent<TreeViewSelectionChangeEvent['detail']>(
      this,
      'tree-selection-change',
      {
        treeViewId: this.id || generateId(),
        treeView: this,
        selectedItems,
        selectedIds: Array.from(this._selectedItems),
        addedItems,
        removedItems,
      }
    );
  }

  private dispatchItemClick(
    item: TreeViewItem,
    itemId: string,
    event: MouseEvent
  ): void {
    dispatchCustomEvent<TreeViewItemClickEvent['detail']>(
      this,
      'tree-item-click',
      {
        treeViewId: this.id || generateId(),
        treeView: this,
        item,
        itemId,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
      }
    );
  }

  private dispatchItemDoubleClick(item: TreeViewItem, itemId: string): void {
    dispatchCustomEvent<TreeViewItemDoubleClickEvent['detail']>(
      this,
      'tree-item-dblclick',
      {
        treeViewId: this.id || generateId(),
        treeView: this,
        item,
        itemId,
      }
    );
  }

  // Attribute change handler
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'theme':
        this._theme = (newValue as Theme) || 'auto';
        applyEffectiveTheme(this);
        break;
      case 'disabled':
        // Handled via CSS
        break;
      case 'multi-select':
        this._multiSelect = newValue !== null;
        if (!this._multiSelect) {
          // Clear multiple selections if multi-select is disabled
          const selected = Array.from(this._selectedItems);
          if (selected.length > 1) {
            const firstSelected = selected[0];
            this._selectedItems.clear();
            this._selectedItems.add(firstSelected);
            this.updateSelection();
          }
        }
        break;
    }
  }

  // Public API
  get theme(): Theme {
    return this._theme;
  }

  set theme(value: Theme) {
    this.setAttribute('theme', value);
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get multiSelect(): boolean {
    return this._multiSelect;
  }

  set multiSelect(value: boolean) {
    if (value) {
      this.setAttribute('multi-select', '');
    } else {
      this.removeAttribute('multi-select');
    }
  }

  get items(): TreeViewItem[] {
    return [...this._items];
  }

  set items(value: TreeViewItem[]) {
    this._items = value || [];
    this._selectedItems.clear();
    this._expandedItems.clear();

    // Restore expanded and selected states from item data
    this.restoreItemStates(this._items);

    this.render();
  }

  private restoreItemStates(items: TreeViewItem[]): void {
    for (const item of items) {
      if (item.expanded) {
        this._expandedItems.add(item.id);
      }
      if (item.selected) {
        this._selectedItems.add(item.id);
      }
      if (item.children) {
        this.restoreItemStates(item.children);
      }
    }
  }

  get selectedItems(): TreeViewItem[] {
    return Array.from(this._selectedItems)
      .map(id => this.findItemById(id)!)
      .filter(Boolean);
  }

  get selectedIds(): string[] {
    return Array.from(this._selectedItems);
  }

  // Methods
  selectItem(itemId: string): void {
    if (!this._multiSelect) {
      this._selectedItems.clear();
    }
    this._selectedItems.add(itemId);
    this.updateSelection();
  }

  deselectItem(itemId: string): void {
    this._selectedItems.delete(itemId);
    this.updateSelection();
  }

  clearSelection(): void {
    this._selectedItems.clear();
    this.updateSelection();
  }

  expandItem(itemId: string): void {
    const item = this.findItemById(itemId);
    if (item && item.children && item.children.length > 0) {
      this._expandedItems.add(itemId);
      this.render();
    }
  }

  collapseItem(itemId: string): void {
    this._expandedItems.delete(itemId);
    this.render();
  }

  expandAll(): void {
    const addAllIds = (items: TreeViewItem[]) => {
      for (const item of items) {
        if (item.children && item.children.length > 0) {
          this._expandedItems.add(item.id);
          addAllIds(item.children);
        }
      }
    };
    addAllIds(this._items);
    this.render();
  }

  collapseAll(): void {
    this._expandedItems.clear();
    this.render();
  }

  disconnectedCallback(): void {
    if (this._themeCleanup) {
      this._themeCleanup();
    }
  }
}

// Register the custom element
customElements.define('e2-tree-view', TreeView);
