<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  MobileIcon,
  DesktopIcon,
} from 'tdesign-icons-vue-next'
import type { AnalysisResult } from '../utils/analyzer'

const props = defineProps<{
  mobileResult: AnalysisResult
  pcResult: AnalysisResult
}>()

const activeTab = ref<'mobile' | 'pc'>('mobile')

const currentResult = computed(() =>
  activeTab.value === 'mobile' ? props.mobileResult : props.pcResult,
)

const hasDataItems = computed(() =>
  currentResult.value.subResults.filter((r) => r.repos > 0),
)

const noDataItems = computed(() =>
  currentResult.value.subResults.filter((r) => r.repos === 0),
)

function formatRate(rate: number): string {
  return rate.toFixed(2)
}

type RateTheme = 'success' | 'warning' | 'danger' | 'default'

function getRateTheme(rate: number): RateTheme {
  if (rate >= 30) return 'success'
  if (rate >= 15) return 'warning'
  if (rate > 0) return 'danger'
  return 'default'
}

function getRateColor(rate: number): string {
  if (rate >= 30) return 'var(--td-success-color)'
  if (rate >= 15) return 'var(--td-warning-color)'
  if (rate > 0) return 'var(--td-error-color)'
  return 'var(--td-text-color-placeholder)'
}

const tableColumns = computed(() => [
  { colKey: 'index', title: '#', width: 50, align: 'center' as const },
  { colKey: 'project', title: '技术栈', ellipsis: true },
  { colKey: 'repos', title: '分子', width: 80, align: 'right' as const },
  { colKey: 'total', title: '分母', width: 80, align: 'right' as const },
  { colKey: 'rate', title: '覆盖率', width: 100, align: 'right' as const },
])

const tableData = computed(() =>
  hasDataItems.value.map((item, idx) => ({
    index: idx + 1,
    ...item,
  })),
)
</script>

<template>
  <div class="result-panel">
    <!-- 概览卡片 -->
    <div class="result-panel__overview">
      <t-card
        class="result-panel__overview-card"
        :class="{ 'result-panel__overview-card--active': activeTab === 'mobile' }"
        hover-shadow
        @click="activeTab = 'mobile'"
      >
        <div class="result-panel__overview-header">
          <MobileIcon class="result-panel__overview-icon result-panel__overview-icon--mobile" />
          <span class="result-panel__overview-label">移动端覆盖率</span>
        </div>
        <div class="result-panel__overview-rate">
          {{ formatRate(mobileResult.tdesignRate) }}<small>%</small>
        </div>
        <div class="result-panel__overview-detail">
          <span class="result-panel__overview-numerator">{{ mobileResult.tdesignRepos }}</span>
          <span class="result-panel__overview-sep">/</span>
          <span class="result-panel__overview-denominator">{{ mobileResult.totalRepos }}</span>
          <span class="result-panel__overview-unit">仓库</span>
        </div>
        <t-progress
          :percentage="Math.min(mobileResult.tdesignRate, 100)"
          theme="line"
          :color="{ from: '#3b82f6', to: '#0052d9' }"
          :trackColor="'var(--td-bg-color-secondarycontainer)'"
          :label="false"
          :stroke-width="6"
          class="result-panel__overview-progress"
        />
      </t-card>

      <t-card
        class="result-panel__overview-card"
        :class="{ 'result-panel__overview-card--active': activeTab === 'pc' }"
        hover-shadow
        @click="activeTab = 'pc'"
      >
        <div class="result-panel__overview-header">
          <DesktopIcon class="result-panel__overview-icon result-panel__overview-icon--pc" />
          <span class="result-panel__overview-label">桌面端覆盖率</span>
        </div>
        <div class="result-panel__overview-rate">
          {{ formatRate(pcResult.tdesignRate) }}<small>%</small>
        </div>
        <div class="result-panel__overview-detail">
          <span class="result-panel__overview-numerator">{{ pcResult.tdesignRepos }}</span>
          <span class="result-panel__overview-sep">/</span>
          <span class="result-panel__overview-denominator">{{ pcResult.totalRepos }}</span>
          <span class="result-panel__overview-unit">仓库</span>
        </div>
        <t-progress
          :percentage="Math.min(pcResult.tdesignRate, 100)"
          theme="line"
          :color="{ from: '#22c55e', to: '#00a870' }"
          :trackColor="'var(--td-bg-color-secondarycontainer)'"
          :label="false"
          :stroke-width="6"
          class="result-panel__overview-progress"
        />
      </t-card>
    </div>

    <!-- 汇总行 -->
    <t-card class="result-panel__summary" :bordered="true">
      <div class="result-panel__summary-inner">
        <span class="result-panel__summary-label">{{ currentResult.type }}总体覆盖率 (TDesign)</span>
        <div class="result-panel__summary-values">
          <span class="result-panel__summary-numerator">{{ currentResult.tdesignRepos }}</span>
          <span class="result-panel__summary-sep">/</span>
          <span class="result-panel__summary-denominator">{{ currentResult.totalRepos }}</span>
          <t-tag
            class="result-panel__summary-rate"
            :theme="getRateTheme(currentResult.tdesignRate)"
            variant="light"
            size="medium"
          >
            {{ formatRate(currentResult.tdesignRate) }}%
          </t-tag>
        </div>
      </div>
    </t-card>

    <!-- 移动端技术栈统计 -->
    <t-card v-if="activeTab === 'mobile'" class="result-panel__tech-stack" :bordered="true">
      <template #header>
        <span class="result-panel__tech-stack-title">移动端技术栈项目数量</span>
      </template>
      <div class="result-panel__tech-stack-items">
        <div class="result-panel__tech-stack-item">
          <span class="result-panel__tech-stack-label">Uni-app</span>
          <span class="result-panel__tech-stack-count">{{ mobileResult.uniappRepos ?? 0 }} 个项目</span>
        </div>
        <div class="result-panel__tech-stack-item">
          <span class="result-panel__tech-stack-label">Taro</span>
          <span class="result-panel__tech-stack-count">{{ mobileResult.taroRepos ?? 0 }} 个项目</span>
        </div>
      </div>
    </t-card>

    <!-- 数据表格 -->
    <t-card v-if="hasDataItems.length" class="result-panel__table-card" :bordered="true">
      <t-table
        :data="tableData"
        :columns="tableColumns"
        :hover="true"
        :stripe="true"
        row-key="project"
        size="small"
        class="result-panel__table"
      >
        <template #rate="{ row }">
          <t-tag
            :theme="getRateTheme(row.rate)"
            variant="light"
            size="small"
          >
            {{ formatRate(row.rate) }}%
          </t-tag>
        </template>

      </t-table>
    </t-card>

    <!-- 无数据子项 -->
    <t-card v-if="noDataItems.length" class="result-panel__nodata" :bordered="true">
      <template #header>
        <span class="result-panel__nodata-title">
          以下 <strong>{{ noDataItems.length }}</strong> 个子项暂无匹配记录
        </span>
      </template>
      <div class="result-panel__nodata-tags">
        <t-tag
          v-for="item in noDataItems"
          :key="item.project"
          size="small"
          variant="outline"
          theme="default"
          class="result-panel__nodata-tag"
        >
          {{ item.project }}
        </t-tag>
      </div>
    </t-card>
  </div>
