// i18n.js - Dogme Shop 多语言控制中心 🐾
const translations = {
    'zh': {
        'nav_home': '首页',
        'nav_shop': '所有商品',
        'hero_title': '全球精选<br>美味零食',
        'hero_subtitle': '专为在加拿大的你准备。🐾',
        'btn_buy': '立即选购 🛒',
        'exp_text': '经验值',
        'coupon_text': '领8折券',
        'lang_switch': '语言'
    },
    'en': {
        'nav_home': 'Home',
        'nav_shop': 'Shop All',
        'hero_title': 'Tasty Snacks<br>From Global',
        'hero_subtitle': 'Prepared just for you in Canada. 🐾',
        'btn_buy': 'Shop Now 🛒',
        'exp_text': 'EXP',
        'coupon_text': '20% OFF',
        'lang_switch': 'Lang'
    },
    'fr': {
        'nav_home': 'Accueil',
        'nav_shop': 'Boutique',
        'hero_title': 'Snacks Savoureux<br>du Monde',
        'hero_subtitle': 'Préparé juste pour vous au Canada. 🐾',
        'btn_buy': 'Acheter 🛒',
        'exp_text': 'EXP',
        'coupon_text': '20% RABAIS',
        'lang_switch': 'Langue'
    }
};

function switchLanguage(lang) {
    localStorage.setItem('dogme_lang', lang);
    document.documentElement.lang = lang;
    
    // 扫描所有带有 data-t 属性的元素
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });
}

// 页面加载时自动应用语言
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('dogme_lang') || 'zh';
    switchLanguage(savedLang);
});
