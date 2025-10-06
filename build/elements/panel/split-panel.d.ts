/**
 * Split Panel Element
 * A single panel within a split panel container that can be resized
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class SplitPanel extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _size;
    private _minSize;
    private _maxSize;
    private _resizable;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    private handleResize;
    private updateSize;
    get theme(): Theme;
    set theme(value: Theme);
    get size(): number;
    set size(value: number);
    get minSize(): number;
    set minSize(value: number);
    get maxSize(): number;
    set maxSize(value: number);
    get resizable(): boolean;
    set resizable(value: boolean);
    get disabled(): boolean;
    set disabled(value: boolean);
    applyTheme(theme: Theme): void;
    getCurrentSize(): number;
}
export default SplitPanel;
//# sourceMappingURL=split-panel.d.ts.map