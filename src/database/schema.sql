-- ============================================================
-- HAITI BORLETTE AGENT SYSTEM — Database Schema
-- Supabase PostgreSQL | Version 1.0
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- AGENTS TABLE (Marchann + Super Agent)
-- ============================================================
CREATE TABLE IF NOT EXISTS agents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id     BIGINT UNIQUE NOT NULL,
    natcash_phone   VARCHAR(20) UNIQUE,
    full_name       VARCHAR(100),
    parent_sa_id    UUID REFERENCES agents(id) ON DELETE SET NULL,
    tier            VARCHAR(20) DEFAULT 'DEBUTAN'
                    CHECK (tier IN ('DEBUTAN','MACHANN','GRAN_MET','CHANPYON','SUPER_AGENT')),
    is_super_agent  BOOLEAN DEFAULT FALSE,
    monthly_volume  BIGINT DEFAULT 0,
    lifetime_volume BIGINT DEFAULT 0,
    location_region VARCHAR(50),
    referral_code   VARCHAR(20) UNIQUE,
    is_active       BOOLEAN DEFAULT TRUE,
    activated_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_telegram_id ON agents(telegram_id);
CREATE INDEX IF NOT EXISTS idx_agents_parent_sa ON agents(parent_sa_id);
CREATE INDEX IF NOT EXISTS idx_agents_referral_code ON agents(referral_code);

