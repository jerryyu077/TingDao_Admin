# API 集成检查清单

**项目**: 听道管理后台  
**版本**: v1.0  
**日期**: 2025年11月4日

---

## ✅ 已完成的工作

### 1. API 基础架构 ✅

- [x] 创建 `js/api-config.js` - API 配置和端点定义
- [x] 创建 `js/api-client.js` - HTTP 客户端和请求处理
- [x] 创建 `js/api-services.js` - 各模块的服务层方法

### 2. 模块 API 集成 ✅

- [x] 创建 `js/sermons-api.js` - 讲道管理 API 集成
- [x] 创建 `js/speakers-api.js` - 讲员管理 API 集成
- [x] 创建 `js/users-api.js` - 用户管理 API 集成
- [x] 创建 `js/curation-api.js` - 内容编排和主题组 API 集成

### 3. 已对接的页面 ✅

- [x] `login.html` - 登录页 (真实 API 登录)
- [x] `dashboard.html` - 仪表盘 (加载统计数据和活动)

---

## ⏳ 待完成的工作

### 1. HTML 页面更新 (手动完成)

#### 讲道管理模块

- [ ] **sermons.html** - 讲道列表页
  - [ ] 添加 API 脚本引用 (`api-config.js`, `api-client.js`, `api-services.js`, `sermons-api.js`)
  - [ ] 删除假数据数组（如果有）
  - [ ] 删除旧的初始化代码
  - [ ] 确认表格ID为 `sermonsTable`
  - [ ] 确认分页容器ID为 `pagination`

- [ ] **sermon-detail.html** - 讲道详情页
  - [ ] 添加 API 脚本引用
  - [ ] 删除假数据
  - [ ] 确认所有字段ID匹配（如 `sermonTitle`, `sermonSpeaker` 等）
  - [ ] 测试批准/拒绝功能

- [ ] **add-sermon.html** - 添加讲道页
  - [ ] 添加 API 脚本引用
  - [ ] 删除假的讲员/用户数据
  - [ ] 确认表单ID为 `addSermonForm`
  - [ ] 测试文件上传功能

#### 讲员管理模块

- [ ] **speakers.html** - 讲员列表页
  - [ ] 添加 API 脚本引用 (`api-config.js`, `api-client.js`, `api-services.js`, `speakers-api.js`)
  - [ ] 删除假数据数组
  - [ ] 确认表格ID为 `speakersTable`
  - [ ] 确认分页容器ID为 `pagination`

- [ ] **speaker-detail.html** - 讲员详情页
  - [ ] 添加 API 脚本引用
  - [ ] 删除假数据
  - [ ] 确认字段ID匹配
  - [ ] 测试讲员讲道列表加载

- [ ] **add-speaker.html** - 添加讲员页
  - [ ] 添加 API 脚本引用
  - [ ] 确认表单ID为 `addSpeakerForm`
  - [ ] 测试头像上传功能

#### 用户管理模块

- [ ] **users.html** - 用户列表页
  - [ ] 添加 API 脚本引用 (`api-config.js`, `api-client.js`, `api-services.js`, `users-api.js`)
  - [ ] 删除假数据数组
  - [ ] 确认表格ID为 `usersTable`
  - [ ] 确认统计卡片ID (`totalUsers`, `activeUsers`, `newUsers`, `disabledUsers`)

- [ ] **user-detail.html** - 用户详情页
  - [ ] 添加 API 脚本引用
  - [ ] 删除假数据
  - [ ] 确认字段ID匹配 (`userName`, `userEmail`, `userStatus` 等)
  - [ ] 测试编辑功能
  - [ ] 测试用户讲道列表加载

#### 内容编排模块

- [ ] **home-editor.html** - 首页编辑器
  - [ ] 添加 API 脚本引用 (`api-config.js`, `api-client.js`, `api-services.js`, `curation-api.js`)
  - [ ] 删除假数据
  - [ ] 测试模块配置保存

- [ ] **discover-editor.html** - 发现页编辑器
  - [ ] 添加 API 脚本引用
  - [ ] 删除假数据
  - [ ] 测试标签和模块配置

- [ ] **curation.html** - 编排概览页
  - [ ] 添加 API 脚本引用
  - [ ] 删除假数据
  - [ ] 测试经文管理功能

#### 主题组管理模块

- [ ] **topic-groups.html** - 主题组管理页
  - [ ] 添加 API 脚本引用 (`api-config.js`, `api-client.js`, `api-services.js`, `curation-api.js`)
  - [ ] 删除假数据
  - [ ] 确认表格ID为 `topicGroupsTable`
  - [ ] 确认统计卡片ID (`totalTopics`, `totalSermons`, `avgSermons`)
  - [ ] 测试创建/编辑/删除功能
  - [ ] 测试讲道添加/移除功能

---

## 🛠️ 快速更新方法

### 方法一：使用自动化脚本（推荐）

```bash
# 在 admin 目录下运行
node update-html-for-api.js
```

