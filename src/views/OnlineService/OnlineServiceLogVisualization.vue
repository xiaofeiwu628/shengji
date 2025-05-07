<template>
  <div>
    <div style="margin: 20px 0 0 2%">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/onlineServiceList' }">在线服务</el-breadcrumb-item>
        <el-breadcrumb-item>访问统计</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div style="padding: 20px 20px 0 20px;">
      <el-menu class="el-menu-m" mode="horizontal" default-active="1">
        <el-menu-item index="1" @click="changePageIndex(1)">请求数量时间趋势图</el-menu-item>
        <el-menu-item index="2" @click="changePageIndex(2)">请求情况时段分布图</el-menu-item>
        <el-menu-item index="3" @click="changePageIndex(3)">请求响应状态分布图</el-menu-item>
      </el-menu>
    </div>

    <div style="background-color: white;margin: 20px;min-height: calc(100vh - 203px)">
      <!--    请求数量时间趋势图-->
      <div v-if="pageIndex === 1" v-loading="loading">
        <div class="row">
          <div class="block">
            <span class="demonstration">请选择时间范围</span>
            <el-date-picker
                v-model="this.timeValue1"
                type="datetimerange"
                :disabled-date="this.disabledDate"
                :shortcuts="this.shortcuts"
                range-separator="To"
                start-placeholder="起始时间"
                end-placeholder="结束时间"
                format="YYYY/MM/DD HH:mm:ss"
                value-format="YYYY-M-D HH:mm:ss"
            />
            <span style="margin-left: 50px">时间跨度单位：</span>
            <el-select v-model="this.timeunitvalue" style="margin: 5px 15px;width: 80px">
              <el-option
                  v-for="item in timeUnit"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>

          </div>
          <div ref="myChart" class="myChart" style="margin-top: 150px"></div>
        </div>
      </div>
      <!--    请求情况时段分布图-->
      <div v-if="pageIndex === 2" v-loading="loading">
        <div class="row">
          <div class="block">
            <span class="demonstration">请选择具体日期</span>
            <el-date-picker
                v-model="this.timeValue2"
                type="datetimerange"
                :disabled-date="this.disabledDate"
                :shortcuts="this.shortcuts"
                range-separator="To"
                start-placeholder="起始时间"
                end-placeholder="结束时间"
                format="YYYY/MM/DD HH:mm:ss"
                value-format="YYYY-M-D HH:mm:ss"
            />
            <span style="margin-left: 50px">时间间隔：</span>
            <el-select v-model="this.timeSpanNum" style="margin: 5px 15px;width: 60px ">
              <el-option
                  v-for="item in timeSpan"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>
            <span>小时</span>
          </div>

          <div ref="myChart" class="myChart" style="margin-top: 150px"></div>
        </div>
      </div>
      <!--    请求响应状态分布图-->
      <div v-if="pageIndex === 3" v-loading="loading">
        <div class="piepage">
          <div class="block">
            <span class="demonstration">请选择具体日期</span>
            <el-date-picker
                v-model="this.timeValue3"
                type="datetimerange"
                :disabled-date="this.disabledDate"
                :shortcuts="this.shortcuts"
                range-separator="To"
                start-placeholder="起始时间"
                end-placeholder="结束时间"
                format="YYYY/MM/DD HH:mm:ss"
                value-format="YYYY-M-D HH:mm:ss"
            />
          </div>
          <div ref="myChart" class="pieChart"></div>
          <div class="table">
            <el-table style="border: 1px solid #9a9a9a"
                      :data="this.chartData.tableData"
                      :header-cell-style="{background:'#F5F5F5',height:'50px',color:'#303133',borderColor: '#9a9a9a','text-align':'center'}"
                      :cell-style="{borderColor:'#9a9a9a','text-align':'center'}"
                      max-height="300" border>
              <el-table-column prop="status_code" label="状态码"/>
              <el-table-column prop="response_status" label="响应状态"/>
              <el-table-column prop="frequency" label="请求数量"/>
              <el-table-column label="响应时长（单位：毫秒）">
                <el-table-column prop="response_duration_min" label="最小值"/>
                <el-table-column prop="response_duration_avg" label="平均值"/>
                <el-table-column prop="response_duration_max" label="最大值"/>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import request from "@/utils/request";
