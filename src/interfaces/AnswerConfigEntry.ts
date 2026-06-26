import type { Pattern } from './Pattern';
import type { SubPatternEntry } from './SubPatternEntry';

export interface AnswerConfigEntry {
  patterns: Pattern[];
  threshold: number;
  subPatterns?: SubPatternEntry[];
  answer: string;
}
