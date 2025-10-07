/**
 * ListView Element
 * A versatile list component supporting multiple view modes (list, details, icons)
 * with selection management and multi-select capabilities
 */
import { EditorElementProperties, ListViewColumn, ListViewItem, ListViewMode, Theme } from '../../types';
export declare class ListView extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _themeCleanup?;
    private _items;
    private _columns;
    private _viewMode;
    private _multiSelect;
    private _selectedItems;
    private _lastSelectedIndex;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    private setupEventHandlers;
    private handleItemClick;
    private handleItemDoubleClick;
    private handleItemSelection;
    private dispatchSelectionChange;
    private render;
    private renderHeader;
    private renderContent;
    private createItemElement;
    private updateItemElements;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    get theme(): Theme;
    set theme(value: Theme);
    get items(): ListViewItem[];
    set items(value: ListViewItem[]);
    get columns(): ListViewColumn[];
    set columns(value: ListViewColumn[]);
    get viewMode(): ListViewMode;
    set viewMode(value: ListViewMode);
    get multiSelect(): boolean;
    set multiSelect(value: boolean);
    get selectedItems(): ListViewItem[];
    get selectedIds(): string[];
    applyTheme(theme: Theme): void;
    selectItem(itemId: string): void;
    deselectItem(itemId: string): void;
    selectAll(): void;
    deselectAll(): void;
    toggleItemSelection(itemId: string): void;
    setSelectedItems(itemIds: string[]): void;
    scrollToItem(itemId: string): void;
    getItem(itemId: string): ListViewItem | undefined;
    addItem(item: ListViewItem): void;
    removeItem(itemId: string): boolean;
    updateItem(itemId: string, updates: Partial<ListViewItem>): boolean;
    refresh(): void;
}
//# sourceMappingURL=list-view.d.ts.map