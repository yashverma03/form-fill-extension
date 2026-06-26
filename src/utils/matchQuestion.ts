import type { Pattern } from '../interfaces/Pattern';
import { TextNormalizer } from './normalizeText';

/** Scores how well a form question matches config patterns. */
export class QuestionMatcher {
  /** True when any pattern scores at or above `threshold`. */
  static matches(
    question: string,
    threshold: number,
    patterns: Pattern[],
  ): boolean {
    for (const pattern of patterns) {
      if (QuestionMatcher.patternScore(question, pattern) >= threshold) {
        return true;
      }
    }

    return false;
  }

  /** Substring match on question or pattern; regex patterns are all-or-nothing. */
  private static stringPatternScore(question: string, pattern: string): number {
    const normalizedQuestion = TextNormalizer.normalizeText(question);
    const normalizedPattern = TextNormalizer.normalizeText(pattern);

    if (normalizedPattern.length === 0 || normalizedQuestion.length === 0) {
      return 0;
    }

    if (normalizedQuestion.includes(normalizedPattern)) {
      return 100;
    }

    return 0;
  }

  /** RegExp patterns are all-or-nothing; strings use substring scoring. */
  private static patternScore(question: string, pattern: Pattern): number {
    if (pattern instanceof RegExp) {
      return pattern.test(TextNormalizer.normalizeText(question)) ? 100 : 0;
    }

    return QuestionMatcher.stringPatternScore(question, pattern);
  }
}
