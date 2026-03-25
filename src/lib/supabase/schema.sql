-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'canceled', 'past_due');
CREATE TYPE subscription_plan AS ENUM ('monthly', 'yearly');
CREATE TYPE draw_status AS ENUM ('pending', 'completed', 'published');
CREATE TYPE draw_type AS ENUM ('random', 'algorithmic');
CREATE TYPE match_type AS ENUM ('five_match', 'four_match', 'three_match');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payout_status AS ENUM ('pending', 'paid');
CREATE TYPE donation_type AS ENUM ('subscription', 'independent');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    charity_id UUID,
    charity_percentage DECIMAL(5,2) DEFAULT 10.00 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Charities table
CREATE TABLE public.charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    website TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    events JSONB DEFAULT '[]',
    total_donations DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for charity_id
ALTER TABLE public.users ADD CONSTRAINT users_charity_id_fkey 
    FOREIGN KEY (charity_id) REFERENCES public.charities(id) ON DELETE SET NULL;

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_type subscription_plan NOT NULL,
    status subscription_status DEFAULT 'inactive',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores table
CREATE TABLE public.scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    played_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Draws table
CREATE TABLE public.draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_date DATE NOT NULL,
    winning_numbers INTEGER[] DEFAULT '{}',
    draw_type draw_type DEFAULT 'random',
    status draw_status DEFAULT 'pending',
    jackpot_amount DECIMAL(12,2) DEFAULT 0,
    total_pool_amount DECIMAL(12,2) DEFAULT 0,
    five_match_pool DECIMAL(12,2) DEFAULT 0,
    four_match_pool DECIMAL(12,2) DEFAULT 0,
    three_match_pool DECIMAL(12,2) DEFAULT 0,
    rollover_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Winners table
CREATE TABLE public.winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    match_type match_type NOT NULL,
    matched_numbers INTEGER[] DEFAULT '{}',
    prize_amount DECIMAL(12,2) NOT NULL,
    proof_url TEXT,
    verification_status verification_status DEFAULT 'pending',
    payout_status payout_status DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ
);

-- Donations table
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    donation_type donation_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prize Pool table
CREATE TABLE public.prize_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month DATE NOT NULL UNIQUE,
    total_amount DECIMAL(12,2) DEFAULT 0,
    five_match_pool DECIMAL(12,2) DEFAULT 0,
    four_match_pool DECIMAL(12,2) DEFAULT 0,
    three_match_pool DECIMAL(12,2) DEFAULT 0,
    rollover_amount DECIMAL(12,2) DEFAULT 0,
    subscriber_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_charity_id ON public.users(charity_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_scores_user_id ON public.scores(user_id);
CREATE INDEX idx_scores_played_date ON public.scores(played_date);
CREATE INDEX idx_draws_status ON public.draws(status);
CREATE INDEX idx_draws_draw_date ON public.draws(draw_date);
CREATE INDEX idx_winners_draw_id ON public.winners(draw_id);
CREATE INDEX idx_winners_user_id ON public.winners(user_id);
CREATE INDEX idx_winners_verification_status ON public.winners(verification_status);
CREATE INDEX idx_donations_user_id ON public.donations(user_id);
CREATE INDEX idx_donations_charity_id ON public.donations(charity_id);
CREATE INDEX idx_charities_is_featured ON public.charities(is_featured);
CREATE INDEX idx_charities_is_active ON public.charities(is_active);

-- Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pools ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Charities policies (public read, admin write)
CREATE POLICY "Anyone can view active charities" ON public.charities
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage charities" ON public.charities
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Scores policies
CREATE POLICY "Users can view their own scores" ON public.scores
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scores" ON public.scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scores" ON public.scores
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scores" ON public.scores
    FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all scores" ON public.scores
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Draws policies (public read for published, admin write)
CREATE POLICY "Anyone can view published draws" ON public.draws
    FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage draws" ON public.draws
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Winners policies
CREATE POLICY "Users can view their own winnings" ON public.winners
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own winner proof" ON public.winners
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all winners" ON public.winners
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Donations policies
CREATE POLICY "Users can view their own donations" ON public.donations
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all donations" ON public.donations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Prize pools policies (public read)
CREATE POLICY "Anyone can view prize pools" ON public.prize_pools
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage prize pools" ON public.prize_pools
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Functions and Triggers

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to maintain only 5 scores per user
CREATE OR REPLACE FUNCTION public.maintain_score_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete oldest scores if user has more than 5
    DELETE FROM public.scores
    WHERE id IN (
        SELECT id FROM public.scores
        WHERE user_id = NEW.user_id
        ORDER BY played_date DESC, created_at DESC
        OFFSET 5
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain score limit
CREATE OR REPLACE TRIGGER maintain_score_limit_trigger
    AFTER INSERT ON public.scores
    FOR EACH ROW EXECUTE FUNCTION public.maintain_score_limit();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_charities_updated_at
    BEFORE UPDATE ON public.charities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_prize_pools_updated_at
    BEFORE UPDATE ON public.prize_pools
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed data for charities
INSERT INTO public.charities (name, description, image_url, is_featured, is_active, events) VALUES
(
    'Golf for Good Foundation',
    'Dedicated to using the power of golf to transform lives. We provide golf scholarships, adaptive golf programs, and community development initiatives across the country.',
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
    true,
    true,
    '[{"title": "Annual Charity Golf Day", "description": "Join us for our flagship fundraising event", "date": "2024-06-15", "location": "Royal Golf Club"}]'
),
(
    'Youth First Initiative',
    'Empowering underprivileged youth through sports, education, and mentorship programs. Every child deserves a chance to succeed.',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    true,
    true,
    '[{"title": "Youth Golf Camp", "description": "Free golf instruction for kids aged 8-16", "date": "2024-07-20", "location": "Community Golf Center"}]'
),
(
    'Green Fairways Environmental Trust',
    'Protecting and preserving natural landscapes while promoting sustainable golf course management practices worldwide.',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    false,
    true,
    '[]'
),
(
    'Veterans on the Green',
    'Supporting military veterans through therapeutic golf programs, community building, and career transition assistance.',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    true,
    true,
    '[{"title": "Veterans Golf Tournament", "description": "Annual tournament honoring our heroes", "date": "2024-11-11", "location": "Freedom Golf Course"}]'
),
(
    'Swing for Hope Cancer Foundation',
    'Funding cancer research and supporting families affected by cancer through the golf community.',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800',
    false,
    true,
    '[]'
);
