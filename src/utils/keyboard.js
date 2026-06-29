const { Markup } = require('telegraf');

/**
 * Build product list keyboard
 */
function productListKeyboard(products) {
    const buttons = products.map((p) => {
        const stock = p.display_stock || p.stock_count;
        let label = `${p.emoji} ${p.name} - ${formatPrice(p.price)}`;

        if (p.contact_only && stock === 0) {
            label += ` — 📬 Support/Contact`;
        } else {
            label += ` (Stock: ${stock})`;
        }

        if (p.promotion) {
            label += ` ${p.promotion}`;
        }

        return [Markup.button.callback(label, `product_${p.id}`)];
    });

    buttons.push([Markup.button.callback('🔄 Refresh', 'refresh_products')]);

    return Markup.inlineKeyboard(buttons);
}

/**
 * Build quantity selection keyboard
 */
function quantityKeyboard(productId, maxQty = 10) {
    const max = Math.min(maxQty, 10);
    const rows = [];
    let row = [];

    for (let i = 1; i <= max; i++) {
        row.push(Markup.button.callback(`${i}`, `qty_${productId}_${i}`));
        if (row.length === 5) {
            rows.push(row);
            row = [];
        }
    }
    if (row.length > 0) rows.push(row);

    rows.push([Markup.button.callback('❌ Cancel', 'cancel_order')]);

    return Markup.inlineKeyboard(rows);
}

/**
 * Build order confirmation keyboard
 */
function orderConfirmKeyboard(orderId) {
    return Markup.inlineKeyboard([
        [Markup.button.callback('✅ Paid', `check_paid_${orderId}`)],
        [Markup.button.callback('❌ Cancel Order', `cancel_order_${orderId}`)],
    ]);
}

/**
 * Build post-delivery keyboard
 */
function postDeliveryKeyboard() {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback('📊 Main Data', 'data_main'),
            Markup.button.callback('🔄 Buy Again', 'buy_again'),
        ],
        [Markup.button.callback('📋 Back to List', 'refresh_products')],
    ]);
}

/**
 * Format price in HTG
 */
function formatPrice(amount) {
    return new Intl.NumberFormat('en-US').format(amount) + ' HTG';
}

/**
 * Main menu keyboard (reply keyboard)
 */
function mainMenuKeyboard() {
    return Markup.keyboard([
        ['🎟️ Play Borlette', '💰 Deposit Natcash'],
        ['🔍 Check Payment', '👤 Profile'],
        ['🆘 Support'],
    ]).resize();
}

module.exports = {
    productListKeyboard,
    quantityKeyboard,
    orderConfirmKeyboard,
    postDeliveryKeyboard,
    formatPrice,
    mainMenuKeyboard,
};
