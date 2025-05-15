<template>
  <div class="register-page">
    <!-- 左侧品牌区域 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="logo-container">
          <el-icon class="platform-logo"><Monitor /></el-icon>
          <h1 class="brand-name">智能中台建模平台</h1>
        </div>
        <p class="brand-slogan">一站式AI模型开发、训练与部署平台</p>
        <div class="feature-points">
          <div class="feature-item">
            <el-icon class="feature-icon"><Key /></el-icon>
            <span>注册即可获取完整功能</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><Avatar /></el-icon>
            <span>个人专属的AI开发空间</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><Trophy /></el-icon>
            <span>免费使用基础模型资源</span>
          </div>
        </div>
      </div>
      <div class="decoration-circles">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>

    <!-- 右侧注册表单区域 -->
    <div class="form-section">
      <div class="form-container">
        <h2 class="form-title">创建新账号</h2>
        <p class="form-subtitle">填写以下信息完成注册</p>
        
        <el-form 
          :model="formRegister"
          :rules="rules"
          ref="formRegister"
          class="register-form"
        >
          <el-form-item prop="Username">
            <el-input 
              v-model="formRegister.Username" 
              placeholder="设置账号名称" 
              autocomplete="off" 
              size="large"
            >
              <template #prefix>
                <el-icon class="input-icon"><User /></el-icon>
              </template>
            </el-input>
            <div class="input-hint">账号将用于登录系统</div>
          </el-form-item>
          
          <el-form-item prop="Password">
            <el-input 
              type="password" 
              v-model="formRegister.Password" 
              placeholder="设置密码" 
              autocomplete="off" 
              show-password 
              size="large"
            >
              <template #prefix>
                <el-icon class="input-icon"><Lock /></el-icon>
              </template>
            </el-input>
            <div class="input-hint">密码最少6位数</div>
          </el-form-item>
          
          <el-form-item prop="confirm">
            <el-input 
              type="password" 
              v-model="formRegister.confirm" 
              placeholder="确认密码" 
              autocomplete="off" 
              show-password 
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
                v-model="formRegister.code" 
                auto-complete="off" 
                placeholder="请输入验证码" 
                size="large"
                class="captcha-input"
              ></el-input>
              
              <div class="captcha-box" @click="refreshCode">
                <s-identify :identifyCode="identifyCode"></s-identify>
              </div>
            </div>
            <div class="captcha-hint">点击图片可刷新验证码</div>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              class="submit-btn" 
              @click="submit"
              :loading="isLoading"
            >
              立即注册
            </el-button>
          </el-form-item>
          
          <div class="form-footer">
            <span>已有账号？</span>
            <el-link type="primary" @click="toLogin">返回登录</el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import SIdentify from "../components/Identify";
import { useRouter } from "vue-router";
import request from "@/utils/request";
import { User, Lock, Monitor, Key, Avatar, Trophy } from "@element-plus/icons-vue";
import { ref } from 'vue';
import { ElMessage } from "element-plus";

export default {
  name: 'register',
  components: {
    SIdentify,
    User,
    Lock,
    Monitor,
    Key,
    Avatar,
    Trophy
  },
  mounted() {
    // 初始化验证码
    this.identifyCode = '';
    this.makeCode(this.identifyCodes, 4);
  },
  setup() {
    const router = useRouter();
    const isLoading = ref(false);
    
    const toLogin = () => {
      router.push({
        path: '/login',
      });
    };
    
    return {
      toLogin,
      isLoading
    };
  },
  data() {
    return {
      formRegister: {
        Username: "",
        Password: "",
        confirm: "",
        code: ""
      },
      identifyCodes: '1234567890abcdefjhijklinopqrsduvwxyz',
      identifyCode: '',
      rules: {
        Username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, message: "用户名至少需要3个字符", trigger: "blur" }
        ],
        Password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码最少6位数', trigger: 'blur' }
        ],
        confirm: [
          { required: true, message: '请再次确认密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.formRegister.Password) {
                callback(new Error('两次输入的密码不一致!'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        code: [{ required: true, message: "请输入验证码", trigger: "blur" }]
      }
    };
  },
  methods: {
    refreshCode() {
      this.identifyCode = '';
      this.makeCode(this.identifyCodes, 4);
    },
    makeCode(o, l) {
      for (let i = 0; i < l; i++) {
        this.identifyCode += this.identifyCodes[this.randomNum(0, this.identifyCodes.length)];
      }
    },
    randomNum(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    },
    submit() {
      if (this.formRegister.code.toLowerCase() !== this.identifyCode.toLowerCase()) {
        ElMessage({
          message: '请填写正确验证码',
          type: 'error',
          offset: 60
        });
        this.refreshCode();
        return;
      }
      
      if (this.formRegister.Password !== this.formRegister.confirm) {
        ElMessage({
          message: '两次密码输入不一致！',
          type: 'error',
          offset: 60
        });
        return;
      }
      
      this.$refs.formRegister.validate((valid) => {
        if (valid) {
          this.isLoading = true;
          
          request.post("/UserLogin/Register", {
            Username: this.formRegister.Username,
            Password: this.formRegister.Password,
          }, { headers: { 'Content-Type': 'multipart/form-data' } })
          .then(res => {
            if (res.code === '0') {
              ElMessage({
                type: "success",
                message: '注册成功！即将跳转到登录页面...',
                offset: 60
              });
              
              setTimeout(() => {
                this.toLogin();
              }, 1500);
            } else {
              ElMessage({
                type: "error",
                message: res.msg || '注册失败，请稍后重试',
                offset: 60
              });
            }
            this.isLoading = false;
          })
          .catch(err => {
            ElMessage({
              type: "error",
              message: '网络错误，请稍后重试',
              offset: 60
            });
            this.isLoading = false;
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.register-page {
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
  transition: all 0.3s;
}

.feature-item:hover {
  transform: translateX(5px);
  opacity: 1;
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
  width: 450px;
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

.register-form {
  width: 100%;
}

.input-icon {
  color: #2a476e;
}

.input-hint {
  font-size: 12px;
  color: #8a94a6;
  margin-top: 4px;
  margin-left: 2px;
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
  transition: all 0.3s;
  overflow: hidden;
}

.captcha-box:hover {
  border-color: #00c0ee;
  box-shadow: 0 0 10px rgba(0, 192, 238, 0.2);
}

.captcha-hint {
  font-size: 12px;
  color: #8a94a6;
  margin-top: 4px;
  text-align: right;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(90deg, #00c0ee, #2a84d8);
  border: none;
  margin: 10px 0;
  transition: all 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 192, 238, 0.3);
}

.form-footer {
  text-align: center;
  color: #6c757d;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .register-page {
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
    max-width: 450px;
  }
}

/* 表单控件样式覆盖 */
:deep(.el-input__wrapper) {
  padding: 4px 11px;
}

:deep(.el-form-item__error) {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-button) {
  border-radius: 6px;
}

:deep(.el-link) {
  font-weight: 500;
}
</style>