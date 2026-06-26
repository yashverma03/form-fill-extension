import type { ExtractedInput } from '../interfaces/ExtractedInput';
import { InputTypeEnum } from '../enums/InputTypeEnum';
import { TextNormalizer } from '../utils/normalizeText';

/** Input types excluded from extraction (non-fillable or action controls). */
const SKIP_INPUT_TYPES = new Set([
  'hidden',
  'submit',
  'button',
  'reset',
  'image',
  'file',
]);

/** Walks the DOM and builds structured metadata for each visible, fillable control. */
export class FormExtractor {
  /** Collects unique eligible inputs under `root`, defaulting to the document. */
  extract(root: Document | HTMLElement = document): ExtractedInput[] {
    const elements = root.querySelectorAll<HTMLElement>(
      'input, select, textarea',
    );
    const seen = new Set<HTMLElement>();
    const seenGroups = new Set<string>();
    const results: ExtractedInput[] = [];

    for (const element of elements) {
      if (seen.has(element) || !this.isEligible(element)) {
        continue;
      }

      if (element instanceof HTMLInputElement) {
        const groupKey = this.groupKey(element);
        if (groupKey) {
          if (seenGroups.has(groupKey)) {
            continue;
          }
          seenGroups.add(groupKey);
        }
      }

      seen.add(element);
      results.push(this.toExtractedInput(element));
    }

    return results;
  }

  /** One representative control per radio/checkbox group. */
  private groupKey(element: HTMLInputElement): string | null {
    if (element.type !== 'radio' && element.type !== 'checkbox') {
      return null;
    }

    const name = element.name;
    if (!name) {
      return null;
    }

    return `${element.type}:${name}`;
  }

  /** Filters disabled, hidden, and non-interactive elements. */
  private isEligible(element: HTMLElement): boolean {
    if (
      element.hasAttribute('disabled') ||
      element.getAttribute('aria-disabled') === 'true'
    ) {
      return false;
    }

    if (element instanceof HTMLInputElement) {
      if (SKIP_INPUT_TYPES.has(element.type)) {
        return false;
      }

      if (element.type === 'radio' || element.type === 'checkbox') {
        return true;
      }
    }

    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }

