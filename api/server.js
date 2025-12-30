const nodemailer = require('nodemailer');

// 1. 邮件传输配置 - 保持您的专属授权码
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dogme.yummy@gmail.com', // 您的 Gmail
        pass: 'clpdgkvddjavwyns'       // 您的授权码
    }
});

// 模拟内存数据库 (注意：Vercel 云函数每次调用可能重置，生产环境建议后续对接 MongoDB)
let activeCodes = {}; 

export default async function handler(req, res) {
    // 启用跨域支持 (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { email, code: userCode } = req.body;

    // 接口 A：发送验证码
    if (req.url.includes('/send-code')) {
        if (!email) return res.status(400).json({ success: false, msg: '需要填写邮箱地址' });

        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        activeCodes[email] = {
            code: generatedCode,
            expires: Date.now() + 5 * 60 * 1000 // 5分钟有效
        };

        const mailOptions = {
            from: '"Dogme Security 🐾" <dogme.yummy@gmail.com>',
            to: email,
            subject: `[Dogme] 您的安全验证码: ${generatedCode}`,
            html: `
                <div style="background-color: #fdfcf9; padding: 50px 20px; font-family: 'Quicksand', sans-serif;">
                    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #f1f1f1;">
                        <div style="background: #2D3436; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: 900;">Dogme Security.</h1>
                        </div>
                        <div style="padding: 40px; text-align: center;">
                            <div style="font-size: 50px; margin-bottom: 20px;">🐾</div>
                            <h2 style="color: #2D3436; font-size: 22px; margin-bottom: 10px; font-weight: 700;">验证您的身份</h2>
                            <p style="color: #636e72; font-size: 14px; line-height: 1.6;">欢迎来到 Dogme！请在登录页面输入以下验证码：</p>
                            <div style="margin: 30px 0; background: #FFF9F5; border-radius: 25px; padding: 30px; border: 2px dashed #FF8D36;">
                                <span style="font-size: 48px; font-weight: 900; color: #FF8D36; letter-spacing: 8px;">${generatedCode}</span>
                            </div>
                            <p style="color: #b2bec3; font-size: 12px; margin-top: 20px;">验证码将于 5 分钟后失效。</p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ success: false, msg: '邮件发送失败' });
        }
    }

    // 接口 B：校验登录
    if (req.url.includes('/verify-code')) {
        const record = activeCodes[email];
        if (record && record.code === userCode && Date.now() < record.expires) {
            delete activeCodes[email];
            return res.status(200).json({ success: true, msg: '欢迎回来！' });
        }
        return res.status(401).json({ success: false, msg: '验证码错误或已过期' });
    }
}
