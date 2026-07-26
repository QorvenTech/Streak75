import type { SubjectIconId } from './subjectIconAssets';

export type SubjectIconCategoryId =
  | 'science-engineering'
  | 'commerce-law'
  | 'humanities-languages'
  | 'arts-other'
  | 'professional-emerging';

export interface SubjectIconDefinition {
  id: SubjectIconId;
  label: string;
  keywords: string[];
  category: SubjectIconCategoryId;
}

interface SubjectIconGroup {
  id: SubjectIconCategoryId;
  label: string;
  icons: SubjectIconDefinition[];
}

const icon = (
  category: SubjectIconCategoryId,
  id: SubjectIconId,
  label: string,
  keywords: string[] = [],
): SubjectIconDefinition => ({ category, id, label, keywords });

const science = 'science-engineering';
const commerce = 'commerce-law';
const humanities = 'humanities-languages';
const arts = 'arts-other';
const professional = 'professional-emerging';

export const SUBJECT_ICON_GROUPS: SubjectIconGroup[] = [
  {
    id: science,
    label: 'Science & Engineering',
    icons: [
      icon(science, 'mathematics', 'Mathematics', ['math', 'maths', 'engineering mathematics', 'applied maths', 'quantitative aptitude', 'statistics', 'business statistics', 'probability']),
      icon(science, 'physics', 'Physics', ['applied physics', 'engineering physics']),
      icon(science, 'chemistry', 'Chemistry', ['chem', 'organic chemistry', 'inorganic chemistry', 'physical chemistry']),
      icon(science, 'biology', 'Biology', ['bio', 'life science', 'biological science']),
      icon(science, 'biotechnology', 'Biotechnology', ['biotech', 'genetic engineering']),
      icon(science, 'microbiology', 'Microbiology', ['microbio', 'bacteriology']),
      icon(science, 'botany', 'Botany', ['plant science', 'plant biology']),
      icon(science, 'zoology', 'Zoology', ['animal science', 'animal biology']),
      icon(science, 'environmental-science', 'Environmental Science', ['evs', 'environmental studies', 'ecology']),
      icon(science, 'geology', 'Geology', ['earth science', 'geoscience', 'mineralogy']),
      icon(science, 'computer-science', 'Computer Science', ['cs', 'cse', 'computer applications', 'bca', 'mca', 'programming', 'coding', 'java', 'python', 'c++', 'cpp', 'dsa', 'data structures', 'dbms', 'database systems', 'operating systems', 'os', 'computer networks', 'web development', 'mobile app development', 'react native', 'android development', 'ios development', 'flutter']),
      icon(science, 'information-technology', 'Information Technology', ['it', 'information systems', 'software engineering', 'web technology']),
      icon(science, 'data-science', 'Data Science', ['data analytics', 'big data', 'data mining', 'business intelligence']),
      icon(science, 'artificial-intelligence', 'Artificial Intelligence', ['ai', 'machine learning', 'ml', 'deep learning', 'neural networks', 'generative ai']),
      icon(science, 'cyber-security', 'Cyber Security', ['cybersecurity', 'information security', 'infosec', 'ethical hacking', 'network security']),
      icon(science, 'electronics', 'Electronics', ['ece', 'electronics and communication', 'digital electronics']),
      icon(science, 'electrical-engineering', 'Electrical Engineering', ['electrical', 'ee', 'electrical engg', 'power systems']),
      icon(science, 'mechanical-engineering', 'Mechanical Engineering', ['mechanical', 'mech', 'mechanical engg', 'thermodynamics']),
      icon(science, 'civil-engineering', 'Civil Engineering', ['civil', 'civil engg', 'structural engineering', 'surveying']),
      icon(science, 'aerospace-engineering', 'Aerospace Engineering', ['aeronautical engineering', 'aviation engineering']),
      icon(science, 'automobile-engineering', 'Automobile Engineering', ['automobile', 'automotive engineering', 'vehicle engineering']),
      icon(science, 'chemical-engineering', 'Chemical Engineering', ['chemical engg', 'process engineering']),
      icon(science, 'instrumentation-engineering', 'Instrumentation Engineering', ['instrumentation', 'ice', 'control engineering']),
      icon(science, 'mechatronics', 'Mechatronics Engineering', ['mechatronics', 'automation engineering']),
      icon(science, 'robotics', 'Robotics', ['robotics engineering', 'industrial robotics']),
    ],
  },
  {
    id: commerce,
    label: 'Commerce, Management & Law',
    icons: [
      icon(commerce, 'accountancy', 'Accounting', ['accounts', 'accountancy', 'book keeping', 'bookkeeping', 'financial accounting', 'management accounting']),
      icon(commerce, 'finance', 'Finance', ['fm', 'financial management', 'corporate finance', 'investment']),
      icon(commerce, 'business-management', 'Business Management', ['business studies', 'bst', 'management', 'bms', 'business administration']),
      icon(commerce, 'marketing', 'Marketing', ['digital marketing', 'sales management', 'advertising', 'brand management']),
      icon(commerce, 'human-resource-management', 'Human Resource Management', ['hr', 'hrm', 'human resources', 'personnel management', 'organizational behaviour', 'ob']),
      icon(commerce, 'international-business', 'International Business', ['ib', 'global business', 'foreign trade', 'international trade']),
      icon(commerce, 'entrepreneurship', 'Entrepreneurship', ['edp', 'startup management', 'innovation and entrepreneurship']),
      icon(commerce, 'economics', 'Economics', ['eco', 'micro economics', 'microeconomics', 'macro economics', 'macroeconomics', 'managerial economics']),
      icon(commerce, 'banking', 'Banking', ['banking management', 'banking operations', 'banking law']),
      icon(commerce, 'insurance', 'Insurance', ['risk management', 'insurance management']),
      icon(commerce, 'auditing', 'Auditing', ['audit', 'audit and assurance', 'internal audit']),
      icon(commerce, 'taxation', 'Taxation', ['tax', 'income tax', 'direct tax', 'indirect tax']),
      icon(commerce, 'gst', 'GST', ['goods and services tax', 'gst law']),
      icon(commerce, 'business-analytics', 'Business Analytics', ['ba', 'management analytics', 'analytics for business']),
      icon(commerce, 'e-commerce', 'E-Commerce', ['ecommerce', 'electronic commerce', 'online business']),
      icon(commerce, 'operations-management', 'Operations Management', ['operations', 'om', 'production management', 'operations research']),
      icon(commerce, 'supply-chain-management', 'Supply Chain Management', ['scm', 'supply chain', 'logistics', 'procurement']),
      icon(commerce, 'project-management', 'Project Management', ['pm', 'project planning']),
      icon(commerce, 'hospitality-management', 'Hospitality Management', ['hospitality', 'hotel administration']),
      icon(commerce, 'retail-management', 'Retail Management', ['retail', 'retailing', 'merchandising']),
      icon(commerce, 'law', 'Law', ['business law', 'commercial law', 'mercantile law', 'legal studies', 'llb']),
      icon(commerce, 'corporate-law', 'Corporate Law', ['company law', 'companies act']),
      icon(commerce, 'constitutional-law', 'Constitutional Law', ['constitution', 'indian constitution']),
      icon(commerce, 'criminal-law', 'Criminal Law', ['criminology law', 'penal law']),
      icon(commerce, 'human-rights', 'Human Rights', ['rights law', 'civil rights']),
    ],
  },
  {
    id: humanities,
    label: 'Humanities, Social Science & Languages',
    icons: [
      icon(humanities, 'english-literature', 'English Literature', ['english lit', 'literature']),
      icon(humanities, 'hindi-literature', 'Hindi Literature', ['hindi sahitya']),
      icon(humanities, 'sanskrit', 'Sanskrit', ['sanskrit literature', 'sanskrit language']),
      icon(humanities, 'history', 'History', ['ancient history', 'medieval history', 'modern history', 'indian history']),
      icon(humanities, 'political-science', 'Political Science', ['pol science', 'pol sci', 'politics', 'civics']),
      icon(humanities, 'sociology', 'Sociology', ['socio', 'society studies']),
      icon(humanities, 'psychology', 'Psychology', ['psych', 'applied psychology', 'human behaviour']),
      icon(humanities, 'philosophy', 'Philosophy', ['ethics', 'logic', 'moral philosophy']),
      icon(humanities, 'public-administration', 'Public Administration', ['public admin', 'pub ad', 'governance']),
      icon(humanities, 'geography', 'Geography', ['geo', 'human geography', 'physical geography']),
      icon(humanities, 'journalism-mass-communication', 'Journalism & Mass Communication', ['journalism', 'mass communication', 'mass comm', 'media studies', 'reporting']),
      icon(humanities, 'education', 'Education', ['b ed', 'bed', 'teaching', 'pedagogy']),
      icon(humanities, 'social-work', 'Social Work', ['msw', 'community work', 'social service']),
      icon(humanities, 'linguistics', 'Linguistics', ['language science', 'language studies']),
      icon(humanities, 'foreign-languages', 'Foreign Languages', ['foreign language', 'french', 'german', 'spanish']),
      icon(humanities, 'hindi', 'Hindi', ['hindi language']),
      icon(humanities, 'english', 'English', ['communicative english', 'business english', 'english language']),
      icon(humanities, 'urdu', 'Urdu', ['urdu literature', 'urdu language']),
      icon(humanities, 'bengali', 'Bengali', ['bangla']),
      icon(humanities, 'tamil', 'Tamil', ['tamil language']),
      icon(humanities, 'telugu', 'Telugu', ['telugu language']),
      icon(humanities, 'marathi', 'Marathi', ['marathi language']),
      icon(humanities, 'gujarati', 'Gujarati', ['gujarati language']),
      icon(humanities, 'kannada', 'Kannada', ['kannada language']),
      icon(humanities, 'malayalam', 'Malayalam', ['malayalam language']),
    ],
  },
  {
    id: arts,
    label: 'Arts, Design, Media & Other Studies',
    icons: [
      icon(arts, 'fine-arts', 'Fine Arts', ['visual arts', 'painting', 'drawing']),
      icon(arts, 'performing-arts', 'Performing Arts', ['theatre', 'theater', 'dance', 'drama']),
      icon(arts, 'visual-communication', 'Visual Communication', ['communication design', 'visual design']),
      icon(arts, 'graphic-design', 'Graphic Design', ['ui design', 'digital design']),
      icon(arts, 'interior-design', 'Interior Design', ['interior designing', 'space design']),
      icon(arts, 'fashion-design', 'Fashion Design', ['apparel design', 'textile design']),
      icon(arts, 'animation', 'Animation', ['vfx', 'visual effects', '3d animation', 'multimedia']),
      icon(arts, 'film-studies', 'Film Studies', ['cinema studies', 'filmmaking', 'film production']),
      icon(arts, 'photography', 'Photography', ['digital photography', 'camera studies']),
      icon(arts, 'music', 'Music', ['vocal music', 'instrumental music', 'music theory']),
      icon(arts, 'physical-education', 'Physical Education', ['pe', 'sports', 'sports science', 'fitness']),
      icon(arts, 'yoga', 'Yoga', ['yogic science']),
      icon(arts, 'library-science', 'Library Science', ['lis', 'blis', 'library and information science']),
      icon(arts, 'archaeology', 'Archaeology', ['archeology', 'heritage studies']),
      icon(arts, 'anthropology', 'Anthropology', ['cultural anthropology', 'human evolution']),
      icon(arts, 'tourism-management', 'Tourism Management', ['tourism', 'travel and tourism']),
      icon(arts, 'nutrition-dietetics', 'Nutrition & Dietetics', ['nutrition', 'dietetics', 'food and nutrition']),
      icon(arts, 'home-science', 'Home Science', ['home economics', 'home management']),
      icon(arts, 'disaster-management', 'Disaster Management', ['emergency management']),
      icon(arts, 'event-management', 'Event Management', ['events', 'event planning']),
      icon(arts, 'hotel-management', 'Hotel Management', ['hotel administration', 'hm']),
      icon(arts, 'fire-safety', 'Fire Safety', ['fire engineering', 'industrial safety']),
      icon(arts, 'forensic-science', 'Forensic Science', ['forensics']),
      icon(arts, 'criminology', 'Criminology', ['crime studies']),
      icon(arts, 'defense-studies', 'Defense Studies', ['defence studies', 'military studies']),
    ],
  },
  {
    id: professional,
    label: 'Professional, Paramedical & Emerging Fields',
    icons: [
      icon(professional, 'medicine-mbbs', 'Medicine (MBBS)', ['medicine', 'mbbs', 'medical science', 'anatomy', 'physiology', 'pathology']),
      icon(professional, 'nursing', 'Nursing', ['nursing foundation', 'medical surgical nursing']),
      icon(professional, 'pharmacy', 'Pharmacy', ['pharmacology', 'pharma', 'b pharm', 'd pharm']),
      icon(professional, 'physiotherapy', 'Physiotherapy', ['bpt', 'physical therapy']),
      icon(professional, 'dentistry', 'Dentistry', ['bds', 'dental science']),
      icon(professional, 'ayurveda', 'Ayurveda', ['bams', 'ayurvedic medicine']),
      icon(professional, 'veterinary-science', 'Veterinary Science', ['veterinary', 'vet science', 'animal health']),
      icon(professional, 'optometry', 'Optometry', ['eye care', 'vision science']),
      icon(professional, 'radiology', 'Radiology', ['medical imaging', 'x ray technology']),
      icon(professional, 'medical-laboratory-technology', 'Medical Lab Technology', ['mlt', 'dmlt', 'medical laboratory technology', 'lab technician']),
      icon(professional, 'bcom', 'B.Com', ['b com', 'bachelor of commerce', 'commerce']),
      icon(professional, 'bba', 'BBA', ['bachelor of business administration']),
      icon(professional, 'mcom', 'M.Com', ['m com', 'master of commerce']),
      icon(professional, 'mba', 'MBA', ['master of business administration']),
      icon(professional, 'ca', 'CA', ['chartered accountancy', 'chartered accountant']),
      icon(professional, 'cost-works-accounting', 'Cost & Works Accounting', ['cost accounting', 'cma', 'cost accountancy']),
      icon(professional, 'company-secretaryship', 'Company Secretaryship', ['company secretary', 'cs executive', 'cs professional']),
      icon(professional, 'actuarial-science', 'Actuarial Science', ['actuary', 'actuarial studies']),
      icon(professional, 'hotel-management-catering', 'Hotel Mgmt. & Catering Tech.', ['catering technology', 'hospitality technology']),
      icon(professional, 'airline-airport-management', 'Airline & Airport Management', ['aviation management', 'airport management', 'airline management']),
      icon(professional, 'bioinformatics', 'Bioinformatics', ['computational biology']),
      icon(professional, 'genetics', 'Genetics', ['genomics', 'human genetics']),
      icon(professional, 'nanotechnology', 'Nanotechnology', ['nano science', 'nanoscience']),
      icon(professional, 'marine-biology', 'Marine Biology', ['marine science', 'ocean biology', 'fisheries']),
      icon(professional, 'environmental-engineering', 'Environmental Engineering', ['environment engineering', 'sustainable engineering']),
    ],
  },
];

