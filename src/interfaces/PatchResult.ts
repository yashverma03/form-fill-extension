import type { PatchError } from './PatchError';

/** Summary returned after applying all resolved patches to the page. */
export interface PatchResult {
  patched: number;
  skipped: number;
  errors: PatchError[];
}
