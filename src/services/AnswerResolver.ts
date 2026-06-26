import type { AnswerConfigEntry } from '../interfaces/AnswerConfigEntry';
import type { ExtractedInput } from '../interfaces/ExtractedInput';
import type { LogRequest } from '../interfaces/LogRequest';
import type { ResolvedPatch } from '../interfaces/ResolvedPatch';
import { InputTypeEnum } from '../enums/InputTypeEnum';
import { ClosestOptionMatcher } from '../utils/findClosestOption';
import { QuestionMatcher } from '../utils/matchQuestion';

export class AnswerResolver {
  constructor(private readonly config: AnswerConfigEntry[]) {}

  resolve(inputs: ExtractedInput[]): ResolvedPatch[] {
    return inputs.map((input) => this.resolveInput(input));
  }

  getLogRequest(input: ExtractedInput): LogRequest {
    const request: LogRequest = { text: input.labelText };
    if (input.options.length > 0) {
      request.options = input.options;
    }
    return request;
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

    const question = input.labelText;
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

    return {
      input,
      answer,
      configIndex: match.index,
    };
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
    input: ExtractedInput,
    entry: AnswerConfigEntry,
    question: string,
  ): string | null {
    let answer = entry.answer;

    if (entry.subPatterns && entry.subPatterns.length > 0) {
      for (const subPattern of entry.subPatterns) {
        if (
          QuestionMatcher.matches(
            question,
            subPattern.threshold,
            subPattern.patterns,
          )
        ) {
          answer = subPattern.answer;
          break;
        }
      }
    }

    if (input.options.length === 0) {
      return answer;
    }

    return ClosestOptionMatcher.find(input.options, answer) ?? answer;
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
}
