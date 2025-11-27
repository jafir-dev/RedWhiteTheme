// Vercel serverless function for authentication
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

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

// Session store
const sessions = new Map();

app.use(express.json());
app.use(cookieParser());

// Mock login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in mock database
    const mockUser = mockUsers.find(u => u.email === email && u.password === password);

    if (!mockUser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax"
    });

    res.json({
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
    res.status(500).json({ message: error.message });
  }
});

// Mock logout endpoint
app.post('/api/logout', (req, res) => {
  const sessionId = req.cookies?.sessionId;
  if (sessionId && sessions.has(sessionId)) {
    sessions.delete(sessionId);
  }

  res.clearCookie("sessionId");
  res.json({ success: true });
});

// Get current user endpoint
app.get('/api/auth/user', async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = sessions.get(sessionId);

    // Check if session is expired (7 days)
    const sessionAge = Date.now() - new Date(session.createdAt).getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000;

    if (sessionAge > maxAge) {
      sessions.delete(sessionId);
      return res.status(401).json({ message: "Session expired" });
    }

    res.json({
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      isAdmin: session.user.isAdmin,
      spinsRemaining: 0,
      totalSpinsUsed: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = (req, res) => {
  app(req, res);
};