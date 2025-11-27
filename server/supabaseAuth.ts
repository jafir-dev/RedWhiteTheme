import { Request, Response } from "express";
import { createClient } from '@supabase/supabase-js';
import { storage } from "./storage";

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = 'https://galpmbhkatffdfelprab.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbHBtYmhrYXRmZmRmZWxwcmFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MjA4NywiZXhwIjoyMDc5ODI4MDg3fQ.0trS1zYKJV4qypYM-On2JvALZUXWv1bdALh1PPBM1kY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to extract user from Supabase JWT
async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return null;
  }
}

export function setupSupabaseAuth(app: any) {
  // Sign up endpoint
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
          },
        },
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({
        message: "Sign up successful! Please check your email to verify your account.",
        user: data.user,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Sign in endpoint
  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ message: error.message });
      }

      // Sync user with our database
      if (data.user) {
        await storage.upsertUser({
          id: data.user.id,
          email: data.user.email!,
          firstName: data.user.user_metadata?.first_name || data.user.email!.split('@')[0],
          lastName: data.user.user_metadata?.last_name || '',
          profileImageUrl: data.user.user_metadata?.avatar_url || null,
        });

        const user = await storage.getUser(data.user.id);

        res.json({
          user,
          session: data.session,
        });
      } else {
        res.status(401).json({ message: "Sign in failed" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Sync user endpoint (called after Supabase auth)
  app.post("/api/auth/sync", async (req: Request, res: Response) => {
    try {
      const { email, id, firstName, lastName } = req.body;

      if (!email || !id) {
        return res.status(400).json({ message: "Email and ID are required" });
      }

      // Create or update user in our database
      await storage.upsertUser({
        id,
        email,
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
        profileImageUrl: null,
      });

      const user = await storage.getUser(id);

      if (!user) {
        return res.status(500).json({ message: "Failed to sync user" });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    try {
      const user = await getUserFromRequest(req);

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get user data from our database
      const userData = await storage.getUser(user.id);

      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(userData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Sign out endpoint
  app.post("/api/auth/signout", async (req: Request, res: Response) => {
    try {
      const user = await getUserFromRequest(req);

      if (user) {
        const { error } = await supabase.auth.admin.signOut(user.id);
        if (error) {
          console.error('Error signing out from Supabase:', error);
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}

// Middleware to check if user is authenticated
export const isSupabaseAuthenticated = async (req: Request, res: Response, next: any) => {
  const user = await getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Attach user info to request for use in routes
  req.user = {
    id: user.id,
    email: user.email,
    firstName: user.user_metadata?.first_name || user.email?.split('@')[0],
    lastName: user.user_metadata?.last_name || '',
  };

  next();
};