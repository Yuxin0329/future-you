<template>
  <div class="profile-container">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <div class="logo">
        <el-icon class="logo-icon"><Love /></el-icon>
        <span class="logo-text">Future You</span>
      </div>
      <div class="user-actions">
        <el-dropdown @command="handleCommand">
          <div class="user-dropdown">
            <div class="avatar">
              <el-icon><User /></el-icon>
            </div>
            <span class="username">{{ userStore.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon> 个人中心
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="content">
      <div class="page-header">
        <el-button
          circle
          size="large"
          @click="$router.go(-1)"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1 class="page-title">个人中心</h1>
        <div style="width: 40px;"></div>
      </div>

      <el-card class="profile-card" shadow="hover">
        <!-- 用户头像和信息 -->
        <div class="profile-header">
          <div class="avatar-wrapper">
            <div class="avatar-large">
              <el-icon><User /></el-icon>
            </div>
            <el-button
              circle
              size="small"
              class="edit-avatar-btn"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
          </div>
          <div class="user-info">
            <h2 class="username">{{ userStore.username }}</h2>
            <p class="join-date">加入时间：{{ formatDate(userStore.userInfo?.createdAt) }}</p>
          </div>
        </div>

        <!-- 编辑表单 -->
        <el-divider />
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="profile-form"
        >
          <el-form-item label="用户名">
            <el-input
              v-model="form.username"
              disabled
            />
          </el-form-item>

          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="form.phone"
              placeholder="请输入手机号"
              clearable
            >
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱"
              clearable
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="gradient-bg"
              :loading="loading"
              @click="handleUpdate"
            >
              {{ loading ? '保存中...' : '保存修改' }}
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 背景设置 -->
      <el-card class="settings-card background-card" shadow="hover">
        <h3 class="settings-title">背景设置</h3>
        <p class="settings-desc">个性化你的页面背景，让使用体验更美好</p>
        <BackgroundSelector @change="handleBackgroundChange" />
      </el-card>

      <!-- 其他设置 -->
      <el-card class="settings-card" shadow="hover">
        <h3 class="settings-title">其他设置</h3>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <el-icon class="setting-icon"><Lock /></el-icon>
              <div>
                <div class="setting-label">修改密码</div>
                <div class="setting-desc">定期修改密码，保护账户安全</div>
              </div>
            </div>
            <el-button @click="showPasswordDialog = true">
              修改
            </el-button>
          </div>
          <el-divider />
          <div class="setting-item">
            <div class="setting-info">
              <el-icon class="setting-icon"><Delete /></el-icon>
              <div>
                <div class="setting-label danger">删除账号</div>
                <div class="setting-desc">删除后无法恢复，请谨慎操作</div>
              </div>
            </div>
            <el-button type="danger" plain @click="handleDeleteAccount">
              删除
            </el-button>
          </div>
        </div>
      </el-card>
    </main>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            show-password
            placeholder="请输入当前密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button
          type="primary"
          class="gradient-bg"
          :loading="passwordLoading"
          @click="handleChangePassword"
        >
          {{ passwordLoading ? '修改中...' : '确认修改' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { updateUserInfo } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Star,
  User,
  ArrowDown,
  SwitchButton,
  ArrowLeft,
  Edit,
  Phone,
  Message,
  Lock,
  Delete
} from '@element-plus/icons-vue'
import BackgroundSelector from '@/components/BackgroundSelector.vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const passwordFormRef = ref(null)
const loading = ref(false)
const passwordLoading = ref(false)
const showPasswordDialog = ref(false)

// 表单数据
const form = reactive({
  username: userStore.username,
  phone: userStore.userInfo?.phone || '',
  email: userStore.userInfo?.email || ''
})

// 修改密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const rules = {
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

// 修改密码验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '未知'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 重置表单
const resetForm = () => {
  form.phone = userStore.userInfo?.phone || ''
  form.email = userStore.userInfo?.email || ''
}

// 更新用户信息
const handleUpdate = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const updatedData = await updateUserInfo({
          phone: form.phone || undefined,
          email: form.email || undefined
        })

        userStore.updateUserInfo(updatedData)
        ElMessage.success('信息更新成功')
      } catch (error) {
        console.error('更新失败:', error)
        ElMessage.error('更新失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        // TODO: 调用修改密码API
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('密码修改成功，请重新登录')

        // 清空表单并关闭对话框
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
        showPasswordDialog.value = false

        // 退出登录
        userStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error('修改密码失败，请稍后重试')
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

// 删除账号
const handleDeleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '删除账号后，所有数据将无法恢复，确定要删除吗？',
      '删除账号',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    // TODO: 调用删除账号API
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('账号已删除')
    userStore.logout()
    router.push('/')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除账号失败:', error)
      ElMessage.error('删除账号失败，请稍后重试')
    }
  }
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}

// 处理背景变化
const handleBackgroundChange = (backgroundInfo) => {
  // 背景变化由 BackgroundSelector 组件内部处理
  // 这里可以添加额外的逻辑，比如保存到用户偏好设置
  console.log('背景已更新:', backgroundInfo)
}

onMounted(() => {
  // 初始化表单数据
  form.phone = userStore.userInfo?.phone || ''
  form.email = userStore.userInfo?.email || ''
})
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafafa 0%, #f0f0f5 100%);
}

