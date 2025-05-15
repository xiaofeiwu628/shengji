<template>
  <div class="home-container">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">智能中台建模平台</h1>
        <!-- <p class="hero-description">
          加速AI模型开发与部署，赋能企业智能化转型
        </p> -->
        <div class="hero-buttons">
          <el-button type="primary" class="get-started-btn" @click="navigateTo('modelList')">
            立即开始
            <el-icon class="icon-right"><ArrowRight /></el-icon>
          </el-button>
          <el-button class="learn-more-btn" @click="scrollToFeatures">
            了解更多
            <el-icon class="icon-right"><ArrowDown /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="hero-image">
        <img src="@/assets/bgimg2.png" alt="AI建模平台" class="platform-illustration" />
      </div>
    </section>

    <!-- 统计数据区域 -->
    <section class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ stats.models }}</div>
        <div class="stat-label">平台模型</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.services }}</div>
        <div class="stat-label">在线服务</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.datasets }}</div>
        <div class="stat-label">数据集</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.tasks }}</div>
        <div class="stat-label">训练任务</div>
      </div>
    </section>

    <!-- 特色功能区域 -->
    <section class="features-section" ref="featuresSection">
      <h2 class="section-title">平台特色</h2>
      
      <div class="features-grid">
        <div class="feature-card">
          <el-icon class="feature-icon"><DataAnalysis /></el-icon>
          <h3>模型训练</h3>
          <p>通过简单的配置，快速训练和调优AI模型，支持分类、回归、时间序列预测等多种任务类型</p>
        </div>
        
        <div class="feature-card">
          <el-icon class="feature-icon"><Monitor /></el-icon>
          <h3>服务部署</h3>
          <p>一键将AI模型部署为在线服务，提供稳定、高性能的推理能力，实时监控服务状态</p>
        </div>
        
        <div class="feature-card">
          <el-icon class="feature-icon"><Box /></el-icon>
          <h3>模型管理</h3>
          <p>集中管理和版本控制您的AI模型，支持公开分享，方便团队协作和模型迭代</p>
        </div>
        
        <div class="feature-card">
          <el-icon class="feature-icon"><Files /></el-icon>
          <h3>数据处理</h3>
          <p>丰富的数据预处理工具，支持多种数据类型和格式的高效处理，视觉化展示数据分布</p>
        </div>
      </div>
    </section>

    <!-- 快速访问区域 -->
    <section class="quick-access-section">
      <h2 class="section-title">快速访问</h2>
      
      <div class="access-cards">
        <div class="access-card" @click="navigateTo('modelList')">
          <el-icon class="access-icon"><Box /></el-icon>
          <h3>模型库</h3>
          <p>管理和使用您的AI模型</p>
        </div>
        
        <div class="access-card" @click="navigateTo('imageList')">
          <el-icon class="access-icon"><Picture /></el-icon>
          <h3>镜像仓库</h3>
          <p>管理和部署容器镜像</p>
        </div>
        
        <div class="access-card" @click="navigateTo('datascreen')">
          <el-icon class="access-icon"><Files /></el-icon>
          <h3>数据集管理</h3>
          <p>上传和组织训练数据</p>
        </div>
        
        <div class="access-card" @click="navigateTo('taskView')">
          <el-icon class="access-icon"><List /></el-icon>
          <h3>任务管理</h3>
          <p>监控和管理训练任务</p>
        </div>
        
        <div class="access-card" @click="navigateTo('onlineServiceList')">
          <el-icon class="access-icon"><Monitor /></el-icon>
          <h3>在线服务</h3>
          <p>部署和监控AI服务</p>
        </div>
        
        <div class="access-card" @click="navigateTo('taskCreate')">
          <el-icon class="access-icon"><Plus /></el-icon>
          <h3>创建任务</h3>
          <p>开始新的训练任务</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, ArrowDown, DataAnalysis, Monitor, Box, 
         Files, Picture, List, Plus } from '@element-plus/icons-vue';
import request from '@/utils/request';

