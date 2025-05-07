const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
// 跨域配置
module.exports = {
  devServer: {                //记住，别写错了devServer//设置本地默认端口  选填
    client: {overlay: {runtimeErrors: false,}}, //阻止改变页面大小重新渲染会报错，网上说是el-table的bug,
    port: 9876,
    proxy: {                 //设置代理，必须填
      '/api': {              //设置拦截器  拦截器格式   斜杠+拦截器名字，名字可以自己定
        
        
        target: 'http://192.168.109.198:8081',     //使用服务器
        changeOrigin: true,              //是否设置同源，输入是的
        pathRewrite: {                   //路径重写
          '^/api': ''                     //选择忽略拦截器里面的内容
        }
      },
      '/pyanalysis': {              //设置拦截器  拦截器格式   斜杠+拦截器名字，名字可以自己定

        target: 'http://192.168.109.198:8082',     //使用服务器
        changeOrigin: true,              //是否设置同源，输入是的
        pathRewrite: {                   //路径重写
          '^/pyanalysis': ''                     //选择忽略拦截器里面的内容
        }
      },
      '/before': {              //设置拦截器  拦截器格式   斜杠+拦截器名字，名字可以自己定

        target: 'http://192.168.109.198:8090',     //使用服务器

        changeOrigin: true,              //是否设置同源，输入是的
        pathRewrite: {                   //路径重写
          '^/before': ''                     //选择忽略拦截器里面的内容
        }
      },
    }
  }
}
