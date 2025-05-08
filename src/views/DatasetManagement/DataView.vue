<template>
  <!--数据概览界面-->
  <div>
    <div style="margin: 20px 0 0 2%">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/datascreen' }">数据集管理</el-breadcrumb-item>
        <el-breadcrumb-item>数据表概览</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-card style="margin: 20px">
      <div style="margin-top: 5px">
        <div class="task-title-div"></div>
        <span class="task-title-name">数据表概览</span>
        <div style="float: right; margin-right: 30px">
          <el-button type="primary" @click="tableDataDetail(this.viewInfo.tableId, this.viewInfo.datasetId)">
            数据详情
          </el-button>
          <el-button type="primary" @click="multiVisualization(this.viewInfo.tableId, this.viewInfo.datasetId)"
            >数据可视化
          </el-button>
        </div>
      </div>
      <!--数据展示区域-->
      <div style="width: 98%; margin: auto">
        <el-table :data="this.tableData" border stripe style="margin-top: 25px">
          <el-table-column prop="fieldName" label="字段名" sortable>
            <template #header> 字段名 (数量:{{ LineNum }})</template>
          </el-table-column>
          <el-table-column prop="variableType" label="变量类型" />
          <el-table-column prop="dataType" label="存储类型" />
          <el-table-column label="操作">
            <template #default="scope">
              <div>
                <el-button
                  link
                  type="primary"
                  size="small"
                  v-if="scope.row.variableType === '时间型' || scope.row.variableType === '文本型' ? false : true"
                  @click="showAnalysis(scope.row)"
                  >统计分析
                </el-button>
                <el-button link type="primary" size="small" @click="showFieldDetail(scope.row)">字段详情</el-button>
                <el-button
                  link
                  type="primary"
                  size="small"
                  v-if="scope.row.variableType === '连续型' || scope.row.variableType === '分类型' ? true : false"
                  @click="Visualize(scope.row)"
                  >可视化
                </el-button>
                <el-button
                  link
                  type="primary"
                  size="small"
                  v-if="scope.row.variableType === '连续型' ? true : false"
                  @click="showOutlier(scope.row)"
                  >离群点
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!--分页-->
      <!--      <div class="demo-pagination-block" style="margin: 20px 0 0 100px">-->
      <!--        <el-pagination-->
      <!--            v-model:currentPage="currentPage"-->
      <!--            v-model:page-size="pageSize"-->
      <!--            :page-sizes="[5, 10, 20]"-->
      <!--            :small="small"-->
      <!--            :disabled="disabled"-->
      <!--            :background="background"-->
      <!--            layout="total, sizes, prev, pager, next, jumper"-->
      <!--            :total="total"-->
      <!--            @size-change="handleSizeChange"-->
      <!--            @current-change="handleCurrentChange"-->
      <!--        />-->
      <!--      </div>-->
      <!--字段详情-->
      <el-dialog v-model="DetailVisible" title="字段详情" width="35%" style='min-width: 390px;'>
        <p style="font-size: 16px; float: left; margin-right: 10px; margin-bottom: 15px">
          字段名：{{ this.ColumnName }}
        </p>
        <p style="font-size: 16px; float: left; margin-right: 10px; margin-bottom: 15px">
          数据类型：{{ this.ColumnType }}
        </p>
        <el-table size='small' :data="fieldData" border stripe style="width: 100%">
          <el-table-column prop="index" label="序号" />
          <el-table-column prop="value" label="字段值" />
        </el-table>
        <!--分页-->
        <div style="margin: 10px;width: 100%;display: flex;justify-content: center">
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
      <!--数据可视化-->
      <el-dialog v-model="GraphVisible" title="数据可视化" width="60%" style="overflow: auto">
        <div style="width: 100%; height: 60vh;">
          <el-row :span="24" style="position: absolute; right: 10%; width: 175px">
            <el-col :span="15">
              <p
                style="font-size: 16px; margin-right: 10px; margin-top: 5px"
                v-if="this.VariableType === '连续型' && this.chartData.GraphType === 'Histogram' ? true : false"
              >
                数据分段数：
              </p>
            </el-col>
            <el-col :span="9">
              <el-select
                v-model="DataDevNum"
                v-if="this.VariableType === '连续型' && this.chartData.GraphType === 'Histogram' ? true : false"
                @change="DrawChart"
              >
                <el-option label="5" :value="5"></el-option>
                <el-option label="10" :value="10"></el-option>
                <el-option label="20" :value="20"></el-option>
              </el-select>
            </el-col>
          </el-row>

          <MyChart v-bind:message="chartData" v-loading="loading"></MyChart>
          <el-radio-group v-model="GraphType" @change="DrawChart" class="ml-4" style="margin-left: 40%">
            <el-radio label="LineChart" size="large" v-if="this.VariableType === '连续型' ? true : false"
              >折线图
            </el-radio>
            <el-radio label="Histogram" size="large" v-if="this.VariableType === '连续型' ? true : false"
              >直方图
            </el-radio>
            <el-radio label="Histogram" size="large" v-if="this.VariableType === '分类型' ? true : false"
              >柱状图
            </el-radio>
            <el-radio label="PieChart" size="large" v-if="this.VariableType === '分类型' ? true : false"
              >饼形图
            </el-radio>
          </el-radio-group>
        </div>
      </el-dialog>
      <!--离群点-->
      <el-dialog v-model="OutlierVisible" title="字段离群点" width="85%" style="">
        <div style="display: flex; text-align: center">
          <div style="width: 35%; overflow: auto">
            <el-text style="font-weight: bold; font-size: 20px">Z-score算法计算离群点</el-text>
            <div style="display: flex; margin-top: 5%">
              <el-text style="font-weight: bold; font-size: 15px; white-space: nowrap; margin-right: 2%"
                >threshold(阈值):
              </el-text>
              <el-input v-model="threshold" placeholder="3"></el-input>
              <el-button type="primary" @click="getOutlier" style="margin-left: 10px">查询</el-button>
            </div>
            <el-table size="small" :data="outlierData" border stripe style="margin-top: 20px" max-height="360">
              <el-table-column prop="index" label="序号" />
              <el-table-column prop="id" label="记录id" />
              <el-table-column prop="value" width="120px" label="离群点" />
            </el-table>
            <!--分页-->
            <div style="display: flex; justify-content: center; margin-top: 10px">
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
          <el-divider direction="vertical" style="height: 55vh" />
          <div style="width: 65%">
            <DistributeMathBar v-bind:message="distributeData"></DistributeMathBar>
          </div>
        </div>
      </el-dialog>

      <!--统计分析-->
      <el-dialog v-model="AnalysisVisible" title="统计分析" width="53%">
        <text class="my-title" style="float: left; font-size: 16px; margin-right: 10px; margin-bottom: 15px"
          >字段名：{{ this.ColumnName }}
        </text>
        <el-table :data="this.analysisData" border stripe style="width: 100%">
          <el-table-column width="100%" prop="unique_values" label="唯一值个数" />
          <el-table-column width="100%" prop="null_value" label="缺失值个数" />
          <el-table-column width="100%" prop="outliers_value" label="异常值个数" />
          <el-table-column width="115%" prop="mean_values" label="平均值" />
          <el-table-column width="115%" prop="variance_values" label="方差" />
          <el-table-column width="115%" prop="max_values" label="最大值" />
          <el-table-column width="115%" prop="min_values" label="最小值" />
          <el-table-column width="115%" prop="median_value" label="中位数" />
        </el-table>
      </el-dialog>
    </el-card>
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
import { ArrowRight } from "@element-plus/icons-vue";
import { ElLoading } from "element-plus";

