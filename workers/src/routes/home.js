/**
 * 首页配置 API 路由
 */
import { success, error } from '../utils/response.js';
import { queryOne, execute, parseJsonFields } from '../utils/db.js';

// GET /v1/home/config - 获取首页配置
export async function getHomeConfig(request, env) {
  try {
    const sql = 'SELECT * FROM home_config WHERE id = ?';
    let config = await queryOne(env.DB, sql, ['default']);
    
    if (!config) {
      // 如果没有配置，返回默认配置
      return success({
        id: 'default',
        banner_scripture: null,
        featured_sermons: [],
        topic_sermons: [],
        featured_speakers: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // 解析JSON字段
    config = parseJsonFields(config, ['banner_scripture', 'featured_sermons', 'topic_sermons', 'featured_speakers']);

    return success(config);
  } catch (e) {
    console.error('Error fetching home config:', e);
    return error('获取首页配置失败: ' + e.message);
  }
}

// PUT /v1/home/config - 更新首页配置
export async function updateHomeConfig(request, env) {
  try {
    const data = await request.json();
    
    // 检查是否已存在
    const existing = await queryOne(env.DB, 'SELECT id FROM home_config WHERE id = ?', ['default']);
    
    const now = new Date().toISOString();
    
    if (existing) {
      // 更新
      const sql = `
        UPDATE home_config SET
          banner_scripture = ?,
          featured_sermons = ?,
          topic_sermons = ?,
          featured_speakers = ?,
          updated_at = ?
        WHERE id = ?
      `;
      
      await execute(env.DB, sql, [
        data.banner_scripture ? JSON.stringify(data.banner_scripture) : null,
        data.featured_sermons ? JSON.stringify(data.featured_sermons) : null,
        data.topic_sermons ? JSON.stringify(data.topic_sermons) : null,
        data.featured_speakers ? JSON.stringify(data.featured_speakers) : null,
        now,
        'default'
      ]);
    } else {
      // 插入
      const sql = `
        INSERT INTO home_config (
          id, banner_scripture, featured_sermons, topic_sermons, featured_speakers, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      await execute(env.DB, sql, [
        'default',
        data.banner_scripture ? JSON.stringify(data.banner_scripture) : null,
        data.featured_sermons ? JSON.stringify(data.featured_sermons) : null,
        data.topic_sermons ? JSON.stringify(data.topic_sermons) : null,
        data.featured_speakers ? JSON.stringify(data.featured_speakers) : null,
        now,
        now
      ]);
    }

    return success({ id: 'default' }, { message: '首页配置更新成功' });
  } catch (e) {
    console.error('Error updating home config:', e);
    return error('更新首页配置失败: ' + e.message);
  }
}

// GET /v1/curation/home-config - 兼容旧API
export async function getCurationHomeConfig(request, env) {
  return getHomeConfig(request, env);
}

// GET /v1/launch-screen - 获取启动页配置
export async function getLaunchScreen(request, env) {
  try {
    const sql = 'SELECT * FROM launch_screen WHERE id = ?';
    let config = await queryOne(env.DB, sql, ['default']);
    
    if (!config) {
      return success({
        id: 'default',
        image_url: null,
        scripture_text: null,
        scripture_reference: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return success(config);
  } catch (e) {
    console.error('Error fetching launch screen:', e);
    return error('获取启动页配置失败: ' + e.message);
  }
}

// PUT /v1/launch-screen - 更新启动页配置
export async function updateLaunchScreen(request, env) {
  try {
    const data = await request.json();
    
    const existing = await queryOne(env.DB, 'SELECT id FROM launch_screen WHERE id = ?', ['default']);
    
    const now = new Date().toISOString();
    
    if (existing) {
      const sql = `
        UPDATE launch_screen SET
          image_url = ?,
          scripture_text = ?,
          scripture_reference = ?,
          updated_at = ?
        WHERE id = ?
      `;
      
      await execute(env.DB, sql, [
        data.image_url,
        data.scripture_text,
        data.scripture_reference,
        now,
        'default'
      ]);
    } else {
      const sql = `
        INSERT INTO launch_screen (
          id, image_url, scripture_text, scripture_reference, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      await execute(env.DB, sql, [
        'default',
        data.image_url,
        data.scripture_text,
        data.scripture_reference,
        now,
        now
      ]);
    }

    return success({ id: 'default' }, { message: '启动页配置更新成功' });
  } catch (e) {
    console.error('Error updating launch screen:', e);
    return error('更新启动页配置失败: ' + e.message);
  }
}

