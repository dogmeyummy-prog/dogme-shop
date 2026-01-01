/**
 * Dogme Shop - 多语言国际化控制中心 🐾
 * 整合了首页、购物页及登录页的所有文案
 */

const translations = {
    'zh': {
        'top_bar': '🇨🇦 Dogme 加拿大：今日新上架多款人气零食，全境包邮送达 🐾',
        'nav_shop': '所有商品',
        'nav_promo': '优惠专区',
        'hero_title': '全球精选<br>美味零食',
        'hero_subtitle': '专为在加拿大的你准备，每一口都是惊喜。🐾',
        'btn_buy': '立即购 🛒',
        'rank_unlogged': '未登录 🐾',
        'coupon_tag': '领8折券',
        // 购物页补充
        'shop_title': '全球货柜 🐾',
        'shop_subtitle': '精选全球零食，直邮加拿大全境。🐾',
        'btn_add_cart': '加入购物车 +',
        // 登录页
        'login_welcome': '欢迎回来 🐾',
        'login_subtitle': '请输入邮箱获取登录验证码',
        'btn_get_code': '获取验证码',
        'btn_login': '开启 Dogme 之旅'
    },
    'en': {
        'top_bar': '🇨🇦 Dogme Canada: Free shipping nationwide on all new snacks 🐾',
        'nav_shop': 'Shop All',
        'nav_promo': 'Promos',
        'hero_title': 'Tasty Snacks<br>From Global.',
        'hero_subtitle': 'Specially picked for you in Canada. 🐾',
        'btn_buy': 'Shop Now 🛒',
        'rank_unlogged': 'Guest 🐾',
        'coupon_tag': '20% OFF',
        'shop_title': 'Global Snacks 🐾',
        'shop_subtitle': 'Worldwide selection, delivered across Canada. 🐾',
        'btn_add_cart': 'ADD TO CART +',
        'login_welcome': 'Welcome Back 🐾',
        'login_subtitle': 'Enter email to receive your login code',
        'btn_get_code': 'Get Code',
        'btn_login': 'Start Journey'
    },
    'fr': {
        'top_bar': '🇨🇦 Dogme Canada: Livraison gratuite partout au pays 🐾',
        'nav_shop': 'Boutique',
        'nav_promo': 'Promotions',
        'hero_title': 'Snacks Savoureux<br>du Monde.',
        'hero_subtitle': 'Sélectionnés pour vous au Canada. 🐾',
        'btn_buy': 'Acheter 🛒',
        'rank_unlogged': 'Non connecté 🐾',
        'coupon_tag': '20% RABAIS',
        'shop_title': 'Snacks Mondiaux 🐾',
        'shop_subtitle': 'Livraison partout au Canada. 🐾',
        'btn_add_cart': 'AJOUTER +',
        'login_welcome': 'Bienvenue 🐾',
        'login_subtitle': 'Entrez votre courriel pour le code',
        'btn_get_code': 'Obtenir le code',
        'btn_login': 'Commencer'
    }
};

function switchLanguage(lang) {
    localStorage.setItem('dogme_lang', lang);
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT') {
                el.placeholder = translations[lang][key];
            } else {
                el.innerHTML = translations[lang][key];
            }
        }
    });

    // 关键修复：切换语言时同步更新等级名称 (如 V1 萌新 -> Newbie)
    if (typeof syncUserData === 'function') syncUserData();
    if (typeof syncStatus === 'function') syncStatus(); 
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('dogme_lang') || 'zh';
    switchLanguage(savedLang);
});
