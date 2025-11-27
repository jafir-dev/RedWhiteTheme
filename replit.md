# Golden Fortune - Gold Loan & Jewelry E-Commerce Platform

## Overview
A gamified gold loan and jewelry e-commerce platform featuring a fortune wheel system where users pay Rs 10 for 2 spins to win discount coupons. The platform includes a product catalog for gold/silver jewelry, customization requests with image upload, loan applications, and a comprehensive admin dashboard.

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── admin/      # Admin dashboard components
│   │   │   ├── ui/         # Shadcn UI components
│   │   │   └── FortuneWheel.tsx  # Spin wheel component
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useAuth.ts  # Authentication hook
│   │   ├── lib/            # Utilities
│   │   │   ├── queryClient.ts
│   │   │   └── authUtils.ts
│   │   ├── pages/          # Route pages
│   │   │   ├── Landing.tsx # Public landing page
│   │   │   ├── Home.tsx    # User dashboard with wheel
│   │   │   ├── Products.tsx# Product catalog
│   │   │   ├── Checkout.tsx# Checkout flow
│   │   │   ├── Customize.tsx # Loan/customization requests
│   │   │   └── Admin.tsx   # Admin dashboard
│   │   └── App.tsx         # Main app with routing
├── server/                 # Express backend
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   ├── replitAuth.ts       # Replit OIDC authentication
│   └── db.ts               # Drizzle database connection
└── shared/
    └── schema.ts           # Database schemas & types
```

## Key Features

### Fortune Wheel System
- Users pay Rs 10 for 2 spins
- Probability-based prize selection
- Automatic coupon generation on wins
- Prizes include: Free gold, silver, combo offers, discounts

### Product Catalog
- Gold, silver, and jewelry items
- Coupon application at checkout
- Automatic price reduction (can reduce to Rs 0)

### Admin Dashboard
- Dashboard metrics overview
- Wheel configuration with probability sliders
- User management
- Order tracking
- Product CRUD operations
- Coupon analytics
- Loan request management

## Design System

### Theme
- Primary: Red (HSL: 0 84% 42%)
- Background: White/Light gray tones
- Typography: Poppins (headings), Inter (body)

### Color Variables
- `--primary`: Red accent color
- `--background`: White background
- `--card`: Light gray cards
- `--muted`: Subdued text/backgrounds

## Database Schema

### Tables
1. **users** - User accounts with spin tracking
2. **sessions** - Session storage for auth
3. **prizes** - Wheel prize configuration
4. **coupons** - Generated discount coupons
5. **products** - Gold/silver products
6. **orders** - Purchase orders
7. **wheel_spins** - Spin transaction history
8. **loan_requests** - Loan/customization requests
9. **wheel_config** - Wheel settings

## API Endpoints

### Public
- `GET /api/prizes` - Get all prizes
- `GET /api/products` - Get in-stock products
- `GET /api/wheel/config` - Get wheel configuration

### Authenticated
- `GET /api/auth/user` - Get current user
- `POST /api/wheel/spin` - Spin the wheel
- `GET /api/coupons/user` - Get user's coupons
- `POST /api/orders` - Create order
- `POST /api/loan-requests` - Submit loan/customization request

### Admin Only
- `GET /api/admin/users` - All users
- `POST/PATCH/DELETE /api/admin/prizes` - Prize management
- `POST/PATCH/DELETE /api/admin/products` - Product management
- `GET/PATCH /api/admin/orders` - Order management
- `GET /api/admin/coupons` - Coupon analytics
- `GET/PATCH /api/admin/loan-requests` - Request management

## Development Commands

```bash
npm run dev          # Start development server
npm run db:push      # Push schema to database
npm run build        # Build for production
```

## User Preferences
- Red and white color theme
- Poppins font for headings, Inter for body text
- Mobile-first responsive design
- Gamified experience with fortune wheel

## Recent Changes
- Initial project setup with complete frontend and backend
- Database schema with 9 tables
- Replit Auth integration
- Fortune wheel with probability-based prize selection
- Admin dashboard with all management features
