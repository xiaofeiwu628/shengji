<template>
  <div class="entity-view-container">
    <!-- 顶部导航区域 -->
    <div class="header-area">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/datascreen' }" class="tech-breadcrumb">
          <el-icon><Files /></el-icon>
          数据集管理
        </el-breadcrumb-item>
        <el-breadcrumb-item class="tech-breadcrumb">
          <el-icon><Grid /></el-icon>
          数据表概览
        </el-breadcrumb-item>
      </el-breadcrumb>
      
      <!-- 数据统计卡片 -->
      <div class="data-metrics">
        <div class="metric-card">
          <div class="metric-value">{{ tagList.length }}</div>
          <div class="metric-label">标签总数</div>
        </div>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="content-panel">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="table-title">
          <el-icon><Collection /></el-icon>
          <span>标签列表</span>
        </div>
        <div class="action-buttons">
          <el-button 
            type="primary" 
            class="action-btn" 
            @click="tagFileDetail(dataInfo.tableId, dataInfo.datasetId)"
          >
            <el-icon><Document /></el-icon>数据详情
          </el-button>
          <el-button 
            type="primary" 
            class="action-btn" 
            @click="tagDataVisual(dataInfo.tableId, dataInfo.datasetId)"
          >
            <el-icon><PieChart /></el-icon>数据可视化
          </el-button>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <div class="table-container">
        <el-table
          size="small"
          :data="tagList"
          border
          stripe
          class="data-table"
          height="60vh"
          ref="tagTableRef"
        >
          <el-table-column label="ID" width="130px" type="index">
            <template #header>
              <span class="column-header">
                <el-icon><Ticket /></el-icon>
                <span>ID (共计 {{ tagList.length }} 个)</span>
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="标签" prop="tag">
            <template #header>
              <span class="column-header">
                <el-icon><CollectionTag /></el-icon>
                <span>标签</span>
              </span>
            </template>
            <template #default="scope">
              <el-tag type="warning" effect="light" class="tag-item">
                {{ scope.row.tag }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="标签出现次数" prop="count" sortable>
            <template #header>
              <span class="column-header">
                <el-icon><Histogram /></el-icon>
                <span>标签出现次数</span>
              </span>
            </template>
            <template #default="scope">
              <div class="count-value">{{ scope.row.count }}</div>
            </template>
          </el-table-column>
          
          <el-table-column label="操作">
            <template #header>
              <span class="column-header">
                <el-icon><Operation /></el-icon>
                <span>操作</span>
              </span>
            </template>
            <template #default="scope">
              <el-button 
                type="primary" 
                size="small" 
                class="detail-btn"
                @click="showEntityDetail(scope.row.tag)"
              >
                <el-icon><View /></el-icon>
                实体数据详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <!-- 实体数据详情对话框 -->
    <el-dialog 
      v-model="entityDialogVisible" 
      :title="`标签：${dialogTitle}`" 
      width="40%" 
      @closed="tagEntityList = []"
      class="custom-dialog entity-dialog"
    >
      <div class="entity-dialog-content">
        <div class="entity-summary">
          <div class="summary-item">
            <el-icon><CollectionTag /></el-icon>
            <span>标签名称：<strong>{{ dialogTitle }}</strong></span>
          </div>
          <div class="summary-item">
            <el-icon><DataAnalysis /></el-icon>
            <span>实体总数：<strong>{{ tagEntityList.length }}</strong></span>
          </div>
        </div>
        
        <el-table
          size="small"
          :data="tagEntityList"
          border
          stripe
          class="entity-table"
          max-height="60vh"
          :default-sort="{prop: 'count', order: 'descending'}"
          v-if="entityDialogVisible"
        >
          <el-table-column label="ID" type="index" width="80">
            <template #header>
              <span class="column-header">ID</span>
            </template>
          </el-table-column>
          
          <el-table-column label="实体" prop="entity">
            <template #header>
              <span class="column-header">实体</span>
            </template>
            <template #default="scope">
              <div class="entity-name">{{ scope.row.entity }}</div>
            </template>
          </el-table-column>
          
          <el-table-column label="数目" prop="count" sortable width="120">
            <template #header>
              <span class="column-header">数目</span>
            </template>
            <template #default="scope">
              <div class="entity-count">{{ scope.row.count }}</div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router/dist/vue-router";
import { onMounted, reactive, ref } from "vue";
import request from "@/utils/request";
import { ElLoading, ElMessage } from "element-plus";
import { 
  ArrowRight, Files, Grid, Collection, Document, 
  PieChart, Ticket, CollectionTag, Histogram, 
  Operation, View, DataAnalysis 
} from "@element-plus/icons-vue";

// 路由器
const router = useRouter();
// 实体统计对话框可见性
let entityDialogVisible = ref(false);
// 实体统计对话框标题
let dialogTitle = ref("");
// 数据表id
const dataInfo = reactive({
  datasetId: "",
  tableId: "",
});
// 标签统计列表
let tagList = ref([]);
// 标签实体列表
let tagEntityList = ref([]);
// 标签表格dom
let tagTableRef = ref();
// 动画加载实例
let loadingInstance = ref();
// 挂载
onMounted(async () => {
  openTagTableLoading();
  dataInfo.tableId = router.currentRoute.value.query.tableId;
  dataInfo.datasetId = router.currentRoute.value.query.datasetId;
  await getTagList();
  loadingInstance.close();
});
// 获取标签列表
const getTagList = async () => {
  await request
    .get("/jsonDetail/getTagList", {
      params: {
        datasetId: dataInfo.datasetId,
        tableId: dataInfo.tableId,
      },
    })
    .then(res => {
      if (res.code === "0") {
        tagList.value = res.data;
      } else {
        ElMessage({
          type: "error",
          message: res.msg,
          offset: 60,
        });
      }
    });
};
// 打开加载动画
const openTagTableLoading = () => {
  loadingInstance = ElLoading.service({
    target: tagTableRef.value?.$el,
    lock: true,
    text: "正在加载数据...",
    background: "rgba(255,255,255,0.8)",
  });
};
// 加载文件详情
const tagFileDetail = (tableId, datasetId) => {
  router.push({
    path: "/entityView/detail",
    query: {
      datasetId,
      tableId,
    },
  });
};
// 加载数据可视化界面
const tagDataVisual = (tableId, datasetId) => {
  router.push({
    path: "/entityVisualization",
    query: {
      datasetId,
      tableId,
    },
  });
};
// 点击列表按钮，显示实体详情
const showEntityDetail = async tagName => {
  dialogTitle.value = tagName;
  
  const loadingInstance = ElLoading.service({
    fullscreen: true,
    text: "正在获取实体数据...",
    background: "rgba(255,255,255,0.8)",
  });
  
  try {
    const res = await request.get("/jsonDetail/getTagEntityList", {
      params: {
        datasetId: dataInfo.datasetId,
        tableId: dataInfo.tableId,
        tagName: dialogTitle.value,
      },
    });
    
    if (res.code === "0") {
      tagEntityList.value = res.data;
      entityDialogVisible.value = true;
    } else {
      ElMessage({
        type: "error",
        message: res.msg,
        offset: 60,
      });
    }
  } catch (error) {
    ElMessage({
      type: "error",
      message: "获取实体数据失败，请稍后重试",
      offset: 60,
    });
  } finally {
    loadingInstance.close();
  }
};
</script>

<style scoped>
.entity-view-container {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-height: calc(100vh - 60px);
}

/* 顶部导航区域 */
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

.tech-breadcrumb {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
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

.tech-breadcrumb .el-icon {
  font-size: 18px;
}

/* 数据指标卡片 */
.data-metrics {
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

/* 内容面板 */
.content-panel {
  background-color: white;
  margin: 0 20px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 1px solid #eaeaea;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2942;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-title .el-icon {
  font-size: 20px;
  color: #4c75a3;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.action-btn {
  background: linear-gradient(to right, #1a2942, #2a476e);
  border: none;
  border-radius: 6px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-weight: 500;
}

.action-btn:hover {
  background: linear-gradient(to right, #2a476e, #1a2942);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(26, 41, 66, 0.2);
}

.action-btn .el-icon {
  font-size: 16px;
}

/* 表格区域 */
.table-container {
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-radius: 8px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

:deep(.el-table th) {
  background-color: #f2f6fc !important;
  color: #1a2942;
  font-weight: 600;
  padding: 12px 0;
}

:deep(.el-table__row) {
  transition: all 0.2s;
}

:deep(.el-table__row:hover) {
  background-color: #f5f9fc !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafbfd;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

/* 标签样式 */
.tag-item {
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 13px;
}

/* 计数值样式 */
.count-value {
  font-weight: 600;
  color: #1a2942;
  font-size: 15px;
}

/* 详情按钮 */
.detail-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  font-size: 13px;
  background: rgba(76, 117, 163, 0.1);
  border: 1px solid rgba(76, 117, 163, 0.2);
  color: #1a2942;
  transition: all 0.3s;
}

.detail-btn:hover {
  background: rgba(76, 117, 163, 0.2);
  color: #1a2942;
  transform: translateY(-1px);
}

.detail-btn .el-icon {
  font-size: 15px;
  color: #4c75a3;
}

/* 对话框样式 */
:deep(.custom-dialog .el-dialog__header) {
  background: linear-gradient(to right, #1a2942, #4c75a3);
  padding: 16px 20px;
  margin-right: 0;
  border-bottom: 1px solid #eaeaea;
  position: relative;
}

:deep(.custom-dialog .el-dialog__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

:deep(.custom-dialog .el-dialog__headerbtn) {
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

:deep(.custom-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 16px;
  font-weight: bold;
}

:deep(.custom-dialog .el-dialog__headerbtn:hover) {
  background: rgba(255, 255, 255, 0.35);
  border-color: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

:deep(.custom-dialog .el-dialog__body) {
  padding: 20px;
}

/* 实体对话框内容 */
.entity-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.entity-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #4c75a3;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.summary-item .el-icon {
  color: #4c75a3;
  font-size: 18px;
}

.summary-item strong {
  color: #1a2942;
  font-weight: 600;
}

/* 实体表格 */
.entity-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.entity-name {
  color: #1a2942;
  font-weight: 500;
}

.entity-count {
  font-weight: 600;
  color: #1a2942;
}
/* 表格样式优化 */
:deep(.el-table th) {
  background-color: #f2f6fc !important;
  color: #1a2942;
  font-weight: 600;
  padding: 16px 0;
  font-size: 15px;
}

:deep(.el-table td) {
  text-align: center;
  padding: 12px 0;
}

/* 表格列标题优化 */
.column-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  width: 100%;
  padding: 0 5px;
}

.column-header .el-icon {
  font-size: 18px;
  color: #1a2942;
}

/* 标签内容居中 */
:deep(.el-table .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 10px;
}

/* 标签样式 */
.tag-item {
  padding: 5px 14px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
}

/* 计数值样式 */
.count-value {
  font-weight: 600;
  color: #1a2942;
  font-size: 16px;
}

/* 实体表格样式 */
.entity-table :deep(.el-table__header th) {
  font-size: 15px;
  padding: 14px 0;
}

.entity-name {
  color: #1a2942;
  font-weight: 500;
  font-size: 14px;
  text-align: center;
}

.entity-count {
  font-weight: 600;
  color: #1a2942;
  font-size: 15px;
  text-align: center;
}

/* 操作列按钮居中 */
:deep(.el-button.detail-btn) {
  margin: 0 auto;
}
</style>