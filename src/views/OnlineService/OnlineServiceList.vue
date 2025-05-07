<template>
  <div>
    <div style="margin: 20px 0 0 2%">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/onlineServiceHome/onlineServiceList' }">在线服务</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
<!--    <el-divider style="margin: 15px 0 0 0" />-->
    <div style="background-color: white;margin: 20px;min-height: calc(100vh - 124px)">
      <div style="text-align: right;padding: 20px 2% 0 0;width: 100%">
        <el-icon size="20px" @click="loadOnlineService" style="cursor: pointer"><Refresh /></el-icon>
      </div>
      <div style="display:flex;padding:20px 2% 0 2%">
        <el-button  type="primary" style="width: 80px" @click="onlineServiceDeploy">模型部署</el-button>
        <div style="display: inline-block;flex: 1"></div>
        <el-select v-model="selectInputByServiceState"  style="margin: 0 0 0 20px" @change="selectByServiceState">
          <el-option
              v-for="item in serviceStateList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
        <el-input
            v-model="selectInputByServiceName"
            class="w-50 m-2"
            placeholder="查询"
            clearable
            style="width: 250px;margin-left: 30px"
            @clear="loadOnlineService"
        />
        <el-button type="primary" style="margin-left: 10px" @click="selectByServiceName">查询</el-button>
      </div>
      <!--      在线服务列表-->
      <div>
        <el-table :data="serviceListData" border style="width: 96%;margin: 20px 0 40px 2%" v-loading="serviceLoading" :row-style="{height:'65px'}" >
          <el-table-column type="index" min-width="3%" align="center" />
          <el-table-column prop="service_name" label="服务名称" min-width="10%" align="center"/>
          <el-table-column prop="service_id" label="服务ID" min-width="10%" align="center"/>
          <el-table-column prop="service_state" label="服务状态" min-width="10%" align="center">
            <template #header>
              <span style="vertical-align: middle;display: inline-block;line-height: 20px">{{"服务状态"}}</span>
              <el-tooltip  placement="top" effect="light">
                <template #content>
                  等待资源：等待足够的资源进行部署<br />部署中：服务正在部署<br />运行中：服务正在运行<br />停止：服务处于停止状态<br />未知异常：服务出现未知异常
                  <br/>启动异常：容器启动过程中出现异常<br/>连接异常：服务连通性检测异常<br/>运行异常：服务运行过程中出现异常
                </template>
                <el-icon :size="16" style="vertical-align: middle;cursor: pointer;margin-left: 5px;line-height: 20px"><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
            <template #default="scope">
              <el-tag type="" :style="setStateStyle(scope.row.service_state)" round >{{ serviceStateDic[scope.row.service_state]}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="service_type" label="部署方式" min-width="8%" align="center">
            <template #default="scope">
              {{deployType[scope.row.service_type]}}
            </template>
          </el-table-column>
          <el-table-column prop="model_id" label="对应模型/镜像版本ID" min-width="14%" align="center">
            <template #default="scope">
              <el-link :underline="false" type="primary" @click="toHouse(scope.row)">{{ scope.row.service_type === 'custom' ? scope.row.image_version_id:scope.row.model_id }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="创建时间" min-width="13%" align="center"/>
          <el-table-column prop='' label="操作" min-width="18%" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" @click="startService(scope.row)" :style="setStartStyle(scope.row)" round :disabled="setStartDisabled(scope.row)">启动</el-button>
              <el-button type="primary" size="small" @click="stopService(scope.row)" style="width: 20%" :style="setStopStyle(scope.row)" round :disabled="setStopDisabled(scope.row)">停止</el-button>
              <el-popconfirm title="确定删除吗？" @confirm="deleteService(scope.row)">
                <template #reference>
                  <el-button type="primary" size="small" style="width: 20%" :style="setDeleteStyle(scope.row)" round :disabled="setDeleteDisabled(scope.row)">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
          <el-table-column prop='' label="信息"  align="center" min-width="16%">
            <template #default="scope">
              <el-button link type="primary" @click="toLog(scope.row)">日志</el-button>
              <el-button link type="primary" @click="toLogVisualization(scope.row)">访问统计</el-button>
              <el-button link type="primary" @click="toDetails(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!--    删除的提示框-->
    <div style="text-align: left">
      <el-dialog v-model="deleteServiceDialog" title="提示" width="30%">
        <span>确定要删除吗？</span>
        <template #footer>
        <span>
          <el-button @click="this.deleteServiceDialog = false">取消</el-button>
          <el-button type="primary" @click="singleConfirm">确定</el-button>
        </span>
        </template>
      </el-dialog>
    </div>
    <!--    在线服务接口访问情况弹出框-->
    <div>
      <el-dialog v-model="accessDialog" title="在线服务访问情况" min-width="500px">
        <div v-if="visualType === 'list'">
          <div style="font-size: 16px;font-weight: bold;text-align: center;margin: 0 0 20px 0 ">{{'服务名称：' + chartData.fName}}</div>
          <el-table :data="serviceAccessData" border :header-cell-style="{background:'#F5F5F5'}" v-loading="serviceAccessLoading" v-if="visualType === 'list'">
            <el-table-column property="online_service_log_id" label="请求ID" min-width="15%" align="center"/>
            <el-table-column property="response_status" label="响应状态" min-width="15%" align="center"/>
            <el-table-column property="status_code" label="状态码" min-width="11%" align="center"/>
            <el-table-column property="response_duration" label="响应时长" min-width="15%" align="center">
              <template #default="scope">
                {{scope.row.response_duration + 's'}}
              </template>
            </el-table-column>
            <el-table-column property="request_start_time" label="响应开始时间" min-width="22%" align="center"/>
            <el-table-column property="request_end_time" label="响应结束时间" min-width="22%" align="center"/>
          </el-table>
        </div>
        <MyChart :message="chartData" v-if="visualType === 'time'"></MyChart>
        <el-radio-group v-model="visualType" @change="changeVisual" class="ml-4" style="margin: 20px 0 0 40%">
          <el-radio label="list" size="large" >访问列表</el-radio>
          <el-radio label="time" size="large" >时间分布</el-radio>
        </el-radio-group>
        <template #footer>
          <span>
            <el-button @click="this.accessDialog = false">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>

  </div>

</template>

<script>
import router from "@/router";
import MyChart from "@/components/MyChart.vue";
import { Search } from '@element-plus/icons-vue';
import request from "@/utils/request";
import {ElMessage} from "element-plus";
import { QuestionFilled } from '@element-plus/icons-vue';
import { serviceStart,serviceStop,serviceDelete } from "@/utils/before";
import {useRoute} from "vue-router";

export default {
  name: "ServiceList",
  data(){
    return{
      serviceListData:[],
      Search,
      serviceLoading:false,
      selectInputByServiceState:'服务状态',
      serviceStateList:[
        {
          value:'',
          label:'全部'
        },
        {
          value:'running',
          label:'运行中'
        },
        // {
        //   value:'stoped',
        //   label:'停止'
        // },
        {
          value:'exited',
          label:'停止'
        },
        {
          value:'error',
          label:'异常'
        },
        {
          value:'waiting',
          label:'等待资源'
        },
        {
          value:'starting',
          label:'部署中'
        }
      ],
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
      selectInputByServiceName:'',
      deleteServiceDialog:false,
      accessDialog:false,
      serviceAccessLoading:false,
      serviceAccessData:[],
      visualType:'list',
      chartData:{//图表数据
        fName: '',//标题名
        GraphType: '',//图表类型
        ydata: [],//折线图与直方图y轴数据
        xdata: [],//直方图x轴数据
        piedata: [],//饼图数据,

      },
      deployType:{
        custom:'镜像部署',
        official:'模型部署'
      }
    }
  },
  components:{
    QuestionFilled,
    MyChart,
  },
  created() {
    const route = useRoute();
    if(route.query.serviceId){
      console.log(route.query.serviceId,'route.query.serviceId')
      let serviceId = route.query.serviceId;
      let middle = {service_id:serviceId};
      this.loadOnlineService(middle,1000);
    }else{
      this.loadOnlineService(null,1000);
    }
    // this.loadOnlineService(null,1000);
    // this.$store.commit('changeOnlineServiceStep','');
  },
  methods:{
    //跳转到模型部署界面
    onlineServiceDeploy(){
      router.push('/onlineServiceDeploy');
    },
    //加载在线服务列表
    loadOnlineService(param,time){
      this.serviceLoading = true;
      setTimeout(()=>{
        request.get('OnlineService/GetOnlineServiceList',{
          params:param ? param : {}
        }).then(res=>{
          this.serviceListData = res.data;
          this.serviceListData.forEach(item=>{
            item.create_time = item.create_time.split('.')[0]
          })
          this.serviceLoading = false;
          console.log(res.data,'res.data in loadOnlineService')
        }).catch(err=>{
          ElMessage({
            message:"加载失败！",
            type:'error',
            offset:60
          });
          this.serviceLoading = false;
        })
      },time ? time : 1000)

    },
    //在线服务的访问情况
    openAccessDialog(param){
      this.accessDialog = true;
      this.serviceAccessLoading = true;
      this.chartData.fName = param.service_name;
      request.get('/OnlineService/GetOnlineServiceLog',{
        params:param ? param : {}
      }).then(res=>{
        this.serviceAccessData = res.data.logList;
        this.chartData.xdata = res.data.timeDistribution.XData;
        this.chartData.ydata = res.data.timeDistribution.YData;
        this.chartData.GraphType = 'HistogramService';
        console.log(res.data,'data')
        this.serviceAccessLoading = false;
      })
    },
    //根据服务的名字模糊查询
    selectByServiceName(){
      let middle = {service_name:this.selectInputByServiceName};
      this.loadOnlineService(middle);
    },
    //根据服务的状态筛选
    selectByServiceState(){
      let middle = {};
      console.log(this.selectInputByServiceState)
      if(this.selectInputByServiceState === 'exited'){
        middle = {service_state:'stoped,exited'}
        console.log('ss')
      }else{
        middle = {service_state:this.selectInputByServiceState};
      }

      this.loadOnlineService(middle);
    },
    changeVisual(val){
      this.visualType = val;
    },
    //查看访问情况统计
    toLogVisualization(param){
      console.log(param.task_id,'param.task_id');
      console.log(param.task_history_id,'param.task_history_id');
      router.push({path:'/onlineServiceLogVisualization',query:{serviceId:param.service_id}})
    },
    //查看服务的详情
    toDetails(param){
      console.log(param.task_id,'param.task_id');
      console.log(param.task_history_id,'param.task_history_id');
      console.log(param.model_version,'param.model_version');
      router.push({path:'/onlineServiceDetails',query:{serviceId:param.service_id}})
    },
    //查看服务的日志
    toLog(param){
      router.push({path:'/onlineServiceLog',query:{serviceId:param.service_id,serviceName:param.service_name,serviceState:param.service_state}})
    },
    //启动服务
    startService(param){
      const data = {service_id:param.service_id};
      serviceStart(data).then(res=>{
        this.loadOnlineService(null,6000);
        setTimeout(()=>{
          ElMessage({
            message:'启动成功！',
            type:'success',
            offset:60
          });
        },6000)
      }).catch(err=>{
        ElMessage({
          message:'启动失败！',
          type:'error',
          offset:60
        });
      })
    },
    //停止服务
    stopService(param){
      const data = {service_id:param.service_id};
      serviceStop(data).then(res=>{
        this.loadOnlineService(null,4000);
        setTimeout(()=>{
          ElMessage({
            message:'停止成功！',
            type:'success',
            offset:60
          });
        },4000)
      }).catch(err=>{
        ElMessage({
          message:'停止失败！',
          type:'error',
          offset:60
        });
      })
    },
    //删除服务
    deleteService(param){
      const data = {service_id:param.service_id};
      console.log(data,'data in delete')
      serviceDelete(data).then(res=>{
        this.loadOnlineService(null,1000);
        setTimeout(()=>{
          ElMessage({
            message:'删除成功！',
            type:'success',
            offset:60
          });
        },1000)
      }).catch(err=>{
        ElMessage({
          message:'删除失败！',
          type:'error',
          offset:60
        });
      })
    },
    //设置启动style
    setStartStyle(param){
      if (param.service_state === 'running' || param.service_state === 'waiting') {
        return {"width": "25%","background-color": "#B9DAA7", "color": "white"}
      }else {
        return {"width": "25%","background-color": "#60B04F", "color": "white"}
      }
    },
    //设置停止style
    setStopStyle(param){
      if (param.service_state !== 'running' && param.service_state !== 'waiting') {
        return {"width": "25%","background-color": "#E29194", "color": "white"}
      }else {
        return {"width": "25%","background-color": "#CD353B", "color": "white"}
      }
    },
    //设置删除style
    setDeleteStyle(param){
      if (param.service_state !== 'running' && param.service_state !== 'waiting') {
        return {"width": "25%","background-color": "#CD353B", "color": "white"}
      }else {
        return {"width": "25%","background-color": "#E29194", "color": "white"}
      }
    },

    //设置状态style
    setStateStyle(param) {
      if (param === '运行中' || param === 'running') {
        return {"background-color": "#409eff", "color": "white","width":"80px"}
      } else if (param === '部署中' || param === 'starting') {
        return {"background-color": "#69B0E9", "color": "white","width":"80px"}
      } else if (param === '停止' || param === 'stoped' || param === 'exited') {
        return {"background-color": "#E29194", "color": "white","width":"80px"}
      } else if (param === '异常' || param === 'error'|| param === 'error_connection' || param === 'error_starting' || param === 'error_running'){
        return {"background-color": "#CD353B", "color": "white","width":"80px"}
      } else if (param === '等待部署' || param === 'waiting'){
        return {"background-color": "#00CED1", "color": "white","width":"80px"}
      }
    },
    //设置启动按钮不可用
    setStartDisabled(param){
      return (param.service_state === 'running' || param.service_state === 'waiting');
    },
    //设置暂停按钮不可用
    setStopDisabled(param){
      return (param.service_state !== 'running' && param.service_state !== 'waiting');
    },
    //设置删除按钮不可用
    setDeleteDisabled(param){
      return (param.service_state === 'running' || param.service_state === 'waiting');
    },
    //点击对应模型ID跳转到模型仓库
    toHouse(param){
      if(param.service_type === 'custom'){
        router.push({path:'imageList',query:{imageVersionId:param.image_version_id}})
      }else if(param.service_type === 'official'){
        router.push({path:'modelList',query:{modelId:param.model_id}})
      }

    },
  },

}
</script>

<style scoped>

</style>
