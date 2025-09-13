<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1 class="page-title">系统设置</h1>
      <p class="page-desc">配置跟进提醒周期、邮件收件人和平台账号管理</p>
    </div>

    <div class="settings-content">
      <!-- 跟进周期配置 -->
      <el-card class="config-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <el-icon><Timer /></el-icon>
              跟进周期配置
            </span>
            <span class="card-desc">设置各意向等级客户的最长跟进周期</span>
          </div>
        </template>
        
        <div class="level-configs">
          <div 
            v-for="level in levelConfigs" 
            :key="level.intention_level"
            class="level-config-item"
            :class="`level-${level.intention_level}`"
          >
            <div class="level-info">
              <div class="level-title">
                <span class="level-badge">{{ level.intention_level }}</span>
                <span class="level-name">{{ getLevelName(level.intention_level) }}</span>
              </div>
              <div class="level-desc">{{ getLevelDesc(level.intention_level) }}</div>
            </div>
            
            <div class="level-config">
              <div class="config-display" v-if="!level.editing">
                <span class="current-days">{{ level.interval_days }} 天</span>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="startEdit(level)"
                  :icon="Edit"
                >
                  修改
                </el-button>
              </div>
              
              <div class="config-edit" v-else>
                <el-input-number
                  v-model="level.tempDays"
                  :min="1"
                  :max="30"
                  size="small"
                  style="width: 120px"
                />
                <span class="unit">天</span>
                <el-button 
                  type="success" 
                  size="small" 
                  @click="saveConfig(level)"
                  :loading="level.saving"
                  :icon="Check"
                >
                  保存
                </el-button>
                <el-button 
                  size="small" 
                  @click="cancelEdit(level)"
                  :icon="Close"
                >
                  取消
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 邮件收件人管理 -->
      <el-card class="email-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <span class="card-title">
                <el-icon><Message /></el-icon>
                邮件提醒收件人
              </span>
              <span class="card-desc">配置超期提醒邮件的接收人员</span>
            </div>
            <el-button 
              type="primary" 
              @click="showAddEmailDialog"
              :icon="Plus"
            >
              新增收件人
            </el-button>
          </div>
        </template>
        
        <el-table 
          :data="emailList" 
          v-loading="emailLoading"
          stripe
          border
          class="email-table"
          :empty-text="'暂无收件人，请点击上方按钮添加'"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="email" label="邮箱地址" min-width="200">
            <template #default="scope">
              <div class="email-cell">
                <el-icon><Message /></el-icon>
                <span>{{ scope.row.email }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button 
                type="danger" 
                size="small" 
                @click="deleteEmail(scope.row)"
                :icon="Delete"
                :loading="scope.row.deleting"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 平台账号管理 -->
      <el-card class="platform-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <span class="card-title">
                <el-icon><Platform /></el-icon>
                平台账号管理
              </span>
              <span class="card-desc">管理线索来源的平台和账号信息</span>
            </div>
            <div class="header-actions">
              <el-button 
                type="success" 
                @click="showAddPlatformDialog"
                :icon="Plus"
              >
                新增平台
              </el-button>
              <el-button 
                type="primary" 
                @click="showAddAccountDialog"
                :icon="Plus"
              >
                新增账号
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="platform-content">
          <el-tabs v-model="activePlatform" @tab-click="handlePlatformTabClick">
            <el-tab-pane 
              v-for="platform in platformList" 
              :key="platform"
              :label="platform"
              :name="platform"
            >
              <div class="platform-accounts">
                <div class="accounts-header">
                  <h4>{{ platform }} 账号列表</h4>
                  <span class="account-count">{{ getAccountCount(platform) }} 个账号</span>
                </div>
                
                <el-table 
                  :data="getAccountsForPlatform(platform)" 
                  stripe
                  border
                  class="accounts-table"
                  :empty-text="`暂无${platform}账号，请点击上方按钮添加`"
                >
                  <el-table-column prop="id" label="ID" width="80" />
                  <el-table-column prop="account" label="账号名称" min-width="150">
                    <template #default="scope">
                      <div class="account-cell">
                        <el-icon><User /></el-icon>
                        <span>{{ scope.row.account }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="description" label="描述" min-width="200" />
                  <el-table-column label="操作" width="120" fixed="right">
                    <template #default="scope">
                      <el-button 
                        type="danger" 
                        size="small" 
                        @click="deleteAccountItem(scope.row)"
                        :icon="Delete"
                        :loading="scope.row.deleting"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
    </div>

    <!-- 新增收件人弹窗 -->
    <el-dialog 
      v-model="addEmailVisible" 
      title="新增收件人" 
      width="420px"
      @close="resetAddEmailForm"
    >
      <el-form :model="addEmailForm" :rules="addEmailRules" ref="addEmailFormRef" label-width="80px">
        <el-form-item label="邮箱地址" prop="email">
          <el-input 
            v-model="addEmailForm.email" 
            placeholder="请输入邮箱地址"
            clearable
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="addEmailVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitAddEmail"
          :loading="addEmailSubmitting"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 新增平台弹窗 -->
    <el-dialog 
      v-model="addPlatformVisible" 
      title="新增平台" 
      width="420px"
      @close="resetAddPlatformForm"
    >
      <el-form :model="addPlatformForm" :rules="addPlatformRules" ref="addPlatformFormRef" label-width="80px">
        <el-form-item label="平台名称" prop="platform">
          <el-input 
            v-model="addPlatformForm.platform" 
            placeholder="请输入平台名称，如：小红书"
            clearable
          />
        </el-form-item>
        <el-form-item label="平台描述" prop="description">
          <el-input 
            v-model="addPlatformForm.description" 
            placeholder="请输入平台描述"
            clearable
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="addPlatformVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitAddPlatform"
          :loading="addPlatformSubmitting"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 新增账号弹窗 -->
    <el-dialog 
      v-model="addAccountVisible" 
      title="新增账号" 
      width="420px"
      @close="resetAddAccountForm"
    >
      <el-form :model="addAccountForm" :rules="addAccountRules" ref="addAccountFormRef" label-width="80px">
        <el-form-item label="选择平台" prop="platform">
          <el-select 
            v-model="addAccountForm.platform" 
            placeholder="请选择平台"
            style="width: 100%"
            clearable
          >
            <el-option 
              v-for="platform in platformList" 
              :key="platform" 
              :label="platform" 
              :value="platform" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账号名称" prop="account">
          <el-input 
            v-model="addAccountForm.account" 
            placeholder="请输入账号名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="账号描述" prop="description">
          <el-input 
            v-model="addAccountForm.description" 
            placeholder="请输入账号描述"
            clearable
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="addAccountVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitAddAccount"
          :loading="addAccountSubmitting"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { 
  Timer, 
  Message, 
  Edit, 
  Check, 
  Close, 
  Plus, 
  Delete,
  Platform,
  User
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getFollowupRemindConfig,
  updateFollowupRemindConfig,
  getRemindEmailList,
  addRemindEmail,
  deleteRemindEmail,
  getPlatforms,
  getAccountsByPlatform,
  addPlatform,
  addAccount,
  deleteAccount
} from '../api/settings'

import { getLeadSources } from '../api/leads'

// 跟进周期配置
const levelConfigs = ref([])
const configLoading = ref(false)

// 邮件收件人管理
const emailList = ref([])
const emailLoading = ref(false)

// 平台账号管理
const platformList = ref([])
const activePlatform = ref('')
const leadSourcesData = ref({})

// 新增收件人
const addEmailVisible = ref(false)
const addEmailFormRef = ref()
const addEmailForm = ref({ email: '' })
const addEmailSubmitting = ref(false)

// 新增平台
const addPlatformVisible = ref(false)
const addPlatformFormRef = ref()
const addPlatformForm = ref({ platform: '', description: '' })
const addPlatformSubmitting = ref(false)

// 新增账号
const addAccountVisible = ref(false)
const addAccountFormRef = ref()
const addAccountForm = ref({ platform: '', account: '', description: '' })
const addAccountSubmitting = ref(false)

const addEmailRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const addPlatformRules = {
  platform: [
    { required: true, message: '请输入平台名称', trigger: 'blur' }
  ]
}

const addAccountRules = {
  platform: [
    { required: true, message: '请选择平台', trigger: 'change' }
  ],
  account: [
    { required: true, message: '请输入账号名称', trigger: 'blur' }
  ]
}

// 获取等级名称
const getLevelName = (level) => {
  const names = {
    '高': '高意向客户',
    '中': '中意向客户', 
    '低': '低意向客户'
  }
  return names[level] || level
}

// 获取等级描述
const getLevelDesc = (level) => {
  const descs = {
    '高': '高价值客户，需要及时跟进',
    '中': '中等价值客户，定期跟进即可',
    '低': '低价值客户，可适当延长跟进周期'
  }
  return descs[level] || ''
}

// 开始编辑配置
const startEdit = (level) => {
  level.editing = true
  level.tempDays = level.interval_days
}

// 保存配置
const saveConfig = async (level) => {
  if (level.saving) return
  
  try {
    level.saving = true
    await updateFollowupRemindConfig(level.intention_level, level.tempDays)
    level.interval_days = level.tempDays
    level.editing = false
    ElMessage.success('配置更新成功')
  } catch (error) {
    ElMessage.error('配置更新失败：' + (error.message || '未知错误'))
  } finally {
    level.saving = false
  }
}

// 取消编辑
const cancelEdit = (level) => {
  level.editing = false
  level.tempDays = level.interval_days
}

// 显示新增收件人弹窗
const showAddEmailDialog = () => {
  addEmailVisible.value = true
}

// 显示新增平台弹窗
const showAddPlatformDialog = () => {
  addPlatformVisible.value = true
}

// 显示新增账号弹窗
const showAddAccountDialog = () => {
  addAccountVisible.value = true
}

// 重置新增表单
const resetAddEmailForm = () => {
  addEmailForm.value.email = ''
  if (addEmailFormRef.value) {
    addEmailFormRef.value.clearValidate()
  }
}

// 重置新增平台表单
const resetAddPlatformForm = () => {
  addPlatformForm.value.platform = ''
  addPlatformForm.value.description = ''
  if (addPlatformFormRef.value) {
    addPlatformFormRef.value.clearValidate()
  }
}

// 重置新增账号表单
const resetAddAccountForm = () => {
  addAccountForm.value.platform = ''
  addAccountForm.value.account = ''
  addAccountForm.value.description = ''
  if (addAccountFormRef.value) {
    addAccountFormRef.value.clearValidate()
  }
}

// 提交新增收件人
const submitAddEmail = async () => {
  if (addEmailSubmitting.value) return
  
  try {
    await addEmailFormRef.value.validate()
    addEmailSubmitting.value = true
    
    await addRemindEmail(addEmailForm.value.email)
    ElMessage.success('收件人添加成功')
    addEmailVisible.value = false
    fetchEmailList() // 重新获取列表
  } catch (error) {
    if (error.message) {
      ElMessage.error('添加失败：' + error.message)
    }
  } finally {
    addEmailSubmitting.value = false
  }
}

// 提交新增平台
const submitAddPlatform = async () => {
  if (addPlatformSubmitting.value) return
  
  try {
    await addPlatformFormRef.value.validate()
    addPlatformSubmitting.value = true
    
    await addPlatform(addPlatformForm.value.platform, addPlatformForm.value.description)
    ElMessage.success('平台添加成功')
    addPlatformVisible.value = false
    fetchPlatformList() // 重新获取平台列表
  } catch (error) {
    if (error.message) {
      ElMessage.error('添加失败：' + error.message)
    }
  } finally {
    addPlatformSubmitting.value = false
  }
}

// 提交新增账号
const submitAddAccount = async () => {
  if (addAccountSubmitting.value) return
  
  try {
    await addAccountFormRef.value.validate()
    addAccountSubmitting.value = true
    
    await addAccount(addAccountForm.value.platform, addAccountForm.value.account, addAccountForm.value.description)
    ElMessage.success('账号添加成功')
    addAccountVisible.value = false
    fetchLeadSources() // 重新获取所有平台账号数据
  } catch (error) {
    if (error.message) {
      ElMessage.error('添加失败：' + error.message)
    }
  } finally {
    addAccountSubmitting.value = false
  }
}

// 删除收件人
const deleteEmail = async (row) => {
  if (row.deleting) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除收件人 "${row.email}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    row.deleting = true
    await deleteRemindEmail(row.id)
    ElMessage.success('删除成功')
    fetchEmailList() // 重新获取列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  } finally {
    row.deleting = false
  }
}

// 删除账号
const deleteAccountItem = async (row) => {
  if (row.deleting) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除账号 "${row.account}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    row.deleting = true
    await deleteAccount(row.id)
    ElMessage.success('删除成功')
    fetchLeadSources() // 重新获取所有平台账号数据
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  } finally {
    row.deleting = false
  }
}

