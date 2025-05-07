<template>
  <div class="image-container" >
    <el-text class="welcome-text">欢迎使用智能中台建模平台</el-text>
  </div>
</template>

<script>
export default {
  name: "Home"
}
</script>

<style scoped>
.image-container {
  background-image: url('../assets/bgimg.png');
  width: 100%;
  height: 100%;
  background-size: cover;
  display: flex;
  justify-content: center;
  overflow: hidden;
}
.welcome-text {
  color: #00c0ee; /* 设置文本颜色 */
  font-size: 2vw; /* 设置文本的字体大小 */
  font-weight: bold; /* 设置文本的字体粗细 */
  font-family: "Microsoft YaHei"; /* 设置文本的字体 */
  margin-bottom: 6%;
}
</style>