const pyrequest = axios.create({
  baseURL: "/pyanalysis",
  timeout: 5000,
});
export default {
  name: "DataView",
  components: {
    MyChart,
    DistributeMathBar,
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
      fieldData: [
        //字段详情数据
      ],
      outlierData: [
        //字段离群点数据
      ],
      threshold: 3, //离群点阈值
      distributeData: {
        multiple: 3,
        col_data: [],
      }, //离群点正态分布图像数据
    };
  },
  methods: {
    //加载动画控制
    openFullScreen1() {
      this.loading1 = ElLoading.service({
        lock: true,
        text: "正在绘制中，请稍等……",
        background: "rgba(255,255,255,0.7)",
      });
      console.log("加载完成");
    },
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
            this.tableData = res.data;//scope.row数据来自于这里
            this.LineNum = res.data.length;
            this.total = res.data.length;
            // this.ChoseColumn()
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
    DrawChart() {
      // this.openFullScreen1()
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
            // this.loading1.close();
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
            // this.loading1.close();
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
    showAnalysis(row) {
      //显示统计分析窗口
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
    showFieldDetail(row) {
      //显示字段详情窗口
      this.ColumnName = row.fieldName;
      this.ColumnType = row.dataType;
      this.loadFieldDetail();
      this.DetailVisible = true;
    },
    showOutlier(row) {
      //显示离群点窗口
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
    getOutlier() {//获取离群点数据
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
    loadFieldDetail() {
      //字段详情换页
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

<style></style>
