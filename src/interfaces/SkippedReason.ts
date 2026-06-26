/** Why a field was not patched during resolution. */
export type SkippedReason =
  | 'already_filled'
  | 'no_match'
  | 'no_answer'
  | 'below_threshold';
