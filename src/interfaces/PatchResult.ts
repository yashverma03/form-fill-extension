import type { PatchError } from './PatchError';

export interface PatchResult {
  patched: number;
  skipped: number;
  errors: PatchError[];
}
