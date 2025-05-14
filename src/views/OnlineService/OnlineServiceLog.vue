<template>
  <div>
    <div style="margin: 20px 0 0 2%">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/onlineServiceList' }">在线服务</el-breadcrumb-item>
        <el-breadcrumb-item>日志</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!--    <el-divider style="margin: 15px 0 0 0" />-->
    <div style="background-color: white;margin: 20px;min-height: calc(100vh - 124px)">
      <div style="margin: 40px 0 0 40px;display: inline-block;width: 88%">
        <span><b>服务ID：</b> </span>
        <span>{{serviceId}}</span>
        <span style="margin:  0 0 0 100px"><b>服务名称：</b> </span>
        <span>{{serviceName}}</span>
        <span style="margin:  0 0 0 100px"><b>服务状态：</b> </span>
        <span>{{serviceStateDic[serviceState]}}</span>
      </div>

      <!--    日志-->
      <div>
        <div style="margin:20px 2% 0 2%">
          <el-menu class="el-menu-m" mode="horizontal" :default-active="pageIndex">
            <el-menu-item index="0" @click="changeIndex('0')">服务日志</el-menu-item>
            <el-menu-item index="1" @click="changeIndex('1')">容器内部日志</el-menu-item>
          </el-menu>
          <!--      <router-view style="margin-bottom: 30px" />-->
        </div>
        <div style="margin: 20px 2% 0 2%" v-show="pageIndex==='0'">
          <div id='serviceMessages' style="margin: 20px 0 0 0;border: black 3px solid" v-loading="logLoading">
          </div>
        </div>
        <div style="margin: 20px 2% 0 2%" v-show="pageIndex==='1'">
          <div id='containerMessage' style="margin: 20px 0 0 0;border: black 3px solid" v-loading="conLogLoading">
          </div>
        </div>
      </div>
    </div>



  </div>
</template>

<script>
import {useRoute} from "vue-router";
import request from "@/utils/request";
import {ElMessage} from "element-plus";
import {serviceLog} from "@/utils/before"
import {default as AnsiUp} from 'ansi_up';
// import { AnsiHTMLConverter } from 'ansi_to_html';

