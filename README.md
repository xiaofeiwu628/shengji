# 自动建模平台前端

安装依赖，修改配置文件、把所有代码中的192.168.....的IP都改成需要部署的主服务器（FastAPI）IP
```
npm i 
```

在本地生成dist文件夹，将dist文件夹移到部署目录下(部署)
```
npm run build
```

本地运行
```
npm run serve
```