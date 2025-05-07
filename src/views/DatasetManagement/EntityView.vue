<template>
  <div>
    <div style="margin: 20px 0 0 2%">
      <el-breadcrumb separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/datascreen' }">数据集管理</el-breadcrumb-item>
        <el-breadcrumb-item>数据表概览</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-card style="margin: 20px; height: 80vh">
      <div style="padding: 30px 0 0 20px">
        <div class="task-title-div"></div>
        <span class="task-title-name">数据表概览</span>
        <div style="float: right; margin-right: 30px">
          <el-button type="primary" @click="tagFileDetail(dataInfo.tableId, dataInfo.datasetId)">
            数据详情
          </el-button>
          <el-button type="primary" @click="tagDataVisual(dataInfo.tableId, dataInfo.datasetId)"
            >数据可视化
          </el-button>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; margin: 20px">
        <el-table
          size="small"
          :data="tagList"
          border
          stripe
          :header-cell-style="{ background: '#F5F5F5', 'text-align': 'center' }"
          :cell-style="{ 'text-align': 'center' }"
          style="width: 100%"
          height="60vh"
          ref="tagTableRef"
        >
          <el-table-column label="ID" width="130px" type="index">
            <template #header>
              <span style="white-space: nowrap">ID (共计 {{ tagList.length }} 个)</span>
            </template>
          </el-table-column>
          <el-table-column label="标签" prop="tag">
            <template #default="scope">
              <el-tag type="warning" size="small">
                {{ scope.row.tag }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="标签出现次数" prop="count" sortable></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="showEntityDetail(scope.row.tag)"
                >实体数据详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    <!-- 实体数据详情 -->
    <el-dialog v-model="entityDialogVisible" :title="`标签：${dialogTitle}`" width="30%" @closed='tagEntityList = []'>
      <el-table
        size="small"
        :data="tagEntityList"
        border
        stripe
        :header-cell-style="{ background: '#F5F5F5', 'text-align': 'center' }"
        :cell-style="{ 'text-align': 'center' }"
        style="width: 100%"
        max-height="60vh"
        :default-sort="{prop: 'count', order: 'descending'}"
        v-if='entityDialogVisible'
      >
        <el-table-column label="ID" type="index"></el-table-column>
        <el-table-column label="实体" prop="entity"></el-table-column>
        <el-table-column label="数目" prop="count" sortable></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router/dist/vue-router";
import { onMounted, reactive, ref } from "vue";
import request from "@/utils/request";
import { ElLoading, ElMessage } from "element-plus";
// 路由器
const router = useRouter();
// 实体统计对话框可见性
let entityDialogVisible = ref(false);
// 实体统计对话框标题
let dialogTitle = ref("");
// 数据表id
const dataInfo = reactive({
  datasetId: "",
  tableId: "",
});
// 标签统计列表
let tagList = ref([]);
// 标签实体列表
let tagEntityList = ref([]);
// 标签表格dom
let tagTableRef = ref();
// 动画加载实例
let loadingInstance = ref();
// 挂载
onMounted(async () => {
  openTagTableLoading();
  dataInfo.tableId = router.currentRoute.value.query.tableId;
  dataInfo.datasetId = router.currentRoute.value.query.datasetId;
  await getTagList();
  loadingInstance.close();
});
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
// 打开加载动画
const openTagTableLoading = () => {
  loadingInstance = ElLoading.service({
    target: tagTableRef.value.$el,
    lock: true,
    text: "Loading",
    background: "rgba(255,255,255,0.7)",
  });
};
// 加载文件详情
const tagFileDetail = (tableId, datasetId) => {
  router.push({
    path: "/entityView/detail",
    query: {
      datasetId,
      tableId,
    },
  });
};
// 加载数据可视化界面
const tagDataVisual = (tableId, datasetId) => {
  router.push({
    path: "/entityVisualization",
    query: {
      datasetId,
      tableId,
    },
  });
};
// 点击列表按钮，显示实体详情
const showEntityDetail = async tagName => {
  dialogTitle.value = tagName;
  await request
    .get("/jsonDetail/getTagEntityList", {
      params: {
        datasetId: dataInfo.datasetId,
        tableId: dataInfo.tableId,
        tagName: dialogTitle.value,
      },
    })
    .then(res => {
      if (res.code === "0") {
        tagEntityList.value = res.data;
        entityDialogVisible.value = true;
      } else {
        ElMessage({
          type: "error",
          message: res.msg,
          offset: 60,
        });
      }
    });
};
</script>

<style scoped></style>
