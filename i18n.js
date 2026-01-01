/**
 * Dogme Shop - 多语言国际化控制中心 🐾
 * 整合了首页、购物页及登录页的所有文案
 */

const translations = {
    'zh': {
        'top_bar': '🇨🇦 Dogme 加拿大：今日新上架多款人气零食，全境包邮送达 🐾',
        'nav_shop': '所有商品',
        'nav_promo': '优惠专区',
        'shop_title': '全球货柜 🐾',
        'shop_subtitle': '精选全球零食，直邮加拿大全境。🐾',
        'btn_add': '加入购物车 +',
        'rank_unlogged': '未登录 🐾',
        // 登录页
        'login_welcome': '欢迎回来 🐾',
        'btn_get_code': '获取验证码',
        'btn_login': '开启 Dogme 之旅'
    },
    'en': {
        'top_bar': '🇨🇦 Dogme Canada: Free shipping nationwide on all new snacks 🐾',
        'nav_shop': 'Shop All',
        'nav_promo': 'Promos',
        'shop_title': 'Global Snacks 🐾',
        'shop_subtitle': 'Specially picked for you in Canada. 🐾',
        'btn_add': 'ADD TO CART +',
        'rank_unlogged': 'Guest 🐾',
        'login_welcome': 'Welcome Back 🐾',
        'btn_get_code': 'Get Code',
        'btn_login': 'Start Journey'
    },
    'fr': {
        'top_bar': '🇨🇦 Dogme Canada: Livraison gratuite partout au pays 🐾',
        'nav_shop': 'Boutique',
        'nav_promo': 'Promotions',
        'shop_title': 'Snacks Mondiaux 🐾',
        'shop_subtitle': 'Sélection mondiale, livrée partout au Canada. 🐾',
        'btn_add': 'AJOUTER +',
        'rank_unlogged': 'Non connecté 🐾',
        'login_welcome': 'Bienvenue 🐾',
        'btn_get_code': 'Obtenir le code',
        'btn_login': 'Commencer'
    }
};

function switchLanguage(lang) {
    localStorage.setItem('dogme_lang', lang);
    document.documentElement.lang = lang;
    
    // 翻译静态 data-t 元素
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // --- 核心同步：触发页面渲染刷新 ---
    if (typeof render === 'function') {
        render(); // 重新渲染商品列表，以更新按钮文字
    }
    if (typeof syncStatus === 'function') {
        syncStatus(); // 更新等级名称
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('dogme_lang') || 'zh';
    switchLanguage(savedLang);
});
