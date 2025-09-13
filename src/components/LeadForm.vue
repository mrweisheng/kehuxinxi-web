<template>
  <el-dialog :title="isEdit ? '编辑线索' : '新增线索'" v-model="visible" @close="onClose" class="lead-dialog lead-dialog-center">
    <div v-loading="loading && isEdit" element-loading-text="正在加载线索详情..." element-loading-background="rgba(255, 255, 255, 0.8)">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="130px" label-position="right" class="lead-form lead-form-grid">
      <el-row :gutter="20">
        <el-col :span="12" :xs="24" style="min-width:320px">
          <el-form-item prop="customer_nickname">
            <template #label>
              <span class="icon-label"><span class="icon-emoji">👤</span><span>客户昵称</span></span>
            </template>
            <el-input v-model="form.customer_nickname" placeholder="请输入客户平台昵称" clearable :disabled="isEdit" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :xs="24" style="min-width:320px">
          <el-form-item prop="source_platform">
            <template #label>
              <span class="icon-label"><span class="icon-emoji">🌐</span><span>来源平台</span></span>
            </template>
            <el-select v-model="form.source_platform" placeholder="请选择来源平台" :disabled="isEdit && !hasRole('admin')">
              <el-option 
                v-for="platform in platformOptions" 
                :key="platform" 
                :label="platform" 
                :value="platform" 
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :xs="24" style="min-width:320px">
          <el-form-item prop="source_account">
            <template #label>
              <span class="icon-label"><span class="icon-emoji">🆔</span><span>来源账号</span></span>
            </template>
            <el-select v-model="form.source_account" placeholder="请选择来源账号" :disabled="isEdit && !hasRole('admin')">
              <el-option 
                v-for="account in filteredAccountOptions" 
                :key="account" 
                :label="account" 
                :value="account" 
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :xs="24" style="min-width:320px">
          <el-form-item prop="contact_account">
            <template #label>
              <span class="icon-label"><span class="icon-emoji">📱</span><span>联系方式</span></span>
            </template>
            <el-input v-model="form.contact_account" placeholder="请输入联系方式" clearable :disabled="isEdit" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :xs="24" style="min-width:320px">
          <el-form-item prop="contact_name">
            <template #label>
              <span class="icon-label"><span class="icon-emoji">📇</span><span>联系名称</span></span>
            </template>
            <el-input v-model="form.contact_name" placeholder="联系客户时的称呼备注（仅跟进人可编辑）" clearable :disabled="!isEdit" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :xs="24" style="min-width:320px">
          <el-form-item prop="lead_time">
            <template #label>
              <span class="icon-label"><span class="icon-emoji">⏰</span><span>线索时间</span></span>
            </template>
            <el-date-picker
              v-model="form.lead_time"
              type="date"
              value-format="YYYY-MM-DD"
              style="width:100%"
              placeholder="请选择线索日期"
              :disabled="isEdit"
              @change="onDateChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :xs="24" style="min-width:320px">
          <el-form-item prop="intention_level">
            <template #label>
              <span class="icon-label"><span class="icon-emoji">⭐</span><span>意向等级</span></span>
            </template>
            <el-select v-model="form.intention_level" placeholder="请选择" :disabled="!isEdit ? false : false">
              <el-option label="高" value="高" />
              <el-option label="中" value="中" />
              <el-option label="低" value="低" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :xs="24" style="min-width:320px">
          <el-form-item prop="is_contacted">
            <template #label>
              <span class="icon-label"><span class="icon-emoji">📞</span><span>已联系</span></span>
            </template>
            <el-switch v-model="form.is_contacted" :active-value="1" :inactive-value="0" :disabled="!isEdit" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :xs="24" style="min-width:320px">
          <el-form-item prop="is_deal">
            <template #label>
              <span class="icon-label"><span class="icon-emoji">✅</span><span>已成交</span></span>
            </template>
            <el-switch v-model="form.is_deal" :active-value="1" :inactive-value="0" :disabled="!isEdit" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :xs="24" style="min-width:320px">
          <el-form-item prop="deal_date">
            <template #label>
              <span class="icon-label"><span class="icon-emoji">📅</span><span>成交日期</span></span>
            </template>
            <el-date-picker v-model="form.deal_date" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width:100%" :disabled="!isEdit || !form.is_deal" placeholder="请选择成交日期" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :xs="24" style="min-width:320px">
          <el-form-item prop="follow_up_content">
            <template #label>
              <div style="display: flex; flex-direction: column; align-items: flex-start;">
                <span class="icon-label"><span class="icon-emoji">📝</span><span>跟进情况</span></span>
                <el-switch v-if="isEdit" v-model="followUpEditable" active-text="允许编辑" style="margin-top: 2px;" />
              </div>
            </template>
            <el-input
              v-model="form.follow_up_content"
              type="textarea"
              :rows="3"
              placeholder="请输入首次跟进内容"
              maxlength="500"
              show-word-limit
              :disabled="isEdit && !followUpEditable"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="isEdit && followUpEditable" :span="12" :xs="24" style="min-width:320px">
          <el-form-item label="跟进方式" prop="follow_up_method">
            <el-select v-model="form.follow_up_method" placeholder="请选择方式">
              <el-option label="微信" value="微信" />
              <el-option label="电话" value="电话" />
              <el-option label="WhatsApp" value="WhatsApp" />
              <el-option label="线下" value="线下" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="isEdit && followUpEditable" :span="12" :xs="24" style="min-width:320px">
          <el-form-item label="跟进结果" prop="follow_up_result">
            <el-select 
              v-model="form.follow_up_result" 
              placeholder="请选择或输入跟进结果" 
              clearable 
              allow-create 
              filterable
              style="width: 100%"
            >
              <el-option label="继续跟进" value="继续跟进" />
              <el-option label="加强联系" value="加强联系" />
              <el-option label="终结" value="终结" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col v-if="!isEdit" :span="12" :xs="24" style="min-width:320px">
          <el-form-item prop="current_follower">
            <template #label>
              <span class="icon-label"><span class="icon-emoji">👨‍💼</span><span>分配销售</span></span>
            </template>
            <el-select v-model="form.current_follower" placeholder="请选择销售" filterable clearable>
              <el-option v-for="item in salesList" :key="item.id" :label="item.nickname" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    </div>
    <template #footer>
      <el-button @click="onClose" class="btn-cancel" :disabled="submitting || loading">取消</el-button>
      <el-button 
        type="primary" 
        @click="onSubmit" 
        class="btn-confirm"
        :loading="submitting"
        :disabled="submitting || loading"
      >
        <el-icon v-if="submitting" class="is-loading"><Loading /></el-icon>
        {{ submitting ? '提交中...' : '确定' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, defineExpose, computed, onMounted } from 'vue'
import { User, Platform, Avatar, Phone, Timer, Star, Message, UserFilled, Finished, Calendar, Loading } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import request from '../api/request'
import { hasPermission, hasRole } from '../utils/permission'
import { getLeadSources } from '../api/leads'

const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  formData: Object
})
const emits = defineEmits(['update:visible', 'submit'])

