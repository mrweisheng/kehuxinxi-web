import request from './request'

// 获取线索列表
export function getLeads(params) {
  return request.get('/leads', { params })
}

// 获取线索详情
export function getLeadDetail(id) {
  return request.get(`/leads/${id}`)
}

// 新增线索
export function createLead(data) {
  return request.post('/leads', data)
}

// 编辑线索
export function updateLead(id, data) {
  return request.put(`/leads/${id}`, data)
}

// 删除线索
export function deleteLead(id) {
  return request.delete(`/leads/${id}`)
}

// 获取线索统计概览
export function getLeadsOverview() {
  return request.get('/statistics/leads-overview')
}

// 导出线索
export function exportLeads(params) {
  return request.get('/leads/export', { params })
}

// 获取线索来源列表（按平台分组）
export function getLeadSources() {
  return request.get('/lead-sources')
}

// 启用跟进
export function enableFollowUp(id) {
  return request.post(`/leads/${id}/enable-followup`)
}

// 禁用跟进
export function disableFollowUp(id, data) {
  return request.post(`/leads/${id}/disable-followup`, data)
}