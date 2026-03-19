import request from './request'

/**
 * 用户登录
 * @param {Object} credentials - 登录凭证
 * @param {string} credentials.username - 用户名
 * @param {string} credentials.password - 密码
 * @returns {Promise<Object>} 返回token和用户信息
 */
export const login = (credentials) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data: credentials
  })
}

/**
 * 用户注册
 * @param {Object} userData - 注册信息
 * @param {string} userData.username - 用户名
 * @param {string} userData.password - 密码
 * @param {string} userData.confirmPassword - 确认密码
 * @param {string} [userData.phone] - 手机号（可选）
 * @param {string} [userData.email] - 邮箱（可选）
 * @returns {Promise<Object>} 返回token和用户信息
 */
export const register = (userData) => {
  return request({
    url: '/auth/register',
    method: 'post',
    data: userData
  })
}

/**
 * 获取当前用户信息
 * @returns {Promise<Object>} 用户信息
 */
export const getUserInfo = () => {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

/**
 * 更新用户信息
 * @param {Object} updateData - 更新的数据
 * @param {string} [updateData.phone] - 手机号
 * @param {string} [updateData.email] - 邮箱
 * @returns {Promise<Object>} 更新后的用户信息
 */
export const updateUserInfo = (updateData) => {
  return request({
    url: '/user/info',
    method: 'put',
    data: updateData
  })
}

/**
 * 检查用户名是否可用
 * @param {string} username - 用户名
 * @returns {Promise<Object>} { available: boolean }
 */
export const checkUsername = (username) => {
  return request({
    url: '/auth/check-username',
    method: 'post',
    data: { username }
  })
}
