/** Normalizes text for case-insensitive fuzzy comparison. */
export class TextNormalizer {
  /** Lowercases, strips punctuation, and collapses whitespace. */
  static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // punctuation/symbols → space
      .replace(/\s+/g, ' ') // collapse runs of whitespace
      .trim();
  }
}
