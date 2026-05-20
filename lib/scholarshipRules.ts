export interface ScholarshipScheme {
  id: string;
  name: string;
  state: 'AP' | 'Telangana' | 'Both' | 'Central';
  eligibleCategories: string[];
  maxAnnualIncome: number; // in rupees
  amount: string;
  description: string;
  applyUrl: string;
  documents: string[];

  // ENRICHED FIELDS
  shortDescription: string;
  fullDescription: string;
  eligibilitySteps: string[];
  importantNotes: string[];
  disbursementTimeline: string;
}

export const SCHOLARSHIP_SCHEMES: ScholarshipScheme[] = [
  {
    id: 'ap-vidya-deevena',
    name: 'Jagananna Vidya Deevena',
    state: 'AP',
    eligibleCategories: ['SC', 'ST', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'EBC'],
    maxAnnualIncome: 250000,
    amount: 'Full tuition fee reimbursement',
    description: 'AP government scheme covering 100% tuition fee for eligible students in government-aided colleges.',
    applyUrl: 'https://apepass.apcfss.in',
    documents: [
      'Caste certificate from MRO office',
      'Income certificate from MRO (family income < Rs. 2.5 L)',
      'Aadhaar card',
      'Bank passbook (Aadhaar-linked)',
      'Fee receipt from college',
      'EAPCET rank card',
      'Intermediate marks memo',
    ],
    shortDescription: 'Full tuition fee reimbursement for SC/ST/BC/EBC students in Andhra Pradesh.',
    fullDescription: 'The Jagananna Vidya Deevena scheme covers 100% of tuition fees for eligible students pursuing professional courses in government-recognized colleges in AP. Disbursed directly to the college account. Students must reapply each academic year with updated income certificates. The scheme is administered by APCFSS.',
    eligibilitySteps: [
      'Must belong to SC/ST/BC-A/BC-B/BC-C/BC-D/BC-E or EBC',
      'Annual family income must be below Rs. 2.5 Lakhs',
      'Must be admitted to an AICTE-approved college in AP',
      'Must have aadhaar-linked bank account',
      'Apply on apepass.apcfss.in within 30 days of admission'
    ],
    importantNotes: [
      'Income certificate must be from current academic year',
      'Students who failed a year may lose eligibility',
      'Scheme covers convener quota fees only'
    ],
    disbursementTimeline: 'Within 90 days of application approval — paid directly to college'
  },
  {
    id: 'ap-vasathi-deevena',
    name: 'Jagananna Vasathi Deevena',
    state: 'AP',
    eligibleCategories: ['SC', 'ST', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'EBC'],
    maxAnnualIncome: 250000,
    amount: 'Rs. 10,000/year maintenance allowance',
    description: 'Annual maintenance allowance for hostel and day scholars to cover living expenses.',
    applyUrl: 'https://apepass.apcfss.in',
    documents: [
      'Caste certificate',
      'Income certificate',
      'Aadhaar card',
      'Bonafide certificate from college',
      'Bank passbook',
    ],
    shortDescription: 'Annual maintenance allowance of Rs. 10,000 for hostel and day scholars in AP.',
    fullDescription: 'Jagananna Vasathi Deevena provides an annual maintenance allowance to ITI, Polytechnic, and Degree/Engineering students to cover their boarding and lodging expenses. For engineering students, the allowance is Rs. 10,000 per year, disbursed in two equal installments. The amount is credited directly to the mother\'s bank account.',
    eligibilitySteps: [
      'Must belong to eligible categories (SC/ST/BC/EBC)',
      'Family income strictly below Rs. 2.5 Lakhs per year',
      'Must possess 75% aggregate attendance',
      'Must be enrolled in a recognized AP college',
      'Student\'s mother must have a working Aadhaar-linked bank account'
    ],
    importantNotes: [
      'Attendance is strictly monitored; falling below 75% results in immediate disqualification',
      'Disbursed directly into the mother\'s bank account, not the student\'s or college\'s',
      'Requires separate biometric authentication twice a year'
    ],
    disbursementTimeline: 'Disbursed in two installments (July/August and December/January)'
  },
  {
    id: 'ts-epass',
    name: 'TS ePASS',
    state: 'Telangana',
    eligibleCategories: ['SC', 'ST', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'EBC', 'Minority'],
    maxAnnualIncome: 200000,
    amount: 'Full tuition fee reimbursement',
    description: 'Telangana state full fee reimbursement for SC/ST/BC/EBC and Minority students in recognized institutions.',
    applyUrl: 'https://telanganaepass.cgg.gov.in',
    documents: [
      'Caste certificate',
      'Income certificate (< Rs. 2 L)',
      'Aadhaar card',
      'Domicile certificate (10 years in Telangana)',
      'Bank passbook',
      'EAPCET rank card',
      'Fee receipt',
    ],
    shortDescription: 'Telangana state full fee reimbursement and scholarships for marginalized categories.',
    fullDescription: 'The Telangana ePASS (Electronic Payment & Application System of Scholarships) provides Post-Matric Scholarships and Tuition Fee Reimbursement to students of Telangana. It aims to ensure that financial constraints do not hinder students from pursuing professional courses like B.Tech. It covers full or partial tuition fees depending on the rank and category.',
    eligibilitySteps: [
      'Family income must be below Rs. 2 Lakhs (for SC/ST) or Rs. 1.5 Lakhs (for Rural BC/EBC/Minority)',
      'Must have qualified in TS EAPCET/EAMCET',
      'Must be a local resident of Telangana',
      'Aadhaar verification is mandatory',
      'Apply online through the TS ePASS portal'
    ],
    importantNotes: [
      'Full fee reimbursement is applicable only if the EAPCET rank is below 10,000 (for BC/EBC)',
      'SC/ST students get full fee reimbursement irrespective of rank',
      'Management quota admissions are strictly excluded'
    ],
    disbursementTimeline: 'Within 3 to 6 months of the academic year starting, pending budget releases'
  },
  {
    id: 'ap-ebc',
    name: 'EBC Scheme AP',
    state: 'AP',
    eligibleCategories: ['OC', 'EBC'],
    maxAnnualIncome: 100000,
    amount: 'Rs. 15,000/year',
    description: 'AP scheme for Economically Backward Classes (OC) with family income below Rs. 1 lakh per year.',
    applyUrl: 'https://apepass.apcfss.in',
    documents: [
      'Income certificate from MRO (< Rs. 1 L)',
      'Aadhaar card',
      'Bank passbook',
      'Bonafide certificate',
      'EBC declaration affidavit',
    ],
    shortDescription: 'Financial assistance for Economically Backward Class (OC) students in Andhra Pradesh.',
    fullDescription: 'The EBC Scheme in AP targets students from Forward Castes (OC) who are economically weak. It provides a fixed annual financial assistance to help offset the costs of professional education. This scheme acts as a crucial support net for students who do not qualify for caste-based reservations but lack financial resources.',
    eligibilitySteps: [
      'Must belong to OC (Open Category) / Forward Castes',
      'Annual family income must be strictly below Rs. 1 Lakh',
      'Must not be availing any other government scholarship',
      'Must possess a valid EBC certificate issued by Tahsildar/MRO',
      'Register via the Jnanabhumi/ePASS portal'
    ],
    importantNotes: [
      'The income limit is significantly stricter than other schemes (Rs. 1 Lakh)',
      'Does not cover full tuition fee, only a fixed grant',
      'Requires an EBC affidavit signed by a notary'
    ],
    disbursementTimeline: 'Usually credited towards the end of the academic year'
  },
  {
    id: 'central-pms-sc',
    name: 'Post-Matric Scholarship SC (Central Govt)',
    state: 'Central',
    eligibleCategories: ['SC'],
    maxAnnualIncome: 250000,
    amount: 'Full fee + maintenance allowance',
    description: 'Central government scheme for SC students pursuing post-matriculation education at recognized institutions.',
    applyUrl: 'https://scholarships.gov.in',
    documents: [
      'SC caste certificate',
      'Income certificate (< Rs. 2.5 L)',
      'Aadhaar card',
      'Previous year marks sheet',
      'Bank passbook',
      'Institution registration certificate',
    ],
    shortDescription: 'Central government scholarship providing fee and maintenance support for SC students.',
    fullDescription: 'This federally funded scheme aims to appreciably increase the Gross Enrolment Ratio of SC students in higher education. It covers the compulsory non-refundable fees (including tuition fee) and provides a monthly maintenance allowance. The scheme is implemented by the State Governments but largely funded by the Centre.',
    eligibilitySteps: [
      'Must belong to the Scheduled Caste (SC)',
      'Annual family income must not exceed Rs. 2.5 Lakhs',
      'Must be studying in a recognized post-matriculation course',
      'Apply via the National Scholarship Portal (NSP)',
      'Aadhaar seeding with bank account is mandatory'
    ],
    importantNotes: [
      'Cannot be clubbed with state-level full fee reimbursement schemes (choose one)',
      'Students pursuing correspondence courses are also eligible for non-refundable fees',
      'Requires strict renewal every year via NSP'
    ],
    disbursementTimeline: 'Direct Benefit Transfer (DBT) within 60 days of state nodal officer verification'
  },
  {
    id: 'central-pms-st',
    name: 'Post-Matric Scholarship ST (Central Govt)',
    state: 'Central',
    eligibleCategories: ['ST'],
    maxAnnualIncome: 250000,
    amount: 'Full fee + maintenance allowance',
    description: 'Central government scheme for ST students pursuing post-matriculation education at recognized institutions.',
    applyUrl: 'https://scholarships.gov.in',
    documents: [
      'ST caste certificate',
      'Income certificate (< Rs. 2.5 L)',
      'Aadhaar card',
      'Previous year marks sheet',
      'Bank passbook',
      'Institution registration certificate',
    ],
    shortDescription: 'Central government financial assistance for ST students in higher education.',
    fullDescription: 'Run by the Ministry of Tribal Affairs, this scheme provides financial assistance to Scheduled Tribe students studying at post-matriculation levels. It includes payment of tuition fees, other compulsory fees, and a maintenance allowance to assist with living expenses during the course of study.',
    eligibilitySteps: [
      'Must be officially recognized as a Scheduled Tribe (ST)',
      'Family income from all sources must not exceed Rs. 2.5 Lakhs per annum',
      'Must be enrolled in an approved course at a recognized institution',
      'Apply online via the National Scholarship Portal (NSP)',
      'Submit physical verification documents to the college nodal officer'
    ],
    importantNotes: [
      'Students employed full-time are not eligible',
      'Only two boys of the same parents/guardian are eligible (no restriction for girls)',
      'Late applications on NSP are strictly rejected'
    ],
    disbursementTimeline: 'Processed in batches; usually disbursed via DBT between January and March'
  },
  {
    id: 'pm-yasasvi',
    name: 'PM YASASVI',
    state: 'Central',
    eligibleCategories: ['OBC', 'EBC'],
    maxAnnualIncome: 250000,
    amount: 'Rs. 75,000 to Rs. 1,25,000 per year',
    description: 'Central government\'s PM Young Achievers Scholarship Award Scheme for Vibrant India for OBC/EBC students.',
    applyUrl: 'https://scholarships.gov.in',
    documents: [
      'OBC/EBC caste certificate',
      'Income certificate (< Rs. 2.5 L)',
      'Aadhaar card',
      'Intermediate marks sheet',
      'Bank passbook',
    ],
    shortDescription: 'High-value Central scholarship for meritorious OBC and EBC students.',
    fullDescription: 'PM YASASVI (Young Achievers Scholarship Award Scheme for Vibrant India) is a flagship umbrella scheme by the Ministry of Social Justice and Empowerment. It is specifically designed to support highly meritorious students from OBC, EBC, and DNT categories studying in Top Class Schools and Colleges. It covers tuition fees, hostel fees, and other educational expenses.',
    eligibilitySteps: [
      'Must belong to OBC, EBC, or DNT categories',
      'Annual family income must be below Rs. 2.5 Lakhs',
      'Must secure admission in one of the designated "Top Class Institutions"',
      'Must clear the YASASVI Entrance Test (YET) conducted by NTA (for some tiers)',
      'Apply via the National Scholarship Portal'
    ],
    importantNotes: [
      'Highly competitive; only top-ranking students across the country are selected',
      'Only applicable for institutes listed under the PM YASASVI Top Class category',
      'Maintenance allowance is capped at Rs. 3000/month for hostellers'
    ],
    disbursementTimeline: 'Disbursed directly via DBT after national merit list publication'
  },
  {
    id: 'maulana-azad-minority',
    name: 'Maulana Azad National Fellowship (Minority)',
    state: 'Central',
    eligibleCategories: ['Minority'],
    maxAnnualIncome: 200000,
    amount: 'Full fee reimbursement',
    description: 'For students from minority communities (Muslim, Christian, Sikh, Parsi, Jain, Buddhist) with family income < Rs. 2 lakhs.',
    applyUrl: 'https://scholarships.gov.in',
    documents: [
      'Minority community certificate',
      'Income certificate (< Rs. 2 L)',
      'Aadhaar card',
      'Previous year marks sheet',
      'Bank passbook',
    ],
    shortDescription: 'Fellowship and fee reimbursement for students from notified minority communities.',
    fullDescription: 'Funded by the Ministry of Minority Affairs, this scheme provides integrated financial support for minority students (Muslims, Christians, Sikhs, Buddhists, Parsis, and Jains). It encompasses post-matric scholarships and fellowships, aiming to increase the higher education participation rate among minority communities.',
    eligibilitySteps: [
      'Must belong to a notified minority community',
      'Family income must not exceed Rs. 2 Lakhs per annum',
      'Must have secured at least 50% marks in the previous final examination',
      'Apply through the National Scholarship Portal (NSP)',
      'Provide a self-declaration of minority community status'
    ],
    importantNotes: [
      '30% of the scholarships are specifically earmarked for female students',
      'Only two students from the same family can avail this scholarship',
      'Subject to state-wise quota distribution based on minority population'
    ],
    disbursementTimeline: 'Direct Bank Transfer (DBT) usually completed by February/March of the academic year'
  },
  {
    id: 'reliance-foundation',
    name: 'Reliance Foundation Scholarship',
    state: 'Both',
    eligibleCategories: ['OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST', 'EBC', 'OBC', 'Minority'],
    maxAnnualIncome: 250000,
    amount: 'Up to Rs. 2,00,000 per year',
    description: 'Merit-cum-means scholarship open to all categories pursuing UG degree in STEM/Humanities/Commerce.',
    applyUrl: 'https://rf.foundation',
    documents: [
      'Income certificate',
      'Aadhaar card',
      '12th/Intermediate mark sheet',
      'Admission letter',
      'Bank passbook',
      'Essay / statement of purpose',
    ],
    shortDescription: 'Generous private scholarship supporting up to 5,000 undergraduate students nationwide.',
    fullDescription: 'The Reliance Foundation Undergraduate Scholarships support meritorious students across India to pursue their undergraduate college education. Aimed at empowering youth, the scheme evaluates candidates on both merit and financial need, supplemented by an aptitude test. It provides substantial financial coverage, allowing students to focus entirely on their studies.',
    eligibilitySteps: [
      'Open to first-year UG students across all categories',
      'Must have passed 12th standard with a minimum of 60% marks',
      'Household income preferred to be under Rs. 2.5 Lakhs, but up to Rs. 15 Lakhs can apply',
      'Must appear for the online Reliance Foundation Aptitude Test',
      'Submit application with essays via the official Reliance Foundation portal'
    ],
    importantNotes: [
      'Extremely competitive selection process based on the aptitude test and application essays',
      'Does not prevent you from availing state/central government scholarships simultaneously',
      'Also provides access to an active alumni network and mentoring'
    ],
    disbursementTimeline: 'Selected scholars receive funds in their accounts within a month of the award announcement'
  },
  {
    id: 'sitaram-jindal',
    name: 'Sitaram Jindal Foundation Scholarship',
    state: 'Both',
    eligibleCategories: ['OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST', 'EBC', 'OBC', 'Minority'],
    maxAnnualIncome: 250000,
    amount: 'Rs. 1,000 to Rs. 2,500 per month',
    description: 'Monthly scholarship for meritorious students with financial need across all categories and streams.',
    applyUrl: 'https://sitaramjindalfoundation.org',
    documents: [
      'Income certificate',
      'Aadhaar card',
      '10th and 12th mark sheets',
      'Admission letter',
      'Bank passbook',
      'Passport size photos',
    ],
    shortDescription: 'Private monthly scholarship for deserving students based on merit and financial need.',
    fullDescription: 'The Sitaram Jindal Foundation provides one of India\'s most reliable private scholarships for undergraduate and postgraduate students. It is a merit-cum-means based scheme that provides a steady monthly stipend to help students with daily educational and living expenses. It is open to all streams including engineering, medicine, and arts.',
    eligibilitySteps: [
      'Must have secured at least 65% (boys) or 60% (girls) in previous exams',
      'Family income should not exceed Rs. 2.5 Lakhs (varies slightly by employment type)',
      'Download the application form from the Sitaram Jindal Foundation website',
      'Fill out the physical form and get it attested by the college Principal',
      'Mail the hard copy of the application with documents to the Foundation office'
    ],
    importantNotes: [
      'This is an offline application process; forms must be printed and mailed',
      'Special relaxation in marks percentage is given for physically challenged students',
      'Hostellers get an additional amount compared to day scholars'
    ],
    disbursementTimeline: 'Processed continuously; cheques are sent to the college within 2-3 months of receiving the application'
  }
];

