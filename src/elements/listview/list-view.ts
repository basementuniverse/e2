/**
 * ListView Element
 * A versatile list component supporting multiple view modes (list, details, icons)
 * with selection management and multi-select capabilities
 */

import {
  EditorElementProperties,
  ListViewColumn,
  ListViewItem,
  ListViewItemClickEvent,
  ListViewItemDoubleClickEvent,
  ListViewMode,
  ListViewSelectionChangeEvent,
  Theme,
} from '../../types';
import {
  applyEffectiveTheme,
  applyTheme,
  dispatchCustomEvent,
  generateId,
  getShadowRoot,
  setupThemeInheritance,
} from '../../utils';

export class ListView extends HTMLElement implements EditorElementProperties {
  private _theme: Theme = 'auto';
  private _themeCleanup?: () => void;
  private _items: ListViewItem[] = [];
  private _columns: ListViewColumn[] = [];
  private _viewMode: ListViewMode = 'list';
  private _multiSelect: boolean = false;
  private _selectedItems: Set<string> = new Set();
  private _lastSelectedIndex: number = -1;

  static get observedAttributes(): string[] {
    return ['theme', 'disabled', 'view-mode', 'multi-select'];
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
          border: 1px solid var(--listview-border, #ccc);
          background: var(--listview-bg, #fff);
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size, 14px);
          overflow: hidden;
          min-height: 100px;
          container-type: style;
          --header-visible: yes;
        }

        :host(.theme-dark) {
          background: var(--listview-bg-dark, #1e1e1e);
          border-color: var(--listview-border-dark, #555);
          color: var(--text-color-dark, #fff);
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
        }

        .listview-container {
          width: 100%;
          height: 100%;
        }

        .listview-header {
          display: none;
          font-weight: bold;
          padding: 0;
          flex-shrink: 0;
        }

        /* Show header when in details mode and header is visible */
        @container style(--header-visible: yes) {
          :host([view-mode="details"]) .listview-header {
            display: block;
          }
        }

        /* Hide header when explicitly set to no */
        @container style(--header-visible: no) {
          .listview-header {
            display: none !important;
          }
        }

        .listview-header-row {
          display: flex;
          align-items: center;
        }

        .listview-header-cell {
          padding: 8px 12px;
          background: var(--listview-header-bg, #f5f5f5);
          border-bottom: 1px solid var(--listview-border, #ccc);
          border-right: 1px solid var(--listview-border, #ccc);
          flex: 1;
          min-width: 0;
          cursor: pointer;
          user-select: none;
        }

        :host(.theme-dark) .listview-header-cell {
          background: var(--listview-header-bg-dark, #2d2d2d);
          border-bottom-color: var(--listview-border-dark, #555);
          border-right-color: var(--listview-border-dark, #555);
        }

        .listview-header-cell:hover {
          background: var(--listview-header-hover-bg, #e5e5e5);
        }

        :host(.theme-dark) .listview-header-cell:hover {
          background: var(--listview-header-hover-bg-dark, #3d3d3d);
        }

        .listview-header-cell:last-child {
          border-right: none;
        }

        .listview-content {
          overflow: auto;
          flex: 1;
        }

        .listview-item {
          padding: 4px 8px;
          cursor: pointer;
          user-select: none;
          border-bottom: 1px solid transparent;
          display: flex;
          align-items: center;
          min-height: 24px;
        }

        :host(:not([view-mode="details"])) .listview-item:hover {
          background: var(--listview-item-hover-bg, #f0f0f0);
        }
        :host([view-mode="details"]) .listview-item:hover .listview-item-cell {
          background: var(--listview-item-hover-bg, #f0f0f0);
        }

        :host(.theme-dark:not([view-mode="details"])) .listview-item:hover {
          background: var(--listview-item-hover-bg-dark, #2d2d2d);
        }
        :host(.theme-dark[view-mode="details"]) .listview-item:hover .listview-item-cell {
          background: var(--listview-item-hover-bg-dark, #2d2d2d);
        }

        :host(:not([view-mode="details"])) .listview-item.selected {
          background: var(--listview-item-selected-bg, #0078d4);
          color: var(--listview-item-selected-text, #fff);
        }
        :host([view-mode="details"]) .listview-item.selected .listview-item-cell {
          background: var(--listview-item-selected-bg, #0078d4);
          color: var(--listview-item-selected-text, #fff);
        }

        :host(.theme-dark:not([view-mode="details"])) .listview-item.selected {
          background: var(--listview-item-selected-bg-dark, #0078d4);
          color: var(--listview-item-selected-text-dark, #fff);
        }
        :host(.theme-dark[view-mode="details"]) .listview-item.selected .listview-item-cell {
          background: var(--listview-item-selected-bg-dark, #0078d4);
          color: var(--listview-item-selected-text-dark, #fff);
        }

        .listview-item.disabled {
          opacity: 0.6;
          cursor: default;
          pointer-events: none;
        }

        .listview-item-icon {
          margin-right: 8px;
          flex-shrink: 0;
          font-size: 16px;
          width: 16px;
          text-align: center;
        }

        .listview-item-label {
          flex: 1;
          min-width: 0;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .listview-item-cell {
          flex: 1;
          min-width: 0;
          padding: 0 4px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Details view specific styles */
        :host([view-mode="details"]) .listview-container {
          display: flex;
          flex-direction: column;
        }

        :host([view-mode="details"]) .listview-content {
          min-height: 0;
        }

        :host([view-mode="details"]) .listview-item {
          padding: 0;
        }

        :host([view-mode="details"]) .listview-item-cell {
          height: 100%;
          padding: 8px 12px;
          border-right: 1px solid var(--listview-border, #ccc);
        }

        :host(.theme-dark[view-mode="details"]) .listview-item-cell {
          border-right-color: var(--listview-border-dark, #555);
        }

        :host([view-mode="details"]) .listview-item-cell:last-child {
          border-right: none;
        }

        /* Icons view specific styles */
        :host([view-mode="icons"]) .listview-items {
          display: flex;
          flex-wrap: wrap;
          padding: 8px;
          gap: 8px;
          align-content: flex-start;
        }

        :host([view-mode="icons"]) .listview-item {
          flex-direction: column;
          width: 80px;
          height: 80px;
          padding: 8px;
          text-align: center;
          border: 1px solid transparent;
          border-radius: 4px;
        }

        :host([view-mode="icons"]) .listview-item-icon {
          margin: 0 0 4px 0;
          font-size: 32px;
          width: auto;
        }

        :host([view-mode="icons"]) .listview-item-label {
          font-size: 12px;
          line-height: 1.2;
          white-space: normal;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .empty-state {
          padding: 32px;
          text-align: center;
          color: var(--text-color-muted, #666);
          font-style: italic;
        }

        :host(.theme-dark) .empty-state {
          color: var(--text-color-muted-dark, #999);
        }
      </style>
      <div class="listview-container">
        <div class="listview-content">
          <div class="listview-header">
            <div class="listview-header-row"></div>
          </div>
          <div class="listview-items"></div>
        </div>
      </div>
    `;

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    const items = this.shadowRoot?.querySelector('.listview-items');
    if (!items) return;

    items.addEventListener('click', this.handleItemClick.bind(this));
    items.addEventListener('dblclick', this.handleItemDoubleClick.bind(this));
  }

  private handleItemClick(event: Event): void {
    const target = event.target as HTMLElement;
    const itemElement = target.closest('.listview-item') as HTMLElement;

    if (!itemElement || itemElement.classList.contains('disabled')) {
      return;
    }

    const itemId = itemElement.dataset.itemId;
    if (!itemId) return;

    const item = this._items.find(i => i.id === itemId);
    if (!item) return;

    const mouseEvent = event as MouseEvent;
    const { ctrlKey, shiftKey, altKey } = mouseEvent;

    // Handle selection
    this.handleItemSelection(itemId, ctrlKey, shiftKey);

    // Dispatch click event
    dispatchCustomEvent<ListViewItemClickEvent['detail']>(
      this,
      'listview-item-click',
      {
        listViewId: this.id,
        listView: this,
        item,
        itemId,
        ctrlKey,
        shiftKey,
        altKey,
      }
    );
  }

  private handleItemDoubleClick(event: Event): void {
    const target = event.target as HTMLElement;
    const itemElement = target.closest('.listview-item') as HTMLElement;

    if (!itemElement || itemElement.classList.contains('disabled')) {
      return;
    }

    const itemId = itemElement.dataset.itemId;
    if (!itemId) return;

    const item = this._items.find(i => i.id === itemId);
    if (!item) return;

    // Dispatch double-click event
    dispatchCustomEvent<ListViewItemDoubleClickEvent['detail']>(
      this,
      'listview-item-double-click',
      {
        listViewId: this.id,
        listView: this,
        item,
        itemId,
      }
    );
  }

  private handleItemSelection(
    itemId: string,
    ctrlKey: boolean,
    shiftKey: boolean
  ): void {
    const itemIndex = this._items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    const previousSelection = new Set(this._selectedItems);

    if (this._multiSelect && shiftKey && this._lastSelectedIndex !== -1) {
      // Range selection
      const start = Math.min(this._lastSelectedIndex, itemIndex);
      const end = Math.max(this._lastSelectedIndex, itemIndex);

      if (!ctrlKey) {
        this._selectedItems.clear();
      }

      for (let i = start; i <= end; i++) {
        this._selectedItems.add(this._items[i].id);
      }
    } else if (this._multiSelect && ctrlKey) {
      // Toggle selection
      if (this._selectedItems.has(itemId)) {
        this._selectedItems.delete(itemId);
      } else {
        this._selectedItems.add(itemId);
      }
    } else {
      // Single selection
      this._selectedItems.clear();
      this._selectedItems.add(itemId);
    }

    this._lastSelectedIndex = itemIndex;
    this.updateItemElements();
    this.dispatchSelectionChange(previousSelection);
  }

  private dispatchSelectionChange(previousSelection: Set<string>): void {
    const selectedItems = this._items.filter(item =>
      this._selectedItems.has(item.id)
    );
    const addedItems = this._items.filter(
      item =>
        this._selectedItems.has(item.id) && !previousSelection.has(item.id)
    );
    const removedItems = this._items.filter(
      item =>
        !this._selectedItems.has(item.id) && previousSelection.has(item.id)
    );

    dispatchCustomEvent<ListViewSelectionChangeEvent['detail']>(
      this,
      'listview-selection-change',
      {
        listViewId: this.id,
        listView: this,
        selectedItems,
        selectedIds: Array.from(this._selectedItems),
        addedItems,
        removedItems,
      }
    );
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.renderHeader();
    this.renderContent();
  }

  private renderHeader(): void {
    if (this._viewMode !== 'details' || this._columns.length === 0) {
      return;
    }

    const headerRow = this.shadowRoot?.querySelector('.listview-header-row');
    if (!headerRow) return;

    headerRow.innerHTML = '';

    this._columns.forEach(column => {
      const cell = document.createElement('div');
      cell.className = 'listview-header-cell';
      cell.textContent = column.label;
      cell.dataset.columnId = column.id;

      if (column.width) {
        if (typeof column.width === 'number') {
          cell.style.flex = `0 0 ${column.width}px`;
        } else {
          cell.style.flex = `0 0 ${column.width}`;
        }
      }

      headerRow.appendChild(cell);
    });
  }

  private renderContent(): void {
    const itemsContainer = this.shadowRoot?.querySelector('.listview-items');
    if (!itemsContainer) return;

    itemsContainer.innerHTML = '';

    if (this._items.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No items to display';
      itemsContainer.appendChild(emptyState);
      return;
    }

    this._items.forEach(item => {
      const itemElement = this.createItemElement(item);
      itemsContainer.appendChild(itemElement);
    });
  }

  private createItemElement(item: ListViewItem): HTMLElement {
    const itemElement = document.createElement('div');
    itemElement.className = 'listview-item';
    itemElement.dataset.itemId = item.id;

    if (item.disabled) {
      itemElement.classList.add('disabled');
    }

    if (this._selectedItems.has(item.id)) {
      itemElement.classList.add('selected');
    }

    if (this._viewMode === 'details' && this._columns.length > 0) {
      this._columns.forEach(column => {
        const cell = document.createElement('div');
        cell.className = 'listview-item-cell';

        if (column.width) {
          if (typeof column.width === 'number') {
            cell.style.flex = `0 0 ${column.width}px`;
          } else {
            cell.style.flex = `0 0 ${column.width}`;
          }
        }

        let value = '';
        if (column.id === 'label') {
          value = item.label;
        } else if (column.id === 'icon') {
          value = item.icon || '';
        } else if (item.data && item.data[column.id] !== undefined) {
          value = item.data[column.id];
        }

        if (column.renderer) {
          cell.innerHTML = column.renderer(item, value);
        } else {
          cell.textContent = String(value);
        }

        itemElement.appendChild(cell);
      });
    } else {
      // List or Icons view
      if (item.icon) {
        const iconElement = document.createElement('span');
        iconElement.className = 'listview-item-icon';
        iconElement.textContent = item.icon;
        itemElement.appendChild(iconElement);
      }

      const labelElement = document.createElement('span');
      labelElement.className = 'listview-item-label';
      labelElement.textContent = item.label;
      itemElement.appendChild(labelElement);
    }

    return itemElement;
  }

  private updateItemElements(): void {
    if (!this.shadowRoot) return;

    const itemElements = this.shadowRoot.querySelectorAll('.listview-item');
    itemElements.forEach(element => {
      const itemId = (element as HTMLElement).dataset.itemId;
      if (itemId) {
        element.classList.toggle('selected', this._selectedItems.has(itemId));
      }
    });
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('listview');
    }

    // Set up theme inheritance if no explicit theme is set
    if (!this.hasAttribute('theme')) {
      applyEffectiveTheme(this);
      this._themeCleanup = setupThemeInheritance(this);
    } else {
      this.applyTheme(this._theme);
    }

    this.render();
  }

  disconnectedCallback(): void {
    // Clean up theme inheritance listener
    if (this._themeCleanup) {
      this._themeCleanup();
      this._themeCleanup = undefined;
    }
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'theme':
        if (newValue) {
          this.theme = newValue as Theme;
        } else if (this.isConnected) {
          applyEffectiveTheme(this);
          this._themeCleanup = setupThemeInheritance(this);
        }
        break;
      case 'view-mode':
        this.viewMode = (newValue as ListViewMode) || 'list';
        break;
      case 'multi-select':
        this.multiSelect = newValue !== null;
        break;
    }
  }

  // Properties
  get theme(): Theme {
    return this._theme;
  }

  set theme(value: Theme) {
    this._theme = value;
    if (this._themeCleanup) {
      this._themeCleanup();
      this._themeCleanup = undefined;
    }
    this.applyTheme(value);
  }

  get items(): ListViewItem[] {
    return [...this._items];
  }

  set items(value: ListViewItem[]) {
    this._items = [...value];
    this._selectedItems.clear();
    this._lastSelectedIndex = -1;
    if (this.isConnected) {
      this.render();
    }
  }

  get columns(): ListViewColumn[] {
    return [...this._columns];
  }

  set columns(value: ListViewColumn[]) {
    this._columns = [...value];
    if (this.isConnected) {
      this.render();
    }
  }

  get viewMode(): ListViewMode {
    return this._viewMode;
  }

  set viewMode(value: ListViewMode) {
    this._viewMode = value;
    this.setAttribute('view-mode', value);
    if (this.isConnected) {
      this.render();
    }
  }

  get multiSelect(): boolean {
    return this._multiSelect;
  }

  set multiSelect(value: boolean) {
    this._multiSelect = value;
    if (value) {
      this.setAttribute('multi-select', '');
    } else {
      this.removeAttribute('multi-select');
    }
  }

  get selectedItems(): ListViewItem[] {
    return this._items.filter(item => this._selectedItems.has(item.id));
  }

  get selectedIds(): string[] {
    return Array.from(this._selectedItems);
  }

  // Methods
  applyTheme(theme: Theme): void {
    applyTheme(this, theme);
  }

  selectItem(itemId: string): void {
    if (!this._multiSelect) {
      this._selectedItems.clear();
    }
    this._selectedItems.add(itemId);
    this.updateItemElements();
  }

  deselectItem(itemId: string): void {
    this._selectedItems.delete(itemId);
    this.updateItemElements();
  }

  selectAll(): void {
    if (!this._multiSelect) return;

    this._items.forEach(item => {
      if (!item.disabled) {
        this._selectedItems.add(item.id);
      }
    });
    this.updateItemElements();
  }

  deselectAll(): void {
    this._selectedItems.clear();
    this.updateItemElements();
  }

  toggleItemSelection(itemId: string): void {
    if (this._selectedItems.has(itemId)) {
      this.deselectItem(itemId);
    } else {
      this.selectItem(itemId);
    }
  }

  setSelectedItems(itemIds: string[]): void {
    const previousSelection = new Set(this._selectedItems);
    this._selectedItems.clear();

    itemIds.forEach(id => {
      if (this._items.find(item => item.id === id)) {
        this._selectedItems.add(id);
      }
    });

    this.updateItemElements();
    this.dispatchSelectionChange(previousSelection);
  }

  scrollToItem(itemId: string): void {
    const itemElement = this.shadowRoot?.querySelector(
      `[data-item-id="${itemId}"]`
    );
    if (itemElement) {
      itemElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  getItem(itemId: string): ListViewItem | undefined {
    return this._items.find(item => item.id === itemId);
  }

  addItem(item: ListViewItem): void {
    this._items.push(item);
    if (this.isConnected) {
      this.render();
    }
  }

  removeItem(itemId: string): boolean {
    const index = this._items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this._items.splice(index, 1);
      this._selectedItems.delete(itemId);
      if (this.isConnected) {
        this.render();
      }
      return true;
    }
    return false;
  }

  updateItem(itemId: string, updates: Partial<ListViewItem>): boolean {
    const item = this._items.find(i => i.id === itemId);
    if (item) {
      Object.assign(item, updates);
      if (this.isConnected) {
        this.render();
      }
      return true;
    }
    return false;
  }

  refresh(): void {
    this.render();
  }
}

// Register the custom element
if (!customElements.get('e2-list-view')) {
  customElements.define('e2-list-view', ListView);
}
