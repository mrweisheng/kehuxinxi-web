import request from './request'

// 新增跟进记录
export function createFollowUp(data) {
  return request.post('/followups', data)
}

// 获取某条线索所有跟进记录，支持分页
export function getFollowUpsByLeadId(leadId, page = 1, page_size = 5) {
  return request.get(`/followups/${leadId}?page=${page}&page_size=${page_size}`)
} 