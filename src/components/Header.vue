<template>
  <div style="height: 50px;line-height: 50px;width: 100vw;border-bottom: 1px solid #cccccc;display: flex;z-index:999999;  top:0;  background-color: white;">
    <span style="width: auto;padding-left: 20px;font-weight: bold;color: dodgerblue;font-size: 17px">光学天文望远镜人工智能软件实验平台</span>
<!--    <div style="flex: 1"></div>-->
    <div style="flex: 1;text-align: right;margin-right: 30px;height: 50px;line-height: 50px">
        <el-dropdown>
          <span class="el-dropdown-link">
            <br>{{ userName }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span >
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item style="padding: 0">
                <el-button text @click="this.logoffForm = {};this.logoffConfirmView = true">删除账号</el-button>
              </el-dropdown-item>
              <el-dropdown-item style="padding: 0">
                <el-popconfirm title="确认退出登录吗？" @confirm="logout">
                  <template #reference>
                    <el-button text type="warning">退出系统</el-button>
                  </template>
                </el-popconfirm>
              </el-dropdown-item>

            </el-dropdown-menu>
          </template>
        </el-dropdown>
    </div>
    <!--用户删除确认窗口-->
    <el-dialog
        v-model="logoffConfirmView"
        width="20%">
      <el-form :model="logoffForm"
               label-width="50px"
               :rules="rules"
               ref="logoffForm">
        <h1 class="title">删除账号</h1>
        <p style="font-size: 16px;text-align: center;color: red;margin-bottom: 10px">删除账号将删除用户全部信息！</p>
        <el-form-item prop="Username">
          <el-input v-model="logoffForm.Username" style="width: 80%" >
            <template #prefix>
              <el-icon class="el-input__icon"><user /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="Password">
          <el-input v-model="logoffForm.Password" style="width: 80%" type="password">
            <template #prefix>
              <el-icon class="el-input__icon"><lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <p style="font-size: 16px;text-align: center">请输入账号密码</p>
      <template #footer>
          <span class="dialog-footer" style="margin-left: auto">
            <el-button @click="logoff" type="danger">确认</el-button>
            <el-button @click="this.logoffConfirmView = false">取消</el-button>
          </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {ArrowDown} from "@element-plus/icons-vue";
import {useRouter} from "vue-router/dist/vue-router";
import request from "@/utils/request";

export default {
  name: "Header",
  components: {
    ArrowDown,

  },
  setup(){
    const router = useRouter()
    let toLogin = ()=>{//返回登录界面
      router.push({
        path: '/login',
      })
    };
    return{
      toLogin
    }
  },
  data(){
    return{
      userName: localStorage.getItem("Username"),
      logoffConfirmView: false,
      logoffForm:{//用户注销表单
        Username: '',
        Password: '',
      },
      // 校验
      rules: {
        Username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        Password: [{ required: true, message: "请输入密码", trigger: "blur" }],
      }
    }
  },
  methods:{
    logout(){
      request.post("/UserLogin/Logout", {
        Token : localStorage.getItem("Token")
      },{headers:{'Content-Type':'multipart/form-data'}}).then(res =>{
        if(res.code === '0'){
          this.$message({
            type: "success",
            message: '登出成功！',
            offset:60,
          })
          this.toLogin()
        } else {
          this.$message({
            type: "error",
            message: res.msg,
            offset:60,
          })
        }
      })
    },
    logoff(){
      this.$refs.logoffForm.validate((valid)=> {//触发表单验证
        if (valid) {
          request.post("/UserLogin/Logoff", {
            Username: this.logoffForm.Username,
            Password: this.logoffForm.Password,
            Token : localStorage.getItem("Token")
          },{headers:{'Content-Type':'multipart/form-data'}}).then(res =>{
            if(res.code === '0'){
              this.$message({
                type: "success",
                message: '当前用户已注销！',
                offset:60,
              })
              this.toLogin()
            } else {
              this.$message({
                type: "error",
                message: res.msg,
                offset:60,
                customClass:'messageIndex'
              })
            }
          })
        }
      })
    }
  },
}
</script>

<style>
.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
.title {
  margin: 0px auto 40px auto;
  text-align: center;
  color: #505458;
}
.messageIndex{
  z-index: 999999 !important;
}
</style>



