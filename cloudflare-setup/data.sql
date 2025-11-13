-- =====================================================
-- 听道APP - 数据导入SQL
-- 生成时间: 2025-11-13T05:06:11.049Z
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


-- =====================================================
-- 1. 导入Speakers (10条)
-- =====================================================

INSERT INTO speakers (id, name, name_en, title, avatar_url, bio, bio_long, church, email, website, social_media, sermon_count, follower_count, total_play_count, status, is_verified, created_at, updated_at)
VALUES (
  'speaker-001',
  '约翰·史密斯',
  'John Smith',
  '主任牧师',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
  '在牧会服事超过20年，专注于讲解圣经真理，帮助信徒在信仰上成长。',
  '约翰牧师毕业于芝加哥三一神学院，获得道学硕士学位。他在牧会服事中特别关注门徒训练和属灵生命的成长。他的讲道风格深入浅出，善于将圣经真理应用到日常生活中。',
  '恩典教会',
  'john.smith@gracechurch.com',
  'https://gracechurch.com',
  '{"wechat":"johnsmith_gc","youtube":"@JohnSmithSermons"}',
  45,
  1289,
  56789,
  'active',
  1,
  '2024-01-15T00:00:00Z',
  '2025-11-12T07:32:46.806Z'
);
INSERT INTO speakers (id, name, name_en, title, avatar_url, bio, bio_long, church, email, website, social_media, sermon_count, follower_count, total_play_count, status, is_verified, created_at, updated_at)
VALUES (
  'speaker-002',
  '玛丽·约翰逊',
  'Mary Johnson',
  '副牧师',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
  '热心于祷告事工和灵修辅导，致力于帮助信徒建立与神更深的关系。',
  '玛丽牧师在女性事工和祷告事工上有丰富的经验。她的讲道温柔而有力，特别擅长带领会众进入深度的敬拜和祷告。',
  '恩典教会',
  'mary.johnson@gracechurch.com',
  'https://gracechurch.com',
  '{"wechat":"maryjohnson_prayer"}',
  32,
  856,
  34512,
  'inactive',
  1,
  '2024-02-01T00:00:00Z',
  '2025-11-12T04:17:33.642Z'
);
INSERT INTO speakers (id, name, name_en, title, avatar_url, bio, bio_long, church, email, website, social_media, sermon_count, follower_count, total_play_count, status, is_verified, created_at, updated_at)
VALUES (
  'speaker-003',
  '保罗·安德森',
  'Paul Anderson',
  '传道师',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
  '专注于神学教导和门徒训练，帮助信徒建立扎实的圣经根基。',
  '保罗传道毕业于富勒神学院，对系统神学和教会历史有深入研究。他的讲道注重圣经诠释和神学深度。',
  '磐石教会',
  'paul.anderson@rockchurch.org',
  'https://rockchurch.org',
  '{"wechat":"paul_theology","weibo":"paulanderson_rock"}',
  28,
  645,
  28934,
  'active',
  1,
  '2024-03-10T00:00:00Z',
  '2025-11-12T04:17:43.790Z'
);
INSERT INTO speakers (id, name, name_en, title, avatar_url, bio, bio_long, church, email, website, social_media, sermon_count, follower_count, total_play_count, status, is_verified, created_at, updated_at)
VALUES (
  'speaker-004',
  '莎拉·李',
  'Sarah Lee',
  '女性事工主任',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  '致力于女性属灵成长和家庭事工，帮助姐妹们活出美好的见证。',
  '莎拉在婚姻家庭辅导和女性领导力培养方面有丰富经验。她的信息充满智慧和实用性，特别关注现代女性面临的挑战。',
  '磐石教会',
  'sarah.lee@rockchurch.org',
  'https://rockchurch.org',
  '{"wechat":"sarahlee_women"}',
  24,
  1024,
  31245,
  'active',
  1,
  '2024-04-05T00:00:00Z',
  '2025-11-12T04:17:43.871Z'
);
INSERT INTO speakers (id, name, name_en, title, avatar_url, bio, bio_long, church, email, website, social_media, sermon_count, follower_count, total_play_count, status, is_verified, created_at, updated_at)
VALUES (
  'speaker-005',
  '马克·汤普森',
  'Mark Thompson',
  '青年牧师',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  '热爱与年轻人分享神的话语，用贴近生活的方式传讲真理。',
  '马克牧师对青少年文化和现代传播方式有深入了解。他的讲道充满活力和创意，善于用年轻人喜爱的方式传递永恒的真理。',
  '生命教会',
  'mark.thompson@lifechurch.net',
  'https://lifechurch.net',
  '{"wechat":"markthompson_youth","youtube":"@MarkThompsonYouth"}',
  38,
  2134,
  67890,
  'active',
  1,
  '2024-01-20T00:00:00Z',
  '2025-10-29T10:00:00Z'
);
INSERT INTO speakers (id, name, name_en, title, avatar_url, bio, bio_long, church, email, website, social_media, sermon_count, follower_count, total_play_count, status, is_verified, created_at, updated_at)
VALUES (
  'speaker-006',
  '大卫·王',
  'David Wang',
  '主任牧师',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
  '在华人教会服事15年，专注于福音布道和教会植堂。',
  '大卫牧师在中国大陆和海外华人教会都有丰富的服事经验。他对福音传播和教会增长有独到见解。',
  '活水教会',
  'david.wang@livingwaterchurch.cn',
  'https://livingwaterchurch.cn',
  '{"wechat":"davidwang_gospel"}',
  52,
  1678,
  45678,
  'active',
  1,
  '2024-02-15T00:00:00Z',
  '2025-10-29T10:00:00Z'
);
INSERT INTO speakers (id, name, name_en, title, avatar_url, bio, bio_long, church, email, website, social_media, sermon_count, follower_count, total_play_count, status, is_verified, created_at, updated_at)
VALUES (
  'speaker-007',
  '以斯帖·陈',
  'Esther Chen',
  '敬拜主领',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
  '带领会众进入真实的敬拜，用音乐和信息触动人心。',
  '以斯帖姐妹在敬拜事奉上有多年经验，她的讲道常常结合敬拜，带领会众经历神的同在。',
  '活水教会',
  'esther.chen@livingwaterchurch.cn',
  'https://livingwaterchurch.cn',
  '{"wechat":"estherchen_worship","weibo":"estherchen_music"}',
  19,
  923,
  28456,
  'active',
  1,
  '2024-05-01T00:00:00Z',
  '2025-10-29T10:00:00Z'
);
INSERT INTO speakers (id, name, name_en, title, avatar_url, bio, bio_long, church, email, website, social_media, sermon_count, follower_count, total_play_count, status, is_verified, created_at, updated_at)
VALUES (
  'speaker-008',
  '约瑟·林',
  'Joseph Lin',
  '宣教士',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
  '在海外宣教10年，分享跨文化宣教的经历和见证。',
  '约瑟弟兄曾在东南亚和非洲服事多年，他的讲道充满了真实的宣教故事和对大使命的热情。',
  '普世宣教中心',
  'joseph.lin@globalmission.org',
  'https://globalmission.org',
  '{"wechat":"josephlin_mission"}',
  15,
  567,
  19234,
  'active',
  1,
  '2024-06-10T00:00:00Z',
  '2025-10-29T10:00:00Z'
);
INSERT INTO speakers (id, name, name_en, title, avatar_url, bio, bio_long, church, email, website, social_media, sermon_count, follower_count, total_play_count, status, is_verified, created_at, updated_at)
VALUES (
  'speaker-009',
  '彼得·张',
  'Peter Zhang',
  '资深长老',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a',
  '在职场中活出信仰，分享基督徒的生活见证和智慧。',
  '彼得长老是一位成功的企业家，他常常分享如何在职场和商业中活出基督徒的价值观。',
  '橄榄山教会',
  'peter.zhang@olivemountchurch.com',
  'https://olivemountchurch.com',
  '{"wechat":"peterzhang_workplace"}',
  21,
  789,
  24567,
  'active',
  1,
  '2024-07-01T00:00:00Z',
  '2025-10-29T10:00:00Z'
);
INSERT INTO speakers (id, name, name_en, title, avatar_url, bio, bio_long, church, email, website, social_media, sermon_count, follower_count, total_play_count, status, is_verified, created_at, updated_at)
VALUES (
  'speaker-010',
  '路得·刘',
  'Ruth Liu',
  '儿童事工主任',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce',
  '专注于儿童属灵教育和家庭教育，帮助父母培养敬虔的下一代。',
  '路得姐妹在儿童教育和家庭辅导方面有丰富经验，她的讲道充满爱心和智慧，帮助父母建立基督化家庭。',
  '橄榄山教会',
  'ruth.liu@olivemountchurch.com',
  'https://olivemountchurch.com',
  '{"wechat":"ruthliu_family"}',
  17,
  634,
  21345,
  'active',
  1,
  '2024-08-01T00:00:00Z',
  '2025-10-29T10:00:00Z'
);

