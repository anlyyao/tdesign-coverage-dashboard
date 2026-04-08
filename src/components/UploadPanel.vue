<script setup lang="ts">
import { ref } from 'vue'
import {
  CloudUploadIcon,
  FileIcon,
} from 'tdesign-icons-vue-next'

defineProps<{
  fileName: string
  fileRows: number
  isAnalyzing: boolean
  hasResult: boolean
}>()

const emit = defineEmits<{
  upload: [file: File]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) emit('upload', file)
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) emit('upload', file)
}

function triggerInput() {
  fileInput.value?.click()
}
</script>

<template>
  <t-card class="upload-panel" :bordered="true" header-bordered>
    <template #header>
      <div class="upload-panel__title">
        <CloudUploadIcon style="font-size: 18px" />
        <span>数据源</span>
      </div>
    </template>

    <!-- 拖拽上传区域 -->
    <div
      class="upload-panel__dropzone"
      :class="{
        'upload-panel__dropzone--active': isDragOver,
        'upload-panel__dropzone--done': hasResult,
      }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="triggerInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".csv"
        hidden
        @change="handleFileChange"
      />

      <!-- 加载状态 -->
      <template v-if="isAnalyzing">
        <t-loading size="small" />
        <p class="upload-panel__dropzone-title">正在分析数据...</p>
        <p class="upload-panel__dropzone-desc">请稍候，大文件可能需要数秒</p>
      </template>

      <!-- 已有文件 -->
      <template v-else-if="hasResult">
        <div class="upload-panel__file">
          <FileIcon class="upload-panel__file-icon" />
          <div class="upload-panel__file-info">
            <span class="upload-panel__file-name">{{ fileName }}</span>
            <span class="upload-panel__file-meta">{{ fileRows.toLocaleString() }} 条记录</span>
          </div>
        </div>
        <p class="upload-panel__dropzone-desc">点击或拖拽新文件以重新分析</p>
      </template>

      <!-- 默认上传提示 -->
      <template v-else>
        <CloudUploadIcon class="upload-panel__dropzone-icon" />
        <p class="upload-panel__dropzone-title">点击上传或拖拽文件到此处</p>
      </template>
    </div>

    <!-- 使用说明 -->
    <t-divider />
    <div class="upload-panel__help">
      <h4 class="upload-panel__help-title">使用说明</h4>
      <div class="upload-panel__help-steps">
        <t-space direction="vertical" :size="4">
          <div class="upload-panel__help-step" v-for="(step, idx) in [
            '准备 CSV 格式的原始扫描数据文件',
            '点击上传区域或拖拽文件至此',
            '自动分析移动端 & 桌面端覆盖率',
            '右侧查看完整的覆盖率报告',
          ]" :key="idx">
            <t-tag size="small" shape="round" theme="primary" variant="light">{{ idx + 1 }}</t-tag>
            <span class="upload-panel__help-step-text">{{ step }}</span>
          </div>
        </t-space>
      </div>
    </div>
  </t-card>
</template>

<style scoped>
/* ====== Block: upload-panel ====== */
.upload-panel {
  border-radius: 12px;
}

.upload-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

/* ====== Dropzone ====== */
.upload-panel__dropzone {
  border: 2px dashed var(--td-component-border);
  border-radius: var(--td-radius-medium);
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  background: var(--td-bg-color-secondarycontainer);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.upload-panel__dropzone:hover,
.upload-panel__dropzone--active {
  border-color: var(--td-brand-color);
  background: var(--td-brand-color-light);
}

.upload-panel__dropzone--done {
  border-style: solid;
  border-color: var(--td-component-border);
  background: var(--td-bg-color-container);
}

.upload-panel__dropzone--done:hover {
  border-color: var(--td-brand-color);
  background: var(--td-brand-color-light);
}

.upload-panel__dropzone-icon {
  font-size: 40px;
  color: var(--td-text-color-placeholder);
  margin-bottom: 8px;
  transition: color 0.2s;
}

.upload-panel__dropzone:hover .upload-panel__dropzone-icon,
.upload-panel__dropzone--active .upload-panel__dropzone-icon {
  color: var(--td-brand-color);
}

.upload-panel__dropzone-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.upload-panel__dropzone-desc {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

/* ====== File badge ====== */
.upload-panel__file {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.upload-panel__file-icon {
  font-size: 28px;
  color: var(--td-brand-color);
}

.upload-panel__file-info {
  text-align: left;
}

.upload-panel__file-name {
  display: block;
  font-weight: 600;
  font-size: 14px;
  color: var(--td-text-color-primary);
}

.upload-panel__file-meta {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

/* ====== Help ====== */
.upload-panel__help {
  margin-top: 0;
}

.upload-panel__help-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--td-text-color-secondary);
  margin-bottom: 12px;
}

.upload-panel__help-step {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-panel__help-step-text {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}
</style>
