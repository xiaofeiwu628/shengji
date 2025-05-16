<template>
  <div class="deploy-container">
    <!-- 头部区域 -->
    <div class="header-area">
      <div class="tech-title">
        <el-icon><Connection /></el-icon>
        <el-breadcrumb :separator-icon="ArrowRight" class="nav-breadcrumb">
          <el-breadcrumb-item :to="{ path: '/onlineServiceList' }" class="tech-breadcrumb">
            在线服务
          </el-breadcrumb-item>
          <el-breadcrumb-item class="tech-breadcrumb">
            模型部署
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="main-content-wrapper">
      
      <!-- 服务配置 -->
      <div class="config-section">
        <div class="section-header">
          <div class="section-title-indicator"></div>
          <span class="section-title">服务配置</span>
        </div>
        <div class="form-container dual-column">
          <div class="left-column">
            <el-form
              label-position="right"
              label-width="100px"
              :model="formOfServiceConfig"
              :rules="rules"
              ref="serviceInfoRef"
              class="styled-form"
            >
              <el-form-item label="服务名称" prop="serviceName" :inline-message="true">
                <el-input class="styled-input" v-model="formOfServiceConfig.serviceName" placeholder="请输入服务名称" />
              </el-form-item>
              
              <el-form-item label="服务描述">
                <el-input 
                  class="styled-input" 
                  type="textarea" 
                  placeholder="请输入模型描述，100字以内" 
                  maxlength="100" 
                  :rows="3" 
                  v-model="formOfServiceConfig.serviceDesc" 
                  show-word-limit
                />
              </el-form-item>
              
              <el-form-item label="部署方式" v-if="mode === 'modelCommon' || mode === 'imageCommon'">
                <el-radio-group v-model="formOfServiceConfig.deployMode" @change="changeDeployMode" class="deploy-mode-radio">
                  <el-radio value="模型部署">模型部署</el-radio>
                  <el-radio value="镜像部署">镜像部署</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>
          <div class="right-column">
            <div class="info-card">
              <div class="info-card-header">
                <el-icon><Document /></el-icon>
                <span>服务部署说明</span>
              </div>
              <div class="info-card-body">
                <div class="help-content">
                  <p>在线服务部署可以让您的模型以API形式提供服务，支持以下特性：</p>
                  <ul>
                    <li>高可用性：自动扩缩容和负载均衡</li>
                    <li>实时监控：流量、资源使用和健康状态</li>
                    <li>便捷管理：一键启停、更新和回滚</li>
                  </ul>
                  <div class="tips-box">
                    <strong>提示：</strong>服务名称应简洁明了，便于识别和管理
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模型选择 -->
      <div v-if="mode === 'modelCommon' || mode === 'modelSpecific'" class="config-section">
        <div class="section-header">
          <div class="section-title-indicator"></div>
          <span class="section-title">模型选择</span>
        </div>
        <div class="form-container dual-column">
          <div class="left-column">
            <el-form
              label-position="right"
              label-width="100px"
              :model="formOfModelSelection"
              :rules="rules"
              ref="modelSelectRef"
              class="styled-form"
            >
              <el-form-item label="模型来源" v-if="mode === 'modelCommon'">
                <el-radio-group v-model="formOfModelSelection.source" class="model-source-radio">
                  <el-radio value="我的模型">我的模型</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="任务类型" v-if="mode === 'modelCommon'">
                <el-select class="styled-select" v-model="formOfModelSelection.taskType" placeholder="请选择任务类型">
                  <el-option
                    v-for="option in taskTypeList"
                    :key="option"
                    :label="option"
                    :value="option"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="模型名称" prop="modelName" :inline-message="true" v-if="mode === 'modelCommon'">
                <el-select class="styled-select" v-model="formOfModelSelection.modelName" placeholder="请选择模型">
                  <el-empty v-if="modelInRepositoryList.length === 0" description="没有可用的未部署模型" />
                  <el-option
                    v-for="option in modelInRepositoryList"
                    :key="option.model_id"
                    :label="option.model_name"
                    :value="option.model_id"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="模型名称" v-if="mode === 'modelSpecific'">
                <div class="info-value">{{formOfModelSelection.modelName}}</div>
              </el-form-item>
              
              <el-form-item label="模型ID" v-if="mode === 'modelSpecific'">
                <div class="info-value">{{formOfModelSelection.modelId}}</div>
              </el-form-item>
            </el-form>
          </div>
          <div class="right-column">
            <div class="info-card">
              <div class="info-card-header">
                <el-icon><InfoFilled /></el-icon>
                <span>选择模型指南</span>
              </div>
              <div class="info-card-body">
                <div class="help-content">
                  <p>模型部署前的注意事项：</p>
                  <ul>
                    <li>确认模型已完成训练和验证</li>
                    <li>检查模型输入输出是否符合业务需求</li>
                    <li>评估模型的性能和资源需求</li>
                  </ul>
                  <div class="model-stats" v-if="formOfModelSelection.modelName && mode === 'modelCommon'">
                    <h4>已选模型信息</h4>
                    <div class="stat-item" v-if="getSelectedModelInfo">
                      <span class="label">任务类型:</span>
                      <span class="value">{{formOfModelSelection.taskType}}</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">适用场景:</span>
                      <span class="value">{{getModelApplicationScenario}}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 镜像选择 -->
      <div v-if="mode === 'imageCommon' || mode === 'imageSpecific'" class="config-section">
        <div class="section-header">
          <div class="section-title-indicator"></div>
          <span class="section-title">镜像选择</span>
        </div>
        <div class="form-container dual-column">
          <div class="left-column">
            <el-form
              label-position="right"
              label-width="100px"
              :model="formOfImageSelection"
              :rules="rules"
              ref="imageSelectRef"
              class="styled-form"
            >
              <el-form-item label="镜像来源" v-if="mode === 'imageCommon'">
                <el-radio-group v-model="formOfImageSelection.source" class="image-source-radio">
                  <el-radio value="我的镜像">我的镜像</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="镜像名称" prop="imageName" :inline-message="true" v-if="mode === 'imageCommon'">
                <el-select 
                  class="styled-select" 
                  v-model="formOfImageSelection.imageName" 
                  @change="loadImageVersion"
                  placeholder="请选择镜像"
                >
                  <el-empty v-if="imageInRepositoryList.length === 0" description="没有可用的镜像" />
                  <el-option
                    v-for="option in imageInRepositoryList"
                    :key="option.image_id"
                    :label="option.image_name"
                    :value="option.image_id"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="镜像名称" v-if="mode === 'imageSpecific'">
                <div class="info-value">{{formOfImageSelection.imageName}}</div>
              </el-form-item>
              
              <el-form-item label="版本号" prop="tag" :inline-message="true" v-if="mode === 'imageCommon'">
                <el-select 
                  class="styled-select" 
                  v-model="formOfImageSelection.tag"
                  placeholder="请选择版本"
                  :disabled="!formOfImageSelection.imageName"
                >
                  <el-empty v-if="imageVersionList.length === 0" description="没有可用的版本" />
                  <el-option
                    v-for="option in imageVersionList"
                    :key="option.image_version_id"
                    :label="option.tag"
                    :value="option.image_version_id"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="版本号" v-if="mode === 'imageSpecific'">
                <div class="info-value">{{formOfImageSelection.tag}}</div>
              </el-form-item>
              
              <el-form-item label="镜像ID" v-if="mode === 'imageSpecific'">
                <div class="info-value">{{formOfImageSelection.imageId}}</div>
              </el-form-item>
            </el-form>
          </div>
          <div class="right-column">
            <div class="info-card">
              <div class="info-card-header">
                <el-icon><Ship /></el-icon>
                <span>镜像部署指南</span>
              </div>
              <div class="info-card-body">
                <div class="help-content">
                  <p>镜像部署注意事项：</p>
                  <ul>
                    <li>确保镜像已通过测试并能正常运行</li>
                    <li>选择合适的版本标签，避免使用<code>latest</code></li>
                    <li>检查端口配置是否与容器内服务一致</li>
                    <li>正确配置环境变量以适应不同部署环境</li>
                  </ul>
                  <div class="image-info" v-if="formOfImageSelection.imageName">
                    <h4>部署流程</h4>
                    <div class="process-steps">
                      <div class="process-step">
                        <div class="step-number">1</div>
                        <div class="step-desc">拉取镜像</div>
                      </div>
                      <div class="process-step">
                        <div class="step-number">2</div>
                        <div class="step-desc">配置容器</div>
                      </div>
                      <div class="process-step">
                        <div class="step-number">3</div>
                        <div class="step-desc">启动服务</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 资源配置 -->
      <div class="config-section">
        <div class="section-header">
          <div class="section-title-indicator"></div>
          <span class="section-title">资源配置</span>
        </div>
        <div class="form-container dual-column">
          <div class="left-column">
            <el-form
              label-position="right"
              label-width="100px"
              :model="formOfSourceConfig"
              class="styled-form"
            >
              <el-form-item label="内存">
                <div class="input-with-unit">
                  <el-input-number 
                    v-model="formOfSourceConfig.memory" 
                    :min="1"
                    :max="64"
                    :precision="1"
                    :step="0.5"
                    class="resource-input"
                  />
                  <span class="unit-label">GB</span>
                </div>
                <div class="input-help-text">推荐配置: 2GB-8GB</div>
              </el-form-item>
              
              <el-form-item label="CPU核心数">
                <div class="input-with-unit">
                  <el-input-number
                    v-model="formOfSourceConfig.cpuCoresNum" 
                    :min="1"
                    :max="16"
                    :precision="0"
                    class="resource-input"
                  />
                  <span class="unit-label">核</span>
                </div>
                <div class="input-help-text">推荐配置: 1-4核</div>
              </el-form-item>
              
              <el-form-item v-if="mode !== 'imageCommon' && mode !== 'imageSpecific'" class="form-actions">
                <el-button @click="handleCancel">取消</el-button>
                <el-button 
                  type="primary" 
                  @click="formValidate" 
                  :loading="fullscreenLoading"
                  class="primary-button"
                >开始部署</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="right-column">
            <div class="info-card">
              <div class="info-card-header">
                <el-icon><Setting /></el-icon>
                <span>资源配置建议</span>
              </div>
              <div class="info-card-body">
                <div class="help-content">
                  <h4>资源配置指南</h4>
                  <p>合理的资源配置可以优化服务性能和成本：</p>
                  <div class="resource-recommendations">
                    <div class="resource-tier" :class="{'active-tier': isLightTier}">
                      <div class="tier-name">轻量级应用</div>
                      <div class="tier-specs">1-2GB内存, 1核CPU</div>
                      <div class="tier-desc">适用于小型模型或低并发场景</div>
                    </div>
                    <div class="resource-tier" :class="{'active-tier': isStandardTier}">
                      <div class="tier-name">标准应用</div>
                      <div class="tier-specs">2-4GB内存, 2核CPU</div>
                      <div class="tier-desc">适用于大多数常规模型和中等并发</div>
                    </div>
                    <div class="resource-tier" :class="{'active-tier': isHighTier}">
                      <div class="tier-name">高性能应用</div>
                      <div class="tier-specs">4-8GB内存, 2-4核CPU</div>
                      <div class="tier-desc">适用于复杂模型或高并发场景</div>
                    </div>
                  </div>
                  <div class="resource-preview">
                    <div class="preview-header">当前配置预估</div>
                    <div class="preview-content">
                      <div class="preview-item">
                        <span>每秒请求处理：</span>
                        <span>约 {{estimateRPS}} 次/秒</span>
                      </div>
                      <div class="preview-item">
                        <span>启动时间：</span>
                        <span>约 {{estimateStartupTime}} 秒</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 容器配置 -->
      <div v-if="mode === 'imageCommon' || mode === 'imageSpecific'" class="config-section">
        <div class="section-header">
          <div class="section-title-indicator"></div>
          <span class="section-title">容器配置</span>
        </div>
        <div class="form-container dual-column">
          <div class="left-column">
            <el-form
              label-position="right"
              label-width="100px"
              :model="formOfContainerConfig"
              :rules="rules"
              ref="containerConfigRef"
              class="styled-form"
            >
              <el-form-item label="服务端口号" prop="servicePort" :inline-message="true">
                <el-input-number
                  v-model="formOfContainerConfig.servicePort"
                  :min="1"
                  :max="65535"
                  class="port-input"
                  placeholder="1-65535"
                />
                <div class="input-help-text">容器内服务监听的端口</div>
              </el-form-item>
              
              <el-form-item label="环境变量" class="env-var-form-item">
                <div class="env-controls">
                  <el-button 
                    type="primary" 
                    @click="addEnvironment" 
                    :icon="Plus" 
                    size="small" 
                    round
                    class="add-env-btn"
                  >添加环境变量</el-button>
                </div>
                
                <div class="env-list">
                  <div 
                    v-for="(item, index) in environment" 
                    :key="`env-${index}`"
                    class="env-item"
                  >
                    <el-input v-model="item.name" class="env-name-input" placeholder="变量名">
                      <template #prepend>name</template>
                    </el-input>
                    
                    <el-icon class="env-arrow-icon"><Right /></el-icon>
                    
                    <el-input v-model="item.value" class="env-value-input" placeholder="变量值">
                      <template #prepend>value</template>
                    </el-input>
                    
                    <el-button 
                      type="danger" 
                      :icon="Delete" 
                      circle
                      @click="removeEnvironment(index)"
                      class="remove-env-btn"
                    />
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item class="form-actions">
                <el-button @click="handleCancel">取消</el-button>
                <el-button 
                  type="primary" 
                  @click="formValidate" 
                  :loading="fullscreenLoading"
                  class="primary-button"
                >开始部署</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="right-column">
            <div class="info-card">
              <div class="info-card-header">
                <el-icon><MagicStick /></el-icon>
                <span>容器配置指南</span>
              </div>
              <div class="info-card-body">
                <div class="help-content">
                  <p>环境变量配置技巧：</p>
                  <ul>
                    <li>使用环境变量存储配置信息，而非硬编码</li>
                    <li>敏感信息（如API密钥）应使用环境变量传递</li>
                    <li>常用环境变量包括：</li>
                  </ul>
                  <div class="env-examples">
                    <div class="env-example-item">
                      <div class="env-example-name">PORT</div>
                      <div class="env-example-desc">服务监听的端口号</div>
                    </div>
                    <div class="env-example-item">
                      <div class="env-example-name">NODE_ENV</div>
                      <div class="env-example-desc">运行环境(development/production)</div>
                    </div>
                    <div class="env-example-item">
                      <div class="env-example-name">LOG_LEVEL</div>
                      <div class="env-example-desc">日志级别(debug/info/warning/error)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import router from "@/router";