</template>

<style scoped>
/* ====== Block: result-panel ====== */
.result-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ====== Overview cards ====== */
.result-panel__overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.result-panel__overview-card {
  cursor: pointer;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: border-color 0.25s ease;
}

.result-panel__overview-card--active {
  border-color: var(--td-brand-color);
}

.result-panel__overview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.result-panel__overview-icon {
  font-size: 22px;
}

.result-panel__overview-icon--mobile {
  color: var(--td-brand-color);
}

.result-panel__overview-icon--pc {
  color: var(--td-success-color);
}

.result-panel__overview-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-secondary);
}

.result-panel__overview-rate {
  font-size: 40px;
  font-weight: 800;
  color: var(--td-text-color-primary);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.result-panel__overview-rate small {
  font-size: 20px;
  font-weight: 600;
}

.result-panel__overview-detail {
  margin-top: 6px;
  font-size: 13px;
  color: var(--td-text-color-placeholder);
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.result-panel__overview-numerator {
  font-weight: 700;
  color: var(--td-brand-color);
  font-size: 16px;
}

.result-panel__overview-sep {
  color: var(--td-text-color-placeholder);
}

.result-panel__overview-denominator {
  font-weight: 600;
  font-size: 14px;
}

.result-panel__overview-unit {
  margin-left: 4px;
}

.result-panel__overview-progress {
  margin-top: 14px;
}

/* ====== Tabs ====== */
.result-panel__tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ====== Summary ====== */
.result-panel__summary {
  border-radius: 12px;
}

.result-panel__summary-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.result-panel__summary-label {
  font-weight: 700;
  font-size: 15px;
  color: var(--td-text-color-primary);
}

.result-panel__summary-values {
  display: flex;
  align-items: center;
  gap: 4px;
}

.result-panel__summary-numerator {
  font-weight: 700;
  font-size: 18px;
  color: var(--td-brand-color);
}

.result-panel__summary-sep {
  color: var(--td-text-color-placeholder);
}

.result-panel__summary-denominator {
  font-weight: 600;
  font-size: 15px;
  color: var(--td-text-color-secondary);
}

.result-panel__summary-rate {
  margin-left: 8px;
  font-weight: 700;
}

/* ====== Table ====== */
.result-panel__table-card {
  border-radius: 12px;
  overflow: hidden;
}

.result-panel__table-code {
  font-family: 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace;
  font-size: 12px;
  color: var(--td-text-color-primary);
  background: var(--td-bg-color-secondarycontainer);
  padding: 2px 6px;
  border-radius: 4px;
}

/* ====== No data ====== */
.result-panel__nodata {
  border-radius: 12px;
}

.result-panel__nodata-title {
  font-size: 13px;
  color: var(--td-text-color-placeholder);
}

.result-panel__nodata-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.result-panel__nodata-tag {
  font-family: 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace;
  font-size: 11px;
}

/* ====== Tech Stack ====== */
.result-panel__tech-stack {
  border-radius: 12px;
}

.result-panel__tech-stack-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--td-text-color-primary);
}

.result-panel__tech-stack-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.result-panel__tech-stack-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: var(--td-bg-color-secondarycontainer);
  border-radius: 8px;
  gap: 8px;
}

.result-panel__tech-stack-label {
  font-size: 13px;
  color: var(--td-text-color-placeholder);
  font-weight: 500;
}

.result-panel__tech-stack-count {
  font-size: 18px;
  font-weight: 700;
  color: var(--td-brand-color);
}

/* ====== 响应式 ====== */
@media (max-width: 900px) {
  .result-panel__overview {
    grid-template-columns: 1fr;
  }

  .result-panel__overview-rate {
    font-size: 32px;
  }

  .result-panel__tech-stack-items {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .result-panel__summary-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-panel__tech-stack-items {
    grid-template-columns: 1fr;
  }
}
</style>
