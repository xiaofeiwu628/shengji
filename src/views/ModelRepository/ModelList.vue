<template>
  <div>
    <div>
      <div style="margin: 20px 0 0 2%">
        <el-breadcrumb :separator-icon="ArrowRight">
          <el-breadcrumb-item v-if="pageIndex === 1">我的模型</el-breadcrumb-item>
          <el-breadcrumb-item v-if="pageIndex === 2">公开模型</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div style="padding: 20px 20px 0 20px;">
        <el-menu class="el-menu-m" mode="horizontal" default-active="1">
          <el-menu-item index="1" @click="changePageIndex(1)">我的模型</el-menu-item>
          <el-menu-item index="2" @click="changePageIndex(2)" >公开模型</el-menu-item>
        </el-menu>
      </div>
      <!--    <el-divider style="margin: 15px 0 0 0" />-->
      <div style="background-color: white;margin: 20px;min-height: calc(100vh - 203px)">

<!--        我的模型-->
        <div v-if="pageIndex === 1">
          <!--    导入、搜索查询-->
          <div style="display:flex;padding:40px 2% 0 2%">
            <!--          <el-button  type="primary" style="width: 80px" @click="modelDeploy">导入</el-button>-->
            <el-icon size="20px" @click="loadMyModel" style="cursor: pointer"><Refresh /></el-icon>
            <div style="display: inline-block;flex: 1"></div>
            <el-select v-model="taskType" class="m-2" style="width: 250px" @change="selectByTaskType">
              <el-option
                  v-for="item in modelStateList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
            <el-input
                v-model="selectInputByModelName"
                class="w-50 m-2"
                clearable
                style="width: 250px;margin-left: 30px"
                placeholder="输入模型名称查询"
                @clear="loadMyModel"
            />
            <el-button  type="primary" style="margin-left: 10px" @click="selectByModelName">查询</el-button>
          </div>
          <!--        我的模型列表-->
          <div>
            <el-table :data="myModelData" border style="width: 96%;margin: 20px 0 40px 2%" v-loading="myModelLoading" :row-style="{height:'65px'}" >
              <el-table-column type="index" min-width="5%" align="center" />
              <el-table-column prop="model_name" label="模型名称" min-width="9%" align="center"/>
              <el-table-column prop="model_id" label="模型ID" min-width="10%" align="center"/>
              <el-table-column prop="model_state" label="模型状态" min-width="8%" align="center">
                <template #header>
                  <span style="vertical-align: middle;display: inline-block;line-height: 20px">{{"模型状态"}}</span>
                  <el-tooltip  placement="top" effect="light">
                    <template #content>
                      未部署：模型当前还未部署<br />已部署：模型当前已完成部署
                    </template>
                    <el-icon :size="16" style="vertical-align: middle;cursor: pointer;margin-left: 5px;line-height: 20px"><QuestionFilled /></el-icon>
                  </el-tooltip>

                </template>
                <template #default="scope">{{modelStateDic[scope.row.model_state]}}</template>
              </el-table-column>
              <el-table-column prop="task_id" label="所属任务ID" min-width="12%" align="center">
                <template #default="scope">
                  <el-link :underline="false" type="primary" @click="toTaskDetails(scope.row)">{{ scope.row.task_id }}</el-link>
                </template>
              </el-table-column>
              <el-table-column prop="task_type" label="所属任务类型" min-width="10%" align="center"/>
              <el-table-column prop="task_history_id" label="任务运行ID" min-width="13%" align="center" />
              <el-table-column prop="create_time" label="导入时间" min-width="12%" align="center"/>
              <el-table-column prop="is_public" label="是否公开" min-width="8%" align="center"/>
              <el-table-column prop='' label="操作" min-width="13%">
                <template #default="scope">

                  <el-dropdown class="myModelButton" v-if="scope.row.model_state === 'not deployed'">
                  <span class="el-dropdown-link">
                    部署
                    <el-icon class="el-icon--right">  <ArrowDown />  </el-icon>
                  </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="createOnlineService(scope.row)">在线服务</el-dropdown-item>
                        <!--                          <el-dropdown-item>离线服务</el-dropdown-item>-->
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <el-button link type="primary" class="myModelButton" @click="openModifyDialog(scope.row)" v-if="scope.row.model_state === 'not deployed'">修改</el-button>
                  <el-popconfirm title="确定删除吗？" @confirm="modelDeleteMethod(scope.row)">
                    <template #reference>
                      <el-button link type="primary" class="myModelButton">删除</el-button>
                    </template>
                  </el-popconfirm>

                </template>
              </el-table-column>
            </el-table>
          </div>
          <!--    模型信息修改对话框-->
          <div>
            <el-dialog v-model="modifyMyModelDialog" title="模型修改" width="500px">
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
                <el-button @click="this.modifyMyModelDialog = false">取消</el-button>
                <el-button type="primary" @click="modifyMyModel">确定</el-button>
              </span>
              </template>
            </el-dialog>
          </div>
        </div>



