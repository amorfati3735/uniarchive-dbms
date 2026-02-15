// Backend Entry Point for Vercel
// Using require to avoid ESM/TS resolution issues with cross-directory imports
const app = require('../server/src/app').default;

export default app;
