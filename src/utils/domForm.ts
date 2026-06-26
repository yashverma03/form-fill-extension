/** Shared DOM helpers for form extraction and patching. */

/** Nearest form ancestor, or the document when none exists. */
export function getFormRoot(element: HTMLElement): HTMLElement | Document {
  return element.closest('form') ?? document;
}

/** True when the control should not be filled (disabled, readonly, or hidden). */
export function isInteractable(element: HTMLElement): boolean {
  if (
    element.hasAttribute('disabled') ||
    element.getAttribute('aria-disabled') === 'true' ||
    element.hasAttribute('readonly') ||
    element.getAttribute('aria-readonly') === 'true'
  ) {
    return false;
  }

  return isVisible(element);
}

/** Visibility check that tolerates fixed/sticky positioning and open selects. */
export function isVisible(element: HTMLElement): boolean {
  if (element.hidden) {
    return false;
  }

  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  if (element.closest('[aria-hidden="true"]')) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0'
  ) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return (
      element instanceof HTMLSelectElement ||
      element instanceof HTMLInputElement
    );
  }

  return true;
}

/** Whether a select still shows a placeholder / empty choice. */
export function isSelectEmpty(select: HTMLSelectElement): boolean {
  if (select.value.trim() === '') {
    return true;
  }

  const selected = select.options[select.selectedIndex];
  if (!selected) {
    return true;
  }

  if (selected.value.trim() === '' || selected.disabled) {
    return true;
  }

  const label = selected.text.trim().toLowerCase();
  return (
    label === '' ||
    label.startsWith('select') ||
    label.startsWith('choose') ||
    label === '--'
  );
}

/** Sets input/textarea value in a way React and other frameworks detect. */
export function setNativeInputValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
): void {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  descriptor?.set?.call(element, value);
}

/** Sets select value in a way React and other frameworks detect. */
export function setNativeSelectValue(
  select: HTMLSelectElement,
  value: string,
): void {
  const descriptor = Object.getOwnPropertyDescriptor(
    window.HTMLSelectElement.prototype,
    'value',
  );
  descriptor?.set?.call(select, value);
}

/** Fires events frameworks listen to after programmatic updates. */
export function dispatchInputEvents(element: HTMLElement): void {
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

/** Collects fillable controls including those inside open shadow roots. */
export function queryFillableElements(
  root: Document | HTMLElement | ShadowRoot = document,
): HTMLElement[] {
  const results: HTMLElement[] = [];
  const selector = 'input, select, textarea';

  results.push(
    ...Array.from(root.querySelectorAll<HTMLElement>(selector)),
  );

  const hosts =
    root instanceof Document
      ? root.querySelectorAll<HTMLElement>('*')
      : root.querySelectorAll<HTMLElement>('*');

  for (const host of hosts) {
    if (host.shadowRoot) {
      results.push(...queryFillableElements(host.shadowRoot));
    }
  }

  return results;
}
