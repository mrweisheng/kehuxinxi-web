import axios from 'axios'

const service = axios.create({
  // baseURL: 'http://localhost:9527/api', // 统一维护API基础路径
  // baseURL: 'http://47.113.177.228:9527/api', // 生产环境使用 Nginx 代理
  baseURL: '/api', // 使用相对路径，通过 Nginx 代理到后端
  // baseURL: 'http://kehuapi.huaxing.help/api',
  timeout: 10000
})

// 请求拦截器（添加token）
service.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

// 处理API响应格式的工具函数
const handleApiResponse = (data) => {
  // 处理登录接口的响应格式（使用code字段）
  if (data.code !== undefined && data.code !== 0) {
    throw new Error(data.message || '操作失败')
  }
  
  // 处理其他接口的响应格式（使用success字段）
  if (data.success === false) {
    throw new Error(data.message || '操作失败')
  }
  
  // 返回处理后的数据
  return {
    ...data,
    // 确保list字段存在
    list: data.list || [],
    // 确保total字段存在
    total: data.total || 0,
    // 保留performance信息
    performance: data.performance
  }
}

// 响应拦截器（统一处理错误和响应格式）
service.interceptors.response.use(
  response => {
    const { data } = response
    return handleApiResponse(data)
  },
  error => {
    let message = '网络错误'
    
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 清除本地token
          localStorage.removeItem('token')
          // 跳转到登录页
          window.location.href = '/login'
          message = '登录已过期，请重新登录'
          break
        case 400:
          message = data?.message || '请求参数错误'
          break
        case 403:
          message = data?.message || '您没有权限操作该线索'
          break
        case 404:
          message = data?.message || '资源不存在'
          break
        case 500:
          message = data?.message || '服务器内部错误'
          break
        default:
          message = data?.message || `请求失败 (${status})`
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message = '网络连接失败，请检查网络设置'
    } else {
      // 请求配置出错
      message = error.message || '请求配置错误'
    }
    
    return Promise.reject(new Error(message))
  }
)

export default service 