import type { ExtractedInput } from '../interfaces/ExtractedInput';
import { InputTypeEnum } from '../enums/InputTypeEnum';
import { collectQuestionHints } from '../utils/collectQuestionHints';
import {
  FILLABLE_SELECTOR,
  getFormRoot,
  isInteractable,
  isListboxTriggerButton,
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

/** Walks the DOM and builds structured metadata for each visible, fillable control. */
export class FormExtractor {
  /** Collects unique eligible inputs under `root`, defaulting to the document. */
  extract(root: Document | HTMLElement = document): ExtractedInput[] {
    const elements =
      root === document
        ? queryFillableElements(document)
        : Array.from(
            (root as HTMLElement).querySelectorAll<HTMLElement>(FILLABLE_SELECTOR),
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

  private radioGroupKey(element: HTMLInputElement): string | null {
    if (element.type !== 'radio' || !element.name) {
      return null;
    }

    const formId = getFormRoot(element) === document ? 'document' : 'form';
    return `${formId}:radio:${element.name}`;
  }

  private isEligible(element: HTMLElement): boolean {
    if (element instanceof HTMLInputElement) {
      if (SKIP_INPUT_TYPES.has(element.type)) {
        return false;
      }
    }

    if (element instanceof HTMLButtonElement && !isListboxTriggerButton(element)) {
      return false;
    }

    return isInteractable(element);
  }

  private toExtractedInput(element: HTMLElement): ExtractedInput {
    const questionHints = collectQuestionHints(element);

    return {
      element,
      labelText: questionHints[0] ?? '',
      questionHints,
      inputType: this.resolveInputType(element),
      currentValue: this.resolveCurrentValue(element),
      options: this.resolveOptions(element),
    };
  }

  private resolveInputType(element: HTMLElement): InputTypeEnum {
    if (element instanceof HTMLSelectElement) {
      return InputTypeEnum.Select;
    }

    if (element instanceof HTMLTextAreaElement) {
      return InputTypeEnum.Textarea;
    }

    if (element.isContentEditable) {
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

    if (isListboxTriggerButton(element)) {
      return InputTypeEnum.ListboxButton;
    }

    const role = element.getAttribute('role');
    if (role === 'combobox') {
      return InputTypeEnum.Select;
    }

    return InputTypeEnum.Text;
  }

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
      return TextNormalizer.normalizeText(parentLabel.textContent);
    }

    return TextNormalizer.normalizeText(input.value);
  }

  private resolveCurrentValue(element: HTMLElement): string {
    if (isListboxTriggerButton(element)) {
      const text = element.textContent?.trim() ?? '';
      return /^(select|choose)\b/i.test(text) || text === '--' ? '' : text;
    }

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

    if (element.isContentEditable) {
      return element.textContent?.trim() ?? '';
    }

    return element.textContent?.trim() ?? '';
  }
}
