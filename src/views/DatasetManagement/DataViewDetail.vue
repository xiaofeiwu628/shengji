<template>
  <div class="data-detail-container">
    <!-- 顶部导航区域 -->
    <div class="header-area">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/datascreen' }" class="tech-breadcrumb">
          <el-icon><Files /></el-icon>
          数据集管理
        </el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/dataView' }" @click="toDataView" class="tech-breadcrumb">
          <el-icon><Grid /></el-icon>
          数据表概览
        </el-breadcrumb-item>
        <el-breadcrumb-item class="tech-breadcrumb">
          <el-icon><Document /></el-icon>
          数据详情
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 主内容区域 -->
    <div class="content-panel">
      <!-- 顶部统计信息 -->
      <div class="statistics-bar">
        <div class="statistic-tile">
          <div class="statistic-value">{{ total }}</div>
          <div class="statistic-label">总行数</div>
        </div>
        <div class="divider"></div>
        <div class="statistic-tile">
          <div class="statistic-value">{{ dataTitle.length }}</div>
          <div class="statistic-label">总列数</div>
        </div>
        <div class="flex-spacer"></div>
        <el-button type="primary" class="export-btn" @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
      
      <!-- 表格区域 -->
      <div class="table-container">
        <el-table 
          :data="tableData" 
          border 
          stripe 
          size='small' 
          class="data-table" 
          v-loading="loading"
          :row-style="{height: '48px'}"
        >
          <el-table-column 
            v-for="(item, index) in dataTitle"
            :label="item"
            :prop="item"
            :key="index"
            align="center"
            :fixed="index === 0 ? 'left' : false"
            :min-width="index === 0 ? 150 : 120"
            :show-overflow-tooltip="true"
          />
        </el-table>
      </div>

      <!-- 分页控制 -->
      <div class="pagination-container">
        <el-pagination
          v-model:currentPage="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router/dist/vue-router";
import { reactive, ref } from "vue";
import request from "@/utils/request";
import { ArrowRight, Files, Grid, Document, Download } from '@element-plus/icons-vue';
import router from "@/router";

export default {
  name: "DataViewDetail",
  setup(){
    const router = useRouter();
    const loading = ref(false);
    const viewInfo = reactive({
      tableId: 1,
      setId: 1,
    });
    viewInfo.tableId = router.currentRoute.value.query.tableId;
    viewInfo.setId = router.currentRoute.value.query.setId;
    
    return{
      viewInfo,
      loading
    }
  },
  data(){
    return {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dataTitle: [],
      tableData: [],
      ArrowRight,
      Files,
      Grid,
      Document,
      Download,
      dataViewPath: '',
    }
  },
  created() {
    this.dataViewPath = `/dataView?datasetId=${this.viewInfo.setId}&tableId=${this.viewInfo.tableId}`;
    this.load();
  },
  methods:{
    load(){
      this.loading = true;
      request.get("/dataViewDetail/tableDataDetail/" + this.viewInfo.tableId + '/' + this.currentPage + '/' + this.pageSize
      ).then(res => {
        if(res.code === '0'){
          this.dataTitle = res.data.title; // 字段数组
          this.tableData = res.data.data;  // 当前页面数据
          this.total = res.data.total;     // 所有数据总行数
          this.$message({
            type: "success",
            message: "数据加载成功",
            offset: 60
          });
        } else {
          this.$message({
            type: "error",
            message: res.msg || "数据加载失败",
            offset: 60
          });
        }
      }).catch(err => {
        this.$message({
          type: "error",
          message: "网络错误，请稍后重试",
          offset: 60
        });
        console.error(err);
      }).finally(() => {
        this.loading = false;
      });
    },
    handleSizeChange(){
      this.load();
    },
    handleCurrentChange(){
      this.load();
    },
    toDataView(){
      router.push({
        path: '/dataView',
        query: {
          datasetId: this.viewInfo.setId,
          tableId: this.viewInfo.tableId
        }
      });
    },
    exportData() {
      // 导出数据功能实现
      this.$message({
        type: "info",
        message: "数据导出功能即将上线",
        offset: 60
      });
    }
  }
}
</script>

<style scoped>
.data-detail-container {
  min-height: calc(100vh - 60px);
  padding: 0;
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

/* 主内容区域 */
.content-panel {
  background-color: white;
  margin: 0 20px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

/* 统计信息条 */
.statistics-bar {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #4c75a3;
}

.statistic-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px;
}

.statistic-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a2942;
}

.statistic-label {
  font-size: 14px;
  color: #606266;
}

.divider {
  width: 1px;
  height: 40px;
  background: #dcdfe6;
}

.flex-spacer {
  flex: 1;
}

.export-btn {
  background: linear-gradient(to right, #1a2942, #2a476e);
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(26, 41, 66, 0.2);
}

/* 表格区域 */
.table-container {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  width: 100%;
}

:deep(.el-table) {
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

:deep(.el-table th) {
  background-color: #f2f6fc;
  color: #1a2942;
  font-weight: 600;
}

:deep(.el-table--border th:first-child) {
  border-left: none;
}

:deep(.el-table--border td:first-child) {
  border-left: none;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #f9fafc;
}

:deep(.el-table__fixed-right-patch) {
  background-color: #f2f6fc;
}

:deep(.el-table__row:hover td) {
  background-color: #ecf5ff !important;
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
</style>