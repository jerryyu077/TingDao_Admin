#!/usr/bin/env node

/**
 * 听道APP - seed.json 转 SQL 数据导入脚本
 * 
 * 用途：将seed.json中的数据转换为SQL INSERT语句
 * 输出：data.sql文件，可直接导入D1数据库
 * 
 * 运行方法：
 *   node convert-seed-to-sql.js
 */

const fs = require('fs');
const path = require('path');

// 读取seed.json (在项目根目录)
// admin 文件夹已移出 iOS 项目，seed.json 在 TingDao/Tingdao1020/ 中
const seedPath = path.join(__dirname, '../../Tingdao1020/seed.json');
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log('📖 读取seed.json...');
console.log(`  - Speakers: ${seed.speakers?.length || 0}条`);
console.log(`  - Users: ${seed.users?.length || 0}条`);
console.log(`  - Sermons: ${seed.sermons?.length || 0}条`);
console.log(`  - Topics: ${seed.topics?.length || 0}条`);

// SQL转义函数
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number') return str;
  if (typeof str === 'boolean') return str ? 1 : 0;
  if (typeof str === 'object') return `'${JSON.stringify(str).replace(/'/g, "''")}'`;
  return `'${String(str).replace(/'/g, "''")}'`;
}

// 生成SQL文件
let sql = `-- =====================================================
-- 听道APP - 数据导入SQL
-- 生成时间: ${new Date().toISOString()}
-- =====================================================

-- 禁用外键约束（导入时）
PRAGMA foreign_keys = OFF;

-- 清空现有数据（可选，如需重新导入）
-- DELETE FROM play_history;
-- DELETE FROM user_favorites;
-- DELETE FROM sermon_topics;
-- DELETE FROM sermons;
-- DELETE FROM series;
-- DELETE FROM topics;
-- DELETE FROM speakers;
-- DELETE FROM users;

`;

// =====================================================
// 1. 导入Speakers
// =====================================================
sql += `\n-- =====================================================\n`;
sql += `-- 1. 导入Speakers (${seed.speakers?.length || 0}条)\n`;
sql += `-- =====================================================\n\n`;

if (seed.speakers && seed.speakers.length > 0) {
  seed.speakers.forEach(speaker => {
    const social_media = speaker.social_media ? JSON.stringify(speaker.social_media) : null;
    sql += `INSERT INTO speakers (id, name, name_en, title, avatar_url, bio, bio_long, church, email, website, social_media, sermon_count, follower_count, total_play_count, status, is_verified, created_at, updated_at)
VALUES (
  ${escapeSql(speaker.id)},
  ${escapeSql(speaker.name)},
  ${escapeSql(speaker.name_en)},
  ${escapeSql(speaker.title)},
  ${escapeSql(speaker.avatar_url)},
  ${escapeSql(speaker.bio)},
  ${escapeSql(speaker.bio_long)},
  ${escapeSql(speaker.church)},
  ${escapeSql(speaker.email)},
  ${escapeSql(speaker.website)},
  ${escapeSql(social_media)},
  ${escapeSql(speaker.sermon_count || 0)},
  ${escapeSql(speaker.follower_count || 0)},
  ${escapeSql(speaker.total_play_count || 0)},
  ${escapeSql(speaker.status || 'active')},
  ${escapeSql(speaker.is_verified ? 1 : 0)},
  ${escapeSql(speaker.created_at || new Date().toISOString())},
  ${escapeSql(speaker.updated_at || new Date().toISOString())}
);\n`;
  });
}

// =====================================================
// 2. 导入Users
// =====================================================
sql += `\n-- =====================================================\n`;
sql += `-- 2. 导入Users (${seed.users?.length || 0}条)\n`;
sql += `-- =====================================================\n\n`;

if (seed.users && seed.users.length > 0) {
  seed.users.forEach(user => {
    sql += `INSERT INTO users (id, username, name, email, avatar, phone, church, location, bio, sermon_upload_count, status, last_login_at, created_at, updated_at)
VALUES (
  ${escapeSql(user.id)},
  ${escapeSql(user.username)},
  ${escapeSql(user.name)},
  ${escapeSql(user.email)},
  ${escapeSql(user.avatar)},
  ${escapeSql(user.phone)},
  ${escapeSql(user.church)},
  ${escapeSql(user.location)},
  ${escapeSql(user.bio)},
  ${escapeSql(user.sermon_upload_count || 0)},
  ${escapeSql(user.status || 'active')},
  ${escapeSql(user.last_login_at)},
  ${escapeSql(user.created_at || new Date().toISOString())},
  ${escapeSql(user.updated_at || new Date().toISOString())}
);\n`;
  });
}

