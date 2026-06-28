import type { QuestionIdEnum } from '../enums/QuestionIdEnum';
import type { AnswerConfigEntry } from '../interfaces/AnswerConfigEntry';
import type { ExtractedInput } from '../interfaces/ExtractedInput';
import type { LogRequest } from '../interfaces/LogRequest';
import type { ResolvedPatch } from '../interfaces/ResolvedPatch';
import { InputTypeEnum } from '../enums/InputTypeEnum';
import { isSelectEmpty, getFormRoot } from '../utils/domForm';
import { ClosestOptionMatcher } from '../utils/findClosestOption';
import { QuestionMatcher } from '../utils/matchQuestion';

/** Maps extracted form fields to config answers via fuzzy question matching. */
export class AnswerResolver {
  constructor(
    private readonly config: AnswerConfigEntry[],
    private readonly answers: Partial<Record<QuestionIdEnum, string>>,
  ) {}

  resolve(inputs: ExtractedInput[]): ResolvedPatch[] {
    return inputs.map((input) => this.resolveInput(input));
  }

  getLogRequest(input: ExtractedInput): LogRequest {
    return {
      text: input.labelText,
      hints: input.questionHints,
      ...(input.options.length > 0 ? { options: input.options } : {}),
    };
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

    if (input.questionHints.length === 0) {
      return {
        input,
        answer: null,
        configIndex: null,
        skippedReason: 'no_match',
      };
    }

    const match = this.findFirstMatch(input.questionHints);
    if (!match) {
      return {
        input,
        answer: null,
        configIndex: null,
        skippedReason: 'no_match',
      };
    }

    const answer = this.resolveAnswer(input, match.entry);
    if (answer === null) {
      return {
        input,
        answer: null,
        configIndex: match.index,
        skippedReason: 'no_answer',
      };
    }

    return {
      input,
      answer,
      configIndex: match.index,
    };
  }

  /** First config entry where any hint matches a pattern. */
  private findFirstMatch(
    hints: string[],
  ): { entry: AnswerConfigEntry; index: number } | null {
    for (const [index, entry] of this.config.entries()) {
      if (QuestionMatcher.matchesHints(hints, entry.threshold, entry.patterns)) {
        return { entry, index };
      }
    }

    return null;
  }

  private resolveAnswer(
    input: ExtractedInput,
    entry: AnswerConfigEntry,
  ): string | null {
    let questionId = entry.questionId;

    if (entry.subPatterns && entry.subPatterns.length > 0) {
      for (const subPattern of entry.subPatterns) {
        if (
          QuestionMatcher.matchesHints(
            input.questionHints,
            subPattern.threshold,
            subPattern.patterns,
          )
        ) {
          questionId = subPattern.questionId;
          break;
        }
      }
    }

    const answer = this.getConfiguredAnswer(questionId);
    if (answer === null) {
      return null;
    }

    if (input.options.length === 0) {
      return answer;
    }

    return ClosestOptionMatcher.find(input.options, answer);
  }

  private getConfiguredAnswer(questionId: QuestionIdEnum): string | null {
    const answer = this.answers[questionId];
    if (answer === undefined || answer.trim() === '') {
      return null;
    }

    return answer;
  }

  private isAlreadyFilled(input: ExtractedInput): boolean {
    const { element, inputType } = input;

    if (
      inputType === InputTypeEnum.Select &&
      element instanceof HTMLSelectElement
    ) {
      return !isSelectEmpty(element);
    }

    if (
      inputType === InputTypeEnum.Radio &&
      element instanceof HTMLInputElement
    ) {
      const name = element.name;
      if (!name) {
        return false;
      }

      const formRoot = getFormRoot(element);
      return (
        formRoot.querySelector<HTMLInputElement>(
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

    if (element.isContentEditable) {
      return (element.textContent?.trim() ?? '') !== '';
    }

    return input.currentValue.trim() !== '';
  }
}
