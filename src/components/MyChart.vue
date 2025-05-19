<template>
  <div
    ref="myChart"
    id="myChart"
    :style="{ width: '55vw', height: '55vh' }"
  ></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

interface ChartMessage {
  fName: string
  GraphType: string
  ydata: any[]
  xdata?: any[]
  piedata?: any[]
}

const props = defineProps<{
  message: ChartMessage
}>()

const myChart = ref<HTMLDivElement | null>(null)
let myChartInstance: echarts.ECharts | null = null

function resizeChart() {
  nextTick(() => {
    myChartInstance?.resize()
  })
}

function initChart() {
  if (!myChart.value) return
  if (!myChartInstance) {
    myChartInstance = echarts.init(myChart.value, null, { renderer: 'svg' })
  }
  let option: echarts.EChartsOption = {}
  const msg = props.message

  if (msg.GraphType === 'LineChart') {
    option = {
      title: {
        text: '字段名：' + msg.fName,
        left: 'center',
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        axisLabel: {
          interval: 1,
        },
        
        min: 0,
        max: msg.ydata.length
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          left: '9%',
          bottom: 0,
          start: 30,
          end: 70
        },
        {
          type: "inside",
          start: 0,
          end: 5,
          zoomOnMouseWheel: true,
          moveOnMouseWheel: false,
          moveOnMouseMove: true
        }
      ],
      yAxis: {
        type: 'value',
        min: (value: any) => value.min,
        max: (value: any) => value.max,
      },
      series: [
        {
          data: msg.ydata,
          type: 'line',
          smooth: true
        }
      ]
    }
  } else if (msg.GraphType === 'Histogram') {
    option = {
      title: {
        text: '字段名：' + msg.fName,
        left: 'center',
      },
      tooltip: {
        formatter: function (param: any) {
          var value = param;
          return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 16px;margin-bottom: 3px;"> '
            + '取值为' + value.name + '的数据共有' + value.data + '条' + '</div>';
        }
      },
      xAxis: {
        type: 'category',
        data: msg.xdata,
        name: '取值',
        nameTextStyle: {
          fontSize: 16,
          padding: 10
        },
        axisLabel: {
          formatter: function (params: string) {
            let newParamsName = ''
            const paramsNameNumber = params.length
            const provideNumber = 10
            const rowNumber = Math.ceil(paramsNameNumber / provideNumber)
            if (paramsNameNumber > provideNumber) {
              for (let p = 0; p < rowNumber; p++) {
                let tempStr = ''
                let start = p * provideNumber
                let end = start + provideNumber
                if (p === rowNumber - 1) {
                  tempStr = params.substring(start, paramsNameNumber)
                } else {
                  tempStr = params.substring(start, end) + '\n'
                }
                newParamsName += tempStr
              }
            } else {
              newParamsName = params
            }
            return newParamsName
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '记录数量',
        nameTextStyle: {
          fontSize: 16,
          padding: 10
        }
      },
      series: [
        {
          data: msg.ydata,
          type: 'bar',
          large: true,
          largeThreshold: 500,
          itemStyle: {
            color: new (echarts as any).graphic.LinearGradient(0, 1, 0, 0, [
              { offset: 0, color: "#79c7f3FF" },
              { offset: 1, color: "#7E7CEB" }
            ], false)
          }
        }
      ]
    }
  } else if (msg.GraphType === 'PieChart') {
    option = {
      title: {
        text: '字段名：' + msg.fName,
        left: 'center',
        top: 0,
      },
      tooltip: {
        trigger: 'item',
        formatter: function (param: any) {
          var value = param.data;
          return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 16px;margin-bottom: 3px;"> '
            + '取值为' + value.name + '的数据共有' + value.value + '条' + '</div>';
        }
      },
      legend: {
        orient: 'vertical',
        type: 'scroll',
        left: 'right',
        bottom: 18,
      },
      series: {
        data: msg.piedata,
        type: 'pie',
        
        
        radius: '50%',
        center: '55%',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    }
  } else if (msg.GraphType === 'HistogramService') {
    option = {
      title: {
        text: '服务名称:' + msg.fName,
        left: 'center',
      },
      tooltip: {
        formatter: function (param: any) {
          var value = param;
          return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 16px;margin-bottom: 3px;"> '
            + '时间分布为' + value.name + '的数据共有' + value.data + '条' + '</div>';
        }
      },
      xAxis: {
        type: 'category',
        data: msg.xdata,
        name: '时间分布',
        nameTextStyle: {
          fontSize: 14,
          padding: 10
        },
        axisLabel: {
          formatter: function (params: string) {
            let newParamsName = ''
            const paramsNameNumber = params.length
            const provideNumber = 10
            const rowNumber = Math.ceil(paramsNameNumber / provideNumber)
            if (paramsNameNumber > provideNumber) {
              for (let p = 0; p < rowNumber; p++) {
                let tempStr = ''
                let start = p * provideNumber
                let end = start + provideNumber
                if (p === rowNumber - 1) {
                  tempStr = params.substring(start, paramsNameNumber)
                } else {
                  tempStr = params.substring(start, end) + '\n'
                }
                newParamsName += tempStr
              }
            } else {
              newParamsName = params
            }
            return newParamsName
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '访问次数',
        nameTextStyle: {
          fontSize: 16,
          padding: 10
        }
      },
      series: [
        {
          data: msg.ydata,
          type: 'bar',
          large: true,
          largeThreshold: 500,
          itemStyle: {
            
            color: new (echarts as any).graphic.LinearGradient(0, 1, 0, 0, [
              { offset: 0, color: "#79c7f3FF" },
              { offset: 1, color: "#7E7CEB" }
            ], false)
            
          },
        }
      ]
    }
  }
  myChartInstance.clear()
  myChartInstance.setOption(option)
}

watch(
  () => props.message,
  () => {
    initChart()
  },
  { deep: true }
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  myChartInstance?.dispose()
  myChartInstance = null
})
</script>