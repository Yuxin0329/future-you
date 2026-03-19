<template>
  <div class="faq-item">
    <div class="faq-question" @click="toggle">
      <span class="question-text">{{ question }}</span>
      <el-icon class="toggle-icon" :class="{ expanded: isExpanded }">
        <ArrowDown />
      </el-icon>
    </div>
    <transition name="faq-fade">
      <div v-show="isExpanded" class="faq-answer">
        <p>{{ answer }}</p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

defineProps({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  }
})

const isExpanded = ref(false)

const toggle = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style lang="scss" scoped>
.faq-item {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(161, 140, 209, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(161, 140, 209, 0.12);
  }

  .faq-question {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
    background: white;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(161, 140, 209, 0.03);
    }

    .question-text {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      flex: 1;
      line-height: 1.5;
    }

    .toggle-icon {
      width: 24px;
      height: 24px;
      color: #a18cd1;
      flex-shrink: 0;
      transition: transform 0.3s ease;
      margin-left: 12px;

      &.expanded {
        transform: rotate(180deg);
      }
    }
  }

  .faq-answer {
    padding: 0 24px 20px;
    background: rgba(161, 140, 209, 0.03);
    border-top: 1px solid rgba(161, 140, 209, 0.1);

    p {
      margin: 16px 0 0;
      font-size: 15px;
      color: #7f8c8d;
      line-height: 1.6;
    }
  }
}

.faq-fade-enter-active,
.faq-fade-leave-active {
  transition: all 0.3s ease;
}

.faq-fade-enter-from,
.faq-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .faq-item {
    .faq-question {
      padding: 16px 20px;

      .question-text {
        font-size: 15px;
      }
    }

    .faq-answer {
      padding: 0 20px 16px;

      p {
        font-size: 14px;
      }
    }
  }
}
</style>