const visible = ref(props.visible)
const submitting = ref(false) // 提交状态
const followUpEditable = ref(false)
const loading = ref(false) // 编辑模式下的加载状态

// 用于跟踪来源信息是否被修改（仅管理员编辑时使用）
const originalSourceInfo = ref({
  source_platform: '',
  source_account: ''
})

watch(() => props.visible, v => visible.value = v)
watch(visible, v => emits('update:visible', v))

const formRef = ref()
// 销售列表
const salesList = ref([])

// 线索来源数据
const leadSources = ref({})
const platformOptions = ref([])
const accountOptions = ref([])

// 根据选择的平台筛选账号选项
const filteredAccountOptions = computed(() => {
  if (!form.value.source_platform || form.value.source_platform === '未知') {
    return accountOptions.value
  }
  
  const platformAccounts = leadSources.value[form.value.source_platform] || []
  const accountNames = platformAccounts.map(account => account.account)
  
  // 编辑模式下，如果当前账号是"未知"，确保它出现在选项中
  const options = [...accountNames, '未知']
  
  // 如果是编辑模式且当前账号不在选项中，添加它
  if (props.isEdit && form.value.source_account && !options.includes(form.value.source_account)) {
    options.push(form.value.source_account)
  }
  
  return options
})

// 在组件挂载时检查权限
onMounted(async () => {
  // 仅新增时加载销售列表
  if (!props.isEdit) {
    try {
      const res = await request.get('/users/sales')
      salesList.value = res.data || []
    } catch (e) {
      ElMessage.error('获取销售列表失败')
    }
  }
  
  // 加载线索来源数据
  try {
    const sourcesRes = await getLeadSources()
    if (sourcesRes.success) {
      leadSources.value = sourcesRes.data || {}
      
      // 生成平台选项（包含"未知"选项）
      platformOptions.value = [
        ...Object.keys(leadSources.value),
        '未知'
      ]
      
      // 生成账号选项（包含"未知"选项）
      const allAccounts = []
      Object.values(leadSources.value).forEach(accounts => {
        accounts.forEach(account => {
          allAccounts.push(account.account)
        })
      })
      accountOptions.value = [
        ...allAccounts,
        '未知'
      ]
    }
  } catch (e) {
    console.error('获取线索来源失败:', e)
    // 如果获取失败，使用默认选项
    platformOptions.value = ['抖音', '视频号', '未知']
    accountOptions.value = ['香港华星两地牌', '明哥两地牌', '明哥中港两地牌', '未知']
  }
})

