<template>
  <div class="paper-selector">
    <div class="selector-label">
      <el-icon><Reading /></el-icon>
      <span>选择信纸</span>
    </div>
    <div class="paper-list">
      <div
        v-for="paper in papers"
        :key="paper.id"
        class="paper-item"
        :class="{ active: modelValue === paper.id }"
        @click="$emit('update:modelValue', paper.id)"
      >
        <div class="paper-preview" :class="paper.class">
          <span class="paper-icon">{{ paper.icon }}</span>
        </div>
        <span class="paper-name">{{ paper.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Reading } from '@element-plus/icons-vue'

defineProps({
  modelValue: {
    type: String,
    default: 'default'
  }
})

defineEmits(['update:modelValue'])

const papers = [
  { id: 'default', name: '纯白', class: 'paper-default', icon: '📄' },
  { id: 'pink', name: '浪漫粉色', class: 'paper-pink', icon: '💕' },
  { id: 'beige', name: '温暖米色', class: 'paper-beige', icon: '🌅' },
  { id: 'green', name: '清新绿色', class: 'paper-green', icon: '🌿' },
  { id: 'blue', name: '宁静蓝色', class: 'paper-blue', icon: '☁️' },
  { id: 'purple', name: '柔和紫色', class: 'paper-purple', icon: '💜' }
]
</script>

<style lang="scss" scoped>
.paper-selector {
  margin-bottom: 24px;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  font-size: 15px;
}

.paper-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.paper-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  &.active {
    .paper-preview {
      border: 3px solid #a18cd1;
      transform: scale(1.05);
    }
  }
}

.paper-preview {
  width: 100%;
  height: 100px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &.paper-default {
    background: #ffffff;
    border: 1px solid #e0e0e0;
  }

  &.paper-pink {
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  }

  &.paper-beige {
    background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  }

  &.paper-green {
    background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  }

  &.paper-blue {
    background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  }

  &.paper-purple {
    background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  }

  .paper-icon {
    font-size: 32px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
}

.paper-name {
  display: block;
  text-align: center;
  margin-top: 8px;
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

@media (max-width: 768px) {
  .paper-list {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .paper-preview {
    height: 80px;
  }

  .paper-name {
    font-size: 12px;
  }
}
</style>
