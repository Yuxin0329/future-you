/**
 * 认证相关工具函数
 */

const TOKEN_KEY = 'futureyou_token'

/**
 * 获取用户 token
 * @returns {string|null} token
 */
export function getUserToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置用户 token
 * @param {string} token
 */
export function setUserToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除用户 token
 */
export function removeUserToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export function isLoggedIn() {
  return !!getUserToken()
}

/**
 * 清除所有认证信息
 */
export function clearAuth() {
  removeUserToken()
  localStorage.removeItem('userInfo')
}
