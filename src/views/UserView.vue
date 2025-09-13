<template>
  <div class="user-view">
    <el-card>
      <div class="toolbar">
        <el-button type="primary" @click="showAdd = true">新增用户</el-button>
      </div>
      
      <el-table :data="list" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="getRoleTagType(scope.row.role)">
              {{ getRoleDisplayName(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" @click="onEdit(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="onDelete(scope.row)"
              :disabled="scope.row.id === currentUserId"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑用户弹窗 -->
    <el-dialog 
      :title="isEdit ? '编辑用户' : '新增用户'" 
      v-model="showDialog" 
      width="500px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理" value="admin" />
            <el-option label="客服" value="service" />
            <el-option label="销售" value="sales" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="password" v-if="isEdit">
          <el-input v-model="form.password" type="password" placeholder="留空则不修改密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="onSubmit" :loading="submitting">
          {{ submitting ? '提交中...' : '确定' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getRoleDisplayName } from '../utils/permission'
import request from '../api/request'

const list = ref([])
const loading = ref(false)
const showDialog = ref(false)
const showAdd = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const editId = ref(null)
const currentUserId = ref(null)

const formRef = ref()
const form = ref({
  username: '',
  nickname: '',
  role: 'user',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur', validator: (rule, value, callback) => {
      if (!isEdit.value && !value) {
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    }}
  ]
}

// 获取用户列表
async function fetchList() {
  loading.value = true
  try {
    const res = await request.get('/users')
    list.value = res.data || []
  } catch (error) {
    ElMessage.error('获取用户列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 新增用户
function onAdd() {
  isEdit.value = false
  showDialog.value = true
  resetForm()
}

// 编辑用户
function onEdit(row) {
  isEdit.value = true
  editId.value = row.id
  form.value = {
    username: row.username,
    nickname: row.nickname,
    role: row.role,
    password: ''
  }
  showDialog.value = true
}

// 删除用户
function onDelete(row) {
  if (row.id === currentUserId.value) {
    ElMessage.warning('不能删除当前登录用户')
    return
  }
  
  ElMessageBox.confirm(`确定要删除用户 "${row.nickname}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/users/${row.id}`)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      ElMessage.error('删除失败：' + error.message)
    }
  })
}

// 提交表单
async function onSubmit() {
  try {
    const valid = await formRef.value.validate()
    if (valid) {
      submitting.value = true
      
      const submitData = { ...form.value }
      if (isEdit.value && !submitData.password) {
        delete submitData.password
      }
      
      if (isEdit.value) {
        await request.put(`/users/${editId.value}`, submitData)
        ElMessage.success('编辑成功')
      } else {
        // 新增用户使用注册接口
        await request.post('/users/register', submitData)
        ElMessage.success('新增成功')
      }
      
      showDialog.value = false
      fetchList()
    }
  } catch (error) {
    ElMessage.error((isEdit.value ? '编辑失败' : '新增失败') + '：' + error.message)
  } finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  form.value = {
    username: '',
    nickname: '',
    role: 'user',
    password: ''
  }
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 获取角色标签类型
function getRoleTagType(role) {
  const typeMap = {
    'admin': 'danger',
    'sales': 'warning',
    'service': 'info',
    'user': 'success'
  }
  return typeMap[role] || 'info'
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '-'
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss')
}

// 获取当前用户ID
function getCurrentUserId() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.id
  } catch (error) {
    return null
  }
}

onMounted(() => {
  currentUserId.value = getCurrentUserId()
  fetchList()
})

// 监听新增按钮点击
watch(showAdd, (val) => {
  if (val) {
    onAdd()
    showAdd.value = false
  }
})
</script>

<style scoped>
.user-view {
  padding: 20px;
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.el-tag {
  font-weight: 600;
}
</style> 