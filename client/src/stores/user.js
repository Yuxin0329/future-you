import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi, getUserInfo } from '@/api/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')

  // 初始化用户信息
  const initUserInfo = async () => {
    if (token.value) {
      try {
        const data = await getUserInfo()
        userInfo.value = data
      } catch (error) {
        console.error('获取用户信息失败:', error)
        logout()
      }
    }
  }

  // 登录
  const login = async (credentials) => {
    try {
      const data = await loginApi(credentials)
      token.value = data.token
      userInfo.value = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      ElMessage.success('登录成功！')
      return true
    } catch (error) {
      ElMessage.error(error.message || '登录失败，请检查用户名和密码')
      return false
    }
  }

  // 注册
  const register = async (userData) => {
    try {
      const data = await registerApi(userData)
      token.value = data.token
      userInfo.value = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      ElMessage.success('注册成功！欢迎来到 Future You')
      return true
    } catch (error) {
      ElMessage.error(error.message || '注册失败，请稍后重试')
      return false
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    ElMessage.success('已退出登录')
  }

  // 更新用户信息
  const updateUserInfo = (newInfo) => {
    userInfo.value = { ...userInfo.value, ...newInfo }
    localStorage.setItem('user', JSON.stringify(userInfo.value))
  }

  // 初始化
  initUserInfo()

  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    login,
    register,
    logout,
    updateUserInfo
  }
})
