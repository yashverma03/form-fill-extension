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
        skippedReason: 'already_filled',
      };
    }

    const question = this.buildQuestionText(input);
    const match = this.findFirstMatch(question);

    if (!match) {
      return {
        input,
        answer: null,
        configIndex: null,
        skippedReason: 'no_match',
      };
    }

    const answer = this.resolveAnswer(match.entry, question);

    return {
      input,
      answer,
      configIndex: match.index,
    };
  }

  private buildQuestionText(input: ExtractedInput): string {
    return [input.labelText, input.contextText, ...input.options]
      .filter(Boolean)
      .join(' ');
  }

  private findFirstMatch(
    question: string,
  ): { entry: AnswerConfigEntry; index: number } | null {
    for (const [index, entry] of this.config.entries()) {
      if (QuestionMatcher.matches(question, entry.threshold, entry.patterns)) {
        return { entry, index };
      }
    }

    return null;
  }

  private resolveAnswer(
    entry: AnswerConfigEntry,
    question: string,
  ): string | null {
    if (!entry.subPatterns || entry.subPatterns.length === 0) {
      return entry.answer;
    }

    for (const subPattern of entry.subPatterns) {
      if (
        QuestionMatcher.matches(
          question,
          subPattern.threshold,
          subPattern.patterns,
        )
      ) {
        return subPattern.answer;
      }
    }

    return entry.answer;
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
}
