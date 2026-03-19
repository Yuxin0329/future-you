<template>
  <div class="home-container">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <el-icon class="logo-icon"><Star /></el-icon>
          <span class="logo-text">Future You</span>
        </div>
        <div class="nav-buttons">
          <el-button type="primary" round @click="$router.push('/login')">
            登录
          </el-button>
          <el-button round @click="$router.push('/register')">
            注册
          </el-button>
        </div>
      </div>
    </nav>

    <!-- 主内容区 - Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          给未来的<span class="gradient-text">TA</span>
        </h1>
        <p class="hero-subtitle">
          一封跨越时间的信，藏着此刻最真挚的心意
        </p>
        <p class="hero-description">
          在这个快节奏的时代，让我们慢下来，为爱的人写一封信。
          设定未来的日期，让爱在特定的时刻送达，成为彼此生命中最温暖的惊喜。
        </p>
        <div class="hero-features">
          <div class="feature-item">
            <el-icon class="feature-icon"><Clock /></el-icon>
            <span>定时发送</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><Lock /></el-icon>
            <span>私密安全</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><Star /></el-icon>
            <span>永久保存</span>
          </div>
        </div>
        <el-button
          type="primary"
          size="large"
          round
          class="cta-button"
          @click="$router.push('/register')"
        >
          开始写信 <el-icon class="ml-1"><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="hero-illustration">
        <div class="letter-card">
          <div class="letter-content">
            <div class="letter-lines"></div>
          </div>
          <div class="heart-decoration">💕</div>
        </div>
      </div>
    </div>

    <!-- 使用场景 -->
    <div class="scenes-section">
      <div class="section-header">
        <h2 class="section-title">何时写信</h2>
        <p class="section-subtitle">生活中的每一个重要时刻，都值得用一封信来记录</p>
      </div>
      <div class="scenes-grid">
        <SceneCard
          title="纪念日写信"
          description="纪念日、生日、情人节，在这些特殊的日子里，为TA写一封充满爱意的信"
          icon="star"
          variant="pink"
        />
        <SceneCard
          title="距离时的思念"
          description="异地恋、出差、分别前，把思念写在信里，让TA感受到你的心意"
          icon="location"
          variant="blue"
        />
        <SceneCard
          title="日常小确幸"
          description="每天的小惊喜、小感动，记录下那些平凡却温暖的瞬间"
          icon="present"
          variant="green"
        />
        <SceneCard
          title="重要时刻"
          description="求婚、结婚纪念日、孩子的生日，记录人生中最珍贵的时刻"
          icon="calendar"
          variant="orange"
        />
      </div>
    </div>

    <!-- 特色功能区 -->
    <div class="features-section">
      <div class="section-header">
        <h2 class="section-title">产品特色</h2>
        <p class="section-subtitle">专为情侣设计的时间信件平台</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon-wrapper gradient-bg">
            <el-icon :size="32"><Timer /></el-icon>
          </div>
          <h3>定时发送</h3>
          <p>精确到秒的定时发送功能，让爱在特定时刻送达</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon-wrapper gradient-bg">
            <el-icon :size="32"><Lock /></el-icon>
          </div>
          <h3>私密安全</h3>
          <p>端到端加密，只有你们能看到彼此的信件</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon-wrapper gradient-bg">
            <el-icon :size="32"><Wallet /></el-icon>
          </div>
          <h3>永久保存</h3>
          <p>云端存储，随时随地回顾你们的美好回忆</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon-wrapper gradient-bg">
            <el-icon :size="32"><Bell /></el-icon>
          </div>
          <h3>温馨提醒</h3>
          <p>信件到期前提醒，让惊喜如期而至</p>
        </div>
      </div>
    </div>

    <!-- 使用步骤 -->
    <div class="steps-section">
      <div class="section-header">
        <h2 class="section-title">如何使用</h2>
        <p class="section-subtitle">简单五步，开始你们的时光信件之旅</p>
      </div>
      <div class="steps-container">
        <StepItem
          :step="1"
          title="注册账号"
          description="你和你男朋友各注册一个账号"
        />
        <StepItem
          :step="2"
          title="结为情侣"
          description="互相绑定账号，成为彼此的唯一"
        />
        <StepItem
          :step="3"
          title="写信给对方"
          description="设定未来的日期，写下你的心里话"
        />
        <StepItem
          :step="4"
          title="等待到日期"
          description="在漫长的等待中，期待那天的到来"
        />
        <StepItem
          :step="5"
          title="收信并阅读"
          description="收到信的那一刻，感受满满的爱意"
          :is-last="true"
        />
      </div>
    </div>

    <!-- FAQ 快速问答 -->
    <div class="faq-section">
      <div class="section-header">
        <h2 class="section-title">常见问题</h2>
        <p class="section-subtitle">关于 Future You，你可能想知道的</p>
      </div>
      <div class="faq-container">
        <FAQItem
          question="信件到期前能看到吗？"
          answer="不能，这是惊喜的一部分。信件只有在到达设定的日期后才能查看，确保那份心意能在特定的时刻被接收。"
        />
        <FAQItem
          question="可以修改已发送的信件吗？"
          answer="不可以。为了确保信件的完整性和惊喜感，一旦发送就无法修改。建议你在发送前仔细检查信件内容。"
        />
        <FAQItem
          question="忘记密码怎么办？"
          answer='在登录页面点击"忘记密码"按钮，按照提示重置密码。如果遇到问题，请联系我们的客服团队。'
        />
        <FAQItem
          question="可以给多人写信吗？"
          answer="目前只支持情侣两人之间互相写信。我们的定位是专注为情侣打造的时间信件平台，让爱更纯粹。"
        />
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="footer">
      <p>© 2024 Future You - 专为情侣设计的时间信件平台 💕</p>
      <p class="footer-links">
        <a href="#">关于我们</a>
        <span class="divider">|</span>
        <a href="#">隐私政策</a>
        <span class="divider">|</span>
        <a href="#">用户协议</a>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { Star, Clock, Lock, ArrowRight, Timer, Wallet, Bell } from '@element-plus/icons-vue'
