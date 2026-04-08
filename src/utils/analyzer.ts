import {
  TDESIGN_MOBILE_GROUP,
  TDESIGN_MOBILE_PROJECTS,
  MOBILE_PROJECT_PREFIXES,
  TDESIGN_PC_PROJECTS,

} from './const'

// ==================== 类型定义 ====================

export interface CsvRow {
  [key: string]: string
}

export interface SubResult {
  project: string
  repos: number
  total: number
  rate: number
}

export interface AnalysisResult {
  type: string
  totalRepos: number
  tdesignRepos: number
  tdesignRate: number
  subResults: SubResult[]
  uniappRepos?: number
  taroRepos?: number
}

// ==================== Utils ====================

function isMobileProject(projectName: string | undefined): boolean {
  if (!projectName) return false
  return MOBILE_PROJECT_PREFIXES.some((prefix) => projectName.startsWith(prefix))
}

function isMobileGroup(componentName: string | undefined): boolean {
  if (!componentName) return false
  return TDESIGN_MOBILE_GROUP.includes(componentName)
}

// ==================== Mobile Analysis ====================

export function analyzeMobileCoverage(rows: CsvRow[]): AnalysisResult {
  const mobileRows = rows.filter(
    (row) => isMobileGroup(row['组件名称']) || isMobileProject(row['project名称']),
  )

  const seenUrls = new Set<string>()
  for (const row of mobileRows) {
    const url = row['工蜂地址']
    if (url) seenUrls.add(url)
  }

  const mobileRepoUrls = seenUrls
  const totalMobile = mobileRepoUrls.size

  const allRecordsForMobile = rows.filter((row) => mobileRepoUrls.has(row['工蜂地址']))

  const uniappUrls = new Set<string>()
  const taroUrls = new Set<string>()
  for (const row of rows) {
    if (row['组件名称'] === 'Uni-app' && row['工蜂地址']) {
      uniappUrls.add(row['工蜂地址'])
    }
    if (row['组件名称'] === 'Taro' && row['工蜂地址']) {
      taroUrls.add(row['工蜂地址'])
    }
  }

  const subResults: SubResult[] = []
  const tdesignMobileAllUrls = new Set<string>()

  for (const proj of TDESIGN_MOBILE_PROJECTS) {
    const urls = new Set<string>()
    for (const row of allRecordsForMobile) {
      if (row['project名称'] === proj && row['工蜂地址']) {
        urls.add(row['工蜂地址'])
      }
    }
    const repos = urls.size
    const rate = totalMobile > 0 ? (repos / totalMobile) * 100 : 0
    subResults.push({ project: proj, repos, total: totalMobile, rate })
    for (const u of urls) tdesignMobileAllUrls.add(u)
  }

  const tdesignRepos = tdesignMobileAllUrls.size
  const tdesignRate = totalMobile > 0 ? (tdesignRepos / totalMobile) * 100 : 0

  subResults.sort((a, b) => b.repos - a.repos)

  return {
    type: 'mobile',
    totalRepos: totalMobile,
    tdesignRepos,
    tdesignRate,
    subResults,
    uniappRepos: uniappUrls.size,
    taroRepos: taroUrls.size,
  }
}

// ==================== Web Analysis ====================

export function analyzePcCoverage(rows: CsvRow[]): AnalysisResult {
  const pcRows = rows.filter(
    (row) => !isMobileGroup(row['组件名称']) && !isMobileProject(row['project名称']),
  )

  const seenUrls = new Set<string>()
  for (const row of pcRows) {
    const url = row['工蜂地址']
    if (url) seenUrls.add(url)
  }

  const pcRepoUrls = seenUrls
  const totalPc = pcRepoUrls.size

  const allRecordsForPc = rows.filter((row) => pcRepoUrls.has(row['工蜂地址']))

  const subResults: SubResult[] = []
  const tdesignPcAllUrls = new Set<string>()

  for (const proj of TDESIGN_PC_PROJECTS) {
    const urls = new Set<string>()
    for (const row of allRecordsForPc) {
      if (row['project名称'] === proj && row['工蜂地址']) {
        urls.add(row['工蜂地址'])
      }
    }
    const repos = urls.size
    const rate = totalPc > 0 ? (repos / totalPc) * 100 : 0
    subResults.push({ project: proj, repos, total: totalPc, rate })
    for (const u of urls) tdesignPcAllUrls.add(u)
  }

  const tdesignRepos = tdesignPcAllUrls.size
  const tdesignRate = totalPc > 0 ? (tdesignRepos / totalPc) * 100 : 0

  subResults.sort((a, b) => b.repos - a.repos)

  return { type: '桌面端', totalRepos: totalPc, tdesignRepos, tdesignRate, subResults }
}
