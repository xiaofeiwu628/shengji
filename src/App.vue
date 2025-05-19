<template>
  <div>
    <router-view />
  </div>
</template>

<script lang="ts" setup>
// 目前 App.vue 没有数据和方法，仅保留生命周期钩子即可
import { onMounted } from 'vue'

// 如果后续需要初始化逻辑，可在 onMounted 中实现
onMounted(() => {
  // 这里可以放置原 created 钩子的逻辑
})
</script>

<style>
</style>