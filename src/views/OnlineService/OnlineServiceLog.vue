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
                <el-button size="small" :icon="Delete" circle @click="clearLogs('serviceMessages')"></el-button>
              </el-tooltip>
              <el-tooltip content="滚动到底部" placement="top">
                <el-button size="small" :icon="Bottom" circle @click="scrollToBottom('serviceMessages')"></el-button>
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
                <el-button size="small" :icon="Delete" circle @click="clearLogs('containerMessage')"></el-button>
              </el-tooltip>
              <el-tooltip content="滚动到底部" placement="top">
                <el-button size="small" :icon="Bottom" circle @click="scrollToBottom('containerMessage')"></el-button>
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

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from "vue-router";
import request from "@/utils/request";
import { ElMessage } from "element-plus";
import { serviceLog } from "@/utils/before";
import AnsiUp from 'ansi_up';
import { ArrowRight, Document, Monitor, Box, Delete, Bottom } from '@element-plus/icons-vue'

const serviceId = ref<string>('')
const serviceName = ref<string>('')
const serviceState = ref<string>('')
const pageIndex = ref('0')
const logLoading = ref(false)
const conLogLoading = ref(false)
const wsDict = reactive<Record<string, WebSocket>>({})
const httpDict = reactive<Record<string, any>>({})
const log_data = ref<any[]>([])
const redFlag = ref(false)
const blueFlag = ref(false)
const logBuffer = ref<HTMLElement[]>([])
let logRenderTimer: ReturnType<typeof setTimeout> | null = null

const serviceStateDic: Record<string, string> = {
  running: '运行中',
  stoped: '停止',
  exited: '停止',
  error: '未知异常',
  error_connection: '连接异常',
  error_starting: '启动异常',
  error_running: '运行异常',
  waiting: '等待资源',
  starting: '部署中',
}

const getServiceStateType = computed(() => {
  const stateMap: Record<string, string> = {
    running: 'success',
    stoped: 'info',
    exited: 'info',
    error: 'danger',
    error_connection: 'danger',
    error_starting: 'danger',
    error_running: 'danger',
    waiting: 'warning',
    starting: 'warning',
  }
  return stateMap[serviceState.value] || 'info'
})

/** 切换日志tab */
function changeIndex(param: string) {
  pageIndex.value = param
}

/** 清空日志内容 */
function clearLogs(elementId: string) {
  const logElement = document.getElementById(elementId)
  if (logElement) {
    while (logElement.firstChild) {
      logElement.removeChild(logElement.firstChild)
    }
  }
  if (elementId === 'containerMessage') {
    Object.keys(httpDict).forEach(key => delete httpDict[key])
  }
  ElMessage({ message: '日志已清空', type: 'success', offset: 60 })
}

/** 滚动到底部 */
function scrollToBottom(elementId: string) {
  const logElement = document.getElementById(elementId)
  if (logElement) {
    logElement.scrollTop = logElement.scrollHeight
  }
}

/** 日志批量渲染，防止卡顿 */
function renderLogs(ele: string) {
  const messages = document.getElementById(ele)
  if (!logBuffer.value.length || !messages) return
  const fragment = document.createDocumentFragment()
  while (logBuffer.value.length) {
    const log = logBuffer.value.shift()
    if (log) fragment.appendChild(log)
  }
  messages.appendChild(fragment)
  messages.scrollTop = messages.scrollHeight
  logRenderTimer = null
}

