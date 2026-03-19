import express from 'express'
import {
  register,
  login,
  checkUsername
} from '../controllers/authController.js'
import {
  registerValidation,
  loginValidation
} from '../middleware/validator.js'

const router = express.Router()

/**
 * @route   POST /api/auth/register
 * @desc    用户注册
 * @access  Public
 */
router.post('/register', registerValidation, register)

/**
 * @route   POST /api/auth/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', loginValidation, login)

/**
 * @route   POST /api/auth/check-username
 * @desc    检查用户名是否可用
 * @access  Public
 */
router.post('/check-username', checkUsername)

export default router