.top-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(161, 140, 209, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;

    .logo-icon {
      font-size: 28px;
      color: #a18cd1;
    }

    .logo-text {
      font-size: 24px;
      font-weight: 600;
      background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .user-actions {
    .user-dropdown {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(161, 140, 209, 0.1);
      }

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .username {
        font-size: 14px;
        color: #2c3e50;
        font-weight: 500;
      }
    }
  }
}

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;

  .page-title {
    font-size: 32px;
    font-weight: 700;
    color: #2c3e50;
  }
}

.profile-card {
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;

  .profile-header {
    display: flex;
    align-items: center;
    gap: 24px;
    text-align: left;

    .avatar-wrapper {
      position: relative;

      .avatar-large {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 48px;
      }

      .edit-avatar-btn {
        position: absolute;
        bottom: 0;
        right: 0;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
    }

    .user-info {
      flex: 1;

      .username {
        font-size: 28px;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 8px;
      }

      .join-date {
        font-size: 14px;
        color: #95a5a6;
        margin: 0;
      }
    }
  }

  .profile-form {
    margin-top: 24px;

    :deep(.el-form-item__label) {
      font-weight: 600;
      color: #2c3e50;
    }

    :deep(.el-input__wrapper) {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(161, 140, 209, 0.08);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 2px 12px rgba(161, 140, 209, 0.15);
      }

      &.is-focus {
        box-shadow: 0 2px 16px rgba(161, 140, 209, 0.2);
        border-color: #a18cd1;
      }

      .el-input__prefix {
        color: #a18cd1;
      }
    }

    .gradient-bg {
      background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);
      border: none;
      padding: 12px 32px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(161, 140, 209, 0.3);
      }
    }
  }
}

.settings-card {
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;

  &.background-card {
    .settings-desc {
      font-size: 14px;
      color: #7f8c8d;
      margin-bottom: 24px;
      line-height: 1.6;
    }
  }

  .settings-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
  }

  .settings-list {
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;

      .setting-info {
        display: flex;
        align-items: center;
        gap: 16px;

        .setting-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(161, 140, 209, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a18cd1;
          font-size: 24px;
        }

        .setting-label {
          font-size: 16px;
          font-weight: 500;
          color: #2c3e50;
          margin-bottom: 4px;

          &.danger {
            color: #f56c6c;
          }
        }

        .setting-desc {
          font-size: 14px;
          color: #95a5a6;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .content {
    padding: 24px 16px;
  }

  .profile-card {
    padding: 24px 16px;

    .profile-header {
      flex-direction: column;
      text-align: center;
    }
  }

  .page-header {
    .page-title {
      font-size: 24px;
    }
  }

  .settings-list {
    .setting-item {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start !important;
    }
  }

  .top-bar {
    .logo-text {
      font-size: 20px;
    }

    .user-dropdown {
      .username {
        display: none;
      }
    }
  }
}
</style>
