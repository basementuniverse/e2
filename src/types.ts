/**
 * Common types and interfaces used across editor elements
 */

// -----------------------------------------------------------------------------
// General types & events
// -----------------------------------------------------------------------------

export interface EditorElementEvent extends CustomEvent {
  target: HTMLElement;
}

export interface EditorElementProperties {
  id?: string;
  disabled?: boolean;
  hidden?: boolean;
}

// -----------------------------------------------------------------------------
// Toolbar types & events
// -----------------------------------------------------------------------------

export interface ToolbarButtonClickEvent extends EditorElementEvent {
  detail: {
    buttonId: string;
    button: HTMLElement;
  };
}

export interface ToolbarMenuShowEvent extends EditorElementEvent {
  detail: {
    menuId: string;
    menu: HTMLElement;
  };
}

export interface ToolbarMenuHideEvent extends EditorElementEvent {
  detail: {
    menuId: string;
    menu: HTMLElement;
  };
}

// -----------------------------------------------------------------------------
// Collapsible panel types & events
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Dialog types & events
// -----------------------------------------------------------------------------

export type AlertType = 'info' | 'success' | 'warning' | 'error';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface DialogEvent extends EditorElementEvent {
  detail: {
    dialogId: string;
    dialog: HTMLElement;
  };
}

export interface DialogShowEvent extends DialogEvent {
  detail: DialogEvent['detail'] & {
    modal?: boolean;
  };
}

export interface DialogCloseEvent extends DialogEvent {
  detail: DialogEvent['detail'] & {
    returnValue?: string;
  };
}

export interface ConfirmDialogEvent extends DialogEvent {
  detail: DialogEvent['detail'] & {
    confirmed: boolean;
  };
}

export interface AlertDialogEvent extends DialogEvent {
  detail: DialogEvent['detail'];
}

export interface PromptDialogEvent extends DialogEvent {
  detail: DialogEvent['detail'] & {
    value: string | null;
  };
}

// -----------------------------------------------------------------------------
// Context Menu types & events
// -----------------------------------------------------------------------------

export interface ContextMenuShowEvent extends EditorElementEvent {
  detail: {
    menuId: string;
    menu: HTMLElement;
    x: number;
    y: number;
    trigger: HTMLElement;
  };
}

export interface ContextMenuHideEvent extends EditorElementEvent {
  detail: {
    menuId: string;
    menu: HTMLElement;
  };
}

export interface ContextMenuItemClickEvent extends EditorElementEvent {
  detail: {
    itemId: string;
    item: HTMLElement;
    menuId: string;
    menu: HTMLElement;
    value?: string;
  };
}

// -----------------------------------------------------------------------------
// Tab types & events
// -----------------------------------------------------------------------------

export interface TabSelectEvent extends EditorElementEvent {
  detail: {
    tabId: string;
    tab: HTMLElement;
    panelId: string;
    panel: HTMLElement;
    containerId: string;
    container: HTMLElement;
    previousTabId?: string;
  };
}

export interface TabCloseEvent extends EditorElementEvent {
  detail: {
    tabId: string;
    tab: HTMLElement;
    panelId: string;
    panel: HTMLElement;
    containerId: string;
    container: HTMLElement;
  };
}

export interface TabContainerChangeEvent extends EditorElementEvent {
  detail: {
    containerId: string;
    container: HTMLElement;
    activeTabId: string;
    activePanelId: string;
  };
}

// -----------------------------------------------------------------------------
// Split Panel types & events
// -----------------------------------------------------------------------------

export type SplitPanelOrientation = 'horizontal' | 'vertical';

export interface SplitPanelResizeEvent extends EditorElementEvent {
  detail: {
    containerId: string;
    container: HTMLElement;
    panelId: string;
    panel: HTMLElement;
    size: number;
    minSize: number;
    maxSize: number;
  };
}

export interface SplitPanelResizeStartEvent extends EditorElementEvent {
  detail: {
    containerId: string;
    container: HTMLElement;
    panelId: string;
    panel: HTMLElement;
    startSize: number;
  };
}

export interface SplitPanelResizeEndEvent extends EditorElementEvent {
  detail: {
    containerId: string;
    container: HTMLElement;
    panelId: string;
    panel: HTMLElement;
    finalSize: number;
  };
}

// -----------------------------------------------------------------------------
// Notification types & events
// -----------------------------------------------------------------------------

export interface NotificationEvent extends EditorElementEvent {
  detail: {
    notificationId: string;
    notification: HTMLElement;
    type: NotificationType;
  };
}

