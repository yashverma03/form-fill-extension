import type { ExtractedInput } from '../interfaces/ExtractedInput';
import { InputTypeEnum } from '../enums/InputTypeEnum';
import { TextNormalizer } from '../utils/normalizeText';

const SKIP_INPUT_TYPES = new Set([
  'hidden',
  'submit',
  'button',
  'reset',
  'image',
  'file',
]);

export class FormExtractor {
  extract(root: Document | HTMLElement = document): ExtractedInput[] {
    const elements = root.querySelectorAll<HTMLElement>(
      'input, select, textarea',
    );
    const seen = new Set<HTMLElement>();
    const results: ExtractedInput[] = [];

    for (const element of elements) {
      if (seen.has(element) || !this.isEligible(element)) {
        continue;
      }

      seen.add(element);
      results.push(this.toExtractedInput(element));
    }

    return results;
  }

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

  private resolveLabelText(element: HTMLElement): string {
    const id = element.getAttribute('id');

    if (id) {
      const label = document.querySelector<HTMLLabelElement>(
        `label[for="${CSS.escape(id)}"]`,
      );
      if (label?.textContent) {
        return TextNormalizer.normalizeText(label.textContent);
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
        return TextNormalizer.normalizeText(text);
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

    const siblingText = this.findClosestText(element);
    if (siblingText) {
      return TextNormalizer.normalizeText(siblingText);
    }

    const name = element.getAttribute('name');
    if (name) {
      return TextNormalizer.normalizeText(name.replace(/[_-]+/g, ' '));
    }

    return '';
  }

  private findClosestText(element: HTMLElement): string {
    let current: HTMLElement | null =
      element.previousElementSibling as HTMLElement | null;

    for (let depth = 0; depth < 3 && current; depth += 1) {
      const text = current.textContent?.trim();
      if (text) {
        return text;
      }
      current = current.previousElementSibling as HTMLElement | null;
    }

    const parent = element.parentElement;
    if (parent) {
      const clone = parent.cloneNode(true) as HTMLElement;
      for (const child of clone.querySelectorAll('input, select, textarea')) {
        child.remove();
      }
      const text = clone.textContent?.trim();
      if (text) {
        return text;
      }
    }

    return '';
  }

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
        return TextNormalizer.normalizeText(input.value);
      });
    }

    return [];
  }

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
