/** Payload logged for each field during resolution (for tuning config). */
export interface LogRequest {
  /** Primary label text for the field. */
  text: string;
  /** Question-identifying hints, highest-priority first. */
  hints?: string[];
  /** Option labels when the field is a select or radio/checkbox group. */
  options?: string[];
}
