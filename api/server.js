import nodemailer from 'nodemailer';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const gmailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.DOGME_GMAIL_USER,
        pass: process.env.DOGME_GMAIL_PASS
    }
});

let activeCodes = {}; 
let lastSendAt = {};

async function parseBody(req) {
    if (req.body) return req.body;
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    try {
        const raw = Buffer.concat(chunks).toString() || '{}';
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

export default async function handler(req, res) {
    // 1. 跨域与预检请求处理
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 2. 路径解析修复
    const url = req.url.split('?')[0];
    const body = await parseBody(req);

    // --- 接口：发送美化验证码邮件 ---
    if (url.includes('send-code')) {
        const { email } = body || {};
        if (!email) return res.status(400).json({ success: false, msg: '邮箱缺失' });
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailOk) return res.status(400).json({ success: false, msg: '邮箱格式不正确' });
        const now = Date.now();
        const last = lastSendAt[email] || 0;
        if (now - last < 60 * 1000) {
            return res.status(429).json({ success: false, msg: '请稍后再试' });
        }
        lastSendAt[email] = now;

        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        activeCodes[email] = {
            code: generatedCode,
            expires: Date.now() + 5 * 60 * 1000 
        };

        const htmlTpl = `
                <div style="background-color: #fdfcf9; padding: 40px 20px; font-family: 'Quicksand', sans-serif; text-align: center;">
                    <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 40px; padding: 40px; border: 1px solid #f1f1f1; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                        <div style="font-size: 50px; margin-bottom: 10px;">🐾</div>
                        <h1 style="color: #1a1a1a; font-size: 28px; margin: 0; font-weight: 900;">Dogme.</h1>
                        <p style="color: #a0a0a0; font-size: 14px; font-weight: bold; margin-top: 5px;">全球精选美味零食</p>
                        
                        <div style="margin: 30px 0; padding: 20px; background: #fff8f3; border-radius: 25px;">
                            <p style="color: #FF8D36; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">您的登录验证码</p>
                            <span style="font-size: 42px; font-weight: 900; color: #1a1a1a; letter-spacing: 8px;">${generatedCode}</span>
                        </div>
                        
                        <p style="color: #666; font-size: 13px; line-height: 1.6;">
                            请在 5 分钟内输入此验证码以开启您的 Dogme 之旅。<br>
                            如果这不是您本人操作，请忽略此邮件。
                        </p>
                        
                        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            <p style="color: #ccc; font-size: 10px; font-weight: bold; text-transform: uppercase;">Dogme Canada © 2026</p>
                        </div>
                    </div>
                </div>
                `;

        const providers = [];
        if (process.env.DOGME_GMAIL_USER && process.env.DOGME_GMAIL_PASS) {
            providers.push({ name: 'gmail', transporter: gmailTransporter, from: `"Dogme Security 🐾" <${process.env.DOGME_GMAIL_USER}>` });
        }
        if (process.env.SENDGRID_API_KEY) {
            const sg = nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                port: 465,
                secure: true,
                auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
            });
            providers.push({ name: 'sendgrid', transporter: sg, from: `"Dogme Security 🐾" <no-reply@dogme.shop>` });
        }
        if (providers.length === 0) {
            return res.status(500).json({ success: false, msg: '邮件服务未配置' });
        }
        let sent = false;
        let lastErr = null;
        for (const p of providers) {
            try {
                await p.transporter.verify();
                await p.transporter.sendMail({
                    from: p.from,
                    to: email,
                    subject: `${generatedCode} 是您的 Dogme 登录验证码`,
                    html: htmlTpl
                });
                sent = true;
                break;
            } catch (e) {
                lastErr = e;
            }
        }
        if (sent) return res.status(200).json({ success: true });
        const code = (lastErr && (lastErr.code || lastErr.responseCode)) || 'UNKNOWN';
        if (code === 'EAUTH' || code === 535) return res.status(500).json({ success: false, msg: '邮件认证失败' });
        if (code === 'ETIMEDOUT' || code === 'ENOTFOUND') return res.status(500).json({ success: false, msg: '邮件服务网络异常' });
        return res.status(500).json({ success: false, msg: '邮件发送失败' });
    }

    // --- 接口：验证码校验 ---
    if (url.includes('verify-code')) {
        const { email, code } = body || {};
        const record = activeCodes[email];
        if (record && record.code === String(code) && Date.now() < record.expires) {
            delete activeCodes[email];
            return res.status(200).json({ success: true });
        }
        return res.status(401).json({ success: false, msg: '验证码无效或已过期' });
    }

    // --- 接口：SMTP 健康检查 ---
    if (url.includes('test-smtp')) {
        const results = [];
        if (process.env.DOGME_GMAIL_USER && process.env.DOGME_GMAIL_PASS) {
            try {
                await gmailTransporter.verify();
                results.push({ provider: 'gmail', ok: true });
            } catch {
                results.push({ provider: 'gmail', ok: false });
            }
        } else {
            results.push({ provider: 'gmail', ok: false });
        }
        if (process.env.SENDGRID_API_KEY) {
            const sg = nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                port: 465,
                secure: true,
                auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
            });
            try {
                await sg.verify();
                results.push({ provider: 'sendgrid', ok: true });
            } catch {
                results.push({ provider: 'sendgrid', ok: false });
            }
        } else {
            results.push({ provider: 'sendgrid', ok: false });
        }
        const anyOk = results.some(r => r.ok);
        return res.status(anyOk ? 200 : 500).json({ success: anyOk, results });
    }

    // --- 接口：创建 Stripe Checkout 会话 ---
    if (url.includes('create-checkout-session')) {
        const { amount, email } = body;
        if (!amount) return res.status(400).json({ msg: '金额无效' });

        try {
            // 需要在 Stripe Dashboard 开启 Alipay 和 WeChat Pay
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card', 'alipay', 'wechat_pay'],
                line_items: [{
                    price_data: {
                        currency: 'cad', // 或 cny，取决于你的业务
                        product_data: {
                            name: 'Dogme 零食订单',
                            images: ['https://dogme.vercel.app/logo.png'], // 替换为真实 Logo URL
                        },
                        unit_amount: Math.round(amount * 100), // Stripe 单位为分
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                customer_email: email,
                success_url: `${req.headers.origin || 'https://dogme.vercel.app'}/pay.html?status=success&amount=${amount}`,
                cancel_url: `${req.headers.origin || 'https://dogme.vercel.app'}/pay.html?status=cancel`,
            });
            return res.status(200).json({ url: session.url });
        } catch (e) {
            console.error('Stripe Error:', e);
            return res.status(500).json({ msg: e.message });
        }
    }

    return res.status(404).json({ msg: "Endpoint not found" });
}
