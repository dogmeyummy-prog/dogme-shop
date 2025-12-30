const nodemailer = require('nodemailer');

// 1. 邮件传输配置
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dogme.yummy@gmail.com',
        pass: 'clpdgkvddjavwyns' 
    }
});

// 临时存储验证码
let activeCodes = {}; 

export default async function handler(req, res) {
    // 启用跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 统一处理请求路径，兼容不同的部署环境
    const path = req.url;

    // 接口 A：发送验证码
    if (path.includes('send-code')) {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, msg: '需要填写邮箱地址' });

        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        activeCodes[email] = {
            code: generatedCode,
            expires: Date.now() + 5 * 60 * 1000 
        };

        const mailOptions = {
            from: '"Dogme Security 🐾" <dogme.yummy@gmail.com>',
            to: email,
            subject: `[Dogme] 您的安全验证码: ${generatedCode}`,
            html: `
                <div style="background-color: #fdfcf9; padding: 50px 20px; font-family: sans-serif;">
                    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 40px; border: 1px solid #f1f1f1; text-align: center; overflow: hidden;">
                        <div style="background: #2D3436; padding: 20px; color: white; font-weight: 900;">Dogme Security.</div>
                        <div style="padding: 40px;">
                            <div style="font-size: 50px;">🐾</div>
                            <h2 style="color: #2D3436;">验证您的身份</h2>
                            <div style="margin: 30px 0; background: #FFF9F5; border: 2px dashed #FF8D36; padding: 20px; border-radius: 20px;">
                                <span style="font-size: 40px; font-weight: 900; color: #FF8D36; letter-spacing: 5px;">${generatedCode}</span>
                            </div>
                            <p style="color: #b2bec3; font-size: 12px;">验证码 5 分钟内有效</p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Mail Error:', error);
            return res.status(500).json({ success: false, msg: '邮件发送失败' });
        }
    }

    // 接口 B：校验登录
    if (path.includes('verify-code')) {
        const { email, code: userCode } = req.body;
        const record = activeCodes[email];
        if (record && record.code === userCode && Date.now() < record.expires) {
            delete activeCodes[email];
            return res.status(200).json({ success: true, msg: '欢迎回来！' });
        }
        return res.status(401).json({ success: false, msg: '验证码错误或已过期' });
    }

    return res.status(404).json({ msg: 'Not Found' });
}
