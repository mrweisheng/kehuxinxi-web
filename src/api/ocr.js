import request from './request'

/**
 * OCR图片识别（异步模式）
 * @param {File} imageFile - 图片文件
 * @param {number} assignedUserId - 跟进人用户ID（可选，根据用户角色决定是否必填）
 * @returns {Promise} 返回任务ID和状态
 */
export function uploadImage(imageFile, assignedUserId = null) {
  const formData = new FormData()
  formData.append('image', imageFile)
  
  // 如果提供了assigned_user_id，则添加到表单数据中
  if (assignedUserId !== null && assignedUserId !== undefined) {
    formData.append('assigned_user_id', assignedUserId)
  }
  
  return request({
    url: '/ocr/recognize',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 30000 // 30秒超时
  })
}

/**
 * 查询OCR任务状态
 * @param {string} taskId - 任务ID
 * @returns {Promise} 返回任务状态和结果
 */
export function getTaskStatus(taskId) {
  return request({
    url: `/ocr/status/${taskId}`,
    method: 'get'
  })
}

/**
 * 查询OCR任务记录历史
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.limit - 每页数量（默认10，最大100）
 * @param {string} params.status - 任务状态筛选（pending/processing/completed/failed）
 * @param {string} params.startDate - 开始日期（YYYY-MM-DD格式）
 * @param {string} params.endDate - 结束日期（YYYY-MM-DD格式）
 * @returns {Promise} 返回任务记录列表
 */
export function getTaskRecords(params = {}) {
  return request({
    url: '/ocr/records',
    method: 'get',
    params: {
      page: 1,
      limit: 10,
      ...params
    }
  })
}

/**
 * 轮询任务状态直到完成
 * @param {string} taskId - 任务ID
 * @param {Function} onProgress - 进度回调函数
 * @param {number} interval - 轮询间隔（毫秒，默认2000）
 * @param {number} maxAttempts - 最大尝试次数（默认150，即5分钟）
 * @returns {Promise} 返回最终结果
 */
// interval 默认改为 5000ms（5 秒）
export function pollTaskStatus(taskId, onProgress = null, interval = 5000, maxAttempts = 150) {
  return new Promise((resolve, reject) => {
    // 验证taskId
    if (!taskId) {
      reject(new Error('无效的任务ID，无法查询任务状态'))
      return
    }
    
    let attempts = 0
    
    const poll = async () => {
      try {
        attempts++
        
        if (attempts > maxAttempts) {
          reject(new Error('任务超时，请稍后查看任务记录'))
          return
        }
        
        // 经过响应拦截器后，这里返回的是业务数据本体（已无 axios 的 data 包裹）
        // 但为兼容性，这里同时处理可能的 { data: {...} } 结构
        const response = await getTaskStatus(taskId)
        const payload = response?.data ?? response
        
        // 调用进度回调
        if (onProgress && typeof onProgress === 'function') {
          onProgress(payload)
        }
        
        // 检查任务状态
        const status = payload?.status
        if (status === 'completed') {
          resolve(payload)
        } else if (status === 'failed') {
          reject(new Error(payload?.error || '任务处理失败'))
        } else {
          // 继续轮询
          setTimeout(poll, interval)
        }
      } catch (error) {
        reject(error)
      }
    }
    
    // 开始轮询
    poll()
  })
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 验证图片文件
 * @param {File} file - 文件对象
 * @returns {Object} 验证结果 { valid: boolean, message: string }
 */
export function validateImageFile(file) {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: '不支持的文件格式，请上传 JPG、JPEG、PNG 或 GIF 格式的图片'
    }
  }
  
  // 检查文件大小（10MB = 10 * 1024 * 1024 bytes）
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      message: `文件大小超过限制，最大支持 ${formatFileSize(maxSize)}`
    }
  }
  
  return {
    valid: true,
    message: '文件验证通过'
  }
}

/**
 * 格式化任务状态文本
 * @param {string} status - 任务状态
 * @returns {string} 格式化后的状态文本
 */
export function formatTaskStatus(status) {
  const statusMap = {
    'pending': '等待处理',
    'processing': '正在处理',
    'completed': '处理完成',
    'failed': '处理失败'
  }
  
  return statusMap[status] || status
}

/**
 * 格式化任务执行时间
 * @param {number} timeMs - 执行时间（毫秒）
 * @returns {string} 格式化后的时间
 */
export function formatExecutionTime(timeMs) {
  if (timeMs < 1000) {
    return `${timeMs}ms`
  } else if (timeMs < 60000) {
    return `${(timeMs / 1000).toFixed(1)}s`
  } else {
    const minutes = Math.floor(timeMs / 60000)
    const seconds = Math.floor((timeMs % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }
}

export default {
  uploadImage,
  getTaskStatus,
  getTaskRecords,
  pollTaskStatus,
  formatFileSize,
  validateImageFile,
  formatTaskStatus,
  formatExecutionTime
}