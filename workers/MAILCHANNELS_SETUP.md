# MailChannels 配置指南

## ✅ MailChannels 完整配置步骤

MailChannels 对 Cloudflare Workers 用户完全免费，无需 API Key。

---

## 📝 步骤 1: 配置 DNS 记录

前往 Cloudflare Dashboard → 域名 `tingdao.app` → DNS，添加以下 3 条记录：

### 1️⃣ SPF 记录（必需）
允许 MailChannels 代表你的域名发送邮件

```
类型: TXT
名称: @
内容: v=spf1 a mx include:relay.mailchannels.net ~all
TTL: Auto
代理状态: 仅 DNS（灰色云朵）
```

### 2️⃣ Domain Lockdown 记录（必需）
限制只有你的 Worker 可以使用 MailChannels 发送邮件

```
类型: TXT
名称: _mailchannels
内容: v=mc1 cfid=tingdao-api.living-water-tingdaoapp.workers.dev
TTL: Auto
代理状态: 仅 DNS（灰色云朵）
```

**重要：** `cfid=` 后面必须是你的 Worker 的完整域名！

### 3️⃣ DMARC 记录（强烈推荐）
提高邮件送达率，防止被标记为垃圾邮件

```
类型: TXT
名称: _dmarc
内容: v=DMARC1; p=none; rua=mailto:support@tingdao.app
TTL: Auto
代理状态: 仅 DNS（灰色云朵）
```

---

## 🔍 步骤 2: 验证 DNS 记录

等待 DNS 记录生效（通常 1-5 分钟），然后验证：

### 方法 1: 使用在线工具
- SPF: https://mxtoolbox.com/spf.aspx
  - 输入: `tingdao.app`
  - 应该看到 `include:relay.mailchannels.net`

- DMARC: https://mxtoolbox.com/dmarc.aspx
  - 输入: `tingdao.app`

### 方法 2: 使用命令行
```bash
# 查询 SPF 记录
dig TXT tingdao.app +short | grep spf

# 查询 Domain Lockdown 记录
dig TXT _mailchannels.tingdao.app +short

# 查询 DMARC 记录
dig TXT _dmarc.tingdao.app +short
```

**预期结果：**
```
# SPF
"v=spf1 a mx include:relay.mailchannels.net ~all"

# Domain Lockdown
"v=mc1 cfid=tingdao-api.living-water-tingdaoapp.workers.dev"

# DMARC
"v=DMARC1; p=none; rua=mailto:support@tingdao.app"
```

---

## 🧪 步骤 3: 测试邮件发送

### 在 iOS App 中测试：
1. 打开听道 App
2. 进入登录页 → 点击"忘记密码"
3. 输入你的邮箱（例如：`jerryyu077@gmail.com`）
4. 点击"提交重置请求"

### 检查结果：
1. **查看 App 反馈：** 应该显示"重置链接已发送"
2. **检查邮箱：** 查看收件箱和垃圾邮件文件夹
3. **查看 Workers 日志：**
   - 前往 https://dash.cloudflare.com
   - Workers & Pages → tingdao-api → Logs
   - 应该看到：
     ```
     📤 正在通过 MailChannels 发送密码重置邮件到: jerryyu077@gmail.com
     ✅ 密码重置邮件发送成功: {...}
     ```

---

## ❌ 常见错误排查

### 错误 1: `401 Authorization Required`
**原因：** Domain Lockdown 记录未正确配置

**解决方案：**
1. 检查 `_mailchannels` TXT 记录是否存在
2. 确认 `cfid=` 的值是你的 Worker 域名：`tingdao-api.living-water-tingdaoapp.workers.dev`
3. 等待 DNS 传播（5-10 分钟）
4. 重新测试

### 错误 2: `550 Domain not found`
**原因：** SPF 记录未正确配置

**解决方案：**
1. 检查 `@` TXT 记录是否包含 `include:relay.mailchannels.net`
2. 使用 `dig TXT tingdao.app` 验证
3. 等待 DNS 传播
4. 重新测试

### 错误 3: 邮件进入垃圾邮件
**原因：** 缺少 DMARC 或发件人信誉较低

**解决方案：**
1. 添加 DMARC 记录
2. 考虑添加 DKIM 签名（可选，但推荐）
3. 使用真实的发件人邮箱（不要使用 noreply@）

---

## 🚀 高级配置（可选）

### DKIM 签名
DKIM 可以进一步提高邮件送达率和安全性。

1. 生成 DKIM 密钥对：
```bash
# 使用 OpenSSL 生成私钥
openssl genrsa -out dkim_private.key 2048

# 生成公钥
openssl rsa -in dkim_private.key -pubout -outform der 2>/dev/null | openssl base64 -A
```

2. 添加 DKIM DNS 记录：
```
类型: TXT
名称: mailchannels._domainkey
内容: v=DKIM1; k=rsa; p=<你的公钥>
TTL: Auto
```

3. 更新 Workers 代码使用私钥：
```javascript
// 在 wrangler.toml 中添加环境变量
wrangler secret put DKIM_PRIVATE_KEY
# 粘贴 dkim_private.key 的内容
```

4. 修改 password-reset.js：
```javascript
personalizations: [{
  to: [{ email: email }],
  dkim_domain: 'tingdao.app',
  dkim_selector: 'mailchannels',
  dkim_private_key: env.DKIM_PRIVATE_KEY
}]
```

---

## 📊 监控和日志

### Cloudflare Workers 日志
实时查看邮件发送状态：
1. 访问: https://dash.cloudflare.com
2. Workers & Pages → tingdao-api → Logs
3. 查找包含 "MailChannels" 的日志

### DMARC 报告
如果配置了 DMARC，你会收到邮件送达报告到 `support@tingdao.app`

---

## 📌 快速检查清单

在测试前，确保：

- [ ] SPF 记录已添加且包含 `include:relay.mailchannels.net`
- [ ] Domain Lockdown 记录已添加（`_mailchannels` TXT）
- [ ] DMARC 记录已添加（`_dmarc` TXT）
- [ ] DNS 记录已生效（等待 5-10 分钟）
- [ ] Workers 代码已部署最新版本
- [ ] 发件人邮箱使用真实域名 `support@tingdao.app`

---

## 🔗 参考资源

- **MailChannels 官方文档**: https://mailchannels.zendesk.com/hc/en-us/articles/4565898358413-Sending-Email-from-Cloudflare-Workers-using-MailChannels-Send-API
- **Cloudflare Workers 集成指南**: https://blog.cloudflare.com/sending-email-from-workers-with-mailchannels/
- **SPF 检查工具**: https://mxtoolbox.com/spf.aspx
- **DMARC 检查工具**: https://mxtoolbox.com/dmarc.aspx

---

**最后更新：** 2025-11-19
**状态：** ✅ 已配置并测试

