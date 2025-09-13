import { createRouter, createWebHistory } from 'vue-router'
import CustomerView from '../views/CustomerView.vue'
import RecordView from '../views/RecordView.vue'
import AnalysisView from '../views/AnalysisView.vue'
import SettingView from '../views/SettingView.vue'
import UserView from '../views/UserView.vue'
import LoginView from '../views/LoginView.vue'
import BatchImportView from '../views/BatchImportView.vue'
import { hasPermission, hasRole, ROLES } from '../utils/permission'

const routes = [
  {
    path: '/',
    redirect: '/customer'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/customer',
    name: 'customer',
    component: CustomerView,
    meta: { requiresAuth: true, requiresPermission: 'canManageLeads' }
  },
  {
    path: '/record',
    name: 'record',
    component: RecordView,
    meta: { requiresAuth: true, requiresPermission: 'canManageFollowUps' }
  },
  {
    path: '/analysis',
    name: 'analysis',
    component: AnalysisView,
    meta: { requiresAuth: true, requiresPermission: 'canViewAnalytics' }
  },
  {
    path: '/setting',
    name: 'setting',
    component: SettingView,
    meta: { requiresAuth: true, requiresPermission: 'canManageSystem' }
  },
  {
    path: '/batch-import',
    name: 'batch-import',
    component: BatchImportView,
    meta: { requiresAuth: true, requiresPermission: 'canBatchImport' }
  },
  {
    path: '/user',
    name: 'user',
    component: UserView,
    meta: { requiresAuth: true, requiresRole: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory('/customerSystem/'), // 适配子路径部署
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // 如果访问登录页，直接放行
  if (to.path === '/login') {
    next()
    return
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    if (!token) {
      // 未登录，跳转到登录页
      next('/login')
      return
    }
    
    // 销售角色特殊限制：不能新增线索
    if (hasRole('sales') && to.path === '/customer') {
      // 销售角色访问客户管理页面时，只允许查看和编辑，不允许新增
      // 这里不需要特殊处理，因为新增功能在组件层面已经隐藏
      next()
      return
    }
    
    // 检查角色权限
    if (to.meta.requiresRole) {
      if (!hasRole(to.meta.requiresRole)) {
        // 角色权限不足，跳转到有权限的页面
        if (hasRole('admin')) {
          next('/user')
        } else if (hasPermission('canManageLeads')) {
          next('/customer')
        } else if (hasPermission('canManageFollowUps')) {
          next('/record')
        } else {
          // 没有任何权限，跳转到登录页
          next('/login')
        }
        return
      }
    }
    
    // 检查功能权限
    if (to.meta.requiresPermission) {
      if (!hasPermission(to.meta.requiresPermission)) {
        // 权限不足，跳转到有权限的页面
        if (hasRole('admin')) {
          next('/user')
        } else if (hasPermission('canManageLeads')) {
          next('/customer')
        } else if (hasPermission('canManageFollowUps')) {
          next('/record')
        } else {
          // 没有任何权限，跳转到登录页
          next('/login')
        }
        return
      }
    }
  }
  
  // 所有检查通过，允许访问
  next()
})

export default router