-- =====================================================
-- 2. 导入Users (8条)
-- =====================================================

INSERT INTO users (id, username, name, email, avatar, phone, church, location, bio, sermon_upload_count, status, last_login_at, created_at, updated_at)
VALUES (
  'user-10245',
  '王小明',
  '张伟12',
  'zhang.wei@example.com12',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0,
  'active',
  NULL,
  '2025-11-13T05:06:11.055Z',
  '2025-11-12T07:53:58.953Z'
);
INSERT INTO users (id, username, name, email, avatar, phone, church, location, bio, sermon_upload_count, status, last_login_at, created_at, updated_at)
VALUES (
  'user-10246',
  '李娜',
  NULL,
  'lina@example.com',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0,
  'active',
  NULL,
  '2025-11-13T05:06:11.055Z',
  '2025-11-13T05:06:11.055Z'
);
INSERT INTO users (id, username, name, email, avatar, phone, church, location, bio, sermon_upload_count, status, last_login_at, created_at, updated_at)
VALUES (
  'user-10247',
  '赵敏',
  NULL,
  'zhaomin@example.com',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0,
  'active',
  NULL,
  '2025-11-13T05:06:11.055Z',
  '2025-11-13T05:06:11.055Z'
);
INSERT INTO users (id, username, name, email, avatar, phone, church, location, bio, sermon_upload_count, status, last_login_at, created_at, updated_at)
VALUES (
  'user-10248',
  '陈浩',
  NULL,
  'chenhao@example.com',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0,
  'active',
  NULL,
  '2025-11-13T05:06:11.055Z',
  '2025-11-13T05:06:11.055Z'
);
INSERT INTO users (id, username, name, email, avatar, phone, church, location, bio, sermon_upload_count, status, last_login_at, created_at, updated_at)
VALUES (
  'user-10249',
  '张伟',
  NULL,
  'zhangwei@example.com',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0,
  'active',
  NULL,
  '2025-11-13T05:06:11.055Z',
  '2025-11-13T05:06:11.055Z'
);
INSERT INTO users (id, username, name, email, avatar, phone, church, location, bio, sermon_upload_count, status, last_login_at, created_at, updated_at)
VALUES (
  'user-10250',
  '刘洋',
  NULL,
  'liuyang@example.com',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0,
  'active',
  NULL,
  '2025-11-13T05:06:11.055Z',
  '2025-11-13T05:06:11.055Z'
);
INSERT INTO users (id, username, name, email, avatar, phone, church, location, bio, sermon_upload_count, status, last_login_at, created_at, updated_at)
VALUES (
  'user-10251',
  '杨静',
  NULL,
  'yangjing@example.com',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0,
  'active',
  NULL,
  '2025-11-13T05:06:11.055Z',
  '2025-11-13T05:06:11.055Z'
);
INSERT INTO users (id, username, name, email, avatar, phone, church, location, bio, sermon_upload_count, status, last_login_at, created_at, updated_at)
VALUES (
  'user-10252',
  '黄强',
  NULL,
  'huangqiang@example.com',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0,
  'disabled',
  NULL,
  '2025-11-13T05:06:11.055Z',
  '2025-11-13T05:06:11.055Z'
);

