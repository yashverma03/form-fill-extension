import type { AnswerConfigEntry } from '../interfaces/AnswerConfigEntry';

/**
 * Example answer config — copy to answers.config.ts and fill in your data:
 *
 *   cp src/config/answers.config.example.ts src/config/answers.config.ts
 */
export const ANSWERS_CONFIG: AnswerConfigEntry[] = [
  {
    patterns: ['first name', 'given name', /^first$/],
    threshold: 80,
    answer: 'John',
  },
  {
    patterns: ['last name', 'surname', 'family name', /^last$/],
    threshold: 80,
    answer: 'Doe',
  },
  {
    patterns: ['email', 'e-mail', 'email address'],
    threshold: 90,
    answer: 'john.doe@example.com',
  },
  {
    patterns: [
      'phone',
      'mobile',
      'contact number',
      'phone number',
      'cell',
      'telephone',
      /phone|mobile|contact/,
    ],
    threshold: 70,
    answer: '+91 9876543210',
  },
  {
    patterns: [
      'current salary',
      'current ctc',
      'present salary',
      /current.*(salary|ctc)/,
    ],
    threshold: 70,
    subPatterns: [
      { patterns: ['lpa', 'lakhs', 'lakh'], threshold: 60, answer: '12' },
      {
        patterns: ['monthly', 'per month', 'pm'],
        threshold: 60,
        answer: '100000',
      },
      {
        patterns: ['annual', 'yearly', 'per annum', 'pa'],
        threshold: 60,
        answer: '1200000',
      },
    ],
    answer: '12',
  },
  {
    patterns: [
      'expected salary',
      'expected ctc',
      'desired salary',
      /expected.*(salary|ctc)/,
    ],
    threshold: 70,
    subPatterns: [
      { patterns: ['lpa', 'lakhs', 'lakh'], threshold: 60, answer: '18' },
      {
        patterns: ['monthly', 'per month', 'pm'],
        threshold: 60,
        answer: '150000',
      },
      {
        patterns: ['annual', 'yearly', 'per annum', 'pa'],
        threshold: 60,
        answer: '1800000',
      },
    ],
    answer: '18',
  },
  {
    patterns: [
      'notice period',
      'notice',
      'when can you join',
      /notice.*period/,
    ],
    threshold: 70,
    answer: '30',
  },
  {
    patterns: ['linkedin', 'linkedin profile', 'linkedin url'],
    threshold: 85,
    answer: 'https://linkedin.com/in/johndoe',
  },
  {
    patterns: ['years of experience', 'total experience', /experience.*year/],
    threshold: 70,
    answer: '4',
  },
];
