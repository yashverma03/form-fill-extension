import type { ExtractedInput } from '../interfaces/ExtractedInput';
import { TextNormalizer } from './normalizeText';

/** Normalizes attribute values for matching (kebab/snake case → words). */
export function normalizeAttributeText(value: string | null | undefined): string {
  if (!value?.trim()) {
    return '';
  }

  return TextNormalizer.normalizeText(value.replace(/[_-]+/g, ' '));
}

/** Structured fields matched separately when the combined label text is ambiguous. */
export function getStructuredMatchFields(input: ExtractedInput): string[] {
  const fields = [
    input.name,
    input.id,
    input.autocomplete,
    input.ariaLabel,
    input.placeholder,
    input.title,
    input.ariaDescribedBy,
  ];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const field of fields) {
    const normalized = normalizeAttributeText(field);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

/** Combines label, context, and attribute hints into one match string. */
export function buildMatchText(input: ExtractedInput): string {
  const parts = [
    input.labelText,
    input.contextText,
    ...getStructuredMatchFields(input),
  ].filter((part) => part.trim().length > 0);

  return TextNormalizer.normalizeText(parts.join(' '));
}
