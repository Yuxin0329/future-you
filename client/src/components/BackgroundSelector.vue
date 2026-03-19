<template>
  <div class="background-selector">
    <h3 class="selector-title">背景设置</h3>

    <!-- 预设背景 -->
    <div class="section">
      <div class="section-label">预设背景</div>
      <div class="preset-grid">
        <div
          v-for="preset in presets"
          :key="preset.id"
          class="preset-item"
          :class="{ active: selectedPreset === preset.id }"
          :style="getPresetStyle(preset)"
          @click="selectPreset(preset.id)"
        >
          <div class="preset-name">{{ preset.name }}</div>
          <el-icon v-if="selectedPreset === preset.id" class="check-icon">
            <Check />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 自定义背景 -->
    <div class="section">
      <div class="section-label">自定义背景</div>
      <div v-if="customBackground" class="custom-preview">
        <div class="custom-image-wrapper">
          <img :src="customBackground" alt="自定义背景" />
          <el-button
            circle
            size="small"
            class="delete-btn"
            type="danger"
            @click="removeCustomBackground"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
      <el-upload
        ref="uploadRef"
        class="upload-area"
        :action="uploadUrl"
        :headers="uploadHeaders"
        :show-file-list="false"
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        accept="image/*"
      >
        <div class="upload-content">
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">点击上传图片</div>
          <div class="upload-hint">支持 JPG、PNG 格式，最大 5MB</div>
        </div>
      </el-upload>
    </div>

    <!-- 透明度调整 -->
    <div class="section">
      <div class="section-label">
        背景透明度
        <span class="opacity-value">{{ Math.round(opacity * 100) }}%</span>
      </div>
      <el-slider
        v-model="opacity"
        :min="0.3"
        :max="0.7"
        :step="0.05"
        :show-tooltip="false"
        @change="handleOpacityChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Delete, UploadFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getUserToken } from '@/utils/auth'

const userStore = useUserStore()
const emit = defineEmits(['change'])

const uploadRef = ref(null)
const selectedPreset = ref('default')
const customBackground = ref('')
const opacity = ref(0.5)

const uploadUrl = computed(() => {
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/user/background`
})

const uploadHeaders = computed(() => {
  return {
    'Authorization': `Bearer ${getUserToken()}`
  }
})

// 预设背景配置
const presets = [
  {
    id: 'default',
    name: '默认',
    background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f5 100%)',
    color: '#fafafa'
  },
  {
    id: 'pink',
    name: '浪漫粉色',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)',
    color: '#ff9a9e'
  },
  {
    id: 'sunset',
    name: '温暖夕阳',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ffd89b 100%)',
    color: '#f5576c'
  },
  {
    id: 'green',
    name: '清新自然',
    background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 50%, #88d8b0 100%)',
    color: '#88d8b0'
  },
  {
    id: 'starry',
    name: '宁静星空',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #2e1437 100%)',
    color: '#2a5298'
  },
  {
    id: 'lavender',
    name: '薰衣草',
    background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 50%, #dcd6f7 100%)',
    color: '#8ec5fc'
  }
]

// 获取预设背景样式
const getPresetStyle = (preset) => {
  return {
    background: preset.background
  }
}

// 选择预设背景
const selectPreset = (presetId) => {
  selectedPreset.value = presetId
  customBackground.value = ''
  saveBackground()
}

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！')
    return false
  }
  return true
}

// 上传成功
const handleUploadSuccess = (response) => {
  if (response.success) {
    customBackground.value = response.url
    selectedPreset.value = 'custom'
    ElMessage.success('背景上传成功')
    saveBackground()
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 上传失败
const handleUploadError = () => {
  ElMessage.error('上传失败，请稍后重试')
}

// 删除自定义背景
const removeCustomBackground = () => {
  customBackground.value = ''
  selectedPreset.value = 'default'
  saveBackground()
}

// 处理透明度变化
const handleOpacityChange = () => {
  saveBackground()
}

// 保存背景设置到 localStorage
const saveBackground = () => {
  const settings = {
    preset: selectedPreset.value,
    customBackground: customBackground.value,
    opacity: opacity.value
  }
  localStorage.setItem('backgroundSettings', JSON.stringify(settings))
  applyBackground()
}

// 应用背景
const applyBackground = () => {
  let background = presets[0].background
  let textColor = '#2c3e50'

  if (customBackground.value) {
    background = `url(${customBackground.value})`
    textColor = '#2c3e50'
  } else if (selectedPreset.value !== 'default') {
    const preset = presets.find(p => p.id === selectedPreset.value)
    if (preset) {
      background = preset.background
      textColor = preset.color === '#2a5298' ? '#ffffff' : '#2c3e50'
    }
  }

  // 创建背景层
  let bgLayer = document.getElementById('custom-background-layer')
  if (!bgLayer) {
    bgLayer = document.createElement('div')
    bgLayer.id = 'custom-background-layer'
    bgLayer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: -1;
      pointer-events: none;
    `
    document.body.prepend(bgLayer)
  }

  bgLayer.style.background = background
  bgLayer.style.backgroundSize = 'cover'
  bgLayer.style.backgroundPosition = 'center'
  bgLayer.style.opacity = opacity.value

  // 通知父组件
  emit('change', { background, opacity: opacity.value })
}

