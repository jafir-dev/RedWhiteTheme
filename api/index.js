// This file is the entry point for Vercel serverless functions
// It exports the Express app from our server
const app = require('../../dist/index.cjs');

module.exports = app;