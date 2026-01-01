const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dogme.yummy@gmail.com',
        pass: 'clpdgkvddjavwyns' 
    }
});

let activeCodes = {}; 

export default async function handler(req, res) {
    // 1. 跨域与预检请求处理
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 2. 路径解析修复
    const url = req.url.split('?')[0];

    // --- 接口：发送美化验证码邮件 ---
    if (url.includes('send-code')) {
        const { email } = req.body || {};
        if (!email) return res.status(400).json({ success: false, msg: '邮箱缺失' });

        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        activeCodes[email] = {
            code: generatedCode,
            expires: Date.now() + 5 * 60 * 1000 
        };

        try {
            await transporter.sendMail({
                from: '"Dogme Security 🐾" <dogme.yummy@gmail.com>',
                to: email,
                subject: `${generatedCode} 是您的 Dogme 登录验证码`,
                // 🌟 美化后的邮件 HTML 模板
                html: `
                <div style="background-color: #fdfcf9; padding: 40px 20px; font-family: 'Quicksand', sans-serif; text-align: center;">
                    <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 40px; padding: 40px; border: 1px solid #f1f1f1; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                        <div style="font-size: 50px; margin-bottom: 10px;">🐾</div>
                        <h1 style="color: #1a1a1a; font-size: 28px; margin: 0; font-weight: 900;">Dogme.</h1>
                        <p style="color: #a0a0a0; font-size: 14px; font-weight: bold; margin-top: 5px;">全球精选美味零食</p>
                        
                        <div style="margin: 30px 0; padding: 20px; background: #fff8f3; border-radius: 25px;">
                            <p style="color: #FF8D36; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">您的登录验证码</p>
                            <span style="font-size: 42px; font-weight: 900; color: #1a1a1a; letter-spacing: 8px;">${generatedCode}</span>
                        </div>
                        
                        <p style="color: #666; font-size: 13px; line-height: 1.6;">
                            请在 5 分钟内输入此验证码以开启您的 Dogme 之旅。<br>
                            如果这不是您本人操作，请忽略此邮件。
                        </p>
                        
                        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            <p style="color: #ccc; font-size: 10px; font-weight: bold; text-transform: uppercase;">Dogme Canada © 2026</p>
                        </div>
                    </div>
                </div>
                `
            });
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ success: false, msg: '邮件发送失败' });
        }
    }

    // --- 接口：验证码校验 ---
    if (url.includes('verify-code')) {
        const { email, code } = req.body || {};
        const record = activeCodes[email];
        if (record && record.code === String(code) && Date.now() < record.expires) {
            delete activeCodes[email];
            return res.status(200).json({ success: true });
        }
        return res.status(401).json({ success: false, msg: '验证码无效或已过期' });
    }

    return res.status(404).json({ msg: "Endpoint not found" });
}
