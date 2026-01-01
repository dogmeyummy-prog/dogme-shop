/**
 * Dogme Shop - 国际化控制中心 🐾
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

/**
 * 切换语言并触发页面局部刷新
 */
function switchLanguage(lang) {
    // 1. 存储语言偏好
    localStorage.setItem('dogme_lang', lang);
    document.documentElement.lang = lang;
    
    // 2. 翻译带有 data-t 属性的所有静态 HTML 元素
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (translations[lang] && translations[lang][key]) {
            // 如果是输入框则修改 placeholder，否则修改内容
            if (el.tagName === 'INPUT') {
                el.placeholder = translations[lang][key];
            } else {
                el.innerHTML = translations[lang][key];
            }
        }
    });

    // 3. 🌟 核心同步：如果页面定义了渲染函数，强制执行
    // 这样零食区的按钮文字（btn_add）会立即刷新
    if (typeof window.render === 'function') {
        window.render(); 
    }
    
    // 4. 🌟 核心同步：刷新等级系统文案（如：等级 -> Level）
    if (typeof window.syncStatus === 'function') {
        window.syncStatus();
    }
}

/**
 * 初始化：页面加载时自动应用语言
 */
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('dogme_lang') || 'zh';
    switchLanguage(savedLang);
});