const form = ref({
  customer_nickname: '',
  source_platform: '',
  source_account: '',
  contact_account: '',
  contact_name: '', // 新增字段
  lead_time: dayjs().format('YYYY-MM-DD'), // 新增时默认为当前日期
  intention_level: '低', // 新增时默认意向等级为"低"
  is_contacted: 0,
  is_deal: 0,
  deal_date: '',
  follow_up_content: '',
  follow_up_method: '',
  follow_up_result: '',
  current_follower: '' // 新增客服id
})

const dateOnly = ref(form.value.lead_time ? form.value.lead_time.slice(0, 10) : '')
watch(() => form.value.lead_time, v => {
  dateOnly.value = v ? v.slice(0, 10) : ''
})
// onDateChange 只在新增时生效，编辑时不允许更改lead_time
function onDateChange(val) {
  if (!props.isEdit && val) {
    const now = dayjs()
    form.value.lead_time = dayjs(val + ' ' + now.format('HH:mm:ss')).format('YYYY-MM-DD HH:mm:ss')
  } else if (!val) {
    form.value.lead_time = ''
  }
}

// 重置表单数据
const resetForm = () => {
  form.value = {
    customer_nickname: '',
    source_platform: '',
    source_account: '',
    contact_account: '',
    contact_name: '', // 新增字段
    lead_time: dayjs().format('YYYY-MM-DD'), // 新增时默认为当前日期
    intention_level: '低', // 新增时默认意向等级为"低"
    is_contacted: 0,
    is_deal: 0,
    deal_date: '',
    follow_up_content: '',
    follow_up_method: '',
    follow_up_result: '',
    current_follower: '' // 新增客服id
  }
  // 清除表单验证状态
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

watch(() => props.formData, v => {
  if (v) {
    // 编辑模式下显示加载状态
    if (props.isEdit) {
      loading.value = true
      // 延迟一下让用户看到加载效果
      setTimeout(() => {
        Object.assign(form.value, v)
        // 保存原始来源信息用于比较
        originalSourceInfo.value = {
          source_platform: v.source_platform || '',
          source_account: v.source_account || ''
        }
        // 编辑时自动填充最新跟进内容
        if (props.isEdit && v.latest_follow_up && v.latest_follow_up.follow_up_content) {
          form.value.follow_up_content = v.latest_follow_up.follow_up_content
        }
        if (props.isEdit) followUpEditable.value = false
        loading.value = false
      }, 300)
    } else {
      Object.assign(form.value, v)
    }
  } else {
    resetForm()
    loading.value = false
  }
})

// 新增时强制contact_name为空
watch(() => props.isEdit, v => {
  if (!v) form.value.contact_name = ''
})

// 监听平台变化，自动调整账号选择
watch(() => form.value.source_platform, (newPlatform) => {
  // 编辑模式下不进行自动调整，保持原有数据
  if (props.isEdit) {
    return
  }
  
  if (newPlatform && newPlatform !== '未知') {
    const platformAccounts = leadSources.value[newPlatform] || []
    const accountNames = platformAccounts.map(account => account.account)
    
    // 如果当前选择的账号不在新平台的账号列表中，且不是"未知"，则清空选择
    if (form.value.source_account && 
        form.value.source_account !== '未知' && 
        !accountNames.includes(form.value.source_account)) {
      form.value.source_account = ''
    }
  }
})



const rules = {
  customer_nickname: [{ required: true, message: '请输入客户平台昵称', trigger: 'blur' }],
  source_platform: [{ required: true, message: '请选择来源平台', trigger: 'change' }],
  source_account: [
    { 
      required: true, 
      message: '请选择来源账号', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        // 允许"未知"作为有效的来源账号
        if (!value || value === '未知') {
          callback()
        } else {
          callback()
        }
      }
    }
  ],
  contact_account: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  contact_name: [
    { 
      required: props.isEdit, 
      message: '请输入联系名称', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (props.isEdit && !value) {
          callback(new Error('编辑时必须填写联系名称'))
        } else {
          callback()
        }
      }
    }
  ],
  lead_time: [{ required: true, message: '请选择线索时间', trigger: 'change' }],
  intention_level: [{ required: true, message: '请选择意向等级', trigger: 'change' }],
  follow_up_content: [{ required: true, message: '请输入首次跟进情况', trigger: 'blur' }],
  // 新增线索时分配销售必填
  current_follower: [
    { required: !props.isEdit, message: '请选择分配销售', trigger: 'change' }
  ]
}

