import { body, validationResult } from 'express-validator'

/**
 * 表单验证中间件
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req)
  
  // 添加详细的调试日志
  console.log('=== 验证中间件 ===')
  console.log('Request body:', JSON.stringify(req.body, null, 2))
  console.log('Validation errors:', errors.array())
  
  if (!errors.isEmpty()) {
    console.log('❌ 验证失败:', JSON.stringify(errors.array(), null, 2))
    return res.status(400).json({
      message: '表单验证失败',
      errors: errors.array()
    })
  }
  
  console.log('✅ 验证通过')
  next()
}

/**
 * 注册验证规则
 */
export const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度为3-20个字符')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线'),

  body('password')
    .trim()
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20个字符'),

  body('confirmPassword')
    .trim()
    .notEmpty().withMessage('请确认密码')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('两次输入的密码不一致')
      }
      return true
    }),

  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true
      }
      if (!/^1[3-9]\d{9}$/.test(value)) {
        throw new Error('请输入有效的手机号')
      }
      return true
    }),

  body('email')
    .optional()
    .trim()
    .toLowerCase()
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        throw new Error('请输入有效的邮箱地址')
      }
      return true
    }),

  validate
]

/**
 * 登录验证规则
 */
export const loginValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('用户名不能为空'),

  body('password')
    .trim()
    .notEmpty().withMessage('密码不能为空'),

  validate
]

/**
 * 更新用户信息验证规则
 */
export const updateUserInfoValidation = [
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true
      }
      if (!/^1[3-9]\d{9}$/.test(value)) {
        throw new Error('请输入有效的手机号')
      }
      return true
    }),

  body('email')
    .optional()
    .trim()
    .toLowerCase()
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        throw new Error('请输入有效的邮箱地址')
      }
      return true
    }),

  validate
]
