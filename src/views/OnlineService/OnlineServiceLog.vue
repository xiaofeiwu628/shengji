<template>
  <div class="log-container">
    <!-- 头部区域 -->
    <div class="header-area">
      <div class="tech-title">
        <el-icon><Document /></el-icon>
        <el-breadcrumb :separator-icon="ArrowRight" class="nav-breadcrumb">
          <el-breadcrumb-item :to="{ path: '/onlineServiceList' }" class="tech-breadcrumb">
            在线服务
          </el-breadcrumb-item>
          <el-breadcrumb-item class="tech-breadcrumb">
            日志
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="main-content-wrapper">
      <!-- 服务信息卡片 -->
      <div class="service-info-card">
        <div class="service-info-item">
          <span class="info-label">服务ID</span>
          <span class="info-value">{{ serviceId }}</span>
        </div>
        <div class="service-info-item">
          <span class="info-label">服务名称</span>
          <span class="info-value">{{ serviceName }}</span>
        </div>
        <div class="service-info-item">
          <span class="info-label">服务状态</span>
          <span class="info-value">
            <el-tag :type="getServiceStateType" size="small">
              {{ serviceStateDic[serviceState] }}
            </el-tag>
          </span>
        </div>
      </div>

      <!-- 日志区域 -->
      <div class="log-section">
        <div class="log-tabs">
          <el-menu class="log-menu" mode="horizontal" :default-active="pageIndex">
            <el-menu-item index="0" @click="changeIndex('0')">
              <el-icon><Monitor /></el-icon>
              <span>服务日志</span>
            </el-menu-item>
            <el-menu-item index="1" @click="changeIndex('1')">
              <el-icon><Box /></el-icon>
              <span>容器内部日志</span>
            </el-menu-item>
          </el-menu>
        </div>
        
        <!-- 服务日志面板 -->
        <div class="log-panel" v-show="pageIndex === '0'">
          <div class="log-header">
            <div class="log-title">服务运行日志</div>
            <div class="log-actions">
              <el-tooltip content="清空日志" placement="top">
                <el-button size="small" icon="Delete" circle @click="clearLogs('serviceMessages')"></el-button>
              </el-tooltip>
              <el-tooltip content="滚动到底部" placement="top">
                <el-button size="small" icon="Bottom" circle @click="scrollToBottom('serviceMessages')"></el-button>
              </el-tooltip>
            </div>
          </div>
          <div 
            id="serviceMessages" 
            class="log-content" 
            v-loading="logLoading"
            element-loading-text="正在加载日志..."
          ></div>
        </div>
        
        <!-- 容器日志面板 -->
        <div class="log-panel" v-show="pageIndex === '1'">
          <div class="log-header">
            <div class="log-title">容器内部日志</div>
            <div class="log-actions">
              <el-tooltip content="清空日志" placement="top">
                <el-button size="small" icon="Delete" circle @click="clearLogs('containerMessage')"></el-button>
              </el-tooltip>
              <el-tooltip content="滚动到底部" placement="top">
                <el-button size="small" icon="Bottom" circle @click="scrollToBottom('containerMessage')"></el-button>
              </el-tooltip>
            </div>
          </div>
          <div 
            id="containerMessage" 
            class="log-content" 
            v-loading="conLogLoading"
            element-loading-text="正在加载日志..."
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from "vue-router";
import request from "@/utils/request";
import { ElMessage } from "element-plus";
import { serviceLog } from "@/utils/before";
import { default as AnsiUp } from 'ansi_up';
import { ArrowRight, Document, Monitor, Box, Delete, Bottom } from '@element-plus/icons-vue';

