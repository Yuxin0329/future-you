<template>
  <div class="main-container">
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
      <div class="welcome-section">
        <h1 class="welcome-title">
          你好，{{ userStore.username }} 💕
        </h1>
        <p class="welcome-subtitle">
          今天想给TA写点什么吗？
        </p>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <el-card
          class="action-card"
          shadow="hover"
          @click="$router.push('/write')"
        >
          <div class="action-icon gradient-bg">
            <el-icon><Edit /></el-icon>
          </div>
          <h3>写信</h3>
          <p>给未来的TA写一封信</p>
        </el-card>

        <el-card
          class="action-card"
          shadow="hover"
          @click="$router.push('/read')"
        >
          <div class="action-icon gradient-bg">
            <el-icon><Message /></el-icon>
          </div>
          <h3>收信</h3>
          <p>查看TA给你的信</p>
        </el-card>

        <el-card
          class="action-card"
          shadow="hover"
          @click="$router.push('/partner')"
        >
          <div class="action-icon gradient-bg">
            <el-icon><Star /></el-icon>
          </div>
          <h3>我的伴侣</h3>
          <p>管理情侣关系</p>
        </el-card>

        <el-card
          class="action-card"
          shadow="hover"
          @click="$router.push('/profile')"
        >
          <div class="action-icon gradient-bg">
            <el-icon><User /></el-icon>
          </div>
          <h3>个人中心</h3>
          <p>管理个人信息</p>
        </el-card>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <el-card class="stats-card" shadow="hover">
          <div class="stat-item">
            <div class="stat-value">3</div>
            <div class="stat-label">已发送信件</div>
          </div>
          <el-divider direction="vertical" />
          <div class="stat-item">
            <div class="stat-value">5</div>
            <div class="stat-label">已收到信件</div>
          </div>
          <el-divider direction="vertical" />
          <div class="stat-item">
            <div class="stat-value">2</div>
            <div class="stat-label">待收信件</div>
          </div>
        </el-card>
      </div>

      <!-- 近期活动 -->
      <div class="recent-activity">
        <h2 class="section-title">近期动态</h2>
        <el-card class="activity-card" shadow="hover">
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon sent">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">你给TA写了一封信</div>
                <div class="activity-time">2小时前</div>
              </div>
            </div>
            <el-divider />
            <div class="activity-item">
              <div class="activity-icon received">
                <el-icon><Message /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">TA给你写了一封信</div>
                <div class="activity-time">昨天</div>
              </div>
            </div>
            <el-divider />
            <div class="activity-item">
              <div class="activity-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">有一封信将在7天后送达</div>
                <div class="activity-time">3天前</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Star,
  User,
  ArrowDown,
  Edit,
  Message,
  SwitchButton,
  SuccessFilled,
  Clock
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

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
.main-container {
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;

  .welcome-title {
    font-size: 36px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 12px;
  }

  .welcome-subtitle {
    font-size: 18px;
    color: #7f8c8d;
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;

  .action-card {
    border-radius: 16px;
    text-align: center;
    padding: 40px 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 24px rgba(161, 140, 209, 0.2);
    }

    .action-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon {
        font-size: 32px;
        color: white;
      }
    }

    h3 {
      font-size: 20px;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: #7f8c8d;
    }
  }
}

.stats-section {
  margin-bottom: 40px;

  .stats-card {
    border-radius: 16px;
    padding: 32px;
    text-align: center;

    .stat-item {
      display: inline-block;
      min-width: 120px;

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #7f8c8d;
      }
    }

    .el-divider--vertical {
      height: 60px;
      margin: 0 32px;
    }
  }
}

.recent-activity {
  .section-title {
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 16px;
  }

  .activity-card {
    border-radius: 16px;
    padding: 24px;

    .activity-list {
      .activity-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 0;

        .activity-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          &.sent {
            background: #e8f5e9;
            color: #67c23a;
          }

          &.received {
            background: #e3f2fd;
            color: #409eff;
          }

          &.pending {
            background: #fff3e0;
            color: #e6a23c;
          }

          .el-icon {
            font-size: 24px;
          }
        }

        .activity-content {
          flex: 1;

          .activity-title {
            font-size: 16px;
            color: #2c3e50;
            margin-bottom: 4px;
          }

          .activity-time {
            font-size: 14px;
            color: #95a5a6;
          }
        }
      }

      .el-divider {
        margin: 12px 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .stats-section {
    .stats-card {
      padding: 24px 16px;

      .el-divider--vertical {
        height: 40px;
        margin: 0 16px;
      }

      .stat-item {
        min-width: 80px;

        .stat-value {
          font-size: 24px;
        }
      }
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
