<template>
  <div>
    <span class="my-title" style="display: flex;align-items: flex-start;margin-left: 20px">字段数值分布情况</span>
    <div style="width: 100%;" v-loading="loading">
      <div ref="chartRef" id="distributeMathBar" style="width: 100%;height: 55vh;"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

interface MessageType {
  multiple: number
  xAxis: number[]
  linedata: any[]
  distributeBardata: any[]
  avg: number
  stdev: number
}

const props = defineProps<{
  message: MessageType
}>()

const loading = ref(true)
const chartRef = ref<HTMLDivElement | null>(null)
let barChart: echarts.ECharts | null = null
/**
 * 监听窗口变化，自动调整图表大小
 */
function resizeCharts() {
  nextTick(() => {
    barChart?.resize()
  })
}

/**
 * 初始化并渲染字段分布直方图和正态分布曲线
 * 包含离群点和标准差区间的判断与分组
 */
function initFailureBarVertical() {
  if (!props.message || !chartRef.value) return
  let message = props.message
  let multiple = Math.round(message.multiple)
  let step = message.xAxis[1] - message.xAxis[0]

  // x轴最大最小前后范围
  message.xAxis[0] = parseFloat(String(message.xAxis[0]))
  message.xAxis[79] = parseFloat(String(message.linedata[79][0]))
  let dataRangeMinOP = message.xAxis[0]
  let dataRangeMaXOP = message.xAxis[message.xAxis.length - 1]

  let opacityOption = 'off'// 'on' | 'off'
  let opacity = opacityOption === 'off' ? 0 : 0.5//
//
  let endPositionOption = 'all'// 
  let endPosition = endPositionOption === 'all' ? 100 : (endPositionOption === 'third' ? 29 : '')

  let standarDevRangeOfOne = {//
    low: message.avg - message.stdev,
    up: message.avg + message.stdev
  }// 计算标准差范围
  let standarDevRangeOfTow = {
    low: message.avg - 2 * message.stdev,
    up: message.avg + 2 * message.stdev
  }// 计算标准差范围
  let standarDevRangeOfThree = {
    low: message.avg - 3 * message.stdev,
    up: message.avg + 3 * message.stdev
  }// 计算标准差范围

  let heigh = 0, low = 0
  if (multiple == 1) {// 计算标准差范围
    heigh = standarDevRangeOfOne.up
    low = standarDevRangeOfOne.low
  } else if (multiple == 2) {// 计算标准差范围
    heigh = standarDevRangeOfTow.up
    low = standarDevRangeOfTow.low
  } else if (multiple == 3) {// 计算标准差范围
    heigh = standarDevRangeOfThree.up
    low = standarDevRangeOfThree.low
  } else {
    heigh = message.avg + multiple * message.stdev
    low = message.avg - multiple * message.stdev
  }
  /**
   * 判断某个数值是否为离群点或接近标准差边界
   * @param name 当前x轴的数值
   * @returns 是否为离群点或边界点
   */
function JudgeBar(name: number) {
  let value = parseFloat(name.toFixed(2))// 当前x轴的数值
  let lowvalue = Math.abs(value - low)
  let heighvalue = Math.abs(value - heigh)
  let threshold = step / 3
  if (value >= heigh || value <= low) {
    return true
  } else if (lowvalue < threshold || heighvalue < threshold) {
    return true
  }
  return false
}

  let barData: any[] = []// 计算实际分布
  let barDataOutliers: any[] = []// 计算实际分布(离群点)
  for (let i = 0; i < 80; i++) {// 计算实际分布
    if (JudgeBar(message.xAxis[i])) {// 判断是否为离群点
      barData.push(null)
      barDataOutliers.push(message.distributeBardata[i])
    } else {
      barData.push(message.distributeBardata[i])
      barDataOutliers.push(null)
    }
  }

  let persents = 'on'
  let format1 = persents === 'on' ? '{value}' : undefined
  let format2 = persents === 'on' ? '{c} %' : undefined
// 格式化数据

  let color1 = {// 颜色渐变
    type: 'linear',
    x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: '#79c7f3FF' },
      { offset: 1, color: '#7E7CEB' }
    ],
    global: false
  }//
  let color2 = {// 颜色渐变
    type: 'linear',
    x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: '#f89898' },
      { offset: 1, color: '#F56C6C' }
    ],
    global: false
  }

  let lineDataSet = {// 计算拟合正态分布曲线
    type: 'line',
    symbol: 'none',
    smooth: false,
    yAxisIndex: 1,
    areaStyle: { opacity },
    tooltip: { trigger: 'axis', show: false },
    data: message.linedata,
    name: '拟合正态分布曲线',
    itemStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#FD723CFF' },
          { offset: 0.45, color: '#FD723CFF' },
          { offset: 0.85, color: '#FF5B82FF' },
          { offset: 1, color: '#FF5B82FF' }
        ],
        global: false
      },
      label: {
        formatter: format2,
        show: false,
        position: 'top',
        fontSize: 16
      },
      lineStyle: { type: "dotted" }
    },
    markLine: {
      symbol: ['none'],
      lineStyle: { type: "silent", color: "#67C23A" },
      itemStyle: {
        color: 'black'
      },
      label: {
        show: true,
        type: 'value',
        formatter: function (params: any) {
          return params.data.name + ' : ' + params.data.value
        },
        position: "end"
      },
      data: [
        { name: 'σ', xAxis: standarDevRangeOfOne.low, lineStyle: { opacity: (dataRangeMinOP > standarDevRangeOfOne.low) ? 0 : 1 }, label: { show: !(dataRangeMinOP > standarDevRangeOfOne.low) } },
        { name: 'σ', xAxis: standarDevRangeOfOne.up, lineStyle: { opacity: (dataRangeMaXOP < standarDevRangeOfOne.up) ? 0 : 1 }, label: { show: !(dataRangeMaXOP < standarDevRangeOfOne.up) } },
        { name: '2σ', xAxis: standarDevRangeOfTow.low, lineStyle: { opacity: (dataRangeMinOP > standarDevRangeOfTow.low) ? 0 : 1 }, label: { show: !(dataRangeMinOP > standarDevRangeOfTow.low) } },
        { name: '2σ', xAxis: standarDevRangeOfTow.up, lineStyle: { opacity: (dataRangeMaXOP < standarDevRangeOfTow.up) ? 0 : 1 }, label: { show: !(dataRangeMaXOP < standarDevRangeOfTow.up) } },
        { name: '3σ', xAxis: standarDevRangeOfThree.low, lineStyle: { opacity: (dataRangeMinOP > standarDevRangeOfThree.low) ? 0 : 1 }, label: { show: !(dataRangeMinOP > standarDevRangeOfThree.low) } },
        { name: '3σ', xAxis: standarDevRangeOfThree.up, lineStyle: { opacity: (dataRangeMaXOP < standarDevRangeOfThree.up) ? 0 : 1 }, label: { show: !(dataRangeMaXOP < standarDevRangeOfThree.up) } },
        { name: '平均值', xAxis: message.avg, lineStyle: { color: '#337ecc' } }
      ]
    }
  }

  let barDataSet = {// 计算实际分布
    type: 'bar',
    smooth: true,
    yAxisIndex: 0,
    areaStyle: { opacity },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    data: barData,
    name: '实际分布(不含离群点)',
    barGap: "-100%",
    itemStyle: {
      color: color1,
      label: {
        formatter: format2,
        show: false,
        position: 'top',
        fontSize: 16
      }
    }
  }

  let barDataSetOutliers = {// 计算实际分布(离群点)
    type: 'bar',
    smooth: true,
    yAxisIndex: 0,
    areaStyle: { opacity },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    data: barDataOutliers,
    name: '实际分布(含离群点)',
    itemStyle: {
      color: color2,
      label: {
        formatter: format2,
        show: false,
        position: 'top',
        fontSize: 16
      }
    }
  }

  let seriesdata = [lineDataSet, barDataSet, barDataSetOutliers]

  if (!barChart) {// 如果图表实例不存在，则创建一个新的实例
    barChart = echarts.init(chartRef.value!)
  }
  let option = {// 图表配置
    type: 'scroll',// 滚动条类型
    title: { text: '' },// 标题
    dataZoom: [//
      {
        type: 'inside',
        show: false,
        xAxisIndex: [0],
        start: 0,
        end: endPosition,
        borderColor: '#F5A9D0',
        backgroundColor: '#F5A9D0'
      },//
      {//
        show: false,
        type: 'slider',
        xAxisIndex: [0],
        start: 0,
        end: endPosition
      }
    ],
    tooltip: {// 提示框
      trigger: 'axis',
      formatter: function (params: any) {
        let param = params[0]
        let str = ''
        str += '<strong>' + param.data[0].toFixed(2) + '~' + (param.data[0] + step).toFixed(2) + '</strong><br/>'
        if (param.seriesIndex == 1) {
          str += param.marker + '样本数(不含离群点)：  ' + param.data[1]
        } else if (param.seriesIndex == 2) {
          str += param.marker + '样本数(含离群点)：  ' + param.data[1]
        }
        str += '<br/>'
        return str
      }
    },
    legend: {// 图例
      data: ['拟合正态分布曲线', '实际分布(不含离群点)', '实际分布(含离群点)']
    },
    xAxis: {// x轴
      name: '取值分布',
      nameTextStyle: {
        align: 'left',
        fontSize: 14,
        fontFamily: 'Microsoft YaHei',
        fontWeight: 400,
        color: '#989DAA'
      },
      boundaryGap: false,
      type: 'value',
      data: message.xAxis,
      min: message.xAxis[0],
      max: message.xAxis[message.xAxis.length - 1]
    },
    yAxis: [
      {// y轴
        name: '频数',
        nameTextStyle: {
          align: 'right',
          fontSize: 14,
          fontFamily: 'Microsoft YaHei',
          fontWeight: 400,
          color: '#989DAA'
        },
        type: 'value',
        axisLabel: { formatter: format1 }
      },
      {
        show: false,
        type: 'value',
        axisLabel: { formatter: '{value} %' }
      }
    ],
    grid: [//
      {// 网格
        show: false,
        top: '15%',
        bottom: '10%',
        left: '5%',
        right: '12%'
      }
    ],
    series: seriesdata
  }
  barChart.setOption(option)
}
// 监听 message 变化，自动刷新图表
watch(
  () => props.message,
  () => {
    loading.value = true
    setTimeout(() => {
      initFailureBarVertical()
      loading.value = false
    }, 1000)
  },
  { deep: true, immediate: true }
)
// 组件挂载时初始化图表并监听窗口变化
onMounted(() => {
  setTimeout(() => {
    initFailureBarVertical()
    loading.value = false
  }, 1000)
  window.addEventListener('resize', resizeCharts)
})
// 组件卸载时销毁图表和事件监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  barChart?.dispose()
  barChart = null
})
</script>

<style lang="scss" scoped>
.my-title {
  font-weight: bold;
  font-size: 18px;
}
</style>