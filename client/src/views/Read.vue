<template>
  <div class="read-container">
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
        <h1 class="page-title">收信</h1>
        <div style="width: 40px;"></div>
      </div>

      <!-- 标签页 -->
      <el-tabs v-model="activeTab" class="letter-tabs">
        <el-tab-pane label="待收信件" name="pending">
          <div class="letter-list">
            <el-card
              v-for="letter in pendingLetters"
              :key="letter.id"
              class="letter-card"
              shadow="hover"
            >
              <div class="letter-header">
                <h3 class="letter-title">{{ letter.title }}</h3>
                <el-tag type="warning">待收</el-tag>
              </div>
              <div class="letter-meta">
                <span class="sender">来自：{{ letter.sender }}</span>
                <span class="delivery-time">送达时间：{{ letter.deliveryTime }}</span>
              </div>
              <div class="letter-preview">
                {{ letter.preview }}
              </div>
            </el-card>

            <el-empty
              v-if="pendingLetters.length === 0"
              description="暂无待收信件"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="已收信件" name="received">
          <div class="letter-list">
            <el-card
              v-for="letter in receivedLetters"
              :key="letter.id"
              class="letter-card"
              shadow="hover"
              @click="viewLetter(letter)"
            >
              <div class="letter-header">
                <h3 class="letter-title">{{ letter.title }}</h3>
                <el-tag type="success">已收</el-tag>
              </div>
              <div class="letter-meta">
                <span class="sender">来自：{{ letter.sender }}</span>
                <span class="received-time">收到时间：{{ letter.receivedTime }}</span>
              </div>
              <div class="letter-preview">
                {{ letter.preview }}
              </div>
            </el-card>

            <el-empty
              v-if="receivedLetters.length === 0"
              description="暂无已收信件"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </main>

    <!-- 信件详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="信件详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedLetter" class="letter-detail">
        <h2 class="detail-title">{{ selectedLetter.title }}</h2>
        <div class="detail-meta">
          <span>来自：{{ selectedLetter.sender }}</span>
          <span>{{ selectedLetter.receivedTime }}</span>
        </div>
        <div class="detail-content">
          {{ selectedLetter.content }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Star,
  User,
  ArrowDown,
  SwitchButton,
  ArrowLeft
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('pending')
const dialogVisible = ref(false)
const selectedLetter = ref(null)

// 模拟数据 - 待收信件
const pendingLetters = ref([
  {
    id: 1,
    title: '给未来的你',
    sender: '亲爱的TA',
    deliveryTime: '2024-03-24 14:30',
    preview: '嘿，写这封信的时候，我正在想你...',
    content: '嘿，写这封信的时候，我正在想你。不知道读到这封信的你在做什么，是否还记得我们在一起的点点滴滴...'
  },
  {
    id: 2,
    title: '时光胶囊',
    sender: '亲爱的TA',
    deliveryTime: '2024-04-01 00:00',
    preview: '这是一个小小的时光胶囊，里面装着我对你的...',
    content: '这是一个小小的时光胶囊，里面装着我对你的全部思念。希望当你打开这封信时，能感受到我此刻的心情...'
  }
])

// 模拟数据 - 已收信件
const receivedLetters = ref([
  {
    id: 3,
    title: '想你了',
    sender: '亲爱的TA',
    receivedTime: '2024-03-15 10:30',
    preview: '今天天气很好，突然很想你...',
    content: '今天天气很好，突然很想你。想起我们上次一起去看的那个日落，真的很美...'
  },
  {
    id: 4,
    title: '生日快乐',
    sender: '亲爱的TA',
    receivedTime: '2024-03-10 00:00',
    preview: '虽然今天不能陪在你身边，但我的祝福永远...',
    content: '虽然今天不能陪在你身边，但我的祝福永远都在。生日快乐，我的爱人...'
  }
])

// 查看信件详情
const viewLetter = (letter) => {
  selectedLetter.value = letter
  dialogVisible.value = true
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
</script>

<style lang="scss" scoped>
.read-container {
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

.letter-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
  }

  :deep(.el-tabs__item) {
    font-size: 16px;
    font-weight: 500;
  }
}

.letter-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .letter-card {
    border-radius: 16px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(161, 140, 209, 0.2);
    }

    .letter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .letter-title {
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
      }
    }

    .letter-meta {
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: #7f8c8d;
      margin-bottom: 12px;

      .sender,
      .delivery-time,
      .received-time {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .letter-preview {
      font-size: 14px;
      color: #95a5a6;
      line-height: 1.6;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}

.letter-detail {
  .detail-title {
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 16px;
    text-align: center;
  }

  .detail-meta {
    display: flex;
    justify-content: center;
    gap: 24px;
    font-size: 14px;
    color: #7f8c8d;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e0e0e0;
  }

  .detail-content {
    font-size: 16px;
    line-height: 1.8;
    color: #2c3e50;
    white-space: pre-wrap;
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

  .letter-card {
    .letter-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .letter-meta {
      flex-direction: column;
      gap: 4px;
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
