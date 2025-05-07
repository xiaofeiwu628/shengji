<template>
<div>
  <div style="margin: 20px 0 0 2%">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item v-if="pageIndex === 1">我的镜像</el-breadcrumb-item>
      <el-breadcrumb-item v-if="pageIndex === 2">公开镜像</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
  <div style="padding: 20px 20px 0 20px;">
    <el-menu class="el-menu-m" mode="horizontal" default-active="1">
      <el-menu-item index="1" @click="changePageIndex(1)">我的镜像</el-menu-item>
      <el-menu-item index="2" @click="changePageIndex(2)" >公开镜像</el-menu-item>
    </el-menu>
  </div>
  <div style="background-color: white;margin: 20px;min-height: calc(100vh - 203px)">
<!--    我的镜像-->
    <div v-if="pageIndex === 1">
<!--      <div style="text-align: right;padding: 20px 2% 0 0;width: 100%">-->
<!--        <el-icon size="20px" @click="loadMyImage" style="cursor: pointer"><Refresh /></el-icon>-->
<!--      </div>-->
      <!--    导入、搜索查询-->
      <div style="display:flex;padding:40px 2% 0 2%">
        <el-button  type="primary" style="width: 80px" @click="openImageImportDialog">镜像创建</el-button>
        <div style="display: inline-block;flex: 1"></div>
<!--        <el-select v-model="imageState" class="m-2" style="width: 250px" @change="selectByImageState">-->
<!--          <el-option-->
<!--              v-for="item in imageStateList"-->
<!--              :key="item.value"-->
<!--              :label="item.label"-->
<!--              :value="item.value"-->
<!--          />-->
<!--        </el-select>-->
        <div style="display: inline-block;margin-left: 10px;line-height: 32px">
          <el-icon size="20px" @click="loadMyImage" style="cursor: pointer;vertical-align: middle;"><Refresh /></el-icon>
        </div>
        <el-input
            v-model="selectInputByImageName"
            class="w-50 m-2"
            clearable
            style="width: 250px;margin-left: 30px"
            placeholder="输入镜像名称查询"
            @clear="loadMyImage"
        />
        <el-button  type="primary" style="margin-left: 10px" @click="selectByImageName">查询</el-button>
      </div>
      <!--        我的镜像列表-->
      <div>
        <el-table :data="myImageData" border stripe style="width: 96%;margin: 20px 0 40px 2%" v-loading="myImageLoading" :row-style="{height:'65px'}">
          <el-table-column type="expand" min-width="3%">
            <template v-slot="slot">
              <el-table :data="slot.row.image_version" style="width: 80%;margin: 0 auto" border stripe>
                <el-table-column prop="tag" label="版本号" min-width="15%" align="center"/>
                <el-table-column prop="image_version_id" label="版本ID" min-width="15%" align="center"/>
                <el-table-column prop="version_desc" label="描述" min-width="15%" align="center"/>
