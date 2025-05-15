<template>
  <div class="entity-visualization-container">
    <!-- 顶部导航区域 -->
    <div class="header-area">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/datascreen' }" class="tech-breadcrumb">
          <el-icon><Files /></el-icon>
          数据集管理
        </el-breadcrumb-item>
        <el-breadcrumb-item 
          :to="{
            path: '/entityView',
            query: { datasetId: dataInfo.datasetId, tableId: dataInfo.tableId },
          }"
          class="tech-breadcrumb"
        >
          <el-icon><Grid /></el-icon>
          数据表概览
        </el-breadcrumb-item>
        <el-breadcrumb-item class="tech-breadcrumb">
          <el-icon><PieChart /></el-icon>
          数据可视化
        </el-breadcrumb-item>
      </el-breadcrumb>
      
      <!-- 辅助信息卡片 -->
      <div class="feature-info">
        <el-tooltip
          effect="light"
          placement="bottom"
          popper-class="custom-tooltip"
          :show-after="100"
          :content="'去重标签实体数仅对某标签下的同一实体统计一次。\n例如：LOC标签下有两个\'北京\'，去重前和去重后LOC统计数分别为2和1。'"
        >
          <div class="info-card">
            <el-icon><InfoFilled /></el-icon>
            <span>什么是去重标签?</span>
          </div>
        </el-tooltip>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="content-panel" ref="chartsRef" v-loading="loading" element-loading-text="图表数据加载中...">
      <div class="visualization-layout">
        <!-- 左侧柱状图区域 -->
        <div class="charts-column left-charts">
          <!-- 标签实体总数柱状图 -->
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon><Histogram /></el-icon>
                标签实体总数
              </h3>
              <div class="chart-desc">
                展示各类标签包含的实体总数量
              </div>
            </div>
            <div class="chart-container" ref="tagBarchartRef"></div>
          </div>
          
          <!-- 去重标签实体数量柱状图 -->
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon><DataAnalysis /></el-icon>
                去重后标签实体数量
              </h3>
              <div class="chart-desc">
                展示去重后各类标签的实体数量
              </div>
            </div>
            <div class="chart-container" ref="tagDedupeBarchartRef"></div>
          </div>
        </div>
        
        <!-- 右侧词云区域 -->
        <div class="charts-column right-charts">
          <div class="chart-card wordcloud-card">
            <div class="chart-header">
              <h3 class="chart-title">
                <el-icon><Connection /></el-icon>
                实体词云可视化
              </h3>
              <div class="chart-desc">
                点击左侧柱状图查看对应标签的实体词云
              </div>
            </div>
            <div class="chart-container wordcloud-container" ref="wordCloudRef"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import * as echarts from "echarts";
import "echarts-wordcloud";
import { useRouter } from "vue-router/dist/vue-router";
import request from "@/utils/request";
import { ElMessage } from "element-plus";
import { 
  ArrowRight, Files, Grid, PieChart, InfoFilled, 
  Histogram, DataAnalysis, Connection 
} from "@element-plus/icons-vue";

// 路由器
const router = useRouter();

// 数据表信息
let dataInfo = reactive({
  tableId: "",
  datasetId: "",
});

// 图表引用
let chartsRef = ref();
let tagBarchartRef = ref();
let tagDedupeBarchartRef = ref();
let wordCloudRef = ref();

// 图表实例
let tagBarchart = ref();
let tagDedupeBarchart = ref();
let wordCloud = ref();

// 数据源
let tagList = ref([]);
let tagDedupeList = ref([]);
let tagEntityList = ref([]);

// 加载状态
let loading = ref(false);

// 挂载时初始化
onMounted(async () => {
  loading.value = true;
  
  dataInfo.tableId = router.currentRoute.value.query.tableId;
  dataInfo.datasetId = router.currentRoute.value.query.datasetId;
  
  try {
    await Promise.all([getTagList(), getTagDedupeList()]);
    initChart();
    
    // 监听窗口大小变化，调整图表大小
    window.addEventListener("resize", debouncedResizeCharts);
    
    ElMessage({
      type: "success",
      message: "数据可视化图表加载成功",
      offset: 60,
    });
  } catch (error) {
    ElMessage({
      type: "error",
      message: "图表数据加载失败，请稍后重试",
      offset: 60,
    });
  } finally {
    loading.value = false;
  }
});

// 防抖处理
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// 调整图表大小
const resizeCharts = () => {
  tagBarchart && tagBarchart.resize();
  tagDedupeBarchart && tagDedupeBarchart.resize();
  wordCloud && wordCloud.resize();
};

// 设置防抖的图表调整
const debouncedResizeCharts = debounce(resizeCharts, 200);

