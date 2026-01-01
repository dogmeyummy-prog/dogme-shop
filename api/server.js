const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dogme.yummy@gmail.com',
        // 🚨 重要：这里必须是 16 位的“设备专用密码”，不能是普通登录密码
        pass: 'clpdgkvddjavwyns' 
    }
});

let activeCodes = {}; 

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 路径纯净化处理，确保匹配 send-code
    const url = (req.url || "").split('?')[0];

    // --- 接口 A：发送美化邮件 ---
    if (url.includes('send-code')) {
        const { email } = req.body || {};
        if (!email) return res.status(400).json({ success: false, msg: '邮箱地址缺失' });

        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        activeCodes[email] = {
            code: generatedCode,
            expires: Date.now() + 5 * 60 * 1000 
        };

        const mailOptions = {
            from: '"Dogme Security 🐾" <dogme.yummy@gmail.com>',
            to: email,
            subject: `[Dogme] ${generatedCode} 是您的验证码 🐾`,
            // 🌟 重新设计的品牌感邮件
            html: `
            <div style="background-color: #fdfcf9; padding: 40px; font-family: 'Quicksand', sans-serif; text-align: center;">
                <div style="max-width: 400px; margin: 0 auto; background: #ffffff; border-radius: 40px; padding: 40px; border: 1px solid #f1f1f1; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                    <div style="font-size: 50px; margin-bottom: 10px;">🐾</div>
                    <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 900; margin: 0;">Dogme.</h2>
                    <p style="color: #a0a0a0; font-size: 13px; font-weight: bold; margin-bottom: 30px;">开启全球美味之旅</p>
                    
                    <div style="background: #FFF9F5; border-radius: 25px; padding: 25px; margin-bottom: 30px;">
                        <p style="color: #FF8D36; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">您的登录验证码</p>
                        <span style="font-size: 38px; font-weight: 900; color: #1a1a1a; letter-spacing: 8px;">${generatedCode}</span>
                    </div>
                    
                    <p style="color: #636E72; font-size: 13px; line-height: 1.6;">验证码将在 5 分钟后过期。<br>请勿将此代码转发给任何人。🐾</p>
                </div>
            </div>`
        };

        try {
            await transporter.sendMail(mailOptions);
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error("Mail Error:", error);
            return res.status(500).json({ success: false, msg: error.message });
        }
    }

    // --- 接口 B：验证登录 ---
    if (url.includes('verify-code')) {
        const { email, code } = req.body || {};
        const record = activeCodes[email];
        if (record && record.code === String(code) && Date.now() < record.expires) {
            delete activeCodes[email];
            return res.status(200).json({ success: true });
        }
        return res.status(401).json({ success: false, msg: '验证码无效' });
    }

    return res.status(404).end();
}
