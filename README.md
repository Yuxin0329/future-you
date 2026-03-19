# Future You - 时间信件平台 💕

> 浪漫、可爱、活泼的时间信件平台，专为情侣设计

## 项目简介

Future You 是一个专为情侣设计的时间信件平台。用户可以给未来的TA写信，设定送达时间，让爱意跨越时间。平台提供安全、私密的存储空间，确保每一封信都能在合适的时刻送达。

### 特色功能

- ⏰ **定时寄送** - 设定未来的日期，让爱在特定时刻送达
- 🔒 **私密安全** - 端到端加密，只有你们能看到彼此的信
- 💎 **永久保存** - 保存珍贵回忆，随时随地回顾
- 💝 **专属情侣** - 专为情侣打造，记录爱情的点点滴滴

## 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **Vite** - 下一代前端构建工具
- **Vue Router 4** - 官方路由管理器
- **Pinia** - 状态管理
- **Element Plus** - Vue 3 组件库
- **Axios** - HTTP客户端
- **SCSS** - CSS预处理器

### 后端
- **Node.js** - JavaScript运行环境
- **Express** - Web应用框架
- **MongoDB** - NoSQL数据库
- **Mongoose** - MongoDB对象建模工具
- **bcrypt** - 密码加密
- **jsonwebtoken** - JWT认证

## 项目结构

```
future-you/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── api/           # API接口
│   │   │   ├── request.js # Axios实例配置
│   │   │   └── user.js    # 用户API
│   │   ├── assets/        # 静态资源
│   │   │   └── styles/
│   │   │       └── main.scss # 主样式文件
│   │   ├── components/    # 公共组件
│   │   ├── router/        # 路由配置
│   │   │   └── index.js   # 路由定义
│   │   ├── stores/        # Pinia状态管理
│   │   │   └── user.js    # 用户状态
│   │   ├── views/         # 页面组件
│   │   │   ├── Home.vue       # 首页
│   │   │   ├── Register.vue   # 注册页
│   │   │   ├── Login.vue      # 登录页
│   │   │   ├── Main.vue       # 主页
│   │   │   ├── Write.vue      # 写信页
│   │   │   ├── Read.vue       # 收信页
│   │   │   └── Profile.vue    # 个人中心
│   │   ├── App.vue        # 根组件
│   │   └── main.js        # 入口文件
│   ├── index.html         # HTML模板
│   ├── package.json       # 依赖配置
│   └── vite.config.js     # Vite配置
├── server/                # 后端项目
│   ├── config/           # 配置文件
│   │   └── database.js   # 数据库配置
│   ├── controllers/      # 控制器
│   │   ├── authController.js   # 认证控制器
│   │   └── userController.js   # 用户控制器
│   ├── models/           # 数据模型
│   │   └── User.js       # 用户模型
│   ├── routes/           # 路由
│   │   ├── auth.js       # 认证路由
│   │   └── user.js       # 用户路由
│   ├── middleware/       # 中间件
│   │   ├── auth.js       # JWT认证中间件
│   │   └── validator.js  # 表单验证中间件
│   ├── .env              # 环境变量
│   ├── app.js            # 应用入口
│   └── package.json      # 依赖配置
├── README.md             # 项目说明
└── 部署说明.md           # 部署指南
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MongoDB >= 4.4
- npm 或 yarn

### 安装依赖

#### 前端
```bash
cd client
npm install
```

#### 后端
```bash
cd server
npm install
```

### 配置环境变量

在 `server/.env` 文件中配置环境变量：

```env
PORT=3000
NODE_ENV=development

# MongoDB配置
MONGODB_URI=mongodb://localhost:27017/future-you

# JWT密钥（生产环境请使用更复杂的密钥）
JWT_SECRET=future-you-secret-key-2024-very-secure
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=http://localhost:5173
```

### 启动MongoDB

确保MongoDB服务正在运行：

```bash
# macOS (使用Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# 使用MongoDB服务管理器启动
```

### 启动开发服务器

#### 启动后端服务器
```bash
cd server
npm run dev
```

后端服务器将在 `http://localhost:3000` 运行

#### 启动前端开发服务器
```bash
cd client
npm run dev
```

前端开发服务器将在 `http://localhost:5173` 运行

### 访问应用

在浏览器中打开 `http://localhost:5173` 即可访问应用

## 开发说明

### 前端开发

- 前端使用 Vue 3 Composition API
- 使用 Pinia 进行状态管理
- 使用 Element Plus UI组件库
- 使用 SCSS 编写样式
- 所有API请求通过 `@/api/` 目录下的模块管理

### 后端开发

- 后端使用 Express 框架
- 使用 Mongoose 操作 MongoDB
- 使用 JWT 进行用户认证
- 使用 express-validator 进行表单验证
- 所有API路由位于 `@/routes/` 目录

### 代码规范

- 前端代码遵循 Vue 3 官方风格指南
- 后端代码遵循 Node.js 最佳实践
- 所有代码都包含详细的中文注释
- 提交前请确保代码通过 ESLint 检查

## API 文档

### 认证相关

#### 注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "confirmPassword": "string",
  "phone": "string (optional)",
  "email": "string (optional)"
}
```

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

#### 检查用户名
```
POST /api/auth/check-username
Content-Type: application/json

{
  "username": "string"
}
```

### 用户相关

所有用户相关接口都需要在请求头中携带 JWT token：

```
Authorization: Bearer <token>
```

#### 获取用户信息
```
GET /api/user/info
```

#### 更新用户信息
```
PUT /api/user/info
Content-Type: application/json

{
  "phone": "string (optional)",
  "email": "string (optional)"
}
```

#### 删除账号
```
DELETE /api/user/account
```

## 测试

### 前端测试
```bash
cd client
npm run test
```

### 后端测试
```bash
cd server
npm run test
```

## 构建生产版本

### 前端
```bash
cd client
npm run build
```

构建产物将输出到 `client/dist` 目录

### 后端
后端不需要特别构建，直接使用 Node.js 运行即可

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

## 联系方式

如有问题或建议，欢迎联系。

---

**Made with 💕 for couples everywhere**
