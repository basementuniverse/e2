/**
 * Utility functions for editor elements
 */

/**
 * Generate a unique ID for elements
 */
export function generateId(prefix = 'element'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Dispatch a custom event from an element
 */
export function dispatchCustomEvent<T = any>(
  element: HTMLElement,
  eventName: string,
  detail?: T,
  options: CustomEventInit = {}
): boolean {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    cancelable: true,
    ...options,
  });

  return element.dispatchEvent(event);
}

/**
 * Add CSS to the document head if it doesn't already exist
 */
export function addGlobalCSS(css: string, id?: string): void {
  if (id && document.getElementById(id)) {
    return; // CSS already added
  }

  const style = document.createElement('style');
  if (id) {
    style.id = id;
  }
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Create a template element with the given HTML
 */
export function createTemplate(html: string): HTMLTemplateElement {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template;
}

/**
 * Get or create a shadow root for an element
 */
export function getShadowRoot(
  element: HTMLElement,
  options: ShadowRootInit = { mode: 'open' }
): ShadowRoot {
  return element.shadowRoot || element.attachShadow(options);
}

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
}

/**
 * Check if an element is visible in the viewport
 */
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Apply theme class to an element
 */
export function applyTheme(
  element: HTMLElement,
  theme: 'light' | 'dark' | 'auto'
): void {
  element.classList.remove('theme-light', 'theme-dark', 'theme-auto');
  element.classList.add(`theme-${theme}`);
}
