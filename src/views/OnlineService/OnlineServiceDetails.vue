<template>
  <div>
    <div style="margin: 20px 0 0 2%">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/onlineServiceList' }">在线服务</el-breadcrumb-item>
        <el-breadcrumb-item >服务详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
<!--    <el-divider style="margin: 15px 0 0 0" />-->
    <div style="background-color: white;margin: 20px;min-height: calc(100vh - 124px)">
      <div>
        <div style="padding: 30px 0 0 2%">
          <div class="task-title-div"></div>
          <span class="task-title-name">基本信息</span>
        </div>
        <div style="margin: 30px 0 0 100px">
          <el-form
              label-position="left"
              label-width="100px"
              :model="formOfBaseInformation"
              style="max-width: 420px;"
          >
            <el-form-item label="服务名称：">
              <span>{{formOfBaseInformation.serviceName}}</span>
            </el-form-item>
            <el-form-item label="服务ID：">
              <span>{{formOfBaseInformation.serviceId}}</span>
            </el-form-item>
            <el-form-item label="服务状态：">
              <span>{{this.serviceStateDic[formOfBaseInformation.serviceState]}}</span>
            </el-form-item>
            <el-form-item label="创建时间：">
              <span>{{formOfBaseInformation.createTime}}</span>
            </el-form-item>
            <el-form-item label="部署方式：">
              <span>{{serviceTypeDic[formOfBaseInformation.serviceType]}}</span>
            </el-form-item>
<!--            <el-form-item label="接口地址：">-->
<!--              <span>{{formOfBaseInformation.interfaceAddress}}</span>-->
<!--            </el-form-item>-->
            <el-form-item label="服务描述：">
              <span>{{formOfBaseInformation.desc}}</span>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <!--    模型信息-->
      <div v-if="formOfBaseInformation.serviceType === 'official'">
        <div style="margin: 30px 0 0 2%">
          <div class="task-title-div"></div>
          <span class="task-title-name">模型信息</span>
        </div>
        <div style="margin: 30px 0 0 100px;width: 60%">
          <el-table :data="modelInformationTableData" style="width: 100%" border  :header-cell-style="{background:'#F5F5F5'}">
            <el-table-column prop="modelName" label="模型名称" min-width="20%" align="center"/>
            <el-table-column prop="modelId" label="模型ID" min-width="20%" align="center"/>
            <el-table-column prop="taskId" label="所属任务ID" min-width="20%" align="center"/>
            <el-table-column prop="taskHistoryId" label="任务运行ID" min-width="20%" align="center"/>
            <el-table-column prop="isPublic" label="是否公开" min-width="20%" align="center"/>
          </el-table>
        </div>
      </div>
      <!--    镜像信息-->
      <div v-if="formOfBaseInformation.serviceType === 'custom'">
        <div style="margin: 30px 0 0 2%">
          <div class="task-title-div"></div>
          <span class="task-title-name">镜像信息</span>
        </div>
        <div style="margin: 30px 0 0 100px;width: 60%">
          <el-table :data="imageInformationTableData" style="width: 100%" border  :header-cell-style="{background:'#F5F5F5'}">
            <el-table-column prop="imageName" label="镜像名称" min-width="25%" align="center"/>
            <el-table-column prop="imageId" label="镜像ID" min-width="25%" align="center"/>
            <el-table-column prop="imageVersionId" label="镜像版本ID" min-width="25%" align="center"/>
            <el-table-column prop="tag" label="版本号" min-width="25%" align="center"/>
          </el-table>
        </div>
      </div>
<!--      资源规格-->
      <div>
        <div style="margin: 30px 0 0 2%">
          <div class="task-title-div"></div>
          <span class="task-title-name">资源规格</span>
        </div>
        <div style="margin: 30px 0 0 100px;width: 50%">
          <el-form
              label-position="left"
              label-width="100px"
              :model="formOfResource"
              style="max-width: 420px;"
          >
            <el-form-item label="内存：">
              <span>{{formOfResource.memory}}</span>
            </el-form-item>
            <el-form-item label="CPU核心数：">
              <span>{{formOfResource.cpuCoresNum}}</span>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <!--    请求说明-->
      <div style="padding-bottom: 20px">
        <div style="margin: 30px 0 0 2%">
          <div class="task-title-div"></div>
          <span class="task-title-name">请求说明</span>
        </div>
        <div style="padding: 30px 0 0 100px">
          <el-form
              label-position="left"
              label-width="100px"
              :model="formOfRequestDesc"
          >
            <el-form-item label="HTTP方法">
              <span>{{"POST"}}</span>
            </el-form-item>
            <el-form-item label="请求URL">
              <div>
                <div>{{formOfRequestDesc.url}}</div>
                <div style="color: red" v-if="formOfBaseInformation.serviceType === 'custom'">
                  {{"注：您可以根据需要在上述URL基础上进行延申，如："+formOfRequestDesc.url+'/example'}}</div>
              </div>

            </el-form-item>
            <el-form-item label="Header">
              <el-table :data="headerTableData" style="width: 40%" border :header-cell-style="{background:'#F5F5F5'}">
                <el-table-column prop="name" label="参数" min-width="30%" align="center"/>
                <el-table-column prop="value" label="取值" min-width="70%" align="center"/>
              </el-table>
            </el-form-item>
            <el-form-item label="Body请求体">
              <el-table :data="bodyRequestBody" style="width: 50%" border :header-cell-style="{background:'#F5F5F5'}">
                <el-table-column prop="param" label="参数" min-width="10%" align="center"/>
                <el-table-column prop="required" label="必填" min-width="10%" align="center"/>
                <el-table-column prop="type" label="类型" min-width="10%" align="center"/>
                <el-table-column prop="desc" label="说明" min-width="70%" align="center"/>
              </el-table>
            </el-form-item>

            <el-form-item label="请求示例" v-if="formOfBaseInformation.serviceType === 'official'">
              <div>
                <pre style="background-color: #f5f2f0">{{specificDesc1}}</pre>

              </div>
            </el-form-item>
