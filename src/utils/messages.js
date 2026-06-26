const config = require('../config');

const messages = {
    // English/Creole/French combined welcomes
    welcome: (name) =>
        `👋 <b>Byenveni nan Borlette Ajan Digital!</b>\n` +
        `👋 Bienvenue dans le système Borlette Digital !\n` +
        `👋 Welcome to the Digital Borlette System!\n\n` +
        `🎟️ <i>Chwazi jwèt ou epi mete paryaj ou fasilman pa Natcash.</i>\n` +
        `🎟️ <i>Misez sur Bolet, Maryaj, Lotto 3 et payez via Natcash.</i>\n\n` +
        `📋 <b>Kòmand / Commands:</b>\n` +
        `👉 <b>/play</b> — 🎟️ Achte Tikè Borlette / Buy Ticket\n` +
        `👉 <b>/menu</b> — 👤 Bilan & Tikè mwen yo / My Account & Tickets\n` +
        `👉 <b>/support</b> — 🆘 Sipò kliyan / Customer Support\n` +
        `👉 <b>/myid</b> — 🆔 Lè kòd ID Telegram ou / Get Telegram ID\n\n` +
        `👉 <b>Agent Commands:</b>\n` +
        `📊 <b>/bilan</b> — Dashboard Marchann\n` +
        `💰 <b>/komisyon</b> — Hoa hồng / Commission\n` +
        `💵 <b>/cash</b> — Trả thưởng / Cash redemption`,

    accountInfo: (user, ticketsCount = 0) =>
        `👤 <b>Enfòmasyon sou Kont ou (Account Info)</b>\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🆔 ID Telegram: <code>${user.telegram_id || user.id}</code>\n` +
        `👤 Non / Name: ${user.first_name || user.full_name}\n` +
        `🎟️ Tikè ou yo / My Tickets: <b>${ticketsCount}</b>\n` +
        `📅 Join: ${new Date().toLocaleDateString()}`,

    supportInfo:
        `🆘 <b>SIPÒ KLIYAN / SUPPORT</b>\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `Pou nenpòt pwoblèm, kontakte nou:\n` +
        `Pour toute assistance, contactez :\n` +
        `For support, contact:\n` +
        `👉 <b>${config.SUPPORT_CONTACT}</b>\n\n` +
        `⏰ Sèvis 24h/24, 7j/7`,
};

module.exports = messages;
