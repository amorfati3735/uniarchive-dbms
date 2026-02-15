import { Resource, CourseStats, FAQItem, PinnedSubject, Comment, FooterConfig } from './types';

// Helper to generate a dummy activity grid
const generateActivityGrid = () => Array.from({ length: 364 }, () => Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0);

const MOCK_COMMENTS: Comment[] = [
  { id: 'c1', author: 'grad_student_22', text: 'The derivation on page 4 is slightly off, check the standard Kreyzig book.', timestamp: '2h ago', upvotes: 12 },
  { id: 'c2', author: 'stat_god_99', text: 'Thanks for pointing that out! Will update v2.', timestamp: '1h ago', upvotes: 5, isOp: true },
  { id: 'c3', author: 'struggling_freshman', text: 'This saved my life for the CAT2 exam. Bless you.', timestamp: '30m ago', upvotes: 24 },
];

export const FOOTER_CONFIG: FooterConfig = {
  maintainer: "UniArchives Core Team",
  email: "support@uniarchives.edu",
  githubUrl: "https://github.com/uniarchives/core",
  twitterUrl: "https://twitter.com/uniarchives",
  discordUrl: "https://discord.gg/uniarchives",
  version: "Beta v0.9.2"
};

export const MOCK_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'BMAT202L - Probability Handwritten Complete',
    courseCode: 'BMAT202L',
    slot: 'B1',
    type: 'Notes',
    topics: ['Probability', 'Bayes Theorem', 'Random Variables'],
    qualityScore: 94,
    completeness: 88,
    upvotes: 147,
    downloads: 289,
    views: 1205,
    commentsCount: 3,
    author: 'stat_god_99',
    professor: 'Prof. Sharma',
    semester: 'Winter',
    year: '2024',
    createdAt: '2024-02-15',
    description: 'Extremely detailed handwritten notes covering Module 1-3. Diagrams are high clarity.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    comments: MOCK_COMMENTS
  },
  {
    id: '2',
    title: 'Unit 4: Hypothesis Testing Cheatsheet',
    courseCode: 'BMAT202L',
    slot: 'G2',
    type: 'Cheatsheet',
    topics: ['Hypothesis Testing', 'T-Test', 'Chi-Square'],
    qualityScore: 89,
    completeness: 45,
    upvotes: 67,
    downloads: 150,
    views: 560,
    commentsCount: 8,
    author: 'cram_master',
    professor: 'Prof. Gupta',
    semester: 'Fall',
    year: '2023',
    createdAt: '2023-11-02',
    description: 'Concise formula sheet. Missing derivations but excellent for quick revision.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '3',
    title: 'Physics Wave Optics Solutions',
    courseCode: 'PHY101',
    slot: 'A1',
    type: 'Solution',
    topics: ['Interference', 'Diffraction', 'Polarization'],
    qualityScore: 76,
    completeness: 100,
    upvotes: 23,
    downloads: 45,
    views: 120,
    commentsCount: 2,
    author: 'physics_enthusiast',
    professor: 'Dr. Ray',
    semester: 'Winter',
    year: '2023',
    createdAt: '2023-09-20',
    description: 'Solved past papers for Wave Optics module. Steps are included.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '4',
    title: 'Full Semester 3 Review',
    courseCode: 'CSE3001',
    slot: 'C2',
    type: 'Notes',
    topics: ['Software Eng', 'Agile', 'UML', 'Testing'],
    qualityScore: 98,
    completeness: 95,
    upvotes: 310,
    downloads: 890,
    views: 3400,
    commentsCount: 56,
    author: 'topper_supreme',
    professor: 'Prof. Anitha',
    semester: 'Fall',
    year: '2023',
    createdAt: '2023-11-10',
    description: 'Gold standard notes. Includes previous year questions integrated into topics.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '5',
    title: 'Lab Exp 4-8 Observations',
    courseCode: 'EEE2002',
    slot: 'L4',
    type: 'Lab Report',
    topics: ['Circuits', 'Oscilloscope', 'KVL/KCL'],
    qualityScore: 65,
    completeness: 60,
    upvotes: 12,
    downloads: 30,
    views: 89,
    author: 'sparky',
    professor: 'Dr. Kumar',
    semester: 'Winter',
    year: '2024',
    createdAt: '2023-10-05',
    description: 'Raw observations for experiments 4 through 8. Verify calculations.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '6',
    title: 'Module 5 Question Bank',
    courseCode: 'BMAT202L',
    slot: 'F1',
    type: 'Question Bank',
    topics: ['ANOVA', 'Regression', 'Correlation'],
    qualityScore: 92,
    completeness: 100,
    upvotes: 56,
    downloads: 210,
    views: 890,
    commentsCount: 15,
    author: 'math_wizard',
    professor: 'Prof. Sharma',
    semester: 'Winter',
    year: '2024',
    createdAt: '2023-11-15',
    description: 'Comprehensive question set with answer keys for regression analysis.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '7',
    title: 'Operating Systems - Process Scheduling',
    courseCode: 'CSE3003',
    slot: 'D1',
    type: 'Notes',
    topics: ['Scheduling', 'Process', 'Threads', 'Deadlock'],
    qualityScore: 88,
    completeness: 70,
    upvotes: 89,
    downloads: 120,
    views: 450,
    author: 'kernel_panic',
    professor: 'Prof. Chandran',
    semester: 'Fall',
    year: '2023',
    createdAt: '2023-09-12',
    description: 'Detailed breakdown of RR, SJF, and FCFS algorithms with Gantt charts.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '8',
    title: 'Digital Logic Design - Karnaugh Maps',
    courseCode: 'ECE1002',
    slot: 'E2',
    type: 'Notes',
    topics: ['K-Map', 'Boolean Algebra', 'Logic Gates'],
    qualityScore: 95,
    completeness: 100,
    upvotes: 200,
    downloads: 450,
    views: 1500,
    author: 'logic_gate_keeper',
    professor: 'Dr. Srinivasan',
    semester: 'Winter',
    year: '2023',
    createdAt: '2023-08-30',
    description: 'Simplified guide to solving 4-variable and 5-variable K-Maps.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '9',
    title: 'Compiler Design - Parser Construction',
    courseCode: 'CSE4001',
    slot: 'A2',
    type: 'Notes',
    topics: ['Parsing', 'LL(1)', 'LR(0)', 'Syntax Analysis'],
    qualityScore: 91,
    completeness: 85,
    upvotes: 75,
    downloads: 180,
    views: 600,
    author: 'compiler_guru',
    professor: 'Prof. Meera',
    semester: 'Winter',
    year: '2024',
    createdAt: '2024-01-20',
    description: 'Step-by-step guide to constructing parsing tables. Very helpful for CAT1.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '10',
    title: 'Database Management - SQL Queries',
    courseCode: 'CSE2004',
    slot: 'C1',
    type: 'Cheatsheet',
    topics: ['SQL', 'Joins', 'Normalization', 'Indexing'],
    qualityScore: 93,
    completeness: 50,
    upvotes: 320,
    downloads: 600,
    views: 2100,
    author: 'db_admin_jr',
    professor: 'Prof. Roberts',
    semester: 'Fall',
    year: '2023',
    createdAt: '2023-10-15',
    description: 'Quick reference for complex SQL joins and nested queries.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
];

