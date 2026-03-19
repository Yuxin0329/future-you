<template>
  <div class="rich-text-editor" :class="paperClass">
    <div class="toolbar" v-if="showToolbar">
      <div class="toolbar-group">
        <el-button
          size="small"
          :type="formats.bold ? 'primary' : ''"
          @click="formatText('bold')"
        >
          <strong>B</strong>
        </el-button>
        <el-button
          size="small"
          :type="formats.italic ? 'primary' : ''"
          @click="formatText('italic')"
        >
          <em>I</em>
        </el-button>
        <el-button
          size="small"
          :type="formats.underline ? 'primary' : ''"
          @click="formatText('underline')"
        >
          <u>U</u>
        </el-button>
      </div>

      <div class="toolbar-group">
        <el-select
          v-model="fontSize"
          size="small"
          style="width: 100px"
          @change="changeFontSize"
        >
          <el-option label="12px" value="12px" />
          <el-option label="14px" value="14px" />
          <el-option label="16px" value="16px" />
          <el-option label="18px" value="18px" />
          <el-option label="20px" value="20px" />
        </el-select>
      </div>

      <div class="toolbar-group">
        <el-color-picker
          v-model="textColor"
          size="small"
          @change="changeColor"
        />
      </div>

      <div class="toolbar-group">
        <el-button
          size="small"
          @click="formatText('justifyLeft')"
        >
          <el-icon><DArrowLeft /></el-icon>
        </el-button>
        <el-button
          size="small"
          @click="formatText('justifyCenter')"
        >
          =
        </el-button>
        <el-button
          size="small"
          @click="formatText('justifyRight')"
        >
          <el-icon><DArrowRight /></el-icon>
        </el-button>
      </div>

      <div class="toolbar-group">
        <el-button
          size="small"
          @click="formatText('undo')"
          :disabled="!canUndo"
        >
          ↩
        </el-button>
        <el-button
          size="small"
          @click="formatText('redo')"
          :disabled="!canRedo"
        >
          ↪
        </el-button>
      </div>
    </div>

    <div
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      :style="editorStyle"
    ></div>

    <div class="editor-footer">
      <span class="char-count">{{ charCount }} / 5000</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  Document,
  DArrowLeft,
  DArrowRight
} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  paperType: {
    type: String,
    default: 'default'
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  minHeight: {
    type: String,
    default: '300px'
  }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
const fontSize = ref('16px')
const textColor = ref('#000000')
const canUndo = ref(false)
const canRedo = ref(false)

const formats = ref({
  bold: false,
  italic: false,
  underline: false
})

// 信纸样式类
const paperClass = computed(() => {
  return `paper-${props.paperType}`
})

// 编辑器样式
const editorStyle = computed(() => ({
  minHeight: props.minHeight,
  fontSize: fontSize.value,
  color: textColor.value
}))

// 字符计数
const charCount = computed(() => {
  return editorRef.value?.innerText?.length || 0
})

// 初始化编辑器内容
const initContent = () => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
  }
}

// 监听内容变化
watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && editorRef.value.innerHTML !== newVal) {
    editorRef.value.innerHTML = newVal || ''
  }
})

// 格式化文本
const formatText = (command) => {
  document.execCommand(command, false, null)
  updateFormats()
}

// 更新格式状态
const updateFormats = () => {
  formats.value = {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline')
  }

  canUndo.value = document.queryCommandEnabled('undo')
  canRedo.value = document.queryCommandEnabled('redo')
}

// 改变字体大小
const changeFontSize = () => {
  document.execCommand('fontSize', false, '7')
  const fontElements = editorRef.value.getElementsByTagName('font')
  for (let i = 0; i < fontElements.length; i++) {
    if (fontElements[i].size === '7') {
      fontElements[i].removeAttribute('size')
      fontElements[i].style.fontSize = fontSize.value
    }
  }
}

// 改变颜色
const changeColor = () => {
  document.execCommand('foreColor', false, textColor.value)
}

// 输入事件
const onInput = () => {
  updateFormats()
  emit('update:modelValue', editorRef.value?.innerHTML || '')
}

// 获得焦点
const onFocus = () => {
  updateFormats()
}

// 失去焦点
const onBlur = () => {
  updateFormats()
}

// 获取内容
const getContent = () => {
  return editorRef.value?.innerHTML || ''
}

// 设置内容
const setContent = (content) => {
  if (editorRef.value) {
    editorRef.value.innerHTML = content || ''
    emit('update:modelValue', editorRef.value.innerHTML)
  }
}

// 清空内容
const clearContent = () => {
  setContent('')
}

onMounted(() => {
  initContent()
})

defineExpose({
  getContent,
  setContent,
  clearContent
})
</script>

<style lang="scss" scoped>
.rich-text-editor {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;

  // 信纸样式
  &.paper-default {
    background: #ffffff;
    border: 2px solid #e0e0e0;
  }

  &.paper-pink {
    background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
    border: 2px solid #ffb3ba;
  }

  &.paper-beige {
    background: linear-gradient(135deg, #fef9f3 0%, #fef5e8 100%);
    border: 2px solid #f5d6ba;
  }

  &.paper-green {
    background: linear-gradient(135deg, #f0fff4 0%, #e8fff0 100%);
    border: 2px solid #90ee90;
  }

  &.paper-blue {
    background: linear-gradient(135deg, #f0f8ff 0%, #e8f4ff 100%);
    border: 2px solid #87ceeb;
  }

  &.paper-purple {
    background: linear-gradient(135deg, #faf0ff 0%, #f5e8ff 100%);
    border: 2px solid #dda0dd;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 8px;

    &::after {
      content: '';
      display: block;
      width: 1px;
      height: 24px;
      background: #e0e0e0;
      margin-left: 8px;
    }

    &:last-child::after {
      display: none;
    }
  }
}

.editor-content {
  padding: 24px;
  outline: none;
  line-height: 1.8;
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;

  &:empty:before {
    content: attr(placeholder);
    color: #999;
    pointer-events: none;
  }

  // 编辑器内的内容样式
  :deep(p) {
    margin: 0 0 12px 0;
  }

  :deep(b),
  :deep(strong) {
    font-weight: 700;
  }

  :deep(i),
  :deep(em) {
    font-style: italic;
  }

  :deep(u) {
    text-decoration: underline;
  }
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid rgba(0, 0, 0, 0.05);

  .char-count {
    font-size: 12px;
    color: #999;
  }
}

@media (max-width: 768px) {
  .toolbar {
    padding: 8px 12px;
    gap: 8px;

    .toolbar-group {
      gap: 4px;

      &::after {
        margin-left: 4px;
      }
    }
  }

  .editor-content {
    padding: 16px;
    min-height: 250px;
  }
}
</style>
