const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dogme.yummy@gmail.com',
        pass: 'clpdgkvddjavwyns' 
    }
});

let activeCodes = {}; 

export default async function handler(req, res) {
    // 1. 设置跨域头（必须）
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 2. 兼容性路径解析
    const url = req.url || "";
    
    // 接口 A：发送验证码
    if (url.includes('send-code')) {
        const { email } = req.body || {};
        if (!email) return res.status(400).json({ success: false, msg: '邮箱地址缺失' });

        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        activeCodes[email] = {
            code: generatedCode,
            expires: Date.now() + 5 * 60 * 1000 
        };

        try {
            await transporter.sendMail({
                from: '"Dogme Security 🐾" <dogme.yummy@gmail.com>',
                to: email,
                subject: `[Dogme] 您的验证码: ${generatedCode}`,
                html: `<div style="text-align:center;padding:40px;"><h2>${generatedCode}</h2><p>5分钟内有效</p></div>`
            });
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ success: false, msg: '邮件发送失败' });
        }
    }

    // 接口 B：验证登录
    if (url.includes('verify-code')) {
        const { email, code } = req.body || {};
        const record = activeCodes[email];
        
        if (record && record.code === String(code) && Date.now() < record.expires) {
            delete activeCodes[email];
            return res.status(200).json({ success: true });
        }
        return res.status(401).json({ success: false, msg: '验证码错误或已过期' });
    }

    return res.status(404).json({ msg: 'API Path Not Found' });
}