export interface NotificationShowEvent extends NotificationEvent {
  detail: NotificationEvent['detail'];
}

export interface NotificationHideEvent extends NotificationEvent {
  detail: NotificationEvent['detail'];
}

export interface NotificationDismissEvent extends NotificationEvent {
  detail: NotificationEvent['detail'];
}

export interface NotificationClickEvent extends NotificationEvent {
  detail: NotificationEvent['detail'];
}

export interface NotificationContainerEvent extends EditorElementEvent {
  detail: {
    containerId: string;
    container: HTMLElement;
    position: string;
    count: number;
  };
}

// -----------------------------------------------------------------------------
// Status Bar types & events
// -----------------------------------------------------------------------------

export interface StatusItemClickEvent extends EditorElementEvent {
  detail: {
    itemId: string;
    item: HTMLElement;
    itemType: StatusItemType;
    value?: string | number;
  };
}

export interface StatusItemUpdateEvent extends EditorElementEvent {
  detail: {
    itemId: string;
    item: HTMLElement;
    oldValue?: string | number;
    newValue?: string | number;
  };
}

export interface StatusMessageEvent extends EditorElementEvent {
  detail: {
    message: string;
    type: StatusMessageType;
    duration?: number;
    temporary?: boolean;
  };
}

export type StatusItemType =
  | 'text'
  | 'progress'
  | 'tool'
  | 'message'
  | 'indicator';
export type StatusMessageType = 'info' | 'success' | 'warning' | 'error';
export type StatusSectionPosition = 'left' | 'center' | 'right';

// -----------------------------------------------------------------------------
// Themes
// -----------------------------------------------------------------------------

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeableElement {
  theme: Theme;
  applyTheme(theme: Theme): void;
}

export interface AppThemeChangeEvent extends EditorElementEvent {
  detail: {
    theme: Theme;
    appElement: HTMLElement;
  };
}

// -----------------------------------------------------------------------------
// ListView types & events
// -----------------------------------------------------------------------------

export type ListViewMode = 'list' | 'details' | 'icons';

export interface ListViewItem {
  id: string;
  label: string;
  icon?: string;
  data?: Record<string, any>;
  selected?: boolean;
  disabled?: boolean;
}

export interface ListViewColumn {
  id: string;
  label: string;
  width?: string | number;
  sortable?: boolean;
  renderer?: (item: ListViewItem, value: any) => string;
}

export interface ListViewSelectionChangeEvent extends EditorElementEvent {
  detail: {
    listViewId: string;
    listView: HTMLElement;
    selectedItems: ListViewItem[];
    selectedIds: string[];
    addedItems: ListViewItem[];
    removedItems: ListViewItem[];
  };
}

export interface ListViewItemClickEvent extends EditorElementEvent {
  detail: {
    listViewId: string;
    listView: HTMLElement;
    item: ListViewItem;
    itemId: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
  };
}

export interface ListViewItemDoubleClickEvent extends EditorElementEvent {
  detail: {
    listViewId: string;
    listView: HTMLElement;
    item: ListViewItem;
    itemId: string;
  };
}

// -----------------------------------------------------------------------------
// TreeView types & events
// -----------------------------------------------------------------------------

export interface TreeViewItem {
  id: string;
  label: string;
  icon?: string;
  data?: Record<string, any>;
  children?: TreeViewItem[];
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

export interface TreeViewExpandEvent extends EditorElementEvent {
  detail: {
    treeViewId: string;
    treeView: HTMLElement;
    item: TreeViewItem;
    itemId: string;
  };
}

export interface TreeViewCollapseEvent extends EditorElementEvent {
  detail: {
    treeViewId: string;
    treeView: HTMLElement;
    item: TreeViewItem;
    itemId: string;
  };
}

export interface TreeViewSelectionChangeEvent extends EditorElementEvent {
  detail: {
    treeViewId: string;
    treeView: HTMLElement;
    selectedItems: TreeViewItem[];
    selectedIds: string[];
    addedItems: TreeViewItem[];
    removedItems: TreeViewItem[];
  };
}

export interface TreeViewItemClickEvent extends EditorElementEvent {
  detail: {
    treeViewId: string;
    treeView: HTMLElement;
    item: TreeViewItem;
    itemId: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
  };
}

export interface TreeViewItemDoubleClickEvent extends EditorElementEvent {
  detail: {
    treeViewId: string;
    treeView: HTMLElement;
    item: TreeViewItem;
    itemId: string;
  };
}
