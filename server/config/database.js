import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const DATA_DIR = path.join(process.cwd(), 'data')

// 确保 data 目录存在
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// 读取JSON文件
async function readJSON(filename) {
  await ensureDataDir()
  try {
    const content = await fs.readFile(path.join(DATA_DIR, filename), 'utf8')
    return JSON.parse(content)
  } catch (error) {
    return []
  }
}

// 写入JSON文件
async function writeJSON(filename, data) {
  await ensureDataDir()
  await fs.writeFile(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
    'utf8'
  )
}

// 生成唯一ID
function generateId() {
  return crypto.randomUUID()
}

// 用户数据操作
const userModel = {
  async findAll() {
    return await readJSON('users.json')
  },
  
  async findByUsername(username) {
    const users = await this.findAll()
    return users.find(u => u.username === username)
  },
  
  async findByEmail(email) {
    const users = await this.findAll()
    return users.find(u => u.email === email)
  },
  
  async findByPhone(phone) {
    const users = await this.findAll()
    return users.find(u => u.phone === phone)
  },
  
  async findById(id) {
    const users = await this.findAll()
    return users.find(u => u._id === id)
  },
  
  async create(userData) {
    const users = await this.findAll()
    const newUser = {
      _id: generateId(),
      ...userData,
      createdAt: new Date().toISOString()
    }
    users.push(newUser)
    await writeJSON('users.json', users)
    return newUser
  },
  
  async updateById(id, updateData) {
    const users = await this.findAll()
    const index = users.findIndex(u => u._id === id)
    if (index === -1) return null
    
    users[index] = { ...users[index], ...updateData }
    await writeJSON('users.json', users)
    return users[index]
  },
  
  async deleteById(id) {
    const users = await this.findAll()
    const filtered = users.filter(u => u._id !== id)
    await writeJSON('users.json', filtered)
    return filtered.length !== users.length
  }
}

// 信件数据操作
const letterModel = {
  async findAll() {
    return await readJSON('letters.json')
  },
  
  async findById(id) {
    const letters = await this.findAll()
    return letters.find(l => l._id === id)
  },
  
  async findByFromUserId(fromUserId) {
    const letters = await this.findAll()
    return letters.filter(l => l.fromUserId === fromUserId)
  },
  
  async findByToUserId(toUserId) {
    const letters = await this.findAll()
    return letters.filter(l => l.toUserId === toUserId)
  },
  
  async create(letterData) {
    const letters = await this.findAll()
    const newLetter = {
      _id: generateId(),
      ...letterData,
      createdAt: new Date().toISOString()
    }
    letters.push(newLetter)
    await writeJSON('letters.json', letters)
    return newLetter
  },
  
  async updateById(id, updateData) {
    const letters = await this.findAll()
    const index = letters.findIndex(l => l._id === id)
    if (index === -1) return null
    
    letters[index] = { ...letters[index], ...updateData }
    await writeJSON('letters.json', letters)
    return letters[index]
  },
  
  async deleteById(id) {
    const letters = await this.findAll()
    const filtered = letters.filter(l => l._id !== id)
    await writeJSON('letters.json', filtered)
    return filtered.length !== letters.length
  }
}

// 计划数据操作
const planModel = {
  async findAll() {
    return await readJSON('plans.json')
  },
  
  async findById(id) {
    const plans = await this.findAll()
    return plans.find(p => p._id === id)
  },
  
  async findByCreatorId(creatorId) {
    const plans = await this.findAll()
    return plans.filter(p => p.creatorId === creatorId)
  },
  
  async create(planData) {
    const plans = await this.findAll()
    const newPlan = {
      _id: generateId(),
      ...planData,
      createdAt: new Date().toISOString()
    }
    plans.push(newPlan)
    await writeJSON('plans.json', plans)
    return newPlan
  },
  
  async updateById(id, updateData) {
    const plans = await this.findAll()
    const index = plans.findIndex(p => p._id === id)
    if (index === -1) return null
    
    plans[index] = { ...plans[index], ...updateData }
    await writeJSON('plans.json', plans)
    return plans[index]
  },
  
  async deleteById(id) {
    const plans = await this.findAll()
    const filtered = plans.filter(p => p._id !== id)
    await writeJSON('plans.json', filtered)
    return filtered.length !== plans.length
  }
}

export {
  ensureDataDir,
  readJSON,
  writeJSON,
  generateId,
  userModel,
  letterModel,
  planModel
}
