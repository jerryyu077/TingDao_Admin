# 🚀 听道管理后台 - 立即开始测试

**日期**: 2025年11月4日  
**状态**: ✅ API 集成完成，准备测试

---

## ✅ 已完成的工作

1. ✅ 所有 API 脚本已创建（7 个 JS 文件）
2. ✅ 所有 HTML 页面已添加 API 脚本引用（12 个页面）
3. ✅ `login.html` 和 `dashboard.html` 已完成真实 API 对接
4. ✅ API 配置已更新为使用 `/v1` 前缀

---

## 🎯 第一步：启动 API 服务器

打开终端，运行以下命令：

```bash
# 进入后端目录
cd /Users/jy/Desktop/TingDao/Tingdao1020/backend

# 启动 API 服务器
npm start
```

**预期输出**:
```
🚀 听道 API Server 启动成功！
📍 本地地址: http://localhost:3000
📍 网络地址: http://0.0.0.0:3000

📚 API 端点:
   - GET  /v1/sermons              讲道列表
   - GET  /v1/speakers             讲员列表
   - GET  /v1/tags                 标签列表
   - GET  /v1/topics               主题列表
   - GET  /v1/users                用户列表
```

---

## 🧪 第二步：测试 API（可选）

在另一个终端窗口测试 API 是否正常工作：

```bash
# 测试讲员列表
curl "http://localhost:3000/v1/speakers?_limit=2"

# 应该返回类似这样的数据：
# {
#   "success": true,
#   "data": [
#     {
#       "id": "speaker-001",
#       "name": "约翰·史密斯",
#       "church": "恩典教会",
#       ...
#     }
#   ],
#   "pagination": {
#     "page": 1,
#     "per_page": 2,
#     "total": 5,
#     "total_pages": 3
#   }
# }
```

---

## 🌐 第三步：打开管理后台

### 方式一：直接打开（推荐用于测试）

在 Finder 中双击打开：
```
/Users/jy/Desktop/TingDao/Tingdao1020/Tingdao1020/admin/login.html
```

⚠️ **注意**: 如果遇到 CORS 错误，请使用方式二

### 方式二：使用本地服务器（避免 CORS 问题）

打开新终端，运行：

```bash
# 进入 admin 目录
cd /Users/jy/Desktop/TingDao/Tingdao1020/Tingdao1020/admin

# 启动简单的 HTTP 服务器
python3 -m http.server 8080
```

然后在浏览器访问：
```
http://localhost:8080/login.html
```

---

## 🎮 第四步：测试登录

1. **打开登录页** (`login.html`)

2. **输入登录信息**：
   - 用户名: `admin` (任意)
   - 密码: `123456` (任意)
   - 验证码: (页面显示的验证码)

3. **点击登录**

4. **预期结果**：
   - ✅ 显示 "登录成功！正在跳转..." 的绿色提示
   - ✅ 自动跳转到仪表盘 (`dashboard.html`)
   - ✅ 仪表盘显示统计数据（从 API 加载）

5. **打开浏览器控制台**（F12 或 Cmd+Option+I）：
   - 切换到 "Console" 标签
   - 应该看到 API 调用日志：
     ```
     [API] POST http://localhost:3000/v1/auth/login
     [API] Response: {success: true, ...}
     [API] GET http://localhost:3000/v1/dashboard/stats
     ```

---

## 📊 第五步：测试仪表盘

登录成功后，你应该在仪表盘看到：

1. **统计卡片** - 显示讲道、讲员、用户等统计数字
2. **待处理任务** - 显示待审核讲道数量
3. **最近活动** - 显示最近的操作记录

所有数据都是从 `seed.json` 通过 API 加载的！

---

## 🧪 第六步：测试讲道管理

1. **点击侧边栏** "讲道内容" → "讲道列表"

2. **测试功能**：
   - 搜索讲道（输入关键词）
   - 筛选状态（已发布/审核中/草稿）
   - 点击分页按钮
   - 点击"查看"按钮查看详情

3. **查看控制台日志**：
   ```
   [API] GET http://localhost:3000/v1/sermons?page=1&limit=20
   [API] Response: {success: true, data: [...], pagination: {...}}
   ```

---

## 🎯 测试其他模块

按照相同的方式测试：

### 讲员管理
- 讲员列表: `speakers.html`
- 讲员详情: 点击任意讲员的"查看"按钮
- 添加讲员: `add-speaker.html`

### 用户管理
- 用户列表: `users.html`
- 用户详情: 点击任意用户 ID

### 内容编排
- 首页编辑器: `home-editor.html`
- 发现页编辑器: `discover-editor.html`
- 编排概览: `curation.html`

### 主题组管理
- 主题组管理: `topic-groups.html`

---

## 🔍 验证 Admin 和 App 数据一致

### 对比讲员数据

