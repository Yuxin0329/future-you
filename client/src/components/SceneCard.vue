<template>
  <div class="scene-card" :class="`scene-card-${variant}`">
    <div class="scene-icon-wrapper" :class="iconBgClass">
      <el-icon class="scene-icon" :size="32">
        <component :is="iconComponent" />
      </el-icon>
    </div>
    <h3 class="scene-title">{{ title }}</h3>
    <p class="scene-description">{{ description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Star,
  Location,
  Present,
  Calendar
} from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'pink', 'orange', 'green', 'blue', 'purple'].includes(value)
  }
})

// 图标映射
const iconMap = {
  star: Star,
  location: Location,
  present: Present,
  calendar: Calendar
}

const iconComponent = computed(() => {
  return iconMap[props.icon] || Star
})

// 图标背景类
const iconBgClass = computed(() => {
  return `icon-bg-${props.variant}`
})
</script>

<style lang="scss" scoped>
.scene-card {
  background: white;
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(161, 140, 209, 0.1);
  transition: all 0.3s ease;
  cursor: default;
  height: 100%;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(161, 140, 209, 0.2);
  }

  .scene-icon-wrapper {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    transition: all 0.3s ease;

    .scene-icon {
      color: white;
    }

    &.icon-bg-default {
      background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);
    }

    &.icon-bg-pink {
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    }

    &.icon-bg-orange {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.icon-bg-green {
      background: linear-gradient(135deg, #a8e6cf 0%, #88d8b0 100%);
    }

    &.icon-bg-blue {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    }

    &.icon-bg-purple {
      background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
    }
  }

  .scene-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 12px;
    line-height: 1.4;
  }

  .scene-description {
    font-size: 15px;
    color: #7f8c8d;
    line-height: 1.6;
    margin: 0;
  }
}

// 变体样式
.scene-card-pink {
  border: 2px solid transparent;

  &:hover {
    border-color: #ff9a9e;
  }
}

.scene-card-orange {
  border: 2px solid transparent;

  &:hover {
    border-color: #f5576c;
  }
}

.scene-card-green {
  border: 2px solid transparent;

  &:hover {
    border-color: #88d8b0;
  }
}

.scene-card-blue {
  border: 2px solid transparent;

  &:hover {
    border-color: #2a5298;
  }
}

.scene-card-purple {
  border: 2px solid transparent;

  &:hover {
    border-color: #8ec5fc;
  }
}
</style>
