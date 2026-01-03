import nodemailer from 'nodemailer';
import Stripe from 'stripe';

// 这里的环境变量请在 Vercel 控制台配置，或者直接替换为你的 Key（不建议硬编码）
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dogme.yummy@gmail.com',
        pass: 'clpdgkvddjavwyns' // 🔑 确保这是 16 位 App Password
    }
});

// 验证码内存存储（Vercel 免费版函数会有冷启动重置，但对于验证码足够了）
let activeCodes = {}; 

export default async function handler(req, res) {
    // 跨域处理
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const body = req.body || {};
    const action = body.action;

    // --- 接口 1：发送美化验证码邮件 ---
    if (action === 'send-code') {
        const { email } = body;
        if (!email) return res.status(400).json({ success: false, msg: 'Email is required' });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        activeCodes[email] = { code, expires: Date.now() + 300000 }; // 5分钟有效

        try {
            await transporter.sendMail({
                from: '"Dogme Security 🐾" <dogme.yummy@gmail.com>',
                to: email,
                subject: `[Dogme] 您的登录验证码是 ${code}`,
                // 🌟 深度美化的邮件模板
                html: `
                <div style="background-color: #fdfcf9; padding: 50px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center;">
                    <div style="max-width: 450px; margin: 0 auto; background: #ffffff; border-radius: 40px; padding: 40px; box-shadow: 0 15px 35px rgba(255,141,54,0.05); border: 1px solid #f1f1f1;">
                        <div style="font-size: 50px; margin-bottom: 20px;">🐾</div>
                        <h2 style="color: #1a1a1a; margin: 0; font-size: 24px; font-weight: 900;">欢迎来到 Dogme.</h2>
                        <p style="color: #a0a0a0; font-size: 14px; margin-top: 10px; font-weight: 600;">您的全球美味之旅即将开启</p>
                        
                        <div style="background: #FFF9F5; border: 2px dashed #FF8D36; border-radius: 25px; padding: 30px; margin: 30px 0;">
                            <p style="color: #FF8D36; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; margin-top: 0;">您的登录验证码</p>
                            <span style="font-size: 42px; font-weight: 900; color: #1a1a1a; letter-spacing: 8px;">${code}</span>
                        </div>
                        
                        <p style="color: #636E72; font-size: 13px; line-height: 1.6; margin-bottom: 0;">
                            验证码将在 <b>5 分钟</b> 后过期。<br>
                            为了您的账户安全，请勿将此代码转发给他人。
                        </p>
                    </div>
                    <p style="color: #bdc3c7; font-size: 11px; margin-top: 30px;">© 2026 Dogme Shop. All rights reserved.</p>
                </div>`
            });
            return res.status(200).json({ success: true });
        } catch (e) {
            console.error("Mail Error:", e);
            return res.status(500).json({ success: false, msg: "邮件服务异常: " + e.message });
        }
    }

    // --- 接口 2：验证验证码 ---
    if (action === 'verify-code') {
        const { email, code } = body;
        const record = activeCodes[email];
        
        if (record && record.code === String(code) && Date.now() < record.expires) {
            delete activeCodes[email]; // 验证成功后立即失效，提高安全性
            return res.status(200).json({ success: true });
        }
        return res.status(401).json({ success: false, msg: '验证码错误或已过期 ❌' });
    }

    // --- 接口 3：Stripe 支付会话 ---
    if (action === 'create-checkout-session') {
        try {
            const { amount, email: customerEmail } = body;
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'cad',
                        product_data: { name: 'Dogme 订单结算 🐾' },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                customer_email: customerEmail,
                success_url: `${req.headers.origin}/pay.html?status=success&amount=${amount}`,
                cancel_url: `${req.headers.origin}/pay.html?status=cancel`,
            });
            return res.status(200).json({ url: session.url });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(404).json({ msg: "未识别的操作", received: action });
}