-- ============================================================
-- USER_AGENT_ATTRIBUTION (Lifetime — 1 User → 1 Agent)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_agent_attribution (
    user_id         BIGINT PRIMARY KEY,  -- Telegram user_id
    agent_id        UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    attributed_at   TIMESTAMPTZ DEFAULT NOW(),
    source          VARCHAR(20) DEFAULT 'QR_SCAN'
                    CHECK (source IN ('QR_SCAN','WHATSAPP_LINK','DIRECT','DIASPORA')),
    last_active     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attribution_agent ON user_agent_attribution(agent_id);

-- ============================================================
-- DRAWS (Lịch quay số — 18h và 21h hàng ngày)
-- ============================================================
CREATE TABLE IF NOT EXISTS draws (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_date       DATE NOT NULL,
    draw_time       TIME NOT NULL,
    game_type       VARCHAR(20) DEFAULT 'BOLET_2'
                    CHECK (game_type IN ('BOLET_2','MARYAJ','LOTTO3')),
    status          VARCHAR(20) DEFAULT 'SCHEDULED'
                    CHECK (status IN ('SCHEDULED','OPEN','CLOSED','COMPLETED')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_draws_date ON draws(draw_date, draw_time);

-- ============================================================
-- DRAW_RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS draw_results (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id         UUID NOT NULL REFERENCES draws(id),
    winning_numbers VARCHAR(20) NOT NULL,
    published_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TICKETS (Vé số)
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         BIGINT NOT NULL,
    agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL,
    draw_id         UUID REFERENCES draws(id) ON DELETE CASCADE,
    game_type       VARCHAR(20) NOT NULL,
    numbers         VARCHAR(20) NOT NULL,
    amount_htg      BIGINT NOT NULL,
    payment_ref     VARCHAR(50),
    status          VARCHAR(20) DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','PAID','CANCELLED')),
    is_winner       BOOLEAN DEFAULT FALSE,
    prize_amount    BIGINT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    paid_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_draw ON tickets(draw_id);
CREATE INDEX IF NOT EXISTS idx_tickets_agent ON tickets(agent_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- ============================================================
-- COMMISSIONS (Ledger hoa hồng MLM)
-- ============================================================
CREATE TABLE IF NOT EXISTS commissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id       UUID REFERENCES tickets(id) ON DELETE CASCADE,
    agent_id        UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tier_level      SMALLINT NOT NULL CHECK (tier_level IN (1,2,3)),
    amount_htg      DECIMAL(12,2) NOT NULL,
    rate_pct        DECIMAL(5,3) NOT NULL,
    status          VARCHAR(20) DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','PAID','HELD','CANCELLED')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    released_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_commissions_agent ON commissions(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_commissions_ticket ON commissions(ticket_id);

-- ============================================================
-- COMMISSION_PAYOUTS (Lịch sử rút hoa hồng)
-- ============================================================
CREATE TABLE IF NOT EXISTS commission_payouts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id        UUID NOT NULL REFERENCES agents(id),
    period_start    DATE,
    period_end      DATE,
    total_amount    DECIMAL(12,2) NOT NULL,
    natcash_txn_id  VARCHAR(100),
    status          VARCHAR(20) DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payouts_agent ON commission_payouts(agent_id);

-- ============================================================
-- WIN_CODES (Mã thắng HMAC-signed, TTL 48h)
-- ============================================================
CREATE TABLE IF NOT EXISTS win_codes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(10) UNIQUE NOT NULL,
    ticket_id       UUID NOT NULL REFERENCES tickets(id),
    winner_user_id  BIGINT NOT NULL,
    amount_htg      BIGINT NOT NULL,
    hmac_signature  VARCHAR(64) NOT NULL,
    is_redeemed     BOOLEAN DEFAULT FALSE,
    redeemed_by_agent UUID REFERENCES agents(id),
    redeemed_at     TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_win_codes_code ON win_codes(code);
CREATE INDEX IF NOT EXISTS idx_win_codes_winner ON win_codes(winner_user_id);

-- ============================================================
-- STREAKS (Theo dõi mua liên tiếp của End User)
-- ============================================================
CREATE TABLE IF NOT EXISTS streaks (
    user_id         BIGINT PRIMARY KEY,
    current_streak  INTEGER DEFAULT 0,
    longest_streak  INTEGER DEFAULT 0,
    last_purchase   DATE,
    streak_bonus_claimed DATE,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCRATCH_BONUSES (Gamification — Scratch card results)
-- ============================================================
CREATE TABLE IF NOT EXISTS scratch_bonuses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         BIGINT NOT NULL,
    ticket_id       UUID REFERENCES tickets(id),
    result_type     VARCHAR(20) NOT NULL
                    CHECK (result_type IN ('NO_WIN','BONUS_50','BONUS_200','BONUS_500')),
    bonus_amount    INTEGER DEFAULT 0,
    claimed_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scratch_user ON scratch_bonuses(user_id);

-- ============================================================
-- MONTHLY VOLUME RESET — Function to reset monthly volume
-- ============================================================
CREATE OR REPLACE FUNCTION reset_monthly_volumes()
RETURNS void AS $$
BEGIN
    UPDATE agents SET monthly_volume = 0, updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- AUTO UPDATE AGENT TIER — Trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_agent_tier()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.monthly_volume >= 200000 THEN
        NEW.tier := 'CHANPYON';
    ELSIF NEW.monthly_volume >= 50000 THEN
        NEW.tier := 'GRAN_MET';
    ELSIF NEW.monthly_volume >= 10000 THEN
        NEW.tier := 'MACHANN';
    ELSE
        NEW.tier := 'DEBUTAN';
    END IF;
    -- Don't downgrade SUPER_AGENT
    IF OLD.is_super_agent = TRUE THEN
        NEW.tier := 'SUPER_AGENT';
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_agent_tier ON agents;
CREATE TRIGGER trg_update_agent_tier
    BEFORE UPDATE OF monthly_volume ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_tier();

COMMENT ON TABLE agents IS 'Marchann Agents and Super Agents in the Haiti Borlette MLM network';
COMMENT ON TABLE user_agent_attribution IS 'Lifetime attribution: one End User belongs to exactly one Agent forever';
COMMENT ON TABLE commissions IS 'MLM commission ledger: tier 1=SA, tier 2=MA, tier 3=Referral User';
COMMENT ON TABLE win_codes IS 'HMAC-signed 6-char codes used by winners to redeem cash at agent booths';

-- ============================================================
-- TCHALA_DICTIONARY (Sổ mơ từ điển)
-- ============================================================
CREATE TABLE IF NOT EXISTS tchala_dictionary (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(100) UNIQUE NOT NULL, -- Creole keyword
    numbers VARCHAR(10)[] NOT NULL,       -- Array of lucky numbers
    fr VARCHAR(100),                      -- French translation
    en VARCHAR(100),                      -- English translation
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tchala_keyword ON tchala_dictionary(keyword);
CREATE INDEX IF NOT EXISTS idx_tchala_fr ON tchala_dictionary(fr);
CREATE INDEX IF NOT EXISTS idx_tchala_en ON tchala_dictionary(en);

