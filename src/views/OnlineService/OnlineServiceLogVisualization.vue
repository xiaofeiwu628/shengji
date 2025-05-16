<template>
  <div class="visualization-container">
    <!-- 头部区域 -->
    <div class="header-area">
      <div class="tech-title">
        <el-icon><DataAnalysis /></el-icon>
        <el-breadcrumb :separator-icon="ArrowRight" class="nav-breadcrumb">
          <el-breadcrumb-item :to="{ path: '/onlineServiceList' }" class="tech-breadcrumb">
            在线服务
          </el-breadcrumb-item>
          <el-breadcrumb-item class="tech-breadcrumb">
            访问统计
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="main-content-wrapper">
      <!-- 统计类型导航 -->
      <div class="stats-nav-section">
        <el-menu class="stats-menu" mode="horizontal" :default-active="pageIndex.toString()">
          <el-menu-item index="1" @click="changePageIndex(1)">
            <el-icon><TrendCharts /></el-icon>
            <span>请求数量时间趋势图</span>
          </el-menu-item>
          <el-menu-item index="2" @click="changePageIndex(2)">
            <el-icon><Histogram /></el-icon>
            <span>请求情况时段分布图</span>
          </el-menu-item>
          <el-menu-item index="3" @click="changePageIndex(3)">
            <el-icon><PieChart /></el-icon>
            <span>请求响应状态分布图</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 图表展示区域 -->
      <div class="chart-section">
        <!-- 请求数量时间趋势图 -->
        <div v-if="pageIndex === 1" class="chart-container" v-loading="loading">
          <div class="chart-controls">
            <div class="control-section">
              <div class="control-item">
                <span class="control-label">请选择时间范围</span>
                <el-date-picker
                  v-model="timeValue1"
                  type="datetimerange"
                  :disabled-date="disabledDate"
                  :shortcuts="shortcuts"
                  range-separator="至"
                  start-placeholder="起始时间"
                  end-placeholder="结束时间"
                  format="YYYY/MM/DD HH:mm:ss"
                  value-format="YYYY-M-D HH:mm:ss"
                  class="date-picker"
                />
              </div>
              <div class="control-item">
                <span class="control-label">时间跨度单位</span>
                <el-select v-model="timeunitvalue" class="time-unit-selector">
                  <el-option
                    v-for="item in timeUnit"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </div>
            </div>
          </div>
          <div ref="myChart" class="chart-display"></div>
        </div>

        <!-- 请求情况时段分布图 -->
        <div v-if="pageIndex === 2" class="chart-container" v-loading="loading">
          <div class="chart-controls">
            <div class="control-section">
              <div class="control-item">
                <span class="control-label">请选择具体日期</span>
                <el-date-picker
                  v-model="timeValue2"
                  type="datetimerange"
                  :disabled-date="disabledDate"
                  :shortcuts="shortcuts"
                  range-separator="至"
                  start-placeholder="起始时间"
                  end-placeholder="结束时间"
                  format="YYYY/MM/DD HH:mm:ss"
                  value-format="YYYY-M-D HH:mm:ss"
                  class="date-picker"
                />
              </div>
              <div class="control-item">
                <span class="control-label">时间间隔</span>
                <div class="time-span-control">
                  <el-select v-model="timeSpanNum" class="time-span-selector">
                    <el-option
                      v-for="item in timeSpan"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                  <span class="unit-label">小时</span>
                </div>
              </div>
            </div>
          </div>
          <div ref="myChart" class="chart-display"></div>
        </div>

        <!-- 请求响应状态分布图 -->
        <div v-if="pageIndex === 3" class="chart-container" v-loading="loading">
          <div class="chart-controls">
            <div class="control-section">
              <div class="control-item">
                <span class="control-label">请选择具体日期</span>
                <el-date-picker
                  v-model="timeValue3"
                  type="datetimerange"
                  :disabled-date="disabledDate"
                  :shortcuts="shortcuts"
                  range-separator="至"
                  start-placeholder="起始时间"
                  end-placeholder="结束时间"
                  format="YYYY/MM/DD HH:mm:ss"
                  value-format="YYYY-M-D HH:mm:ss"
                  class="date-picker"
                />
              </div>
            </div>
          </div>
          <div class="pie-chart-layout">
            <div ref="myChart" class="pie-chart"></div>
            <div class="status-table">
              <!-- 添加表格标题区域 -->
              <div class="table-header">
                <div class="table-title">响应状态详情</div>
                <div class="table-subtitle">状态码与响应时长统计分析</div>
              </div>
              
              <el-table
                :data="chartData.tableData"
                :header-cell-style="tableHeaderStyle"
                :cell-style="tableCellStyle"
                stripe
                border
                highlight-current-row
                max-height="350"
                class="status-data-table"
              >
                <el-table-column prop="status_code" label="状态码" width="100">
                  <template #default="scope">
                    <div :class="getStatusClass(scope.row.status_code)">
                      {{ scope.row.status_code }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="response_status" label="响应状态"/>
                <el-table-column prop="frequency" label="请求数量" width="100">
                  <template #default="scope">
                    <span class="request-count">{{ scope.row.frequency }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="响应时长（毫秒）">
                  <el-table-column prop="response_duration_min" label="最小值" width="100"/>
                  <el-table-column prop="response_duration_avg" label="平均值" width="100">
                    <template #default="scope">
                      <span class="avg-value">{{ scope.row.response_duration_avg }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="response_duration_max" label="最大值" width="100"/>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import * as echarts from 'echarts'
import request from "@/utils/request";
import { useRoute } from "vue-router";
import { 
  ArrowRight, 
  TrendCharts, 
  Histogram, 
  PieChart,
  DataAnalysis
} from "@element-plus/icons-vue";

export default {
  name: "OnlineServiceLogVisualization",
  data() {
    
    return {
      defaultStart: '',
      defaultEnd: '',
      timeValue1: [],
      timeValue2: '',
      timeValue3: '',
      tableHeaderStyle: {
        background: 'linear-gradient(to right, #1a2942, #4c75a3)',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        borderColor: '#1a2942',
        textAlign: 'center',
        padding: '12px 0',
        height: '50px'
      },
      tableCellStyle: {
        textAlign: 'center',
        fontSize: '14px',
        padding: '10px 0',
        color: '#303133'
      },
      disabledDate: (time) => {
        return time.getTime() > Date.now()
      },
      shortcuts: [
        {
          text: '近一天',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24)
            return [start, end]
          },
        },
        {
          text: '近一周',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
          },
        },
        {
          text: '近一个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
          },
        },
        {
          text: '近三个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            return [start, end]
          },
        },
      ],
      pageIndex: 1,
      ArrowRight,
      TrendCharts,
      Histogram,
      PieChart,
      DataAnalysis,
      loading: true,
      serviceId: '',
      timeSpan: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      timeUnitValue: '',
      timeunitvalue: '小时',
      timeUnit: ['小时', '天', '月'],
      timeSpanNum: 1,//时间跨度大小
      chartData: {//图表数据
        graphType: 'LineChart',//图表类型
        yData: [],//折线图与直方图y轴数据
        xData: [],//直方图x轴数据
        pieData: [],//饼图数据
        tableData: [],//表格数据
      },
      middle: {},
      tableHeaderStyle: {
        background: '#F5F5F5',
        height: '50px',
        color: '#303133',
        borderColor: '#E4E7ED',
        'text-align': 'center',
        fontWeight: '500'
      },
      tableCellStyle: {
        borderColor: '#E4E7ED',
        'text-align': 'center'
      }
    }
    
  },
  watch: {
    // 保留原有watch逻辑，完全不变...
    timeunitvalue: {
      deep: true,
      handler(newValue, oldValue) {
        if (newValue === '小时') {
          this.timeUnitValue = 'HOUR'
        } else if (newValue === '天') {
          this.timeUnitValue = 'DAY'
        } else if (newValue === '月') {
          this.timeUnitValue = 'MONTH'
        } else {
          console.log('timeunitvalue error')
        }
        this.middle = {
          service_id: this.serviceId,
          time_unit: this.timeUnitValue,
          start_time: this.timeValue1[0],
          end_time: this.timeValue1[1]
        }
        this.loadServiceLogLineChart(this.middle)
      }
    },
    timeSpanNum: {
      deep: true,
      handler(newValue, oldValue) {
        this.middle = {
          service_id: this.serviceId,
          time_span_num: newValue,
          start_time: this.timeValue2[0],
          end_time: this.timeValue2[1]
        }
        console.log(this.middle, 'middle in watch')
        if (this.pageIndex === 2) {
          this.loadServiceLogHistogram(this.middle)
          console.log('Histogram page in watch')
        } else {
          console.log('error')
        }
      }
    },
    pageIndex: {
      deep: true,
      handler(newValue, oldValue) {
        this.getBeforeOneDay()
        this.timeValue1 = [this.defaultStart, this.defaultEnd]
        this.timeValue2 = [this.defaultStart, this.defaultEnd]
        this.timeValue3 = [this.defaultStart, this.defaultEnd]
        if (this.pageIndex === 1) {
          this.changeGraphType('LineChart')
          console.log('LineChart page in watch')
        } else if (this.pageIndex === 2) {
          this.changeGraphType('Histogram')
          console.log('Histogram page in watch')
        } else if (this.pageIndex === 3) {
          this.changeGraphType('PieChart')
          console.log('PieChart page in watch')
        } else {
          console.log('error')
        }
      }
    },
    timeValue1: {
      deep: true,
      handler(newvalue, oldvalue) {
        console.log(this.timeValue1, 'timeValue1')
        if (newvalue != null) {
          if (this.pageIndex === 1) {
            this.middle = {
              service_id: this.serviceId,
              time_unit: this.timeUnitValue,
              start_time: this.timeValue1[0],
              end_time: this.timeValue1[1]
            }
            this.loadServiceLogLineChart(this.middle)
            console.log('LineChart timevalue1 in watch')
          }
        }
      }
    },
    timeValue2: {
      deep: true,
      handler(newvalue, oldvalue) {
        console.log(this.timeValue2, 'timeValue2')
        if (newvalue != null) {
          if (this.pageIndex === 2) {
            this.middle = {
              service_id: this.serviceId,
              time_span_num: this.timeSpanNum,
              start_time: this.timeValue2[0],
              end_time: this.timeValue2[1]
            }
            this.loadServiceLogHistogram(this.middle)
            console.log('Histogram timevalue2 in watch')
          } 
        }
      }
    },
    timeValue3: {
      deep: true,
      handler(newvalue, oldvalue) {
        console.log(this.timeValue3, 'timeValue3')
        if (newvalue != null) {
          if (this.pageIndex === 3) {
            this.middle = {
              service_id: this.serviceId,
              start_time: this.timeValue3[0],
              end_time: this.timeValue3[1]
            }
            this.loadServiceLogPieChart(this.middle)
            console.log('PieChart timevalue3 in watch')
          }
        }
      }
    },
  },
  created() {
    this.getBeforeOneDay()
    const route = useRoute();
    this.serviceId = route.query.serviceId;
    this.middle = {
      service_id: this.serviceId,
      time_unit: this.timeUnitValue,
      start_time: this.timeValue1[0],
      end_time: this.timeValue1[1]
    }
    this.loadServiceLogLineChart(this.middle);
    console.log(this.serviceId, this.timeValue1, 'serviceId in created')
  },
  methods: {
        // 根据状态码返回对应的样式类
    getStatusClass(code) {
      if (!code) return 'status-unknown';
      
      code = code.toString();
      if (code.startsWith('2')) return 'status-success';
      if (code.startsWith('3')) return 'status-redirect';
      if (code.startsWith('4')) return 'status-client-error';
      if (code.startsWith('5')) return 'status-server-error';
      
      return 'status-unknown';
    },
    // 保留原有方法逻辑，完全不变...
    getBeforeOneDay() {
      let start = new Date()
      let end = new Date().toLocaleString().split('/').join('-')
      let sta = start.setTime(start.getTime() - 3600 * 1000 * 24)
      sta = new Date(sta).toLocaleString().split('/').join('-')
      this.defaultStart = sta
      this.defaultEnd = end
      this.timeValue1 = [this.defaultStart, this.defaultEnd]
      this.timeValue2 = [this.defaultStart, this.defaultEnd]
      this.timeValue3 = [this.defaultStart, this.defaultEnd]
      console.log(this.timeValue1, 'beforeday')
    },
    changePageIndex(param) {
      this.pageIndex = param;
    },
    loadServiceLogLineChart(param) {
      this.loading = true;
      request.get('/OnlineService/OnlineServiceLogVisualization/LineChart', {
        params: param ? param : { service_id: this.serviceId }
      }).then(res => {
        this.chartData.xData = res.data.xData;
        this.chartData.yData = res.data.yData;
        console.log(res.data, 'res.data in LineChart');
      })
      setTimeout(() => {
        this.initChart()//刷新图表
      }, 1000)
    },
    loadServiceLogHistogram(param) {
      this.loading = true;
      request.get('/OnlineService/OnlineServiceLogVisualization/Histogram', {
        params: param ? param : { service_id: this.serviceId }
      }).then(res => {
        this.chartData.xData = res.data.xData;
        this.chartData.yData = res.data.yData;
        console.log(res.data, 'res.data in Histogram');
      })
      setTimeout(() => {
        this.initChart()//刷新图表
      }, 1000)
    },
    loadServiceLogPieChart(param) {
      this.loading = true;
      request.get('/OnlineService/OnlineServiceLogVisualization/PieChart', {
        params: param ? param : { service_id: this.serviceId }
      }).then(res => {
        this.chartData.pieData = res.data.pie_chart_data;
        this.chartData.tableData = res.data.table_data;
        console.log(res.data, 'res.data in PieChart');
      })
      setTimeout(() => {
        this.initChart()//刷新图表
      }, 1000)
    },
    changeGraphType(param) {
      this.chartData.graphType = param;
      this.timeunitvalue = "小时";
      this.timeSpanNum = 1;
      let middle;
      if (param === 'LineChart') {
        middle = {
          service_id: this.serviceId,
          time_unit: this.timeUnitValue,
          start_time: this.timeValue1[0],
          end_time: this.timeValue1[1]
        };
        this.loadServiceLogLineChart(middle)
      } else if (param === 'Histogram') {
        middle = {
          service_id: this.serviceId,
          time_span_num: this.timeSpanNum,
          start_time: this.timeValue2[0],
          end_time: this.timeValue2[1]
        };
        this.loadServiceLogHistogram(middle)
      } else if (param === 'PieChart') {
        middle = {
          service_id: this.serviceId,
          start_time: this.timeValue3[0],
          end_time: this.timeValue3[1]
        };
        this.loadServiceLogPieChart(middle)
      }
    },
    initChart() {
      let option
      if (this.chartData.graphType === 'LineChart') {//折线图
        option = {
          title: {
            text: '请求数量时间趋势图',
            left: 'center'
          },
          tooltip: {
            trigger: 'item'
          },
          xAxis: {
            type: 'category',
            name: '时间',
            nameTextStyle: {
              fontWeight: "bold",
              fontSize: 14
            },
            nameGap: 25,
            boundaryGap: false,
            data: this.chartData.xData.map(function (str) {
              return str.replace(' ', '\n');
            })
          },
          yAxis:
              {
                name: '请求数量/个',
                nameLocation: 'middle',
                nameTextStyle: {
                  fontWeight: "bold",
                  fontSize: 15,
                  padding: [14, 14, 14, 14]
                },
                type: 'value',
                minInterval: 1,
                axisLine: {
                  show: 'true',
                  symbol: ['none', 'arrow'],
                  symbolSize: [9, 15],
                  symbolOffset: [0, 12],
                  lineStyle: {
                    type: 'solid'
                  }
                },
              },
          series: [
            {
              data: this.chartData.yData,
              type: 'line',
              lineStyle: {
                color: '#4c75a3',
                width: 3
              },
              itemStyle: {
                color: '#1a2942'
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0, color: 'rgba(76, 117, 163, 0.3)'
                  }, {
                    offset: 1, color: 'rgba(76, 117, 163, 0.05)'
                  }],
                }
              }
            }
          ]
        };
      } else if (this.chartData.graphType === 'Histogram') {//直方图
        option = {
          title: {
            text: '请求数量时段分布图',
            left: 'center'
          },
          tooltip: {
            trigger: 'item'
          },
          xAxis: {
            type: 'category',
            name: '时间',
            nameTextStyle: {
              fontWeight: "bold",
              fontSize: 14
            },
            nameGap: 25,
            axisLabel: {interval: 0, rotate: 30},
            data: this.chartData.xData
          },
          yAxis:
              {
                name: '请求数量/个',
                nameLocation: 'middle',
                nameTextStyle: {
                  fontWeight: "bold",
                  fontSize: 15,
                  padding: [14, 14, 14, 14]
                },
                type: 'value',
                minInterval: 1,
                axisLine: {
                  show: 'true',
                  symbol: ['none', 'arrow'],
                  symbolSize: [9, 15],
                  symbolOffset: [0, 12],
                  lineStyle: {
                    type: 'solid'
                  }
                },
              },
          series: [
            {
              data: this.chartData.yData,
              type: 'bar',
              barWidth: '40%',
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0, color: '#1a2942'
                  }, {
                    offset: 1, color: '#4c75a3'
                  }],
                }
              }
            }
          ]
        };
      } else if (this.chartData.graphType === 'PieChart') {//饼形图
        option = {
          title: {
            text: '请求响应状态分布图',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
          },
          legend: {
            bottom: 10,
            left: 'center'
          },
          series: [
            {
              name: '响应状态',
              type: 'pie',
              radius: '55%',
              center: ['50%', '50%'],
              data: this.chartData.pieData,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              },
              labelLine: {
                smooth: 0.2,
                length: 10,
                length2: 20
              },
              color: ['#4c75a3', '#1a2942', '#5e97d1', '#7ea3d7', '#a8c5e7', '#2c4b76']
            }
          ]
        };
      }
      var myChart = echarts.init(this.$refs.myChart);
      myChart.clear();
      myChart.setOption(option)
      this.loading = false;
      console.log('作图完成')
    }
  }
}
</script>

