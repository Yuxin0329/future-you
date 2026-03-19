import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据文件路径
const PARTNERSHIPS_FILE = path.join(__dirname, '../data/partnerships.json')
const APPLICATIONS_FILE = path.join(__dirname, '../data/partnershipApplications.json')
const USERS_FILE = path.join(__dirname, '../data/users.json')

// 确保数据文件存在
const ensureDataFiles = () => {
  const dataDir = path.join(__dirname, '../data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  if (!fs.existsSync(PARTNERSHIPS_FILE)) {
    fs.writeFileSync(PARTNERSHIPS_FILE, '[]')
  }

  if (!fs.existsSync(APPLICATIONS_FILE)) {
    fs.writeFileSync(APPLICATIONS_FILE, '[]')
  }
}

// 读取数据
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    return []
  }
}

// 写入数据
const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error)
    return false
  }
}

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Partnership 模型
export const PartnershipModel = {
  // 初始化
  init: () => {
    ensureDataFiles()
  },

  // 创建结对申请
  createApplication: (fromUserId, toUserId) => {
    const applications = readData(APPLICATIONS_FILE)
    const users = readData(USERS_FILE)

    // 检查用户是否存在
    const toUser = users.find(u => u._id === toUserId)
    if (!toUser) {
      throw new Error('目标用户不存在')
    }

    // 检查对方是否已有伴侣
    if (toUser.partnerId) {
      throw new Error('对方已有伴侣')
    }

    // 检查是否已有待处理的申请
    const existingApplication = applications.find(
      app => app.fromUserId === fromUserId && app.toUserId === toUserId && app.status === 'pending'
    )
    if (existingApplication) {
      throw new Error('已存在待处理的申请')
    }

    const application = {
      _id: generateId(),
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    applications.push(application)
    writeData(APPLICATIONS_FILE, applications)

    return application
  },

  // 获取用户的待处理申请
  getPendingApplications: (userId) => {
    const applications = readData(APPLICATIONS_FILE)
    const users = readData(USERS_FILE)

    return applications
      .filter(app => app.toUserId === userId && app.status === 'pending')
      .map(app => {
        const fromUser = users.find(u => u._id === app.fromUserId)
        return {
          ...app,
          fromUsername: fromUser?.username || '未知用户'
        }
      })
  },

  // 获取用户发送的申请
  getSentApplications: (userId) => {
    const applications = readData(APPLICATIONS_FILE)
    const users = readData(USERS_FILE)

    return applications
      .filter(app => app.fromUserId === userId)
      .map(app => {
        const toUser = users.find(u => u._id === app.toUserId)
        return {
          ...app,
          toUsername: toUser?.username || '未知用户'
        }
      })
  },

  // 接受申请
  acceptApplication: (applicationId) => {
    const applications = readData(APPLICATIONS_FILE)
    const partnerships = readData(PARTNERSHIPS_FILE)
    const users = readData(USERS_FILE)

    const applicationIndex = applications.findIndex(app => app._id === applicationId)
    if (applicationIndex === -1) {
      throw new Error('申请不存在')
    }

    const application = applications[applicationIndex]

    // 检查双方是否已有伴侣
    const fromUser = users.find(u => u._id === application.fromUserId)
    const toUser = users.find(u => u._id === application.toUserId)

    if (fromUser.partnerId || toUser.partnerId) {
      throw new Error('一方或双方已有伴侣')
    }

    // 创建情侣关系
    const partnership = {
      _id: generateId(),
      user1Id: application.fromUserId,
      user2Id: application.toUserId,
      createdAt: new Date().toISOString()
    }

    partnerships.push(partnership)

    // 更新用户的 partnerId
    fromUser.partnerId = application.toUserId
    toUser.partnerId = application.fromUserId

    // 更新申请状态
    application.status = 'accepted'

    // 保存所有数据
    writeData(PARTNERSHIPS_FILE, partnerships)
    writeData(USERS_FILE, users)
    writeData(APPLICATIONS_FILE, applications)

    return partnership
  },

  // 拒绝申请
  rejectApplication: (applicationId) => {
    const applications = readData(APPLICATIONS_FILE)

    const applicationIndex = applications.findIndex(app => app._id === applicationId)
    if (applicationIndex === -1) {
      throw new Error('申请不存在')
    }

    applications[applicationIndex].status = 'rejected'
    writeData(APPLICATIONS_FILE, applications)

    return applications[applicationIndex]
  },

  // 获取用户的情侣关系
  getPartnership: (userId) => {
    const partnerships = readData(PARTNERSHIPS_FILE)
    const users = readData(USERS_FILE)

    const partnership = partnerships.find(
      p => p.user1Id === userId || p.user2Id === userId
    )

    if (!partnership) {
      return null
    }

    const partnerId = partnership.user1Id === userId ? partnership.user2Id : partnership.user1Id
    const partner = users.find(u => u._id === partnerId)

    return {
      ...partnership,
      partner: partner ? {
        _id: partner._id,
        username: partner.username,
        email: partner.email
      } : null
    }
  },

  // 解除情侣关系
  dissolvePartnership: (userId) => {
    const partnerships = readData(PARTNERSHIPS_FILE)
    const users = readData(USERS_FILE)

    const partnershipIndex = partnerships.findIndex(
      p => p.user1Id === userId || p.user2Id === userId
    )

    if (partnershipIndex === -1) {
      throw new Error('没有找到情侣关系')
    }

    const partnership = partnerships[partnershipIndex]

    // 清除双方的 partnerId
    const user1Index = users.findIndex(u => u._id === partnership.user1Id)
    const user2Index = users.findIndex(u => u._id === partnership.user2Id)

    if (user1Index !== -1) {
      users[user1Index].partnerId = null
    }

    if (user2Index !== -1) {
      users[user2Index].partnerId = null
    }

    // 删除 partnership
    partnerships.splice(partnershipIndex, 1)

    // 保存数据
    writeData(PARTNERSHIPS_FILE, partnerships)
    writeData(USERS_FILE, users)

    return { success: true }
  }
}
