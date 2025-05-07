<template>
  <div>
    <div style="margin: 20px 0 0 2%">
      <el-breadcrumb separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ name: 'Datascreen' }">数据集管理</el-breadcrumb-item>
        <el-breadcrumb-item
          :to="{ path: '/entityView', query: { datasetId: dataInfo.datasetId, tableId: dataInfo.tableId } }"
          >数据表概览
        </el-breadcrumb-item>
        <el-breadcrumb-item>数据详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-card style="margin: 20px">
      <div style="padding: 30px 0 0 20px">
        <div class="task-title-div"></div>
        <span class="task-title-name">数据详情</span>
      </div>
      <div style="margin: 20px;display: flex;flex-direction: column;align-items: center">
        <el-table
          :data='fileList'
          style='width: 100%;'
          border
          stripe
          size='small'
          :cell-style="{ 'text-align': 'center' }"
          :header-cell-style="{ 'text-align': 'center', background: '#F5F5F5' }"
          ref='fileTableRef'
        >
          <el-table-column label='id' prop='id' sortable :sort-method="sortById" width='200'></el-table-column>
          <el-table-column label='text' prop='text'>
            <template #default='scope'>
              <el-popover
                placement="bottom"
                :width="300"
                trigger="hover"
                :content="scope.row.text"
                show-after='500'
              >
                <template #reference>
                  <div style='overflow:hidden;text-overflow: ellipsis;white-space: nowrap;' >{{ scope.row.text }}</div>
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label='labels' width='200'>
            <template #default='scope'>
              <el-button type='text' size='small' @click='showLabels(scope.row.id)'>查看标签</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if = 'totalItems > 0'
          v-model:currentPage="currentPage"
          v-model:page-size="pageSize"
          style='margin-top: 10px'
          small
          :page-sizes="[10, 15, 20]"
          layout="total, prev, pager, next, jumper,sizes"
          :total="totalItems"
          @size-change="getFileContent(1)"
          @current-change="getFileContent"
        />
      </div>
    </el-card>
    <el-dialog v-model="labelsVisible" title="Labels" width="50%" @closed='closeLabelsDialog'>
      <el-table
        :data="labelsTableData"
        style="width: 100%; height: 60vh"
        border
        stripe
        size="small"
        :cell-style="{ 'text-align': 'center' }"
        :header-cell-style="{ 'text-align': 'center', background: '#F5F5F5' }"
        ref='entityTableRef'
        v-if='labelsVisible'
      >
        <el-table-column prop="0" label="id"></el-table-column>
        <el-table-column prop="1" label="实体"></el-table-column>
        <el-table-column prop="2" label="起始下标"></el-table-column>
        <el-table-column prop="3" label="结束下标"></el-table-column>
        <el-table-column prop="4" label="文本" show-overflow-tooltip></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import request from "@/utils/request";
import { ElButton, ElLoading, ElMessage, TableV2FixedDir } from "element-plus";
import { h, nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from "vue-router/dist/vue-router";
// 路由器
const router = useRouter();
// 文件原始内容
let fileList = ref([]);
// labels弹窗表格绑定的数据表，根据用户点击去获取
let labelsTableData = ref([]);
// 数据表信息
let dataInfo = reactive({
  tableId: "",
  datasetId: "",
});
// labels弹窗是否可见
let labelsVisible = ref(false);
// 标签表格的ref
let entityTableRef = ref();
// 文件内容列表dom
const fileTableRef = ref();
// 动画实例
let loadingInstance = ref();
// 页面大小
let pageSize = ref(10);
// 当前页
let currentPage = ref(1);
// 总条数
let totalItems = ref(0);
// 将字符串转换为数字排序
const sortById = (a, b) => {
  return parseInt(a.id) - parseInt(b.id);
};
// loading
const openFileTableLoading = () => {
  loadingInstance = ElLoading.service({
    target: fileTableRef.value.$el,
    lock: true,
    text: "Loading",
    background: "rgba(255,255,255,0.7)",
  });
};
// 获取文件原始内容
const getFileContent = async (pager = 1) => {
  currentPage.value = pager
  await request
    .get("/jsonDetail/getFileList", {
      params: {
        datasetId: dataInfo.datasetId,
        tableId: dataInfo.tableId,
        currentPage: pager,
        pageSize: pageSize.value,
      },
    })
    .then(res => {
      if (res.code === "0") {
        fileList.value = res.data.fileList;
        totalItems.value = res.data.totalItems
      } else {
        ElMessage({
          type: "error",
          message: res.msg,
          offset: 60,
        });
      }
    });
};
// 显示标签弹窗
const showLabels = id => {
  labelsTableData.value = fileList.value.find(item => item.id === id).labels;
  labelsVisible.value = true;
};
// 关闭标签实体对话框
const closeLabelsDialog = () => {
  labelsTableData.value = [];
}
// 挂载
onMounted(async () => {
  openFileTableLoading();
  dataInfo.tableId = router.currentRoute.value.query.tableId;
  dataInfo.datasetId = router.currentRoute.value.query.datasetId;
  await getFileContent();
  loadingInstance.close();
});
</script>

<style scoped></style>
