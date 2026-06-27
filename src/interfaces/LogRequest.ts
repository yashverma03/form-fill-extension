/** Payload logged for each field during resolution (for tuning config). */
export interface LogRequest {
  /** Normalized label/question text sent to the matcher. */
  text: string;
  /** Full match string including attributes (name, id, autocomplete, etc.). */
  matchText?: string;
  /** Option labels when the field is a select or radio/checkbox group. */
  options?: string[];
  /** Structured attribute hints included in matching. */
  attributes?: {
    name?: string;
    id?: string;
    autocomplete?: string;
    ariaLabel?: string;
    placeholder?: string;
  };
}