import request from "@/utils/request";
import {ref} from "vue";
import { 
  ArrowRight, Delete, Plus, Right, Connection, 
  Document, InfoFilled, Setting, Ship, MagicStick
} from '@element-plus/icons-vue';
import { dictionaryC2E } from '../AutoModel/taskStaticData';
import { useRoute } from 'vue-router';
import { serviceDeploy, imageDeploy } from "@/utils/before";
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
      Right,
      Delete,
      Plus,
      Connection,
      Document,
      InfoFilled,
      Setting,
      Ship,
      MagicStick,

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
    isModelDeploy() {
      return this.mode === 'modelCommon' || this.mode === 'modelSpecific';
    },
    isImageDeploy() {
      return this.mode === 'imageCommon' || this.mode === 'imageSpecific';
    },
        // 新增计算属性
    getSelectedModelInfo() {
      if (this.mode === 'modelCommon' && this.formOfModelSelection.modelName) {
        const selectedModel = this.modelInRepositoryList.find(
          model => model.model_id === this.formOfModelSelection.modelName
        );
        return selectedModel || null;
      }
      return null;
    },
    
    getModelApplicationScenario() {
      const scenarioMap = {
        '时间序列预测': '销售预测、股价预测、用电量预测等时序数据场景',
        '回归': '房价预测、评分预测等连续数值场景',
        '分类': '垃圾邮件识别、情感分析、图像分类等',
        '命名实体识别': '文本中提取人名、地名、组织名等实体信息'
      };
      return scenarioMap[this.formOfModelSelection.taskType] || '通用场景';
    },
    
    isLightTier() {
      return this.formOfSourceConfig.memory <= 2 && 
            this.formOfSourceConfig.cpuCoresNum === 1;
    },
    
    isStandardTier() {
      return this.formOfSourceConfig.memory > 2 && 
            this.formOfSourceConfig.memory <= 4 && 
            this.formOfSourceConfig.cpuCoresNum === 2;
    },
    
    isHighTier() {
      return this.formOfSourceConfig.memory > 4 || 
            this.formOfSourceConfig.cpuCoresNum > 2;
    },
    
    estimateRPS() {
      // 简单估算，实际值需要根据真实模型性能调整
      return Math.round(this.formOfSourceConfig.cpuCoresNum * 10 * (this.formOfSourceConfig.memory / 2));
    },
    
    estimateStartupTime() {
      // 估算启动时间，单位秒
      return Math.max(5, Math.round(10 - this.formOfSourceConfig.cpuCoresNum));
    }
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
      let middle = Object.keys(this.C2E).includes(this.formOfModelSelection.taskType) ? 
        this.C2E[this.formOfModelSelection.taskType] : 'string';
      request.get('/ModelRepository/GetModelList', {
        params: {
          task_type: middle
        }
      }).then(res => {
        console.log(res.data, 'res.data in myModel');
        res.data.forEach(item => {
          if(item.model_state === 'not deployed'){
            this.modelInRepositoryList.push(item)
          }
        });
        console.log(this.modelInRepositoryList, 'modelInRepositoryList');
      });
    },
    loadImage(param){
      this.imageInRepositoryList = [];
      request.get('/ImageRepository/GetImageRepositoryList', {
        params: param ? param : {}
      }).then(res => {
        console.log(res.data, 'data');
        res.data.forEach(item => {
          this.imageInRepositoryList.push(item);
        });
      });
    },
    loadImageVersion(param){
      this.imageVersionList = [];
      this.imageInRepositoryList.forEach(item => {
        if(item.image_id === param){
          let data = [];
          item.image_version.forEach(option => {
            if(option.is_used === 0){
              data.push(option);
            }
          });
          this.imageVersionList = data;
        }
      });
      console.log(this.imageVersionList, 'imageVersionList');
    },
    changeDeployMode(val){
      if(val === '模型部署'){
        this.mode = 'modelCommon';
      } else if(val === '镜像部署'){
        this.mode = 'imageCommon';
        this.loadImage();
      } else {
        ElMessage({message: '选择部署方式出错', type: 'error', offset: 60});
      }
    },
    //表单校验结果
    async formValidate(){
      let serviceErr = true;//服务名称校验
      let modelErr = true;//模型选择校验
      let imageErr = true;//镜像选择校验
      let containerErr = true;//容器配置校验
      
      // 调试信息
      console.log("开始验证表单...");
      console.log("当前模式:", this.mode);
      
      //判断服务名称是否填写
      await this.$refs.serviceInfoRef.validate((valid) => {
        serviceErr = !valid;
        console.log("服务信息验证结果:", valid);
      });
      
      if(this.mode === 'modelCommon'){
        //模型是否选择
        await this.$refs.modelSelectRef.validate((valid) => {
          modelErr = !valid;
          console.log("模型选择验证结果:", valid);
        });

        if(!serviceErr && !modelErr){
          this.modelDeployStart();
        } else {
          ElMessage({message: '请完善部署信息！', type: 'error', offset: 60});
        }
      } else if(this.mode === 'imageCommon'){
        //镜像是否选择
        await this.$refs.imageSelectRef.validate((valid) => {
          imageErr = !valid;
          console.log("镜像选择验证结果:", valid);
        });
        
        //容器配置是否填写
        await this.$refs.containerConfigRef.validate((valid) => {
          containerErr = !valid;
          console.log("容器配置验证结果:", valid);
        });

        if(!serviceErr && !imageErr && !containerErr){
          this.imageDeployStart();
        } else {
          ElMessage({message: '请完善部署信息！', type: 'error', offset: 60});
        }
      }
      else if(this.mode === 'imageSpecific'){
        //容器配置是否填写
        await this.$refs.containerConfigRef.validate((valid) => {
          containerErr = !valid;
          console.log("容器配置验证结果:", valid);
        });

        if(!serviceErr && !containerErr){
          this.imageDeployStart();
        } else {
          ElMessage({message: '请完善部署信息！', type: 'error', offset: 60});
        }
      }
      else {//modelSpecific的情况，只需要对服务基本信息进行校验
        if(!serviceErr){
          this.modelDeployStart();
        } else {
          ElMessage({message: '请完善部署信息！', type: 'error', offset: 60});
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
        this.modelInRepositoryList.forEach(item => {
          if(item.model_id === this.formOfModelSelection.modelName){
            middle['model_id'] = item.model_id;
            middle['task_id'] = item.task_id;
            middle['task_history_id'] = item.task_history_id;
            middle['service_name'] = this.formOfServiceConfig.serviceName;
            middle['service_desc'] = this.formOfServiceConfig.serviceDesc;
            middle['memory'] = this.formOfSourceConfig.memory * 1000000000;
            middle['cpu_cores_num'] = this.formOfSourceConfig.cpuCoresNum;
            middle['type'] = 'official';
          }
        });
      }
      
      console.log(middle, 'middle');
      this.fullscreenLoading = true;
      
      serviceDeploy(middle).then(res => {
        console.log(res.data, 'res.data in startDeploy');
        setTimeout(() => {
          this.fullscreenLoading = false;
          ElMessage({message: '部署成功！', type: 'success', offset: 60});
          router.push('onlineServiceList');
        }, 1000);
      }).catch(err => {
        this.fullscreenLoading = false;
        ElMessage({message: '部署失败！', type: 'error', offset: 60});
      });
    },
    //镜像部署
    imageDeployStart(){
      let middle = {};
      let env = {};
      
      if(this.environment.length > 0){
        this.environment.forEach(item => {
          if (item.name && item.name.trim()) {
            env[item.name.trim()] = item.value;
          }
        });
      }
      
      if(this.mode === 'imageSpecific'){
        middle['service_name'] = this.formOfServiceConfig.serviceName;
        middle['service_desc'] = this.formOfServiceConfig.serviceDesc;
        middle['memory'] = this.formOfSourceConfig.memory * 1000000000;
        middle['cpu_cores_num'] = this.formOfSourceConfig.cpuCoresNum;
        middle['image_version_id'] = parseInt(this.formOfImageSelection.tagId);
        middle['env'] = env;
        middle['image_port'] = parseInt(this.formOfContainerConfig.servicePort);
        middle['image_name'] = this.formOfImageSelection.imageName;
        middle['image_tag'] = this.formOfImageSelection.tag;
        middle['type'] = 'custom';
      } else {
        middle['service_name'] = this.formOfServiceConfig.serviceName;
        middle['service_desc'] = this.formOfServiceConfig.serviceDesc;
        middle['memory'] = this.formOfSourceConfig.memory * 1000000000;
        middle['cpu_cores_num'] = this.formOfSourceConfig.cpuCoresNum;
        middle['image_version_id'] = parseInt(this.formOfImageSelection.tag);
        middle['env'] = env;
        middle['image_port'] = parseInt(this.formOfContainerConfig.servicePort);
        
        // 找到选中镜像的名称
        this.imageInRepositoryList.forEach(item => {
          if(item.image_id === this.formOfImageSelection.imageName){
            middle['image_name'] = item.image_name;
            
            // 找到选中版本的标签
            item.image_version.forEach(version => {
              if(version.image_version_id === parseInt(this.formOfImageSelection.tag)){
                middle['image_tag'] = version.tag;
              }
            });
          }
        });
        
        middle['type'] = 'custom';
      }
      
      console.log(middle, 'middle');
      this.fullscreenLoading = true;
      
      imageDeploy(middle).then(res => {
        console.log(res.data, 'res.data in imagedeploy');
        setTimeout(() => {
          this.fullscreenLoading = false;
          ElMessage({message: '部署成功！', type: 'success', offset: 60});
          router.push('onlineServiceList');
        }, 1000);
      }).catch(err => {
        this.fullscreenLoading = false;
        ElMessage({message: '部署失败！', type: 'error', offset: 60});
      });
    },
    addEnvironment(){
      this.environment.push({
        index: this.environment.length,
        name: "",
        value: ""
      });
    },
    removeEnvironment(param){
      this.environment.splice(param, 1);
      console.log(this.environment, 'this.volumeList');
    },
    handleCancel() {
      router.push('onlineServiceList');
    }
  }
}
</script>

