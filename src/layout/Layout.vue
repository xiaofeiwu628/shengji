<template>
  <div style="display: flex; flex-direction: column">
    <!-- 头部 -->
    <Header style="position: fixed" />
    <!-- 主体 -->
    <div style="display: flex; height: 100vh;">
      <!-- 侧边栏 -->
      <div class="sidebar">
        <MenuLeft />
      </div>
      <!-- 内容区域 -->
      <div class="main-view">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

import Header from "@/components/Header.vue"
import MenuLeft from "@/components/Menu_left.vue"

</script>

<style>
/* 默认样式 - 显示侧边栏 */
.sidebar {
  display: block;
  position: fixed;
  top: 51px;
  left: 0;
  z-index: 1000;
}

.main-view {
  flex: 1;
  background-color: #F5F5F5;
  padding-top: 51px; /* 考虑头部的高度 */
  overflow-y: auto; /* 允许垂直滚动 */
  padding-left: 200px; /* 调整内容区域的左边距 */
}
/* 在窗口宽度小于某个值时隐藏侧边栏 */
@media (max-width: 900px) {
  .sidebar {
    display: none;
  }
  .main-view {
    padding-left: 0; /* 调整内容区域的左边距 */
  }
}
</style>