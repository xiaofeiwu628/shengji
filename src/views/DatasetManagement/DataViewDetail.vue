<template>
  <div>
    <div style="margin: 20px 0 0 2%">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/datascreen' }" >数据集管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/dataView' }" @click="toDataView">数据表概览</el-breadcrumb-item>
        <el-breadcrumb-item >数据详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-card style='margin: 20px'>
      <div style='margin: 20px'>
        <span style="font-weight: bolder;margin-left: 2%">总行数：{{this.total}}</span>
        <span style="font-weight: bolder;margin-left: 2%">总列数：{{this.dataTitle.length}}</span>
      </div>
      <el-table :data="tableData" border stripe style='width:80vw;margin: auto' size='small'>
        <el-table-column v-for="(item, index) in dataTitle"
                         :label="item"
                         :prop="item"
                         :key="index"
                         align="center"
                         :fixed="index === 0 ? 'left' : false"
        />
      </el-table>

      <!--分页-->
      <div style='display: flex;justify-content: center;margin-top: 20px'>
        <el-pagination
          v-model:currentPage="currentPage"
          v-model:page-size="pageSize"
          small
          :page-sizes="[5, 10, 20]"
          layout="total, prev, pager, next, jumper,sizes"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
<!--    <div style="margin: 20px;background-color: white">-->
<!--      <div style="margin: 40px 0 0 100px">-->
<!--        <span style="font-weight: bolder">总行数：{{this.total}}</span>-->
<!--        <span style="font-weight: bolder">总列数：{{this.dataTitle.length}}</span>-->
<!--      </div>-->
<!--      <div style="margin: 40px 0 0 100px;width: 80%">-->
<!--        <el-table :data="tableData" border stripe >-->
<!--          <el-table-column v-for="(item, index) in dataTitle"-->
<!--                           :label="item"-->
<!--                           :prop="item"-->
<!--                           :key="index"-->
<!--                           align="center"-->
<!--          />-->
<!--        </el-table>-->
<!--      </div>-->

<!--      &lt;!&ndash;分页&ndash;&gt;-->
<!--      <div class="demo-pagination-block" style="margin: 20px 0 0 100px">-->
<!--        <el-pagination-->
<!--            v-model:currentPage="currentPage"-->
<!--            v-model:page-size="pageSize"-->
<!--            :page-sizes="[5, 10, 20]"-->
<!--            :small="small"-->
<!--            :disabled="disabled"-->
<!--            :background="background"-->
<!--            layout="total, sizes, prev, pager, next, jumper"-->
<!--            :total="total"-->
<!--            @size-change="handleSizeChange"-->
<!--            @current-change="handleCurrentChange"-->
<!--        />-->
<!--      </div>-->
<!--    </div>-->
  </div>

</template>

<script>
import {useRouter} from "vue-router/dist/vue-router";
import {reactive} from "vue";
import request from "@/utils/request";
import { ArrowRight } from '@element-plus/icons-vue';
import router from "@/router";
export default {
  name: "DataViewDetail",
  setup(){
    const router = useRouter();
    const viewInfo = reactive({
      tableId:1,
      setId:1,
    })
    viewInfo.tableId = router.currentRoute.value.query.tableId;
    viewInfo.setId = router.currentRoute.value.query.setId;
    return{
      viewInfo,
    }
  },
  data(){
    return {
      currentPage: 1,
      pageSize: 10,
      total: 100,
      dataTitle: [],
      tableData: [],
      ArrowRight,
      dataViewPath:'',
    }
  },
  created() {
    this.load()
    this.dataViewPath = `/dataView?datasetId=${this.viewInfo.setId}&tableId=${this.viewInfo.tableId}`;
    console.log(this.dataViewPath)
  },
  methods:{
    load(){
      request.get("/dataViewDetail/tableDataDetail/"+this.viewInfo.tableId+'/'+this.currentPage+'/'+this.pageSize
      ).then(res =>{
        console.log(res)
        if(res.code === '0'){
          this.dataTitle = res.data.title;//字段数组
          this.tableData = res.data.data;//当前页面数据
          this.total = res.data.total;//所有数据总行数
          this.$message({
            type: "success",
            message: "更新成功",
            offset:60
          })
        } else {
          this.$message({
            type: "error",
            message: res.msg,
            offset:60
          })
        }
      })
    },
    handleSizeChange(){//更改页面大小
      this.load()
    },
    handleCurrentChange(){//更改当前页面
      this.load()
    },
    toDataView(){
      router.push({path:'/dataView',query:{datasetId:this.viewInfo.setId,tableId:this.viewInfo.tableId}});
    }
  }
}
</script>

<style scoped>

</style>