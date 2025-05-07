<template>
  <div>
    <div style="margin: 20px 0 0 2%">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/onlineServiceList' }">在线服务</el-breadcrumb-item>
        <el-breadcrumb-item >模型部署</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
<!--    <el-divider style="margin: 15px 0 0 0" />-->
    <div style="background-color: white;margin: 20px;min-height: calc(100vh - 124px)">
      <!--    服务配置-->
      <div>
        <div style="padding: 30px 0 0 2%">
          <div class="task-title-div"></div>
          <span class="task-title-name">服务配置</span>
        </div>
        <div style="margin: 20px 0 0 100px">
          <el-form
              label-position="right"
              label-width="100px"
              :model="formOfServiceConfig"
              style="max-width: 420px;"
              :rules="rules"
              ref="serviceInfoRef"
          >
            <el-form-item label="服务名称" prop="serviceName" :inline-message="true">
              <el-input style="margin-left: 10px" v-model="formOfServiceConfig.serviceName" />
            </el-form-item>
            <el-form-item label="服务描述">
              <el-input style="margin-left: 10px" type="textarea" placeholder="请输入模型描述，100字以内" maxlength="100" :rows="3" v-model="formOfServiceConfig.serviceDesc" />
            </el-form-item>
            <el-form-item label="部署方式" v-if="mode === 'modelCommon' || mode === 'imageCommon'">
              <el-radio-group v-model="formOfServiceConfig.deployMode" style="margin-left: 10px" @change="changeDeployMode">
                <el-radio label="模型部署" />
                <el-radio label="镜像部署" />
              </el-radio-group>
            </el-form-item>

          </el-form>
        </div>
      </div>
      <!--    模型选择-->
      <div v-if="mode === 'modelCommon' || mode === 'modelSpecific'">
        <div style="margin: 30px 0 0 2%">
          <div class="task-title-div"></div>
          <span class="task-title-name">模型选择</span>
        </div>
        <div style="margin: 20px 0 0 100px">
          <el-form
              label-position="right"
              label-width="100px"
              :model="formOfModelSelection"
              style="max-width: 420px;"
              :rules="rules"
              ref="modelSelectRef"
          >
            <el-form-item label="模型来源" v-if="mode === 'modelCommon'">
              <el-radio-group style="margin-left: 10px" v-model="formOfModelSelection.source">
                <el-radio label="我的模型" />
<!--                <el-radio label="公开模型" />-->
              </el-radio-group>
            </el-form-item>
            <el-form-item label="任务类型" v-if="mode === 'modelCommon'">
              <el-select style="margin-left: 10px;width: 420px" v-model="formOfModelSelection.taskType" >
                <el-option
                    v-for="option in taskTypeList"
                    :key="option"
                    :label="option"
                    :value="option"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="模型名称" prop="modelName" :inline-message="true" v-if="mode === 'modelCommon'">
              <el-select style="margin-left: 10px;width: 420px" v-model="formOfModelSelection.modelName">
                <el-option
                    v-for="option in modelInRepositoryList"
                    :key="option.model_id"
                    :label="option.model_name"
                    :value="option.model_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="模型名称" v-if="mode === 'modelSpecific'">
              <span style="margin-left: 10px">{{formOfModelSelection.modelName}}</span>
            </el-form-item>
            <el-form-item label="模型ID" v-if="mode === 'modelSpecific'">
              <span style="margin-left: 10px">{{formOfModelSelection.modelId}}</span>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <!--    镜像选择-->
      <div v-if="mode === 'imageCommon' || mode === 'imageSpecific'">
        <div style="margin: 30px 0 0 2%">
          <div class="task-title-div"></div>
          <span class="task-title-name">镜像选择</span>
        </div>
        <div style="margin: 20px 0 0 100px">
          <el-form
              label-position="right"
              label-width="100px"
              :model="formOfImageSelection"
              style="max-width: 420px;"
              :rules="rules"
              ref="imageSelectRef"
          >
            <el-form-item label="镜像来源" v-if="mode === 'imageCommon'">
              <el-radio-group style="margin-left: 10px" v-model="formOfImageSelection.source">
                <el-radio label="我的镜像" />
