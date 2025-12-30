const nodemailer = require('nodemailer');

// 1. 邮件传输配置（保持原有的 Google 授权码不变）
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dogme.yummy@gmail.com',
        pass: 'clpdgkvddjavwyns' 
    }
});

let activeCodes = {}; 

export default async function handler(req, res) {
    // 设置跨域头，确保前端能正常访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || "";
    
    // 接口 A：发送装饰后的验证码邮件
    if (url.includes('send-code')) {
        const { email } = req.body || {};
        if (!email) return res.status(400).json({ success: false, msg: '邮箱缺失' });

        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        activeCodes[email] = {
            code: generatedCode,
            expires: Date.now() + 5 * 60 * 1000 
        };

        const mailOptions = {
            from: '"Dogme Security 🐾" <dogme.yummy@gmail.com>',
            to: email,
            subject: `[Dogme] ${generatedCode} 是您的登录验证码 🐾`,
            html: `
            <div style="background-color: #fdfcf9; padding: 50px 20px; font-family: 'Quicksand', sans-serif, 'Helvetica Neue', Helvetica; text-align: center;">
                <div style="max-width: 460px; margin: 0 auto; background: #ffffff; border-radius: 45px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.03); border: 1px solid #f0f0f0;">
                    
                    <div style="font-size: 60px; margin-bottom: 20px;">🐾</div>
                    
                    <h2 style="color: #2D3436; font-size: 26px; font-weight: 900; margin-bottom: 10px; letter-spacing: -0.5px;">身份验证</h2>
                    <p style="color: #636E72; font-size: 15px; line-height: 1.6; margin-bottom: 35px;">Hi! 欢迎回到 Dogme。<br>请在登录页面输入下方的 6 位数验证码。</p>
                    
                    <div style="background: #FFF9F5; border: 3px dashed #FF8D36; border-radius: 30px; padding: 25px 10px; margin-bottom: 35px;">
                        <span style="font-size: 42px; font-weight: 900; color: #FF8D36; letter-spacing: 10px; display: inline-block; margin-left: 10px;">${generatedCode}</span>
                    </div>
                    
                    <div style="border-top: 2px solid #fcfcfc; padding-top: 25px;">
                        <p style="color: #B2BEC3; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0;">有效时间：5 分钟</p>
                    </div>
                </div>
                
                <p style="color: #D1D8E0; font-size: 12px; margin-top: 25px; font-weight: 500;">
                    Powered by Dogme Security Team 🐾<br>
                    如果您未曾请求此邮件，请直接忽略。
                </p>
            </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ success: false, msg: '邮件服务暂时不可用' });
        }
    }

    // 接口 B：验证码校验逻辑
    if (url.includes('verify-code')) {
        const { email, code } = req.body || {};
        const record = activeCodes[email];
        
        if (record && record.code === String(code) && Date.now() < record.expires) {
            delete activeCodes[email];
            return res.status(200).json({ success: true });
        }
        return res.status(401).json({ success: false, msg: '验证码无效或已过期' });
    }

    return res.status(404).json({ msg: 'Path not found' });
}
