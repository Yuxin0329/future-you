<template>
  <div class="write-container">
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
        <h1 class="page-title">写信</h1>
        <div style="width: 40px;"></div>
      </div>

      <el-card class="write-card" shadow="hover">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="80px"
          class="write-form"
        >
          <!-- 标题 -->
          <el-form-item label="信件标题" prop="title">
            <el-input
              v-model="form.title"
              placeholder="给这封信起个标题吧"
              clearable
            />
          </el-form-item>

          <!-- 收信人（自动填充） -->
          <el-form-item label="收信人">
            <div class="recipient-info">
              <el-icon><User /></el-icon>
              <span>{{ partnerUsername || '加载中...' }}</span>
            </div>
          </el-form-item>

          <!-- 信纸选择 -->
          <el-form-item label="选择信纸">
            <PaperSelector v-model="form.paperType" />
          </el-form-item>

          <!-- 富文本编辑器 -->
          <el-form-item label="信件内容" prop="content">
            <RichTextEditor
              ref="richTextEditorRef"
              v-model="form.content"
              :paper-type="form.paperType"
              :min-height="'400px'"
            />
          </el-form-item>

          <!-- 录音 -->
          <el-form-item label="语音留言">
            <AudioRecorder ref="audioRecorderRef" @update:audio="form.audio = $event" />
          </el-form-item>

          <!-- 送达时间 -->
          <el-form-item label="送达时间" prop="scheduledTime">
            <el-date-picker
              v-model="form.scheduledTime"
              type="datetime"
              placeholder="选择送达时间"
              format="YYYY-MM-DD HH:mm"
              :disabled-date="disabledDate"
              :disabled-hours="disabledHours"
              :disabled-minutes="disabledMinutes"
              style="width: 100%;"
            />
            <div v-if="form.scheduledTime" class="time-hint">
              <el-icon><Clock /></el-icon>
              <span>{{ timeRemaining }}</span>
            </div>
          </el-form-item>

          <!-- 操作按钮 -->
          <el-form-item>
            <div class="button-group">
              <el-button @click="handleCancel">
                取消
              </el-button>
              <el-button
                type="primary"
                class="gradient-bg"
                :loading="loading"
                @click="handleSend"
              >
                {{ loading ? '发送中...' : '发送' }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'
import PaperSelector from '@/components/PaperSelector.vue'
import AudioRecorder from '@/components/AudioRecorder.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import {
  Star,
  User,
  ArrowDown,
  SwitchButton,
  ArrowLeft,
  Clock
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const richTextEditorRef = ref(null)
const audioRecorderRef = ref(null)
const loading = ref(false)
const partnerUsername = ref('')

// 表单数据
const form = reactive({
  title: '',
  content: '',
  paperType: 'default',
  audio: null,
  scheduledTime: null
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入信件标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在2-50个字符', trigger: 'blur' }
  ],
  content: [
    {
      validator: (rule, value, callback) => {
        const plainText = richTextEditorRef.value?.getContent()?.replace(/<[^>]*>/g, '') || ''
        if (!plainText || plainText.trim().length < 10) {
          callback(new Error('内容至少10个字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  scheduledTime: [
    { required: true, message: '请选择送达时间', trigger: 'change' }
  ]
}

// 禁用过去的日期
const disabledDate = (time) => {
  const now = new Date()
  return time.getTime() <= now.getTime()
}

// 禁用过去的小时
const disabledHours = () => {
  const hours = []
  const now = new Date()
  if (form.scheduledTime) {
    const selectedDate = new Date(form.scheduledTime)
    if (selectedDate.toDateString() === now.toDateString()) {
      for (let i = 0; i < now.getHours(); i++) {
        hours.push(i)
      }
    }
  }
  return hours
}

// 禁用过去的分钟
const disabledMinutes = (hour) => {
  const minutes = []
  const now = new Date()
  if (form.scheduledTime) {
    const selectedDate = new Date(form.scheduledTime)
    if (selectedDate.toDateString() === now.toDateString() && hour === now.getHours()) {
      for (let i = 0; i < now.getMinutes(); i++) {
        minutes.push(i)
      }
    }
  }
  return minutes
}

// 计算剩余时间
const timeRemaining = computed(() => {
  if (!form.scheduledTime) return ''

  const now = new Date()
  const target = new Date(form.scheduledTime)
  const diff = target - now

  if (diff <= 0) return '时间已过'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  let result = []
  if (days > 0) result.push(`${days}天`)
  if (hours > 0) result.push(`${hours}小时`)
  if (minutes > 0) result.push(`${minutes}分钟`)

  return `距离发送还有 ${result.join('')}`
})

// 获取伴侣信息
const fetchPartnerInfo = async () => {
  try {
    const response = await request.get('/partner/my')
    if (response.data && response.data.partner) {
      partnerUsername.value = response.data.partner.username
    } else {
      ElMessage.warning('您还没有情侣，请先结对')
      router.push('/partner')
    }
  } catch (error) {
    console.error('获取伴侣信息失败:', error)
  }
}

// 处理取消
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消写信吗？内容将不会保存。',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '继续编辑',
        type: 'warning'
      }
    )

    router.push('/main')
  } catch (error) {
    // 用户点击了"继续编辑"，不执行任何操作
  }
}

// 处理发送
const handleSend = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const letterData = {
          title: form.title,
          content: form.content,
          paperType: form.paperType,
          scheduledTime: form.scheduledTime,
          audioFile: form.audio
        }

        const response = await request.post('/letter', letterData)

        ElMessage.success(`信件已保存！将在 ${formatDate(form.scheduledTime)} 发送给 ${partnerUsername.value}`)

        // 清空表单
        if (richTextEditorRef.value) {
          richTextEditorRef.value.clearContent()
        }
        if (audioRecorderRef.value) {
          audioRecorderRef.value.clearAll()
        }

        form.title = ''
        form.content = ''
        form.paperType = 'default'
        form.audio = null
        form.scheduledTime = null

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          router.push('/main')
        }, 2000)
      } catch (error) {
        console.error('发送失败:', error)
        ElMessage.error(error.response?.data?.message || '发送失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

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
  fetchPartnerInfo()
})
</script>

<style lang="scss" scoped>
.write-container {
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
  max-width: 1000px;
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

.write-card {
  border-radius: 16px;
  padding: 40px;

  .write-form {
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
    }

    :deep(.el-date-picker) {
      width: 100%;
    }
  }

  .recipient-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
    border-radius: 12px;
    color: #2c3e50;
    font-weight: 500;

    .el-icon {
      color: #a18cd1;
      font-size: 20px;
    }
  }

  .time-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 8px 12px;
    background: #f0f9ff;
    border-radius: 8px;
    font-size: 13px;
    color: #0288d1;

    .el-icon {
      color: #0288d1;
    }
  }

  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      padding: 12px 32px;
      border-radius: 12px;
      font-size: 16px;
    }

    .gradient-bg {
      background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);
      border: none;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(161, 140, 209, 0.3);
      }
    }
  }
}

@media (max-width: 768px) {
  .content {
    padding: 24px 16px;
  }

  .write-card {
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

  .button-group {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>
