import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { ensureDataDir } from './config/database.js'
import { PartnershipModel } from './models/partnership.js'
import { LetterModel } from './models/letter.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import partnerRoutes from './routes/partner.js'
import letterRoutes from './routes/letter.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件服务（用于音频文件和上传的图片）
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')))

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// 确保 data 目录存在
ensureDataDir().then(() => {
  console.log('✅ Data directory ready')

  // 初始化数据模型
  PartnershipModel.init()
  LetterModel.init()
  console.log('✅ Data models initialized')
}).catch(err => {
  console.error('❌ Failed to prepare data directory:', err)
})

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/partner', partnerRoutes)
app.use('/api/letter', letterRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Future You API is running' })
})

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

// 启动服务器，监听所有网络接口
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://0.0.0.0:${PORT}`)
  console.log(`🌐 External access: http://66.90.98.106:${PORT}`)
  console.log(`💗 Environment: ${process.env.NODE_ENV || 'development'}`)
})
