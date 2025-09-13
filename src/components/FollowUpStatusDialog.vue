<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="followup-dialog followup-dialog-center"
  >
    <div v-if="action === 'enable'" class="enable-content">
      <div class="info-box">
        <el-icon class="info-icon"><InfoFilled /></el-icon>
        <div>
          <p><strong>{{ customerNickname }}</strong></p>
          <p class="desc">确定要启用该线索的跟进功能吗？</p>
          <p class="desc">启用后，该线索将参与定时跟进提醒检查。</p>
        </div>
      </div>
    </div>

    <div v-else-if="action === 'disable'" class="disable-content">
      <div class="info-box warning-box">
        <el-icon class="danger-icon"><WarningFilled /></el-icon>
        <div>
          <p><strong class="customer-name">{{ customerNickname }}</strong></p>
          <p class="warning-desc">确定要禁用该线索的跟进功能吗？</p>
          <p class="warning-desc">禁用后，该线索将不再参与定时跟进提醒检查。</p>
        </div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="disable-form">
        <el-form-item label="禁用原因" prop="end_followup_reason">
          <el-select 
            v-model="form.end_followup_reason" 
            placeholder="请选择禁用原因"
            style="width: 100%"
            clearable
            allow-create
            filterable
          >
            <el-option label="客户已成交" value="客户已成交" />
            <el-option label="客户流失" value="客户流失" />
            <el-option label="无效线索" value="无效线索" />
            <el-option label="客户已拉黑" value="客户已拉黑" />
            <el-option label="多轮回访未回复" value="多轮回访未回复" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="form.create_follow_up">创建跟进记录</el-checkbox>
        </el-form-item>

        <template v-if="form.create_follow_up">
          <el-form-item label="跟进方式" prop="follow_up_method">
            <el-select 
              v-model="form.follow_up_method" 
              placeholder="请选择跟进方式"
              style="width: 100%"
              clearable
              allow-create
              filterable
            >
              <el-option label="电话" value="电话" />
              <el-option label="微信" value="微信" />
              <el-option label="短信" value="短信" />
              <el-option label="邮件" value="邮件" />
              <el-option label="面谈" value="面谈" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>

          <el-form-item label="跟进内容" prop="follow_up_content">
            <el-input
              v-model="form.follow_up_content"
              type="textarea"
              :rows="3"
              placeholder="请输入跟进内容"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="跟进结果" prop="follow_up_result">
            <el-select 
              v-model="form.follow_up_result" 
              placeholder="请选择跟进结果"
              style="width: 100%"
              clearable
              allow-create
              filterable
            >
              <el-option label="终结跟进" value="终结跟进" />
              <el-option label="客户无回应" value="客户无回应" />
              <el-option label="客户拒绝" value="客户拒绝" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </template>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button 
          type="primary" 
          :loading="submitting"
          @click="onConfirm"
        >
          {{ action === 'enable' ? '启用跟进' : '禁用跟进' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, WarningFilled } from '@element-plus/icons-vue'
import { enableFollowUp, disableFollowUp } from '@/api/leads'
import dayjs from 'dayjs'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  leadId: {
    type: [Number, String],
    default: null
  },
  customerNickname: {
    type: String,
    default: ''
  },
  action: {
    type: String,
    default: 'enable', // 'enable' | 'disable'
    validator: (value) => ['enable', 'disable'].includes(value)
  }
})

const emits = defineEmits(['update:visible', 'success'])

const visible = computed({
  get: () => props.visible,
  set: (value) => emits('update:visible', value)
})

const dialogTitle = computed(() => {
  return props.action === 'enable' ? '启用跟进' : '禁用跟进'
})

const formRef = ref()
const submitting = ref(false)

const form = ref({
  end_followup_reason: '',
  create_follow_up: false,
  follow_up_method: '终结跟进',
  follow_up_content: '',
  follow_up_result: '终结跟进'
})

const rules = {
  end_followup_reason: [
    { required: true, message: '请选择禁用原因', trigger: 'change' }
  ],
  follow_up_content: [
    { 
      required: true, 
      message: '请输入跟进内容', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (form.value.create_follow_up && !value) {
          callback(new Error('创建跟进记录时必须填写跟进内容'))
        } else {
          callback()
        }
      }
    }
  ]
}

// 重置表单
const resetForm = () => {
  form.value = {
    end_followup_reason: '',
    create_follow_up: false,
    follow_up_method: '终结跟进',
    follow_up_content: '',
    follow_up_result: '终结跟进'
  }
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 监听弹窗显示状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

// 取消操作
const onCancel = () => {
  visible.value = false
}

// 确认操作
const onConfirm = async () => {
  if (props.action === 'enable') {
    await handleEnable()
  } else {
    await handleDisable()
  }
}

// 处理启用跟进
const handleEnable = async () => {
  try {
    submitting.value = true
    await enableFollowUp(props.leadId)
    ElMessage.success('跟进功能启用成功')
    visible.value = false
    emits('success')
  } catch (error) {
    ElMessage.error('启用失败：' + error.message)
  } finally {
    submitting.value = false
  }
}

// 处理禁用跟进
const handleDisable = async () => {
  try {
    // 验证表单
    if (formRef.value) {
      const valid = await formRef.value.validate()
      if (!valid) return
    }

    submitting.value = true
    
    const submitData = {
      end_followup_reason: form.value.end_followup_reason,
      create_follow_up: form.value.create_follow_up
    }

    if (form.value.create_follow_up) {
      submitData.follow_up_time = dayjs().format('YYYY-MM-DD HH:mm:ss')
      submitData.follow_up_method = form.value.follow_up_method
      submitData.follow_up_content = form.value.follow_up_content
      submitData.follow_up_result = form.value.follow_up_result
    }

    await disableFollowUp(props.leadId, submitData)
    ElMessage.success('跟进功能禁用成功')
    visible.value = false
    emits('success')
  } catch (error) {
    ElMessage.error('禁用失败：' + error.message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.info-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.warning-box {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-left: 4px solid #f56c6c;
}

.info-icon {
  color: #409eff;
  font-size: 20px;
  margin-top: 2px;
}

.warning-icon {
  color: #e6a23c;
  font-size: 20px;
  margin-top: 2px;
}

.danger-icon {
  color: #f56c6c;
  font-size: 22px;
  margin-top: 2px;
}

.desc {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.warning-desc {
  margin: 4px 0;
  color: #f56c6c;
  font-size: 14px;
  font-weight: 500;
}

.customer-name {
  color: #f56c6c;
  font-size: 16px;
}

.disable-form {
  margin-top: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.followup-dialog-center :deep(.el-overlay) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.followup-dialog-center :deep(.el-dialog) {
  margin: 0 !important;
  max-height: 90vh !important;
  overflow-y: auto !important;
  max-width: 95vw !important;
}
</style>