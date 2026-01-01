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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const body = req.body || {};
    // 🌟 修改点：优先通过 body 里的 action 判断
    const action = body.action || (req.url.includes('send-code') ? 'send-code' : (req.url.includes('verify-code') ? 'verify-code' : ''));

    if (action === 'send-code') {
        const { email } = body;
        if (!email) return res.status(400).json({ success: false, msg: '邮箱缺失' });
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        activeCodes[email] = { code, expires: Date.now() + 300000 };

        try {
            await transporter.sendMail({
                from: '"Dogme Security 🐾" <dogme.yummy@gmail.com>',
                to: email,
                subject: `[Dogme] ${code} 是您的验证码`,
                html: `<div style="text-align:center;padding:40px;background:#fdfcf9;font-family:sans-serif;">
                        <h2 style="color:#FF8D36;">Dogme.</h2>
                        <p>您的验证码是：</p>
                        <h1 style="font-size:40px;letter-spacing:10px;">${code}</h1>
                      </div>`
            });
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ success: false, msg: e.message });
        }
    }

    if (action === 'verify-code') {
        const { email, code } = body;
        const record = activeCodes[email];
        if (record && record.code === String(code) && Date.now() < record.expires) {
            return res.status(200).json({ success: true });
        }
        return res.status(401).json({ success: false, msg: '验证码错误' });
    }

    return res.status(404).json({ msg: "未识别操作", action });
}
