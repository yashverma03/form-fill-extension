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
}