这个脚本会自动为所有需要的HTML文件添加 API 脚本引用。

### 方法二：手动更新

对于每个页面，在 `</head>` 标签之前添加：

```html
<!-- API Client -->
<script src="js/api-config.js"></script>
<script src="js/api-client.js"></script>
<script src="js/api-services.js"></script>
<!-- 根据页面功能添加对应模块脚本 -->
<script src="js/sermons-api.js"></script>
```

---

## 🧪 测试清单

### 基础功能测试

- [ ] **登录测试**
  - [ ] 输入正确的用户名密码可以登录
  - [ ] 登录成功后跳转到仪表盘
  - [ ] Token 保存在 localStorage

- [ ] **认证测试**
  - [ ] 未登录访问其他页面自动跳转登录页
  - [ ] 登出功能正常工作

- [ ] **仪表盘测试**
  - [ ] 统计数据正确显示
  - [ ] 待处理任务数量正确
  - [ ] 页面加载速度可接受

### 讲道管理测试

- [ ] **讲道列表页**
  - [ ] 列表正确加载
  - [ ] 搜索功能正常
  - [ ] 状态筛选正常
  - [ ] 分页功能正常
  - [ ] 删除功能正常

- [ ] **讲道详情页**
  - [ ] 详情正确显示
  - [ ] 音频播放器可用
  - [ ] 批准/拒绝功能正常
  - [ ] 删除功能正常

- [ ] **添加讲道页**
  - [ ] 表单验证正常
  - [ ] 音频上传功能正常
  - [ ] 封面上传功能正常
  - [ ] 讲员选择正常
  - [ ] 提交成功后跳转详情页

### 讲员管理测试

- [ ] **讲员列表页**
  - [ ] 列表正确加载
  - [ ] 搜索功能正常
  - [ ] 删除功能正常

- [ ] **讲员详情页**
  - [ ] 详情正确显示
  - [ ] 讲员讲道列表正确显示

- [ ] **添加讲员页**
  - [ ] 表单验证正常
  - [ ] 头像上传功能正常
  - [ ] 提交成功后跳转详情页

### 用户管理测试

- [ ] **用户列表页**
  - [ ] 列表正确加载
  - [ ] 搜索功能正常
  - [ ] 统计卡片显示正确
  - [ ] 状态切换功能正常

- [ ] **用户详情页**
  - [ ] 详情正确显示
  - [ ] 编辑功能正常
  - [ ] 用户讲道列表正确显示

### 内容编排测试

- [ ] **首页编辑器**
  - [ ] 配置正确加载
  - [ ] 内容选择器正常工作
  - [ ] 保存功能正常

- [ ] **发现页编辑器**
  - [ ] 配置正确加载
  - [ ] 标签管理正常
  - [ ] 保存功能正常

- [ ] **编排概览**
  - [ ] 经文列表正确显示
  - [ ] 添加经文功能正常
  - [ ] 精选内容显示正常

### 主题组管理测试

- [ ] **主题组管理页**
  - [ ] 列表正确加载
  - [ ] 搜索功能正常
  - [ ] 创建功能正常
  - [ ] 编辑功能正常
  - [ ] 删除功能正常
  - [ ] 添加讲道到主题组正常
  - [ ] 从主题组移除讲道正常

---

## 🐛 常见问题排查

### 问题 1: 页面显示空白

**检查项**:
- [ ] 浏览器控制台是否有 JavaScript 错误
- [ ] API 脚本是否正确引入
- [ ] 文件路径是否正确（特别是 `js/` 目录）

### 问题 2: API 请求失败

**检查项**:
- [ ] 后端 API 服务是否正在运行
- [ ] API Base URL 是否正确配置
- [ ] 浏览器控制台是否有 CORS 错误
- [ ] Network 标签中查看请求详情

### 问题 3: 数据不显示

**检查项**:
- [ ] 页面中的假数据是否已删除
- [ ] HTML 元素的 ID 是否与 API 脚本中的匹配
- [ ] API 响应数据结构是否正确
- [ ] 是否有数据（可能后端数据库为空）

### 问题 4: 上传功能不工作

**检查项**:
- [ ] 文件大小是否超过限制
- [ ] 文件格式是否支持
- [ ] 后端上传端点是否配置正确
- [ ] 浏览器控制台是否有错误

---

## 📝 更新记录

### 2025年11月4日 - v1.0

- ✅ 完成所有 API 基础架构
- ✅ 完成所有模块 API 集成脚本
- ✅ 完成 login.html 和 dashboard.html 的 API 对接
- ✅ 创建 API 集成指南文档
- ✅ 创建批量更新脚本

---

## 📞 支持

如遇问题，请参考:
- `API_INTEGRATION_GUIDE.md` - 详细的集成指南
- `TingDao_Project_Blueprint.md` - 项目总览文档
- Email: livingwater.99lamb@gmail.com

---

**检查清单维护者**: 开发团队  
**最后更新**: 2025年11月4日