<!--        公开模型-->
        <div v-if="pageIndex === 2">
          <!--    导入、搜索查询-->
          <div style="display:flex;padding:40px 2% 0 2%">
            <!--          <el-button  type="primary" style="width: 80px" @click="modelDeploy">导入</el-button>-->
            <el-icon size="20px" @click="loadPublicModel({is_public:1})" style="cursor: pointer"><Refresh /></el-icon>
            <div style="display: inline-block;flex: 1"></div>
            <el-select v-model="publicModelOwner" class="m-2" style="width: 250px" @change="selectByTaskTypeAndPublic">
              <el-option
                  v-for="item in publicModelOwnerList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
            <el-input
                v-model="selectInputByModelName"
                class="w-50 m-2"
                clearable
                style="width: 250px;margin-left: 30px"
                @clear="loadPublicModel"
            />
            <el-button  type="primary" style="margin-left: 10px" @click="selectByModelNameAndPublic">查询</el-button>
          </div>
          <!--        公开模型列表-->
          <div>
            <el-table :data="publicModelData" border style="width: 96%;margin: 20px 0 40px 2%" v-loading="publicModelLoading" :row-style="{height:'65px'}" >
              <el-table-column type="index" min-width="5%" align="center" />
              <el-table-column prop="model_name" label="模型名称" min-width="9%" align="center"/>
              <el-table-column prop="model_id" label="模型ID" min-width="10%" align="center"/>
              <el-table-column prop="username" label="拥有者" min-width="10%" align="center" sortable>
                <template #default="scope">
                  <div >
                    <span style="margin-right: 10px">{{scope.row.username}}</span>
                    <el-tag
                        :type="scope.row.modify_permission === 0 ? 'danger' : 'success'"
                        disable-transitions
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
<!--              <el-table-column prop="create_time" label="导入时间" min-width="12%" align="center"/>-->
              <el-table-column prop="is_public" label="是否公开" min-width="8%" align="center"/>
              <el-table-column prop='' label="操作" min-width="13%">
                <template #default="scope">
                  <el-dropdown style="vertical-align: middle;margin-left: 5px" v-if="scope.row.deploy_permission === 1">
                  <span class="el-dropdown-link">
                    部署
                    <el-icon class="el-icon--right">  <ArrowDown />  </el-icon>
                  </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="createOnlineService(scope.row)">在线服务</el-dropdown-item>
                        <!--                          <el-dropdown-item>离线服务</el-dropdown-item>-->
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
<!--                  公开模型应该不能删除-->
<!--                  <el-popconfirm title="确定删除吗？" @confirm="modelDeleteMethod(scope.row)">-->
<!--                    <template #reference>-->
<!--                      <el-button link type="primary" style="vertical-align: middle;margin-left: 5px">删除</el-button>-->
<!--                    </template>-->
<!--                  </el-popconfirm>-->

                </template>
              </el-table-column>
            </el-table>
          </div>

        </div>



      </div>

    </div>

  </div>
</template>

<script>
import { Calendar,Search,ArrowDown,QuestionFilled } from '@element-plus/icons-vue';
import request from "@/utils/request";
import router from "@/router";
import {ElMessage} from "element-plus";
import { dictionaryE2C } from "../AutoModel/taskStaticData";
import { useRoute } from 'vue-router';
import {modelDelete} from "@/utils/before";

export default {
  name: "MyModel",
  data(){
    const E2C = dictionaryE2C;
    return{
      Calendar,
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
.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
.myModelButton{
  /*height:20px;*/
  /*line-height: 20px;*/
  vertical-align: middle;
  margin-left: 5px;
}
:deep(.el-table--enable-row-hover .el-table__body tr:hover>td.el-table__cell){
  background-color: rgba(137, 147, 152, 0.15);
}
</style>
