/**
 * Dogme Shop - 多语言国际化控制中心 🐾
 * 支持：中文 (zh), 英文 (en), 法语 (fr)
 */

const translations = {
    // --- 中文 ---
    'zh': {
        'top_bar': '🇨🇦 Dogme 加拿大：今日新上架多款人气零食，全境包邮送达 🐾',
        'nav_shop': '所有商品',
        'nav_promo': '优惠专区',
        'hero_title': '全球精选<br>美味零食',
        'hero_subtitle': '专为在加拿大的你准备，每一口都是惊喜。🐾',
        'btn_buy': '立即购 🛒',
        'rank_unlogged': '未登录 🐾',
        'coupon_tag': '领8折券',
        // 登录页 (user.html) 扩展内容
        'login_welcome': '欢迎回来 🐾',
        'login_subtitle': '请输入邮箱获取登录验证码',
        'email_placeholder': '您的邮箱地址',
        'code_placeholder': '6位验证码',
        'btn_get_code': '获取验证码',
        'btn_login': '开启 Dogme 之旅'
    },

    // --- 英文 ---
    'en': {
        'top_bar': '🇨🇦 Dogme Canada: New snacks added today! Free shipping nationwide 🐾',
        'nav_shop': 'Shop All',
        'nav_promo': 'Promotions',
        'hero_title': 'Tasty Snacks<br>From Global.',
        'hero_subtitle': 'Specially picked for you in Canada. Every bite is a surprise. 🐾',
        'btn_buy': 'Buy Now 🛒',
        'rank_unlogged': 'Not Logged In 🐾',
        'coupon_tag': '20% OFF',
        // Login Page
        'login_welcome': 'Welcome Back 🐾',
        'login_subtitle': 'Enter your email to receive a login code',
        'email_placeholder': 'Your email address',
        'code_placeholder': '6-digit code',
        'btn_get_code': 'Get Code',
        'btn_login': 'Start Dogme Journey'
    },

    // --- 法语 (针对加拿大魁北克等地区) ---
    'fr': {
        'top_bar': '🇨🇦 Dogme Canada: Nouveaux snacks aujourd\'hui! Livraison gratuite 🐾',
        'nav_shop': 'Boutique',
        'nav_promo': 'Promotions',
        'hero_title': 'Snacks Savoureux<br>du Monde.',
        'hero_subtitle': 'Spécialement choisi pour vous au Canada. Une surprise à chaque bouchée. 🐾',
        'btn_buy': 'Acheter 🛒',
        'rank_unlogged': 'Non connecté 🐾',
        'coupon_tag': '20% RABAIS',
        // Page de connexion
        'login_welcome': 'Bienvenue 🐾',
        'login_subtitle': 'Entrez votre courriel pour recevoir un code',
        'email_placeholder': 'Votre adresse courriel',
        'code_placeholder': 'Code à 6 chiffres',
        'btn_get_code': 'Obtenir le code',
        'btn_login': 'Commencer l\'aventure'
    }
};

/**
 * 核心切换函数
 * @param {string} lang - 语言代码 'zh', 'en', 'fr'
 */
function switchLanguage(lang) {
    // 1. 保存选择到本地存储
    localStorage.setItem('dogme_lang', lang);
    
    // 2. 更新 HTML 根元素的语言属性
    document.documentElement.lang = lang;
    
    // 3. 遍历并替换所有带有 data-t 属性的元素
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (translations[lang] && translations[lang][key]) {
            // 如果是输入框，修改 placeholder
            if (el.tagName === 'INPUT') {
                el.placeholder = translations[lang][key];
            } else {
                // 否则修改 innerHTML (支持渲染 <br> 等标签)
                el.innerHTML = translations[lang][key];
            }
        }
    });

    // 4. 特殊处理：如果页面上有同步用户数据的函数，则触发它
    if (typeof syncUserData === 'function') {
        syncUserData();
    }
}

/**
 * 页面加载完成后的初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    // 默认读取存储的语言，如果没有则根据浏览器语言判断或默认为中文
    const savedLang = localStorage.getItem('dogme_lang') || 'zh';
    switchLanguage(savedLang);
});
