/**
 * Utility functions for editor elements
 */
/**
 * Generate a unique ID for elements
 */
export declare function generateId(prefix?: string): string;
/**
 * Dispatch a custom event from an element
 */
export declare function dispatchCustomEvent<T = any>(element: HTMLElement, eventName: string, detail?: T, options?: CustomEventInit): boolean;
/**
 * Add CSS to the document head if it doesn't already exist
 */
export declare function addGlobalCSS(css: string, id?: string): void;
/**
 * Create a template element with the given HTML
 */
export declare function createTemplate(html: string): HTMLTemplateElement;
/**
 * Get or create a shadow root for an element
 */
export declare function getShadowRoot(element: HTMLElement, options?: ShadowRootInit): ShadowRoot;
/**
 * Debounce function to limit how often a function can be called
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Check if an element is visible in the viewport
 */
export declare function isElementVisible(element: HTMLElement): boolean;
/**
 * Apply theme class to an element
 */
export declare function applyTheme(element: HTMLElement, theme: 'light' | 'dark' | 'auto'): void;
//# sourceMappingURL=utils.d.ts.map