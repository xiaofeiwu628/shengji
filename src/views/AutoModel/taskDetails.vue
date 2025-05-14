<template>
  <div>
    <div style="margin: 20px 0 0 2%">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/taskView' }">自动建模</el-breadcrumb-item>
        <el-breadcrumb-item>日志</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!--    <el-divider style="margin: 15px 0 0 0" />-->
    <div style="background-color: white;margin: 20px;min-height: calc(100vh - 124px)">
      <div style="margin: 40px 0 0 30px;display: inline-block;width: 88%">
        <span><b>任务ID：</b> </span>
        <span>{{ this.taskId }}</span>
        <span style="margin:  0 0 0 100px"><b>任务名称：</b> </span>
        <span>{{ this.taskName }}</span>
        <span style="margin:  0 0 0 100px"><b>任务类型：</b> </span>
        <span>{{ E2C[this.taskType] }}</span>
        <span style="margin:  0 0 0 100px"><b>任务状态：</b> </span>
        <span>{{ this.taskState }}</span>
      </div>
      <div style="display: inline-block;">
        <el-button :disabled="this.taskState !== '未启动'" @click="modifyTask">修改配置</el-button>
      </div>

      <div style="margin:20px 2% 0 2%">
        <el-menu class="el-menu-m" mode="horizontal" :default-active="pageIndex">
          <el-menu-item index="1" @click="changeIndex('1')">日志</el-menu-item>
          <el-menu-item index="2" @click="changeIndex('2')">评估报告</el-menu-item>
          <el-menu-item index="3" @click="changeIndex('3')">配置详情</el-menu-item>
        </el-menu>
        <!--      <router-view style="margin-bottom: 30px" />-->
      </div>
      <!--    日志-->
      <div v-if="pageIndex === '1'">
        <!--        <div style="margin: 20px 0 0 2%">-->
        <!--          <span>历史任务：</span>-->
        <!--          <el-select v-model="taskHistory"  style="margin: 0 20px 0 20px" @change="changeTaskIndex" class="input">-->
        <!--            <el-option-->
        <!--                v-for="item in taskHistoryList"-->
        <!--                :key="item"-->
        <!--                :label="item"-->
        <!--                :value="item"-->
        <!--            />-->
        <!--          </el-select>-->
        <!--        </div>-->
        <div style="margin: 30px 2% 0 2%">
          <!--        <el-input v-model="taskLog" placeholder="暂无日志！" type="textarea" rows="15" @change="$forceUpdate()"/>-->
          <ul id='messages' style="margin: 20px 0 0 0;border: black 3px solid" v-loading="logLoading">
          </ul>
        </div>
      </div>
      <!--    评估报告-->
      <div v-if="pageIndex === '2'">
        <div style="margin: 20px 0 0 2%">
          <span>历史任务：</span>
          <el-select v-model="taskHistory" style="margin: 0 20px 0 20px" @change="changeTaskIndex" class="input">
            <el-option
                v-for="item in taskHistoryList"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
        </div>
        <!--        评价指标-->
        <div>
          <div style="margin: 20px 0 0 2%">
            <div class="task-title-div"></div>
            <span class="task-title-name">评价指标</span>
          </div>
          <div>
            <el-table :data="taskEvaluateData" border style="width:650px;margin: 20px 0 0 2%"
                      v-loading="evaluationLoading" :header-cell-style="{background:'#F5F5F5'}">
              <el-table-column property="evaluateName" label="评价指标" width="350px" align="center"/>
              <el-table-column property="evaluateValue" label="数值" width="300px" align="center"/>
            </el-table>
          </div>
        </div>
        <!--        最优超参数-->
        <!--        <div>-->
        <!--          <div style="margin: 30px 0 0 20px">-->
        <!--            <div class="task-title-div"></div>-->
        <!--            <span class="task-title-name">最优超参数</span>-->
        <!--          </div>-->
        <!--          <div>-->
        <!--            <el-table :data="bestParamTableData" border style="width:650px;margin: 20px 0 0 2%" v-loading="evaluationLoading" :header-cell-style="{background:'#F5F5F5'}">-->
        <!--              <el-table-column property="param" label="参数" width="350px" align="center" />-->
        <!--              <el-table-column property="value" label="数值" width="300px" align="center" />-->
        <!--            </el-table>-->
        <!--          </div>-->
        <!--        </div>-->

      </div>
      <!--    配置详情-->
      <div v-if="pageIndex === '3'">
        <!--      基本信息-->
        <div>
          <div style="margin: 30px 0 0 2%">
            <div class="task-title-div"></div>
            <span class="task-title-name">基本信息</span>
          </div>
          <div>
            <div style="margin: 30px 0 0 100px">
              <span class="span-d">任务名称：</span>
              <span style="display: inline-block">{{ this.taskName }}</span>
            </div>
            <div style="margin: 30px 0 0 100px">
              <span class="span-d">任务ID：</span>
              <span style="display: inline-block">{{ this.taskId }}</span>
            </div>
            <div style="margin: 30px 0 0 100px">
              <span class="span-d">任务描述：</span>
              <span style="display: inline-block">{{ this.taskDescription }}</span>
            </div>
          </div>
        </div>
        <!--      数据详情-->
        <div>
          <div style="margin: 30px 0 0 2%">
            <div class="task-title-div"></div>
            <span class="task-title-name">数据详情</span>
          </div>
          <div style="margin: 30px 0 0 100px">
            <el-table
                :data="dataDetails"
                border style="width:90%;"
                :header-cell-style="{background:'#F5F5F5',color:'#303133'}"
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
        <!--      特征工程配置-->
        <div>
          <div style="margin: 30px 0 0 2%">
            <div class="task-title-div"></div>
            <span class="task-title-name">特征工程配置</span>
          </div>
          <div style="margin: 30px 0 0 100px">
            <!--          记录处理-->
            <div>
              <span style="display: inline-block;vertical-align: top">记录处理：</span>
              <div style="display: inline-block;width: 50%">
                <!--              all-->
                <div v-if="rowModel">
                  <span style="display: inline-block">{{ '使用全部记录' }}</span>
                </div>
                <!--              part-->
                <div v-if="!rowModel">
                  <span style="display: inline-block">{{ '使用部分记录' }}</span>
                  <el-table :data="partRowConfig" border style="width:100%;margin: 10px 0 0 0 "
                            v-loading="dataDetailsLoading" :header-cell-style="{background:'#F5F5F5',color:'#303133'}">
                    <el-table-column property="andOr" label="字段间逻辑" min-width="20%" align="center"/>
                    <el-table-column property="colName" label="字段" min-width="34%" align="center"/>
                    <el-table-column property="operator" label="字段操作逻辑" min-width="23%" align="center"/>
                    <el-table-column property="value" label="取值" min-width="23%" align="center"/>
                  </el-table>
                </div>
              </div>
            </div>

            <!--          字段处理-->
            <div style="margin: 30px 0 0 0">
              <span style="display: inline-block;vertical-align: top">字段处理：</span>
              <div style="display: inline-block;width: 60%">
                <!--              default-->
                <div v-if="colModel">
                  <span style="display: inline-block">{{ '所有字段使用相同配置' }}</span>
                  <el-table
                      :data="colDefault" border
                      style="width:100%;margin: 20px 0 0 0 "
                      v-loading="dataDetailsLoading"
                      :header-cell-style="{background:'#F5F5F5',color:'#303133'}"
                      :span-method="defaultColumnSpanMethod">
                    <el-table-column property="colName" label="特征策略" min-width="20%" align="center"/>
                    <el-table-column property="methods" label="配置项" min-width="20%" align="center"/>
                    <el-table-column property="value" label="取值" min-width="60%" align="center"/>
                  </el-table>
                </div>
                <!--              singleCol-->
                <div v-if="!colModel">
                  <span>{{ '逐字段分别配置' }}</span>
                  <el-table :data="colSingle" border
                            style="width: 100%;margin: 10px 0 0 0 "
                            v-loading="dataDetailsLoading"
                            max-height="500px"
                            :header-cell-style="{background:'#F5F5F5',color:'#303133'}"
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
        <!--      模型配置信息-->
        <div style="padding: 1px">
          <div style="margin: 30px 0 0 2%">
            <div class="task-title-div"></div>
            <span class="task-title-name">模型配置信息</span>
          </div>
          <div style="margin: 30px 0 20px 100px">
            <span>模型名称：{{ modelName }}</span>
          </div>
          <!--        样式二-->
          <div style="margin: 30px 0 20px 100px">
            <el-table :data="model" border :header-cell-style="{background:'#F5F5F5',color:'#303133'}"
                      style="width: 70%">
              <el-table-column prop="parameter" label="参数" min-width="15%" align="center"/>
              <el-table-column prop="" label="是否调参" min-width="15%" align="center">
                <template #default="scope">
                  <el-switch v-model="scope.row.tuneParam" style="margin-left: 0px" disabled/>
                </template>
              </el-table-column>
              <el-table-column prop="defaultValue" label="默认取值" min-width="15%" align="center"/>
              <el-table-column prop="areaValue" label="调参范围" min-width="35%" align="center">
                <template #default="scope">
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
              <!--            <el-table-column prop="description" label="说明"  align="center"/>-->
            </el-table>
          </div>
        </div>

      </div>
    </div>


  </div>
</template>

<script>
import {ArrowRight} from '@element-plus/icons-vue';
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
.el-menu-m {
  height: 50px;
  background-color: #E8ECFA;
}

.span-d {
  display: inline-block;
  width: 100px;
  text-align: left;
  vertical-align: top;
}

#messages {
  list-style-type: none;
  height: 500px;
  overflow: auto;
}
</style>
