import { Request, Response, NextFunction } from "express";
import { supabase } from "./lib/supabase";
import { storage } from "./storage";

export function setupSupabaseAuth(app: any) {
  // Login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return res.status(401).json({ message: authError.message });
      }

      if (!authData.user) {
        return res.status(401).json({ message: "Login failed" });
      }

      // Create or update user in our database
      await storage.upsertUser({
        id: authData.user.id,
        email: authData.user.email!,
        firstName: authData.user.user_metadata?.first_name || '',
        lastName: authData.user.user_metadata?.last_name || '',
        profileImageUrl: authData.user.user_metadata?.avatar_url || null,
        isAdmin: authData.user.user_metadata?.is_admin || false
      });

      const user = await storage.getUser(authData.user.id);
      if (!user) {
        return res.status(500).json({ message: "Failed to create user" });
      }

      // Set session cookie
      res.cookie("supabase_token", authData.session?.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
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

  // Sign up endpoint
  app.post("/api/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            is_admin: false
          }
        }
      });

      if (authError) {
        return res.status(400).json({ message: authError.message });
      }

      if (!authData.user) {
        return res.status(400).json({ message: "Signup failed" });
      }

      // Create user in our database
      await storage.upsertUser({
        id: authData.user.id,
        email: authData.user.email!,
        firstName: firstName || '',
        lastName: lastName || '',
        profileImageUrl: null,
        isAdmin: false
      });

      res.json({
        message: "Account created successfully. Please check your email to verify your account.",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          firstName,
          lastName,
          isAdmin: false
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req: Request, res: Response) => {
    const token = req.cookies?.supabase_token;

    if (token) {
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: ''
      });

      await supabase.auth.signOut();
    }

    res.clearCookie("supabase_token");
    res.json({ success: true });
  });

  // Get current user endpoint
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.supabase_token;

      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

      if (error || !authUser) {
        res.clearCookie("supabase_token");
        return res.status(401).json({ message: "Invalid token" });
      }

      const user = await storage.getUser(authUser.id);

      if (!user) {
        res.clearCookie("supabase_token");
        return res.status(401).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}

// Middleware to check if user is authenticated
export const isSupabaseAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.supabase_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.user_metadata?.first_name || '',
      lastName: user.user_metadata?.last_name || '',
      isAdmin: user.user_metadata?.is_admin || false
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};