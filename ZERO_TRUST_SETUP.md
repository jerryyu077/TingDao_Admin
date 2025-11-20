# Cloudflare Zero Trust 配置说明

## 📋 当前状态

✅ **登录检查已临时禁用**

Admin 面板现在通过 **Cloudflare Zero Trust** 保护，无需内置登录系统。

## 🔧 已修改的文件

### 1. `index.html`
- 移除了登录检查逻辑
- 直接跳转到 `dashboard.html`
- 保留了原代码注释，方便重新启用

### 2. `assets/js/common.js`
- `checkAuth()` 函数现在始终返回 `true`
- 保留了原登录检查代码（已注释）
- 方便未来重新启用

## 🔄 如何重新启用登录

如果未来需要重新启用内置登录系统，请参考代码中的 TODO 注释。

## 🛡️ Cloudflare Zero Trust 配置

### 访问策略建议

1. **应用名称**: TingDao Admin Panel
2. **域名**: `admin.tingdao.app`
3. **认证方式**: Email OTP / Google OAuth / GitHub OAuth

### 允许的用户
- 添加管理员的邮箱地址
- 或使用 Email Domain 规则

### 会话时长
- 建议设置为 24 小时

## 📝 注意事项

1. **API 认证**: 后端 API 仍然需要认证
2. **开发环境**: 本地开发时 Zero Trust 不生效
3. **部署**: 推送到 GitHub 后自动部署

---

**最后更新**: 2025-01-20