export default {
  name: "Home",
  components: {
    ArrowRight, 
    ArrowDown,
    DataAnalysis,
    Monitor,
    Box,
    Files,
    Picture,
    List,
    Plus
  },
  setup() {
    const router = useRouter();
    const featuresSection = ref(null);
    
    // 统计数据
    const stats = ref({
      models: 0,
      services: 0,
      datasets: 0,
      tasks: 0
    });
    
    // 加载统计数据
    const loadStats = async () => {
      try {
        // 从实际API加载数据
        // 模型总数
        const modelRes = await request.get('/ModelRepository/GetModelList');
        stats.value.models = modelRes.data ? modelRes.data.length : 0;
        
        // 服务总数
        const serviceRes = await request.get('/OnlineService/GetOnlineServiceList');
        stats.value.services = serviceRes.data ? serviceRes.data.length : 0;
        
        // 数据集总数
        const datasetRes = await request.get('/data/search');
        stats.value.datasets = datasetRes.data ? datasetRes.data.length : 0;
        
        // 任务总数
        const taskRes = await request.get('/AutoModel/SearchTasks');
        stats.value.tasks = taskRes.data ? taskRes.data.length : 0;
      } catch (error) {
        console.error("统计数据加载失败", error);
        // 加载失败时使用默认数据
        stats.value = {
          models: 24,
          services: 18,
          datasets: 36,
          tasks: 42
        };
      }
    };
    
    const navigateTo = (route) => {
      router.push(`/${route}`);
    };
    
    const scrollToFeatures = () => {
      if (featuresSection.value) {
        featuresSection.value.scrollIntoView({ behavior: 'smooth' });
      }
    };
    
    onMounted(() => {
      loadStats();
    });
    
    return {
      stats,
      navigateTo,
      scrollToFeatures,
      featuresSection
    };
  }
}
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #1a2942 0%, #2a476e 100%);
  color: #ffffff;
  overflow-x: hidden;
}

/* 英雄区域样式 */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80px 10%;
  min-height: 75vh;
  background: linear-gradient(135deg, #1a2942 0%, #2a476e 50%, #4c75a3 100%);
  position: relative;
}

.hero-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  background: linear-gradient(to bottom, transparent, #1a2942);
  z-index: 1;
}

.hero-content {
  width: 50%;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(90deg, #ffffff, #00c0ee);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  animation: fadeInUp 1s ease-out;
}

.hero-description {
  font-size: 1.5rem;
  margin-bottom: 40px;
  color: #e0e0e0;
  line-height: 1.6;
  animation: fadeInUp 1s ease-out 0.2s forwards;
  opacity: 0;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  animation: fadeInUp 1s ease-out 0.4s forwards;
  opacity: 0;
}

.get-started-btn {
  background: linear-gradient(90deg, #00c0ee, #2a84d8);
  border: none;
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.get-started-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 192, 238, 0.3);
}

.learn-more-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.learn-more-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.icon-right {
  margin-left: 8px;
  font-size: 16px;
}

/* 英雄图片区域 - 增加尺寸和视觉效果 */
.hero-image {
  width: 50%; /* 从45%增加到50% */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  padding: 20px;
}

.platform-illustration {
  width: 100%;
  max-width: 600px; /* 从500px增加到600px */
  filter: drop-shadow(0 0 30px rgba(0, 192, 238, 0.5)); /* 增强阴影效果 */
  animation: float 6s ease-in-out infinite;
  transition: all 0.5s ease;
}

.hero-section:hover .platform-illustration {
  transform: scale(1.05); /* 鼠标悬停时略微放大 */
}

/* 增加飘浮动画效果的幅度 */
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-25px); /* 从-20px增加到-25px */
  }
  100% {
    transform: translateY(0px);
  }
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .platform-illustration {
    max-width: 550px;
  }
}

@media (max-width: 1024px) {
  .hero-image {
    width: 90%; /* 在小屏幕上增加宽度比例 */
  }
}

/* 统计区域样式 */
.stats-section {
  display: flex;
  justify-content: space-around;
  padding: 60px 10%;
  background: rgba(26, 41, 66, 0.8);
  position: relative;
  margin-top: -50px;
  z-index: 10;
  border-radius: 12px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.stat-card {
  text-align: center;
  padding: 20px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #00c0ee;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 1rem;
  color: #ffffff;
  opacity: 0.8;
}

/* 特色功能区域样式 */
.features-section {
  padding: 100px 10% 80px;
  background: #1a2942;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 60px;
  color: #ffffff;
  position: relative;
  font-weight: 600;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, #00c0ee, #2a84d8);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 30px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-10px);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  font-size: 40px;
  color: #00c0ee;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #ffffff;
  font-weight: 600;
}

.feature-card p {
  color: #e0e0e0;
  line-height: 1.6;
}

/* 快速访问区域样式 */
.quick-access-section {
  padding: 80px 10%;
  background: #2a476e;
}

.access-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.access-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 25px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
}

.access-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.access-icon {
  font-size: 36px;
  color: #00c0ee;
  margin-bottom: 15px;
}

.access-card h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #ffffff;
  font-weight: 600;
}

.access-card p {
  color: #e0e0e0;
  font-size: 0.9rem;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    padding: 60px 5%;
    text-align: center;
  }
  
  .hero-content {
    width: 100%;
    margin-bottom: 40px;
  }
  
  .hero-title {
    font-size: 2.8rem;
  }
  
  .hero-description {
    font-size: 1.2rem;
  }
  
  .hero-buttons {
    justify-content: center;
  }
  
  .hero-image {
    width: 80%;
  }
  
  .stats-section {
    flex-wrap: wrap;
  }
  
  .stat-card {
    flex: 1 0 45%;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    flex: 1 0 100%;
  }
}
</style>