// =====================================================
// 3. 导入Series (如果存在)
// =====================================================
sql += `\n-- =====================================================\n`;
sql += `-- 3. 导入Series\n`;
sql += `-- =====================================================\n\n`;

if (seed.series && seed.series.length > 0) {
  seed.series.forEach(series => {
    sql += `INSERT INTO series (id, title, description, cover_image_url, sermon_count, start_date, end_date, status, created_at, updated_at)
VALUES (
  ${escapeSql(series.id)},
  ${escapeSql(series.title)},
  ${escapeSql(series.description)},
  ${escapeSql(series.cover_image_url)},
  ${escapeSql(series.sermon_count || 0)},
  ${escapeSql(series.start_date)},
  ${escapeSql(series.end_date)},
  ${escapeSql(series.status || 'active')},
  ${escapeSql(series.created_at || new Date().toISOString())},
  ${escapeSql(series.updated_at || new Date().toISOString())}
);\n`;
  });
}

// =====================================================
// 4. 导入Topics
// =====================================================
sql += `\n-- =====================================================\n`;
sql += `-- 4. 导入Topics (${seed.topics?.length || 0}条)\n`;
sql += `-- =====================================================\n\n`;

if (seed.topics && seed.topics.length > 0) {
  seed.topics.forEach((topic, index) => {
    sql += `INSERT INTO topics (id, name, description, cover_image_url, icon, gradient, sermon_count, status, is_system, display_order, created_at, updated_at)
VALUES (
  ${escapeSql(topic.id)},
  ${escapeSql(topic.name)},
  ${escapeSql(topic.description)},
  ${escapeSql(topic.cover_image_url)},
  ${escapeSql(topic.icon)},
  ${escapeSql(topic.gradient)},
  ${escapeSql(topic.sermon_count || 0)},
  ${escapeSql(topic.status || 'active')},
  ${escapeSql(topic.is_system ? 1 : 0)},
  ${escapeSql(topic.display_order || index)},
  ${escapeSql(topic.created_at || new Date().toISOString())},
  ${escapeSql(topic.updated_at || new Date().toISOString())}
);\n`;
  });
}

// =====================================================
// 5. 导入Sermons
// =====================================================
sql += `\n-- =====================================================\n`;
sql += `-- 5. 导入Sermons (${seed.sermons?.length || 0}条)\n`;
sql += `-- =====================================================\n\n`;

const sermonTopicRelations = []; // 用于存储sermon-topic关联

if (seed.sermons && seed.sermons.length > 0) {
  seed.sermons.forEach(sermon => {
    const tags = sermon.tags ? JSON.stringify(sermon.tags) : null;
    const metadata = sermon.metadata ? JSON.stringify(sermon.metadata) : null;
    
    // 跳过base64图片，用placeholder代替，后续通过API更新
    let cover_image_url = sermon.cover_image_url;
    if (cover_image_url && cover_image_url.startsWith('data:image')) {
      cover_image_url = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb';  // 临时占位图
      console.log(`⚠️  Sermon ${sermon.id}: base64图片已跳过，使用占位图`);
    }
    
    sql += `INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  ${escapeSql(sermon.id)},
  ${escapeSql(sermon.title)},
  ${escapeSql(sermon.speaker_id)},
  ${escapeSql(cover_image_url)},
  ${escapeSql(sermon.audio_url)},
  ${escapeSql(sermon.audio_size || 0)},
  ${escapeSql(sermon.audio_format || 'mp3')},
  ${escapeSql(sermon.duration || 0)},
  ${escapeSql(sermon.scripture)},
  ${escapeSql(sermon.summary)},
  ${escapeSql(sermon.description)},
  ${escapeSql(tags)},
  ${escapeSql(sermon.series_id)},
  ${escapeSql(sermon.series_order)},
  ${escapeSql(sermon.language || 'zh-CN')},
  ${escapeSql(sermon.date)},
  ${escapeSql(sermon.publish_date)},
  ${escapeSql(sermon.play_count || 0)},
  ${escapeSql(sermon.favorite_count || 0)},
  ${escapeSql(sermon.download_count || 0)},
  ${escapeSql(sermon.status || 'pending')},
  ${escapeSql(sermon.is_featured ? 1 : 0)},
  ${escapeSql(sermon.submitter?.id || null)},
  ${escapeSql(metadata)},
  ${escapeSql(sermon.created_at || new Date().toISOString())},
  ${escapeSql(sermon.updated_at || new Date().toISOString())}
);\n`;

    // 记录sermon-topic关联
    if (sermon.topic_ids && Array.isArray(sermon.topic_ids)) {
      sermon.topic_ids.forEach(topicId => {
        sermonTopicRelations.push({ sermon_id: sermon.id, topic_id: topicId });
      });
    }
  });
}

