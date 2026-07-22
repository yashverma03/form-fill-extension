import { TextNormalizer } from './normalizeText';

const EMPTY_OPTION_LABELS = new Set([
  '',
  'select',
  'select type',
  'select country',
  'select source',
  'choose',
  'choose one',
]);

/** Options that substring-match common country answers but are never the intended country. */
const EXCLUDED_OPTION_LABELS = new Set([
  'british indian ocean territory',
]);

const BOOLEAN_NO_ANSWERS = new Set([
  'no',
  'false',
  '0',
  'not applicable',
  'n a',
  'na',
  'none',
  'nope',
]);

const BOOLEAN_YES_ANSWERS = new Set(['yes', 'true', '1', 'yep']);

/** Picks the best-matching option from a list for select/radio answers. */
export class ClosestOptionMatcher {
  /** Returns option index: exact match first, then longest substring overlap. */
  static findIndex(options: string[], answer: string): number {
    const normalizedAnswer = TextNormalizer.normalizeText(answer);
    const booleanTarget = ClosestOptionMatcher.resolveBooleanOption(
      normalizedAnswer,
    );

    let bestIndex = -1;
    let bestScore = 0;

    options.forEach((option, index) => {
      const normalizedOption = TextNormalizer.normalizeText(option);

      if (
        EMPTY_OPTION_LABELS.has(normalizedOption) ||
        EXCLUDED_OPTION_LABELS.has(normalizedOption)
      ) {
        return;
      }

      if (normalizedOption === normalizedAnswer) {
        bestIndex = index;
        bestScore = 100;
        return;
      }

      if (
        booleanTarget &&
        (normalizedOption === booleanTarget ||
          normalizedOption.startsWith(`${booleanTarget} `))
      ) {
        bestIndex = index;
        bestScore = 100;
        return;
      }

      if (
        normalizedOption.includes(normalizedAnswer) ||
        normalizedAnswer.includes(normalizedOption)
      ) {
        const score = Math.min(
          normalizedAnswer.length,
          normalizedOption.length,
        );
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

  /** Maps free-text answers to yes/no option labels when possible. */
  private static resolveBooleanOption(
    normalizedAnswer: string,
  ): 'yes' | 'no' | null {
    if (BOOLEAN_YES_ANSWERS.has(normalizedAnswer)) {
      return 'yes';
    }

    if (BOOLEAN_NO_ANSWERS.has(normalizedAnswer)) {
      return 'no';
    }

    return null;
  }
}