export default {
  name: "OnlineServiceLog",
  data() {
    return {
      serviceId: '',
      logLoading: false,
      conLogLoading: false,
      serviceName: '',
      serviceState: '',
      serviceStateDic: {
        running: '运行中',
        stoped: '停止',
        exited: '停止',
        error: '未知异常',
        error_connection: '连接异常',
        error_starting: '启动异常',
        error_running: '运行异常',
        waiting: '等待资源',
        starting: '部署中',
      },
      redFlag: false,
      blueFlag: false,
      pageIndex: '0',
      showContainerLog: 0,//0不显示，1显示
      wsDict: {},
      httpDict: {},
      log_data: [],//日志内容列表
      ArrowRight, Document, Monitor, Box, Delete, Bottom
    }
  },
  computed: {
    getServiceStateType() {
      const stateMap = {
        running: 'success',
        stoped: 'info',
        exited: 'info',
        error: 'danger',
        error_connection: 'danger',
        error_starting: 'danger',
        error_running: 'danger',
        waiting: 'warning',
        starting: 'warning',
      };
      return stateMap[this.serviceState] || 'info';
    }
  },
  created() {
    const route = useRoute();
    console.log(route.query.serviceId, 'route.query.serviceId')
    this.serviceId = route.query.serviceId;
    this.serviceName = route.query.serviceName;
    this.serviceState = route.query.serviceState;
    this.logConnection(`ws://192.168.109.198:8090/task/read_log/${this.serviceId}`, 'serviceMessages');
  },
  beforeUnmount() {
    //关闭页面后将所有的websocket连接关闭
    Object.keys(this.wsDict).forEach(item => {
      this.wsDict[item].close();
    })
  },
  watch: {
    pageIndex: {
      handler(newValue, oldValue) {
        if (this.pageIndex === '1') {
          //调用查数据库nodeid和containerid的接口,根据服务状态显示气质日志
          let node_id = '';
          let c_id = '';
          let param = { service_id: this.serviceId }
          this.conLogLoading = true;
          request.get('OnlineService/GetExtraConf', {
            params: param
          }).then(res => {
            console.log(res.data, 'res.data');
            //当容器位于存在和不存在两个状态之间转变时才会删除原先的dom子节点重新加载日志
            if ((res.data.service_state !== this.serviceState)) {
              this.wsDict = {};
              this.httpDict = {};
              this.clearLogs('containerMessage');
            }
            this.serviceState = res.data.service_state;
            if (res.data.service_state === 'running') {
              node_id = res.data.extra_conf.node_id;
              c_id = res.data.extra_conf.container_id;
              let url = `ws://192.168.109.198:8090/container/read_log/${node_id}/${c_id}`
              if (!this.wsDict[url]) {
                this.logConnection(url, 'containerMessage')
              }
            } else {
              if (!this.httpDict[this.serviceId]) {
                //使用http接口接收日志
                serviceLog(this.serviceId.toString()).then(res => {
                  console.log(res.data, 'res.data')
                  this.httpDict[this.serviceId] = res.data
                  this.logProcess(res.data);
                  this.conLogLoading = false;
                }).catch(err => {
                  this.conLogLoading = false;
                })
              } else {
                this.conLogLoading = false;
              }
            }
          }).catch(err => {
            ElMessage({ message: '接口异常', type: 'error', offset: 60 })
            this.conLogLoading = false;
          })
        }
      },
      deep: true,
    },
  },
  methods: {
    //连接日志
    logConnection(url, ele) {
      let ansi_up = new AnsiUp()
      this.log_data = []
      const _this = this;
      if (ele === 'serviceMessages') {
        _this.logLoading = true;
      } else {
        _this.conLogLoading = true;
      }
      let mark = 0;
      let messageNumber = 0;
      const ws = new WebSocket(url);
      _this.wsDict[url] = ws;
      ws.onopen = function () {
        console.log('WS open')
      };
      ws.onclose = function () {
        console.log('WS close');
      };
      ws.onerror = function (event) {
        // console.log(event.data);
      };
      ws.onmessage = function (event) {
        if (event.data !== "pass") {
          messageNumber += 1;
          let log_line = ansi_up.ansi_to_html(event.data)
          var messages = document.getElementById(ele);
          var message = document.createElement('div');
          message.className = 'log-line';
          message.innerHTML = log_line
          
          // 为不同类型的日志设置不同样式类
          if (event.data.indexOf('| error |') >= 0 || event.data.indexOf('| ERROR |') >= 0) {
            message.classList.add('log-error');
            this.redFlag = true;
            this.blueFlag = false;
          } else if (event.data.indexOf('| warning |') >= 0 || event.data.indexOf('| WARNING |') >= 0) {
            message.classList.add('log-warning');
            this.redFlag = false;
            this.blueFlag = false;
          } else if (event.data.indexOf('| INFO |') >= 0) {
            message.classList.add('log-info');
            this.redFlag = false;
            this.blueFlag = false;
          } else if (event.data.indexOf('以下是容器内部日志') >= 0) {
            message.classList.add('log-header');
            this.blueFlag = true;
            this.redFlag = false;
          }
          
          if (this.redFlag) {
            message.classList.add('log-error');
          } else if (this.blueFlag) {
            message.classList.add('log-header');
          }
          
          if (event.data.indexOf('效果最好的模型超参数是：') >= 0) {
            mark = messageNumber;
            message.classList.add('log-highlight');
          }
          
          if ((messageNumber - mark === 1) && mark !== 0) {
            message.classList.add('log-highlight');
          }

          messages.appendChild(message);
          
          // 自动滚动到底部
          messages.scrollTop = messages.scrollHeight;
        }
        
        if (ele === 'serviceMessages') {
          _this.logLoading = false;
        } else {
          _this.conLogLoading = false;
        }
      };
    },
    changeIndex(param) {
      this.pageIndex = param;
    },
    logProcess(data) {
      let ansi_up = new AnsiUp()
      let liList = []
      liList = data.split('\n');
      liList.forEach(item => {
        let log_line = ansi_up.ansi_to_html(item)
        var messages = document.getElementById('containerMessage');
        var message = document.createElement('div');
        message.className = 'log-line';
        
        // 为不同类型的日志设置不同样式类
        if (item.indexOf('| error |') >= 0 || item.indexOf('| ERROR |') >= 0) {
          message.classList.add('log-error');
        } else if (item.indexOf('| warning |') >= 0 || item.indexOf('| WARNING |') >= 0) {
          message.classList.add('log-warning');
        } else if (item.indexOf('| INFO |') >= 0) {
          message.classList.add('log-info');
        } else if (item.indexOf('以下是容器内部日志') >= 0) {
          message.classList.add('log-header');
        }
        
        message.innerHTML = log_line
        messages.appendChild(message)
      })
      
      // 自动滚动到底部
      let container = document.getElementById('containerMessage');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    // 新增方法
    clearLogs(elementId) {
      const logElement = document.getElementById(elementId);
      if (logElement) {
        while (logElement.firstChild) {
          logElement.removeChild(logElement.firstChild);
        }
      }
      if (elementId === 'containerMessage') {
        this.httpDict = {};
      }
      ElMessage({ message: '日志已清空', type: 'success', offset: 60 });
    },
    scrollToBottom(elementId) {
      const logElement = document.getElementById(elementId);
      if (logElement) {
        logElement.scrollTop = logElement.scrollHeight;
      }
    }
  }
}
</script>

<style scoped>
/* 基础布局样式 */
.log-container {
  display: flex;
  flex-direction: column;
}

/* 头部区域 - 与OnlineServiceDeploy保持一致 */
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
  padding: 20px;
  min-height: calc(100vh - 150px);
}

