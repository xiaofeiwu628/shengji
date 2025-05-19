<template>
  <div class="header-container">
    <div class="logo-area">
      <router-link to="/home" class="logo-link">
        <el-icon class="platform-icon"><Monitor /></el-icon>
        <span class="platform-title">智能中台建模平台</span>
      </router-link>
    </div>
    <div class="user-area">
      <el-dropdown trigger="click">
        <div class="user-dropdown">
          <el-avatar :size="32" class="user-avatar">
            {{ userName.substring(0, 1).toUpperCase() }}
          </el-avatar>
          <span class="user-name">{{ userName }}</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="custom-dropdown">
            <el-dropdown-item>
              <el-button
                type="danger"
                plain
                @click="openLogoffDialog"
                class="delete-btn"
              >
                <el-icon><Delete /></el-icon>删除账号
              </el-button>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-button
                type="warning"
                plain
                @click="showLogoutConfirm"
                class="logout-btn"
              >
                <el-icon><SwitchButton /></el-icon>退出系统
              </el-button>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 删除账号确认窗口 -->
    <el-dialog
      v-model="logoffConfirmView"
      title="账号删除"
      width="360px"
      center
      class="logoff-dialog"
      :show-close="false"
      :modal-append-to-body="false"
    >
      <div class="logoff-header">
        <el-icon class="danger-icon"><WarningFilled /></el-icon>
        <h3>警告：此操作不可逆</h3>
      </div>
      <p class="warning-text">删除账号将永久删除用户全部信息和数据！</p>
      <el-form :model="logoffForm" :rules="rules" ref="logoffFormRef" class="logoff-form">
        <el-form-item prop="Username">
          <el-input
            v-model="logoffForm.Username"
            class="custom-input"
            placeholder="请输入用户名"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="Password">
          <el-input
            v-model="logoffForm.Password"
            class="custom-input"
            type="password"
            placeholder="请输入密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="logoffConfirmView = false" class="cancel-btn">取消</el-button>
          <el-button @click="showFinalConfirm" type="danger" class="confirm-btn">确认删除</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 退出登录确认对话框 -->
    <el-dialog
      v-model="logoutConfirmView"
      title="系统提示"
      width="300px"
      center
      class="logout-dialog"
      :show-close="false"
      :modal-append-to-body="false"
    >
      <div class="logout-content">
        <el-icon class="warning-icon"><Warning /></el-icon>
        <span>确认退出登录吗？</span>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="logout" type="primary">确认</el-button>
          <el-button @click="logoutConfirmView = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 最终确认删除提示框 -->
    <el-dialog
      v-model="finalConfirmView"
      title="最终确认"
      width="340px"
      center
      class="final-confirm-dialog"
      :show-close="false"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
    >
      <div class="final-confirm-content">
        <el-icon class="danger-icon"><WarningFilled /></el-icon>
        <p class="confirm-warning-text">为防止误操作，请输入"确认删除"以验证</p>
        <el-input
          v-model="confirmText"
          placeholder="请输入：确认删除"
          class="confirm-input"
        />
        <div class="input-hint" :class="{ 'correct': confirmText === '确认删除' }">
          {{ confirmText === '确认删除' ? '输入正确' : '请输入完整的\"确认删除\"四个字' }}
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelFinalConfirm" class="cancel-btn">返回</el-button>
          <el-button
            @click="executeLogoff"
            type="danger"
            class="confirm-btn"
            :disabled="confirmText !== '确认删除'"
          >删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>

import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import request from "@/utils/request"


const router = useRouter()

const userName = ref(localStorage.getItem("Username") || "")// 从本地存储获取用户名

const logoffConfirmView = ref(false)// 删除账号确认窗口
const logoutConfirmView = ref(false)// 退出登录确认窗口
const finalConfirmView = ref(false) // 最终确认删除提示框
const confirmText = ref("") // 确认删除文本框内容

interface LogoffForm {  // 定义注销账号表单的类型
  Username: string
  Password: string
}
const logoffForm = reactive<LogoffForm>({   // 定义注销账号表单
  Username: "",
  Password: ""
})

const logoffFormRef = ref<FormInstance>()

const rules: FormRules = {// 定义表单验证规则
  Username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  Password: [{ required: true, message: "请输入密码", trigger: "blur" }]
}

function toLogin() {// 跳转到登录页面
  router.push({ path: '/login' })
}

function openLogoffDialog() {// 打开注销账号对话框
  logoffForm.Username = ""
  logoffForm.Password = ""
  logoffConfirmView.value = true
}

function showLogoutConfirm() {// 显示退出登录确认对话框
  logoutConfirmView.value = true
}

function logout() {// 退出登录
  request.post("/UserLogin/Logout", {
    Token: localStorage.getItem("Token")
  }, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res: any) => {
    if (res.code === '0') {
      ElMessage({
        type: "success",
        message: '登出成功！',
        offset: 60,
      })
      toLogin()
    } else {
      ElMessage({
        type: "error",
        message: res.msg,
        offset: 60,
      })
    }
  })
}

function showFinalConfirm() {// 显示最终确认删除提示框
  logoffFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      finalConfirmView.value = true
      confirmText.value = ''
    }
  })
}

