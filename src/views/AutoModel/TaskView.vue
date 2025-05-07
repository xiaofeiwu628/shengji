<template>
  <div>
    <div style="margin: 20px 0 0 2%">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/taskView' }">自动建模</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!--    <el-divider style="margin: 15px 0 0 0" />-->
    <div style="background-color: white; margin: 20px; min-height: calc(100vh - 124px)">
      <div style="text-align: left; margin: 20px 0 0 2%; display: inline-block; width: 93%">
        <el-button type="primary" :icon="Plus" @click="taskCreate" round>新建</el-button>
      </div>
      <div style="text-align: right; margin: 20px 2% 0 0; display: inline-block; vertical-align: bottom">
        <el-icon size="20px" @click="loadTask" style="cursor: pointer">
          <Refresh />
        </el-icon>
      </div>
      <!--    任务列表-->
      <div>
        <el-table
          :data="tableData"
          border
          style="width: 96%; margin: 20px 0 20px 2%"
          v-loading="taskLoading"
          :row-style="{ height: '65px' }"
          :cell-style="{ 'text-align': 'center' }"
          :header-cell-style="{ 'text-align': 'center' }"
        >
          <el-table-column type="index" label="ID" min-width="5%" align="center" />
          <el-table-column prop="name" label="任务名称" min-width="10%" align="center" />
          <el-table-column prop="task_id" label="任务ID" min-width="10%" align="center" />
          <el-table-column property="state" label="状态" min-width="9%" align="center">
            <template #default="scope">
              <el-tag type="" round :style="setStatusStyle(scope.row.state)">{{ scope.row.state }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="任务类型" min-width="9%" align="center" />
          <el-table-column prop="create_time" label="创建时间" min-width="12%" align="center" />
          <el-table-column prop="" label="操作" min-width="24%" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="startTask(scope.row)"
                :style="setStartStyle(scope.row)"
                round
                :disabled="setStartDisabled(scope.row)"
                >启动
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="stopTask(scope.row)"
                :style="setStopStyle(scope.row)"
                round
                :disabled="setStopDisabled(scope.row)"
                >停止
              </el-button>
              <el-button
                type="primary"
                size="small"
                round
                @click="timing(scope.row)"
                style="width: 20%"
                :disabled="true"
                >定时
              </el-button>
              <el-popconfirm title="确定删除吗？" @confirm="taskDelete(scope.row)">
                <template #reference>
                  <el-button
                    type="primary"
                    size="small"
                    :style="setDeleteStyle(scope.row)"
                    :disabled="setDeleteDisabled(scope.row)"
                    round
                    >删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
          <el-table-column prop="others" label="信息" min-width="23%">
            <template #default="scope">
              <el-button
                link
                type="primary"
                size="small"
                @click="openTaskDialog(scope.row)"
                class="table-button"
                :disabled="setHistoryDisabled(scope.row)"
                >执行情况
              </el-button>
              <el-button link type="primary" size="small" @click="toLog(scope.row)" class="table-button"
                >日志
              </el-button>
              <el-button link type="primary" size="small" @click="toEvaluation(scope.row)" class="table-button"
                >评估报告
              </el-button>
              <el-button link type="primary" size="small" @click="toDetails(scope.row)" class="table-button"
                >配置详情
              </el-button>
              <el-button
                link
                type="primary"
                size="small"
                @click="openHouseDialog(scope.row)"
                class="table-button"
                v-if="scope.row.state === '训练完成'"
                >入库
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!--    执行情况弹窗-->
    <div>
      <el-dialog v-model="singleTaskDialogVisible" :title="currentTaskId" width="1000px">
        <el-table
          :data="singleTaskSituation"
          border
          :header-cell-style="{ background: '#F5F5F5' }"
          v-loading="dialogLoading"
        >
          <el-table-column type="expand">
            <template #default="scope">
              <el-table
                :data="scope.row.detail_data"
                style="width: 80%; margin: 0 auto"
                border
                :header-cell-style="{ background: '#F5F5F5' }"
              >
                <el-table-column property="step" label="步骤" width="100px" align="center" />
                <el-table-column property="start_time" label="开始时间" align="center" />
                <el-table-column property="end_time" label="结束时间" align="center" />
                <el-table-column property="time_consuming" label="耗时" align="center" />
                <el-table-column property="state" label="当前状态" align="center">
                  <template #default="scope2">
                    <el-tag type="" round :style="setStatusStyle(scope2.row.state)">{{ scope2.row.state }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column property="history_id" label="执行次数" width="100px" align="center" />
          <el-table-column property="total_start_time" label="开始时间" align="center" />
          <el-table-column property="total_end_time" label="结束时间" align="center" />
          <el-table-column property="total_time_consuming" label="耗时" align="center" />
          <el-table-column property="current_state" label="当前状态" align="center">
            <template #default="scope">
              <el-tag type="" round :style="setStatusStyle(scope.row.current_state)"
                >{{ scope.row.current_state }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <template #footer>
          <span>
            <el-button @click="this.singleTaskDialogVisible = false">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    <!--    定时弹窗-->
    <div>
      <el-dialog v-model="timeDialogVisible" :title="currentTaskId" width="500px">
        <div style="margin: 20px 0 0 10px">
          <span style="display: inline-block; width: 100px">间隔时长：</span>
          <el-input v-model="IntervalDuration" type="text" class="input" />
          <span style="margin-left: 10px">小时</span>
        </div>
        <div style="margin: 20px 0 0 10px">
          <span style="display: inline-block; width: 100px">最大训练次数：</span>
          <el-input v-model="maxTrainNumber" type="text" class="input" />
          <span style="margin-left: 10px">次</span>
        </div>
        <template #footer>
          <span>
            <el-button @click="this.timeDialogVisible = false">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    <!--    入库弹窗-->
    <div>
      <el-dialog v-model="toHouseDialogVisible" title="模型入库" width="500px">
        <el-form
          label-position="right"
          label-width="100px"
          :model="form"
          style="max-width: 420px"
          v-loading="formLoading"
          :rules="rules"
          ref="toHouseRef"
        >
          <el-form-item label="模型名称" prop="modelName" :inline-message="true">
            <el-input style="margin-left: 10px" v-model="form.modelName" :disabled="modelNameDisabled" />
          </el-form-item>
          <el-form-item label="历史任务">
            <el-select
              v-model="form.currentHistoryId"
              class="m-2"
              placeholder="Select"
              :disabled="historyTaskDisabled"
              style="margin-left: 10px"
            >
              <el-option v-for="item in historyListOfTask" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否公开">
            <el-radio-group v-model="form.isPublic" style="margin-left: 10px">
              <el-radio label="不公开" />
              <el-radio label="公开" />
            </el-radio-group>
          </el-form-item>
          <el-form-item label="模型描述">
            <el-input
              type="textarea"
              v-model="form.modelDesc"
              placeholder="请输入模型描述，100字以内"
              maxlength="100"
              rows="4"
              style="margin-left: 10px"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span>
            <el-button @click="this.toHouseDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="formValidate" :disabled="historyTaskDisabled">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { ArrowRight, Plus } from "@element-plus/icons-vue";
import router from "@/router";
import request from "@/utils/request";
import { ElMessage } from "element-plus";
import { taskDelete, taskStart, taskStop } from "@/utils/before";
import { dictionaryC2E, dictionaryE2C } from "./taskStaticData";

export default {
  name: "TaskView",
  data() {
    const C2E = dictionaryC2E;
    const E2C = dictionaryE2C;
    return {
      ArrowRight,
      Plus,
      taskLoading: false,
      formLoading: false,
      dialogLoading: false,
      singleTaskDialogVisible: false,
      timeDialogVisible: false,
      toHouseDialogVisible: false,
      singleTaskSituation: [],
      currentTaskId: "",
      tableData: [
        // {
        //   name:'task1',
        //   task_id:'1001',
        //   state:'训练完成',
        //   type:'时间序列预测',
        //   creat_time:'2022-10-11 10:00:00',
        // }
      ],
      IntervalDuration: "",
      maxTrainNumber: "",
      C2E,
      E2C,
      form: {
        modelName: "",
      },
      historyListOfTask: [],
      currentHistoryId: "",
      modelNameDisabled: false,
      historyTaskDisabled: false,
      rules: {
        modelName: [{ required: true, message: "请填写模型名称！", trigger: "blur" }],
      },
    };
  },
  components: {},
  created() {
    this.loadTask();
    this.form.isPublic = "不公开";
  },
  methods: {
    taskCreate() {
      router.push("/taskCreate");
    },
    loadTask(param, time) {
      this.taskLoading = true;
      setTimeout(
        () => {
          request("/TaskManage/GetTaskList", {
            params: {},
          })
            .then((res) => {
              console.log(res.data);
              res.data.forEach((item) => {
                item["create_time"] = item["create_time"].split(".")[0];
                //进行任务类型和状态的中英文转换
                // item['type'] = this.E2C[item.type];
                item["type"] = Object.keys(this.E2C).includes(item.type) ? this.E2C[item.type] : item.type;
                item["state"] = this.E2C[item.state];
              });
              this.tableData = res.data;

              this.taskLoading = false;
            })
            .catch((err) => {
              ElMessage({
                message: "error",
                type: "error",
                offset: 60,
              });
            });
        },
        time ? time : 1000,
      );
    },
    taskDelete(param) {
      const dele = { task_id: param.task_id };
      taskDelete(dele)
        .then((res) => {
          this.loadTask(null, 2000);
          setTimeout(() => {
            ElMessage({
              message: "删除成功",
              type: "success",
              offset: 60,
            });
          }, 2000);
        })
        .catch((err) => {
          ElMessage({
            message: "error",
            type: "error",
            offset: 60,
          });
        });
    },
    openTaskDialog(param) {
      this.currentTaskId = `任务ID：${param.task_id}`;
      this.dialogLoading = true;
      request
        .get("/TaskManage/GetSingleTaskDetail", {
          params: {
            task_id: param.task_id,
          },
        })
        .then((res) => {
          console.log(res.data);
          if (res.data.length > 0) {
            res.data.forEach((item, index) => {
              item["current_state"] = this.E2C[item["current_state"]];
              if (item["total_start_time"]) {
                item["total_start_time"] = item["total_start_time"].split(".")[0];
              }
              if (item["total_end_time"]) {
                item["total_end_time"] = item["total_end_time"].split(".")[0];
              }
              item["total_time_consuming"] = parseFloat(item["total_time_consuming"]).toFixed(1).toString() + "s";
              item.history_id = index + 1;
              item.detail_data.forEach((option) => {
                if (option["start_time"]) {
                  option["start_time"] = option["start_time"].split(".")[0];
                }
                if (option["end_time"]) {
                  option["end_time"] = option["end_time"].split(".")[0];
                }
                option["step"] = this.E2C[option["step"]];
                option["state"] = this.E2C[option["state"]];
                option["time_consuming"] = parseFloat(option["time_consuming"]).toFixed(1).toString() + "s";
              });
            });
          }

          this.singleTaskSituation = res.data;
          this.dialogLoading = false;
        })
        .catch((err) => {
          ElMessage({
            message: "error",
            type: "error",
            offset: 60,
          });
        });
      this.singleTaskDialogVisible = true;
    },
    toLog(param) {
      router.push({ path: "/taskDetails", query: { taskId: param.task_id, taskState: param.state, pageIndex: "1" } });
    },
    toEvaluation(param) {
      router.push({ path: "/taskDetails", query: { taskId: param.task_id, taskState: param.state, pageIndex: "2" } });
    },
    toDetails(param) {
      router.push({ path: "/taskDetails", query: { taskId: param.task_id, taskState: param.state, pageIndex: "3" } });
      // router.push({name:'TaskDetails',params:{taskId:param.task_id,taskName:param.name,taskType:param.type,taskStatus:param.state,pageIndex:'3'}});
    },
    timing(param) {
      this.currentTaskId = `任务ID：${param.task_id}`;
      this.timeDialogVisible = true;
    },
    startTask(param) {
      const start = { task_id: param.task_id };
      taskStart(start)
        .then((res) => {
          console.log(res);
          this.loadTask(null, 2000);
          setTimeout(() => {
            ElMessage({
              message: "启动成功",
              type: "success",
              offset: 60,
            });
          }, 2000);
        })
        .catch((err) => {
          console.log(err, "err in startTask");
          ElMessage({
            message: "error",
            type: "error",
            offset: 60,
          });
        });
    },
    stopTask(param) {
      const start = { task_id: param.task_id };
      taskStop(start)
        .then((res) => {
          this.loadTask(null, 2000);
          setTimeout(() => {
            ElMessage({
              message: "停止成功",
              type: "success",
              offset: 60,
            });
          }, 2000);
        })
        .catch((err) => {
          ElMessage({
            message: "error",
            type: "error",
            offset: 60,
          });
        });
    },
    //设置启动style
    setStartStyle(param) {
      if (param.state === "训练中" || param.state === "等待") {
        return { width: "20%", "background-color": "#B9DAA7", color: "white" };
      } else {
        return { width: "20%", "background-color": "#60B04F", color: "white" };
      }
    },
    //设置停止style
    setStopStyle(param) {
      if (param.state !== "训练中" && param.state !== "等待") {
        return { width: "20%", "background-color": "#E29194", color: "white" };
      } else {
        return { width: "20%", "background-color": "#CD353B", color: "white" };
      }
    },
    //设置删除style
    setDeleteStyle(param) {
      if (param.state !== "训练中" && param.state !== "等待") {
        return { width: "20%", "background-color": "#CD353B", color: "white" };
      } else {
        return { width: "20%", "background-color": "#E29194", color: "white" };
      }
    },
    //设置状态style
    setStatusStyle(param) {
      if (param === "训练中" || param === "running") {
        return { "background-color": "#409eff", color: "white", width: "70px" };
      } else if (param === "未启动") {
        return { "background-color": "#60B04F", color: "white", width: "70px" };
      } else if (param === "停止" || param === "exited") {
        return { "background-color": "#E29194", color: "white", width: "70px" };
      } else if (param === "训练完成" || param === "finished") {
        return { "background-color": "#69B0E9", color: "white", width: "70px" };
      } else if (param === "异常" || param === "error") {
        return { "background-color": "#CD353B", color: "white", width: "70px" };
      } else if (param === "等待" || param === "waiting") {
        return { "background-color": "#00CED1", color: "white", width: "70px" };
      }
    },
    //设置启动按钮不可用
    setStartDisabled(param) {
      return param.state === "训练中" || param.state === "等待";
    },
    //设置暂停按钮不可用
    setStopDisabled(param) {
      return param.state !== "训练中" && param.state !== "等待";
    },
    setDeleteDisabled(param) {
      return param.state === "训练中" || param.state === "等待";
    },
    //入库对话框弹出
    openHouseDialog(param) {
      this.form = {};
      this.form.isPublic = "不公开";
      this.formLoading = true;
      this.historyListOfTask = [];

      this.form.taskId = param.task_id;
      //调用接口拿到当前任务的所有可用历史任务，以及当前可以部署的版本号
      request
        .get("/ModelRepository/GetVersion", {
          params: {
            task_id: param.task_id,
          },
        })
        .then((res) => {
          console.log(res.data, "res.data in openHouseDialog");
          this.historyTaskDisabled = false;
          this.historyListOfTask = res.data.task_history_id;
          this.form.currentHistoryId = this.historyListOfTask[0];
          // this.form.version = res.data.model_version;
          //当前任务无可用历史任务时禁止入库
          if (res.data.task_history_id.length === 0) {
            this.form.currentHistoryId = "无可用历史任务";
            // document.getElementById('selectOfHistoryTask').disabled = true;
            this.historyTaskDisabled = true;
          }
          this.formLoading = false;
        });
      this.toHouseDialogVisible = true;
    },
    async formValidate() {
      await this.$refs.toHouseRef.validate((valid) => {
        if (valid) {
          console.log("正确");
          this.toHouse();
        } else {
          console.log("请填写模型名称");
        }
      });
    },
    //点击入库对话框的确定按钮，调用接口将模型信息存入数据库
    toHouse() {
      let data = {};
      data["task_id"] = this.form.taskId;
      data["task_history_id"] = this.form.currentHistoryId;
      data["model_name"] = this.form.modelName;
      data["model_desc"] = this.form.modelDesc;
      data["is_public"] = this.form.isPublic === "不公开" ? 0 : 1;
      this.toHouseDialogVisible = false;
      console.log(this.form, "this.form");
      console.log(data, "data");
      request
        .post("/ModelRepository/AddModel", data, {
          headers: { dateType: "json", "Content-Type": "application/json" },
        })
        .then((res) => {
          if (res.code === "0") {
            ElMessage({
              message: "入库成功",
              type: "success",
              offset: 60,
            });
          } else if (res.code === "1") {
            ElMessage({
              message: "该模型已经添加过",
              type: "error",
              offset: 60,
            });
          } else {
            ElMessage({
              message: "未知错误",
              type: "error",
              offset: 60,
            });
          }

          console.log(res.data);
        });
    },
    //设置执行情况按钮不可用
    setHistoryDisabled(param) {
      return param.state === "训练中";
    },
  },
};
</script>

<style scoped>
.input {
  width: 260px;
  margin-left: 20px;
  text-align: left;
}
.table-button {
  /*width: 15%;*/
  /*margin: 0;*/
  /*padding: 0;*/
}
</style>