// 获取标签列表
const getTagList = async () => {
  try {
    const res = await request.get("/jsonDetail/getTagList", {
      params: {
        datasetId: dataInfo.datasetId,
        tableId: dataInfo.tableId,
      },
    });
    
    if (res.code === "0") {
      tagList.value = res.data;
    } else {
      ElMessage({
        type: "error",
        message: res.msg || "获取标签数据失败",
        offset: 60,
      });
    }
  } catch (error) {
    console.error("获取标签列表失败:", error);
    throw error;
  }
};

// 获取去重后的标签列表
const getTagDedupeList = async () => {
  try {
    const res = await request.get("/jsonDetail/getTagDedupeList", {
      params: {
        datasetId: dataInfo.datasetId,
        tableId: dataInfo.tableId,
      },
    });
    
    if (res.code === "0") {
      tagDedupeList.value = res.data;
    } else {
      ElMessage({
        type: "error",
        message: res.msg || "获取去重标签数据失败",
        offset: 60,
      });
    }
  } catch (error) {
    console.error("获取去重标签列表失败:", error);
    throw error;
  }
};

// 获取标签实体列表
const getTagEntityList = async tagName => {
  loading.value = true;
  
  try {
    const res = await request.get("/jsonDetail/getTagEntityList", {
      params: {
        datasetId: dataInfo.datasetId,
        tableId: dataInfo.tableId,
        tagName: tagName,
      },
    });
    
    if (res.code === "0") {
      tagEntityList.value = res.data;
      return res.data;
    } else {
      ElMessage({
        type: "error",
        message: res.msg || "获取标签实体数据失败",
        offset: 60,
      });
      return [];
    }
  } catch (error) {
    console.error("获取标签实体列表失败:", error);
    ElMessage({
      type: "error",
      message: "获取标签实体列表失败，请稍后重试",
      offset: 60,
    });
    return [];
  } finally {
    loading.value = false;
  }
};

// 设置词云
const setWordCloud = async params => {
  if (params.componentType === "series" && params.seriesType === "bar") {
    // 高亮选中的柱状图
    let tagBarOption = tagBarchart.getOption();
    let tagDedupeBarOption = tagDedupeBarchart.getOption();
    
    const highlightColor = "#e6a23c"; // 橙色高亮
    const defaultColor1 = "#1a2942"; // 主题蓝色
    const defaultColor2 = "#4c75a3"; // 浅蓝色
    
    if (params.dataIndex === tagBarOption.lastClickedIndex) {
      return;
    } else {
      // 更新高亮状态
      tagBarOption.series[0].itemStyle.color = p => {
        return p.dataIndex === params.dataIndex ? highlightColor : defaultColor1;
      };
      tagDedupeBarOption.series[0].itemStyle.color = p => {
        return p.dataIndex === params.dataIndex ? highlightColor : defaultColor2;
      };
      
      // 记录点击位置
      tagBarOption.lastClickedIndex = params.dataIndex;
      tagDedupeBarOption.lastClickedIndex = params.dataIndex;
      
      // 更新图表
      tagBarchart.setOption(tagBarOption);
      tagDedupeBarchart.setOption(tagDedupeBarOption);
    }
  }
  
  // 获取并生成词云
  const entityData = await getTagEntityList(params.name);
  
  // 清空当前词云
  wordCloud.clear();
  
  // 创建新词云
  let wordCloudOption = {
    title: {
      text: `"${params.name}" 标签实体词云`,
      left: "center",
      top: 10,
      textStyle: {
        color: "#1a2942",
        fontSize: 16,
        fontWeight: 600,
      },
    },
    tooltip: {
      show: true,
      backgroundColor: 'rgba(50, 50, 50, 0.8)',
      borderColor: '#555',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 14
      },
      formatter: function(params) {
        return `<div style="padding: 4px 8px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${params.data.name}</div>
                  <div>出现次数：${params.data.value}</div>
                </div>`;
      },
    },
    series: [{
      type: "wordCloud",
      shape: "circle",
      keepAspect: true,
      left: "center",
      top: 50,
      width: "95%",
      height: "85%",
      sizeRange: [14, 48],
      rotationRange: [-45, 45],
      rotationStep: 15,
      gridSize: 10,
      drawOutOfBound: false,
      layoutAnimation: false, // 禁用布局动画
      textStyle: {
        fontFamily: "Microsoft YaHei, Arial, sans-serif",
        fontWeight: "bold",
        color: function() {
          const colors = [
            '#1a2942', '#4c75a3', '#3996ef', '#0ac6d7', '#51a8dd', 
            '#066e8e', '#1e90ff', '#0080ff', '#5cb3cc', '#2b5f75'
          ];
          return colors[Math.floor(Math.random() * colors.length)];
        },
      },
      emphasis: {
        textStyle: {
          // 移除 fontSize: 'larger'
          fontWeight: 'bolder', // 加粗显示
          textShadowBlur: 8,    // 增加阴影清晰度
          textShadowColor: "rgba(0, 0, 0, 0.5)", // 更强的阴影
          color: '#e6a23c' // 悬停时变为醒目的橙色
        },
      },
      data: entityData.slice(0, 70).map(item => {
        return {
          name: item.entity,
          value: item.count,
        };
      }),
    }],

  };
  
  wordCloud.setOption(wordCloudOption);
};

