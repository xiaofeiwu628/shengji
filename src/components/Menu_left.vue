<template>
  <div class="menu-left-container">
    <el-menu
      router
      :default-active="route.path"
      class="side-menu"
    >
      <div class="menu-header">
        <div class="menu-title">功能导航</div>
      </div>
      
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
          <svg viewBox="0 0 1104 1024" width="200" height="200">
            <path d="M1068.781972 987.943662c-7.211268 0-14.422535 0-14.422535-7.211268l-310.084507-151.436619c-14.422535-7.211268-21.633803-21.633803-21.633803-28.845071V209.126761c0-14.422535 7.211268-28.84507 21.633803-28.845071l310.084507-173.070422c14.422535-7.211268 21.633803-7.211268 36.056338 0s14.422535 21.633803 14.422535 28.84507v915.830986c0 14.422535-7.211268 21.633803-14.422535 28.84507-7.211268 7.211268-14.422535 7.211268-21.633803 7.211268z m-274.028169-209.126761l237.971831 115.380282V93.746479l-237.971831 129.802817v555.267605zM37.570704 987.943662c-7.211268 0-14.422535 0-21.633803-7.211268-7.211268-7.211268-14.422535-21.633803-14.422535-28.84507V36.056338c0-14.422535 7.211268-21.633803 14.422535-28.84507 14.422535-7.211268 21.633803-7.211268 36.056338 0l310.084507 173.070422c14.422535 7.211268 21.633803 21.633803 21.633803 28.845071v591.323943c0 14.422535-7.211268 28.84507-21.633803 28.845071l-310.084507 151.436619c-7.211268 7.211268-7.211268 7.211268-14.422535 7.211268z m36.056338-894.197183v800.450704l237.971831-115.380282V230.760563l-237.971831-137.014084zM549.570704 1024c-21.633803 0-36.056338-14.422535-36.056338-36.056338V36.056338c0-21.633803 14.422535-36.056338 36.056338-36.056338s36.056338 14.422535 36.056338 36.056338v951.887324c0 21.633803-14.422535 36.056338-36.056338 36.056338z" fill="#ffffff"></path>
          </svg>
        </el-icon>
        <span>镜像仓库</span>
      </el-menu-item>
      
      <el-menu-item index="/onlineServiceList" class="menu-item">
        <el-icon class="menu-icon"><Monitor /></el-icon>
        <span>在线服务</span>
      </el-menu-item>
      
      <div class="menu-footer">
        <el-button class="create-task-btn" @click="navigateTo('taskCreate')">
          <el-icon><Plus /></el-icon>
          <span>创建训练任务</span>
        </el-button>
      </div>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'


const router = useRouter()
const route = useRoute()

function navigateTo(routeName: string) {
  router.push(`/${routeName}`)
}
</script>

<style scoped>
.menu-left-container {
  width: 200px;
  height: calc(100vh - 60px);
  position: fixed;
  top: 60px;
  left: 0;
  z-index: 99;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
  background: linear-gradient(to bottom, #1a2942, #2a476e);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.side-menu {
  width: 200px;
  height: 100%;
  border-right: none;
  background: transparent;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
}

.menu-header {
  padding: 15px 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 10px;
}

.menu-title {
  margin: 0;
  font-weight: 500;
}

.menu-item {
  height: 60px;
  line-height: 60px;
  padding: 0 20px !important;
  margin: 4px 0;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.8) !important;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-left-color: rgba(0, 192, 238, 0.6);
  color: #ffffff !important;
}

/* 选中状态 */
.side-menu .el-menu-item.is-active {
  background: linear-gradient(90deg, rgba(0, 192, 238, 0.15), transparent);
  color: #ffffff !important;
  border-left-color: #00c0ee;
}

.menu-icon {
  font-size: 18px;
  margin-right: 4px;
  width: 24px;
  text-align: center;
  color: inherit;
}

/* 调整SVG图标大小和颜色 */
.menu-icon svg {
  width: 18px;
  height: 18px;
  margin: 0 3px;
}

.side-menu .el-menu-item.is-active .menu-icon {
  color: #00c0ee;
}

.menu-footer {
  margin-top: auto;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.create-task-btn {
  width: 100%;
  background: linear-gradient(90deg, #00c0ee, #2a84d8);
  border: none;
  color: white;
  padding: 10px 0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.create-task-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 192, 238, 0.3);
}
</style>