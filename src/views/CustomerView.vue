<template>
  <div class="customer-view">
    <!-- 调试输出已去除 -->
    <el-card>
      <div class="toolbar">
        <el-select v-model="filterIntentionLevel" placeholder="意向等级" clearable style="width:120px; margin-right:10px;">
          <el-option label="全部" value="" />
          <el-option label="高" value="高" />
          <el-option label="中" value="中" />
          <el-option label="低" value="低" />
        </el-select>
        <el-input
          v-model="filterCustomerNickname"
          placeholder="客户平台昵称"
          clearable
          style="width:180px; margin-right:10px;"
          @keyup.enter.native="onSearch"
        />
        <el-input
          v-model="filterContactName"
          placeholder="联系名称"
          clearable
          style="width:180px; margin-right:10px;"
          @keyup.enter.native="onSearch"
        />
        <el-button @click="onReset" style="margin-left:6px;">重置</el-button>
        <el-button 
          v-if="hasPermission('canCreateLeads')" 
          type="primary" 
          @click="showAdd = true" 
          style="float:right;"
        >
          新增线索
        </el-button>
        <el-button 
          type="success" 
          @click="showExport = true" 
          style="float:right; margin-right:10px;"
        >
          导出线索
        </el-button>
      </div>
      <el-table :data="list" style="width: 100%" v-loading="loading" :row-class-name="tableRowClassName">
        <el-table-column prop="customer_nickname" label="客户昵称">
          <template #default="scope">
            <span v-if="scope.row.enable_followup === 1" class="need-followup-icon">⚠️</span>
            <span :class="['customer-nickname', scope.row.enable_followup === 1 ? 'highlight' : '']">
              {{ scope.row.customer_nickname }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="source_platform" label="来源平台" />
        <el-table-column prop="source_account" label="来源账号" />
        <el-table-column prop="contact_account" label="联系方式" />
        <el-table-column prop="contact_name" label="联系名称">
          <template #default="scope">
            {{ scope.row.contact_name || '' }}
          </template>
        </el-table-column>
        <el-table-column prop="lead_time" label="线索时间" :formatter="dateFormatter" />
        <el-table-column prop="intention_level" label="意向等级" width="80">
          <template #default="scope">
            <span :class="['level-tag', scope.row.intention_level]">
              {{ scope.row.intention_level }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="跟进人" width="100">
          <template #default="scope">
            {{ scope.row.current_follower?.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="is_contacted" label="已联系" width="70">
          <template #default="scope">
            <span :class="['contact-tag', scope.row.is_contacted ? 'yes' : 'no']">
              {{ scope.row.is_contacted ? '是' : '否' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="is_deal" label="已成交" :formatter="yesNoFormatter" width="70" />
        <el-table-column label="跟进状态" width="120">
          <template #default="scope">
            <div class="followup-status-actions">
              <el-button 
                v-if="scope.row.enable_followup === 1"
                size="small" 
                type="warning" 
                plain
                @click="onDisableFollowUp(scope.row)"
              >
                禁用跟进
              </el-button>
              <el-button 
                v-else
                size="small" 
                type="success" 
                plain
                @click="onEnableFollowUp(scope.row)"
              >
                启用跟进
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="最新跟进时间" :formatter="latestFollowTimeFormatter" width="140" />
        <el-table-column label="最新跟进情况" :formatter="latestFollowContentFormatter" min-width="160">
          <template #default="scope">
            <span>{{ scope.row.latest_follow_up?.follow_up_content || '-' }}</span>
            <el-button size="small" type="primary" link style="margin-left:8px;vertical-align:middle;" @click="onShowFollowUpHistory(scope.row)">查看历史</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="scope">
            <div class="table-action-col" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <el-button v-if="hasPermission('canEditLeads')" size="small" class="edit-btn" style="width: 64px;" @click="onEditWithConfirm(scope.row)">更新</el-button>
              <el-button v-if="hasPermission('canDeleteLeads')" size="small" type="danger" style="width: 64px;" @click="onDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-bar">
        <div class="pagination-controls">
          <span class="page-size-label">每页显示：</span>
          <el-select v-model="pageSize" @change="onPageSizeChange" style="width: 80px">
            <el-option label="5" :value="5" />
            <el-option label="10" :value="10" />
            <el-option label="20" :value="20" />
            <el-option label="50" :value="50" />
            <el-option label="100" :value="100" />
          </el-select>
          <el-pagination
            background
            layout="prev, pager, next, jumper, ->, total"
            :total="total"
            :page-size="pageSize"
            :current-page="page"
            @current-change="onPageChange"
          />
        </div>
      </div>
    </el-card>
    <LeadForm v-if="hasPermission('canCreateLeads')" v-model:visible="showAdd" :isEdit="false" @submit="handleAdd" />
    <LeadForm v-if="hasPermission('canEditLeads')" v-model:visible="showEdit" :isEdit="true" :formData="editFormData" @submit="handleEdit" />
    <FollowUpForm v-model:visible="showFollowUp" :leadId="followUpLeadId" @submit="handleFollowUp" />
    <FollowUpHistory 
      v-model:visible="showFollowUpHistory" 
      :leadId="followUpHistoryLeadId" 
      :customerNickname="followUpHistoryCustomerNickname" 
      :contactAccount="followUpHistoryContactAccount" 
    />
    <FollowUpStatusDialog 
      v-model:visible="showFollowUpStatusDialog" 
      :leadId="followUpStatusLeadId" 
      :action="followUpCurrentStatus" 
      :customerNickname="followUpStatusCustomerNickname" 
      @success="handleFollowUpStatusChange" 
    />
    
    <!-- 导出线索对话框 -->
    <el-dialog v-model="showExport" title="导出线索" width="500px">
      <el-form :model="exportForm" label-width="100px">
        <el-form-item label="时间区间" required>
          <el-date-picker
            v-model="exportForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="意向等级">
          <el-select v-model="exportForm.intentionLevel" placeholder="全部" clearable style="width: 100%">
            <el-option label="全部" value="" />
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否成交">
          <el-select v-model="exportForm.isDeal" placeholder="全部" clearable style="width: 100%">
            <el-option label="全部" value="" />
            <el-option label="已成交" :value="1" />
            <el-option label="未成交" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否联系">
          <el-select v-model="exportForm.isContacted" placeholder="全部" clearable style="width: 100%">
            <el-option label="全部" value="" />
            <el-option label="已联系" :value="1" />
            <el-option label="未联系" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户昵称">
          <el-input v-model="exportForm.customerNickname" placeholder="输入客户昵称关键词" clearable />
        </el-form-item>
        <el-form-item label="联系名称">
          <el-input v-model="exportForm.contactName" placeholder="输入联系名称关键词" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showExport = false">取消</el-button>
          <el-button type="primary" @click="handleExport" :loading="exportLoading">
            确认导出
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getLeads, deleteLead, createLead, getLeadDetail, updateLead, exportLeads } from '../api/leads'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import LeadForm from '../components/LeadForm.vue'
import dayjs from 'dayjs'
import FollowUpForm from '../components/FollowUpForm.vue'
import { createFollowUp } from '../api/followups'
import FollowUpHistory from '../components/FollowUpHistory.vue'
import FollowUpStatusDialog from '../components/FollowUpStatusDialog.vue'
import debounce from 'lodash/debounce'
import { hasRole, hasPermission } from '../utils/permission'
import { useUserStore } from '../store/user'
import * as XLSX from 'xlsx'
const userStore = useUserStore()
console.log('userInfo:', userStore.userInfo)

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const showAdd = ref(false)
const showEdit = ref(false)
const editId = ref(null)
const editFormData = ref(null)
const showFollowUp = ref(false)
const followUpLeadId = ref(null)
const showFollowUpHistory = ref(false)
const followUpHistoryLeadId = ref(null)

// 在setup中增加两个ref用于存储当前查看历史的客户昵称和联系方式
const followUpHistoryCustomerNickname = ref('')
const followUpHistoryContactAccount = ref('')

// 跟进状态弹窗相关变量
const showFollowUpStatusDialog = ref(false)
const followUpStatusLeadId = ref(null)
const followUpCurrentStatus = ref(null)
const followUpStatusCustomerNickname = ref('')

// 导出相关变量
const showExport = ref(false)
const exportLoading = ref(false)
const exportForm = ref({
  dateRange: [],
  intentionLevel: '',
  isDeal: '',
  isContacted: '',
  customerNickname: '',
  contactName: ''
})

const filterIntentionLevel = ref('')
const filterCustomerNickname = ref('')
const filterContactName = ref('')

// 防抖搜索
const debouncedSearch = debounce(() => {
  page.value = 1
  fetchList()
}, 400)

watch(filterCustomerNickname, () => {
  debouncedSearch()
})
watch(filterIntentionLevel, () => {
  page.value = 1
  fetchList()
})

// 添加对filterContactName的监听
watch(filterContactName, () => {
  debouncedSearch()
})

function onSearch() {
  page.value = 1
  fetchList()
}
function onReset() {
  filterIntentionLevel.value = ''
  filterCustomerNickname.value = ''
  filterContactName.value = ''
  page.value = 1
  fetchList()
}

function fetchList() {
  loading.value = true
  getLeads({
    page: page.value,
    page_size: pageSize.value,
    intention_level: filterIntentionLevel.value,
    customer_nickname: filterCustomerNickname.value,
    contact_name: filterContactName.value,
    // ...其它筛选参数
  })
    .then(res => {
      list.value = res.list || []
      total.value = res.total || 0
      if (res.performance && process.env.NODE_ENV === 'development') {
        console.log('API性能信息:', res.performance)
      }
    })
    .catch(error => {
      ElMessage.error('获取线索列表失败：' + error.message)
    })
    .finally(() => {
      loading.value = false
    })
}

function onPageChange(val) {
  page.value = val
  fetchList()
}

function onPageSizeChange(val) {
  pageSize.value = val
  page.value = 1 // 切换每页显示条数时，重置到第一页
  fetchList()
}

function yesNoFormatter(row, column, cellValue) {
  return cellValue ? '是' : '否'
}

function dateFormatter(row, column, cellValue) {
  if (!cellValue) return ''
  // 只显示年月日
  return dayjs(cellValue).format('YYYY-MM-DD')
}

function latestFollowTimeFormatter(row) {
  const t = row.latest_follow_up?.follow_up_time
  return t ? dayjs(t).format('YYYY-MM-DD') : '-'
}
function latestFollowContentFormatter(row) {
  return row.latest_follow_up?.follow_up_content || '-'
}

function onAdd() {
  ElMessage.info('TODO: 新增线索')
}

function onEdit(row) {
  // 显示加载状态
  const loading = ElLoading.service({
    lock: true,
    text: '正在获取线索详情...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  // 获取详情并弹窗
  getLeadDetail(row.id)
    .then(res => {
      editFormData.value = res.data
      showEdit.value = true
      editId.value = row.id
    })
    .catch(error => {
      ElMessage.error('获取线索详情失败：' + error.message)
    })
    .finally(() => {
      loading.close()
    })
}

function onEditWithConfirm(row) {
  // 仅管理员需要二次确认
  if (hasRole('admin')) {
    const isSelf = row.current_follower && row.current_follower.id == userStore.userInfo.id
    if (!isSelf) {
      ElMessageBox.confirm(
        '该线索的当前跟进人不是您本人，确定要修改吗？',
        '操作确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        onEdit(row)
      }).catch(() => {})
      return
    }
  }
  onEdit(row)
}

function onDelete(row) {
  ElMessageBox.confirm('确定要删除该线索吗？', '提示', { type: 'warning' })
    .then(() => {
      // 立即显示加载状态
      const loading = ElLoading.service({
        lock: true,
        text: '正在删除...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      return deleteLead(row.id)
        .then((response) => {
          // 支持新的deletedFollowUps字段，同时保持向后兼容
          const message = response.deletedFollowUps > 0 
            ? `删除成功，清理了${response.deletedFollowUps}条跟进记录`
            : '删除成功'
          ElMessage.success(message)
          fetchList()
        })
        .catch((error) => {
          ElMessage.error('删除失败：' + (error?.message || '未知错误'))
          throw error // 重新抛出错误以便外层catch处理
        })
        .finally(() => {
          loading.close()
        })
    })
    .catch((error) => {
      // 用户取消时，error 是字符串 "cancel"
      if (error === 'cancel') {
        return; // 用户取消，不显示错误
      }
      // 其他错误已在内层处理，这里不需要再次显示
    })
}

function onFollowUp(row) {
  followUpLeadId.value = row.id
  showFollowUp.value = true
}

function onShowFollowUpHistory(row) {
  followUpHistoryLeadId.value = row.id
  followUpHistoryCustomerNickname.value = row.customer_nickname
  followUpHistoryContactAccount.value = row.contact_account
  showFollowUpHistory.value = true
}

function onEnableFollowUp(row) {
  followUpStatusLeadId.value = row.id
  followUpCurrentStatus.value = 'enable'
  followUpStatusCustomerNickname.value = row.customer_nickname
  showFollowUpStatusDialog.value = true
}

function onDisableFollowUp(row) {
  followUpStatusLeadId.value = row.id
  followUpCurrentStatus.value = 'disable'
  followUpStatusCustomerNickname.value = row.customer_nickname
  showFollowUpStatusDialog.value = true
}

function handleFollowUpStatusChange() {
  // 跟进状态变更成功后刷新列表
  fetchList()
}

async function handleFollowUp(data, resolve, reject) {
  try {
    await createFollowUp(data)
    ElMessage.success('跟进记录已更新')
    fetchList()
    resolve && resolve()
  } catch (e) {
    ElMessage.error('跟进失败：' + (e.message || '未知错误'))
    reject && reject(e)
  }
}

function handleAdd(data, resolve, reject) {
  // 权限检查
  if (!hasPermission('canCreateLeads')) {
    ElMessage.error('您没有新增线索的权限')
    reject && reject(new Error('权限不足'))
    return
  }
  
  createLead(data)
    .then((res) => {
      ElMessage.success('新增成功')
      fetchList()
      
      // 输出性能信息（开发环境）
      if (res.performance && process.env.NODE_ENV === 'development') {
        console.log('新增线索性能信息:', res.performance)
      }
      
      resolve && resolve(res)
    })
    .catch((error) => {
      ElMessage.error('新增失败：' + error.message)
      reject && reject(error)
    })
}

function handleEdit(data, resolve, reject) {
  updateLead(editId.value, data)
    .then(() => {
      ElMessage.success('编辑成功')
      fetchList()
      showEdit.value = false
      resolve && resolve()
    })
    .catch(error => {
      ElMessage.error('编辑失败：' + error.message)
      reject && reject(error)
    })
}

// 导出线索处理
function handleExport() {
  // 验证时间区间
  if (!exportForm.value.dateRange || exportForm.value.dateRange.length !== 2) {
    ElMessage.error('请选择时间区间')
    return
  }

  exportLoading.value = true
  
  // 构建导出参数
  const params = {
    date_from: exportForm.value.dateRange[0],
    date_to: exportForm.value.dateRange[1]
  }
  
  // 添加可选参数
  if (exportForm.value.intentionLevel) {
    params.intention_level = exportForm.value.intentionLevel
  }
  if (exportForm.value.isDeal !== '') {
    params.is_deal = exportForm.value.isDeal
  }
  if (exportForm.value.isContacted !== '') {
    params.is_contacted = exportForm.value.isContacted
  }
  if (exportForm.value.customerNickname) {
    params.customer_nickname = exportForm.value.customerNickname
  }
  if (exportForm.value.contactName) {
    params.contact_name = exportForm.value.contactName
  }

  exportLeads(params)
    .then(response => {
      // 处理API返回的数据
      const data = response.data
      
      // 定义Excel表头（中文）
      const headers = [
        'ID',
        '客户昵称',
        '来源平台',
        '来源账号',
        '联系方式',
        '联系名称',
        '线索时间',
        '是否联系',
        '意向等级',
        '跟进人',
        '是否成交',
        '成交日期',
        '创建时间',
        '更新时间',
        '需要跟进',
        '当前跟进人',
        '当前跟进人账号',
        '最新跟进时间',
        '最新跟进内容',
        '最新跟进方式',
        '最新跟进结果',
        '最新跟进人'
      ]
      
      // 转换数据格式
      const excelData = data.map(item => [
        item.id,
        item.customer_nickname,
        item.source_platform,
        item.source_account,
        item.contact_account,
        item.contact_name,
        item.lead_time,
        item.is_contacted,
        item.intention_level,
        item.follow_up_person,
        item.is_deal,
        item.deal_date,
        item.created_at,
        item.updated_at,
        item.enable_followup,
        item.current_follower,
        item.current_follower_username,
        item.latest_follow_up_time,
        item.latest_follow_up_content,
        item.latest_follow_up_method,
        item.latest_follow_up_result,
        item.latest_follow_up_person
      ])
      
      // 添加表头
      excelData.unshift(headers)
      
      // 创建工作簿
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(excelData)
      
      // 设置列宽
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 15 },  // 客户昵称
        { wch: 12 },  // 来源平台
        { wch: 15 },  // 来源账号
        { wch: 15 },  // 联系方式
        { wch: 12 },  // 联系名称
        { wch: 12 },  // 线索时间
        { wch: 8 },   // 是否联系
        { wch: 8 },   // 意向等级
        { wch: 12 },  // 跟进人
        { wch: 8 },   // 是否成交
        { wch: 12 },  // 成交日期
        { wch: 18 },  // 创建时间
        { wch: 18 },  // 更新时间
        { wch: 8 },   // 需要跟进
        { wch: 8 },   // 终结状态
        { wch: 15 },  // 终结原因
        { wch: 12 },  // 当前跟进人
        { wch: 15 },  // 当前跟进人账号
        { wch: 15 },  // 最新跟进时间
        { wch: 30 },  // 最新跟进内容
        { wch: 12 },  // 最新跟进方式
        { wch: 12 },  // 最新跟进结果
        { wch: 12 }   // 最新跟进人
      ]
      ws['!cols'] = colWidths
      
      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '客户线索')
      
      // 生成文件名
      const dateStr = dayjs().format('YYYY-MM-DD_HH-mm-ss')
      const dateRangeStr = `${exportForm.value.dateRange[0]}_${exportForm.value.dateRange[1]}`
      const fileName = `客户线索_${dateRangeStr}_${dateStr}.xlsx`
      
      // 导出文件
      XLSX.writeFile(wb, fileName)
      
      ElMessage.success('导出成功')
      showExport.value = false
      
      // 重置表单
      exportForm.value = {
        dateRange: [],
        intentionLevel: '',
        isDeal: '',
        isContacted: '',
        customerNickname: '',
        contactName: ''
      }
    })
    .catch(error => {
      ElMessage.error('导出失败：' + (error.message || '未知错误'))
    })
    .finally(() => {
      exportLoading.value = false
    })
}

function tableRowClassName({ row }) {
  if (row.enable_followup === 1) {
    return 'row-need-followup'
  }
  return ''
}

onMounted(fetchList)
</script>

<style scoped>
.customer-view {
  padding: 20px;
}
.toolbar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.pagination-bar {
  margin-top: 16px;
}
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.page-size-label {
  font-size: 14px;
  color: #606266;
}
.table-action-col .el-button + .el-button {
  margin-left: 0 !important;
}
.edit-btn {
  background: #e6f0ff !important;
  color: #409eff !important;
  border: 1px solid #b3d8ff !important;
  transition: background 0.2s;
}
.edit-btn:hover {
  background: #cce4ff !important;
  color: #409eff !important;
}
.level-tag {
  display: inline-block;
  min-width: 32px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 14px;
  text-align: center;
  font-weight: 600;
}
.level-tag.高 {
  background: #ffeaea;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}
.level-tag.中 {
  background: #fff7e6;
  color: #e6a23c;
  border: 1px solid #f3d19e;
}
.level-tag.低 {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #b3e19d;
}
.contact-tag {
  display: inline-block;
  min-width: 28px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 14px;
  text-align: center;
  font-weight: 600;
}
.contact-tag.yes {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #b3e19d;
}
.contact-tag.no {
  background: #ffeaea;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}
.row-need-followup {
  background: linear-gradient(90deg, #fff7e6 0%, #ffd6d6 100%) !important;
  border-left: 6px solid #ff5722 !important;
  box-shadow: 0 2px 8px rgba(255,87,34,0.08);
  position: relative;
}

.need-followup-icon {
  color: #ff5722;
  font-size: 18px;
  margin-right: 4px;
  vertical-align: middle;
}
.customer-nickname.highlight {
  color: #ff5722;
  font-weight: bold;
}
.followup-status-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40px;
}
.followup-status-actions .el-button {
  font-size: 12px;
  padding: 4px 8px;
  min-width: 70px;
}
:deep(.el-table .el-table__row) {
  height: 50px;
}
:deep(.el-table .el-table__row td) {
  vertical-align: middle;
}
</style>