    return (
      element.offsetParent !== null || element instanceof HTMLSelectElement
    );
  }

  /** Assembles label, type, options, value, and surrounding context for one element. */
  private toExtractedInput(element: HTMLElement): ExtractedInput {
    const labelText = this.resolveLabelText(element);
    const contextText = this.resolveContextText(element);
    const inputType = this.resolveInputType(element);
    const options = this.resolveOptions(element);
    const currentValue = this.resolveCurrentValue(element);

    return {
      element,
      labelText,
      inputType,
      currentValue,
      options,
      contextText,
    };
  }

  /** Resolves question text via label, aria, placeholder, siblings, or name. */
  private resolveLabelText(element: HTMLElement): string {
    const fieldLabel = this.resolveFieldContainerLabel(element);
    if (fieldLabel) {
      return fieldLabel;
    }

    const groupLabel = this.resolveGroupLabel(element);
    if (groupLabel) {
      return groupLabel;
    }

    const id = element.getAttribute('id');

    if (id) {
      const label = document.querySelector<HTMLLabelElement>(
        `label[for="${CSS.escape(id)}"]`,
      );
      if (label?.textContent) {
        return this.cleanLabelText(label.textContent);
      }
    }

    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      return TextNormalizer.normalizeText(ariaLabel);
    }

    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const text = labelledBy
        .split(/\s+/)
        .map((refId) => document.getElementById(refId)?.textContent ?? '')
        .join(' ');
      if (text.trim()) {
        return this.cleanLabelText(text);
      }
    }

    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      const placeholder = element.getAttribute('placeholder');
      if (placeholder) {
        return TextNormalizer.normalizeText(placeholder);
      }
    }

    const name = element.getAttribute('name');
    if (name) {
      return TextNormalizer.normalizeText(name.replace(/[_-]+/g, ' '));
    }

    return '';
  }

  /** Question label from the enclosing field container (sibling label, not option label). */
  private resolveFieldContainerLabel(element: HTMLElement): string {
    const field = element.closest(
      '.field, .field-row, fieldset, [class*="field"]',
    );
    if (!field) {
      return '';
    }

    for (const label of field.querySelectorAll<HTMLLabelElement>(
      ':scope > label',
    )) {
      if (label.contains(element)) {
        continue;
      }

      const text = this.cleanLabelText(label.textContent ?? '');
      if (text) {
        return text;
      }
    }

    for (const label of field.querySelectorAll<HTMLLabelElement>('label[for]')) {
      const text = this.cleanLabelText(label.textContent ?? '');
      if (text) {
        return text;
      }
    }

    return '';
  }

  /** aria-label / aria-labelledby on radio or checkbox groups. */
  private resolveGroupLabel(element: HTMLElement): string {
    const group = element.closest('[role="radiogroup"], [role="group"]');
    if (!group) {
      return '';
    }

    const ariaLabel = group.getAttribute('aria-label');
    if (ariaLabel) {
      return TextNormalizer.normalizeText(ariaLabel);
    }

    const labelledBy = group.getAttribute('aria-labelledby');
    if (labelledBy) {
      const text = labelledBy
        .split(/\s+/)
        .map((refId) => document.getElementById(refId)?.textContent ?? '')
        .join(' ');
      if (text.trim()) {
        return this.cleanLabelText(text);
      }
    }

    return '';
  }

  /** Strips dev tags and normalizes label copy. */
  private cleanLabelText(text: string): string {
    return TextNormalizer.normalizeText(
      text.replace(/\bconfig\b/gi, '').replace(/\bextra\b/gi, ''),
    );
  }

  /** Gathers heading and container text for disambiguating similar labels. */
  private resolveContextText(element: HTMLElement): string {
    const container =
      element.closest('fieldset, section, form, div, li, tr') ??
      element.parentElement;
    if (!container) {
      return '';
    }

    const heading = container.querySelector(
      'h1, h2, h3, h4, h5, h6, legend, p',
    );
    const headingText = heading?.textContent?.trim() ?? '';
    const containerText = container.textContent?.trim() ?? '';

    return TextNormalizer.normalizeText(
      [headingText, containerText].filter(Boolean).join(' '),
    );
  }

  /** Maps HTML element to the extension's input-type enum. */
  private resolveInputType(element: HTMLElement): InputTypeEnum {
    if (element instanceof HTMLSelectElement) {
      return InputTypeEnum.Select;
    }

    if (element instanceof HTMLTextAreaElement) {
      return InputTypeEnum.Textarea;
    }

    if (element instanceof HTMLInputElement) {
      switch (element.type) {
        case 'email':
          return InputTypeEnum.Email;
        case 'tel':
          return InputTypeEnum.Tel;
        case 'number':
          return InputTypeEnum.Number;
        case 'url':
          return InputTypeEnum.Url;
        case 'radio':
          return InputTypeEnum.Radio;
        case 'checkbox':
          return InputTypeEnum.Checkbox;
        default:
          return InputTypeEnum.Text;
      }
    }

    return InputTypeEnum.Text;
  }

  /** Lists option labels for selects and radio/checkbox groups. */
  private resolveOptions(element: HTMLElement): string[] {
    if (element instanceof HTMLSelectElement) {
      return Array.from(element.options).map((option) =>
        TextNormalizer.normalizeText(option.text),
      );
    }

    if (
      element instanceof HTMLInputElement &&
      (element.type === 'radio' || element.type === 'checkbox')
    ) {
      const name = element.name;
      if (!name) {
        return [];
      }

      const group = document.querySelectorAll<HTMLInputElement>(
        `input[type="${element.type}"][name="${CSS.escape(name)}"]`,
      );

      return Array.from(group).map((input) => {
        const id = input.id;
        if (id) {
          const label = document.querySelector<HTMLLabelElement>(
            `label[for="${CSS.escape(id)}"]`,
          );
          if (label?.textContent) {
            return TextNormalizer.normalizeText(label.textContent);
          }
        }

        const parentLabel = input.closest('label');
        if (parentLabel?.textContent) {
          return this.cleanLabelText(parentLabel.textContent);
        }

        return TextNormalizer.normalizeText(input.value);
      });
    }

    return [];
  }

  /** Reads the current displayed or stored value for the control. */
  private resolveCurrentValue(element: HTMLElement): string {
    if (element instanceof HTMLSelectElement) {
      return element.options[element.selectedIndex]?.text ?? '';
    }

    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox' || element.type === 'radio') {
        return element.checked ? element.value : '';
      }
      return element.value;
    }

    if (element instanceof HTMLTextAreaElement) {
      return element.value;
    }

    return '';
  }
}
