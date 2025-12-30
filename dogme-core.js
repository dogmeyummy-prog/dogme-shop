/**
 * Dogme 核心引擎 v23.0 | 视觉同步与布局优化版 🐾
 */

const LevelSystem = {
    // 严格对应 Log-in.html 的等级配色与装饰
    levels: [
        { rank: 1, name: "萌新 Dogme", min: 0, color: "#94a3b8", glow: "rgba(148, 163, 184, 0.3)" },
        { rank: 2, name: "好奇 Dogme", min: 20, color: "#64748b", glow: "rgba(100, 116, 139, 0.3)" },
        { rank: 3, name: "活跃 Dogme", min: 50, color: "#fb923c", glow: "rgba(251, 146, 60, 0.4)" },
        { rank: 4, name: "进阶 Dogme", min: 100, color: "#f97316", glow: "rgba(249, 115, 22, 0.4)" },
        { rank: 5, name: "铁粉 Dogme", min: 200, color: "#ef4444", glow: "rgba(239, 68, 68, 0.5)" },
        { rank: 6, name: "精英 Dogme", min: 400, color: "#0984e3", glow: "rgba(9, 132, 227, 0.5)" },
        { rank: 7, name: "核心 Dogme", min: 700, color: "#e17055", glow: "rgba(225, 112, 85, 0.5)" },
        { rank: 8, name: "尊贵 Dogme", min: 1000, color: "#6c5ce7", glow: "rgba(108, 92, 231, 0.6)" },
        { rank: 9, name: "至尊 Dogme", min: 1400, color: "#2d3436", glow: "rgba(45, 52, 54, 0.6)" },
        { rank: 10, name: "传奇 Dogme", min: 2000, color: "#f1c40f", glow: "rgba(241, 196, 15, 0.8)" }
    ],

    getLevelInfo() {
        const exp = parseFloat(localStorage.getItem('dogme_user_exp') || '0');
        let current = this.levels[0];
        let next = null;
        for (let i = 0; i < this.levels.length; i++) {
            if (exp >= this.levels[i].min) {
                current = this.levels[i];
                next = this.levels[i + 1] || null;
            }
        }
        const range = next ? (next.min - current.min) : 100;
        const progress = next ? ((exp - current.min) / range) * 100 : 100;
        return { ...current, progress };
    },

    updateUI() {
        const info = this.getLevelInfo();
        const isLoggedIn = localStorage.getItem('dogme_user_logged') === 'true';

        // 更新主页经验条卡片
        const homeBadge = document.getElementById('home-user-badge');
        if (homeBadge) {
            if (isLoggedIn) {
                homeBadge.classList.remove('opacity-0', 'translate-y-4');
                homeBadge.style.boxShadow = `0 10px 30px ${info.glow}`;
                homeBadge.style.borderColor = info.color + "44";

                const tag = document.getElementById('rank-level-tag');
                tag.innerText = `V${info.rank}`;
                tag.style.background = `linear-gradient(135deg, ${info.color}, ${this.darkenColor(info.color)})`;

                const bar = document.getElementById('exp-mini-bar');
                bar.style.background = `linear-gradient(90deg, ${info.color} 0%, #fff 50%, ${info.color} 100%)`;
                bar.style.backgroundSize = "200% 100%";
                setTimeout(() => { bar.style.width = `${info.progress}%`; }, 100);

                document.getElementById('rank-name-text').innerText = info.name;
            } else {
                homeBadge.style.display = 'none';
            }
        }
    },

    darkenColor(hex) {
        return hex === "#2d3436" ? "#000000" : hex + "cc"; 
    }
};

// 注入动画与装饰样式
const style = document.createElement('style');
style.innerHTML = `
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    .shimmer-anim { animation: shimmer 2.5s infinite linear; }
    .rank-inline-card { transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); border: 2px solid transparent; }
`;
document.head.appendChild(style);

const DogmeCore = {
    init() {
        LevelSystem.updateUI();
        this.updateCartCount();
    },
    handleUserRoute() {
        const isLogged = localStorage.getItem('dogme_user_logged') === 'true';
        window.location.href = isLogged ? 'Log-in.html' : 'user.html';
    },
    updateCartCount() {
        const badge = document.getElementById('cart-count');
        const cart = JSON.parse(localStorage.getItem('dogme_cart')) || [];
        if (badge) {
            badge.innerText = cart.length;
            badge.style.display = cart.length > 0 ? 'flex' : 'none';
        }
    }
};

window.onload = () => DogmeCore.init();