// =====================================================
// 6. 导入Sermon-Topic关联
// =====================================================
sql += `\n-- =====================================================\n`;
sql += `-- 6. 导入Sermon-Topic关联 (${sermonTopicRelations.length}条)\n`;
sql += `-- =====================================================\n\n`;

sermonTopicRelations.forEach(rel => {
  sql += `INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES (${escapeSql(rel.sermon_id)}, ${escapeSql(rel.topic_id)}, ${escapeSql(new Date().toISOString())});\n`;
});

// =====================================================
// 7. 导入Home_Config
// =====================================================
sql += `\n-- =====================================================\n`;
sql += `-- 7. 导入Home_Config\n`;
sql += `-- =====================================================\n\n`;

if (seed.home_config) {
  const config = seed.home_config;
  sql += `UPDATE home_config SET
  recommended_sermons = ${escapeSql(config.recommended_sermons)},
  featured_topics = ${escapeSql(config.featured_topics)},
  featured_speakers = ${escapeSql(config.featured_speakers)},
  discover_tags = ${escapeSql(config.discover_tags)},
  discover_daily_sermon = ${escapeSql(config.discover_daily_sermon)},
  discover_popular_sermons = ${escapeSql(config.discover_popular_sermons)},
  discover_popular_speakers = ${escapeSql(config.discover_popular_speakers)},
  discover_popular_topics = ${escapeSql(config.discover_popular_topics)},
  updated_at = ${escapeSql(new Date().toISOString())}
WHERE id = 1;\n`;
}

// =====================================================
// 8. 导入Launch_Screen
// =====================================================
sql += `\n-- =====================================================\n`;
sql += `-- 8. 导入Launch_Screen\n`;
sql += `-- =====================================================\n\n`;

if (seed.launch_screen) {
  const launch = seed.launch_screen;
  sql += `UPDATE launch_screen SET
  image_url = ${escapeSql(launch.image_url)},
  scripture = ${escapeSql(launch.scripture)},
  scripture_reference = ${escapeSql(launch.scripture_reference)},
  updated_at = ${escapeSql(new Date().toISOString())}
WHERE id = 1;\n`;
}

// 启用外键约束
sql += `\n-- =====================================================\n`;
sql += `-- 启用外键约束\n`;
sql += `-- =====================================================\n\n`;
sql += `PRAGMA foreign_keys = ON;\n`;

// 写入文件
const outputPath = path.join(__dirname, 'data.sql');
fs.writeFileSync(outputPath, sql, 'utf8');

console.log('\n✅ 转换完成！');
console.log(`📄 输出文件: ${outputPath}`);
console.log(`📊 数据统计:`);
console.log(`  - Speakers: ${seed.speakers?.length || 0}条`);
console.log(`  - Users: ${seed.users?.length || 0}条`);
console.log(`  - Sermons: ${seed.sermons?.length || 0}条`);
console.log(`  - Topics: ${seed.topics?.length || 0}条`);
console.log(`  - Sermon-Topic关联: ${sermonTopicRelations.length}条`);
console.log('\n🚀 下一步: 导入到D1数据库');
console.log('   方法1 (Wrangler CLI):');
console.log('     wrangler d1 execute tingdao-prod --file=./cloudflare-setup/data.sql');
console.log('   方法2 (Dashboard):');
console.log('     复制data.sql内容，粘贴到D1 Console执行');

