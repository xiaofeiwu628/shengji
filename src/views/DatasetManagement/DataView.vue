<template>
  <!--数据概览界面-->
  <div class="dataview-container">
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
      
      <!-- 数据表信息卡片 -->
      <div class="data-metrics">
        <div class="metric-card">
          <div class="metric-value">{{ LineNum }}</div>
          <div class="metric-label">字段数量</div>
        </div>
      </div>
    </div>
    
    <div class="content-panel">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="table-title">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据表概览</span>
        </div>
        <div class="action-buttons">
          <el-button 
            type="primary" 
            class="action-btn" 
            @click="tableDataDetail(this.viewInfo.tableId, this.viewInfo.datasetId)">
            <el-icon><Document /></el-icon>数据详情
          </el-button>
          <el-button 
            type="primary" 
            class="action-btn" 
            @click="multiVisualization(this.viewInfo.tableId, this.viewInfo.datasetId)">
            <el-icon><PieChart /></el-icon>数据可视化
          </el-button>
        </div>
      </div>
      
      <!-- 数据展示区域 -->
      <div class="table-container">
        <el-table 
          :data="this.tableData" 
          border 
          stripe 
          class="data-table"
          :cell-style="{ 'text-align': 'center' }"
          :header-cell-style="{ 'text-align': 'center', background: '#1a2942', color: '#fff', fontWeight: '600' }">
          <el-table-column 
            prop="fieldName" 
            label="字段名" 
            sortable
            min-width="180">
            <template #header>
              <div class="column-header">
                <span>字段名 (数量:{{ LineNum }})</span>
              </div>
            </template>
            <template #default="scope">
              <div class="field-name">{{ scope.row.fieldName }}</div>
            </template>
          </el-table-column>
          
          <el-table-column prop="variableType" label="变量类型" min-width="120">
            <template #default="scope">
              <el-tag 
                :type="getTypeTagType(scope.row.variableType)" 
                effect="light"
                class="variable-type-tag">
                {{ scope.row.variableType }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="dataType" label="存储类型" min-width="120">
            <template #default="scope">
              <span class="data-type">{{ scope.row.dataType }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" min-width="300">
            <template #default="scope">
              <div class="operation-buttons">
                <el-button
                  link
                  type="primary"
                  class="op-btn analysis-btn"
                  v-if="scope.row.variableType === '时间型' || scope.row.variableType === '文本型' ? false : true"
                  @click="showAnalysis(scope.row)">
                  <el-icon><DataAnalysis /></el-icon>统计分析
                </el-button>
                
                <el-button 
                  link 
                  type="primary" 
                  class="op-btn detail-btn"
                  @click="showFieldDetail(scope.row)">
                  <el-icon><View /></el-icon>字段详情
                </el-button>
                
                <el-button
                  link
                  type="primary"
                  class="op-btn visualize-btn"
                  v-if="scope.row.variableType === '连续型' || scope.row.variableType === '分类型' ? true : false"
                  @click="Visualize(scope.row)">
                  <el-icon><PieChart /></el-icon>可视化
                </el-button>
                
                <el-button
                  link
                  type="primary"
                  class="op-btn outlier-btn"
                  v-if="scope.row.variableType === '连续型' ? true : false"
                  @click="showOutlier(scope.row)">
                  <el-icon><Warning /></el-icon>离群点
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 字段详情对话框 -->
      <el-dialog 
        v-model="DetailVisible" 
        title="字段详情" 
        width="40%" 
        class="custom-dialog field-detail-dialog"
        destroy-on-close>
        <div class="dialog-header">
          <div class="field-info">
            <div class="info-item">
              <span class="info-label">字段名：</span>
              <span class="info-value">{{ this.ColumnName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">数据类型：</span>
              <span class="info-value">{{ this.ColumnType }}</span>
            </div>
          </div>
        </div>
        
        <el-table 
          size='small' 
          :data="fieldData" 
          border 
          stripe 
          class="detail-table"
          :header-cell-style="{ background: '#1a2942', color: '#fff' }">
          <el-table-column prop="index" label="序号" width="80" />
          <el-table-column prop="value" label="字段值" />
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:currentPage="fieldCurrentPage"
            :small='true'
            layout="total, prev, pager, next"
            :total="fieldtotal"
            pager-count="5"
            @size-change="fieldSizeChange"
            @current-change="fieldCurrentChange"
          />
        </div>
      </el-dialog>

      <!-- 数据可视化对话框 -->
      <el-dialog 
        v-model="GraphVisible" 
        title="数据可视化" 
        width="65%" 
        class="custom-dialog visualization-dialog"
        destroy-on-close>
        <div class="visualization-container">
          <div class="visualization-header">
            <span class="field-name">{{ ColumnName }}</span>
            <div v-if="this.VariableType === '连续型' && this.chartData.GraphType === 'Histogram'" class="segment-control">
              <span class="segment-label">数据分段数：</span>
              <el-select v-model="DataDevNum" class="segment-select" @change="DrawChart">
                <el-option label="5" :value="5"></el-option>
                <el-option label="10" :value="10"></el-option>
                <el-option label="20" :value="20"></el-option>
              </el-select>
            </div>
          </div>
          
          <div class="chart-wrapper">
            <MyChart v-bind:message="chartData" v-loading="loading"></MyChart>
          </div>
          
          <div class="chart-type-selector">
            <el-radio-group v-model="GraphType" @change="DrawChart" size="large">
              <el-radio label="LineChart" v-if="this.VariableType === '连续型'">折线图</el-radio>
              <el-radio label="Histogram" v-if="this.VariableType === '连续型'">直方图</el-radio>
              <el-radio label="Histogram" v-if="this.VariableType === '分类型'">柱状图</el-radio>
              <el-radio label="PieChart" v-if="this.VariableType === '分类型'">饼形图</el-radio>
            </el-radio-group>
          </div>
        </div>
      </el-dialog>

      <!-- 离群点对话框 -->
      <el-dialog 
        v-model="OutlierVisible" 
        title="字段离群点" 
        width="85%" 
        class="custom-dialog outlier-dialog"
        destroy-on-close>
        <div class="outlier-container">
          <div class="outlier-left">
            <h3 class="outlier-title">Z-score算法计算离群点</h3>
            <div class="threshold-control">
              <span class="threshold-label">threshold(阈值):</span>
              <el-input v-model="threshold" placeholder="3" class="threshold-input"></el-input>
              <el-button type="primary" @click="getOutlier" class="threshold-btn">查询</el-button>
            </div>
            
            <el-table 
              size="small" 
              :data="outlierData" 
              border 
              stripe 
              class="outlier-table"
              :header-cell-style="{ background: '#1a2942', color: '#fff' }"
              max-height="360">
              <el-table-column prop="index" label="序号" width="80" />
              <el-table-column prop="id" label="记录id" />
              <el-table-column prop="value" width="120" label="离群点" />
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                small
                v-model:currentPage="outlierCurrentPage"
                layout="total, prev, pager, next"
                :total="outliertotal"
                :page-size="5"
                :pager-count="4"
                @current-change="getOutlier"
              />
            </div>
          </div>
          
          <el-divider direction="vertical" class="outlier-divider" />
          
          <div class="outlier-right">
            <DistributeMathBar v-bind:message="distributeData"></DistributeMathBar>
          </div>
        </div>
      </el-dialog>

      <!-- 统计分析对话框 -->
      <el-dialog 
        v-model="AnalysisVisible" 
        title="统计分析" 
        width="75%" 
        class="custom-dialog analysis-dialog"
        destroy-on-close>
        <div class="analysis-header">
          <span class="field-name">字段名：{{ this.ColumnName }}</span>
        </div>
        
        <el-table 
          :data="this.analysisData" 
          border 
          stripe 
          class="analysis-table"
          :header-cell-style="{ background: '#1a2942', color: '#fff', textAlign: 'center' }"
          :cell-style="{ textAlign: 'center' }">
          <el-table-column prop="unique_values" label="唯一值个数" />
          <el-table-column prop="null_value" label="缺失值个数" />
          <el-table-column prop="outliers_value" label="异常值个数" />
          <el-table-column prop="mean_values" label="平均值" />
          <el-table-column prop="variance_values" label="方差" />
          <el-table-column prop="max_values" label="最大值" />
          <el-table-column prop="min_values" label="最小值" />
          <el-table-column prop="median_value" label="中位数" />
        </el-table>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request";
import MyChart from "../../components/MyChart.vue";
import DistributeMathBar from "../../components/DistributeMathBar.vue";
import { useRouter } from "vue-router/dist/vue-router";
import { reactive } from "vue";
import router from "@/router";
import axios from "axios";
import { 
  ArrowRight, Files, Grid, Document, 
  DataAnalysis, PieChart, View, Warning 
} from "@element-plus/icons-vue";
import { ElLoading } from "element-plus"; // 正确的导入方式

const pyrequest = axios.create({
  baseURL: "/pyanalysis",
  timeout: 5000,
});

export default {
  name: "DataView",
  components: {
    MyChart,
    DistributeMathBar,
    ArrowRight,
    Files,
    Grid,
    Document,
    DataAnalysis,
    PieChart,
    View,
    Warning
  },
  setup() {
    const router = useRouter();
    const viewInfo = reactive({
      datasetId: 1,
      tableId: 1,
    });
    viewInfo.tableId = router.currentRoute.value.query.tableId;
    viewInfo.datasetId = router.currentRoute.value.query.datasetId;
    let tableDataDetail = (tableId, setId) => {
      //数据表数据展示
      router.push({
        path: "/dataView/detail",
        query: { tableId: tableId, setId: setId },
      });
    };
    return {
      viewInfo,
      tableDataDetail,
    };
  },
  created() {
    this.SetId = this.viewInfo.datasetId;
    this.TableId = this.viewInfo.tableId;
    this.load();
  },
  data() {
    return {
      loading: false,
      loading1: [],
      ArrowRight,
      tableData: [], //后端返回数据表概览数据
      ColumnName: "",
      ColumnType: "",
      GraphType: "LineChart",
      GraphData: {}, //后端返回单字段可视化数据
      VariableType: "", //可视化变量类型
      DataDevNum: 20, //连续型变量直方图柱子个数
      chartData: {
        //图表数据
        fName: "", //字段名
        GraphType: "", //图表类型
        ydata: [], //折线图与直方图y轴数据
        xdata: [], //直方图x轴数据
        piedata: [], //饼图数据
      },
      currentPage: 1, //数据概览当前页码
      pageSize: 5, //数据概览页面大小
      total: 100, //数据概览总大小
      outlierCurrentPage: 1, //字段离群点当前页码
      outliertotal: 100, //字段离群点总大小
      fieldCurrentPage: 1, //字段详情当前页码
      fieldtotal: 100, //字段详情页面大小
      LineNum: 100, //数据条数
      DetailVisible: false, //字段详情窗口
      GraphVisible: false, //连续型字段绘图
      OutlierVisible: false, //离群点窗口
      SetId: 1,
      TableId: 1,
      MutiVisualColumn: [],
      AnalysisVisible: false, //统计分析窗口
      analysisData: [], //统计分析数据
      fieldData: [], //字段详情数据
      outlierData: [], //字段离群点数据
      threshold: 3, //离群点阈值
      distributeData: {
        multiple: 3,
        col_data: [],
      }, //离群点正态分布图像数据
    };
  },
  methods: {
    // 获取变量类型的标签类型
    getTypeTagType(type) {
      switch(type) {
        case '连续型': return 'success';
        case '分类型': return 'warning';
        case '时间型': return 'info';
        case '文本型': return '';
        case '唯一键': return 'danger';
        default: return '';
      }
    },
    
    //加载动画控制
    openFullScreen1() {
      this.loading1 = ElLoading.service({
        lock: true,
        text: "正在绘制中，请稍等……",
        background: "rgba(255,255,255,0.7)",
      });
      console.log("加载完成");
    },
    
    // 加载数据
    load() {
      console.log(this.viewInfo.tableId);
      request
        .get("/datadetail", {
          //传给后端，请求数据
          params: {
            table_id: this.viewInfo.tableId,
          },
        })
        .then((res) => {
          if (res.code === "0") {
            console.log(res.data, "res.data in load");
            this.tableData = res.data;
            this.LineNum = res.data.length;
            this.total = res.data.length;
            this.$message({
              type: "success",
              message: "加载成功",
              offset: 60,
            });
          } else {
            this.$message({
              type: "error",
              message: res.msg,
              offset: 60,
            });
          }
        });
    },
    
    // 多字段可视化
    multiVisualization() {
      let MutiVisualColumn = [];
      let TimeColumn = [];
      for (var i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].variableType === "连续型") {
          MutiVisualColumn.push(this.tableData[i].fieldName);
        }
        if (this.tableData[i].variableType === "时间型") {
          TimeColumn.push(this.tableData[i].fieldName);
        }
      }
      let Columns = JSON.stringify(MutiVisualColumn); //所有连续型字段名
      let TimeColumns = JSON.stringify(TimeColumn); //所有时间型字段名

      router.push({
        path: "/MultiVisualization",
        query: {
          setId: this.SetId,
          tableId: this.TableId,
          choseColumns: Columns,
          timeColumns: TimeColumns,
        },
      });
    },
    
    // 单字段可视化
    Visualize(row) {
      this.ColumnName = row.fieldName;
      this.VariableType = row.variableType;
      if (row.variableType === "连续型") {
        this.GraphType = "LineChart";
      } else if (row.variableType === "分类型") {
        this.GraphType = "Histogram";
      }
      this.GraphVisible = true;
      this.DrawChart();
    },
    
    // 绘制图表
    DrawChart() {
      this.loading = true;
      request
        .get("/DataVisualization/DataGraph", {
          //传给后端，请求绘图数据
          params: {
            SetId: this.viewInfo.datasetId,
            TableId: this.viewInfo.tableId,
            ColumnName: this.ColumnName,
            GraphType: this.GraphType,
            DataDevNum: this.DataDevNum,
          },
        })
        .then((res) => {
          if (res.code === "0") {
            this.loading = false;
            this.$message({
              type: "success",
              message: "加载成功",
              offset: 60,
            });
            this.GraphData = res.data;
            this.chartData.ydata = [];
            this.chartData.xdata = [];
            this.chartData.piedata = [];
            console.log("GraphData:", this.GraphData);
            if (this.GraphType === "LineChart") {
              this.chartData.ydata = this.GraphData.yData;
            } else if (this.GraphType === "Histogram") {
              for (var i = 0; i < this.GraphData.xData.length; i++) {
                if (this.GraphData.xData[i] === "") this.GraphData.xData[i] = "空缺值";
              }
              this.chartData.ydata = this.GraphData.yData;
              this.chartData.xdata = this.GraphData.xData;
            } else if (this.GraphType == "PieChart") {
              for (var i = 0; i < this.GraphData.length; i++) {
                if (this.GraphData[i].name == "") this.GraphData[i].name = "空缺值";
              }
              this.chartData.piedata = this.GraphData;
            }
          } else {
            this.loading = false;
            this.$message({
              type: "error",
              message: res.msg,
              offset: 60,
            });
          }
        });
      this.chartData.fName = this.ColumnName;
      this.chartData.GraphType = this.GraphType;
    },
    
    // 显示统计分析窗口
    showAnalysis(row) {
      this.ColumnName = row.fieldName;
      this.AnalysisVisible = true;
      this.analysisData = [];
      console.log(this.viewInfo.tableId, this.ColumnName);
      pyrequest
        .post("/get_analysis_data", {
          //传给后端，请求数据
          table_id: this.viewInfo.tableId,
          column: this.ColumnName,
        })
        .then((res) => {
          if (res.data.code === "0") {
            res.data.data.data["outliers_value"] -= 1;
            this.analysisData.push(res.data.data.data);
            console.log(res);
          } else {
            this.$message({
              type: "error",
              message: res.msg,
              offset: 60,
            });
          }
        });
    },
    
    // 显示字段详情窗口
    showFieldDetail(row) {
      this.ColumnName = row.fieldName;
      this.ColumnType = row.dataType;
      this.loadFieldDetail();
      this.DetailVisible = true;
    },
    
    // 显示离群点窗口
    showOutlier(row) {
      this.OutlierVisible = true;
      this.ColumnName = row.fieldName;
      this.outlierData = [];
      this.distributeData.col_data = [];
      this.threshold = 3;
      this.outlierCurrentPage = 1;
      pyrequest
        .post("/get_outliers_data", {
          //传给后端，请求数据
          table_id: this.viewInfo.tableId,
          column: this.ColumnName,
        })
        .then((res) => {
          console.log(res);
          if (res.data.code === "0") {
            this.distributeData.avg = res.data.data.avg;
            this.distributeData.distributeBardata = res.data.data.distributeBardata;
            this.distributeData.linedata = res.data.data.linedata;
            this.distributeData.stdev = res.data.data.stdev;
            this.distributeData.xAxis = res.data.data.xAxis;
          } else {
            this.$message({
              type: "error",
              message: res.data.msg,
              offset: 60,
            });
          }
        });

      this.getOutlier();
    },
    
    // 获取离群点数据
    getOutlier() {
      if (this.threshold <= 0) {
        this.$message({
          type: "error",
          message: "threshold必须大于0",
          offset: 60,
        });
      } else {
        this.threshold = Math.round(this.threshold);
        this.distributeData.multiple = this.threshold;
        pyrequest
          .post("/get_zscore_outliers", {
            //传给后端，请求数据
            table_id: this.viewInfo.tableId,
            column: this.ColumnName,
            threshold: this.threshold,
            page: this.outlierCurrentPage,
          })
          .then((res) => {
            if (res.data.code === "0") {
              this.outlierData = res.data.data;
              this.outliertotal = res.data.data_len;
              for (var i = 0; i < 5; i++) {
                this.outlierData[i].index = (this.outlierCurrentPage - 1) * 5 + i + 1;
              }
            } else {
              this.$message({
                type: "error",
                message: res.data.msg,
                offset: 60,
              });
            }
          });
      }
    },
    
    // 加载字段详情数据
    loadFieldDetail() {
      request
        .get(
          "/dataViewDetail/colDataDetail/" +
            this.viewInfo.tableId +
            "/" +
            this.ColumnName +
            "/" +
            this.fieldCurrentPage,
        )
        .then((res) => {
          if (res.code === "0") {
            this.fieldData = res.data.fieldData; //当前页面数据
            this.fieldtotal = res.data.total; //所有数据总行数
            this.$message({
              type: "success",
              message: "加载成功",
              offset: 60,
            });
          } else {
            this.$message({
              type: "error",
              message: res.msg,
              offset: 60,
            });
          }
        });
    },
    fieldSizeChange() {
      //更改页面大小
      this.loadFieldDetail();
    },
    fieldCurrentChange() {
      //更改当前页面
      this.loadFieldDetail();
    },
  },
};
</script>


<style scoped>
.dataview-container {
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
  padding: 12px 0;
}

:deep(.el-table__row) {
  transition: all 0.2s;
}

:deep(.el-table__row:hover) {
  background-color: #f5f9fc !important;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.field-name {
  font-weight: 500;
  color: #1a2942;
}

.variable-type-tag {
  padding: 4px 12px;
  min-width: 80px;
  font-weight: 500;
  text-align: center;
}

.data-type {
  color: #606266;
  font-weight: 400;
}

/* 操作按钮 */
.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.op-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.op-btn:hover {
  background-color: rgba(76, 117, 163, 0.1);
  transform: translateY(-1px);
}

.op-btn .el-icon {
  font-size: 16px;
}

.analysis-btn .el-icon {
  color: #67c23a;
}

.detail-btn .el-icon {
  color: #409eff;
}

.visualize-btn .el-icon {
  color: #e6a23c;
}

.outlier-btn .el-icon {
  color: #f56c6c;
}

/* 对话框样式 */
:deep(.custom-dialog .el-dialog__header) {
  background: linear-gradient(to right, #1a2942, #4c75a3);
  padding: 15px 20px;
  margin-right: 0;
  border-bottom: 1px solid #eaeaea;
}

:deep(.custom-dialog .el-dialog__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

:deep(.custom-dialog .el-dialog__headerbtn) {
  top: 15px;
}

:deep(.custom-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.custom-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
  color: white;
}

:deep(.custom-dialog .el-dialog__body) {
  padding: 20px;
}

/* 字段详情对话框 */
.dialog-header {
  margin-bottom: 15px;
}

.field-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  color: #909399;
  font-weight: 500;
}

.info-value {
  color: #1a2942;
  font-weight: 600;
}

.detail-table {
  margin-bottom: 15px;
}

/* 数据可视化对话框 */
.visualization-container {
  padding: 10px;
}

.visualization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.visualization-header .field-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a2942;
}

.segment-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.segment-label {
  color: #606266;
}

.segment-select {
  width: 100px;
}

.chart-wrapper {
  min-height: 400px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
}

.chart-type-selector {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 离群点对话框 */
.outlier-container {
  display: flex;
  gap: 20px;
}

.outlier-left {
  width: 40%;
  display: flex;
  flex-direction: column;
}

.outlier-title {
  font-size: 16px;
  margin-bottom: 15px;
  color: #1a2942;
  font-weight: 600;
}

.threshold-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.threshold-label {
  color: #606266;
  white-space: nowrap;
}

.threshold-input {
  width: 120px;
}

.threshold-btn {
  background: linear-gradient(to right, #1a2942, #2a476e);
  border: none;
}

.outlier-table {
  margin-bottom: 15px;
}

.outlier-divider {
  height: auto;
  margin: 0 10px;
}

.outlier-right {
  width: 58%;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 10px;
}

/* 统计分析对话框 */
.analysis-header {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.analysis-header .field-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a2942;
}

.analysis-table {
  width: 100%;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

/* Element Plus组件覆盖样式 */
:deep(.el-pagination) {
  justify-content: flex-end;
}

:deep(.el-radio-group .el-radio) {
  margin-right: 20px;
}

:deep(.el-radio__label) {
  font-weight: 500;
}

:deep(.el-select__tags) {
  background-color: transparent;
}
/* 对话框关闭按钮优化 - 改进版 */
:deep(.custom-dialog .el-dialog__header) {
  position: relative;
  background: linear-gradient(to right, #1a2942, #4c75a3);
  padding: 16px 20px;
  margin-right: 0;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: center;
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

:deep(.custom-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
  color: white;
}
</style>