<!--                <el-radio label="公开镜像" />-->
              </el-radio-group>
            </el-form-item>
            <el-form-item label="镜像名称" prop="imageName" :inline-message="true" v-if="mode === 'imageCommon'">
              <el-select style="margin-left: 10px;width: 420px" v-model="formOfImageSelection.imageName" @change="loadImageVersion">
                <el-option
                    v-for="option in imageInRepositoryList"
                    :key="option.image_id"
                    :label="option.image_name"
                    :value="option.image_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="镜像名称" v-if="mode === 'imageSpecific'">
              <span style="margin-left: 10px">{{formOfImageSelection.imageName}}</span>
            </el-form-item>
            <el-form-item label="版本号" prop="tag" :inline-message="true" v-if="mode === 'imageCommon'">
              <el-select style="margin-left: 10px;width: 420px" v-model="formOfImageSelection.tag" >
                <el-option
                    v-for="option in imageVersionList"
                    :key="option.image_version_id"
                    :label="option.tag"
                    :value="option.image_version_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="版本号"  v-if="mode === 'imageSpecific'">
              <span style="margin-left: 10px">{{formOfImageSelection.tag}}</span>
            </el-form-item>
            <el-form-item label="镜像ID" v-if="mode === 'imageSpecific'">
              <span style="margin-left: 10px">{{formOfImageSelection.imageId}}</span>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <!--    资源配置-->
      <div>
        <div style="margin: 30px 0 0 2%">
          <div class="task-title-div"></div>
          <span class="task-title-name">资源配置</span>
        </div>
        <div style="margin: 20px 0 0 100px">
          <el-form
              label-position="right"
              label-width="100px"
              :model="formOfSourceConfig"
              style="max-width: 420px;"
          >
            <el-form-item label="内存">
              <el-input style="margin-left: 10px;width: 80%" v-model="formOfSourceConfig.memory" />
              <span style="display: inline-block;margin-left: 10px">{{'GB'}}</span>
            </el-form-item>
            <el-form-item label="CPU核心数">
              <el-input style="margin-left: 10px" v-model="formOfSourceConfig.cpuCoresNum" />
            </el-form-item>
            <el-form-item style="margin-top: 40px" v-if="mode !== 'imageCommon' && mode !== 'imageSpecific'">
              <div style="width: 100%;text-align: right">
                <el-button  >取消</el-button>
                <el-button type="primary" color="#626aef"  @click="formValidate" v-loading.fullscreen.lock="fullscreenLoading">开始部署</el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <!--    容器配置-->
      <div v-if="mode === 'imageCommon' || mode === 'imageSpecific'">
        <div style="margin: 30px 0 0 2%">
          <div class="task-title-div"></div>
          <span class="task-title-name">容器配置</span>
        </div>
        <div style="margin: 20px 0 0 100px">
          <el-form
              label-position="right"
              label-width="100px"
              :model="formOfContainerConfig"

              :rules="rules"
              ref="containerConfigRef"
          >
<!--            <el-form-item label="启动命令">-->
<!--              <el-input style="margin-left: 10px" v-model="formOfContainerConfig.startCommand" />-->
<!--            </el-form-item>-->
            <el-form-item label="服务端口号" prop="servicePort" :inline-message="true" style="max-width: 420px">
              <el-input style="margin-left: 10px" v-model="formOfContainerConfig.servicePort" />
            </el-form-item>
            <el-form-item label="环境变量" prop="env" :inline-message="true">
              <div style="width:100%">
                <el-button type="primary" style="margin-left: 20px;" @click="addEnvironment" :icon="Plus" size="small" round >添加环境变量</el-button>
              </div>
              <div style="margin: 10px 0 0 10px" v-for="(item,index) in environment">
                <el-input v-model="item.name"  style="width: 300px">
                  <template #prepend>name</template>
                </el-input>
                <el-icon style="width: 60px" size="large"><Right /></el-icon>
                <el-input v-model="item.value"  style="width: 300px">
                  <template #prepend>value</template>
                </el-input>
                <el-button type="primary" :icon="Delete" style="margin-left: 10px;" @click="removeEnvironment(index)"/>
              </div>
            </el-form-item>
            <el-form-item  >
              <div style="width: 25%;text-align: right;margin: 20px 0">
                <el-button  >取消</el-button>
                <el-button type="primary" color="#626aef"  @click="formValidate" v-loading.fullscreen.lock="fullscreenLoading">开始部署</el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>


    </div>
  </div>
