<template>
  <div>
    <div style='margin: 20px 0 0 2%'>
      <el-breadcrumb :separator-icon='ArrowRight'>
        <el-breadcrumb-item :to="{ path: '/taskView' }">自动建模</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/taskModify' }" @click='this.pageIndex = 0' v-if="pageIndex >= 0">新建任务</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/taskModify' }" @click='this.pageIndex = 1' v-if="pageIndex >= 1">选择数据</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/taskModify' }" @click='this.pageIndex = 2' v-if="taskTypeValue !== 'named_entity_recognition' && pageIndex >= 2">特征工程策略</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/taskModify' }" @click='this.pageIndex = 3' v-if="pageIndex >= 3">模型选择</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/taskModify' }" @click='this.pageIndex = 4' v-if="pageIndex >= 4">其他参数配置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div style='background-color: white; margin: 20px; min-height: calc(100vh - 124px)'>
      <!--    新建任务-->
      <div v-if='pageIndex === 0' v-loading='loading'>
        <div style='padding: 20px 0 20px 0'>
          <div style='margin: 0 0 0 20px'>
            <div class='task-title-div'></div>
            <span class='task-title-name'>基本信息</span>
          </div>
          <div style='margin: 0 0 0 30px'>
            <div style='margin: 40px 0 0 40px'>
              <span class='span-d'>* 任务名称：</span>
              <div style='display: inline-block'>
                <el-input v-model='taskName' placeholder='限制50个字符以内' maxlength='50' type='text' class='input' />
                <br />
                <span
                  style='margin: 10px 0 0 20px; color: firebrick; font-size: 14px; display: inline-block'
                  v-if='nameRepeat'
                >该任务名称重复，请重新输入！</span
                >
                <span
                  style='margin: 10px 0 0 20px; color: firebrick; font-size: 14px; display: inline-block'
                  v-if='nameLack'
                >请输入任务名称！</span
                >
              </div>
            </div>

            <div style='margin: 40px 0 0 40px'>
              <span class='span-d' style='vertical-align: top'>任务描述：</span>
              <div style='width: 380px; display: inline-block'>
                <el-input
                  v-model='taskDescription'
                  placeholder='限制100个字符以内'
                  maxlength='100'
                  type='textarea'
                  class='input'
                  rows='5'
                />
                <div style='margin: 30px 0 0 0; text-align: right'>
                  <el-button @click='backToTaskView' class='button-m'>取消</el-button>
                  <el-button type='primary' color='#626aef' @click='checkName' class='button-m'>下一步</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--    选择数据-->
      <div v-if='pageIndex === 1'>
        <div style='padding: 20px 0 20px 0'>
          <div style='margin: 0 0 0 20px'>
            <div class='task-title-div'></div>
            <span class='task-title-name'>选择数据</span>
          </div>
          <div style='margin: 0 0 0 60px'>
            <div style='margin: 30px 0 0 40px; height: 40px'>
              <span class='span-d'>* 选择数据集：</span>
              <div style='display: inline-block'>
                <el-select
                  v-model='dataSetValue'
                  style='margin: 0 20px 0 20px'
                  @change='changeDataSetIndex'
                  class='input'
                >
                  <el-option v-for='item in dataSet' :key='item.value' :label='item.label' :value='item.value' />
                </el-select>
                <br />
                <span
                  style='margin: 10px 0 0 20px; color: firebrick; font-size: 14px; display: inline-block'
                  v-if='dataSetLack'
                >请选择数据集！</span
                >
              </div>
            </div>
            <!--            选择数据表-->
            <div style='margin: 30px 0 0 40px; height: 40px'>
              <span class='span-d'>* 选择数据表：</span>
              <div style='display: inline-block'>
                <el-select
                  v-model='dataSheetValue'
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  style='margin-left: 20px'
                  @change='changeMultipleDataSheetIndex'
                  class='input'
                >
                  <el-option
                    v-for='item in dataSheet'
                    :key='item.value'
                    :label='item.label'
                    :value='item.value'
                    :disabled='item.disabled'
                  />
                </el-select>
                <el-icon :size='16' style='vertical-align: middle; margin-left: 20px'>
                  <InfoFilled />
                </el-icon>
                <span style='margin-left: 10px; display: inline-block; vertical-align: middle'
                >当选择多个数据表时，各个数据表的行数需相等。</span
                >
                <br />
                <span
                  style='margin: 10px 0 0 20px; color: firebrick; font-size: 14px; display: inline-block'
                  v-if='dataSheetLack'
                >请选择数据表！</span
                >
              </div>
            </div>
            <!--            选择任务类型-->
            <div style='margin: 30px 0 0 40px; height: 40px'>
              <span class='span-d'>* 任务类型：</span>
              <div style='display: inline-block'>
                <el-select disabled v-model='taskTypeValue' style='margin-left: 20px' @change='changeModelList' class='input'>
                  <el-option v-for='item in taskType' :key='item.value' :label='item.label' :value='item.value' />
                </el-select>
                <br />
                <span
                  style='margin: 10px 0 0 20px; color: firebrick; font-size: 14px; display: inline-block'
                  v-if='taskTypeLack'
                >请选择任务类型！</span
                >
              </div>
            </div>
            <!--            时间序列预测-->
            <div style='margin: 30px 0 0 40px; height: 40px' v-if="taskTypeValue === 'time_series_prediction'">
              <span class='span-d'>* 选择时间字段：</span>
              <div style='display: inline-block'>
                <el-cascader
                  v-model='timeColValue'
                  style='margin-left: 20px; width: 357px'
                  class='input'
                  :options='this.columnsCascader'
                />
                <br />
                <span
                  style='margin: 10px 0 0 20px; color: firebrick; font-size: 14px; display: inline-block'
                  v-if='timeColLack'
                >请选择时间字段！</span
                >
              </div>
            </div>

            <div style='margin: 30px 0 0 40px; height: 40px' v-if="taskTypeValue === 'time_series_prediction'">
              <span class='span-d'>* 选择目标字段：</span>
              <div style='display: inline-block'>
                <!--            多数据表选择目标字段-->
                <el-cascader
                  v-model='targetColValue'
                  style='margin-left: 20px; width: 357px'
                  class='input'
                  :options='this.columnsCascader'
                />
                <!--                    @change="this.disabledColumns"-->

                <br />
                <span
                  style='margin: 10px 0 0 20px; color: firebrick; font-size: 14px; display: inline-block'
                  v-if='targetColLack'
                >请选择目标字段！</span
                >
              </div>
            </div>

            <div style='margin: 30px 0 0 40px' v-if='taskTypeValue !== "named_entity_recognition"'>
              <span class='span-d' style='vertical-align: top'>* 选择特征字段：</span>
              <div style='display: inline-block; width: 380px'>
                <!--            多数据表选择特征字段-->
                <el-cascader
                  v-model='featureColValue'
                  :options='this.featureColCascader'
                  :props='this.props'
                  style='margin-left: 20px; width: 357px'
                  class='input'
                  collapse-tags
                  collapse-tags-tooltip
                  clearable
                  @change='disabledFeatureColumns'
                />

                <br />
                <span
                  style='margin: 10px 0 0 20px; color: firebrick; font-size: 14px; display: inline-block'
                  v-if='featureColLack'
                >请选择特征字段！</span
                >
              </div>
            </div>
            <div style='margin: 30px 0 0 25%;'>
              <el-button @click='backToTaskView' class='button-m'>取消</el-button>
              <el-button type='primary' color='#626aef' @click='this.pageIndex = 0' class='button-m'
              >上一步
              </el-button>
              <el-button
                type='primary'
                color='#626aef'
                @click='checkDataSet(), saveDataSelectedInPage1()'
                class='button-m'
              >下一步
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!--    特征工程策略-->
      <div v-if='pageIndex === 2' v-loading='loading'>
        <div style='padding: 20px 0 20px 0'>
          <div style='margin: 0 0 0 20px'>
            <div class='task-title-div'></div>
            <span class='task-title-name'>特征工程策略</span>
          </div>

          <div style='margin: 0 0 0 40px'>
            <div style='margin: 40px 0 0 40px'>
              <span class='span-m'>* 记录处理：</span>
              <el-radio-group v-model='rowValue' style='margin-left: 20px'>
                <el-radio label='1'>使用全部记录</el-radio>
                <el-radio label='2'>使用部分记录</el-radio>
              </el-radio-group>
            </div>
            <!--            使用全部记录-->
            <div style='margin: 20px 0 0 180px; font-size: 13px' v-if="rowValue === '1'">
              <span style='margin-left: 0px; color: cornflowerblue'>选择此选项将默认使用全部记录进行任务。</span>
            </div>
            <!--            使用部分记录-->
            <div style='margin: 10px 0 0 180px; font-size: 13px' v-if="rowValue === '2'">
              <div>
                <el-icon :size='15' style='vertical-align: middle'>
                  <InfoFilled />
                </el-icon>
                <span style='margin-left: 5px; color: #262626; font-size: 13px'>AND优先级大于OR。</span>
              </div>
              <div style='margin: 10px 0 0 0' v-for='item in partialRowList'>
                <el-select
                  v-model='item.andOr'
                  style='margin-left: 0px; margin-right: 10px; width: 100px'
                  v-if='item.index !== 0'
                >
                  <el-option v-for='item in andOrList' :key='item' :label='item' :value='item' />
                </el-select>
                <!--                <el-select v-model="item.col" :style="setStyle(item)" @change="partRecordChanged(item)">-->
                <!--                  <el-option-->
                <!--                      v-for="option in userSelectedSingleCol"-->
                <!--                      :key="option.label"-->
                <!--                      :label="option.label"-->
                <!--                      :value="option.label"-->
                <!--                      :disabled="(!numericalList.includes(option.label) || selectedInPage2OfPartRecord.includes(option.label)) && item.col !== option.label"-->
                <!--                  />-->
                <!--                </el-select>-->
                <el-cascader
                  v-model='item.col'
                  style='setStyle(item)'
                  :options='this.numericalList'
                  @change='disabledSelectedNumericCol(), partRecordChanged(item)'
                />
                <el-select v-model='item.operator' style='margin-left: 10px; width: 150px'>
                  <el-option v-for='option in operatorList' :key='option' :label='option' :value='option' />
                </el-select>
                <el-input
                  v-model='item.low_bound'
                  type='number'
                  style='margin-left: 10px; width: 100px'
                  class='input-a'
                />
                <span style='margin: 0 0 0 10px' v-if="item.operator === '之间'">to</span>
                <el-input
                  v-model='item.high_bound'
                  type='number'
                  style='margin-left: 10px; width: 100px'
                  v-if="item.operator === '之间'"
                  class='input-a'
                />
                <el-button
                  v-if='item.index === 0'
                  type='primary'
                  :icon='CirclePlus'
                  class='options'
                  circle
                  @click='addColProcess'
                />
                <el-button
                  v-if='item.index !== 0'
                  type='primary'
                  :icon='Remove'
                  class='options'
                  circle
                  @click='deleteColProcess'
                />
              </div>
            </div>

            <div style='margin: 30px 0 0 40px'>
              <span class='span-m'>* 字段处理：</span>
              <el-radio-group v-model='colValue' style='margin-left: 20px'>
                <el-radio label='1'>所有字段使用相同配置</el-radio>
                <el-radio label='2'>逐字段分别配置</el-radio>
              </el-radio-group>
            </div>

            <div style='width: 60%; margin: 20px 0 0 180px'>
              <!--              默认字段处理-->
              <div v-show="colValue === '1'">
                <el-table
                  :data='columnDefaultConfig'
                  border
                  id='columnDefault'
                  ref='multipleTableRef'
                  @selection-change='handleSelectionChange'
                  :header-cell-style="{
                    background: '#F5F5F5',
                    color: '#303133',
                    height: '50px',
                  }"
                >
                  <el-table-column type='selection' min-width='5%' align='center' />
                  <el-table-column prop='name' label='名称' min-width='15%' align='center' />
                  <el-table-column prop='' label='配置' min-width='50%' align='center'>
                    <template #default='scope'>
                      <div v-if="scope.row.name === '缺失值填充' || scope.row.name === '归一化'">
                        <div v-for='(option, index) in scope.row.options' style='margin: 10px 0 0 0'>
                          <div>
                            <div v-if="index === 0 || (scope.row.name === '缺失值填充' ? index === 2 : false)">
                              <span class='span-l' style='width: 30%'>{{ option.name }}{{ ":" }}</span>
                              <el-select v-model='option.modelValue' style='margin-left: 0px; width: 50%'>
                                <el-option v-for='item in option.value' :key='item' :label='item' :value='item' />
                              </el-select>
                            </div>
                            <div v-if="index === 1 && scope.row.options[0].modelValue == 'Constant'">
                              <span class='span-l' style='width: 30%'>{{ option.name }}{{ ":" }}</span>
                              <el-input
                                v-model.number='option.modelValue'
                                type='number'
                                style='margin-left: 0px; width: 50%'
                                class='input-a'
                              />
                            </div>
                            <div v-if="index === 3 && scope.row.options[2].modelValue == 'Constant'">
                              <span class='span-l' style='width: 30%'>{{ option.name }}{{ ":" }}</span>
                              <el-input v-model='option.modelValue' type='text' style='margin-left: 0px; width: 50%' />
                            </div>
                            <div v-if="index > 0 && scope.row.options[0].modelValue == 'Robust'">
                              <span class='span-l' style='width: 30%'>{{ option.name }}{{ ":" }}</span>
                              <el-input-number
                                v-model='option.modelValue'
                                :min='0'
                                :max='100'
                                :step='1'
                                controls-position='right'
                                class='number-input'
                                style='margin-left: 0; width: 50%'
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-if="scope.row.name === '共线性特征去除' || scope.row.name === 'OneHot编码'">
                        <div v-for='option in scope.row.options' v-if="option !== ''">
                          <span class='span-l' style='width: 30%'>{{ option.name }}{{ ":" }}</span>
                          <el-input-number
                            v-model='option.modelValue'
                            :min="scope.row.name === '共线性特征去除' ? 1 : 1"
                            :max="scope.row.name === '共线性特征去除' ? 20 : 20"
                            :step='1'
                            controls-position='right'
                            class='number-input'
                            style='margin-left: 0; width: 50%'
                          />
                        </div>
                      </div>
                      <div v-if="scope.row.name === '离群点去除'">
                        <div v-for='(option, index) in scope.row.options' style='margin: 10px 0 0 0'>
                          <div v-if='index === 0'>
                            <span class='span-l' style='width: 31%'>{{ option.name }}{{ ":" }}</span>
                            <el-select
                              v-model='option.modelValue'
                              collapse-tags
                              placeholder='请选择'
                              style='margin-left: 0px; width: 50%'
                            >
                              <el-option v-for='item in option.value' :key='item' :label='item' :value='item' />
                            </el-select>
                          </div>
                          <div
                            style='margin: 10px 0 0 0'
                            v-if="
                              (index === 1 && scope.row.options[0].modelValue === 'mad') ||
                              (index === 2 && scope.row.options[0].modelValue === '3sigma')
                            "
                          >
                            <span class='span-l' style='width: 31%'>{{ option.name }}{{ ":" }}</span>
                            <el-input-number
                              v-model='option.modelValue'
                              controls-position='right'
                              class='number-input'
                              style='margin-left: 0; width: 50%'
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop='description' label='说明' min-width='35%' align='center' />
                </el-table>
              </div>
              <!--              单字段处理-->
              <div v-show="colValue === '2'">
                <div>
                  <el-icon :size='15' style='vertical-align: middle'>
                    <QuestionFilled />
                  </el-icon>
                  <span style='margin-left: 0px; color: #505458; font-size: 13px'
                  >字段内所选特征工程算子将按照顺序依次执行。</span
                  >
                </div>

                <div style='display: inline-block; margin: 10px 0 0 0; width: 100%'>
                  <!--                  <el-checkbox-group v-model="tableColumns">-->

                  <el-collapse v-model='activeNames' class='collapsefont'>
                    <el-collapse-item v-for='item1 in selectedSingleCol' :title='item1.label' :name='item1.value'>
                      <div v-for='(item, index) in userSelectedSingleCol' style='margin: 15px 0 0 0'>
                        <div v-if='item1.label === item.label[0]'>
                          <el-checkbox v-model='item.used' style='width: 5%; vertical-align: middle' />
                          <span
                            style='display: inline-block; min-width: 22%; color: #505458'
                            v-html='checkSpecialCol(item.label)'
                          >
                          </span>
                          <el-select
                            v-model='item.optionsName'
                            multiple
                            placeholder='请选择'
                            style='width: 35%; margin-left: 10px'
                            @remove-tag='removeTag'
                            @change='changeSingeColFeature($event, index, item)'
                          >
                            <el-option
                              v-for='option in seriesFeatureTableData'
                              :key='option'
                              :label='option'
                              :value='option'
                              v-if="item.dataType === 'float8' && item.colType === 'feature'"
                            />
                            <el-option
                              v-for='option in stringFeatureTableData'
                              :key='option'
                              :label='option'
                              :value='option'
                              v-if="item.dataType === 'varchar' && item.colType === 'feature'"
                            />
                            <el-option
                              v-for='option in timeFeatureTableData'
                              :key='option'
                              :label='option'
                              :value='option'
                              v-if="
                                item.colType === 'time' || (item.colType === 'target' && item.dataType === 'float8')
                              "
                            />
                            <el-option
                              v-for='option in targetFeatureTableData'
                              :key='option'
                              :label='option'
                              :value='option'
                              v-if="item.colType === 'target' && item.dataType === 'varchar'"
                            />
                          </el-select>
                          <!--                  修改单字段单个特征的配置界面，添加参数配置按钮，修改交互逻辑-->
                          <el-button
                            style='margin: 0 0 0 32px'
                            @click='openSingleFeature(item, index)'
                            :disabled='!item.used'
                          >
                            参数配置
                          </el-button>
                        </div>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>

                <!--              参数配置的弹窗-->
                <div>
                  <el-dialog v-model='singleFeatureDialogVisible' :title='currentCol' width='500px'>
                    <div>
                      <div>
                        <div
                          style='
                            display: inline-block;
                            background-color: black;
                            height: 16px;
                            width: 3px;
                            margin-right: 10px;
                            vertical-align: middle;
                          '
                        ></div>
                        <span>选择配置项：</span>
                        <el-select
                          v-model='singleColFeatureName'
                          placeholder='请选择'
                          style='width: 240px; margin: 0 0 0 10px'
                          @change='changeSingleColFeature'
                        >
                          <el-option v-for='item in singleColFeatureNameList' :key='item' :label='item' :value='item' />
                        </el-select>
                      </div>
                      <div v-if="singleColFeatureName === '缺失值填充'" style='margin: 30px 0 0 20px'>
                        <div v-for='(option, index) in singleColFeatureDetails' style='margin: 10px 0 0 0'>
                          <div>
                            <!--                            <div v-if="index === (currentColDataType === 'float8' ? 0 : 2)">-->
                            <div v-if="option.name === '数值填充策略' && currentColDataType == 'float8'">
                              <span class='span-f'>{{ option.name }}{{ ":" }}</span>
                              <el-select
                                v-model='option.modelValue'
                                style='margin-left: 10px; width: 40%'
                                @change='changeSingleDetails($event, option.name)'
                              >
                                <el-option v-for='item in option.value' :key='item' :label='item' :value='item' />
                              </el-select>
                              <!--                              配置说明-->
                              <div class='tooltip'>
                                <el-tooltip effect='light' placement='top-start'>
                                  <template #content>
                                    <div v-for='item in disposalMethodDescript'>
                                      <div v-if="item.name === '数值填充策略'">
                                        <div v-for='(op, index) in Object.keys(item.description)'>
                                          {{ op }}：{{ Object.values(item.description)[index] }}<br />
                                        </div>
                                      </div>
                                    </div>
                                  </template>
                                  <el-icon :size='16' style='vertical-align: middle; margin-left: 2px; color: black'>
                                    <InfoFilled />
                                  </el-icon>
                                </el-tooltip>
                              </div>
                            </div>
                            <div v-if="option.name === '字符填充策略' && currentColDataType == 'varchar'">
                              <span class='span-f'>{{ option.name }}{{ ":" }}</span>
                              <el-select
                                v-model='option.modelValue'
                                style='margin-left: 10px; width: 40%'
                                @change='changeSingleDetails($event, option.name)'
                              >
                                <el-option v-for='item in option.value' :key='item' :label='item' :value='item' />
                              </el-select>
                              <!--                              配置说明-->
                              <div class='tooltip'>
                                <el-tooltip effect='light' placement='top-start'>
                                  <template #content>
                                    <div v-for='item in disposalMethodDescript'>
                                      <div v-if="item.name === '字符填充策略'">
                                        <div v-for='(op, index) in Object.keys(item.description)'>
                                          {{ op }}：{{ Object.values(item.description)[index] }}<br />
                                        </div>
                                      </div>
                                    </div>
                                  </template>
                                  <el-icon :size='16' style='vertical-align: middle; margin-left: 2px; color: black'>
                                    <InfoFilled />
                                  </el-icon>
                                </el-tooltip>
                              </div>
                            </div>

                            <div
                              v-if="
                                option.name == '填充数值' &&
                                currentColDataType == 'float8' &&
                                singleColFeatureDetails[0].modelValue == 'Constant'
                              "
                            >
                              <span class='span-f'>{{ option.name }}{{ ":" }}</span>
                              <el-input
                                v-model.number='option.modelValue'
                                type='number'
                                style='margin-left: 10px; width: 40%'
                                @change='changeSingleDetails($event, option.name)'
                                class='input-a'
                              />
                            </div>

                            <div
                              v-if="
                                option.name == '填充字符' &&
                                currentColDataType == 'varchar' &&
                                singleColFeatureDetails[index - 1].modelValue == 'Constant'
                              "
                            >
                              <span class='span-f'>{{ option.name }}{{ ":" }}</span>
                              <el-input
                                v-model='option.modelValue'
                                type='text'
                                style='margin-left: 10px; width: 40%'
                                @change='changeSingleDetails($event, option.name)'
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-if="singleColFeatureName === '归一化'" style='margin: 30px 0 0 20px'>
                        <div v-for='(option, index) in singleColFeatureDetails' style='margin: 10px 0 0 0'>
                          <div>
                            <div v-if='index === 0'>
                              <span class='span-f'>{{ option.name }}{{ ":" }}</span>
                              <el-select
                                v-model='option.modelValue'
                                style='margin-left: 10px; width: 40%'
                                @change='changeSingleDetails($event, option.name)'
                              >
                                <el-option v-for='item in option.value' :key='item' :label='item' :value='item' />
                              </el-select>
                              <!--                              配置说明-->
                              <div class='tooltip'>
                                <el-tooltip effect='light' placement='top-start'>
                                  <template #content>
                                    <div v-for='item in disposalMethodDescript'>
                                      <div v-if="item.name === '归一化'">
                                        <div v-for='(op, index) in Object.keys(item.description)'>
                                          {{ op }}：{{ Object.values(item.description)[index] }}<br />
                                        </div>
                                      </div>
                                    </div>
                                  </template>
                                  <el-icon :size='16' style='vertical-align: middle; margin-left: 2px; color: black'>
                                    <InfoFilled />
                                  </el-icon>
                                </el-tooltip>
                              </div>
                            </div>

                            <div v-if="index > 0 && singleColFeatureDetails[0].modelValue == 'Robust'">
                              <span class='span-f'>{{ option.name }}{{ ":" }}</span>
                              <el-input
                                v-model='option.modelValue'
                                type='text'
                                style='margin-left: 10px; width: 40%'
                                @change='changeSingleDetails($event, option.name)'
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="singleColFeatureName === '共线性特征去除' || singleColFeatureName === 'OneHot编码'"
                        style='margin: 30px 0 0 20px'
                      >
                        <div v-for='option in singleColFeatureDetails' style='margin: 10px 0 0 0'>
                          <span class='span-f'>{{ option.name }}{{ ":" }}</span>
                          <el-input-number
                            v-model='option.modelValue'
                            :min="singleColFeatureName === '共线性特征去除' ? 1 : 1"
                            :max="singleColFeatureName === '共线性特征去除' ? 20 : 20"
                            :step='1'
                            controls-position='right'
                            class='number-input'
                            style='margin-left: 10px'
                            @change='changeSingleDetails($event, option.name)'
                          />
                        </div>
                      </div>
                      <div v-if="singleColFeatureName === '离群点去除'" style='margin: 30px 0 0 20px'>
                        <div v-for='(option, index) in singleColFeatureDetails'>
                          <div style='margin: 10px 0 0 0' v-if='index === 0'>
                            <span class='span-f'>{{ option.name }}{{ ":" }}</span>
                            <el-select
                              v-model='option.modelValue'
                              collapse-tags
                              placeholder='请选择'
                              style='margin-left: 10px; width: 45%'
                              @change='changeSingleDetails($event, singleColFeatureDetails[0].name)'
                            >
                              <el-option v-for='item in option.value' :key='item' :label='item' :value='item' />
                            </el-select>
                            <!--                              配置说明-->
                            <div style='float: right; margin-right: 90px; margin-top: 5px'>
                              <el-tooltip effect='light' placement='top-start'>
                                <template #content>
                                  <div v-for='item in disposalMethodDescript'>
                                    <div v-if="item.name === '离群点去除'">
                                      <div v-for='(op, index) in Object.keys(item.description)'>
                                        {{ op }}：{{ Object.values(item.description)[index] }}<br />
                                      </div>
                                    </div>
                                  </div>
                                </template>
                                <el-icon :size='16' style='vertical-align: middle; margin-left: 2px; color: black'>
                                  <InfoFilled />
                                </el-icon>
                              </el-tooltip>
                            </div>
                          </div>
                          <div
                            style='margin: 10px 0 0 0'
                            v-if="
                              (index === 1 && singleColFeatureDetails[0].modelValue === 'mad') ||
                              (index === 2 && singleColFeatureDetails[0].modelValue === '3sigma')
                            "
                          >
                            <span class='span-f'>{{ option.name }}{{ ":" }}</span>
                            <el-input-number
                              v-model='option.modelValue'
                              controls-position='right'
                              style='margin-left: 10px; width: 45%'
                              @change='changeSingleDetails($event, option.name)'
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <template #footer>
                      <span>
                        <!--                      <el-button @click="this.singleFeatureDialogVisible = false">确定</el-button>-->
                        <el-button @click='singleFeatureDialogConfirm'>确定</el-button>
                      </span>
                    </template>
                  </el-dialog>
                </div>
              </div>
              <div style='margin: 30px 0 0 0; text-align: right'>
                <el-button @click='backToTaskView' class='button-m'>取消</el-button>
                <el-button type='primary' color='#626aef' @click='featureClick(1)' class='button-m'>上一步</el-button>
                <!--              <el-button type="primary" color="#626aef"  @click="this.pageIndex = 3" class="button-m">下一步</el-button>-->
                <el-button type='primary' color='#626aef' @click='featureClick(3)' class='button-m'>下一步</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--    预置模型-->
      <div v-if='pageIndex === 3'>
        <div style='padding: 20px 0 20px 0'>
          <div style='margin: 0 0 0 20px'>
            <div class='task-title-div'></div>
            <span class='task-title-name'>预置模型</span>
          </div>

          <div style='margin: 0 0 0 30px'>
            <div style='margin: 30px 0 0 30px'>
              <span class='span-m'>模型选择：</span>
              <el-select v-model='modelName' style='margin-left: 20px; width: 360px'>
                <el-option v-for='item in modelList' :key='item' :label='item' :value='item' />
              </el-select>
            </div>

            <div style='margin: 30px 0 0 30px'>
              <span class='span-m' style='vertical-align: top'>参数配置：</span>
              <div style='display: inline-block; margin-left: 20px; width: 85%'>
                <div>
                  <el-table
                    style='border: 1px solid #9a9a9a'
                    :data='model'
                    border
                    :header-cell-style="{
                      background: '#F5F5F5',
                      height: '50px',
                      color: '#303133',
                      borderColor: '#9a9a9a',
                    }"
                    :cell-style='setCellStyle'
                    :span-method='paramTypeSpanMethod'
                  >
                    <el-table-column prop='paramType' label='参数类型' min-width='10%' align='center' />
                    <el-table-column
                      prop='parameter'
                      label='参数'
                      min-width='14%'
                      align='center'
                      style='font-weight: bold'
                    >
                      <template #default='scope'>
                        {{ E2C[scope.row.parameter] }}
                      </template>
                    </el-table-column>
                    <el-table-column prop='' label='是否调参' min-width='8%' align='center'>
                      <template #default='scope'>
                        <el-switch v-model='scope.row.tuneParam' style='margin-left: 0px' @change='computeNumOfGrid' />
                      </template>
                    </el-table-column>
                    <el-table-column prop='defaultValue' label='默认取值' min-width='12%' align='center'>
                      <template #default='scope'>
                        <!--                        数值型-->
                        <div
                          v-if="
                            scope.row.parameter === 'batch_size' ||
                            scope.row.parameter === 'learning_rate' ||
                            scope.row.parameter === 'max_iter' ||
                            scope.row.parameter === 'alpha' ||
                            scope.row.parameter === 'n_layers' ||
                            scope.row.parameter === 'epoch' ||
                            scope.row.parameter === 'num_layers' ||
                            scope.row.parameter === 'conv_layers' ||
                            scope.row.parameter === 'seq_len' ||
                            scope.row.parameter === 'min_samples_split' ||
                            scope.row.parameter === 'min_samples_leaf' ||
                            scope.row.parameter === 'max_depth' ||
                            scope.row.parameter === 'n_estimators' ||
                            scope.row.parameter === 'kernel_size' ||
                            scope.row.parameter === 'out_channel' ||
                            scope.row.parameter === 'dropout' ||
                            scope.row.parameter === 'eval_steps' ||
                            scope.row.parameter === 'weight_decay' ||
                            scope.row.parameter === 'd_model' ||
                            scope.row.parameter === 'nhead' ||
                            scope.row.parameter === 'nhid' ||
                            scope.row.parameter === 'nlayers' ||
                            scope.row.parameter === 'warmup_proportion' ||
                            scope.row.parameter === 'max_seq_len'
                          "
                        >
                          <el-input
                            v-model='scope.row.defaultValue'
                            size='small'
                            style='width: 70%'
                            type='number'
                            :disabled='scope.row.tuneParam'
                            class='input-a'
                          />
                        </div>
                        <!--                        离散型-->
                        <div
                          v-if="
                            scope.row.parameter === 'model_evaluate' ||
                            scope.row.parameter === 'solver' ||
                            scope.row.parameter === 'loss_func'
                          "
                        >
                          <el-select
                            v-model='scope.row.defaultValue'
                            style='width: 70%'
                            size='small'
                            :disabled='scope.row.tuneParam'
                          >
                            <el-option v-for='item in scope.row.area' :key='item' :label='item' :value='item' />
                          </el-select>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column prop='' label='调参范围' min-width='20%' align='center'>
                      <template #default='scope'>
                        <!--                        数值型-->
                        <div
                          v-if="
                            scope.row.parameter === 'batch_size' ||
                            scope.row.parameter === 'learning_rate' ||
                            scope.row.parameter === 'max_iter' ||
                            scope.row.parameter === 'alpha' ||
                            scope.row.parameter === 'n_layers' ||
                            scope.row.parameter === 'epoch' ||
                            scope.row.parameter === 'num_layers' ||
                            scope.row.parameter === 'conv_layers' ||
                            scope.row.parameter === 'seq_len' ||
                            scope.row.parameter === 'min_samples_split' ||
                            scope.row.parameter === 'min_samples_leaf' ||
                            scope.row.parameter === 'max_depth' ||
                            scope.row.parameter === 'n_estimators' ||
                            scope.row.parameter === 'kernel_size' ||
                            scope.row.parameter === 'out_channel' ||
                            scope.row.parameter === 'd_model' ||
                            scope.row.parameter === 'nhead' ||
                            scope.row.parameter === 'nhid' ||
                            scope.row.parameter === 'nlayers' ||
                            scope.row.parameter === 'dropout' ||
                            scope.row.parameter === 'dropout' ||
                            scope.row.parameter === 'eval_steps' ||
                            scope.row.parameter === 'weight_decay' ||
                            scope.row.parameter === 'd_model' ||
                            scope.row.parameter === 'nhead' ||
                            scope.row.parameter === 'nhid' ||
                            scope.row.parameter === 'nlayers' ||
                            scope.row.parameter === 'warmup_proportion' ||
                            scope.row.parameter === 'max_seq_len'
                          "
                        >
                          <el-input
                            v-model='scope.row.area.low_bound'
                            size='small'
                            type='number'
                            style='width: 35%'
                            :disabled='!scope.row.tuneParam'
                            class='input-a'
                          />
                          <span style='margin: 0 5px 0 5px'>~</span>
                          <el-input
                            v-model='scope.row.area.high_bound'
                            size='small'
                            type='number'
                            style='width: 35%'
                            :disabled='!scope.row.tuneParam'
                            class='input-a'
                          />
                        </div>
                        <!--                        离散型-->
                        <div
                          v-if="
                            scope.row.parameter === 'model_evaluate' ||
                            scope.row.parameter === 'solver' ||
                            scope.row.parameter === 'loss_func'
                          "
                        >
                          <el-select
                            v-model='scope.row.areaValue'
                            multiple
                            collapse-tags
                            placeholder='请选择'
                            style='width: 80%'
                            :disabled='!scope.row.tuneParam'
                          >
                            <el-option v-for='item in scope.row.area' :key='item' :label='item' :value='item' />
                          </el-select>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column prop='' label='调参步长' min-width='16%' align='center'>
                      <template #default='scope'>
                        <div
                          v-if="
                            scope.row.parameter === 'batch_size' ||
                            scope.row.parameter === 'learning_rate' ||
                            scope.row.parameter === 'max_iter' ||
                            scope.row.parameter === 'alpha' ||
                            scope.row.parameter === 'n_layers' ||
                            scope.row.parameter === 'epoch' ||
                            scope.row.parameter === 'num_layers' ||
                            scope.row.parameter === 'conv_layers' ||
                            scope.row.parameter === 'seq_len' ||
                            scope.row.parameter === 'min_samples_split' ||
                            scope.row.parameter === 'min_samples_leaf' ||
                            scope.row.parameter === 'max_depth' ||
                            scope.row.parameter === 'n_estimators' ||
                            scope.row.parameter === 'kernel_size' ||
                            scope.row.parameter === 'out_channel' ||
                            scope.row.parameter === 'd_model' ||
                            scope.row.parameter === 'nhead' ||
                            scope.row.parameter === 'nhid' ||
                            scope.row.parameter === 'nlayers' ||
                            scope.row.parameter === 'dropout' ||
                            scope.row.parameter === 'dropout' ||
                            scope.row.parameter === 'eval_steps' ||
                            scope.row.parameter === 'weight_decay' ||
                            scope.row.parameter === 'd_model' ||
                            scope.row.parameter === 'nhead' ||
                            scope.row.parameter === 'nhid' ||
                            scope.row.parameter === 'nlayers' ||
                            scope.row.parameter === 'warmup_proportion' ||
                            scope.row.parameter === 'max_seq_len'
                          "
                        >
                          <el-select
                            v-model='scope.row.step.typeValue'
                            style='margin-left: 10px; width: 30%'
                            size='small'
                            :disabled='!scope.row.tuneParam'
                          >
                            <el-option v-for='item in scope.row.step.type' :key='item' :label='item' :value='item' />
                          </el-select>
                          <el-input
                            v-model='scope.row.step.value'
                            size='small'
                            style='margin-left: 10px; width: 50%'
                            :disabled='!scope.row.tuneParam'
                          />
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column prop='description' label='说明' min-width='20%' align='center' />
                  </el-table>
                </div>
                <!--              网格搜索次数-->
                <div style='margin: 15px 0 0 0; font-size: 14px'>
                  <span>当前配置下，网格搜索次数为：</span>
                  <span>{{ this.computeNumString }}</span>
                </div>
                <div style='margin: 30px 0 0 0; text-align: right'>
                  <el-button @click='backToTaskView' class='button-m'>取消</el-button>
                  <el-button type='primary' color='#626aef' @click='checkGridError(taskTypeValue === "named_entity_recognition" ? 1 : 2)' class='button-m'
                  >上一步
                  </el-button>
                  <el-button type='primary' color='#626aef' @click='checkGridError(4)' class='button-m'
                  >下一步
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--    其他参数配置-->
      <div v-if='pageIndex === 4'>
        <div style='padding: 20px 0 20px 0'>
          <div style='margin: 0 0 0 20px'>
            <div class='task-title-div'></div>
            <span class='task-title-name'>其他参数配置</span>
          </div>
          <div style='width: 50%; margin-left: 100px'>
            <div style='margin: 40px 0 0 40px'>
              <span class='span-m' style='width: 150px'>内存：</span>
              <el-input v-model='memory' style='width: 200px' type='text' class='input' />
              <span style='margin-left: 10px'>{{ "GB" }}</span>
            </div>
            <div style='margin: 40px 0 0 40px'>
              <span class='span-m' style='width: 150px'>CPU核心数：</span>
              <el-input v-model='cpuCoreNum' style='width: 300px' type='text' class='input' />
            </div>
            <div style='margin: 40px 0 0 40px' v-if="taskTypeValue === 'time_series_prediction'">
              <span class='span-m' style='width: 150px'>时间划分间隔：</span>
              <el-input-number
                v-model='timeSpan'
                :min='1'
                controls-position='right'
                class='number-input'
                value-on-clear='min'
              />
              <el-select v-model='timeUnitValue' style='width: 80px; margin-left: 18px'>
                <el-option v-for='item in timeUnit' :key='item' :label='item.label' :value='item.value' />
              </el-select>
            </div>
            <div style='margin: 40px 0 0 40px'>
              <span class='span-m' style='width: 150px'>交叉验证：</span>
              <el-select v-model='crossValidation' class='input' style='width: 300px'>
                <el-option v-for='item in crossValidationList' :key='item' :label='item' :value='item' />
              </el-select>
            </div>
            <div style='margin: 40px 0 0 40px' v-if="crossValidation === 'k折交叉验证'">
              <span class='span-m' style='width: 150px'>折数：</span>
              <el-input-number v-model='kFold' :min='0' :max='10' controls-position='right' class='number-input' />
            </div>
            <div style='margin: 40px 0 0 40px' v-if="crossValidation === '否'">
              <span class='span-m' style='width: 150px'>验证集划分比例：</span>
              <el-input-number v-model='validation' :min='1' :max='90' controls-position='right' class='number-input' />
              <span style='margin-left: 10px'>%</span>
            </div>
            <div style='margin: 40px 0 0 40px'>
              <span class='span-m' style='width: 150px'>测试集划分比例：</span>
              <el-input-number v-model='scale' :min='1' :max='90' controls-position='right' class='number-input' />
              <span style='margin-left: 10px'>%</span>
            </div>
            <div style='margin: 40px 0 0 40px'>
              <span class='span-m' style='width: 150px'>评价指标：</span>
              <el-select
                v-model='modelEvaluate'
                multiple
                filterable
                collapse-tags
                collapse-tags-tooltip
                placeholder='请选择'
                class='input'
                style='width: 300px'
              >
                <el-option v-for='item in modelEvaluateList' :key='item' :label='item' :value='item' />
              </el-select>
            </div>
            <!--            <div style="margin: 40px 0 0 40px">-->
            <!--              <span class="span-m" style="width: 150px">训练完成自动入库：</span>-->
            <!--              <el-switch v-model="autoToHouse" style="margin-left: 20px"/>-->
            <!--            </div>-->
            <div style='margin: 60px 0 0 150px; text-align: left'>
              <el-button @click='backToTaskView' class='button-m'>取消</el-button>
              <el-button type='primary' color='#626aef' @click='this.pageIndex = 3' class='button-m'>上一步</el-button>
              <el-button type='primary' color='#626aef' @click='modifyTask' class='button-m'>保存</el-button>
              <el-button type='primary' color='#626aef' @click='finishCreate' class='button-m'>开始训练</el-button>
              <!--              <el-button type="primary" color="#626aef" @click="checkConfigurationString" class="button-m">查看字符串</el-button>-->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowRight, CirclePlus, QuestionFilled, Remove } from "@element-plus/icons-vue";
