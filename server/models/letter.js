import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据文件路径
const LETTERS_FILE = path.join(__dirname, '../data/letters.json')

// 确保数据文件存在
const ensureDataFiles = () => {
  const dataDir = path.join(__dirname, '../data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  if (!fs.existsSync(LETTERS_FILE)) {
    fs.writeFileSync(LETTERS_FILE, '[]')
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

// Letter 模型
export const LetterModel = {
  // 初始化
  init: () => {
    ensureDataFiles()
  },

  // 创建信件
  createLetter: (letterData) => {
    const letters = readData(LETTERS_FILE)

    const letter = {
      _id: generateId(),
      fromUserId: letterData.fromUserId,
      toUserId: letterData.toUserId,
      title: letterData.title,
      content: letterData.content,
      paperType: letterData.paperType || 'default',
      audioFile: letterData.audioFile || null,
      audioDuration: letterData.audioDuration || null,
      scheduledTime: letterData.scheduledTime,
      status: 'pending', // pending, sent
      createdAt: new Date().toISOString()
    }

    letters.push(letter)
    writeData(LETTERS_FILE, letters)

    return letter
  },

  // 获取用户发送的所有信件
  getSentLetters: (userId) => {
    const letters = readData(LETTERS_FILE)

    return letters
      .filter(letter => letter.fromUserId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  // 获取用户收到的信件
  getReceivedLetters: (userId) => {
    const letters = readData(LETTERS_FILE)

    return letters
      .filter(letter => letter.toUserId === userId)
      .sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime))
  },

  // 获取待发送的信件（用于定时任务）
  getPendingLetters: () => {
    const letters = readData(LETTERS_FILE)
    const now = new Date()

    return letters.filter(letter => {
      return letter.status === 'pending' && new Date(letter.scheduledTime) <= now
    })
  },

  // 更新信件状态为已发送
  markAsSent: (letterId) => {
    const letters = readData(LETTERS_FILE)
    const index = letters.findIndex(letter => letter._id === letterId)

    if (index === -1) {
      throw new Error('信件不存在')
    }

    letters[index].status = 'sent'
    letters[index].sentAt = new Date().toISOString()

    writeData(LETTERS_FILE, letters)

    return letters[index]
  },

  // 获取单个信件详情
  getLetterById: (letterId) => {
    const letters = readData(LETTERS_FILE)
    return letters.find(letter => letter._id === letterId) || null
  },

  // 删除信件
  deleteLetter: (letterId, userId) => {
    const letters = readData(LETTERS_FILE)
    const index = letters.findIndex(
      letter => letter._id === letterId && letter.fromUserId === userId
    )

    if (index === -1) {
      throw new Error('信件不存在或无权删除')
    }

    letters.splice(index, 1)
    writeData(LETTERS_FILE, letters)

    return { success: true }
  }
}