export default {
  name: "OnlineServiceLog",
  data(){
    return{
      serviceId:'',
      logLoading:false,
      conLogLoading:false,
      serviceName:'',
      serviceState:'',
      serviceStateDic:{
        running:'运行中',
        stoped:'停止',
        exited:'停止',
        error:'未知异常',
        error_connection:'连接异常',
        error_starting:'启动异常',
        error_running:'运行异常',
        waiting:'等待资源',
        starting:'部署中',
      },
      redFlag:false,
      blueFlag:false,
      pageIndex:'0',
      showContainerLog:0,//0不显示，1显示
      wsDict:{},
      httpDict:{},
      log_data:[],//日志内容列表
    }
  },
  created() {
    const route = useRoute();
    console.log(route.query.serviceId,'route.query.serviceId')
    this.serviceId = route.query.serviceId;
    this.serviceName = route.query.serviceName;
    this.serviceState = route.query.serviceState;
    this.logConnection(`ws://192.168.109.198:8090/task/read_log/${this.serviceId}`,'serviceMessages');
  },
  beforeUnmount() {
    //关闭页面后将所有的websocket连接关闭
    Object.keys(this.wsDict).forEach(item=>{
      this.wsDict[item].close();
    })
  },
  watch:{
    pageIndex:{
      handler(newValue,oldValue) {
        if(this.pageIndex === '1'){
          //调用查数据库nodeid和containerid的接口,根据服务状态显示气质日志
          let node_id = '';
          let c_id = '';
          let param = {service_id:this.serviceId}
          request.get('OnlineService/GetExtraConf',{
            params:param
          }).then(res=>{
            console.log(res.data,'res.data');
            //当容器位于存在和不存在两个状态之间转变时才会删除原先的dom子节点重新加载日志
            // if((res.data.service_state !== this.serviceState) && (this.serviceState === 'running' || res.data.service_state === 'running')){
            if((res.data.service_state !== this.serviceState)){
              this.wsDict = {};
              this.httpDict = {};
              let logUl = document.getElementById('containerMessage');
              while (logUl.hasChildNodes()){
                logUl.removeChild(logUl.firstChild);
              }
            }
            this.serviceState = res.data.service_state;
            if(res.data.service_state === 'running'){
              node_id = res.data.extra_conf.node_id;
              c_id = res.data.extra_conf.container_id;
              let url = `ws://192.168.109.198:8090/container/read_log/${node_id}/${c_id}`
              if(!this.wsDict[url]){
                this.logConnection(url,'containerMessage')
              }
            }else{
              if(!this.httpDict[this.serviceId]){
                //使用http接口接收日志
                serviceLog(this.serviceId.toString()).then(res=>{
                  console.log(res.data,'res.data')
                  this.httpDict[this.serviceId] = res.data
                  this.logProcess(res.data);
                })
              }

            }
          }).catch(err=>{
            ElMessage({message:'接口异常',type:'error',offset:60})
          })
        }
      },
      deep: true,
    },
  },
  methods:{
    //连接日志
    logConnection(url,ele){
      let ansi_up = new AnsiUp()
      // const converter = new AnsiHTMLConverter()
      this.log_data = []
      const _this = this;
      _this.logLoading = true;
      let mark = 0;
      let messageNumber = 0;
      const ws = new WebSocket(url);
      _this.wsDict[url] = ws;
      ws.onopen = function (){

        console.log('WS open')
      };
      ws.onclose = function () {
        console.log('WS close');
      };
      ws.onerror = function (event) {
        // console.log(event.data);
      };
      ws.onmessage = function (event) {
        if(event.data !== "pass"){
          messageNumber += 1;
          let log_line = ansi_up.ansi_to_html(event.data)
          var messages = document.getElementById(ele);
          var message = document.createElement('div');
          // console.log(log_line)
          message.innerHTML = log_line
          // var content = document.createTextNode(event.data);
          // console.log(event.data,'eventdata')
          // this.log_da
          if(event.data.indexOf('| error |') >= 0 || event.data.indexOf('| ERROR |') >= 0){
            message.style.color = 'red';
            this.redFlag = true;
            this.blueFlag = false;
          }else if(event.data.indexOf('| warning |') >= 0  || event.data.indexOf('| WARNING |') >= 0){
            message.style.color = 'red';
            this.redFlag = false;
            this.blueFlag = false;
          }else if(event.data.indexOf('| INFO |') >= 0){
            this.redFlag = false;
            this.blueFlag = false;
          }else if(event.data.indexOf('以下是容器内部日志') >= 0){
            message.style.color = 'blue';
            this.blueFlag = true;
            this.redFlag = false;
          }
          if(this.redFlag){
            message.style.color = 'red';
          }else if(this.blueFlag){
            message.style.color = 'blue';
          }
          if(event.data.indexOf('效果最好的模型超参数是：') >= 0){
            mark = messageNumber;
            message.style.fontWeight = 'bold';
          }
          if((messageNumber - mark === 1) && mark !== 0){
            message.style.fontWeight = 'bold';
          }

          // message.style.color = 'red';
          // message.appendChild(content);
          messages.appendChild(message);
        }
        _this.logLoading = false;
      };
    },
    changeIndex(param){
      this.pageIndex = param;
    },
    logProcess(data){
      let ansi_up = new AnsiUp()
      let liList = []
      liList = data.split('\n');
      liList.forEach(item=>{
        let log_line = ansi_up.ansi_to_html(item)
        var messages = document.getElementById('containerMessage');
        var message = document.createElement('div');
        message.innerHTML = log_line
        messages.appendChild(message)
      })
    },
  }
}
</script>

<style scoped>
#serviceMessages,#containerMessage{
  list-style-type: none;
  height: 500px;
  overflow: auto;
}
.el-menu-m{
  height: 50px;
  background-color: #E8ECFA;
}
</style>
