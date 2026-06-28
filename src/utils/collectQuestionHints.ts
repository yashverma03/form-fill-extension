import { TextNormalizer } from './normalizeText';

const NOISE_TOKENS = new Set(['on', 'off', 'optional', 'required']);

/**
 * Collects question-identifying strings in priority order (most user-visible first).
 * Each hint is normalized and deduped; noisy system ids are dropped.
 */
export function collectQuestionHints(element: HTMLElement): string[] {
  const seen = new Set<string>();
  const hints: string[] = [];

  const add = (raw: string | null | undefined) => {
    const normalized = normalizeHint(raw);
    if (!normalized || seen.has(normalized) || isNoiseHint(normalized)) {
      return;
    }

    seen.add(normalized);
    hints.push(normalized);
  };

  // 1. Label text — what the user actually sees
  for (const label of findAssociatedLabels(element)) {
    add(label);
  }

  add(findGroupLabel(element));

  // 2. HTML attributes — common on ATS / generated forms
  add(normalizeAttributeValue(element.getAttribute('name')));
  add(element.getAttribute('placeholder'));
  add(stripSystemId(element.getAttribute('id')));
  add(normalizeAttributeValue(element.getAttribute('autocomplete')));

  // 3. Aria and auxiliary text
  add(element.getAttribute('aria-label'));
  add(resolveRefText(element.getAttribute('aria-labelledby')));
  add(element.getAttribute('title'));
  add(resolveRefText(element.getAttribute('aria-describedby')));

  // 4. Section context — lowest priority disambiguator
  add(findSectionHeading(element));

  return hints;
}

function normalizeHint(raw: string | null | undefined): string {
  if (!raw?.trim()) {
    return '';
  }

  return TextNormalizer.normalizeText(
    raw
      .replace(/\bconfig\b/gi, '')
      .replace(/\bextra\b/gi, '')
      .replace(/\*/g, ' '),
  );
}

function normalizeAttributeValue(raw: string | null | undefined): string {
  if (!raw?.trim()) {
    return '';
  }

  if (/\d{6,}/.test(raw)) {
    return '';
  }

  return normalizeHint(raw.replace(/[_-]+/g, ' '));
}

function stripSystemId(raw: string | null | undefined): string {
  if (!raw?.trim()) {
    return '';
  }

  const withoutNumericRuns = raw
    .replace(/\d{6,}/g, ' ')
    .replace(/[_-]+/g, ' ');

  const tokens = normalizeHint(withoutNumericRuns)
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !isNoiseHint(token));

  return tokens.join(' ');
}

function isNoiseHint(normalized: string): boolean {
  if (NOISE_TOKENS.has(normalized)) {
    return true;
  }

  const compact = normalized.replace(/\s/g, '');
  if (compact.length > 0 && /^\d+$/.test(compact)) {
    return true;
  }

  const digitCount = (normalized.match(/\d/g) ?? []).length;
  if (normalized.length >= 8 && digitCount / normalized.length >= 0.7) {
    return true;
  }

  return false;
}

function resolveRefText(refIds: string | null): string {
  if (!refIds?.trim()) {
    return '';
  }

  return refIds
    .split(/\s+/)
    .map((refId) => document.getElementById(refId)?.textContent ?? '')
    .join(' ');
}

function findAssociatedLabels(element: HTMLElement): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();

  const add = (raw: string | null | undefined) => {
    const normalized = normalizeHint(raw);
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    labels.push(normalized);
  };

  const id = element.getAttribute('id');
  if (id) {
    add(
      document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`)
        ?.textContent,
    );
  }

  const wrapper = element.closest('label');
  if (wrapper && isSingleControlLabel(wrapper, element)) {
    add(wrapper.textContent);
  }

  add(findNearbyLabelText(element));

  return labels;
}

function findNearbyLabelText(element: HTMLElement): string {
  let node: HTMLElement | null = element;

  while (node) {
    let sibling = node.previousElementSibling;
    while (sibling) {
      const text = extractLabelText(sibling);
      if (text) {
        return text;
      }

      sibling = sibling.previousElementSibling;
    }

    node = node.parentElement;
  }

  return '';
}

function extractLabelText(el: Element): string {
  if (el instanceof HTMLLabelElement || el instanceof HTMLLegendElement) {
    return el.textContent ?? '';
  }

  if (
    el.matches(
      '[class*="label" i], [class*="Label"], [id*="label" i], [id*="Label"]',
    )
  ) {
    return el.textContent ?? '';
  }

  const inner = el.querySelector(
    'label, legend, [class*="label" i], [class*="Label"]',
  );
  if (inner?.textContent && inner.textContent.length <= 300) {
    return inner.textContent;
  }

  return '';
}

function isSingleControlLabel(
  label: HTMLLabelElement,
  element: HTMLElement,
): boolean {
  if (
    element instanceof HTMLInputElement &&
    (element.type === 'radio' || element.type === 'checkbox')
  ) {
    const choices = label.querySelectorAll(
      'input[type="radio"], input[type="checkbox"]',
    );
    if (choices.length > 1) {
      return false;
    }
  }

  return true;
}

function findGroupLabel(element: HTMLElement): string {
  const group = element.closest('[role="radiogroup"], [role="group"]');
  if (!group) {
    return '';
  }

  const ariaLabel = group.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel;
  }

  return resolveRefText(group.getAttribute('aria-labelledby'));
}

function findSectionHeading(element: HTMLElement): string {
  const container = element.closest('fieldset, section, form, li, tr');
  if (!container) {
    return '';
  }

  const heading = container.querySelector('h1, h2, h3, h4, h5, h6, legend');
  return heading?.textContent?.trim() ?? '';
}
