<template>
  <div class="service-repository">
    <!-- 顶部导航区域 -->
    <div class="header-area">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item class="tech-title">
          <el-icon><Monitor /></el-icon>
          在线服务
        </el-breadcrumb-item>
      </el-breadcrumb>
      
      <!-- 服务概览卡片 -->
      <div class="service-metrics">
        <div class="metric-card">
          <div class="metric-value">{{serviceListData.length}}</div>
          <div class="metric-label">服务总数</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{getServicesByState('running').length}}</div>
          <div class="metric-label">运行中服务</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{getServicesByState('exited').length + getServicesByState('stoped').length}}</div>
          <div class="metric-label">已停止服务</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{getServicesByState('starting').length + getServicesByState('waiting').length}}</div>
          <div class="metric-label">部署中服务</div>
        </div>
      </div>
    </div>

    <div class="content-panel">
      <div class="action-bar">
        <div class="left-area">
          <el-button type="primary" @click="onlineServiceDeploy" class="create-btn">
            <el-icon><Plus /></el-icon>
            模型部署
          </el-button>
        </div>
        
        <div class="middle-area">
          <div class="filter-group">
            <span class="filter-label">服务状态：</span>
            <el-select v-model="selectInputByServiceState" class="filter-select" @change="selectByServiceState">
              <el-option
                v-for="item in serviceStateList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
        
        <div class="right-area">
          <div class="search-box">
            <el-input
              v-model="selectInputByServiceName"
              placeholder="输入服务名称查询"
              class="search-input"
              clearable
              @clear="loadOnlineService"
              @keyup.enter="selectByServiceName"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="selectByServiceName">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
          
          <el-button 
            class="refresh-btn" 
            @click="loadOnlineService" 
            :loading="serviceLoading"
            type="primary"
            plain>
            <el-icon class="refresh-icon" :class="{ 'is-loading': serviceLoading }"><Refresh /></el-icon>
            刷新列表
          </el-button>
        </div>
      </div>

      <!-- 在线服务列表 -->
      <div class="table-container">
        <el-table 
          :data="serviceListData" 
          border 
          v-loading="serviceLoading" 
          :row-style="{ height: '65px' }"
          :cell-style="{ 'text-align': 'center' }"
          :header-cell-style="{ 'text-align': 'center', background: '#1a2942', color: '#fff' }"
          class="service-table"
        >
          <el-table-column type="index" min-width="3%" align="center" />
          <el-table-column prop="service_name" label="服务名称" min-width="10%" align="center"/>
          <el-table-column prop="service_id" label="服务ID" min-width="10%" align="center"/>
          <el-table-column prop="service_state" label="服务状态" min-width="10%" align="center">
            <template #header>
              <div class="header-with-icon">
                <span>服务状态</span>
                <el-tooltip placement="top" effect="light">
                  <template #content>
                    等待资源：等待足够的资源进行部署<br />部署中：服务正在部署<br />运行中：服务正在运行<br />停止：服务处于停止状态<br />未知异常：服务出现未知异常
                    <br/>启动异常：容器启动过程中出现异常<br/>连接异常：服务连通性检测异常<br/>运行异常：服务运行过程中出现异常
                  </template>
                  <el-icon class="info-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <template #default="scope">
              <el-tag :type="getTagType(scope.row.service_state)" round >{{ serviceStateDic[scope.row.service_state] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="service_type" label="部署方式" min-width="12%" align="center">
            <template #default="scope">
              <el-tag type="info" effect="light" round>
                {{ deployType[scope.row.service_type] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="model_id" label="对应模型/镜像版本ID" min-width="14%" align="center">
            <template #default="scope">
              <el-link :underline="false" type="primary" @click="toHouse(scope.row)">
                {{ scope.row.service_type === 'custom' ? scope.row.image_version_id : scope.row.model_id }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="创建时间" min-width="13%" align="center"/>
          <el-table-column prop='' label="操作" min-width="18%" align="center">
            <template #default="scope">
              <div class="action-buttons">
                <el-button 
                  type="success" 
                  size="small" 
                  @click="startService(scope.row)" 
                  :class="{'action-btn-disabled': setStartDisabled(scope.row)}"
                  class="action-btn action-btn-start" 
                  round 
                  :disabled="setStartDisabled(scope.row)"
                >启动</el-button>
                
                <el-button 
                  type="warning" 
                  size="small" 
                  @click="stopService(scope.row)" 
                  :class="{'action-btn-disabled': setStopDisabled(scope.row)}"
                  class="action-btn action-btn-stop" 
                  round 
                  :disabled="setStopDisabled(scope.row)"
                >停止</el-button>
                
                <el-popconfirm 
                  title="确定删除吗？" 
                  @confirm="deleteService(scope.row)"
                  confirm-button-text="确定"
                  cancel-button-text="取消"
                >
                  <template #reference>
                    <el-button 
                      type="danger" 
                      size="small" 
                      :class="{'action-btn-disabled': setDeleteDisabled(scope.row)}"
                      class="action-btn action-btn-delete" 
                      round 
                      :disabled="setDeleteDisabled(scope.row)"
                    >删除</el-button>
                  </template>
                </el-popconfirm>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop='' label="信息" align="center" min-width="22%">
              <template #default="scope">
                <div class="info-links">
                  <el-button link type="primary" @click="toLog(scope.row)" class="info-link-btn">
                    <el-icon><Document /></el-icon> 日志
                  </el-button>
                  <el-button link type="primary" @click="toLogVisualization(scope.row)" class="info-link-btn">
                    <el-icon><DataAnalysis /></el-icon> 访问统计
                  </el-button>
                  <el-button link type="primary" @click="toDetails(scope.row)" class="info-link-btn">
                    <el-icon><InfoFilled /></el-icon> 查看详情
                  </el-button>
                </div>
              </template>
            </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 各种弹出对话框保持原样，只是更新样式 -->
    <!-- 在线服务接口访问情况弹出框 -->
    <el-dialog v-model="accessDialog" title="在线服务访问情况" width="65%" class="access-dialog">
      <div v-if="visualType === 'list'" class="access-content">
        <div class="service-name-title">服务名称：{{ chartData.fName }}</div>
        <el-table 
          :data="serviceAccessData" 
          border 
          :header-cell-style="{ 'text-align': 'center', background: '#f5f7fa' }"
          :cell-style="{ 'text-align': 'center' }"
          v-loading="serviceAccessLoading" 
          class="access-table">
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
      <MyChart :message="chartData" v-if="visualType === 'time'" class="chart-container"></MyChart>
      
      <div class="view-toggle">
        <el-radio-group v-model="visualType" @change="changeVisual" class="ml-4">
          <el-radio label="list" size="large">访问列表</el-radio>
          <el-radio label="time" size="large">时间分布</el-radio>
        </el-radio-group>
      </div>
      
      <template #footer>
        <span>
          <el-button @click="accessDialog = false">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除的提示框 -->
    <el-dialog v-model="deleteServiceDialog" title="提示" width="400px" class="confirm-dialog">
      <template #header>
        <div class="confirm-header">
          <el-icon size="20px" color="#ff4949"><WarningFilled /></el-icon>
          <span class="confirm-title">提示</span>
        </div>
      </template>
      <div class="confirm-content">
        确定要删除该服务吗？此操作不可恢复。
      </div>
      <template #footer>
        <span>
          <el-button @click="deleteServiceDialog = false">取消</el-button>
          <el-button type="primary" @click="singleConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import router from "@/router";
import MyChart from "@/components/MyChart.vue";
import { Search, Refresh, ArrowRight, Monitor, Plus, QuestionFilled, Document, DataAnalysis, InfoFilled, WarningFilled } from '@element-plus/icons-vue';
import request from "@/utils/request";
import { ElMessage } from "element-plus";
import { serviceStart, serviceStop, serviceDelete } from "@/utils/before";
import { useRoute } from "vue-router";

export default {
  name: "ServiceList",
  components: {
    Search,
    Refresh,
    ArrowRight,
    Monitor,
    Plus,
    QuestionFilled,
    Document,
    DataAnalysis,
    InfoFilled,
    WarningFilled
  },
  data(){
    return{
      ArrowRight,
      Monitor,
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
    // 根据状态获取服务列表
    getServicesByState(state) {
      return this.serviceListData.filter(service => {
        if (state === 'exited') {
          return service.service_state === 'exited' || service.service_state === 'stoped';
        }
        return service.service_state === state;
      });
    },

    // 获取标签类型
    getTagType(state) {
      if (state === 'running') {
        return 'success';
      } else if (state === 'waiting' || state === 'starting') {
        return 'warning';
      } else if (state === 'error' || state === 'error_connection' || state === 'error_starting' || state === 'error_running') {
        return 'danger';
      } else {
        return 'info';
      }
    },
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
.service-repository {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(to right, #4c75a3, #4c75a3);
  border-radius: 8px;
  color: white;
  margin: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.tech-title {
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.2);
  color: #ffffff !important;
}

/* 面包屑内嵌套元素样式 */
:deep(.tech-title span),
:deep(.tech-title div),
:deep(.tech-title a) {
  color: #ffffff !important;
}

.tech-title .el-icon {
  font-size: 28px;
  color: #ffffff;
}

.service-metrics {
  display: flex;
  gap: 20px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 10px 20px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.metric-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.2);
}

.metric-value {
  font-size: 26px;
  font-weight: 600;
}

.metric-label {
  font-size: 14px;
  opacity: 0.8;
}

.content-panel {
  background-color: white;
  margin: 0 20px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
  min-height: calc(100vh - 210px);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background-color: #f9fafc;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.left-area, .right-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.middle-area {
  display: flex;
  align-items: center;
  flex-grow: 1;
  margin: 0 20px;
}

.create-btn {
  padding: 8px 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-group {
  display: flex;
  align-items: center;
  margin-left: 15px;
}

.filter-label {
  margin-right: 10px;
  font-size: 14px;
  color: #606266;
}

.filter-select {
  width: 160px;
}

.search-box {
  display: flex;
  flex-direction: column;
}

.search-input {
  width: 250px;
}

.refresh-btn {
  color: #4c75a3;
  background-color: rgba(76, 117, 163, 0.05);
  border-color: #4c75a3;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: all 0.3s;
}

.refresh-btn:hover {
  background-color: rgba(76, 117, 163, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(76, 117, 163, 0.2);
}

.refresh-icon {
  font-size: 16px;
  transition: transform 0.6s ease;
}

/* 添加点击动画效果 */
.refresh-btn:active .refresh-icon {
  transform: rotate(360deg);
}

/* 加载中的动画效果 */
.refresh-icon.is-loading {
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.table-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 25px;
}

.service-table {
  width: 100%;
}

/* 表格行悬停效果 */
:deep(.el-table__row) {
  transition: all 0.2s;
}

:deep(.el-table__row:hover) {
  background-color: #f0f8ff !important;
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.03);
}

/* 表头中的图标样式 */
.header-with-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.info-icon {
  font-size: 16px;
  color: #ffffff;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  width: 65px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.action-btn-disabled {
  opacity: 0.6;
}

.info-links {
  display: flex;
  justify-content: center;
  gap: 8px;
}

:deep(.info-links .el-button--link) {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 3px;
}

/* 访问统计对话框样式 */
.access-dialog {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.access-dialog .el-dialog__header) {
  background-color: #f5f7fa;
  margin-right: 0;
  border-bottom: 1px solid #e4e7ed;
  padding: 15px 20px;
}

.access-content {
  padding: 10px 0;
}

.service-name-title {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  margin: 0 0 20px 0;
}

.access-table {
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.view-toggle {
  text-align: center;
  margin: 20px 0;
}

.chart-container {
  min-height: 350px;
  margin: 20px 0;
}

/* 确认对话框样式 */
.confirm-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.confirm-title {
  font-size: 18px;
  color: #ff4949;
  font-weight: bold;
}

.confirm-content {
  margin: 20px 10px;
  text-align: center;
  font-size: 16px;
}

:deep(.el-tag) {
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
  min-width: 80px;
}
.info-links {
  display: flex;
  justify-content: space-around;
  flex-wrap: nowrap;
  width: 100%;
  gap: 5px;
}

.info-link-btn {
  padding: 4px;
  white-space: nowrap;
  font-size: 13px;
}

:deep(.info-links .el-button--link) {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 3px;
  min-width: unset;
}
:deep(.el-tag.el-tag--info) {
  padding: 4px 8px;
  font-size: 12px;
}
/* 修改模型部署按钮样式，与DataScreen保持一致 */
.create-btn {
  background: linear-gradient(to right, #1a2942, #2a476e);
  border: none;
  border-radius: 6px;
  transition: all 0.3s;
  padding: 8px 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.create-btn:hover {
  background: linear-gradient(to right, #2a476e, #1a2942);
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(26, 41, 66, 0.2);
}

.create-btn .el-icon {
  font-size: 16px;
  margin-right: 4px;
}

/* 由于是渐变背景，需要确保文本颜色为白色 */
:deep(.create-btn span) {
  color: #ffffff;
}
</style>