import SceneCard from '@/components/SceneCard.vue'
import StepItem from '@/components/StepItem.vue'
import FAQItem from '@/components/FAQItem.vue'
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafafa 0%, #f0f0f5 100%);
}

.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 12px rgba(161, 140, 209, 0.1);

  .nav-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

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

  .nav-buttons {
    display: flex;
    gap: 12px;
  }
}

.hero-section {
  padding: 120px 24px 60px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 60px;
  min-height: calc(100vh - 200px);

  .hero-content {
    flex: 1;

    .hero-title {
      font-size: 56px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 20px;
      color: #2c3e50;

      .gradient-text {
        background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .hero-subtitle {
      font-size: 22px;
      color: #2c3e50;
      margin-bottom: 16px;
      line-height: 1.6;
      font-weight: 500;
    }

    .hero-description {
      font-size: 16px;
      color: #7f8c8d;
      margin-bottom: 40px;
      line-height: 1.8;
      max-width: 520px;
    }

    .hero-features {
      display: flex;
      gap: 32px;
      margin-bottom: 40px;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        color: #2c3e50;
        font-weight: 500;

        .feature-icon {
          color: #a18cd1;
          font-size: 20px;
        }
      }
    }

    .cta-button {
      padding: 16px 48px;
      font-size: 18px;
      background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);
      border: none;
      font-weight: 600;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(161, 140, 209, 0.3);
      }

      .ml-1 {
        margin-left: 4px;
      }
    }
  }

  .hero-illustration {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    .letter-card {
      width: 320px;
      height: 420px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(161, 140, 209, 0.2);
      padding: 32px;
      position: relative;
      animation: float 3s ease-in-out infinite;

      .letter-content {
        width: 100%;
        height: 100%;
        border: 2px dashed #e0e0e0;
        border-radius: 12px;
        position: relative;

        .letter-lines {
          width: 80%;
          height: 8px;
          background: linear-gradient(90deg, #f0f0f0 50%, transparent 50%);
          background-size: 100% 8px;
          margin: 20px auto;
        }
      }

      .heart-decoration {
        position: absolute;
        top: -20px;
        right: -20px;
        font-size: 48px;
        animation: heartbeat 1.5s ease-in-out infinite;
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.scenes-section,
.features-section,
.steps-section,
.faq-section {
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;

  .section-title {
    font-size: 36px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 12px;
  }

  .section-subtitle {
    font-size: 18px;
    color: #7f8c8d;
    margin: 0;
  }
}

.scenes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;

  .feature-card {
    background: white;
    padding: 40px 32px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(161, 140, 209, 0.1);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 32px rgba(161, 140, 209, 0.2);
    }

    .feature-icon-wrapper {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;

      .el-icon {
        font-size: 32px;
        color: white;
      }
    }

    h3 {
      font-size: 20px;
      margin-bottom: 12px;
      color: #2c3e50;
      font-weight: 600;
    }

    p {
      font-size: 15px;
      color: #7f8c8d;
      line-height: 1.6;
      margin: 0;
    }
  }
}

.steps-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.footer {
  text-align: center;
  padding: 48px 24px;
  background: linear-gradient(135deg, rgba(161, 140, 209, 0.05) 0%, rgba(255, 154, 158, 0.05) 100%);
  border-top: 1px solid rgba(161, 140, 209, 0.1);

  p {
    color: #7f8c8d;
    font-size: 14px;
    margin-bottom: 8px;

    &.footer-links {
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;

      a {
        color: #a18cd1;
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
          color: #ff9a9e;
        }
      }

      .divider {
        color: #e0e0e0;
      }
    }
  }
}

@media (max-width: 1024px) {
  .scenes-grid,
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-section {
    gap: 40px;

    .hero-content {
      .hero-title {
        font-size: 48px;
      }
    }
  }
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding-top: 100px;

    .hero-content {
      .hero-title {
        font-size: 36px;
      }

      .hero-description {
        max-width: 100%;
      }

      .hero-features {
        flex-wrap: wrap;
        justify-content: center;
      }
    }

    .hero-illustration {
      .letter-card {
        width: 280px;
        height: 380px;
      }
    }
  }

  .scenes-grid,
  .features-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    .section-title {
      font-size: 28px;
    }

    .section-subtitle {
      font-size: 16px;
    }
  }

  .scenes-section,
  .features-section,
  .steps-section,
  .faq-section {
    padding: 48px 24px;
  }

  .navbar {
    .nav-content {
      padding: 0 16px;
    }

    .logo-text {
      font-size: 20px;
    }
  }

  .footer {
    padding: 32px 24px;

    .footer-links {
      flex-direction: column;
      gap: 8px;

      .divider {
        display: none;
      }
    }
  }
}
</style>
