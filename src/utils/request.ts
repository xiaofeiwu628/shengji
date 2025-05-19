import axios, { AxiosRequestHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import router from "@/router";

const request = axios.create({
  baseURL: "/api",
  timeout: 300000,
});

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.headers) config.headers = {} as AxiosRequestHeaders;
    config.headers["Token"] = localStorage.getItem("Token") || "";
    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response: AxiosResponse) => {
    let res = response.data;
    if (response.config.responseType === "blob") return res;
    if (typeof res === "string") res = res ? JSON.parse(res) : res;
    if (res && (res.code === 10010 || res.code === 10011)) {
      // @ts-ignore
      if (typeof Storage !== "undefined" && Storage.localRemove) {
        // @ts-ignore
        Storage.localRemove("Token");
      } else {
        localStorage.removeItem("Token");
      }
      router.push({ path: "/login" });
    }
    return res;
  },
  (error) => {
    console.log("err" + error);
    return Promise.reject(error);
  }
);

export default request;