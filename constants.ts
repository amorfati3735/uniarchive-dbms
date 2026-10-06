import { FAQItem, PinnedSubject, FooterConfig } from './types';

// Note: resource and course-stat data now comes from the API (see services/api.ts).
// The old MOCK_RESOURCES / MOCK_COURSE_STATS fixtures were removed so they are no
// longer shipped in the production bundle.

export const FOOTER_CONFIG: FooterConfig = {
  maintainer: "UniArchives Core Team",
  email: "support@uniarchives.edu",
  githubUrl: "https://github.com/uniarchives/core",
  twitterUrl: "https://twitter.com/uniarchives",
  discordUrl: "https://discord.gg/uniarchives",
  version: "Beta v0.9.2"
};

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
