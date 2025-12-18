# Cloudflare CDN 优化配置指南

## 📋 配置清单

### 1. Auto Minify（自动压缩）

**路径**: Dashboard → Speed → Optimization

**配置**:
- ✅ JavaScript
- ✅ CSS  
- ✅ HTML

**效果**: 减少文件大小 20-30%

---

### 2. Brotli 压缩

**路径**: Dashboard → Speed → Optimization

**配置**:
- ✅ 开启 Brotli

**效果**: 比 Gzip 压缩率提升 15-20%

---

### 3. 缓存规则（Page Rules）

**路径**: Dashboard → Rules → Page Rules

#### 规则 1: 媒体文件缓存
```
URL: media.tingdao.app/*
设置:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 day
```

#### 规则 2: API 响应缓存
```
URL: admin.tingdao.app/api/v1/*
设置:
  - Cache Level: Standard
  - Edge Cache TTL: 5 minutes
  - Browser Cache TTL: 0 (no cache)
```

#### 规则 3: Admin 静态资源
```
URL: admin.tingdao.app/assets/*
设置:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 week
  - Browser Cache TTL: 1 day
```

---

### 4. Image Optimization（图片优化）

**路径**: Dashboard → Speed → Optimization

**配置**:
- ✅ Polish: Lossless
- ✅ WebP
- ✅ Mirage (自适应图片加载)

**效果**: 图片大小减少 30-50%

---

### 5. Rocket Loader（可选）

**路径**: Dashboard → Speed → Optimization

**配置**:
- ⚠️ 谨慎开启（可能影响 JavaScript 执行顺序）

**建议**: 先测试，如果没问题再开启

---

### 6. Early Hints

**路径**: Dashboard → Speed → Optimization

**配置**:
- ✅ 开启 Early Hints

**效果**: 提前加载关键资源，减少首屏加载时间

---

## 🔧 Workers 配置优化

在 `wrangler.toml` 中添加：

```toml
[build]
command = "npm run build"

[site]
bucket = "./dist"

# 缓存配置
[env.production]
vars = { ENVIRONMENT = "production" }

# 路由配置
[[routes]]
pattern = "admin.tingdao.app/api/v1/*"
zone_name = "tingdao.app"

[[routes]]
pattern = "admin.tingdao.app/*"
zone_name = "tingdao.app"
```

---

## 📊 验证优化效果

### 使用 Cloudflare Analytics

1. Dashboard → Analytics → Performance
2. 查看指标:
   - Time to First Byte (TTFB)
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cache Hit Ratio

### 使用 Chrome DevTools

1. 打开 Network 面板
2. 勾选 "Disable cache"
3. 刷新页面
4. 查看:
   - 总加载时间
   - 资源大小
   - Cache 状态（from disk cache / from memory cache）

---

## ✅ 配置完成检查

- [ ] Auto Minify 已开启
- [ ] Brotli 已开启
- [ ] 媒体文件缓存规则已创建
- [ ] API 缓存规则已创建
- [ ] 静态资源缓存规则已创建
- [ ] Image Optimization 已配置
- [ ] Early Hints 已开启
- [ ] 使用 Analytics 验证效果

---

## 🎯 预期性能提升

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| TTFB | ~500ms | ~150ms | 70% ↓ |
| 首屏加载 | ~2s | ~800ms | 60% ↓ |
| 图片大小 | ~500KB | ~200KB | 60% ↓ |
| 缓存命中率 | ~30% | ~80% | 167% ↑ |

---

**配置日期**: 2025年11月21日  
**配置人**: 开发团队