// 初始化所有图表
const initChart = () => {
  // 标签实体柱状图配置
  let tagBarOption = {
    title: {
      text: "标签实体分布统计",
      left: "center",
      top: 10,
      textStyle: {
        color: "#1a2942",
        fontSize: 16,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: 'rgba(50, 50, 50, 0.8)',
      borderColor: '#555',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 14
      },
    },
    grid: {
      left: "8%",
      right: "8%",
      bottom: "15%",
      top: "20%",
      containLabel: true,
    },
    xAxis: [{
      type: "category",
      name: "标签类型",
      nameLocation: "middle",
      nameGap: 35,
      nameTextStyle: {
        color: "#666",
        fontSize: 13,
        fontWeight: "bold"
      },
      data: tagList.value.map(item => item.tag),
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        fontSize: 13,
        interval: 0,
        rotate: tagList.value.length > 8 ? 45 : 0,
      },
      axisLine: {
        lineStyle: {
          color: "#999"
        }
      },
    }],
    yAxis: [{
      type: "value",
      name: "实体数量",
      nameLocation: "middle",
      nameGap: 40,
      nameTextStyle: {
        color: "#666",
        fontSize: 13,
        fontWeight: "bold"
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#999"
        }
      },
      axisTick: {
        show: true
      },
      splitLine: {
        lineStyle: {
          color: "#eee",
          type: "dashed"
        }
      }
    }],
    series: [{
      name: "实体总数",
      type: "bar",
      barWidth: "50%",
      data: tagList.value.map(item => item.count),
      itemStyle: {
        color: "#1a2942",
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: "#3996ef"
        }
      },
      label: {
        show: true,
        position: "top",
        fontSize: 12,
        fontWeight: "bold"
      }
    }],
    dataZoom: [{
      type: "slider",
      show: tagList.value.length > 8,
      xAxisIndex: [0],
      start: 0,
      end: 100,
      height: 20,
      bottom: 0,
      handleSize: '110%',
      handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
      handleStyle: {
        color: '#1a2942',
        shadowBlur: 3,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      textStyle: {
        color: '#1a2942'
      },
      borderColor: '#ccc'
    }, {
      type: "inside",
      xAxisIndex: [0],
      start: 0,
      end: 100,
      zoomLock: true,
    }],
  };
  
  // 去重标签柱状图配置
  let tagDedupeBarOption = {
    title: {
      text: "去重后标签实体分布",
      left: "center",
      top: 10,
      textStyle: {
        color: "#1a2942",
        fontSize: 16,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: 'rgba(50, 50, 50, 0.8)',
      borderColor: '#555',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 14
      },
    },
    grid: {
      left: "8%",
      right: "8%",
      bottom: "15%",
      top: "20%",
      containLabel: true,
    },
    xAxis: [{
      type: "category",
      name: "标签类型",
      nameLocation: "middle",
      nameGap: 35,
      nameTextStyle: {
        color: "#666",
        fontSize: 13,
        fontWeight: "bold"
      },
      data: tagDedupeList.value.map(item => item.tag),
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        fontSize: 13,
        interval: 0,
        rotate: tagDedupeList.value.length > 8 ? 45 : 0,
      },
      axisLine: {
        lineStyle: {
          color: "#999"
        }
      },
    }],
    yAxis: [{
      type: "value",
      name: "实体数量(去重)",
      nameLocation: "middle",
      nameGap: 45,
      nameTextStyle: {
        color: "#666",
        fontSize: 13,
        fontWeight: "bold"
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#999"
        }
      },
      axisTick: {
        show: true
      },
      splitLine: {
        lineStyle: {
          color: "#eee",
          type: "dashed"
        }
      }
    }],
    series: [{
      name: "去重实体数",
      type: "bar",
      barWidth: "50%",
      data: tagDedupeList.value.map(item => item.count),
      itemStyle: {
        color: "#4c75a3",
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: "#0ac6d7"
        }
      },
      label: {
        show: true,
        position: "top",
        fontSize: 12,
        fontWeight: "bold"
      }
    }],
    dataZoom: [{
      type: "slider",
      show: tagDedupeList.value.length > 8,
      xAxisIndex: [0],
      start: 0,
      end: 100,
      height: 20,
      bottom: 0,
      handleSize: '110%',
      handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
      handleStyle: {
        color: '#1a2942',
        shadowBlur: 3,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      textStyle: {
        color: '#1a2942'
      },
      borderColor: '#ccc'
    }, {
      type: "inside",
      xAxisIndex: [0],
      start: 0,
      end: 100,
      zoomLock: true,
    }],
  };
  
  // 词云初始配置
  let wordCloudOption = {
    lastClickedIndex: -1,
    title: {
      text: "实体词云",
      left: "center",
      top: 10,
      textStyle: {
        color: "#1a2942",
        fontSize: 16,
        fontWeight: 600,
      },
    },
    graphic: {
      type: "text",
      left: "center",
      top: "middle",
      style: {
        text: "点击左侧柱状图查看对应标签的实体词云",
        textAlign: "center",
        fill: "#666",
        fontSize: 16,
        fontWeight: 500,
      },
    },
  };

  // 初始化图表实例
  tagBarchart = echarts.init(tagBarchartRef.value);
  tagDedupeBarchart = echarts.init(tagDedupeBarchartRef.value);
  wordCloud = echarts.init(wordCloudRef.value);
  
  // 设置图表选项
  tagBarchart.setOption(tagBarOption);
  tagDedupeBarchart.setOption(tagDedupeBarOption);
  wordCloud.setOption(wordCloudOption);
  
  // 绑定点击事件
  tagBarchart.on("click", setWordCloud);
  tagDedupeBarchart.on("click", setWordCloud);
};

