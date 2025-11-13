# TingDao Admin Panel

听道（TingDao）管理后台系统 - 用于管理讲道内容、讲员、用户和主题的Web管理面板

## 📋 项目简介

这是听道（TingDao）项目的管理后台，提供了完整的内容管理功能，包括：

- 📖 **讲道管理**: 讲道列表、详情编辑、审核、批量操作
- 👤 **讲员管理**: 讲员列表、详情编辑、添加新讲员
- 👥 **用户管理**: 用户列表、权限管理、状态控制
- 🏷️ **主题管理**: 主题组创建、编辑、sermon关联
- 🏠 **首页配置**: 推荐讲道、每日经文、热门讲员
- 🔍 **发现页配置**: 筛选标签、每日推荐、热门主题
- 🖼️ **开屏页配置**: 启动图片和经文配置

## 🛠️ 技术栈

- **前端框架**: 纯HTML5 + Vanilla JavaScript
- **CSS框架**: Tailwind CSS + DaisyUI
- **图标库**: Iconify
- **API通信**: Fetch API
- **部署平台**: Cloudflare Pages

## 📁 项目结构

```
admin/
├── index.html                    # 登录页面
├── dashboard.html                # 仪表板
├── home-editor.html              # 首页配置
├── discover-editor.html          # 发现页配置
├── launch-screen-editor.html     # 开屏页配置
├── sermons.html                  # 讲道列表
├── sermon-detail.html            # 讲道详情
├── add-sermon.html               # 添加讲道
├── speakers.html                 # 讲员列表
├── speaker-detail.html           # 讲员详情
├── add-speaker.html              # 添加讲员
├── users.html                    # 用户列表
├── user-detail.html              # 用户详情
├── topic-groups.html             # 主题组管理
├── js/                           # JavaScript文件
│   ├── api-config.js             # API配置
│   ├── api-client.js             # API客户端
│   └── ...                       # 其他JS文件
├── assets/                       # 静态资源
│   ├── css/                      # CSS文件
│   ├── images/                   # 图片资源
│   └── icons/                    # 图标资源
└── README.md                     # 项目说明
```

## 🚀 快速开始

### 本地开发

1. **克隆仓库**
```bash
git clone https://github.com/jerryyu077/TingDao_Admin.git
cd TingDao_Admin
```

2. **启动本地服务器**

可以使用任何静态服务器，例如：

使用Python:
```bash
python3 -m http.server 8080
```

或使用Node.js的http-server:
```bash
npx http-server -p 8080
```

3. **访问管理面板**
```
http://localhost:8080
```

### 配置API端点

编辑 `js/api-config.js` 文件，设置你的API端点：

```javascript
const API_CONFIG = {
    baseURL: 'https://your-api-endpoint.com',
    // 其他配置...
};
```

## 🌐 Cloudflare Pages部署

### 自动部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** > **Create a project**
3. 连接到GitHub仓库 `TingDao_Admin`
4. 配置构建设置：
   - **Build command**: 留空（静态文件）
   - **Build output directory**: `/`
   - **Root directory**: `/`
5. 点击 **Save and Deploy**

### 环境变量设置

在Cloudflare Pages项目设置中添加环境变量：

- `API_BASE_URL`: 你的API Worker URL
- 其他必要的配置变量

### 自定义域名

在Cloudflare Pages项目中：
1. 进入 **Custom domains**
2. 添加你的域名
3. 配置DNS记录

## 📖 功能说明

### 讲道管理
- ✅ 搜索和筛选（按标题、提交者、状态）
- ✅ 批量操作（批量批准、批量退回）
- ✅ 状态管理（待审核、已发布、已退回、已拒绝）
- ✅ 详情编辑（标题、摘要、经文、标签、图片、音频）

### 讲员管理
- ✅ 搜索和筛选（按名称、教会、状态）
- ✅ 批量激活/停用
- ✅ 详情编辑（基本信息、头像、联系方式）
- ✅ 近期讲道展示

### 用户管理
- ✅ 用户列表和搜索
- ✅ 批量激活/禁用
- ✅ 用户详情编辑
- ✅ Sermon统计

### 主题组管理
- ✅ 创建自定义主题组
- ✅ 编辑主题组（名称、描述、图片、状态）
- ✅ 添加/移除sermon
- ✅ 系统主题管理

## 🔐 安全性

- 所有API请求都需要认证
- 支持JWT Token认证
- HTTPS加密传输
- XSS防护
- CSRF保护

## 📊 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

- 项目主页: https://github.com/jerryyu077/TingDao_Admin
- 主项目: https://github.com/jerryyu077/TingDao

---

**TingDao Admin Panel** - 为神的话语传播提供便捷的管理工具 🙏
