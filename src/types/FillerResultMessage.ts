import type { PatchResult } from '../interfaces/PatchResult';

/** Content script → popup: fill run outcome or top-level failure. */
export type FillerResultMessage = {
  type: 'FILLER_RESULT';
  result: PatchResult;
  /** Set when the pipeline throws before patching completes. */
  error?: string;
};
