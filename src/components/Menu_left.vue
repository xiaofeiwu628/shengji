<template>
  <div style="width: 200px;display: inline-block">
    <el-row class="tac">
      <el-col :span="24">
        <el-menu
            style="width: 200px; min-height: calc(100vh - 50px);"
            router
            :default-active="$route.path"
            class="el-menu-vertical-demo">
          <!--          @open="handleOpen"-->
          <!--          @close="handleClose"-->
          <el-menu-item index="/datascreen">
            <el-icon><Files /></el-icon>
            <span>数据集管理</span>
          </el-menu-item>
          <el-menu-item index="/taskView">
            <el-icon><Cpu /></el-icon>
            <span>自动建模</span>
          </el-menu-item>
          <el-menu-item index="/modelList">
            <el-icon><Box /></el-icon>
            <span>模型仓库</span>
          </el-menu-item>
          <el-menu-item index="/imageList">
            <el-icon><svg viewBox="0 0 1104 1024" data-spm-anchor-id="a313x.search_index.0.i0.66153a81bfNqiw" width="200" height="200"><path d="M1068.781972 987.943662c-7.211268 0-14.422535 0-14.422535-7.211268l-310.084507-151.436619c-14.422535-7.211268-21.633803-21.633803-21.633803-28.845071V209.126761c0-14.422535 7.211268-28.84507 21.633803-28.845071l310.084507-173.070422c14.422535-7.211268 21.633803-7.211268 36.056338 0s14.422535 21.633803 14.422535 28.84507v915.830986c0 14.422535-7.211268 21.633803-14.422535 28.84507-7.211268 7.211268-14.422535 7.211268-21.633803 7.211268z m-274.028169-209.126761l237.971831 115.380282V93.746479l-237.971831 129.802817v555.267605zM37.570704 987.943662c-7.211268 0-14.422535 0-21.633803-7.211268-7.211268-7.211268-14.422535-21.633803-14.422535-28.84507V36.056338c0-14.422535 7.211268-21.633803 14.422535-28.84507 14.422535-7.211268 21.633803-7.211268 36.056338 0l310.084507 173.070422c14.422535 7.211268 21.633803 21.633803 21.633803 28.845071v591.323943c0 14.422535-7.211268 28.84507-21.633803 28.845071l-310.084507 151.436619c-7.211268 7.211268-7.211268 7.211268-14.422535 7.211268z m36.056338-894.197183v800.450704l237.971831-115.380282V230.760563l-237.971831-137.014084zM549.570704 1024c-21.633803 0-36.056338-14.422535-36.056338-36.056338V36.056338c0-21.633803 14.422535-36.056338 36.056338-36.056338s36.056338 14.422535 36.056338 36.056338v951.887324c0 21.633803-14.422535 36.056338-36.056338 36.056338z" fill="#535353"></path></svg></el-icon>
            <span>镜像仓库</span>
          </el-menu-item>
          <el-menu-item index="/onlineServiceList">
            <el-icon><Monitor /></el-icon>
            <span>在线服务</span>
          </el-menu-item>
        </el-menu>
      </el-col>
    </el-row>
  </div>

</template>

<script>
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue';
import router from "@/router";
export default {
  name: "Menu_left",
  components:{
    Document,
    IconMenu,
    Location,
    Setting,
  }
}
</script>

<style scoped>

</style>
