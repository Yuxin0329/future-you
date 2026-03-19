/**
 * Future You - Cloudflare Workers Backend
 * 时间信件平台 - 专为情侣设计
 */

// JWT 验证和生成工具
class JWT {
  constructor(secret) {
    this.secret = secret;
  }

  // Base64URL 编码
  base64UrlEncode(str) {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Base64URL 解码
  base64UrlDecode(str) {
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  }

  // 生成 JWT Token
  sign(payload, expiresIn = '7d') {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const exp = now + this.parseExpiration(expiresIn);

    const payloadWithExp = {
      ...payload,
      iat: now,
      exp
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payloadWithExp));
    const signature = this.signHmac(encodedHeader + '.' + encodedPayload);

    return encodedHeader + '.' + encodedPayload + '.' + signature;
  }

  // 验证 JWT Token
  verify(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const [encodedHeader, encodedPayload, signature] = parts;

      // 验证签名
      const expectedSignature = this.signHmac(encodedHeader + '.' + encodedPayload);
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      // 解码 payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload));

      // 检查过期时间
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      throw new Error('Token verification failed: ' + error.message);
    }
  }

  // HMAC SHA-256 签名
  signHmac(data) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.secret);
    const messageData = encoder.encode(data);

    return crypto.subtle
      .importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      .then(key => crypto.subtle.sign('HMAC', key, messageData))
      .then(signature => {
        const hashArray = Array.from(new Uint8Array(signature));
        const hashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return this.base64UrlEncode(hashString);
      });
  }

  // 解析过期时间
  parseExpiration(expiresIn) {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: throw new Error('Invalid expiration format');
    }
  }
}

// 密码加密工具
class PasswordHasher {
  async hash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    // 使用 PBKDF2 进行密码哈希
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password + this.arrayBufferToHex(salt)),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );

    return {
      hash: this.arrayBufferToHex(derivedBits),
      salt: this.arrayBufferToHex(salt)
    };
  }

  async verify(password, storedHash, storedSalt) {
    const encoder = new TextEncoder();
    const salt = this.hexToArrayBuffer(storedSalt);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password + this.arrayBufferToHex(salt)),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );

    const hash = this.arrayBufferToHex(derivedBits);
    return hash === storedHash;
  }

  arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  hexToArrayBuffer(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
  }
}

// KV 数据库操作
class KVStore {
  constructor(kvBinding) {
    this.kv = kvBinding;
  }

  // 生成唯一 ID
  generateId() {
    return crypto.randomUUID();
  }

  // 获取所有键
  async listKeys() {
    const list = await this.kv.list();
    return list.keys.map(k => k.name);
  }

  // 获取单个值
  async get(key) {
    const value = await this.kv.get(key, 'json');
    return value;
  }

  // 设置单个值
  async set(key, value, options = {}) {
    await this.kv.put(key, JSON.stringify(value), options);
  }

  // 删除单个值
  async delete(key) {
    await this.kv.delete(key);
  }

  // 批量删除
  async deletePrefix(prefix) {
    const list = await this.kv.list({ prefix });
    for (const key of list.keys) {
      await this.kv.delete(key.name);
    }
  }

  // 批量获取
  async getByPrefix(prefix) {
    const list = await this.kv.list({ prefix });
    const items = [];

    for (const key of list.keys) {
      const value = await this.kv.get(key.name, 'json');
      if (value) {
        items.push(value);
      }
    }

    return items;
  }
}

// 用户数据模型
class UserModel {
  constructor(kvStore) {
    this.kv = kvStore;
  }

  async findAll() {
    return await this.kv.getByPrefix('user:');
  }

  async findByUsername(username) {
    const users = await this.findAll();
    return users.find(u => u.username === username);
  }

  async findByEmail(email) {
    const users = await this.findAll();
    return users.find(u => u.email === email);
  }

  async findByPhone(phone) {
    const users = await this.findAll();
    return users.find(u => u.phone === phone);
  }

  async findById(id) {
    return await this.kv.get(`user:${id}`);
  }