import router from "@/router";
import { useRoute } from "vue-router";
import { ref } from "vue";
import { useMainStore } from "@/store/index"; // 引入 Pinia store
import {
  dictionaryC2E,
  dictionaryE2C,
  disposalMethodDescription,
  featureTable,
  parameterTableCnn,
  parameterTableGdbt,
  parameterTableLstm,
  parameterTableMlp,
  parameterTableTransformer,
  parameterTableGlobalPointer,
  partialRow,
  seriesFeatureTable,
  stringFeatureTable,
  targetFeatureTable,
  timeFeatureTable,
} from "./taskStaticData";
import request from "@/utils/request";
import { ElMessage } from "element-plus";
import { taskAdd, taskModify } from "@/utils/before";

export default {
  name: "TaskModify",
  data() {
    const rowValue = ref("");
    const colValue = ref("");
    const crossValidation = ref("");
    const autoToHouse = ref("");
    const modelName = ref("");
    const featureTableData = JSON.parse(JSON.stringify(featureTable));
    const columnDefaultConfig = JSON.parse(JSON.stringify(featureTable));
    const parameterTableDataLstm = JSON.parse(JSON.stringify(parameterTableLstm));
    const parameterTableDataMlp = JSON.parse(JSON.stringify(parameterTableMlp));
    const parameterTableDataGdbt = JSON.parse(JSON.stringify(parameterTableGdbt));
    const parameterTableDataCnn = JSON.parse(JSON.stringify(parameterTableCnn));
    const parameterTableDataTransformer = JSON.parse(JSON.stringify(parameterTableTransformer));
    const parameterTableDataGlobalPointer = JSON.parse(JSON.stringify(parameterTableGlobalPointer));
    const disposalMethodDescript = JSON.parse(JSON.stringify(disposalMethodDescription));
    const C2E = dictionaryC2E;
    const E2C = dictionaryE2C;
    const partialRowListInitial = JSON.parse(JSON.stringify(partialRow));
    const partialRowList = JSON.parse(JSON.stringify(partialRow));
    const seriesFeatureTableData = JSON.parse(JSON.stringify(seriesFeatureTable));
    const stringFeatureTableData = JSON.parse(JSON.stringify(stringFeatureTable));
    const timeFeatureTableData = JSON.parse(JSON.stringify(timeFeatureTable));
    const targetFeatureTableData = JSON.parse(JSON.stringify(targetFeatureTable));
    return {
      ArrowRight,
      CirclePlus,
      Remove,
      currentSingleRow: "",
      taskName: "",
      taskDescription: "",
      loading: true,
      pageIndex: 0,
      dataSet: [],
      dataSheet: [],
      // taskType:['回归','分类','时间序列预测'],
      taskType: [
        {
          label: "回归",
          value: "regression",
        },
        {
          label: "分类",
          value: "classification",
        },
        {
          label: "时间序列预测",
          value: "time_series_prediction",
        },
        {
          label: "命名实体识别",
          value: "named_entity_recognition",
        }
      ],
      tableColumns: [],
      columnsCascader: [],
      featureColCascader: [],
      props: { multiple: true },
      selectedSingleCol: [],
      numericalArray: [],
      activeNames: [],
      parameterTableDataLstm,
      featureTableData,
      parameterTableDataMlp,
      parameterTableDataGdbt,
      parameterTableDataCnn,
      parameterTableDataTransformer,
      parameterTableDataGlobalPointer,
      disposalMethodDescript,
      partialRowList,
      partialRowListInitial,
      andOrList: ["AND", "OR"],
      operatorList: ["之间", "大于", "小于", "等于", "不等于"],
      dataSetValue: "",
      dataSheetValue: [],
      taskTypeValue: "",
      timeColValue: "",
      targetColValue: "",
      featureColValue: [],
      rowValue: "1",
      colValue: "1",
      modelName: "",
      modelList: ["MLP", "LSTM", "GDBT", "CNN", "Transformer", "GlobalPointer"],
      crossValidation: "否",
      crossValidationList: ["k折交叉验证", "否"],
      kFold: 5,
      scale: 20,
      autoToHouse: true,
      validation: 20,
      userData: "",
      taskInfo: {},
      nameRepeat: false,
      nameLack: false,
      dataSetLack: false,
      dataSheetLack: false,
      taskTypeLack: false,
      timeColLack: false,
      targetColLack: false,
      featureColLack: false,
      middleData: "",
      singleColDialog: false,
      singleFeatureDialogVisible: false,
      singleFeature: "",
      singleColDialogData: [],
      userSelectedSingleCol: [],
      singleColFeatureNameList: [],
      singleColFeatureDetails: [],
      singleColFeatureName: "",
      computeNumString: "",
      currentCol: "",
      currentColDataType: "",
      temporaryData: [],
      columnDefaultConfig,
      model: [],
      C2E,
      E2C,
      seriesFeatureTableData,
      stringFeatureTableData,
      timeFeatureTableData,
      targetFeatureTableData,
      modifyMode: false,
      modifyTaskId: "",
      modifyTaskType: "",
      modifyTaskInfo: "",
      modifyTaskConfiguration: "",
      taskTypeDictionary: {
        回归: "regression",
        分类: "classification",
        时间序列预测: "time_series_prediction",
      },
      selectedInPage1: [],
      numericalList: [],
      featuresOfNumber: [],
      featuresOfString: [],
      columnsType: {},
      selectedInPage2OfPartRecord: [],
      gridSearchError: false,
      memory: 2,
      cpuCoreNum: 2,
      singleConfig: [],
      select: [],
      partRecordFlag: true,
      defaultColumnFlag: true,
      modelEvaluate: [""],
      modelEvaluateList: ["MAE", "MSE"],
      setData: [],
      runOnce: true,
      modifyFeatureEngineer: true,
      saveSelectedSingleCol: [],
      timeSpan: 1,
      timeUnit: [
        {
          label: "秒",
          value: "second",
        },
        {
          label: "分钟",
          value: "minute",
        },
        {
          label: "小时",
          value: "hour",
        },
      ],
      timeUnitValue: "minute",
      testdata: [],
    };
  },
  components: {
    QuestionFilled,
  },
  watch: {
    currentColDataType: {
      handler() {
        console.log(this.currentColDataType, "this.currentdatatype");
      },
      deep: true,
    },
    taskName: {
      handler() {
        if (this.taskName !== "") {
          this.nameLack = false;
        }
        this.nameRepeat = false;
      },
      deep: true,
    },
    columnDefaultConfig: {
      handler() {
        console.log(this.columnDefaultConfig, "this.columnDefaultConfig");
        console.log(this.featureTableData, "this.featureTableData");
      },
      deep: true,
    },
    singleFeatureDialogVisible: {
      handler() {
        //只要单字段弹窗关闭，暂存的要更改的数据就清空
        if (!this.singleFeatureDialogVisible) {
          this.temporaryData = [];
          console.log(this.temporaryData, "this.temporaryData");
        }
      },
      deep: true,
    },
    rowValue: {
      handler() {
        console.log(this.rowValue);
      },
      deep: true,
    },
    dataSetValue: {
      handler(newValue, oldValue) {
        if (this.dataSetValue !== "") {
          this.dataSetLack = false;
        }
        console.log(oldValue, "oldValue in datasetvalue");
        console.log(newValue, "newValue in datasetvalue");
        if (oldValue != "") {
          //选择数据集变更时清空后续相关内容
          this.dataSheetValue = "";
          this.timeColValue = "";
          this.targetColValue = "";
          this.featureColValue = [];
          this.tableColumns = [];
          this.selectedSingleCol = [];
          this.partialRowList = JSON.parse(JSON.stringify(this.partialRowListInitial));
          this.columnDefaultConfig = JSON.parse(JSON.stringify(this.featureTableData));
        }
        console.log(this.featureColValue, "特征字段000");
      },
      deep: true,
    },
    dataSheetValue: {
      handler(newValue, oldValue) {
        if (this.dataSheetValue !== "") {
          this.dataSheetLack = false;
        }
        console.log(oldValue, "oldValue in datasheetvalue");
        console.log(newValue, "newValue in datasheetvalue");
        if (oldValue !== newValue) {
          this.timeColValue = "";
          this.targetColValue = "";
          this.featureColValue = [];
          this.tableColumns = [];
          this.selectedSingleCol = [];
          this.partialRowList = JSON.parse(JSON.stringify(this.partialRowListInitial));
          this.columnDefaultConfig = JSON.parse(JSON.stringify(this.featureTableData));
          console.log(this.dataSheetValue, "this.datasheetvalue");
        }
        this.disabledUnequalRowNum();
      },
      deep: true,
    },
    taskTypeValue: {
      handler(newValue, oldValue) {
        if (this.taskTypeValue !== "") {
          this.taskTypeLack = false;
        }
        if (oldValue != "") {
          if (newValue === "time_series_prediction") {
            this.modelName = "LSTM";
          } else if(newValue === "named_entity_recognition"){
            this.modelName = "GlobalPointer";
          } else {
            this.modelName = "MLP";
          }
        }

        if (newValue !== "time_series_prediction") {
          this.columnsCascader.forEach((item, index) => {
            if (this.timeColValue[0] === item.value) {
              item.children.forEach((item2, index2) => {
                if (this.timeColValue[1] === item2.value) {
                  item2.disabled = false;
                }
              });
            }
          });
          this.featureColCascader.forEach((item, index) => {
            if (this.timeColValue[0] === item.value) {
              item.children.forEach((item1, index1) => {
                if (this.timeColValue[1] === item1.value) {
                  item1.disabled = false;
                }
              });
            }
          });
        } else {
          this.columnsCascader.forEach((item, index) => {
            if (this.timeColValue[0] === item.value) {
              item.children.forEach((item2, index2) => {
                if (this.timeColValue[1] === item2.value) {
                  item2.disabled = true;
                }
              });
            }
          });
          this.featureColCascader.forEach((item, index) => {
            if (this.timeColValue[0] === item.value) {
              item.children.forEach((item1, index1) => {
                if (this.timeColValue[1] === item1.value) {
                  item1.disabled = true;
                }
              });
            }
          });
        }
        if (newValue === "classification") {
          this.modelEvaluateList = ["accuracy","f1","f1_micro","f1_macro","f1_weighted","precision","recall"]
        } else if (newValue === "regression") {
          this.modelEvaluateList = ["MAE", "MSE"];
        } else if (newValue === "time_series_prediction") {
          this.modelEvaluateList = ["MAE", "MSE"];
        } else if (newValue === "named_entity_recognition"){
          this.modelEvaluateList = ["f1"];
        }
      },
      deep: true,
    },
    timeColValue: {
      handler(newValue, oldValue) {
        if (this.timeColValue !== "") {
          this.timeColLack = false;
        }
        //设置已选字段不可选
        console.log(oldValue, "oldvalue in timecolvalue watch");
        console.log(newValue, "newvalue in timecolvalue watch");
        this.columnsCascader.forEach((item, index) => {
          //将之前禁用的字段释放
          if (oldValue[0] === item.value) {
            item.children.forEach((item1, index1) => {
              if (oldValue[1] === item1.value) {
                item1.disabled = false;
                console.log(item1.value, item1.disabled, "item1.oldvalue in timecolvalue watch");
              }
            });
          }
          //将新选的字段禁用
          if (newValue[0] === item.value) {
            item.children.forEach((item1, index1) => {
              if (newValue[1] === item1.value) {
                item1.disabled = true;
                console.log(item1.value, item1.disabled, "item1.newvalue in timecolvalue watch");
              }
            });
          }
        });
        this.featureColCascader.forEach((item, index) => {
          //将之前禁用的字段释放
          if (oldValue[0] === item.value) {
            item.children.forEach((item1, index1) => {
              if (oldValue[1] === item1.value) {
                item1.disabled = false;
                console.log(item1.value, item1.disabled, "item1.oldvalue in timecolvalue featurecol watch");
              }
            });
          }
          //将新选的字段禁用
          if (newValue[0] === item.value) {
            item.children.forEach((item1, index1) => {
              if (newValue[1] === item1.value) {
                item1.disabled = true;
                console.log(item1.value, item1.disabled, "item1.newvalue in timecolvalue featurecol watch");
              }
            });
          }
        });
      },
      deep: true,
    },
    targetColValue: {
      handler(newValue, oldValue) {
        if (this.targetColValue !== "") {
          this.targetColLack = false;
        }
        console.log(oldValue, "oldvalue in targetcolvalue watch start");
        console.log(newValue, "newvalue in targetcolvalue watch start");
        console.log(this.columnsCascader, "this.columnsCascader in targetcolvalue watch");
        console.log(this.columnsCascader[0].children, "this.columnsCascader.children in targetcolvalue watch");
        //设置已选字段不可选
        this.columnsCascader.forEach((item, index) => {
          //将之前禁用的字段释放
          if (oldValue[0] === item.value) {
            item.children.forEach((item1, index1) => {
              if (oldValue[1] === item1.value) {
                item1.disabled = false;
                console.log(item1.value, item1.disabled, "item1.oldvalue in targetcolvalue watch");
              }
            });
          }
          //将新选的字段禁用
          if (newValue[0] === item.value) {
            item.children.forEach((item1, index1) => {
              if (newValue[1] === item1.value) {
                item1.disabled = true;
                console.log(item1.value, item1.disabled, "item1.newvalue in targetcolvalue watch");
              }
            });
          }
        });
        this.featureColCascader.forEach((item, index) => {
          //将之前禁用的字段释放
          if (oldValue[0] === item.value) {
            item.children.forEach((item1, index1) => {
              if (oldValue[1] === item1.value) {
                item1.disabled = false;
                console.log(item1.value, item1.disabled, "item1.oldvalue in targetcolvalue featurecol watch");
              }
            });
          }
          //将新选的字段禁用
          if (newValue[0] === item.value) {
            item.children.forEach((item1, index1) => {
              if (newValue[1] === item1.value) {
                item1.disabled = true;
                console.log(item1.value, item1.disabled, "item1.newvalue in targetcolvalue featurecol watch");
              }
            });
          }
        });
        console.log(this.targetColValue, "targetcolvalue");
      },
      deep: true,
    },
    featureColValue: {
      handler(newValue, oldValue) {
        console.log(oldValue, "oldvalue in feature watch");
        console.log(newValue, "newvalue in feature watch");
        console.log(this.featureColValue, "this.featureColValue");
        console.log(this.columnsCascader, "this.columnsCascader");
        if (this.featureColValue.length !== 0) {
          this.featureColLack = false;
        }
        //设置已选字段不可选
        oldValue.forEach((item, index) => {
          this.columnsCascader.forEach((item1, index2) => {
            item1.children.forEach((item4, index) => {
              if (item[0] === item1.value && item[1] === item4.value) {
                item4.disabled = false;
              }
            });
          });
        });
        newValue.forEach((item, index) => {
          this.columnsCascader.forEach((item1, index2) => {
            item1.children.forEach((item4, index) => {
              if (item[0] === item1.value && item[1] === item4.value) {
                item4.disabled = true;
              }
            });
          });
        });
      },
      deep: true,
    },
    model: {
      handler() {
        console.log(this.model, "this.model in watch of model");
        this.computeNumOfGrid();
      },
      deep: true,
    },
    modelName: {
      handler() {
        if (this.modelName === "LSTM") {
          this.model = this.parameterTableDataLstm;
        } else if (this.modelName === "MLP") {
          this.model = this.parameterTableDataMlp;
        } else if (this.modelName === "GDBT") {
          this.model = this.parameterTableDataGdbt;
        } else if (this.modelName === "CNN") {
          this.model = this.parameterTableDataCnn;
        } else if (this.modelName === "Transformer") {
          this.model = this.parameterTableDataTransformer;
        } else if (this.modelName === "GlobalPointer") {
          this.model = this.parameterTableDataGlobalPointer;
        }
      },
      deep: true,
    },
    pageIndex: {
      handler() {
        if (this.pageIndex === 0) {
          console.log("创建任务");
        }
        if (this.pageIndex === 1) {
          console.log("选择数据");
          if (this.runOnce === true) {
            this.loadingColumns();
            this.runOnce = false;
          }
        }
        if (this.pageIndex === 2) {
          console.log("特征工程策略");
          console.log(this.columnsCascader, "this.columnsCascader，级联选择器中的信息");
          //修改模式下，数据库的数据只在刚进入页面时调用一次，任务发生修改后，数据未存入数据库前，不再调用数据库的数据
          if (this.modifyFeatureEngineer === true) {
            // this.loadingColumns()
            // this.loadingSingleCol()
            // this.modifyFeatureEngineeringStrategy()
            console.log(this.userSelectedSingleCol, "this.userSelectSingleCol in page2");
            console.log(this.partialRowList, "this.partialRowList in page2");
            this.saveSelectedSingleCol = this.selectedSingleCol;
            this.modifyFeatureEngineer = false;
            console.log(this.saveSelectedSingleCol, "middle in  modify page 2");
          } else {
            console.log(this.saveSelectedSingleCol, "middle in page 2");
            console.log(this.selectedSingleCol, "this,selectedsinglecol in page2");
            //当进入特征工程页面时，收集选择数据页面的数据，并对部分记录的级联选择器进行禁用
            this.saveDataSelectedInPage1();
            this.disabledSelectedNumericCol();
            console.log(this.userSelectedSingleCol, "this,userselectedsinglecol in start page2");
            if (JSON.stringify(this.saveSelectedSingleCol) === JSON.stringify(this.selectedSingleCol)) {
              console.log(this.selectedSingleCol, "this,selectedsinglecol  相同");
            } else {
              this.loadingSingleCol();
              console.log(this.saveSelectedSingleCol, "this,saveselectedsinglecol in page2");
              console.log(this.selectedSingleCol, "this,selectedsinglecol 不同");
            }
          }
          console.log(this.selectedInPage2OfPartRecord, "this.selectedInPage2OfPartRecord");
          this.loadSelection();
          //默认打开折叠面板
          this.selectedSingleCol.forEach(item => {
            this.activeNames.push(item.value);
          });
        }
        if (this.pageIndex === 3) {
          this.changeModelList();
        }
      },
      deep: true,
    },
    colValue: {
      handler() {
        if (this.colValue === "1") {
          // this.loadSelection();
        }
      },
      deep: true,
    },
    partialRowList: {
      handler(newValue, oldValue) {
        console.log(this.partialRowList, "partialrowlist 变化");
        this.selectedInPage2OfPartRecord = [];
        newValue.forEach((item, index) => {
          this.selectedInPage2OfPartRecord.push(item.col);
        });
      },
      deep: true,
    },
    numericalArray: {
      handler(newValue, oldValue) {
        console.log(newValue, "newvalue in numericalarray");
        console.log(oldValue, "oldvalue in numericalarray");
        this.numericalList.forEach((item, index) => {
          oldValue.forEach((item1, index1) => {
            if (item1[0] === item.value) {
              item.children.forEach((item2, index2) => {
                if (item1[1] === item2.value) {
                  item2.disabled = false;
                }
              });
            }
          });
          newValue.forEach((item1, index1) => {
            if (item1[0] === item.value) {
              item.children.forEach((item2, index2) => {
                if (item1[1] === item2.value) {
                  item2.disabled = true;
                }
              });
            }
          });
        });
      },
      deep: true,
    },
    selectedSingleCol: {
      handler(newValue, oldValue) {
        console.log(newValue, "new selectedsinglecol");
        console.log(oldValue, "old selectedsinglecol");
      },
      deep: true,
    },
  },
  created() {
    this.checkNewTask();
    setTimeout(() => {
      this.modifyDataSelection();
      //异步问题
      this.modifyModelSelection();
      this.modifyTrainparameters();
    }, 1000);
  },
  computed: {

  },
  mounted() {
    this.loadUserData();
    this.computeNumOfGrid();
  },
  methods: {
    //检查当前任务是新建的任务还是修改的任务
    checkNewTask() {
      const route = useRoute();
      //修改任务的情况
      if (route.query.taskId) {
        this.modifyMode = true;
        this.modifyTaskId = route.query.taskId;
        const task = route.query.taskId;
        request
          .get("/TaskManage/GetTaskConfigurationById", {
            params: { task_id: task },
          })
          .then(res => {
            //保存原始的任务信息，在此基础上做修改
            this.modifyTaskInfo = res.data;
            //加载原始基本信息
            this.taskName = res.data.name;
            this.taskDescription = res.data.task_desc;
            this.modifyTaskType = res.data.type;
            //加载原始数据选择
            this.dataSetValue = res.data.configuration.select_data.set_id;
            this.taskTypeValue = res.data.configuration.select_data.task_type;
            this.setData = res.data.configuration.select_data.set_data;
            //加载特征工程策略
            //是否使用默认配置
            this.colValue = res.data.configuration.feature_engineering_strategy.column_processing.default ? "1" : "2";
            //默认配置
            this.defaultConfig = res.data.configuration.feature_engineering_strategy.column_processing.default_config;
            //逐字段配置
            this.singleConfig = res.data.configuration.feature_engineering_strategy.column_processing.single_config;
            //是否使用部分记录
            this.rowValue = res.data.configuration.feature_engineering_strategy.record_processing.all ? "1" : "2";
            //部分记录信息
            this.readpartialRowList = res.data.configuration.feature_engineering_strategy.record_processing.columns;

            //加载模型选择
            this.select = res.data.configuration.model_parameters;
            this.modelName = res.data.configuration.model_parameters.type;
            this.paramSelection = res.data.configuration.model_parameters.hyperparameter;

            //加载训练参数
            this.cpuCoreNum = res.data.configuration.container_conf.cpus;
            this.memory = res.data.configuration.container_conf.mem_limit / 1000000000;
            this.crossValidation = res.data.configuration.train_parameters.cv_enabled === true ? "k折交叉验证" : "否";
            this.kFold = res.data.configuration.train_parameters.K_Fold;
            this.scale = res.data.configuration.train_parameters.test_set_division_scale * 100;
            this.validation = res.data.configuration.train_parameters.val_set_division_scale * 100;
            this.autoToHouse =
              res.data.configuration.train_parameters.automatically_store_after_training === 0 ? false : true;
            this.modelEvaluate = res.data.configuration.train_parameters.model_evaluate;
            this.timeSpan = res.data.configuration.train_parameters.time_span;
            this.timeUnitValue = res.data.configuration.train_parameters.time_unit;

            //加载配置信息
            this.modifyTaskConfiguration = res.data.configuration;
            console.log(this.dataSetValue, "this.dataSetValue");
            console.log(this.singleConfig, "this.singleConfig in 加载");
            console.log(res.data, "配置信息");
            console.log(this.taskName, "任务名");
          });
      }
    },
    //修改数据选择
    async modifyDataSelection() {
      try {
        await this.changeDataSetIndex(this.dataSetValue);
        this.setData.forEach((item, index) => {
          this.dataSheetValue.push(item.table_id);
        });
        await this.changeMultipleDataSheetIndex(this.dataSheetValue);
        console.log(this.testdata, "testdata");
        await this.loadingColumns();
        console.log(this.testdata, "testdata");
      } catch (error) {
        console.log(error);
      }
    },
    //加载时间、目标、特征字段
    async loadingColumns() {
      this.featureColValue = [];
      this.setData.forEach((item, index) => {
        if (item.time_column !== null) {
          console.log(this.columnsCascader, "this.columnsCascader in madifydataselection");
          this.testdata = this.columnsCascader;
          this.columnsCascader.forEach((item1, index1) => {
            if (item.table_id === item1.value) {
              item1.children.forEach((item2, index2) => {
                if (item2.value === item.time_column) {
                  this.timeColValue = [item1.value, item2.value];
                  item2.disabled = true;
                  console.log(this.timeColValue, "this.timeColValue in madifydataselection");
                }
              });
            }
          });
          this.featureColCascader.forEach((item, index) => {
            if (item.value === this.timeColValue[0]) {
              item.children.forEach((item1, index2) => {
                if (item1.value === this.timeColValue[1]) {
                  item1.disabled = true;
                }
              });
            }
          });
        }
        if (item.target_column !== null) {
          console.log(this.columnsCascader, "this.columnsCascader in madifydataselection");
          this.columnsCascader.forEach((item1, index1) => {
            if (item.table_id === item1.value) {
              item1.children.forEach((item2, index2) => {
                if (item2.value === item.target_column) {
                  this.targetColValue = [item1.value, item2.value];
                  item2.disabled = true;
                  console.log(this.targetColValue, "this.targetColValue in madifydataselection");
                }
              });
            }
          });
          this.featureColCascader.forEach((item, index) => {
            if (item.value === this.targetColValue[0]) {
              item.children.forEach((item1, index2) => {
                if (item1.value === this.targetColValue[1]) {
                  item1.disabled = true;
                }
              });
            }
          });
        }
        if (item.characteristic_columns !== null) {
          this.featureColCascader.forEach((item1, index1) => {
            if (item.table_id === item1.value) {
              item1.children.forEach((item2, index2) => {
                if (item.characteristic_columns.includes(item2.value)) {
                  this.featureColValue.push([item1.value, item2.value]);
                }
              });
            }
          });
        }
      });
      console.log(this.timeColValue, "时间字段");
      console.log(this.targetColValue, "目标字段");
      console.log(this.featureColValue, "特征字段");
      console.log(this.columnsCascader, "加载之后的级联选择器");
      console.log(this.featureColCascader, "加载之后的特征字段选择器");
      this.$nextTick(() => {
        setTimeout(() => {
          this.saveDataSelectedInPage1();
          this.loadingSingleCol();
          this.modifyFeatureEngineeringStrategy();
        }, 1000);
        this.loading = false;
      });
    },

    //修改特征工程策略
    modifyFeatureEngineeringStrategy() {
      //使用部分记录
      if (this.rowValue === "2") {
        this.partialRowList = [];
        this.numericalArray = [];
        console.log(this.readpartialRowList, "this.readpartialRowList in initialization");
        Object.keys(this.readpartialRowList).forEach((item, index) => {
          let tableColumns = item.split("__");
          this.partialRowList.push({
            index: index,
            col: tableColumns,
            operator: this.E2C[this.readpartialRowList[item].type],
            low_bound: this.readpartialRowList[item].range[0],
            high_bound: this.readpartialRowList[item].range[1],
            andOr: this.E2C[this.readpartialRowList[item].contact],
          });
          this.numericalArray.push(tableColumns);
          console.log(this.numericalArray, "numericalArray in initialization");
          this.selectedInPage2OfPartRecord.push(item);
        });
      }
      console.log(this.partialRowList, "partialRowList in initialization");
      //所有字段使用相同配置
      console.log(this.defaultConfig, "this.defaultConfig in initialization");
      console.log(this.columnDefaultConfig, "this.columnDefaultConfig in initialization");
      this.defaultConfig.forEach((item, index) => {
        this.columnDefaultConfig.forEach((op, i) => {
          if (op.name === this.E2C[Object.keys(item)]) {
            console.log(op.name, "op.name");
            console.log(this.E2C[Object.keys(item)], "this.E2C[Object.keys(item)]");
            op.used = true;
            if (op.name === "缺失值填充") {
              op.options[0].modelValue = this.E2C[item.missing_value_filling.data_filling_strategy];
              op.options[1].modelValue = item.missing_value_filling.data_fill_value;
              op.options[2].modelValue = this.E2C[item.missing_value_filling.char_filling_strategy];
              op.options[3].modelValue = item.missing_value_filling.char_fill_value;
            } else if (op.name === "离群点去除") {
              op.options[0].modelValue = item.outlier_removal.outlier_removal_strategy;
              op.options[1].modelValue = item.outlier_removal.mad_n;
              op.options[2].modelValue = item.outlier_removal.sigma_n;
            } else if (op.name === "归一化") {
              op.options[0].modelValue = this.E2C[item.scaling.scaling_strategy];
              op.options[1].modelValue = item.scaling.q_min;
              op.options[2].modelValue = item.scaling.q_max;
            } else if (op.name === "共线性特征去除") {
              op.options[0].modelValue = item.colinearity.colinearity_value;
            } else if (op.name === "OneHot编码") {
              op.options[0].modelValue = item.onehot_encoder.feature_num_min;
            } else if (op.name === "孤立森林") {
            }
          }
        });
      });
      //逐字段分别配置
      console.log(this.singleConfig, "this.singleConfig in initialization");
      console.log(this.selectedSingleCol, "this.selectedsinglecol in initialization");
      console.log(this.userSelectedSingleCol, "this.userselectedsinglecol in initialization");
      console.log(this.singleColFeatureDetails, " this.singleColFeaturedetails in initialization");
      this.userSelectedSingleCol.forEach((op, i) => {
        Object.keys(this.singleConfig).forEach((item, index) => {
          let columnsName = item.split("__");
          if (op.label[0] === columnsName[0] && op.label[1] === columnsName[1]) {
            op.used = true;
            op.options = [];
            op.optionsName = [];
            this.singleConfig[item].forEach((option, j) => {
              if (this.E2C[Object.keys(option)[0]] === "缺失值填充") {
                console.log(
                  Object.values(option)[0]["data_filling_strategy"],
                  "Object.values(option)[0]['data_filling_strategy']",
                );
                let middle = option;
                console.log(option, "option");
                console.log(middle, "middle");
                if (Object.values(middle)[0]["data_filling_strategy"] !== null) {
                  Object.values(middle)[0]["data_filling_strategy"] =
                    this.E2C[Object.values(middle)[0]["data_filling_strategy"]];
                }
                if (Object.values(middle)[0]["char_filling_strategy"] !== null) {
                  Object.values(middle)[0]["char_filling_strategy"] =
                    this.E2C[Object.values(middle)[0]["char_filling_strategy"]];
                }
                console.log(middle, "middle after");
                op.options.push(middle);
                op.optionsName.push(this.E2C[Object.keys(option)[0]]);
              } else if (this.E2C[Object.keys(option)[0]] === "归一化") {
                let middle = option;
                console.log(option, "option");
                console.log(middle, "middle");
                if (Object.values(middle)[0]["scaling_strategy"] !== null) {
                  Object.values(middle)[0]["scaling_strategy"] = this.E2C[Object.values(middle)[0]["scaling_strategy"]];
                }
                console.log(middle, "middle after");
                op.options.push(middle);
                op.optionsName.push(this.E2C[Object.keys(option)[0]]);
              } else {
                op.options.push(option);
                op.optionsName.push(this.E2C[Object.keys(option)[0]]);
              }
            });
          }
        });
      });
      console.log(this.userSelectedSingleCol, "特征工程页面加载完成");
    },
    //修改模型选择
    modifyModelSelection() {
      console.log(this.model, "this.model before");
      console.log(this.paramSelection, "this.paramSelection");
      Object.keys(this.paramSelection).forEach((item, index) => {
        this.model.forEach((option, i) => {
          if (option.parameter === item) {
            if (this.paramSelection[item].tuneParam) {
              if (this.paramSelection[item].tuneParam_type === "steps") {
                option.tuneParam = this.paramSelection[item].tuneParam;
                option.tuneParam_type = this.paramSelection[item].tuneParam_type;
                if (option.parameter === "learning_rate") {
                  option.step = {
                    type: ["×"],
                    typeValue: this.E2C[this.paramSelection[item].step_type],
                    value: this.paramSelection[item].step_value,
                  };
                } else {
                  option.step = {
                    type: ["+", "×"],
                    typeValue: this.E2C[this.paramSelection[item].step_type],
                    value: this.paramSelection[item].step_value,
                  };
                }
                option.area = {
                  low_bound: this.paramSelection[item].low_bound,
                  high_bound: this.paramSelection[item].high_bound,
                };
              } else {
                option.tuneParam = this.paramSelection[item].tuneParam;
                option.tuneParam_type = this.paramSelection[item].tuneParam_type;
                option.areaValue = this.paramSelection[item].value;
              }
            } else {
              option.tuneParam = this.paramSelection[item].tuneParam;
              if (item === "solver" || item === "loss_func") {
                option.defaultValue = this.paramSelection[item].defaultValue[0];
              } else {
                option.defaultValue = this.paramSelection[item].defaultValue;
              }
            }
          }
        });
      });
    },
    //修改训练参数
    modifyTrainparameters() {
    },
    //修改任务
    modifyTask() {
      if (!this.checkTestAndVal()) {
        return;
      }
      this.dataProcess();
      this.modifyTaskInfo["task_id"] = this.modifyTaskId;
      this.modifyTaskInfo["name"] = this.taskName;
      this.modifyTaskInfo["task_desc"] = this.taskDescription;
      this.modifyTaskInfo["type"] = this.modifyTaskType;
      this.modifyTaskInfo["configuration"] = this.middleData;
      // 使用 Pinia 获取 token
      const mainStore = useMainStore();
      let headers = {
        headers: { token: mainStore.getToken },
      };
      taskModify(this.modifyTaskInfo, headers)
        .then(res => {
          ElMessage({
            message: "修改成功！",
            type: "success",
            offset: 60,
          });
          this.backToTaskView();
        })
        .catch(err => {
          console.log(err, "出错了");
          ElMessage({
            message: "error！",
            type: "error",
            offset: 60,
          });
        });
    },
    //取消创建，返回任务列表
    backToTaskView() {
      router.push("/taskView");
    },
    //默认字段处理——表格多选函数
    handleSelectionChange(param) {
      console.log(new Date().getDate(), param, "handleSelectionChange的执行时间");
      console.log(param, "param in handleselectionchange");
      this.columnDefaultConfig.forEach((item, index) => {
        //先设置为false,当查找到当前item时再置为true
        item.used = false;
        param.forEach(option => {
          if (item.name === option.name) {
            item.used = true;
          }
        });
      });
      console.log(this.columnDefaultConfig, "this.columnDefaultConfig");
    },
    //加载用户数据集
    loadUserData() {
      this.userData = [];
      this.dataSet = [];
      request
        .get("/data/GetAllDataSetDataTableDataColumns", {
          params: {},
        })
        .then(res => {
          this.userData = res.data;
          res.data.forEach(item => {
            this.dataSet.push({ label: item.set_name, value: item.set_id });
          });
          console.log(this.userData, "this.userData");
        });
    },
    //选择用户数据集时加载数据集中的数据表
    async changeDataSetIndex(param) {
      // this.dataSheetValue = '',
      (this.dataSheet = []),
        this.userData.forEach(item => {
          if (item.set_id === param) {
            item.tables.forEach(item2 => {
              this.dataSheet.push({
                label: item2.table_name,
                value: item2.table_id,
                columns: item2.columns,
                rowNum: item2.row_num,
                disabled: false,
              });
            });
          }
        });
      console.log(this.dataSheet, "数据集变化后的数据表");
      console.log(this.columnsCascader, "数据集变化后的数据表中的字段信息");
      console.log(param);
    },
    //禁用行数不等的表
    disabledUnequalRowNum() {
      //根据行数控制禁用属性
      let rowNum;
      if (this.dataSheetValue[0]) {
        this.dataSheet.forEach((item, index) => {
          if (item.value === this.dataSheetValue[0]) {
            rowNum = item.rowNum;
          }
        });
        this.dataSheet.forEach((item, index) => {
          if (item.rowNum != rowNum) {
            item.disabled = true;
          }
        });
      } else {
        this.dataSheet.forEach((item, index) => {
          item.disabled = false;
        });
      }
    },

    //目标字段的禁用
    disabledColumns() {
      this.columnsCascader.forEach((item, index) => {
        if (this.targetColValue[0] === item.value) {
          item.children.forEach((item1, index1) => {
            if (this.targetColValue[1] === item1.value) {
              item1.disabled = true;
              console.log(item1.value, item1.disabled, "targetcolvalue item1.value");
            }
          });
        }
        if (this.timeColValue[0] === item.value) {
          item.children.forEach((item1, index1) => {
            if (this.timeColValue[1] === item1.value) {
              item1.disabled = true;
              console.log(this.timeColValue, "timecolvalue");
              console.log(item1.value, item1.disabled, "timecolvalue item1.value");
            }
          });
        }
      });

      this.featureColCascader.forEach((item, index) => {
        if (this.targetColValue[0] === item.value) {
          item.children.forEach((item1, index1) => {
            if (this.targetColValue[1] === item1.value) {
              item1.disabled = true;
              console.log(item1.value, item1.disabled, "item1.value");
            }
          });
        }
        if (this.timeColValue[0] === item.value) {
          item.children.forEach((item1, index1) => {
            if (this.timeColValue[1] === item1.value) {
              item1.disabled = true;
              console.log(item1.value, item1.disabled, "item1.value");
            }
          });
        }
      });
    },
    //特征字段的禁用
    disabledFeatureColumns() {
      this.featureColValue.forEach((item, index) => {
        this.columnsCascader.forEach((item1, index1) => {
          if (item[0] === item1.value) {
            item1.children.forEach((item2, index2) => {
              if (item[1] === item2.value) {
                item2.disabled = true;
                console.log(item[0], item2.value, item2.disabled, "feature disabled");
              }
            });
          }
        });
      });
    },
    //选择数据表时加载多个数据表中的字段(列)
    async changeMultipleDataSheetIndex(param) {
      this.tableColumns = [];
      console.log(param, "changeMultipleDataSheetIndex 中的参数");
      //只有当选择数据表不为空时才调用接口去加载数据表对应的字段
      if (param) {
        //形成级联选择器
        this.columnsCascader = [];
        this.featureColCascader = [];
        // this.columnsType = [];
        // this.numericalList = [];
        this.dataSheet.forEach((item2, index2) => {
          for (let i = 0; i < param.length; i++) {
            if (param[i] === item2.value) {
              //初步获取数据表的基本信息
              this.columnsCascader.push({
                label: item2.label,
                value: item2.value,
                children: [],
              });
              this.columnsCascader.forEach((item4, index4) => {
                if (item2.label === item4.label) {
                  item4.children = [];
                  item2.columns.forEach((item3, index3) => {
                    item4.children.push({
                      disabled: false,
                      value: item3,
                      label: item3,
                      dataType: "",
                      options: [],
                    });
                  });
                  console.log(item4.label, "表名");
                }
              });
              //获取字段的类型
              //调用接口获取所选数据表中字段的类型
              this.$nextTick(() => {
                request
                  .get("/datadetail", {
                    //传给后端，请求数据
                    params: {
                      table_id: param[i],
                    },
                  })
                  .then(res => {
                    if (res.code === "0") {
                      console.log(res.data, "res.data in changeMultipleDataSheetIndex");
                      res.data.forEach((item, index) => {
                        //级联选择器存储数据类型
                        this.columnsCascader.forEach((item1, index1) => {
                          if (item1.label === item2.label) {
                            item1.children.forEach((item5, index6) => {
                              if (item5.label === item.fieldName) {
                                item5.dataType = item.dataType;
                              }
                            });
                          }
                        });
                      });
                      console.log(this.columnsCascader, "级联选择器中的字段");
                      // console.log(this.numericalList, '数值型数据列表');
                      // console.log(this.columnsType, "字段类型")
                      //在这里把数值型数据存起来以便于后续的校验
                    }
                  });
              });
            }
          }
        });
        console.log(this.columnsCascader, "字段级联选择器信息");
        this.dataSheet.forEach((item2, index2) => {
          for (let i = 0; i < param.length; i++) {
            if (param[i] === item2.value) {
              //初步获取数据表的基本信息
              this.featureColCascader.push({
                label: item2.label,
                value: item2.value,
                children: [],
              });
            }
            this.featureColCascader.forEach((item4, index4) => {
              if (item2.label === item4.label) {
                item4.children = [];
                item2.columns.forEach((item3, index3) => {
                  item4.children.push({
                    disabled: false,
                    value: item3,
                    label: item3,
                  });
                });
                console.log(item4.label, "表名");
              }
            });
          }
        });
        console.log(this.featureColCascader, "特征字段的级联选择器信息");
      }
    },
    //保存数据选择页面的数据
    async saveDataSelectedInPage1() {
      this.selectedSingleCol = [];
      console.log(this.timeColValue, "this.timecolvalue in savadataselected in page1");
      console.log(this.targetColValue, "this.targetcolvalue in savadataselected in page1");
      console.log(this.featureColValue, "this.featurecolvalue in savadataselected in page1");
      console.log(this.columnsCascader, "this.columnscascader in savedataselected in page1");

      this.columnsCascader.forEach((item, index) => {
        console.log(item, "item in columnsCascader in page 1");
        this.selectedSingleCol.push({
          label: item.label,
          value: item.value,
          disabled: false,
          children: [],
        });
        item.children.forEach((item1, index1) => {
          console.log(item1, "item1 in columnsCascader in  page1");
          if (item1.disabled === true) {
            this.selectedSingleCol.forEach((item2, index2) => {
              if (item2.value === item.value) {
                item2.children.push({
                  label: item1.label,
                  value: item1.value,
                  disabled: false,
                  dataType: item1.dataType,
                  used: false,
                  colType: "",
                  options: [],
                  optionsName: [],
                });
              }
            });
          }
        });
      });
      console.log(this.selectedSingleCol, "未标记字段前的数据选择页面的数据");
      //标记字段
      this.selectedSingleCol.forEach((item, index) => {
        //标记目标字段
        if (item.value === this.targetColValue[0]) {
          item.children.forEach((item1, index1) => {
            if (item1.label === this.targetColValue[1]) {
              item1.colType = "target";
            }
          });
        }
        //标记时间字段
        if (item.value === this.timeColValue[0]) {
          item.children.forEach((item1, index1) => {
            if (item1.label === this.timeColValue[1]) {
              item1.colType = "time";
            }
          });
        }
        //标记特征字段
        this.featureColValue.forEach((item2, index2) => {
          if (item.value === item2[0]) {
            item.children.forEach((item1, index1) => {
              if (item1.label === item2[1]) {
                item1.colType = "feature";
              }
            });
          }
        });
      });
      console.log(this.selectedSingleCol, "数据选择页面的数据");
      this.disabledNonnumericCol();
    },
    //禁用非数值型字段（需监听）
    disabledNonnumericCol() {
      this.numericalList = [];
      //保留无字段表名
      this.selectedSingleCol.forEach((item, index) => {
        this.numericalList.push({
          label: item.label,
          value: item.label,
          disabled: false,
          children: [],
        });
        item.children.forEach((item1, index1) => {
          this.numericalList.forEach((item2, index2) => {
            if (item2.label === item.label) {
              item2.children.push({
                label: item1.label,
                value: item1.value,
                disabled: false,
                dataType: item1.dataType,
              });
            }
          });
        });
      });
      this.numericalList.forEach((item, index) => {
        console.log(item.children.length, "item.children");
        if (item.children.length === 0) {
          item.disabled = true;
        }
        item.children.forEach((item1, index1) => {
          if (item1.dataType != "float8") {
            item1.disabled = true;
          }
        });
      });
      console.log(this.numericalList, "部分记录下拉框中的数值型数据");
      console.log(this.partialRowList, "this.partialRowList");
    },
    //禁用已选数值型字段
    disabledSelectedNumericCol() {
      this.numericalArray = [];
      this.partialRowList.forEach((item, index) => {
        this.numericalArray.push(item.col);
        console.log(this.numericalArray, "numericalArray");
      });
      this.numericalArray.forEach((item, index) => {
        this.numericalList.forEach((item1, index1) => {
          if (item[0] === item1.value) {
            item1.children.forEach((item2, index2) => {
              if (item[1] === item2.value) {
                item2.disabled = true;
              }
            });
          }
        });
      });

      console.log(this.numericalList, "禁用后的级联选择器");
    },
    //加载逐字段分别配置的可选项
    async loadingSingleCol() {
      this.userSelectedSingleCol = [];
      this.selectedSingleCol.forEach((item, index) => {
        item.children.forEach((item1, index1) => {
          console.log(item1.dataType, "datatype in loadingsinglecol");
          this.userSelectedSingleCol.push({
            colType: item1.colType,
            dataType: item1.dataType,
            label: [item.label, item1.label],
            options: [],
            optionsName: [],
            used: false,
            value: [index, index1],
          });
        });
      });
      console.log(this.userSelectedSingleCol, "逐字段分别配置的可选项");
    },
    //检查任务名字是否重复,也可以采取el-form表单的形势校验和跳转
    checkName() {
      if (this.taskName === "") {
        this.nameLack = true;
        ElMessage({
          message: "请输入任务名称！",
          type: "error",
          offset: 60,
        });
      } else {
        this.nameLack = false;
        console.log(this.taskName);
        request
          .get("/TaskManage/JudgeTaskNameRepeat", {
            params: {
              name: this.taskName,
              task_id: this.modifyTaskId,
            },
          })
          .then(res => {
            if (res.code === "0") {
              this.nameRepeat = false;
              this.pageIndex = 1;
            } else {
              this.nameRepeat = true;
              ElMessage({
                message: "任务名称重复，请重新输入！",
                type: "error",
                offset: 60,
              });
            }
          })
          .catch(err => {
            ElMessage({
              message: "error",
              type: "error",
              offset: 60,
            });
          });
      }
    },
    //部分记录选择字段时执行
    partRecordChanged(param) {
      this.selectedInPage2OfPartRecord.push(param.label);
    },
    //检查选择数据集、数据表、特征字段等是否填写
    checkDataSet() {
      //判断必填项是否填写，未填写则提示填写
      if (this.dataSetValue === "") {
        this.dataSetLack = true;
      } else if (this.dataSheetValue === "") {
        this.dataSheetLack = true;
      } else if (this.taskTypeValue === "") {
        this.taskTypeLack = true;
      } else if (this.timeColValue === "" && this.taskTypeValue === "time_series_prediction") {
        this.timeColLack = true;
      } else if (this.targetColValue === "" && this.taskTypeValue !== "named_entity_recognition") {
        this.targetColLack = true;
      } else if (this.featureColValue.length === 0 && this.taskTypeValue !== "named_entity_recognition") {
        this.featureColLack = true;
      }else if(this.taskTypeValue === "named_entity_recognition"){
        // 命名实体识别任务跳过特征工程
        this.pageIndex = 3;
      }else {
        this.pageIndex = 2;
      }
    },
    //加载字段处理——默认配置中之前用户的选择
    checkSpecialCol(param) {
      let tableId;
      this.selectedSingleCol.forEach(item => {
        if (param[0] === item.label) tableId = item.value;
      });
      if (this.timeColValue[0] === tableId && this.timeColValue[1] === param[1]) {
        return param[1] + "&nbsp&nbsp(时间)".fontsize("3.0");
      } else if (this.targetColValue[0] === tableId && this.targetColValue[1] === param[1]) {
        return param[1] + "&nbsp&nbsp(目标)".fontsize("3.0");
      } else {
        return param[1];
      }
    },
    loadSelection() {
      console.log("执行了loadselection");
      console.log(this.columnDefaultConfig, "this.columnDefaultConfig in loadselection");
      this.columnDefaultConfig.forEach((item, index) => {
        if (item.used) {
          this.$nextTick(function() {
            this.$refs.multipleTableRef.toggleRowSelection(item);
          });
        }
      });
    },
    checkRobust() {
      this.columnDefaultConfig.forEach(item => {
        if (item.name === "归一化") {
          let q_min = 0;
          let q_max = 0;
          let checkFlag = false;
          item.options.forEach(option => {
            if (option.name === "第一分位数") {
              q_min = option.modelValue;
            } else if (option.name === "第二分位数") {
              q_max = option.modelValue;
            }
            if (option.name === "归一化方法" && option.modelValue === "Robust") {
              checkFlag = true;
            }
          });
          if (checkFlag) {
            if (q_min > q_max) {
              ElMessage({
                message: "请输入合适的数值！",
                type: "error",
                offset: 60,
              });
              this.defaultColumnFlag = false;
            } else {
              this.defaultColumnFlag = true;
            }
          } else {
            this.defaultColumnFlag = true;
          }
        }
      });
    },
    checkPartRecord() {
      let err = false;
      this.partialRowList.forEach((item, index) => {
        if (item.low_bound !== "" && item.high_bound !== "") {
          if (Number(item.low_bound) > Number(item.high_bound)) {
            err = true;
          }
        }
      });
      if (err) {
        ElMessage({
          message: "请输入合适的数值!",
          type: "error",
          offset: 60,
        });
        this.partRecordFlag = false;
      } else {
        this.partRecordFlag = true;
      }
    },
    //特征策略页面的下一步，主要用于更新用户所处理的单字段到this.userSelectedSingleCol
    featureClick(param) {
      this.defaultColumnFlag = true;
      this.partRecordFlag = true;
      //使用部分记录的时候检查数值是否合理
      if (this.rowValue === "2") {
        this.checkPartRecord();
      }
      //使用默认字段处理的时候检查数值是否合理
      if (this.colValue === "1") {
        this.checkRobust();
      }
      if (this.defaultColumnFlag && this.partRecordFlag) {
        console.log("1111");
        this.pageIndex = param;
      }
      console.log(this.partialRowList, "this.partialRowListInitial in featureNext");
      console.log("this.userSelectedSingleCol  in featureNext", this.userSelectedSingleCol);
    },
    removeTag(param) {
      console.log(param);
    },
    //加载具体配置项，这个时间复杂度有点高，需要后续优化
    loadSingleColDetail() {
      this.singleColFeatureDetails = [];
      this.userSelectedSingleCol[this.currentSingleRow].options.forEach((item, index) => {
        console.log(this.userSelectedSingleCol, "测试 this.userSelectedSingleCol");
        console.log(item, "测试item");
        if (this.singleColFeatureName === this.E2C[Object.keys(item)[0]]) {
          console.log(this.E2C[Object.keys(item)[0]], "特征策略配置项的名字");
          console.log(Object.values(item)[0], "测试null值");
          if (Object.values(item)[0] !== null) {
            Object.keys(Object.values(item)[0]).forEach(option => {
              let middle = {};
              middle["name"] = this.E2C[option];
              middle["modelValue"] = Object.values(item)[0][option];
              console.log(middle, "配置信息");
              this.featureTableData.forEach(ele => {
                if (this.singleColFeatureName === ele.name) {
                  ele.options.forEach(e => {
                    if (e.name === this.E2C[option]) {
                      middle["value"] = e.value;
                    }
                  });
                }
              });
              this.singleColFeatureDetails.push(middle);
              console.log(this.featureTableData, "featuretabledata in loadsinglecoldetails");
              console.log(this.singleColFeatureDetails, "singleColFeatureDetails in loadsinglecoldetails");
            });
          }
        }
      });
    },
    //单字段配置弹窗中的选择配置项，在选择配置项后加载具体配置信息
    changeSingleColFeature(param) {
      /*
      this.singleColFeatureName：选择的配置项的名字
      this.singleColFeatureDetails：选择的配置项对应的具体配置方法，用于展示在弹窗中。
       */
      this.singleColFeatureName = param;
      this.singleColFeatureDetails = [];
      //这是关键函数
      this.loadSingleColDetail();
    },
    //修改单字段配置弹窗中配置项的具体配置方法
    changeSingleDetails(param, name) {
      /*
      name:配置项的具体配置方法的名称
      param:配置项的具体配置方法对应的值
      this.userSelectedSingleCol：用于保存用户的单字段配置信息
       */
      let middle = {};
      middle["name"] = this.C2E[this.singleColFeatureName];
      middle["method"] = this.C2E[name];
      middle["value"] = param;
      //保存用户的修改项，只有当用户点击确定后才会更新到this.userSelectedSingleCol
      this.temporaryData.push(middle);
    },
    //单字段弹窗点击确定按钮保存更改
    singleFeatureDialogConfirm() {
      console.log(this.temporaryData, "this.temporaryData");
      this.temporaryData.forEach((option, index) => {
        this.userSelectedSingleCol[this.currentSingleRow].options.forEach((item, i) => {
          if (Object.keys(item)[0] === option.name) {
            item[option.name][option.method] = option.value;
          }
        });
      });
      this.temporaryData = [];
      this.singleFeatureDialogVisible = false;
    },
    //设置单字段的预处理策略，即每个字段对应的多选框
    changeSingeColFeature(param, index, item) {
      this.currentSingleRow = index;
      if (param.length > 0) {
        item.used = true;
      } else {
        item.used = false;
      }
      this.singleColFeatureName = param[param.length - 1];
      //新增数据
      if (this.userSelectedSingleCol[this.currentSingleRow].options.length < param.length) {
        this.featureTableData.forEach(item => {
          if (item.name === this.singleColFeatureName) {
            //保存单字段配置项中单个特征对应的配置
            this.singleColFeatureDetails = item.options;
            //将单字段的配置项初始化并保存
            let row = {};
            row[this.C2E[this.singleColFeatureName]] = {};
            //特征处理策略有配置项的情况
            if (Object.keys(this.singleColFeatureDetails[0]).length > 0) {
              this.singleColFeatureDetails.forEach(option => {
                row[this.C2E[this.singleColFeatureName]][this.C2E[option.name]] = option.modelValue;
              });
              this.userSelectedSingleCol[this.currentSingleRow].options.push(row);
            }
            //特征处理策略没有配置项的情况
            else {
              row[this.C2E[this.singleColFeatureName]] = null;
              this.userSelectedSingleCol[this.currentSingleRow].options.push(row);
            }
          }
        });
      }
      //移除数据
      else if (this.userSelectedSingleCol[this.currentSingleRow].options.length > param.length) {
        this.userSelectedSingleCol[this.currentSingleRow].options.forEach((item, index) => {
          console.log(Object.keys(item)[0] + index);
          console.log(param.indexOf(Object.keys(item)[0]));
          if (param.indexOf(this.E2C[Object.keys(item)[0]]) >= 0) {
            console.log(Object.keys(item));
          } else {
            let num = this.userSelectedSingleCol[this.currentSingleRow].options.indexOf(item);
            this.userSelectedSingleCol[this.currentSingleRow].options.splice(num, 1);
          }
        });
      }
      console.log("this.singleColFeatureDetails", this.singleColFeatureDetails);
    },
    //打开单字段设置的单特征参数配置界面
    openSingleFeature(item, index) {
      console.log(this.userSelectedSingleCol);
      this.singleFeatureDialogVisible = true;
      this.currentSingleRow = index;
      this.singleColFeatureNameList = [];
      this.singleColFeatureDetails = [];
      this.currentCol = `字段：${this.userSelectedSingleCol[index].label[1]}`;
      this.currentColDataType = this.userSelectedSingleCol[index].dataType;
      this.userSelectedSingleCol[this.currentSingleRow].options.forEach(item => {
        this.singleColFeatureNameList.push(this.E2C[Object.keys(item)[0]]);
      });
      console.log(this.singleColFeatureNameList, "this.singleColFeatureNameList");
      this.singleColFeatureName = this.singleColFeatureNameList[0];
      this.loadSingleColDetail();
      console.log("this.singleColFeatureNameList", this.singleColFeatureNameList);
      console.log("this.userSelectedSingleCol", this.userSelectedSingleCol);
    },
    //跳转至创建数据集页面
    toCreateDataSet() {
      router.push("/datascreen");
    },
    //任务类型改变使模型列表发生改变
    changeModelList() {
      if (this.taskTypeValue === "time_series_prediction") {
        this.modelList = ["LSTM", "CNN", "Transformer"];
      } else if (this.taskTypeValue === "regression" || this.taskTypeValue === "classification") {
        this.modelList = ["MLP", "GDBT"];
      } else if (this.taskTypeValue === "named_entity_recognition"){
        this.modelList = ["GlobalPointer"]
      }
    },
    //计算网格搜索次数
    computeNumOfGrid() {
      const computeList = [];
      this.computeNumString = "";
      this.model.forEach(item => {
        if (item.tuneParam) {
          if (item.hasOwnProperty("step")) {
            console.log(item, "item in 计算网格搜索次数");
            if (item.area.high_bound !== "" && item.area.low_bound !== "" && item.step.value !== "") {
              let low_bound = Number(item.area.low_bound);
              let high_bound = Number(item.area.high_bound);
              let stepValue = Number(item.step.value);
              if (high_bound >= low_bound) {
                item.gridError = false;
                let difference = high_bound - low_bound;
                if (item.step.typeValue === "+") {
                  let num = Math.floor(difference / stepValue);
                  computeList.push(num + 1);
                } else if (item.step.typeValue === "×") {
                  if (low_bound === 0) {
                    item.gridError = true;
                  } else {
                    let start = low_bound;
                    let num = 0;
                    while (start * stepValue <= high_bound) {
                      start = start * stepValue;
                      num++;
                    }
                    computeList.push(num + 1);
                  }
                }
              } else {
                item.gridError = true;
              }
            }
          } else {
            computeList.push(item.areaValue.length);
          }
        }
      });
      let total = 1;
      if (computeList.length > 0) {
        computeList.forEach((item, index) => {
          total = total * item;
          if (index != computeList.length - 1) {
            this.computeNumString += item;
            this.computeNumString += "×";
          } else {
            this.computeNumString += item;
            this.computeNumString += "=";
          }
        });
        this.computeNumString += total;
      } else {
        this.computeNumString = 0;
      }
      console.log(this.gridSearchError, "this.gridSearchError");
    },
    //在特征策略页下一步或者上一步时判断网格搜索数值是否填写正确
    checkGridError(param) {
      this.gridSearchError = false;
      this.model.forEach((item, index) => {
        if (item.gridError) {
          this.gridSearchError = true;
        }
      });
      if (!this.gridSearchError) {
        this.pageIndex = param;
      } else {
        ElMessage({
          message: "请输入合适的数值！",
          type: "error",
          offset: 60,
        });
      }
    },
    //拼接字符串
    dataProcess() {
      console.log(this.model, "this.model in dataprocess");
      let setData = [];
      console.log(this.selectedSingleCol, "this.selectedsinglecol 拼接字符串");
      this.selectedSingleCol.forEach((item, index) => {
        setData.push({
          table_id: item.value,
          table_name: item.label,
          time_column: null,
          target_column: null,
          characteristic_columns: [],
        });
      });
      this.selectedSingleCol.forEach((item, index) => {
        item.children.forEach((item1, index1) => {
          setData.forEach((item2, index2) => {
            if (item2.table_id === item.value) {
              if (item1.colType === "time") {
                item2.time_column = item1.label;
              } else if (item1.colType === "target") {
                item2.target_column = item1.label;
              } else {
                item2.characteristic_columns.push(item1.label);
              }
            }
          });
        });
      });
      console.log(setData, " 数据收集");
      this.middleData = {
        //容器配置
        container_conf: {
          mem_limit: this.memory * 1000000000,
          cpus: this.cpuCoreNum,
          cpu_str: null,
        },
        //数据选择参数
        select_data: {
          set_id: this.dataSetValue,
          task_type: this.taskTypeValue,
          set_data: setData,
        },

        //特征工程策略参数
        feature_engineering_strategy: {
          record_processing: {
            all: this.rowValue === "1" ? true : false,
            columns: {},
          },
          column_processing: {
            datatype: {},
            default: this.colValue === "1" ? true : false,
            default_config: [],
            single_config: {},
          },
        },
        //模型参数
        model_parameters: {
          type: this.modelName,
          hyperparameter: {},
        },
        //训练参数
        train_parameters: {
          time_span: this.timeSpan,
          time_unit: this.timeUnitValue,
          cv_enabled: this.crossValidation === "否" ? false : true,
          K_Fold: this.kFold,
          val_set_division_scale: this.validation / 100,
          test_set_division_scale: this.scale / 100,
          automatically_store_after_training: this.autoToHouse ? 1 : 0,
          model_evaluate: this.modelEvaluate,
        },
      };
      //针对LSTM模型
      if (this.modelName === "LSTM") {
        this.middleData.model_parameters.hyperparameter["batch_size"] = {
          data_type: "int",
          tuneParam: this.model[0].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["epoch"] = {
          data_type: "int",
          tuneParam: this.model[1].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["learning_rate"] = {
          data_type: "float",
          tuneParam: this.model[2].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["loss_func"] = {
          tuneParam: this.model[3].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["solver"] = {
          tuneParam: this.model[4].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["num_layers"] = {
          data_type: "int",
          tuneParam: this.model[5].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["seq_len"] = {
          data_type: "int",
          tuneParam: this.model[6].tuneParam,
        };
      }

      //针对MLP模型
      if (this.modelName === "MLP") {
        this.middleData.model_parameters.hyperparameter["alpha"] = {
          data_type: "float",
          tuneParam: this.model[0].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["batch_size"] = {
          data_type: "int",
          tuneParam: this.model[1].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["learning_rate"] = {
          data_type: "float",
          tuneParam: this.model[2].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["max_iter"] = {
          data_type: "int",
          tuneParam: this.model[3].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["solver"] = {
          tuneParam: this.model[4].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["n_layers"] = {
          data_type: "int",
          tuneParam: this.model[5].tuneParam,
        };
      }

      //针对GDBT模型
      if (this.modelName === "GDBT") {
        this.middleData.model_parameters.hyperparameter["alpha"] = {
          data_type: "float",
          tuneParam: this.model[0].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["learning_rate"] = {
          data_type: "float",
          tuneParam: this.model[1].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["loss_func"] = {
          tuneParam: this.model[2].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["n_estimators"] = {
          data_type: "int",
          tuneParam: this.model[3].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["max_depth"] = {
          data_type: "int",
          tuneParam: this.model[4].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["min_samples_leaf"] = {
          data_type: "int",
          tuneParam: this.model[5].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["min_samples_split"] = {
          data_type: "int",
          tuneParam: this.model[6].tuneParam,
        };
      }

      //针对CNN模型
      if (this.modelName === "CNN") {
        this.middleData.model_parameters.hyperparameter["batch_size"] = {
          data_type: "int",
          tuneParam: this.model[0].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["epoch"] = {
          data_type: "int",
          tuneParam: this.model[1].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["learning_rate"] = {
          data_type: "float",
          tuneParam: this.model[2].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["loss_func"] = {
          tuneParam: this.model[3].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["solver"] = {
          tuneParam: this.model[4].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["kernel_size"] = {
          data_type: "int",
          tuneParam: this.model[5].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["conv_layers"] = {
          data_type: "int",
          tuneParam: this.model[6].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["seq_len"] = {
          data_type: "int",
          tuneParam: this.model[7].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["out_channel"] = {
          data_type: "int",
          tuneParam: this.model[8].tuneParam,
        };
      }

      //针对Transformer模型
      if (this.modelName === "Transformer") {
        this.middleData.model_parameters.hyperparameter["batch_size"] = {
          data_type: "int",
          tuneParam: this.model[0].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["epoch"] = {
          data_type: "int",
          tuneParam: this.model[1].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["learning_rate"] = {
          data_type: "float",
          tuneParam: this.model[2].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["loss_func"] = {
          tuneParam: this.model[3].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["solver"] = {
          tuneParam: this.model[4].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["seq_len"] = {
          data_type: "int",
          tuneParam: this.model[5].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["d_model"] = {
          data_type: "int",
          tuneParam: this.model[6].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["nhead"] = {
          data_type: "int",
          tuneParam: this.model[7].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["nhid"] = {
          data_type: "int",
          tuneParam: this.model[8].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["nlayers"] = {
          data_type: "int",
          tuneParam: this.model[9].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["dropout"] = {
          data_type: "float",
          tuneParam: this.model[10].tuneParam,
        };
      }

      //针对GlobalPointer模型
      if (this.modelName === "GlobalPointer") {
        this.middleData.model_parameters.hyperparameter["batch_size"] = {
          data_type: "int",
          tuneParam: this.model[0].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["epoch"] = {
          data_type: "int",
          tuneParam: this.model[1].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["learning_rate"] = {
          data_type: "float",
          tuneParam: this.model[2].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["eval_steps"] = {
          data_type: "int",
          tuneParam: this.model[3].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["dropout"] = {
          data_type: "float",
          tuneParam: this.model[4].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["nhead"] = {
          data_type: "int",
          tuneParam: this.model[5].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["weight_decay"] = {
          data_type: "float",
          tuneParam: this.model[6].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["warmup_proportion"] = {
          data_type: "float",
          tuneParam: this.model[7].tuneParam,
        };
        this.middleData.model_parameters.hyperparameter["max_seq_len"] = {
          data_type: "int",
          tuneParam: this.model[8].tuneParam,
        };
      }
      //根据各个参数是否调参拼接字符串
      this.model.forEach((item, index) => {
        if (item.tuneParam) {
          if (item.tuneParam_type === "steps") {
            this.middleData.model_parameters.hyperparameter[item.parameter]["tuneParam_type"] = item.tuneParam_type;
            this.middleData.model_parameters.hyperparameter[item.parameter]["low_bound"] = Number(item.area.low_bound);
            this.middleData.model_parameters.hyperparameter[item.parameter]["high_bound"] = Number(
              item.area.high_bound,
            );
            this.middleData.model_parameters.hyperparameter[item.parameter]["step_type"] =
              this.C2E[item.step.typeValue];
            this.middleData.model_parameters.hyperparameter[item.parameter]["step_value"] = Number(item.step.value);
          } else {
            this.middleData.model_parameters.hyperparameter[item.parameter]["tuneParam_type"] = item.tuneParam_type;
            this.middleData.model_parameters.hyperparameter[item.parameter]["value"] = JSON.parse(
              JSON.stringify(item.areaValue),
            );
          }
        } else {
          if (item.parameter === "loss_func" || item.parameter === "solver") {
            this.middleData.model_parameters.hyperparameter[item.parameter]["defaultValue"] = [item.defaultValue];
          } else {
            this.middleData.model_parameters.hyperparameter[item.parameter]["defaultValue"] = [
              Number([item.defaultValue]),
            ];
          }
        }
      });

      //记录处理——使用部分记录筛选条件
      if (this.middleData.feature_engineering_strategy.record_processing.all === false) {
        this.partialRowList.forEach(item => {
          if (item.operator === "之间") {
            this.middleData.feature_engineering_strategy.record_processing.columns[item.col[0] + "__" + item.col[1]] = {
              contact: this.C2E[item.andOr],
              type: this.C2E[item.operator],
              range: [Number(item.low_bound), Number(item.high_bound)],
            };
          } else {
            this.middleData.feature_engineering_strategy.record_processing.columns[item.col[0] + "__" + item.col[1]] = {
              contact: this.C2E[item.andOr],
              type: this.C2E[item.operator],
              range: [Number(item.low_bound)],
            };
          }
        });
      }

      //字段处理-添加特征字段的类型
      this.userSelectedSingleCol.forEach(item => {
        if (item.colType === "feature") {
          this.middleData.feature_engineering_strategy.column_processing.datatype[
          item.label[0] + "__" + item.label[1]
            ] = item.dataType === "float8" ? "float" : "str";
        }
      });
      //字段处理——默认配置
      if (this.middleData.feature_engineering_strategy.column_processing.default === true) {
        this.columnDefaultConfig.forEach(item => {
          console.log(this.columnDefaultConfig, "columnDefaultConfig in dataprocess");
          if (item.used) {
            const middle = {};
            middle[this.C2E[item.name]] = {};
            //当特征处理策略item的options有值的时候再保存下来。
            if (Object.keys(item.options[0]).length > 0) {
              console.log(item.name, "option name");
              if (item.name === "归一化" || item.name === "缺失值填充") {
                item.options.forEach(option => {
                  console.log(
                    JSON.parse(JSON.stringify(option.modelValue)),
                    "JSON.parse(JSON.stringify(option.modelValue))",
                  );
                  if (
                    option.name === "数值填充策略" ||
                    option.name === "字符填充策略" ||
                    option.name === "归一化方法"
                  ) {
                    middle[this.C2E[item.name]][this.C2E[option.name]] =
                      this.C2E[JSON.parse(JSON.stringify(option.modelValue))];
                    console.log(
                      this.C2E[JSON.parse(JSON.stringify(option.modelValue))],
                      "this.C2E[JSON.parse(JSON.stringify(option.modelValue))]",
                    );
                  } else {
                    middle[this.C2E[item.name]][this.C2E[option.name]] = JSON.parse(JSON.stringify(option.modelValue));
                  }
                });
              } else {
                item.options.forEach(option => {
                  middle[this.C2E[item.name]][this.C2E[option.name]] = JSON.parse(JSON.stringify(option.modelValue));
                });
              }
            }
            //当options里为空的时候设置为None,比如孤立森林
            else {
              middle[this.C2E[item.name]] = null;
            }
            console.log(middle, "middle");
            this.middleData.feature_engineering_strategy.column_processing.default_config.push(middle);
          }
        });
      }
      //字段处理-单字段处理
      else {
        console.log(this.userSelectedSingleCol, "this.userSelectedSingleCol in dataprocess");
        this.userSelectedSingleCol.forEach(item => {
          if (item.used) {
            console.log(item.options, "item.options in userSelectedSingleCol");
            //根据字符串要求，缺失值填充单独考虑
            if (item.optionsName.includes("缺失值填充")) {
              let middle = JSON.parse(JSON.stringify(item.options));
              console.log(middle, "middle in queshizhi");
              middle.forEach(option => {
                let k = Object.keys(option)[0];
                if (k === "missing_value_filling") {
                  console.log(option[k], "option[k] in data process");

                  if (item.dataType === "float8") {
                    option[k] = {
                      data_filling_strategy: this.C2E[option[k]["data_filling_strategy"]],
                      data_fill_value: Number(option[k]["data_fill_value"]),
                      char_filling_strategy: null,
                      char_fill_value: null,
                    };
                  } else {
                    option[k] = {
                      data_filling_strategy: null,
                      data_fill_value: null,
                      char_filling_strategy: this.C2E[option[k]["char_filling_strategy"]],
                      char_fill_value: option[k]["char_fill_value"],
                    };
                  }
                }
                if (k === "scaling") {
                  console.log(option[k], "scalingdata in data process");
                  option[k] = {
                    scaling_strategy: this.C2E[option[k]["scaling_strategy"]],
                    q_min: option[k]["q_min"],
                    q_max: option[k]["q_max"],
                  };
                }
              });
              this.middleData.feature_engineering_strategy.column_processing.single_config[
              item.label[0] + "__" + item.label[1]
                ] = middle;
            } else if (item.optionsName.includes("归一化")) {
              let middle1 = JSON.parse(JSON.stringify(item.options));
              middle1.forEach(option => {
                let k = Object.keys(option)[0];
                if (k === "missing_value_filling") {
                  console.log(option[k], "option[k] in data process");
                  if (item.dataType === "float8") {
                    option[k] = {
                      data_filling_strategy: this.C2E[option[k]["data_filling_strategy"]],
                      data_fill_value: Number(option[k]["data_fill_value"]),
                      char_filling_strategy: null,
                      char_fill_value: null,
                    };
                  } else {
                    option[k] = {
                      data_filling_strategy: null,
                      data_fill_value: null,
                      char_filling_strategy: this.C2E[option[k]["char_filling_strategy"]],
                      char_fill_value: option[k]["char_fill_value"],
                    };
                  }
                }
                if (k === "scaling") {
                  console.log(option[k], "scalingdata in data process");
                  option[k] = {
                    q_max: option[k]["q_max"],
                    q_min: option[k]["q_min"],
                    scaling_strategy: this.C2E[option[k]["scaling_strategy"]],
                  };
                }
              });
              this.middleData.feature_engineering_strategy.column_processing.single_config[
              item.label[0] + "__" + item.label[1]
                ] = middle1;
            } else {
              this.middleData.feature_engineering_strategy.column_processing.single_config[
              item.label[0] + "__" + item.label[1]
                ] = item.options;
            }
          }
        });
      }
      console.log(this.middleData);
    },
    //将拼接的字符串保存到taskInfo以便发给后端，同时用于测试拼接字符串
    checkConfigurationString() {
      if (!this.checkTestAndVal()) {
        return;
      }
      this.taskInfo = {};
      this.dataProcess();
      this.taskInfo["name"] = this.taskName;
      this.taskInfo["task_desc"] = this.taskDescription;
      this.taskInfo["type"] = this.taskTypeValue;
      this.taskInfo["configuration"] = this.middleData;
      console.log(this.taskInfo, "this.taskInfo");
    },
    checkTestAndVal() {
      if (this.crossValidation === "否") {
        if (this.scale + this.validation > 90) {
          ElMessage({
            message: "验证集和测试集总和不得超过90%",
            type: "error",
            offset: 60,
          });
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    },
    //保存新建的任务并开始训练
    finishCreate() {
      if (!this.checkTestAndVal()) {
        return;
      }
      this.taskInfo = {};
      this.dataProcess();
      this.taskInfo["name"] = this.taskName;
      this.taskInfo["task_desc"] = this.taskDescription;
      this.taskInfo["type"] = this.taskTypeValue;
      this.taskInfo["configuration"] = this.middleData;
      console.log(this.taskInfo);
      console.log(this.token, "this.token");
      // 使用 Pinia 获取 token
      const mainStore = useMainStore();
      let headers = {
        headers: { token: mainStore.getToken },
      };
      taskAdd(this.taskInfo, headers)
        .then(res => {
          console.log(res);
          router.push("/taskView");
        })
        .catch(err => {
          ElMessage({
            message: "error",
            type: "error",
            offset: 60,
          });
        });
    },
    //设置部分记录处理的样式
    setStyle(param) {
      if (param.index === 0) {
        return { "margin-left": "110px", width: "150px" };
      } else {
        return { "margin-left": "10px", width: "150px" };
      }
    },
    //添加记录处理个数
    addColProcess() {
      this.partialRowList.push({
        index: this.partialRowList.length,
        col: "",
        operator: "之间",
        low_bound: "",
        high_bound: "",
        andOr: "AND",
      });
    },
    //删除记录处理个数
    deleteColProcess() {
      this.partialRowList.pop();
      this.disabledSelectedNumericCol();
    },
    //设置预置模型界面表格首列的样式
    setCellStyle({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return { "font-weight": "bold", borderColor: "#9a9a9a" };
      } else {
        return { borderColor: "#9a9a9a" };
      }
    },
    paramTypeSpanMethod({ row, column, rowIndex, columnIndex }) {
      //spanList可以理解为所占行数的列表
      const spanList = [];
      let spanIndex = 0;
      let priorItemType = "";
      this.model.forEach((item, index) => {
        //第一行
        if (index === 0) {
          spanList.push(1);
        } else {
          //当前行和上一行字段相同时
          if (item.paramType === priorItemType) {
            spanList[spanIndex] += 1;
            spanList.push(0);
          } else {
            spanList.push(1);
            spanIndex = index;
          }
        }
        priorItemType = item.paramType;
      });
      //只对第一列进行合并
      if (columnIndex === 0) {
        const _row = spanList[rowIndex];
        return {
          rowspan: _row,
          colspan: 1,
        };
      }
    },
  },
};
</script>

<style scoped>
:deep(.input-a input::-webkit-outer-spin-button),
:deep(.input-a input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
}

:deep(.input-a input[type="number"]) {
  -moz-appearance: textfield;
  appearance: textfield;
}

.input {
  width: 360px;
  margin-left: 20px;
  text-align: left;
}

.span-m {
  display: inline-block;
  width: 120px;
  text-align: left;
  /*vertical-align: middle;*/
}

.span-l {
  display: inline-block;
  width: 120px;
  text-align: left;
  /*vertical-align: middle;*/
}

.span-f {
  display: inline-block;
  width: 120px;
  text-align: right;
  /*vertical-align: middle;*/
}

.button-m {
  width: 80px;
}

.number-input {
  width: 200px;
  margin-left: 20px;
  text-align: left;
}

.span-d {
  display: inline-block;
  width: 140px;
  text-align: right;
  vertical-align: top;
}

.options {
  font-size: 18px;
  background-color: white;
  color: black;
  border-color: white;
  vertical-align: middle;
  margin-left: 10px;
}

.collapsefont {
  --el-collapse-header-font-size: 15px !important;
  --el-collapse-content-font-size: 15px !important;
}

.tooltip {
  float: right;
  margin-right: 110px;
  margin-top: 5px;
}
</style>