export const SUBJECT_ICONS = SUBJECT_ICON_GROUPS.flatMap(
  (group) => group.icons,
);

const iconById = new Map(
  SUBJECT_ICONS.map((definition) => [definition.id, definition]),
);

const LEGACY_ICON_ALIASES: Record<string, SubjectIconId> = {
  'generic-subject': 'generic-subject',
  statistics: 'mathematics',
  commerce: 'bcom',
  'business-studies': 'business-management',
  'general-science': 'biology',
  'financial-accounting': 'accountancy',
  'cost-accounting': 'cost-works-accounting',
  'management-accounting': 'accountancy',
  'business-law': 'law',
  'company-law': 'corporate-law',
  programming: 'computer-science',
  java: 'computer-science',
  python: 'computer-science',
  'c-plus-plus': 'computer-science',
  'data-structures': 'computer-science',
  dbms: 'computer-science',
  'operating-systems': 'information-technology',
  'computer-networks': 'information-technology',
  'web-development': 'information-technology',
  'mobile-app-development': 'information-technology',
  'machine-learning': 'artificial-intelligence',
  'electronics-communication': 'electronics',
  architecture: 'civil-engineering',
  biochemistry: 'biotechnology',
  anatomy: 'medicine-mbbs',
  physiology: 'medicine-mbbs',
  pharmacology: 'pharmacy',
  pathology: 'medicine-mbbs',
  agriculture: 'environmental-science',
  horticulture: 'environmental-science',
  'food-technology': 'nutrition-dietetics',
  forestry: 'environmental-science',
  'soil-science': 'environmental-science',
  fisheries: 'marine-biology',
  'environmental-management': 'environmental-science',
  journalism: 'journalism-mass-communication',
  'mass-communication': 'journalism-mass-communication',
  dance: 'performing-arts',
  theatre: 'performing-arts',
  'rural-development': 'social-work',
  french: 'foreign-languages',
  german: 'foreign-languages',
};

