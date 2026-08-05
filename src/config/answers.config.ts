import { QuestionIdEnum } from '../enums/QuestionIdEnum';
import type { AnswerConfigEntry } from '../interfaces/AnswerConfigEntry';

/** Question-matching rules; first matching entry wins. Order entries by specificity. */
export const ANSWERS_CONFIG: AnswerConfigEntry[] = [
  // ── Identity (high priority, specific first) ──────────────────────────
  {
    patterns: [
      'salutation',
      'name prefix',
      'honorific',
      'mr./mrs./ms.',
      'mr mrs ms',
      /^title$/,
      /^prefix$/,
    ],
    threshold: 45,
    questionId: QuestionIdEnum.Salutation,
  },
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
      'current organization',
      'present organization',
      'current organisation',
      'present organisation',
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
      'cctc',
      'present salary',
      'present ctc',
      'current compensation',
      'current annual pay',
      'current pay',
      'annual pay',
      /current.*(salary|ctc|compensation|pay)/, // "current" … salary/ctc/compensation/pay
      /present.*(salary|ctc|compensation|pay)/, // "present" … salary/ctc/compensation/pay
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
      'ectc',
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
      'annual salary expectation',
      'salary expectation',
      'annual compensation',
      'desired annual compensation',
      /expected.*(salary|ctc|compensation|pay)/, // "expected" … salary/ctc/compensation/pay
      /desired.*(salary|ctc|compensation|pay)/, // "desired" … salary/ctc/compensation/pay
      /minimum.*(base salary|salary|ctc|compensation|pay)/, // "minimum" … base salary/salary/ctc/compensation/pay
      /(compensation|salary|pay|ctc)\s*expectations?/, // "salary/compensation/pay expectation(s)"
      /(annual|desired|expected)\s+(salary|compensation|pay|ctc)/, // "annual salary", "desired compensation", …
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
      'currency',
      'salary currency',
      'currency of your current salary',
      'currency of your expected salary',
    ],
    threshold: 45,
    questionId: QuestionIdEnum.Currency,
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
      'how soon can you join',
      'how soon can you join us',
      'notice lwd',
      'notice/lwd',
      'lwd',
      'last working day',
      /notice period(?! negotiable)/, // "notice period" not followed by " negotiable"
      /notice.*lwd/, // "notice" … "lwd"
    ],
    threshold: 45,
    questionId: QuestionIdEnum.NoticePeriod,
  },
  {
    patterns: [
      'when can you join',
      'joining time',
      'available to start',
      'if offered the role',
      'within how many days will you be able to join',
      /if offered.*how many days.*join/, // "if offered" … "how many days" … "join"
    ],
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
      'legally entitled to work',
      /legally entitled to work.*provide evidence/, // "legally entitled to work ... and can provide evidence"
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
      'require sponsorship for an employment visa',
      'authorization to work in the country',
      'sponsorship for employment visa',
      /require sponsorship.*(visa|work)/, // "require sponsorship" … "visa/work"
      /sponsorship.*authorization to work/, // "sponsorship" … "authorization to work"
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
      'engage with employees to negotiate',
      'negotiate, influence and/or sign',
      'sign commercial contracts or government contracts',
      'government office or agency',
      'government agency that has oversight',
      'outside employment or activity',
      'continue if you are hired',
      'employment or other work that you intend to continue',
      'intend to continue if you accept',
      'plan to continue if you accept',
      'reason that would prevent you taking up employment',
      'reason that would prevent you from taking up employment',
      'aware of any reason that would prevent',
      /employment or other work.*continue/, // "employment or other work" … "continue" (moonlighting disclosure)
      /reason.*(prevent).*(taking up|accepting) employment/, // "reason ... prevent ... taking up/accepting employment"
    ],
    threshold: 10,
    questionId: QuestionIdEnum.ConflictOfInterest,
  },
  {
    patterns: [
      'own, control or have an economic interest in any intellectual property',
      'economic interest in any intellectual property',
      'own or control any intellectual property',
      'interest in any patents, trademarks',
      /(own|control).*economic interest.*(intellectual property|patent|trademark|copyright)/, // "own/control ... economic interest ... intellectual property/patents/trademarks/copyrights"
    ],
    threshold: 15,
    questionId: QuestionIdEnum.IntellectualPropertyInterest,
  },
  {
    patterns: [
      'secondary employment',
      'secondary non-',
      'secondary business activity',
      'maintain any secondary',
      'non-primary employment or business activity',
      /maintain any secondary.*(employment|business activity)/, // "maintain any secondary ... employment/business activity"
      /secondary.*(employment|business activity).*subject to review/, // "secondary employment/business activity ... subject to review"
    ],
    threshold: 15,
    questionId: QuestionIdEnum.SecondaryEmploymentOrBusinessActivity,
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
      'family relationship',
      'close personal contact',
      'related to an employee',
      'related to a client or government official',
      'dependent or relative of a client',
      'dependent or relative of a government official',
      'close associate of a current or former government official',
      'by birth, adoption or marriage',
      'director, officer or senior employee of a client who has authority',
      'authority to award or materially influence any decision to award',
      'immediate family member',
      /related to (a|an).*(employee|official)/, // "related to a(n) [company] employee/official"
      /family relationship.*(employee|board member)/, // "family relationship" … "employee/board member"
      /close personal (contact|relationship).*(employee|board member)/, // "close personal contact/relationship" … "employee/board member"
      /related to.*(by birth|adoption|marriage).*(government official|close associate)/, // "related to ... birth/adoption/marriage ... official/associate"
      /close associate of.*(government official|director|officer|senior employee)/, // "close associate of" … official/director/officer/senior employee
      /immediate family member.*(parent|child|sibling|spouse|partner).*(partner|director|officer|employee)/, // "immediate family member (parent, child, sibling, spouse/partner) of a partner/director/officer/employee"
    ],
    threshold: 10,
    questionId: QuestionIdEnum.RelativeAtCompany,
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
      'have you worked at',
      'have you previously worked at',
      'former employee',
      'current or former employee',
      'as an employee, contractor or temporary worker',
      /current or former.*employee/, // "current or former [company]... employee?"
      /have\s+you\s+(previously\s+|ever\s+)?worked\s+(for|at|with)\s+(us|this|the|our)/, // "have you [previously/ever] worked for/at/with us/this/the/our [company]"
      /currently,?\s*or\s+have\s+you\s+previously,?\s*worked\s+at/, // "are you currently, or have you previously, worked at [company]"
      /worked\s+at.*as\s+an\s+employee,?\s*contractor\s+or\s+temporary\s+worker/, // "worked at [company] as an employee, contractor or temporary worker"
    ],
    // Runs ahead of the generic skills/experience matcher (`HasRelevantExperience`)
    // so employment-history disclosure questions ("have you previously worked
    // for this company?") never get misread as a technical-experience prompt
    // and answered "Yes" instead of "No".
    threshold: 40,
    questionId: QuestionIdEnum.PreviousEmployee,
  },
  {
    patterns: [
      'indian passport holder',
      'indian passport',
      'do you hold an indian passport',
      'are you an indian passport holder',
    ],
    threshold: 30,
    questionId: QuestionIdEnum.IndianPassportHolder,
  },
  {
    patterns: [
      'do you currently work for, or with',
      'work for, or with',
      'currently work for, or with',
      'work for or with',
      /work\s+for,?\s+or\s+with.*(subsidiar|affiliat)/, // "work for, or with [company] or any of its subsidiaries"
      /(currently\s+)?work\s+for,?\s+or\s+with\b/, // "(currently) work for, or with"
    ],
    threshold: 30,
    questionId: QuestionIdEnum.WorkedForOrWithCompanyOrSubsidiary,
  },
  {
    patterns: [
      'performed temporary work for',
      'temporary work for',
      'temp work for',
      /temporary work.*(subsidiar|affiliat)/, // "temporary work" … "subsidiaries/affiliates"
      /performed temporary work/,
    ],
    threshold: 30,
    questionId: QuestionIdEnum.TemporaryWorkForCompanyOrSubsidiary,
  },
  {
    patterns: [
      'search agency submitted your application',
      'search agency submitted',
      'submitted your application for consideration',
      /search (agency|firm).*submitted.*application/, // "search agency/firm" … "submitted" … "application"
    ],
    threshold: 30,
    questionId: QuestionIdEnum.SearchAgencySubmittedApplication,
  },
  {
    patterns: [
      'have you ever interviewed for a position',
      'ever interviewed for a position',
      'previously interviewed for a position',
      /ever\s+interviewed\s+for\s+a\s+position/, // "ever interviewed for a position"
    ],
    threshold: 30,
    questionId: QuestionIdEnum.InterviewedAtCompanyBefore,
  },
  {
    patterns: [
      'are you a current or former government official',
      'current or former government official',
      /^are you a (current or former )?government official\??$/,
    ],
    threshold: 30,
    questionId: QuestionIdEnum.CurrentOrFormerGovernmentOfficial,
  },
  {
    patterns: [
      'did either of the following refer or recommend you',
      /refer or recommend you.*government official/, // "...refer or recommend you..." … "government official"
      /refer or recommend you.*(director|officer|senior employee|client)/, // "...refer or recommend you..." … director/officer/senior employee/client
      /(government official).*refer or recommend you/, // "government official" … "...refer or recommend you..."
      /(director|officer|senior employee|client).*refer or recommend you/, // director/officer/senior employee/client … "...refer or recommend you..."
    ],
    threshold: 30,
    questionId: QuestionIdEnum.ReferredByOfficialOrClientExecutive,
  },
  {
    patterns: [
      'fiduciary appointment',
      'fiduciary designation',
      'executor, personal representative',
      'personal representative, administrator, guardian',
      'trustee, or any similar fiduciary',
    ],
    threshold: 10,
    questionId: QuestionIdEnum.FiduciaryAppointment,
  },
  {
    patterns: [
      'board of directors',
      'advisory board',
      'trustee board',
      'committee, trustee board',
      'serve in any capacity on a board',
      'member of, or do you currently serve in any capacity',
    ],
    threshold: 10,
    questionId: QuestionIdEnum.BoardOrCommitteeMembership,
  },
  {
    patterns: [
      'ownership interest',
      '25% or more',
      '10% or more',
      'ownership interest in any for-profit business',
      'ownership interest in any business entity',
      /\d+%\s*(or more)?\s*ownership/, // e.g. "25% or more ownership"
    ],
    threshold: 10,
    questionId: QuestionIdEnum.OwnershipInterestInBusiness,
  },
  {
    patterns: [
      'position of control',
      'serve, service, or plan to serve in any position of control',
      'control with a for-profit business',
    ],
    threshold: 10,
    questionId: QuestionIdEnum.PositionOfControlInBusiness,
  },
  {
    patterns: [
      'elected or appointed official',
      'government entity or governmental',
      'governmental or public agency',
      'city council',
      'school board',
      'political party committee',
      'political campaign',
      'paid or unpaid (volunteer) position on a political campaign',
    ],
    threshold: 10,
    questionId: QuestionIdEnum.GovernmentOrPoliticalInvolvement,
  },
  {
    patterns: [
      'worked for the company’s auditor',
      'worked for the auditor',
      "company's external auditor",
      'external audit firm',
      "the bank's auditor",
      /work(ed)?.*for.*(the )?auditor/, // "work(ed) for [the] auditor"
    ],
    threshold: 10,
    questionId: QuestionIdEnum.AuditorEmployment,
  },
  {
    patterns: [
      'non-compete',
      'non compete',
      'restrictive covenant',
      'bound by agreement',
      'post-employment obligations',
      'post employment obligations',
      'non-solicitation',
      'non solicitation',
      'non-competition',
      'non competition',
      /post-?employment obligations?/, // "post-employment obligation(s)"
      /prohibit or restrict your employment/, // "...may prohibit or restrict your employment..."
      /non-?compet\w*.*(impact|prevent|restrict|prohibit).*work/, // "non-compet(ition/e)... impact/prevent/restrict/prohibit... work"
      /agreement with.*(current|previous|former) employer.*restrict.*(ability to work|job)/, // "agreement with your current/previous employer that might restrict your ability to work/do the job"
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
    patterns: [
      'criminal record',
      'felony',
      'convicted',
      'criminal history',
      'criminal convictions',
      'cautions, reprimands',
      'reprimands or final warnings',
      /criminal convictions?,?\s*cautions?,?\s*reprimands?/, // "criminal convictions, cautions, reprimands..."
    ],
    threshold: 10,
    questionId: QuestionIdEnum.CriminalRecord,
  },
  {
    patterns: [
      'subject to investigation by',
      'disciplined/cautioned by a regulatory body',
      'disciplined or cautioned by a regulatory body',
      'investigated by a regulatory body',
      /investigation by.*(disciplined|cautioned).*regulatory body/, // "investigation by or disciplined/cautioned by a regulatory body"
    ],
    threshold: 15,
    questionId: QuestionIdEnum.RegulatoryInvestigationOrDiscipline,
  },
  {
    patterns: [
      'dismissed by a previous employer',
      'dismissed for gross misconduct',
      'gross misconduct or as part of disciplinary action',
      /dismissed.*(gross misconduct|disciplinary action)/, // "dismissed ... gross misconduct/disciplinary action"
    ],
    threshold: 15,
    questionId: QuestionIdEnum.DismissedForMisconduct,
  },
  {
    patterns: [
      'happy to continue with your application',
      'are you happy to continue',
      /happy to continue with your application/,
    ],
    threshold: 20,
    questionId: QuestionIdEnum.ContinueApplicationConsent,
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
      'false information, misrepresentation, or omission of facts',
      'false information, misrepresentation',
      'misrepresentation, or omission of facts',
      /false information.*misrepresentation.*omission of facts/, // "false information, misrepresentation, or omission of facts"
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
      'comfortable for work location',
      'comfortable with work location',
      'comfortable with this work location',
      'comfortable with the work location',
      'comfortable commuting',
      'comfortable commuting to this job',
      'comfortable commuting to this location',
      'commute to this location',
      'commute to the job location',
      'able to commute',
      /comfortable.*work location/, // "comfortable" … "work location"
      /comfortable.*commut(e|ing)/, // "comfortable" … "commute/commuting"
      /work\s+on\s+a\s+daily\s+basis\s+in\s+the\s+work\s+location/, // "work on a daily basis in the work location" (position-listed variants)
      /relocate\s+at\s+(your|their|my)\s+own\s+expense/, // "relocate at your/their/my own expense"
      /able\s+to\s+work\s+.*daily\s+basis\s+.*work\s+location/, // e.g. "able to work ... daily basis ... work location"
    ],
    threshold: 25,
    questionId: QuestionIdEnum.WillingToRelocate,
  },
  {
    patterns: [
      'willing to work from office',
      'willing to work from the office',
      'work from office',
      'work from the office full',
      'comfortable working from office',
      'able to work from office',
    ],
    threshold: 25,
    questionId: QuestionIdEnum.WillingToWorkFromOffice,
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
    patterns: [
      'pursuing further education',
      'currently pursuing further education',
      'currently enrolled',
      'currently a student',
      'post-secondary education',
      'post secondary education',
      'currently studying',
      /pursuing.*education/,
    ],
    threshold: 45,
    questionId: QuestionIdEnum.PursuingFurtherEducation,
  },
  {
    patterns: [
      'internship',
      'internship/co-op',
      'co-op',
      'co op',
      'intern position',
      'applying for an internship',
      /internship.*(co-op|co op)/,
    ],
    threshold: 45,
    questionId: QuestionIdEnum.ApplyingForInternshipOrCoOp,
  },
  {
    patterns: [
      'applying for a full-time role',
      'applying for a full time role',
      'full-time role',
      'full time role',
      'applying for full-time',
      'applying for full time',
    ],
    threshold: 45,
    questionId: QuestionIdEnum.ApplyingForFullTime,
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
  {
    patterns: [
      'completed secondary education',
      'completed secondary education or its equivalent',
      'secondary education or its equivalent',
      'secondary education',
      'high school diploma',
      'completed high school',
      'completed your high school',
      /completed.*secondary education/,
      /completed.*high school/,
    ],
    threshold: 45,
    questionId: QuestionIdEnum.CompletedSecondaryEducation,
  },

  // ── Skills & languages ──────────────────────────────────────────────────
  {
    patterns: ['certification', 'certifications', 'professional certification'],
    threshold: 40,
    questionId: QuestionIdEnum.Certification,
  },
  {
    patterns: [
      'do you have experience in building',
      'do you have experience building',
      'do you have experience in',
      'do you have experience with',
      'do you have experience developing',
      'do you have experience working with',
      'do you have experience working on',
      'have you built',
      'have you worked with',
      'have you worked on',
      'have you developed',
      /do\s+you\s+have\s+experience/, // "do you have experience" ... (any suffix)
      // "have you built/developed/worked" ... but not the employment-history
      // phrasing ("worked for/at [company]") handled by `PreviousEmployee`.
      /have\s+you\s+(built|developed|worked)(?!\s+(for|at)\b)/,
    ],
    threshold: 45,
    questionId: QuestionIdEnum.HasRelevantExperience,
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
