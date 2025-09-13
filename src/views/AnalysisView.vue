<template>
  <div class="analysis-view">
    <!-- 导出按钮 -->
    <div class="export-section" v-if="!exporting">
      <el-button 
        type="primary" 
        :icon="Download" 
        @click="exportToImage"
        :loading="exporting"
        class="export-btn"
      >
        导出为图片
      </el-button>
    </div>
    
    <!-- 导出时的标题 -->
    <div class="export-title" v-if="exporting">
      <h1 class="mobile-title">今日客户线索统计</h1>
      <p class="mobile-date">{{ currentDate }}</p>
    </div>
    
    <!-- 今日数据概览卡片 -->
    <div class="overview-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card class="data-card today-new" :class="{ 'loading': loading }">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><Plus /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">
                  <span v-if="!loading">{{ todayStats.newLeads || 0 }}</span>
                  <div v-else class="loading-spinner">
                    <el-icon class="is-loading"><Loading /></el-icon>
                  </div>
                </div>
                <div class="card-label">今日新增线索</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card class="data-card today-follow" :class="{ 'loading': loading }">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><Phone /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">
                  <span v-if="!loading">{{ todayStats.followed_leads || 0 }}</span>
                  <div v-else class="loading-spinner">
                    <el-icon class="is-loading"><Loading /></el-icon>
                  </div>
                </div>
                <div class="card-label">今日跟进线索</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card class="data-card today-records" :class="{ 'loading': loading }">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">
                  <span v-if="!loading">{{ todayStats.followup_records || 0 }}</span>
                  <div v-else class="loading-spinner">
                    <el-icon class="is-loading"><Loading /></el-icon>
                  </div>
                </div>
                <div class="card-label">今日跟进记录</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card class="data-card today-ended" :class="{ 'loading': loading }">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><Close /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">
                  <span v-if="!loading">{{ todayStats.ended_leads || 0 }}</span>
                  <div v-else class="loading-spinner">
                    <el-icon class="is-loading"><Loading /></el-icon>
                  </div>
                </div>
                <div class="card-label">今日终结线索</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 详细统计信息 -->
    <div class="detailed-stats">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-card class="stat-card" :class="{ 'loading': loading }">
            <template #header>
              <div class="card-header">
                <el-icon><User /></el-icon>
                <span>总线索数</span>
              </div>
            </template>
            <div class="stat-value">
              <span v-if="!loading">{{ overview.total_leads || 0 }}</span>
              <div v-else class="loading-spinner">
                <el-icon class="is-loading"><Loading /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-card class="stat-card" :class="{ 'loading': loading }">
            <template #header>
              <div class="card-header">
                <el-icon><Calendar /></el-icon>
                <span>本周新增</span>
              </div>
            </template>
            <div class="stat-value">
              <span v-if="!loading">{{ overview.recent_additions?.this_week || 0 }}</span>
              <div v-else class="loading-spinner">
                <el-icon class="is-loading"><Loading /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-card class="stat-card" :class="{ 'loading': loading }">
            <template #header>
              <div class="card-header">
                <el-icon><TrendCharts /></el-icon>
                <span>本月新增</span>
              </div>
            </template>
            <div class="stat-value">
              <span v-if="!loading">{{ overview.recent_additions?.this_month || 0 }}</span>
              <div v-else class="loading-spinner">
                <el-icon class="is-loading"><Loading /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-card class="stat-card" :class="{ 'loading': loading }">
            <template #header>
              <div class="card-header">
                <el-icon><Phone /></el-icon>
                <span>本周跟进线索</span>
              </div>
            </template>
            <div class="stat-value">
              <span v-if="!loading">{{ overview.followup?.this_week_lead_count || 0 }}</span>
              <div v-else class="loading-spinner">
                <el-icon class="is-loading"><Loading /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 来源平台分布 -->
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-card class="chart-card" :class="{ 'loading': loading }">
            <template #header>
              <div class="card-header">
                <span>来源平台分布</span>
              </div>
            </template>
            <div class="chart-container">
              <div v-if="!loading" ref="platformChart" class="chart"></div>
              <div v-else class="chart-skeleton">
                <el-skeleton :rows="8" animated />
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 意向等级分布 -->
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-card class="chart-card" :class="{ 'loading': loading }">
            <template #header>
              <div class="card-header">
                <span>意向等级分布</span>
              </div>
            </template>
            <div class="chart-container">
              <div v-if="!loading" ref="intentionChart" class="chart"></div>
              <div v-else class="chart-skeleton">
                <el-skeleton :rows="8" animated />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 趋势图表 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card class="chart-card" :class="{ 'loading': loading }">
            <template #header>
              <div class="card-header">
                <span>最近15天趋势</span>
              </div>
            </template>
            <div class="chart-container">
              <div v-if="!loading" ref="trendChart" class="chart"></div>
              <div v-else class="chart-skeleton">
                <el-skeleton :rows="6" animated />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 上周详细统计 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card class="chart-card" :class="{ 'loading': loading }">
            <template #header>
              <div class="card-header">
                <span>上周详细统计</span>
                <el-tag type="info" size="small">{{ lastWeekData.week_range?.start }} 至 {{ lastWeekData.week_range?.end }}</el-tag>
              </div>
            </template>
            
            <!-- 上周概览卡片 -->
            <div class="last-week-overview" v-if="!loading && lastWeekData.week_range">
              <el-row :gutter="20" style="margin-bottom: 20px;">
                <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                  <div class="overview-item">
                    <div class="overview-value">{{ lastWeekTotal }}</div>
                    <div class="overview-label">上周总线索</div>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                  <div class="overview-item">
                    <div class="overview-value">{{ lastWeekAverage }}</div>
                    <div class="overview-label">日均线索</div>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                  <div class="overview-item">
                    <div class="overview-value">{{ lastWeekMax.value }}</div>
                    <div class="overview-label-row">
                      <span class="overview-label">单日最高</span>
                      <span class="overview-date" v-if="lastWeekMax.date">{{ lastWeekMax.date }}</span>
                    </div>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                  <div class="overview-item">
                    <div class="overview-value">{{ lastWeekMin.value }}</div>
                    <div class="overview-label-row">
                      <span class="overview-label">单日最低</span>
                      <span class="overview-date" v-if="lastWeekMin.date">{{ lastWeekMin.date }}</span>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
            
            <!-- 上周每日趋势图 -->
            <div class="chart-container last-week-chart" style="margin-bottom: 25px;">
              <div class="chart-title">上周平台每日汇总</div>
              <div v-if="!loading" ref="lastWeekChart" class="chart"></div>
              <div v-else class="chart-skeleton">
                <el-skeleton :rows="6" animated />
              </div>
            </div>
            
            <!-- 账号汇总和对比区域 -->
            <div class="account-summary-section" v-if="!loading && lastWeekData.account_stats" style="margin-top: 25px;">
              <div class="section-title">
                <h3>上周各平台汇总和对比</h3>
                <p class="section-subtitle">每个平台上周的表现统计</p>
              </div>
              
              <!-- 平台汇总卡片 -->
              <div class="platform-summary-cards">
                <el-row :gutter="12" style="margin-bottom: 16px;">
                  <el-col 
                    v-for="(platformData, platform) in getSortedPlatformStats()" 
                    :key="platform"
                    :xs="24" 
                    :sm="12" 
                    :md="8" 
                    :lg="8" 
                    :xl="8"
                  >
                    <div class="platform-summary-card">
                      <div class="platform-header">
                        <div class="platform-name">{{ platform }}</div>
                        <div class="platform-total">{{ getPlatformTotal(platform) }}</div>
                      </div>
                      <div class="platform-stats">
                        <div class="stat-item">
                          <span class="stat-label">日均</span>
                          <span class="stat-value">{{ getPlatformAverage(platform) }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">最高</span>
                          <span class="stat-value">{{ getPlatformMax(platform) }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">最低</span>
                          <span class="stat-value">{{ getPlatformMin(platform) }}</span>
                        </div>
                      </div>
                      
                      <!-- 平台趋势图 -->
                      <div class="platform-trend">
                        <div class="trend-title">周趋势</div>
                        <div class="trend-chart" :ref="el => setPlatformTrendChartRef(el, platform)">
                          <!-- ECharts 将在这里渲染 -->
                        </div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              
              <!-- 账号详细对比 -->
              <div class="account-detail-cards">
                <el-collapse v-model="activeAccountCollapse" accordion>
                  <el-collapse-item 
                    v-for="(accounts, platform) in getSortedAccountStats()" 
                    :key="platform"
                    :name="platform"
                  >
                    <template #title>
                      <div class="collapse-title">
                        <span>{{ platform }} - 账号详情 ({{ Object.keys(accounts).length }}个账号)</span>
                        <el-tag type="info" size="small" style="margin-left: 8px;">{{ lastWeekData.week_range?.start }} 至 {{ lastWeekData.week_range?.end }}</el-tag>
                      </div>
                    </template>
                    <el-row :gutter="12">
                      <el-col 
                        v-for="(accountData, accountName) in accounts" 
                        :key="accountName"
                        :xs="24" 
                        :sm="12" 
                        :md="6" 
                        :lg="6" 
                        :xl="6"
                        style="margin-bottom: 12px;"
                      >
                        <div class="account-card">
                          <div class="account-header">
                            <div class="account-name">{{ accountName }}</div>
                            <div class="account-total">{{ getAccountTotal(accountData) }}</div>
                          </div>
                          
                          <div class="account-stats">
                            <div class="stat-row">
                              <span class="stat-label">日均</span>
                              <span class="stat-value">{{ getAccountAverage(accountData) }}</span>
                            </div>
                            <div class="stat-row">
                              <span class="stat-label">最高</span>
                              <span class="stat-value">{{ getAccountMax(accountData) }}</span>
                            </div>
                            <div class="stat-row">
                              <span class="stat-label">最低</span>
                              <span class="stat-value">{{ getAccountMin(accountData) }}</span>
                            </div>
                          </div>
                          
                          <!-- 迷你趋势图 -->
                          <div class="account-trend">
                            <div class="trend-title">周趋势</div>
                            <div class="trend-chart" :ref="el => setAccountTrendChartRef(el, platform, accountName)">
                              <!-- ECharts 将在这里渲染 -->
                            </div>
                          </div>
                          
                          <!-- 表现评级 -->
                          <div class="account-performance">
                            <div class="performance-badge" :class="getPerformanceClass(getAccountTotal(accountData))">
                              {{ getPerformanceText(getAccountTotal(accountData)) }}
                            </div>
                          </div>
                        </div>
                      </el-col>
                    </el-row>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 平台账号统计概览 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card class="chart-card" :class="{ 'loading': loading }">
            <template #header>
              <div class="card-header">
                <span>平台账号统计概览</span>
                <el-tag type="info" size="small">截止当前所有线索数据</el-tag>
              </div>
            </template>
            
            <!-- 总线索数概览 -->
            <div class="platform-overview-summary" v-if="!loading && platformAccountData.total_leads">
              <div class="summary-card">
                <div class="summary-icon">📊</div>
                <div class="summary-content">
                  <div class="summary-value">{{ platformAccountData.total_leads }}</div>
                  <div class="summary-label">总线索数量</div>
                </div>
              </div>
            </div>
            
            <!-- 平台统计卡片 -->
            <div class="platform-stats-cards" v-if="!loading && platformAccountData.platforms">
              <el-row :gutter="16" style="margin-bottom: 20px;">
                <el-col 
                  v-for="(platformData, platform) in platformAccountData.platforms" 
                  :key="platform"
                  :xs="24" 
                  :sm="12" 
                  :md="8" 
                  :lg="8" 
                  :xl="8"
                >
                  <div class="platform-stat-card">
                    <div class="platform-header">
                      <div class="platform-name">{{ platform }}</div>
                      <div class="platform-total">{{ platformData.total_leads }}</div>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
            
            <!-- 详细账号统计 -->
            <div class="account-detail-section" v-if="!loading && platformAccountData.platforms">
              <div class="section-title">
                <h3>各平台账号详细统计</h3>
                <p class="section-subtitle">每个账号的线索分布情况</p>
              </div>
              
              <!-- 抖音平台区域 -->
              <div class="platform-section douyin-section" v-if="getPlatformAccounts('抖音').length > 0">
                <div class="platform-section-header">
                  <h4>抖音平台</h4>
                  <span class="platform-total">{{ getPlatformTotalLeads('抖音') }} 条线索</span>
                </div>
                <el-row :gutter="12">
                  <el-col 
                    v-for="accountItem in getPlatformAccounts('抖音')" 
                    :key="accountItem.key"
                    :xs="24" 
                    :sm="12" 
                    :md="8" 
                    :lg="6" 
                    :xl="6"
                    style="margin-bottom: 12px;"
                  >
                    <div class="account-stat-item" :class="{ 'unknown-account': accountItem.isUnknown }">
                      <div class="account-name">{{ accountItem.accountName }}</div>
                      <div class="account-count">{{ accountItem.count }} 条线索</div>
                      <div v-if="accountItem.isUnknown" class="unknown-badge">未知账号</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              
              <!-- 视频号平台区域 -->
              <div class="platform-section video-section" v-if="getPlatformAccounts('视频号').length > 0">
                <div class="platform-section-header">
                  <h4>视频号平台</h4>
                  <span class="platform-total">{{ getPlatformTotalLeads('视频号') }} 条线索</span>
                </div>
                <el-row :gutter="12">
                  <el-col 
                    v-for="accountItem in getPlatformAccounts('视频号')" 
                    :key="accountItem.key"
                    :xs="24" 
                    :sm="12" 
                    :md="8" 
                    :lg="6" 
                    :xl="6"
                    style="margin-bottom: 12px;"
                  >
                    <div class="account-stat-item" :class="{ 'unknown-account': accountItem.isUnknown }">
                      <div class="account-name">{{ accountItem.accountName }}</div>
                      <div class="account-count">{{ accountItem.count }} 条线索</div>
                      <div v-if="accountItem.isUnknown" class="unknown-badge">未知账号</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              
              <!-- 未知平台区域 -->
              <div class="platform-section unknown-section" v-if="getPlatformAccounts('未知平台').length > 0">
                <div class="platform-section-header">
                  <h4>未知平台</h4>
                  <span class="platform-total">{{ getPlatformTotalLeads('未知平台') }} 条线索</span>
                </div>
                <el-row :gutter="12">
                  <el-col 
                    v-for="accountItem in getPlatformAccounts('未知平台')" 
                    :key="accountItem.key"
                    :xs="24" 
                    :sm="12" 
                    :md="8" 
                    :lg="6" 
                    :xl="6"
                    style="margin-bottom: 12px;"
                  >
                    <div class="account-stat-item" :class="{ 'unknown-account': accountItem.isUnknown }">
                      <div class="account-name">{{ accountItem.accountName }}</div>
                      <div class="account-count">{{ accountItem.count }} 条线索</div>
                      <div v-if="accountItem.isUnknown" class="unknown-badge">未知账号</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { getLeadsOverview, getLastWeekStats, getPlatformAccountSummary } from '@/api/statistics'
import { Plus, Phone, Document, Close, User, Calendar, TrendCharts, Loading, Download, Warning, InfoFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import html2canvas from 'html2canvas'
import { ElMessage } from 'element-plus'

// 响应式数据
const overview = ref({})
const todayStats = ref({})
const loading = ref(true)
const exporting = ref(false)

// 上周统计数据
const lastWeekData = ref({})
const activeCollapse = ref([])
const activeAccountCollapse = ref([]) // 新增：控制账号详情折叠面板

// 平台账号统计概览数据
const platformAccountData = ref({})

// 当前日期
const currentDate = ref('')

// 图表实例
let platformChartInstance = null
let intentionChartInstance = null
let trendChartInstance = null
let lastWeekChartInstance = null

// 小型趋势图实例管理
const platformTrendCharts = ref(new Map())
const accountTrendCharts = ref(new Map())

// DOM引用
const platformChart = ref(null)
const intentionChart = ref(null)
const trendChart = ref(null)
const lastWeekChart = ref(null)

// 获取统计数据
const fetchData = async () => {
  try {
    loading.value = true
    const response = await getLeadsOverview()
          // console.log('API响应:', response)
    
    if (response.success) {
      overview.value = response.data
      todayStats.value = response.data.today_stats || {}
      
      // 添加今日新增线索数据
      todayStats.value.newLeads = response.data.recent_additions?.today || 0
      
      // console.log('overview数据:', overview.value)
      // console.log('todayStats数据:', todayStats.value)
    }
    
    // 获取上周统计数据
    const lastWeekResponse = await getLastWeekStats()
    if (lastWeekResponse.success) {
      lastWeekData.value = lastWeekResponse.data
      
      // 测试数据格式
      if (lastWeekData.value.platform_stats) {
        Object.entries(lastWeekData.value.platform_stats).forEach(([platform, data]) => {
          const values = Object.values(data).map(v => Number(v) || 0)
          const max = Math.max(...values)
          // console.log(`平台 ${platform} 最大值: ${max}`)
        })
      }
    }
    
    // 获取平台账号统计概览
    const platformAccountResponse = await getPlatformAccountSummary()
    if (platformAccountResponse.success) {
      platformAccountData.value = platformAccountResponse.data
      // console.log('平台账号统计数据:', platformAccountData.value)
    }
    
    // 延迟初始化图表，确保DOM已渲染
    setTimeout(() => {
      initCharts()
    }, 100)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 上周统计计算属性
const lastWeekTotal = computed(() => {
  if (!lastWeekData.value.daily_totals) return 0
  return Object.values(lastWeekData.value.daily_totals).reduce((sum, val) => sum + val, 0)
})

const lastWeekAverage = computed(() => {
  if (!lastWeekData.value.daily_totals) return 0
  const total = lastWeekTotal.value
  return Math.round(total / 7 * 10) / 10
})

// 获取最高值和对应日期
const lastWeekMax = computed(() => {
  if (!lastWeekData.value.daily_totals) return { value: 0, date: '' }
  const entries = Object.entries(lastWeekData.value.daily_totals)
  const maxEntry = entries.reduce((max, [date, value]) => 
    value > max.value ? { value, date } : max, 
    { value: 0, date: '' }
  )
  return maxEntry
})

// 获取最低值和对应日期
const lastWeekMin = computed(() => {
  if (!lastWeekData.value.daily_totals) return { value: 0, date: '' }
  const entries = Object.entries(lastWeekData.value.daily_totals)
  const minEntry = entries.reduce((min, [date, value]) => 
    value < min.value || min.value === 0 ? { value, date } : min, 
    { value: 0, date: '' }
  )
  return minEntry
})

// 平台对比数据
const platformComparisonData = computed(() => {
  if (!lastWeekData.value.platform_stats) return []
  
  // 定义平台排序顺序
  const platformOrder = ['抖音', '视频号', '未知']
  
  return Object.entries(lastWeekData.value.platform_stats)
    .map(([platform, dailyData]) => {
      const values = Object.values(dailyData)
      const total = values.reduce((sum, val) => sum + val, 0)
      const max = Math.max(...values)
      const min = Math.min(...values)
      
      return {
        platform,
        total,
        average: Math.round(total / 7 * 10) / 10,
        max,
        min,
        dailyData
      }
    })
    .sort((a, b) => {
      const aIndex = platformOrder.indexOf(a.platform)
      const bIndex = platformOrder.indexOf(b.platform)
      // 如果平台在排序列表中，按列表顺序排序；否则按字母顺序
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      }
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return a.platform.localeCompare(b.platform)
    })
})

// 获取账号表格数据
const getAccountTableData = (accounts) => {
  return Object.entries(accounts).map(([account, dailyData]) => {
    const values = Object.values(dailyData)
    const total = values.reduce((sum, val) => sum + val, 0)
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    return {
      account,
      total,
      average: Math.round(total / 7 * 10) / 10,
      max,
      min,
      dailyData
    }
  })
}



// 获取排序后的账号统计数据
const getSortedAccountStats = () => {
  if (!lastWeekData.value.account_stats) return {}
  
  // 定义平台排序顺序
  const platformOrder = ['抖音', '视频号', '未知']
  
  const sortedStats = {}
  const platforms = Object.keys(lastWeekData.value.account_stats)
  
  // 按指定顺序排序平台
  platforms.sort((a, b) => {
    const aIndex = platformOrder.indexOf(a)
    const bIndex = platformOrder.indexOf(b)
    // 如果平台在排序列表中，按列表顺序排序；否则按字母顺序
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.localeCompare(b)
  })
  
  // 按排序后的顺序构建对象
  platforms.forEach(platform => {
    sortedStats[platform] = lastWeekData.value.account_stats[platform]
  })
  
  return sortedStats
}

// 初始化来源平台分布图表
const initPlatformChart = () => {
  if (!platformChart.value) {
    // console.log('platformChart DOM元素不存在')
    return
  }
  
  try {
    platformChartInstance = echarts.init(platformChart.value)
    
    const platformData = overview.value.platform_distribution || {}
    const data = Object.entries(platformData).map(([name, value]) => ({ name, value }))
    
    // console.log('平台数据:', platformData, data)
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: Object.keys(platformData)
      },
      series: [
        {
          name: '来源平台',
          type: 'pie',
          radius: '50%',
          data: data,
          label: {
            show: true,
            formatter: '{b}\n{c} ({d}%)',
            position: 'outside',
            fontSize: 12,
            fontWeight: 'bold'
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    
    platformChartInstance.setOption(option)
    // console.log('平台图表初始化成功')
  } catch (error) {
    console.error('平台图表初始化失败:', error)
  }
}

// 初始化意向等级分布图表
const initIntentionChart = () => {
  if (!intentionChart.value) {
    // console.log('intentionChart DOM元素不存在')
    return
  }
  
  try {
    intentionChartInstance = echarts.init(intentionChart.value)
    
    const intentionData = overview.value.intention_distribution || {}
    const data = Object.entries(intentionData).map(([name, value]) => ({ name, value }))
    
    // console.log('意向数据:', intentionData, data)
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: Object.keys(intentionData)
      },
      series: [
        {
          name: '意向等级',
          type: 'pie',
          radius: '50%',
          data: data,
          label: {
            show: true,
            formatter: '{b}\n{c} ({d}%)',
            position: 'outside',
            fontSize: 12,
            fontWeight: 'bold'
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    
    intentionChartInstance.setOption(option)
    // console.log('意向图表初始化成功')
  } catch (error) {
    console.error('意向图表初始化失败:', error)
  }
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChart.value) {
    // console.log('trendChart DOM元素不存在')
    return
  }
  
  try {
    trendChartInstance = echarts.init(trendChart.value)
    
    const trendData = overview.value.last_15_days_trend || []
    const dates = trendData.map(item => item.date)
    const counts = trendData.map(item => parseInt(item.count) || 0)
    
    // console.log('趋势数据:', trendData, dates, counts)
    
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '新增线索',
          type: 'line',
          data: counts,
          smooth: true,
          areaStyle: {
            opacity: 0.3
          },
          lineStyle: {
            width: 3
          },
          itemStyle: {
            color: '#409EFF'
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            fontSize: 12,
            fontWeight: 'bold',
            color: '#409EFF'
          }
        }
      ]
    }
    
    trendChartInstance.setOption(option)
    // console.log('趋势图表初始化成功')
  } catch (error) {
    console.error('趋势图表初始化失败:', error)
  }
}

// 初始化上周统计图表
const initLastWeekChart = () => {
  if (!lastWeekChart.value || !lastWeekData.value.daily_totals) {
    // console.log('lastWeekChart DOM元素不存在或数据为空')
    return
  }
  
  try {
    lastWeekChartInstance = echarts.init(lastWeekChart.value)
    
    // 准备平台数据
    const platformData = lastWeekData.value.platform_stats || {}
    const dailyTotals = lastWeekData.value.daily_totals || {}
    
    // 定义不同平台的颜色
    const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
    
    // 定义平台排序顺序
    const platformOrder = ['抖音', '视频号', '未知']
    
    // 按指定顺序排序平台
    const sortedPlatforms = Object.entries(platformData).sort(([a], [b]) => {
      const aIndex = platformOrder.indexOf(a)
      const bIndex = platformOrder.indexOf(b)
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      }
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return a.localeCompare(b)
    })
    
    // 获取所有日期并排序
    const dates = Object.keys(dailyTotals).sort()
    
    // 准备每个平台的数据系列
    const series = []
    
    // 添加每个平台的数据系列
    sortedPlatforms.forEach(([platform, dailyData], index) => {
      const data = dates.map(date => dailyData[date] || 0)
      series.push({
        name: platform,
        type: 'bar',
        data: data,
        itemStyle: { color: colors[index] },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          fontSize: 10,
          fontWeight: 'bold'
        },
        barWidth: '15%',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      })
    })
    
    // 添加汇总数据系列
    const totalData = dates.map(date => dailyTotals[date] || 0)
    series.push({
      name: '汇总',
      type: 'bar',
      data: totalData,
      itemStyle: { color: colors[3] },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}',
        fontSize: 10,
        fontWeight: 'bold'
      },
      barWidth: '15%',
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    })
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: [...sortedPlatforms.map(([platform]) => platform), '汇总'],
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          fontSize: 12,
          rotate: 45,
          color: '#606266'
        },
        axisLine: {
          lineStyle: {
            color: '#E4E7ED'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#E4E7ED'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#F5F7FA'
          }
        }
      },
      series: series
    }
    
    lastWeekChartInstance.setOption(option)
  } catch (error) {
    console.error('初始化上周统计图表失败:', error)
  }
}

