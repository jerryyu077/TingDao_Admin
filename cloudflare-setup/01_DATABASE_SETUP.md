# 第一步：D1 数据库设置

## 📋 概述

这是完整部署的第一步，我们将：
1. 在Cloudflare创建D1数据库
2. 导入SQL表结构
3. 将seed.json数据转换并导入到SQL数据库

---

## 🗂️ 表结构说明

### 主要表 (8张)

1. **speakers** - 讲员表
   - 存储所有讲员信息（姓名、头像、教会、简介等）
   - 包含统计字段（sermon_count, follower_count等）

2. **users** - 用户表
   - 存储用户账户信息
   - 包含sermon_upload_count统计

3. **series** - 系列表
   - 讲道系列分组
   - 支持系列开始/结束日期

4. **topics** - 主题表
   - 讲道主题分类
   - 支持系统预设和用户创建

5. **sermons** - 讲道表（核心表）
   - 存储所有讲道详情
   - 关联speaker, series, submitter (user)
   - 包含音频、封面、经文等完整信息

6. **sermon_topics** - 讲道-主题关联表（多对多）
   - 一个sermon可以属于多个topic
   - 一个topic包含多个sermon

7. **home_config** - 首页配置表
   - 单记录表（永远只有1条记录）
   - 存储首页推荐内容的ID数组（JSON格式）

8. **launch_screen** - 启动屏幕表
   - 单记录表（永远只有1条记录）
   - 存储启动屏幕图片和经文

### 可选表 (2张)

9. **user_favorites** - 用户收藏表
   - 记录用户收藏的讲道

10. **play_history** - 播放历史表
    - 记录用户播放讲道的历史

---

## 🔧 创建D1数据库

### 1. 登录Cloudflare Dashboard

访问：https://dash.cloudflare.com/

### 2. 进入D1数据库页面

导航：左侧菜单 → **Workers & Pages** → **D1 SQL Database**

### 3. 创建新数据库

点击 **Create Database** 按钮

- **Database name**: `tingdao-prod` (生产环境)
- **Location**: 选择离你最近的区域 (如 Asia Pacific - Singapore)

点击 **Create**

### 4. 记录数据库信息

创建成功后，你会看到：
- **Database ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Database name**: `tingdao-prod`

**📝 把Database ID记录下来，后面会用到！**

---

## 📥 导入表结构

### 方法一：通过Dashboard (推荐新手)

1. 在D1数据库页面，点击你刚创建的 `tingdao-prod`

2. 进入 **Console** 标签

3. 复制 `schema.sql` 的内容

4. 粘贴到Console中，点击 **Execute**

5. 你会看到所有表被成功创建

### 方法二：通过Wrangler CLI (推荐熟悉命令行的用户)

```bash
# 1. 安装Wrangler (如果还没安装)
npm install -g wrangler

# 2. 登录Cloudflare账号
wrangler login

# 3. 导入SQL文件
wrangler d1 execute tingdao-prod --file=./cloudflare-setup/schema.sql

# 4. 验证表是否创建成功
wrangler d1 execute tingdao-prod --command="SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 🔄 数据导入

现在我们需要把 `seed.json` 的数据转换成SQL INSERT语句并导入。

### 数据转换步骤

我会为你创建一个Node.js脚本，自动完成：

1. 读取 `seed.json`
2. 将JSON数据转换为SQL INSERT语句
3. 生成 `data.sql` 文件
4. 可直接导入D1数据库

**这个脚本我会在下一步为你创建。**

---

## ✅ 验证数据库

导入数据后，通过Console或Wrangler执行以下查询验证：

```sql
-- 1. 检查所有表
SELECT name FROM sqlite_master WHERE type='table';

-- 2. 检查讲道总数
SELECT COUNT(*) as total_sermons FROM sermons;

-- 3. 检查讲员总数
SELECT COUNT(*) as total_speakers FROM speakers;

-- 4. 检查用户总数
SELECT COUNT(*) as total_users FROM users;

-- 5. 检查主题总数
SELECT COUNT(*) as total_topics FROM topics;

-- 6. 查看第一条sermon
SELECT id, title, speaker_id, status FROM sermons LIMIT 1;
```

---

## 🎯 预期结果

如果一切正常，你应该看到：

- ✅ 10张表被成功创建
- ✅ ~20条sermon记录
- ✅ ~10条speaker记录
- ✅ ~5条user记录
- ✅ ~8条topic记录
- ✅ sermon_topics关联表有多条记录

---

## ⏱️ 预计时间

- **创建D1数据库**: 5分钟
- **导入表结构**: 5分钟
- **转换并导入数据**: 15-20分钟（我会帮你写脚本）

**总计：30分钟**

---

## 📝 注意事项

1. **免费额度**
   - D1免费版：5个数据库，100K读/天，1K写/天
   - 足够测试使用

2. **数据备份**
   - 定期导出数据: `wrangler d1 backup create tingdao-prod`

3. **表结构修改**
   - 如需修改表结构，使用ALTER TABLE
   - SQLite不支持DROP COLUMN，需要重建表

4. **JSON字段**
   - tags, metadata, social_media等字段存储为TEXT
   - 在应用层使用JSON.parse/JSON.stringify处理

---

## 🚀 下一步

完成这一步后，下一步是：

**第二步：创建Workers API**

我会帮你写完整的Workers代码，包含：
- 所有API端点（/v1/sermons, /v1/speakers等）
- D1数据库查询
- CORS配置
- 错误处理
- 分页逻辑

---

## ❓ 需要帮助？

如果遇到问题：
1. 检查Wrangler是否正确登录
2. 检查Database ID是否正确
3. 检查SQL语法是否正确（SQLite语法）
4. 查看Cloudflare Dashboard的错误日志

准备好了就告诉我，我们继续下一步！