function onClose() {
  if (!submitting.value && !loading.value) {
    visible.value = false
    resetForm()
  }
}

async function onSubmit() {
  // 防止重复提交
  if (submitting.value) {
    return
  }

  // 权限检查
  if (!props.isEdit && !hasPermission('canCreateLeads')) {
    ElMessage.error('您没有新增线索的权限')
    return
  }

  try {
    const valid = await formRef.value.validate()
    if (valid) {
      // 检查管理员是否修改了来源信息
      if (props.isEdit && hasRole('admin')) {
        const sourceChanged = 
          form.value.source_platform !== originalSourceInfo.value.source_platform ||
          form.value.source_account !== originalSourceInfo.value.source_account
        
        if (sourceChanged) {
          try {
            await ElMessageBox.confirm(
              '您修改了线索的来源信息（来源平台或来源账号），确定要保存这些修改吗？',
              '确认修改来源信息',
              {
                confirmButtonText: '确定修改',
                cancelButtonText: '取消',
                type: 'warning',
                customClass: 'source-change-confirm'
              }
            )
          } catch {
            // 用户取消，不继续提交
            return
          }
        }
      }
      
      submitting.value = true
      let submitData = { ...form.value }
      // 修正lead_time格式，始终为'YYYY-MM-DD HH:mm:ss'字符串
      if (submitData.lead_time) {
        submitData.lead_time = dayjs(submitData.lead_time).format('YYYY-MM-DD HH:mm:ss')
      }
      // 新增线索始终create_follow_up: true
      if (!props.isEdit) {
        submitData.create_follow_up = true
      }
      // 编辑线索时，只有允许编辑跟进才传相关字段
      if (props.isEdit) {
        // 删除禁止编辑的字段，确保不会传递到后端
        delete submitData.follow_up_person
        delete submitData.creator_user_id
        delete submitData.current_follower
        delete submitData.assigned_user_id
        
        if (followUpEditable.value) {
          submitData.create_follow_up = true
          // 保证为本地时间字符串
          submitData.follow_up_time = dayjs().format('YYYY-MM-DD HH:mm:ss')
        } else {
          submitData.create_follow_up = false
          // 清除跟进相关字段，防止误传
          delete submitData.follow_up_method
          delete submitData.follow_up_result
          delete submitData.follow_up_time
          delete submitData.follow_up_content
        }
      }
      await new Promise((resolve, reject) => {
        emits('submit', submitData, resolve, reject)
      })
      visible.value = false
      resetForm()
    }
  } catch (error) {
    console.error('提交失败:', error)
    // 提交失败时不关闭弹窗，让用户修改后重试
  } finally {
    submitting.value = false
  }
}