</template>

<script>
import router from "@/router";
import request from "@/utils/request";
import {ref} from "vue";
import { ArrowRight,Delete,Plus } from '@element-plus/icons-vue';
import { dictionaryC2E } from '../AutoModel/taskStaticData';
import { useRoute } from 'vue-router';
import { serviceDeploy,imageDeploy } from "@/utils/before";
import {ElMessage} from "element-plus";

export default {
  name: "OnlineServiceDeploy",
  data(){
    const C2E = dictionaryC2E;
    return{
      formOfServiceConfig:{
        serviceName:'',
        serviceDesc:'',
        deployMode:'模型部署',
      },
      formOfModelSelection:{
        source:'我的模型',
        taskType:'时间序列预测',
        modelName:''
      },
      formOfImageSelection:{
        source:'我的镜像',
        imageName:'',
        tag:'',
      },
      formOfSourceConfig:{
        memory:2,
        cpuCoresNum:2
      },
      formOfContainerConfig:{
        servicePort:'',
      },
      modelInRepositoryList:[],
      imageInRepositoryList:[],
      imageVersionList:[],
      ArrowRight,
      taskTypeList:['时间序列预测','回归','分类','命名实体识别'],
      C2E,
      mode:'modelCommon',
      task_id:'',
      task_history_id:'',
      rules:{
        serviceName:[{required:true,message:'请输入服务名称！'}],
        modelName:[{required:true,message:'请选择模型名称！',trigger:'change'}],
        imageName:[{required:true,message:'请选择镜像名称！',trigger:'change'}],
        tag:[{required:true,message:'请选择版本号！',trigger:'change'}],
        servicePort:[{required:true,message:'请填写服务端口号！',trigger:'change'}],
      },
      fullscreenLoading:false,
      environment:[],
      Delete,
      Plus
    }
  },
  created() {
    this.checkMode();

  },
  watch:{
    'formOfModelSelection.taskType':{
      handler(newValue,oldValue){
        console.log(newValue,'newValue')
        console.log(oldValue,'oldValue')
        this.loadModel();
      },
      deep:true
    },
  },
  computed:{

  },
  mounted() {
    // console.log(this.myModelList,'this.myModellist');
    // this.modelInRepositoryList
  },
  methods:{
    //服务部署共有四种，modelCommon,modelSpecific,imageCommon,imageSpecific
    checkMode(){
      const route = useRoute();
      if(route.query.deployMode === 'modelSpecific'){
        this.mode = 'modelSpecific';
        this.formOfModelSelection.modelName = route.query.modelName;
        this.formOfModelSelection.modelId = route.query.modelId;
        this.task_id = route.query.taskId;
        this.task_history_id = route.query.task_history_id;
        console.log(this.formOfModelSelection,'formOfModelSelection')
        console.log(this.mode)
      }else if(route.query.deployMode === 'imageSpecific'){
        console.log(route.query)
        this.mode = 'imageSpecific';
        this.formOfImageSelection.imageName = route.query.imageName;
        this.formOfImageSelection.imageId = route.query.imageId;
        this.formOfImageSelection.tag = route.query.imageTag;
        this.formOfImageSelection.tagId = route.query.imageVersionId;
      }
      else{
        this.mode = 'modelCommon';
        this.loadModel();
      }
    },
    //根据任务类型加载模型
    loadModel(){
      this.modelInRepositoryList = [];
      let middle =Object.keys(this.C2E).includes(this.formOfModelSelection.taskType) ? this.C2E[this.formOfModelSelection.taskType] : 'string';
      request.get('/ModelRepository/GetModelList',{
        params:{
          task_type:middle
        }
      }).then(res=>{
        console.log(res.data,'res.data in myModel');
        res.data.forEach(item=>{
          if(item.model_state === 'not deployed'){
            this.modelInRepositoryList.push(item)
          }
          // let middle = {modelName:item.model_name,modelId:item.model_id};

        })
        console.log(this.modelInRepositoryList,'modelInRepositoryList')
      })
    },
    loadImage(param){
      this.imageInRepositoryList = [];
      request.get('/ImageRepository/GetImageRepositoryList',{
        params:param ? param : {}
      }).then(res=>{
        console.log(res.data,'data')
        res.data.forEach(item=>{
          this.imageInRepositoryList.push(item)
        })
      })
    },
    loadImageVersion(param){
      this.imageVersionList = [];
      this.imageInRepositoryList.forEach(item=>{
        if(item.image_id === param){
          let data = [];
          item.image_version.forEach(option=>{
            if(option.is_used === 0){
              data.push(option)
            }
          })
          this.imageVersionList = data;
        }
      })
      console.log(this.imageVersionList,'imageVersionList')
    },
    changeDeployMode(val){
      if(val === '模型部署'){
        this.mode = 'modelCommon';
      }else if(val === '镜像部署'){
        this.mode = 'imageCommon';
        this.loadImage();
      }else{
        ElMessage({message:'选择部署方式出错',type:'error',offset:60});
      }
    },
    //表单校验结果
    async formValidate(){
      let serviceErr = true;//服务名称校验
      let modelErr = true;//模型选择校验
      let imageErr = true;//镜像选择校验
      let containerErr = true;//容器配置校验
      //判断服务名称是否填写
      await this.$refs.serviceInfoRef.validate((valid)=>{
        serviceErr = valid ? false : true;
      })
      if(this.mode === 'modelCommon'){
        //模型是否选择
        await this.$refs.modelSelectRef.validate((valid)=>{
          modelErr = valid ? false : true;
        })

        if(!serviceErr && !modelErr){
          this.modelDeployStart();
        }else{
          ElMessage({message:'请完善部署信息！', type:'error', offset:60})
        }
      }else if(this.mode === 'imageCommon'){
        //镜像是否选择
        await this.$refs.imageSelectRef.validate((valid)=>{
          imageErr = valid ? false : true;
        })
        //容器配置是否填写
        await this.$refs.containerConfigRef.validate((valid)=>{
          containerErr = valid ? false : true;
        })

        if(!serviceErr && !imageErr && !containerErr){
          this.imageDeployStart();
        }else{
          ElMessage({message:'请完善部署信息！', type:'error', offset:60})
        }
      }
      else if(this.mode === 'imageSpecific'){
        //容器配置是否填写
        await this.$refs.containerConfigRef.validate((valid)=>{
          containerErr = valid ? false : true;
        })

        if(!serviceErr && !containerErr){
          this.imageDeployStart();
        }else{
          ElMessage({message:'请完善部署信息！', type:'error', offset:60})
        }
      }
      else{//modelSpecific的情况，只需要对服务基本信息进行校验
        if(!serviceErr){
          this.modelDeployStart();
        }else{
          ElMessage({message:'请完善部署信息！', type:'error', offset:60})
        }
      }
    },
    //模型部署
    modelDeployStart(){
      const middle = {};
      //针对某一模型部署
      if(this.mode === 'modelSpecific'){
        middle['model_id'] = parseInt(this.formOfModelSelection.modelId);
        middle['task_id'] = this.task_id;
        middle['task_history_id'] = this.task_history_id;
        middle['service_name'] = this.formOfServiceConfig.serviceName;
        middle['service_desc'] = this.formOfServiceConfig.serviceDesc;
        middle['memory'] = this.formOfSourceConfig.memory * 1000000000;
        middle['cpu_cores_num'] = this.formOfSourceConfig.cpuCoresNum;
        middle['type'] = 'official';
      }
      //选择模型部署
      else{
        this.modelInRepositoryList.forEach(item=>{
          if(item.model_id === this.formOfModelSelection.modelName){
            middle['model_id'] = item.model_id;
            middle['task_id'] = item.task_id;
            middle['task_history_id'] = item.task_history_id;
            middle['service_name'] = this.formOfServiceConfig.serviceName;
            middle['service_desc'] = this.formOfServiceConfig.serviceDesc;
            middle['memory'] = this.formOfSourceConfig.memory  * 1000000000;
            middle['cpu_cores_num'] = this.formOfSourceConfig.cpuCoresNum;
            // middle['request_data'] = {};
            // middle['return_data'] = {};
            middle['type'] = 'official';
          }
        })
      }
      console.log(middle,'middle');
      this.fullscreenLoading = true;
      serviceDeploy(middle).then(res=>{
        console.log(res.data,'res.data in startDeploy')
        setTimeout(()=>{
          this.fullscreenLoading = false;
          ElMessage({message:'部署成功！', type:'success', offset:60})
          router.push('onlineServiceList');
        },1000)
      }).catch(err=>{
        this.fullscreenLoading = false;
        ElMessage({message:'部署失败！', type:'error', offset:60})
      })

    },
    //镜像部署
    imageDeployStart(){
      let middle = {};
      let env = {}
      if(this.environment.length > 0){
        this.environment.forEach(item=>{
          env[item.name] = item.value;
        })
      }
      if(this.mode === 'imageSpecific'){
        middle['service_name'] = this.formOfServiceConfig.serviceName,
        middle['service_desc'] = this.formOfServiceConfig.serviceDesc,
        middle['memory'] = this.formOfSourceConfig.memory * 1000000000,
        middle['cpu_cores_num'] = this.formOfSourceConfig.cpuCoresNum,
        middle['image_version_id'] = parseInt(this.formOfImageSelection.tagId),
        middle['env'] = env,
        middle['image_port'] = this.formOfContainerConfig.servicePort,
        middle['image_name'] = this.formOfImageSelection.imageName,
        middle['image_tag'] = this.formOfImageSelection.tag,
        middle['type'] = 'custom'
      }else{
        middle['service_name'] = this.formOfImageSelection.imageName,
        middle['service_desc'] = this.formOfServiceConfig.serviceDesc,
        middle['memory'] = this.formOfSourceConfig.memory * 1000000000,
        middle['cpu_cores_num'] = this.formOfSourceConfig.cpuCoresNum,
        middle['image_version_id'] = parseInt(this.formOfImageSelection.tag),
        middle['env'] = env,
        middle['image_port'] = this.formOfContainerConfig.servicePort,
        middle['image_name'] = this.formOfImageSelection.imageName,
        middle['image_tag'] = this.formOfImageSelection.tag,
        middle['type'] = 'custom'
      }
      console.log(middle,'middle');
      this.fullscreenLoading = true;
      imageDeploy(middle).then(res=>{
        console.log(res.data,'res.data in imagedeploy')
        setTimeout(()=>{
          this.fullscreenLoading = false;
          ElMessage({message:'部署成功！', type:'success', offset:60})
          router.push('onlineServiceList');
        },1000)
      }).catch(err=>{
        this.fullscreenLoading = false;
        ElMessage({message:'部署失败！', type:'error', offset:60})
      })
    },
    addEnvironment(){
      this.environment.push({
        index:this.environment.length,
        name:"",
        value:""
      })
    },
    removeEnvironment(param){
      this.environment.splice(param,1);
      console.log(this.environment,'this.volumeList')
    },

  }
}
</script>

<style scoped>

</style>