<style scoped>
/* 基础布局样式 */
.deploy-container {
  display: flex;
  flex-direction: column;
}

/* 头部区域 */
.header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(to right, #1a2942, #4c75a3);
  border-radius: 8px;
  color: white;
  margin: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.tech-title {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.2);
}

.tech-title .el-icon {
  font-size: 22px;
  color: #ffffff;
}

.nav-breadcrumb {
  display: flex;
  align-items: center;
}

.tech-breadcrumb {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff !important;
}

:deep(.tech-breadcrumb span),
:deep(.tech-breadcrumb div),
:deep(.tech-breadcrumb a) {
  color: #ffffff !important;
}

:deep(.el-breadcrumb__separator) {
  color: #ffffff !important;
}

/* 主内容区域 */
.main-content-wrapper {
  background-color: white;
  margin: 0 20px 20px;
  border-radius: 8px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
  padding-bottom: 30px;
  min-height: calc(100vh - 210px);
}

/* 配置部分样式 */
.config-section {
  margin: 20px 30px 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.section-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
}

.section-title-indicator {
  width: 4px;
  height: 16px;
  background: linear-gradient(to bottom, #1a2942, #4c75a3);
  margin-right: 10px;
  border-radius: 2px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

/* 双列布局容器 - 调整左右比例 */
.dual-column {
  display: flex;
  gap: 20px;
  width: 100%;
  align-items: flex-start;
}

.left-column {
  flex: 3; /* 增加左侧宽度比例 */
  min-width: 0; /* 防止flex子项溢出 */
}

.right-column {
  flex: 2; /* 减少右侧宽度比例 */
  min-width: 300px;
  max-width: 400px;
}

.form-container {
  padding: 25px 30px;
}

/* 表单样式 */
.styled-form {
  max-width: 100%; /* 修改为100%允许表单占据更多空间 */
}

.styled-input,
.styled-select,
.resource-input,
.port-input {
  width: 100%; /* 调整为100%占满左侧空间 */
}

:deep(.el-form-item__label) {
  color: #303133;
  font-weight: 500;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-input-number .el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.2s;
}

:deep(.el-input__wrapper:hover),
:deep(.el-select__wrapper:hover),
:deep(.el-input-number:hover .el-input__wrapper) {
  box-shadow: 0 0 0 1px #4c75a3 inset;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-select__wrapper.is-focus),
:deep(.el-input-number.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #4c75a3 inset !important;
}

/* 单选按钮样式 */
:deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: #4c75a3;
  background: #4c75a3;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #4c75a3;
}

/* 资源配置样式 */
.input-with-unit {
  display: flex;
  align-items: center;
  width: 100%;
}

.unit-label {
  margin-left: 10px;
  color: #606266;
  white-space: nowrap;
}

.input-help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.info-value {
  background-color: #f8f8f8;
  padding: 8px 12px;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  border: 1px solid #ebeef5;
  width: 100%;
}

/* 环境变量样式 */
.env-var-form-item {
  margin-bottom: 30px;
}

.env-controls {
  margin-bottom: 10px;
}

.add-env-btn {
  background: linear-gradient(to right, #1a2942, #4c75a3);
  border: none;
  transition: all 0.3s;
  font-weight: 500;
}

.add-env-btn:hover {
  background: linear-gradient(to right, #253550, #5c85b3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(26, 41, 66, 0.2);
}

.env-list {
  margin-top: 15px;
}

.env-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 6px;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
}

.env-item:hover {
  background-color: #f9f9fa;
  border-color: #dcdfe6;
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.env-name-input,
.env-value-input {
  width: 100%;
  flex: 1;
}

.env-arrow-icon {
  margin: 0 15px;
  color: #909399;
  flex-shrink: 0;
}

.remove-env-btn {
  margin-left: 10px;
  flex-shrink: 0;
}

/* 表单操作区域 */
.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
  width: 100%;
}

.primary-button {
  background: linear-gradient(to right, #1a2942, #4c75a3);
  border: none;
  transition: all 0.3s;
}

.primary-button:hover {
  background: linear-gradient(to right, #253550, #5c85b3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(26, 41, 66, 0.2);
}

/* 信息卡片样式 - 优化高度和滚动 */
.info-card {
  background-color: #f8fafc;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
  border: 1px solid #ebeef5;
  margin-bottom: 20px;
  transition: all 0.3s;
  max-height: 400px; /* 限制最大高度 */
  overflow-y: auto; /* 添加滚动条 */
  position: sticky; /* 使卡片固定 */
  top: 20px; /* 顶部距离 */
}

.info-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
}

.info-card-header {
  background-color: #f1f5f9;
  padding: 12px 15px;
  border-bottom: 1px solid #ebeef5;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: #1a2942;
  position: sticky; /* 使标题粘在顶部 */
  top: 0;
  z-index: 1;
}

.info-card-header .el-icon {
  color: #4c75a3;
  font-size: 18px;
}

.info-card-body {
  padding: 12px; /* 减少内边距 */
}

/* 帮助内容样式 - 简化内容展示 */
.help-content {
  color: #606266;
  font-size: 13px; /* 减小字体 */
}

.help-content p {
  margin: 0 0 10px; /* 减少间距 */
  line-height: 1.5;
}

.help-content ul {
  margin: 6px 0;
  padding-left: 18px; /* 减少缩进 */
}

.help-content li {
  margin-bottom: 5px; /* 减少列表项间距 */
  line-height: 1.4;
}

.tips-box {
  background-color: rgba(76, 117, 163, 0.08);
  border-left: 3px solid #4c75a3;
  padding: 8px 12px;
  margin: 10px 0;
  border-radius: 0 4px 4px 0;
  font-size: 12px;
}

/* 资源配置推荐样式 - 优化布局 */
.resource-recommendations {
  margin: 12px 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); /* 网格布局 */
  gap: 10px;
}

.resource-tier {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 10px;
  background-color: white;
  transition: all 0.3s;
}

.resource-tier:hover {
  border-color: #c0c4cc;
  transform: translateY(-2px);
}

.active-tier {
  border-color: #4c75a3;
  background-color: rgba(76, 117, 163, 0.05);
  box-shadow: 0 2px 12px rgba(76, 117, 163, 0.1);
}

.tier-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 3px;
  font-size: 13px;
}

.tier-specs {
  color: #4c75a3;
  font-weight: 500;
  margin-bottom: 3px;
  font-size: 12px;
}

.tier-desc {
  color: #909399;
  font-size: 11px;
}

.resource-preview {
  margin-top: 15px;
  background-color: white;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.preview-header {
  background-color: #f1f5f9;
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
  font-weight: 500;
  color: #303133;
  font-size: 13px;
}

.preview-content {
  padding: 10px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  color: #606266;
  font-size: 12px;
}

/* 环境变量示例样式 - 简化布局 */
.env-examples {
  margin-top: 10px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.env-example-item {
  padding: 6px 10px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #ebeef5;
  font-size: 12px;
}

.env-example-item:last-child {
  border-bottom: none;
}

.env-example-name {
  font-family: monospace;
  font-weight: 500;
  color: #409eff;
}

.env-example-desc {
  color: #606266;
  font-size: 12px;
}

/* 部署流程样式 - 优化空间利用 */
.process-steps {
  display: flex;
  margin: 10px 0;
  justify-content: space-between;
}

.process-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30%;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(to bottom, #1a2942, #4c75a3);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-bottom: 6px;
  font-size: 12px;
}

.step-desc {
  text-align: center;
  color: #606266;
  font-size: 12px;
}

/* 模型信息样式 */
.model-stats, 
.image-info {
  margin-top: 10px;
  padding: 10px;
  background-color: white;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
}

.stat-item .label {
  color: #606266;
}

.stat-item .value {
  font-weight: 500;
  color: #303133;
}

/* 响应式布局调整 */
@media screen and (max-width: 1200px) {
  .dual-column {
    flex-direction: column;
  }
  
  .left-column,
  .right-column {
    width: 100%;
    max-width: none;
  }
  
  .info-card {
    max-height: none;
    position: static;
  }
}

@media screen and (max-width: 768px) {
  .form-container {
    padding: 15px 20px;
  }
  
  .env-item {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .env-arrow-icon {
    display: none;
  }
}
</style>