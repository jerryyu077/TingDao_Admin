// Password Reset Routes
import { generateId } from '../utils/helpers.js';
import { hashPassword } from './auth.js';

/**
 * Generate a random reset token
 */
function generateResetToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Send password reset email
 * TODO: 配置真实的邮件服务（Resend, SendGrid, 或 Cloudflare Email Routing）
 */
async function sendResetEmail(env, email, resetToken) {
  const resetLink = `https://tingdao.app/reset-password?token=${resetToken}`;
  
  // 🚧 临时方案：在开发/测试阶段，将重置链接打印到日志
  // 生产环境需要集成真实的邮件服务
  console.log('====================================');
  console.log('📧 密码重置邮件');
  console.log('收件人:', email);
  console.log('重置链接:', resetLink);
  console.log('令牌:', resetToken);
  console.log('有效期: 1小时');
  console.log('====================================');
  
  // 如果配置了 RESEND_API_KEY，使用 Resend 发送邮件
  if (env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'support@tingdao.app',
          to: [email],
          subject: '重置您的听道账户密码',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #667eea; color: white !important; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔒 重置密码</h1>
                </div>
                <div class="content">
                  <p>您好，</p>
                  <p>我们收到了重置您听道账户密码的请求。点击下面的按钮重置密码：</p>
                  <div style="text-align: center;">
                    <a href="${resetLink}" class="button">重置密码</a>
                  </div>
                  <p>或复制以下链接到浏览器：</p>
                  <p style="background: white; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">
                    ${resetLink}
                  </p>
                  <div class="warning">
                    <strong>⚠️ 安全提示：</strong>
                    <ul style="margin: 5px 0;">
                      <li>此链接将在 <strong>1小时</strong> 后失效</li>
                      <li>如果您没有请求重置密码，请忽略此邮件</li>
                      <li>不要将此链接分享给任何人</li>
                    </ul>
                  </div>
                  <p>如有任何问题，请联系我们的客服团队。</p>
                  <p>听道团队<br>support@tingdao.app</p>
                </div>
                <div class="footer">
                  <p>© 2025 听道 TingDao. 保留所有权利。</p>
                </div>
              </div>
            </body>
            </html>
          `
        }),
      });

      if (response.ok) {
        console.log('✅ Password reset email sent via Resend');
        return true;
      } else {
        const errorText = await response.text();
        console.error('Resend API error:', response.status, errorText);
      }
    } catch (error) {
      console.error('Resend send error:', error);
    }
  }
  
  // 无论邮件是否发送成功，都返回 true 以防止邮箱枚举攻击
  return true;
}

/**
 * Request password reset
 * POST /api/v1/auth/forgot-password
 */
export async function requestPasswordReset(request, env) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return Response.json({ success: false, error: { message: '邮箱为必填项' } }, { status: 400 });
    }
    
    // Check if user exists
    const user = await env.DB.prepare(`
      SELECT id, email FROM users WHERE email = ?
    `).bind(email).first();
    
    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return Response.json({ 
        success: true, 
        message: '如果该邮箱已注册，您将收到重置密码的邮件' 
      }, { status: 200 });
    }
    
    // Generate reset token
    const resetToken = generateResetToken();
    const tokenId = generateId('rst');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    
    // Save token to database
    await env.DB.prepare(`
      INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).bind(tokenId, user.id, resetToken, expiresAt).run();
    
    // Send reset email
    await sendResetEmail(env, email, resetToken);
    
    return Response.json({ 
      success: true, 
      message: '如果该邮箱已注册，您将收到重置密码的邮件' 
    }, { status: 200 });
  } catch (error) {
    console.error('Request password reset error:', error);
    return Response.json({ 
      success: false, 
      error: { message: '发送重置邮件失败，请稍后重试' } 
    }, { status: 500 });
  }
}

/**
 * Verify reset token
 * GET /api/v1/auth/verify-reset-token?token=xxx
 */
export async function verifyResetToken(request, env) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return Response.json({ success: false, error: { message: '缺少重置令牌' } }, { status: 400 });
    }
    
    // Check if token exists and is valid
    const resetToken = await env.DB.prepare(`
      SELECT id, user_id, expires_at, used 
      FROM password_reset_tokens 
      WHERE token = ?
    `).bind(token).first();
    
    if (!resetToken) {
      return Response.json({ success: false, error: { message: '无效的重置链接' } }, { status: 400 });
    }
    
    if (resetToken.used === 1) {
      return Response.json({ success: false, error: { message: '该重置链接已被使用' } }, { status: 400 });
    }
    
    if (new Date(resetToken.expires_at) < new Date()) {
      return Response.json({ success: false, error: { message: '重置链接已过期' } }, { status: 400 });
    }
    
    return Response.json({ success: true, data: { valid: true } }, { status: 200 });
  } catch (error) {
    console.error('Verify reset token error:', error);
    return Response.json({ success: false, error: { message: '验证失败' } }, { status: 500 });
  }
}

/**
 * Reset password
 * POST /api/v1/auth/reset-password
 */
export async function resetPassword(request, env) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;
    
    if (!token || !newPassword) {
      return Response.json({ success: false, error: { message: '令牌和新密码为必填项' } }, { status: 400 });
    }
    
    if (newPassword.length < 6) {
      return Response.json({ success: false, error: { message: '密码长度至少为6位' } }, { status: 400 });
    }
    
    // Check if token exists and is valid
    const resetToken = await env.DB.prepare(`
      SELECT id, user_id, expires_at, used 
      FROM password_reset_tokens 
      WHERE token = ?
    `).bind(token).first();
    
    if (!resetToken) {
      return Response.json({ success: false, error: { message: '无效的重置链接' } }, { status: 400 });
    }
    
    if (resetToken.used === 1) {
      return Response.json({ success: false, error: { message: '该重置链接已被使用' } }, { status: 400 });
    }
    
    if (new Date(resetToken.expires_at) < new Date()) {
      return Response.json({ success: false, error: { message: '重置链接已过期' } }, { status: 400 });
    }
    
    // Hash new password
    const passwordHash = await hashPassword(newPassword);
    
    // Update user password
    await env.DB.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(passwordHash, resetToken.user_id).run();
    
    // Mark token as used
    await env.DB.prepare(`
      UPDATE password_reset_tokens 
      SET used = 1 
      WHERE id = ?
    `).bind(resetToken.id).run();
    
    return Response.json({ 
      success: true, 
      message: '密码重置成功，请使用新密码登录' 
    }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json({ 
      success: false, 
      error: { message: '密码重置失败，请重试' } 
    }, { status: 500 });
  }
}

