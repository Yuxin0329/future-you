import bcrypt from 'bcrypt'
import { userModel } from '../config/database.js'
import { generateToken } from '../middleware/auth.js'

/**
 * 用户注册
 */
export const register = async (req, res) => {
  try {
    console.log('=== 注册请求 ===')
    console.log('Request body:', JSON.stringify(req.body, null, 2))

    const { username, password, phone, email } = req.body

    // 验证必填字段
    if (!username || !password) {
      console.log('❌ 必填字段为空')
      return res.status(400).json({
        message: '用户名和密码不能为空'
      })
    }

    console.log(`Username: ${username}, Phone: ${phone}, Email: ${email}`)

    // 检查用户名是否已存在
    console.log('🔍 检查用户名是否已存在...')
    const existingUser = await userModel.findByUsername(username)
    if (existingUser) {
      console.log('❌ 用户名已被使用')
      return res.status(400).json({
        message: '用户名已被使用'
      })
    }
    console.log('✅ 用户名可用')

    // 检查手机号是否已存在（如果提供）
    if (phone && phone.trim() !== '') {
      console.log('🔍 检查手机号是否已存在...')
      const existingPhone = await userModel.findByPhone(phone)
      if (existingPhone) {
        console.log('❌ 该手机号已被注册')
        return res.status(400).json({
          message: '该手机号已被注册'
        })
      }
      console.log('✅ 手机号可用')
    }

    // 检查邮箱是否已存在（如果提供）
    if (email && email.trim() !== '') {
      console.log('🔍 检查邮箱是否已存在...')
      const existingEmail = await userModel.findByEmail(email)
      if (existingEmail) {
        console.log('❌ 该邮箱已被注册')
        return res.status(400).json({
          message: '该邮箱已被注册'
        })
      }
      console.log('✅ 邮箱可用')
    }

    // 加密密码
    console.log('🔐 加密密码中...')
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(password, 10)
      console.log('✅ 密码加密完成')
    } catch (error) {
      console.error('❌ 密码加密失败:', error)
      return res.status(500).json({
        message: '密码加密失败，请稍后重试'
      })
    }

    // 创建用户
    console.log('👤 创建用户中...')
    let user
    try {
      user = await userModel.create({
        username,
        password: hashedPassword,
        phone: phone || null,
        email: email || null
      })
      console.log(`✅ 用户创建成功，ID: ${user._id}`)
    } catch (error) {
      console.error('❌ 创建用户失败:', error)
      return res.status(500).json({
        message: '创建用户失败，请稍后重试'
      })
    }

    // 生成token
    console.log('🎟 生成token中...')
    let token
    try {
      token = generateToken(user._id)
      console.log('✅ Token生成完成')
    } catch (error) {
      console.error('❌ Token生成失败:', error)
      return res.status(500).json({
        message: 'Token生成失败，请稍后重试'
      })
    }

    // 返回用户信息和token（不包含密码）
    console.log('✅ 注册成功，准备返回')
    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        createdAt: user.createdAt
      }
    })

  } catch (error) {
    console.error('💥 注册过程出现未捕获的错误:', error)
    res.status(500).json({
      message: '注册失败，请稍后重试'
    })
  }
}

/**
 * 用户登录
 */
export const login = async (req, res) => {
  try {
    console.log('=== 登录请求 ===')
    const { username, password } = req.body

    if (!username || !password) {
      console.log('❌ 用户名或密码为空')
      return res.status(400).json({
        message: '用户名和密码不能为空'
      })
    }

    console.log(`Username: ${username}`)

    // 查找用户
    console.log('🔍 查找用户中...')
    let user
    try {
      user = await userModel.findByUsername(username)
    } catch (error) {
      console.error('❌ 查找用户失败:', error)
      return res.status(500).json({
        message: '查找用户失败，请稍后重试'
      })
    }

    if (!user) {
      console.log('❌ 用户不存在')
      return res.status(401).json({
        message: '用户名或密码错误'
      })
    }
    console.log(`✅ 找到用户，ID: ${user._id}`)

    // 验证密码
    console.log('🔐 验证密码中...')
    let isPasswordValid
    try {
      isPasswordValid = await bcrypt.compare(password, user.password)
    } catch (error) {
      console.error('❌ 密码验证失败:', error)
      return res.status(500).json({
        message: '密码验证失败，请稍后重试'
      })
    }

    if (!isPasswordValid) {
      console.log('❌ 密码错误')
      return res.status(401).json({
        message: '用户名或密码错误'
      })
    }
    console.log('✅ 密码验证通过')

    // 生成token
    console.log('🎟 生成token中...')
    let token
    try {
      token = generateToken(user._id)
      console.log('✅ Token生成完成')
    } catch (error) {
      console.error('❌ Token生成失败:', error)
      return res.status(500).json({
        message: 'Token生成失败，请稍后重试'
      })
    }

    // 返回用户信息和token（不包含密码）
    console.log('✅ 登录成功，准备返回')
    res.json({
      message: '登录成功',
      token,
      user: {
        _id: user._id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        createdAt: user.createdAt
      }
    })

  } catch (error) {
    console.error('💥 登录过程出现未捕获的错误:', error)
    res.status(500).json({
      message: '登录失败，请稍后重试'
    })
  }
}

/**
 * 检查用户名是否可用
 */
export const checkUsername = async (req, res) => {
  try {
    console.log('=== 检查用户名 ===')
    const { username } = req.body

    if (!username || username.trim() === '') {
      console.log('❌ 用户名为空')
      return res.status(400).json({
        available: false,
        message: '用户名不能为空'
      })
    }

    console.log(`Checking username: ${username}`)

    // 验证用户名格式
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      console.log('❌ 用户名格式不正确')
      return res.status(400).json({
        available: false,
        message: '用户名格式不正确，只能是字母、数字和下划线'
      })
    }
    console.log('✅ 用户名格式正确')

    // 检查用户名是否已存在
    console.log('🔍 检查用户名是否已存在...')
    let existingUser
    try {
      existingUser = await userModel.findByUsername(username)
    } catch (error) {
      console.error('❌ 检查用户名失败:', error)
      return res.status(500).json({
        available: false,
        message: '检查用户名失败，请稍后重试'
      })
    }

    console.log(`Username exists: ${!!existingUser}`)

    res.json({
      available: !existingUser,
      message: existingUser ? '用户名已被使用' : '用户名可用'
    })

  } catch (error) {
    console.error('💥 检查用户名过程出现未捕获的错误:', error)
    res.status(500).json({
      available: false,
      message: '检查用户名失败，请稍后重试'
    })
  }
}