/** 连接日志WebSocket并批量渲染日志 */
function logConnection(url: string, ele: string) {
  const ansi_up = new AnsiUp()
  log_data.value = []
  if (ele === 'serviceMessages') {
    logLoading.value = true
  } else {
    conLogLoading.value = true
  }
  let mark = 0
  let messageNumber = 0
  const ws = new WebSocket(url)
  wsDict[url] = ws

  // 清空缓冲区和定时器
  logBuffer.value = []
  if (logRenderTimer) clearTimeout(logRenderTimer)

  ws.onopen = () => {}
  ws.onclose = () => {
    if (logRenderTimer) clearTimeout(logRenderTimer)
  }
  ws.onerror = () => {}

  ws.onmessage = function (event) {
    if (event.data !== "pass") {
      messageNumber += 1
      let log_line = ansi_up.ansi_to_html(event.data)
      const message = document.createElement('div')
      message.className = 'log-line'
      message.innerHTML = log_line

      // 日志样式判断
      if (event.data.indexOf('| error |') >= 0 || event.data.indexOf('| ERROR |') >= 0) {
        message.classList.add('log-error')
        redFlag.value = true
        blueFlag.value = false
      } else if (event.data.indexOf('| warning |') >= 0 || event.data.indexOf('| WARNING |') >= 0) {
        message.classList.add('log-warning')
        redFlag.value = false
        blueFlag.value = false
      } else if (event.data.indexOf('| INFO |') >= 0) {
        message.classList.add('log-info')
        redFlag.value = false
        blueFlag.value = false
      } else if (event.data.indexOf('以下是容器内部日志') >= 0) {
        message.classList.add('log-header')
        blueFlag.value = true
        redFlag.value = false
      }

      if (redFlag.value) {
        message.classList.add('log-error')
      } else if (blueFlag.value) {
        message.classList.add('log-header')
      }

      if (event.data.indexOf('效果最好的模型超参数是：') >= 0) {
        mark = messageNumber
        message.classList.add('log-highlight')
      }
      if ((messageNumber - mark === 1) && mark !== 0) {
        message.classList.add('log-highlight')
      }

      // 推入缓冲区
      logBuffer.value.push(message)
      // 批量渲染（每 16ms 或 50 条日志渲染一次）
      if (!logRenderTimer || logBuffer.value.length > 50) {
        logRenderTimer = setTimeout(() => renderLogs(ele), 16)
      }
    }

    if (ele === 'serviceMessages') {
      logLoading.value = false
    } else {
      conLogLoading.value = false
    }
  }
}

/** 处理http获取的日志 */
function logProcess(data: string) {
  const ansi_up = new AnsiUp()
  const liList = data.split('\n')
  liList.forEach(item => {
    let log_line = ansi_up.ansi_to_html(item)
    const messages = document.getElementById('containerMessage')
    const message = document.createElement('div')
    message.className = 'log-line'
    // 日志样式判断
    if (item.indexOf('| error |') >= 0 || item.indexOf('| ERROR |') >= 0) {
      message.classList.add('log-error')
    } else if (item.indexOf('| warning |') >= 0 || item.indexOf('| WARNING |') >= 0) {
      message.classList.add('log-warning')
    } else if (item.indexOf('| INFO |') >= 0) {
      message.classList.add('log-info')
    } else if (item.indexOf('以下是容器内部日志') >= 0) {
      message.classList.add('log-header')
    }
    message.innerHTML = log_line
    messages?.appendChild(message)
  })
  // 自动滚动到底部
  const container = document.getElementById('containerMessage')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// tab切换时加载容器日志
watch(pageIndex, (newValue) => {
  if (newValue === '1') {
    let node_id = ''
    let c_id = ''
    let param = { service_id: serviceId.value }
    conLogLoading.value = true
    request.get('OnlineService/GetExtraConf', { params: param }).then(res => {
      if ((res.data.service_state !== serviceState.value)) {
        Object.keys(wsDict).forEach(key => wsDict[key].close())
        Object.keys(httpDict).forEach(key => delete httpDict[key])
        clearLogs('containerMessage')
      }
      serviceState.value = res.data.service_state
      if (res.data.service_state === 'running') {
        node_id = res.data.extra_conf.node_id
        c_id = res.data.extra_conf.container_id
        let url = `ws://192.168.109.198:8090/container/read_log/${node_id}/${c_id}`
        if (!wsDict[url]) {
          logConnection(url, 'containerMessage')
        }
      } else {
        if (!httpDict[serviceId.value]) {
          serviceLog(serviceId.value.toString()).then(res => {
            httpDict[serviceId.value] = res.data
            logProcess(res.data)
            conLogLoading.value = false
          }).catch(() => {
            conLogLoading.value = false
          })
        } else {
          conLogLoading.value = false
        }
      }
    }).catch(() => {
      ElMessage({ message: '接口异常', type: 'error', offset: 60 })
      conLogLoading.value = false
    })
  }
}, { immediate: false })

onMounted(() => {
  const route = useRoute()
  serviceId.value = String(route.query.serviceId || '')
  serviceName.value = String(route.query.serviceName || '')
  serviceState.value = String(route.query.serviceState || '')
  logConnection(`ws://192.168.109.198:8090/task/read_log/${serviceId.value}`, 'serviceMessages')
})

onBeforeUnmount(() => {
  Object.keys(wsDict).forEach(item => {
    wsDict[item].close()
  })
  if (logRenderTimer) clearTimeout(logRenderTimer)
})
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