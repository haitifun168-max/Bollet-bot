'use strict';
const db = require('../database/index');

// Từ điển Sổ mơ Tchala phổ biến tại Haiti (Creole, French, English)
const tchalaDictionary = {
    // Động vật
    'chat': { numbers: ['02', '42'], fr: 'chat', en: 'cat' },
    'chien': { numbers: ['09', '49'], fr: 'chien', en: 'dog' },
    'chwal': { numbers: ['10', '50'], fr: 'cheval', en: 'horse' },
    'koulèv': { numbers: ['15', '55'], fr: 'serpent', en: 'snake' },
    'pwason': { numbers: ['08', '48'], fr: 'poisson', en: 'fish' },
    'kabrit': { numbers: ['11', '51'], fr: 'chèvre', en: 'goat' },

    // Hiện tượng tự nhiên / Yếu tố
    'dlo': { numbers: ['22', '62'], fr: 'eau', en: 'water' },
    'dife': { numbers: ['12', '52'], fr: 'feu', en: 'fire' },
    'lalin': { numbers: ['05', '45'], fr: 'lune', en: 'moon' },
    'solèy': { numbers: ['01', '41'], fr: 'soleil', en: 'sun' },
    'van': { numbers: ['18', '58'], fr: 'vent', en: 'wind' },

    // Sự kiện / Con người
    'maryaj': { numbers: ['07', '47'], fr: 'mariage', en: 'wedding' },
    'lanmò': { numbers: ['13', '53'], fr: 'mort', en: 'death' },
    'ti bebe': { numbers: ['03', '43'], fr: 'bébé', en: 'baby' },
    'lajan': { numbers: ['33', '73'], fr: 'argent', en: 'money' },
    'kay': { numbers: ['04', '44'], fr: 'maison', en: 'house' }
};

// Từ điển số may mắn theo Cung Hoàng Đạo (Zodiac)
const zodiacDictionary = {
    'belye': { name: 'Belye (Aries)', numbers: ['12', '48'] },
    'toro': { name: 'Toro (Taurus)', numbers: ['05', '50'] },
    'jemo': { name: 'Jemo (Gemini)', numbers: ['22', '77'] },
    'kansè': { name: 'Kansè (Cancer)', numbers: ['09', '41'] },
    'lyon': { name: 'Lyon (Leo)', numbers: ['10', '55'] },
    'vyèj': { name: 'Vyèj (Virgo)', numbers: ['03', '66'] },
    'balans': { name: 'Balans (Libra)', numbers: ['07', '33'] },
    'skopyon': { name: 'Skopyon (Scorpio)', numbers: ['13', '88'] },
    'sajitè': { name: 'Sajitè (Sagittarius)', numbers: ['15', '99'] },
    'kaprikòn': { name: 'Kaprikòn (Capricorn)', numbers: ['01', '44'] },
    'vèsò': { name: 'Vèsò (Aquarius)', numbers: ['18', '62'] },
    'pwason': { name: 'Pwason (Pisces)', numbers: ['08', '42'] }
};

/**
 * Tra cứu sổ mơ Tchala theo từ khóa
 */
async function lookupDream(keyword) {
    const cleanKey = keyword.toLowerCase().trim();
    
    try {
        const res = await db.query(
            `SELECT keyword, numbers, fr, en 
             FROM tchala_dictionary 
             WHERE LOWER(keyword) = $1 OR LOWER(fr) = $1 OR LOWER(en) = $1 
             LIMIT 1`,
            [cleanKey]
        );
        
        if (res.rows.length > 0) {
            return {
                keyword: res.rows[0].keyword,
                numbers: res.rows[0].numbers,
                fr: res.rows[0].fr,
                en: res.rows[0].en
            };
        }
    } catch (err) {
        console.error('⚠️ Error querying tchala_dictionary from DB:', err.message);
    }

    // Fallback to local dictionary
    if (tchalaDictionary[cleanKey]) {
        return { keyword: cleanKey, ...tchalaDictionary[cleanKey] };
    }

    for (const [key, val] of Object.entries(tchalaDictionary)) {
        if (val.fr === cleanKey || val.en === cleanKey) {
            return { keyword: key, ...val };
        }
    }

    return null;
}

/**
 * Lấy số may mắn theo cung hoàng đạo
 */
function getZodiacNumbers(sign) {
    const cleanSign = sign.toLowerCase().trim();
    return zodiacDictionary[cleanSign] || null;
}

module.exports = {
    lookupDream,
    getZodiacNumbers,
    zodiacDictionary
};
