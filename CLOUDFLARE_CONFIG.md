# TingDao Admin - Cloudflare 配置文档

## 📋 当前配置

### 1. Cloudflare Pages (Admin面板)
- **项目名**: tingdao-admin-1
- **GitHub仓库**: jerryyu077/TingDao_Admin
- **自动部署**: ✅ 已启用
- **默认域名**: https://1a11308b.tingdao-admin-1.pages.dev
- **自定义域名**: admin.tingdao.app（待配置）

### 2. Cloudflare Workers (API)
- **Worker名**: tingdao-api
- **部署URL**: https://tingdao-api.living-water-tingdaoapp.workers.dev
- **绑定资源**:
  - D1数据库: tingdao-db (d6954ace-9f75-4135-8814-8ad08c12d499)
  - R2存储: tingdao-media

### 3. Cloudflare D1 (数据库)
- **数据库名**: tingdao-db
- **数据库ID**: d6954ace-9f75-4135-8814-8ad08c12d499
- **表数量**: 10张
- **数据量**:
  - 10 讲员
  - 8 用户
  - 20 讲道
  - 8 主题
  - 40 sermon-topic关联

### 4. Cloudflare R2 (文件存储)
- **Bucket名**: tingdao-media
- **公开访问域名**: https://media.tingdao.app
- **文件结构**:
  ```
  tingdao-media/
  ├── sermons/          # 音频文件
  │   └── test_34.mp3   # 示例音频
  └── images/           # 图片文件
  ```

---

## 🔗 API端点

### 基础URL
```
https://tingdao-api.living-water-tingdaoapp.workers.dev/api/v1
```

### 主要端点
- **讲道**: `/sermons`
- **讲员**: `/speakers`
- **用户**: `/users`
- **主题**: `/topics`
- **首页配置**: `/home/config`
- **启动页**: `/launch-screen`
- **上传音频**: `/upload/audio`
- **上传图片**: `/upload/image`

---

## 🌐 域名配置

### 计划中的域名结构
```
tingdao.app (主域名)
├── admin.tingdao.app       # Admin管理后台
├── api.tingdao.app         # API服务 (待配置)
└── media.tingdao.app       # CDN媒体文件 ✅
```

### 当前状态
- ✅ `media.tingdao.app` - R2公开访问
- 🔄 `admin.tingdao.app` - Pages待配置
- ⏳ `api.tingdao.app` - Workers待配置（可选）

---

## 🔐 安全配置

### Cloudflare Access (Zero Trust)
- **保护资源**: admin.tingdao.app
- **认证方式**: (待配置)
- **访问策略**: (待配置)

### API安全
- **CORS**: 当前允许所有来源 (`*`)
- **认证**: 未实现（待添加）
- **速率限制**: 未实现（待添加）

---

## 📊 监控和日志

### Wrangler CLI命令
```bash
# 查看Workers日志
wrangler tail tingdao-api

# 查看D1数据库
wrangler d1 execute tingdao-db --remote --command="SELECT COUNT(*) FROM sermons;"

# 查看R2文件
wrangler r2 object list tingdao-media --remote

# 重新部署Workers
cd /Users/jy/Desktop/TingDao/Tingdao1020/Tingdao1020/admin/workers
wrangler deploy
```

### Dashboard监控
- **Pages**: https://dash.cloudflare.com → Workers & Pages → tingdao-admin-1
- **Workers**: https://dash.cloudflare.com → Workers & Pages → tingdao-api
- **D1**: https://dash.cloudflare.com → D1 → tingdao-db
- **R2**: https://dash.cloudflare.com → R2 → tingdao-media

---

## 🚀 部署流程

### Admin面板更新
1. 修改代码
2. 提交到GitHub: `git push origin main`
3. Cloudflare Pages自动部署（1-2分钟）

### Workers API更新
1. 修改 `admin/workers/src/` 下的代码
2. 运行: `wrangler deploy`
3. 即时生效

### 数据库更新
```bash
# 方式1：直接执行SQL
wrangler d1 execute tingdao-db --remote --command="UPDATE sermons SET status='published' WHERE id='sermon-001';"

# 方式2：执行SQL文件
wrangler d1 execute tingdao-db --remote --file=update.sql
```

### R2文件上传
```bash
# 上传文件
wrangler r2 object put tingdao-media/sermons/filename.mp3 --file=./local-file.mp3 --remote

# 删除文件
wrangler r2 object delete tingdao-media/sermons/filename.mp3 --remote
```

---

## 🧪 测试清单

### Admin面板测试
- [ ] 登录功能
- [ ] 讲道列表加载
- [ ] 讲道详情查看
- [ ] 讲道状态更新
- [ ] 讲员管理
- [ ] 用户管理
- [ ] 主题管理
- [ ] 文件上传（音频、图片）
- [ ] 首页配置保存
- [ ] 启动页配置保存

### iOS App测试
- [ ] API连接
- [ ] 讲道列表显示
- [ ] 音频播放
- [ ] 图片加载
- [ ] 搜索功能
- [ ] 收藏功能

---

## 📞 支持资源

- **Cloudflare文档**: https://developers.cloudflare.com
- **D1数据库**: https://developers.cloudflare.com/d1/
- **Workers**: https://developers.cloudflare.com/workers/
- **R2存储**: https://developers.cloudflare.com/r2/
- **Pages**: https://developers.cloudflare.com/pages/

---

## 📅 更新日志

### 2025-11-13
- ✅ 创建D1数据库 `tingdao-db`
- ✅ 导入数据（10表，86条记录）
- ✅ 部署Workers API `tingdao-api`
- ✅ 创建R2 bucket `tingdao-media`
- ✅ 配置自定义域名 `media.tingdao.app`
- ✅ 上传测试音频 `test_34.mp3`
- ✅ 更新Admin API配置指向Cloudflare
- 🔄 配置Admin自定义域名 `admin.tingdao.app`（进行中）

