# Future You - Cloudflare Workers 后端

> Future You 项目的 Cloudflare Workers 全栈后端实现

## 📁 文件说明

### 核心文件

- **worker.js** - Cloudflare Worker 主文件（包含所有 API 路由和业务逻辑）
- **wrangler.toml** - Wrangler 配置文件（Worker 名称、KV 绑定、环境变量）
- **migrate-kv.sh** - 数据迁移 Shell 脚本（推荐使用）
- **migrate-to-kv.js** - 数据迁移 Node.js 脚本（备选方案）

### 文档

- **Cloudflare部署指南.md** - 详细的部署步骤说明
- **CloudflareWorkers-README.md** - 本文件

## 🚀 快速开始

### 1. 前置要求

- Cloudflare 账户（免费计划即可）
- Node.js >= 18.0.0
- npm 或 yarn
- Wrangler CLI

### 2. 安装 Wrangler

```bash
npm install -g wrangler
```

### 3. 登录 Cloudflare

```bash
wrangler login
```

### 4. 创建 KV 命名空间

```bash
wrangler kv:namespace create "USERS"
wrangler kv:namespace create "LETTERS"
wrangler kv:namespace create "PARTNERSHIPS"
wrangler kv:namespace create "PARTNERSHIP_REQUESTS"
wrangler kv:namespace create "IMAGES"
```

### 5. 配置 wrangler.toml

将返回的 KV 命名空间 ID 填入 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "USERS"
id = "YOUR_USERS_NAMESPACE_ID"
```

### 6. 设置环境变量

```bash
wrangler secret put JWT_SECRET
```

输入一个安全的随机字符串。

### 7. 本地测试

```bash
wrangler dev
```

### 8. 部署到 Cloudflare

```bash
wrangler deploy
```

## 📊 数据迁移

### 方法 1：使用 Shell 脚本（推荐）

1. 编辑 `migrate-kv.sh`，配置 KV 命名空间 ID：

```bash
USERS_NS="YOUR_USERS_NAMESPACE_ID"
LETTERS_NS="YOUR_LETTERS_NAMESPACE_ID"
# ... 其他配置
```

2. 给脚本添加执行权限：

```bash
chmod +x migrate-kv.sh
```

3. 运行迁移：

```bash
./migrate-kv.sh
```

### 方法 2：使用 Node.js 脚本

1. 编辑 `migrate-to-kv.js`，配置凭证和 KV ID

2. 运行迁移：

```bash
node migrate-to-kv.js
```

## 📡 API 端点

### 认证

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/check-username` - 检查用户名

### 用户

- `GET /api/user/info` - 获取用户信息（需要认证）
- `PUT /api/user/info` - 更新用户信息（需要认证）
- `DELETE /api/user/account` - 删除账号（需要认证）

### 情侣关系

- `POST /api/partner/apply` - 发起结对申请（需要认证）
- `GET /api/partner/applications/pending` - 获取待处理申请（需要认证）
- `GET /api/partner/applications/sent` - 获取发送的申请（需要认证）
- `POST /api/partner/applications/:id/accept` - 接受申请（需要认证）
- `POST /api/partner/applications/:id/reject` - 拒绝申请（需要认证）
- `GET /api/partner/my` - 获取我的情侣信息（需要认证）
- `POST /api/partner/dissolve` - 解除情侣关系（需要认证）

### 信件

- `POST /api/letter` - 创建信件（需要认证）
- `GET /api/letter/sent` - 获取发送的信件（需要认证）
- `GET /api/letter/received` - 获取收到的信件（需要认证）
- `GET /api/letter/:id` - 获取信件详情（需要认证）
- `DELETE /api/letter/:id` - 删除信件（需要认证）

### 健康检查

- `GET /api/health` - API 健康检查

## 🔧 配置说明

### wrangler.toml 配置项

```toml
name = "future-you-backend"        # Worker 名称
main = "worker.js"                 # 主文件
compatibility_date = "2024-04-01"  # 兼容性日期

# KV 命名空间绑定
[[kv_namespaces]]
binding = "USERS"                   # Worker 中的引用名
id = "xxx"                         # KV 命名空间 ID

# 环境变量
[vars]
CORS_ORIGIN = "*"                   # CORS 允许的源
```

### 环境变量

通过 `wrangler secret` 设置的敏感变量：

- `JWT_SECRET` - JWT 签名密钥（必须）
- `CORS_ORIGIN` - CORS 允许的前端域名（可选）

## 🔐 安全建议

1. **JWT Secret**: 使用强随机字符串，至少 32 字符
2. **CORS**: 生产环境使用特定域名，不要使用 `*`
3. **HTTPS**: 确保 API 使用 HTTPS
4. **Rate Limiting**: 考虑实现请求限流

## 📈 性能优化

- KV 读取有一定延迟（约 100-200ms）
- 考虑使用 Cache API 缓存频繁访问的数据
- 优化查询逻辑，减少 KV 操作次数
- 对于大规模数据，考虑使用 D1 数据库

## 🐛 故障排除

### 常见问题

1. **部署失败**
   ```bash
   wrangler login  # 重新登录
   wrangler deploy
   ```

2. **KV 绑定错误**
   - 检查 wrangler.toml 中的 KV ID 是否正确
   - 确认 KV 命名空间已创建

3. **JWT 错误**
   ```bash
   wrangler secret list  # 检查 secret
   wrangler secret put JWT_SECRET  # 重新设置
   ```

4. **CORS 错误**
   - 检查 worker.js 中的 CORS 头设置
   - 确保 CORS_ORIGIN 配置正确

## 📚 参考文档

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare KV 文档](https://developers.cloudflare.com/kv/)
- [详细部署指南](./Cloudflare部署指南.md)

## 💡 功能特性

### 已实现

- ✅ 用户注册和登录
- ✅ JWT 认证
- ✅ 情侣结对申请流程
- ✅ 信件创建和管理
- ✅ 数据持久化（KV）
- ✅ CORS 支持
- ✅ 错误处理
- ✅ API 健康检查

### 待实现

- ⏳ 文件上传（背景图片、音频）
- ⏳ 定时任务（信件自动发送）
- ⏳ 邮件通知
- ⏳ API 限流
- ⏳ 日志和监控

## 🎯 下一步

1. 实现文件上传功能（使用 R2）
2. 添加定时任务（Cloudflare Cron Triggers）
3. 实现邮件通知
4. 添加性能监控
5. 优化缓存策略

## 📞 支持

如有问题，请查看：

1. [Cloudflare部署指南.md](./Cloudflare部署指南.md) - 详细部署步骤
2. [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
3. [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

## 📄 许可证

MIT

---

**Made with 💕 for Future You**
