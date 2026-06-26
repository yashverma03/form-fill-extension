import { partial_ratio, token_set_ratio } from 'fuzzball';
import type { Pattern } from '../interfaces/Pattern';
import { TextNormalizer } from './normalizeText';

const MIN_FUZZY_WORD_LENGTH = 3;

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

  /** Substring match first, then fuzzball token/partial ratio when all pattern words appear. */
  private static stringPatternScore(question: string, pattern: string): number {
    const normalizedQuestion = TextNormalizer.normalizeText(question);
    const normalizedPattern = TextNormalizer.normalizeText(pattern);

    if (normalizedPattern.length === 0 || normalizedQuestion.length === 0) {
      return 0;
    }

    if (normalizedQuestion.includes(normalizedPattern)) {
      return 100;
    }

    if (
      !QuestionMatcher.patternWordsAppearInQuestion(
        normalizedPattern,
        normalizedQuestion,
      )
    ) {
      return 0;
    }

    return Math.max(
      token_set_ratio(normalizedPattern, normalizedQuestion),
      partial_ratio(normalizedPattern, normalizedQuestion),
    );
  }

  /** Requires significant pattern tokens to appear in the question before fuzzy scoring. */
  private static patternWordsAppearInQuestion(
    pattern: string,
    question: string,
  ): boolean {
    const words = pattern
      .split(/\s+/) // split pattern into words on whitespace
      .filter((word) => word.length >= MIN_FUZZY_WORD_LENGTH);

    if (words.length === 0) {
      return false;
    }

    return words.every((word) =>
      // \bword\b = whole-word match (avoids "work" matching inside "working")
      new RegExp(`\\b${QuestionMatcher.escapeRegExp(word)}\\b`).test(question),
    );
  }

  /** Escapes regex metacharacters so a literal string is safe inside RegExp. */
  private static escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // prefix special chars with backslash
  }

  /** RegExp patterns are all-or-nothing; strings use substring + fuzzball scoring. */
  private static patternScore(question: string, pattern: Pattern): number {
    if (pattern instanceof RegExp) {
      return pattern.test(TextNormalizer.normalizeText(question)) ? 100 : 0;
    }

    return QuestionMatcher.stringPatternScore(question, pattern);
  }
}
