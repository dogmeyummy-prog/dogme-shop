const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dogme.yummy@gmail.com',
        pass: 'clpdgkvddjavwyns' // 请确保这是 16 位应用专用密码
    }
});

let activeCodes = {}; 

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || "";
    const body = req.body || {};

    // 🌟 路径兼容逻辑：支持 /api/server, /api/send-code 等多种触发方式
    if (url.includes('send-code') || body.action === 'send-code') {
        const { email } = body;
        if (!email) return res.status(400).json({ success: false, msg: '邮箱缺失' });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        activeCodes[email] = { code, expires: Date.now() + 300000 };

        try {
            await transporter.sendMail({
                from: '"Dogme Security 🐾" <dogme.yummy@gmail.com>',
                to: email,
                subject: `[Dogme] 您的验证码是 ${code}`,
                html: `
                <div style="background:#fdfcf9;padding:40px;font-family:sans-serif;text-align:center;">
                    <div style="max-width:400px;margin:0 auto;background:#fff;border-radius:40px;padding:40px;border:1px solid #f0f0f0;">
                        <div style="font-size:50px;margin-bottom:20px;">🐾</div>
                        <h2 style="color:#1a1a1a;">欢迎来到 Dogme</h2>
                        <div style="background:#FFF9F5;border:2px dashed #FF8D36;border-radius:25px;padding:25px;margin:25px 0;">
                            <span style="font-size:36px;font-weight:900;color:#FF8D36;letter-spacing:8px;">${code}</span>
                        </div>
                        <p style="color:#999;font-size:12px;">验证码 5 分钟内有效，请勿泄露。</p>
                    </div>
                </div>`
            });
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ success: false, msg: e.message });
        }
    }

    if (url.includes('verify-code') || body.action === 'verify-code') {
        const { email, code } = body;
        const record = activeCodes[email];
        if (record && record.code === String(code) && Date.now() < record.expires) {
            delete activeCodes[email];
            return res.status(200).json({ success: true });
        }
        return res.status(401).json({ success: false, msg: '验证码错误或已过期' });
    }

    return res.status(404).json({ msg: "Path Not Found", currentPath: url });
}
