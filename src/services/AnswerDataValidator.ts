import { QuestionIdEnum } from '../enums/QuestionIdEnum';

/** Verifies every QuestionIdEnum member has a corresponding entry in answers.data.ts. */
export class AnswerDataValidator {
  /** Throws listing missing question IDs so newly added enums can't be filled silently. */
  static validate(answers: Partial<Record<QuestionIdEnum, string>>): void {
    const missing = Object.values(QuestionIdEnum).filter(
      (questionId) => !(questionId in answers),
    );

    if (missing.length > 0) {
      throw new Error(
        `Missing answers.data.ts entries for: ${missing.join(', ')}`,
      );
    }
  }
}
