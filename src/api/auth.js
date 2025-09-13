import request from './request'

// 用户注册
export function register(data) {
  return request.post('/users/register', data)
}

// 用户登录
export function login(data) {
  return request.post('/users/login', data)
}

// 获取用户列表
export function getUsers() {
  return request.get('/users')
}

// 获取用户详情
export function getUserDetail(id) {
  return request.get(`/users/${id}`)
}

// 修改用户信息
export function updateUser(id, data) {
  return request.put(`/users/${id}`, data)
}

// 删除用户
export function deleteUser(id) {
  return request.delete(`/users/${id}`)
} 