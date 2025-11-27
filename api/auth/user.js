// Vercel serverless function for auth user endpoint

// In-memory session store (same as login.js)
// In production, this would be shared through Redis or database
const sessions = new Map();

function validateSession(sessionId) {
  if (!sessionId || !sessions.has(sessionId)) {
    return null;
  }

  const session = sessions.get(sessionId);
  const sessionAge = Date.now() - new Date(session.createdAt).getTime();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 1 week

  if (sessionAge > maxAge) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get session ID from cookie
    const cookies = req.headers.cookie || '';
    const sessionIdMatch = cookies.match(/sessionId=([^;]+)/);
    const sessionId = sessionIdMatch ? sessionIdMatch[1] : null;

    if (!sessionId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = validateSession(sessionId);

    if (!session) {
      return res.status(401).json({ message: "Session expired" });
    }

    return res.status(200).json({
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      isAdmin: session.user.isAdmin,
      spinsRemaining: 0,
      totalSpinsUsed: 0
    });
  } catch (error) {
    console.error('Auth user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}