<template>
  <el-container class="app-container">
    <!-- 侧边栏 - 只在非登录页面显示 -->
    <el-aside v-if="!isLoginPage" class="app-aside" width="220px">
      <div class="aside-header">
        <h1 class="app-title">客户信息管理系统</h1>
      </div>
      <el-menu
        class="el-menu-vertical-demo"
        :default-active="activeMenu"
        router
        background-color="transparent"
        text-color="#303133"
        active-text-color="#409eff"
      >
        <!-- 客户管理 - 管理、销售可访问 -->
        <el-menu-item v-if="hasPermission('canManageLeads')" index="customer">
          <el-icon><User /></el-icon>
          <span>客户管理</span>
        </el-menu-item>
        
        <!-- 信息记录 - 管理、销售、客服可访问 -->
        <el-menu-item v-if="hasPermission('canManageFollowUps')" index="record">
          <el-icon><Document /></el-icon>
          <span>信息记录</span>
        </el-menu-item>
        
        <!-- 数据分析 - 管理、销售可访问 -->
        <el-menu-item v-if="hasPermission('canViewAnalytics')" index="analysis">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
        
        <!-- 批量导入 - 管理、客服可访问 -->
        <el-menu-item v-if="hasPermission('canBatchImport')" index="batch-import">
          <el-icon><Upload /></el-icon>
          <span>批量导入</span>
        </el-menu-item>
        
        <!-- 系统设置 - 仅管理可访问 -->
        <el-menu-item v-if="hasPermission('canManageSystem')" index="setting">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
        
        <!-- 用户管理 - 仅管理角色可访问 -->
        <el-menu-item v-if="hasRole('admin')" index="user">
          <el-icon><UserFilled /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <!-- 头部 - 只在非登录页面显示 -->
      <el-header v-if="!isLoginPage" class="app-header">
        <div class="header-content">
          <div class="header-left">
            <!-- 可放置操作按钮或用户信息 -->
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-icon><Avatar /></el-icon>
                <span>{{ userInfo.nickname || userInfo.username || '用户' }}</span>
                <el-tag size="small" type="info" style="margin-left: 8px;">
                  {{ getCurrentUserRoleName() }}
                </el-tag>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { User, Document, DataAnalysis, Setting, Avatar, ArrowDown, UserFilled, Upload } from '@element-plus/icons-vue'
import { getCurrentUserRoleName, hasPermission, hasRole, ROLES } from './utils/permission'
import { useUserStore } from './store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

// 判断是否为登录页面
const isLoginPage = computed(() => {
  return route.path === '/login'
})

const activeMenu = computed(() => {
  const path = route.path.replace('/', '')
  return path || 'customer'
})

function handleCommand(command) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 清除用户信息
      userStore.clearUserInfo()
      // 跳转到登录页
      router.push('/login')
    }).catch(() => {
      // 用户取消
    })
  }
}

onMounted(() => {
  // 获取用户信息
  // const userInfoStr = localStorage.getItem('userInfo')
  // if (userInfoStr) {
  //   userInfo.value = JSON.parse(userInfoStr)
  // }
})
</script>

<style scoped>
.app-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-aside {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 2px 0 8px 0 rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 24px;
  min-height: 100vh;
  border-right: 1px solid var(--border-color);
  z-index: 2;
}

.aside-header {
  margin-bottom: 32px;
}

.app-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #409eff, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin: 0;
}

.el-menu-vertical-demo {
  width: 100%;
  border-right: none;
  background: transparent;
}

.el-menu-vertical-demo .el-menu-item {
  height: 56px;
  font-size: 16px;
  border-radius: 0 24px 24px 0;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.el-menu-vertical-demo .el-menu-item .el-icon {
  margin-right: 12px;
  font-size: 22px;
}

.el-menu-vertical-demo .el-menu-item:hover,
.el-menu-vertical-demo .el-menu-item.is-active {
  background: linear-gradient(90deg, #e0e7ff 0%, #f3e8ff 100%);
  color: #409eff;
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #dcdfe6;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.3s;
  color: #333;
  font-size: 14px;
}

.user-info:hover {
  background-color: rgba(64, 158, 255, 0.1);
}

.user-info .el-icon {
  font-size: 16px;
}

.app-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 登录页面时的特殊处理 */
.app-container:has(.login-container) {
  background: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    padding: 0 15px;
  }
  
  .app-main {
    padding: 15px;
  }
  
  .app-aside {
    width: 200px !important;
  }
}
</style>