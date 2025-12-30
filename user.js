/**
 * Dogme 用户系统核心引擎 v6.0 🐾 
 * 专为温哥华 Dogme 零食平台定制
 * 功能：等级体系、本地物流状态、账号绑定、经验值平滑计算
 */

const LevelSystem = {
    // 1. 品牌定义：V1 - V10 经验阶梯与视觉配色
    levels: [
        { name: "V1 萌新 Dogme", min: 0, color: "#94a3b8" },    // 0 - 19
        { name: "V2 好奇 Dogme", min: 20, color: "#64748b" },   // 20 - 49
        { name: "V3 贪吃 Dogme", min: 50, color: "#fb923c" },   // 50 - 69
        { name: "V4 忠诚 Dogme", min: 70, color: "#f97316" },   // 70 - 99
        { name: "V5 黄金 Dogme", min: 100, color: "#eab308" },  // 100 - 199
        { name: "V6 翡翠 Dogme", min: 200, color: "#22c55e" },  // 200 - 499
        { name: "V7 钻石 Dogme", min: 500, color: "#06b6d4" },  // 500 - 699
        { name: "V8 星耀 Dogme", min: 700, color: "#6366f1" },  // 700 - 999
        { name: "V9 传奇 Dogme", min: 1000, color: "#a855f7" }, // 1000 - 1999
        { name: "V10 至尊 Dogme", min: 2000, color: "#ec4899" } // 2000+
    ],

    /**
     * 获取用户当前等级信息
     * @returns {Object} 包含等级名、进度百分比、当前经验、下一级经验
     */
    getUserInfo() {
        const exp = parseFloat(localStorage.getItem('dogme_user_exp')) || 0;
        let levelIdx = 0;

        // 查找当前所在的等级区间
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (exp >= this.levels[i].min) {
                levelIdx = i;
                break;
            }
        }

        const currentLevel = this.levels[levelIdx];
        const nextLevel = this.levels[levelIdx + 1];

        // 计算进度条百分比
        let progress = 0;
        if (nextLevel) {
            const range = nextLevel.min - currentLevel.min;
            const earned = exp - currentLevel.min;
            progress = (earned / range) * 100;
        } else {
            progress = 100; // 满级 V10
        }

        return {
            levelName: currentLevel.name,
            rank: levelIdx + 1,
            color: currentLevel.color,
            currentExp: Math.floor(exp),
            nextLevelExp: nextLevel ? nextLevel.min : "MAX",
            progress: Math.min(progress, 100).toFixed(0)
        };
    },

    /**
     * 增加经验值（如：1加币 = 1点经验）
     * @param {number} amount 
     */
    addExp(amount) {
        if (isNaN(amount) || amount <= 0) return;
        let currentExp = parseFloat(localStorage.getItem('dogme_user_exp')) || 0;
        currentExp += amount;
        localStorage.setItem('dogme_user_exp', currentExp);
        console.log(`%c Dogme Exp Up! +${amount} 🐾`, `color: ${this.levels[4].color}; font-weight: bold;`);
    }
};

const UserSystem = {
    // 初始化检查
    init() {
        if (!localStorage.getItem('dogme_user_exp')) {
            localStorage.setItem('dogme_user_exp', '0');
        }
    },

    // 登录状态
    isLoggedIn() {
        return localStorage.getItem('dogme_user_logged') === 'true';
    },

    /**
     * 登录逻辑
     * @param {string} account 自动识别手机号或邮箱 
     */
    login(account) {
        if (!account) return;
        localStorage.setItem('dogme_user_logged', 'true');
        localStorage.setItem('dogme_account_raw', account);
        
        // 自动分发绑定类型
        if (account.includes('@')) {
            localStorage.setItem('dogme_bind_email', account);
        } else if (account.match(/^\d{10,}$/)) {
            localStorage.setItem('dogme_bind_phone', account);
        }
        
        // 首次登录赠送 10 经验（欢迎礼）
        if (parseFloat(localStorage.getItem('dogme_user_exp')) === 0) {
            LevelSystem.addExp(10);
        }
    },

    // 退出登录
    logout() {
        localStorage.setItem('dogme_user_logged', 'false');
        window.location.href = '测试版.html';
    },

    /**
     * 物流状态检查 (专为 tracking.html 准备)
     * 状态码定义: 0: 备货中, 1: 跨洋运输, 2: 温哥华配送中, 3: 已签收
     */
    getShippingStatus() {
        const history = JSON.parse(localStorage.getItem('dogme_order_history')) || [];
        if (history.length === 0) return null;
        
        // 模拟逻辑：最后一单如果在 24 小时内，视为配送中
        const lastOrder = history[0];
        const hoursDiff = (new Date() - new Date(lastOrder.date)) / (1000 * 60 * 60);
        
        return {
            orderId: lastOrder.orderId,
            status: hoursDiff > 24 ? 3 : 2, // 超过24小时显示已签收，否则配送中
            tag: hoursDiff > 24 ? "DELIVERED" : "IN TRANSIT"
        };
    }
};

// 立即运行初始化
UserSystem.init();

// 导出模块（兼容传统脚本引用）
window.LevelSystem = LevelSystem;
window.UserSystem = UserSystem;