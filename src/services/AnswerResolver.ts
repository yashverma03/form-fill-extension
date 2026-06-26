import type { AnswerConfigEntry } from '../interfaces/AnswerConfigEntry';
import type { ExtractedInput } from '../interfaces/ExtractedInput';
import type { ResolvedPatch } from '../interfaces/ResolvedPatch';
import { InputTypeEnum } from '../enums/InputTypeEnum';
import { QuestionMatcher } from '../utils/matchQuestion';

export class AnswerResolver {
  constructor(private readonly config: AnswerConfigEntry[]) {}

  resolve(inputs: ExtractedInput[]): ResolvedPatch[] {
    return inputs.map((input) => this.resolveInput(input));
  }

  private resolveInput(input: ExtractedInput): ResolvedPatch {
    if (this.isAlreadyFilled(input)) {
      return {
        input,
        answer: null,
        configIndex: null,
        matchScore: 0,
        skippedReason: 'already_filled',
      };
    }

    const question = this.buildQuestionText(input);
    const winner = this.findBestMatch(question);

    if (!winner) {
      return {
        input,
        answer: null,
        configIndex: null,
        matchScore: 0,
        skippedReason: 'no_match',
      };
    }

    const answer = this.resolveAnswer(winner.entry, question);

    return {
      input,
      answer,
      configIndex: winner.index,
      matchScore: winner.score,
    };
  }

  private buildQuestionText(input: ExtractedInput): string {
    return [input.labelText, input.contextText, ...input.options]
      .filter(Boolean)
      .join(' ');
  }

  private findBestMatch(
    question: string,
  ): { entry: AnswerConfigEntry; index: number; score: number } | null {
    let best: {
      entry: AnswerConfigEntry;
      index: number;
      score: number;
    } | null = null;

    this.config.forEach((entry, index) => {
      const score = QuestionMatcher.matchQuestion(
        question,
        entry.threshold,
        entry.patterns,
      );
      if (score === 0) {
        return;
      }

      if (!best || score > best.score) {
        best = { entry, index, score };
      }
    });

    return best;
  }

  private resolveAnswer(
    entry: AnswerConfigEntry,
    question: string,
  ): string | null {
    if (!entry.subPatterns || entry.subPatterns.length === 0) {
      return entry.answer;
    }

    let bestSubScore = 0;
    let bestAnswer: string | null = null;

    for (const subPattern of entry.subPatterns) {
      const score = QuestionMatcher.matchQuestion(
        question,
        subPattern.threshold,
        subPattern.patterns,
      );
      if (score > bestSubScore) {
        bestSubScore = score;
        bestAnswer = subPattern.answer;
      }
    }

    return bestAnswer ?? entry.answer;
  }

  private isAlreadyFilled(input: ExtractedInput): boolean {
    const { element, inputType } = input;

    if (
      inputType === InputTypeEnum.Select &&
      element instanceof HTMLSelectElement
    ) {
      return element.selectedIndex > 0;
    }

    if (
      inputType === InputTypeEnum.Radio &&
      element instanceof HTMLInputElement
    ) {
      const name = element.name;
      if (!name) {
        return false;
      }
      return (
        document.querySelector<HTMLInputElement>(
          `input[type="radio"][name="${CSS.escape(name)}"]:checked`,
        ) !== null
      );
    }

    if (
      inputType === InputTypeEnum.Checkbox &&
      element instanceof HTMLInputElement
    ) {
      return element.checked;
    }

    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      return element.value.trim() !== '';
    }

    return input.currentValue.trim() !== '';
  }

  getQuestionText(input: ExtractedInput): string {
    return this.buildQuestionText(input);
  }

  getBestMatchScore(question: string): number {
    let bestScore = 0;

    for (const entry of this.config) {
      const score = QuestionMatcher.matchQuestion(
        question,
        entry.threshold,
        entry.patterns,
      );
      bestScore = Math.max(bestScore, score);
    }

    return bestScore;
  }
}