-- =====================================================
-- 3. 导入Series
-- =====================================================


-- =====================================================
-- 4. 导入Topics (8条)
-- =====================================================

INSERT INTO topics (id, name, description, cover_image_url, icon, gradient, sermon_count, status, is_system, display_order, created_at, updated_at)
VALUES (
  'topic-faith',
  '信心与信仰',
  NULL,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  NULL,
  NULL,
  0,
  'active',
  0,
  0,
  '2025-11-13T05:06:11.055Z',
  '2025-11-13T05:06:11.055Z'
);
INSERT INTO topics (id, name, description, cover_image_url, icon, gradient, sermon_count, status, is_system, display_order, created_at, updated_at)
VALUES (
  'topic-prayer',
  '祷告生活',
  '学习如何建立有效的祷告生活，与神建立更深的关系',
  'https://images.unsplash.com/photo-1507692049790-de58290a4334',
  'hands.sparkles',
  NULL,
  38,
  'active',
  0,
  2,
  '2024-06-01T00:00:00Z',
  '2025-10-29T10:00:00Z'
);
INSERT INTO topics (id, name, description, cover_image_url, icon, gradient, sermon_count, status, is_system, display_order, created_at, updated_at)
VALUES (
  'topic-family',
  '家庭与婚姻',
  '建立合神心意的家庭，学习圣经中的家庭和婚姻原则',
  'https://images.unsplash.com/photo-1511895426328-dc8714191300',
  'house.fill',
  NULL,
  32,
  'active',
  0,
  3,
  '2024-06-01T00:00:00Z',
  '2025-10-29T10:00:00Z'
);
INSERT INTO topics (id, name, description, cover_image_url, icon, gradient, sermon_count, status, is_system, display_order, created_at, updated_at)
VALUES (
  'topic-christian-life',
  '基督徒生活',
  '如何在日常生活中活出基督的样式，实践信仰',
  'https://images.unsplash.com/photo-1519834785169-98be25ec3f84',
  'heart.fill',
  NULL,
  52,
  'active',
  0,
  4,
  '2024-06-01T00:00:00Z',
  '2025-10-29T10:00:00Z'
);
INSERT INTO topics (id, name, description, cover_image_url, icon, gradient, sermon_count, status, is_system, display_order, created_at, updated_at)
VALUES (
  'topic-spiritual-growth',
  '属灵成长',
  '深入探讨属灵生命的成长和成熟，追求更像基督',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
  'leaf.fill',
  NULL,
  41,
  'active',
  0,
  5,
  '2024-06-01T00:00:00Z',
  '2025-10-29T10:00:00Z'
);
INSERT INTO topics (id, name, description, cover_image_url, icon, gradient, sermon_count, status, is_system, display_order, created_at, updated_at)
VALUES (
  'topic-evangelism',
  '福音与宣教',
  '分享福音的好消息，参与神的大使命',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b',
  'megaphone.fill',
  NULL,
  28,
  'active',
  0,
  6,
  '2024-06-01T00:00:00Z',
  '2025-10-29T10:00:00Z'
);
INSERT INTO topics (id, name, description, cover_image_url, icon, gradient, sermon_count, status, is_system, display_order, created_at, updated_at)
VALUES (
  'topic-worship',
  '敬拜与赞美',
  '学习真正的敬拜，用心灵和诚实敬拜神',
  'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf',
  'music.note',
  NULL,
  24,
  'active',
  0,
  7,
  '2024-06-01T00:00:00Z',
  '2025-10-29T10:00:00Z'
);
INSERT INTO topics (id, name, description, cover_image_url, icon, gradient, sermon_count, status, is_system, display_order, created_at, updated_at)
VALUES (
  'topic-discipleship',
  '门徒训练',
  '按照耶稣的榜样，培养和训练门徒',
  'https://images.unsplash.com/photo-1529070538774-1843cb3265df',
  'person.2.fill',
  NULL,
  19,
  'active',
  0,
  8,
  '2024-06-01T00:00:00Z',
  '2025-10-29T10:00:00Z'
);

