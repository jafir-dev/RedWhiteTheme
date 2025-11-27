import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://galpmbhkatffdfelprab.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbHBtYmhrYXRmZmRmZWxwcmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTIwODcsImV4cCI6MjA3OTgyODA4N30.jztU9Mo6rDBorVX4RQ6KlI5U0tfO0dlGpA04ELRnl-Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);