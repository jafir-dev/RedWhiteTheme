-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    spins_remaining INTEGER DEFAULT 2,
    total_spins_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Prizes table
CREATE TABLE IF NOT EXISTS public.prizes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    gold_grams DECIMAL(10, 3) DEFAULT 0,
    silver_grams DECIMAL(10, 3) DEFAULT 0,
    value DECIMAL(10, 2) DEFAULT 0,
    probability DECIMAL(5, 4) DEFAULT 0.0001,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for prizes
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;

-- Everyone can view active prizes
CREATE POLICY "Anyone can view active prizes" ON public.prizes
    FOR SELECT USING (is_active = TRUE);

-- Only admins can manage prizes
CREATE POLICY "Admins can manage prizes" ON public.prizes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    prize_id INTEGER REFERENCES public.prizes(id) ON DELETE SET NULL,
    value DECIMAL(10, 2) NOT NULL,
    gold_grams DECIMAL(10, 3) DEFAULT 0,
    silver_grams DECIMAL(10, 3) DEFAULT 0,
    is_redeemed BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Users can view their own coupons
CREATE POLICY "Users can view own coupons" ON public.coupons
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all coupons
CREATE POLICY "Admins can view all coupons" ON public.coupons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    making_charge DECIMAL(10, 2) DEFAULT 0,
    gst_rate DECIMAL(5, 4) DEFAULT 0.03,
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (
        base_price + making_charge + (base_price * gst_rate)
    ) STORED,
    weight DECIMAL(10, 3),
    purity TEXT DEFAULT '22K',
    stock_quantity INTEGER DEFAULT 1,
    is_in_stock BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    category TEXT DEFAULT 'gold',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can view in-stock products
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (is_in_stock = TRUE);

-- Only admins can manage products
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id) ON DELETE SET NULL,
    coupon_id INTEGER REFERENCES public.coupons(id) ON DELETE SET NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_price DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT,
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Users can create their own orders
CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wheel spins table
CREATE TABLE IF NOT EXISTS public.wheel_spins (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    prize_id INTEGER REFERENCES public.prizes(id) ON DELETE SET NULL,
    coupon_id INTEGER REFERENCES public.coupons(id) ON DELETE SET NULL,
    spin_result TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for wheel spins
ALTER TABLE public.wheel_spins ENABLE ROW LEVEL SECURITY;

-- Users can view their own spins
CREATE POLICY "Users can view own spins" ON public.wheel_spins
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all spins
CREATE POLICY "Admins can view all spins" ON public.wheel_spins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Loan requests table
CREATE TABLE IF NOT EXISTS public.loan_requests (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    gold_weight DECIMAL(10, 3) NOT NULL,
    gold_purity TEXT DEFAULT '22K',
    requested_amount DECIMAL(10, 2) NOT NULL,
    purpose TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for loan requests
ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own loan requests
CREATE POLICY "Users can view own loan requests" ON public.loan_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all loan requests
CREATE POLICY "Admins can view all loan requests" ON public.loan_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Users can create their own loan requests
CREATE POLICY "Users can create own loan requests" ON public.loan_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wheel configuration table
CREATE TABLE IF NOT EXISTS public.wheel_config (
    id SERIAL PRIMARY KEY,
    entry_price DECIMAL(10, 2) DEFAULT 10,
    spins_per_entry INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for wheel config
ALTER TABLE public.wheel_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage wheel config
CREATE POLICY "Admins can manage wheel config" ON public.wheel_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Everyone can view wheel config
CREATE POLICY "Anyone can view wheel config" ON public.wheel_config
    FOR SELECT USING (true);

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to handle new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default wheel configuration
INSERT INTO public.wheel_config (entry_price, spins_per_entry, is_active)
VALUES (10, 2, true)
ON CONFLICT DO NOTHING;

-- Insert some default prizes
INSERT INTO public.prizes (name, description, gold_grams, silver_grams, value, probability, is_active) VALUES
('1 Gram Gold Coin', 'Pure 24K gold coin', 1.000, 0, 6000, 0.0100, true),
('1 Gram Silver Coin', 'Pure 999 silver coin', 0, 1.000, 100, 0.0500, true),
('Gold + Silver Combo', '0.5g gold + 2g silver', 0.500, 2.000, 3500, 0.0050, true),
('Rs 500 Discount', 'Coupon for Rs 500 off', 0, 0, 500, 0.1500, true),
('Rs 1000 Discount', 'Coupon for Rs 1000 off', 0, 0, 1000, 0.0800, true),
('Try Again', 'Better luck next time!', 0, 0, 0, 0.7050, true)
ON CONFLICT DO NOTHING;