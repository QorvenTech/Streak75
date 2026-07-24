import type { SubjectIconId } from './subjectIconAssets';

export interface SubjectIconDefinition {
  id: SubjectIconId;
  label: string;
  keywords: string[];
}

const defineIcon = (
  id: SubjectIconId,
  label: string,
  keywords: string[],
): SubjectIconDefinition => ({
  id,
  label,
  keywords,
});

export const SUBJECT_ICONS: SubjectIconDefinition[] = [
  defineIcon('generic-subject', 'General Subject', [
    'generic',
    'other subject',
    'miscellaneous',
  ]),
  defineIcon('mathematics', 'Mathematics', [
    'math',
    'maths',
    'applied mathematics',
    'engineering mathematics',
    'quantitative aptitude',
    'quant',
  ]),
  defineIcon('physics', 'Physics', [
    'applied physics',
    'engineering physics',
    'modern physics',
  ]),
  defineIcon('chemistry', 'Chemistry', [
    'chem',
    'applied chemistry',
    'organic chemistry',
    'inorganic chemistry',
    'physical chemistry',
  ]),
  defineIcon('biology', 'Biology', [
    'bio',
    'life science',
    'life sciences',
    'biological science',
  ]),
  defineIcon('computer-science', 'Computer Science', [
    'cs',
    'cse',
    'computer application',
    'computer applications',
    'computer fundamentals',
    'computers',
    'informatics practices',
    'ip',
    'bca',
    'mca',
  ]),
  defineIcon('english', 'English', [
    'english literature',
    'communicative english',
    'english communication',
    'business english',
    'language skills',
  ]),
  defineIcon('hindi', 'Hindi', [
    'hindi literature',
    'hindi language',
    'functional hindi',
  ]),
  defineIcon('economics', 'Economics', [
    'eco',
    'micro economics',
    'microeconomics',
    'macro economics',
    'macroeconomics',
    'managerial economics',
    'business economics',
    'economics hons',
  ]),
  defineIcon('political-science', 'Political Science', [
    'pol science',
    'pol sci',
    'politics',
    'political theory',
    'civics',
  ]),
  defineIcon('history', 'History', [
    'ancient history',
    'medieval history',
    'modern history',
    'indian history',
    'world history',
  ]),
  defineIcon('geography', 'Geography', [
    'geo',
    'human geography',
    'physical geography',
    'geospatial studies',
  ]),
  defineIcon('sociology', 'Sociology', [
    'socio',
    'social sociology',
    'society studies',
  ]),
  defineIcon('psychology', 'Psychology', [
    'psych',
    'applied psychology',
    'clinical psychology',
    'human behaviour',
  ]),
  defineIcon('philosophy', 'Philosophy', [
    'ethics',
    'logic',
    'moral philosophy',
  ]),
  defineIcon('statistics', 'Statistics', [
    'stats',
    'business statistics',
    'probability and statistics',
    'probability',
    'statistical methods',
    'biostatistics',
  ]),
  defineIcon('environmental-science', 'Environmental Science', [
    'evs',
    'environmental studies',
    'ecology',
    'environment science',
    'green studies',
  ]),
  defineIcon('commerce', 'Commerce', [
    'commercial studies',
    'bcom',
    'b com',
    'commerce studies',
  ]),
  defineIcon('business-studies', 'Business Studies', [
    'bst',
    'business study',
    'business organization',
    'business organisation',
  ]),
  defineIcon('accountancy', 'Accountancy', [
    'accounts',
    'accounting',
    'book keeping',
    'bookkeeping',
    'basic accounting',
  ]),
  defineIcon('sanskrit', 'Sanskrit', [
    'sanskrit literature',
    'sanskrit language',
  ]),
  defineIcon('physical-education', 'Physical Education', [
    'pe',
    'physical training',
    'sports',
    'sports science',
    'fitness education',
  ]),
  defineIcon('general-science', 'General Science', [
    'science',
    'basic science',
    'integrated science',
    'general sciences',
  ]),
  defineIcon('financial-accounting', 'Financial Accounting', [
    'financial accounts',
    'fin accounting',
    'fin acc',
    'corporate accounting',
  ]),
  defineIcon('cost-accounting', 'Cost Accounting', [
    'cost accounts',
    'costing',
    'cost and management accounting',
    'cost accountancy',
  ]),
  defineIcon('management-accounting', 'Management Accounting', [
    'managerial accounting',
    'management accounts',
    'management accountancy',
    'ma accounting',
  ]),
  defineIcon('taxation', 'Taxation', [
    'tax',
    'income tax',
    'direct tax',
    'indirect tax',
    'tax laws',
  ]),
  defineIcon('gst', 'GST', [
    'goods and services tax',
    'goods services tax',
    'gst law',
  ]),
  defineIcon('auditing', 'Auditing', [
    'audit',
    'audit and assurance',
    'internal audit',
    'statutory audit',
  ]),
  defineIcon('business-law', 'Business Law', [
    'commercial law',
    'mercantile law',
    'business legislation',
  ]),
  defineIcon('company-law', 'Company Law', [
    'corporate law',
    'companies act',
    'company legislation',
  ]),
  defineIcon('banking', 'Banking', [
    'banking management',
    'bank management',
    'banking operations',
    'banking law',
  ]),
  defineIcon('finance', 'Finance', [
    'financial management',
    'fm',
    'corporate finance',
    'investment management',
    'investment',
  ]),
  defineIcon('marketing', 'Marketing', [
    'marketing management',
    'digital marketing',
    'sales management',
    'advertising',
    'brand management',
  ]),
  defineIcon('human-resource-management', 'Human Resource Management', [
    'human resources',
    'hr',
    'hrm',
    'personnel management',
    'organizational behaviour',
    'organisational behaviour',
    'ob',
  ]),
  defineIcon('entrepreneurship', 'Entrepreneurship', [
    'entrepreneurship development',
    'edp',
    'startup management',
    'startups',
    'innovation and entrepreneurship',
  ]),
  defineIcon('international-business', 'International Business', [
    'ib',
    'global business',
    'foreign trade',
    'international trade',
    'export import management',
  ]),
  defineIcon('e-commerce', 'E-Commerce', [
    'ecommerce',
    'electronic commerce',
    'online business',
    'digital commerce',
  ]),
  defineIcon('supply-chain-management', 'Supply Chain Management', [
    'supply chain',
    'scm',
    'logistics',
    'logistics management',
    'procurement management',
  ]),
  defineIcon('operations-management', 'Operations Management', [
    'operations',
    'om',
    'production management',
    'production and operations',
    'operations research',
  ]),
  defineIcon('business-analytics', 'Business Analytics', [
    'ba',
    'business intelligence',
    'management analytics',
    'analytics for business',
  ]),
  defineIcon('public-administration', 'Public Administration', [
    'public admin',
    'pub ad',
    'governance',
    'administrative studies',
  ]),
  defineIcon('hotel-management', 'Hotel Management', [
    'hospitality management',
    'hospitality',
    'hm',
    'hotel administration',
  ]),
  defineIcon('tourism-management', 'Tourism Management', [
    'tourism',
    'travel and tourism',
    'travel management',
  ]),
  defineIcon('retail-management', 'Retail Management', [
    'retail',
    'retailing',
    'store management',
    'merchandising',
  ]),
  defineIcon('programming', 'Programming', [
    'coding',
    'computer programming',
    'programming fundamentals',
    'problem solving using programming',
  ]),
  defineIcon('java', 'Java', [
    'java programming',
    'core java',
    'advanced java',
    'oop in java',
    'j2ee',
  ]),
  defineIcon('python', 'Python', [
    'python programming',
    'programming in python',
    'python development',
  ]),
  defineIcon('c-plus-plus', 'C++', [
    'cpp',
    'c plus plus',
    'c++ programming',
    'object oriented programming',
    'oops',
    'oop',
  ]),
  defineIcon('data-structures', 'Data Structures', [
    'dsa',
    'data structure',
    'data structures and algorithms',
    'algorithms',
    'algorithm design',
  ]),
  defineIcon('dbms', 'DBMS', [
    'database',
    'database management system',
    'database management systems',
    'database systems',
    'rdbms',
    'sql',
  ]),
  defineIcon('operating-systems', 'Operating Systems', [
    'os',
    'operating system',
    'system software',
    'unix operating system',
    'linux',
  ]),
  defineIcon('computer-networks', 'Computer Networks', [
    'cn',
    'computer networking',
    'networking',
    'data communication',
    'data communications and networking',
  ]),
  defineIcon('web-development', 'Web Development', [
    'web dev',
    'website development',
    'frontend',
    'front end development',
    'backend',
    'back end development',
    'full stack',
    'html css javascript',
  ]),
  defineIcon('mobile-app-development', 'Mobile App Development', [
    'app development',
    'mobile development',
    'android development',
    'ios development',
    'react native',
    'flutter',
  ]),
  defineIcon('artificial-intelligence', 'Artificial Intelligence', [
    'ai',
    'artificial intelligence and expert systems',
    'intelligent systems',
    'generative ai',
  ]),
  defineIcon('machine-learning', 'Machine Learning', [
    'ml',
    'deep learning',
    'neural networks',
    'machine intelligence',
  ]),
  defineIcon('cyber-security', 'Cyber Security', [
    'cybersecurity',
    'information security',
    'infosec',
    'network security',
    'ethical hacking',
    'computer security',
  ]),
  defineIcon('data-science', 'Data Science', [
    'data analytics',
    'big data',
    'data mining',
    'data analysis',
  ]),
  defineIcon('mechanical-engineering', 'Mechanical Engineering', [
    'mechanical',
    'mech',
    'me',
    'mechanical engg',
    'thermodynamics',
    'machine design',
  ]),
  defineIcon('electrical-engineering', 'Electrical Engineering', [
    'electrical',
    'ee',
    'electrical engg',
    'power systems',
    'electrical machines',
  ]),
  defineIcon('electronics-communication', 'Electronics & Communication', [
    'ece',
    'electronics and communication',
    'electronics communication engineering',
    'communication engineering',
    'digital electronics',
  ]),
  defineIcon('civil-engineering', 'Civil Engineering', [
    'civil',
    'civil engg',
    'structural engineering',
    'surveying',
    'construction engineering',
  ]),
  defineIcon('architecture', 'Architecture', [
    'architectural design',
    'building design',
    'architecture planning',
  ]),
  defineIcon('robotics', 'Robotics', [
    'robotics engineering',
    'industrial robotics',
    'robot programming',
  ]),
  defineIcon('mechatronics', 'Mechatronics', [
    'mechatronics engineering',
    'automation engineering',
    'industrial automation',
  ]),
  defineIcon('automobile-engineering', 'Automobile Engineering', [
    'automobile',
    'automotive engineering',
    'auto engineering',
    'vehicle engineering',
  ]),
  defineIcon('botany', 'Botany', [
    'plant biology',
    'plant science',
    'plant sciences',
  ]),
  defineIcon('zoology', 'Zoology', [
    'animal biology',
    'animal science',
    'animal sciences',
  ]),
  defineIcon('biotechnology', 'Biotechnology', [
    'biotech',
    'bio technology',
    'genetic engineering',
  ]),
  defineIcon('microbiology', 'Microbiology', [
    'microbio',
    'bacteriology',
    'microbial science',
  ]),
  defineIcon('biochemistry', 'Biochemistry', [
    'bio chemistry',
    'biochemical science',
    'biomolecules',
  ]),
  defineIcon('anatomy', 'Anatomy', [
    'human anatomy',
    'clinical anatomy',
    'anatomical science',
  ]),
  defineIcon('physiology', 'Physiology', [
    'human physiology',
    'medical physiology',
  ]),
  defineIcon('nursing', 'Nursing', [
    'nursing foundation',
    'community nursing',
    'medical surgical nursing',
  ]),
  defineIcon('pharmacology', 'Pharmacology', [
    'pharma',
    'pharmacy',
    'drug science',
    'pharmaceutical science',
  ]),
  defineIcon('pathology', 'Pathology', [
    'clinical pathology',
    'histopathology',
    'disease pathology',
  ]),
  defineIcon('medical-laboratory-technology', 'Medical Laboratory Technology', [
    'mlt',
    'dmlt',
    'medical lab technology',
    'laboratory technology',
    'lab technician',
    'clinical laboratory',
  ]),
  defineIcon('agriculture', 'Agriculture', [
    'agri',
    'agricultural science',
    'agronomy',
    'crop science',
  ]),
  defineIcon('horticulture', 'Horticulture', [
    'garden science',
    'fruit science',
    'vegetable science',
    'floriculture',
  ]),
  defineIcon('food-technology', 'Food Technology', [
    'food tech',
    'food processing',
    'food science',
    'dairy technology',
  ]),
  defineIcon('nutrition-dietetics', 'Nutrition & Dietetics', [
    'nutrition',
    'dietetics',
    'diet science',
    'food and nutrition',
    'clinical nutrition',
  ]),
  defineIcon('home-science', 'Home Science', [
    'home economics',
    'family resource management',
    'home management',
  ]),
  defineIcon('forestry', 'Forestry', [
    'forest science',
    'forest management',
    'silviculture',
  ]),
  defineIcon('soil-science', 'Soil Science', [
    'soil studies',
    'soil management',
    'pedology',
  ]),
  defineIcon('fisheries', 'Fisheries', [
    'fishery science',
    'aquaculture',
    'marine fisheries',
  ]),
  defineIcon('veterinary-science', 'Veterinary Science', [
    'veterinary',
    'vet science',
    'veterinary medicine',
    'animal health',
  ]),
  defineIcon('environmental-management', 'Environmental Management', [
    'environment management',
    'sustainability management',
    'natural resource management',
  ]),
  defineIcon('geology', 'Geology', [
    'earth science',
    'geoscience',
    'geological science',
    'mineralogy',
  ]),
  defineIcon('journalism', 'Journalism', [
    'news reporting',
    'reporting',
    'print journalism',
    'digital journalism',
  ]),
  defineIcon('mass-communication', 'Mass Communication', [
    'mass comm',
    'media studies',
    'media communication',
    'broadcast communication',
  ]),
  defineIcon('fine-arts', 'Fine Arts', [
    'visual arts',
    'painting',
    'drawing',
    'art studies',
  ]),
  defineIcon('graphic-design', 'Graphic Design', [
    'visual communication',
    'communication design',
    'ui design',
    'digital design',
  ]),
  defineIcon('fashion-design', 'Fashion Design', [
    'fashion designing',
    'apparel design',
    'textile design',
    'fashion technology',
  ]),
  defineIcon('interior-design', 'Interior Design', [
    'interior designing',
    'space design',
    'interior decoration',
  ]),
  defineIcon('animation', 'Animation', [
    'vfx',
    'visual effects',
    '3d animation',
    '2d animation',
    'multimedia animation',
  ]),
  defineIcon('film-studies', 'Film Studies', [
    'cinema studies',
    'film making',
    'filmmaking',
    'film production',
    'cinematography',
  ]),
  defineIcon('music', 'Music', [
    'vocal music',
    'instrumental music',
    'music studies',
    'music theory',
  ]),
  defineIcon('dance', 'Dance', [
    'classical dance',
    'performing dance',
    'dance studies',
    'choreography',
  ]),
  defineIcon('theatre', 'Theatre', [
    'theater',
    'drama',
    'theatre arts',
    'performing arts',
    'dramatic arts',
  ]),
  defineIcon('library-science', 'Library Science', [
    'library and information science',
    'lis',
    'blis',
    'b lib',
    'information science',
  ]),
  defineIcon('archaeology', 'Archaeology', [
    'archeology',
    'ancient studies',
    'heritage studies',
  ]),
  defineIcon('anthropology', 'Anthropology', [
    'social anthropology',
    'cultural anthropology',
    'human evolution',
  ]),
  defineIcon('linguistics', 'Linguistics', [
    'language science',
    'applied linguistics',
    'language studies',
  ]),
  defineIcon('education', 'Education', [
    'b ed',
    'bed',
    'teaching',
    'pedagogy',
    'teacher education',
  ]),
  defineIcon('social-work', 'Social Work', [
    'msw',
    'community work',
    'social service',
    'community development',
  ]),
  defineIcon('rural-development', 'Rural Development', [
    'rural studies',
    'village development',
    'rural management',
  ]),
  defineIcon('urdu', 'Urdu', [
    'urdu literature',
    'urdu language',
  ]),
  defineIcon('french', 'French', [
    'french language',
    'french studies',
  ]),
  defineIcon('german', 'German', [
    'german language',
    'german studies',
  ]),
  defineIcon('event-management', 'Event Management', [
    'events',
    'event planning',
    'event production',
    'wedding planning',
  ]),
];

