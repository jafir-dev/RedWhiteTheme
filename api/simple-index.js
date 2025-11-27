// Simplified API entry point for Vercel
// This bypasses complex imports to avoid crashes

const { createClient } = require('@supabase/supabase-js');

// Direct Supabase client initialization
const supabaseUrl = 'https://galpmbhkatffdfelprab.supababase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbHBtYmhrYXRmZmRmZWxwcmFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MjA4NywiZXhwIjoyMDc5ODI4MDg3fQ.0trS1zYKJV4qypYM-On2JvALZUXWv1bdALh1PPBM1kY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Simple Express app
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/api/test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email, spins_remaining, total_spins_used')
      .limit(1);

    if (error) {
      return res.status(500).json({
        message: 'Database error',
        error: error.message
      });
    }

    res.json({
      message: 'Simple API working!',
      data: data,
      count: data?.length || 0
    });
  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

// Prizes endpoint
app.get('/api/prizes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .limit(10);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users endpoint
app.get('/api/auth/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.substring(7);

    // This is just a simple test - in production you'd validate the JWT properly
    res.json({
      message: "Simple auth working",
      token: token.substring(0, 10) + "..."
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Handle all other routes
app.all('/api/*', (req, res) => {
  res.status(200).json({
    message: 'Simple API endpoint',
    method: req.method,
    path: req.path
  });
});

module.exports = app;