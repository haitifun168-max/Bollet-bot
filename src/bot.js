const { Telegraf, session } = require('telegraf');
const config = require('./config');

// Validate token
if (!config.BOT_TOKEN || config.BOT_TOKEN === 'your_bot_token_here') {
    console.error('❌ BOT_TOKEN chưa được cấu hình! Hãy cập nhật file .env');
    process.exit(1);
}

const bot = new Telegraf(config.BOT_TOKEN);

// Enable session for admin stock input
bot.use(session());

// Error handler
bot.catch((err, ctx) => {
    console.error(`❌ Error for ${ctx.updateType}:`, err.message);
    try {
        ctx.reply('❌ Yon erè rive. Tanpri eseye ankò pita. (An error occurred. Please try again later.)');
    } catch (e) {
        // ignore
    }
});

// Register commands
require('./commands/start')(bot);
require('./commands/menu')(bot);
require('./commands/play')(bot);
require('./commands/nap')(bot);
require('./commands/checkpay')(bot);
require('./commands/support')(bot);
require('./commands/myid')(bot);

// Register Agent commands
require('./commands/agent/bilan')(bot);
require('./commands/agent/komisyon')(bot);
require('./commands/agent/cash')(bot);
require('./commands/agent/kliyan')(bot);
require('./commands/agent/lyen')(bot);
require('./commands/agent/leaderboard')(bot);

// Register handlers
require('./handlers/productSelect')(bot);
require('./handlers/quantitySelect')(bot);
require('./handlers/paymentConfirm')(bot);
require('./handlers/adminActions')(bot);

// Set bot commands for menu
bot.telegram.setMyCommands([
    { command: 'start', description: '🔄 Rdemare / Restart Bot' },
    { command: 'menu', description: '👤 Enfòmasyon Kont / Account Info' },
    { command: 'play', description: '🎟️ Achte Tikè Borlette / Buy Ticket' },
    { command: 'tchala', description: '📖 Liv Rèv Tchala / Dream Book' },
    { command: 'nap', description: '💰 Depoze Natcash / Deposit Natcash' },
    { command: 'checkpay', description: '🔍 Tcheke Peye / Check Payment' },
    { command: 'support', description: '🆘 Sipò / Support' },
    { command: 'myid', description: '🆔 Telegram ID mwen / Get Telegram ID' },
    { command: 'bilan', description: '📊 Bilan Ajan / Agent Dashboard' },
    { command: 'komisyon', description: '💰 Komisyon mwen / My Commissions' },
    { command: 'cash', description: '💵 Peye Kliyan / Cash Out Winners' },
    { command: 'kliyan', description: '👥 Kliyan mwen / My Referrals' },
    { command: 'lyen', description: '🔗 Lyen Pwomosyon / Promotion Link' },
    { command: 'leaderboard', description: '🏆 Klasman Ajan / Agent Leaderboard' },
]);




// Start Webhook server instantly (independent of Telegram connection)
const { startWebhookServer } = require('./services/webhookService');
startWebhookServer(bot);

// Launch bot
bot.launch()
    .then(() => {
        console.log(`🤖 ${config.SHOP_NAME} Bot đã khởi động!`);
        console.log(`👤 Admin ID: ${config.ADMIN_ID}`);
        console.log(`🏦 Bank: ${config.BANK.NAME} - ${config.BANK.ACCOUNT}`);

        // Start Google Sheet auto-sync
        const { startAutoSync } = require('./services/sheetSync');
        try {
            startAutoSync();
        } catch (e) {
            console.log('Sheet Sync skipped:', e.message);
        }
    })
    .catch((err) => {
        console.error('❌ Không thể khởi động bot (Telegram Connection Failed):', err.message);
        console.log('🌐 Webhook server remains running for demo/mock testing.');
    });


// Prevent crash on network errors
process.on('unhandledRejection', (err) => {
    console.error('⚠️ Unhandled rejection (ignored):', err.message || err);
});
process.on('uncaughtException', (err) => {
    console.error('⚠️ Uncaught exception:', err.message || err);
    const errMsg = (err.message || '').toLowerCase();
    if (
        err.code === 'ECONNRESET' || 
        err.code === 'ETIMEDOUT' || 
        errMsg.includes('401') || 
        errMsg.includes('unauthorized') || 
        errMsg.includes('conflict') || 
        errMsg.includes('api error')
    ) {
        console.log('🔄 Telegram/Network error, bot server continues running...');
        return; // Don't crash on network or authorization errors
    }
    process.exit(1);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
