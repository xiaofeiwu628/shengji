<template>
  <div class="dataset-management">
    <!-- 顶部导航区域 -->
    <div class="header-area">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item class="tech-title">
          <el-icon><DataAnalysis /></el-icon>
          数据集管理
        </el-breadcrumb-item>
      </el-breadcrumb>
      
      <!-- 数据集概览卡片 -->
      <div class="data-metrics">
        <div class="metric-card">
          <div class="metric-value">{{tableData.length}}</div>
          <div class="metric-label">数据集总数</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{getTotalTables()}}</div>
          <div class="metric-label">数据表总数</div>
        </div>
      </div>
    </div>

    <div class="content-panel">
      <!-- 数据总览界面 -->
      <div v-show="screenVisable === 1">
        <!-- 搜索区域 -->
        <div class="search-container">
          <div class="left-area">
            <el-button type="primary" class="create-btn" @click="createDataset">
              <el-icon><Plus /></el-icon>创建数据集
            </el-button>
          </div>
          
          <div class="right-area">
            <el-select 
              v-model="dataSwitch" 
              @change="load"
              placeholder="数据集类型"
              class="tech-select">
              <el-option label="显示用户数据集" :value="0"></el-option>
              <el-option label="显示公有数据集" :value="1"></el-option>
              <el-option label="显示全部数据集" :value="2"></el-option>
            </el-select>
            
            <el-input
              v-model="search"
              placeholder="请输入关键字搜索"
              clearable
              @keyup.enter="load"
              @clear="load"
              class="tech-input">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-button type="primary" class="search-btn" @click="load">
              <el-icon><Search /></el-icon>查询
            </el-button>
          </div>
        </div>

        <!--数据展示区域-->
        <div class="table-container">
          <el-table
            :data="tableData"
            class="data-table"
            border
            stripe
            :cell-style="{ 'text-align': 'center' }"
            :header-cell-style="{ 'text-align': 'center', background: '#1a2942', color: '#fff' }"
            style="width: 100%"
          >
            <el-table-column type="expand">
              <template v-slot="slot">
                <!-- 添加展开数据表的标题区域 -->
                <div class="expanded-table-header">
                  <div class="expanded-table-title">
                    <el-icon><Grid /></el-icon>
                    <span>{{ slot.row.set_name }} 的数据表列表 ({{ slot.row.children?.length || 0 }}个)</span>
                  </div>
                </div>
                <el-table 
                  :data="slot.row.children" 
                  class="expanded-table"
                  border 
                  stripe
                  :header-cell-style="{ background: '#f5f7fa', color: '#1a2942', fontWeight: 600 }"
                  >
                  <el-table-column prop="table_id" label="数据表ID" min-width="13%" />
                  <el-table-column prop="table_name" label="数据表名称" min-width="13%" />
                  <el-table-column prop="row_num" label="行数" min-width="13%" />
                  <el-table-column prop="col_num" label="列数" min-width="13%" />
                  <el-table-column prop="table_type" label="类型" min-width="13%">
                    <template #default="scope">
                    <el-tag 
                      :type="scope.row.table_type === '.csv' ? 'primary' : 'warning'"
                      effect="light"
                      size="small">
                      {{ scope.row.table_type }}
                    </el-tag>
                  </template>
                  </el-table-column>
                  <el-table-column prop="table_desc" label="描述" min-width="13%" />
                  <!-- 数据表扩展区操作按钮 -->
                  <el-table-column fixed="right" label="操作" min-width="22%">
                    <template #default="scope">
                      <div class="action-buttons">
                        <el-button
                          class="action-btn view-btn"
                          link
                          type="primary"
                          size="small"
                          @click="handleDetail(scope.row.set_id, scope.row.table_id, scope.row.table_type, scope.row.table_name)"
                        >
                          <el-icon><View /></el-icon>查看
                        </el-button>
                        <el-button 
                          class="action-btn edit-btn" 
                          link
                          type="primary" 
                          size="small" 
                          @click="tableUpdate(scope.row)"
                        >
                          <el-icon><Edit /></el-icon>修改
                        </el-button>
                        <el-popconfirm title="确认删除吗？" @confirm="tableDelete(scope.row)">
                          <template #reference>
                            <el-button 
                              class="action-btn delete-btn" 
                              type="text" 
                              size="small"
                            >
                              <el-icon><Delete /></el-icon>删除
                            </el-button>
                          </template>
                        </el-popconfirm>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column
              prop="set_id"
              label="数据集ID"
              sortable
              :resizable="false"
              min-width="90"
              show-overflow-tooltip
            />
            <el-table-column
              prop="username"
              label="拥有者"
              min-width="80"
              sortable
              :resizable="false"
              show-overflow-tooltip
            >
              <template #default="scope">
                <div style="display: flex; justify-content: space-between;width: 99%;">
                  <el-text style="margin-right: 1px">{{ scope.row.username }}</el-text>
                  <el-tag
                    style="float: left"
                    :type="scope.row.modify_permission === '其他' ? '' : 'success'"
                    disable-transitions
                    >{{ scope.row.modify_permission }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="is_public" label="是否公开" :formatter="publicFormat" />
            <el-table-column prop="set_name" label="数据集名称" show-overflow-tooltip />
            <el-table-column prop="set_desc" label="备注" show-overflow-tooltip />
            <el-table-column prop="table_num" label="数据表数量" min-width="70" />
            <!-- 数据集操作按钮 -->
            <el-table-column fixed="right"  label="操作" min-width="150">
              <template #default="scope">
                <div class="action-buttons">
                  <el-button 
                    class="action-btn add-btn" 
                    link 
                    size="small" 
                    @click="handleAdd(scope.row)"
                  >
                    <el-icon><Plus /></el-icon>新增数据表
                  </el-button>
                  <el-button 
                    class="action-btn edit-btn" 
                    link 
                    size="small" 
                    @click="datasetUpdate(scope.row)"
                  >
                    <el-icon><Edit /></el-icon>修改
                  </el-button>
                  <el-popconfirm title="确认删除吗？" @confirm="handleDelete(scope.row)">
                    <template #reference>
                      <el-button 
                        class="action-btn delete-btn" 
                        size="small"
                      >
                        <el-icon><Delete /></el-icon>删除
                      </el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!--  数据集预览界面-->
      <el-card v-show="screenVisable === 0">
        <div style="padding: 30px 0 0 20px">
          <div class="task-title-div"></div>
          <span class="task-title-name">数据预览</span>
          <span style="display: inline-block; margin-left: 30px">
            {{ "预览前10条数据，可对列名进行修改，取消勾选后，被取消的列不会添加至数据集中" }}
          </span>
        </div>
        <div style="margin: 10px 0 10px 6%">
          <span>字段数：{{ this.fileLineNum }}</span>
        </div>
        <div style="margin: auto; width: 90%">
          <!--    数据预览渲染-->
          <el-table
            size="small"
            :data="transData"
            border
            stripe
            @selection-change="getChoseData"
            :header-cell-style="{ background: '#F5F5F5' }"
          >
            <el-table-column type="selection" fixed="left" />
            <!--字段类型下拉框-->
            <el-table-column fixed="left" label="变量类型" width="120px" align="center">
              <template v-slot="scope">
                <el-select class="m-2" placeholder="文本型" v-model="transData[scope.$index][11]">
                  <el-option
                    v-for="item in dataTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <!--字段名（可编辑）-->
            <el-table-column fixed="left" label="字段名" width="120px" align="center">
              <template v-slot="scope">
                <el-input v-model="transData[scope.$index][0]"></el-input>
              </template>
            </el-table-column>
            <!--前10个样例数据展示-->
            <el-table-column
              v-for="(item, index) in transTitle"
              :label="item.label"
              :key="index"
              align="center"
              :width="120"
              :fixed="item.fixed"
            >
              <template v-slot="scope">
                {{ scope.row[index + 1] }}
              </template>
            </el-table-column>
          </el-table>
          <div style="text-align: right; margin: 20px 0 10px 0">
            <el-button @click="screenVisable = 1">上一步</el-button>
            <el-button type="primary" @click="dataPreviewSave">保存</el-button>
            <el-button @click="uploadcancel">取消</el-button>
          </div>
        </div>
      </el-card>
      <!--  标签数据预览界面-->
      <el-card v-show="screenVisable === 2">
        <div style="padding: 30px 0 0 20px">
          <div class="task-title-div"></div>
          <span class="task-title-name" style='white-space: nowrap'>数据预览：共计 {{itemCount}} 条数据项，{{tagList.length}} 种标签</span>
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
            max-height="700px"
          >
            <el-table-column label="ID" width="130px" type="index">
              <template #header>
                <span style="white-space: nowrap">ID (共计 {{ tagList.length }}条)</span>
              </template>
            </el-table-column>
            <el-table-column label="标签" prop="tag">
              <template #default="scope">
                <el-tag type="warning" size="small">
                  {{ scope.row.tag }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="标签出现次数" prop="count"></el-table-column>
          </el-table>
        </div>
        <div style="text-align: right; margin: 20px 20px 10px 0">
          <el-button @click="screenVisable = 1">上一步</el-button>
          <el-button type="primary" @click="saveJsonFile">保存</el-button>
          <el-button @click="uploadcancel">取消</el-button>
        </div>
      </el-card>
    </div>
    <!--新增数据集窗口-->
    <el-dialog
      v-model="addDatasetVisible"
      title="数据集"
      width="30%"
      @close="this.$refs.addDatasetFormRef.resetFields()"
    >
      <el-form :model="addDatasetForm" label-width="120px" :rules="addDatasetFormRules" ref="addDatasetFormRef">
        <el-form-item label="数据集名称" prop="set_name">
          <el-input v-model="addDatasetForm.set_name" style="width: 80%" />
        </el-form-item>
        <el-form-item label="备注" prop="set_des">
          <el-input v-model="addDatasetForm.set_desc" style="width: 80%" />
        </el-form-item>
        <el-form-item label="是否公开" prop="separator">
          <el-radio-group v-model="addDatasetForm.is_public">
            <el-radio :label="0">不公开</el-radio>
            <el-radio :label="1">公开</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button
            @click="
              this.addDatasetForm = {};
              this.addDatasetVisible = false;
            "
            >取消</el-button
          >
          <el-button type="primary" @click="add">完成</el-button>
        </span>
      </template>
    </el-dialog>
    <!--更新数据表窗口-->
    <el-dialog v-model="updateTableVisible" title="更新数据表" width="30%">
      <el-form :model="uploadForm" label-width="120px">
        <el-form-item label="数据表名称">
          <el-input v-model="uploadForm.table_name" style="width: 80%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="uploadForm.table_desc" style="width: 80%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button
            @click="
              this.uploadForm = {};
              this.updateTableVisible = false;
            "
            >取消</el-button
          >
          <el-button type="primary" @click="updateTable()">完成</el-button>
        </span>
      </template>
    </el-dialog>
    <!--新建数据表-->
    <el-dialog v-model="addTableVisible" title="新增数据表" width="30%" @open="this.$refs.uploadFormRef.resetFields();uploadMode = 1">
      <!--文件上传表单-->
      <el-form
        :model="uploadForm"
        label-width="130px"
        :rules="fileRules"
        ref="uploadFormRef"
        style="overflow: auto"
      >
        <el-form-item label="新增数据表名称" prop="table_name">
          <el-input v-model="uploadForm.table_name" style="width: 80%" />
        </el-form-item>
        <el-form-item label="新增数据表描述" prop="table_desc">
          <el-input v-model="uploadForm.table_desc" style="width: 80%" />
        </el-form-item>
        <el-form-item label="文件内容" prop="isTable">
          <el-radio-group v-model="uploadForm.isTable">
            <el-radio :label="true">表格型</el-radio>
            <el-radio :label="false">文本型</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if='uploadForm.isTable' label="新增数据表方式" prop="uploadMode">
          <!--新增数据表方式，1为文件导入，2为数据库导入-->
          <el-select placeholder="本地文件导入" v-model="uploadMode">
            <el-option label="本地文件导入" :value="1"></el-option>
            <el-option label="数据库导入" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if='uploadMode === 1 || uploadForm.isTable === false' label="上传文件">
          <el-button @click="uploadfileVisible = true">点击上传</el-button>
        </el-form-item>
        <el-form-item v-if='uploadMode === 1 || uploadForm.isTable === false' label="编码方法" prop='encoding'>
          <el-select v-model="uploadForm.encoding" placeholder="选择编码方式">
            <el-option label="UTF-8" value="UTF-8"></el-option>
            <el-option label="GB2312" value="GB2312"></el-option>
            <el-option label="ASCII" value="ASCII"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="uploadForm.isTable && uploadMode === 1" label="列分隔符" prop="separator">
          <el-select v-model="uploadForm.separator" placeholder="选择分隔符">
            <el-option label="半角逗号" value="__comma"></el-option>
            <el-option label="制表符" value="__tab"></el-option>
            <el-option label="空格" value="__space"></el-option>
            <el-option label="自定义" :value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="自定义列分隔符"
          v-if="uploadForm.separator === 4 && uploadMode === 1"
          prop="ColumnsSeparator"
        >
          <el-input v-model="uploadForm.ColumnsSeparator" style="width: 80%" />
        </el-form-item>
        <el-form-item label="是否有表头" prop="header" v-if="uploadForm.isTable && uploadMode === 1">
          <el-radio-group v-model="uploadForm.header">
            <el-radio :label="true">有</el-radio>
            <el-radio :label="false">无</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if='uploadForm.isTable && uploadMode === 2' label="数据库类型" style="width: 80%" prop="SqlType">
          <el-select v-model="uploadForm.SqlType" placeholder="请选择">
            <el-option label="MySQL" value="mysql" />
            <el-option label="PostgreSQL" value="postgresql" />
            <el-option label="SQLServer" value="sqlserver" />
          </el-select>
        </el-form-item>
        <el-form-item v-if='uploadForm.isTable && uploadMode === 2' label="数据库地址" prop="SqlAddress">
          <el-input v-model="uploadForm.SqlAddress" style="width: 80%" />
        </el-form-item>
        <el-form-item v-if='uploadForm.isTable && uploadMode === 2' label="数据库名称" prop="SqlName">
          <el-input v-model="uploadForm.SqlName" style="width: 80%" />
        </el-form-item>
        <el-form-item v-if='uploadForm.isTable && uploadMode === 2' label="数据表名称" prop="SqlTableName">
          <el-input v-model="uploadForm.SqlTableName" style="width: 80%" />
        </el-form-item>
        <el-form-item v-if='uploadForm.isTable && uploadMode === 2' label="用户名" prop="SqlUserName">
          <el-input v-model="uploadForm.SqlUserName" style="width: 80%" />
        </el-form-item>
        <el-form-item v-if='uploadForm.isTable && uploadMode === 2' label="密码" prop="SqlPassword">
          <el-input v-model="uploadForm.SqlPassword" style="width: 80%" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadcancel">取消</el-button>
          <el-button type="primary" @click="uploadForm.isTable ? toPreview() : getTagList()">下一步</el-button>
        </span>
      </template>
      <!--上传文件窗口-->
      <el-dialog v-model="uploadfileVisible" title="提示" width="40%">
        <span>
          <el-upload
            class="upload-demo"
            ref="upload"
            drag
            action=""
            :limit="1"
            :auto-upload="false"
            :on-change="importCsv"
            importExcel
            accept="text/csv,text/tsv,text/xml,text/txt,application/json"
            :with-credentials="true"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
        </span>
        <span class="btn-determine">
          <el-button type="primary" @click="handelCancel">取消</el-button>
          <el-button type="primary" @click="uploadfileVisible = false">确定</el-button>
        </span>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/utils/request";
import { useRouter } from "vue-router/dist/vue-router";
import { ElLoading } from "element-plus";
import { Plus, Search, DataAnalysis, ArrowRight, Edit, Delete, View, Grid } from '@element-plus/icons-vue';

export default {
  name: "DataScreen",
  components: {
    Plus,
    Search,
    DataAnalysis,
    ArrowRight,
    Edit,
    Delete,
    View,
    Grid
  },
  data() {
    return {
      tagList: [],
      itemCount: 0, //上传的json数据条数
      tempTableName: "",
      loading1: [],
      loading2: [],
      tableData: [],
      search: "",
      currentPage: 1,
      total: 10,
      pageSize: 10,
      updateTableVisible: false, //更新数据表窗口
      addTableVisible: false, //上传设置窗口
      dataBaseVisible: false, //从数据库导入窗口
      uploadfileVisible: false, //上传文件窗口
      addDatasetVisible: false, //新增数据集窗口
      addDatasetForm: {
        //数据库新增表单
        user_id: 1,
        set_name: undefined,
        set_desc: "",
      },
      // 上传数据表单
      uploadForm: {
      },
      fileColumnNum: 0, //字段数
      fileLineNum: 0, //文件数据总长度
      fileObj: {}, //文件对象
      screenVisable: 1, //数据总览和数据上传预览切换，0是数据总览，1是数据预览
      transTitle: [
        { label: "样例1", fixed: false },
        { label: "样例2", fixed: false },
        { label: "样例3", fixed: false },
        { label: "样例4", fixed: false },
        { label: "样例5", fixed: false },
        { label: "样例6", fixed: false },
        { label: "样例7", fixed: false },
        { label: "样例8", fixed: false },
        { label: "样例9", fixed: false },
        { label: "样例10", fixed: false },
      ], //数据上传预览表格表头
      transData: [], //数据上传预览转置数据，二维数组，第一行是字段名称，最后一行是字段类型，中间10行是预览数据
      dataTypeOptions: [
        { value: "Continuous", label: "连续型" },
        { value: "Categorical", label: "分类型" },
        { value: "Time", label: "时间型" },
        { value: "String", label: "文本型" },
        { value: "Unique", label: "唯一键" },
      ], //变量类型
      dataBaseForm: {}, //数据库导入信息
      PreData: {
        //数据预览分页
        currentPage: 1,
        total: 10,
        pageSize: 10,
      },
      choseData: {}, //数据预览界面选择的数据
      dataTableRules: {
        table_name: [{ required: true, message: "请输入数据表名称", trigger: "blur" }],
        table_desc: [{ required: true, message: "请输入数据表描述", trigger: "blur" }],
      },
      addDatasetFormRules: {
        //新增数据集表单验证
        set_name: [
          { required: true, message: "请输入数据集名称", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              const specialChars = /^[\u4e00-\u9fa5_a-zA-Z0-9-]*$/;

              if (!specialChars.test(value)) {
                callback(new Error("数据集名称不能包含特殊字符"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },
      fileRules: {
        //文件上传表单验证
        table_name: [
          { required: true, message: "请输入数据表名称", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              const specialChars = /^[\u4e00-\u9fa5_a-zA-Z0-9-]*$/;

              if (!specialChars.test(value)) {
                callback(new Error("数据表名称不能包含特殊字符"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
        table_desc: [{ required: true, message: "请输入数据表描述", trigger: "blur" }],
        encoding: [{ required: true, message: "请输入编码格式", trigger: "blur" }],
        isTable: [{ required: true, message: "请选择是否导入数据表", trigger: "blur" }],
        separator: [{ required: true, message: "请输入列分隔符", trigger: "blur" }],
        header: [{ required: true, message: "请输入标题行数", trigger: "blur" }],
        //数据库上传表单验证
        SqlType: [{ required: true, message: "请选择数据库类型", trigger: "blur" }],
        SqlAddress: [{ required: true, message: "请输入数据库地址", trigger: "blur" }],
        SqlName: [{ required: true, message: "请输入数据库名称", trigger: "blur" }],
        SqlTableName: [{ required: true, message: "请输入导入数据表名称", trigger: "blur" }],
        SqlUserName: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        SqlPassword: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
      uploadMode: 1, //上传方式
      dataSwitch: 0, //数据集所属，0为私有，1为公有，2为全部
    };
  },
  created() {
    this.load();
  },
  setup() {
    const router = useRouter();
    let handleDetail = (datasetId, tableId, tableType) => {
      //数据表详情
      if (tableType === ".json") {
        router.push({
          path: "/entityView",
          query: { datasetId, tableId },
        });
      } else if(tableType === ".csv") {
        router.push({
          path: "/dataView",
          query: { datasetId, tableId },
        });
      }
    };
    return {
      handleDetail,
    };
  },
  methods: {

    //
    getTotalTables() {//获取数据表总数
      let count = 0;
      this.tableData.forEach(dataset => {
        count += dataset.table_num || 0;
      });
      return count;
    },
    //加载动画控制
    openFullScreen1() {
      this.loading1 = ElLoading.service({
        lock: true,
        text: "正在加载中，请稍等……",
        background: "rgba(255,255,255,0.7)",
      });
    },
    openFullScreen2() {
      this.loading2 = ElLoading.service({
        lock: true,
        text: "正在保存，请稍等……",
        background: "rgba(255,255,255,0.7)",
      });
    },
    //数据渲染
    load() {
      //传给后端，请求绘图数据
      if (this.dataSwitch == 0) {
        //私有数据集
        request
          .get("/data/search", {
            params: {
              Search: this.search,
            },
          })
          .then((res) => {
            if (res.code === "0") {
              this.tableData = res.data;
              for (var i = 0; i < this.tableData.length; i++) {
                if (this.tableData[i].modify_permission === 0) {
                  this.tableData[i].modify_permission = "其他";
                } else if (this.tableData[i].modify_permission === 1) {
                  this.tableData[i].modify_permission = "本人";
                }
              }
              this.total = res.data.length;
            } else {
              this.$message({
                type: "error",
                message: res.msg,
                offset: 60,
              });
            }
          });
      } else if (this.dataSwitch === 1) {
        //公有数据集
        request
          .get("/data/SearchPublicData", {
            params: {
              Search: this.search,
            },
          })
          .then((res) => {
            if (res.code === "0") {
              this.tableData = res.data;
              for (var i = 0; i < this.tableData.length; i++) {
                if (this.tableData[i].modify_permission === 0) {
                  this.tableData[i].modify_permission = "其他";
                } else if (this.tableData[i].modify_permission === 1) {
                  this.tableData[i].modify_permission = "本人";
                }
              }
              this.total = res.data.length;
            } else {
              this.$message({
                type: "error",
                message: res.msg,
                offset: 60,
              });
            }
          });
      } else if (this.dataSwitch === 2) {
        //全部数据集
        request
          .get("/data/SearchAllData", {
            params: {
              Search: this.search,
            },
          })
          .then((res) => {
            if (res.code === "0") {
              this.tableData = res.data;
              for (var i = 0; i < this.tableData.length; i++) {
                if (this.tableData[i].modify_permission === 0) {
                  this.tableData[i].modify_permission = "其他";
                } else if (this.tableData[i].modify_permission === 1) {
                  this.tableData[i].modify_permission = "本人";
                }
              }
              this.total = res.data.length;
            } else {
              this.$message({
                type: "error",
                message: res.msg,
                offset: 60,
              });
            }
          });
      }
    },
    add() {
      if (!this.addDatasetForm.set_desc) {
        this.addDatasetForm.set_desc = "";
      }
      this.$refs.addDatasetFormRef.validate((valid) => {
        if (valid) {
          if (this.addDatasetForm.set_id != null) {
            //数据集已存在，执行更新操作
            request
              .put("/data/dataset", this.addDatasetForm, {
                headers: {
                  dateType: "json",
                  "Content-Type": "application/json",
                },
              })
              .then((res) => {
                if (res.code === "0") {
                  this.load();
                  this.addDatasetForm = {};
                  this.addDatasetVisible = false;
                } else {
                  this.$message({
                    type: "error",
                    message: res.msg,
                    offset: 60,
                  });
                }
              });
          } else {
            //数据集不存在，执行新建操作
            request
              .post("/data/dataset", this.addDatasetForm, {
                headers: {
                  dateType: "json",
                  "Content-Type": "application/json",
                },
              })
              .then((res) => {
                if (res.code === "0") {
                  this.load();
                  this.addDatasetForm = {};
                  this.addDatasetVisible = false;
                } else {
                  this.$message({
                    type: "error",
                    message: res.msg,
                    offset: 60,
                  });
                }
              });
          }
        }
      });
    },
    handleAdd(row) {
      //新增数据表
      if (row.modify_permission == "其他") {
        this.$message({
          type: "error",
          message: "抱歉，您没有该数据集的操作权限！",
          offset: 60,
        });
      } else {
        this.addTableVisible = true;
        this.uploadForm = {};
        this.uploadForm.uploadMode = 1;
        this.uploadForm.separator = "";
        this.uploadForm.encoding = "";
        this.uploadForm.isTable = true;
        this.uploadForm.header = true;
        this.uploadForm.SetId = row.set_id;
        this.uploadForm.SetId = row.set_id;
        this.$refs.upload?.clearFiles();
      }
    },
    handleSizeChange() {
      // 改变当前每页个数触发
      this.load();
    },
    handleCurrentChange() {
      //改变当前页码触发
      this.load();
    },
    handleDelete(row) {
      //删除数据集
      if (row.modify_permission == "其他") {
        this.$message({
          type: "error",
          message: "抱歉，您没有该数据集的操作权限！",
          offset: 60,
        });
      } else {
        request.delete("/data/dataset/" + row.set_id).then((res) => {
          if (res.code === "0") {
            this.$message({
              type: "success",
              message: "删除成功",
              offset: 60,
            });
          } else {
            this.$message({
              type: "error",
              message: res.msg,
              offset: 60,
            });
          }
          this.load(); // 删除之后重新加载表格的数据
        });
      }
    },
    tableDelete(row) {
      //删除数据表
      if (row.modify_permission == 0) {
        this.$message({
          type: "error",
          message: "抱歉，您没有该数据集的操作权限！",
          offset: 60,
        });
      } else {
        request.delete("/data/datatable/" + row.table_id).then((res) => {
          if (res.code === "0") {
            this.$message({
              type: "success",
              message: "删除成功",
              offset: 60,
            });
          } else {
            this.$message({
              type: "error",
              message: res.msg,
              offset: 60,
            });
          }
          this.load(); // 删除之后重新加载表格的数据
        });
      }
    },
    importCsv(param) {
      //上传csv文件
      this.fileObj = param.raw; // 相当于input里取得的files
    },
    handelCancel() {
      //取消文件上传
      this.fileObj = {};
      this.uploadfileVisible = false;
    },
    uploadcancel() {
      //取消上传设置
      this.uploadForm = {};
      this.addTableVisible = false;
      this.screenVisable = 1;
    },
    //获取统计后的标签数据
    getTagList() {
      //本地文件上传
      if (this.fileObj instanceof File) {
        this.$refs.uploadFormRef.validate((valid) => {
          //触发文件上传表单验证
          if (valid) {
            this.openFullScreen1();
            request
              .post(
                "/File/getTagList",
                {
                  //传给后端，请求数据
                  file: this.fileObj,
                  setId: this.uploadForm.SetId,
                  tableName: this.uploadForm.table_name,
                  tableDesc: this.uploadForm.table_desc,
                  encodingMethod: this.uploadForm.encoding,
                },
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                },
              )
              .then((res) => {
                if (res.code === "0") {
                  //命名实体识别文件
                  this.tempTableName = res.data.tempTableName;
                  this.itemCount = res.data.itemCount;
                  this.tagList = res.data.tagList;
                  this.screenVisable = 2;
                  this.loading1.close();
                  this.addTableVisible = false;
                } else {
                  this.loading1.close();
                  this.$message({
                    type: "error",
                    message: res.msg,
                    offset: 60,
                  });
                }
              });
          }
        });
      } else {
        this.$message({
          type: "error",
          message: "请上传文件",
          offset: 60,
        });
      }
    },
    toPreview() {
      //进入数据预览界面
      this.transData = [];
      if (this.uploadMode === 1) {
        //本地文件上传
        if (this.fileObj instanceof File) {
          this.$refs.uploadFormRef.validate((valid) => {
            //触发文件上传表单验证
            if (valid) {
              this.openFullScreen1();
              if (this.uploadForm.separator !== 4) {
                this.uploadForm.ColumnsSeparator = this.uploadForm.separator;
              }
              request
                .post(
                  "/File/GetFileData",
                  {
                    //传给后端，请求数据
                    File: this.fileObj,
                    ColumnsSeparator: this.uploadForm.ColumnsSeparator,
                    HasHeader: this.uploadForm.header,
                    SetId: this.uploadForm.SetId,
                    TableName: this.uploadForm.table_name,
                    EncodingMethod: this.uploadForm.encoding,
                  },
                  {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  },
                )
                .then((res) => {
                  if (res.code === "0") {
                    this.addTableVisible = false;
                    this.fileColumnNum = res.data.columnsName.length;
                    this.fileLineNum = res.data.columnsNum;
                    this.transData = [];
                    let temp = [];
                    temp.push(res.data.columnsName); //第一行是字段名称
                    for (var i = 0; i < res.data.columnsData.length; i++) {
                      //中间10行为数据表前10行具体数据
                      temp.push(res.data.columnsData[i]);
                    }
                    for (var i = 0; i < temp[0].length; i++) {
                      let row = [];
                      for (let j = 0; j < temp.length; j++) {
                        row.push(temp[j][i]);
                      }
                      this.transData.push(row);
                    }
                    // 默认变量类型是文本型
                    for (var i = 0; i < this.fileColumnNum; i++) {
                      this.transData[i][11] = "String";
                    }
                    // 添加index
                    for (var i = 0; i < this.fileColumnNum; i++) {
                      this.transData[i][12] = i;
                    }
                    this.screenVisable = 0;
                    this.loading1.close();
                  } else {
                    this.loading1.close();
                    this.$message({
                      type: "error",
                      message: res.msg,
                      offset: 60,
                    });
                  }
                });
            }
          });
        } else {
          this.$message({
            type: "error",
            message: "请上传文件",
            offset: 60,
          });
        }
      } else if (this.uploadMode === 2) {
        //数据库导入
        this.$refs.uploadFormRef.validate((valid) => {
          //触发数据库上传表单验证
          if (valid) {
            this.openFullScreen1();
            request
              .get("/SqlUpload/GetUserSqlTable", {
                //传给后端，请求数据
                params: {
                  SqlType: this.uploadForm.SqlType,
                  SqlAddress: this.uploadForm.SqlAddress,
                  SqlName: this.uploadForm.SqlName,
                  SqlUserName: this.uploadForm.SqlUserName,
                  SqlPassword: this.uploadForm.SqlPassword,
                  SqlTableName: this.uploadForm.SqlTableName,
                  TableName: this.uploadForm.table_name,
                  SetId: this.uploadForm.SetId,
                },
              })
              .then((res) => {
                if (res.code === "0") {
                  this.addTableVisible = false;
                  this.fileColumnNum = res.data.columnsName.length;
                  this.fileLineNum = res.data.columnsNum;
                  this.transData = [];
                  let temp = [];
                  temp.push(res.data.columnsName); //第一行是字段名称
                  for (var i = 0; i < res.data.columnsData.length; i++) {
                    //中间10行为数据表前10行具体数据
                    temp.push(res.data.columnsData[i]);
                  }
                  for (var i = 0; i < temp[0].length; i++) {
                    let row = [];
                    for (let j = 0; j < temp.length; j++) {
                      row.push(temp[j][i]);
                    }
                    this.transData.push(row);
                  }
                  // 默认变量类型是文本型
                  for (var i = 0; i < this.fileColumnNum; i++) {
                    this.transData[i][11] = "String";
                  }
                  // 添加index
                  for (var i = 0; i < this.fileColumnNum; i++) {
                    this.transData[i][12] = i;
                  }
                  this.screenVisable = 0;
                  this.$message({
                    type: "success",
                    message: "更新成功",
                    offset: 60,
                  });
                  this.loading1.close();
                } else {
                  this.loading1.close();
                  this.$message({
                    type: "error",
                    message: res.msg,
                    offset: 60,
                  });
                }
              });
          } else {
            this.$message({
              type: "error",
              message: "新建数据表失败！",
              offset: 60,
            });
          }
        });
      }
    },
    getChoseData(val) {
      this.choseData = val;
    },
    // 保存用于命名实体识别的json文件
    saveJsonFile() {
      this.openFullScreen2();
      request
        .post("/File/saveJson", {
          tempTableName: this.tempTableName,
          file:this.fileObj
        }, {
          headers: {
            "Content-Type": "multipart/form-data",
          }
        })
        .then((res) => {
          if (res.code === "0") {
            this.screenVisable = 1;
            this.$message({
              type: "success",
              message: res.msg,
              offset: 60,
            });
            this.load();
            this.loading2.close();
            this.$refs.uploadFormRef.resetFields();
            this.tempTableName = "";
          } else {
            this.$message({
              type: "error",
              message: res.msg,
              offset: 60,
            });
          }
        });
    },
    dataPreviewSave() {//保存预览数据
      let datatype = "";//字段类型
      let temp = [];//是否导入
      for (let i = 0; i < this.fileColumnNum; i++) {
        datatype = datatype.concat(this.transData[i][11], ",");
        temp[i] = 0;
      }
      let tableHead = ""; //字段名
      let columnsSave = ""; //是否导入
      for (let i = 0; i < this.choseData.length; i++) {
        temp[this.choseData[i][12]] = 1;
      }
      for (let i = 0; i < temp.length; i++) {
        columnsSave = columnsSave.concat(temp[i], ",");
      }
      for (let i = 0; i < this.transData.length; i++) {
        tableHead = tableHead.concat(this.transData[i][0], ",");
      }
      //去掉最后一个逗号
      datatype = datatype.substr(0, datatype.length - 1);
      tableHead = tableHead.substr(0, tableHead.length - 1);
      columnsSave = columnsSave.substr(0, columnsSave.length - 1);
      if (temp.includes(1)) {
        this.openFullScreen2();
        if (this.uploadMode === 1) {
          //文件上传
          request
            .post(
              "/File/Upload",
              {
                //传给后端
                SetId: this.uploadForm.SetId,
                File: this.fileObj,
                TableName: this.uploadForm.table_name,
                TableDesc: this.uploadForm.table_desc,
                DataType: datatype,
                HasHeader: this.uploadForm.header,
                TableHead: tableHead,
                ColumnsSave: columnsSave,
                ColumnsSeparator: this.uploadForm.ColumnsSeparator,
                EncodingMethod: this.uploadForm.encoding,
              },
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              },
            )
            .then((res) => {
              if (res.code === "0") {
                this.screenVisable = 1;
                this.$message({
                  type: "success",
                  message: res.msg,
                  offset: 60,
                });
                this.load();
                this.loading2.close();
                this.$refs.uploadFormRef.resetFields();
              } else {
                this.loading2.close();
                this.$message({
                  type: "error",
                  message: res.msg,
                  offset: 60,
                });
              }
            });
        } else if (this.uploadMode === 2) {
          //数据库导入
          request
            .post(
              "/SqlUpload/SaveUserSqlTable",
              {
                //传给后端
                SqlType: this.uploadForm.SqlType,
                SqlAddress: this.uploadForm.SqlAddress,
                SqlName: this.uploadForm.SqlName, //数据库名称
                SqlUserName: this.uploadForm.SqlUserName,
                SqlPassword: this.uploadForm.SqlPassword,
                SqlTableName: this.uploadForm.SqlTableName, //数据库中的数据表名称
                SetId: this.uploadForm.SetId,
                TableName: this.uploadForm.table_name, //用户写的新建数据表名称
                TableDesc: this.uploadForm.table_desc,
                DataType: datatype,
                TableHead: tableHead, //表头
                ColumnsSave: columnsSave,
              },
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              },
            )
            .then((res) => {
              if (res.code === "0") {
                this.screenVisable = 1;
                this.$message({
                  type: "success",
                  message: "更新成功",
                  offset: 60,
                });
                this.load();
                this.loading2.close();
              } else {
                this.loading2.close();
                this.$message({
                  type: "error",
                  message: res.msg,
                  offset: 60,
                });
              }
            });
        }
      } else {
        this.$message({
          type: "error",
          message: "字段不可为空",
          offset: 60,
        });
      }
    },
    tableUpdate(row) {//更新数据表窗口
      //进入数据表更新窗口
      if (row.modify_permission === 0) {
        this.$message({
          type: "error",
          message: "抱歉，您没有该数据集的操作权限！",
          offset: 60,
        });
      } else {
        this.uploadForm = {};
        this.uploadForm = row;
        this.updateTableVisible = true;
      }
    },
    updateTable() {
      request
        .put("/data/datatable", this.uploadForm, {
          headers: { dateType: "json", "Content-Type": "application/json" },
        })
        .then((res) => {
          if (res.code === "0") {
            this.load();
            this.uploadForm = {};
            this.updateTableVisible = false;
          } else {
            this.$message({
              type: "error",
              message: res.msg,
              offset: 60,
            });
          }
        });
    },
    createDataset() {
      //创建数据集窗口
      this.addDatasetForm = {
        set_name: undefined,
        set_desc: undefined,
      };
      this.addDatasetForm.user_id = 1;
      this.addDatasetForm.is_public = 0;
      this.addDatasetVisible = true;
    },
    datasetUpdate(row) {//更新数据集窗口
      //更新数据集窗口
      if (row.modify_permission == "他人") {
        this.$message({
          type: "error",
          message: "抱歉，您没有该数据集的操作权限！",
          offset: 60,
        });
      } else {
        this.addDatasetForm = {};
        this.addDatasetForm = row;
        this.addDatasetForm.user_id = 1;
        this.addDatasetVisible = true;
      }
    },
    // is_public字段映射
    publicFormat(row) {
      if (row.is_public === 1) {
        return "是";
      } else if (row.is_public === 0) {
        return "否";
      }
    },
  },
};
</script>

<style scoped>
.dataset-management {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(to right, #4c75a3, #4c75a3); /* 更浅的蓝色渐变 */
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
  color: #ffffff !important; /* 添加!important确保优先级 */
}

/* 为了解决可能存在的嵌套元素问题 */
:deep(.tech-title span),
:deep(.tech-title div),
:deep(.tech-title a) {
  color: #ffffff !important;
}

/* 保持图标为白色 */
.tech-title .el-icon {
  font-size: 28px;
  color: #ffffff;
}

.data-metrics {
  display: flex;
  gap: 20px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.18); /* 略微增加透明度 */
  border-radius: 8px;
  padding: 10px 20px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); /* 添加阴影增加层次感 */
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

.search-container {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #f6f8fa, #e9ecef);
  border-radius: 8px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.right-area {
  display: flex;
  gap: 15px;
  align-items: center;
}

.tech-input {
  width: 360px;
  border-radius: 6px;
  transition: all 0.3s;
}

.tech-input:focus-within {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  transform: translateY(-1px);
}

.tech-select {
  border-radius: 6px;
  min-width: 150px;
}

.create-btn, .search-btn {
  background: linear-gradient(to right, #1a2942, #2a476e);
  border: none;
  border-radius: 6px;
  transition: all 0.3s;
}

.create-btn:hover, .search-btn:hover {
  background: linear-gradient(to right, #2a476e, #1a2942);
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(26, 41, 66, 0.2);
}

.table-container {
  margin: 0;
  border-radius: 8px;
  overflow: hidden;
}

.tech-table {
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

:deep(.el-table__row) {
  transition: all 0.2s;
}

:deep(.el-table__row:hover) {
  background-color: #f0f8ff !important;
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.03);
}

:deep(.el-button.is-link) {
  color: #1a2942;
}

:deep(.el-button.is-text) {
  color: #ff4757;
}

/* 优化扩展行的样式 */
:deep(.el-table__expand-icon) {
  color: #1a2942;
}

:deep(.el-table__expanded-cell) {
  background: linear-gradient(to right, #f7f9fc, #f1f3f8);
  padding: 20px !important;
}

/* 优化标签样式 */
:deep(.el-tag) {
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s;
}

:deep(.el-tag--success) {
  background-color: rgba(82, 196, 26, 0.1);
  border-color: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}
/* 操作按钮容器样式 */
.action-buttons {
  display: flex;
  gap: 8px; /* 将间距从之前的值减小到8px */
  justify-content: center;
}

/* 通用按钮样式 */
.action-btn {
  padding: 4px 8px; /* 稍微减小按钮的内边距 */
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 60px; /* 稍微减小按钮的最小宽度 */
}

/* 查看按钮样式 */
.view-btn {
  color: #1a2942 !important;
}

.view-btn:hover {
  color: #4c75a3 !important;
  background-color: rgba(76, 117, 163, 0.05);
}

/* 新增按钮样式 */
.add-btn {
  color: #303133 !important;
  border: 1px solid #dcdfe6;
  background-color: #ffffff;
}

.add-btn:hover {
  color: #000000 !important;
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

/* 修改按钮样式 */
.edit-btn {
  color: #409EFF !important;
  border: 1px solid #c6e2ff;
  background-color: rgba(64, 158, 255, 0.05);
}

.edit-btn:hover {
  color: #066de7 !important;
  background-color: rgba(64, 158, 255, 0.1);
  border-color: #a0cfff;
}

/* 删除按钮样式 */
.delete-btn {
  color: #F56C6C !important;
  border: 1px solid #fbc4c4;
  background-color: rgba(245, 108, 108, 0.05);
}

.delete-btn:hover {
  color: #e22c2c !important;
  background-color: rgba(245, 108, 108, 0.1);
  border-color: #f89898;
}
/* 展开区域样式优化 */
:deep(.el-table__expand-icon) {
  /* 增大展开图标 */
  transform: scale(1.2);
  margin-right: 10px;
  transition: all 0.3s ease;
}

:deep(.el-table__expand-icon .el-icon) {
  color: #4c75a3; /* 使用与头部一致的蓝色 */
  font-weight: bold;
  font-size: 16px;
}

/* 展开图标动画效果 */
:deep(.el-table__expand-icon--expanded) {
  transform: rotate(90deg) scale(1.2);
}

/* 鼠标悬浮在行上时的展开图标效果 */
:deep(.el-table__row:hover .el-table__expand-icon .el-icon) {
  color: #1a2942;
  transform: scale(1.1);
}

/* 展开内容区域样式 */
:deep(.el-table__expanded-cell) {
  background: linear-gradient(to right, #f0f5fa, #e6edf5) !important;
  padding: 25px 20px !important;
  border-radius: 0 0 8px 8px;
  border-bottom: 1px solid #d0d8e6 !important;
  box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.05);
  position: relative;
}

/* 添加展开区域内表格标题 */
.expanded-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 10px;
}

.expanded-table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2942;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 可展开行的视觉提示 */
:deep(.el-table__row-is-expand-row-expandable) {
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.el-table__row-is-expand-row-expandable:hover) {
  background-color: rgba(76, 117, 163, 0.05) !important;
}

/* 展开后的子表格样式 */
.expanded-table {
  margin-left: 0 !important; /* 移除原来的左边距 */
  width: 100% !important; /* 使用全宽 */
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;
}


/* 修改数据集行样式，使其更加醒目 */
:deep(.data-table .el-table__row) {
  background-color: #f8fafd !important;
  border-left: 4px solid #4c75a3;
  height: 60px !important;
}

:deep(.data-table .el-table__row:hover) {
  background-color: #edf2f9 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 117, 163, 0.12);
}

/* 使数据集名称更加醒目 */
:deep(.data-table .el-table__row .cell) {
  font-weight: 500;
  font-size: 14px;
}

/* 数据集名称特别突出 */
:deep(.data-table .el-table__row td:nth-child(5) .cell) {
  font-weight: 600;
  font-size: 15px;
  color: #1a2942;
}

/* 添加数据集标识图标 */
:deep(.data-table .el-table__row .el-table__expand-icon) {
  position: relative;
}

:deep(.data-table .el-table__row .el-table__expand-icon::after) {
  content: '';
  position: absolute;
  right: -25px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #4c75a3;
  box-shadow: 0 0 0 2px rgba(76, 117, 163, 0.2);
}

/* 行间距和分隔 */
:deep(.data-table .el-table__row) {
  margin-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

/* 展开时的样式区分 */
:deep(.el-table__expanded-row) {
  background: transparent !important;
}

:deep(.el-table__expanded-row .expanded-table-header) {
  margin-top: 5px;
}

/* 增加展开表格与数据集之间的视觉区分 */
.expanded-table {
  margin-top: 10px !important;
  margin-bottom: 10px !important;
}

/* 确保展开区域不会太突兀 */
:deep(.el-table__expanded-cell) {
  padding: 20px 30px 30px !important;
}


</style>
