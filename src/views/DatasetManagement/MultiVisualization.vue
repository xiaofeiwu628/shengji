<template>
  <div>
    <div style="margin: 20px 0 0 2%">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/datascreen' }"
        >数据集管理
        </el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/dataView' }" @click="toDataView"
        >数据表概览
        </el-breadcrumb-item>
        <el-breadcrumb-item>数据可视化</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div
        style="
        background-color: white;
        margin: 20px;
        min-height: calc(100vh - 124px);
      "
    >
      <!--标签栏-->
      <el-tabs
          v-model="activeName"
          type="border-card"
          style="min-height: calc(100vh - 124px)"
          @tab-change="onTabChange"
      >
        <el-tab-pane label="相关性分析" name="scatter" :lazy="true">
          <!--散点图-->
          <div style="display: flex;justify-content: center; margin-top: 10px;margin-bottom: 10px">
            <el-text
                style="white-space: nowrap; margin-right: 1%"
            >X轴字段:
            </el-text>
            <el-select
                placeholder="请选择"
                v-model="scatterX"
                @change="loadScatter"
            >
              <el-option
                  v-for="item in scatterChartAxisOptions"
                  :key="item"
                  :label="item"
                  :value="item"
              >
              </el-option>
            </el-select>
            <el-text
                style="white-space: nowrap; margin-right: 1%; margin-left: 4%"
            >Y轴字段:
            </el-text>
            <el-select
                placeholder="请选择"
                v-model="scatterY"
                @change="loadScatter"
            >
              <el-option
                  v-for="item in scatterYSeries"
                  :key="item"
                  :label="item"
                  :value="item"
              >
              </el-option>
            </el-select>
          </div>
          <div
              ref="scatterChart"
              :style="{ width: '100%', height: '60vh' }"
          ></div>
        </el-tab-pane>
        <el-tab-pane label="时序性分析" name="line" :lazy="true">
          <!--折线图-->
            <div>
              <div style="display: flex;justify-content: center; margin-top: 10px; margin-bottom: 10px">
                <el-text
                    style="white-space: nowrap; margin-right: 1%"
                >X轴字段:
                </el-text>
                <el-select
                    placeholder="请选择"
                    v-model="lineX"
                    @change="loadLine"
                >
                  <el-option
                      v-for="item in timeColumns"
                      :key="item"
                      :label="item"
                      :value="item"
                  >
                  </el-option>
                </el-select>
                <el-text
                    style="white-space: nowrap; margin-right: 1%; margin-left: 4%"
                >Y轴字段:
                </el-text>
                <el-select
                    v-model="lineY"
                    multiple
                    placeholder="请选择"
                    @change="loadLine"
                >
                  <el-option
                      v-for="item in scatterChartAxisOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                  >
                  </el-option>
                </el-select>
              </div>
              <div
                  ref="lineChart"
                  :style="{ width: '100%', height: '60vh' }"
              ></div>
            </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import request from "@/utils/request";
import { ArrowRight } from "@element-plus/icons-vue";
import router from "@/router";

