import { Request, Response, NextFunction } from "express";
import { supabase } from "./lib/supabase";
import { storage } from "./supabaseStorage";

export function setupSupabaseAuth(app: any) {
  // Login endpoint - Supabase handles this on client side, but we provide user info
  app.post("/api/auth/user", async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      // Verify the JWT token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Get or create user in our storage with initial spins for new users
      await storage.upsertUser({
        id: user.id,
        email: user.email || "",
        firstName: user.user_metadata?.first_name || user.user_metadata?.name || "",
        lastName: user.user_metadata?.last_name || "",
        profileImageUrl: user.user_metadata?.avatar_url || null,
        isAdmin: user.email?.endsWith("@admin.com") || false,
        spinsRemaining: 2, // New users get 2 free spins
        totalSpinsUsed: 0
      });

      const storedUser = await storage.getUser(user.id);
      res.json(storedUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      if (token) {
        await supabase.auth.admin.signOut(token);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.substring(7);

      // Verify the JWT token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const storedUser = await storage.getUser(user.id);
      if (!storedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(storedUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}

// Middleware to check if user is authenticated
export const isSupabaseAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.substring(7);

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      isAdmin: user.email?.endsWith("@admin.com") || false
    };

    next();
  } catch (error: any) {
    res.status(401).json({ message: "Authentication failed" });
  }
};