#!/bin/bash

echo "🔍 Supabase Database Check Script"
echo "================================"
echo ""
echo "This script helps you check the database state using Supabase CLI"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo "Please install it first: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if user is logged in
echo "🔐 Checking Supabase CLI authentication..."
supabase projects list
echo ""

echo "📊 Checking database tables..."
echo "Please replace 'your-project-ref' with your actual Supabase project reference"
echo ""
echo "Your project reference is likely in this format: galpmbhkatffdfelprab"
echo "You can find it in your Supabase dashboard URL"
echo ""

# Get project reference (user needs to provide this)
read -p "Enter your Supabase project reference: " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project reference is required"
    exit 1
fi

echo ""
echo "🔍 Checking tables for project: $PROJECT_REF"
echo ""

# Check tables using Supabase CLI
echo "Running: supabase db dump --data-only --schema=public --table=information_schema.tables"
supabase db dump --data-only --schema=public --table=information_schema.tables --db-url="postgresql://postgres:$PROJECT_REF@db.$PROJECT_REF.supabase.co:5432/postgres" 2>/dev/null || echo "Could not connect directly, trying alternative method..."

echo ""
echo "🎯 Alternative: Check specific tables directly:"
echo ""

# Check specific tables
echo "Checking if 'jewelry_requests' table exists:"
supabase db shell --db-url="postgresql://postgres:$PROJECT_REF@db.$PROJECT_REF.supabase.co:5432/postgres" -c "\d jewelry_requests" 2>/dev/null || echo "❌ jewelry_requests table not found"

echo ""
echo "Checking if 'loan_requests' table exists:"
supabase db shell --db-url="postgresql://postgres:$PROJECT_REF@db.$PROJECT_REF.supabase.co:5432/postgres" -c "\d loan_requests" 2>/dev/null || echo "❌ loan_requests table not found"

echo ""
echo "Checking 'users' table:"
supabase db shell --db-url="postgresql://postgres:$PROJECT_REF@db.$PROJECT_REF.supabase.co:5432/postgres" -c "\d users" 2>/dev/null || echo "❌ users table not found"

echo ""
echo "Checking 'prizes' table:"
supabase db shell --db-url="postgresql://postgres:$PROJECT_REF@db.$PROJECT_REF.supabase.co:5432/postgres" -c "\d prizes" 2>/dev/null || echo "❌ prizes table not found"

echo ""
echo "🔍 Checking user spin counts:"
supabase db shell --db-url="postgresql://postgres:$PROJECT_REF@db.$PROJECT_REF.supabase.co:5432/postgres" -c "SELECT email, spins_remaining, total_spins_used FROM users WHERE email IN ('jafir94@gmail.com', 'jafircq@gmail.com');" 2>/dev/null || echo "Could not query user data"

echo ""
echo "✅ Database check complete!"