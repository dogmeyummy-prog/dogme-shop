const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dogme.yummy@gmail.com',
        pass: 'clpdgkvddjavwyns' // 🔑 请确保这是 16 位 App Password
    }
});

let activeCodes = {}; 

export default async function handler(req, res) {
    // 跨域设置
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const body = req.body || {};
    // 🌟 统一通过 action 字段判断操作类型，不再依赖 URL 路径
    const action = body.action;

    // --- 接口 A：发送验证码 ---
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
                html: `
                <div style="background:#fdfcf9;padding:40px;text-align:center;font-family:sans-serif;">
                    <div style="max-width:400px;margin:0 auto;background:#fff;border-radius:40px;padding:40px;border:1px solid #f1f1f1;">
                        <div style="font-size:50px;margin-bottom:10px;">🐾</div>
                        <h2 style="color:#1a1a1a;margin-bottom:5px;">Dogme.</h2>
                        <div style="background:#FFF9F5;border:2px dashed #FF8D36;border-radius:25px;padding:25px;margin:20px 0;">
                            <p style="color:#FF8D36;font-size:12px;font-weight:bold;margin-bottom:10px;text-transform:uppercase;">您的验证码</p>
                            <span style="font-size:38px;font-weight:900;color:#1a1a1a;letter-spacing:8px;">${code}</span>
                        </div>
                        <p style="color:#a0a0a0;font-size:12px;">验证码 5 分钟内有效，请勿泄露。</p>
                    </div>
                </div>`
            });
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ success: false, msg: "发送失败: " + e.message });
        }
    }

    // --- 接口 B：校验验证码 ---
    if (action === 'verify-code') {
        const { email, code } = body;
        const record = activeCodes[email];
        if (record && record.code === String(code) && Date.now() < record.expires) {
            delete activeCodes[email];
            return res.status(200).json({ success: true });
        }
        return res.status(401).json({ success: false, msg: '验证码无效或已过期' });
    }

    // --- 接口 C：Stripe 支付 ---
    if (action === 'create-checkout-session') {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'cad',
                        product_data: { name: 'Dogme Order 🐾' },
                        unit_amount: Math.round(body.amount * 100),
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                customer_email: body.email,
                success_url: `${req.headers.origin}/pay.html?status=success&amount=${body.amount}`,
                cancel_url: `${req.headers.origin}/pay.html?status=cancel`,
            });
            return res.status(200).json({ url: session.url });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(404).json({ msg: "未识别的操作: " + action });
}
