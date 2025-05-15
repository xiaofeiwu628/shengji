<template>
  <div class="entity-detail-container">
    <!-- 顶部导航区域 -->
    <div class="header-area">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/datascreen' }" class="tech-breadcrumb">
          <el-icon><Files /></el-icon>
          数据集管理
        </el-breadcrumb-item>
        <el-breadcrumb-item 
          :to="{ path: '/entityView', query: { datasetId: dataInfo.datasetId, tableId: dataInfo.tableId } }"
          class="tech-breadcrumb"
        >
          <el-icon><Grid /></el-icon>
          数据表概览
        </el-breadcrumb-item>
        <el-breadcrumb-item class="tech-breadcrumb">
          <el-icon><Document /></el-icon>
          数据详情
        </el-breadcrumb-item>
      </el-breadcrumb>
      
      <!-- 统计信息 -->
      <div class="data-metrics">
        <div class="metric-card">
          <div class="metric-value">{{ totalItems }}</div>
          <div class="metric-label">数据总量</div>
        </div>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="content-panel">
      <!-- 标题区域 -->
      <div class="panel-header">
        <div class="panel-title">
          <el-icon><Document /></el-icon>
          <span>数据详情列表</span>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <el-table
          :data="fileList"
          border
          stripe
          size="small"
          class="data-table"
          ref="fileTableRef"
          height="60vh"
          v-loading="loading"
        >
          <el-table-column label="ID" prop="id" sortable :sort-method="sortById" width="150">
            <template #header>
              <span class="column-header">
                <el-icon><Ticket /></el-icon>
                <span>ID</span>
              </span>
            </template>
            <template #default="scope">
              <div class="id-cell">{{ scope.row.id }}</div>
            </template>
          </el-table-column>
          
          <el-table-column label="文本内容" prop="text">
            <template #header>
              <span class="column-header">
                <el-icon><ChatLineRound /></el-icon>
                <span>文本内容</span>
              </span>
            </template>
            <template #default="scope">
              <el-popover
                placement="bottom"
                :width="400"
                trigger="hover"
                :content="scope.row.text"
                :popper-style="{ padding: '12px 16px', fontSize: '14px', lineHeight: '1.5' }"
                :show-after="500"
              >
                <template #reference>
                  <div class="text-cell">{{ scope.row.text }}</div>
                </template>
              </el-popover>
            </template>
          </el-table-column>
          
          <el-table-column label="标签" width="150">
            <template #header>
              <span class="column-header">
                <el-icon><CollectionTag /></el-icon>
                <span>标签</span>
              </span>
            </template>
            <template #default="scope">
              <el-button 
                class="view-labels-btn" 
                @click="showLabels(scope.row.id)"
              >
                <el-icon><View /></el-icon>
                查看标签
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 分页控制 -->
      <div class="pagination-container" v-if="totalItems > 0">
        <el-pagination
          v-model:currentPage="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 15, 20, 50]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
          @size-change="getFileContent(1)"
          @current-change="getFileContent"
        />
      </div>
    </div>
    
    <!-- 标签详情对话框 -->
    <el-dialog 
      v-model="labelsVisible" 
      title="标签详情" 
      width="60%" 
      @closed="closeLabelsDialog"
      class="custom-dialog labels-dialog"
    >
      <div class="labels-dialog-content">
        <!-- 标签总览信息 -->
        <div class="labels-summary" v-if="labelsTableData.length > 0">
          <div class="summary-item">
            <el-icon><CollectionTag /></el-icon>
            <span>标签总数：<strong>{{ labelsTableData.length }}</strong> 个</span>
          </div>
        </div>
        
        <!-- 标签表格 -->
        <el-table
          :data="labelsTableData"
          border
          stripe
          size="small"
          class="labels-table"
          ref="entityTableRef"
          v-if="labelsVisible"
        >
          <el-table-column prop="0" label="ID" width="100">
            <template #header>
              <span class="column-header">ID</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="1" label="实体" width="180">
            <template #header>
              <span class="column-header">实体</span>
            </template>
            <template #default="scope">
              <el-tag size="small" effect="plain" class="entity-tag">
                {{ scope.row[1] }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="2" label="起始下标" width="120">
            <template #header>
              <span class="column-header">起始下标</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="3" label="结束下标" width="120">
            <template #header>
              <span class="column-header">结束下标</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="4" label="文本" show-overflow-tooltip>
            <template #header>
              <span class="column-header">文本</span>
            </template>
            <template #default="scope">
              <div class="entity-text">{{ scope.row[4] }}</div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import request from "@/utils/request";
import { ElLoading, ElMessage } from "element-plus";
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from "vue-router/dist/vue-router";
import { 
  ArrowRight, Files, Grid, Document, Ticket, 
  ChatLineRound, CollectionTag, View 
} from '@element-plus/icons-vue';

// 路由器
const router = useRouter();
// 文件原始内容
const fileList = ref([]);
// labels弹窗表格绑定的数据表，根据用户点击去获取
const labelsTableData = ref([]);
// 数据表信息
const dataInfo = reactive({
  tableId: "",
  datasetId: "",
});
// labels弹窗是否可见
const labelsVisible = ref(false);
// 标签表格的ref
const entityTableRef = ref();
// 文件内容列表dom
const fileTableRef = ref();
// 页面大小
const pageSize = ref(10);
// 当前页
const currentPage = ref(1);
// 总条数
const totalItems = ref(0);
// 加载状态
const loading = ref(false);

// 将字符串转换为数字排序
const sortById = (a, b) => {
  return parseInt(a.id) - parseInt(b.id);
};

// 获取文件原始内容
const getFileContent = async (pager = 1) => {
  loading.value = true;
  currentPage.value = pager;
  
  try {
    const res = await request.get("/jsonDetail/getFileList", {
      params: {
        datasetId: dataInfo.datasetId,
        tableId: dataInfo.tableId,
        currentPage: pager,
        pageSize: pageSize.value,
      },
    });
    
    if (res.code === "0") {
      fileList.value = res.data.fileList;
      totalItems.value = res.data.totalItems;
      ElMessage({
        type: "success",
        message: "数据加载成功",
        offset: 60,
      });
    } else {
      ElMessage({
        type: "error",
        message: res.msg || "获取数据失败",
        offset: 60,
      });
    }
  } catch (error) {
    ElMessage({
      type: "error",
      message: "网络错误，请稍后重试",
      offset: 60,
    });
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 显示标签弹窗
const showLabels = id => {
  labelsTableData.value = fileList.value.find(item => item.id === id).labels;
  labelsVisible.value = true;
};

// 关闭标签实体对话框
const closeLabelsDialog = () => {
  labelsTableData.value = [];
};

// 挂载
onMounted(async () => {
  loading.value = true;
  dataInfo.tableId = router.currentRoute.value.query.tableId;
  dataInfo.datasetId = router.currentRoute.value.query.datasetId;
  await getFileContent();
});
</script>

<style scoped>
.entity-detail-container {
  display: flex;
  flex-direction: column;
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

/* 面板标题 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 20px;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2942;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title .el-icon {
  font-size: 20px;
  color: #4c75a3;
}

/* 表格容器 */
.table-container {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-radius: 8px;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

:deep(.el-table th) {
  background-color: #f2f6fc !important;
  color: #1a2942;
  font-weight: 600;
  padding: 16px 0;
  font-size: 15px;
  text-align: center;
}

:deep(.el-table td) {
  text-align: center;
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

/* 表格列标题 */
.column-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
}

.column-header .el-icon {
  font-size: 18px;
  color: #1a2942;
}

/* 单元格样式 */
.id-cell {
  font-weight: 600;
  color: #1a2942;
  font-size: 14px;
}

.text-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 600px;
  text-align: left;
  padding: 0 10px;
  color: #606266;
}

/* 查看标签按钮 */
.view-labels-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: rgba(76, 117, 163, 0.1);
  border: 1px solid rgba(76, 117, 163, 0.2);
  color: #1a2942;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.3s;
  margin: 0 auto;
}

.view-labels-btn:hover {
  background: rgba(76, 117, 163, 0.2);
  transform: translateY(-1px);
}

.view-labels-btn .el-icon {
  color: #4c75a3;
  font-size: 14px;
}

/* 分页控制 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #1a2942;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled):hover) {
  color: #1a2942;
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

/* 标签对话框内容 */
.labels-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.labels-summary {
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

/* 实体标签表格 */
.labels-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.entity-tag {
  color: #e6a23c;
  border-color: rgba(230, 162, 60, 0.2);
  background-color: rgba(230, 162, 60, 0.1);
  font-weight: 500;
  font-size: 13px;
}

/* 文本单元格样式优化 */
.text-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 600px;
  text-align: left;
  padding: 0 12px;
  color: #333333; /* 颜色加深 */
  font-size: 15px; /* 字体增大 */
  line-height: 1.5;
  font-weight: 400;
}

/* 实体文本单元格优化 */
.entity-text {
  text-align: left;
  padding: 0 12px;
  color: #333333; /* 颜色加深 */
  font-size: 15px; /* 字体增大 */
  line-height: 1.5;
  font-weight: 400;
}

/* 悬浮提示样式优化 */
:deep(.el-popper.el-popover) {
  max-width: 600px !important;
  padding: 15px 20px !important;
  font-size: 15px !important;
  line-height: 1.6 !important;
  color: #333333 !important;
}
/* 确保表格内部元素居中 */
:deep(.el-table .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 文本单元格左对齐 */
:deep(.el-table .text-cell),
:deep(.el-table .entity-text) {
  justify-content: flex-start;
}
</style>