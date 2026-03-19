import express from 'express'
import multer from 'multer'
import {
  getUserInfo,
  updateUserInfo,
  deleteAccount,
  uploadBackground
} from '../controllers/userController.js'
import { auth } from '../middleware/auth.js'
import { updateUserInfoValidation } from '../middleware/validator.js'

const router = express.Router()

// 配置文件上传中间件
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只支持 JPG、PNG、GIF、WebP 格式的图片'))
    }
  }
})

// 所有路由都需要认证
router.use(auth)

/**
 * @route   GET /api/user/info
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/info', getUserInfo)

/**
 * @route   PUT /api/user/info
 * @desc    更新用户信息
 * @access  Private
 */
router.put('/info', updateUserInfoValidation, updateUserInfo)

/**
 * @route   DELETE /api/user/account
 * @desc    删除用户账号
 * @access  Private
 */
router.delete('/account', deleteAccount)

/**
 * @route   POST /api/user/background
 * @desc    上传用户背景图片
 * @access  Private
 */
router.post('/background', upload.single('file'), uploadBackground)

export default router
