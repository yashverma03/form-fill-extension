import type { InputTypeEnum } from '../types/InputTypeEnum';

/** Metadata captured from one fillable DOM control. */
export interface ExtractedInput {
  element: HTMLElement;
  /** Primary label text for logging and error messages. */
  labelText: string;
  /** Question-identifying strings, highest-priority first. */
  questionHints: string[];
  inputType: InputTypeEnum;
  currentValue: string;
  /** Labels for select options or radio/checkbox group members. */
  options: string[];
}