export type EligibilityResult = {
  eligible: ScholarshipScheme[];
  possiblyEligible: ScholarshipScheme[];
  notEligible: ScholarshipScheme[];
  totalPotentialSavings: string;
};

export function checkEligibility(params: {
  state: 'AP' | 'Telangana';
  category: string;
  annualIncome: number;
  incomeCertificate: 'yes' | 'no' | 'will-get';
}): EligibilityResult {
  const { state, category, annualIncome, incomeCertificate } = params;

  const eligible: ScholarshipScheme[] = [];
  const possiblyEligible: ScholarshipScheme[] = [];
  const notEligible: ScholarshipScheme[] = [];

  for (const scheme of SCHOLARSHIP_SCHEMES) {
    // Check state match
    const stateMatch =
      scheme.state === 'Both' ||
      scheme.state === 'Central' ||
      scheme.state === state;

    // Check category match
    const catMatch = scheme.eligibleCategories.includes(category);

    // Check income
    const incomeMatch = annualIncome <= scheme.maxAnnualIncome;

    if (!stateMatch || !catMatch) {
      notEligible.push(scheme);
      continue;
    }

    if (!incomeMatch) {
      notEligible.push(scheme);
      continue;
    }

    // Income matches but certificate status matters
    if (incomeCertificate === 'yes') {
      eligible.push(scheme);
    } else if (incomeCertificate === 'will-get') {
      possiblyEligible.push(scheme);
    } else {
      // no certificate — possibly eligible
      possiblyEligible.push(scheme);
    }
  }

  // Calculate potential savings (rough sum for eligible)
  const amountMap: Record<string, number> = {
    'ap-vidya-deevena': 100000,
    'ap-vasathi-deevena': 10000,
    'ts-epass': 100000,
    'ap-ebc': 15000,
    'central-pms-sc': 120000,
    'central-pms-st': 120000,
    'pm-yasasvi': 100000,
    'maulana-azad-minority': 100000,
    'reliance-foundation': 200000,
    'sitaram-jindal': 30000,
  };

  const total = eligible.reduce((sum, s) => sum + (amountMap[s.id] ?? 0), 0);
  const totalPotentialSavings =
    total > 0
      ? `Rs. ${(total / 100000).toFixed(1)} Lakhs`
      : '₹0 (check eligibility requirements)';

  return { eligible, possiblyEligible, notEligible, totalPotentialSavings };
}
