/**
 * Dogme Shop - 国际化控制中心 🐾
 * 确保 translations 变量在最顶部
 */
const translations = {
    'zh': {
        'top_bar': '🇨🇦 Dogme 加拿大：今日新上架多款人气零食，全境包邮送达 🐾',
        'nav_shop': '所有商品',
        'nav_promo': '优惠专区',
        'shop_title': '全球货柜 🐾',
        'shop_subtitle': '精选全球零食，直邮加拿大全境。🐾',
        'btn_add': '加入购物车 +',
        'rank_unlogged': '未登录 🐾'
    },
    'en': {
        'top_bar': '🇨🇦 Dogme Canada: Free shipping nationwide on all new snacks 🐾',
        'nav_shop': 'Shop All',
        'nav_promo': 'Promos',
        'shop_title': 'Global Snacks 🐾',
        'shop_subtitle': 'Specially picked for you in Canada. 🐾',
        'btn_add': 'ADD TO CART +',
        'rank_unlogged': 'Guest 🐾'
    },
    'fr': {
        'top_bar': '🇨🇦 Dogme Canada: Livraison gratuite partout au pays 🐾',
        'nav_shop': 'Boutique',
        'nav_promo': 'Promotions',
        'shop_title': 'Snacks Mondiaux 🐾',
        'shop_subtitle': 'Sélection mondiale, livrée partout au Canada. 🐾',
        'btn_add': 'AJOUTER +',
        'rank_unlogged': 'Non connecté 🐾'
    }
};

function switchLanguage(lang) {
    localStorage.setItem('dogme_lang', lang);
    document.documentElement.lang = lang;
    
    // 翻译带有 data-t 的静态元素
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // --- 强制刷新零食区渲染 ---
    if (typeof window.render === 'function') {
        window.render(); 
    }
    // --- 强制刷新经验等级条 ---
    if (typeof window.syncStatus === 'function') {
        window.syncStatus();
    }
}

// 页面加载自动初始化
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('dogme_lang') || 'zh';
    switchLanguage(savedLang);
});