  async create(userData) {
    const userId = this.kv.generateId();
    const user = {
      _id: userId,
      ...userData,
      createdAt: new Date().toISOString()
    };

    await this.kv.set(`user:${userId}`, user);
    return user;
  }

  async updateById(id, updateData) {
    const user = await this.findById(id);
    if (!user) return null;

    const updatedUser = { ...user, ...updateData };
    await this.kv.set(`user:${id}`, updatedUser);
    return updatedUser;
  }

  async deleteById(id) {
    await this.kv.delete(`user:${id}`);
    return true;
  }
}

// 情侣关系模型
class PartnershipModel {
  constructor(partnershipsKV, requestsKV, userModel) {
    this.partnershipsKV = partnershipsKV;
    this.requestsKV = requestsKV;
    this.userModel = userModel;
  }

  // 创建结对申请
  async createApplication(fromUserId, toUserId) {
    const application = {
      _id: crypto.randomUUID(),
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await this.requestsKV.set(`request:${application._id}`, application);
    return application;
  }

  // 获取待处理的申请
  async getPendingApplications(userId) {
    const requests = await this.requestsKV.getByPrefix('request:');
    const pending = requests.filter(
      app => app.toUserId === userId && app.status === 'pending'
    );

    // 添加发送者用户名
    const users = await this.userModel.findAll();
    return pending.map(app => ({
      ...app,
      fromUsername: users.find(u => u._id === app.fromUserId)?.username || '未知用户'
    }));
  }

  // 获取发送的申请
  async getSentApplications(userId) {
    const requests = await this.requestsKV.getByPrefix('request:');
    const sent = requests.filter(app => app.fromUserId === userId);

    const users = await this.userModel.findAll();
    return sent.map(app => ({
      ...app,
      toUsername: users.find(u => u._id === app.toUserId)?.username || '未知用户'
    }));
  }

  // 接受申请
  async acceptApplication(applicationId) {
    const application = await this.requestsKV.get(`request:${applicationId}`);
    if (!application) {
      throw new Error('申请不存在');
    }

    const fromUser = await this.userModel.findById(application.fromUserId);
    const toUser = await this.userModel.findById(application.toUserId);

    if (!fromUser || !toUser) {
      throw new Error('用户不存在');
    }

    if (fromUser.partnerId || toUser.partnerId) {
      throw new Error('一方或双方已有伴侣');
    }

    // 创建情侣关系
    const partnership = {
      _id: crypto.randomUUID(),
      user1Id: application.fromUserId,
      user2Id: application.toUserId,
      createdAt: new Date().toISOString()
    };

    await this.partnershipsKV.set(`partnership:${partnership._id}`, partnership);

    // 更新用户的 partnerId
    await this.userModel.updateById(fromUser._id, { partnerId: toUser._id });
    await this.userModel.updateById(toUser._id, { partnerId: fromUser._id });

    // 更新申请状态
    application.status = 'accepted';
    await this.requestsKV.set(`request:${applicationId}`, application);

    return partnership;
  }

  // 拒绝申请
  async rejectApplication(applicationId) {
    const application = await this.requestsKV.get(`request:${applicationId}`);
    if (!application) {
      throw new Error('申请不存在');
    }

    application.status = 'rejected';
    await this.requestsKV.set(`request:${applicationId}`, application);
    return application;
  }

  // 获取用户的情侣关系
  async getPartnership(userId) {
    const partnerships = await this.partnershipsKV.getByPrefix('partnership:');
    const partnership = partnerships.find(
      p => p.user1Id === userId || p.user2Id === userId
    );

    if (!partnership) return null;

    const partnerId = partnership.user1Id === userId ? partnership.user2Id : partnership.user1Id;
    const partner = await this.userModel.findById(partnerId);

    return {
      ...partnership,
      partner: partner ? {
        _id: partner._id,
        username: partner.username,
        email: partner.email
      } : null
    };
  }

  // 解除情侣关系
  async dissolvePartnership(userId) {
    const partnerships = await this.partnershipsKV.getByPrefix('partnership:');
    const partnership = partnerships.find(
      p => p.user1Id === userId || p.user2Id === userId
    );

    if (!partnership) {
      throw new Error('没有找到情侣关系');
    }

    // 清除双方的 partnerId
    await this.userModel.updateById(partnership.user1Id, { partnerId: null });
    await this.userModel.updateById(partnership.user2Id, { partnerId: null });

    // 删除 partnership
    await this.partnershipsKV.delete(`partnership:${partnership._id}`);

    return { success: true };
  }
}

// 信件模型
class LetterModel {
  constructor(kvStore) {
    this.kv = kvStore;
  }

