<template>
  <div
      ref="myChart"
      id="myChart"
      :style="{ width: '55vw', height: '55vh' }"
  ></div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
export default {
  name:'MyChart',
  props: ['message'],
  watch:{//监听数值变化
    message:{
      deep:true,//深度监听
      handler(newVal,oldVal){
        this.initChart();  //刷新echarts图表
      }
    }
  },
  data() {
    return {
      chartData:{
        fName: '',//字段名
        GraphType: '',//图表类型
        ydata: [],//折线图与直方图y轴数据
        xdata: [],//直方图x轴数据
        piedata: [],//饼图数据
        myChart0: null,
      }
    }
  },
  methods:{
    resizeChart(){
      this.$nextTick(()=>{
        this.myChart0?.resize();
      })
    },
    initChart() {
      let option
      if (this.message.GraphType == 'LineChart'){//折线图
        option = {
          title: {
            text: '字段名：'+this.message.fName,
            x: 'center',
          },
          tooltip: {},
          xAxis: {
            type: 'category',
            interval:1, // 步长
            min:0, // 起始
            max:this.message.ydata.length // 终止
          },
          dataZoom:[{//进度条
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            left: '9%',
            bottom: 0,
            start: 30,
            end: 70 //初始化滚动条
          },
            {
              type: "inside",  // 支持内部鼠标滚动平移
              start: 0,
              end: 5,
              zoomOnMouseWheel: true,  // 滚轮缩放
              moveOnMouseWheel: false, // 滚轮平移
              moveOnMouseMove: true  // 鼠标移动能触发数据窗口平移
            }],
          yAxis:{
            type: 'value',
            min: (value) => (value.min),
            max: (value) => (value.max),
          },
          series:[{
            data: this.message.ydata,
            type: 'line',
            large: true,
            largeThreshold: 500,
            smooth: true
          }]
        }
      }
      else if (this.message.GraphType == 'Histogram'){//直方图
        option = {
          title: {
            text: '字段名：'+this.message.fName,
            x: 'center',
          },
          tooltip: {
            formatter: function(param) {
              var value = param;
              return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 16px;margin-bottom: 3px;"> '
                  +'取值为'+ value.name + '的数据共有' + value.data + '条'+'</div>';
            }
          },
          xAxis: {
            type: 'category',
            data: this.message.xdata,
            name: '取值',
            nameTextStyle:{//x坐标轴名称的字体样式
              fontSize:16,
              padding:10
            },
            axisLabel: {
              // interval: 0,//强制X轴所有字段都显示
              // rotate:-20,//旋转度数
              formatter: function (params) {
                let newParamsName = ''
                const paramsNameNumber = params.length
                const provideNumber = 10 // 单行显示文字个数
                const rowNumber = Math.ceil(paramsNameNumber / provideNumber)
                if (paramsNameNumber > provideNumber) {
                  for (let p = 0; p < rowNumber; p++) {
                    var tempStr = ''
                    var start = p * provideNumber
                    var end = start + provideNumber
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
          yAxis:{
            type: 'value',
            name: '记录数量',
            nameTextStyle:{//y坐标轴名称的字体样式
              fontSize:16,
              padding:10
            }
          },
          series:[
            {
              data: this.message.ydata,
              type: 'bar',
              large: true,
              largeThreshold: 500,
              itemStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
                    offset: 0,
                    color: "#79c7f3FF" // 0% 处的颜色
                  }, {
                    offset: 1,
                    color: "#7E7CEB" // 100% 处的颜色
                  }], false)
                }
              },
            }
          ]
        }
      }
      else if (this.message.GraphType == 'PieChart') {//饼形图
        option = {
          title: {
            text: '字段名：'+this.message.fName ,
            left: 'center',
            top: 0,
          },
          tooltip: {
            trigger: 'item',
            /*返回需要的信息*/
            formatter: function(param) {
              var value = param.data;
              return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 16px;margin-bottom: 3px;"> '
                  +'取值为'+ value.name + '的数据共有' + value.value + '条'+'</div>';
            }
          },
          legend: {
            orient: 'vertical',
            type:'scroll',
            left: 'right',
            bottom:18,
          },
          series: {
            data: this.message.piedata,
            type: 'pie',
            large: true,
            largeThreshold: 500,
            radius: '50%',
            center:'55%',
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        }
      }
      else if (this.message.GraphType == 'HistogramService'){//直方图在线服务
        option = {
          title: {
            text: '服务名称:' + this.message.fName,
            x: 'center',
          },
          tooltip: {
            formatter: function(param) {
              var value = param;
              return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 16px;margin-bottom: 3px;"> '
                  +'时间分布为'+ value.name + '的数据共有' + value.data + '条'+'</div>';
            }
          },
          xAxis: {
            type: 'category',
            data: this.message.xdata,
            name: '时间分布',
            nameTextStyle:{//x坐标轴名称的字体样式
              fontSize:14,
              padding:10
            },
            axisLabel: {
              // interval: 0,//强制X轴所有字段都显示
              // rotate:-20,//旋转度数
              formatter: function (params) {
                var newParamsName = ''
                const paramsNameNumber = params.length
                const provideNumber = 10 // 单行显示文字个数
                const rowNumber = Math.ceil(paramsNameNumber / provideNumber)
                if (paramsNameNumber > provideNumber) {
                  for (let p = 0; p < rowNumber; p++) {
                    var tempStr = ''
                    var start = p * provideNumber
                    var end = start + provideNumber
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
          yAxis:{
            type: 'value',
            name: '访问次数',
            nameTextStyle:{//y坐标轴名称的字体样式
              fontSize:16,
              padding:10
            }
          },
          series:[
            {
              data: this.message.ydata,
              type: 'bar',
              large: true,
              largeThreshold: 500,
              itemStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
                    offset: 0,
                    color: "#79c7f3FF" // 0% 处的颜色
                  }, {
                    offset: 1,
                    color: "#7E7CEB" // 100% 处的颜色
                  }], false)
                }
              },
            }
          ]
        }
      }
      let myChart = echarts.init(document.getElementById('myChart'), null, { renderer: 'svg' });
      this.myChart0 = myChart
      myChart.clear();
      myChart.setOption(option)
    }
  },
  mounted() {
    this.initChart();
    window.addEventListener('resize',this.resizeChart);
  },
  beforeDestroy(){
    window.removeEventListener('resize',this.resizeChart);
  },
};
</script>
