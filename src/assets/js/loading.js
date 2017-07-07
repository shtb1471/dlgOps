/**
 * Created by lenovo on 2017/6/7.
 */
/**
 * loading配置
 */
import axios from 'axios'
import router from '../../router'
import Message from 'iview';
import {Loading} from 'element-ui'

axios.defaults.baseURL = HOST;
axios.defaults.timeout = 1000 * 15;
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';

var loadinginstace = "";
// http请求拦截器
axios.interceptors.request.use(function (config) {
  loadinginstace = Loading.service({ fullscreen: true })
  return config
}, function(error){
  loadinginstace.close()
  alert("加载超时");
  return Promise.reject(error)
});

// http响应拦截器
axios.interceptors.response.use(function(data){// 响应成功关闭loading
  loadinginstace.close();
  if (data.data.msg == "请登录") {
    setTimeout(function () {
      router.replace({
        path: '/',
        query: {redirect: router.currentRoute.fullPath}
      })
    },2000)
  }
  return data
}, function(error) {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        // 401 清除token信息并跳转到登录页面
        Message.error("加载失败,请重新登录");
        setTimeout(function () {
          router.replace({
            path: '/',
            query: {redirect: router.currentRoute.fullPath}
          })
        },2000)

    }
  }
  return Promise.reject(error)
});

export default axios
