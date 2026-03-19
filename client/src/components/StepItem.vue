<template>
  <div class="step-item" :class="{ active: isActive }">
    <div class="step-number" :class="{ completed: isCompleted }">
      <el-icon v-if="isCompleted" :size="20" class="check-icon">
        <Check />
      </el-icon>
      <span v-else>{{ step }}</span>
    </div>
    <div class="step-content">
      <h4 class="step-title">{{ title }}</h4>
      <p class="step-description">{{ description }}</p>
    </div>
    <div v-if="!isLast" class="step-connector"></div>
  </div>
</template>

<script setup>
import { Check } from '@element-plus/icons-vue'

defineProps({
  step: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isLast: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.step-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  padding-bottom: 24px;

  &:last-child {
    padding-bottom: 0;
  }

  .step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: white;
    border: 2px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
    color: #95a5a6;
    flex-shrink: 0;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;

    &.completed {
      background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);
      border-color: transparent;
      color: white;
    }
  }

  &.active .step-number {
    border-color: #a18cd1;
    color: #a18cd1;
    box-shadow: 0 0 0 4px rgba(161, 140, 209, 0.1);
  }

  .step-content {
    flex: 1;
    padding-top: 4px;

    .step-title {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .step-description {
      font-size: 14px;
      color: #7f8c8d;
      line-height: 1.6;
      margin: 0;
    }
  }

  .step-connector {
    position: absolute;
    left: 20px;
    top: 40px;
    width: 2px;
    height: calc(100% - 40px - 24px);
    background: #e0e0e0;
  }

  &.completed ~ .step-connector {
    background: linear-gradient(180deg, #a18cd1 0%, #e0e0e0 100%);
  }
}
</style>
