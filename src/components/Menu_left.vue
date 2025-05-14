<template>
  <div class="menu-left-container">
    <el-menu
      router
      :default-active="$route.path"
      class="side-menu"
    >
      <el-menu-item index="/datascreen" class="menu-item">
        <el-icon class="menu-icon"><Files /></el-icon>
        <span>数据集管理</span>
      </el-menu-item>
      <el-menu-item index="/taskView" class="menu-item">
        <el-icon class="menu-icon"><Cpu /></el-icon>
        <span>自动建模</span>
      </el-menu-item>
      <el-menu-item index="/modelList" class="menu-item">
        <el-icon class="menu-icon"><Box /></el-icon>
        <span>模型仓库</span>
      </el-menu-item>
      <el-menu-item index="/imageList" class="menu-item">
        <el-icon class="menu-icon">
          <svg viewBox="0 0 1104 1024" data-spm-anchor-id="a313x.search_index.0.i0.66153a81bfNqiw" width="200" height="200">
            <path d="M1068.781972 987.943662c-7.211268 0-14.422535 0-14.422535-7.211268l-310.084507-151.436619c-14.422535-7.211268-21.633803-21.633803-21.633803-28.845071V209.126761c0-14.422535 7.211268-28.84507 21.633803-28.845071l310.084507-173.070422c14.422535-7.211268 21.633803-7.211268 36.056338 0s14.422535 21.633803 14.422535 28.84507v915.830986c0 14.422535-7.211268 21.633803-14.422535 28.84507-7.211268 7.211268-14.422535 7.211268-21.633803 7.211268z m-274.028169-209.126761l237.971831 115.380282V93.746479l-237.971831 129.802817v555.267605zM37.570704 987.943662c-7.211268 0-14.422535 0-21.633803-7.211268-7.211268-7.211268-14.422535-21.633803-14.422535-28.84507V36.056338c0-14.422535 7.211268-21.633803 14.422535-28.84507 14.422535-7.211268 21.633803-7.211268 36.056338 0l310.084507 173.070422c14.422535 7.211268 21.633803 21.633803 21.633803 28.845071v591.323943c0 14.422535-7.211268 28.84507-21.633803 28.845071l-310.084507 151.436619c-7.211268 7.211268-7.211268 7.211268-14.422535 7.211268z m36.056338-894.197183v800.450704l237.971831-115.380282V230.760563l-237.971831-137.014084zM549.570704 1024c-21.633803 0-36.056338-14.422535-36.056338-36.056338V36.056338c0-21.633803 14.422535-36.056338 36.056338-36.056338s36.056338 14.422535 36.056338 36.056338v951.887324c0 21.633803-14.422535 36.056338-36.056338 36.056338z" fill="#535353"></path>
          </svg>
        </el-icon>
        <span>镜像仓库</span>
      </el-menu-item>
      <el-menu-item index="/onlineServiceList" class="menu-item">
        <el-icon class="menu-icon"><Monitor /></el-icon>
        <span>在线服务</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
  Monitor,
  Files,
  Cpu,
  Box
} from '@element-plus/icons-vue';
import router from "@/router";

export default {
  name: "Menu_left",
  components:{
    Document,
    IconMenu,
    Location,
    Setting,
    Monitor,
    Files,
    Cpu,
    Box
  }
}
</script>

<style scoped>
.menu-left-container {
  width: 200px;
  height: calc(100vh - 60px); /* 调整为Header的60px高度 */
  position: fixed;
  top: 60px; /* 从Header下方开始 */
  left: 0;
  z-index: 99;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  background-color: white;
}

.side-menu {
  width: 200px;
  height: 100%;
  border-right: none;
  background: linear-gradient(to bottom, #ffffff, #f9fafc);
}

.menu-item {
  height: 60px;
  line-height: 60px;
  padding: 0 20px !important;
  margin: 4px 0;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: rgba(35, 77, 122, 0.05);
  border-left-color: #234d7a;
}

/* 选中状态 */
.side-menu .el-menu-item.is-active {
  background-color: rgba(35, 77, 122, 0.08);
  color: #234d7a;
  border-left-color: #234d7a;
}

.menu-icon {
  font-size: 18px;
  margin-right: 4px;
  width: 24px;
  text-align: center;
}

/* 调整SVG图标大小 */
.menu-icon svg {
  width: 18px;
  height: 18px;
  margin: 0 3px;
}

/* 菜单下方渐变效果 */
.side-menu::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background: linear-gradient(to bottom, rgba(255,255,255,0), #f5f7fa);
  pointer-events: none;
}
</style>