export const GENERIC_SUBJECT_ICON: SubjectIconDefinition = {
  id: 'generic-subject',
  label: 'General Subject',
  keywords: ['generic', 'other subject', 'miscellaneous'],
  category: science,
};

export function normalizeSubjectName(value: string): string {
  return value
    .toLowerCase()
    .replace(/c\+\+/g, 'cpp')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function matchScore(
  normalizedQuery: string,
  definition: SubjectIconDefinition,
): number {
  if (!normalizedQuery) return 0;
  const phrases = [
    definition.label,
    definition.id.replace(/-/g, ' '),
    ...definition.keywords,
  ].map(normalizeSubjectName);
  let best = 0;

  for (const phrase of phrases) {
    if (!phrase) continue;
    if (normalizedQuery === phrase) {
      best = Math.max(best, 100_000 + phrase.length);
      continue;
    }
    if (` ${normalizedQuery} `.includes(` ${phrase} `)) {
      best = Math.max(best, 80_000 + phrase.length * 10);
    }
    if (normalizedQuery.length >= 3 && phrase.startsWith(normalizedQuery)) {
      best = Math.max(best, 60_000 + normalizedQuery.length * 10);
    }
    if (normalizedQuery.length >= 4 && phrase.includes(normalizedQuery)) {
      best = Math.max(best, 50_000 + normalizedQuery.length * 10);
    }

    const queryTokens = normalizedQuery.split(' ');
    const phraseTokens = new Set(phrase.split(' '));
    const matchedTokens = queryTokens.filter(
      (token) => token.length >= 2 && phraseTokens.has(token),
    );
    if (matchedTokens.length === queryTokens.length && matchedTokens.length) {
      best = Math.max(
        best,
        30_000 + matchedTokens.reduce((sum, token) => sum + token.length, 0),
      );
    }
  }
  return best;
}

export function suggestSubjectIcon(subjectName: string): SubjectIconDefinition {
  const normalizedQuery = normalizeSubjectName(subjectName);
  let best = GENERIC_SUBJECT_ICON;
  let bestScore = 0;
  for (const definition of SUBJECT_ICONS) {
    const score = matchScore(normalizedQuery, definition);
    if (score > bestScore) {
      best = definition;
      bestScore = score;
    }
  }
  return best;
}

export function getSubjectIcon(iconId?: string | null): SubjectIconDefinition {
  if (!iconId || iconId === 'generic-subject') return GENERIC_SUBJECT_ICON;
  const normalizedId = LEGACY_ICON_ALIASES[iconId] ?? iconId;
  return (
    iconById.get(normalizedId as SubjectIconId) ?? GENERIC_SUBJECT_ICON
  );
}

export function filterSubjectIcons(query: string): SubjectIconDefinition[] {
  const normalizedQuery = normalizeSubjectName(query);
  if (!normalizedQuery) return SUBJECT_ICONS;
  return SUBJECT_ICONS.filter((definition) =>
    [definition.label, definition.id, ...definition.keywords]
      .map(normalizeSubjectName)
      .some((value) => value.includes(normalizedQuery)),
  );
}
