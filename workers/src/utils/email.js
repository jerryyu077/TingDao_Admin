/**
 * 邮件发送工具
 * 使用 MailChannels API (Cloudflare Workers 原生支持)
 */

/**
 * 发送邮件
 * @param {Object} options - 邮件选项
 * @param {string} options.to - 收件人邮箱
 * @param {string} options.subject - 邮件主题
 * @param {string} options.html - 邮件 HTML 内容
 * @param {string} options.text - 邮件纯文本内容
 * @returns {Promise<boolean>} - 是否发送成功
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
          },
        ],
        from: {
          email: 'support@tingdao.app',
          name: '听道 TingDao',
        },
        subject: subject,
        content: [
          {
            type: 'text/html',
            value: html,
          },
          {
            type: 'text/plain',
            value: text || html.replace(/<[^>]*>/g, ''),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 邮件发送失败:', errorText);
      return false;
    }

    console.log('✅ 邮件发送成功:', to);
    return true;
  } catch (error) {
    console.error('❌ 邮件发送错误:', error);
    return false;
  }
}

/**
 * 生成密码重置 Token
 * @param {string} email - 用户邮箱
 * @returns {string} - 重置 Token
 */
export function generateResetToken(email) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const token = btoa(`${email}:${timestamp}:${random}`);
  return token;
}

/**
 * 验证密码重置 Token
 * @param {string} token - 重置 Token
 * @param {number} expiryHours - Token 有效期（小时），默认 24 小时
 * @returns {Object|null} - 解析后的 Token 数据或 null
 */
export function verifyResetToken(token, expiryHours = 24) {
  try {
    const decoded = atob(token);
    const [email, timestamp] = decoded.split(':');
    
    const now = Date.now();
    const tokenAge = now - parseInt(timestamp);
    const maxAge = expiryHours * 60 * 60 * 1000;
    
    if (tokenAge > maxAge) {
      console.log('⚠️ Token 已过期');
      return null;
    }
    
    return { email, timestamp };
  } catch (error) {
    console.error('❌ Token 验证失败:', error);
    return null;
  }
}

/**
 * 发送密码重置邮件
 * @param {string} to - 收件人邮箱
 * @param {string} resetToken - 重置 Token
 * @param {string} baseUrl - 网站基础 URL
 * @returns {Promise<boolean>} - 是否发送成功
 */
export async function sendPasswordResetEmail(to, resetToken, baseUrl = 'https://tingdao.app') {
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>重置密码 - 听道</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #1E3A8A 0%, #312E81 100%);
          color: #ffffff;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .content p {
          margin: 0 0 20px;
          font-size: 16px;
          color: #555;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background-color: #1E3A8A;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #1E40AF;
        }
        .info-box {
          background-color: #f8f9fa;
          border-left: 4px solid #1E3A8A;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .info-box p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        .footer a {
          color: #1E3A8A;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🙏 听道 TingDao</h1>
        </div>
        <div class="content">
          <p>您好，</p>
          <p>我们收到了您重置密码的请求。点击下方按钮即可重置您的密码：</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">重置我的密码</a>
          </div>
          
          <div class="info-box">
            <p><strong>⏰ 重要提示：</strong></p>
            <p>• 此链接将在 24 小时后失效</p>
            <p>• 如果您没有请求重置密码，请忽略此邮件</p>
            <p>• 为了账户安全，请勿将此链接分享给他人</p>
          </div>
          
          <p style="margin-top: 30px;">如果按钮无法点击，请复制以下链接到浏览器打开：</p>
          <p style="word-break: break-all; color: #1E3A8A; font-size: 14px;">${resetLink}</p>
          
          <p style="margin-top: 30px; color: #999; font-size: 14px;">
            如有任何问题，请联系我们：<a href="mailto:support@tingdao.app" style="color: #1E3A8A;">support@tingdao.app</a>
          </p>
        </div>
        <div class="footer">
          <p>此邮件由系统自动发送，请勿直接回复</p>
          <p>© 2025 听道 TingDao. All rights reserved.</p>
          <p><a href="${baseUrl}">访问听道官网</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
您好，

我们收到了您重置密码的请求。请访问以下链接重置您的密码：

${resetLink}

重要提示：
• 此链接将在 24 小时后失效
• 如果您没有请求重置密码，请忽略此邮件
• 为了账户安全，请勿将此链接分享给他人

如有任何问题，请联系我们：support@tingdao.app

此邮件由系统自动发送，请勿直接回复。

© 2025 听道 TingDao
  `;
  
  return await sendEmail({
    to,
    subject: '重置您的听道账户密码',
    html,
    text,
  });
}

/**
 * 发送欢迎邮件
 * @param {string} to - 收件人邮箱
 * @param {string} username - 用户名
 * @returns {Promise<boolean>} - 是否发送成功
 */
export async function sendWelcomeEmail(to, username) {
  const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>欢迎加入听道</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #1E3A8A 0%, #312E81 100%);
          color: #ffffff;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 10px;
          font-size: 32px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .content p {
          margin: 0 0 20px;
          font-size: 16px;
          color: #555;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 欢迎加入听道！</h1>
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">Welcome to TingDao</p>
        </div>
        <div class="content">
          <p>亲爱的 ${username || '用户'}，</p>
          <p>感谢您注册听道账户！我们很高兴您加入我们的大家庭。</p>
          <p>在听道，您可以：</p>
          <ul style="color: #555; line-height: 1.8;">
            <li>📖 收听海量优质讲道内容</li>
            <li>❤️ 收藏喜爱的讲道和讲员</li>
            <li>📊 记录您的收听历史和进度</li>
            <li>🔍 发现更多符合您需求的讲道</li>
          </ul>
          <p>愿神的话语在您生命中带来祝福和成长！</p>
          <p style="margin-top: 30px; color: #999; font-size: 14px;">
            如有任何问题或建议，请随时联系我们：<a href="mailto:support@tingdao.app" style="color: #1E3A8A;">support@tingdao.app</a>
          </p>
        </div>
        <div class="footer">
          <p>© 2025 听道 TingDao. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
亲爱的 ${username || '用户'}，

感谢您注册听道账户！我们很高兴您加入我们的大家庭。

在听道，您可以：
• 收听海量优质讲道内容
• 收藏喜爱的讲道和讲员
• 记录您的收听历史和进度
• 发现更多符合您需求的讲道

愿神的话语在您生命中带来祝福和成长！

如有任何问题或建议，请随时联系我们：support@tingdao.app

© 2025 听道 TingDao
  `;
  
  return await sendEmail({
    to,
    subject: '🎉 欢迎加入听道 - Welcome to TingDao',
    html,
    text,
  });
}

