/** Shared DOM helpers for form extraction and patching. */
import type { ListboxOption } from '../interfaces/ListboxOption';

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

/**
 * Fires events frameworks listen to after programmatic updates, wrapped in a
 * real focus/blur cycle so form libraries (Formik, React Hook Form, Angular,
 * Vue) mark the field as "touched" the same way they would for a human edit.
 */
export function dispatchInputEvents(element: HTMLElement): void {
  const focusable =
    element instanceof HTMLElement && typeof element.focus === 'function';

  if (focusable) {
    element.focus({ preventScroll: true });
    element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    element.dispatchEvent(new FocusEvent('focus', { bubbles: false }));
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));

  if (focusable) {
    element.blur();
    element.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
    element.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  } else {
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }
}

const FILLABLE_SELECTOR = [
  'input',
  'select',
  'textarea',
  '[role="textbox"]',
  '[role="combobox"]',
  '[role="searchbox"]',
  '[contenteditable="true"]',
  '[contenteditable=""]',
  'button[aria-haspopup="listbox"]',
].join(', ');

export { FILLABLE_SELECTOR };

/**
 * True for button-triggered listbox widgets (e.g. Workday) whose options render
 * lazily on open, identified by the adjacent typeahead text input they render
 * alongside the trigger button. Generic menu buttons (settings, account menus)
 * share `aria-haspopup="listbox"` but lack this sibling input, so they're excluded.
 */
export function isListboxTriggerButton(element: HTMLElement): boolean {
  return (
    element instanceof HTMLButtonElement &&
    element.getAttribute('aria-haspopup') === 'listbox' &&
    findListboxTypeaheadInput(element) !== null
  );
}

/** Locates the typeahead text input Workday renders next to a listbox trigger button. */
export function findListboxTypeaheadInput(
  button: HTMLElement,
): HTMLInputElement | null {
  return (
    button.parentElement?.querySelector<HTMLInputElement>(
      'input[type="text"]',
    ) ?? null
  );
}

/** Resolves after the given delay, letting the widget flush its popup render. */
export function waitFrame(delayMs = 40): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

/** Simulates a real user click so widget option handlers (mousedown/up/click) fire. */
export function simulateClick(element: HTMLElement): void {
  for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
    element.dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true, view: window }),
    );
  }
}

/**
 * Opens a button-triggered listbox (e.g. Workday) and returns its rendered
 * options. The popup renders lazily on open, so we click the trigger, wait for
 * the DOM to flush, then locate the listbox via `aria-controls` (falling back to
 * the topmost open `[role="listbox"]`). Placeholder rows ("Select One", empty
 * values, disabled) are excluded so they can't be matched or clicked.
 */
export async function openListboxOptions(
  button: HTMLButtonElement,
): Promise<ListboxOption[]> {
  simulateClick(button);
  await waitFrame();

  const controls = button.getAttribute('aria-controls');
  let listbox = controls ? document.getElementById(controls) : null;

  if (!listbox) {
    const open = Array.from(
      document.querySelectorAll<HTMLElement>('[role="listbox"]'),
    ).filter((element) => isVisible(element));
    listbox = open[open.length - 1] ?? null;
  }

  if (!listbox) {
    return [];
  }

  return Array.from(
    listbox.querySelectorAll<HTMLElement>('[role="option"]'),
  )
    .filter((option) => option.getAttribute('aria-disabled') !== 'true')
    .filter((option) => (option.getAttribute('data-value') ?? 'x') !== '')
    .map((option) => ({
      label: option.textContent?.trim() ?? '',
      element: option,
    }))
    .filter((option) => {
      const normalized = option.label.toLowerCase();
      return (
        normalized !== '' &&
        !normalized.startsWith('select') &&
        !normalized.startsWith('choose') &&
        normalized !== '--'
      );
    });
}

/** Collects fillable controls including those inside open shadow roots. */
export function queryFillableElements(
  root: Document | HTMLElement | ShadowRoot = document,
): HTMLElement[] {
  const results: HTMLElement[] = [];

  results.push(
    ...Array.from(root.querySelectorAll<HTMLElement>(FILLABLE_SELECTOR)),
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
