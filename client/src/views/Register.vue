<template>
  <div class="register-container">
    <div class="register-card">
      <div class="card-header">
        <h1 class="title">注册账号</h1>
        <p class="subtitle">开启你们的时光之旅 💕</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="0"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名（3-20个字符）"
            size="large"
            clearable
            @blur="checkUsernameAvailability"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码（6-20个字符）"
            size="large"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="large"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 手机号（可选） -->
        <el-form-item prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="手机号（可选）"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 邮箱（可选） -->
        <el-form-item prop="email">
          <el-input
            v-model="form.email"
            placeholder="邮箱（可选）"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 注册按钮 -->
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="register-button gradient-bg"
          native-type="submit"
        >
          {{ loading ? '注册中...' : '注册' }}
        </el-button>
      </el-form>

      <div class="card-footer">
        <span class="footer-text">已有账号？</span>
        <router-link to="/login" class="link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { checkUsername } from '@/api/user'
import { User, Lock, Phone, Message } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

// 表单数据
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  phone: [
    { 
      validator: (rule, value, callback) => {
        // 如果为空或仅包含空格，直接通过验证
        if (!value || value.trim() === '') {
          callback()
          return
        }
        // 否则验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(value)) {
          callback(new Error('请输入有效的手机号'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  email: [
    { 
      validator: (rule, value, callback) => {
        // 如果为空或仅包含空格，直接通过验证
        if (!value || value.trim() === '') {
          callback()
          return
        }
        // 否则验证邮箱格式
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          callback(new Error('请输入有效的邮箱地址'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 检查用户名是否可用
const checkUsernameAvailability = async () => {
  if (form.username) {
    try {
      const result = await checkUsername(form.username)
      if (!result.available) {
        formRef.value.validateField('username', '用户名已被使用，请更换')
      }
    } catch (error) {
      console.error('检查用户名失败:', error)
    }
  }
}

// 处理注册
const handleRegister = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const success = await userStore.register({
          username: form.username,
          password: form.password,
          phone: form.phone,
          email: form.email
        })

        if (success) {
          router.push('/main')
        }
      } catch (error) {
        console.error('注册失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fafafa 0%, #f0f0f5 100%);
  padding: 24px;
}

.register-card {
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(161, 140, 209, 0.15);
  padding: 48px 40px;
}

.card-header {
  text-align: center;
  margin-bottom: 32px;

  .title {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 16px;
    color: #95a5a6;
  }
}

.register-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input) {
    .el-input__wrapper {
      border-radius: 12px;
      padding: 12px 16px;
      box-shadow: 0 2px 8px rgba(161, 140, 209, 0.08);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 2px 12px rgba(161, 140, 209, 0.12);
      }

      &.is-focus {
        box-shadow: 0 2px 16px rgba(161, 140, 209, 0.15);
        border-color: #a18cd1;
      }
    }

    .el-input__prefix {
      color: #a18cd1;
    }
  }
}

.register-button {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  margin-top: 8px;
  background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(161, 140, 209, 0.25);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.card-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #7f8c8d;

  .link {
    color: #a18cd1;
    text-decoration: none;
    font-weight: 600;
    margin-left: 4px;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 32px 24px;
  }

  .card-header {
    .title {
      font-size: 24px;
    }
  }
}
</style>
