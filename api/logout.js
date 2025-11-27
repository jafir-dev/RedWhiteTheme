// Vercel serverless function for logout endpoint

// In-memory session store (same as login.js)
// In production, this would be shared through Redis or database
const sessions = new Map();

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get session ID from cookie
    const cookies = req.headers.cookie || '';
    const sessionIdMatch = cookies.match(/sessionId=([^;]+)/);
    const sessionId = sessionIdMatch ? sessionIdMatch[1] : null;

    if (sessionId && sessions.has(sessionId)) {
      sessions.delete(sessionId);
    }

    // Clear session cookie
    const clearCookie = 'sessionId=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
    res.setHeader('Set-Cookie', clearCookie);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}