export const MOCK_COURSE_STATS: CourseStats[] = [
  {
    courseCode: 'BMAT202L',
    completeness: 82,
    qualityAvg: 88,
    totalResources: 45,
    topicCoverage: [
      { topic: 'Probability', coverage: 95 },
      { topic: 'Statistics', coverage: 80 },
      { topic: 'Lin. Algebra', coverage: 40 },
      { topic: 'Calculus', coverage: 90 },
      { topic: 'Hypothesis', coverage: 75 },
    ],
    activityGrid: generateActivityGrid()
  },
  {
    courseCode: 'CSE3001',
    completeness: 91,
    qualityAvg: 92,
    totalResources: 78,
    topicCoverage: [
      { topic: 'SDLC', coverage: 100 },
      { topic: 'Testing', coverage: 85 },
      { topic: 'Design Patterns', coverage: 70 },
      { topic: 'UML', coverage: 90 },
    ],
    activityGrid: generateActivityGrid()
  },
  {
    courseCode: 'PHY101',
    completeness: 65,
    qualityAvg: 72,
    totalResources: 22,
    topicCoverage: [
      { topic: 'Optics', coverage: 80 },
      { topic: 'Mechanics', coverage: 50 },
      { topic: 'Thermo', coverage: 30 },
    ],
    activityGrid: generateActivityGrid()
  },
  // Adding mock stats for other subjects
  {
    courseCode: 'CSE3003',
    completeness: 75,
    qualityAvg: 80,
    totalResources: 30,
    topicCoverage: [{ topic: 'OS', coverage: 70 }],
    activityGrid: generateActivityGrid()
  },
  {
    courseCode: 'ECE1002',
    completeness: 85,
    qualityAvg: 90,
    totalResources: 55,
    topicCoverage: [{ topic: 'DLD', coverage: 85 }],
    activityGrid: generateActivityGrid()
  },
  {
    courseCode: 'CSE4001',
    completeness: 60,
    qualityAvg: 85,
    totalResources: 15,
    topicCoverage: [{ topic: 'Compiler', coverage: 60 }],
    activityGrid: generateActivityGrid()
  },
  {
    courseCode: 'CSE2004',
    completeness: 90,
    qualityAvg: 88,
    totalResources: 95,
    topicCoverage: [{ topic: 'DBMS', coverage: 90 }],
    activityGrid: generateActivityGrid()
  }
];

export const AVAILABLE_TOPICS = [
  'Probability', 'Statistics', 'Calculus', 'Linear Algebra',
  'Mechanics', 'Optics', 'Thermodynamics',
  'Data Structures', 'Algorithms', 'OS', 'Networks',
  'SQL', 'Compiler', 'AI', 'Machine Learning', 'Web Dev'
];

export const FAQ_DATA: FAQItem[] = [
  {
    question: "What is UniArchives?",
    answer: "UniArchives is a decentralized, slot-based resource sharing platform designed to break down information silos between different class sections."
  },
  {
    question: "How do I gain reputation?",
    answer: "You earn reputation points when other students upvote or download your uploaded resources. Consistent quality contributions unlock badges."
  },
  {
    question: "Is this platform official?",
    answer: "No, UniArchives is a student-run initiative and is not officially affiliated with the university administration."
  },
  {
    question: "How do I verify my account?",
    answer: "Sign in using any valid email address. A verification code will be sent to your inbox."
  }
];

export const INITIAL_PINNED_SUBJECTS: PinnedSubject[] = [
  { code: 'BMAT202L', name: 'Prob & Stats', resourcesCount: 45 },
  { code: 'CSE3001', name: 'Software Eng', resourcesCount: 78 }
];
