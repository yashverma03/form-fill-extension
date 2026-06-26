import type { PatchResult } from '../interfaces/PatchResult';
import type { ResolvedPatch } from '../interfaces/ResolvedPatch';
import { InputTypeEnum } from '../enums/InputTypeEnum';
import { TextNormalizer } from '../utils/normalizeText';

export class FormPatcher {
  patch(resolved: ResolvedPatch[]): PatchResult {
    const result: PatchResult = {
      patched: 0,
      skipped: 0,
      errors: [],
    };

    for (const item of resolved) {
      if (item.skippedReason) {
        result.skipped += 1;
        continue;
      }

      if (item.answer === null) {
        result.skipped += 1;
        continue;
      }

      try {
        const applied = this.applyPatch(item);
        if (applied) {
          result.patched += 1;
        } else {
          result.skipped += 1;
        }
      } catch (error) {
        result.errors.push({
          inputLabel: item.input.labelText,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return result;
  }

  private applyPatch(item: ResolvedPatch): boolean {
    const { input, answer } = item;
    if (answer === null) {
      return false;
    }

    switch (input.inputType) {
      case InputTypeEnum.Select:
        return this.patchSelect(input.element, answer);
      case InputTypeEnum.Radio:
        return this.patchRadio(input.element, answer);
      case InputTypeEnum.Checkbox:
        return this.patchCheckbox(input.element, answer);
      default:
        return this.patchTextInput(input.element, answer);
    }
  }

  private patchTextInput(element: HTMLElement, answer: string): boolean {
    if (
      !(
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
      )
    ) {
      return false;
    }

    if (element.value.trim() !== '') {
      return false;
    }

    element.value = answer;
    this.dispatchInputEvents(element);
    return true;
  }

  private patchSelect(element: HTMLElement, answer: string): boolean {
    if (!(element instanceof HTMLSelectElement)) {
      return false;
    }

    if (element.selectedIndex > 0) {
      return false;
    }

    const targetIndex = this.findBestOptionIndex(
      Array.from(element.options).map((option) => option.text),
      answer,
    );

    if (targetIndex < 0) {
      return false;
    }

    element.selectedIndex = targetIndex;
    this.dispatchInputEvents(element);
    return true;
  }

  private patchRadio(element: HTMLElement, answer: string): boolean {
    if (!(element instanceof HTMLInputElement) || element.type !== 'radio') {
      return false;
    }

    const name = element.name;
    if (!name) {
      return false;
    }

    const group = document.querySelectorAll<HTMLInputElement>(
      `input[type="radio"][name="${CSS.escape(name)}"]`,
    );

    if (Array.from(group).some((radio) => radio.checked)) {
      return false;
    }

    const labels = Array.from(group).map((radio) => this.getRadioLabel(radio));
    const targetIndex = this.findBestOptionIndex(labels, answer);
    if (targetIndex < 0) {
      return false;
    }

    const target = group[targetIndex];
    if (!target) {
      return false;
    }

    target.checked = true;
    this.dispatchInputEvents(target);
    return true;
  }

  private patchCheckbox(element: HTMLElement, answer: string): boolean {
    if (!(element instanceof HTMLInputElement) || element.type !== 'checkbox') {
      return false;
    }

    if (element.checked) {
      return false;
    }

    const truthy = ['yes', 'true', '1', 'on'].includes(
      TextNormalizer.normalizeText(answer),
    );
    if (!truthy) {
      return false;
    }

    element.checked = true;
    this.dispatchInputEvents(element);
    return true;
  }

  private getRadioLabel(radio: HTMLInputElement): string {
    const id = radio.id;
    if (id) {
      const label = document.querySelector<HTMLLabelElement>(
        `label[for="${CSS.escape(id)}"]`,
      );
      if (label?.textContent) {
        return label.textContent;
      }
    }
    return radio.value;
  }

  private findBestOptionIndex(options: string[], answer: string): number {
    const normalizedAnswer = TextNormalizer.normalizeText(answer);
    let bestIndex = -1;
    let bestScore = 0;

    options.forEach((option, index) => {
      const normalizedOption = TextNormalizer.normalizeText(option);
      if (normalizedOption === normalizedAnswer) {
        bestIndex = index;
        bestScore = 100;
        return;
      }

      if (
        normalizedOption.includes(normalizedAnswer) ||
        normalizedAnswer.includes(normalizedOption)
      ) {
        const score = Math.min(
          normalizedAnswer.length,
          normalizedOption.length,
        );
        if (score > bestScore) {
          bestScore = score;
          bestIndex = index;
        }
      }
    });

    return bestIndex;
  }

  private dispatchInputEvents(element: HTMLElement): void {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }
}
