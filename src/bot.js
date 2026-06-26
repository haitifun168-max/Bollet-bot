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
        ctx.reply('❌ Đã xảy ra lỗi. Vui lòng thử lại sau.');
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
    { command: 'start', description: '🔄 Bắt đầu / Khởi động lại' },
    { command: 'menu', description: '👤 Thông tin tài khoản' },
    { command: 'play', description: '🎟️ Mua vé số Borlette (Play)' },
    { command: 'tchala', description: '📖 Tra cứu Sổ mơ Borlette (Tchala)' },
    { command: 'nap', description: '💰 Nạp tiền Natcash' },
    { command: 'checkpay', description: '🔍 Kiểm tra thanh toán' },
    { command: 'support', description: '🆘 Hỗ trợ' },
    { command: 'myid', description: '🆔 Lấy ID của bạn' },
    { command: 'bilan', description: '📊 Bảng điều khiển Đại lý (Bilan)' },
    { command: 'komisyon', description: '💰 Quản lý hoa hồng (Komisyon)' },
    { command: 'cash', description: '💵 Rút tiền thưởng tại quầy (Cash)' },
    { command: 'kliyan', description: '👥 Khách hàng giới thiệu (Kliyan)' },
    { command: 'lyen', description: '🔗 Mã QR / Link giới thiệu (Lyen)' },
    { command: 'leaderboard', description: '🏆 Bảng xếp hạng Đại lý (Leaderboard)' },
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
