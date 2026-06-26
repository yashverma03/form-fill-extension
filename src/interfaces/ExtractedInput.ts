import type { InputTypeEnum } from '../types/InputTypeEnum';

export interface ExtractedInput {
  element: HTMLElement;
  labelText: string;
  inputType: InputTypeEnum;
  currentValue: string;
  options: string[];
  contextText: string;
}
