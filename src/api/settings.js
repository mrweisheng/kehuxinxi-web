import request from './request'

// ============================
// 跟进超期提醒配置
// ============================

// 获取所有意向级别的提醒配置
export function getFollowupRemindConfig() {
  return request.get('/followup-remind-config')
}

// 更新某个意向级别的提醒配置
export function updateFollowupRemindConfig(level, intervalDays) {
  return request.put(`/followup-remind-config/${level}`, {
    interval_days: intervalDays
  })
}

// ============================
// 邮件提醒收件人管理
// ============================

// 获取所有收件人邮箱
export function getRemindEmailList() {
  return request.get('/remind-email-list')
}

// 新增收件人邮箱
export function addRemindEmail(email) {
  return request.post('/remind-email-list', {
    email: email
  })
}

// 删除收件人邮箱
export function deleteRemindEmail(id) {
  return request.delete(`/remind-email-list/${id}`)
} 

// ============================
// 平台账号管理
// ============================

// 获取所有平台列表
export function getPlatforms() {
  return request.get('/lead-sources/platforms')
}

// 根据平台获取账号列表
export function getAccountsByPlatform(platform) {
  return request.get(`/lead-sources/platforms/${platform}/accounts`)
}

// 新增平台
export function addPlatform(platform, description) {
  return request.post('/lead-sources/platforms', {
    platform: platform,
    description: description
  })
}

// 新增账号
export function addAccount(platform, account, description) {
  return request.post('/lead-sources/accounts', {
    platform: platform,
    account: account,
    description: description
  })
}

// 删除账号
export function deleteAccount(id) {
  return request.delete(`/lead-sources/accounts/${id}`)
} 