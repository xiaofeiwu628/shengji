import axios from "axios";
import router from "@/router";

const request = axios.create({
  baseURL: "/api", // 注意！！ 这里是全局统一加上了 '/api' 前缀，也就是说所有接口都会加上'/api'前缀在，页面里面写接口的时候就不要加 '/api'了，否则会出现2个'/api'，类似 '/api/api/user'这样的报错，切记！！！
  timeout: 30000,
});

request.interceptors.request.use(
  (config) => {
    config.headers["Token"] = localStorage.getItem("Token"); // 设置请求头
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
request.interceptors.response.use(
  (response) => {
    let res = response.data;
    // 如果是返回的文件
    if (response.config.responseType === "blob") {
      return res;
    }
    // 兼容服务端返回的字符串数据
    if (typeof res === "string") {
      res = res ? JSON.parse(res) : res;
    }
    //token过期验证
    if (response.data.code === 10010 || response.data.code === 10011) {
      Storage.localRemove("Token"); // 删除已经失效或过期的token（不删除也可以，因为登录后覆盖）
      router.push({
        path: "/login", // 到登录页重新获取token
      });
    }
    return res;
  },
  (error) => {
    console.log("err" + error); // for debug
    return Promise.reject(error);
  },
);

export default request;
