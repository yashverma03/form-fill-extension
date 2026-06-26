import type { ExtractedInput } from './ExtractedInput';
import type { SkippedReason } from './SkippedReason';

/** A field paired with its resolved answer or skip reason, ready for patching. */
export interface ResolvedPatch {
  input: ExtractedInput;
  /** Null when skipped; otherwise the value to apply. */
  answer: string | null;
  /** Index into ANSWERS_CONFIG when matched; null when skipped. */
  configIndex: number | null;
  skippedReason?: SkippedReason;
}
