import jwt from 'jsonwebtoken'
import { userModel } from '../config/database.js'

/**
 * JWT认证中间件
 * 验证请求头中的token
 */
export const auth = async (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: '未授权，请提供有效的token'
      })
    }

    // 提取token
    const token = authHeader.substring(7) // 'Bearer ' 之后的部分

    try {
      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // 查找用户
      const user = await userModel.findById(decoded.userId)
      
      // 移除密码字段（如果存在）
      if (user && user.password) {
        delete user.password
      }

      if (!user) {
        return res.status(401).json({
          message: '用户不存在'
        })
      }

      // 将用户信息添加到请求对象
      req.user = user
      next()
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'token已过期，请重新登录'
        })
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: '无效的token'
        })
      } else {
        throw jwtError
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({
      message: '认证失败'
    })
  }
}

/**
 * 生成JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}