// 初始化
onMounted(() => {
  // 从 localStorage 读取保存的设置
  const saved = localStorage.getItem('backgroundSettings')
  if (saved) {
    try {
      const settings = JSON.parse(saved)
      selectedPreset.value = settings.preset || 'default'
      customBackground.value = settings.customBackground || ''
      opacity.value = settings.opacity || 0.5
    } catch (e) {
      console.error('解析背景设置失败:', e)
    }
  }
  applyBackground()
})
</script>

<style lang="scss" scoped>
.background-selector {
  .selector-title {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 24px;
  }

  .section {
    margin-bottom: 32px;

    .section-label {
      font-size: 14px;
      font-weight: 500;
      color: #7f8c8d;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .opacity-value {
        font-weight: 600;
        color: #a18cd1;
      }
    }
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    .preset-item {
      aspect-ratio: 1;
      border-radius: 12px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      border: 3px solid transparent;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      &.active {
        border-color: #a18cd1;
        box-shadow: 0 4px 12px rgba(161, 140, 209, 0.3);
      }

      .preset-name {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.9);
        padding: 8px;
        font-size: 12px;
        font-weight: 500;
        color: #2c3e50;
        text-align: center;
      }

      .check-icon {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        background: #a18cd1;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }
    }
  }

  .custom-preview {
    .custom-image-wrapper {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      aspect-ratio: 16 / 9;
      background: #f0f0f0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .delete-btn {
        position: absolute;
        top: 8px;
        right: 8px;
      }
    }
  }

  .upload-area {
    width: 100%;

    :deep(.el-upload) {
      width: 100%;
    }

    .upload-content {
      border: 2px dashed #dcdfe6;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
      background: #fafafa;

      &:hover {
        border-color: #a18cd1;
        background: rgba(161, 140, 209, 0.05);
      }

      .upload-icon {
        font-size: 48px;
        color: #a18cd1;
        margin-bottom: 12px;
      }

      .upload-text {
        font-size: 16px;
        font-weight: 500;
        color: #2c3e50;
        margin-bottom: 4px;
      }

      .upload-hint {
        font-size: 12px;
        color: #95a5a6;
      }
    }
  }

  :deep(.el-slider) {
    .el-slider__runway {
      background-color: #e0e0e0;
    }

    .el-slider__bar {
      background: linear-gradient(135deg, #ff9a9e 0%, #a18cd1 100%);
    }

    .el-slider__button {
      border-color: #a18cd1;
    }

    .el-slider__button:hover {
      border-color: #ff9a9e;
    }
  }
}

@media (max-width: 768px) {
  .preset-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
</style>
