import type { ExtractedInput } from './ExtractedInput';
import type { SkippedReason } from './SkippedReason';

export interface ResolvedPatch {
  input: ExtractedInput;
  answer: string | null;
  configIndex: number | null;
  skippedReason?: SkippedReason;
}
