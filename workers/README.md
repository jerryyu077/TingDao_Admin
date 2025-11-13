# TingDao API - Cloudflare Workers

TingDao讲道平台的后端API，基于Cloudflare Workers + D1数据库构建。

## 📁 项目结构

```
workers/
├── src/
│   ├── index.js              # 主入口，路由分发
│   ├── routes/               # API路由模块
│   │   ├── sermons.js       # 讲道API
│   │   ├── speakers.js      # 讲员API
│   │   ├── users.js         # 用户API
│   │   ├── topics.js        # 主题API
│   │   └── home.js          # 首页配置API
│   └── utils/               # 工具函数
│       ├── response.js      # 响应格式化
│       └── db.js            # 数据库查询封装
├── wrangler.toml            # Workers配置
├── package.json             # 项目配置
└── README.md                # 本文档

## 🚀 快速开始

### 1. 安装依赖

```bash
cd /Users/jy/Desktop/TingDao/Tingdao1020/Tingdao1020/admin/workers
npm install
```

### 2. 本地开发

```bash
npm run dev
# 访问: http://localhost:8787/api/v1/sermons
```

### 3. 部署到Cloudflare

```bash
npm run deploy
# 或
wrangler deploy
```

## 📡 API端点

### 基础URL
- **开发**: `http://localhost:8787/api/v1/`
- **生产**: `https://your-worker.workers.dev/api/v1/` 或 `https://admin.tingdao.app/api/v1/`

### Sermons (讲道)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/v1/sermons` | 获取讲道列表（支持分页、搜索、过滤） |
| GET | `/v1/sermons/:id` | 获取单个讲道详情 |
| POST | `/v1/sermons` | 创建新讲道 |
| PUT | `/v1/sermons/:id` | 更新讲道 |
| PATCH | `/v1/sermons/:id` | 更新讲道状态 |
| DELETE | `/v1/sermons/:id` | 删除讲道 |

**查询参数**:
- `_page`: 页码 (默认: 1)
- `_limit`: 每页数量 (默认: 10)
- `status`: 状态过滤 (pending, published, rejected, returned)
- `speaker_id`: 讲员ID过滤
- `q`: 搜索关键词
- `_sort`: 排序字段 (默认: publish_date)
- `_order`: 排序方向 (asc, desc)

### Speakers (讲员)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/v1/speakers` | 获取讲员列表 |
| GET | `/v1/speakers/:id` | 获取单个讲员 |
| POST | `/v1/speakers` | 创建讲员 |
| PUT | `/v1/speakers/:id` | 更新讲员 |
| PATCH | `/v1/speakers/:id` | 更新讲员状态 |
| DELETE | `/v1/speakers/:id` | 删除讲员 |

### Users (用户)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/v1/users` | 获取用户列表 |
| GET | `/v1/users/:id` | 获取单个用户 |
| PUT | `/v1/users/:id` | 更新用户 |
| PATCH | `/v1/users/:id` | 更新用户状态 |

### Topics (主题)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/v1/topics` | 获取主题列表 |
| GET | `/v1/topics/:id` | 获取单个主题 |
| POST | `/v1/topics` | 创建主题 |
| PUT | `/v1/topics/:id` | 更新主题 |
| PUT | `/v1/topics/:id/sermons` | 更新主题的讲道列表 |
| PATCH | `/v1/topics/:id` | 更新主题状态 |
| DELETE | `/v1/topics/:id` | 删除主题 |

### Home & Config (首页配置)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/v1/home/config` | 获取首页配置 |
| PUT | `/v1/home/config` | 更新首页配置 |
| GET | `/v1/curation/home-config` | 获取首页配置（兼容旧API） |
| GET | `/v1/launch-screen` | 获取启动页配置 |
| PUT | `/v1/launch-screen` | 更新启动页配置 |

## 📝 响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... }
}
```

### 分页响应

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "资源不存在"
  }
}
```

## 🔧 配置

### wrangler.toml

```toml
name = "tingdao-api"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "tingdao-db"
database_id = "d6954ace-9f75-4135-8814-8ad08c12d499"
```

## 🛠️ 开发工具

### 查看日志

```bash
npm run tail
# 或
wrangler tail
```

### 测试API

```bash
curl https://your-worker.workers.dev/api/v1/sermons
```

## 📚 相关文档

- [Cloudflare Workers文档](https://developers.cloudflare.com/workers/)
- [D1数据库文档](https://developers.cloudflare.com/d1/)
- [Wrangler CLI文档](https://developers.cloudflare.com/workers/wrangler/)

## 🔐 安全注意事项

1. **CORS**: 当前允许所有来源 (`Access-Control-Allow-Origin: *`)，生产环境建议限制为特定域名
2. **认证**: 未实现认证机制，建议添加JWT或API Key验证
3. **速率限制**: 未实现速率限制，建议添加防滥用机制

## 📄 许可证

MIT License

