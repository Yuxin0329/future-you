<template>
  <div class="partner-container">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <div class="logo">
        <el-icon class="logo-icon"><Star /></el-icon>
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
        <h1 class="page-title">我的伴侣</h1>
        <div style="width: 40px;"></div>
      </div>

      <!-- 已结对状态 -->
      <el-card v-if="myPartner" class="partner-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Star /></el-icon>
            <span>我的挚爱</span>
          </div>
        </template>

        <div class="partner-info">
          <div class="partner-avatar">
            <el-icon size="48"><User /></el-icon>
          </div>
          <div class="partner-details">
            <h2 class="partner-name">{{ myPartner.partner.username }}</h2>
            <p class="partner-date">
              结对日期：{{ formatDate(myPartner.createdAt) }}
            </p>
            <p class="partner-status status-paired">已结对</p>
          </div>
        </div>

        <div class="partner-actions">
          <el-button type="primary" @click="goToWrite">
            <el-icon><Document /></el-icon>
            给TA写信
          </el-button>
          <el-button type="danger" @click="handleDissolve">
            <el-icon><Delete /></el-icon>
            解除关系
          </el-button>
        </div>
      </el-card>

      <!-- 未结对状态 -->
      <div v-else class="no-partner">
        <el-card class="apply-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Star /></el-icon>
              <span>发起结对</span>
            </div>
          </template>

          <el-form :model="applyForm" label-width="80px">
            <el-form-item label="用户名">
              <el-input
                v-model="applyForm.username"
                placeholder="输入对方的用户名"
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                class="gradient-bg"
                :loading="applying"
                @click="handleApply"
              >
                发起申请
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 待处理邀请 -->
        <el-card v-if="pendingApplications.length > 0" class="invitations-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Star /></el-icon>
              <span>待处理邀请 ({{ pendingApplications.length }})</span>
            </div>
          </template>

          <div class="invitation-list">
            <div
              v-for="app in pendingApplications"
              :key="app._id"
              class="invitation-item"
            >
              <div class="invitation-info">
                <el-icon><User /></el-icon>
                <div class="invitation-details">
                  <span class="invitation-username">{{ app.fromUsername }}</span>
                  <span class="invitation-time">{{ formatDate(app.createdAt) }}</span>
                </div>
              </div>
              <div class="invitation-actions">
                <el-button
                  type="success"
                  size="small"
                  @click="handleAccept(app._id)"
                >
                  接受
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="handleReject(app._id)"
                >
                  拒绝
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 我的申请 -->
        <el-card v-if="sentApplications.length > 0" class="applications-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Document /></el-icon>
              <span>我的申请 ({{ sentApplications.length }})</span>
            </div>
          </template>

          <div class="application-list">
            <div
              v-for="app in sentApplications"
              :key="app._id"
              class="application-item"
            >
              <div class="application-info">
                <el-icon><User /></el-icon>
                <div class="application-details">
                  <span class="application-username">{{ app.toUsername }}</span>
                  <el-tag :type="getStatusType(app.status)" size="small">
                    {{ getStatusText(app.status) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'
import {
  Star,
  User,
  ArrowDown,
  SwitchButton,
  ArrowLeft,
  Document,
  Delete
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const myPartner = ref(null)
const pendingApplications = ref([])
const sentApplications = ref([])
const applying = ref(false)

const applyForm = reactive({
  username: ''
})

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    accepted: '已接受',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

// 获取我的伴侣
const fetchMyPartner = async () => {
  try {
    const response = await request.get('/partner/my')
    myPartner.value = response.data
  } catch (error) {
    console.error('获取情侣信息失败:', error)
  }
}

// 获取待处理申请
const fetchPendingApplications = async () => {
  try {
    const response = await request.get('/partner/applications/pending')
    pendingApplications.value = response.data
  } catch (error) {
    console.error('获取待处理申请失败:', error)
  }
}

// 获取发送的申请
const fetchSentApplications = async () => {
  try {
    const response = await request.get('/partner/applications/sent')
    sentApplications.value = response.data
  } catch (error) {
    console.error('获取发送申请失败:', error)
  }
}

// 发起申请
const handleApply = async () => {
  if (!applyForm.username) {
    ElMessage.warning('请输入用户名')
    return
  }

  if (applyForm.username === userStore.username) {
    ElMessage.warning('不能对自己发起申请')
    return
  }

  applying.value = true
  try {
    const response = await request.post('/partner/apply', {
      toUsername: applyForm.username
    })

    ElMessage.success(response.message)
    applyForm.username = ''

    // 刷新申请列表
    await fetchSentApplications()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '发起申请失败')
  } finally {
    applying.value = false
  }
}

// 接受申请
const handleAccept = async (applicationId) => {
  try {
    await request.post(`/partner/applications/${applicationId}/accept`)
    ElMessage.success('已接受申请，成功结对！')

    // 刷新数据
    await Promise.all([
      fetchMyPartner(),
      fetchPendingApplications()
    ])
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '接受申请失败')
  }
}

// 拒绝申请
const handleReject = async (applicationId) => {
  try {
    await request.post(`/partner/applications/${applicationId}/reject`)
    ElMessage.success('已拒绝申请')

    // 刷新数据
    await fetchPendingApplications()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '拒绝申请失败')
  }
}

