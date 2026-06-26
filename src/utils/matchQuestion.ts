import type { Pattern } from '../interfaces/Pattern';
import { TextNormalizer } from './normalizeText';

export class QuestionMatcher {
  static matchQuestion(
    question: string,
    threshold: number,
    patterns: Pattern[],
  ): number {
    let bestScore = 0;

    for (const pattern of patterns) {
      bestScore = Math.max(
        bestScore,
        QuestionMatcher.scorePattern(question, pattern),
      );
    }

    return bestScore >= threshold ? bestScore : 0;
  }

  private static longestCommonSubstringLength(a: string, b: string): number {
    if (a.length === 0 || b.length === 0) {
      return 0;
    }

    const rows = a.length + 1;
    const cols = b.length + 1;
    let previous = new Array<number>(cols).fill(0);
    let current = new Array<number>(cols).fill(0);
    let maxLength = 0;

    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        if (a[i - 1] === b[j - 1]) {
          current[j] = (previous[j - 1] ?? 0) + 1;
          maxLength = Math.max(maxLength, current[j] ?? 0);
        } else {
          current[j] = 0;
        }
      }
      previous = [...current];
    }

    return maxLength;
  }

  private static scoreStringPattern(question: string, pattern: string): number {
    const normalizedQuestion = TextNormalizer.normalizeText(question);
    const normalizedPattern = TextNormalizer.normalizeText(pattern);

    if (normalizedPattern.length === 0) {
      return 0;
    }

    if (normalizedQuestion.includes(normalizedPattern)) {
      return 100;
    }

    const matchingChars = QuestionMatcher.longestCommonSubstringLength(
      normalizedQuestion,
      normalizedPattern,
    );
    return (matchingChars / normalizedPattern.length) * 100;
  }

  private static scorePattern(question: string, pattern: Pattern): number {
    if (pattern instanceof RegExp) {
      return pattern.test(TextNormalizer.normalizeText(question)) ? 100 : 0;
    }

    return QuestionMatcher.scoreStringPattern(question, pattern);
  }
}
