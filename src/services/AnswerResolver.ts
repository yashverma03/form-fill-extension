import type { QuestionIdEnum } from '../enums/QuestionIdEnum';
import type { AnswerConfigEntry } from '../interfaces/AnswerConfigEntry';
import type { ExtractedInput } from '../interfaces/ExtractedInput';
import type { LogRequest } from '../interfaces/LogRequest';
import type { ResolvedPatch } from '../interfaces/ResolvedPatch';
import { InputTypeEnum } from '../enums/InputTypeEnum';
import { isSelectEmpty, getFormRoot } from '../utils/domForm';
import { ClosestOptionMatcher } from '../utils/findClosestOption';
import { QuestionMatcher } from '../utils/matchQuestion';
import { TextNormalizer } from '../utils/normalizeText';

/** Maps extracted form fields to config answers via fuzzy question matching. */
export class AnswerResolver {
  constructor(
    private readonly config: AnswerConfigEntry[],
    private readonly answers: Partial<Record<QuestionIdEnum, string>>,
  ) {}

  /** Resolves an answer (or skip reason) for every extracted input. */
  resolve(inputs: ExtractedInput[]): ResolvedPatch[] {
    return inputs.map((input) => this.resolveInput(input));
  }

  /** Builds the log payload for a field (label text and options when present). */
  getLogRequest(input: ExtractedInput): LogRequest {
    const request: LogRequest = { text: input.labelText };
    if (input.options.length > 0) {
      request.options = input.options;
    }
    return request;
  }

  /** Skips filled fields, then matches config and resolves the final answer. */
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
    if (!question) {
      return {
        input,
        answer: null,
        configIndex: null,
        skippedReason: 'no_match',
      };
    }

    const match = this.findFirstMatch(question);

    if (!match) {
      return {
        input,
        answer: null,
        configIndex: null,
        skippedReason: 'no_match',
      };
    }

    const answer = this.resolveAnswer(input, match.entry, question);

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

  /** Combines label and section context for more reliable matching. */
  private buildQuestionText(input: ExtractedInput): string {
    const parts = [input.labelText, input.contextText].filter(
      (part) => part.trim().length > 0,
    );

    return TextNormalizer.normalizeText(parts.join(' '));
  }

  /** Returns the first config entry whose patterns meet the threshold (order matters). */
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

  /** Applies sub-patterns for overrides, then snaps the answer to the closest option. */
  private resolveAnswer(
    input: ExtractedInput,
    entry: AnswerConfigEntry,
    question: string,
  ): string | null {
    let questionId = entry.questionId;

    if (entry.subPatterns && entry.subPatterns.length > 0) {
      for (const subPattern of entry.subPatterns) {
        if (
          QuestionMatcher.matches(
            question,
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

  /** Returns a configured answer only when explicitly set and non-empty. */
  private getConfiguredAnswer(questionId: QuestionIdEnum): string | null {
    const answer = this.answers[questionId];
    if (answer === undefined || answer.trim() === '') {
      return null;
    }

    return answer;
  }

  /** Detects existing user input per control type (select index, checked state, value). */
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

    return input.currentValue.trim() !== '';
  }
}
