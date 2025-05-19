import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import DataScreen from '../views/DatasetManagement/DataScreen.vue'
import Home from '../views/Home.vue'
import Layout from '../layout/Layout.vue'
import DataView from '../views/DatasetManagement/DataView.vue'
import DataViewDetail from '../views/DatasetManagement/DataViewDetail.vue'
import MultiVisualization from '../views/DatasetManagement/MultiVisualization.vue'
import Login from '../views/login.vue'
import Register from '../views/register.vue'
// import Test from '../views/test.vue'
import request from "@/utils/request";
import TaskView from "@/views/AutoModel/TaskView.vue";
import TaskCreate from "@/views/AutoModel/TaskCreate.vue";
import TaskModify from "@/views/AutoModel/TaskModify.vue";
import taskDetails from "@/views/AutoModel/taskDetails.vue";
import ModelList from "@/views/ModelRepository/ModelList.vue";
import OnlineServiceList from "@/views/OnlineService/OnlineServiceList.vue"
import OnlineServiceDeploy from "@/views/OnlineService/OnlineServiceDeploy.vue"
import OnlineServiceDetails from "@/views/OnlineService/OnlineServiceDetails.vue"
import OnlineServiceLog from "@/views/OnlineService/OnlineServiceLog.vue"
import ImageList from "@/views/ImageRepository/ImageList.vue";
import OnlineServiceLogVisualization from "@/views/OnlineService/OnlineServiceLogVisualization.vue";
import EntityView from '@/views/DatasetManagement/EntityView.vue'
import EntityViewDetail from '@/views/DatasetManagement/EntityViewDetail.vue'
import EntityVisualization from '@/views/DatasetManagement/EntityVisualization.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/home',
    children: [
      { path: 'home', name: 'Home', component: Home },
      { path: '/datascreen', name: 'Datascreen', component: DataScreen },
      { path: '/dataView', name: 'DataView', component: DataView },
      { path: '/entityView', name: 'EntityView', component: EntityView },
      { path: '/dataView/detail', name: 'DataViewDetail', component: DataViewDetail },
      { path: '/entityView/detail', name: 'EntityViewDetail', component: EntityViewDetail },
      { path: '/MultiVisualization', name: 'MultiVisualization', component: MultiVisualization },
      { path: '/entityVisualization', name: 'EntityVisualization', component: EntityVisualization },
      { path: '/taskView', name: 'TaskView', component: TaskView },
      { path: '/taskCreate', name: 'TaskCreate', component: TaskCreate },
      { path: '/taskDetails', name: 'TaskDetails', component: taskDetails },
      { path: '/taskModify', name: 'TaskModify', component: TaskModify },
      { path: '/modelList', name: 'ModelList', component: ModelList },
      { path: '/onlineServiceList', name: 'OnlineServiceList', component: OnlineServiceList },
      { path: '/onlineServiceDeploy', name: 'OnlineServiceDeploy', component: OnlineServiceDeploy },
      { path: '/onlineServiceDetails', name: 'OnlineServiceDetails', component: OnlineServiceDetails },
      { path: '/onlineServiceLogVisualization', name: 'OnlineServiceLogVisualization', component: OnlineServiceLogVisualization },
      { path: '/imageList', name: 'ImageList', component: ImageList },
      { path: '/onlineServiceLog', name: 'OnlineServiceLog', component: OnlineServiceLog }
    ]
  },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  // { path: '/test', name: 'Test', component: Test }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫，判断用户是否登录，token是否有效
router.beforeEach((to, from, next) => {
  const myToken = localStorage.getItem("Token");
  if (to.path === '/login' || to.path === '/register') {
    next();
  } else {
    request.get("/UserLogin/CheckLogin", {
      params: {
        Token: myToken ? myToken : ''
      }
    }).then((res: any) => {
      if (res.code === '0') {
        next();
      } else {
        next("/login");
      }
    }).catch(() => {
      next("/login");
    });
  }
});

export default router