defineExpose({ form, onClose, resetForm })
</script>

<style scoped>
.lead-dialog :deep(.el-dialog) {
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(76, 68, 182, 0.18);
  background: linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%);
}
.lead-dialog-center :deep(.el-overlay) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.lead-dialog-center :deep(.el-dialog) {
  /* 保持默认定位，不要设置 position: static 和 transform: none */
  margin: 0 !important;
  max-height: 90vh !important;
  overflow-y: auto !important;
  width: 900px !important;
  max-width: 95vw !important;
}
.lead-form {
  padding-top: 8px;
}
.lead-form-grid :deep(.el-form-item) {
  display: flex !important;
  align-items: center !important;
  min-height: 56px;
  margin-bottom: 0;
}
.lead-form-grid :deep(.el-form-item__label) {
  display: flex !important;
  align-items: center !important;
  height: 100%;
}
.lead-form-grid :deep(.el-form-item__content) {
  position: relative;
}
.lead-form-grid :deep(.el-form-item__error) {
  position: absolute;
  bottom: -18px;
  left: 0;
  font-size: 12px;
  color: #f56c6c;
  white-space: nowrap;
}
.lead-form-grid :deep(.el-form-item__label) {
  height: 32px;
  line-height: 32px;
  display: flex;
  align-items: center;
}
.icon-label {
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  font-size: 15px;
  color: #5a5e6b;
  gap: 6px;
  white-space: nowrap;
  min-width: 0;
  max-width: 100%;
  justify-content: flex-start;
}
.icon-emoji {
  font-size: 18px;
  height: 18px;
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lead-form :deep(.el-input__wrapper),
.lead-form :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  background: #fff;
}
.lead-form :deep(.el-date-editor) {
  width: 100%;
}
.btn-cancel {
  background: #f5f7fa;
  color: #888;
  border-radius: 6px;
  border: none;
}
.btn-confirm {
  border-radius: 6px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .is-loading {
    animation: rotate 1s linear infinite;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 终结跟进确认对话框样式 */
:deep(.end-followup-confirm) {
  .el-message-box__header {
    background: linear-gradient(135deg, #ff5722, #ff7043);
    color: white;
  }
  
  .el-message-box__title {
    color: white;
    font-weight: 600;
  }
  
  .el-message-box__content {
    padding: 20px;
    font-size: 16px;
    line-height: 1.6;
  }
  
  .el-button--primary {
    background: #ff5722;
    border-color: #ff5722;
  }
  
  .el-button--primary:hover {
    background: #f4511e;
    border-color: #f4511e;
  }
}

/* 来源信息修改确认对话框样式 */
:deep(.source-change-confirm) {
  .el-message-box__header {
    background: linear-gradient(135deg, #f39c12, #e67e22);
    color: white;
  }
  
  .el-message-box__title {
    color: white;
    font-weight: 600;
  }
  
  .el-message-box__content {
    padding: 20px;
    font-size: 16px;
    line-height: 1.6;
  }
  
  .el-button--primary {
    background: #f39c12;
    border-color: #f39c12;
  }
  
  .el-button--primary:hover {
    background: #e67e22;
    border-color: #e67e22;
  }
}
</style>