<style scoped>
/* 基础布局样式 */
.visualization-container {
  display: flex;
  flex-direction: column;
}

/* 头部区域 - 与其他组件保持一致 */
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

/* 统计类型导航 */
.stats-nav-section {
  margin-bottom: 20px;
}

.stats-menu {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
}

:deep(.el-menu--horizontal) {
  border-bottom: none;
}

:deep(.el-menu--horizontal > .el-menu-item) {
  height: 50px;
  line-height: 50px;
  padding: 0 25px;
  font-weight: 500;
}

:deep(.el-menu--horizontal > .el-menu-item.is-active) {
  color: #4c75a3;
  border-bottom: 2px solid #4c75a3;
}

:deep(.el-menu-item:not(.is-active):hover) {
  color: #4c75a3 !important;
  background-color: rgba(76, 117, 163, 0.05);
}

/* 图表区域 */
.chart-section {
  margin-top: 30px;
}

.chart-container {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
  border: 1px solid #ebeef5;
  padding: 20px;
  margin-bottom: 20px;
}

.chart-controls {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.control-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: center;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.control-label {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
}

.date-picker {
  width: 400px;
}

.time-unit-selector {
  width: 100px;
}

.time-span-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-span-selector {
  width: 80px;
}

.unit-label {
  color: #606266;
}

/* 图表显示 */
.chart-display {
  width: 100%;
  height: 400px;
  margin-top: 30px;
}

/* 饼图和表格布局 */
.pie-chart-layout {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 30px;
  gap: 30px;
}

.pie-chart {
  flex: 1;
  min-width: 300px;
  height: 400px;
}

.status-table {
  flex: 1;
  min-width: 300px;
}

.status-data-table {
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

/* 加载动画样式 */
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.9);
}