const iconById = new Map(
  SUBJECT_ICONS.map((definition) => [definition.id, definition]),
);

export const GENERIC_SUBJECT_ICON: SubjectIconDefinition =
  iconById.get('generic-subject')!;

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
  if (!normalizedQuery || definition.id === 'generic-subject') return 0;

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

    const paddedQuery = ` ${normalizedQuery} `;
    const exactPhraseInside = paddedQuery.includes(` ${phrase} `);
    if (exactPhraseInside && phrase.length >= 2) {
      best = Math.max(best, 80_000 + phrase.length * 10);
    }

    if (normalizedQuery.length >= 3 && phrase.startsWith(normalizedQuery)) {
      best = Math.max(best, 60_000 + normalizedQuery.length * 10);
    }

    if (
      normalizedQuery.length >= 4 &&
      phrase.includes(normalizedQuery)
    ) {
      best = Math.max(best, 50_000 + normalizedQuery.length * 10);
    }

    const queryTokens = normalizedQuery.split(' ');
    const phraseTokens = new Set(phrase.split(' '));
    const matchedTokens = queryTokens.filter(
      (token) => token.length >= 2 && phraseTokens.has(token),
    );
    if (matchedTokens.length === queryTokens.length && matchedTokens.length > 0) {
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

export function getSubjectIcon(
  iconId?: string | null,
): SubjectIconDefinition {
  if (!iconId) return GENERIC_SUBJECT_ICON;
  return iconById.get(iconId as SubjectIconId) ?? GENERIC_SUBJECT_ICON;
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
