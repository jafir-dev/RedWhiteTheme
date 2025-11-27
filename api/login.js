// Vercel serverless function for login endpoint

// Mock user database
const mockUsers = [
  {
    id: "demo-user-1",
    email: "admin@gpt.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    isAdmin: true
  },
  {
    id: "demo-user-2",
    email: "user@gpt.com",
    password: "user123",
    firstName: "Demo",
    lastName: "User",
    isAdmin: false
  }
];

// Simple in-memory session store (for demo purposes)
// In production, you'd use Redis or a proper session store
const sessions = new Map();

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = await JSON.parse(req.body);

    // Find user in mock database
    const mockUser = mockUsers.find(u => u.email === email && u.password === password);

    if (!mockUser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create session
    const sessionId = generateSessionId();
    const sessionData = {
      user: {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        isAdmin: mockUser.isAdmin
      },
      createdAt: new Date()
    };

    sessions.set(sessionId, sessionData);

    // Set session cookie
    const cookieValue = `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;

    res.setHeader('Set-Cookie', cookieValue);

    return res.status(200).json({
      user: {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        isAdmin: mockUser.isAdmin,
        spinsRemaining: 0,
        totalSpinsUsed: 0
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}