<!--            <el-form-item label="返回示例" v-if="formOfBaseInformation.serviceType === 'official'">-->
<!--              <div style="width: 50%;margin-bottom: 20px" >-->
<!--                <pre style="background-color: #f5f2f0">{{specificDesc2}}</pre>-->

<!--              </div>-->
<!--            </el-form-item>-->

          </el-form>
        </div>

      </div>
    </div>
<!--    基本信息-->

  </div>
</template>

<script>
import { useRoute } from 'vue-router';
import request from "@/utils/request";
import { ArrowRight } from '@element-plus/icons-vue';
import {ElMessage} from "element-plus";
export default {
  name: "OnlineServiceDetails",
  data(){
    const specificDesc = {
      // data: [
      //   {
      //     time: '2022/4/2  19:00:00',
      //     seeing: 1.884879937,
      //     fried_ridius: 0.056876903,
      //     cohen_time: 0.0035507,
      //     iso_angel: 2.850606553,
      //     'WindSpeed=1': 3.256252674,
      //     temperature: 7.244484217,
      //   },
      //   {
      //     time: '2022/4/2  19:02:00',
      //     seeing: 1.856986183,
      //     fried_ridius: 0.05773125,
      //     cohen_time: 0.003598514,
      //     iso_angel: 2.850862509,
      //     'WindSpeed=1': 3.250761397,
      //     temperature: 7.23049815,
      //   },
      // ]
    }
    return{
      formOfBaseInformation:{},
      modelInformationTableData:[],
      imageInformationTableData: [],
      formOfRequestDesc:{},
      headerTableData:[
        {
          name:'Token',
          value:localStorage.getItem("token"),
        }
      ],
      bodyRequestBody:[
        {
          param:'data',
          required:'是',
          type:'Array',
          desc:'待预测数据，每条待预测数据是由各个特征及其取值构成的键值对的集合'
        }
      ],
      taskID:'',
      historyID:'',
      version:'',
      ArrowRight,
      specificDesc1:{},
      specificDesc2:{},
      serviceId:'',
      formOfResource:{},
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
      serviceTypeDic:{
        custom:'镜像部署',
        official:'模型部署',
      }
    }
  },
  created() {
    const route = useRoute();
    this.taskID = route.query.taskId;
    this.historyID  = route.query.historyId;
    this.version = route.query.version;
    this.serviceId = route.query.serviceId;
    this.loadServiceDetails();
  },
  methods:{
    loadServiceDetails(){
      request.get('/OnlineService/GetOnlineService',{
        params:{
          service_id:this.serviceId
        }
      }).then(res=>{
        let middle = {}
        this.formOfBaseInformation['serviceName'] = res.data.service_name;
        this.formOfBaseInformation['serviceId'] = res.data.service_id;
        this.formOfBaseInformation['serviceState'] = res.data.service_state;
        this.formOfBaseInformation['createTime'] = res.data.create_time;
        this.formOfBaseInformation['desc'] = res.data.service_desc;
        this.formOfBaseInformation['serviceType'] = res.data.service_type;
        if(res.data.service_type === 'custom'){
          middle['imageName'] = res.data.image_version_data.image_name;
          middle['imageVersionId'] = res.data.image_version_data.image_version_id;
          middle['tag'] = res.data.image_version_data.tag;
          middle['imageId'] = res.data.image_version_data.image_id;
          this.imageInformationTableData.push(middle);
        }else if(res.data.service_type === 'official'){
          middle['modelName'] = res.data.model_data.model_name;
          middle['modelId'] = res.data.model_id;
          middle['taskId'] = res.data.task_id;
          middle['taskHistoryId'] = res.data.task_history_id;
          middle['isPublic'] = res.data.model_data.is_public === '1'? '公开':'不公开';
          this.modelInformationTableData.push(middle);
        }else{
          ElMessage({message:'参数异常！', type:'error', offset:60})
        }
        this.formOfResource['memory'] = (res.data.memory / 1000000000) + 'GB';
        this.formOfResource['cpuCoresNum'] = res.data.cpu_cores_num;
        this.formOfRequestDesc.url = res.data.kong_url;
        this.specificDesc1 = JSON.parse(JSON.stringify(res.data.request_data));
        // this.specificDesc2 = JSON.parse(JSON.stringify(res.data.return_data));
        console.log(this.specificDesc1,'specificDesc1')
        // console.log(this.specificDesc2,'specificDesc2')

        console.log(res.data,'res.data in loadServiceDetails');
        console.log(this.modelInformationTableData,'modelInformationTableData in loadServiceDetails');
      })
    }
  }
}
</script>

<style scoped>

</style>
