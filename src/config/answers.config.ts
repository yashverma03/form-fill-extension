import { QuestionIdEnum } from '../enums/QuestionIdEnum';
import type { AnswerConfigEntry } from '../interfaces/AnswerConfigEntry';

/** Question-matching rules; first matching entry wins. Order entries by specificity. */
export const ANSWERS_CONFIG: AnswerConfigEntry[] = [
  // ── Identity (high priority, specific first) ──────────────────────────
  {
    patterns: [
      'first name',
      'given name',
      'forename',
      'given-name',
      'first_name',
      'firstname',
      'fname',
      /^first$/,
    ],
    threshold: 50,
    questionId: QuestionIdEnum.FirstName,
  },
  {
    patterns: ['middle name', 'middle initial', 'second name', 'middle_name'],
    threshold: 45,
    questionId: QuestionIdEnum.MiddleName,
  },
  {
    patterns: [
      'last name',
      'surname',
      'family name',
      'family-name',
      'last_name',
      'lastname',
      'lname',
      /^last$/,
    ],
    threshold: 50,
    questionId: QuestionIdEnum.LastName,
  },
  {
    patterns: ['legal name', 'full name', 'name as per'],
    threshold: 45,
    questionId: QuestionIdEnum.FullName,
  },
  {
    patterns: ['preferred name', 'nickname', 'name you go by'],
    threshold: 40,
    questionId: QuestionIdEnum.PreferredName,
  },

  // ── Contact ───────────────────────────────────────────────────────────
  {
    patterns: ['email', 'e-mail', 'email address', 'work email', /^email$/],
    threshold: 50,
    questionId: QuestionIdEnum.Email,
  },
  {
    patterns: ['device type', 'mobile type', 'phone type', 'contact type'],
    threshold: 50,
    questionId: QuestionIdEnum.DeviceType,
  },
  {
    patterns: [
      'phone extension',
      'phone ext',
      'extension number',
      'phone_extension',
      'phone_ext',
      'phone extension number',
      'phone number extension',
      /^ext$/,
    ],
    threshold: 60,
    questionId: QuestionIdEnum.PhoneExtension,
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
      'phone_number',
      'mobile_number',
      /phone\s*number/,
      /^phone$/,
      /^mobile$/,
      /^tel$/,
    ],
    threshold: 45,
    questionId: QuestionIdEnum.Phone,
  },
  {
    patterns: [
      'preferred contact',
      'preferred contact method',
      'contact method',
      'how should we contact',
      'best way to reach',
    ],
    threshold: 35,
    questionId: QuestionIdEnum.PreferredContact,
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
    questionId: QuestionIdEnum.CurrentJobTitle,
  },
  {
    patterns: [
      'current company',
      'present company',
      'current employer',
      'present employer',
      'company you work for',
      'employer name',
    ],
    threshold: 50,
    questionId: QuestionIdEnum.CurrentCompany,
  },
  {
    patterns: [
      'years of experience',
      'total experience',
      'overall experience',
      'years of relevant experience',
      /experience.*year/, // "experience" … "year" (e.g. "experience in years")
      /years.*experience/, // "years" … "experience" (e.g. "5 years of experience")
    ],
    threshold: 45,
    questionId: QuestionIdEnum.YearsOfExperience,
  },

  // ── Compensation & availability ─────────────────────────────────────
  {
    patterns: [
      'current salary',
      'current ctc',
      'present salary',
      'present ctc',
      'current compensation',
      /current.*(salary|ctc|compensation)/, // "current" … salary/ctc/compensation
    ],
    threshold: 45,
    subPatterns: [
      {
        patterns: ['lpa', 'lakhs', 'lakh'],
        threshold: 40,
        questionId: QuestionIdEnum.CurrentCtcLpa,
      },
    ],
    questionId: QuestionIdEnum.CurrentCtc,
  },
  {
    patterns: [
      'expected salary',
      'expected ctc',
      'desired salary',
      'desired ctc',
      'desired compensation',
      'desired pay',
      'desired base salary',
      'expected pay',
      'expected compensation',
      'salary expectation',
      'compensation expectation',
      'pay expectation',
      'expected remuneration',
      'desired remuneration',
      'minimum base salary',
      'minimum base salary or range you are expecting',
      'minimum salary expected',
      'base salary range expected',
      /expected.*(salary|ctc|compensation|pay)/, // "expected" … salary/ctc/compensation/pay
      /desired.*(salary|ctc|compensation|pay)/, // "desired" … salary/ctc/compensation/pay
      /minimum.*(base salary|salary|ctc|compensation|pay)/, // "minimum" … base salary/salary/ctc/compensation/pay
    ],
    threshold: 45,
    subPatterns: [
      {
        patterns: ['lpa', 'lakhs', 'lakh'],
        threshold: 40,
        questionId: QuestionIdEnum.ExpectedCtcLpa,
      },
    ],
    questionId: QuestionIdEnum.ExpectedCtc,
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
      /competing.*(ctc|salary|compensation|offer)/, // "competing" … offer-related term
      /other.*offer/, // "other" … "offer" (e.g. "any other offer")
    ],
    threshold: 40,
    subPatterns: [
      {
        patterns: ['lpa', 'lakhs', 'lakh'],
        threshold: 40,
        questionId: QuestionIdEnum.CompetingOfferLpa,
      },
    ],
    questionId: QuestionIdEnum.CompetingOfferCtc,
  },
  {
    patterns: [
      'notice period negotiable',
      'notice negotiable',
      'negotiable notice',
      'negotiable notice period',
      'is your notice negotiable',
      'is notice negotiable',
      'can you negotiate notice',
      'can notice be negotiated',
      'notice period flexible',
      'flexible notice period',
      'willing to negotiate notice',
      'negotiate your notice',
      'negotiate notice period',
      'notice negotiation',
      'shorten notice period',
      'reduce notice period',
      'early release from notice',
      'join before notice ends',
      'join earlier than notice',
      'early joining possible',
      /notice.*negotiable/, // "notice" … "negotiable"
      /negotiable.*notice/, // "negotiable" … "notice"
    ],
    threshold: 40,
    questionId: QuestionIdEnum.NoticePeriodNegotiable,
  },
  {
    patterns: [
      'salary negotiable',
      'open to negotiation',
      'ctc negotiable',
      'compensation negotiable',
    ],
    threshold: 30,
    questionId: QuestionIdEnum.SalaryNegotiable,
  },
  {
    patterns: [
      'notice period',
      'notice period days',
      'serving notice',
      'notice in days',
      'available to join',
      /notice period(?! negotiable)/, // "notice period" not followed by " negotiable"
    ],
    threshold: 45,
    questionId: QuestionIdEnum.NoticePeriod,
  },
  {
    patterns: ['when can you join', 'joining time', 'available to start'],
    threshold: 35,
    questionId: QuestionIdEnum.JoiningTime,
  },
  {
    patterns: [
      'earliest start',
      'earliest start date',
      'start date',
      'date available',
    ],
    threshold: 40,
    questionId: QuestionIdEnum.JoiningTime,
  },

  // ── Links & portfolio ─────────────────────────────────────────────────
  {
    patterns: ['linkedin', 'linkedin profile', 'linkedin url', 'linkedin link'],
    threshold: 60,
    questionId: QuestionIdEnum.LinkedIn,
  },
  {
    patterns: ['github', 'github profile', 'github url', 'github link'],
    threshold: 60,
    questionId: QuestionIdEnum.GitHub,
  },
  {
    patterns: [
      'portfolio',
      'portfolio personal website',
      'personal website',
      'portfolio url',
      'personal site',
      'website',
    ],
    threshold: 45,
    questionId: QuestionIdEnum.Portfolio,
  },
  {
    patterns: [
      'leetcode',
      'hackerrank',
      'codility',
      'codechef',
      'codeforces',
      'geeksforgeeks',
    ],
    threshold: 55,
    questionId: QuestionIdEnum.LeetCode,
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
    threshold: 40,
    questionId: QuestionIdEnum.LegallyAuthorizedToWork,
  },
  {
    patterns: [
      'visa sponsorship',
      'require visa sponsorship',
      'require sponsorship',
      'need sponsorship',
      'immigration sponsorship',
      'do you require visa',
    ],
    threshold: 20,
    questionId: QuestionIdEnum.VisaSponsorshipRequired,
  },
  {
    patterns: [
      'visa work permit status',
      'work permit status',
      'visa status',
      'permit expiry',
      'visa expiry',
    ],
    threshold: 20,
    questionId: QuestionIdEnum.VisaStatus,
  },
  {
    patterns: [
      'conflict of interest',
      'financial interest',
      'outside business interest',
      'negotiate, influence',
      'negotiate or influence',
      'government office or agency',
      'government agency that has oversight',
      'outside employment or activity',
      'continue if you are hired',
    ],
    threshold: 10,
    questionId: QuestionIdEnum.ConflictOfInterest,
  },
  {
    patterns: [
      'relative working at',
      'relative working',
      'relatives work',
      'family member employed',
      'family member work',
      'know anyone at',
      'employee referral relation',
      'related to anyone who has the authority',
      'related to anyone who is an employee',
      'close personal relationship with a current',
      'close personal relationship with an employee',
    ],
    threshold: 10,
    questionId: QuestionIdEnum.RelativeAtCompany,
  },
  {
    patterns: [
      'non-compete',
      'non compete',
      'restrictive covenant',
      'bound by agreement',
    ],
    threshold: 10,
    questionId: QuestionIdEnum.NonCompeteAgreement,
  },
  {
    patterns: [
      'willing to submit a background check',
      'willing to submit to a background check',
      'consent to a background check',
      'background check during the hiring process',
      'background check',
    ],
    threshold: 10,
    questionId: QuestionIdEnum.BackgroundCheckConsent,
  },
  {
    patterns: ['criminal record', 'felony', 'convicted', 'criminal history'],
    threshold: 10,
    questionId: QuestionIdEnum.CriminalRecord,
  },
  {
    patterns: ['security clearance', 'government clearance'],
    threshold: 10,
    questionId: QuestionIdEnum.SecurityClearance,
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
    questionId: QuestionIdEnum.TermsConsent,
  },
  {
    patterns: [
      'are you 18 years of age or older',
      'are you at least 18',
      'are you 18 or older',
      'confirm you are 18',
      '18 age',
      'age 18',
    ],
    threshold: 30,
    questionId: QuestionIdEnum.AgeConfirmation,
  },

  // ── EEO / voluntary disclosure ────────────────────────────────────────
  {
    patterns: ['sexual orientation', 'lgbtq'],
    threshold: 40,
    questionId: QuestionIdEnum.SexualOrientation,
  },
  {
    patterns: ['gender'],
    threshold: 50,
    questionId: QuestionIdEnum.Gender,
  },
  {
    patterns: ['pronouns', 'preferred pronouns'],
    threshold: 35,
    questionId: QuestionIdEnum.Pronouns,
  },
  {
    patterns: ['date of birth', 'dob', 'birth date', 'birthday'],
    threshold: 50,
    questionId: QuestionIdEnum.DateOfBirth,
  },
  {
    patterns: ['ethnicity', 'race', 'racial background'],
    threshold: 40,
    questionId: QuestionIdEnum.Ethnicity,
  },
  {
    patterns: ['veteran', 'military service', 'armed forces'],
    threshold: 40,
    questionId: QuestionIdEnum.VeteranStatus,
  },
  {
    patterns: ['disability', 'disabled', 'accommodation'],
    threshold: 40,
    questionId: QuestionIdEnum.DisabilityStatus,
  },
  {
    patterns: ['marital status', 'marriage status'],
    threshold: 40,
    questionId: QuestionIdEnum.MaritalStatus,
  },

  // ── Location & address ────────────────────────────────────────────────
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
    questionId: QuestionIdEnum.PinCode,
  },
  {
    patterns: ['country of residence', 'country you live', 'residence country'],
    threshold: 35,
    questionId: QuestionIdEnum.CountryOfResidence,
  },
  {
    patterns: [
      'select country',
      'which country',
      /^country$/, // label is exactly "country"
      /country(?!.*authorized)/, // "country" but not work-authorization questions
    ],
    threshold: 50,
    questionId: QuestionIdEnum.Country,
  },
  {
    patterns: ['nationality', 'citizenship', 'citizen of'],
    threshold: 35,
    questionId: QuestionIdEnum.Nationality,
  },
  {
    patterns: [
      'current location',
      'current city',
      'current city location',
      'present location',
      'where are you located',
      'city you are based',
    ],
    threshold: 45,
    questionId: QuestionIdEnum.CurrentLocation,
  },
  {
    patterns: [/^city$/, 'town', 'municipality'], // ^city$ = label is exactly "city"
    threshold: 50,
    questionId: QuestionIdEnum.City,
  },
  {
    patterns: ['state province', 'state', 'province', 'county'],
    threshold: 50,
    questionId: QuestionIdEnum.State,
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
    questionId: QuestionIdEnum.AddressLine1,
  },
  {
    patterns: ['address line 2', 'address 2', 'landmark', 'area', 'locality'],
    threshold: 45,
    questionId: QuestionIdEnum.AddressLine2,
  },
  {
    patterns: [
      'full address',
      'current address',
      'permanent address',
      'mailing address',
    ],
    threshold: 40,
    questionId: QuestionIdEnum.FullAddress,
  },

  // ── Work preferences ──────────────────────────────────────────────────
  {
    patterns: [
      'willing to relocate',
      'open to relocation',
      'relocate',
      'relocation',
      'able to work on a daily basis in the work location',
      'able to work on a daily basis at the work location',
      'work on a daily basis in the work location listed',
      'willing to relocate at your own expense',
      'relocate at your own expense',
      'relocate at your own cost',
      'relocate at their own expense',
      'willing to relocate to accept a position',
      'work in the location listed for this position',
      'work daily at the location listed for this position',
      /work\s+on\s+a\s+daily\s+basis\s+in\s+the\s+work\s+location/, // "work on a daily basis in the work location" (position-listed variants)
      /relocate\s+at\s+(your|their|my)\s+own\s+expense/, // "relocate at your/their/my own expense"
      /able\s+to\s+work\s+.*daily\s+basis\s+.*work\s+location/, // e.g. "able to work ... daily basis ... work location"
    ],
    threshold: 25,
    questionId: QuestionIdEnum.WillingToRelocate,
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
    questionId: QuestionIdEnum.EmploymentType,
  },
  {
    patterns: ['willing to travel', 'travel required', 'business travel'],
    threshold: 25,
    questionId: QuestionIdEnum.WillingToTravel,
  },
  {
    patterns: ['shift', 'night shift', 'rotational shift', 'work shift'],
    threshold: 40,
    questionId: QuestionIdEnum.WorkShift,
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
    questionId: QuestionIdEnum.HighestDegree,
  },
  {
    patterns: ['university', 'college', 'institution', 'school name'],
    threshold: 45,
    questionId: QuestionIdEnum.University,
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
    questionId: QuestionIdEnum.FieldOfStudy,
  },
  {
    patterns: [
      'graduation year',
      'year of graduation',
      'passing year',
      'year completed',
    ],
    threshold: 45,
    questionId: QuestionIdEnum.GraduationYear,
  },
  {
    patterns: ['gpa', 'cgpa', 'grade point'],
    threshold: 50,
    questionId: QuestionIdEnum.Gpa,
  },

  // ── Skills & languages ──────────────────────────────────────────────────
  {
    patterns: ['certification', 'certifications', 'professional certification'],
    threshold: 40,
    questionId: QuestionIdEnum.Certification,
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
    threshold: 40,
    questionId: QuestionIdEnum.ReasonForLeaving,
  },
  {
    patterns: [
      'why should we hire',
      'why hire you',
      'asset to this organisation',
      'asset to this organization',
      'asset to the organisation',
      'asset to the organization',
      'different from other candidates',
      'makes you different',
    ],
    threshold: 40,
    questionId: QuestionIdEnum.WhyHireYou,
  },
  {
    patterns: [
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
    threshold: 40,
    questionId: QuestionIdEnum.WhyApply,
  },
  {
    patterns: [
      'conflict with a teammate',
      'conflict with teammate',
      'conflict with a colleague',
      'conflict you had with a colleague',
      'conflict with colleague',
      'disagree with your approach',
      "don't agree with your approach",
      'do not agree with your approach',
      'people disagree',
      'how did you resolve',
      'resolve the conflict',
      'handle disagreement',
    ],
    threshold: 40,
    questionId: QuestionIdEnum.ConflictResolution,
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
    threshold: 40,
    questionId: QuestionIdEnum.Achievement,
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
    threshold: 40,
    questionId: QuestionIdEnum.FiveYearGoals,
  },
  {
    patterns: [
      'how did you hear',
      'where did you hear',
      'referral source',
      'source of application',
      'how did you find',
    ],
    threshold: 40,
    questionId: QuestionIdEnum.ReferralSource,
  },
  {
    patterns: [
      'current employee',
      'worked here before',
      'previous employee',
      'rehire',
      'have you ever worked for',
      'have you previously worked for',
      'have you ever been employed by',
      'were you previously employed by',
      'have you worked with us before',
      'former employee',
    ],
    threshold: 40,
    questionId: QuestionIdEnum.PreviousEmployee,
  },
  {
    patterns: [
      'bond',
      'employment bond',
      'service bond',
      'training bond',
      'retention bond',
      'bond period',
      'under bond',
      'serving bond',
      'notice buyout',
      'buy out notice',
      'buyout notice',
      'notice buy out',
      'buy out your notice',
      'notice period buyout',
      'pay notice buyout',
    ],
    threshold: 40,
    questionId: QuestionIdEnum.NoticeBuyoutBond,
  },
];
