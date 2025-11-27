import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Mock user database for demo purposes
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

// Session store (in production, use Redis or proper session store)
const sessions = new Map<string, any>();

export function setupMockAuth(app: any) {
  // Mock login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user in mock database
      const mockUser = mockUsers.find(u => u.email === email && u.password === password);

      if (!mockUser) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create or update user in storage
      await storage.upsertUser({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        profileImageUrl: null,
        isAdmin: mockUser.isAdmin
      });

      // Get user from storage
      const user = await storage.getUser(mockUser.id);
      if (!user) {
        return res.status(500).json({ message: "Failed to create user" });
      }

      // Create session
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionData = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        },
        createdAt: new Date()
      };

      sessions.set(sessionId, sessionData);

      // Set session cookie
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        sameSite: "lax"
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          spinsRemaining: user.spinsRemaining,
          totalSpinsUsed: user.totalSpinsUsed
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Mock logout endpoint
  app.post("/api/logout", (req: Request, res: Response) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId && sessions.has(sessionId)) {
      sessions.delete(sessionId);
    }

    res.clearCookie("sessionId");
    res.json({ success: true });
  });

  // Get current user endpoint
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.sessionId;

      if (!sessionId || !sessions.has(sessionId)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const session = sessions.get(sessionId);
      const user = await storage.getUser(session.user.id);

      if (!user) {
        sessions.delete(sessionId);
        return res.status(401).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}

// Middleware to check if user is authenticated
export const isMockAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies?.sessionId;

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const session = sessions.get(sessionId);

  // Check if session is expired (7 days)
  const sessionAge = Date.now() - new Date(session.createdAt).getTime();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 1 week

  if (sessionAge > maxAge) {
    sessions.delete(sessionId);
    return res.status(401).json({ message: "Session expired" });
  }

  // Attach user info to request
  req.user = session.user;
  next();
};