<!--                <el-table-column prop="version_state" label="状态" min-width="13%" align="center"/>-->
                <el-table-column prop="is_used" label="是否使用" min-width="15%" align="center">
                  <template #default="scope">
                    <el-link :underline="false" type="primary" @click="openServiceDialog(scope.row)" v-if="scope.row.is_used === 1">{{ imageStateDic[scope.row.is_used] }}</el-link>
                    <span v-if="scope.row.is_used === 0">{{ imageStateDic[scope.row.is_used] }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="create_time" label="导入时间" min-width="18%" align="center"/>
                <el-table-column  label="操作" min-width="22%" >
                  <template #default="scope">

                    <el-dropdown class="myModelButton">
                    <span class="el-dropdown-link">
                      部署
                      <el-icon class="el-icon--right">  <ArrowDown />  </el-icon>
                    </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item @click="createOnlineService(slot.row,scope.row)">在线服务</el-dropdown-item>
                          <!--                          <el-dropdown-item>离线服务</el-dropdown-item>-->
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
<!--                    <el-button link type="primary" class="myModelButton" @click="openModifyImageDialog(scope.row)" >修改</el-button>-->
                    <el-popconfirm title="确定删除吗？" @confirm="versionDeleteMethod(scope.row,slot.row)">
                      <template #reference>
                        <el-button link type="primary" class="myModelButton">删除</el-button>
                      </template>
                    </el-popconfirm>

                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column prop="image_name" label="镜像名称" sortable min-width="12%" align="center"/>
          <el-table-column prop="image_id" label="镜像ID" min-width="12%" align="center"/>
          <el-table-column prop="image_desc" label="描述" min-width="12%" align="center"/>
          <el-table-column prop="is_public" label="是否公开" :formatter="publicFormat" min-width="12%" align="center">
            <template #default="scope">
              {{scope.row.is_public === 0 ? '不公开' : '公开'}}
            </template>
          </el-table-column>
          <el-table-column prop="version_num" label="版本数量" min-width="12%" align="center"/>
          <el-table-column prop="create_time" label="创建时间" min-width="12%" align="center"/>
          <el-table-column  label="操作" min-width="25%" >
            <template #default="scope">
              <el-button link type="primary" size="small" @click="addVersion(scope.row)">新增版本</el-button>
              <el-button link type="primary" size="small" @click="openModifyVersionDialog(scope.row)">修改</el-button>
<!--              <el-popconfirm title="确认删除吗？" @confirm="imageDeleteMethod(scope.row)">-->
<!--                <template #reference>-->
              <el-button link type="primary" size="small" @click="openImageDeleteDialog(scope.row)">删除</el-button>
<!--                </template>-->
<!--              </el-popconfirm>-->
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!--    镜像信息修改对话框-->
      <div>
        <el-dialog v-model="modifyMyImageDialog" title="镜像修改" width="500px">
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
                <el-button @click="this.modifyMyImageDialog = false">取消</el-button>
                <el-button type="primary" @click="modifyMyImage">确定</el-button>
              </span>
          </template>
        </el-dialog>
      </div>
<!--      镜像创建-->
      <div>
        <el-dialog v-model="importMyImageInfoDialog" title="镜像创建" width="30%">
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
                <el-button @click="this.importMyImageInfoDialog = false">取消</el-button>
                <el-button type="primary" @click="importMyImageInfo">确定</el-button>
              </span>
          </template>
        </el-dialog>
      </div>


      <!--      新增镜像版本-->
      <div>
        <el-dialog v-model="importMyImageVersionDialog" title="新增版本" width="30%">
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
              <el-button @click="uploadFileDialog = true">点击上传</el-button>
            </el-form-item>
          </el-form>
          <template #footer>
              <span>
                <el-button @click="this.importMyImageVersionDialog = false">取消</el-button>
                <el-button type="primary" @click="importMyImageVersion">确定</el-button>
              </span>
          </template>
<!--          上传文件窗口-->
          <el-dialog v-model="uploadFileDialog" title="文件上传" width="35%">
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
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
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
                <el-button type="primary" @click="this.uploadFileDialog = false">确定</el-button>
              </span>
            </template>
          </el-dialog>
        </el-dialog>
      </div>

<!--      上传中-弹出框-->
      <div>
        <el-dialog
            v-model="uploadingDialog"
            title=""
            :show-close="false"
            width="21%"
            style="text-align: center;padding: 0"
            :close-on-click-modal="false"
            :close-on-press-escape="false">
          <div style="display: flex;line-height:180px;height: 180px;margin: 0 0 10px 10px">
            <div style="display: inline-block;vertical-align:middle;">
              <el-progress type="dashboard" :percentage="completionDic[identifier]" style="vertical-align: middle">
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ percentage }}%</span>
                  <span class="percentage-label" v-if="uploadingFlag">上传中</span>
                </template>
              </el-progress>
            </div>
            <div style="display: inline-block;height: 100%;line-height: 100%;vertical-align: middle;margin: 0 0 0 10px;">
              <div style="display:flex;
                justify-content: center;
                white-space: pre-line;
                text-align: left;
                vertical-align: top;
                padding:0;
                line-height: 120%">
                {{uploadMessage}}
              </div>
            </div>
          </div>
          <div>
            <el-button v-if="!closeFlag" @click="cancelUpload">取消上传</el-button>
            <el-button v-if="closeFlag" @click="this.uploadingDialog = false">关闭</el-button>
          </div>
        </el-dialog>
      </div>
<!--      镜像对应服务的列表-->
      <div>
        <el-dialog v-model="imageServiceDialog" title="在线服务列表" min-width="500px">
          <el-table :data="imageServiceData" border :header-cell-style="{background:'#F5F5F5'}" v-loading="imageServiceLoading">
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
            <el-button @click="this.imageServiceDialog = false">确定</el-button>
          </span>
          </template>
        </el-dialog>
      </div>
      <!--    镜像整体删除的提示弹出框-->
      <div>
        <el-dialog v-model="imageDeleteDialog"  width="400px">
          <template #header>
            <div style="display: flex;">
              <div style="display:inline-block;line-height: 20px">
                <el-icon size="20px" style="vertical-align: middle"><WarningFilled /></el-icon>
              </div>
              <span style="display: inline-block;vertical-align: middle;line-height: 20px;margin-left: 5px;font-size: 18px;color: red">提示</span>
            </div>
          </template>
          <span>当前镜像包含{{imageDeleteData.versionNum}}个版本，确定要删除吗？</span>
          <template #footer>
          <span>
            <el-button @click="this.imageDeleteDialog = false">取消</el-button>
            <el-button type="primary" @click="imageDeleteMethod">确定</el-button>
          </span>
          </template>
        </el-dialog>
      </div>

    </div>

