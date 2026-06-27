import type { InputTypeEnum } from '../types/InputTypeEnum';

/** Metadata captured from one fillable DOM control. */
export interface ExtractedInput {
  element: HTMLElement;
  /** Primary question text used for config matching. */
  labelText: string;
  inputType: InputTypeEnum;
  currentValue: string;
  /** Labels for select options or radio/checkbox group members. */
  options: string[];
  /** Surrounding section/heading text for context. */
  contextText: string;
  /** HTML name attribute, normalized for matching. */
  name: string;
  /** HTML id attribute, normalized for matching. */
  id: string;
  /** autocomplete attribute value. */
  autocomplete: string;
  /** aria-label when present. */
  ariaLabel: string;
  /** placeholder when present. */
  placeholder: string;
  /** title attribute when present. */
  title: string;
  /** Text from aria-describedby targets when present. */
  ariaDescribedBy: string;
}
