<script setup lang="ts">
import { ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import Papa from 'papaparse'
import type { CsvRow, AnalysisResult } from './utils/analyzer'
import { analyzeMobileCoverage, analyzePcCoverage } from './utils/analyzer'
import UploadPanel from './components/UploadPanel.vue'
import ResultPanel from './components/ResultPanel.vue'
import tdesignLogo from './assets/tdesign-logo.svg'

const fileName = ref('')
const fileRows = ref(0)
const isAnalyzing = ref(false)
const mobileResult = ref<AnalysisResult | null>(null)
const pcResult = ref<AnalysisResult | null>(null)

function handleFile(file: File) {
  if (!file.name.endsWith('.csv')) {
    MessagePlugin.warning('请上传 CSV 格式的文件')
    return
  }
  fileName.value = file.name
  isAnalyzing.value = true
  mobileResult.value = null
  pcResult.value = null

  Papa.parse<CsvRow>(file, {
    header: true,
    skipEmptyLines: true,
    complete(results) {
      fileRows.value = results.data.length
      try {
        mobileResult.value = analyzeMobileCoverage(results.data as CsvRow[])
        pcResult.value = analyzePcCoverage(results.data as CsvRow[])
        MessagePlugin.success('分析完成')
      } catch (err: any) {
        MessagePlugin.error(`分析出错: ${err.message}`)
      }
      isAnalyzing.value = false
    },
    error(err) {
      MessagePlugin.error(`文件解析错误: ${err.message}`)
      isAnalyzing.value = false
    },
  })
}

function handleReset() {
  fileName.value = ''
  fileRows.value = 0
  mobileResult.value = null
  pcResult.value = null
}
</script>

<template>
  <div class="coverage-app">
    <!-- 顶部导航 -->
    <t-head-menu class="coverage-app__header">
      <template #logo>
        <div class="coverage-app__logo">
          <img
            class="coverage-app__logo-img"
            :src="tdesignLogo"
            alt="TDesign"
          />
          <span class="coverage-app__logo-text">TDesign 覆盖率分析</span>
        </div>
      </template>

    </t-head-menu>

    <!-- 主内容区 -->
    <main class="coverage-app__main">
      <div class="coverage-app__layout">
        <!-- 左侧：上传面板 -->
        <aside class="coverage-app__sidebar">
          <UploadPanel
            :file-name="fileName"
            :file-rows="fileRows"
            :is-analyzing="isAnalyzing"
            :has-result="!!mobileResult"
            @upload="handleFile"
            @reset="handleReset"
          />
        </aside>

        <!-- 右侧：分析结果 -->
        <section class="coverage-app__content" v-if="mobileResult && pcResult">
          <ResultPanel :mobile-result="mobileResult" :pc-result="pcResult" />
        </section>

        <!-- 右侧：空状态 -->
        <section class="coverage-app__content coverage-app__content--empty" v-else-if="!isAnalyzing">
          <div class="coverage-app__empty">
            <p class="coverage-app__empty-title">等待数据上传</p>
            <p class="coverage-app__empty-desc">上传 CSV 数据源后，将自动生成覆盖率分析报告</p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.coverage-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ====== Header ====== */
.coverage-app__header {
  border-bottom: 1px solid var(--td-component-border);
}

.coverage-app__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.coverage-app__logo-img {
  height: 28px;
}

.coverage-app__logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--td-text-color-primary);
  white-space: nowrap;
}

/* ====== Main ====== */
.coverage-app__main {
  flex: 1;
  padding: 24px;
}

.coverage-app__layout {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
  min-height: calc(100vh - 64px - 48px);
}

/* ====== Sidebar ====== */
.coverage-app__sidebar {
  position: sticky;
  top: 88px;
  align-self: start;
}

/* ====== Content ====== */
.coverage-app__content {
  min-width: 0;
}

.coverage-app__content--empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ====== Empty State ====== */
.coverage-app__empty {
  text-align: center;
  padding: 60px 40px;
}

.coverage-app__empty-img {
  width: 200px;
  height: auto;
  opacity: 0.15;
  margin-bottom: 24px;
  filter: grayscale(1);
}

.coverage-app__empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-secondary);
  margin-bottom: 8px;
}

.coverage-app__empty-desc {
  font-size: 14px;
  color: var(--td-text-color-placeholder);
  max-width: 300px;
  margin: 0 auto;
}

/* ====== 响应式 ====== */
@media (max-width: 900px) {
  .coverage-app__main {
    padding: 16px;
  }

  .coverage-app__layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .coverage-app__sidebar {
    position: static;
  }

  .coverage-app__content--empty {
    min-height: 260px;
  }
}

@media (max-width: 480px) {
  .coverage-app__main {
    padding: 12px;
  }

  .coverage-app__layout {
    gap: 12px;
  }

  .coverage-app__logo-text {
    font-size: 14px;
  }
}
</style>