function cancelFinalConfirm() {// 取消最终确认删除提示框
  finalConfirmView.value = false
}

function executeLogoff() {// 执行注销账号操作
  if (confirmText.value === '确认删除') {
    request.post("/UserLogin/Logoff", {// 注销账号请求
      Username: logoffForm.Username,
      Password: logoffForm.Password,
      Token: localStorage.getItem("Token")
    }, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res: any) => {
      if (res.code === '0') {
        ElMessage({
          type: "success",
          message: '当前用户已注销！',
          offset: 60,
        })
        finalConfirmView.value = false
        logoffConfirmView.value = false
        toLogin()
      } else {
        ElMessage({
          type: "error",
          message: res.msg,
          offset: 60,
          customClass: 'messageIndex'
        })
      }
    })
  }
}
</script>

<style scoped>
/* 添加新的样式 */
.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  cursor: pointer;
}
.header-container {
  height: 60px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: linear-gradient(to right, #234d7a, #4c75a3); /* 与DataScreen一致的颜色 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.platform-icon {
  font-size: 24px;
  color: #ffffff;
}

.platform-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  letter-spacing: 1px;
  position: relative;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 为标题添加下划线动画效果 */
.platform-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #ffffff;
  transition: width 0.3s ease;
}

.platform-title:hover::after {
  width: 100%;
}

.user-area {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.user-dropdown:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  background-color: #1a2942;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.user-name {
  color: white;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  color: white;
  transition: transform 0.3s;
}

.user-dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

.custom-dropdown {
  min-width: 140px;
}

.delete-btn, .logout-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  justify-content: flex-start;
}

.delete-btn {
  color: #F56C6C;
}

.logout-btn {
  color: #E6A23C;
}

/* 对话框样式 */
:deep(.custom-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #1a2942;
  font-weight: 600;
}

.warning-text {
  font-size: 14px;
  text-align: center;
  color: #F56C6C;
  margin-bottom: 20px;
  font-weight: 500;
}

.hint-text {
  font-size: 14px;
  text-align: center;
  color: #606266;
  margin-top: 15px;
}

.custom-input {
  width: 100%;
}

.confirm-btn, .cancel-btn {
  min-width: 80px;
}

/* 添加一些科技感元素 */
.header-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.7), transparent);
}
/* 添加退出确认对话框样式 */
.logout-dialog {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.logout-dialog .el-dialog__header) {
  padding: 15px;
  background-color: #f5f7fa;
  margin-right: 0;
  border-bottom: 1px solid #e4e7ed;
}

.logout-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px 0;
}

.warning-icon {
  font-size: 20px;
  color: #E6A23C;
}

.dialog-footer {
  text-align: center;
  padding-top: 10px;
}

:deep(.el-dialog__body) {
  padding-bottom: 10px;
}
/* 删除账号弹窗样式 */
.logoff-dialog {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.logoff-dialog .el-dialog__header) {
  padding: 15px;
  background-color: #fef0f0;
  margin-right: 0;
  border-bottom: 1px solid #fde2e2;
}

:deep(.logoff-dialog .el-dialog__title) {
  color: #f56c6c;
  font-weight: 600;
}

.logoff-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px 0 5px;
}

.danger-icon {
  font-size: 40px;
  color: #F56C6C;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.logoff-header h3 {
  color: #F56C6C;
  margin: 0;
}

.warning-text {
  font-size: 14px;
  text-align: center;
  color: #F56C6C;
  margin: 10px 0 20px;
  font-weight: 500;
  padding: 8px 15px;
  background-color: rgba(245, 108, 108, 0.1);
  border-radius: 4px;
  border-left: 3px solid #F56C6C;
}

.logoff-form {
  margin: 0 auto;
  width: 100%;
}

.custom-input {
  width: 100%;
  margin-bottom: 10px;
}

:deep(.custom-input .el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s;
}

:deep(.custom-input .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.custom-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F56C6C inset;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 10px 0;
}

.confirm-btn {
  background-color: #F56C6C;
  border-color: #F56C6C;
  padding: 8px 20px;
  font-weight: 500;
  transition: all 0.3s;
}

.confirm-btn:hover {
  background-color: #f78989;
  border-color: #f78989;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.4);
}

.cancel-btn {
  padding: 8px 20px;
}
/* 添加最终确认框的样式 */
.final-confirm-dialog {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.final-confirm-dialog .el-dialog__header) {
  padding: 15px;
  background-color: #fef0f0;
  margin-right: 0;
  border-bottom: 1px solid #fde2e2;
}

:deep(.final-confirm-dialog .el-dialog__title) {
  color: #f56c6c;
  font-weight: 600;
}

.final-confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0 10px;
}

.confirm-warning-text {
  font-size: 14px;
  text-align: center;
  color: #606266;
  margin: 15px 0;
}

.confirm-input {
  width: 100%;
  margin: 10px 0;
}

.input-hint {
  font-size: 12px;
  color: #F56C6C;
  margin-top: 5px;
  height: 18px;
  transition: all 0.3s;
}

.input-hint.correct {
  color: #67C23A;
}
:deep(.delete-btn.el-button--text) {
  color: #F56C6C !important;
}

:deep(.logout-btn.el-button--text) {
  color: #E6A23C !important;
}
</style>