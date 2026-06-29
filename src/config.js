require('dotenv').config();

module.exports = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    ADMIN_ID: parseInt(process.env.ADMIN_ID) || 0,
    DASHBOARD_PASSWORD: process.env.DASHBOARD_PASSWORD || 'admin123',

    // Bank config for VietQR
    BANK: {
        BIN: process.env.BANK_BIN || '970422',
        ACCOUNT: process.env.BANK_ACCOUNT || '',
        ACCOUNT_NAME: process.env.BANK_ACCOUNT_NAME || '',
        NAME: process.env.BANK_NAME || 'MB',
    },

    BANK2: process.env.BANK2_ACCOUNT ? {
        BIN: process.env.BANK2_BIN || '970436',
        ACCOUNT: process.env.BANK2_ACCOUNT,
        ACCOUNT_NAME: process.env.BANK2_ACCOUNT_NAME || '',
        NAME: process.env.BANK2_NAME || 'VCB',
    } : null,

    // Payment
    WEBHOOK_PORT: parseInt(process.env.PORT) || parseInt(process.env.WEBHOOK_PORT) || 3000,
    SEPAY_API_KEY: process.env.SEPAY_API_KEY || '',

    // Shop
    SHOP_NAME: process.env.SHOP_NAME || 'Borlette Agent',
    SUPPORT_CONTACT: process.env.SUPPORT_CONTACT || '@support',

    // === Haiti Borlette System ===

    // PostgreSQL Database (Supabase)
    DATABASE_URL: process.env.DATABASE_URL || '',

    // HMAC secret for Win-Code generation
    HMAC_SECRET: process.env.HMAC_SECRET || 'change-this-secret',

    // Natcash Mobile Money API
    NATCASH: {
        API_URL: process.env.NATCASH_API_URL || 'https://api.natcash.ht/v1',
        API_KEY: process.env.NATCASH_API_KEY || '',
        MERCHANT_ID: process.env.NATCASH_MERCHANT_ID || '',
    },

    // MLM Commission rates
    COMMISSION: {
        MARCHANN_BASE: 0.08,         // 8% base (Debutan tier)
        MARCHANN_BONUS_MACHANN: 0.01, // +1% for Machann tier
        MARCHANN_BONUS_GRAN_MET: 0.02, // +2% for Gran Met tier
        MARCHANN_BONUS_CHANPYON: 0.03, // +3% for Chanpyon tier
        SUPER_AGENT: 0.03,            // 3% base SA
        REFERRAL_USER: 0.02,          // 2% referral (60 days)
        CASH_SERVICE_FEE: 0.005,      // 0.5% service fee for cash redemption
    },

    // Agent Tier thresholds (monthly volume in HTG)
    TIER_THRESHOLDS: {
        DEBUTAN: 0,
        MACHANN: 10000,
        GRAN_MET: 50000,
        CHANPYON: 200000,
    },

    // Win-Code TTL: 48 hours in milliseconds
    WIN_CODE_TTL_MS: 48 * 60 * 60 * 1000,
};

