<template>
  <div class="image-repository">
    <!-- 顶部导航区域 -->
    <div class="header-area">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item class="tech-title">
          <el-icon><Picture /></el-icon>
          {{ pageIndex === 1 ? '我的镜像' : '公开镜像' }}
        </el-breadcrumb-item>
      </el-breadcrumb>
      
      <!-- 镜像概览卡片 -->
      <div class="image-metrics" v-if="pageIndex === 1">
        <div class="metric-card">
          <div class="metric-value">{{myImageData.length}}</div>
          <div class="metric-label">我的镜像总数</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{getTotalVersions(myImageData)}}</div>
          <div class="metric-label">镜像版本总数</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{getUsedImageVersions(myImageData)}}</div>
          <div class="metric-label">使用中版本</div>
        </div>
      </div>
      
      <div class="image-metrics" v-if="pageIndex === 2">
        <div class="metric-card">
          <div class="metric-value">{{publicImageData.length}}</div>
          <div class="metric-label">公开镜像总数</div>
        </div>
      </div>
    </div>

    <div class="content-panel">
      <!-- 页面导航栏 -->
      <div class="tab-container">
        <el-menu class="el-menu-m" mode="horizontal" :default-active="pageIndex.toString()">
          <el-menu-item index="1" @click="changePageIndex(1)">我的镜像</el-menu-item>
          <el-menu-item index="2" @click="changePageIndex(2)">公开镜像</el-menu-item>
        </el-menu>
      </div>

      <!--我的镜像-->
      <div v-if="pageIndex === 1">
        <div class="action-bar">
            <div class="left-area">
              <el-button type="primary" @click="openImageImportDialog" class="create-btn">
                <el-icon><Plus /></el-icon>
                镜像创建
              </el-button>
            </div>
          
          <div class="middle-area">
            <!-- 可以添加筛选功能 -->
          </div>
          
          <div class="right-area">
            <div class="search-box">
              <el-input
                v-model="selectInputByImageName"
                placeholder="输入镜像名称查询"
                class="search-input"
                clearable
                @clear="loadMyImage"
                @keyup.enter="selectByImageName"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
                <template #append>
                  <el-button @click="selectByImageName">
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
            
            <el-button 
              class="refresh-btn" 
              @click="loadMyImage" 
              :loading="myImageLoading"
              type="primary"
              plain>
              <el-icon class="refresh-icon" :class="{ 'is-loading': myImageLoading }"><Refresh /></el-icon>
              刷新列表
            </el-button>
          </div>
        </div>

        <!--我的镜像列表-->
        <div class="table-container">
          <el-table 
            :data="myImageData" 
            border 
            v-loading="myImageLoading" 
            :row-style="{ height: '65px' }"
            :cell-style="{ 'text-align': 'center' }"
            :header-cell-style="{ 'text-align': 'center', background: '#1a2942', color: '#fff' }"
            class="image-table"
          >
            <el-table-column type="expand" min-width="3%">
              <template #default="slot">
                <el-table 
                  :data="slot.row.image_version" 
                  style="width: 90%; margin: 15px auto" 
                  border 
                  :header-cell-style="{ 'text-align': 'center', background: '#f5f7fa', color: '#606266' }"
                  :cell-style="{ 'text-align': 'center' }"
                  class="version-table"
                >
                  <el-table-column prop="tag" label="版本号" min-width="15%" align="center"/>
                  <el-table-column prop="image_version_id" label="版本ID" min-width="15%" align="center"/>
                  <el-table-column prop="version_desc" label="描述" min-width="15%" align="center"/>
                  <el-table-column prop="is_used" label="是否使用" min-width="15%" align="center">
                    <template #default="scope">
                      <el-link :underline="false" type="primary" @click="openServiceDialog(scope.row)" v-if="scope.row.is_used === 1">{{ imageStateDic[scope.row.is_used] }}</el-link>
                      <el-tag type="info" effect="plain" v-if="scope.row.is_used === 0">{{ imageStateDic[scope.row.is_used] }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="create_time" label="导入时间" min-width="18%" align="center"/>
                  <el-table-column label="操作" min-width="22%">
                    <template #default="scope">
                      <div class="action-buttons">
                        <el-dropdown class="action-dropdown">
                          <span class="el-dropdown-link">
                            部署 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                          </span>
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item @click="createOnlineService(slot.row,scope.row)">在线服务</el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                        
                        <el-popconfirm title="确定删除吗？" @confirm="versionDeleteMethod(scope.row,slot.row)">
                          <template #reference>
                            <el-button link type="primary" class="action-button">删除</el-button>
                          </template>
                        </el-popconfirm>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column prop="image_name" label="镜像名称" sortable min-width="12%" align="center"/>
            <el-table-column prop="image_id" label="镜像ID" min-width="12%" align="center"/>
            <el-table-column prop="image_desc" label="描述" min-width="12%" align="center"/>
            <el-table-column prop="is_public" label="是否公开" min-width="12%" align="center">
              <template #default="scope">
                <el-tag 
                  :type="scope.row.is_public === 0 ? 'info' : 'success'"
                  effect="light"
                  round
                >
                  {{scope.row.is_public === 0 ? '不公开' : '公开'}}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="version_num" label="版本数量" min-width="12%" align="center"/>
            <el-table-column prop="create_time" label="创建时间" min-width="12%" align="center"/>
            <el-table-column label="操作" min-width="25%">
              <template #default="scope">
                <div class="action-buttons">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="addVersion(scope.row)"
                    class="action-btn"
                    round>新增版本</el-button>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="openModifyVersionDialog(scope.row)"
                    class="action-btn"
                    round>修改</el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="openImageDeleteDialog(scope.row)"
                    class="action-btn"
                    round>删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!--公开镜像-->
      <div v-if="pageIndex === 2">
        <div class="action-bar">
          <div class="left-area">
            <el-button 
              class="refresh-btn" 
              @click="loadPublicImage({is_public:1})" 
              :loading="publicImageLoading"
              type="primary"
              plain>
              <el-icon class="refresh-icon" :class="{ 'is-loading': publicImageLoading }"><Refresh /></el-icon>
              刷新列表
            </el-button>
          </div>
          
          <div class="middle-area">
            <!-- 可以添加筛选功能 -->
          </div>
          
          <div class="right-area">
            <div class="search-box">
              <el-input
                v-model="selectInputByPublicImageName"
                placeholder="输入镜像名称查询"
                class="search-input"
                clearable
                @clear="loadPublicImage"
                @keyup.enter="selectByPublicImageName"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
                <template #append>
                  <el-button @click="selectByPublicImageName">
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
          </div>
        </div>
        
        <!--公开镜像列表-->
        <div class="table-container">
          <el-table 
            :data="publicImageData" 
            border 
            v-loading="publicImageLoading" 
            :row-style="{ height: '65px' }"
            :cell-style="{ 'text-align': 'center' }"
            :header-cell-style="{ 'text-align': 'center', background: '#1a2942', color: '#fff' }"
            class="image-table"
          >
            <el-table-column type="expand" min-width="3%">
              <template #default="slot">
                <el-table 
                  :data="slot.row.image_version" 
                  style="width: 90%; margin: 15px auto" 
                  border 
                  :header-cell-style="{ 'text-align': 'center', background: '#f5f7fa', color: '#606266' }"
                  :cell-style="{ 'text-align': 'center' }"
                  class="version-table"
                >
                  <el-table-column prop="tag" label="版本号" min-width="13%" align="center"/>
                  <el-table-column prop="image_version_id" label="版本ID" min-width="13%" align="center"/>
                  <el-table-column prop="version_desc" label="描述" min-width="13%" align="center"/>
                  <el-table-column prop="create_time" label="创建时间" min-width="13%" align="center"/>
                  <el-table-column label="操作" min-width="22%">
                    <template #default="scope">
                      <div class="action-buttons">
                        <el-dropdown class="action-dropdown">
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
              </template>
            </el-table-column>
            <el-table-column prop="image_name" label="镜像名称" sortable min-width="12%" align="center"/>
            <el-table-column prop="image_id" label="镜像ID" min-width="12%" align="center"/>
            <el-table-column prop="image_desc" label="描述" min-width="12%" align="center"/>
            <el-table-column prop="username" label="拥有者" min-width="12%" align="center" sortable>
              <template #default="scope">
                <div class="owner-cell">
                  <span>{{scope.row.username}}</span>
                  <el-tag
                    :type="scope.row.modify_permission === '其他' ? 'danger' : 'success'"
                    effect="light"
                    size="small"
                    round
                  >{{ scope.row.modify_permission }}</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="version_num" label="版本数量" min-width="12%" align="center"/>
            <el-table-column prop="create_time" label="创建时间" min-width="12%" align="center"/>
            <el-table-column fixed="right" label="操作" min-width="25%">
              <template #default="scope">
                <!-- 公共镜像操作按钮 -->
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <!-- 各种弹出对话框保持原样，只是更新样式 -->
      <!--镜像信息修改对话框-->
      <el-dialog v-model="modifyMyImageDialog" title="镜像修改" width="500px" class="image-dialog">
        <el-form
            label-position="left"
            label-width="100px"
            :model="formOfModifyMyImage"
            style="max-width: 420px;margin-left: 10px"
        >
          <el-form-item label="镜像名称">
            <el-input v-model="formOfModifyMyImage.imageName" disabled />
          </el-form-item>
          <el-form-item label="镜像描述">
            <el-input type="textarea" v-model="formOfModifyMyImage.imageDesc" />
          </el-form-item>
          <el-form-item label="是否公开">
            <el-radio-group v-model="formOfModifyMyImage.isPublic" style="margin-left: 10px" >
              <el-radio label="不公开" />
              <el-radio label="公开" />
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
            <span>
              <el-button @click="modifyMyImageDialog = false">取消</el-button>
              <el-button type="primary" @click="modifyMyImage">确定</el-button>
            </span>
        </template>
      </el-dialog>

      <!--镜像创建-->
      <el-dialog v-model="importMyImageInfoDialog" title="镜像创建" width="30%" class="image-dialog">
        <el-form
            label-position="right"
            label-width="100px"
            :model="formOfImageInfoImport"
            style="max-width: 420px;margin-left: 10px"
            :rules="rules"
            ref="imageImportRef"
        >
          <el-form-item label="镜像名称" prop="imageName">
            <el-input v-model="formOfImageInfoImport.imageName" />
          </el-form-item>
          <el-form-item label="镜像描述">
            <el-input type="textarea" placeholder="请输入镜像描述，100字以内" maxlength="100" rows="4" v-model="formOfImageInfoImport.imageDesc" />
          </el-form-item>
          <el-form-item label="是否公开">
            <el-radio-group v-model="formOfImageInfoImport.isPublic" style="margin-left: 10px" >
              <el-radio label="不公开" />
              <el-radio label="公开" />
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
            <span>
              <el-button @click="importMyImageInfoDialog = false">取消</el-button>
              <el-button type="primary" @click="importMyImageInfo">确定</el-button>
            </span>
        </template>
      </el-dialog>

      <!--新增镜像版本-->
      <el-dialog v-model="importMyImageVersionDialog" title="新增版本" width="30%" class="image-dialog">
        <el-form
            label-position="right"
            label-width="100px"
            :model="formOfImageVersionImport"
            style="max-width: 420px;margin-left: 10px"
            :rules="rules"
            ref="imageVersionImportRef"
        >
          <el-form-item label="版本号" prop="tag">
            <el-input v-model="formOfImageVersionImport.tag" placeholder="e.g:1.0"/>
          </el-form-item>
          <el-form-item label="描述">
            <el-input type="textarea" placeholder="请输入镜像版本的描述，100字以内" maxlength="100" rows="4" v-model="formOfImageVersionImport.imageVersionDesc" />
          </el-form-item>
          <el-form-item label="上传文件">
            <el-button @click="uploadFileDialog = true" type="primary" plain>点击上传</el-button>
          </el-form-item>
        </el-form>
        <template #footer>
            <span>
              <el-button @click="importMyImageVersionDialog = false">取消</el-button>
              <el-button type="primary" @click="importMyImageVersion">确定</el-button>
            </span>
        </template>

        <!--上传文件窗口-->
        <el-dialog v-model="uploadFileDialog" title="文件上传" width="35%" class="upload-dialog" append-to-body>
          <el-upload
              class="upload-demo"
              drag
              action=""
              :on-change="importFile"
              :auto-upload="false"
              :limit="1"
              :before-upload="beforeUploadFile"
              ref="uploadRef"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                请上传镜像文件的压缩包
              </div>
            </template>
          </el-upload>
          <template #footer>
            <span>
              <el-button @click="importFileCancel">取消</el-button>
              <el-button type="primary" @click="uploadFileDialog = false">确定</el-button>
            </span>
          </template>
        </el-dialog>
      </el-dialog>

      <!--上传中-弹出框-->
      <el-dialog
          v-model="uploadingDialog"
          title="文件上传"
          :show-close="false"
          width="21%"
          class="uploading-dialog"
          :close-on-click-modal="false"
          :close-on-press-escape="false">
        <div class="upload-progress-container">
          <div class="progress-chart">
            <el-progress type="dashboard" :percentage="completionDic[identifier]">
              <template #default="{ percentage }">
                <span class="percentage-value">{{ percentage }}%</span>
                <span class="percentage-label" v-if="uploadingFlag">上传中</span>
              </template>
            </el-progress>
          </div>
          <div class="progress-message">
            <p>{{uploadMessage}}</p>
          </div>
        </div>
        <template #footer>
          <div>
            <el-button v-if="!closeFlag" @click="cancelUpload" type="danger">取消上传</el-button>
            <el-button v-if="closeFlag" type="primary" @click="uploadingDialog = false">关闭</el-button>
          </div>
        </template>
      </el-dialog>

      <!--镜像对应服务的列表-->
      <el-dialog v-model="imageServiceDialog" title="在线服务列表" min-width="500px" class="image-dialog">
        <el-table 
          :data="imageServiceData" 
          border 
          :header-cell-style="{'text-align': 'center', background: '#f5f7fa'}" 
          :cell-style="{ 'text-align': 'center' }"
          v-loading="imageServiceLoading"
          class="service-table">
          <el-table-column property="service_name" label="服务名称" min-width="35%" align="center"/>
          <el-table-column property="service_id" label="服务ID" min-width="35%" align="center">
            <template #default="scope">
              <el-link :underline="false" type="primary" @click="toServicePage(scope.row)">{{ scope.row.service_id }}</el-link>
            </template>
          </el-table-column>
          <el-table-column property="service_state" label="状态" min-width="30%" align="center">
            <template #default="scope">
              <el-tag :style="setStateStyle(scope.row.service_state)" round >{{ serviceStateDic[scope.row.service_state]}}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <template #footer>
          <span>
            <el-button @click="imageServiceDialog = false">确定</el-button>
          </span>
        </template>
      </el-dialog>

      <!--镜像整体删除的提示弹出框-->
      <el-dialog v-model="imageDeleteDialog" width="400px" class="confirm-dialog">
        <template #header>
          <div class="confirm-header">
            <el-icon size="20px" color="#ff4949"><WarningFilled /></el-icon>
            <span class="confirm-title">提示</span>
          </div>
        </template>
        <div class="confirm-content">
          当前镜像包含 <b>{{imageDeleteData.versionNum}}</b> 个版本，确定要删除吗？
        </div>
        <template #footer>
          <span>
            <el-button @click="imageDeleteDialog = false">取消</el-button>
            <el-button type="primary" @click="imageDeleteMethod">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>

import { UploadFilled, ArrowDown, WarningFilled, Refresh, ArrowRight, Picture, Search, Plus } from '@element-plus/icons-vue';
import { imageUpload, imageMerge, imagePush, imageSave, imageModify, imageDelete, imageVersionDelete, uploadCancel } from '@/utils/before'
import request from "@/utils/request";
import { ElMessage } from "element-plus";
import md5 from 'js-md5';
import SparkMD5 from 'spark-md5';
import router from "@/router";
import { useRoute } from 'vue-router';

export default {
  name: "ImageList",
  components: {
    UploadFilled,
    ArrowDown,
    WarningFilled,
    Refresh,
    ArrowRight,
    Picture,
    Search,
    Plus,
  },
  data(){

    return{
      a:true,
      ArrowRight,
      Picture,

      pageIndex:1,
      imageState:'',
      imageStateList:[],
      selectInputByImageName:'',
      selectInputByPublicImageName:'',
      myImageData:[
        {
          image_version:[
            {}
          ]
        }
      ],
      publicImageData:[],
      myImageLoading:false,
      modifyMyImageDialog:false,
      formOfModifyMyImage:{},
      formOfImageInfoImport:{
        imageName:'',
        isPublic:'不公开',
        imageDesc:'',
      },
      formOfImageVersionImport:{},
      //文件的上传对象
      uploadFile:{},
      importMyImageInfoDialog:false,
      publicImageLoading:false,
      uploadFileDialog:false,
      importMyImageVersionDialog:false,
      uploadingDialog:false,
      //文件上传切片大小为20M
      sliceSize: 10 * 1024 * 1024,
      successUploadSliceDic:{},
      rules:{
        imageName:[{required:true,message:'请输入镜像名称！',trigger:'blur'}],
        tag:[{required:true,message:'请输入版本号！',trigger:'blur'}]
      },
      completionDic:{},
      identifier:'',
      imageNameDic:{},
      imageIdDic:{},
      imageTagDic:{},
      imageVersionDescDic:{},
      fileSizeDic:{},
      fileNameDic:{},
      publicImageOwner:1,
      publicImageOwnerList:[
        {
          label:'显示所有公开镜像',
          value:1
        },
        {
          label:'显示当前用户公开镜像',
          value:2
        },
        {
          label:'显示其他用户公开镜像',
          value:3
        }
      ],
      currentImageName:'',
      currentImageId:'',
      imageStateDic:{
        0 : '未在使用',
        1 : '正在使用'
      },
      abortController: new AbortController(),
      imageServiceDialog:false,
      imageServiceLoading:false,
      imageDeleteDialog:false,
      imageServiceData:[],
      imageDeleteData:{
        currentImageId:'',
        versionNum:'',
      },
      imageUploadErr:false,
      closeFlag:false,
      // uploadMessage:'正在计算文件的MD5码\n正在上传文件切片...\n切片上传完成！\n合并文件中...\n合并文件成功！\n正在推送文件至仓库...\n文件推送成功！\n上传成功！',
      uploadMessage:'',
      uploadingFlag:true,
      serviceStateDic:{
        running:'运行中',
        stoped:'停止',
        exited:'停止',
        error:'异常',
        waiting:'等待资源',
        starting:'部署中',
      },
    }
  },
  computed:{
  },
  components:{
    ArrowDown,
  },
  created() {
    const route = useRoute();
    if(route.query.imageVersionId){
      console.log(route.query.imageVersionId,'route.query.imageVersionId')
      let imageVersionId = route.query.imageVersionId;
      let middle = {image_version_id:imageVersionId};
      this.loadMyImage(middle);
    }else{
      this.loadMyImage();
    }
  },
  mounted() {

  },
  watch:{
    pageIndex:{
      handler(newValue,oldValue){
        if(newValue === 2){
          let middle = {
            is_public : 1
          }
          //加载公开镜像
          this.loadPublicImage(middle);
        }else if(newValue === 1){
          this.loadMyImage();
        }
      },
      deep:true
    },
    imageUploadErr:{
      handler(newValue,oldValue){
        if(!oldValue && newValue){
          this.uploadMessage += '\n上传文件失败！';
          this.uploadingFlag = false;
          this.closeFlag = true;
          // this.uploadingDialog = false;
        }
      },
      deep:true
    },
    'formOfImageVersionImport.tag':{
      handler(newValue,oldValue){
      },
      deep:true
    },
  },
  methods:{
    // 获取所有镜像版本总数
    getTotalVersions(imageList) {
      let total = 0;
      imageList.forEach(image => {
        if (image.version_num) {
          total += parseInt(image.version_num);
        }
      });
      return total;
    },
    
    // 获取使用中的镜像版本数
    getUsedImageVersions(imageList) {
      let usedCount = 0;
      imageList.forEach(image => {
        if (image.image_version && image.image_version.length > 0) {
          image.image_version.forEach(version => {
            if (version.is_used === 1) {
              usedCount++;
            }
          });
        }
      });
      return usedCount;
    },
    changePageIndex(param){
      this.pageIndex = param;
    },

    loadMyImage(param){
      this.myImageLoading = true;
      request.get('/ImageRepository/GetImageRepositoryList',{
        params:param ? param : {}
      }).then(res=>{
        console.log(res.data,'data')
        this.myImageData = res.data;
        this.myImageLoading = false;
      })
    },

    loadPublicImage(param){
      this.publicImageLoading = true;
      request.get('/ImageRepository/GetImageRepositoryList',{
        params:param ? param : {is_public : 1}
      }).then(res=>{
        console.log(res.data,'data')
        this.publicImageData = res.data;
        this.publicImageLoading = false;
      })
    },

    selectByImageState(){

    },

    openImageImportDialog(){
      this.importMyImageInfoDialog = true;
      this.formOfImageInfoImport = {
        imageName:'',
        isPublic:'不公开',
        tag:'',
      }
    },

    //根据镜像名称模糊搜索
    selectByImageName(){
      let middle = {
        image_name:this.selectInputByImageName,
      };
      this.loadMyImage(middle);
    },

    //部署，跳转到部署页面
    createOnlineService(image,imageVersion){
      router.push({path:'/onlineServiceDeploy',query:{imageName:image.image_name,imageId:image.image_id,
          imageTag:imageVersion.tag,imageVersionId:imageVersion.image_version_id,deployMode:'imageSpecific'}});
    },

    //打开镜像版本对应的在线服务的列表
    openServiceDialog(param){
      this.imageServiceDialog = true;
      let middle = {
        image_version_id:param.image_version_id
      }
      request.get('/ImageRepository/GetImageServiceList',{
        params: middle
      }).then(res=>{
        console.log(res.data,'res.data')
        this.imageServiceData = res.data;
      })
    },

    openModifyImageDialog(){

    },

    //点击修改，弹出镜像修改的表单
    openModifyVersionDialog(param){
      this.modifyMyImageDialog = true;
      this.currentImageId = param.image_id;
      this.formOfModifyMyImage.imageName = param.image_name;
      this.formOfModifyMyImage.imageDesc = param.image_desc;
      this.formOfModifyMyImage.isPublic = param.is_public === 0 ? '不公开' : '公开';
    },

    //镜像信息的修改
    modifyMyImage(){
      let middle = {
        image_id: this.currentImageId,
        image_name: this.formOfModifyMyImage.imageName,
        image_desc: this.formOfModifyMyImage.imageDesc,
        is_public: this.formOfModifyMyImage.isPublic === '不公开' ? 0 : 1,
      }
      imageModify(middle).then(res=>{
        ElMessage({message:'修改成功！',type:'success',offset:60})
        console.log(res.data,'data in imagemodify');
        this.modifyMyImageDialog = false;
        this.loadMyImage();
      }).catch(err=>{
        ElMessage({message:'修改失败！',type:'error',offset:60})
        console.log(err,'err in imagemodify')
        this.modifyMyImageDialog = false;
      })
    },

    versionDeleteMethod(param,slot){
      let middle = {
        image_version_id:param.image_version_id,
      }
      console.log(middle,middle)
      imageVersionDelete(middle).then(res=>{
        ElMessage({message:'删除成功！',type:'success',offset:60})
        console.log(res.data,'data in imagedelete')
        this.loadMyImage();
      }).catch(err=>{
        ElMessage({message:'删除失败！',type:'error',offset:60})
        console.log(err,'err in imagedelete')
      })
    },

    //添加镜像版本
    addVersion(param){
      this.importMyImageVersionDialog = true;
      this.formOfImageVersionImport.tag = '';
      this.formOfImageVersionImport.imageVersionDesc = '';
      this.currentImageName = param.image_name;
      this.currentImageId = param.image_id;
      if(this.$refs.uploadRef){
        this.$refs.uploadRef.clearFiles();
      }
      this.uploadFile = {};

    },

    //打开镜像删除的提示框
    openImageDeleteDialog(param){
      this.imageDeleteDialog = true;
      this.imageDeleteData.currentImageId = param.image_id;
      this.imageDeleteData.versionNum = param.version_num;
    },

    //镜像的删除
    imageDeleteMethod(){
      let middle = {
        image_id:this.imageDeleteData.currentImageId,
      }
      imageDelete(middle).then(res=>{
        ElMessage({message:'删除成功！',type:'success',offset:60})
        this.imageDeleteDialog = false;
        this.imageDeleteData.currentImageId = '';
        this.imageDeleteData.versionNum = '';
        console.log(res.data,'data in imagedelete')
        this.loadMyImage();
      }).catch(err=>{
        this.imageDeleteDialog = false;
        this.imageDeleteData.currentImageId = '';
        this.imageDeleteData.versionNum = '';
        ElMessage({message:'删除失败！',type:'error',offset:60})
        console.log(err,'err in imagedelete')
      })

    },

    selectByImageOwner(){

    },
    selectByPublicImageName(){
      let middle = {
        image_name:this.selectInputByPublicImageName,
        is_public : 1
      };
      this.loadPublicImage(middle);
    },

    //取消上传
    cancelUpload(){
      this.uploadingDialog = false;
      this.abortController.abort();
      uploadCancel(JSON.stringify(this.identifier)).then(res=>{
        console.log('通知后端取消上传成功')
      }).catch(err=>{
        console.log('通知后端取消上传失败')
      })
    },

    //创建镜像
    async importMyImageInfo(){
      await this.$refs.imageImportRef.validate((valid)=>{
        if(valid){
          console.log('验证成功')
          //验证成功后调用创建镜像的接口
          let middle = {
            image_name:this.formOfImageInfoImport.imageName,
            image_desc:this.formOfImageInfoImport.imageDesc || '',
            is_public:this.formOfImageInfoImport.isPublic === '不公开' ? 0 : 1,
          }
          imageSave(middle).then(res=>{
            console.log(res,'res in imagesave')
            ElMessage({message:'创建成功！',type:'success',offset:60})
            this.importMyImageInfoDialog = false;
            this.loadMyImage();
          }).catch(err=>{
            console.log(err,'err')
            if(err.response.status === 412){
              ElMessage({message:err.response.data.detail,type:'error',offset:60});
            }else{
              this.importMyImageInfoDialog = false;
              ElMessage({message:'创建失败！',type:'error',offset:60})
            }

          });
        }else{
          console.log('验证失败')
          ElMessage({message:'请完善服务信息！', type:'error', offset:60});
        }
      });

    },

    //对文件进行切片，并分片调用接口上传文件
    async fileSlice(){
      if(JSON.stringify(this.uploadFile) === '{}'){
        ElMessage({message:'请上传镜像文件！', type:'error', offset:60});
      }else{
        this.importMyImageVersionDialog = false;
        this.uploadingFlag = true;
        this.closeFlag = false;
        this.uploadMessage = '';
        this.uploadingDialog = true;
        ElMessage({message:'开始上传!',type:'success',offset:60,customClass:'messageIndex'})
        //上传文件切片的数量
        let sliceNum = Math.ceil(this.uploadFile.size / this.sliceSize);
        const p = await this.computeFileMd5(this.uploadFile,sliceNum);
        console.log(this.identifier,'this.identifier');
        //文件的唯一标识符，通过Md5对文件进行编码得到
        let identifier = this.identifier;
        //上传镜像的名称
        this.imageNameDic[identifier] =  this.currentImageName;
        //上传镜像的ID
        this.imageIdDic[identifier] = this.currentImageId;
        //上传镜像的版本号
        this.imageTagDic[identifier] = this.formOfImageVersionImport.tag;
        //上传镜像的版本描述
        this.imageVersionDescDic[identifier] = this.formOfImageVersionImport.imageVersionDesc;
        //上传文件的大小
        this.fileSizeDic[identifier] = this.uploadFile.size;
        //上传文件的名称
        this.fileNameDic[identifier] = this.uploadFile.name;

        console.log(sliceNum,'s,type')
        this.successUploadSliceDic[identifier] = 0;
        this.imageUploadErr = false;
        this.abortController =  new AbortController();
        this.uploadMessage += '\n正在上传文件切片...';
        for (let i = 1; i <= sliceNum; i++) {
          let chunk;
          if (i === sliceNum) {
            // 最后一片
            chunk = this.uploadFile.slice((i - 1) * this.sliceSize, this.fileSizeDic[identifier]);//切割文件
          } else {
            chunk = this.uploadFile.slice((i - 1) * this.sliceSize, i * this.sliceSize);
          }
          const formData = new FormData();
          formData.append("file", chunk);
          formData.append("identifier", identifier);
          formData.append("number", i - 1);
          this.uploadFileInter(formData,sliceNum,identifier);
        }
        console.log('切片上传请求发送完成，等待浏览器处理')
        this.$refs.uploadRef.clearFiles()
        this.uploadFile = {};
      }
    },

    //新增版本弹窗的确定按钮
    async importMyImageVersion(){
      //首先对镜像导入的信息进行规则校验
      await this.$refs.imageVersionImportRef.validate((valid)=>{
        // val = valid ? true : false;
        if(valid){
          request.get('/ImageRepository/JudgeImageVersionRepeat',{
            params:{image_id:this.currentImageId,tag:this.formOfImageVersionImport.tag}
          }).then(res=>{
            console.log(res,'res')
            if (res.code === '1') {
              ElMessage({message:'版本号重复！', type:'error', offset:60});
            } else{
              this.fileSlice();
            }
          })
        }else{
          ElMessage({message:'请根据提示修改完善信息！', type:'error', offset:60});
        }
      })

    },

    //分片上传文件的接口
    uploadFileInter(data,sliceNum,identifier){
      let middle = {
        signal: this.abortController.signal
      }
      imageUpload(data,middle).then(res=>{
        console.log(res.data,'res in imageUpload')
        if(res.data.code === 200){
          this.successUploadSliceDic[identifier] += 1;
          this.completionDic[identifier] = ((this.successUploadSliceDic[identifier] / sliceNum) * 100).toFixed(1);
          console.log('进度：',this.completionDic[identifier])
          //当前切片是文件的最后一个切片，发送合并切片请求
          if(this.successUploadSliceDic[identifier] === sliceNum){
            console.log('merging')
            this.uploadMessage += '\n切片上传完成！';
            let middle = {
              name:this.fileNameDic[identifier],
              total_slice:sliceNum,
              identifier:identifier
            }
            this.mergeSlice(middle,identifier)
          }
        }
      }).catch(err=>{
        if(err.code === 'ERR_CANCELED'){
          //请求已取消
        }else{
          this.abortController.abort();//分片上传的接口出错，停止后续接口的上传
          this.imageUploadErr = true;
        }
      })
    },

    //合并切片
    mergeSlice(data,identifier){
      // ElMessage({message:'开始合并文件!',type:'success',offset:60})
      this.uploadingFlag = false;
      this.uploadMessage += '\n合并文件中...';
      let middle = {
        signal: this.abortController.signal
      }
      imageMerge(data,middle).then(res=>{
        console.log(res.data,'res in merge');
        this.uploadMessage += '\n合并文件成功！';
        this.pushImage(identifier);
      }).catch(err=>{
        // ElMessage({message:'合并错误！',type:'error',offset:60})
        this.uploadMessage += '\n合并错误！';
        this.uploadingFlag = false;
        this.closeFlag = true;
        // this.uploadingDialog = false;
      })
      this.successUploadSliceDic[identifier] = 0;
    },

    //将镜像push到huber仓库
    pushImage(identifier){
      // ElMessage({message:'开始推送文件至仓库！',type:'success',offset:60})
      this.uploadMessage += '\n正在推送文件至仓库...'
      let data = {
        image_id:this.imageIdDic[identifier],
        image_name:this.imageNameDic[identifier],
        tag:this.imageTagDic[identifier],
        file_name:this.fileNameDic[identifier],
        desc:this.imageVersionDescDic[identifier] || '',
        md5:identifier
      }
      let middle = {
        signal: this.abortController.signal
      }
      console.log(data,'middle')
      console.log(data,'middle in pushimage')
      imagePush(data,middle).then(res=>{
        // ElMessage({message:'上传成功！',type:'success',offset:60})
        this.closeFlag = true;
        this.uploadMessage += '\n文件推送成功！';
        this.uploadMessage += '\n上传成功！';
        // this.uploadingDialog = false;
        this.loadMyImage();
        console.log(res.data,'res.data')
      }).catch(err=>{
        // this.uploadingDialog = false;
        this.closeFlag = true;
        this.uploadMessage += '\n文件推送失败！';
        this.uploadMessage += '\n上传失败！';
        console.log(err,'err')
      })
    },

    //导入文件
    importFile(file){
      this.identifier = '';
      this.uploadFile = file.raw;
      this.completionDic[this.identifier] = 0;
    },

    //计算文件的md5码
    computeFileMd5Old(file){
      const p = new Promise((resolve,reject)=>{
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = e => {
          if (file.size != e.target.result.byteLength) {
            ElMessage({message:'文件读取失败！',type:'error',offset:60})
            return;
          }
          this.identifier = md5(e.target.result);
          this.completionDic[this.identifier] = 0;
          resolve(this.identifier);
          console.log(this.identifier,'this.identifier')
        };
        fileReader.onerror = function(e) {
          console.log(e,'e')
          ElMessage({message:'文件读取出错！',type:'error',offset:60})
        };
      })
      return p;

    },
    computeFileMd5(file,chunkCount){
      const that = this;
      this.uploadMessage += '\n正在计算文件的MD5码'
      const p = new Promise((resolve,reject)=>{
        let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
        let chunks = chunkCount;
        let currentChunk = 0;
        let spark = new SparkMD5.ArrayBuffer();
        let fileReader = new FileReader();
        fileReader.onload = function (e) {
          spark.append(e.target.result);
          currentChunk++;
          if (currentChunk < chunks) {
            loadNext();
          } else {
            that.identifier = spark.end();
            resolve(that.identifier);
          }
        };
        fileReader.onerror = function (e) {
          that.closeFlag = true;
          reject(e);
        };
        function loadNext() {
          let start = currentChunk * that.sliceSize;
          let end = start + that.sliceSize;
          if (end > file.size) {
            end = file.size;
          }
          fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }
        loadNext();
      })
      return p;

    },
    //导入文件取消
    importFileCancel(){
      this.$refs.uploadRef.clearFiles()
      this.uploadFile = {};
      this.uploadFileDialog = false;
    },

    //上传文件之前的校验
    beforeUploadFile(file){
      let suffix = file.name.split('.')[file.name.split('.').length - 1];
      let trueOrFalse = (suffix === '.zip' || suffix === '.tar');
      if(!trueOrFalse){
        ElMessage({message:'文件格式不正确！',type:'error',offset:60});
      }else{
        console.log('文件格式正确!')
      }
      return trueOrFalse;
    },
    toServicePage(param){
      router.push({path:'OnlineServiceList',query:{serviceId:param.service_id}})
    },
    //设置状态style
    setStateStyle(param) {
      if (param === '运行中' || param === 'running') {
        return {"background-color": "#409eff", "color": "white","width":"80px"}
      } else if (param === '部署中' || param === 'starting') {
        return {"background-color": "#69B0E9", "color": "white","width":"80px"}
      } else if (param === '停止' || param === 'stoped' || param === 'exited') {
        return {"background-color": "#E29194", "color": "white","width":"80px"}
      } else if (param === '异常' || param === 'error'){
        return {"background-color": "#CD353B", "color": "white","width":"80px"}
      } else if (param === '等待部署' || param === 'waiting'){
        return {"background-color": "#00CED1", "color": "white","width":"80px"}
      }
    },
  }
}
</script>

<style scoped>
.image-repository {
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

.image-metrics {
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

.create-btn {
  padding: 8px 16px;
  font-weight: 500;
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

.image-table {
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

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  font-size: 13px;
}

.action-dropdown {
  margin: 0 8px;
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

.version-table {
  border-radius: 4px;
  overflow: hidden;
}

/* 拥有者单元格样式 */
.owner-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

/* 上传进度对话框样式 */
.upload-progress-container {
  display: flex;
  align-items: center;
  padding: 20px;
}

.progress-chart {
  flex: 0 0 auto;
}

.progress-message {
  flex: 1;
  margin-left: 20px;
  white-space: pre-line;
  line-height: 1.5;
  max-height: 150px;
  overflow-y: auto;
}

.percentage-value {
  display: block;
  margin-top: 10px;
  font-size: 28px;
  font-weight: bold;
}

.percentage-label {
  display: block;
  margin-top: 10px;
  font-size: 12px;
  color: #606266;
}

/* 删除确认对话框 */
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

/* 对话框样式统一 */
.image-dialog, .upload-dialog, .uploading-dialog, .confirm-dialog {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background-color: #f5f7fa;
  margin-right: 0;
  border-bottom: 1px solid #e4e7ed;
  padding: 15px 20px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  border-top: 1px solid #f0f0f0;
}

:deep(.el-tag) {
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
}

/* 上传组件样式 */
:deep(.el-upload-dragger) {
  border: 2px dashed #4c75a3;
  transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409EFF;
  background-color: rgba(64, 158, 255, 0.05);
}

:deep(.el-icon--upload) {
  font-size: 48px;
  color: #4c75a3;
  margin-bottom: 10px;
}

:deep(.el-upload__text) {
  color: #606266;
  font-size: 14px;
  margin-top: 10px;
}

:deep(.el-upload__text em) {
  color: #4c75a3;
  font-style: normal;
  font-weight: 600;
}
/* 修改镜像创建按钮样式，与DataScreen保持一致 */
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

/* 确保按钮文字为白色 */
:deep(.create-btn span) {
  color: #ffffff;
}
/* 弹窗样式统一优化 */
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

:deep(.el-dialog__header) {
  position: relative;
  background: linear-gradient(to right, #1a2942, #4c75a3);
  padding: 16px 20px;
  margin-right: 0;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: center;
}

:deep(.el-dialog__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-dialog__headerbtn) {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.3s;
  z-index: 10;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 16px;
  font-weight: bold;
}

:deep(.el-dialog__headerbtn:hover) {
  background: rgba(255, 255, 255, 0.35);
  border-color: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

:deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: white;
}

:deep(.el-dialog__body) {
  padding: 24px 30px;
  background-color: #ffffff;
}

:deep(.el-dialog__footer) {
  padding: 12px 30px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fbfbfb;
}

/* 表单项样式优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #1a2942;
}

:deep(.el-input__inner) {
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.el-input__inner:hover) {
  border-color: #4c75a3;
}

:deep(.el-input__inner:focus) {
  border-color: #1a2942;
  box-shadow: 0 0 0 2px rgba(26, 41, 66, 0.2);
}

:deep(.el-textarea__inner) {
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.el-textarea__inner:hover) {
  border-color: #4c75a3;
}

:deep(.el-textarea__inner:focus) {
  border-color: #1a2942;
  box-shadow: 0 0 0 2px rgba(26, 41, 66, 0.2);
}

/* 镜像修改对话框 */
.image-dialog {
  min-width: 400px;
}

/* 上传文件对话框 */
.upload-dialog :deep(.el-upload-dragger) {
  border: 2px dashed #4c75a3;
  background-color: #f8fafc;
  border-radius: 8px;
  transition: all 0.3s;
}

.upload-dialog :deep(.el-upload-dragger:hover) {
  border-color: #1a2942;
  background-color: #f0f7ff;
  transform: translateY(-2px);
}

.upload-dialog :deep(.el-upload__text) {
  color: #606266;
  margin-top: 12px;
}

.upload-dialog :deep(.el-upload__text em) {
  color: #4c75a3;
  font-style: normal;
  font-weight: 600;
}

.upload-dialog :deep(.el-upload__tip) {
  color: #909399;
  font-size: 13px;
  margin-top: 10px;
}

/* 上传进度对话框 */
.uploading-dialog .upload-progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px;
}

.uploading-dialog .progress-chart {
  margin-bottom: 20px;
}

.uploading-dialog .progress-message {
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e0e7ee;
  width: 100%;
  min-height: 100px;
  max-height: 150px;
  overflow-y: auto;
  font-family: monospace;
  white-space: pre-line;
  line-height: 1.6;
  color: #303133;
}

/* 确认删除对话框 */
.confirm-dialog .confirm-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}

.confirm-dialog .confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.confirm-dialog .confirm-content {
  padding: 20px;
  text-align: center;
  font-size: 15px;
  line-height: 1.8;
  color: #606266;
  background-color: rgba(245, 108, 108, 0.05);
  border-radius: 6px;
  margin: 10px 0 20px;
}

.confirm-dialog .confirm-content b {
  color: #f56c6c;
  padding: 0 3px;
  font-size: 17px;
}

/* 服务列表对话框 */
.image-service-dialog .service-table {
  border-radius: 4px;
  overflow: hidden;
}

/* 按钮样式优化 */
:deep(.el-dialog__footer .el-button--default) {
  border-color: #d9d9d9;
  background: white;
  font-weight: 500;
  transition: all 0.3s;
}

:deep(.el-dialog__footer .el-button--default:hover) {
  border-color: #c0c4cc;
  background-color: #f5f7fa;
  transform: translateY(-1px);
}

:deep(.el-dialog__footer .el-button--primary) {
  background: linear-gradient(to right, #1a2942, #4c75a3);
  border: none;
  font-weight: 500;
  transition: all 0.3s;
}

:deep(.el-dialog__footer .el-button--primary:hover) {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(26, 41, 66, 0.2);
}
</style>
