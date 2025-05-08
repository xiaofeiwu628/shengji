<template>
  <div>
    <text class="my-title" style='display: flex;align-items: flex-start;margin-left: 20px'>字段数值分布情况</text>
    <div style="width: 100%;" v-loading="loading">
      <div id="distributeMathBar" style="width: 100%;height: 55vh;"></div>
    </div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
export default {
  name: 'DistributeMathBar',
  description: '残差分布图',
  mixins: [],
  components: {},
  props: ['message'],
  data() {
    return {
      loading : true,
      barChart: null,
    }
  },
  //监听，解决第一次加载页面时无法渲染第一个echart图,和切换图例时，点击搜索按钮无法加载数据问题
  watch:{//监听数值变化
    message:{
      deep:true,//深度监听
      handler(newVal,oldVal){
        this.loading = true
        setTimeout(()=>{
          this.initFailureBarVertical()
          this.loading = false
        },1000) //刷新echarts图表
      }
    }
  },
  mounted() {
    setTimeout(()=>{
      this.initFailureBarVertical()
    },1000)
    window.addEventListener("resize", this.resizeCharts);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeCharts);
  },
  methods: {
    resizeCharts() {
      this.$nextTick(() => {
        this.barChart?.resize();
      });
    },
    initFailureBarVertical() {
      let multiple = Math.round(this.message.multiple)
      let step = this.message.xAxis[1]-this.message.xAxis[0]
      // for(i = 0;i<80;i++){
      //   if(this.message.distributeBardata[i][0]!==this.message.xAxis[i]){
      //     this.message.distributeBardata.slice(i,0,[this.message.xAxis[i],0])
      //   }
      // }
      //x轴最大最小前后范围
      this.message.xAxis[0] = parseFloat(parseFloat(this.message.xAxis[0]))
      this.message.xAxis[79] = parseFloat(parseFloat(this.message.linedata[79][0]))
      let dataRangeMinOP = this.message.xAxis[0]
      let dataRangeMaXOP = this.message.xAxis[-1]
      // console.log(this.message)

      //配置项，本身项目是可以动态在页面配置修改这些属性的，贴到这里用了默认值
      let opacityOption = 'off'
      let opacity = 0.5
      if (opacityOption == 'off') {
        opacity = 0
      }
      let endPositionOption = 'all'
      let endPositionPercentum = ''
      let endPosition
      if (endPositionOption == 'all') {
        endPosition = 100
      } else if (endPositionOption == 'third') {
        endPosition = 29
      } else {
        endPosition = endPositionPercentum
      }

      let standarDevRangeOfOne = {//一倍标准差
        low:this.message.avg-this.message.stdev,
        up:this.message.avg+this.message.stdev
      }
      let standarDevRangeOfTow = {//二倍标准差
        low:this.message.avg-2*this.message.stdev,
        up:this.message.avg+2*this.message.stdev
      }
      let standarDevRangeOfThree = {//三倍标准差
        low:this.message.avg-3*this.message.stdev,
        up:this.message.avg+3*this.message.stdev
      }
      // let xAverage = avg//平均值
      let heigh = 0;//离群点上界
      let low = 0;//离群点下界
      if(multiple == 1){
        heigh = standarDevRangeOfOne.up;
        low = standarDevRangeOfOne.low;
      }
      else if(multiple == 2){
        heigh = standarDevRangeOfTow.up;
        low = standarDevRangeOfTow.low;
      }
      else if(multiple == 3){
        heigh = standarDevRangeOfThree.up;
        low = standarDevRangeOfThree.low;
      }
      else {
    // 处理大于3的阈值情况，直接计算对应倍数的标准差范围
        heigh = this.message.avg + multiple * this.message.stdev;
        low = this.message.avg - multiple * this.message.stdev;
      }

      //判断柱状图是否超过警戒线
      function JudgeBar(name) {
        let value = parseFloat(name.toFixed(2));
        let lowvalue = Math.abs(value-low);//下界距离
        let heighvalue = Math.abs(value-heigh);//上界距离
        let threshold = step/3;//距离界限
        if(value>=heigh||value<=low){
          return true
        }
        else if(lowvalue<threshold || heighvalue<threshold){//边界处
          return true
        }
        return false
      }

      let barData = []//数值分布数据
      let barDataOutliers = []//包含离群点的数值分布数据
      for(var i=0;i<80;i++){
        if(JudgeBar(this.message.xAxis[i])){
          barData.push(null)
          barDataOutliers.push(this.message.distributeBardata[i])
        }
        else{
          barData.push(this.message.distributeBardata[i])
          barDataOutliers.push(null)
        }
      }

      let persents = 'on'
      let format1
      let format2
      if (persents == 'on') {
        format1 = '{value}'
        format2 = '{c} %'
      }
      let seriesdata = []
      let lineDataSet = {
        type: 'line',
        symbol: 'none', // 默认是空心圆（中间是白色的），改成实心圆 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none'
        smooth: false,
        yAxisIndex: 1,
        areaStyle: {
          opacity: opacity
        },
        tooltip: {
          trigger: 'axis',
          show: false,
        },
        data: this.message.linedata,  //正态分布的值
        name: '拟合正态分布曲线',
        itemStyle: {
          normal: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: '#FD723CFF' // 0% 处的颜色
                },
                {
                  offset: 0.45,
                  color: '#FD723CFF' // 45% 处的颜色
                },
                {
                  offset: 0.85,
                  color: '#FF5B82FF' // 85% 处的颜色
                },
                {
                  offset: 1,
                  color: '#FF5B82FF' // 100% 处的颜色
                }
              ],
              global: false, // 缺省为 false
            },
            label: {
              formatter: format2,
              show: false, //开启显示
              position: 'top', //在上方显示
              textStyle: { //数值样式
                fontSize: 16
              }
            },
            lineStyle:{
              type: "dotted",//虚线
            }
          }
        },
        markLine: {
          symbol: ['none'], // 箭头方向
          lineStyle: {
            type: "silent",
            color: "#67C23A",
          },
          itemStyle: {
            normal: {
              show: true,
              color: 'black'
            }
          },
          label: {
            show: true,
            type: 'value',
            formatter: function (params) {
              return params.data.name+' : '+params.data.value;
            },
            position: "end"
          },
          data : [
            {//竖线
              name: 'σ',
              xAxis: standarDevRangeOfOne.low,
              // 当 n 倍标准差在坐标轴外时，将其隐藏，否则它会默认显示在最小值部分，容易引起混淆
              lineStyle: {
                opacity: (dataRangeMinOP > standarDevRangeOfOne.low) ? 0 : 1
              },
              label: {
                show: !(dataRangeMinOP > standarDevRangeOfOne.low)
              }
            }, {
              name: 'σ',
              xAxis: standarDevRangeOfOne.up,
              lineStyle: {
                opacity: (dataRangeMaXOP < standarDevRangeOfOne.up) ? 0 : 1
              },
              label: {
                show: !(dataRangeMaXOP < standarDevRangeOfOne.up)
              }
            }, {
              name: '2σ',
              xAxis: standarDevRangeOfTow.low,
              lineStyle: {
                opacity: (dataRangeMinOP > standarDevRangeOfTow.low) ? 0 : 1
              },
              label: {
                show: !(dataRangeMinOP > standarDevRangeOfTow.low)
              }
            }, {
              name: '2σ',
              xAxis: standarDevRangeOfTow.up,
              lineStyle: {
                opacity: (dataRangeMaXOP < standarDevRangeOfTow.up) ? 0 : 1
              },
              label: {
                show: !(dataRangeMaXOP < standarDevRangeOfTow.up)
              }
            }, {
              name: '3σ',
              xAxis: standarDevRangeOfThree.low,
              lineStyle: {
                opacity: (dataRangeMinOP > standarDevRangeOfThree.low) ? 0 : 1
              },
              label: {
                show: !(dataRangeMinOP > standarDevRangeOfThree.low)
              }
            }, {
              name: '3σ',
              xAxis: standarDevRangeOfThree.up,
              lineStyle: {
                opacity: (dataRangeMaXOP < standarDevRangeOfThree.up) ? 0 : 1
              },
              label: {
                show: !(dataRangeMaXOP < standarDevRangeOfThree.up)
              }
            },
            {
              name: '平均值',
              // type: 'average',
              xAxis: this.message.avg,
              lineStyle: {
                color: '#337ecc'
              }
            }]
        },
      }
      let color1= {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: '#79c7f3FF' // 0% 处的颜色
          },
          {
            offset: 1,
            color: '#7E7CEB' // 100% 处的颜色
          }
        ],
        global: false // 缺省为 false
      }
      let color2= {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: '#f89898' // 0% 处的颜色
          },
          {
            offset: 1,
            color: '#F56C6C' // 100% 处的颜色
          }
        ],
        global: false // 缺省为 false
      }
      let barDataSet = {
        type: 'bar',
        smooth: true,
        yAxisIndex: 0,
        areaStyle: {
          opacity: opacity
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
        },
        data: barData,  //柱子的值
        name: '实际分布(不含离群点)',
        // barWidth : 7,//柱子宽度
        barGap: "-100%",//设置两个柱子重叠
        itemStyle: {
          normal: {
            color:color1,
            label: {
              formatter: format2,
              show: false, //开启显示
              position: 'top', //在上方显示
              textStyle: { //数值样式
                fontSize: 16
              }
            }
          }
        },
      }
      let barDataSetOutliers = {
        type: 'bar',
        smooth: true,
        yAxisIndex: 0,
        areaStyle: {
          opacity: opacity
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
        },
        data: barDataOutliers,  //柱子的值
        name: '实际分布(含离群点)',
        // barWidth : 7,//柱子宽度
        itemStyle: {
          normal: {
            color:color2,
            label: {
              formatter: format2,
              show: false, //开启显示
              position: 'top', //在上方显示
              textStyle: { //数值样式
                fontSize: 16
              }
            }
          }
        },
      }
      seriesdata.push(lineDataSet, barDataSet, barDataSetOutliers)
      let myChart = echarts.init(document.getElementById('distributeMathBar'))
      this.barChart = myChart
      let option = {
        type: 'scroll',
        title: {
          text: ''
        },
        //区域缩放
        dataZoom: [
          {
            type: 'inside',
            show: false,
            xAxisIndex: [0],
            start: 0,
            end: endPosition,
            borderColor: '#F5A9D0',
            backgroundColor: '#F5A9D0'
          },
          {
            show: false,
            type: 'slider',
            xAxisIndex: [0],
            start: 0,
            end: endPosition
          }
        ],
        tooltip: {
          trigger: 'axis',
          formatter:function (params){
            let param = params[0]
            let str = ''
            str += '<strong>'+param.data[0].toFixed(2)+'~'+(param.data[0]+step).toFixed(2)+'</strong>'+'<br/>'
            if(param.seriesIndex == 1){//不含离群点
              str += param.marker + '样本数(不含离群点)：  ' + param.data[1]
            }
            else if(param.seriesIndex == 2){//不含离群点
              str += param.marker + '样本数(含离群点)：  ' + param.data[1]
            }
            str += '<br/>'
            return str
          },
          axisPointer: {
            // type: 'shadow'
          },
        },
        legend: {
          data: ['拟合正态分布曲线', '实际分布(不含离群点)', '实际分布(含离群点)'],
        },
        xAxis: {
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
          data: this.message.xAxis,
          min: this.message.xAxis[0],
          max: this.message.xAxis[-1],
        },
        yAxis: [{
          name: '频数',
          nameTextStyle: {
            align: 'right',
            fontSize: 14,
            fontFamily: 'Microsoft YaHei',
            fontWeight: 400,
            color: '#989DAA'
          },
          type: 'value',
          axisLabel: {
            formatter: format1
          }
        }, {
          show: false,
          type: 'value',
          axisLabel: {
            formatter: '{value} %'
          }
        }],
        grid: [{
          show: false,
          top: '15%',
          bottom: '10%',
          left: '5%',
          right: '12%'
        }],
        series: seriesdata
      }
      myChart.setOption(option)
    },
  }

}
</script>
<style lang="scss" scoped>


</style>

