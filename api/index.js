// Vercel serverless function handler
module.exports = async function(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    res.status(200).end();
    return;
  }

  // Add CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');

  try {
    // Clear require cache to ensure fresh imports
    delete require.cache[require.resolve('../dist/index.cjs')];

    // Import the server handler
    const serverModule = require('../dist/index.cjs');
    const handler = serverModule.default || serverModule;

    if (typeof handler !== 'function') {
      throw new Error('Server handler is not a function');
    }

    // Handle the request through the Express app
    await handler(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);

    // Send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Something went wrong',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};