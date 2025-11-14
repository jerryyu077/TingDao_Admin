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

// GET /v1/curation/home-config - 兼容旧API（返回格式适配前端）
export async function getCurationHomeConfig(request, env) {
  try {
    const sql = 'SELECT * FROM home_config WHERE id = ?';
    let config = await queryOne(env.DB, sql, [1]);
    
    if (!config) {
      return success({
        id: 'home-config',
        page: 'home',
        config: {
          scriptures: [],
          recommendedSermons: [],
          moreRecommendedSermons: [],
          featuredTopics: [],
          browseTopics: [],
          popularSpeakers: [],
          moreSpeakers: []
        }
      });
    }

    // 解析JSON字段
    const scriptures = config.scriptures ? JSON.parse(config.scriptures) : [];
    const recommendedSermons = config.recommended_sermons ? JSON.parse(config.recommended_sermons) : [];
    const featuredTopics = config.featured_topics ? JSON.parse(config.featured_topics) : [];
    const featuredSpeakers = config.featured_speakers ? JSON.parse(config.featured_speakers) : [];

    return success({
      id: 'home-config',
      page: 'home',
      config: {
        scriptures: scriptures,
        recommendedSermons: recommendedSermons,
        moreRecommendedSermons: recommendedSermons, // 暂时用同一个数据
        featuredTopics: featuredTopics,
        browseTopics: featuredTopics, // 暂时用同一个数据
        popularSpeakers: featuredSpeakers,
        moreSpeakers: featuredSpeakers // 暂时用同一个数据
      }
    });
  } catch (e) {
    console.error('Error fetching home config:', e);
    return error('获取首页配置失败: ' + e.message);
  }
}

// PATCH /v1/curation/home-config - 更新首页配置（适配前端格式）
export async function updateCurationHomeConfig(request, env) {
  try {
    const data = await request.json();
    const config = data.config || {};
    const now = new Date().toISOString();
    
    // 提取各个字段
    const scriptures = config.scriptures || [];
    const recommendedSermons = config.recommendedSermons || [];
    const moreRecommendedSermons = config.moreRecommendedSermons || [];
    const featuredTopics = config.featuredTopics || [];
    const browseTopics = config.browseTopics || [];
    const popularSpeakers = config.popularSpeakers || [];
    const moreSpeakers = config.moreSpeakers || [];
    
    console.log('📝 更新首页配置:', {
      scriptures: scriptures.length,
      recommendedSermons: recommendedSermons.length,
      featuredTopics: featuredTopics.length,
      popularSpeakers: popularSpeakers.length
    });
    
    const sql = `
      UPDATE home_config SET
        scriptures = ?,
        recommended_sermons = ?,
        more_recommended_sermons = ?,
        featured_topics = ?,
        browse_topics = ?,
        featured_speakers = ?,
        more_speakers = ?,
        updated_at = ?
      WHERE id = 1
    `;
    
    const result = await execute(env.DB, sql, [
      JSON.stringify(scriptures),
      JSON.stringify(recommendedSermons),
      JSON.stringify(moreRecommendedSermons),
      JSON.stringify(featuredTopics),
      JSON.stringify(browseTopics),
      JSON.stringify(popularSpeakers),
      JSON.stringify(moreSpeakers),
      now
    ]);
    
    console.log('✅ 数据库更新结果:', result);
    
    // 验证保存是否成功 - 立即读取回来
    const verifyResult = await queryOne(env.DB, 'SELECT scriptures, recommended_sermons, featured_topics, featured_speakers FROM home_config WHERE id = 1', []);
    console.log('🔍 验证保存的数据:', {
      scriptures_saved: verifyResult?.scriptures ? JSON.parse(verifyResult.scriptures).length : 0,
      sermons_saved: verifyResult?.recommended_sermons ? JSON.parse(verifyResult.recommended_sermons).length : 0
    });

    return success({ 
      id: 'home-config',
      config: config
    }, { message: '首页配置更新成功' });
  } catch (e) {
    console.error('❌ Error updating home config:', e);
    return error('更新首页配置失败: ' + e.message);
  }
}

// GET /v1/curation/discover-config - 获取发现页配置
export async function getDiscoverConfig(request, env) {
  try {
    const sql = 'SELECT discover_tags, discover_daily_sermon, discover_popular_sermons, discover_popular_speakers, discover_popular_topics FROM home_config WHERE id = ?';
    let config = await queryOne(env.DB, sql, [1]);
    
    if (!config) {
      return success({
        config: {
          filterTags: []
        }
      });
    }

    // 解析JSON字段并转换为前端期望的格式
    const filterTags = config.discover_tags ? JSON.parse(config.discover_tags) : [];
    
    return success({
      config: {
        filterTags: filterTags
      }
    });
  } catch (e) {
    console.error('Error fetching discover config:', e);
    return error('获取发现页配置失败: ' + e.message);
  }
}

// PATCH /v1/curation/discover-config - 更新发现页配置
export async function updateDiscoverConfig(request, env) {
  try {
    const data = await request.json();
    const now = new Date().toISOString();
    
    // 从配置中提取标签数据
    const filterTags = data.config?.filterTags || [];
    
    const sql = `
      UPDATE home_config SET
        discover_tags = ?,
        updated_at = ?
      WHERE id = 1
    `;
    
    await execute(env.DB, sql, [
      JSON.stringify(filterTags),
      now
    ]);

    return success({ id: 'discover-config' }, { message: '发现页配置更新成功' });
  } catch (e) {
    console.error('Error updating discover config:', e);
    return error('更新发现页配置失败: ' + e.message);
  }
}

// GET /v1/curation/launch-screen-config - 获取启动页配置（兼容API）
export async function getLaunchScreenConfig(request, env) {
  try {
    const sql = 'SELECT * FROM launch_screen WHERE id = ?';
    let config = await queryOne(env.DB, sql, ['default']);
    
    if (!config) {
      return success({
        config: {
          illustrationUrl: '',
          scripture: {
            text: '',
            reference: ''
          }
        }
      });
    }

    return success({
      config: {
        illustrationUrl: config.image_url || '',
        scripture: {
          text: config.scripture_text || '',
          reference: config.scripture_reference || ''
        }
      }
    });
  } catch (e) {
    console.error('Error fetching launch screen config:', e);
    return error('获取启动页配置失败: ' + e.message);
  }
}

// PATCH /v1/curation/launch-screen-config - 更新启动页配置
export async function updateLaunchScreenConfig(request, env) {
  try {
    const data = await request.json();
    const config = data.config || {};
    
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
        config.illustrationUrl || '',
        config.scripture?.text || '',
        config.scripture?.reference || '',
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
        config.illustrationUrl || '',
        config.scripture?.text || '',
        config.scripture?.reference || '',
        now,
        now
      ]);
    }

    return success({ id: 'launch-screen-config' }, { message: '启动页配置更新成功' });
  } catch (e) {
    console.error('Error updating launch screen config:', e);
    return error('更新启动页配置失败: ' + e.message);
  }
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

