'use strict';
const db = require('../database/index');

const sessionService = {
    /**
     * Get or create a session for a user on a platform
     * @param {string|number} userId
     * @param {string} platform - 'TELEGRAM' | 'WHATSAPP'
     */
    async getSession(userId, platform) {
        try {
            const res = await db.query(
                'SELECT * FROM user_sessions WHERE user_id = $1',
                [userId]
            );
            if (res.rows.length > 0) {
                const session = res.rows[0];
                // Ensure cart is an array if returned as string (pg might parse jsonb as object/array automatically)
                if (typeof session.cart === 'string') {
                    session.cart = JSON.parse(session.cart);
                }
                return session;
            }
            
            // Return default session object
            return {
                user_id: userId,
                platform: platform,
                step: 'IDLE',
                game_type: null,
                suggested_numbers: null,
                numbers: null,
                cart: []
            };
        } catch (err) {
            console.error(`❌ Error in getSession for ${userId}:`, err.message);
            return {
                user_id: userId,
                platform: platform,
                step: 'IDLE',
                game_type: null,
                suggested_numbers: null,
                numbers: null,
                cart: []
            };
        }
    },

    /**
     * Update session data
     * @param {string|number} userId
     * @param {object} data
     * @param {string} platform
     */
    async updateSession(userId, data, platform = 'TELEGRAM') {
        try {
            // Get current session or defaults
            const current = await this.getSession(userId, platform);
            const merged = { ...current, ...data };
            
            // Format suggested_numbers if array
            let suggestedNumbersStr = merged.suggested_numbers;
            if (Array.isArray(suggestedNumbersStr)) {
                suggestedNumbersStr = suggestedNumbersStr.join(',');
            }

            // Stringify cart just in case, though pg node handles object to jsonb conversion,
            // stringifying guarantees it inserts correctly.
            const cartJson = typeof merged.cart === 'string' ? merged.cart : JSON.stringify(merged.cart);

            await db.query(
                `INSERT INTO user_sessions (user_id, platform, step, game_type, suggested_numbers, numbers, cart, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                 ON CONFLICT (user_id) DO UPDATE SET
                    platform = EXCLUDED.platform,
                    step = EXCLUDED.step,
                    game_type = EXCLUDED.game_type,
                    suggested_numbers = EXCLUDED.suggested_numbers,
                    numbers = EXCLUDED.numbers,
                    cart = EXCLUDED.cart,
                    updated_at = NOW()`,
                [
                    userId,
                    merged.platform,
                    merged.step,
                    merged.game_type,
                    suggestedNumbersStr,
                    merged.numbers,
                    cartJson
                ]
            );
            return merged;
        } catch (err) {
            console.error(`❌ Error in updateSession for ${userId}:`, err.message);
            throw err;
        }
    },

    /**
     * Reset/Clear user session back to IDLE
     * @param {string|number} userId
     */
    async clearSession(userId) {
        try {
            await db.query(
                `UPDATE user_sessions 
                 SET step = 'IDLE', game_type = NULL, suggested_numbers = NULL, numbers = NULL, cart = '[]'::jsonb, updated_at = NOW()
                 WHERE user_id = $1`,
                [userId]
            );
        } catch (err) {
            console.error(`❌ Error in clearSession for ${userId}:`, err.message);
        }
    }
};

module.exports = sessionService;
