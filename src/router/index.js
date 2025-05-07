import { createRouter, createWebHistory } from 'vue-router'
import DataScreen from '../views/DatasetManagement/DataScreen.vue'
import Home from '../views/Home.vue'
import Layout from '../layout/Layout'
import DataView from '../views/DatasetManagement/DataView.vue'
import DataViewDetail from '../views/DatasetManagement/DataViewDetail.vue'
import MultiVisualization from '../views/DatasetManagement/MultiVisualization.vue'
import Login from '../views/login.vue'
import Register from '../views/register.vue'
import Test from '../views/test.vue'
import request from "@/utils/request";
import TaskView from "@/views/AutoModel/TaskView";
import TaskCreate from "@/views/AutoModel/TaskCreate";
import TaskModify from "@/views/AutoModel/TaskModify";
import taskDetails from "@/views/AutoModel/taskDetails";
import ModelList from "@/views/ModelRepository/ModelList";
import OnlineServiceList from "@/views/OnlineService/OnlineServiceList"
import OnlineServiceDeploy from "@/views/OnlineService/OnlineServiceDeploy"
import OnlineServiceDetails from "@/views/OnlineService/OnlineServiceDetails"
import OnlineServiceLog from "@/views/OnlineService/OnlineServiceLog"
import ImageList from "@/views/ImageRepository/ImageList";
import OnlineServiceLogVisualization from "@/views/OnlineService/OnlineServiceLogVisualization";
import EntityView from '@/views/DatasetManagement/EntityView'
import EntityViewDetail from '@/views/DatasetManagement/EntityViewDetail'
import EntityVisualization from '@/views/DatasetManagement/EntityVisualization'

const routes = [
  {
    //框架
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect:'/home',
    children:[
      {//首页
        path: 'home',
        name: 'Home',
        component: Home,
      },
      {
        //数据集概览
        path: '/datascreen',
        name: 'Datascreen',
        component: DataScreen
      },
      {
        //数据表概览
        path: '/dataView',
        name: 'DataView',
        component: DataView
      },
      {
        //命名实体识别数据表总览
        path: '/entityView',
        name: 'EntityView',
        component: EntityView
      },
      {
        //数据表数据详情
        path: '/dataView/detail',
        name: 'DataViewDetail',
        component: DataViewDetail
      },
      {
        //命名实体识别数据表详情
        path: '/entityView/detail',
        name: 'EntityViewDetail',
        component: EntityViewDetail
      },
      {
        //数据表多字段可视化
        path: '/MultiVisualization',
        name: 'MultiVisualization',
        component: MultiVisualization
      },
      {
        //实体数据可视化
        path: '/entityVisualization',
        name: 'EntityVisualization',
        component: EntityVisualization
      },
      {
        //自动建模任务总览
        path: '/taskView',
        name: 'TaskView',
        component: TaskView
      },
      {
        //新建任务
        path: '/taskCreate',
        name: 'TaskCreate',
        component: TaskCreate
      },
      {
        //任务详情
        path: '/taskDetails',
        name: 'TaskDetails',
        component: taskDetails
      },
      {
        //修改任务
        path: '/taskModify',
        name: 'TaskModify',
        component: TaskModify
      },
      {
        //模型仓库
        path: '/modelList',
        name: 'ModelList',
        component: ModelList
      },
      {
        //在线服务列表
        path: '/onlineServiceList',
        name: 'OnlineServiceList',
        component: OnlineServiceList,
      },
      {
        //在线服务部署
        path: '/onlineServiceDeploy',
        name: 'OnlineServiceDeploy',
        component: OnlineServiceDeploy,
      },
      {
        //服务详情
        path: '/onlineServiceDetails',
        name: 'OnlineServiceDetails',
        component: OnlineServiceDetails,
      },
      {
        //服务详情
        path: '/onlineServiceLogVisualization',
        name: 'OnlineServiceLogVisualization',
        component: OnlineServiceLogVisualization,
      },
      {
        //镜像仓库-镜像列表
        path: '/imageList',
        name: 'ImageList',
        component: ImageList
      },
      {
        //在线服务日志
        path: '/onlineServiceLog',
        name: 'OnlineServiceLog',
        component: OnlineServiceLog
      },
    ]
  },
  {
    //登录
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    //注册
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    //测试
    path: '/test',
    name: 'Test',
    component: Test
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

//路由守卫，判断用户是否登录，token是否有效
router.beforeEach((to,from,next) =>{
  //验证token,只有存在token的时候，才能跳转到内容页
  let myToken = localStorage.getItem("Token");
  if(to.path === '/login' || to.path === '/register'){
    next();
  }else{
    request.get("/UserLogin/CheckLogin", {
      params:{
        Token:myToken?myToken:''
      }
    }).then(res =>{
      if(res.code === '0'){
        next();
      } else {
        next("/login");
      }
    })
  }
})


export default router
