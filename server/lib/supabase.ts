import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://galpmbhkatffdfelprab.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbHBtYmhrYXRmZmRmZWxwcmFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MjA4NywiZXhwIjoyMDc5ODI4MDg3fQ.0trS1zYKJV4qypYM-On2JvALZUXWv1bdALh1PPBM1kY'

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})