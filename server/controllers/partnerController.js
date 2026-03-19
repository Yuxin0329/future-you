import { PartnershipModel } from '../models/partnership.js'

// 发起结对申请
export const sendApplication = async (req, res) => {
  try {
    const { toUsername } = req.body
    const fromUserId = req.userId

    if (!toUsername) {
      return res.status(400).json({ message: '请输入对方用户名' })
    }

    // 读取用户列表，查找目标用户
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const USERS_FILE = path.join(__dirname, '../data/users.json')

    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
    const toUser = users.find(u => u.username === toUsername)

    if (!toUser) {
      return res.status(404).json({ message: '目标用户不存在' })
    }

    if (toUser._id === fromUserId) {
      return res.status(400).json({ message: '不能对自己发起申请' })
    }

    // 创建申请
    const application = PartnershipModel.createApplication(fromUserId, toUser._id)

    res.status(201).json({
      message: '申请已发送',
      data: application
    })
  } catch (error) {
    res.status(400).json({ message: error.message || '发送申请失败' })
  }
}

// 获取待处理的申请
export const getPendingApplications = async (req, res) => {
  try {
    const userId = req.userId
    const applications = PartnershipModel.getPendingApplications(userId)

    res.json({
      message: '获取成功',
      data: applications
    })
  } catch (error) {
    res.status(500).json({ message: '获取申请失败' })
  }
}

// 获取发送的申请
export const getSentApplications = async (req, res) => {
  try {
    const userId = req.userId
    const applications = PartnershipModel.getSentApplications(userId)

    res.json({
      message: '获取成功',
      data: applications
    })
  } catch (error) {
    res.status(500).json({ message: '获取申请失败' })
  }
}

// 接受申请
export const acceptApplication = async (req, res) => {
  try {
    const { applicationId } = req.params
    const userId = req.userId

    const partnership = PartnershipModel.acceptApplication(applicationId)

    res.json({
      message: '已接受申请，成功结对！',
      data: partnership
    })
  } catch (error) {
    res.status(400).json({ message: error.message || '接受申请失败' })
  }
}

// 拒绝申请
export const rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params

    const application = PartnershipModel.rejectApplication(applicationId)

    res.json({
      message: '已拒绝申请',
      data: application
    })
  } catch (error) {
    res.status(400).json({ message: error.message || '拒绝申请失败' })
  }
}

// 获取我的情侣信息
export const getMyPartner = async (req, res) => {
  try {
    const userId = req.userId
    const partnership = PartnershipModel.getPartnership(userId)

    res.json({
      message: '获取成功',
      data: partnership
    })
  } catch (error) {
    res.status(500).json({ message: '获取情侣信息失败' })
  }
}

// 解除情侣关系
export const dissolvePartnership = async (req, res) => {
  try {
    const userId = req.userId

    PartnershipModel.dissolvePartnership(userId)

    res.json({
      message: '已解除情侣关系'
    })
  } catch (error) {
    res.status(400).json({ message: error.message || '解除关系失败' })
  }
}
