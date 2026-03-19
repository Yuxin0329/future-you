import { LetterModel } from '../models/letter.js'
import { PartnershipModel } from '../models/partnership.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 创建信件
export const createLetter = async (req, res) => {
  try {
    const { title, content, paperType, scheduledTime, audioFile, audioDuration } = req.body
    const fromUserId = req.userId

    // 验证必填字段
    if (!title || !content || !scheduledTime) {
      return res.status(400).json({ message: '请填写完整信件信息' })
    }

    // 验证发送时间必须是未来时间
    const scheduledDate = new Date(scheduledTime)
    const now = new Date()
    if (scheduledDate <= now) {
      return res.status(400).json({ message: '发送时间必须是未来时间' })
    }

    // 获取用户的情侣信息
    const partnership = PartnershipModel.getPartnership(fromUserId)
    if (!partnership || !partnership.partner) {
      return res.status(400).json({ message: '您还没有情侣，无法发送信件' })
    }

    // 处理音频文件（如果有）
    let audioFilePath = null
    if (audioFile) {
      // 创建 uploads/audios 目录
      const uploadsDir = path.join(__dirname, '../public/uploads/audios')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      // 如果是 base64 编码的音频，保存为文件
      if (audioFile.startsWith('data:audio/')) {
        const base64Data = audioFile.split(',')[1]
        const extension = audioFile.split(';')[0].split('/')[1]
        const filename = `${Date.now()}.${extension}`
        const filepath = path.join(uploadsDir, filename)

        fs.writeFileSync(filepath, base64Data, 'base64')
        audioFilePath = `/uploads/audios/${filename}`
      } else if (audioFile.startsWith('/uploads/')) {
        // 已经是文件路径，直接使用
        audioFilePath = audioFile
      }
    }

    // 创建信件
    const letter = LetterModel.createLetter({
      fromUserId,
      toUserId: partnership.partner._id,
      title,
      content,
      paperType: paperType || 'default',
      audioFile: audioFilePath,
      audioDuration,
      scheduledTime
    })

    res.status(201).json({
      message: '信件创建成功，将在指定时间发送',
      data: letter
    })
  } catch (error) {
    console.error('创建信件失败:', error)
    res.status(500).json({ message: error.message || '创建信件失败' })
  }
}

// 获取发送的信件
export const getSentLetters = async (req, res) => {
  try {
    const userId = req.userId
    const letters = LetterModel.getSentLetters(userId)

    res.json({
      message: '获取成功',
      data: letters
    })
  } catch (error) {
    res.status(500).json({ message: '获取信件失败' })
  }
}

// 获取收到的信件
export const getReceivedLetters = async (req, res) => {
  try {
    const userId = req.userId
    const letters = LetterModel.getReceivedLetters(userId)

    res.json({
      message: '获取成功',
      data: letters
    })
  } catch (error) {
    res.status(500).json({ message: '获取信件失败' })
  }
}

// 获取信件详情
export const getLetterById = async (req, res) => {
  try {
    const { letterId } = req.params
    const userId = req.userId

    const letter = LetterModel.getLetterById(letterId)

    if (!letter) {
      return res.status(404).json({ message: '信件不存在' })
    }

    // 检查权限：只有发送者和接收者可以查看
    if (letter.fromUserId !== userId && letter.toUserId !== userId) {
      return res.status(403).json({ message: '无权查看此信件' })
    }

    res.json({
      message: '获取成功',
      data: letter
    })
  } catch (error) {
    res.status(500).json({ message: '获取信件详情失败' })
  }
}

// 删除信件
export const deleteLetter = async (req, res) => {
  try {
    const { letterId } = req.params
    const userId = req.userId

    LetterModel.deleteLetter(letterId, userId)

    res.json({
      message: '信件删除成功'
    })
  } catch (error) {
    res.status(400).json({ message: error.message || '删除信件失败' })
  }
}

// 上传音频文件
export const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '没有上传文件' })
    }

    // 返回文件路径
    res.json({
      message: '音频上传成功',
      data: {
        filePath: `/uploads/audios/${req.file.filename}`,
        duration: req.body.duration || null
      }
    })
  } catch (error) {
    console.error('上传音频失败:', error)
    res.status(500).json({ message: '上传音频失败' })
  }
}
