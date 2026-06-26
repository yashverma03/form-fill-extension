/** Payload logged for each field during resolution (for tuning config). */
export interface LogRequest {
  /** Normalized label/question text sent to the matcher. */
  text: string;
  /** Option labels when the field is a select or radio/checkbox group. */
  options?: string[];
}
