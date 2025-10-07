/**
 * TreeView Element
 * A hierarchical tree component supporting expand/collapse, selection, and multi-select
 */
import { EditorElementProperties, Theme, TreeViewItem } from '../../types';
export declare class TreeView extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _themeCleanup?;
    private _items;
    private _multiSelect;
    private _selectedItems;
    private _expandedItems;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    private setupEventListeners;
    private setupTheme;
    private handleClick;
    private handleDoubleClick;
    private handleItemClick;
    private toggleExpanded;
    private findItemById;
    private updateSelection;
    private render;
    private renderItems;
    private renderItem;
    private escapeHtml;
    private dispatchExpandEvent;
    private dispatchCollapseEvent;
    private dispatchSelectionChange;
    private dispatchItemClick;
    private dispatchItemDoubleClick;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    get theme(): Theme;
    set theme(value: Theme);
    get disabled(): boolean;
    set disabled(value: boolean);
    get multiSelect(): boolean;
    set multiSelect(value: boolean);
    get items(): TreeViewItem[];
    set items(value: TreeViewItem[]);
    private restoreItemStates;
    get selectedItems(): TreeViewItem[];
    get selectedIds(): string[];
    selectItem(itemId: string): void;
    deselectItem(itemId: string): void;
    clearSelection(): void;
    expandItem(itemId: string): void;
    collapseItem(itemId: string): void;
    expandAll(): void;
    collapseAll(): void;
    disconnectedCallback(): void;
}
//# sourceMappingURL=tree-view.d.ts.map