// 组件卸载清理
onUnmounted(() => {
  window.removeEventListener("resize", debouncedResizeCharts);
  
  // 释放图表实例
  if (tagBarchart) {
    tagBarchart.dispose();
    tagBarchart = null;
  }
  
  if (tagDedupeBarchart) {
    tagDedupeBarchart.dispose();
    tagDedupeBarchart = null;
  }
  
  if (wordCloud) {
    wordCloud.dispose();
    wordCloud = null;
  }
});
</script>

<style scoped>
.entity-visualization-container {
  display: flex;
  flex-direction: column;
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

.tech-breadcrumb .el-icon {
  font-size: 18px;
}

/* 功能提示卡片 */
.feature-info {
  display: flex;
  gap: 20px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  cursor: help;
}

.info-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.25);
}

.info-card .el-icon {
  font-size: 18px;
  color: #ffd04b;
}

/* 自定义提示框样式 */
:deep(.custom-tooltip) {
  max-width: 300px !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
  color: #333 !important;
  padding: 12px 15px !important;
  white-space: pre-line !important;
}

/* 内容面板 */
.content-panel {
  background-color: white;
  margin: 0 20px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
  min-height: calc(100vh - 160px);
  position: relative;
}

/* 可视化布局 */
.visualization-layout {
  display: flex;
  gap: 20px;
  height: calc(100vh - 200px);
  min-height: 600px;
}

/* 图表列布局 */
.charts-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.left-charts {
  flex: 1;
}

.right-charts {
  flex: 1;
}

/* 图表卡片 */
.chart-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 15px;
  height: calc(50% - 10px);
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.chart-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.wordcloud-card {
  height: 100%;
}

/* 图表标题区域 */
.chart-header {
  margin-bottom: 10px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2942;
  margin: 0 0 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-title .el-icon {
  font-size: 18px;
  color: #4c75a3;
}

.chart-desc {
  font-size: 13px;
  color: #666;
  margin-left: 26px;
}

/* 图表容器 */
.chart-container {
  flex: 1;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.wordcloud-container {
  background: linear-gradient(to bottom right, #f8f9fa, #ffffff);
}

/* 加载样式优化 */
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
}

:deep(.el-loading-spinner .el-loading-text) {
  color: #1a2942;
  font-size: 14px;
  margin-top: 10px;
}

:deep(.el-loading-spinner .path) {
  stroke: #1a2942;
}

/* 响应式样式 */
@media screen and (max-width: 1280px) {
  .visualization-layout {
    flex-direction: column;
    height: auto;
  }
  
  .charts-column {
    width: 100%;
  }
  
  .chart-card {
    height: 350px;
  }
  
  .wordcloud-card {
    height: 450px;
  }
}

@media screen and (max-width: 768px) {
  .header-area {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .chart-card {
    height: 300px;
  }
  
  .wordcloud-card {
    height: 350px;
  }
}
</style>