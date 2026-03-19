import { userModel } from '../config/database.js'
import path from 'path'
import fs from 'fs/promises'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'backgrounds')

// 确保上传目录存在
const ensureUploadDir = async () => {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * 获取当前用户信息
 */
export const getUserInfo = async (req, res) => {
  try {
    // 从req.user获取用户信息（由auth中间件添加）
    const user = await userModel.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        message: '用户不存在'
      })
    }

    res.json({
      _id: user._id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      createdAt: user.createdAt,
      partnerId: user.partnerId
    })
  } catch (error) {
    console.error('Get user info error:', error)
    res.status(500).json({
      message: '获取用户信息失败'
    })
  }
}

/**
 * 更新用户信息
 */
export const updateUserInfo = async (req, res) => {
  try {
    const { phone, email } = req.body
    const userId = req.user._id

    // 构建更新对象
    const updates = {}
    
    // 如果要更新手机号
    if (phone !== undefined) {
      // 检查手机号是否已被其他用户使用
      const existingPhone = await userModel.findByPhone(phone)
      
      if (existingPhone && existingPhone._id !== userId) {
        return res.status(400).json({
          message: '该手机号已被使用'
        })
      }
      
      updates.phone = phone || null
    }

    // 如果要更新邮箱
    if (email !== undefined) {
      // 检查邮箱是否已被其他用户使用
      const existingEmail = await userModel.findByEmail(email)
      
      if (existingEmail && existingEmail._id !== userId) {
        return res.status(400).json({
          message: '该邮箱已被使用'
        })
      }
      
      updates.email = email || null
    }

    // 更新用户信息
    const updatedUser = await userModel.updateById(userId, updates)

    if (!updatedUser) {
      return res.status(404).json({
        message: '用户不存在'
      })
    }

    res.json({
      message: '用户信息更新成功',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        phone: updatedUser.phone,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt
      }
    })
  } catch (error) {
    console.error('Update user info error:', error)
    res.status(500).json({
      message: '更新用户信息失败'
    })
  }
}

/**
 * 删除用户账号
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id

    const deleted = await userModel.deleteById(userId)

    if (!deleted) {
      return res.status(404).json({
        message: '用户不存在'
      })
    }

    res.json({
      message: '账号删除成功'
    })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({
      message: '删除账号失败'
    })
  }
}

/**
 * 上传用户背景图片
 */
export const uploadBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: '请选择要上传的图片'
      })
    }

    await ensureUploadDir()

    const userId = req.user._id
    const timestamp = Date.now()
    const ext = path.extname(req.file.originalname)
    const filename = `${userId}_${timestamp}${ext}`
    const filepath = path.join(UPLOAD_DIR, filename)

    // 保存文件
    await fs.writeFile(filepath, req.file.buffer)

    // 返回图片 URL
    const imageUrl = `/uploads/backgrounds/${filename}`

    res.json({
      success: true,
      message: '背景上传成功',
      url: imageUrl
    })
  } catch (error) {
    console.error('Upload background error:', error)
    res.status(500).json({
      success: false,
      message: '上传失败，请稍后重试'
    })
  }
}
