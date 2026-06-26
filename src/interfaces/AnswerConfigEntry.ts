import type { Pattern } from './Pattern';
import type { SubPatternEntry } from './SubPatternEntry';

/** One answer rule: match question patterns above threshold, optionally refine via sub-patterns. */
export interface AnswerConfigEntry {
  patterns: Pattern[];
  /** Minimum match score (0–100); first matching entry in config wins. */
  threshold: number;
  /** Checked in order; first match overrides `answer`. */
  subPatterns?: SubPatternEntry[];
  answer: string;
}
