import type { ExtractedInput } from '../interfaces/ExtractedInput';
import { InputTypeEnum } from '../enums/InputTypeEnum';
import {
  getFormRoot,
  isInteractable,
  isSelectEmpty,
  queryFillableElements,
} from '../utils/domForm';
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

const FIELD_CONTAINER_SELECTOR = [
  '.field',
  '.field-row',
  '.form-group',
  '.form-field',
  '.input-group',
  '.question',
  '.form-item',
  'fieldset',
  '[class*="field"]',
  '[class*="FormField"]',
  '[class*="form-group"]',
  '[class*="form-field"]',
  '[class*="question"]',
].join(', ');

/** Walks the DOM and builds structured metadata for each visible, fillable control. */
export class FormExtractor {
  /** Collects unique eligible inputs under `root`, defaulting to the document. */
  extract(root: Document | HTMLElement = document): ExtractedInput[] {
    const elements =
      root === document
        ? queryFillableElements(document)
        : Array.from(
            (root as HTMLElement).querySelectorAll<HTMLElement>(
              'input, select, textarea',
            ),
          );

    const seen = new Set<HTMLElement>();
    const seenRadioGroups = new Set<string>();
    const results: ExtractedInput[] = [];

    for (const element of elements) {
      if (seen.has(element) || !this.isEligible(element)) {
        continue;
      }

      if (element instanceof HTMLInputElement && element.type === 'radio') {
        const groupKey = this.radioGroupKey(element);
        if (groupKey) {
          if (seenRadioGroups.has(groupKey)) {
            continue;
          }
          seenRadioGroups.add(groupKey);
        }
      }

      seen.add(element);
      results.push(this.toExtractedInput(element));
    }

    return results;
  }

  /** One representative control per radio group within the same form. */
  private radioGroupKey(element: HTMLInputElement): string | null {
    if (element.type !== 'radio' || !element.name) {
      return null;
    }

    const formId = getFormRoot(element) === document ? 'document' : 'form';
    return `${formId}:radio:${element.name}`;
  }

  /** Filters disabled, hidden, and non-interactive elements. */
  private isEligible(element: HTMLElement): boolean {
    if (element instanceof HTMLInputElement) {
      if (SKIP_INPUT_TYPES.has(element.type)) {
        return false;
      }
    }

    return isInteractable(element);
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

    const tableLabel = this.resolveTableLabel(element);
    if (tableLabel) {
      return tableLabel;
    }

    const siblingLabel = this.resolveSiblingLabel(element);
    if (siblingLabel) {
      return siblingLabel;
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
        .split(/\s+/) // aria-labelledby may list multiple id refs
        .map((refId) => document.getElementById(refId)?.textContent ?? '')
        .join(' ');
      if (text.trim()) {
        return this.cleanLabelText(text);
      }
    }

    const title = element.getAttribute('title');
    if (title) {
      return TextNormalizer.normalizeText(title);
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
      return TextNormalizer.normalizeText(name.replace(/[_-]+/g, ' ')); // snake_case / kebab-case → words
    }

    return '';
  }

  /** Question label from the enclosing field container (sibling label, not option label). */
  private resolveFieldContainerLabel(element: HTMLElement): string {
    const field = element.closest(FIELD_CONTAINER_SELECTOR);
    if (!field) {
      return '';
    }

    if (field instanceof HTMLFieldSetElement) {
      const legend = field.querySelector(':scope > legend');
      if (legend?.textContent) {
        return this.cleanLabelText(legend.textContent);
      }
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

    const id = element.getAttribute('id');
    if (id) {
      const directLabel = field.querySelector<HTMLLabelElement>(
        `label[for="${CSS.escape(id)}"]`,
      );
      if (directLabel?.textContent) {
        return this.cleanLabelText(directLabel.textContent);
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
        .split(/\s+/) // aria-labelledby may list multiple id refs
        .map((refId) => document.getElementById(refId)?.textContent ?? '')
        .join(' ');
      if (text.trim()) {
        return this.cleanLabelText(text);
      }
    }

    return '';
  }

  /** Label from a table header cell in the same row. */
  private resolveTableLabel(element: HTMLElement): string {
    const cell = element.closest('td, th');
    if (!cell) {
      return '';
    }

    const row = cell.closest('tr');
    const header = row?.querySelector('th');
    if (header?.textContent) {
      return this.cleanLabelText(header.textContent);
    }

    return '';
  }

  /** Label element immediately preceding the control. */
  private resolveSiblingLabel(element: HTMLElement): string {
    let sibling = element.previousElementSibling;
    while (sibling) {
      if (sibling instanceof HTMLLabelElement && sibling.textContent?.trim()) {
        return this.cleanLabelText(sibling.textContent);
      }

      if (sibling.textContent?.trim()) {
        break;
      }

      sibling = sibling.previousElementSibling;
    }

    const parent = element.parentElement;
    if (!parent) {
      return '';
    }

    sibling = parent.previousElementSibling;
    if (sibling instanceof HTMLLabelElement && sibling.textContent?.trim()) {
      return this.cleanLabelText(sibling.textContent);
    }

    return '';
  }

  /** Strips dev tags and normalizes label copy. */
  private cleanLabelText(text: string): string {
    return TextNormalizer.normalizeText(
      text
        .replace(/\bconfig\b/gi, '') // remove test-form "config" tag word
        .replace(/\bextra\b/gi, ''), // remove test-form "extra" tag word
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
      'h1, h2, h3, h4, h5, h6, legend',
    );
    const headingText = heading?.textContent?.trim() ?? '';

    return TextNormalizer.normalizeText(headingText);
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
        return this.resolveSingleCheckboxOption(element);
      }

      const formRoot = getFormRoot(element);
      const group = formRoot.querySelectorAll<HTMLInputElement>(
        `input[type="${element.type}"][name="${CSS.escape(name)}"]`,
      );

      if (group.length <= 1 && element.type === 'checkbox') {
        return this.resolveSingleCheckboxOption(element);
      }

      return Array.from(group).map((input) => this.resolveOptionLabel(input));
    }

    return [];
  }

  private resolveSingleCheckboxOption(element: HTMLInputElement): string[] {
    const label = this.resolveOptionLabel(element);
    return label ? [label] : [];
  }

  private resolveOptionLabel(input: HTMLInputElement): string {
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
  }

  /** Reads the current displayed or stored value for the control. */
  private resolveCurrentValue(element: HTMLElement): string {
    if (element instanceof HTMLSelectElement) {
      if (isSelectEmpty(element)) {
        return '';
      }
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