-- =====================================================
-- 5. 导入Sermons (20条)
-- =====================================================

INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-001',
  '信心的力量：在困境中寻找希望13',
  'speaker-001',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://cdn.tingdao.com/audio/sermon-001.mp3',
  45678900,
  'mp3',
  2580,
  '希伯来书 11:1; 12',
  '在我们生命的每一天，都需要回到信仰的根基上去，才能站立得稳。本讲道探讨如何在困境中保持信心，并找到神赐予的希望。11',
  '这是一篇关于信心的深度讲道，分为三个部分：1）信心的定义 - 什么是真正的信心 2）信心的挑战 - 我们如何面对疑惑和困难 3）信心的实践 - 在日常生活中活出信心。通过圣经中的人物和现实生活的例子，帮助我们更深刻地理解信心的含义。',
  '["信心","希望","困境","12"]',
  'series-faith-2025',
  1,
  'zh-CN',
  '2025-10-27',
  '2025-10-27T14:00:00Z',
  1234,
  89,
  56,
  'published',
  1,
  'user-10245',
  '{"church":"恩典教会","location":"北京","event":"主日崇拜"}',
  '2025-10-27T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-002',
  '祷告的深度：与神建立更深关系14',
  'speaker-002',
  'https://images.unsplash.com/photo-1551847653-6740008053b5',
  'https://cdn.tingdao.com/audio/sermon-002.mp3',
  38456700,
  'mp3',
  2100,
  '马太福音 6:9-13; 你阿訇-马克',
  '深入探讨祷告的本质，学习如何透过祷告与神建立更亲密的关系。包括祷告的原则、方法和实际操练。14',
  '主祷文不仅是一个祷告范本，更是教导我们如何祷告的指南。本讲道详细解释主祷文的每一句话，帮助我们理解祷告的核心要素：敬拜、顺服、祈求、饶恕和保护。',
  '["tag-prayer","tag-discipleship"]',
  NULL,
  NULL,
  'zh-CN',
  '2025-10-26',
  '2025-10-26T14:00:00Z',
  892,
  67,
  43,
  'revision',
  1,
  'user-10246',
  '{"church":"恩典教会","location":"北京","event":"主日崇拜"}',
  '2025-10-26T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-003',
  '神的恩典：超越我们的理解',
  'speaker-003',
  'https://images.unsplash.com/photo-1649774472544-d1417fd66a34',
  'https://cdn.tingdao.com/audio/sermon-003.mp3',
  41234500,
  'mp3',
  2280,
  '以弗所书 2:8-9',
  '神的恩典是白白赐给我们的礼物，无需我们凭行为赚取。本讲道帮助我们更深刻地理解恩典的含义和在生活中的应用。',
  '恩典是基督教信仰的核心。我们得救是本乎恩，也因着信。这篇信息探讨：1）恩典的来源 - 神的爱 2）恩典的代价 - 基督的牺牲 3）恩典的回应 - 我们的感恩和顺服。',
  '["tag-grace","tag-salvation"]',
  'series-grace-series',
  1,
  'zh-CN',
  '2025-10-25T10:30:00Z',
  '2025-10-25T14:00:00Z',
  2105,
  145,
  98,
  'published',
  1,
  'user-10247',
  '{"church":"磐石教会","location":"上海","event":"主日崇拜"}',
  '2025-10-25T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-004',
  '在黑暗中点亮盼望之光',
  'speaker-001',
  'https://images.unsplash.com/photo-1694621697551-046603ab121d',
  'https://cdn.tingdao.com/audio/sermon-004.mp3',
  48765400,
  'mp3',
  2700,
  '约翰福音 8:12',
  '耶稣是世界的光，跟从祂的人必不在黑暗里走。探讨如何在困难和挑战中依靠神的光照，持守盼望。',
  '在这个充满不确定性的时代，我们如何保持盼望？本讲道分享：1）盼望的根基 - 基督的应许 2）盼望的表现 - 在苦难中的喜乐 3）盼望的传递 - 成为他人的祝福。',
  '["tag-hope","tag-faith"]',
  NULL,
  NULL,
  'zh-CN',
  '2025-10-24T10:30:00Z',
  '2025-10-24T14:00:00Z',
  1567,
  112,
  78,
  'published',
  0,
  'user-10245',
  '{"church":"恩典教会","location":"北京","event":"主日崇拜"}',
  '2025-10-24T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-005',
  '圣经中的智慧原则',
  'speaker-003',
  'https://images.unsplash.com/photo-1759523622399-a79fb453496e',
  'https://cdn.tingdao.com/audio/sermon-005.mp3',
  56234100,
  'mp3',
  3120,
  '箴言 3:5-6',
  '圣经中充满了神的智慧。本讲道分享如何将圣经的智慧应用到日常生活的各个方面，做出合神心意的决定。',
  '箴言书被称为智慧书，为我们的生活提供了实用的指导。本讲道探讨：1）认识智慧的源头 2）获得智慧的途径 3）应用智慧到工作、家庭和人际关系中。',
  '["tag-wisdom","tag-faith"]',
  NULL,
  NULL,
  'zh-CN',
  '2025-10-23T10:30:00Z',
  '2025-10-23T14:00:00Z',
  987,
  73,
  52,
  'published',
  0,
  'user-10246',
  '{"church":"磐石教会","location":"上海","event":"主日崇拜"}',
  '2025-10-23T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-006',
  '建立合神心意的家庭',
  'speaker-004',
  'https://images.unsplash.com/photo-1511895426328-dc8714191300',
  'https://cdn.tingdao.com/audio/sermon-006.mp3',
  47654300,
  'mp3',
  2640,
  '以弗所书 5:21-33',
  '家庭是神设立的第一个制度。学习圣经中的家庭原则，建立充满爱和恩典的家庭关系。',
  '在现代社会的压力下，家庭面临许多挑战。本讲道分享：1）夫妻关系的建立 2）亲子教育的智慧 3）家庭灵修的重要性。帮助家庭成为神祝福的管道。',
  '["tag-family","tag-love"]',
  'series-family-2025',
  1,
  'zh-CN',
  '2025-10-22T10:30:00Z',
  '2025-10-22T14:00:00Z',
  1876,
  134,
  89,
  'published',
  1,
  'user-10247',
  '{"church":"磐石教会","location":"上海","event":"家庭营会"}',
  '2025-10-22T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-007',
  '年轻人的使命：为主发光',
  'speaker-005',
  'https://images.unsplash.com/photo-1519834785169-98be25ec3f84',
  'https://cdn.tingdao.com/audio/sermon-007.mp3',
  44321000,
  'mp3',
  2460,
  '马太福音 5:14-16',
  '年轻的基督徒如何在这个世代中为主发光？探讨如何在学校、职场和社交媒体上活出信仰。',
  '这个时代需要年轻的基督徒站立起来，成为光和盐。本讲道特别为年轻人设计，讨论：1）发现你的恩赐 2）面对同龄人的压力 3）利用现代科技传福音。',
  '["tag-evangelism","tag-faith"]',
  NULL,
  NULL,
  'zh-CN',
  '2025-10-21T19:00:00Z',
  '2025-10-21T20:00:00Z',
  2345,
  189,
  145,
  'published',
  1,
  'user-10248',
  '{"church":"生命教会","location":"深圳","event":"青年聚会"}',
  '2025-10-21T18:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-008',
  '真正的敬拜：用心灵和诚实',
  'speaker-007',
  'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf',
  'https://cdn.tingdao.com/audio/sermon-008.mp3',
  40123400,
  'mp3',
  2220,
  '约翰福音 4:23-24',
  '敬拜不只是唱歌，而是一种生活方式。学习如何成为真正的敬拜者，在生活的每个领域荣耀神。',
  '耶稣说，神要寻找用心灵和诚实敬拜祂的人。本讲道探讨：1）敬拜的本质 2）敬拜的障碍 3）在日常生活中敬拜神。包括实用的敬拜操练建议。',
  '["tag-worship","tag-prayer"]',
  NULL,
  NULL,
  'zh-CN',
  '2025-10-20T10:30:00Z',
  '2025-10-20T14:00:00Z',
  1234,
  98,
  67,
  'published',
  0,
  'user-10249',
  '{"church":"活水教会","location":"广州","event":"敬拜赞美会"}',
  '2025-10-20T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-009',
  '福音的大能：改变生命的好消息',
  'speaker-006',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b',
  'https://cdn.tingdao.com/audio/sermon-009.mp3',
  51876500,
  'mp3',
  2880,
  '罗马书 1:16',
  '福音是神的大能，要救一切相信的人。认识福音的核心内容，学习如何清楚地传讲福音。',
  '福音不仅是关于死后上天堂，更是关于现在的生命转化。本讲道阐述：1）福音的四个要素 2）如何分享你的见证 3）克服传福音的恐惧。',
  '["tag-evangelism","tag-salvation"]',
  'series-gospel-2025',
  1,
  'zh-CN',
  '2025-10-19T10:30:00Z',
  '2025-10-19T14:00:00Z',
  1678,
  123,
  87,
  'published',
  1,
  'user-10250',
  '{"church":"活水教会","location":"广州","event":"福音主日"}',
  '2025-10-19T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-010',
  '门徒的代价：跟随基督的意义',
  'speaker-001',
  'https://images.unsplash.com/photo-1529070538774-1843cb3265df',
  'https://cdn.tingdao.com/audio/sermon-010.mp3',
  49765400,
  'mp3',
  2760,
  '路加福音 9:23-25',
  '作主的门徒不是轻松的事，需要背起十字架跟随祂。探讨作门徒的真正意义和实际应用。',
  '耶稣呼召我们成为祂的门徒，这意味着什么？本讲道深入探讨：1）门徒的定义 2）作门徒的代价 3）作门徒的祝福 4）如何帮助他人成为门徒。',
  '["tag-discipleship","tag-faith"]',
  'series-discipleship-2025',
  1,
  'zh-CN',
  '2025-10-18T10:30:00Z',
  '2025-10-18T14:00:00Z',
  1456,
  109,
  73,
  'published',
  0,
  'user-10251',
  '{"church":"恩典教会","location":"北京","event":"门徒训练营"}',
  '2025-10-18T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-011',
  '在职场中荣耀神',
  'speaker-009',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902',
  'https://cdn.tingdao.com/audio/sermon-011.mp3',
  42123400,
  'mp3',
  2340,
  '歌罗西书 3:23-24',
  '工作不只是谋生手段，更是服事神的平台。学习如何在职场中活出基督徒的见证和价值观。',
  '无论做什么，都要从心里做，像是给主做的。本讲道分享：1）重新认识工作的意义 2）职场中的道德挑战 3）在工作中建立影响力 4）工作与家庭的平衡。',
  '["tag-faith","tag-wisdom"]',
  NULL,
  NULL,
  'zh-CN',
  '2025-10-17T10:30:00Z',
  '2025-10-17T14:00:00Z',
  2123,
  156,
  98,
  'published',
  1,
  'user-10252',
  '{"church":"橄榄山教会","location":"杭州","event":"职场团契"}',
  '2025-10-17T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-012',
  '父母的呼召：培养敬虔的下一代',
  'speaker-010',
  'https://images.unsplash.com/photo-1476703993599-0035a21b17a9',
  'https://cdn.tingdao.com/audio/sermon-012.mp3',
  45432100,
  'mp3',
  2520,
  '申命记 6:6-9',
  '父母有责任将信仰传承给下一代。学习圣经中的教养原则，帮助孩子建立与神的关系。',
  '在这个充满挑战的时代，如何养育敬虔的孩子？本讲道提供实用的建议：1）家庭灵修的建立 2）品格教育的重要性 3）面对现代科技的挑战 4）为孩子的祷告。',
  '["tag-family","tag-love"]',
  'series-family-2025',
  2,
  'zh-CN',
  '2025-10-16T10:30:00Z',
  '2025-10-16T14:00:00Z',
  1789,
  134,
  92,
  'published',
  0,
  'user-10245',
  '{"church":"橄榄山教会","location":"杭州","event":"家庭教育讲座"}',
  '2025-10-16T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-013',
  '宣教的心志：神国度的扩展',
  'speaker-008',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c',
  'https://cdn.tingdao.com/audio/sermon-013.mp3',
  47654300,
  'mp3',
  2640,
  '马太福音 28:18-20',
  '大使命是给每个基督徒的呼召。了解宣教的异象，探索如何参与神的宣教工作。',
  '从耶路撒冷到地极，神的心意是万民得救。本讲道分享：1）宣教的圣经根基 2）不同的宣教方式 3）如何支持宣教工作 4）跨文化宣教的挑战和祝福。',
  '["tag-evangelism","tag-love"]',
  NULL,
  NULL,
  'zh-CN',
  '2025-10-15T10:30:00Z',
  '2025-10-15T14:00:00Z',
  1345,
  98,
  67,
  'published',
  0,
  'user-10246',
  '{"church":"普世宣教中心","location":"线上","event":"宣教年会"}',
  '2025-10-15T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-014',
  '饶恕的能力：释放与自由',
  'speaker-002',
  'https://images.unsplash.com/photo-1509909756405-be0199881695',
  'https://cdn.tingdao.com/audio/sermon-014.mp3',
  43210000,
  'mp3',
  2400,
  '马太福音 18:21-35',
  '饶恕是基督徒生命中最难但最重要的功课之一。学习如何真正饶恕，经历释放和自由。',
  '耶稣教导我们要饶恕七十个七次，这意味着无限的饶恕。本讲道探讨：1）饶恕的必要性 2）饶恕的困难 3）饶恕的过程 4）饶恕带来的自由。包括实际的饶恕操练。',
  '["tag-love","tag-grace"]',
  NULL,
  NULL,
  'zh-CN',
  '2025-10-14T10:30:00Z',
  '2025-10-14T14:00:00Z',
  1987,
  145,
  102,
  'published',
  1,
  'user-10247',
  '{"church":"恩典教会","location":"北京","event":"主日崇拜"}',
  '2025-10-14T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-015',
  '属灵争战：得胜的关键',
  'speaker-003',
  'https://images.unsplash.com/photo-1520962922320-2038ec4e28e8',
  'https://cdn.tingdao.com/audio/sermon-015.mp3',
  50876500,
  'mp3',
  2820,
  '以弗所书 6:10-18',
  '基督徒的生活是一场属灵争战。认识我们的仇敌，学习如何穿戴神所赐的全副军装。',
  '我们并不是与属血气的争战，乃是与空中属灵气的恶魔争战。本讲道详细解释：1）属灵争战的本质 2）神的全副军装 3）祷告和警醒 4）在争战中得胜。',
  '["tag-faith","tag-prayer"]',
  NULL,
  NULL,
  'zh-CN',
  '2025-10-13T10:30:00Z',
  '2025-10-13T14:00:00Z',
  1654,
  121,
  84,
  'published',
  0,
  'user-10248',
  '{"church":"磐石教会","location":"上海","event":"主日崇拜"}',
  '2025-10-13T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-016',
  '圣灵的果子：生命的转化',
  'speaker-001',
  'https://images.unsplash.com/photo-1464820453369-31d2c0b651af',
  'https://cdn.tingdao.com/audio/sermon-016.mp3',
  46543200,
  'mp3',
  2580,
  '加拉太书 5:22-23',
  '圣灵的果子是成熟基督徒生命的标志。探讨如何让圣灵在我们生命中结出丰盛的果子。',
  '仁爱、喜乐、和平、忍耐、恩慈、良善、信实、温柔、节制——这九种果子如何在我们生命中成长？本讲道分享：1）圣灵果子的本质 2）结果子的过程 3）实际的操练方法。',
  '["tag-love","tag-grace"]',
  'series-spirit-fruit',
  1,
  'zh-CN',
  '2025-10-12T10:30:00Z',
  '2025-10-12T14:00:00Z',
  1876,
  138,
  95,
  'published',
  1,
  'user-10249',
  '{"church":"恩典教会","location":"北京","event":"主日崇拜"}',
  '2025-10-12T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-017',
  '慷慨的生命：奉献与祝福',
  'speaker-009',
  'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6',
  'https://cdn.tingdao.com/audio/sermon-017.mp3',
  42198700,
  'mp3',
  2340,
  '哥林多后书 9:6-15',
  '神喜悦乐意奉献的人。学习圣经中关于奉献和慷慨的教导，经历施比受更为有福的真理。',
  '少种的少收，多种的多收。本讲道探讨：1）奉献的动机 2）奉献的原则 3）奉献的祝福 4）在奉献中信靠神。帮助我们建立正确的金钱观和管家职分。',
  '["tag-faith","tag-love"]',
  NULL,
  NULL,
  'zh-CN',
  '2025-10-11T10:30:00Z',
  '2025-10-11T14:00:00Z',
  1432,
  107,
  76,
  'published',
  0,
  'user-10250',
  '{"church":"橄榄山教会","location":"杭州","event":"感恩奉献主日"}',
  '2025-10-11T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-018',
  '单身的呼召：完全献给神',
  'speaker-004',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9',
  'https://cdn.tingdao.com/audio/sermon-018.mp3',
  38976500,
  'mp3',
  2160,
  '哥林多前书 7:32-35',
  '单身不是次等的恩赐，而是神特别的呼召。帮助单身弟兄姐妹明白神在这个季节的心意。',
  '保罗说，没有结婚的是为主的事挂虑。本讲道分享：1）单身的恩赐和祝福 2）单身生活的挑战 3）如何充分利用这个季节 4）教会如何服事单身群体。',
  '["tag-faith","tag-love"]',
  NULL,
  NULL,
  'zh-CN',
  '2025-10-10T10:30:00Z',
  '2025-10-10T14:00:00Z',
  1234,
  92,
  63,
  'published',
  0,
  'user-10251',
  '{"church":"磐石教会","location":"上海","event":"单身团契"}',
  '2025-10-10T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-019',
  '末世的警醒：做好准备',
  'speaker-006',
  'https://images.unsplash.com/photo-1501908734255-16579c18c25f',
  'https://cdn.tingdao.com/audio/sermon-019.mp3',
  48765400,
  'mp3',
  2700,
  '马太福音 24:36-44',
  '没有人知道主再来的日子。如何在等候中警醒，在末世中持守信仰，活出盼望。',
  '主的再来确定无疑，但时间未定。本讲道帮助我们：1）理解末世的记号 2）避免末世论的极端 3）在等候中成长 4）向世界传扬福音的紧迫性。',
  '["tag-hope","tag-faith"]',
  NULL,
  NULL,
  'zh-CN',
  '2025-10-09T10:30:00Z',
  '2025-10-09T14:00:00Z',
  1543,
  115,
  81,
  'published',
  0,
  'user-10252',
  '{"church":"活水教会","location":"广州","event":"主日崇拜"}',
  '2025-10-09T09:00:00Z',
  '2025-10-29T08:30:00Z'
);
INSERT INTO sermons (id, title, speaker_id, cover_image_url, audio_url, audio_size, audio_format, duration, scripture, summary, description, tags, series_id, series_order, language, date, publish_date, play_count, favorite_count, download_count, status, is_featured, submitter_id, metadata, created_at, updated_at)
VALUES (
  'sermon-020',
  '合一的见证：彼此相爱',
  'speaker-005',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18',
  'https://cdn.tingdao.com/audio/sermon-020.mp3',
  44321000,
  'mp3',
  2460,
  '约翰福音 17:20-23',
  '耶稣为门徒的合一祷告。教会的合一是向世界作见证的关键，学习如何在基督里合而为一。',
  '叫他们合而为一，像我们合而为一。本讲道探讨：1）合一的重要性 2）合一的基础 3）破坏合一的因素 4）建立合一的实践。帮助教会活出彼此相爱的见证。',
  '["tag-love","tag-discipleship"]',
  NULL,
  NULL,
  'zh-CN',
  '2025-10-08T10:30:00Z',
  '2025-10-08T14:00:00Z',
  1687,
  124,
  88,
  'published',
  1,
  'user-10245',
  '{"church":"生命教会","location":"深圳","event":"合一祷告会"}',
  '2025-10-08T09:00:00Z',
  '2025-10-29T08:30:00Z'
);

