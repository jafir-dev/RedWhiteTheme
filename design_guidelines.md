# Design Guidelines: Gold Loan & Jewelry Fortune Wheel Platform

## Design Approach
**Reference-Based: E-commerce + Gaming Hybrid**
- E-commerce foundation inspired by Shopify's clean product displays and Etsy's artisan aesthetic
- Gamification elements drawing from casino/lottery interfaces for excitement and engagement
- Red and white color theme throughout (as specified)

## Typography System
**Font Families:**
- Primary: Poppins (headers, CTAs, wheel interface) - modern, bold, attention-grabbing
- Secondary: Inter (body text, forms, data) - clean readability

**Hierarchy:**
- Hero/Wheel Headers: 3xl to 5xl, font-weight 700-800
- Section Headers: 2xl to 3xl, font-weight 600-700
- Product Titles: xl, font-weight 600
- Body/Descriptions: base to lg, font-weight 400
- Admin Data Tables: sm to base, font-weight 400-500

## Layout System
**Spacing Primitives:** Use Tailwind units of 4, 6, 8, 12, and 16 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-20
- Card gaps: gap-6 to gap-8
- Element margins: m-4, m-6, m-8

**Grid System:**
- Product grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Admin tables: Full-width responsive tables with horizontal scroll on mobile
- Fortune wheel: Centered single column on mobile, can have sidebar info on desktop

## Component Library

### Customer-Facing Components

**1. Hero Section with Fortune Wheel:**
- Full-width hero (80vh on desktop) featuring the fortune wheel as centerpiece
- Large heading: "Spin to Win Gold & Silver!" with subheading about ₹10 entry
- Prominent CTA button with blurred background overlay
- Wheel should be large, animated, visually dominant
- Include trust indicators: "2 Spins • Instant Coupons • Real Gold Prizes"

**2. Fortune Wheel Interface:**
- Circular wheel design with clear prize segments
- Each segment displays prize (text + small icon)
- Central spin button - large, pulsing effect to draw attention
- Prize display card appears after spin with coupon code in large text
- Remaining spins counter prominently displayed
- Payment prompt before first spin (clear ₹10 price display)

**3. Product Cards (Jewelry Catalog):**
- Image-heavy cards with hover zoom effect
- Product name, weight (grams), current gold/silver price
- "Buy Now" button
- Coupon indicator if user has applicable coupon (badge overlay)
- Clean white backgrounds with subtle shadows

**4. Customization Upload Section:**
- Large drag-and-drop image upload area
- Form fields: Type (loan/purchase), gold weight, description
- Visual confirmation of uploaded images (thumbnail preview)
- Submit button triggers admin notification

**5. Checkout Flow:**
- Two-column layout: Order summary + Payment form
- Automatic coupon application display (strike-through original price, show discount)
- Zero payment scenario clearly indicated: "Fully Covered by Coupon!"
- Trust badges near payment button

### Admin Dashboard Components

**1. Admin Navigation:**
- Sidebar navigation with icons: Dashboard, Wheel Config, Users, Orders, Prizes
- Collapsible on mobile

**2. Wheel Configuration Panel:**
- Visual wheel preview showing current probability distribution
- Slider controls for each prize with percentage display
- Total must equal 100% with live validation
- Save button with confirmation modal

**3. Prize Management:**
- Table showing all prizes: Name, Description, Value, Status (Active/Inactive)
- Add/Edit prize modal with form fields
- Toggle switches for active/inactive status

**4. User Management Table:**
- Columns: Name, Email, Signup Date, Spins Used, Coupons Generated, Total Purchases
- Search and filter functionality
- Click row to view detailed user profile

**5. Order Management:**
- Comprehensive table: Order ID, User, Product, Original Price, Coupon Applied, Final Price, Date, Status
- Filter by: Date range, coupon usage, status
- Export functionality

**6. Dashboard Metrics:**
- Large stat cards (4-column grid on desktop): Total Users, Total Spins, Revenue, Active Coupons
- Recent activity feed
- Conversion funnel visualization

## Images

**Hero Section:**
- Large hero image showing gold jewelry, coins, or fortune wheel visual
- Should convey luxury and excitement
- Image should be slightly darkened with overlay to ensure text readability

**Product Catalog:**
- High-quality jewelry product photos (gold chains, rings, coins, silver items)
- Clean white backgrounds for products
- Consistent aspect ratio (1:1 or 4:3)

**Customization Section:**
- Sample jewelry design images as placeholders
- Upload area can show preview thumbnails

## Navigation

**Customer Site:**
- Sticky header: Logo (left), Nav links (Home, Products, Customize, How It Works), User Profile/Login (right)
- Mobile: Hamburger menu
- Footer: Quick links, Contact info, Social media, Trust badges (secure payment icons)

**Admin Panel:**
- Persistent sidebar navigation
- Top bar: Search, notifications, admin profile

## Interactive Elements

**Buttons:**
- Primary CTA (Spin, Buy Now, Pay): Large, rounded, high contrast
- Secondary actions: Outlined style
- All buttons implement built-in hover/active states

**Fortune Wheel Animation:**
- Smooth rotation with easing
- Celebratory confetti effect on prize reveal
- Sound effects (optional toggle)

**Forms:**
- Clean input fields with labels above
- Validation messages below fields
- Progress indicators for multi-step flows

## Responsive Behavior

**Mobile Priority:**
- Fortune wheel optimized for touch (large spin button)
- Product cards stack single column
- Admin tables scroll horizontally with sticky first column
- Collapsible admin sidebar

**Desktop Enhancements:**
- Multi-column product grids
- Side-by-side wheel and prize history
- Expanded admin dashboard with more data visible

## Key Design Principles
1. **Excitement-Driven:** Wheel interface must feel thrilling and rewarding
2. **Trust-Building:** Clear pricing, transparent coupon mechanics, security indicators
3. **Clarity:** Zero-payment scenarios must be obvious and celebrated
4. **Efficiency:** Admin tools prioritize data density and quick actions
5. **Luxury Touch:** Jewelry context demands elegant spacing and refined typography despite red/white theme