// 初始化所有图表
const initCharts = () => {
  initPlatformChart()
  initIntentionChart()
  initTrendChart()
  initLastWeekChart()
  
  // 初始化小型趋势图
  nextTick(() => {
    // 初始化平台趋势图
    if (lastWeekData.value.platform_stats) {
      Object.keys(lastWeekData.value.platform_stats).forEach(platform => {
        initPlatformTrendChart(platform)
      })
    }
    
    // 初始化账号趋势图
    if (lastWeekData.value.account_stats) {
      Object.entries(lastWeekData.value.account_stats).forEach(([platform, accounts]) => {
        Object.keys(accounts).forEach(accountName => {
          initAccountTrendChart(platform, accountName)
        })
      })
    }
  })
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  if (platformChartInstance) platformChartInstance.resize()
  if (intentionChartInstance) intentionChartInstance.resize()
  if (trendChartInstance) trendChartInstance.resize()
  if (lastWeekChartInstance) lastWeekChartInstance.resize()
  
  // 重新调整小型图表大小
  platformTrendCharts.value.forEach((el, platform) => {
    const chart = echarts.getInstanceByDom(el)
    if (chart) chart.resize()
  })
  
  accountTrendCharts.value.forEach((el, key) => {
    const chart = echarts.getInstanceByDom(el)
    if (chart) chart.resize()
  })
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
  
  // 设置当前日期
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// 组件卸载时清理图表实例
onUnmounted(() => {
  if (platformChartInstance) {
    platformChartInstance.dispose()
    platformChartInstance = null
  }
  if (intentionChartInstance) {
    intentionChartInstance.dispose()
    intentionChartInstance = null
  }
  if (trendChartInstance) {
    trendChartInstance.dispose()
    trendChartInstance = null
  }
  if (lastWeekChartInstance) {
    lastWeekChartInstance.dispose()
    lastWeekChartInstance = null
  }
  
  // 清理小型图表实例
  platformTrendCharts.value.forEach((el, platform) => {
    const chart = echarts.getInstanceByDom(el)
    if (chart) chart.dispose()
  })
  platformTrendCharts.value.clear()
  
  accountTrendCharts.value.forEach((el, key) => {
    const chart = echarts.getInstanceByDom(el)
    if (chart) chart.dispose()
  })
  accountTrendCharts.value.clear()
  
  window.removeEventListener('resize', handleResize)
})

// 导出为图片
const exportToImage = async () => {
  try {
    exporting.value = true
    
    // 等待DOM更新
    await nextTick()
    
    // 调整图表大小以适应导出
    if (platformChartInstance) platformChartInstance.resize()
    if (intentionChartInstance) intentionChartInstance.resize()
    if (trendChartInstance) trendChartInstance.resize()
    if (lastWeekChartInstance) lastWeekChartInstance.resize()
    
    // 等待图表重新渲染
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const element = document.querySelector('.analysis-view')
    if (!element) {
      ElMessage.error('未找到要导出的元素')
      return
    }
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    // 创建下载链接
    const link = document.createElement('a')
    link.download = `数据分析报告_${currentDate.value}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

// 创建专门的导出页面
const createExportPage = () => {
  const exportElement = document.createElement('div')
  exportElement.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 750px;
    background: #ffffff;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    z-index: -1;
  `
  
  // 标题
  const title = document.createElement('div')
  title.style.cssText = `
    text-align: center;
    margin-bottom: 20px;
    padding: 15px 0;
  `
  title.innerHTML = `
    <h1 style="font-size: 18px; font-weight: 600; color: #2c3e50; margin: 0 0 3px 0;">今日客户线索统计</h1>
    <p style="font-size: 12px; color: #7f8c8d; margin: 0;">${currentDate.value}</p>
  `
  exportElement.appendChild(title)
  
  // 今日数据卡片 - 一行两个，共两行
  const todayCardsContainer = document.createElement('div')
  todayCardsContainer.style.cssText = `
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
  `
  
  const todayCards = [
    { label: '今日新增线索', value: todayStats.value.newLeads || 0, color: '#67C23A', icon: '➕' },
    { label: '今日跟进线索', value: todayStats.value.followed_leads || 0, color: '#409EFF', icon: '📞' },
    { label: '今日跟进记录', value: todayStats.value.followup_records || 0, color: '#E6A23C', icon: '📄' },
    { label: '今日终结线索', value: todayStats.value.ended_leads || 0, color: '#F56C6C', icon: '❌' }
  ]
  
  todayCards.forEach((card, index) => {
    const cardElement = createCard(card.label, card.value, card.color, card.icon)
    cardElement.style.width = '25%'
    cardElement.style.boxSizing = 'border-box'
    cardElement.style.marginBottom = '20px'
    todayCardsContainer.appendChild(cardElement)
          // console.log(`添加今日卡片 ${index + 1}:`, card.label, cardElement.style.cssText)
  })
  exportElement.appendChild(todayCardsContainer)
  
  // 统计信息卡片 - 一行两个，共两行
  const statsCardsContainer = document.createElement('div')
  statsCardsContainer.style.cssText = `
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 0;
  `
  
  const statsCards = [
    { label: '总线索数', value: overview.value.total_leads || 0, icon: '👤' },
    { label: '本周新增', value: overview.value.recent_additions?.this_week || 0, icon: '📅' },
    { label: '本月新增', value: overview.value.recent_additions?.this_month || 0, icon: '📅' },
    { label: '本周跟进线索', value: overview.value.followup?.this_week_lead_count || 0, icon: '📞' }
  ]
  
  statsCards.forEach((card, index) => {
    const cardElement = createStatCard(card.label, card.value, card.icon)
    cardElement.style.width = '25%'
    cardElement.style.boxSizing = 'border-box'
    cardElement.style.marginBottom = '20px'
    statsCardsContainer.appendChild(cardElement)
  })
  exportElement.appendChild(statsCardsContainer)
  
  // 图表区域
  const chartsContainer = document.createElement('div')
  chartsContainer.style.cssText = `
    overflow: hidden;
  `
  
  // 来源平台分布 - 占满一行
  const platformChartContainer = document.createElement('div')
  platformChartContainer.style.cssText = `
    width: 100%;
    margin-bottom: 20px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 20px;
  `
  
  const platformTitle = document.createElement('div')
  platformTitle.style.cssText = `
    font-weight: 600;
    color: #303133;
    margin-bottom: 15px;
  `
  platformTitle.textContent = '来源平台分布'
  platformChartContainer.appendChild(platformTitle)
  
  const platformChartDiv = document.createElement('div')
  platformChartDiv.style.cssText = `
    height: 300px;
    width: 100%;
  `
  platformChartContainer.appendChild(platformChartDiv)
  chartsContainer.appendChild(platformChartContainer)
  
  // 意向等级分布 - 占满一行
  const intentionChartContainer = document.createElement('div')
  intentionChartContainer.style.cssText = `
    width: 100%;
    margin-bottom: 20px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 20px;
  `
  
  const intentionTitle = document.createElement('div')
  intentionTitle.style.cssText = `
    font-weight: 600;
    color: #303133;
    margin-bottom: 15px;
  `
  intentionTitle.textContent = '意向等级分布'
  intentionChartContainer.appendChild(intentionTitle)
  
  const intentionChartDiv = document.createElement('div')
  intentionChartDiv.style.cssText = `
    height: 300px;
    width: 100%;
  `
  intentionChartContainer.appendChild(intentionChartDiv)
  chartsContainer.appendChild(intentionChartContainer)
  
  // 趋势图表 - 占满一行
  const trendChartContainer = document.createElement('div')
  trendChartContainer.style.cssText = `
    width: 100%;
    margin-bottom: 20px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 20px;
  `
  
  const trendTitle = document.createElement('div')
  trendTitle.style.cssText = `
    font-weight: 600;
    color: #303133;
    margin-bottom: 15px;
  `
  trendTitle.textContent = '最近15天趋势'
  trendChartContainer.appendChild(trendTitle)
  
  const trendChartDiv = document.createElement('div')
  trendChartDiv.style.cssText = `
    height: 300px;
    width: 100%;
  `
  trendChartContainer.appendChild(trendChartDiv)
  chartsContainer.appendChild(trendChartContainer)
  
  exportElement.appendChild(chartsContainer)
  
  // 添加到页面
  document.body.appendChild(exportElement)
  
  // 渲染图表到导出页面
  setTimeout(() => {
    // 渲染来源平台分布图表
    const platformChartInstance = echarts.init(platformChartDiv)
    const platformData = overview.value.platform_distribution || {}
    const platformChartData = Object.entries(platformData).map(([name, value]) => ({ name, value }))
    
    const platformOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: Object.keys(platformData)
      },
      series: [
        {
          name: '来源平台',
          type: 'pie',
          radius: '50%',
          data: platformChartData,
          label: {
            show: true,
            formatter: '{b}\n{c} ({d}%)',
            position: 'outside',
            fontSize: 12,
            fontWeight: 'bold'
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    platformChartInstance.setOption(platformOption)
    
    // 渲染意向等级分布图表
    const intentionChartInstance = echarts.init(intentionChartDiv)
    const intentionData = overview.value.intention_distribution || {}
    const intentionChartData = Object.entries(intentionData).map(([name, value]) => ({ name, value }))
    
    const intentionOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: Object.keys(intentionData)
      },
      series: [
        {
          name: '意向等级',
          type: 'pie',
          radius: '50%',
          data: intentionChartData,
          label: {
            show: true,
            formatter: '{b}\n{c} ({d}%)',
            position: 'outside',
            fontSize: 12,
            fontWeight: 'bold'
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    intentionChartInstance.setOption(intentionOption)
    
    // 渲染趋势图表
    const trendChartInstance = echarts.init(trendChartDiv)
    const trendData = overview.value.last_15_days_trend || []
    const dates = trendData.map(item => item.date)
    const counts = trendData.map(item => parseInt(item.count) || 0)
    
    const trendOption = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '新增线索',
          type: 'line',
          data: counts,
          smooth: true,
          areaStyle: {
            opacity: 0.3
          },
          lineStyle: {
            width: 3
          },
          itemStyle: {
            color: '#409EFF'
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            fontSize: 12,
            fontWeight: 'bold',
            color: '#409EFF'
          }
        }
      ]
    }
    trendChartInstance.setOption(trendOption)
  }, 100)
  
  return exportElement
}

// 创建今日数据卡片
const createCard = (label, value, color, icon) => {
  const card = document.createElement('div')
  card.style.cssText = `
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 22px;
    height: 130px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  `
  
  const iconDiv = document.createElement('div')
  iconDiv.style.cssText = `
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    font-size: 18px;
    color: white;
    background: ${color};
    flex-shrink: 0;
  `
  iconDiv.textContent = icon
  
  const valueDiv = document.createElement('div')
  valueDiv.style.cssText = `
    font-size: 26px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 4px;
    line-height: 1;
  `
  valueDiv.textContent = value
  
  const labelDiv = document.createElement('div')
  labelDiv.style.cssText = `
    font-size: 16px;
    font-weight: 600;
    color: #909399;
    line-height: 1.2;
  `
  labelDiv.textContent = label
  
  card.appendChild(iconDiv)
  card.appendChild(valueDiv)
  card.appendChild(labelDiv)
  
  return card
}

// 创建统计卡片
const createStatCard = (label, value, icon) => {
  const card = document.createElement('div')
  card.style.cssText = `
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 22px;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  `
  
  const iconDiv = document.createElement('div')
  iconDiv.style.cssText = `
    font-size: 20px;
    margin-bottom: 10px;
    color: #409EFF;
    flex-shrink: 0;
  `
  iconDiv.textContent = icon
  
  const valueDiv = document.createElement('div')
  valueDiv.style.cssText = `
    font-size: 28px;
    font-weight: bold;
    color: #409EFF;
    margin-bottom: 5px;
    line-height: 1;
  `
  valueDiv.textContent = value
  
  const labelDiv = document.createElement('div')
  labelDiv.style.cssText = `
    font-size: 16px;
    font-weight: 600;
    color: #909399;
    line-height: 1.2;
  `
  labelDiv.textContent = label
  
  card.appendChild(iconDiv)
  card.appendChild(valueDiv)
  card.appendChild(labelDiv)
  
  return card
}

// 获取平台总线索数
const getPlatformTotal = (platform) => {
  if (!lastWeekData.value.platform_stats || !lastWeekData.value.platform_stats[platform]) return 0
  const values = Object.values(lastWeekData.value.platform_stats[platform])
  return values.reduce((sum, val) => sum + val, 0)
}

// 获取平台日均线索数
const getPlatformAverage = (platform) => {
  if (!lastWeekData.value.platform_stats || !lastWeekData.value.platform_stats[platform]) return 0
  const total = getPlatformTotal(platform)
  return Math.round(total / 7 * 10) / 10
}

// 检查数据是否已加载
const isDataLoaded = computed(() => {
  return lastWeekData.value && lastWeekData.value.platform_stats && Object.keys(lastWeekData.value.platform_stats).length > 0
})

// 获取平台最高值
const getPlatformMax = (platform) => {
  if (!isDataLoaded.value || !lastWeekData.value.platform_stats[platform]) {
    return 0
  }
  const values = Object.values(lastWeekData.value.platform_stats[platform]).map(v => Number(v) || 0)
  const max = Math.max(...values)
  return max
}

// 获取平台最低值
const getPlatformMin = (platform) => {
  if (!lastWeekData.value.platform_stats || !lastWeekData.value.platform_stats[platform]) return 0
  const values = Object.values(lastWeekData.value.platform_stats[platform])
  return Math.min(...values)
}

// 获取排序后的平台统计数据
const getSortedPlatformStats = () => {
  if (!lastWeekData.value.platform_stats) return {}
  
  // 定义平台排序顺序
  const platformOrder = ['抖音', '视频号', '未知']
  
  const sortedStats = {}
  const platforms = Object.keys(lastWeekData.value.platform_stats)
  
  // 按指定顺序排序平台
  platforms.sort((a, b) => {
    const aIndex = platformOrder.indexOf(a)
    const bIndex = platformOrder.indexOf(b)
    // 如果平台在排序列表中，按列表顺序排序；否则按字母顺序
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.localeCompare(b)
  })
  
  // 按排序后的顺序构建对象
  platforms.forEach(platform => {
    sortedStats[platform] = lastWeekData.value.platform_stats[platform]
  })
  
  return sortedStats
}

// 获取账号总线索数
const getAccountTotal = (accountData) => {
  return Object.values(accountData).reduce((sum, val) => sum + val, 0)
}

// 获取账号日均线索数
const getAccountAverage = (accountData) => {
  const total = getAccountTotal(accountData)
  return Math.round(total / 7 * 10) / 10
}

// 获取账号最高值
const getAccountMax = (accountData) => {
  const values = Object.values(accountData).map(v => Number(v) || 0)
  return Math.max(...values)
}

// 获取账号最低值
const getAccountMin = (accountData) => {
  return Math.min(...Object.values(accountData))
}

// 获取账号表现评级
const getPerformanceClass = (total) => {
  if (total === 0) return 'neutral'
  if (total >= 10) return 'excellent'
  if (total >= 5) return 'good'
  if (total >= 1) return 'positive'
  return 'neutral'
}

// 获取账号表现文本
const getPerformanceText = (total) => {
  if (total === 0) return '无数据'
  if (total >= 10) return '优秀'
  if (total >= 5) return '良好'
  if (total >= 1) return '一般'
  return '无数据'
}

// 获取指定平台的账号列表
const getPlatformAccounts = (platformName) => {
  if (!platformAccountData.value.platforms || !platformAccountData.value.platforms[platformName]) return []
  
  const accountItems = []
  const platformData = platformAccountData.value.platforms[platformName]
  
  // 添加已知账号
  if (platformData.known_accounts && Object.keys(platformData.known_accounts).length > 0) {
    Object.entries(platformData.known_accounts).forEach(([accountName, count]) => {
      accountItems.push({
        key: `${platformName}-${accountName}`,
        platform: platformName,
        accountName,
        count,
        isUnknown: false
      })
    })
  }
  
  // 添加未知账号
  if (platformData.unknown_accounts > 0) {
    accountItems.push({
      key: `${platformName}-unknown`,
      platform: platformName,
      accountName: '未知账号',
      count: platformData.unknown_accounts,
      isUnknown: true
    })
  }
  
  return accountItems
}

// 获取指定平台的总线索数
const getPlatformTotalLeads = (platformName) => {
  if (!platformAccountData.value.platforms || !platformAccountData.value.platforms[platformName]) return 0
  return platformAccountData.value.platforms[platformName].total_leads || 0
}

// 调试函数：检查平台数据
const debugPlatformData = (platform) => {
  if (!isDataLoaded.value) {
    return
  }

  const data = lastWeekData.value.platform_stats[platform]
  const entries = Object.entries(data)
  const values = entries.map(([date, value]) => ({ date, value: Number(value) || 0 }))
  const max = Math.max(...values.map(v => v.value))
  
  return { data, values, max }
}



// 设置平台趋势图引用
const setPlatformTrendChartRef = (el, platform) => {
  if (el && platformTrendCharts.value) {
    platformTrendCharts.value.set(platform, el)
    nextTick(() => initPlatformTrendChart(platform))
  }
}

// 设置账号趋势图引用
const setAccountTrendChartRef = (el, platform, accountName) => {
  if (el && accountTrendCharts.value) {
    const key = `${platform}-${accountName}`
    accountTrendCharts.value.set(key, el)
    nextTick(() => initAccountTrendChart(platform, accountName))
  }
}

// 初始化平台趋势图
const initPlatformTrendChart = (platform) => {
  const chartEl = platformTrendCharts.value.get(platform)
  if (!chartEl || !isDataLoaded.value || !lastWeekData.value.platform_stats[platform]) {
    return
  }

  try {
    const chart = echarts.init(chartEl)
    const data = lastWeekData.value.platform_stats[platform]
    const dates = Object.keys(data).sort()
    const values = dates.map(date => data[date] || 0)

    const option = {
      grid: {
        left: 0,
        right: 0,
        top: 15,
        bottom: 0
      },
      xAxis: {
        type: 'category',
        data: dates,
        show: false
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [{
        type: 'bar',
        data: values,
        itemStyle: {
          color: '#409EFF'
        },
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          fontSize: 10,
          color: '#606266',
          distance: 2
        }
      }]
    }

    chart.setOption(option)
  } catch (error) {
    console.error(`初始化平台 ${platform} 趋势图失败:`, error)
  }
}

// 初始化账号趋势图
const initAccountTrendChart = (platform, accountName) => {
  const key = `${platform}-${accountName}`
  const chartEl = accountTrendCharts.value.get(key)
  if (!chartEl || !isDataLoaded.value || !lastWeekData.value.account_stats[platform]?.[accountName]) {
    return
  }

  try {
    const chart = echarts.init(chartEl)
    const data = lastWeekData.value.account_stats[platform][accountName]
    const dates = Object.keys(data).sort()
    const values = dates.map(date => data[date] || 0)

    const option = {
      grid: {
        left: 0,
        right: 0,
        top: 12,
        bottom: 0
      },
      xAxis: {
        type: 'category',
        data: dates,
        show: false
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [{
        type: 'bar',
        data: values,
        itemStyle: {
          color: '#67C23A'
        },
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          fontSize: 8,
          color: '#606266',
          distance: 1
        }
      }]
    }

    chart.setOption(option)
  } catch (error) {
    console.error(`初始化账号 ${accountName} 趋势图失败:`, error)
  }
}
</script>

<style scoped lang="scss">
.analysis-view {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background: #f5f7fa;
}

.export-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  
  .export-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

.export-title {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px 0;
  
  .mobile-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 5px 0;
  }
  
  .mobile-date {
    font-size: 14px;
    color: #7f8c8d;
    margin: 0;
  }
}

.overview-cards {
  margin-bottom: 20px;
  
  .data-card {
    height: 120px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    &.loading {
      opacity: 0.8;
      .card-icon {
        animation: pulse 1.5s ease-in-out infinite;
      }
    }
    
    .card-content {
      display: flex;
      align-items: center;
      height: 100%;
      
      .card-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;
        font-size: 24px;
        color: white;
      }
      
      .card-info {
        flex: 1;
        
        .card-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .loading-spinner {
            display: flex;
            align-items: center;
            justify-content: center;
            
            .el-icon {
              font-size: 24px;
              color: #409EFF;
            }
          }
        }
        
        .card-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
    
    &.today-new .card-icon {
      background: linear-gradient(135deg, #67C23A, #85CE61);
    }
    
    &.today-follow .card-icon {
      background: linear-gradient(135deg, #409EFF, #66B1FF);
    }
    
    &.today-records .card-icon {
      background: linear-gradient(135deg, #E6A23C, #EEBE77);
    }
    
    &.today-ended .card-icon {
      background: linear-gradient(135deg, #F56C6C, #F78989);
    }
  }
}

.detailed-stats {
  margin-bottom: 20px;
  
  .stat-card {
    transition: all 0.3s ease;
    
    &.loading {
      opacity: 0.8;
      .card-header .el-icon {
        animation: pulse 1.5s ease-in-out infinite;
      }
    }
    
    .card-header {
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-icon {
        font-size: 16px;
        color: #409EFF;
      }
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #409EFF;
      text-align: center;
      padding: 20px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .loading-spinner {
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          font-size: 20px;
          color: #409EFF;
        }
      }
    }
  }
}

.charts-section {
  .chart-card {
    transition: all 0.3s ease;
    
    &.loading {
      opacity: 0.8;
    }
    
    .card-header {
      font-weight: 600;
      color: #303133;
    }
    
    .chart-container {
      height: 400px;
      
      .chart {
        width: 100%;
        height: 100%;
      }
      
      .chart-skeleton {
        padding: 20px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

/* 终结跟进确认对话框样式 */
:deep(.end-followup-confirm) {
  .el-message-box__header {
    background: linear-gradient(135deg, #ff5722, #ff7043);
    color: white;
  }
  
  .el-message-box__title {
    color: white;
    font-weight: 600;
  }
  
  .el-message-box__content {
    padding: 20px;
    font-size: 16px;
    line-height: 1.6;
  }
  
  .el-button--primary {
    background: #ff5722;
    border-color: #ff5722;
  }
  
  .el-button--primary:hover {
    background: #f4511e;
    border-color: #f4511e;
  }
}

/* 上周统计样式 */
.last-week-overview {
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid rgba(64, 158, 255, 0.1);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.08);
}

.overview-item {
  text-align: center;
  padding: 20px 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(64, 158, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.overview-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #409EFF, #67C23A);
}

.overview-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
  border-color: rgba(64, 158, 255, 0.3);
}

.overview-value {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  line-height: 1.2;
}

.overview-label-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.overview-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 0;
}

.overview-date {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  background: rgba(64, 158, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 0;
}

.trend-chart-mini {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 24px;
  padding: 2px 0;
}

.trend-bar {
  flex: 1;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  border-radius: 1px;
  min-width: 3px;
  transition: all 0.3s ease;
}

.trend-bar:hover {
  background: linear-gradient(135deg, #67C23A, #E6A23C);
  transform: scaleY(1.2);
}

.last-week-chart {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(64, 158, 255, 0.1);
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.05);
  
  .chart-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 15px;
    text-align: center;
    padding: 10px 0;
    border-bottom: 2px solid rgba(64, 158, 255, 0.1);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 2px;
      background: linear-gradient(135deg, #409EFF, #67C23A);
      border-radius: 1px;
    }
  }
}

.account-summary-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
  border-radius: 16px;
  padding: 25px;
  margin: 0 -5px 20px -5px;
  border: 1px solid rgba(64, 158, 255, 0.1);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.08);

  .section-title {
    text-align: center;
    margin-bottom: 20px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 5px 0;
    }

    .section-subtitle {
      font-size: 14px;
      color: #7f8c8d;
      margin: 0;
    }
  }
}

.platform-summary-cards {
  margin-bottom: 25px;
}

    .platform-summary-card {
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      padding: 24px;
      min-height: 260px;
      display: flex;
      flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid rgba(64, 158, 255, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
    border-color: rgba(64, 158, 255, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #409EFF, #67C23A);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  .platform-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 24px;

    .platform-name {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      flex: 1;
      text-align: left;
      margin-right: 8px;
    }

    .platform-total {
      font-size: 28px;
      font-weight: bold;
      color: #409EFF;
      background: linear-gradient(135deg, #409EFF, #67C23A);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }
  }

      .platform-stats {
      width: 100%;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        min-width: 40px;

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 6px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #409EFF;
          line-height: 1;
        }
      }
    }

    .platform-trend {
      width: 100%;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(64, 158, 255, 0.1);

      .trend-title {
        font-size: 13px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
        text-align: center;
        padding: 4px 0;
        border-bottom: 2px solid rgba(64, 158, 255, 0.1);
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 2px;
          background: linear-gradient(135deg, #409EFF, #67C23A);
          border-radius: 1px;
        }
      }

      .trend-chart {
        height: 60px;
        width: 100%;
      }
    }
}

.account-detail-cards {
  .el-collapse-item__header {
    background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border: 1px solid rgba(64, 158, 255, 0.1);
    padding: 15px 20px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(64, 158, 255, 0.15);
      border-color: rgba(64, 158, 255, 0.3);
    }
  }

  .el-collapse-item__content {
    padding: 0 20px 20px;
  }

  .el-row {
    margin: 0 !important;
  }

  .el-col {
    padding: 0 6px !important;
  }
}

.account-card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  padding: 12px;
  border: 1px solid rgba(64, 158, 255, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 200px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
    border-color: rgba(64, 158, 255, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(135deg, #409EFF, #67C23A);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  .account-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 15px;

    .account-name {
      font-size: 13px;
      font-weight: 600;
      color: #303133;
      flex: 1;
      text-align: left;
      margin-right: 8px;
    }

    .account-total {
      font-size: 18px;
      font-weight: bold;
      color: #409EFF;
      background: linear-gradient(135deg, #409EFF, #67C23A);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }
  }

      .account-stats {
      width: 100%;
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 12px;

      .stat-row {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        min-width: 50px;

        .stat-label {
          font-size: 11px;
          color: #909399;
          margin-bottom: 3px;
        }

        .stat-value {
          font-size: 16px;
          font-weight: bold;
          color: #409EFF;
          line-height: 1;
        }
      }
    }

      .account-trend {
      width: 100%;
      margin-bottom: 12px;

      .trend-title {
        font-size: 13px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
        text-align: center;
        padding: 4px 0;
        border-bottom: 2px solid rgba(64, 158, 255, 0.1);
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 2px;
          background: linear-gradient(135deg, #409EFF, #67C23A);
          border-radius: 1px;
        }
      }

      .trend-chart {
        height: 30px;
        width: 100%;
      }
  }

        .account-performance {
       .performance-badge {
         font-size: 11px;
         font-weight: 600;
         padding: 3px 6px;
         border-radius: 4px;
         color: white;
         text-align: center;
       }

     .performance-badge.excellent {
       background: linear-gradient(135deg, #67C23A, #85CE61);
     }

     .performance-badge.good {
       background: linear-gradient(135deg, #409EFF, #66B1FF);
     }

     .performance-badge.positive {
       background: linear-gradient(135deg, #E6A23C, #EEBE77);
     }

     .performance-badge.neutral {
       background: #909399;
     }
   }
}

// 脉冲动画
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .analysis-view {
    padding: 10px;
  }
  
  .overview-cards {
    .data-card {
      height: 100px;
      
      .card-content {
        .card-icon {
          width: 50px;
          height: 50px;
          font-size: 20px;
          margin-right: 15px;
        }
        
        .card-info {
          .card-value {
            font-size: 24px;
          }
          
          .card-label {
            font-size: 12px;
          }
        }
      }
    }
  }
  
  .detailed-stats {
    .stat-card {
      .stat-value {
        font-size: 20px;
        padding: 15px 0;
      }
    }
  }
  
  .charts-section {
    .chart-card {
      .chart-container {
        height: 300px;
      }
    }
  }

  .platform-summary-cards {
    .el-row {
      margin: 0 !important;
    }
  }

  .platform-summary-card {
    margin-bottom: 15px;
    padding: 15px;
  }

  .account-detail-cards {
    .el-collapse-item__header {
      font-size: 14px;
      padding: 10px 15px;
    }

    .el-collapse-item__content {
      padding: 0 15px 15px;
    }

    .collapse-title {
      display: flex;
      align-items: center;
      width: 100%;
    }
  }

  .account-card {
    padding: 12px;
    min-height: 180px;

    .account-header {
      .account-name {
        font-size: 13px;
      }
      .account-total {
        font-size: 18px;
      }
    }

    .account-stats {
      .stat-row {
        .stat-label {
          font-size: 10px;
        }
        .stat-value {
          font-size: 14px;
        }
      }
    }

    .account-trend {
      .trend-title {
        font-size: 11px;
      }
      .trend-chart {
        height: 18px;
      }
    }
  }

  .account-summary-section {
    padding: 20px;
    margin: 0 -5px 20px -5px;
  }
}

/* 平台账号统计概览样式 */
.platform-overview-summary {
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid rgba(64, 158, 255, 0.1);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.08);
  text-align: center;
}

.summary-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.summary-icon {
  font-size: 48px;
  opacity: 0.8;
}

.summary-content {
  .summary-value {
    font-size: 36px;
    font-weight: bold;
    background: linear-gradient(135deg, #409EFF, #67C23A);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
    line-height: 1.2;
  }
  
  .summary-label {
    font-size: 16px;
    color: #606266;
    font-weight: 600;
  }
}

.platform-stats-cards {
  margin-bottom: 25px;
}

.platform-stat-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  border: 1px solid rgba(64, 158, 255, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: 100%;
  text-align: center;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
    border-color: rgba(64, 158, 255, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #409EFF, #67C23A);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  .platform-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    .platform-name {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .platform-total {
      font-size: 28px;
      font-weight: bold;
      color: #409EFF;
      background: linear-gradient(135deg, #409EFF, #67C23A);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
}

.account-detail-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
  border-radius: 16px;
  padding: 25px;
  margin: 0 -5px 20px -5px;
  border: 1px solid rgba(64, 158, 255, 0.1);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.08);

  .section-title {
    text-align: center;
    margin-bottom: 30px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 5px 0;
    }

    .section-subtitle {
      font-size: 14px;
      color: #7f8c8d;
      margin: 0;
    }
  }
}

.platform-section {
  margin-bottom: 30px;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .platform-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
    
    .platform-total {
      font-size: 14px;
      color: #606266;
      background: rgba(64, 158, 255, 0.1);
      padding: 4px 12px;
      border-radius: 6px;
      font-weight: 500;
    }
  }
}

.douyin-section {
  background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);
  border-color: rgba(239, 68, 68, 0.1);
  
  .platform-section-header {
    border-bottom-color: rgba(239, 68, 68, 0.2);
    
    h4 {
      color: #dc2626;
    }
    
    .platform-total {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }
  }
}

.video-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: rgba(59, 130, 246, 0.1);
  
  .platform-section-header {
    border-bottom-color: rgba(59, 130, 246, 0.2);
    
    h4 {
      color: #2563eb;
    }
    
    .platform-total {
      background: rgba(59, 130, 246, 0.1);
      color: #2563eb;
    }
  }
}

.unknown-section {
  background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
  border-color: rgba(245, 158, 11, 0.1);
  
  .platform-section-header {
    border-bottom-color: rgba(245, 158, 11, 0.2);
    
    h4 {
      color: #d97706;
    }
    
    .platform-total {
      background: rgba(245, 158, 11, 0.1);
      color: #d97706;
    }
  }
}


.account-stat-item {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  padding: 12px;
  border: 1px solid rgba(64, 158, 255, 0.08);
  transition: all 0.3s ease;
  text-align: center;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.15);
    border-color: rgba(64, 158, 255, 0.3);
  }

  &.unknown-account {
    border-color: rgba(230, 162, 60, 0.3);
    background: rgba(230, 162, 60, 0.05);
    
    &:hover {
      border-color: rgba(230, 162, 60, 0.5);
      box-shadow: 0 6px 20px rgba(230, 162, 60, 0.15);
    }
  }


  .account-name {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 6px;
    word-break: break-all;
  }

  .account-count {
    font-size: 16px;
    font-weight: bold;
    color: #409EFF;
    background: linear-gradient(135deg, #409EFF, #67C23A);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .unknown-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 10px;
    color: #E6A23C;
    background: rgba(230, 162, 60, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
  }
}


// 响应式设计
@media (max-width: 768px) {
  .platform-overview-summary {
    padding: 20px;
  }

  .summary-card {
    flex-direction: column;
    gap: 15px;
  }

  .summary-icon {
    font-size: 36px;
  }

  .summary-content {
    .summary-value {
      font-size: 28px;
    }
    
    .summary-label {
      font-size: 14px;
    }
  }

  .platform-stat-card {
    padding: 15px;
    margin-bottom: 15px;

    .platform-header {
      .platform-name {
        font-size: 14px;
      }

      .platform-total {
        font-size: 20px;
      }
    }

    .platform-details {
      .detail-item {
        .detail-label {
          font-size: 11px;
        }

        .detail-value {
          font-size: 14px;
        }
      }
    }
  }

  .account-detail-section {
    padding: 20px;
    margin: 0 -5px 20px -5px;
  }

  .platform-section {
    padding: 15px;
    margin-bottom: 20px;
    
    .platform-section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      
      h4 {
        font-size: 15px;
      }
      
      .platform-total {
        font-size: 12px;
        padding: 3px 8px;
      }
    }
  }

  .account-stat-item {
    padding: 10px;

    .account-name {
      font-size: 12px;
    }

    .account-count {
      font-size: 14px;
    }
  }
}
</style> 