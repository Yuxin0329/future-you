<template>
  <div class="audio-recorder">
    <div class="recorder-header">
      <div class="recorder-label">
        <el-icon><Microphone /></el-icon>
        <span>语音留言</span>
      </div>
    </div>

    <!-- 录音控制 -->
    <div class="recorder-controls">
      <el-button
        v-if="!isRecording && !currentAudio"
        type="primary"
        :icon="Microphone"
        circle
        size="large"
        @click="startRecording"
        class="record-btn"
      />

      <el-button
        v-if="isRecording"
        type="danger"
        :icon="VideoPause"
        circle
        size="large"
        @click="stopRecording"
        class="record-btn pulse"
      />

      <span v-if="isRecording" class="recording-time">{{ formatTime(recordingTime) }}</span>
    </div>

    <!-- 音频列表 -->
    <div v-if="audioList.length > 0" class="audio-list">
      <div
        v-for="(audio, index) in audioList"
        :key="index"
        class="audio-item"
      >
        <div class="audio-info">
          <el-icon class="audio-icon"><Headset /></el-icon>
          <span class="audio-duration">{{ formatTime(audio.duration) }}</span>
        </div>
        <div class="audio-actions">
          <el-button
            type="primary"
            size="small"
            :icon="VideoPlay"
            circle
            @click="playAudio(audio)"
          />
          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            circle
            @click="deleteAudio(index)"
          />
        </div>
      </div>
    </div>

    <!-- 隐藏的音频播放器 -->
    <audio ref="audioPlayer" :src="currentAudioUrl" @ended="onAudioEnded"></audio>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Microphone,
  VideoPause,
  VideoPlay,
  Delete,
  Headset
} from '@element-plus/icons-vue'

const emit = defineEmits(['update:audio'])

const audioPlayer = ref(null)
const isRecording = ref(false)
const recordingTime = ref(0)
const mediaRecorder = ref(null)
const audioChunks = ref([])
const audioList = ref([])
const currentAudioUrl = ref(null)

let timer = null

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 开始录音
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    mediaRecorder.value = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    })

    audioChunks.value = []

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
      const audioUrl = URL.createObjectURL(audioBlob)

      const duration = recordingTime.value

      const audio = {
        blob: audioBlob,
        url: audioUrl,
        duration,
        base64: null
      }

      // 转换为 base64
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      reader.onloadend = () => {
        audio.base64 = reader.result
        audioList.value.push(audio)
        emit('update:audio', audio.base64)
        ElMessage.success('录音完成')
      }

      // 停止所有音频轨道
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.value.start()

    isRecording.value = true
    recordingTime.value = 0

    // 开始计时
    timer = setInterval(() => {
      recordingTime.value += 1
    }, 1000)

    ElMessage.info('开始录音...')
  } catch (error) {
    console.error('录音失败:', error)
    ElMessage.error('无法访问麦克风，请检查权限设置')
  }
}

// 停止录音
const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false

    // 停止计时
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }
}

// 播放音频
const playAudio = (audio) => {
  if (audioPlayer.value) {
    currentAudioUrl.value = audio.url
    audioPlayer.value.play()
  }
}

// 音频播放结束
const onAudioEnded = () => {
  currentAudioUrl.value = null
}

// 删除音频
const deleteAudio = (index) => {
  audioList.value.splice(index, 1)

  if (audioList.value.length > 0) {
    const lastAudio = audioList.value[audioList.value.length - 1]
    emit('update:audio', lastAudio.base64)
  } else {
    emit('update:audio', null)
  }

  ElMessage.success('已删除录音')
}

// 暴露给父组件的方法
defineExpose({
  clearAll: () => {
    audioList.value = []
    emit('update:audio', null)
  }
})
</script>

<style lang="scss" scoped>
.audio-recorder {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
}

.recorder-header {
  margin-bottom: 16px;
}

.recorder-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 15px;
}

.recorder-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.record-btn {
  width: 60px;
  height: 60px;
  font-size: 24px;

  &.pulse {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.7);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 0 10px rgba(245, 108, 108, 0);
    }
  }
}

.recording-time {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
  font-family: 'Courier New', monospace;
}

.audio-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audio-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.audio-icon {
  color: #a18cd1;
  font-size: 20px;
}

.audio-duration {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.audio-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .audio-recorder {
    padding: 16px;
  }

  .record-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}
</style>
