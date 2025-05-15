<template>
  <div class="visualization-container">
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
          <el-icon><PieChart /></el-icon>
          数据可视化
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 主内容区域 -->
    <div class="content-panel">
      <!-- 标签栏 -->
      <el-tabs 
        v-model="activeName" 
        type="card" 
        class="visualization-tabs"
        @tab-change="onTabChange"
      >
        <el-tab-pane label="相关性分析" name="scatter" :lazy="true">
          <div class="chart-container">
            <!-- 控制面板 -->
            <div class="control-panel">
              <div class="axis-control">
                <div class="control-group">
                  <div class="control-label">X轴字段:</div>
                  <el-select
                    placeholder="请选择X轴字段"
                    v-model="scatterX"
                    @change="loadScatter"
                    class="axis-select"
                    size="large"
                  >
                    <el-option
                      v-for="item in scatterChartAxisOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
                
                <div class="control-group">
                  <div class="control-label">Y轴字段:</div>
                  <el-select
                    placeholder="请选择Y轴字段"
                    v-model="scatterY"
                    @change="loadScatter"
                    class="axis-select"
                    size="large"
                  >
                    <el-option
                      v-for="item in scatterYSeries"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
              </div>
              
              <div class="chart-info" v-if="scatterData.length > 0">
                <div class="info-item">
                  <el-icon><DataAnalysis /></el-icon>
                  <span>数据点数量: <strong>{{ scatterData.length }}</strong></span>
                </div>
              </div>
            </div>
            
            <!-- 图表区域 -->
            <div 
              ref="scatterChart" 
              class="chart-area"
              v-loading="loadingScatter"
              element-loading-text="加载中..."
              element-loading-background="rgba(255, 255, 255, 0.7)"
            ></div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="时序性分析" name="line" :lazy="true">
          <div class="chart-container">
            <!-- 控制面板 -->
            <div class="control-panel">
              <div class="axis-control">
                <div class="control-group">
                  <div class="control-label">X轴字段:</div>
                  <el-select
                    placeholder="请选择X轴字段"
                    v-model="lineX"
                    @change="loadLine"
                    class="axis-select"
                    size="large"
                  >
                    <el-option
                      v-for="item in timeColumns"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
                
                <div class="control-group wide-group">
                  <div class="control-label">Y轴字段:</div>
                  <el-select
                    v-model="lineY"
                    multiple
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="请选择Y轴字段(可多选)"
                    @change="loadLine"
                    class="axis-select"
                    size="large"
                  >
                    <el-option
                      v-for="item in scatterChartAxisOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
              </div>
              
              <div class="chart-info" v-if="lineSeries.length > 0">
                <div class="info-item">
                  <el-icon><Calendar /></el-icon>
                  <span>时间序列数: <strong>{{ XSeries.length }}</strong></span>
                </div>
                <div class="info-item">
                  <el-icon><DataLine /></el-icon>
                  <span>指标数量: <strong>{{ lineSeries.length }}</strong></span>
                </div>
              </div>
            </div>
            
            <!-- 图表区域 -->
            <div 
              ref="lineChart" 
              class="chart-area"
              v-loading="loadingLine"
              element-loading-text="加载中..."
              element-loading-background="rgba(255, 255, 255, 0.7)"
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
import { ArrowRight, Files, Grid, PieChart, DataAnalysis, DataLine, Calendar } from "@element-plus/icons-vue";
import router from "@/router";
import { ElMessage } from "element-plus";

