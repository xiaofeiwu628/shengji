<template>
  <div class="model-repository">
    <!-- 顶部导航区域 -->
    <div class="header-area">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item class="tech-title">
          <el-icon><Box /></el-icon>
          {{ pageIndex === 1 ? '我的模型' : '公开模型' }}
        </el-breadcrumb-item>
      </el-breadcrumb>
      
      <!-- 模型概览卡片 -->
      <div class="model-metrics">
        <div class="metric-card" v-if="pageIndex === 1">
          <div class="metric-value">{{ myModelData.length }}</div>
          <div class="metric-label">我的模型总数</div>
        </div>
        <div class="metric-card" v-if="pageIndex === 1">
          <div class="metric-value">{{ getModelsByState('未部署').length }}</div>
          <div class="metric-label">未部署模型</div>
        </div>
        <div class="metric-card" v-if="pageIndex === 1">
          <div class="metric-value">{{ getModelsByState('已部署').length }}</div>
          <div class="metric-label">已部署模型</div>
        </div>
        <div class="metric-card" v-if="pageIndex === 2">
          <div class="metric-value">{{ publicModelData.length }}</div>
          <div class="metric-label">公开模型总数</div>
        </div>
      </div>
    </div>

    <div class="content-panel">
      <!-- 页面导航栏 -->
      <div class="tab-container">
        <el-menu class="el-menu-m" mode="horizontal" :default-active="pageIndex.toString()">
          <el-menu-item index="1" @click="changePageIndex(1)">我的模型</el-menu-item>
          <el-menu-item index="2" @click="changePageIndex(2)">公开模型</el-menu-item>
        </el-menu>
      </div>

      <!--我的模型-->
      <div v-if="pageIndex === 1">
        <div class="action-bar">
          <div class="left-area">
            <el-button 
              class="refresh-btn" 
              @click="loadMyModel" 
              :loading="myModelLoading"
              type="primary"
              plain>
              <el-icon class="refresh-icon" :class="{ 'is-loading': myModelLoading }"><Refresh /></el-icon>
              刷新列表
            </el-button>
          </div>
          
          <div class="middle-area">
            <div class="filter-group">
              <span class="filter-label">任务类型：</span>
              <el-select v-model="taskType" class="filter-select" @change="selectByTaskType" placeholder="选择任务类型">
                <el-option
                  v-for="item in modelStateList"
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
                v-model="selectInputByModelName"
                placeholder="输入模型名称查询"
                class="search-input"
                clearable
                @clear="loadMyModel"
                @keyup.enter="selectByModelName"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
                <template #append>
                  <el-button @click="selectByModelName">
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
          </div>
        </div>

        <!--我的模型列表-->
        <div class="table-container">
          <el-table 
            :data="myModelData" 
            border 
            v-loading="myModelLoading" 
            :row-style="{ height: '65px' }"
            :cell-style="{ 'text-align': 'center' }"
            :header-cell-style="{ 'text-align': 'center', background: '#1a2942', color: '#fff' }"
            class="model-table"
          >
            <el-table-column type="index" min-width="5%" align="center" />
            <el-table-column prop="model_name" label="模型名称" min-width="9%" align="center"/>
            <el-table-column prop="model_id" label="模型ID" min-width="10%" align="center"/>
            <el-table-column prop="model_state" label="模型状态" min-width="8%" align="center">
              <template #header>
                <div class="header-with-icon">
                  <span>模型状态</span>
                  <el-tooltip placement="top" effect="light">
                    <template #content>
                      未部署：模型当前还未部署<br />已部署：模型当前已完成部署
                    </template>
                    <el-icon class="info-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <template #default="scope">
                <el-tag 
                  :type="scope.row.model_state === 'not deployed' ? 'info' : 'success'"
                  effect="light"
                  round
                >
                  {{ modelStateDic[scope.row.model_state] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="task_id" label="所属任务ID" min-width="12%" align="center">
              <template #default="scope">
                <el-link :underline="false" type="primary" @click="toTaskDetails(scope.row)">{{ scope.row.task_id }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="task_type" label="所属任务类型" min-width="10%" align="center"/>
            <el-table-column prop="task_history_id" label="任务运行ID" min-width="13%" align="center" />
            <el-table-column prop="create_time" label="导入时间" min-width="12%" align="center"/>
            <el-table-column prop="is_public" label="是否公开" min-width="8%" align="center">
              <template #default="scope">
                <el-tag 
                  :type="scope.row.is_public === '公开' ? 'success' : 'info'"
                  round
                  effect="light"
                >
                  {{ scope.row.is_public }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop='' label="操作" min-width="13%">
              <template #default="scope">
                <div class="action-buttons">
                  <el-dropdown v-if="scope.row.model_state === 'not deployed'" class="action-dropdown">
                    <span class="el-dropdown-link">
                      部署 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="createOnlineService(scope.row)">在线服务</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  
                  <el-button 
                    v-if="scope.row.model_state === 'not deployed'"
                    link 
                    type="primary" 
                    @click="openModifyDialog(scope.row)" 
                    class="action-button"
                  >
                    修改
                  </el-button>
                  
                  <el-popconfirm title="确定删除吗？" @confirm="modelDeleteMethod(scope.row)">
                    <template #reference>
                      <el-button link type="primary" class="action-button">删除</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!--模型信息修改对话框-->
        <el-dialog v-model="modifyMyModelDialog" title="模型修改" width="500px" class="model-dialog">
          <el-form
            label-position="left"
            label-width="100px"
            :model="formOfModifyMyModel"
            style="max-width: 420px;margin-left: 10px"
          >
            <el-form-item label="模型名称">
              <el-input v-model="formOfModifyMyModel.modelName" />
            </el-form-item>
            <el-form-item label="模型描述">
              <el-input type="textarea" v-model="formOfModifyMyModel.modelDesc" />
            </el-form-item>
            <el-form-item label="是否公开">
              <el-radio-group v-model="formOfModifyMyModel.isPublic" style="margin-left: 10px" >
                <el-radio label="不公开" />
                <el-radio label="公开" />
              </el-radio-group>
            </el-form-item>
          </el-form>
          <template #footer>
            <span>
              <el-button @click="modifyMyModelDialog = false">取消</el-button>
              <el-button type="primary" @click="modifyMyModel">确定</el-button>
            </span>
          </template>
        </el-dialog>
      </div>

      <!--公开模型-->
      <div v-if="pageIndex === 2">
        <div class="action-bar">
          <div class="left-area">
            <el-button 
              class="refresh-btn" 
              @click="loadPublicModel({is_public:1})" 
              :loading="publicModelLoading"
              type="primary"
              plain>
              <el-icon class="refresh-icon" :class="{ 'is-loading': publicModelLoading }"><Refresh /></el-icon>
              刷新列表
            </el-button>
          </div>
          
          <div class="middle-area">
            <div class="filter-group">
              <span class="filter-label">所有者：</span>
              <el-select v-model="publicModelOwner" class="filter-select" @change="selectByTaskTypeAndPublic" placeholder="选择所有者">
                <el-option
                  v-for="item in publicModelOwnerList"
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
                v-model="selectInputByModelName"
                placeholder="输入模型名称查询"
                class="search-input"
                clearable
                @clear="loadPublicModel"
                @keyup.enter="selectByModelNameAndPublic"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
                <template #append>
                  <el-button @click="selectByModelNameAndPublic">
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
          </div>
        </div>
        
        <!--公开模型列表-->
        <div class="table-container">
          <el-table 
            :data="publicModelData" 
            border 
            v-loading="publicModelLoading" 
            :row-style="{ height: '65px' }"
            :cell-style="{ 'text-align': 'center' }"
            :header-cell-style="{ 'text-align': 'center', background: '#1a2942', color: '#fff' }"
            class="model-table"
          >
            <el-table-column type="index" min-width="5%" align="center" />
            <el-table-column prop="model_name" label="模型名称" min-width="9%" align="center"/>
            <el-table-column prop="model_id" label="模型ID" min-width="10%" align="center"/>
            <el-table-column prop="username" label="拥有者" min-width="10%" align="center" sortable>
              <template #default="scope">
                <div class="owner-cell">
                  <span>{{ scope.row.username }}</span>
                  <el-tag
                    :type="scope.row.modify_permission === 0 ? 'danger' : 'success'"
                    effect="light"
                    size="small"
                    round
                  >{{ scope.row.modify_permission === 0 ? '其他' : '本人' }}</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="task_id" label="所属任务ID" min-width="12%" align="center">
              <template #default="scope">
                <el-link :underline="false" type="primary" @click="toTaskDetails(scope.row)">{{ scope.row.task_id }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="task_type" label="所属任务类型" min-width="10%" align="center"/>
            <el-table-column prop="task_history_id" label="任务运行ID" min-width="13%" align="center" />
            <el-table-column prop="is_public" label="是否公开" min-width="8%" align="center">
              <template #default="scope">
                <el-tag 
                  :type="scope.row.is_public === '公开' ? 'success' : 'info'"
                  round
                  effect="light"
                >
                  {{ scope.row.is_public }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop='' label="操作" min-width="13%">
              <template #default="scope">
                <div class="action-buttons">
                  <el-dropdown v-if="scope.row.deploy_permission === 1" class="action-dropdown">
                    <span class="el-dropdown-link">
                      部署 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="createOnlineService(scope.row)">在线服务</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { Calendar,Search,ArrowDown,QuestionFilled,Refresh,ArrowRight,Box } from '@element-plus/icons-vue';
import request from "@/utils/request";
import router from "@/router";
import {ElMessage} from "element-plus";
import { dictionaryE2C } from "../AutoModel/taskStaticData";
import { useRoute } from 'vue-router';
import {modelDelete} from "@/utils/before";

export default {
  name: "MyModel",
  components: {
    Calendar,
    Search,
    ArrowDown,
    QuestionFilled,
    Refresh,
    ArrowRight,
    Box
  },
  data(){
    const E2C = dictionaryE2C;
    return{
      Calendar,
      ArrowRight,
      Box,
      pageIndex:1,
      myModelData:[
        {
          name:'模型1',
          modelId:'1',
          type:'时间序列预测',
          createTime:'2022-10-20 10:00',
        }
      ],
      formOfDeploy:{

      },
      modelSource:'自动建模',
      toHouseDialogVisible:false,
      Search,
      modelLoading:false,
      taskType:'所属任务类型',
      modelStateList:[
        {
          value:'',
          label:'全部'
        },
        {
          value:'classification',
          label:'分类'
        },
        {
          value:'regression',
          label:'回归'
        },
        {
          value:'time_series_prediction',
          label:'时间序列预测'
        },
        {
          value: 'named_entity_recognition',
          label: '命名实体识别'
        }
      ],
      E2C,
      selectInputByModelName:'',
      modelStateDic:{
        'not deployed' : '未部署',
        'deployed' : '已部署'
      },
      publicModelLoading:false,
      myModelLoading:false,
      publicModelData:[],
      publicModelOwnerList:[
        {
          label:'显示所有公开模型',
          value:1
        },
        {
          label:'显示当前用户公开模型',
          value:2
        },
        {
          label:'显示其他用户公开模型',
          value:3
        }
      ],
      publicModelOwner:1,
      modifyMyModelDialog:false,
      formOfModifyMyModel:{},
      myModelInfo:{
        modelID:'',
        taskId:'',
      }

    }
  },
  components:{
    ArrowDown,
    QuestionFilled
  },
  watch:{
    pageIndex:{
      handler(){
        if(this.pageIndex === 1){
          this.loadMyModel();
        }else if(this.pageIndex === 2){
          this.loadPublicModel();
        }else{
          return
        }
      },
      deep:true,
    },
  },
  created() {
    const route = useRoute();
    if(route.query.modelId){
      let modelId = route.query.modelId;
      let middle = {model_id:modelId};
      this.loadMyModel(middle);
    }else{
      this.loadMyModel();
    }
  },
  methods:{
    // 添加一个获取特定状态模型的方法
    getModelsByState(state) {
      return this.myModelData.filter(model => this.modelStateDic[model.model_state] === state);
    },
    //切换模型页面
    changePageIndex(param){
      this.pageIndex = param;
    },
    //加载模型的接口
    loadMyModel(param,time){
      this.myModelLoading = true;
      setTimeout(()=>{
        request.get('/ModelRepository/GetModelList',{
          params:param ? param : {}
        }).then(res=>{
          console.log(res.data,'res.data in myModel')
          this.myModelData = res.data;
          console.log(res.data,'res.data in loadModel')
          this.myModelData.forEach(item=>{
            item.is_public = (item.is_public === '0' ? '不公开':'公开');
            item.task_type = Object.keys(this.E2C).includes(item.task_type) ? this.E2C[item.task_type] : item.task_type;
          })
          this.myModelLoading = false;
        }).catch(err=>{
          this.myModelLoading = false;
          ElMessage({
            message:"加载失败！",
            type:'error',
            offset:60
          });
        })
      },time ? time:1000)
    },
    //加载公开模型
    loadPublicModel(param,time){
      this.publicModelLoading = true;
      console.log(param,'param in loadpublicmodel')
      setTimeout(()=>{
        request.get('/ModelRepository/GetModelList',{
          params:param ? param : {is_public:1}
        }).then(res=>{
          console.log(res.data,'res.data in loadPublicModel')
          this.publicModelData = res.data;
          this.publicModelData.forEach(item=>{
            item.is_public = (item.is_public === '0' ? '不公开':'公开');
            item.task_type = Object.keys(this.E2C).includes(item.task_type) ? this.E2C[item.task_type] : item.task_type;
          })
          this.publicModelLoading = false;
        }).catch(err=>{
          this.publicModelLoading = false;
          ElMessage({
            message:"加载失败！",
            type:'error',
            offset:60
          });
        })
      },time ? time:1000)
    },
    //打开修改模型信息的窗口
    openModifyDialog(param){
      this.modifyMyModelDialog = true;
      //保存模型的ID和对应任务的ID
      this.myModelInfo.modelID = param.model_id;
      this.myModelInfo.taskId = param.task_id;
      //初始化未修改前的模型相关信息
      this.formOfModifyMyModel.isPublic = param.is_public;
      this.formOfModifyMyModel.modelName = param.model_name;
      this.formOfModifyMyModel.modelDesc = param.model_desc;
    },
    //修改模型的基本信息
    modifyMyModel(){
      this.modifyMyModelDialog = false;
      let middle = {
        model_id:this.myModelInfo.modelID,
        task_id:this.myModelInfo.taskId,
        model_name:this.formOfModifyMyModel.modelName,
        model_desc:this.formOfModifyMyModel.modelDesc,
        is_public:this.formOfModifyMyModel.isPublic === '不公开' ? 0 : 1
      }
      request.put('/ModelRepository/UpdateModel',middle,{
            headers:{'dateType':'json','Content-Type':'application/json'}
          }
      ).then(res=>{
        ElMessage({
          message:'修改成功!',
          type:'success',
          offset:60
        })
      }).catch(err=>{
        ElMessage({
          message:'修改失败!',
          type:'error',
          offset:60
        })
      })
      console.log(middle,'middle in modifyMyModel');
      this.loadMyModel();
    },
    //点击部署在线服务
    createOnlineService(param){
      router.push({path:'/onlineServiceDeploy',query:{modelName:param.model_name,modelId:param.model_id,
          taskId:param.task_id,task_history_id:param.task_history_id,deployMode:'modelSpecific'}});
    },
    //根据任务的类型筛选模型(我的模型)
    selectByTaskType(val){
      let middle = {task_type:val}
      this.loadMyModel(middle)
    },
    //根据任务的类型筛选模型(公开模型)
    selectByTaskTypeAndPublic(val){
      let middle = {is_public:val}
      this.loadPublicModel(middle);
    },
    //通过模型名称模糊搜索(我的模型)
    selectByModelName(){
      let middle = {model_name:this.selectInputByModelName};
      this.loadMyModel(middle);
    },
    //通过模型名称模糊搜索(公开模型)
    selectByModelNameAndPublic(){
      let middle = {model_name:this.selectInputByModelName,is_public:1};
      this.loadPublicModel(middle);
    },
    //点击所属历史任务ID跳转到任务的详情页
    toTaskDetails(param){
      console.log('跳转了')
      router.push({path:'/taskDetails',query:{taskId:param.task_id,taskState:'训练完成',pageIndex:'3'}})
    },
    modelDeleteMethod(param){
      let middle = {model_id:param.model_id}
      console.log(param.model_id,'modelid in modelDeletemethod')
      modelDelete(middle).then(res=>{
        this.loadModel(null,2000);
        setTimeout(()=>{
          ElMessage({
            message:'删除成功！',
            type:'success',
            offset:60
          })
        },2000)
        console.log(res.data,'res.data in modelDeletemethod')
      }).catch(err=>{
        ElMessage({
          message:'删除失败！',
          type:'error',
          offset:60
        })
      })
    },
  }
}
</script>

<style scoped>
.model-repository {
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

.model-metrics {
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

.tab-container {
  margin-bottom: 20px;
}

.el-menu-m {
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

:deep(.el-menu-m .el-menu-item) {
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-menu-m .el-menu-item.is-active) {
  background-color: rgba(76, 117, 163, 0.1);
  color: #4c75a3;
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
  width: 200px;
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

.model-table {
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

/* 拥有者单元格样式 */
.owner-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.action-button {
  font-weight: 500;
}

.action-dropdown {
  display: inline-block;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #409EFF;
}

/* 对话框样式 */
.model-dialog {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.model-dialog .el-dialog__header) {
  background-color: #f5f7fa;
  margin-right: 0;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-tag) {
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
}
</style>
