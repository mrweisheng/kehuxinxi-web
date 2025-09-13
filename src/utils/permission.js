// 角色权限管理工具

// 角色定义
export const ROLES = {
  ADMIN: 'admin',      // 管理
  SERVICE: 'service',   // 客服
  SALES: 'sales',      // 销售
  USER: 'user'         // 普通用户
}

// 角色显示名称
export const ROLE_NAMES = {
  [ROLES.ADMIN]: '管理',
  [ROLES.SERVICE]: '客服',
  [ROLES.SALES]: '销售',
  [ROLES.USER]: '普通用户'
}

// 角色权限配置
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    // 管理权限 - 所有功能
    canManageUsers: true,
    canManageSystem: true,
    canViewAnalytics: true,
    canManageLeads: true,
    canCreateLeads: true,  // 新增线索权限
    canEditLeads: true,    // ★★★ 允许编辑
    canDeleteLeads: true,  // ★★★ 允许删除
    canManageFollowUps: true,
    canDeleteData: true,
    canViewAllData: true,
    canBatchImport: true   // OCR批量导入权限
  },
  [ROLES.SALES]: {
    // 销售权限 - 只能查看和编辑线索，不能新增
    canManageUsers: false,
    canManageSystem: false,
    canViewAnalytics: true,
    canManageLeads: true,
    canCreateLeads: false,  // 销售不能新增线索
    canEditLeads: true,     // ★★★ 修复：销售可编辑线索
    canDeleteLeads: false,
    canManageFollowUps: true,
    canDeleteData: false,
    canViewAllData: true,
    canBatchImport: true    // 销售可以使用批量导入，但只能给自己分配
  },
  [ROLES.SERVICE]: {
    // 客服权限 - 只可登记、删除客户，不能编辑，可看数据分析
    canManageUsers: false,
    canManageSystem: false,
    canViewAnalytics: true, // 可访问数据分析
    canManageLeads: true,  // 可访问客户管理
    canCreateLeads: true,  // 只允许登记
    canEditLeads: false,   // 不能编辑
    canDeleteLeads: true,  // 允许删除
    canManageFollowUps: false,
    canDeleteData: false,
    canViewAllData: false,
    canBatchImport: true   // 客服可以批量导入
  },
  [ROLES.USER]: {
    // 普通用户权限 - 无权限
    canManageUsers: false,
    canManageSystem: false,
    canViewAnalytics: false,
    canManageLeads: false,
    canCreateLeads: false,
    canManageFollowUps: false,
    canDeleteData: false,
    canViewAllData: false,
    canBatchImport: false   // 普通用户不能批量导入
  }
}

import { useUserStore } from '../store/user'

// 获取当前用户角色
export function getCurrentUserRole() {
  try {
    const userStore = useUserStore()
    const userInfo = userStore.userInfo || JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.role || ROLES.USER
  } catch (error) {
    console.error('获取用户角色失败:', error)
    return ROLES.USER
  }
}

// 检查用户是否有指定权限
export function hasPermission(permission) {
  const userRole = getCurrentUserRole()
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS[ROLES.USER]
  return permissions[permission] || false
}

// 检查用户是否有指定角色
export function hasRole(role) {
  const userRole = getCurrentUserRole()
  return userRole === role
}

// 检查用户是否有指定角色之一
export function hasAnyRole(roles) {
  const userRole = getCurrentUserRole()
  return roles.includes(userRole)
}

// 获取角色显示名称
export function getRoleDisplayName(role) {
  return ROLE_NAMES[role] || '未知角色'
}

// 获取当前用户角色显示名称
export function getCurrentUserRoleName() {
  const role = getCurrentUserRole()
  return getRoleDisplayName(role)
}