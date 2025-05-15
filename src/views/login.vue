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
          ref="formLogin"
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

<script>
import SIdentify from "../components/Identify";
import {useRouter} from "vue-router/dist/vue-router";
import request from "@/utils/request";
import { User, Lock, Monitor, Box, Cpu, Connection } from "@element-plus/icons-vue";

export default {
  name: 'login',
  components: {
    SIdentify,
    User,
    Lock,
    Monitor,
    Box,
    Cpu,
    Connection
  },
  mounted () {
    // 初始化验证码
    this.identifyCode = ''
    this.makeCode(this.identifyCodes, 4)
  },
  data: function() {
    return {
      formLogin: {
        Username: "",
        Password: "",
        code: ""
      },
      rememberMe: false,
      isLoading: false,
      identifyCodes: '1234567890abcdefjhijklinopqrsduvwxyz',//随机串内容
      identifyCode: '',
      // 校验
      rules: {
        Username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        Password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        code: [{ required: true, message: "请输入验证码", trigger: "blur" }]
      }
    }
  },
  setup(){
    const router = useRouter()
    let toHome = ()=>{//返回home界面
      router.push({
        path: '/',
      })
    };
    let toRegister = ()=>{//返回注册界面
      router.push({
        path: '/register',
      })
    };
    return{
      toHome,
      toRegister
    }
  },
  methods: {
    // 重置验证码
    refreshCode () {
      this.identifyCode = ''
      this.makeCode(this.identifyCodes, 4)
    },
    makeCode (o, l) {
      for (let i = 0; i < l; i++) {
        this.identifyCode += this.identifyCodes[this.randomNum(0, this.identifyCodes.length)]
      }
    },
    randomNum (min, max) {
      return Math.floor(Math.random() * (max - min) + min)
    },
    submit() {//点击登录按钮
      this.isLoading = true;
      
      if (this.formLogin.code.toLowerCase() !== this.identifyCode.toLowerCase()) {
        this.$message.error('请填写正确验证码')
        this.refreshCode()
        this.isLoading = false;
        return
      }
      
      this.$refs.formLogin.validate((valid)=>{//触发表单验证
        if(valid){
          request.post("/UserLogin/Login", {
            Username : this.formLogin.Username,
            Password : this.formLogin.Password,
          },{headers:{'Content-Type':'multipart/form-data'}}).then(res =>{
            if(res.code === '0'){
              this.$message({
                type: "success",
                message: '登录成功！',
                offset:60
              })
              console.log(res.data.Token)
              //保存token
              window.localStorage.setItem('token',res.data.Token);
              localStorage.setItem("Token",res.data.Token);//存储token
              localStorage.setItem("Username",res.data.Username);//存储Username
              this.toHome();
            } else {
              this.$message({
                type: "error",
                message: res.msg,
                offset:60
              })
            }
            this.isLoading = false;
          }).catch(err => {
            this.isLoading = false;
            this.$message({
              type: "error",
              message: '网络错误，请稍后重试',
              offset:60
            })
          })
        }
        else {
          this.$message({
            type:'error',
            message:'登录失败！',
            offset:60
          })
          this.isLoading = false;
        }
      })
    }
  }
}
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