import {useRoute} from "vue-router";
import {ArrowRight, QuestionFilled} from "@element-plus/icons-vue";
import {ref} from 'vue'

export default {
  name: "OnlineServiceLogVisualization",
  components: {
    QuestionFilled,
  },
  data() {
    return {
      defaultStart: '',
      defaultEnd: '',
      timeValue1: [this.defaultStart,this.defaultEnd],
      timeValue2: '',
      timeValue3: '',
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

    }
  },
  watch: {//监听数值变化
    timeunitvalue: {
      deep: true,//深度监听
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
          } else if (this.pageIndex === 3) {
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
  mounted() {

  },
  methods: {
    //获取一天的值
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
    //页面切换
    changePageIndex(param) {
      this.pageIndex = param;
    },
    //获取趋势图的信息
    loadServiceLogLineChart(param) {
      this.loading = true;
      request.get('/OnlineService/OnlineServiceLogVisualization/LineChart', {
        params: param ? param : {service_id: this.serviceId}
      }).then(res => {
        this.chartData.xData = res.data.xData;
        this.chartData.yData = res.data.yData;
        console.log(res.data, 'res.data in LineChart');
      })
      setTimeout(() => {
        this.initChart()//刷新图表
      }, 1000)
    },
    //获取时段分布图信息
    loadServiceLogHistogram(param) {
      this.loading = true;
      request.get('/OnlineService/OnlineServiceLogVisualization/Histogram', {
        params: param ? param : {service_id: this.serviceId}
      }).then(res => {
        this.chartData.xData = res.data.xData;
        this.chartData.yData = res.data.yData;
        console.log(res.data, 'res.data in Histogram');
      })
      setTimeout(() => {
        this.initChart()//刷新图表
      }, 1000)
    },
    //获取响应状态图的信息
    loadServiceLogPieChart(param) {
      this.loading = true;
      request.get('/OnlineService/OnlineServiceLogVisualization/PieChart', {
        params: param ? param : {service_id: this.serviceId}
      }).then(res => {
        this.chartData.pieData = res.data.pie_chart_data;
        this.chartData.tableData = res.data.table_data;
        console.log(res.data, 'res.data in PieChart');
      })
      setTimeout(() => {
        this.initChart()//刷新图表
      }, 1000)
    },
    //改变图表类型
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
    //作图
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
              type: 'line'
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
              type: 'bar'
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
            trigger: 'item'
          },
          // legend: {
          //   orient: 'vertical',
          //   left: 'left'
          // },
          series: [
            {
              type: 'pie',
              radius: '50%',
              data: this.chartData.pieData,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
      }
      // var chartDom=document.getElementById('myChart');
      // var myChart = echarts.init(chartDom,null);
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
.el-menu-m {
  height: 50px;
  background-color: #ffffff;
}

.row {
  display: inline-block;
  justify-content: center;
  margin-left: 150px;
}

.myChart {
  width: 1000px;
  height: 400px;
  margin: auto !important;
}

.pieChart {
  width: 550px;
  height: 360px;
  display: inline-block;
  margin-left: 80px;
  margin-right: 20px;
  margin-top: 35px;
}


.table {
  width: 600px;
  height: 350px;
  margin-top: 35px;
  padding-right: 40px;
  display: inline-block;
  float: right;
}

.block {
  padding: 50px 0px;
  text-align: center;
  /*border-right: solid 0px var(--el-border-color);*/
  flex: 1;
}

.block:last-child {
  border-right: none;
}

.block .demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}

</style>

