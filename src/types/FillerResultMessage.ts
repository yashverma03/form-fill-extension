import type { PatchResult } from '../interfaces/PatchResult';

export type FillerResultMessage = {
  type: 'FILLER_RESULT';
  result: PatchResult;
  error?: string;
};