<!--    公开镜像-->
    <div v-if="pageIndex === 2">
      <div style="display:flex;padding:40px 2% 0 2%">
        <!--          <el-button  type="primary" style="width: 80px" @click="modelDeploy">导入</el-button>-->
        <el-icon size="20px" @click="loadPublicImage({is_public : 1})" style="cursor: pointer"><Refresh /></el-icon>
        <div style="display: inline-block;flex: 1"></div>
<!--        <el-select v-model="publicImageOwner" class="m-2" style="width: 250px" @change="selectByImageOwner">-->
<!--          <el-option-->
<!--              v-for="item in publicImageOwnerList"-->
<!--              :key="item.value"-->
<!--              :label="item.label"-->
<!--              :value="item.value"-->
<!--          />-->
<!--        </el-select>-->
        <el-input
            v-model="selectInputByPublicImageName"
            class="w-50 m-2"
            clearable
            style="width: 250px;margin-left: 30px"
            placeholder="输入镜像名称查询"
            @clear="loadPublicImage"
        />
        <el-button  type="primary" style="margin-left: 10px" @click="selectByPublicImageName">查询</el-button>
      </div>
      <!--        公开镜像列表-->
      <div>
        <el-table :data="publicImageData" border stripe style="width: 96%;margin: 20px 0 40px 2%" v-loading="publicImageLoading" :row-style="{height:'65px'}">
          <el-table-column type="expand" min-width="3%">
            <template v-slot="slot">
              <el-table :data="slot.row.image_version" style="width: 80%;margin: 0 auto" border stripe>
                <!--                <el-table-column prop="table_id" label="数据表ID" min-width="13%"/>-->
                <el-table-column prop="tag" label="版本号" min-width="13%" align="center"/>
                <el-table-column prop="image_version_id" label="版本ID" min-width="13%" align="center"/>
                <el-table-column prop="version_desc" label="描述" min-width="13%" align="center"/>
                <el-table-column prop="create_time" label="创建时间" min-width="13%" align="center"/>
                <el-table-column fixed="right" label="操作" min-width="22%">
                  <template #default="scope">
                    <el-dropdown class="myModelButton">
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
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column prop="image_name" label="镜像名称" sortable min-width="12%" align="center"/>
          <el-table-column prop="image_id" label="镜像ID" min-width="12%" align="center" />
          <el-table-column prop="image_desc" label="描述" min-width="12%" align="center"/>
          <el-table-column prop="username" label="拥有者" min-width="12%" align="center" sortable>
            <template #default="scope">
              <el-row align="middle" justify="center" :span="24">
                <p style="margin-right: 10px">{{scope.row.username}}</p>
                <el-tag
                    :type="scope.row.modify_permission === '其他' ? 'danger' : 'success'"
                    disable-transitions
                >{{ scope.row.modify_permission }}</el-tag>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column prop="version_num" label="版本数量" min-width="12%" align="center"/>
          <el-table-column prop="create_time" label="创建时间" min-width="12%" align="center"/>
          <el-table-column fixed="right" label="操作" min-width="25%">
            <template #default="scope">
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { UploadFilled,ArrowDown } from '@element-plus/icons-vue';
import { imageUpload,imageMerge,imagePush,imageSave,imageModify,imageDelete,imageVersionDelete,uploadCancel } from '@/utils/before'
import request from "@/utils/request";
import {ElMessage} from "element-plus";
import md5 from 'js-md5';
import SparkMD5 from 'spark-md5';
import router from "@/router";
import {useRoute} from "vue-router";
export default {
  name: "ImageList",
  data(){

    return{
      a:true,
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
.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
.percentage-value {
  display: block;
  margin-top: 10px;
  font-size: 28px;
}
.percentage-label {
  display: block;
  margin-top: 10px;
  font-size: 12px;
}
.messageIndex{
  z-index: 999999 !important;
}
.myModelButton{
  /*height:20px;*/
  /*line-height: 20px;*/
  vertical-align: middle;
  margin-left: 5px;
}
/* 鼠标悬浮表格样式 */
:deep(.el-table--enable-row-hover .el-table__body tr:hover>td.el-table__cell){
  background-color: rgba(137, 147, 152, 0.15);
}
</style>