-- =====================================================
-- 6. 导入Sermon-Topic关联 (40条)
-- =====================================================

INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-001', 'topic-faith', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-001', 'topic-christian-life', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-002', 'topic-prayer', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-002', 'topic-spiritual-growth', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-003', 'topic-faith', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-003', 'topic-christian-life', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-004', 'topic-faith', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-004', 'topic-christian-life', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-005', 'topic-christian-life', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-005', 'topic-spiritual-growth', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-006', 'topic-family', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-006', 'topic-christian-life', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-007', 'topic-evangelism', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-007', 'topic-christian-life', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-008', 'topic-worship', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-008', 'topic-spiritual-growth', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-009', 'topic-evangelism', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-009', 'topic-faith', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-010', 'topic-discipleship', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-010', 'topic-spiritual-growth', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-011', 'topic-christian-life', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-011', 'topic-faith', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-012', 'topic-family', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-012', 'topic-christian-life', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-013', 'topic-evangelism', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-013', 'topic-discipleship', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-014', 'topic-christian-life', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-014', 'topic-spiritual-growth', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-015', 'topic-spiritual-growth', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-015', 'topic-prayer', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-016', 'topic-spiritual-growth', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-016', 'topic-christian-life', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-017', 'topic-christian-life', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-017', 'topic-faith', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-018', 'topic-christian-life', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-018', 'topic-spiritual-growth', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-019', 'topic-faith', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-019', 'topic-evangelism', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-020', 'topic-christian-life', '2025-11-13T05:06:11.055Z');
INSERT INTO sermon_topics (sermon_id, topic_id, created_at)
VALUES ('sermon-020', 'topic-discipleship', '2025-11-13T05:06:11.055Z');

-- =====================================================
-- 7. 导入Home_Config
-- =====================================================


-- =====================================================
-- 8. 导入Launch_Screen
-- =====================================================


-- =====================================================
-- 启用外键约束
-- =====================================================

PRAGMA foreign_keys = ON;