:deep(.el-loading-spinner .circular) {
  width: 42px;
  height: 42px;
}

:deep(.el-loading-spinner .path) {
  stroke: #4c75a3;
  stroke-width: 2;
}

/* 响应式调整 */
@media screen and (max-width: 1200px) {
  .control-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .control-item {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .date-picker,
  .time-unit-selector,
  .time-span-control {
    width: 100%;
  }
  
  .pie-chart-layout {
    flex-direction: column;
  }
  
  .pie-chart,
  .status-table {
    width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .header-area {
    padding: 15px 20px;
  }
  
  .tech-title {
    font-size: 16px;
  }
  
  :deep(.el-menu--horizontal > .el-menu-item) {
    padding: 0 15px;
    font-size: 14px;
  }
  
  .chart-controls {
    padding: 15px;
  }
  
  .chart-display,
  .pie-chart {
    height: 300px;
  }
}
/* 表格容器样式优化 */
.status-table {
  flex: 1;
  min-width: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  display: flex;
  flex-direction: column;
}

/* 表格标题区域 */
.table-header {
  background: linear-gradient(to right, #1a2942, #4c75a3);
  color: white;
  padding: 15px 20px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.table-subtitle {
  font-size: 13px;
  opacity: 0.85;
}

/* 表格样式增强 */
.status-data-table {
  width: 100%;
  margin-bottom: 0;
}

:deep(.status-data-table .el-table__header-wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.status-data-table.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: #f5f7fa;
}

:deep(.status-data-table .el-table__body tr:hover > td.el-table__cell) {
  background-color: #edf2fc;
}

/* 状态码样式 */
.status-success {
  background-color: #f0f9eb;
  color: #67c23a;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  min-width: 60px;
  border: 1px solid #e1f3d8;
}

.status-redirect {
  background-color: #f4f4f5;
  color: #909399;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  min-width: 60px;
  border: 1px solid #e9e9eb;
}

.status-client-error {
  background-color: #fef0f0;
  color: #f56c6c;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  min-width: 60px;
  border: 1px solid #fde2e2;
}

.status-server-error {
  background-color: #fef6ed;
  color: #e6a23c;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  min-width: 60px;
  border: 1px solid #faecd8;
}

.status-unknown {
  background-color: #f4f4f5;
  color: #909399;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  min-width: 60px;
  border: 1px solid #e9e9eb;
}

/* 请求数量样式 */
.request-count {
  font-weight: 600;
  color: #4c75a3;
}

/* 平均值样式 */
.avg-value {
  font-weight: 600;
  color: #1a2942;
}

/* 饼图样式匹配 */
.pie-chart {
  flex: 1;
  min-width: 300px;
  height: 400px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  padding: 20px;
}
</style>