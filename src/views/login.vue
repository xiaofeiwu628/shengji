<template>
  <div class="login-page">
    <!-- 左侧品牌区域 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="logo-container">
          <el-icon class="platform-logo"><Monitor /></el-icon>
          <h1 class="brand-name">智能中台建模平台</h1>
        </div>
        <!-- <p class="brand-slogan">加速AI模型开发与部署，赋能企业智能化转型</p> -->
        <div class="feature-points">
          <div class="feature-item">
            <el-icon class="feature-icon"><Cpu /></el-icon>
            <span>高效的模型训练</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><Box /></el-icon>
            <span>便捷的模型管理</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><Connection /></el-icon>
            <span>一键式服务部署</span>
          </div>
        </div>
      </div>
      <div class="decoration-circles">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>

    <!-- 右侧登录表单区域 -->
    <div class="form-section">
      <div class="form-container">
        <h2 class="form-title">欢迎登录</h2>
        <p class="form-subtitle">请输入您的账号信息</p>
        <el-form 
          :model="formLogin"
          :rules="rules"
          ref="formLoginRef"
          class="login-form"
        >
          <el-form-item prop="Username">
            <el-input 
              v-model="formLogin.Username" 
              placeholder="登录账号" 
              autocomplete="off" 
              @keydown.enter="submit"
              size="large"
            >
              <template #prefix>
                <el-icon class="input-icon"><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="Password">
            <el-input 
              type="password" 
              v-model="formLogin.Password" 
              placeholder="登录密码" 
              autocomplete="off" 
              show-password 
              @keydown.enter="submit"
              size="large"
            >
              <template #prefix>
                <el-icon class="input-icon"><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="code">
            <div class="captcha-container">
              <el-input 
                v-model="formLogin.code" 
                auto-complete="off" 
                placeholder="请输入验证码" 
                @keydown.enter="submit"
                size="large"
                class="captcha-input"
              ></el-input>
              <div class="captcha-box" @click="refreshCode">
                <s-identify :identifyCode="identifyCode"></s-identify>
              </div>
            </div>
          </el-form-item>
          <div class="form-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" class="forgot-password">忘记密码？</el-link>
          </div>
          <el-button 
            type="primary" 
            class="submit-btn" 
            @click="submit"
            :loading="isLoading"
          >
            登录
          </el-button>
          <div class="form-footer">
            <span>还没有账号？</span>
            <el-link type="primary" @click="toRegister">立即注册</el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SIdentify from "@/components/Identify.vue"
import request from "@/utils/request"


interface LoginForm {// 定义登录表单的类型
  Username: string
  Password: string
  code: string
}

const router = useRouter()// 获取路由实例

const formLogin = reactive<LoginForm>({// 定义登录表单的响应式数据
  Username: "",
  Password: "",
  code: ""
})

const rememberMe = ref(false)// 记住我
const isLoading = ref(false)// 加载状态
const identifyCodes = '1234567890abcdefjhijklinopqrsduvwxyz'// 验证码字符集
const identifyCode = ref('')// 验证码
const formLoginRef = ref()// 表单引用

const rules = {// 定义表单验证规则
  Username: [{ required: true, message: "请输入用户名", trigger: "blur" }],// 用户名
  Password: [{ required: true, message: "请输入密码", trigger: "blur" }],// 密码
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }]// 验证码
}

function randomNum(min: number, max: number) {// 生成随机数
  return Math.floor(Math.random() * (max - min) + min)
}

function makeCode(o: string, l: number) {// 生成验证码
  let code = ''
  for (let i = 0; i < l; i++) {
    code += o[randomNum(0, o.length)]
  }
  identifyCode.value = code
}
// 刷新验证码
function refreshCode() {
  makeCode(identifyCodes, 4)
}

function toHome() {// 跳转到首页
  router.push({ path: '/' })
}

function toRegister() {// 跳转到注册页面
  router.push({ path: '/register' })
}

function submit() {// 提交表单
  // 表单验证
  isLoading.value = true

  if (formLogin.code.toLowerCase() !== identifyCode.value.toLowerCase()) {// 验证码验证
    ElMessage.error('请填写正确验证码')
    refreshCode()
    isLoading.value = false
    return
  }

  (formLoginRef.value as any).validate((valid: boolean) => {// 表单验证
    if (valid) {// 表单验证成功
      request.post("/UserLogin/Login", {// 登录请求
        Username: formLogin.Username,
        Password: formLogin.Password,
      }, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res: any) => {
        if (res.code === '0') {
          ElMessage({
            type: "success",
            message: '登录成功！',
            offset: 60
          })
          //保存token
          window.localStorage.setItem('token', res.data.Token)
          localStorage.setItem("Token", res.data.Token)
          localStorage.setItem("Username", res.data.Username)
          toHome()
        } else {
          ElMessage({
            type: "error",
            message: res.msg,
            offset: 60
          })
        }
        isLoading.value = false
      }).catch(() => {
        isLoading.value = false
        ElMessage({
          type: "error",
          message: '网络错误，请稍后重试',
          offset: 60
        })
      })
    } else {
      ElMessage({// 这里是表单验证失败的处理
        type: 'error',
        message: '登录失败！',
        offset: 60
      })
      isLoading.value = false
    }
  })
}

// 监听键盘事件
onMounted(() => {
  identifyCode.value = ''// 初始化验证码
  makeCode(identifyCodes, 4)// 生成验证码
})
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}

/* 左侧品牌区域样式 */
.brand-section {
  width: 45%;
  background: linear-gradient(135deg, #1a2942 0%, #2a476e 50%, #4c75a3 100%);
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
}

.brand-content {
  position: relative;
  z-index: 2;
}

.logo-container {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.platform-logo {
  font-size: 48px;
  margin-right: 15px;
  color: #00c0ee;
}

.brand-name {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, #ffffff, #00c0ee);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-slogan {
  font-size: 20px;
  margin-bottom: 50px;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 500px;
}

.feature-points {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 18px;
  opacity: 0.85;
}

.feature-icon {
  font-size: 24px;
  color: #00c0ee;
}

/* 装饰圆圈 */
.decoration-circles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  background: radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0) 70%);
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -150px;
  right: -100px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -100px;
  left: 10%;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 40%;
  right: 10%;
}

/* 右侧表单区域样式 */
.form-section {
  width: 55%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.form-container {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a2942;
  margin-bottom: 10px;
  text-align: center;
}

.form-subtitle {
  color: #6c757d;
  text-align: center;
  margin-bottom: 30px;
}

.login-form {
  width: 100%;
}

.input-icon {
  color: #2a476e;
}

.captcha-container {
  display: flex;
  gap: 10px;
}

.captcha-input {
  flex: 1;
}

.captcha-box {
  width: 120px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(90deg, #00c0ee, #2a84d8);
  border: none;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 192, 238, 0.3);
}

.form-footer {
  text-align: center;
  color: #6c757d;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .login-page {
    flex-direction: column;
  }
  
  .brand-section {
    width: 100%;
    padding: 40px;
  }
  
  .form-section {
    width: 100%;
    padding: 40px 20px;
  }
  
  .form-container {
    width: 100%;
    max-width: 400px;
  }
}

/* 表单控件样式覆盖 */
:deep(.el-input__wrapper) {
  padding: 4px 11px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-button) {
  border-radius: 6px;
}

:deep(.el-checkbox__label) {
  color: #6c757d;
}
</style>