import { TextNormalizer } from './normalizeText';

/** Picks the best-matching option from a list for select/radio answers. */
export class ClosestOptionMatcher {
  /** Returns option index: exact match first, then longest substring overlap. */
  static findIndex(options: string[], answer: string): number {
    const normalizedAnswer = TextNormalizer.normalizeText(answer);
    let bestIndex = -1;
    let bestScore = 0;

    options.forEach((option, index) => {
      const normalizedOption = TextNormalizer.normalizeText(option);
      if (normalizedOption === normalizedAnswer) {
        bestIndex = index;
        bestScore = 100;
        return;
      }

      if (
        normalizedOption.includes(normalizedAnswer) ||
        normalizedAnswer.includes(normalizedOption)
      ) {
        const score = Math.min(normalizedAnswer.length, normalizedOption.length);
        if (score > bestScore) {
          bestScore = score;
          bestIndex = index;
        }
      }
    });

    return bestIndex;
  }

  /** Returns the option text at the best-matching index, or null. */
  static find(options: string[], answer: string): string | null {
    const index = ClosestOptionMatcher.findIndex(options, answer);
    if (index < 0) {
      return null;
    }

    return options[index] ?? null;
  }
}
