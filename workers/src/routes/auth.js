/**
 * 用户认证 API
 */

/**
 * 密码加密（简化版）
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 验证密码
 */
async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * 生成 JWT Token（简化版）
 */
function generateToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7天过期
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(tokenPayload));
  const signature = btoa(`${encodedHeader}.${encodedPayload}.secret`);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * 验证 Token
 */
function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp < now) return null;
    
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * 从请求头获取用户 ID
 */
export function getUserIdFromRequest(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  return payload ? payload.userId : null;
}

/**
 * 生成唯一 ID
 */
function generateId(prefix) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}${random}`;
}

/**
 * 生成6位验证码
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 验证密码强度
 */
function validatePasswordStrength(password) {
  if (password.length < 8) {
    return { valid: false, message: '密码至少需要8位字符' };
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return { valid: false, message: '密码必须包含大小写字母和数字' };
  }
  
  return { valid: true };
}

/**
 * POST /api/v1/auth/send-verification-code - 发送验证码
 */
export async function sendVerificationCode(request, env) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return Response.json({ success: false, error: { message: '邮箱为必填项' } }, { status: 400 });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ success: false, error: { message: '邮箱格式不正确' } }, { status: 400 });
    }
    
    // 检查是否在60秒内已发送过验证码
    const existingCode = await env.VERIFICATION_CODES.get(email, { type: 'json' });
    if (existingCode) {
      const now = Date.now();
      const timeSinceLastSend = now - existingCode.timestamp;
      if (timeSinceLastSend < 60000) { // 60秒
        const remainingSeconds = Math.ceil((60000 - timeSinceLastSend) / 1000);
        return Response.json({ 
          success: false, 
          error: { message: `请等待${remainingSeconds}秒后再试` } 
        }, { status: 429 });
      }
    }
    
    // 生成验证码
    const code = generateVerificationCode();
    const timestamp = Date.now();
    
    // 存储验证码到 KV，有效期10分钟
    await env.VERIFICATION_CODES.put(email, JSON.stringify({ code, timestamp }), {
      expirationTtl: 600 // 10分钟
    });
    
    // 发送邮件（使用 MailChannels）
    try {
      const emailContent = {
        personalizations: [{
          to: [{ email }]
        }],
        from: {
          email: 'support@tingdao.app',
          name: '听道'
        },
        subject: '【听道】邮箱验证码',
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">【听道】邮箱验证码</h2>
              <p>您的验证码是：</p>
              <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${code}</h1>
              <p style="color: #666;">验证码有效期为 10 分钟，请勿泄露给他人。</p>
              <p style="color: #999; font-size: 14px;">如果这不是您的操作，请忽略此邮件。</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">听道团队</p>
            </div>
          `
        }]
      };
      
      console.log('📤 准备发送验证码邮件到:', email);
      console.log('📧 邮件内容:', JSON.stringify(emailContent, null, 2));
      
      const mailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailContent)
      });
      
      const responseText = await mailResponse.text();
      console.log('📬 MailChannels 响应状态:', mailResponse.status);
      console.log('📬 MailChannels 响应内容:', responseText);
      
      if (!mailResponse.ok) {
        console.error('❌ MailChannels 错误:', responseText);
        throw new Error('邮件发送失败');
      }
      
      console.log('✅ 验证码邮件已成功发送到:', email);
      
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // 即使邮件发送失败，也返回成功（为了安全，不暴露邮件发送失败）
    }
    
    return Response.json({ 
      success: true, 
      data: { message: '验证码已发送' } 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Send verification code error:', error);
    return Response.json({ success: false, error: { message: '发送失败' } }, { status: 500 });
  }
}

/**
 * POST /api/v1/auth/register - 用户注册
 */
