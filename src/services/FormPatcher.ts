import type { PatchResult } from '../interfaces/PatchResult';
import type { ResolvedPatch } from '../interfaces/ResolvedPatch';
import { InputTypeEnum } from '../enums/InputTypeEnum';
import {
  dispatchInputEvents,
  getFormRoot,
  isInteractable,
  isSelectEmpty,
  setNativeInputValue,
  setNativeSelectValue,
} from '../utils/domForm';
import { ClosestOptionMatcher } from '../utils/findClosestOption';
import { TextNormalizer } from '../utils/normalizeText';

/** Applies resolved answers to DOM form controls, skipping already-filled fields. */
export class FormPatcher {
  private readonly patchedRadioGroups = new Set<string>();
  private readonly patchedSelects = new Set<HTMLSelectElement>();

  /** Runs patches for each resolved item and tallies patched, skipped, and errored counts. */
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

  /** Dispatches to the input-type-specific patcher. */
  private applyPatch(item: ResolvedPatch): boolean {
    const { input, answer } = item;
    if (answer === null || !isInteractable(input.element)) {
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

  /** Sets value on empty text inputs, textareas, and contenteditable fields. */
  private patchTextInput(element: HTMLElement, answer: string): boolean {
    if (element.isContentEditable) {
      if ((element.textContent?.trim() ?? '') !== '') {
        return false;
      }

      element.textContent = answer;
      dispatchInputEvents(element);
      return true;
    }

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

    setNativeInputValue(element, answer);
    dispatchInputEvents(element);
    return true;
  }

  /** Selects the closest matching option when nothing meaningful is selected yet. */
  private patchSelect(element: HTMLElement, answer: string): boolean {
    if (!(element instanceof HTMLSelectElement)) {
      return false;
    }

    if (this.patchedSelects.has(element) || !isSelectEmpty(element)) {
      return false;
    }

    const options = Array.from(element.options);
    const targetIndex = ClosestOptionMatcher.findIndex(
      options.map((option) => option.text),
      answer,
    );

    if (targetIndex < 0) {
      return false;
    }

    const targetOption = options[targetIndex];
    if (!targetOption) {
      return false;
    }

    element.selectedIndex = targetIndex;
    setNativeSelectValue(element, targetOption.value);
    this.patchedSelects.add(element);
    dispatchInputEvents(element);
    return true;
  }

  /** Checks the closest-matching radio in the group when none is selected. */
  private patchRadio(element: HTMLElement, answer: string): boolean {
    if (!(element instanceof HTMLInputElement) || element.type !== 'radio') {
      return false;
    }

    const name = element.name;
    if (!name) {
      return false;
    }

    const groupKey = `${getFormRoot(element) === document ? 'document' : 'form'}:radio:${name}`;
    if (this.patchedRadioGroups.has(groupKey)) {
      return false;
    }

    const formRoot = getFormRoot(element);
    const group = formRoot.querySelectorAll<HTMLInputElement>(
      `input[type="radio"][name="${CSS.escape(name)}"]`,
    );

    if (Array.from(group).some((radio) => radio.checked)) {
      return false;
    }

    const labels = Array.from(group).map((radio) => this.getRadioLabel(radio));
    const targetIndex = ClosestOptionMatcher.findIndex(labels, answer);
    if (targetIndex < 0) {
      return false;
    }

    const target = group[targetIndex];
    if (!target) {
      return false;
    }

    target.checked = true;
    this.patchedRadioGroups.add(groupKey);
    dispatchInputEvents(target);
    return true;
  }

  /** Checks the box when the answer matches a truthy value or option label. */
  private patchCheckbox(element: HTMLElement, answer: string): boolean {
    if (!(element instanceof HTMLInputElement) || element.type !== 'checkbox') {
      return false;
    }

    if (element.checked) {
      return false;
    }

    const label = this.getRadioLabel(element);
    const normalizedAnswer = TextNormalizer.normalizeText(answer);
    const normalizedLabel = TextNormalizer.normalizeText(label);
    const normalizedValue = TextNormalizer.normalizeText(element.value);

    const truthy = ['yes', 'true', '1', 'on', 'accepted'].includes(
      normalizedAnswer,
    );
    const labelMatches =
      normalizedAnswer === normalizedLabel ||
      normalizedAnswer === normalizedValue ||
      normalizedLabel.includes(normalizedAnswer) ||
      normalizedAnswer.includes(normalizedLabel);

    if (!truthy && !labelMatches) {
      return false;
    }

    element.checked = true;
    dispatchInputEvents(element);
    return true;
  }

  /** Resolves display text from an associated label, falling back to value. */
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

    const parentLabel = radio.closest('label');
    if (parentLabel?.textContent) {
      return parentLabel.textContent;
    }

    return radio.value;
  }
}
