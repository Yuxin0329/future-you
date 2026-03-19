import express from 'express'
import path from 'path'
import fs from 'fs'
import { auth } from '../middleware/auth.js'
import {
  createLetter,
  getSentLetters,
  getReceivedLetters,
  getLetterById,
  deleteLetter,
  uploadAudio
} from '../controllers/letterController.js'
import multer from 'multer'

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../public/uploads/audios')

    // 确保目录存在
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
    } catch (err) {
      console.error('创建目录失败:', err)
    }

    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true)
    } else {
      cb(new Error('只允许上传音频文件'))
    }
  }
})

const router = express.Router()

// 所有路由都需要认证
router.use(auth)

// 创建信件
router.post('/', createLetter)

// 上传音频文件
router.post('/upload-audio', upload.single('audio'), uploadAudio)

// 获取发送的信件
router.get('/sent', getSentLetters)

// 获取收到的信件
router.get('/received', getReceivedLetters)

// 获取信件详情
router.get('/:letterId', getLetterById)

// 删除信件
router.delete('/:letterId', deleteLetter)

export default router