export default {
  name: "MultiVisualization",
  data() {
    return {
      setId: null,
      tableId: null,
      scatterChartAxisOptions: null,
      timeColumns: null,
      activeName: "scatter", //标签栏模式
      scatterX: "", //散点图X轴字段
      scatterY: "", //散点图Y轴字段
      scatterYSeries: [], //散点图Y轴选项
      scatterData: [], //散点图数据
      lineX: "", //折线图X
      lineY: [], //折线图Y
      lineLegend: [], //折线图示例
      lineSeries: [], //折线图数据
      XSeries: [], //折线图X轴数据
      ArrowRight,
      scatterChart: null,
      lineChart: null,
      isLoadedScatter: false,
      isLoadedLine: false
    };
  },
  created() {
    this.setId = this.$route.query.setId;
    this.tableId = this.$route.query.tableId;
    this.scatterChartAxisOptions = JSON.parse(this.$route.query.choseColumns);
    this.timeColumns = JSON.parse(this.$route.query.timeColumns);
    this.scatterX = this.scatterChartAxisOptions[0];
    this.scatterY = this.scatterChartAxisOptions[1];
    this.lineX = this.timeColumns[0];
    this.lineY.push(this.scatterChartAxisOptions[1]);
  },
  mounted() {
    window.addEventListener("resize", this.resizeCharts);
    this.loadScatter();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resizeCharts);
  },
  methods: {
    toDataView() {
      router.push({
        path: "/dataView",
        query: { datasetId: this.setId, tableId: this.tableId },
      });
    },
    loadScatter() {
      this.isLoadedScatter = true;
      //更新散点图
      this.scatterYSeries = [];
      for (let i = 0; i < this.scatterChartAxisOptions.length; i++) {
        if (this.scatterChartAxisOptions[i] !== this.scatterX) {
          this.scatterYSeries.push(this.scatterChartAxisOptions[i]);
        }
      }
      if (this.scatterY === this.scatterX) {
        //不允许x轴y轴同名
        this.$message({
          type: "error",
          message: "X轴与Y轴不可以相同",
          offset: 60,
        });
        return;
      }
      request
          .get("/DataVisualization/ScatterChart", {
            params: {
              SetId: this.setId,
              TableId: this.tableId,
              xColumnName: this.scatterX,
              yColumnName: this.scatterY,
            },
          })
          .then((res) => {
            if (res.code === "0") {
              this.scatterData = res.data;
              this.initScatter();
              this.$message({
                type: "success",
                message: "更新成功",
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
    initScatter() {
      let option = {
        animation: false,
        tooltip: {
          /*返回需要的信息*/
          formatter: function (param) {
            let value = param.value;
            return (
                '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 16px;margin-bottom: 3px;"> ' +
                "X轴：" +
                value[0] +
                " Y轴：" +
                value[1] +
                "</div>"
            );
          },
        },
        grid: {
          bottom: "18%",
          top: "8%",
        },
        xAxis: {
          type: "value",
          name: this.scatterX,
          min: "dataMin",
          max: "dataMax",
        },
        yAxis: {
          type: "value",
          name: this.scatterY,
          min: "dataMin",
          max: "dataMax",
        },
        dataZoom: [
          {
            //进度条
            type: "slider",
            show: true,
            // realtime: false,
            xAxisIndex: [0],
            left: "9%",
            start: 30,
            end: 70, //初始化滚动条
          },
          {
            type: "inside", // 支持内部鼠标滚动平移
            xAxisIndex: [0],
            start: 30,
            end: 70,
            zoomOnMouseWheel: true, // 关闭滚轮缩放
            moveOnMouseWheel: false, // 开启滚轮平移
            moveOnMouseMove: true, // 鼠标移动能触发数据窗口平移
          },
        ],
        series: [{
          name: "散点图",
          symbolSize: 7, //节点大小
          data: this.scatterData,
          type: "scatter",
          large: true,
        }],
      };
      if(this.scatterChart !== null){
        this.scatterChart.dispose();
        this.scatterChart = null;
      }
      let scatterChartDom = this.$refs.scatterChart;
      let scatterChart = echarts.init(scatterChartDom, null, { renderer: "svg" });
      option && scatterChart.setOption(option);
      this.scatterChart = scatterChart;
    },
    loadLine() {
      this.isLoadedLine = true;
      let lineColumns = "";
      for (let i = 0; i < this.lineY.length; i++) {
        lineColumns = lineColumns.concat(this.lineY[i], ",");
      }
      //去掉最后一个逗号
      lineColumns = lineColumns.slice(0, -1);
      request
          .get("/DataVisualization/MultiDataGraph", {
            params: {
              SetId: this.setId,
              TableId: this.tableId,
              GraphType: "LineChart",
              ColumnsName: lineColumns,
              xColumnName: this.lineX,
            },
          })
          .then((res) => {
            if (res.code === "0") {
              console.log(res);
              this.lineLegend = [];
              for (let i = 0; i < res.data.yData.length; i++) {
                this.lineLegend.push(res.data.yData[i].name);
              }
              console.log("lineLegend:", this.lineLegend);
              this.lineSeries = [];
              this.XSeries = res.data.xData;
              for (let i = 0; i < res.data.yData.length; i++) {
                this.lineSeries.push({
                  name: res.data.yData[i].name,
                  type: "line",
                  // stack: 'Total',
                  data: res.data.yData[i].data,
                });
                console.log("lineSeries:", this.lineSeries);
                this.initLine();
              }
              this.$message({
                type: "success",
                message: "更新成功",
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

    initLine() {
      let option = {
        title: {},
        tooltip: {
          trigger: "axis",
        },
        legend: { data: this.lineLegend },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        grid: {
          bottom: "18%",
          top: "8%",
        },
        xAxis: {
          //数值型、递增的
          type: "category",
          name: this.lineX,
          boundaryGap: false,
          data: this.XSeries,
        },
        yAxis: {
          type: "value",
          name: this.lineY,
          min: "dataMin",
          max: "dataMax",
        },
        dataZoom: [
          {
            //进度条
            type: "slider",
            show: true,
            xAxisIndex: [0],
            left: "9%",
            start: 30,
            end: 70, //初始化滚动条
          },
          {
            type: "inside", // 支持内部鼠标滚动平移
            start: 30,
            end: 70,
            zoomOnMouseWheel: true, // 滚轮缩放
            moveOnMouseWheel: false, // 滚轮平移
            moveOnMouseMove: true, // 鼠标移动能触发数据窗口平移
          },
        ],
        series: this.lineSeries,
      };
      if (this.lineChart != null) {
        this.lineChart.dispose();
        this.lineChart = null;
      }
      let lineChart = echarts.init(this.$refs.lineChart, null, {renderer: "svg" })
      option && lineChart.setOption(option);
      this.lineChart = lineChart;
    },
    onTabChange(value) {
      this.resizeCharts()
      if (!this.isLoadedScatter && value === "scatter") {
        this.loadScatter()
      }else if(!this.isLoadedLine && value === "line"){
        this.loadLine()
      }
    },
    resizeCharts() {
      this.$nextTick(() => {
        if (this.scatterChart) {
          this.scatterChart.resize();
        }
        if (this.lineChart) {
          this.lineChart.resize();
        }
      });
    },
  },
};
</script>

<style scoped></style>
