import type { InputTypeEnum } from '../types/InputTypeEnum';

export interface LogRequest {
  text: string;
  type: InputTypeEnum;
  options: string[];
}
