import type { Pattern } from './Pattern';

export interface SubPatternEntry {
  patterns: Pattern[];
  threshold: number;
  answer: string;
}
