<template>
  <div class="task-details-container">
    <!-- 头部区域 -->
    <div class="header-area">
      <div class="tech-title">
        <el-icon><DataAnalysis /></el-icon>
        <el-breadcrumb :separator-icon="ArrowRight" class="nav-breadcrumb">
          <el-breadcrumb-item :to="{ path: '/taskView' }" class="tech-breadcrumb">
            自动建模
          </el-breadcrumb-item>
          <el-breadcrumb-item class="tech-breadcrumb">
            任务详情
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="main-content-wrapper">
      <!-- 任务信息卡片 -->
      <div class="task-info-card">
        <div class="task-info-content">
          <div class="task-info-item">
            <span class="info-label">任务ID</span>
            <span class="info-value">{{ this.taskId }}</span>
          </div>
          <div class="task-info-item">
            <span class="info-label">任务名称</span>
            <span class="info-value">{{ this.taskName }}</span>
          </div>
          <div class="task-info-item">
            <span class="info-label">任务类型</span>
            <span class="info-value">{{ E2C[this.taskType] }}</span>
          </div>
          <div class="task-info-item">
            <span class="info-label">任务状态</span>
            <span class="info-value">
              <el-tag :type="getStatusType" size="small">{{ this.taskState }}</el-tag>
            </span>
          </div>
        </div>
        <div class="task-actions">
          <el-button 
            type="primary" 
            :disabled="this.taskState !== '未启动'" 
            @click="modifyTask"
          >
            <el-icon><Edit /></el-icon>
            修改配置
          </el-button>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tab-section">
        <el-menu class="tab-menu" mode="horizontal" :default-active="pageIndex">
          <el-menu-item index="1" @click="changeIndex('1')">
            <el-icon><Document /></el-icon>
            <span>日志</span>
          </el-menu-item>
          <el-menu-item index="2" @click="changeIndex('2')">
            <el-icon><DataLine /></el-icon>
            <span>评估报告</span>
          </el-menu-item>
          <el-menu-item index="3" @click="changeIndex('3')">
            <el-icon><Setting /></el-icon>
            <span>配置详情</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 日志内容 -->
      <div class="content-section" v-if="pageIndex === '1'">
        <div class="log-panel">
          <div class="log-header">
            <div class="log-title">任务运行日志</div>
            <div class="log-actions">
              <el-tooltip content="清空日志" placement="top">
                <el-button size="small" icon="Delete" circle @click="clearLogs"></el-button>
              </el-tooltip>
              <el-tooltip content="滚动到底部" placement="top">
                <el-button size="small" icon="Bottom" circle @click="scrollToBottom"></el-button>
              </el-tooltip>
            </div>
          </div>
          <div id="messages" class="log-content" v-loading="logLoading" element-loading-text="正在加载日志..."></div>
        </div>
      </div>

      <!-- 评估报告内容 -->
      <div class="content-section" v-if="pageIndex === '2'">
        <div class="section-card">
          <div class="history-selector">
            <span>历史任务：</span>
            <el-select v-model="taskHistory" @change="changeTaskIndex" class="history-select">
              <el-option
                  v-for="item in taskHistoryList"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>
          </div>
        </div>

        <!-- 评价指标 -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-line"></div>
            <span class="section-title">评价指标</span>
          </div>
          <div class="section-content">
            <el-table 
              :data="taskEvaluateData" 
              border 
              class="data-table"
              v-loading="evaluationLoading" 
              :header-cell-style="tableHeaderStyle">
              <el-table-column property="evaluateName" label="评价指标" width="350px" align="center"/>
              <el-table-column property="evaluateValue" label="数值" width="300px" align="center"/>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 配置详情内容 -->
      <div class="content-section" v-if="pageIndex === '3'">
        <!-- 基本信息 -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-line"></div>
            <span class="section-title">基本信息</span>
          </div>
          <div class="section-content">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">任务名称</span>
                <span class="info-value">{{ this.taskName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">任务ID</span>
                <span class="info-value">{{ this.taskId }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">任务描述</span>
                <span class="info-value">{{ this.taskDescription }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据详情 -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-line"></div>
            <span class="section-title">数据详情</span>
          </div>
          <div class="section-content">
            <el-table
              :data="dataDetails"
              border 
              class="data-table"
              :header-cell-style="tableHeaderStyle"
              v-loading="dataDetailsLoading"
              :span-method="tableColumnSpanMethod">
              <el-table-column property="dataSet" label="数据集ID" min-width="10%" align="center"/>
              <el-table-column property="taskType" label="任务类型" min-width="12%" align="center"/>
              <el-table-column property="dataSheetID" label="数据表ID" min-width="12%" align="center"/>
              <el-table-column property="dataSheetName" label="数据表名" min-width="12%" align="center"/>
              <el-table-column property="timeCol" label="时间字段" min-width="12%" align="center"
                             v-if="taskType==='time_series_prediction'"/>
              <el-table-column property="targetCol" label="目标字段" min-width="12%" align="center"/>
              <el-table-column property="featureCol" label="特征字段" align="center" min-width="42%"
                             style="word-break: break-word"/>
            </el-table>
          </div>
        </div>

        <!-- 特征工程配置 -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-line"></div>
            <span class="section-title">特征工程配置</span>
          </div>
          <div class="section-content">
            <!-- 记录处理 -->
            <div class="feature-section">
              <div class="feature-title">记录处理</div>
              <div class="feature-content">
                <!-- all -->
                <div v-if="rowModel">
                  <div class="feature-option">使用全部记录</div>
                </div>
                <!-- part -->
                <div v-if="!rowModel">
                  <div class="feature-option">使用部分记录</div>
                  <el-table 
                    :data="partRowConfig" 
                    border 
                    class="data-table"
                    v-loading="dataDetailsLoading" 
                    :header-cell-style="tableHeaderStyle">
                    <el-table-column property="andOr" label="字段间逻辑" min-width="20%" align="center"/>
                    <el-table-column property="colName" label="字段" min-width="34%" align="center"/>
                    <el-table-column property="operator" label="字段操作逻辑" min-width="23%" align="center"/>
                    <el-table-column property="value" label="取值" min-width="23%" align="center"/>
                  </el-table>
                </div>
              </div>
            </div>

            <!-- 字段处理 -->
            <div class="feature-section">
              <div class="feature-title">字段处理</div>
              <div class="feature-content">
                <!-- default -->
                <div v-if="colModel">
                  <div class="feature-option">所有字段使用相同配置</div>
                  <el-table
                    :data="colDefault" 
                    border
                    class="data-table"
                    v-loading="dataDetailsLoading"
                    :header-cell-style="tableHeaderStyle"
                    :span-method="defaultColumnSpanMethod">
                    <el-table-column property="colName" label="特征策略" min-width="20%" align="center"/>
                    <el-table-column property="methods" label="配置项" min-width="20%" align="center"/>
                    <el-table-column property="value" label="取值" min-width="60%" align="center"/>
                  </el-table>
                </div>
                <!-- singleCol -->
                <div v-if="!colModel">
                  <div class="feature-option">逐字段分别配置</div>
                  <el-table 
                    :data="colSingle" 
                    border
                    class="data-table"
                    v-loading="dataDetailsLoading"
                    max-height="500px"
                    :header-cell-style="tableHeaderStyle"
                    :span-method="singleColumnSpanMethod">
                    <el-table-column property="tableName" label="表名" min-width="15%" align="center"/>
                    <el-table-column property="colName" label="字段" min-width="15%" align="center"/>
                    <el-table-column property="operator" label="处理方法" min-width="15%" align="center"/>
                    <el-table-column property="config" label="配置项" min-width="55%" show-overflow-tooltip="true"
                                   align="center"/>
                  </el-table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 模型配置信息 -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-line"></div>
            <span class="section-title">模型配置信息</span>
          </div>
          <div class="section-content">
            <div class="model-name">
              <el-icon><Cpu /></el-icon>
              <span>模型名称：{{ modelName }}</span>
            </div>
            
            <el-table 
              :data="model" 
              border 
              :header-cell-style="tableHeaderStyle"
              class="data-table">
              <el-table-column prop="parameter" label="参数" min-width="15%" align="center"/>
              <el-table-column prop="" label="是否调参" min-width="15%" align="center">
                <template #default="scope">
                  <el-switch v-model="scope.row.tuneParam" disabled/>
                </template>
              </el-table-column>
              <el-table-column prop="defaultValue" label="默认取值" min-width="15%" align="center"/>
              <el-table-column prop="areaValue" label="调参范围" min-width="35%" align="center">
                <template #default="scope">
                  <!-- 保持原有的模板内容不变 -->
                  <div v-if="scope.row.tuneParam">
                    <div v-if="scope.row.parameter === '批次大小' || scope.row.parameter === '学习率' || scope.row.parameter === '迭代次数'
                    || scope.row.parameter === '惩罚项系数' || scope.row.parameter === '隐藏层数量' || scope.row.parameter === 'LSTM层数'
                    || scope.row.parameter === '序列长度' || scope.row.parameter === '最大迭代次数' || scope.row.parameter === '卷积核大小'
                    || scope.row.parameter === '输出通道数'||scope.row.parameter === '卷积层数'||scope.row.parameter === '弱学习器最大迭代次数'
                    ||scope.row.parameter === '叶子节点最小样本数'||scope.row.parameter === '再划分最小样本数'||scope.row.parameter === '树最大深度'">
                      <el-input v-model="scope.row.area.low_bound" size="small" style="width: 40%" disabled/>
                      <span style="margin: 0 5px 0 5px">~</span>
                      <el-input v-model="scope.row.area.high_bound" size="small" style="width: 40%" disabled/>
                    </div>
                    <div
                        v-if=" scope.row.parameter === '优化器' || scope.row.parameter === '损失函数'">
                      <el-select
                          v-model="scope.row.areaValue"
                          multiple
                          style="width: 85%"
                          disabled
                      >
                        <el-option
                            v-for="item in scope.row.area"
                            :key="item"
                            :label="item"
                            :value="item"
                        />
                      </el-select>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="area" label="调参步长" align="center" min-width="20%">
                <template #default="scope">
                  <!-- 保持原有的模板内容不变 -->
                  <div v-if="scope.row.tuneParam">
                    <div v-if="scope.row.parameter === '批次大小' || scope.row.parameter === '学习率' || scope.row.parameter === '迭代次数'
                    || scope.row.parameter === '惩罚项系数' || scope.row.parameter === '隐藏层数量' || scope.row.parameter === 'LSTM层数'
                    || scope.row.parameter === '序列长度' || scope.row.parameter === '最大迭代次数' || scope.row.parameter === '卷积核大小'
                    || scope.row.parameter === '输出通道数'||scope.row.parameter === '卷积层数'||scope.row.parameter === '弱学习器最大迭代次数'
                    ||scope.row.parameter === '叶子节点最小样本数'||scope.row.parameter === '再划分最小样本数'||scope.row.parameter === '树最大深度'">
                      <el-select v-model="scope.row.step.typeValue" style="margin-left: 10px;width: 50px" size="small"
                                 disabled>
                        <el-option
                            v-for="item in scope.row.step.type"
                            :key="item"
                            :label="item"
                            :value="item"
                        />
                      </el-select>
                      <el-input v-model="scope.row.step.value" size="small" style="margin-left: 10px;width: 80px"
                                disabled/>
                    </div>
                    <div v-if="scope.row.parameter === '损失函数'||scope.row.parameter === '优化器'">
                      <span>{{ scope.row.area }}</span>
                    </div>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  ArrowRight, 
  DataAnalysis, 
  Document, 
  DataLine, 
  Setting, 
  Edit, 
  Delete, 
  Bottom,
  Cpu,
} from '@element-plus/icons-vue';
import {useRoute} from 'vue-router';
import {ref} from 'vue';
import request from "@/utils/request";
import {ElMessage} from "element-plus";
import router from "@/router";
import {dictionaryC2E, dictionaryE2C} from "./taskStaticData"

export default {
  name: "taskDetails",
  data() {
    const C2E = dictionaryC2E;
    const E2C = dictionaryE2C;
    return {
      ArrowRight,
      DataAnalysis,
      Document,
      DataLine,
      Setting,
      Edit,
      Delete,
      Bottom,
      Cpu,
      taskName: '',
      taskId: '',
      taskType: '',
      taskState: '',
      taskLog: '',
      isTaskBest: true,
      pageIndex: '1',
      taskEvaluateData: [],
      partRowConfig: [],
      taskHistoryList: [],
      taskHistory: '',
      rowModel: true,
      colModel: true,
      taskDescription: '',
      taskConfiguration: '',
      dataDetails: [],
      colDefault: [],
      colSingle: [],
      modelDetails: [],
      dataDetailsLoading: false,
      modelName: '',
      ws: false,
      C2E,
      E2C,
      model: [],
      logLoading: false,
      redFlag: false,
      evaluationLoading: false,
      bestParamTableData: [],
      tableHeaderStyle: {
        background: '#f0f5fa',
        color: '#1a2942',
        fontSize: '14px',
        fontWeight: '600',
        textAlign: 'center',
        padding: '12px 0',
        borderBottom: '2px solid #4c75a3',
      }
    }
  },
  computed: {
    // 添加计算属性
    getStatusType() {
      if (this.taskState === '未启动') return 'info';
      if (this.taskState === '启动中') return 'warning';
      if (this.taskState === '运行中') return 'warning';
      if (this.taskState === '成功') return 'success';
      if (this.taskState === '失败') return 'danger';
      return 'info';
    }
  },
  created() {
    // this.evaluationLoading = true;
    this.loadTaskInfo();
    this.loadTaskConfiguration();
    this.loadHistoryTask();

  },
  mounted() {
    if (this.pageIndex === '1') {
      this.logConnection();
    }
  },
  beforeUnmount() {
    if (this.ws) {
      this.ws.close();
    }
  },
  watch: {
    pageIndex: {
      handler() {
        if (this.pageIndex === '1') {
          this.logConnection();
        }
      },
      deep: true,
    },
    taskHistory: {
      handler() {
        console.log(this.taskHistory);
        this.loadEvaluationReport();
      },
      deep: true,
    }
  },
  methods: {
    // 添加新方法
    clearLogs() {
      const messageElement = document.getElementById('messages');
      if (messageElement) {
        while (messageElement.firstChild) {
          messageElement.removeChild(messageElement.firstChild);
        }
      }
    },
    scrollToBottom() {
      const messageElement = document.getElementById('messages');
      if (messageElement) {
        messageElement.scrollTop = messageElement.scrollHeight;
      }
    },
    changeIndex(param) {
      this.pageIndex = param;
    },
    //跳转至修改任务页面
    modifyTask() {
      router.push({path: '/taskModify', query: {taskId: this.taskId}});
    },
    //加载任务的基本信息
    loadTaskInfo() {
      const route = useRoute();
      this.pageIndex = route.query.pageIndex;
      // console.log(this.pageIndex);
      this.taskId = route.query.taskId;
      this.taskState = route.query.taskState;
    },
    //加载任务的配置详情
    loadTaskConfiguration() {
      this.dataDetailsLoading = true;
      request.get('/TaskManage/GetTaskConfigurationById', {
        params: {task_id: this.taskId}
      }).then(res => {
        //捕获异常，防止加载效果因异常无法停止
        try {
          console.log(res.data, '这是当前任务的基本信息');
          this.modelName = res.data.configuration.model_parameters.type;
          this.taskName = res.data.name;
          this.taskType = res.data.type;

          this.taskConfiguration = res.data.configuration;
          this.taskDescription = res.data.task_desc;
          this.dataDetails = [];
          this.colDefault = [];
          this.colSingle = [];
          //加载模型配置new
          this.model = this.modelConfigProcess(res.data.configuration.model_parameters.hyperparameter);
          console.log(this.model, 'this.model')
          //数据详情

          let select_data = res.data.configuration.select_data
          let set_data = select_data.set_data;

          // m['dataSheet'] = select_data.table_id;
          // m['timeCol'] = select_data.time_column;
          // m['targetCol'] = select_data.target_column;
          // m['featureCol'] = select_data.characteristic_columns;
          set_data.forEach((item, index) => {
            let m = {};
            m['dataSet'] = select_data.set_id;
            m['taskType'] = this.E2C[select_data.task_type];
            m['dataSheetID'] = item.table_id;
            m['dataSheetName'] = item.table_name;
            m['timeCol'] = item.time_column
            m['targetCol'] = item.target_column;
            m['featureCol'] = item.characteristic_columns.join('; ');
            if (item.time_column === null) {
              m['timeCol'] = '——';
              console.log(item.characteristic_columns.length, 'length')
            }
            if (item.target_column === null) {
              m['targetCol'] = '——';
            }
            if (item.characteristic_columns.length === 0) {
              console.log(item.characteristic_columns.length)
              m['featureCol'] = '——';
            }
            console.log(item.characteristic_columns, "item.characteristic_columns")
            this.dataDetails.push(m);
          })


          this.rowModel = res.data.configuration.feature_engineering_strategy.record_processing.all;
          this.colModel = res.data.configuration.feature_engineering_strategy.column_processing.default;
          //加载字段处理的默认配置
          if (res.data.configuration.feature_engineering_strategy.column_processing.default) {
            res.data.configuration.feature_engineering_strategy.column_processing.default_config.forEach(item => {
              //有option时
              if (item[Object.keys(item)[0]] !== null) {
                let k = item[Object.keys(item)[0]];
                //缺失值填充和归一化特殊处理
                if (k.hasOwnProperty('data_filling_strategy') && (k['data_filling_strategy'] !== 'constant' || k['char_filling_strategy'] !== 'constant')) {

                  if (k['data_filling_strategy'] !== 'constant' && k['char_filling_strategy'] !== 'constant') {
                    this.colDefault.push({
                      colName: this.E2C[Object.keys(item)[0]],
                      methods: this.E2C['data_filling_strategy'],
                      value: this.E2C[k['data_filling_strategy']]
                    }, {
                      colName: this.E2C[Object.keys(item)[0]],
                      methods: this.E2C['char_filling_strategy'],
                      value: this.E2C[k['char_filling_strategy']]
                    })
                  } else if (k['data_filling_strategy'] === 'constant' && k['char_filling_strategy'] !== 'constant') {
                    Object.keys(k).forEach((op, index) => {

                      if (this.E2C[op] === '数值填充策略' || this.E2C[op] === '填充数值') {
                        let middle = {};
                        middle['colName'] = this.E2C[Object.keys(item)[0]];
                        middle['methods'] = this.E2C[op];
                        if (middle['methods'] === '数值填充策略') {
                          middle['value'] = this.E2C[k[op]]
                        } else {
                          middle['value'] = k[op]
                        }
                        this.colDefault.push(middle)
                      }
                    })
                    this.colDefault.push({
                      colName: this.E2C[Object.keys(item)[0]],
                      methods: this.E2C['char_filling_strategy'],
                      value: this.E2C[k['char_filling_strategy']]
                    })
                  } else if (k['char_filling_strategy'] === 'constant' && k['data_filling_strategy'] !== 'constant') {
                    this.colDefault.push({
                      colName: this.E2C[Object.keys(item)[0]],
                      methods: this.E2C['data_filling_strategy'],
                      value: this.E2C[k['data_filling_strategy']]
                    })
                    Object.keys(k).forEach((op, index) => {
                      if (this.E2C[op] === '字符填充策略' || this.E2C[op] === '填充字符') {
                        let middle = {};
                        middle['colName'] = this.E2C[Object.keys(item)[0]];
                        middle['methods'] = this.E2C[op];
                        if (middle['methods'] === '字符填充策略') {
                          middle['value'] = this.E2C[k[op]]
                        } else {
                          middle['value'] = k[op]
                        }
                        this.colDefault.push(middle)
                      }
                    })
                  }

                } else if (k.hasOwnProperty('scaling_strategy') && k['scaling_strategy'] !== 'robust') {
                  this.colDefault.push({
                    colName: this.E2C[Object.keys(item)[0]],
                    methods: this.E2C['scaling_strategy'],
                    value: this.E2C[k['scaling_strategy']]
                  })
                } else {
                  Object.keys(item[Object.keys(item)[0]]).forEach((op, i) => {
                    console.log(op, 'op in default')
                    let middle = {};
                    middle['colName'] = this.E2C[Object.keys(item)[0]];
                    middle['methods'] = this.E2C[op];
                    if (middle['methods'] === '数值填充策略' || middle['methods'] === '字符填充策略' || middle['methods'] === '归一化方法') {
                      middle['value'] = this.E2C[item[Object.keys(item)[0]][op]];
                    } else {
                      middle['value'] = item[Object.keys(item)[0]][op];
                    }
                    this.colDefault.push(middle);
                    console.log(this.colDefault, "this.colDefault")
                  })
                }
              }
              //无option时
              else {
                let middle = {};
                middle['colName'] = this.E2C[Object.keys(item)[0]];
                middle['methods'] = '——';
                middle['value'] = '——';
                this.colDefault.push(middle);
              }

            })
          }
          //加载字段处理的单字段配置
          else {
            Object.keys(res.data.configuration.feature_engineering_strategy.column_processing.single_config).forEach(item => {

              res.data.configuration.feature_engineering_strategy.column_processing.single_config[item].forEach((option, index) => {
                let middle = {};
                let columnsCutting = item.split("__")
                middle['tableName'] = columnsCutting[0];
                middle['colName'] = columnsCutting[1];
                middle['operator'] = this.E2C[Object.keys(option)[0]];
                // middle['config'] = JSON.stringify(Object.values(option)[0]);
                let config = {};
                //有option时
                if (Object.values(option)[0] !== null) {
                  let k = Object.values(option)[0];
                  //缺失值填充和归一化特殊处理
                  if (k['data_filling_strategy'] !== 'constant'&&k['char_filling_strategy'] === null) {
                      config[this.E2C['data_filling_strategy']] = this.E2C[k['data_filling_strategy']];
                  } else if(k['char_filling_strategy'] !== 'constant'&&k['data_filling_strategy'] === null){
                    config[this.E2C['char_filling_strategy']] = this.E2C[k['char_filling_strategy']];
                  } else if (k.hasOwnProperty('scaling_strategy') && k['scaling_strategy'] !== 'robust') {
                    config[this.E2C['scaling_strategy']] = this.E2C[k['scaling_strategy']];
                  } else {
                    Object.keys(k).forEach(item => {
                      if (Object.values(option)[0][item] != null) {
                        if(Object.values(option)[0][item]==='constant'||Object.values(option)[0][item]==='robust'){
                          config[this.E2C[item]] = this.E2C[Object.values(option)[0][item]];
                        }else {
                          config[this.E2C[item]] = Object.values(option)[0][item];
                        }

                      }
                    })
                  }
                  middle['config'] = JSON.stringify(config, null, ' ');
                }
                //无option时
                else {
                  middle['config'] = '——';
                }
                this.colSingle.push(middle);
              })

            })
            console.log(this.colSingle, 'this.colSingle')
          }

          //加载记录处理的使用部分记录
          if (!res.data.configuration.feature_engineering_strategy.record_processing.all) {
            Object.keys(res.data.configuration.feature_engineering_strategy.record_processing.columns).forEach((item, index) => {
              console.log('item', item);
              let columns = res.data.configuration.feature_engineering_strategy.record_processing.columns[item];
              let middle = {};
              middle['colName'] = item;
              middle['andOr'] = columns.contact;
              middle['operator'] = this.E2C[columns.type];
              if (columns.range.length > 1) {
                middle['value'] = JSON.stringify(columns.range);
              } else {
                middle['value'] = columns.range;
              }
              console.log(columns.range, 'columns.range');
              this.partRowConfig.push(middle);
            })
          }
        } catch (error) {
          console.log(error.message, 'error')
          this.dataDetailsLoading = false;
        }

        this.dataDetailsLoading = false;
      }).catch(err => {
        console.log(err, 'err')
      })

    },
    //加载任务的历史任务
    loadHistoryTask() {
      request.get('/TaskManage/GetSingleTaskDetail', {
        params: {
          task_id: this.taskId
        }
      }).then(res => {

        console.log(res.data);
        res.data.forEach(item => {
          this.taskHistoryList.push(item.history_id);
        })
        this.taskHistory = this.taskHistoryList[this.taskHistoryList.length - 1];
        console.log(this.taskHistory)
      }).catch(err => {
        ElMessage({
          message: "error",
          type: 'error',
          offset: 60
        });
      })

    },
    //连接日志
    logConnection() {
      const _this = this;
      _this.logLoading = true;
      let mark = 0;
      let messageNumber = 0;
      const ws = new WebSocket(`ws://192.168.109.198:8090/task/read_log/${this.taskId}`);
      _this.ws = ws;
      ws.onopen = function () {

        console.log('WS open')
      };
      ws.onclose = function () {
        console.log('WS close');
      };
      ws.onerror = function (event) {
        // console.log(event.data);
      };
      ws.onmessage = function (event) {
        if (event.data !== "pass") {
          messageNumber += 1;
          console.log(event.data, 'event.data')
          var messages = document.getElementById('messages');
          var message = document.createElement('li');
          var content = document.createTextNode(event.data);

          if (event.data.indexOf('| error |') >= 0 || event.data.indexOf('| ERROR |') >= 0) {
            message.style.color = 'red';
            this.redFlag = true;
          } else if (event.data.indexOf('| warning |') >= 0 || event.data.indexOf('| WARNING |') >= 0) {
            message.style.color = 'red';
            this.redFlag = false;
          } else if (event.data.indexOf('| INFO |') >= 0) {
            this.redFlag = false;
          }
          if (this.redFlag) {
            message.style.color = 'red';
          }
          if (event.data.indexOf('效果最好的模型超参数是：') >= 0) {
            mark = messageNumber;
            message.style.fontWeight = 'bold';
          }
          if ((messageNumber - mark === 1) && mark !== 0) {
            message.style.fontWeight = 'bold';
          }

          // message.style.color = 'red';
          message.appendChild(content);
          messages.appendChild(message);
        }
        _this.logLoading = false;
      };
    },
    //模型配置信息的加载和处理
    modelConfigProcess(param) {
      console.log(param, 'modelConfigProcess函数中的param');
      let middle = [];
      Object.keys(param).forEach((item, index) => {
        let ele = {}
        if (this.E2C[item]) {
          ele['parameter'] = this.E2C[item];
        } else {
          ele['parameter'] = item;
        }

        ele['tuneParam'] = param[item]['tuneParam'];
        if (param[item]['tuneParam']) {
          if (Object.keys(param[item]).includes('low_bound')) {
            ele['area'] = {low_bound: param[item]['low_bound'], high_bound: param[item]['high_bound']};
            ele['step'] = {typeValue: this.E2C[param[item]['step_type']], value: param[item]['step_value']};
          } else {
            ele['areaValue'] = param[item]['value'];
            ele['area'] = '——'
          }
          ele['defaultValue'] = '——';
        } else {
          ele['defaultValue'] = param[item]['defaultValue'];
          ele['area'] = '——';
          ele['areaValue'] = '——';
        }
        middle.push(ele);
      })
      console.log(middle, '这是modelConfigProcess函数中的middle')
      return middle;
    },
    //设置多表联合建模的字段合并
    tableColumnSpanMethod({row, column, rowIndex, columnIndex,}) {

      if (columnIndex === 0) {
        if (rowIndex === 0 || row.dataSet != this.dataDetails[rowIndex - 1].dataSet) {
          let rowspan = 0;
          this.dataDetails.forEach(element => {
            if (element.dataSet === row.dataSet) {
              rowspan++;
            }
          });
          return [rowspan, 1];
        } else {
          return [0, 0];
        }
      }
      if (columnIndex === 1) {
        if (rowIndex === 0 || row.taskType != this.dataDetails[rowIndex - 1].taskType) {
          let rowspan = 0;
          this.dataDetails.forEach(element => {
            if (element.taskType === row.taskType) {
              rowspan++;
            }
          });
          return [rowspan, 1];
        } else {
          return [0, 0];
        }
      }
    },

    // 设置单字段配置中字段的合并
    singleColumnSpanMethod({row, column, rowIndex, columnIndex,}) {
      //spanList可以理解为所占行数的列表
      const spanList0 = [];
      const spanList1 = [];
      let spanIndex0 = 0;
      let spanIndex1 = 0;
      let priorItemName = [];
      this.colSingle.forEach((item, index) => {
        //第一行
        if (index === 0) {
          spanList0.push(1)
        } else {
          //当前行和上一行字段相同时
          if (item.tableName === priorItemName) {
            spanList0[spanIndex0] += 1;
            spanList0.push(0)
          } else {
            spanList0.push(1);
            spanIndex0 = index;
          }
        }
        priorItemName = item.tableName;
      })
      //只对第一列进行合并
      if (columnIndex === 0) {
        const _row = spanList0[rowIndex];
        return {
          rowspan: _row,//合并行数
          colspan: 1,//列数
        };
      }

      this.colSingle.forEach((item, index) => {
        //第一行
        if (index === 0) {
          spanList1.push(1)
        } else {
          //当前行和上一行字段相同时
          if (item.colName === priorItemName) {
            spanList1[spanIndex1] += 1;
            spanList1.push(0)
          } else {
            spanList1.push(1);
            spanIndex1 = index;
          }
        }
        priorItemName = item.colName;
      })
      //只对第二列合并

      if (columnIndex === 1) {
        const _row = spanList1[rowIndex];
        return {
          rowspan: _row,//合并行数
          colspan: 1,//列数
        };
      }
    },

    // singleColumnSpanMethod({row,column,rowIndex,columnIndex}){
    //   /**
    //    * row：每一行的信息
    //    * column:列
    //    * rowIndex:行数
    //    * columnIndex:列数
    //    */
    //   // 只对前两列生效
    //   if (columnIndex === 0 || columnIndex === 1) {
    //     // 判断当前单元格和上一个单元格的值是否相同，如果相同则返回 [0, 0] 合并当前单元格
    //     if (rowIndex === 0 || (this.colSingle[rowIndex - 1].tableName !== row.tableName && this.colSingle[rowIndex - 1].colName !== row.colName)) {
    //       console.log(this.colSingle[rowIndex+1].tableName,"this.colSingle[rowIndex - 1][columnIndex]")
    //       let rowspan = 1;
    //       // 循环找到相邻且相同的单元格个数
    //       for (let i = rowIndex + 1; i < this.colSingle.length; i++) {
    //         if (this.colSingle[i].tableName === row.tableName&&this.colSingle[i].colName === row.colName) {
    //           rowspan++;
    //         } else {
    //           break;
    //         }
    //       }
    //       return [rowspan, 0];
    //     } else {
    //       return [0, 0];
    //     }
    //   } else {
    //     return [, 2];
    //   }
    // },
    defaultColumnSpanMethod({row, column, rowIndex, columnIndex,}) {
      //spanList可以理解为所占行数的列表
      const spanList = [];
      let spanIndex = 0;
      let priorItemName = '';
      this.colDefault.forEach((item, index) => {
        //第一行
        if (index === 0) {
          spanList.push(1);
        } else {
          //当前行和上一行字段相同时
          if (item.colName === priorItemName) {
            spanList[spanIndex] += 1;
            spanList.push(0);
          } else {
            spanList.push(1);
            spanIndex = index;
          }
        }
        priorItemName = item.colName;
      })
      //只对第一列进行合并
      if (columnIndex === 0) {
        const _row = spanList[rowIndex];
        return {
          rowspan: _row,
          colspan: 1
        };
      }
    },
    //加载任务的评估报告
    loadEvaluationReport() {
      this.evaluationLoading = true;
      request('/TaskManage/GetTrainResultData', {
        params: {
          task_id: this.taskId,
          history_id: this.taskHistory
        }
      }).then(res => {
        this.taskEvaluateData = [];
        this.bestParamTableData = [];
        Object.keys(res.data.evaluation).forEach(item => {
          let middle = {evaluateName: item, evaluateValue: res.data.evaluation[item].toFixed(4)};
          this.taskEvaluateData.push(middle);
        })
        Object.keys(res.data.model_conf).forEach(item => {
          let middle = {param: this.E2C[item], value: res.data.model_conf[item]};
          this.bestParamTableData.push(middle);
        })
        this.evaluationLoading = false;
        console.log(res.data, 'res.data in loadEvaluationReport')
      }).catch(err => {
        if (this.pageIndex === '2') {
          ElMessage({
            message: '加载报告失败！',
            type: 'error',
            offset: 60
          });
        }
        this.evaluationLoading = false;
      })
    },
  },
}
</script>

<style scoped>
/* 基础布局样式 */
.task-details-container {
  display: flex;
  flex-direction: column;
}

/* 头部区域 */
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

.tech-title {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.2);
}

.tech-title .el-icon {
  font-size: 22px;
  color: #ffffff;
}

.nav-breadcrumb {
  display: flex;
  align-items: center;
}

.tech-breadcrumb {
  font-size: 16px;
  font-weight: 600;
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

/* 主内容区域 */
.main-content-wrapper {
  background-color: white;
  margin: 0 20px 20px;
  border-radius: 8px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  min-height: calc(100vh - 150px);
}

/* 任务信息卡片 */
.task-info-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  margin-bottom: 20px;
}

.task-info-content {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.task-info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 13px;
  color: #909399;
}

.info-value {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.task-actions {
  display: flex;
  gap: 10px;
}

/* 标签页导航 */
.tab-section {
  margin-bottom: 20px;
}

.tab-menu {
  border-radius: 8px;
  background-color: #f1f5f9;
  border: 1px solid #ebeef5;
  overflow: hidden;
}

:deep(.el-menu--horizontal) {
  border-bottom: none;
}

:deep(.el-menu--horizontal .el-menu-item) {
  height: 50px;
  line-height: 50px;
  border-bottom: none;
  font-weight: 500;
}

:deep(.el-menu--horizontal .el-menu-item.is-active) {
  border-bottom: 3px solid #4c75a3;
  color: #4c75a3;
}

:deep(.el-menu--horizontal .el-menu-item:not(.is-active):hover) {
  color: #4c75a3;
}

/* 内容区域通用样式 */
.content-section {
  margin-bottom: 20px;
}

/* 日志面板 */
.log-panel {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.log-header {
  padding: 12px 15px;
  background-color: #f1f5f9;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-title {
  font-weight: 500;
  color: #1a2942;
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-actions {
  display: flex;
  gap: 10px;
}

.log-content {
  height: 500px;
  overflow: auto;
  padding: 10px;
  background-color: #1a1a1a;
  font-family: 'Courier New', Courier, monospace;
  color: #e0e0e0;
  font-size: 14px;
  line-height: 1.5;
}

/* 日志样式 */
:deep(#messages li) {
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: 4px;
  padding: 2px 0;
}

:deep(#messages li[style*="color: red"]) {
  color: #ff6b6b !important;
}

:deep(#messages li[style*="font-weight: bold"]) {
  font-weight: bold;
  color: #ff9ff3 !important;
  background-color: rgba(255, 159, 243, 0.1);
  padding: 4px;
  border-radius: 4px;
}

/* 历史任务选择器 */
.history-selector {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
}

.history-select {
  width: 200px;
}

/* 区块卡片 */
.section-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #ebeef5;
  overflow: hidden;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f8fafc;
}

.section-line {
  width: 4px;
  height: 18px;
  background-color: #4c75a3;
  border-radius: 2px;
  margin-right: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2942;
}

.section-content {
  padding: 20px;
}

/* 信息网格布局 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item.full-width {
  grid-column: span 2;
}

/* 特征工程区块 */
.feature-section {
  margin-bottom: 25px;
}

.feature-section:last-child {
  margin-bottom: 0;
}

.feature-title {
  font-weight: 600;
  color: #1a2942;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e0e7ee;
}

.feature-content {
  padding-left: 20px;
}

.feature-option {
  background-color: #f0f5fa;
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  color: #4c75a3;
  font-weight: 500;
  display: inline-block;
}

/* 模型名称样式 */
.model-name {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background-color: #f0f5fa;
  border-radius: 6px;
  margin-bottom: 20px;
  color: #1a2942;
  font-weight: 500;
}

.model-name .el-icon {
  color: #4c75a3;
}

/* 数据表格 */
.data-table {
  width: 100%;
  margin-top: 10px;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: #f8fafc;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background-color: #f0f7ff;
}

/* 加载动画样式 */
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.9);
}

:deep(.el-loading-text) {
  color: #4c75a3;
}

:deep(.el-loading-spinner .path) {
  stroke: #4c75a3;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .task-info-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .task-info-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-item.full-width {
    grid-column: span 1;
  }
  
  .log-content {
    height: 400px;
  }
}
</style>