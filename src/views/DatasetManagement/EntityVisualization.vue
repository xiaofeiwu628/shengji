<template>
  <div>
    <div style='margin: 20px 0 0 2%'>
      <el-breadcrumb separator-icon='ArrowRight'>
        <el-breadcrumb-item :to="{ path: '/datascreen' }">数据集管理</el-breadcrumb-item>
        <el-breadcrumb-item
          :to="{
            path: '/entityView',
            query: { datasetId: dataInfo.datasetId, tableId: dataInfo.tableId },
          }"
        >数据表概览
        </el-breadcrumb-item>
        <el-breadcrumb-item>数据可视化</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-card style='margin: 20px; min-height: 80vh'>
      <div style='padding: 30px 0 0 20px'>
        <div class='task-title-div'></div>
        <span class='task-title-name' style='width: 80px'>数据可视化</span>
        <el-tooltip
          style='width: 100px'
          effect='light'
          content="去重标签实体数仅对某标签下的同一实体统计一次。如LOC标签下有两个'北京'，去重前和去重后LOC统计数分别为2和1。"
          placement='right-start'
        >
          <el-button type='primary' icon='QuestionFilled' circle link></el-button>
        </el-tooltip>
      </div>
      <div style='display: flex' ref='chartsRef'>
        <div>
          <div style='height: 28vh; width: 50vw; margin-top: 4vh' ref='tagBarchartRef'></div>
          <div style='height: 28vh; width: 50vw; margin-top: 4vh' ref='tagDedupeBarchartRef'></div>
        </div>
        <div style='height: 60vh; width: 50vw; margin-top: 4vh' ref='wordCloudRef'></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import * as echarts from "echarts";