export async function register(request, env) {
  try {
    const body = await request.json();
    const { email, password, username, verification_code } = body;
    
    if (!email || !password) {
      return Response.json({ success: false, error: { message: '邮箱和密码为必填项' } }, { status: 400 });
    }
    
    if (!verification_code) {
      return Response.json({ success: false, error: { message: '验证码为必填项' } }, { status: 400 });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ success: false, error: { message: '邮箱格式不正确' } }, { status: 400 });
    }
    
    // 验证密码强度
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return Response.json({ success: false, error: { message: passwordValidation.message } }, { status: 400 });
    }
    
    // 验证验证码
    const storedCodeData = await env.VERIFICATION_CODES.get(email, { type: 'json' });
    if (!storedCodeData) {
      return Response.json({ success: false, error: { message: '验证码错误或已过期' } }, { status: 400 });
    }
    
    if (storedCodeData.code !== verification_code) {
      return Response.json({ success: false, error: { message: '验证码错误' } }, { status: 400 });
    }
    
    // 验证码正确，删除验证码
    await env.VERIFICATION_CODES.delete(email);
    
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) {
      return Response.json({ success: false, error: { message: '该邮箱已被注册' } }, { status: 409 });
    }
    
    const passwordHash = await hashPassword(password);
    const userId = generateId('user');
    const displayUsername = username || email.split('@')[0];
    
    await env.DB.prepare(`
      INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(userId, displayUsername, email, passwordHash).run();
    
    const accessToken = generateToken({ userId, email });
    const refreshToken = generateToken({ userId, type: 'refresh' });
    
    const user = await env.DB.prepare(`
      SELECT id, username, email, avatar as avatar_url, created_at, can_upload FROM users WHERE id = ?
    `).bind(userId).first();
    
    // 转换 can_upload 为布尔值
    if (user) {
      user.can_upload = Boolean(user.can_upload);
    }
    
    return Response.json({ success: true, data: { accessToken, refreshToken, user } }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return Response.json({ success: false, error: { message: '注册失败' } }, { status: 500 });
  }
}

/**
 * POST /api/v1/auth/login - 用户登录
 */
export async function login(request, env) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return Response.json({ success: false, error: { message: '邮箱和密码为必填项' } }, { status: 400 });
    }
    
    const user = await env.DB.prepare(`
      SELECT id, username, email, password_hash, avatar as avatar_url, created_at, can_upload FROM users WHERE email = ?
    `).bind(email).first();
    
    if (!user) {
      return Response.json({ success: false, error: { message: '邮箱或密码错误' } }, { status: 401 });
    }
    
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return Response.json({ success: false, error: { message: '邮箱或密码错误' } }, { status: 401 });
    }
    
    const accessToken = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateToken({ userId: user.id, type: 'refresh' });
    
    delete user.password_hash;
    
    // 转换 can_upload 为布尔值
    if (user) {
      user.can_upload = Boolean(user.can_upload);
    }
    
    return Response.json({ success: true, data: { accessToken, refreshToken, user } }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ success: false, error: { message: '登录失败' } }, { status: 500 });
  }
}

/**
 * GET /api/v1/auth/me - 获取当前用户
 */
export async function getCurrentUser(request, env) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({ success: false, error: { message: '未授权' } }, { status: 401 });
    }
    
    const user = await env.DB.prepare(`
      SELECT id, username, email, avatar as avatar_url, created_at, can_upload FROM users WHERE id = ?
    `).bind(userId).first();
    
    if (!user) {
      return Response.json({ success: false, error: { message: '用户不存在' } }, { status: 404 });
    }
    
    // 转换 can_upload 为布尔值
    user.can_upload = Boolean(user.can_upload);
    
    return Response.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error('Get user error:', error);
    return Response.json({ success: false, error: { message: '获取用户信息失败' } }, { status: 500 });
  }
}

/**
 * PUT /api/v1/auth/profile - 更新用户资料
 */
export async function updateProfile(request, env) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return Response.json({ success: false, error: { message: '未授权' } }, { status: 401 });
    }
    
    const body = await request.json();
    const { username, avatar_url } = body;
    
    await env.DB.prepare(`
      UPDATE users 
      SET username = COALESCE(?, username),
          avatar = COALESCE(?, avatar),
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(username, avatar_url, userId).run();
    
    const user = await env.DB.prepare(`
      SELECT id, username, email, avatar as avatar_url, created_at, updated_at, can_upload FROM users WHERE id = ?
    `).bind(userId).first();
    
    // 转换 can_upload 为布尔值
    if (user) {
      user.can_upload = Boolean(user.can_upload);
    }
    
    return Response.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error('Update profile error:', error);
    return Response.json({ success: false, error: { message: '更新资料失败' } }, { status: 500 });
  }
}