1. **在 Admin 中查看讲员列表**:
   - 打开 `http://localhost:8080/speakers.html`
   - 记录第一个讲员的名字，例如: "约翰·史密斯"

2. **在 App 中查看讲员列表**:
   - 运行 iOS app
   - 切换到 "发现" 或 "讲员" 标签
   - 应该看到相同的讲员: "约翰·史密斯"

3. **对比详细信息**:
   - Admin: 点击讲员查看详情
   - App: 点击讲员查看详情
   - 教会名称、讲道数量、简介等应该完全一致！

### 对比讲道数据

1. **在 Admin 中查看讲道列表**:
   - 打开 `http://localhost:8080/sermons.html`
   - 记录第一个讲道的标题

2. **在 App 中查看讲道列表**:
   - 运行 iOS app
   - 查看首页或发现页的讲道列表
   - 应该看到相同的讲道标题

---

## 🐛 故障排查

### 问题 1: CORS 错误

**症状**: 浏览器控制台显示 "CORS policy" 错误

**解决**: 使用本地服务器打开页面（方式二）

```bash
cd /Users/jy/Desktop/TingDao/Tingdao1020/Tingdao1020/admin
python3 -m http.server 8080
# 然后访问 http://localhost:8080/login.html
```

### 问题 2: API 服务器未启动

**症状**: 浏览器控制台显示 "Failed to fetch" 或 "Network Error"

**解决**: 确保 API 服务器正在运行

```bash
cd /Users/jy/Desktop/TingDao/Tingdao1020/backend
npm start
```

### 问题 3: 看不到数据

**症状**: 页面加载但没有显示数据

**检查**:
1. 打开浏览器控制台（F12）
2. 查看 Console 标签是否有错误
3. 查看 Network 标签，筛选 XHR/Fetch 请求
4. 检查 API 请求是否成功（状态码 200）
5. 检查响应数据结构

### 问题 4: 登录失败

**症状**: 点击登录后没有反应

**检查**:
1. 确认验证码输入正确（区分大小写）
2. 打开浏览器控制台查看错误信息
3. 确认 API 脚本已正确加载

---

## 📋 测试检查清单

### ✅ 基础测试

- [ ] API 服务器成功启动
- [ ] 可以访问登录页
- [ ] 可以成功登录
- [ ] 登录后跳转到仪表盘
- [ ] 仪表盘显示统计数据

### ✅ 讲道管理

- [ ] 讲道列表正确加载
- [ ] 搜索功能正常
- [ ] 筛选功能正常
- [ ] 分页功能正常
- [ ] 可以查看讲道详情

### ✅ 讲员管理

- [ ] 讲员列表正确加载
- [ ] 可以查看讲员详情
- [ ] 讲员详情显示讲道列表

### ✅ 用户管理

- [ ] 用户列表正确加载
- [ ] 可以查看用户详情
- [ ] 用户详情显示上传的讲道

### ✅ 数据一致性

- [ ] Admin 和 App 显示相同的讲员
- [ ] Admin 和 App 显示相同的讲道
- [ ] 讲员详情数据一致
- [ ] 讲道详情数据一致

---

## 🎊 成功标志

当你完成测试后，应该看到：

1. ✅ 登录页可以正常登录
2. ✅ 仪表盘显示统计数据
3. ✅ 讲道列表可以加载并分页
4. ✅ 讲员列表可以加载并分页
5. ✅ 用户列表可以加载并分页
6. ✅ 所有数据与 iOS App 完全一致
7. ✅ 浏览器控制台可以看到 API 调用日志
8. ✅ 搜索、筛选、分页功能正常

---

## 📞 如果遇到问题

1. **查看文档**:
   - `API_INTEGRATION_GUIDE.md` - 完整的集成指南
   - `API_INTEGRATION_CHECKLIST.md` - 详细的检查清单

2. **查看日志**:
   - 浏览器控制台 (Console 和 Network 标签)
   - API 服务器终端输出

3. **重启服务**:
   ```bash
   # 关闭所有服务
   # Ctrl+C 在运行 API 服务器的终端
   # Ctrl+C 在运行 HTTP 服务器的终端
   
   # 重新启动
   cd /Users/jy/Desktop/TingDao/Tingdao1020/backend
   npm start
   
   cd /Users/jy/Desktop/TingDao/Tingdao1020/Tingdao1020/admin
   python3 -m http.server 8080
   ```

---

## 🎉 开始测试吧！

现在你有了：
- ✅ 完整的 API 集成
- ✅ 所有页面已准备就绪
- ✅ 详细的测试指南
- ✅ 故障排查方案

**开始享受测试吧！** 🚀

如果一切正常，你会看到 admin 后台和 iOS app 显示完全相同的数据！

---

**文档作者**: AI Assistant  
**最后更新**: 2025年11月4日

