/**
 * Collapsible Panel Element
 * A panel that can be collapsed to a thin bar with an expand button
 * or expanded to show its full content
 */
import { EditorElementProperties, Theme } from '../../types';
export type PanelOrientation = 'horizontal' | 'vertical';
export declare class CollapsiblePanel extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _collapsed;
    private _orientation;
    private _themeCleanup?;
    private _resizeLeft;
    private _resizeRight;
    private _resizeTop;
    private _resizeBottom;
    private _minWidth;
    private _maxWidth;
    private _minHeight;
    private _maxHeight;
    private _resizing;
    private _resizeEdge;
    private _startPosition;
    private _startSize;
    private _storedSize;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private handleToggle;
    private handleCollapsedChange;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private handleMouseLeave;
    private handleDocumentMouseMove;
    private handleDocumentMouseUp;
    private endResize;
    private getResizeEdge;
    private getCursorForEdge;
    get theme(): Theme;
    set theme(value: Theme);
    get collapsed(): boolean;
    set collapsed(value: boolean);
    get orientation(): PanelOrientation;
    set orientation(value: PanelOrientation);
    toggle(): void;
    expand(): void;
    collapse(): void;
    applyTheme(theme: Theme): void;
    get resizeLeft(): boolean;
    set resizeLeft(value: boolean);
    get resizeRight(): boolean;
    set resizeRight(value: boolean);
    get resizeTop(): boolean;
    set resizeTop(value: boolean);
    get resizeBottom(): boolean;
    set resizeBottom(value: boolean);
    get minWidth(): number;
    set minWidth(value: number);
    get maxWidth(): number;
    set maxWidth(value: number);
    get minHeight(): number;
    set minHeight(value: number);
    get maxHeight(): number;
    set maxHeight(value: number);
}
//# sourceMappingURL=collapsible-panel.d.ts.map