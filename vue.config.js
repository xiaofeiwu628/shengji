// 合并为一个配置
/**
 * Vue CLI 项目配置文件
 * @module exports 导出Vue项目配置对象
 * @param {Object} config - Vue CLI配置对象
 * @param {boolean} config.transpileDependencies - 启用依赖转译（默认true）
 * @param {Object} config.devServer - 开发服务器配置
 * @returns {Object} 完整的Vue CLI配置对象
 */
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  // 转译node_modules中的依赖（兼容旧浏览器时需要）
  transpileDependencies: true,

  // 开发服务器配置
  devServer: {
    // 客户端配置：禁用运行时错误覆盖层
    client: { overlay: { runtimeErrors: false } },
    
    // 设置开发服务器端口为9877
    port: 9877,

    // 代理配置（解决跨域问题）
    proxy: {
      // API请求代理（后端服务）
      '/api': {
        target: 'http://192.168.109.198:8081', // 目标服务器地址
        changeOrigin: true, // 启用跨域
        pathRewrite: {
          '^/api': '' // 移除请求路径中的/api前缀
        }
      },

      // Python分析服务代理
      '/pyanalysis': {
        target: 'http://192.168.109.198:8082', // Python服务地址
        changeOrigin: true,
        pathRewrite: {
          '^/pyanalysis': '' // 移除路径中的/pyanalysis前缀
        }
      },

      // 前置服务代理
      '/before': {
        target: 'http://192.168.109.198:8090', // 前置服务地址
        changeOrigin: true,
        pathRewrite: {
          '^/before': '' // 移除路径中的/before前缀
        }
      }
    }
  }
})