/* 服务信息卡片 */
.service-info-card {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
  border: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.service-info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 13px;
  color: #909399;
}

.info-value {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

/* 日志区域 */
.log-section {
  margin-top: 20px;
}

.log-tabs {
  margin-bottom: 20px;
}

.log-menu {
  border-radius: 8px;
  background-color: #f1f5f9;
  border: 1px solid #ebeef5;
}

:deep(.el-menu--horizontal) {
  border-bottom: none;
}

:deep(.el-menu--horizontal .el-menu-item) {
  height: 50px;
  line-height: 50px;
  border-bottom: none;
  font-weight: 500;
}

:deep(.el-menu--horizontal .el-menu-item.is-active) {
  border-bottom: 3px solid #4c75a3;
  color: #4c75a3;
}

:deep(.el-menu--horizontal .el-menu-item:not(.is-active):hover) {
  color: #4c75a3;
}

.log-panel {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.log-header {
  padding: 12px 15px;
  background-color: #f1f5f9;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-title {
  font-weight: 500;
  color: #1a2942;
}

.log-actions {
  display: flex;
  gap: 10px;
}

.log-content {
  height: 500px;
  overflow: auto;
  padding: 10px;
  background-color: #1a1a1a;
  font-family: 'Courier New', Courier, monospace;
  color: #e0e0e0;
  font-size: 14px;
  line-height: 1.5;
}

/* 日志行样式 */
:deep(.log-line) {
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: 4px;
  padding: 2px 0;
}

:deep(.log-error) {
  color: #ff6b6b !important;
}

:deep(.log-warning) {
  color: #ffa502 !important;
}

:deep(.log-info) {
  color: #70a1ff !important;
}

:deep(.log-header) {
  color: #2ed573 !important;
  font-weight: 600;
  border-bottom: 1px dashed rgba(46, 213, 115, 0.3);
  margin: 8px 0;
  padding-bottom: 4px;
}

:deep(.log-highlight) {
  font-weight: bold;
  color: #ff9ff3 !important;
  background-color: rgba(255, 159, 243, 0.1);
  padding: 4px;
  border-radius: 4px;
}

/* 加载动画样式 */
:deep(.el-loading-mask) {
  background-color: rgba(0, 0, 0, 0.7);
}

:deep(.el-loading-text) {
  color: #ffffff;
}

:deep(.el-loading-spinner .path) {
  stroke: #4c75a3;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .service-info-card {
    flex-direction: column;
    gap: 15px;
  }
  
  .log-content {
    height: 400px;
  }
}
</style>