// 获取跟进配置
const fetchConfig = async () => {
  configLoading.value = true
  try {
    const res = await getFollowupRemindConfig()
    levelConfigs.value = res.list.map(item => ({
      ...item,
      editing: false,
      tempDays: item.interval_days,
      saving: false
    }))
  } catch (error) {
    ElMessage.error('获取配置失败：' + (error.message || '未知错误'))
  } finally {
    configLoading.value = false
  }
}

// 获取邮件列表
const fetchEmailList = async () => {
  emailLoading.value = true
  try {
    const res = await getRemindEmailList()
    emailList.value = res.list.map(item => ({
      ...item,
      deleting: false
    }))
  } catch (error) {
    ElMessage.error('获取收件人列表失败：' + (error.message || '未知错误'))
  } finally {
    emailLoading.value = false
  }
}

// 获取平台列表
const fetchPlatformList = async () => {
  try {
    const res = await getPlatforms()
    platformList.value = res.data || []
    if (platformList.value.length > 0) {
      activePlatform.value = platformList.value[0]
      fetchLeadSources() // 获取所有平台账号数据
    }
  } catch (error) {
    ElMessage.error('获取平台列表失败：' + (error.message || '未知错误'))
  }
}

// 获取所有平台账号数据
const fetchLeadSources = async () => {
  try {
    const res = await getLeadSources()
    leadSourcesData.value = res.data || {}
  } catch (error) {
    ElMessage.error('获取平台账号数据失败：' + (error.message || '未知错误'))
  }
}

