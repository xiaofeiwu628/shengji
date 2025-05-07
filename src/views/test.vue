<template>
<!--  <div id="myChart" class="myChart" :style="{width: '100%', height: '100vh'}"/>-->
<div style="background-color: #505458;width: 3000px;height: 2000px">
  <div style="width: 1000px;height: 50px;background-color: white;border: black;margin-left: 15px;margin-top: 10px">
    <span style="color: black">气象数据</span>
  </div>
</div>


</template>


<script>
// import * as echarts from 'echarts'

export default {
  name: "test",
  data() {
    return {
      // form: {
      //   table_name: "exe_data",
      //   column: "seeing"
      // }
    }
  },
  mounted() {
    // this.makeChart()
  },
  methods: {
    // 数据遍历转换（主要是计算多重关系所显示的不同弧度值）
    changeData() {
      var data, linksData
      data = [{name: 'iloprost'}, {name: 'imatinib'}, {name: 'indacaterol'}]
      for (var i = 0; i < 100; i++) {
        data.push({
          name: 'iloprost' + i
        })
      }
      linksData = [{
        source: 'iloprost',
        target: 'imatinib',
        relationshipName: '0.26'
      }, {
        source: 'iloprost',
        target: 'imipramine',
        relationshipName: '0.95'
      }, {
        source: 'imatinib',
        target: 'indacaterol',
        relationshipName: '0.36'
      }, {
        source: 'iloprost1',
        target: 'indacaterol',
        relationshipName: '0.98'
      }, {
        source: 'iloprost2',
        target: 'indacaterol',
        relationshipName: '0.85'
      }, {
        target: 'iloprost',
        source: 'indacaterol',
        relationshipName: '0.75',
      }, {
        target: 'iloprost1',
        source: 'imatinib',
        relationshipName: '0.76',
      }]

      var arr = []
      for (const i in linksData) {
        linksData[i].count = 0
        arr.push(linksData[i])
      }
      for (const i in linksData) {
        for (const j in arr) {
          if ((arr[j].count === 0) && ((arr[j].source === linksData[i].source) && (arr[j].target === linksData[i].target)) || (arr[j].target === linksData[i].source) && (arr[j].source === linksData[i].target)) {
            ++linksData[i].count
          }
        }
      }
      for (const i in linksData) {
        linksData[i].label = {
          show: true,
          formatter: function (x) {
            return x.data.relationshipName // 自定义线条之间的关系名称
          }
        }
        linksData[i].lineStyle = {
          curveness: (linksData[i].count - 1) * 0.2 // 线条弧度
        }
      }
      return {
        data, linksData
      }
    },
    makeChart() {
      var myChart = echarts.init(document.getElementById('myChart'))
      var list = this.changeData()
      var data = list.data
      var linksData = list.linksData
      var option = {
        backgroundColor: '#eeeeee', // 设置背景颜色
        title: {
          text: '人物关系图',
          top: 12,
          left: 12,
          textStyle: {
            fontSize: 14,
            color: '#444444'
          }
        },
        tooltip: {
          trigger: 'none'
        }, // 提示框
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'graph',
            layout: 'force',
            symbolSize: 50, // 倘若该属性不在link里，则其表示节点的大小；否则即为线两端标记的大小
            roam: true, // 鼠标缩放功能
            label: {
              show: true // 是否显示标签
            },
            focusNodeAdjacency: true, // 鼠标移到节点上时突出显示结点以及邻节点和边
            edgeSymbol: ['circle', 'circle'], // 关系两边的展现形式，也即图中线两端的展现形式。arrow为箭头
            edgeSymbolSize: [6, 6], // 设置两边箭头大小
            draggable: true,
            edgeLabel: {
              fontSize: 14 // 关系（也即线）上的标签字体大小
            },
            force: {
              repulsion: 400, // 节点之间的斥力因子值
              edgeLength: 170 // 两个节点之间的距离
            },
            data: data,
            links: linksData,
            lineStyle: {
              opacity: 0.9,
              width: 2,
              color: 'blue' // 设置线条颜色 8ab7bd
              // curveness: 0 // 设置线条的弧度
            },
            itemStyle: {
              color: '#61a0a8',
              fontSize: 12,
              borderWidth: 1,
              borderColor: '#ffffff',
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 8
            }
          }
        ]
      }

      myChart.setOption(option, true)
      setTimeout(function () {
        window.onresize = function () {
          myChart.resize()
        }
      }, 200)
    }

  }
}
</script>

<style scoped>

</style>
