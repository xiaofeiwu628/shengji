<template>
  <div class="auto-modeling">
    <!-- 顶部导航区域 -->
    <div class="header-area">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item class="tech-title">
          <el-icon><Cpu /></el-icon>
          自动建模
        </el-breadcrumb-item>
      </el-breadcrumb>
      
      <!-- 任务概览卡片 -->
      <div class="task-metrics">
        <div class="metric-card">
          <div class="metric-value">{{tableData.length}}</div>
          <div class="metric-label">任务总数</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{getTasksByState("训练中").length}}</div>
          <div class="metric-label">训练中</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{getTasksByState("训练完成").length}}</div>
          <div class="metric-label">已完成</div>
        </div>
        <!-- 新增停止状态统计 -->
        <div class="metric-card">
          <div class="metric-value">{{getTasksByState("停止").length}}</div>
          <div class="metric-label">已停止</div>
        </div>
        <!-- 新增异常状态统计 -->
        <div class="metric-card">
          <div class="metric-value">{{getTasksByState("异常").length}}</div>
          <div class="metric-label">异常任务</div>
        </div>
      </div>

    </div>

    <div class="content-panel">
      <div class="action-bar">
        <div class="left-area">
          <el-button type="primary" :icon="Plus" @click="taskCreate" class="create-btn">新建任务</el-button>
        </div>
        
        <div class="middle-area">
          <!-- 添加任务筛选功能 -->
          <div class="filter-group">
            <span class="filter-label">任务状态：</span>
            <el-radio-group v-model="statusFilter" size="small" @change="filterByStatus">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="training">训练中</el-radio-button>
              <el-radio-button label="finished">已完成</el-radio-button>
              <el-radio-button label="stopped">已停止</el-radio-button>
              <el-radio-button label="error">异常</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <!-- 优化后的搜索输入框部分 -->
        <div class="right-area">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索任务名称或ID"
              class="search-input"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
            <!-- 搜索结果提示 -->
            <div v-if="isFiltered" class="search-result-info">
              <span>
                找到 <b>{{ tableData.length }}</b> 条结果
                <el-button type="text" @click="clearSearch" class="clear-search">
                  <el-icon><Close /></el-icon>清除筛选
                </el-button>
              </span>
            </div>
          </div>
          
          <el-button 
            class="refresh-btn" 
            @click="loadTask" 
            :loading="taskLoading"
            type="primary"
            plain>
            <el-icon class="refresh-icon" :class="{ 'is-loading': taskLoading }"><Refresh /></el-icon>
            刷新列表
          </el-button>
        </div>
      </div>
      
      <!--任务列表-->
      <div class="table-container">
        <el-table
          :data="tableData"
          border
          v-loading="taskLoading"
          :row-style="{ height: '65px' }"
          :cell-style="{ 'text-align': 'center' }"
          :header-cell-style="{ 'text-align': 'center', background: '#1a2942', color: '#fff' }"
          class="task-table"
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
  </div>
    <div>
    <!--执行情况弹窗-->
    <el-dialog v-model="singleTaskDialogVisible" :title="currentTaskId" width="1000px" class="custom-dialog task-execution-dialog">
      <div class="execution-content">
        <el-table
          :data="singleTaskSituation"
          border
          v-loading="dialogLoading"
        >
          <el-table-column type="expand">
            <template #default="scope">
              <div class="detail-table-wrapper">
                <h4 class="detail-table-title">详细步骤</h4>
                <el-table
                  :data="scope.row.detail_data"
                  style="width: 90%; margin: 0 auto"
                  border
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
              </div>
            </template>
          </el-table-column>
          <el-table-column property="history_id" label="执行次数" width="100px" align="center" />
          <el-table-column property="total_start_time" label="开始时间" align="center" />
          <el-table-column property="total_end_time" label="结束时间" align="center" />
          <el-table-column property="total_time_consuming" label="耗时" align="center" />
          <el-table-column property="current_state" label="当前状态" align="center">
            <template #default="scope">
              <el-tag type="" round :style="setStatusStyle(scope.row.current_state)">
                {{ scope.row.current_state }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <span>
          <el-button @click="singleTaskDialogVisible = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
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
      <!--入库弹窗-->
      <el-dialog v-model="toHouseDialogVisible" title="模型入库" width="500px" class="custom-dialog model-save-dialog">
        <div class="model-save-content">
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
              <el-input v-model="form.modelName" :disabled="modelNameDisabled" />
            </el-form-item>
            <el-form-item label="历史任务">
              <el-select
                v-model="form.currentHistoryId"
                class="history-select"
                placeholder="选择历史任务"
                :disabled="historyTaskDisabled"
              >
                <el-option v-for="item in historyListOfTask" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否公开">
              <el-radio-group v-model="form.isPublic">
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
              />
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <span>
            <el-button @click="toHouseDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="formValidate" :disabled="historyTaskDisabled">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>


<script>
import { ArrowRight, Plus,Refresh,Cpu, Search, Close } from "@element-plus/icons-vue";
import router from "@/router";
import request from "@/utils/request";
import { ElMessage } from "element-plus";
import { taskDelete, taskStart, taskStop } from "@/utils/before";
import { dictionaryC2E, dictionaryE2C } from "./taskStaticData";

export default {
  name: "TaskView",
  components: {
    ArrowRight,
    Plus,
    Refresh,
    Cpu,
    Search,
    Close,
  },
  data() {
    const C2E = dictionaryC2E;
    const E2C = dictionaryE2C;
    return {
      statusFilter: "all", // 任务状态筛选
      searchQuery: "", // 任务搜索查询
      originalTableData: [], // 原始任务数据
      isFiltered: false, // 是否有筛选结果
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
  created() {
    this.loadTask();
    this.form.isPublic = "不公开";
  },
  methods: {
    // 新增：处理搜索事件
    handleSearch() {
      if (!this.searchQuery.trim()) {
        // 如果搜索框为空，还原到筛选状态
        this.filterByStatus();
        this.isFiltered = this.statusFilter !== 'all';
        return;
      }
      
      // 先基于原始数据进行状态筛选
      let filteredData = [...this.originalTableData];
      
      if (this.statusFilter !== 'all') {
        const statusMap = {
          'training': '训练中',
          'finished': '训练完成',
          'stopped': '停止',
          'error': '异常',
        };
        
        filteredData = filteredData.filter(item => 
          item.state === statusMap[this.statusFilter]
        );
      }
      
      // 再进行关键词搜索
      const query = this.searchQuery.toLowerCase().trim();
      this.tableData = filteredData.filter(item => 
        (item.name && item.name.toLowerCase().includes(query)) || 
        (item.task_id && item.task_id.toLowerCase().includes(query))
      );
      
      // 设置筛选状态
      this.isFiltered = true;
      
      // 如果没有找到结果，显示提示
      if (this.tableData.length === 0) {
        ElMessage({
          message: "没有找到匹配的任务",
          type: "info",
          offset: 60,
        });
      }
    },
    // 新增：清除搜索
    clearSearch() {
      this.searchQuery = "";
      this.statusFilter = "all";
      this.tableData = [...this.originalTableData];
      this.isFiltered = false;
    },
    
    // 修改：状态筛选方法
    filterByStatus() {
      if (this.statusFilter === 'all') {
        this.tableData = [...this.originalTableData];
        this.isFiltered = false;
      } else {
        const statusMap = {
          'training': '训练中',
          'finished': '训练完成',
          'stopped': '停止',
          'error': '异常',
        };
        
        this.tableData = this.originalTableData.filter(item => 
          item.state === statusMap[this.statusFilter]
        );
        this.isFiltered = true;
      }
      
      // 清空搜索框
      this.searchQuery = "";
    },
    getTasksByState(state) {
      return this.tableData.filter((task) => task.state === state);
    },//获取指定状态的任务
    taskCreate() {
      router.push("/taskCreate");
    },
    // 根据任务状态筛选
    filterByStatus() {
      if (this.statusFilter === 'all') {
        this.tableData = [...this.originalTableData];
      } else {
        const statusMap = {
          'training': '训练中',
          'finished': '训练完成',
          'stopped': '停止',
          'error': '异常',
        };
        
        this.tableData = this.originalTableData.filter(item => 
          item.state === statusMap[this.statusFilter]
        );
      }
      
      // 应用搜索条件（如果有）
      if (this.searchQuery) {
        this.searchTasks();
      }
    },
    // 根据关键词搜索
    searchTasks() {
      // 先应用状态筛选
      this.filterByStatus();
      
      if (!this.searchQuery) return;
      
      // 再应用关键词搜索
      const query = this.searchQuery.toLowerCase();
      this.tableData = this.tableData.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.task_id.toLowerCase().includes(query)
      );
    },
    loadTask(param, time) {
      this.taskLoading = true;
      this.isFiltered = false;// 重置筛选状态
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
              this.originalTableData = [...res.data];
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
.auto-modeling {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(to right, #4c75a3, #4c75a3);
  border-radius: 8px;
  color: white;
  margin: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.tech-title {
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.2);
  color: #ffffff !important;
}

/* 面包屑内嵌套元素样式 */
:deep(.tech-title span),
:deep(.tech-title div),
:deep(.tech-title a) {
  color: #ffffff !important;
}

.tech-title .el-icon {
  font-size: 28px;
  color: #ffffff;
}

.task-metrics {
  display: flex;
  gap: 20px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 10px 20px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.metric-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.2);
}

.metric-value {
  font-size: 26px;
  font-weight: 600;
}

.metric-label {
  font-size: 14px;
  opacity: 0.8;
}

.content-panel {
  background-color: white;
  margin: 0 20px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
  min-height: calc(100vh - 210px);
}



.create-btn {
  background: linear-gradient(to right, #1a2942, #2a476e);
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  transition: all 0.3s;
}

.create-btn:hover {
  background: linear-gradient(to right, #2a476e, #1a2942);
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(26, 41, 66, 0.2);
}


.table-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.task-table {
  width: 100%;
}

/* 状态标签样式调整 */
:deep(.el-tag) {
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
  min-width: 70px;
}

/* 表格行悬停效果 */
:deep(.el-table__row) {
  transition: all 0.2s;
}

:deep(.el-table__row:hover) {
  background-color: #f0f8ff !important;
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.03);
}

/* 保留已有的样式 */
.input {
  width: 260px;
  margin-left: 20px;
  text-align: left;
}
/* 修改刷新按钮样式 */
.refresh-btn {
  color: #4c75a3;
  background-color: rgba(76, 117, 163, 0.05);
  border-color: #4c75a3;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: all 0.3s;
}

.refresh-btn:hover {
  background-color: rgba(76, 117, 163, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(76, 117, 163, 0.2);
}

.refresh-icon {
  font-size: 16px;
  transition: transform 0.6s ease;
}

/* 添加点击动画效果 */
.refresh-btn:active .refresh-icon {
  transform: rotate(360deg);
}

/* 加载中的动画效果 */
.refresh-icon.is-loading {
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
/* 操作栏样式优化 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background-color: #f9fafc;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.left-area, .right-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.middle-area {
  display: flex;
  align-items: center;
  flex-grow: 1;
  margin: 0 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  margin-left: 15px;
}

.filter-label {
  margin-right: 10px;
  font-size: 14px;
  color: #606266;
}

:deep(.el-radio-group .el-radio-button__inner) {
  padding: 6px 12px;
}

.search-input {
  width: 220px;
  margin-right: 12px;
}
/* 搜索框和结果提示样式 */
.search-box {
  display: flex;
  flex-direction: column;
  margin-right: 12px;
}

.search-input {
  width: 250px;
}

.search-result-info {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
  display: flex;
  align-items: center;
}

.search-result-info b {
  color: #409eff;
  margin: 0 2px;
}

.clear-search {
  margin-left: 8px;
  padding: 0;
  font-size: 12px;
}

:deep(.clear-search .el-icon) {
  margin-right: 2px;
}
/* 弹窗通用样式 */
:deep(.custom-dialog .el-dialog__header) {
  position: relative;
  background: linear-gradient(to right, #1a2942, #4c75a3);
  padding: 16px 20px;
  margin-right: 0;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: center;
}

:deep(.custom-dialog .el-dialog__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

:deep(.custom-dialog .el-dialog__headerbtn) {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.3s;
  z-index: 10;
}

:deep(.custom-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 16px;
  font-weight: bold;
}

:deep(.custom-dialog .el-dialog__headerbtn:hover) {
  background: rgba(255, 255, 255, 0.35);
  border-color: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

:deep(.custom-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
  color: white;
}

:deep(.custom-dialog .el-dialog__body) {
  padding: 24px 30px;
}

:deep(.custom-dialog .el-dialog__footer) {
  padding: 12px 30px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fbfbfb;
}

/* 执行情况弹窗特定样式 */
.task-execution-dialog :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.task-execution-dialog :deep(.el-table th) {
  background-color: #f0f5fa !important;
  color: #1a2942 !important;
  font-weight: 600 !important;
  padding: 12px 0;
}

.task-execution-dialog :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: #f8fafc;
}

.task-execution-dialog :deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background-color: #f0f7ff;
}

/* 入库弹窗特定样式 */
.model-save-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #1a2942;
}

.model-save-dialog :deep(.el-input__inner) {
  border-radius: 4px;
  transition: all 0.3s;
}

.model-save-dialog :deep(.el-input__inner:hover) {
  border-color: #4c75a3;
}

.model-save-dialog :deep(.el-input__inner:focus) {
  border-color: #1a2942;
  box-shadow: 0 0 0 2px rgba(26, 41, 66, 0.2);
}

.model-save-dialog :deep(.el-textarea__inner) {
  border-radius: 4px;
  transition: all 0.3s;
}

.model-save-dialog :deep(.el-textarea__inner:hover) {
  border-color: #4c75a3;
}

.model-save-dialog :deep(.el-textarea__inner:focus) {
  border-color: #1a2942;
  box-shadow: 0 0 0 2px rgba(26, 41, 66, 0.2);
}

.model-save-dialog :deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: #4c75a3;
  border-color: #4c75a3;
}

.model-save-dialog :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #4c75a3;
}

/* 按钮样式优化 */
:deep(.custom-dialog .el-dialog__footer .el-button--default) {
  border-color: #d9d9d9;
  background: white;
  font-weight: 500;
  transition: all 0.3s;
}

:deep(.custom-dialog .el-dialog__footer .el-button--default:hover) {
  border-color: #c0c4cc;
  background-color: #f5f7fa;
  transform: translateY(-1px);
}

:deep(.custom-dialog .el-dialog__footer .el-button--primary) {
  background: linear-gradient(to right, #1a2942, #4c75a3);
  border: none;
  font-weight: 500;
  transition: all 0.3s;
}

:deep(.custom-dialog .el-dialog__footer .el-button--primary:hover) {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(26, 41, 66, 0.2);
}
/* 执行情况内容样式 */
.execution-content {
  padding: 10px 0;
}

.detail-table-wrapper {
  padding: 15px 5px;
}

.detail-table-title {
  color: #1a2942;
  font-size: 14px;
  margin: 5px 5% 15px;
  font-weight: 600;
}
/* 入库弹窗内容样式 */
.model-save-content {
  padding: 10px 0;
}

.model-save-dialog .history-select {
  width: 100%;
}

.model-save-dialog :deep(.el-form-item) {
  margin-bottom: 22px;
}

.model-save-dialog :deep(.el-form-item.is-error .el-input__inner) {
  border-color: #f56c6c;
}

.model-save-dialog :deep(.el-form-item__error) {
  padding-top: 4px;
  font-size: 13px;
}
</style>