export default {
  name: "MultiVisualization",
  data() {
    return {
      setId: null,
      tableId: null,
      scatterChartAxisOptions: null,
      timeColumns: null,
      activeName: "scatter", // 标签栏模式
      scatterX: "", // 散点图X轴字段
      scatterY: "", // 散点图Y轴字段
      scatterYSeries: [], // 散点图Y轴选项
      scatterData: [], // 散点图数据
      lineX: "", // 折线图X
      lineY: [], // 折线图Y
      lineLegend: [], // 折线图图例
      lineSeries: [], // 折线图数据
      XSeries: [], // 折线图X轴数据
      ArrowRight,
      Files,
      Grid,
      PieChart,
      DataAnalysis,
      DataLine,
      Calendar,
      scatterChart: null,
      lineChart: null,
      isLoadedScatter: false,
      isLoadedLine: false,
      loadingScatter: false,
      loadingLine: false,
      lastChartResize: null,
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
    window.addEventListener("resize", this.handleResize);
    this.loadScatter();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    toDataView() {
      router.push({
        path: "/dataView",
        query: { datasetId: this.setId, tableId: this.tableId },
      });
    },
    
    loadScatter() {
      if (this.scatterX === this.scatterY) {
        ElMessage({
          type: "error",
          message: "X轴与Y轴不可以选择相同字段",
          offset: 60,
        });
        return;
      }

      this.isLoadedScatter = true;
      this.loadingScatter = true;
      
      // 更新散点图Y轴选项
      this.scatterYSeries = this.scatterChartAxisOptions.filter(
        item => item !== this.scatterX
      );

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
            ElMessage({
              type: "success",
              message: "相关性数据加载成功",
              offset: 60,
            });
          } else {
            ElMessage({
              type: "error",
              message: res.msg || "加载失败",
              offset: 60,
            });
          }
        })
        .catch(() => {
          ElMessage({
            type: "error",
            message: "网络错误，请稍后重试",
            offset: 60,
          });
        })
        .finally(() => {
          this.loadingScatter = false;
        });
    },
    
    initScatter() {
      const option = {
        animation: false,
        tooltip: {
          trigger: 'item',
          formatter: function (param) {
            const value = param.value;
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 5px;">${param.seriesName}</div>
                <div>${param.dimensionNames[0]}: ${value[0]}</div>
                <div>${param.dimensionNames[1]}: ${value[1]}</div>
              </div>
            `;
          },
          backgroundColor: 'rgba(50, 50, 50, 0.8)',
          borderColor: '#555',
          borderWidth: 1,
          textStyle: {
            color: '#fff'
          }
        },
        grid: {
          left: '8%',
          right: '8%',
          bottom: '15%',
          top: '12%',
          containLabel: true
        },
        xAxis: {
          type: "value",
          name: this.scatterX,
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: {
            fontWeight: 'bold'
          },
          min: "dataMin",
          max: "dataMax",
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#eee'
            }
          }
        },
        yAxis: {
          type: "value",
          name: this.scatterY,
          nameLocation: 'middle',
          nameGap: 40,
          nameTextStyle: {
            fontWeight: 'bold'
          },
          min: "dataMin",
          max: "dataMax",
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#eee'
            }
          }
        },
        dataZoom: [
          {
            type: "slider",
            show: true,
            xAxisIndex: [0],
            left: '9%',
            right: '9%',
            bottom: '2%',
            start: 0,
            end: 100,
            handleSize: '110%',
            handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
            handleStyle: {
              color: '#1a2942',
              shadowBlur: 3,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            },
            textStyle: {
              color: '#333'
            },
            borderColor: '#1a2942'
          },
          {
            type: "inside",
            xAxisIndex: [0],
            start: 0,
            end: 100,
            zoomOnMouseWheel: true,
            moveOnMouseMove: true,
          },
        ],
        visualMap: {
          type: 'continuous',
          min: 0,
          max: this.scatterData.length > 0 ? this.scatterData.length / 10 : 100,
          dimension: 2,
          show: false,
          inRange: {
            color: ['#1a2942', '#2a476e', '#4c75a3']
          }
        },
        series: [{
          name: `${this.scatterX} vs ${this.scatterY}`,
          type: "scatter",
          symbolSize: 8,
          data: this.scatterData.map((item, index) => [...item, index]),
          large: true,
          largeThreshold: 5000,
          itemStyle: {
            opacity: 0.7
          },
          emphasis: {
            itemStyle: {
              opacity: 1
            }
          }
        }],
      };
      
      if (this.scatterChart !== null) {
        this.scatterChart.dispose();
        this.scatterChart = null;
      }
      
      const scatterChartDom = this.$refs.scatterChart;
      const scatterChart = echarts.init(scatterChartDom, null, { renderer: "canvas" });
      scatterChart.setOption(option);
      this.scatterChart = scatterChart;
    },
    
    loadLine() {
      if (this.lineY.length === 0) {
        ElMessage({
          type: "warning",
          message: "请至少选择一个Y轴字段",
          offset: 60,
        });
        return;
      }
      
      this.isLoadedLine = true;
      this.loadingLine = true;
      
      const lineColumns = this.lineY.join(',');
      
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
            this.lineLegend = res.data.yData.map(item => item.name);
            this.XSeries = res.data.xData;
            
            this.lineSeries = res.data.yData.map((item, index) => ({
              name: item.name,
              type: "line",
              data: item.data,
              smooth: true,
              showSymbol: false,
              symbolSize: 6,
              lineStyle: {
                width: 2
              },
              emphasis: {
                focus: 'series'
              }
            }));
            
            this.initLine();
            
            ElMessage({
              type: "success",
              message: "时序数据加载成功",
              offset: 60,
            });
          } else {
            ElMessage({
              type: "error",
              message: res.msg || "加载失败",
              offset: 60,
            });
          }
        })
        .catch(() => {
          ElMessage({
            type: "error",
            message: "网络错误，请稍后重试",
            offset: 60,
          });
        })
        .finally(() => {
          this.loadingLine = false;
        });
    },

    initLine() {
      const option = {
        title: {},
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: '#4c75a3',
              width: 1
            }
          },
          backgroundColor: 'rgba(50, 50, 50, 0.8)',
          borderColor: '#555',
          borderWidth: 1,
          textStyle: {
            color: '#fff'
          }
        },
        legend: { 
          data: this.lineLegend,
          type: 'scroll',
          pageIconColor: '#1a2942',
          pageTextStyle: {
            color: '#1a2942'
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {
              title: '保存为图片',
              name: '时序分析图'
            },
            dataZoom: {
              title: {
                zoom: '区域缩放',
                back: '还原缩放'
              }
            },
            dataView: {
              title: '数据视图',
              lang: ['数据视图', '关闭', '刷新']
            },
            restore: {
              title: '重置'
            }
          }
        },
        grid: {
          left: '8%',
          right: '8%',
          bottom: '15%',
          top: '12%',
          containLabel: true
        },
        xAxis: {
          type: "category",
          name: this.lineX,
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: {
            fontWeight: 'bold'
          },
          boundaryGap: false,
          data: this.XSeries,
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            interval: 'auto',
            rotate: this.XSeries.length > 30 ? 45 : 0,
            hideOverlap: true
          }
        },
        yAxis: {
          type: "value",
          name: this.lineY.length > 1 ? "数值" : this.lineY[0],
          nameLocation: 'middle',
          nameGap: 40,
          nameTextStyle: {
            fontWeight: 'bold'
          },
          min: "dataMin",
          max: "dataMax",
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#eee'
            }
          }
        },
        dataZoom: [
          {
            type: "slider",
            show: true,
            xAxisIndex: [0],
            left: '9%',
            right: '9%',
            bottom: '2%',
            start: 0,
            end: 100,
            handleSize: '110%',
            handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
            handleStyle: {
              color: '#1a2942',
              shadowBlur: 3,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            },
            textStyle: {
              color: '#333'
            },
            borderColor: '#1a2942'
          },
          {
            type: "inside",
            start: 0,
            end: 100,
            zoomOnMouseWheel: true,
            moveOnMouseWheel: false,
            moveOnMouseMove: true,
          },
        ],
        series: this.lineSeries,
        color: [
          '#1a2942', '#4c75a3', '#00c0ee', '#5c7bd9', 
          '#9d5abd', '#d3436e', '#f86b0d', '#f2bd27'
        ]
      };
      
      if (this.lineChart != null) {
        this.lineChart.dispose();
        this.lineChart = null;
      }
      
      const lineChartDom = this.$refs.lineChart;
      const lineChart = echarts.init(lineChartDom, null, { renderer: "canvas" });
      lineChart.setOption(option);
      this.lineChart = lineChart;
    },
    
    onTabChange(value) {
      if (!this.isLoadedScatter && value === "scatter") {
        this.loadScatter();
      } else if (!this.isLoadedLine && value === "line") {
        this.loadLine();
      }
      
      this.$nextTick(() => {
        this.resizeCharts();
      });
    },
    
    handleResize() {
      // 防抖处理
      if (this.lastChartResize) {
        clearTimeout(this.lastChartResize);
      }
      
      this.lastChartResize = setTimeout(() => {
        this.resizeCharts();
      }, 200);
    },
    
    resizeCharts() {
      if (this.scatterChart) {
        this.scatterChart.resize();
      }
      if (this.lineChart) {
        this.lineChart.resize();
      }
    },
  },
};
</script>

<style scoped>
.visualization-container {
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

/* 主内容区域 */
.content-panel {
  background-color: white;
  margin: 0 20px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
  min-height: calc(100vh - 160px);
}

/* 标签页样式 */
.visualization-tabs {
  height: 100%;
  min-height: calc(100vh - 200px);
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.el-tabs__item) {
  height: 50px;
  padding: 0 30px;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  border: none;
  transition: all 0.3s;
}

:deep(.el-tabs__item.is-active) {
  color: #1a2942;
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(to right, #1a2942, #4c75a3);
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #e0e0e0;
}

/* 图表容器 */
.chart-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: calc(100vh - 280px);
}

/* 控制面板 */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.axis-control {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wide-group {
  flex: 1;
  min-width: 250px;
}

.control-label {
  font-weight: 500;
  color: #1a2942;
  white-space: nowrap;
}

.axis-select {
  min-width: 180px;
}

:deep(.el-select__tags) {
  background-color: transparent;
}

.chart-info {
  display: flex;
  gap: 20px;
  padding-left: 15px;
  border-left: 1px solid #e0e0e0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.info-item .el-icon {
  color: #4c75a3;
}

/* 图表区域 */
.chart-area {
  flex: 1;
  height: 60vh;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

/* 响应式样式 */
@media screen and (max-width: 992px) {
  .control-panel {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .axis-control {
    width: 100%;
  }
  
  .chart-info {
    width: 100%;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid #e0e0e0;
    padding-top: 15px;
  }
}

@media screen and (max-width: 768px) {
  .axis-control {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .control-group {
    width: 100%;
  }
  
  .axis-select {
    width: 100%;
  }
}
/* 标签页样式优化 */
:deep(.el-tabs--card > .el-tabs__header) {
  border-bottom: none;
  padding: 0 5px;
  margin-bottom: 25px;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  border: none;
  border-radius: 8px;
  background: linear-gradient(to right, rgba(26, 41, 66, 0.05), rgba(76, 117, 163, 0.05));
  padding: 5px;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
  border: none;
  height: 56px;
  margin: 0 5px;
  border-radius: 6px;
  padding: 0 25px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__item:first-child) {
  margin-left: 0;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__item:last-child) {
  margin-right: 0;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) {
  background: linear-gradient(135deg, #1a2942, #4c75a3);
  color: white;
  box-shadow: 0 5px 15px rgba(26, 41, 66, 0.3);
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__item:not(.is-active):hover) {
  color: #1a2942;
  background: rgba(76, 117, 163, 0.1);
}

/* 为标签添加图标 */
:deep(.el-tabs__item)::before {
  font-family: 'element-icons';
  font-size: 18px;
  margin-right: 8px;
  vertical-align: middle;
}

:deep(.el-tabs__item[aria-controls*="pane-scatter"])::before {
  content: "\e6df"; /* 使用Element Plus散点图图标 */
  color: #00c0ee;
}

:deep(.el-tabs__item[aria-controls*="pane-line"])::before {
  content: "\e610"; /* 使用Element Plus折线图图标 */
  color: #5c7bd9;
}

:deep(.el-tabs__item.is-active)::before {
  color: white;
}

/* 控制面板优化 */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #ebeef5;
  position: relative;
}

.control-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(to bottom, #1a2942, #4c75a3);
  border-radius: 4px 0 0 4px;
}

.axis-control {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(to right, rgba(26, 41, 66, 0.02), rgba(76, 117, 163, 0.02));
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px solid rgba(76, 117, 163, 0.1);
}

.control-label {
  font-weight: 500;
  color: #1a2942;
  white-space: nowrap;
}

.axis-select {
  min-width: 180px;
}

/* 图表信息卡片样式 */
.chart-info {
  display: flex;
  gap: 15px;
  padding-left: 20px;
  border-left: 1px dashed rgba(76, 117, 163, 0.3);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(to right, rgba(26, 41, 66, 0.03), rgba(76, 117, 163, 0.03));
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(76, 117, 163, 0.1);
}

.info-item .el-icon {
  color: #4c75a3;
  font-size: 16px;
}

.info-item strong {
  color: #1a2942;
  font-weight: 600;
}
</style>