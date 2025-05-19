import axios, { AxiosHeaders, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// 配置全局的超时时长
// axios.defaults.timeout = 100000;
// 配置全局的基本URL
axios.defaults.baseURL = '/before';
axios.defaults.headers.common['Content-Type'] = 'application/json;charset=utf-8';

// request 拦截器
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.headers) config.headers = {} as AxiosHeaders;
    // @ts-ignore
    config.headers['token'] = localStorage.getItem("token");
    return config;
  },
  (error) => Promise.reject(error)
);

// 通用POST请求
export const taskAdd = (params: any) => axios.post('/task/create', params);
export const taskSave = (params: any) => axios.post('/task/save', params);
export const taskStart = (params: any) => axios.post('/task/start', params);
export const taskStop = (params: any) => axios.post('/task/stop', params);
export const taskModify = (params: any) => axios.post('/task/modify', params);
export const taskDelete = (params: any) => axios.post('/task/delete', params);

export const serviceDeploy = (params: any) => axios.post('/service/deploy', params);
export const serviceStart = (params: any) => axios.post('/service/start', params);
export const serviceStop = (params: any) => axios.post('/service/stop', params);
export const serviceDelete = (params: any) => axios.post('/service/delete', params);
export const modelDelete = (params: any) => axios.post('/service/model_delete', params);

// 文件上传相关
export const imageUpload = (params: any, signal?: AbortSignal) =>
  axios.post('/file/upload-slice', params, signal ? { signal } : undefined);

export const imageMerge = (params: any, signal?: AbortSignal) =>
  axios.put('/file/merge-slice', params, signal ? { signal } : undefined);

export const uploadCancel = (params: any) => axios.post('/file/upload-cancel', params);

export const imagePush = (params: any, signal?: AbortSignal) =>
  axios.post('/image/push', params, signal ? { signal } : undefined);

export const imageSave = (params: any) => axios.post('/service/custom_save', params);
export const imageModify = (params: any) => axios.post('/service/custom_modify', params);
export const imageDelete = (params: any) => axios.post('/service/custom_delete', params);
export const imageVersionDelete = (params: any) => axios.post('/service/image_version_delete', params);
export const imageDeploy = (params: any) => axios.post('/service/custom_deploy', params);

// 日志
export const serviceLog = (params: string) => axios.get(`/task/container_log/${params}`);