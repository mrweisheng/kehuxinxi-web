<template>
  <el-dialog :title="''" v-model="visible" width="760px" @close="onClose" class="followup-history-dialog">
    <template #title>
      <span class="dialog-title">历史跟进记录</span>
    </template>
    <div class="lead-info-card">
      <el-icon><UserFilled /></el-icon>
      <span class="nickname">{{ customerNickname || '-' }}</span>
      <span class="divider"></span>
      <el-icon><Phone /></el-icon>
      <span class="contact">{{ contactAccount || '-' }}</span>
    </div>
    <el-table :data="list" style="width:100%" v-loading="loading" stripe border class="history-table" :empty-text="'暂无历史跟进记录'">
      <el-table-column prop="follow_up_time" label="跟进时间" width="150">
        <template #default="scope">{{ scope.row.follow_up_time ? scope.row.follow_up_time.slice(0,16).replace('T',' ') : '-' }}</template>
      </el-table-column>
      <el-table-column prop="follow_up_method" label="方式" width="90" />
      <el-table-column prop="followUpPerson" label="跟进人" width="90">
        <template #default="scope">
          {{ scope.row.followUpPerson?.nickname || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="follow_up_content" label="内容" min-width="220">
        <template #default="scope">
          <div class="content-cell">{{ scope.row.follow_up_content }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="follow_up_result" label="结果" width="120" />
    </el-table>
    <div class="footer-btn-bar">
      <el-pagination
        background
        layout="prev, pager, next, jumper, ->, total"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @current-change="onPageChange"
        style="margin-right:16px;"
      />
      <el-button @click="onClose" type="primary">关闭</el-button>
    </div>
  </el-dialog>
</template>
<script setup>
import { ref, watch } from 'vue'
import { getFollowUpsByLeadId } from '../api/followups'
import { ElMessage } from 'element-plus'
import { UserFilled, Phone } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean,
  leadId: Number,
  customerNickname: String,
  contactAccount: String
})
const emits = defineEmits(['update:visible'])

const visible = ref(props.visible)
watch(() => props.visible, v => visible.value = v)
watch(visible, v => emits('update:visible', v))

const list = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(5)
const total = ref(0)

async function fetchHistory() {
  if (props.leadId && visible.value) {
    loading.value = true
    try {
      const res = await getFollowUpsByLeadId(props.leadId, page.value, pageSize.value)
      list.value = res.list || []
      total.value = res.total || 0
    } catch (e) {
      ElMessage.error('获取历史跟进记录失败：' + (e.message || '未知错误'))
    } finally {
      loading.value = false
    }
  }
}

watch([visible], ([v]) => {
  if (v) fetchHistory()
})

function onPageChange(val) {
  page.value = val
  fetchHistory()
}

function onClose() {
  visible.value = false
}
</script>
<style scoped>
.followup-history-dialog >>> .el-dialog {
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(76, 68, 182, 0.18);
}
.dialog-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  letter-spacing: 1px;
}
.lead-info-card {
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #f5f7fa 60%, #e0e7ff 100%);
  border-radius: 12px;
  padding: 14px 24px;
  margin-bottom: 18px;
  font-size: 16px;
  font-weight: 500;
  color: #444;
  box-shadow: 0 2px 8px rgba(64,158,255,0.08);
}
.lead-info-card .el-icon {
  color: #409eff;
  margin-right: 6px;
  font-size: 20px;
}
.lead-info-card .nickname, .lead-info-card .contact {
  font-weight: 600;
  color: #222;
}
.lead-info-card .divider {
  width: 1px;
  height: 20px;
  background: #e0e7ef;
  margin: 0 18px;
  border-radius: 1px;
}
.history-table {
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 18px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(64,158,255,0.04);
}
.history-table ::v-deep .el-table__header th {
  background: #f5f7fa;
  color: #333;
  font-weight: 600;
  font-size: 15px;
}
.history-table ::v-deep .el-table__body td {
  font-size: 14px;
  color: #444;
}
.content-cell {
  white-space: pre-line;
  word-break: break-all;
  line-height: 1.6;
}
.footer-btn-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 18px;
}
.footer-btn-bar .el-button {
  border-radius: 8px;
  min-width: 80px;
}
</style> 