  // 创建信件
  async createLetter(letterData) {
    const letter = {
      _id: crypto.randomUUID(),
      ...letterData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await this.kv.set(`letter:${letter._id}`, letter);
    return letter;
  }

  // 获取发送的信件
  async getSentLetters(userId) {
    const letters = await this.kv.getByPrefix('letter:');
    return letters
      .filter(letter => letter.fromUserId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // 获取收到的信件
  async getReceivedLetters(userId) {
    const letters = await this.kv.getByPrefix('letter:');
    return letters
      .filter(letter => letter.toUserId === userId)
      .sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime));
  }

  // 获取信件详情
  async getLetterById(letterId) {
    return await this.kv.get(`letter:${letterId}`);
  }

  // 删除信件
  async deleteLetter(letterId, userId) {
    const letter = await this.getLetterById(letterId);
    if (!letter) {
      throw new Error('信件不存在');
    }

    if (letter.fromUserId !== userId) {
      throw new Error('无权删除此信件');
    }

    await this.kv.delete(`letter:${letterId}`);
    return { success: true };
  }
}

// 响应工具
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ message }, status);
}

// 路由处理
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // CORS 预检请求
  if (method === 'OPTIONS') {
    return jsonResponse(null, 204);
  }

  // 初始化服务
  const jwt = new JWT(env.JWT_SECRET || 'default-secret-key');
  const passwordHasher = new PasswordHasher();
  const usersKV = new KVStore(env.USERS);
  const userModel = new UserModel(usersKV);
  const partnershipModel = new PartnershipModel(
    new KVStore(env.PARTNERSHIPS),
    new KVStore(env.PARTNERSHIP_REQUESTS),
    userModel
  );
  const letterModel = new LetterModel(new KVStore(env.LETTERS));

  // 认证中间件
  async function authenticate(req) {
    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('未授权，请提供有效的token');
      }

      const token = authHeader.substring(7);
      const decoded = await jwt.verify(token);
      const user = await userModel.findById(decoded.userId);

      if (!user) {
        throw new Error('用户不存在');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // 健康检查
  if (path === '/api/health') {
    return jsonResponse({ status: 'ok', message: 'Future You API is running' });
  }

  // ============ 认证路由 ============

  // 注册
  if (path === '/api/auth/register' && method === 'POST') {
    try {
      const body = await request.json();
      const { username, password, phone, email } = body;

      // 验证必填字段
      if (!username || !password) {
        return errorResponse('用户名和密码不能为空');
      }

      // 检查用户名是否已存在
      const existingUser = await userModel.findByUsername(username);
      if (existingUser) {
        return errorResponse('用户名已被使用');
      }

      // 检查手机号
      if (phone) {
        const existingPhone = await userModel.findByPhone(phone);
        if (existingPhone) {
          return errorResponse('该手机号已被注册');
        }
      }

      // 检查邮箱
      if (email) {
        const existingEmail = await userModel.findByEmail(email);
        if (existingEmail) {
          return errorResponse('该邮箱已被注册');
        }
      }

      // 加密密码
      const { hash, salt } = await passwordHasher.hash(password);

      // 创建用户
      const user = await userModel.create({
        username,
        password: { hash, salt },
        phone: phone || null,
        email: email || null
      });

      // 生成 token
      const token = await jwt.sign({ userId: user._id });

      return jsonResponse({
        message: '注册成功',
        token,
        user: {
          _id: user._id,
          username: user.username,
          phone: user.phone,
          email: user.email,
          createdAt: user.createdAt
        }
      }, 201);
    } catch (error) {
      console.error('注册错误:', error);
      return errorResponse('注册失败，请稍后重试');
    }
  }

  // 登录
  if (path === '/api/auth/login' && method === 'POST') {
    try {
      const body = await request.json();
      const { username, password } = body;

      if (!username || !password) {
        return errorResponse('用户名和密码不能为空');
      }

      // 查找用户
      const user = await userModel.findByUsername(username);
      if (!user) {
        return errorResponse('用户名或密码错误');
      }

      // 验证密码
      const isValid = await passwordHasher.verify(
        password,
        user.password.hash,
        user.password.salt
      );

      if (!isValid) {
        return errorResponse('用户名或密码错误');
      }

      // 生成 token
      const token = await jwt.sign({ userId: user._id });

      return jsonResponse({
        message: '登录成功',
        token,
        user: {
          _id: user._id,
          username: user.username,
          phone: user.phone,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('登录错误:', error);
      return errorResponse('登录失败，请稍后重试');
    }
  }

  // 检查用户名
  if (path === '/api/auth/check-username' && method === 'POST') {
    try {
      const body = await request.json();
      const { username } = body;

      if (!username || username.trim() === '') {
        return errorResponse('用户名不能为空');
      }

      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return errorResponse('用户名格式不正确，只能是字母、数字和下划线');
      }

      const existingUser = await userModel.findByUsername(username);

      return jsonResponse({
        available: !existingUser,
        message: existingUser ? '用户名已被使用' : '用户名可用'
      });
    } catch (error) {
      return errorResponse('检查用户名失败，请稍后重试');
    }
  }

  // ============ 用户路由 ============

  // 获取用户信息
  if (path === '/api/user/info' && method === 'GET') {
    try {
      const user = await authenticate(request);

      return jsonResponse({
        _id: user._id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        createdAt: user.createdAt,
        partnerId: user.partnerId
      });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // 更新用户信息
  if (path === '/api/user/info' && method === 'PUT') {
    try {
      const user = await authenticate(request);
      const body = await request.json();
      const { phone, email } = body;

      const updates = {};

      if (phone !== undefined) {
        const existingPhone = await userModel.findByPhone(phone);
        if (existingPhone && existingPhone._id !== user._id) {
          return errorResponse('该手机号已被使用');
        }
        updates.phone = phone || null;
      }

      if (email !== undefined) {
        const existingEmail = await userModel.findByEmail(email);
        if (existingEmail && existingEmail._id !== user._id) {
          return errorResponse('该邮箱已被使用');
        }
        updates.email = email || null;
      }

      const updatedUser = await userModel.updateById(user._id, updates);

      return jsonResponse({
        message: '用户信息更新成功',
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          phone: updatedUser.phone,
          email: updatedUser.email,
          createdAt: updatedUser.createdAt
        }
      });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // 删除账号
  if (path === '/api/user/account' && method === 'DELETE') {
    try {
      const user = await authenticate(request);

      await userModel.deleteById(user._id);

      return jsonResponse({ message: '账号删除成功' });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // ============ 情侣关系路由 ============

  // 发起结对申请
  if (path === '/api/partner/apply' && method === 'POST') {
    try {
      const user = await authenticate(request);
      const body = await request.json();
      const { toUsername } = body;

      if (!toUsername) {
        return errorResponse('请输入对方用户名');
      }

      const toUser = await userModel.findByUsername(toUsername);
      if (!toUser) {
        return errorResponse('目标用户不存在');
      }

      if (toUser._id === user._id) {
        return errorResponse('不能对自己发起申请');
      }

      if (toUser.partnerId) {
        return errorResponse('对方已有伴侣');
      }

      const application = await partnershipModel.createApplication(user._id, toUser._id);

      return jsonResponse({
        message: '申请已发送',
        data: application
      }, 201);
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // 获取待处理的申请
  if (path === '/api/partner/applications/pending' && method === 'GET') {
    try {
      const user = await authenticate(request);

      const applications = await partnershipModel.getPendingApplications(user._id);

      return jsonResponse({
        message: '获取成功',
        data: applications
      });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // 获取发送的申请
  if (path === '/api/partner/applications/sent' && method === 'GET') {
    try {
      const user = await authenticate(request);

      const applications = await partnershipModel.getSentApplications(user._id);

      return jsonResponse({
        message: '获取成功',
        data: applications
      });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // 接受申请
  if (path.match(/^\/api\/partner\/applications\/[^/]+\/accept$/) && method === 'POST') {
    try {
      const user = await authenticate(request);
      const applicationId = path.split('/')[4];

      const partnership = await partnershipModel.acceptApplication(applicationId);

      return jsonResponse({
        message: '已接受申请，成功结对！',
        data: partnership
      });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // 拒绝申请
  if (path.match(/^\/api\/partner\/applications\/[^/]+\/reject$/) && method === 'POST') {
    try {
      const user = await authenticate(request);
      const applicationId = path.split('/')[4];

      const application = await partnershipModel.rejectApplication(applicationId);

      return jsonResponse({
        message: '已拒绝申请',
        data: application
      });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // 获取我的情侣信息
  if (path === '/api/partner/my' && method === 'GET') {
    try {
      const user = await authenticate(request);

      const partnership = await partnershipModel.getPartnership(user._id);

      return jsonResponse({
        message: '获取成功',
        data: partnership
      });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // 解除情侣关系
  if (path === '/api/partner/dissolve' && method === 'POST') {
    try {
      const user = await authenticate(request);

      await partnershipModel.dissolvePartnership(user._id);

      return jsonResponse({ message: '已解除情侣关系' });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // ============ 信件路由 ============

  // 创建信件
  if (path === '/api/letter' && method === 'POST') {
    try {
      const user = await authenticate(request);
      const body = await request.json();
      const { title, content, paperType, scheduledTime } = body;

      if (!title || !content || !scheduledTime) {
        return errorResponse('请填写完整信件信息');
      }

      const scheduledDate = new Date(scheduledTime);
      const now = new Date();
      if (scheduledDate <= now) {
        return errorResponse('发送时间必须是未来时间');
      }

      // 获取用户的情侣信息
      const partnership = await partnershipModel.getPartnership(user._id);
      if (!partnership || !partnership.partner) {
        return errorResponse('您还没有情侣，无法发送信件');
      }

      const letter = await letterModel.createLetter({
        fromUserId: user._id,
        toUserId: partnership.partner._id,
        title,
        content,
        paperType: paperType || 'default',
        scheduledTime
      });

      return jsonResponse({
        message: '信件创建成功，将在指定时间发送',
        data: letter
      }, 201);
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // 获取发送的信件
  if (path === '/api/letter/sent' && method === 'GET') {
    try {
      const user = await authenticate(request);

      const letters = await letterModel.getSentLetters(user._id);

      return jsonResponse({
        message: '获取成功',
        data: letters
      });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // 获取收到的信件
  if (path === '/api/letter/received' && method === 'GET') {
    try {
      const user = await authenticate(request);

      const letters = await letterModel.getReceivedLetters(user._id);

      return jsonResponse({
        message: '获取成功',
        data: letters
      });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // 获取信件详情
  if (path.match(/^\/api\/letter\/[^/]+$/) && method === 'GET') {
    try {
      const user = await authenticate(request);
      const letterId = path.split('/')[3];

      const letter = await letterModel.getLetterById(letterId);
      if (!letter) {
        return errorResponse('信件不存在', 404);
      }

      // 检查权限
      if (letter.fromUserId !== user._id && letter.toUserId !== user._id) {
        return errorResponse('无权查看此信件', 403);
      }

      return jsonResponse({
        message: '获取成功',
        data: letter
      });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // 删除信件
  if (path.match(/^\/api\/letter\/[^/]+$/) && method === 'DELETE') {
    try {
      const user = await authenticate(request);
      const letterId = path.split('/')[3];

      await letterModel.deleteLetter(letterId, user._id);

      return jsonResponse({ message: '信件删除成功' });
    } catch (error) {
      return errorResponse(error.message, 401);
    }
  }

  // 404 处理
  return errorResponse('API endpoint not found', 404);
}

// Cloudflare Workers 入口点
export default {
  fetch: handleRequest
};
