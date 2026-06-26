/** Unique ID per question in answers.config.ts; maps to personal answers in src/data/answers.data.ts. */
export enum QuestionIdEnum {
  // ── Identity ──────────────────────────────────────────────────────────
  FirstName = 'FirstName',
  LastName = 'LastName',
  FullName = 'FullName',
  PreferredName = 'PreferredName',
  MiddleName = 'MiddleName',

  // ── Contact ───────────────────────────────────────────────────────────
  Email = 'Email',
  DeviceType = 'DeviceType',
  PreferredContact = 'PreferredContact',
  Phone = 'Phone',

  // ── Employment (current) ──────────────────────────────────────────────
  CurrentJobTitle = 'CurrentJobTitle',
  CurrentCompany = 'CurrentCompany',
  CurrentLocation = 'CurrentLocation',
  YearsOfExperience = 'YearsOfExperience',

  // ── Compensation & availability ─────────────────────────────────────
  CurrentCtc = 'CurrentCtc',
  CurrentCtcLpa = 'CurrentCtcLpa',
  ExpectedCtc = 'ExpectedCtc',
  ExpectedCtcLpa = 'ExpectedCtcLpa',
  CompetingOfferCtc = 'CompetingOfferCtc',
  CompetingOfferLpa = 'CompetingOfferLpa',
  SalaryNegotiable = 'SalaryNegotiable',
  NoticePeriod = 'NoticePeriod',
  NoticePeriodNegotiable = 'NoticePeriodNegotiable',
  JoiningTime = 'JoiningTime',

  // ── Links & portfolio ─────────────────────────────────────────────────
  LinkedIn = 'LinkedIn',
  GitHub = 'GitHub',
  Portfolio = 'Portfolio',
  LeetCode = 'LeetCode',

  // ── Location & address ────────────────────────────────────────────────
  CountryOfResidence = 'CountryOfResidence',
  Country = 'Country',
  Nationality = 'Nationality',
  City = 'City',
  State = 'State',
  AddressLine1 = 'AddressLine1',
  AddressLine2 = 'AddressLine2',
  PinCode = 'PinCode',
  FullAddress = 'FullAddress',

  // ── Work preferences ──────────────────────────────────────────────────
  WillingToRelocate = 'WillingToRelocate',
  EmploymentType = 'EmploymentType',
  WillingToTravel = 'WillingToTravel',
  WorkShift = 'WorkShift',

  // ── Work authorization & compliance ───────────────────────────────────
  LegallyAuthorizedToWork = 'LegallyAuthorizedToWork',
  VisaSponsorshipRequired = 'VisaSponsorshipRequired',
  VisaStatus = 'VisaStatus',
  ConflictOfInterest = 'ConflictOfInterest',
  RelativeAtCompany = 'RelativeAtCompany',
  NonCompeteAgreement = 'NonCompeteAgreement',
  CriminalRecord = 'CriminalRecord',
  SecurityClearance = 'SecurityClearance',
  TermsConsent = 'TermsConsent',

  // ── EEO / voluntary disclosure ────────────────────────────────────────
  Gender = 'Gender',
  Pronouns = 'Pronouns',
  DateOfBirth = 'DateOfBirth',
  Ethnicity = 'Ethnicity',
  VeteranStatus = 'VeteranStatus',
  DisabilityStatus = 'DisabilityStatus',
  SexualOrientation = 'SexualOrientation',
  MaritalStatus = 'MaritalStatus',

  // ── Education ─────────────────────────────────────────────────────────
  HighestDegree = 'HighestDegree',
  University = 'University',
  FieldOfStudy = 'FieldOfStudy',
  GraduationYear = 'GraduationYear',
  Gpa = 'Gpa',

  // ── Skills & languages ──────────────────────────────────────────────────
  Certification = 'Certification',

  // ── Application meta ──────────────────────────────────────────────────
  ReasonForLeaving = 'ReasonForLeaving',
  WhyHireYou = 'WhyHireYou',
  WhyApply = 'WhyApply',
  ConflictResolution = 'ConflictResolution',
  Achievement = 'Achievement',
  FiveYearGoals = 'FiveYearGoals',
  ReferralSource = 'ReferralSource',
  PreviousEmployee = 'PreviousEmployee',
  NoticeBuyoutBond = 'NoticeBuyoutBond',
}