// 解除关系
const handleDissolve = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要解除与TA的情侣关系吗？此操作不可恢复。',
      '确认解除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await request.post('/partner/dissolve')
    ElMessage.success('已解除情侣关系')

    // 刷新数据
    myPartner.value = null
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '解除关系失败')
    }
  }
}

// 去写信
const goToWrite = () => {
  router.push('/write')
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

onMounted(() => {
  // 并行获取所有数据
  Promise.all([
    fetchMyPartner(),
    fetchPendingApplications(),
    fetchSentApplications()
  ])
})
</script>

<style lang="scss" scoped>
.partner-container {
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

.partner-card,
.apply-card,
.invitations-card,
.applications-card {
  border-radius: 16px;
  margin-bottom: 24px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 18px;
    color: #2c3e50;

    .header-icon {
      color: #a18cd1;
    }
  }
}

.partner-info {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  border-radius: 12px;
  margin-bottom: 24px;

  .partner-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 36px;
  }

  .partner-details {
    flex: 1;

    .partner-name {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #2c3e50;
    }

    .partner-date {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
    }

    .partner-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;

      &.status-paired {
        background: #e8f5e9;
        color: #52c41a;
      }
    }
  }
}

.partner-actions {
  display: flex;
  gap: 12px;

  .el-button {
    flex: 1;
    padding: 12px;
    border-radius: 12px;
  }
}

.no-partner {
  .apply-card {
    border: 2px dashed #a18cd1;
  }
}

.invitation-list,
.application-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.invitation-item,
.application-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: #f0f0f5;
    transform: translateX(4px);
  }
}

.invitation-info,
.application-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .el-icon {
    font-size: 24px;
    color: #a18cd1;
  }
}

.invitation-details,
.application-details {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .invitation-username,
  .application-username {
    font-weight: 600;
    color: #2c3e50;
  }

  .invitation-time {
    font-size: 12px;
    color: #999;
  }
}

.invitation-actions {
  display: flex;
  gap: 8px;
}

.gradient-bg {
  background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);
  border: none;
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(161, 140, 209, 0.3);
  }
}

@media (max-width: 768px) {
  .content {
    padding: 24px 16px;
  }

  .page-header {
    .page-title {
      font-size: 24px;
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

  .partner-info {
    flex-direction: column;
    text-align: center;

    .partner-details {
      .partner-name {
        font-size: 20px;
      }
    }
  }

  .partner-actions {
    flex-direction: column;
  }
}
</style>
