import request from './request'

// 获取统计数据概览
export function getLeadsOverview() {
  return request.get('/statistics/leads-overview')
}

// 获取上周统计数据
export function getLastWeekStats() {
  return request.get('/statistics/last-week')
}

// 获取销售员业绩统计
export function getSalesPerformance() {
  return request.get('/statistics/sales-performance')
}

// 获取成交转化统计
export function getConversionStats() {
  return request.get('/statistics/conversion-stats')
}

// 获取平台账号统计概览
export function getPlatformAccountSummary() {
  return request.get('/statistics/platform-account-summary')
} 