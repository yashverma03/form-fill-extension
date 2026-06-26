import type { AnswerConfigEntry } from '../interfaces/AnswerConfigEntry';

/**
 * Example answer config — copy to answers.config.ts and fill in your data:
 *
 *   cp src/config/answers.config.example.ts src/config/answers.config.ts
 *
 * First matching entry wins; order entries by specificity.
 */
export const ANSWERS_CONFIG: AnswerConfigEntry[] = [
  // ── Identity (high priority, specific first) ──────────────────────────
  {
    patterns: ['first name', 'given name', 'forename', /^first$/],
    threshold: 55,
    answer: 'Jane',
  },
  {
    patterns: ['last name', 'surname', 'family name', /^last$/],
    threshold: 55,
    answer: 'Doe',
  },
  {
    patterns: ['legal name', 'full name', 'name as per'],
    threshold: 45,
    answer: 'Jane Doe',
  },
  {
    patterns: ['preferred name', 'nickname', 'name you go by'],
    threshold: 40,
    answer: 'Jane',
  },

  // ── Contact ───────────────────────────────────────────────────────────
  {
    patterns: ['email', 'e-mail', 'email address', 'work email'],
    threshold: 55,
    answer: 'jane@example.com',
  },
  {
    patterns: ['device type', 'mobile type', 'phone type', 'contact type'],
    threshold: 50,
    answer: 'Mobile',
  },
  {
    patterns: [
      'preferred contact',
      'contact method',
      'how should we contact',
      'best way to reach',
    ],
    threshold: 35,
    answer: 'Email',
  },
  {
    patterns: [
      'phone number',
      'phone no',
      'mobile number',
      'cell number',
      'contact number',
      'telephone',
      'whatsapp',
      'alternate phone',
      'secondary phone',
      /phone\s*number/,
      /^phone$/,
      /^mobile$/,
    ],
    threshold: 50,
    answer: '+1 555 0100',
  },

  // ── Employment (current) ──────────────────────────────────────────────
  {
    patterns: [
      'current job title',
      'present job title',
      'current designation',
      'present designation',
      'current role',
    ],
    threshold: 45,
    answer: 'Engineer',
  },
  {
    patterns: [
      'current company',
      'present company',
      'current employer',
      'present employer',
      'company you work',
    ],
    threshold: 45,
    answer: 'Acme',
  },
  {
    patterns: [
      'current location',
      'current city',
      'present location',
      'where are you located',
      'city you are based',
    ],
    threshold: 40,
    answer: 'NYC',
  },
  {
    patterns: [
      'years of experience',
      'total experience',
      'overall experience',
      'years of relevant experience',
      /experience.*year/,
      /years.*experience/,
    ],
    threshold: 45,
    answer: '3',
  },

  // ── Compensation & availability ─────────────────────────────────────
  {
    patterns: [
      'current salary',
      'current ctc',
      'present salary',
      'present ctc',
      'current compensation',
      /current.*(salary|ctc|compensation)/,
    ],
    threshold: 45,
    subPatterns: [
      { patterns: ['lpa', 'lakhs', 'lakh'], threshold: 40, answer: '10' },
    ],
    answer: '10',
  },
  {
    patterns: [
      'expected salary',
      'expected ctc',
      'desired salary',
      'desired ctc',
      'salary expectation',
      'compensation expectation',
      /expected.*(salary|ctc|compensation)/,
    ],
    threshold: 45,
    subPatterns: [
      { patterns: ['lpa', 'lakhs', 'lakh'], threshold: 40, answer: '15' },
    ],
    answer: '15',
  },
  {
    patterns: [
      'competing offer ctc',
      'competing offer salary',
      'other offer ctc',
      'other offer salary',
      'competing compensation',
      'other offer compensation',
      'offer ctc',
      'offer salary',
      'competing offer',
      'other offer',
      'another offer',
      'counter offer',
      'offer in hand',
      'holding offer',
      'existing offer',
      'multiple offers',
      'other job offer',
      'parallel offer',
      'offer from another',
      'do you have an offer',
      'any other offer',
      'offer elsewhere',
      /competing.*(ctc|salary|compensation|offer)/,
      /other.*offer/,
    ],
    threshold: 45,
    subPatterns: [
      { patterns: ['lpa', 'lakhs', 'lakh'], threshold: 40, answer: '16' },
    ],
    answer: '16',
  },
  {
    patterns: ['salary negotiable', 'open to negotiation', 'negotiable'],
    threshold: 30,
    answer: 'Yes',
  },
  {
    patterns: [
      'notice period',
      'serving notice',
      'notice in days',
      /notice.*period/,
    ],
    threshold: 45,
    answer: '30',
  },
  {
    patterns: [
      'when can you join',
      'joining time',
      'earliest start',
      'available to start',
      'start date',
      'date available',
    ],
    threshold: 35,
    answer: '30 days',
  },

  // ── Links & portfolio ─────────────────────────────────────────────────
  {
    patterns: ['linkedin', 'linkedin profile', 'linkedin url', 'linkedin link'],
    threshold: 60,
    answer: 'https://linkedin.com/in/janedoe',
  },
  {
    patterns: ['github', 'github profile', 'github url', 'github link'],
    threshold: 60,
    answer: 'https://github.com/janedoe',
  },
  {
    patterns: [
      'portfolio',
      'personal website',
      'website url',
      'portfolio url',
      'personal site',
      /portfolio|website/,
    ],
    threshold: 45,
    answer: 'https://jane.dev',
  },
  {
    patterns: ['leetcode', 'hackerrank', 'codility', 'codechef', 'codeforces'],
    threshold: 55,
    answer: 'https://leetcode.com/janedoe',
  },

  // ── Location & address ────────────────────────────────────────────────
  {
    patterns: ['country of residence', 'country you live', 'residence country'],
    threshold: 35,
    answer: 'USA',
  },
  {
    patterns: ['country', 'nation', 'which country'],
    threshold: 50,
    answer: 'USA',
  },
  {
    patterns: ['nationality', 'citizenship', 'citizen of'],
    threshold: 35,
    answer: 'American',
  },
  {
    patterns: ['city', 'town', 'municipality'],
    threshold: 50,
    answer: 'NYC',
  },
  {
    patterns: ['state', 'province', 'region', 'county'],
    threshold: 50,
    answer: 'NY',
  },
  {
    patterns: [
      'address line 1',
      'street address',
      'address 1',
      'house number',
      'flat no',
      'apartment',
    ],
    threshold: 45,
    answer: '1 Main St',
  },
  {
    patterns: ['address line 2', 'address 2', 'landmark', 'area', 'locality'],
    threshold: 45,
    answer: 'Apt 2',
  },
  {
    patterns: [
      'pin code',
      'pincode',
      'postal code',
      'zip code',
      'zip',
      'postcode',
    ],
    threshold: 50,
    answer: '10001',
  },
  {
    patterns: [
      'full address',
      'current address',
      'permanent address',
      'mailing address',
    ],
    threshold: 40,
    answer: '1 Main St, NYC, NY 10001',
  },

  // ── Work preferences ──────────────────────────────────────────────────
  {
    patterns: [
      'willing to relocate',
      'open to relocation',
      'relocate',
      'relocation',
    ],
    threshold: 25,
    answer: 'Yes',
  },
  {
    patterns: [
      'employment type',
      'job type',
      'full time',
      'part time',
      'contract',
    ],
    threshold: 40,
    answer: 'Full-time',
  },
  {
    patterns: ['willing to travel', 'travel required', 'business travel'],
    threshold: 25,
    answer: 'Yes',
  },
  {
    patterns: ['shift', 'night shift', 'rotational shift', 'work shift'],
    threshold: 40,
    answer: 'Day',
  },

  // ── Work authorization & compliance ───────────────────────────────────
  {
    patterns: [
      'legally authorized',
      'authorized to work',
      'work authorization',
      'work eligibility',
      'eligible to work',
      'right to work',
    ],
    threshold: 10,
    answer: 'Yes',
  },
  {
    patterns: [
      'visa sponsorship',
      'require sponsorship',
      'need sponsorship',
      'immigration sponsorship',
      'work visa',
    ],
    threshold: 10,
    answer: 'No',
  },
  {
    patterns: ['work permit', 'permit expiry', 'visa expiry', 'visa status'],
    threshold: 10,
    answer: 'N/A',
  },
  {
    patterns: [
      'conflict of interest',
      'financial interest',
      'outside business interest',
    ],
    threshold: 10,
    answer: 'No',
  },
  {
    patterns: [
      'relative working',
      'family member employed',
      'know anyone at',
      'employee referral relation',
    ],
    threshold: 10,
    answer: 'No',
  },
  {
    patterns: [
      'non-compete',
      'non compete',
      'restrictive covenant',
      'bound by agreement',
    ],
    threshold: 10,
    answer: 'No',
  },
  {
    patterns: [
      'background check',
      'criminal record',
      'felony',
      'convicted',
      'criminal history',
    ],
    threshold: 10,
    answer: 'No',
  },
  {
    patterns: ['security clearance', 'government clearance'],
    threshold: 10,
    answer: 'No',
  },
  {
    patterns: [
      'terms and conditions',
      'privacy policy',
      'consent',
      'agree to',
      'i confirm',
      'i certify',
      'declaration',
      'accuracy of information',
    ],
    threshold: 10,
    answer: 'Yes',
  },

  // ── EEO / voluntary disclosure ────────────────────────────────────────
  {
    patterns: ['gender', 'sex'],
    threshold: 40,
    answer: 'Female',
  },
  {
    patterns: ['pronouns', 'preferred pronouns'],
    threshold: 35,
    answer: 'She/Her',
  },
  {
    patterns: ['date of birth', 'dob', 'birth date', 'birthday'],
    threshold: 50,
    answer: '01/01/1998',
  },
  {
    patterns: ['ethnicity', 'race', 'racial background'],
    threshold: 15,
    answer: 'Prefer not to say',
  },
  {
    patterns: ['veteran', 'military service', 'armed forces'],
    threshold: 15,
    answer: 'No',
  },
  {
    patterns: ['disability', 'disabled', 'accommodation'],
    threshold: 15,
    answer: 'No',
  },
  {
    patterns: ['lgbtq', 'sexual orientation'],
    threshold: 15,
    answer: 'Prefer not to say',
  },
  {
    patterns: ['marital status', 'marriage status'],
    threshold: 40,
    answer: 'Single',
  },

  // ── Education ─────────────────────────────────────────────────────────
  {
    patterns: [
      'highest degree',
      'highest education',
      'education level',
      'qualification',
    ],
    threshold: 45,
    answer: "Bachelor's",
  },
  {
    patterns: ['university', 'college', 'institution', 'school name'],
    threshold: 45,
    answer: 'State U',
  },
  {
    patterns: [
      'field of study',
      'major',
      'specialization',
      'discipline',
      'degree in',
    ],
    threshold: 45,
    answer: 'CS',
  },
  {
    patterns: [
      'graduation year',
      'year of graduation',
      'passing year',
      'year completed',
    ],
    threshold: 45,
    answer: '2020',
  },
  {
    patterns: ['gpa', 'cgpa', 'grade point'],
    threshold: 50,
    answer: '3.8',
  },

  // ── Skills & languages ──────────────────────────────────────────────────
  {
    patterns: ['certification', 'certifications', 'professional certification'],
    threshold: 40,
    answer: 'AWS',
  },

  // ── Application meta ──────────────────────────────────────────────────
  {
    patterns: [
      'reason for leaving',
      'why leaving',
      'leaving your current job',
      'leaving current job',
      'why are you leaving',
      'why job switch',
      'job switch',
      'looking for a change',
      'why change job',
      'why are you switching',
      'why are you looking for',
      'looking for a new job',
    ],
    threshold: 10,
    answer: 'Seeking growth.',
  },
  {
    patterns: [
      'why should we hire',
      'why hire you',
      'why are you interested',
      'interested in this job',
      'interested in this role',
      'why do you want to work',
      'want to work at our',
      'want to work at your',
      'why do you want to join',
      'want to join us',
      'want to join our',
      'why this company',
      'why our company',
      'why do you want',
      'why this role',
      'why join',
    ],
    threshold: 10,
    answer: 'Strong fit.',
  },
  {
    patterns: [
      'conflict with a teammate',
      'conflict with teammate',
      'conflict with a colleague',
      'conflict with colleague',
      'disagree with your approach',
      "don't agree with your approach",
      'do not agree with your approach',
      'people disagree',
      'how did you resolve',
      'resolve the conflict',
      'handle disagreement',
    ],
    threshold: 10,
    answer: 'Discussed and aligned.',
  },
  {
    patterns: [
      'achievement you are proud',
      'achievement proud',
      'proud of',
      'biggest impact',
      'impact on users',
      'impact on business',
      'feature you built',
      'project you built',
      'specific contribution',
      'challenging technical problem',
      'technical problem you solved',
      'how did you approach it',
      'difficult problem',
    ],
    threshold: 10,
    answer: 'Shipped key feature.',
  },
  {
    patterns: [
      'next 5 years',
      'next five years',
      'see yourself in',
      'where do you see yourself',
      'career goals',
      'goals and aspirations',
      'aspirations in life',
      'what you want to do',
      'want to do in life',
      'long term goals',
      'future goals',
    ],
    threshold: 10,
    answer: 'Senior engineer.',
  },
  {
    patterns: [
      'how did you hear',
      'where did you hear',
      'referral source',
      'source of application',
      'how did you find',
    ],
    threshold: 10,
    answer: 'Referral',
  },
  {
    patterns: [
      'current employee',
      'worked here before',
      'previous employee',
      'rehire',
    ],
    threshold: 10,
    answer: 'No',
  },
  {
    patterns: ['bond', 'notice buyout', 'buy out notice'],
    threshold: 10,
    answer: 'No',
  },
];
