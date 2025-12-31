const nodemailer = require('nodemailer');
// 自动读取你在 Vercel 设置的环境变量 STRIPE_SECRET_KEY
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 1. 邮件传输配置
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dogme.yummy@gmail.com',
        pass: 'clpdgkvddjavwyns' 
    }
});

let activeCodes = {}; 

export default async function handler(req, res) {
    // 启用跨域头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || "";

    // --- 接口 A：发送装饰后的验证码邮件 ---
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
            html: `
            <div style="background-color: #fdfcf9; padding: 40px; font-family: sans-serif; text-align: center;">
                <div style="max-width: 400px; margin: 0 auto; background: #ffffff; border-radius: 40px; padding: 40px; border: 1px solid #f0f0f0;">
                    <div style="font-size: 50px; margin-bottom: 20px;">🐾</div>
                    <h2 style="color: #2D3436; font-size: 24px; font-weight: 900; margin-bottom: 10px;">身份验证</h2>
                    <p style="color: #636E72; font-size: 14px; margin-bottom: 30px;">欢迎回到 Dogme！请使用下方的验证码完成登录。</p>
                    <div style="background: #FFF9F5; border: 2px dashed #FF8D36; border-radius: 25px; padding: 20px; margin-bottom: 30px;">
                        <span style="font-size: 36px; font-weight: 900; color: #FF8D36; letter-spacing: 8px;">${generatedCode}</span>
                    </div>
                    <p style="color: #B2BEC3; font-size: 11px;">验证码 5 分钟内有效</p>
                </div>
            </div>`
        };

        try {
            await transporter.sendMail(mailOptions);
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ success: false, msg: '邮件发送失败' });
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

    // --- 接口 C：创建真实支付会话 (Stripe) ---
    if (url.includes('create-checkout-session')) {
        const { amount, email } = req.body;
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'Dogme Order 🐾' },
                        unit_amount: Math.round(amount * 100), 
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                customer_email: email,
                success_url: `${req.headers.origin}/pay.html?status=success&amount=${amount}`,
                cancel_url: `${req.headers.origin}/pay.html?status=cancel`,
            });
            return res.status(200).json({ url: session.url });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(404).end();
}
