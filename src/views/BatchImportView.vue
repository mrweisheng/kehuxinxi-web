<template>
  <div class="batch-import-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">OCR批量导入</h1>
      <p class="page-desc">上传客户截图，AI智能识别并自动导入线索数据</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 上传区域 -->
      <el-card class="upload-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Upload /></el-icon>
            <span>图片上传</span>
          </div>
        </template>
        
        <!-- 跟进人选择区域 -->
        <div v-if="showSalesSelector" class="sales-selector-section">
          <el-form :model="{ assigned_user_id: assignedUserId }" :rules="salesRules" ref="salesFormRef">
            <el-form-item label="分配销售" prop="assigned_user_id" :required="true">
              <el-select 
                v-model="assignedUserId" 
                placeholder="请选择销售" 
                filterable 
                clearable
                style="width: 100%"
              >
                <el-option 
                  v-for="item in salesList" 
                  :key="item.id" 
                  :label="item.nickname" 
                  :value="item.id" 
                />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 拖拽上传区域 -->
        <div 
          class="upload-area"
          :class="{ 'is-dragover': isDragOver, 'is-uploading': isUploading }"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @click="triggerFileInput"
        >
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/jpeg,image/jpg,image/png,image/gif"
            style="display: none"
            @change="handleFileSelect"
          >
          
          <div v-if="!isUploading" class="upload-content">
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">
              <p class="upload-title">点击或拖拽图片到此区域上传</p>
              <p class="upload-hint">支持 JPG、JPEG、PNG、GIF 格式，文件大小不超过 10MB</p>
            </div>
          </div>
          
          <div v-else class="uploading-content">
            <el-icon class="is-loading upload-loading"><Loading /></el-icon>
            <p class="uploading-text">正在上传并识别图片...</p>
          </div>
        </div>
      </el-card>


      

      <!-- 历史记录 -->
      <el-card class="history-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Clock /></el-icon>
            <span>历史记录</span>
            <el-button 
              type="primary" 
              size="small"
              @click="refreshHistory"
              :loading="historyLoading"
            >
              刷新
            </el-button>
          </div>
        </template>
        
        <!-- 筛选条件 -->
        <div class="history-filters">
          <el-select 
            v-model="historyFilter.status" 
            placeholder="任务状态" 
            clearable 
            style="width: 120px; margin-right: 10px;"
            @change="loadHistory"
          >
            <el-option label="全部" value="" />
            <el-option label="等待处理" value="pending" />
            <el-option label="正在处理" value="processing" />
            <el-option label="处理完成" value="completed" />
            <el-option label="处理失败" value="failed" />
          </el-select>
          
          <el-date-picker
            v-model="historyFilter.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="margin-right: 10px;"
            @change="loadHistory"
          />
        </div>
        
        <!-- 历史记录表格 -->
        <el-table 
          :data="historyList"
          v-loading="historyLoading"
          stripe
          size="small"
        >
          <el-table-column prop="lead_time" label="线索日期" width="120">
            <template #default="{ row }">
              {{ (row.lead_time || '').split(' ')[0] || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="task_status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="getStatusTagType(row.task_status)"
                size="small"
              >
                {{ formatTaskStatus(row.task_status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="customers_extracted" label="提取数" width="80" />
          <el-table-column prop="customers_imported" label="导入数" width="80" />
          <el-table-column prop="customers_duplicated" label="重复数" width="80" />
          <el-table-column prop="total_time_ms" label="耗时" width="100">
            <template #default="{ row }">
              {{ formatExecutionTime(row.total_time_ms) }}
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作人" width="100">
            <template #default="{ row }">
              <span v-if="row.operator_info && row.operator_info.nickname">{{ row.operator_info.nickname }}</span>
              <span v-else-if="row.operator_nickname">{{ row.operator_nickname }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button 
                type="text" 
                size="small"
                @click="viewTaskDetail(row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="historyPagination.page"
            v-model:page-size="historyPagination.limit"
            :page-sizes="[10, 20, 50, 100]"
            :total="historyPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadHistory"
            @current-change="loadHistory"
          />
        </div>
      </el-card>
    </div>

    <!-- 任务详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible"
      title="任务详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedTask" class="task-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="任务ID">{{ selectedTask.taskId }}</el-descriptions-item>
            <el-descriptions-item label="文件名">{{ selectedTask.fileName }}</el-descriptions-item>
            <el-descriptions-item label="任务状态">
              <el-tag :type="getStatusTagType(selectedTask.status)">
                {{ formatTaskStatus(selectedTask.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="线索日期">{{ selectedTask.lead_time || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- 统计信息 -->
        <div class="detail-section">
          <h4>统计信息</h4>
          <div class="detail-stats">
            <div class="detail-stat-item">
              <span class="label">提取总数:</span>
              <span class="value">{{ selectedTask.leadRegistration?.total || 0 }}</span>
            </div>
            <div class="detail-stat-item">
              <span class="label">导入成功:</span>
              <span class="value success">{{ selectedTask.leadRegistration?.success || 0 }}</span>
            </div>
            <div class="detail-stat-item">
              <span class="label">重复跳过:</span>
              <span class="value warning">{{ selectedTask.leadRegistration?.duplicated || 0 }}</span>
            </div>
            <div class="detail-stat-item">
              <span class="label">导入失败:</span>
              <span class="value danger">{{ selectedTask.leadRegistration?.failed || 0 }}</span>
            </div>
          </div>
        </div>
        
        <!-- 性能信息 -->
        <div class="detail-section">
          <h4>性能信息</h4>
          <div class="detail-stats">
            <div class="detail-stat-item">
              <span class="label">总耗时:</span>
              <span class="value">{{ selectedTask.performance?.totalTime || '-' }}</span>
            </div>
            <div class="detail-stat-item">
              <span class="label">API调用:</span>
              <span class="value">{{ selectedTask.performance?.apiCallTime || '-' }}</span>
            </div>
            <div class="detail-stat-item">
              <span class="label">图片转换:</span>
              <span class="value">{{ selectedTask.performance?.base64ConvertTime || '-' }}</span>
            </div>
          </div>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="selectedTask.error" class="detail-section">
          <h4>错误信息</h4>
          <el-alert 
            :title="selectedTask.error"
            type="error"
            :closable="false"
            show-icon
          />
        </div>
        
        <!-- 提取数据 -->
        <div v-if="selectedTask.result && selectedTask.result.length > 0" class="detail-section">
          <h4>提取数据</h4>
          <el-table 
            :data="selectedTask.result"
            stripe
            size="small"
            max-height="300"
          >
            <el-table-column prop="customer_name" label="客户名称" />
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Upload, 
  UploadFilled, 
  Loading, 
  Clock 
} from '@element-plus/icons-vue'
import {
  uploadImage,
  pollTaskStatus,
  getTaskStatus,
  getTaskRecords,
  validateImageFile,
  formatFileSize
} from '../api/ocr'
import request from '../api/request'
import { hasRole } from '../utils/permission'
import { useUserStore } from '../store/user'

// 响应式数据
const fileInput = ref(null)
const isDragOver = ref(false)
const isUploading = ref(false)
// 移除导入结果区域所需的本地状态
const historyLoading = ref(false)
const historyList = ref([])
const detailDialogVisible = ref(false)
const selectedTask = ref(null)

// 销售用户相关数据
const userStore = useUserStore()
const salesList = ref([])
const assignedUserId = ref(null)
const showSalesSelector = ref(false)
const salesFormRef = ref(null)

// 销售选择表单验证规则
const salesRules = {
  assigned_user_id: [
    { required: true, message: '请选择分配销售', trigger: 'change' }
  ]
}

// 历史记录筛选和分页
const historyFilter = reactive({
  status: '',
  dateRange: null
})

const historyPagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})



// 方法
function triggerFileInput() {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

function handleDragOver(e) {
  e.preventDefault()
  if (!isUploading.value) {
    isDragOver.value = true
  }
}

function handleDragLeave(e) {
  e.preventDefault()
  isDragOver.value = false
}

function handleDrop(e) {
  e.preventDefault()
  isDragOver.value = false
  
  if (isUploading.value) return
  
  const files = Array.from(e.dataTransfer.files)
  if (files.length > 0) {
    handleFileUpload(files[0])
  }
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files)
  if (files.length > 0) {
    handleFileUpload(files[0])
  }
  // 清空input值，允许重复选择同一文件
  e.target.value = ''
}

async function handleFileUpload(file) {
  // 验证文件
  const validation = validateImageFile(file)
  if (!validation.valid) {
    ElMessage.error(validation.message)
    return
  }
  
  // 权限检查：客服和管理员必须选择跟进人
  if (showSalesSelector.value) {
    try {
      await salesFormRef.value.validate()
    } catch (error) {
      ElMessage.error('请选择分配销售')
      return
    }
  }
  
  try {
    isUploading.value = true
    
    // 确定要传递的assigned_user_id
    let userIdToPass = null
    if (hasRole('sales')) {
      // 销售角色：使用当前用户ID或选择的用户ID
      userIdToPass = assignedUserId.value || userStore.userInfo.id
    } else if (hasRole('service') || hasRole('admin')) {
      // 客服和管理员：必须选择跟进人
      userIdToPass = assignedUserId.value
    }
    
    // 上传文件
    const response = await uploadImage(file, userIdToPass)
    console.log('上传响应:', response) // 调试日志
    
    // 兼容不同的后端返回格式
    // API文档格式: {success: true, data: {taskId, fileName, status}}
    // 实际返回格式: {success: true, taskId, message, ...}
    const taskId = response.data?.taskId || response.taskId
    const fileName = response.data?.fileName || response.fileName || file.name
    
    if (!taskId) {
      throw new Error('服务器返回的任务ID无效，请重试')
    }
    
    const taskData = { taskId, fileName }
    
    ElMessage.success(`图片上传成功！任务ID: ${taskData.taskId}`)
    
    // 刷新历史记录以显示新任务
    loadHistory()
    
    // 开始轮询任务状态（后台进行）
    pollTaskStatus(
      taskData.taskId,
      (progressData) => {
        // 轮询过程中刷新历史记录
        loadHistory()
      }
    ).then((finalResult) => {
      // 完成后刷新历史记录，由历史记录承载结果展示
      ElMessage.success('图片识别完成！')
      loadHistory()
    }).catch((error) => {
      ElMessage.error('任务处理失败: ' + (error.message || error))
      loadHistory()
    })
    
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error(error.message || '上传失败，请重试')
  } finally {
    isUploading.value = false
  }
}

// 移除 resetImport 与映射函数

function getStatusTagType(status) {
  switch (status) {
    case 'completed': return 'success'
    case 'failed': return 'danger'
    case 'processing': return 'warning'
    case 'pending': return 'info'
    default: return 'info'
  }
}

function formatTaskStatus(status) {
  switch (status) {
    case 'pending': return '等待处理'
    case 'processing': return '正在处理'
    case 'completed': return '处理完成'
    case 'failed': return '处理失败'
    default: return status || '未知状态'
  }
}

function formatExecutionTime(timeMs) {
  if (!timeMs || timeMs === 0) return '-'
  
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

async function loadHistory() {
  try {
    historyLoading.value = true
    
    const params = {
      page: historyPagination.page,
      limit: historyPagination.limit
    }
    
    if (historyFilter.status) {
      params.status = historyFilter.status
    }
    
    if (historyFilter.dateRange && historyFilter.dateRange.length === 2) {
      params.startDate = historyFilter.dateRange[0]
      params.endDate = historyFilter.dateRange[1]
    }
    
    const response = await getTaskRecords(params)
    const { data } = response
    
    // 根据API文档，直接使用返回的records数据
    const records = data.records || []
    historyList.value = records
    
    historyPagination.total = data.pagination?.total || 0
    
  } catch (error) {
    console.error('加载历史记录失败:', error)
    ElMessage.error('加载历史记录失败')
  } finally {
    historyLoading.value = false
  }
}

function refreshHistory() {
  historyPagination.page = 1
  loadHistory()
}

async function viewTaskDetail(task) {
  try {
    // 使用OCR任务状态接口查询详细信息
    const response = await getTaskStatus(task.task_id)
    selectedTask.value = response
    detailDialogVisible.value = true
  } catch (error) {
    console.error('查询任务详情失败:', error)
    ElMessage.error('查询任务详情失败')
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 数据映射函数：将API返回的数据结构映射到页面期望的格式
 

// 初始化销售列表和权限控制
async function initSalesData() {
  try {
    // 根据用户角色决定是否显示销售选择器
    if (hasRole('service') || hasRole('admin')) {
      showSalesSelector.value = true
      // 加载销售用户列表
      const res = await request.get('/users/sales')
      salesList.value = res.data || []
    } else if (hasRole('sales')) {
      // 销售角色不显示选择器，自动使用当前用户
      showSalesSelector.value = false
    }
  } catch (error) {
    console.error('获取销售列表失败:', error)
    ElMessage.error('获取销售列表失败')
  }
}

// 生命周期
onMounted(() => {
  loadHistory()
  initSalesData()
})
</script>

<style scoped>
.batch-import-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
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

.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-card,
.result-card,
.history-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.upload-card:hover,
.result-card:hover,
.history-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.status-tag {
  margin-left: auto;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-area.is-dragover {
  border-color: #409eff;
  background: #e6f7ff;
  transform: scale(1.02);
}

.upload-area.is-uploading {
  border-color: #409eff;
  background: #f0f9ff;
  cursor: not-allowed;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 48px;
  color: #409eff;
}

.upload-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.upload-hint {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.uploading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-loading {
  font-size: 32px;
  color: #409eff;
}

.uploading-text {
  font-size: 16px;
  color: #409eff;
  margin: 0;
}

.sales-selector-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.sales-selector-section :deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

.text-muted {
  color: #909399;
  font-style: italic;
}



.result-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  background: #f8f9fa;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-item.success {
  border-color: #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
}

.stat-item.total {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
}

.stat-item.duplicate {
  border-color: #e6a23c;
  background: linear-gradient(135deg, #fef9e7 0%, #fdf2d5 100%);
}

.stat-item.failed {
  border-color: #f56c6c;
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-item.success .stat-number {
  color: #67c23a;
}

.stat-item.total .stat-number {
  color: #409eff;
}

.stat-item.duplicate .stat-number {
  color: #e6a23c;
}

.stat-item.failed .stat-number {
  color: #f56c6c;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.result-details {
  margin-top: 24px;
}

.result-details h4 {
  margin-bottom: 16px;
  color: #303133;
}

.more-hint {
  margin-top: 12px;
  color: #909399;
  font-size: 14px;
  text-align: center;
}

.performance-info {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.performance-info h4 {
  margin-bottom: 16px;
  color: #303133;
}

.performance-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.performance-stats span {
  padding: 8px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 14px;
  color: #606266;
}

.history-filters {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.task-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin-bottom: 16px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-stat-item .label {
  font-weight: 500;
  color: #606266;
}

.detail-stat-item .value {
  font-weight: 600;
  color: #303133;
}

.detail-stat-item .value.success {
  color: #67c23a;
}

.detail-stat-item .value.warning {
  color: #e6a23c;
}

.detail-stat-item .value.danger {
  color: #f56c6c;
}

.error-details {
  margin-top: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  color: #606266;
  max-height: 200px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .batch-import-view {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .upload-area {
    padding: 30px 16px;
  }
  
  .upload-icon {
    font-size: 36px;
  }
  
  .upload-title {
    font-size: 16px;
  }
  
  .result-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .performance-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .history-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .detail-stats {
    grid-template-columns: 1fr;
  }
}
</style>