import "echarts-wordcloud";
import { useRouter } from "vue-router/dist/vue-router";
import request from "@/utils/request";
import { ElLoading, ElMessage } from "element-plus";
// 路由器
const router = useRouter();
// 数据表信息
let dataInfo = reactive({
  tableId: "",
  datasetId: "",
});
// 包含所有图表的div
let chartsRef = ref();
// 标签柱状图Dom
let tagBarchartRef = ref();
// 标签去重柱状图Dom
let tagDedupeBarchartRef = ref();
// 词云Dom
let wordCloudRef = ref();
// 标签柱状图
let tagBarchart = ref();
// 标签去重柱状图
let tagDedupeBarchart = ref();
// 词云
let wordCloud = ref();
// 标签列表
let tagList = ref([]);
// 去重后的标签列表
let tagDedupeList = ref([]);
// 标签实体列表
let tagEntityList = ref([]);
// 动画加载实例
let loadingInstance = ref();
// 挂载
onMounted(async () => {
  openChartsContainerLoading();
  dataInfo.tableId = router.currentRoute.value.query.tableId;
  dataInfo.datasetId = router.currentRoute.value.query.datasetId;
  await getTagList();
  await getTagDedupeList();
  initChart();
  // 监听窗口大小变化，改变图表大小
  window.addEventListener("resize", debouncedResizeCharts);
  loadingInstance.close();
});
// 开启表格容器加载动画
const openChartsContainerLoading = () => {
  loadingInstance = ElLoading.service({
    target: chartsRef.value,
    lock: true,
    text: "Loading",
    background: "rgba(255,255,255,0.7)",
  });
};
// 防抖，避免用户拖拽浏览器改变页面大小频繁渲染页面
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
// 调整chart大小为响应式，跟随浏览器窗口大小变化
const resizeCharts = () => {
  tagBarchart && tagBarchart.resize();
  tagDedupeBarchart && tagDedupeBarchart.resize();
  wordCloud && wordCloud.resize();
};
// 设置100毫秒延迟，当浏览器窗口大小固定后100毫秒以后再去渲染
const debouncedResizeCharts = debounce(resizeCharts, 100);
// 获取标签列表
const getTagList = async () => {
  await request
    .get("/jsonDetail/getTagList", {
      params: {
        datasetId: dataInfo.datasetId,
        tableId: dataInfo.tableId,
      },
    })
    .then(res => {
      if (res.code === "0") {
        tagList.value = res.data;
      } else {
        ElMessage({
          type: "error",
          message: res.msg,
          offset: 60,
        });
      }
    });
};
// 获取去重后的列表
const getTagDedupeList = async () => {
  await request
    .get("/jsonDetail/getTagDedupeList", {
      params: {
        datasetId: dataInfo.datasetId,
        tableId: dataInfo.tableId,
      },
    })
    .then(res => {
      if (res.code === "0") {
        tagDedupeList.value = res.data;
      } else {
        ElMessage({
          type: "error",
          message: res.msg,
          offset: 60,
        });
      }
    });
};
// 获取标签实体列表
const getTagEntityList = async tagName => {
  await request
    .get("/jsonDetail/getTagEntityList", {
      params: {
        datasetId: dataInfo.datasetId,
        tableId: dataInfo.tableId,
        tagName: tagName,
      },
    })
    .then(res => {
      if (res.code === "0") {
        tagEntityList.value = res.data;
      } else {
        ElMessage({
          type: "error",
          message: res.msg,
          offset: 60,
        });
      }
    });
};
// 设置词云
const setWordCloud = async params => {
  // 改变点击柱子的颜色
  if (params.componentType === "series" && params.seriesType === "bar") {
    let tagBarOption = tagBarchart.getOption();
    let tagDedupeBarOption = tagDedupeBarchart.getOption();
    const clickedColor = "#FFA500";
    const defaultColor1 = "#3996ef";
    const defaultColor2 = "#0ac6d7";
    if (params.dataIndex === tagBarOption.lastClickedIndex) {
      return;
    } else {
      tagBarOption.series[0].itemStyle.color = p => {
        return p.dataIndex === params.dataIndex ? clickedColor : defaultColor1;
      };
      tagDedupeBarOption.series[0].itemStyle.color = p => {
        return p.dataIndex === params.dataIndex ? clickedColor : defaultColor2;
      };
      tagBarOption.lastClickedIndex = params.dataIndex;
      tagDedupeBarOption.lastClickedIndex = params.dataIndex;
      tagBarchart.setOption(tagBarOption);
      tagDedupeBarchart.setOption(tagDedupeBarOption);
    }
  }
  await getTagEntityList(params.name);
  wordCloud.clear();
  let wordCloudOption = {
    title: {
      text: "词云",
      left: "center",
      textStyle: {
        color: "#2d7ccb",
        fontSize: 16,
      },
    },
    tooltip: {
      show: true,
      formatter: function(params) {
        return `内容：${params.data.name}<br/>数目：${params.data.value}`;
      },
    },
    series: [
      {
        type: "wordCloud",
        shape: "circle",
        keepAspect: false,
        left: "center",
        top: 30,
        width: "100%",
        height: "90%",
        right: null,
        bottom: null,
        sizeRange: [12, 40],
        rotationRange: [-90, 90],
        rotationStep: 45,
        gridSize: 8,
        drawOutOfBound: false,
        layoutAnimation: true,
        textStyle: {
          fontFamily: "sans-serif",
          fontWeight: "bold",
          color: function() {
            return (
              "rgb(" +
              [
                Math.round(100 + Math.random() * 150),
                Math.round(100 + Math.random() * 150),
                Math.round(100 + Math.random() * 150),
              ].join(",") +
              ")"
            );
          },
        },
        emphasis: {
          textStyle: {
            textShadowBlur: 1,
            textShadowColor: "#333",
          },
        },
        //data属性中的value值却大，权重就却大，展示字体就却大
        data: tagEntityList.value.slice(0, 70).map(item => {
          return {
            name: item.entity,
            value: item.count,
          };
        }),
      },
    ],
  };
  wordCloud.setOption(wordCloudOption);
};
// 初始化所有图表
const initChart = () => {
  let tagBarOption = {
    title: {
      text: "标签实体总数",
      left: "center",
      textStyle: {
        color: "#2d7ccb",
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "2%",
      right: "10%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        name: "标签",
        data: tagList.value.map(item => item.tag),
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          fontSize: 10,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "数量",
      },
    ],
    series: [
      {
        name: "数量",
        type: "bar",
        barWidth: "60%",
        data: tagList.value.map(item => item.count),
        itemStyle: {
          color: "#3996ef",
        },
      },
    ],
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
      },
    ],
  };
  let tagDedupeBarOption = {
    title: {
      text: "去重后标签实体数量",
      left: "center",
      textStyle: {
        color: "#2d7ccb",
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "10%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        name: "标签",
        data: tagDedupeList.value.map(item => item.tag),
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          fontSize: 10,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "数量",
      },
    ],
    series: [
      {
        name: "数量",
        type: "bar",
        barWidth: "60%",
        data: tagDedupeList.value.map(item => item.count),
        itemStyle: {
          color: "#0ac6d7",
        },
      },
    ],
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
      },
    ],
  };
  let wordCloudOption = {
    // 记录上次点击后的柱子
    lastClickedIndex: -1,
    title: {
      text: "词云",
      left: "center",
      textStyle: {
        color: "#2d7ccb",
        fontSize: 16,
      },
    },
    graphic: {
      type: "text",
      left: "center",
      top: "middle",
      style: {
        text: "点击标签实体查看实体词云",
        textAlign: "center",
        fill: "#999", // 提示文本颜色
        fontSize: 16,
      },
    },
  };

  // 初始化图表
  tagBarchart = echarts.init(tagBarchartRef.value);
  tagDedupeBarchart = echarts.init(tagDedupeBarchartRef.value);
  wordCloud = echarts.init(wordCloudRef.value);
  tagBarchart.setOption(tagBarOption);
  tagDedupeBarchart.setOption(tagDedupeBarOption);
  wordCloud.setOption(wordCloudOption);
  // 给标签柱状图绑定点击事件，用户点击后渲染对应标签下的词云
  tagBarchart.on("click", setWordCloud);
  tagDedupeBarchart.on("click", setWordCloud);
};
// 卸载
onUnmounted(() => {
  window.removeEventListener("resize", debouncedResizeCharts);
});
</script>

<style scoped></style>