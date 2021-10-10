import { appConfigs } from './../config/app';
import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import querystring from "querystring";

function interceptorResponse(data: any, headers: any) {
  try {
    return JSON.parse(data);
  } catch (e) {
  }
  return data;
}

const options: AxiosRequestConfig = {
  baseURL: appConfigs.BASE_URL,
  timeout: 30 * 1000,
  responseType: "json",
  transformResponse: interceptorResponse,
  maxContentLength: Infinity,
  maxBodyLength: Infinity
};

const axiosClient: AxiosInstance =  Axios.create(options);
axiosClient.defaults.params = {};
axiosClient.interceptors.request.use(function (config) {
  config.params['token'] = appConfigs.SYSTEM_TOKEN;
  return config;
}, function (error) {
  return Promise.reject(error);
});

export default axiosClient;