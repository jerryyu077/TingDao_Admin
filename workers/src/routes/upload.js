/**
 * 文件上传 API 路由
 */
import { success, error } from '../utils/response.js';

// POST /v1/upload/audio - 上传音频文件
export async function uploadAudio(request, env) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return error('缺少文件', 'MISSING_FILE', 400);
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const fileName = `sermon-${timestamp}-${randomStr}.${extension}`;
    const filePath = `sermons/${fileName}`;

    // 上传到R2
    await env.STORAGE.put(filePath, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'audio/mpeg'
      }
    });

    // R2公开访问URL
    const fileUrl = `https://media.tingdao.app/${filePath}`;

    return success({
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    }, { message: '音频上传成功' });
  } catch (e) {
    console.error('Error uploading audio:', e);
    return error('上传音频失败: ' + e.message);
  }
}

// POST /v1/upload/image - 上传图片文件
export async function uploadImage(request, env) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return error('缺少文件', 'MISSING_FILE', 400);
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return error('只支持图片文件', 'INVALID_FILE_TYPE', 400);
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const fileName = `image-${timestamp}-${randomStr}.${extension}`;
    const filePath = `images/${fileName}`;

    // 上传到R2
    await env.STORAGE.put(filePath, file.stream(), {
      httpMetadata: {
        contentType: file.type
      }
    });

    const fileUrl = `https://media.tingdao.app/${filePath}`;

    return success({
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    }, { message: '图片上传成功' });
  } catch (e) {
    console.error('Error uploading image:', e);
    return error('上传图片失败: ' + e.message);
  }
}

// DELETE /v1/upload/:path - 删除文件
export async function deleteFile(request, env, filePath) {
  try {
    await env.STORAGE.delete(filePath);
    return success({ path: filePath }, { message: '文件删除成功' });
  } catch (e) {
    console.error('Error deleting file:', e);
    return error('删除文件失败: ' + e.message);
  }
}

