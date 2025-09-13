<template>
  <el-dialog :title="'新增跟进记录'" v-model="visible" width="420px" @close="onClose">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
      <el-form-item label="跟进内容" prop="follow_up_content">
        <el-input v-model="form.follow_up_content" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="请输入跟进内容" />
      </el-form-item>
      <el-form-item label="跟进方式" prop="follow_up_method">
        <el-select v-model="form.follow_up_method" placeholder="请选择方式">
          <el-option label="微信" value="微信" />
          <el-option label="电话" value="电话" />
          <el-option label="WhatsApp" value="WhatsApp" />
          <el-option label="线下" value="线下" />
        </el-select>
      </el-form-item>
      <el-form-item label="跟进时间" prop="follow_up_time">
        <el-date-picker v-model="form.follow_up_time" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" style="width:100%" />
      </el-form-item>
      <el-form-item label="跟进人" prop="follow_up_person">
        <el-input v-model="form.follow_up_person" placeholder="请输入跟进人" />
      </el-form-item>
      <el-form-item label="跟进结果" prop="follow_up_result">
        <el-input v-model="form.follow_up_result" placeholder="请输入跟进结果" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, defineExpose } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  visible: Boolean,
  leadId: Number
})
const emits = defineEmits(['update:visible', 'submit'])

const visible = ref(props.visible)
watch(() => props.visible, v => visible.value = v)
watch(visible, v => emits('update:visible', v))

const formRef = ref()
const form = ref({
  follow_up_content: '',
  follow_up_method: '',
  follow_up_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  follow_up_person: '盛威',
  follow_up_result: '',
})

watch(() => props.leadId, v => {
  // 重置表单时带上lead_id
  form.value = {
    follow_up_content: '',
    follow_up_method: '',
    follow_up_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    follow_up_person: '盛威',
    follow_up_result: '',
    lead_id: v
  }
})

const rules = {
  follow_up_content: [{ required: true, message: '请输入跟进内容', trigger: 'blur' }],
  follow_up_method: [{ required: true, message: '请选择方式', trigger: 'change' }],
  follow_up_time: [{ required: true, message: '请选择时间', trigger: 'change' }],
  follow_up_person: [{ required: true, message: '请输入跟进人', trigger: 'blur' }],
}

const submitting = ref(false)
function onClose() {
  if (!submitting.value) visible.value = false
}
async function onSubmit() {
  if (submitting.value) return
  try {
    await formRef.value.validate()
    submitting.value = true
    emits('submit', { ...form.value }, () => {
      visible.value = false
      submitting.value = false
    }, () => {
      submitting.value = false
    })
  } catch (e) {
    submitting.value = false
  }
}
defineExpose({ form, onClose })
</script> 