/**
 * 用户认证 API
 */
import { sendPasswordResetEmail, sendWelcomeEmail, generateResetToken, verifyResetToken } from '../utils/email.js';

/**
 * 密码加密（简化版）
 */
async function hashPassword(password) {
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
 * POST /api/v1/auth/register - 用户注册
 */
export async function register(request, env) {
  try {
    const body = await request.json();
    const { email, password, username } = body;
    
    if (!email || !password) {
      return Response.json({ success: false, error: { message: '邮箱和密码为必填项' } }, { status: 400 });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ success: false, error: { message: '邮箱格式不正确' } }, { status: 400 });
    }
    
    if (password.length < 6) {
      return Response.json({ success: false, error: { message: '密码长度至少为6位' } }, { status: 400 });
    }
    
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
      SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?
    `).bind(userId).first();
    
    // 发送欢迎邮件（异步，不阻塞响应）
    sendWelcomeEmail(email, displayUsername).catch(err => 
      console.error('Failed to send welcome email:', err)
    );
    
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
      SELECT id, username, email, password_hash, avatar_url, created_at FROM users WHERE email = ?
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
      SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?
    `).bind(userId).first();
    
    if (!user) {
      return Response.json({ success: false, error: { message: '用户不存在' } }, { status: 404 });
    }
    
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
          avatar_url = COALESCE(?, avatar_url),
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(username, avatar_url, userId).run();
    
    const user = await env.DB.prepare(`
      SELECT id, username, email, avatar_url, created_at, updated_at FROM users WHERE id = ?
    `).bind(userId).first();
    
    return Response.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error('Update profile error:', error);
    return Response.json({ success: false, error: { message: '更新资料失败' } }, { status: 500 });
  }
}

/**
 * POST /api/v1/auth/forgot-password - 请求重置密码
 */
export async function forgotPassword(request, env) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return Response.json({ success: false, error: { message: '邮箱为必填项' } }, { status: 400 });
    }
    
    // 检查用户是否存在
    const user = await env.DB.prepare('SELECT id, email FROM users WHERE email = ?').bind(email).first();
    
    // 即使用户不存在也返回成功，避免泄露用户信息
    if (!user) {
      console.log(`⚠️ 密码重置请求：用户 ${email} 不存在`);
      return Response.json({ 
        success: true, 
        data: { message: '如果该邮箱已注册，您将收到重置密码的邮件' } 
      }, { status: 200 });
    }
    
    // 生成重置 Token
    const resetToken = generateResetToken(email);
    
    // 保存 Token 到数据库（可选，用于额外验证）
    await env.DB.prepare(`
      INSERT OR REPLACE INTO password_reset_tokens (email, token, expires_at, created_at)
      VALUES (?, ?, datetime('now', '+24 hours'), datetime('now'))
    `).bind(email, resetToken).run();
    
    // 发送重置邮件
    const emailSent = await sendPasswordResetEmail(email, resetToken);
    
    if (!emailSent) {
      return Response.json({ 
        success: false, 
        error: { message: '邮件发送失败，请稍后重试' } 
      }, { status: 500 });
    }
    
    return Response.json({ 
      success: true, 
      data: { message: '重置密码邮件已发送，请查收' } 
    }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return Response.json({ success: false, error: { message: '请求失败' } }, { status: 500 });
  }
}

/**
 * POST /api/v1/auth/reset-password - 重置密码
 */
export async function resetPassword(request, env) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;
    
    if (!token || !newPassword) {
      return Response.json({ 
        success: false, 
        error: { message: 'Token 和新密码为必填项' } 
      }, { status: 400 });
    }
    
    if (newPassword.length < 6) {
      return Response.json({ 
        success: false, 
        error: { message: '密码长度至少为6位' } 
      }, { status: 400 });
    }
    
    // 验证 Token
    const tokenData = verifyResetToken(token);
    if (!tokenData) {
      return Response.json({ 
        success: false, 
        error: { message: 'Token 无效或已过期' } 
      }, { status: 400 });
    }
    
    const { email } = tokenData;
    
    // 验证数据库中的 Token（可选，额外安全层）
    const dbToken = await env.DB.prepare(`
      SELECT * FROM password_reset_tokens 
      WHERE email = ? AND token = ? AND expires_at > datetime('now')
    `).bind(email, token).first();
    
    if (!dbToken) {
      return Response.json({ 
        success: false, 
        error: { message: 'Token 无效或已过期' } 
      }, { status: 400 });
    }
    
    // 更新密码
    const passwordHash = await hashPassword(newPassword);
    await env.DB.prepare(`
      UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE email = ?
    `).bind(passwordHash, email).run();
    
    // 删除已使用的 Token
    await env.DB.prepare('DELETE FROM password_reset_tokens WHERE email = ?').bind(email).run();
    
    return Response.json({ 
      success: true, 
      data: { message: '密码重置成功' } 
    }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json({ success: false, error: { message: '密码重置失败' } }, { status: 500 });
  }
}