// 处理平台标签点击
const handlePlatformTabClick = () => {
  fetchLeadSources()
}

// 获取账号数量
const getAccountCount = (platform) => {
  return leadSourcesData.value[platform]?.length || 0
}

// 获取平台账号列表
const getAccountsForPlatform = (platform) => {
  return leadSourcesData.value[platform] || []
}

// 页面初始化
onMounted(() => {
  fetchConfig()
  fetchEmailList()
  fetchPlatformList()
})
</script>

<style scoped>
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.settings-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-desc {
  color: #ffffff;
  font-size: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-card,
.email-card,
.platform-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.config-card:hover,
.email-card:hover,
.platform-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.card-desc {
  font-size: 14px;
  color: #4a5568;
}

.level-configs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.level-config-item {
  padding: 20px;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.level-config-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.level-config-item.level-高 {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.level-config-item.level-中 {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.level-config-item.level-低 {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.level-info {
  margin-bottom: 16px;
}

.level-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.level-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.level-高 .level-badge {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.level-中 .level-badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.level-低 .level-badge {
  background: linear-gradient(135deg, #10b981, #059669);
}

.level-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.level-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.level-config {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-days {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.config-edit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit {
  font-size: 14px;
  color: #64748b;
}

.email-table,
.accounts-table {
  border-radius: 8px;
  overflow: hidden;
}

.email-cell,
.account-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
}

.email-cell .el-icon,
.account-cell .el-icon {
  color: #667eea;
}

.platform-content {
  padding: 20px;
}

.platform-accounts {
  margin-top: 20px;
}

.accounts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.accounts-header h4 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.account-count {
  font-size: 14px;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 12px;
}

.accounts-table {
  border-radius: 8px;
  overflow: hidden;
}

.account-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
}

.account-cell .el-icon {
  color: #667eea;
}

/* 平台标签页样式 */
:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
}

:deep(.el-tabs__item.is-active) {
  color: #667eea;
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  background-color: #667eea;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .level-configs {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .level-config {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .config-display,
  .config-edit {
    width: 100%;
    justify-content: space-between;
  }
  
  .platform-content {
    padding: 16px;
  }
  
  .accounts-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .accounts-header h4 {
    font-size: 16px;
  }
}
</style> 