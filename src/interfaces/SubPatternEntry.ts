import type { Pattern } from './Pattern';

/** Narrower pattern set that overrides the parent entry's answer when matched. */
export interface SubPatternEntry {
  patterns: Pattern[];
  /** Minimum match score (0–100) required to use this sub-answer. */
  threshold: number;
  answer: string;
}
