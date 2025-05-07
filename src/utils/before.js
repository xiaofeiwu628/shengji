import axios from 'axios'
import request from "@/utils/request";

// 配置全局的超时时长
// axios.defaults.timeout = 100000;
// 配置全局的基本URL
axios.defaults.baseURL = '/before';
// axios.defaults.baseURL = 'http://192.168.130.63:8090';
// axios.defaults.baseURL = 'http://192.168.136.65:8090';
axios.defaults.headers = {'Content-Type': 'application/json;charset=utf-8'};

// request 拦截器
// 可以自请求发送前对请求做一些处理
// 比如统一加token，对请求参数统一加密
axios.interceptors.request.use(config => {
    // config.headers['Content-Type'] = 'multipart/form-data';
    // config.headers['Content-Type'] = 'application/json';
    config.headers['token'] = localStorage.getItem("token");  // 设置请求头
    return config
}, error => {
    return Promise.reject(error)
});
// axios.defaults.headers['token'] = localStorage.getItem('token');

export const taskAdd = (params) => {
    return axios.post(`/task/create`,params);
};
export const taskSave = (params) => {
    return axios.post(`/task/save`,params);
};
export const taskStart = params => {
    return axios.post(`/task/start`,params);
};
export const taskStop = params => {
    return axios.post(`/task/stop`,params);
};
export const taskModify = (params) => {
    return axios.post(`/task/modify`,params);
};
export const taskDelete = params => {
    return axios.post(`/task/delete`,params);
};
export const serviceDeploy = (params) => {
    return axios.post(`/service/deploy`,params);
};
export const serviceStart = params => {
    return axios.post(`/service/start`,params);
};
export const serviceStop = params => {
    return axios.post(`/service/stop`,params);
};
export const serviceDelete = params => {
    return axios.post(`/service/delete`,params);
};
export const modelDelete = (params) => {
    return axios.post(`/service/model_delete`,params);
};
export const imageUpload = (params,signal) => {
    return axios.post(`/file/upload-slice`,params,signal);
};
export const imageMerge = (params,signal) => {
    return axios.put(`/file/merge-slice`,params,signal);
};
export const uploadCancel = (params) => {
    return axios.post(`/file/upload-cancel`,params);
};
export const imagePush = (params,signal) => {
    return axios.post(`/image/push`,params,signal);
};
export const imageSave = (params) => {
    return axios.post(`/service/custom_save`,params);
};
export const imageModify = (params) => {
    return axios.post(`/service/custom_modify`,params);
};
export const imageDelete = (params) => {
    return axios.post(`/service/custom_delete`,params);
};
export const imageVersionDelete = (params) => {
    return axios.post(`/service/image_version_delete`,params);
};
export const imageDeploy = (params) => {
    return axios.post(`/service/custom_deploy`,params);
};
export const serviceLog = (params) => {
    return axios.get(`/task/container_log/` +  params);
};

