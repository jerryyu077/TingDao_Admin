/**
 * 文件上传 API 路由
 */
import { success, error } from '../utils/response.js';
import { getUserIdFromRequest } from './auth.js';

/**
 * POST /v1/upload/image - 上传图片
 */
export async function uploadImage(request, env) {
  try {
    // 验证用户登录（临时禁用 - 使用 Cloudflare Zero Trust 保护）
    // TODO: 如需重新启用认证，取消下面注释
    /*
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return error('未授权', 'UNAUTHORIZED', 401);
    }
    */

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'cover'; // cover, avatar, etc.

    if (!file) {
      return error('缺少文件', 'BAD_REQUEST', 400);
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return error('不支持的文件类型，仅支持 JPEG, PNG, WebP', 'BAD_REQUEST', 400);
    }

    // 验证文件大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return error('文件过大，最大支持 5MB', 'BAD_REQUEST', 400);
    }

    // 生成文件名
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${type}s/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    // 上传到 R2
    const arrayBuffer = await file.arrayBuffer();
    await env.STORAGE.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // 返回公开URL
    const url = `https://media.tingdao.app/${filename}`;

    return success({
      url,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (e) {
    console.error('Upload image error:', e);
    return error('上传失败: ' + e.message);
  }
}

/**
 * POST /v1/upload/audio - 上传音频
 */
export async function uploadAudio(request, env) {
  try {
    // 验证用户登录（临时禁用 - 使用 Cloudflare Zero Trust 保护）
    // TODO: 如需重新启用认证，取消下面注释
    /*
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return error('未授权', 'UNAUTHORIZED', 401);
    }
    */

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return error('缺少文件', 'BAD_REQUEST', 400);
    }

    // 验证文件类型
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'audio/wav'];
    if (!allowedTypes.includes(file.type)) {
      return error('不支持的文件类型，仅支持 MP3, M4A, WAV', 'BAD_REQUEST', 400);
    }

    // 验证文件大小（最大 100MB）
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return error('文件过大，最大支持 100MB', 'BAD_REQUEST', 400);
    }

    // 生成文件名
    const ext = file.name.split('.').pop() || 'mp3';
    const filename = `audio/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    // 上传到 R2
    const arrayBuffer = await file.arrayBuffer();
    await env.STORAGE.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // 返回公开URL
    const url = `https://media.tingdao.app/${filename}`;

    return success({
      url,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (e) {
    console.error('Upload audio error:', e);
    return error('上传失败: ' + e.message);
  }
}
