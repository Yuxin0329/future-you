<template>
  <div class="login-container">
    <div class="login-card">
      <div class="card-header">
        <h1 class="title">欢迎回来</h1>
        <p class="subtitle">继续你们的时光之旅 💕</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="0"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            size="large"
            clearable
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
            placeholder="密码"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 记住密码 -->
        <div class="remember-me">
          <el-checkbox v-model="form.rememberMe">记住我</el-checkbox>
          <router-link to="/forgot-password" class="forgot-link">
            忘记密码？
          </router-link>
        </div>

        <!-- 登录按钮 -->
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="login-button gradient-bg"
          native-type="submit"
        >
          {{ loading ? '登录中...' : '登录' }}
        </el-button>
      </el-form>

      <div class="card-footer">
        <span class="footer-text">还没有账号？</span>
        <router-link to="/register" class="link">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

// 表单数据
const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const success = await userStore.login({
          username: form.username,
          password: form.password
        })

        if (success) {
          // 如果有重定向路径，跳转到指定页面，否则跳转到主页
          const redirect = route.query.redirect || '/main'
          router.push(redirect)
        }
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fafafa 0%, #f0f0f5 100%);
  padding: 24px;
}

.login-card {
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

.login-form {
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
        box-shadow: 0 2px 12px rgba(161, 140, 209, 0.15);
      }

      &.is-focus {
        box-shadow: 0 2px 16px rgba(161, 140, 209, 0.2);
        border-color: #a18cd1;
      }
    }

    .el-input__prefix {
      color: #a18cd1;
    }
  }
}

.remember-me {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 14px;
  color: #7f8c8d;

  .forgot-link {
    color: #a18cd1;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

.login-button {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  border: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(161, 140, 209, 0.3);
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
  .login-card {
    padding: 32px 24px;
  }

  .card-header {
    .title {
      font-size: 24px;
    }
  }
}
</style>
