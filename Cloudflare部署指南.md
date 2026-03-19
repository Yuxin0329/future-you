# Future You - Cloudflare Workers 部署指南

> 将 Future You 项目全栈迁移到 Cloudflare Workers 的完整指南

## 📋 目录

- [准备工作](#准备工作)
- [创建 Cloudflare 账户](#创建-cloudflare-账户)
- [安装 Wrangler CLI](#安装-wrangler-cli)
- [创建 KV 命名空间](#创建-kv-命名空间)
- [配置环境变量](#配置环境变量)
- [部署 Worker](#部署-worker)
- [数据迁移](#数据迁移)
- [测试 API](#测试-api)
- [配置自定义域名（可选）](#配置自定义域名可选)
- [前端配置更新](#前端配置更新)
- [故障排除](#故障排除)

## 准备工作

### 1. 所需工具

- Node.js >= 18.0.0
- npm 或 yarn
- Cloudflare 账户（免费计划即可）
- Git

### 2. 项目文件

确保你有以下文件：

```
future-you/
├── worker.js                    # Cloudflare Worker 主文件
├── wrangler.toml                # Wrangler 配置文件
├── migrate-to-kv.js            # 数据迁移脚本
├── server/data/                 # 原始 JSON 数据文件
│   ├── users.json
│   ├── letters.json
│   ├── partnerships.json
│   └── partnershipApplications.json
└── client/                      # 前端项目
```

## 创建 Cloudflare 账户

### 1. 注册账户

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击 "Sign Up" 创建免费账户
3. 验证邮箱地址

### 2. 获取 API Token

1. 登录 Cloudflare Dashboard
2. 进入 "My Profile" → "API Tokens"
3. 点击 "Create Token"
4. 使用 "Edit Cloudflare Workers" 模板
5. 权限设置：
   - Account → Workers Scripts → Edit
   - Account → Workers KV Storage → Edit
6. 设置资源为 "Include → All accounts" 或特定账户
7. 点击 "Continue to summary" → "Create Token"
8. **复制并保存 Token**（只显示一次！）

### 3. 获取 Account ID

1. 在 Cloudflare Dashboard 右侧找到 "Account ID"
2. 点击复制

## 安装 Wrangler CLI

```bash
# 全局安装 Wrangler
npm install -g wrangler

# 验证安装
wrangler --version
```

### 登录 Cloudflare

```bash
# 登录（会打开浏览器授权）
wrangler login
```

或者使用 API Token 登录：

```bash
# 创建配置文件
mkdir -p ~/.config/wrangler
cat > ~/.config/wrangler/config.toml << EOF
[api_token]
value = "YOUR_CLOUDFLARE_API_TOKEN"
EOF
```

## 创建 KV 命名空间

### 1. 创建 Production 环境 KV

```bash
# 创建用户数据 KV
wrangler kv:namespace create "USERS"

# 创建信件数据 KV
wrangler kv:namespace create "LETTERS"

# 创建情侣关系 KV
wrangler kv:namespace create "PARTNERSHIPS"

# 创建情侣申请 KV
wrangler kv:namespace create "PARTNERSHIP_REQUESTS"

# 创建图片存储 KV
wrangler kv:namespace create "IMAGES"
```

每个命令会返回类似以下输出：

```
{ binding = "USERS", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
```

**保存每个命名空间的 ID！**

### 2. 创建 Preview 环境 KV（可选）

```bash
# 创建 Preview 环境 KV
wrangler kv:namespace create "USERS" --preview
wrangler kv:namespace create "LETTERS" --preview
wrangler kv:namespace create "PARTNERSHIPS" --preview
wrangler kv:namespace create "PARTNERSHIP_REQUESTS" --preview
wrangler kv:namespace create "IMAGES" --preview
```

### 3. 更新 wrangler.toml

将返回的 KV 命名空间 ID 填入 `wrangler.toml`：

```toml
name = "future-you-backend"
main = "worker.js"
compatibility_date = "2024-04-01"

# Production KV 命名空间
[[kv_namespaces]]
binding = "USERS"
id = "YOUR_USERS_NAMESPACE_ID"

[[kv_namespaces]]
binding = "LETTERS"
id = "YOUR_LETTERS_NAMESPACE_ID"

[[kv_namespaces]]
binding = "PARTNERSHIPS"
id = "YOUR_PARTNERSHIPS_NAMESPACE_ID"

[[kv_namespaces]]
binding = "PARTNERSHIP_REQUESTS"
id = "YOUR_PARTNERSHIP_REQUESTS_NAMESPACE_ID"

[[kv_namespaces]]
binding = "IMAGES"
id = "YOUR_IMAGES_NAMESPACE_ID"

# Preview KV 命名空间
[[kv_namespaces]]
binding = "USERS"
id = "YOUR_PREVIEW_USERS_NAMESPACE_ID"
preview_id = true

[[kv_namespaces]]
binding = "LETTERS"
id = "YOUR_PREVIEW_LETTERS_NAMESPACE_ID"
preview_id = true

[[kv_namespaces]]
binding = "PARTNERSHIPS"
id = "YOUR_PREVIEW_PARTNERSHIPS_NAMESPACE_ID"
preview_id = true

[[kv_namespaces]]
binding = "PARTNERSHIP_REQUESTS"
id = "YOUR_PREVIEW_PARTNERSHIP_REQUESTS_NAMESPACE_ID"
preview_id = true

[[kv_namespaces]]
binding = "IMAGES"
id = "YOUR_PREVIEW_IMAGES_NAMESPACE_ID"
preview_id = true

[vars]
CORS_ORIGIN = "*"
```

## 配置环境变量

### 1. 设置 JWT 密钥（生产环境）

```bash
# 设置 JWT Secret（必须！）
wrangler secret put JWT_SECRET

# 输入一个安全的随机字符串，例如：
# my-super-secret-jwt-key-for-production-2024
```

**重要：** JWT_SECRET 必须设置为 secret，不要在代码中明文存储！

### 2. （可选）设置其他环境变量

```bash
# 设置 CORS 源（如果需要限制访问）
wrangler secret put CORS_ORIGIN

# 输入允许的前端域名，例如：
# https://your-frontend.netlify.app
```

## 部署 Worker

### 1. 本地测试

```bash
# 启动本地开发服务器
wrangler dev

# 在浏览器中打开 http://localhost:8787
```

### 2. 部署到 Cloudflare

```bash
# 部署到 Production 环境
wrangler deploy

# 部署成功后会显示：
# Published future-you-backend (1.23 sec)
#   https://future-you-backend.YOUR_SUBDOMAIN.workers.dev
```

**保存 Worker URL！** 这是你后端的完整地址。

### 3. 验证部署

```bash
# 测试健康检查
curl https://future-you-backend.YOUR_SUBDOMAIN.workers.dev/api/health

# 应该返回：
# {"status":"ok","message":"Future You API is running"}
```

## 数据迁移

### 方法 1：使用 wrangler CLI（推荐）

#### 单个文件迁移

```bash
# 1. 读取用户数据
cat server/data/users.json | jq -c '.[]' | while read user; do
  USER_ID=$(echo $user | jq -r '._id')
  echo "$user" | wrangler kv:key put --namespace-id=YOUR_USERS_NAMESPACE_ID "user:$USER_ID"
done

# 2. 读取信件数据
cat server/data/letters.json | jq -c '.[]' | while read letter; do
  LETTER_ID=$(echo $letter | jq -r '._id')
  echo "$letter" | wrangler kv:key put --namespace-id=YOUR_LETTERS_NAMESPACE_ID "letter:$LETTER_ID"
done

# 3. 读取情侣关系数据
cat server/data/partnerships.json | jq -c '.[]' | while read partnership; do
  PARTNERSHIP_ID=$(echo $partnership | jq -r '._id')
  echo "$partnership" | wrangler kv:key put --namespace-id=YOUR_PARTNERSHIPS_NAMESPACE_ID "partnership:$PARTNERSHIP_ID"
done

# 4. 读取情侣申请数据
cat server/data/partnershipApplications.json | jq -c '.[]' | while read request; do
  REQUEST_ID=$(echo $request | jq -r '._id')
  echo "$request" | wrangler kv:key put --namespace-id=YOUR_PARTNERSHIP_REQUESTS_NAMESPACE_ID "request:$REQUEST_ID"
done
```

#### 批量迁移（更高效）

创建一个迁移脚本 `migrate-kv.sh`：

```bash
#!/bin/bash

# 配置 KV 命名空间 ID
USERS_NS="YOUR_USERS_NAMESPACE_ID"
LETTERS_NS="YOUR_LETTERS_NAMESPACE_ID"
PARTNERSHIPS_NS="YOUR_PARTNERSHIPS_NAMESPACE_ID"
REQUESTS_NS="YOUR_PARTNERSHIP_REQUESTS_NAMESPACE_ID"

# 迁移用户数据
echo "迁移用户数据..."
jq -c '.[]' server/data/users.json | while read user; do
  USER_ID=$(echo $user | jq -r '._id')
  echo "$user" | wrangler kv:key put --namespace-id="$USERS_NS" "user:$USER_ID"
done

# 迁移信件数据
echo "迁移信件数据..."
jq -c '.[]' server/data/letters.json | while read letter; do
  LETTER_ID=$(echo $letter | jq -r '._id')
  echo "$letter" | wrangler kv:key put --namespace-id="$LETTERS_NS" "letter:$LETTER_ID"
done

# 迁移情侣关系数据
echo "迁移情侣关系数据..."
jq -c '.[]' server/data/partnerships.json | while read partnership; do
  PARTNERSHIP_ID=$(echo $partnership | jq -r '._id')
  echo "$partnership" | wrangler kv:key put --namespace-id="$PARTNERSHIPS_NS" "partnership:$PARTNERSHIP_ID"
done

# 迁移情侣申请数据
echo "迁移情侣申请数据..."
jq -c '.[]' server/data/partnershipApplications.json | while read request; do
  REQUEST_ID=$(echo $request | jq -r '._id')
  echo "$request" | wrangler kv:key put --namespace-id="$REQUESTS_NS" "request:$REQUEST_ID"
done

echo "迁移完成！"
```

运行脚本：

```bash
chmod +x migrate-kv.sh
./migrate-kv.sh
```

### 方法 2：使用 API 迁移脚本

如果数据量较大，可以使用 API 方式迁移。

1. 配置 `migrate-to-kv.js` 中的凭证：

```javascript
const CLOUDFLARE_API_TOKEN = 'your-cloudflare-api-token';
const CLOUDFLARE_ACCOUNT_ID = 'your-cloudflare-account-id';
const KV_NAMESPACES = {
  USERS: 'your_users_namespace_id',
  LETTERS: 'your_letters_namespace_id',
  PARTNERSHIPS: 'your_partnerships_namespace_id',
  PARTNERSHIP_REQUESTS: 'your_partnership_requests_namespace_id'
};
```

2. 运行迁移脚本：

```bash
node migrate-to-kv.js
```

3. 查看迁移命令（如果不直接迁移）：

```bash
node migrate-to-kv.js --generate-commands
```

### 验证数据迁移

```bash
# 列出所有用户
wrangler kv:key list --namespace-id=YOUR_USERS_NAMESPACE_ID --prefix="user:"

# 获取特定用户
wrangler kv:key get --namespace-id=YOUR_USERS_NAMESPACE_ID "user:USER_ID"
```

## 测试 API

### 1. 注册新用户

```bash
curl -X POST https://future-you-backend.YOUR_SUBDOMAIN.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "phone": "13800138000",
    "email": "test@example.com"
  }'
```

预期响应：

```json
{
  "message": "注册成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "xxx-xxx-xxx",
    "username": "testuser",
    "phone": "13800138000",
    "email": "test@example.com",
    "createdAt": "2024-03-19T..."
  }
}
```

### 2. 登录

```bash
curl -X POST https://future-you-backend.YOUR_SUBDOMAIN.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 3. 获取用户信息（需要 Token）

```bash
curl -X GET https://future-you-backend.YOUR_SUBDOMAIN.workers.dev/api/user/info \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. 创建信件（需要 Token）

```bash
curl -X POST https://future-you-backend.YOUR_SUBDOMAIN.workers.dev/api/letter \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试信件",
    "content": "这是一封测试信件",
    "paperType": "default",
    "scheduledTime": "2025-12-31T23:59:59Z"
  }'
```

## 配置自定义域名（可选）

### 1. 添加自定义域名

```bash
# 为 Worker 添加自定义域名
wrangler domains add api.yourdomain.com

# 或者使用通配符
wrangler domains add *.api.yourdomain.com
```

### 2. 配置 DNS

1. 进入 Cloudflare Dashboard
2. 选择你的域名
3. 进入 DNS 设置
4. 添加 CNAME 记录：
   - Type: CNAME
   - Name: api（或你想要的子域名）
   - Target: future-you-backend.YOUR_SUBDOMAIN.workers.dev
   - Proxy: 启用（橙色云朵）

### 3. 更新 CORS 配置

如果使用自定义域名，更新 wrangler.toml：

```toml
[vars]
CORS_ORIGIN = "https://your-frontend-domain.com"
```

重新部署：

```bash
wrangler secret put CORS_ORIGIN
wrangler deploy
```

## 前端配置更新

### 1. 更新 API 基础 URL

在前端项目中更新 API 配置：

```javascript
// client/src/api/request.js
const baseURL = 'https://future-you-backend.YOUR_SUBDOMAIN.workers.dev/api';
// 或者使用自定义域名
// const baseURL = 'https://api.yourdomain.com/api';
```

### 2. 更新 CORS 设置（如果需要）

确保 Worker 的 CORS 配置包含你的前端域名。

### 3. 重新部署前端

```bash
cd client
npm run build

# 部署到 Netlify 或其他平台
netlify deploy --prod --dir=dist
```

## 故障排除

### 1. 部署失败

**问题：** `wrangler deploy` 失败

**解决方案：**

```bash
# 检查登录状态
wrangler whoami

# 重新登录
wrangler login

# 检查配置文件
wrangler whoami --config wrangler.toml
```

### 2. KV 命名空间未绑定

**问题：** Error: KV binding not found

**解决方案：**

1. 检查 wrangler.toml 中的 KV ID 是否正确
2. 确保 KV 命名空间已创建
3. 重新部署 Worker

```bash
# 列出所有 KV 命名空间
wrangler kv:namespace list
```

### 3. JWT Secret 未设置

**问题：** 登录/注册失败，提示 JWT error

**解决方案：**

```bash
# 检查 secret 是否设置
wrangler secret list

# 重新设置
wrangler secret put JWT_SECRET
```

### 4. CORS 错误

**问题：** 前端请求被 CORS 阻止

**解决方案：**

1. 检查 worker.js 中的 CORS 头
2. 确保前端域名在 CORS_ORIGIN 中
3. 使用自定义域名而不是 workers.dev 子域名

### 5. 数据迁移失败

**问题：** 数据迁移时出现错误

**解决方案：**

```bash
# 检查 KV 命名空间是否有足够配额
wrangler kv:key list --namespace-id=YOUR_NAMESPACE_ID

# 清空 KV 命名空间（谨慎操作！）
wrangler kv:key delete --namespace-id=YOUR_NAMESPACE_ID --prefix="user:"
```

### 6. 性能问题

**问题：** API 响应缓慢

**解决方案：**

1. KV 读取有延迟，考虑使用缓存
2. 优化查询，避免频繁的 KV 操作
3. 考虑使用 D1 数据库替代 KV

## 监控和日志

### 查看日志

```bash
# 实时查看日志
wrangler tail

# 查看特定环境的日志
wrangler tail --format pretty
```

### 监控

1. 进入 Cloudflare Dashboard
2. 选择 Workers & Pages
3. 选择你的 Worker
4. 查看 Analytics 和 Logs

## 安全建议

1. **JWT Secret**：使用强随机字符串，不要提交到版本控制
2. **环境变量**：敏感信息使用 `wrangler secret` 设置
3. **CORS**：生产环境限制为特定域名，不要使用 `*`
4. **Rate Limiting**：考虑实现 API 限流
5. **HTTPS**：确保所有通信使用 HTTPS

## 成本估算

Cloudflare Workers 免费计划包括：

- **Workers**: 每天 100,000 次请求
- **KV 存储**: 每天 100,000 次读取，1,000 次写入
- **存储**: 1 GB

对于小型应用，免费计划足够使用。

## 下一步

1. 实现文件上传功能（使用 R2 或外部存储）
2. 添加定时任务（使用 Cloudflare Cron Triggers）
3. 实现邮件通知（使用 Cloudflare Email Routing）
4. 添加监控和告警
5. 优化性能和缓存策略

## 支持

如有问题，请查看：

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare KV 文档](https://developers.cloudflare.com/kv/)

---

**祝你部署顺利！** 🚀
