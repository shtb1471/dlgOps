// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from './assets/js/loading'
import iview from 'iview'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import qs from 'qs'
import App from './App'
import router from './router'
import store from './vuex/store'
import jq from 'jquery'
import 'element-ui/lib/theme-default/index.css'
import 'iview/dist/styles/iview.css'
import './assets/css/reset.css'

Vue.use(iview);
Vue.use(Vuex);
Vue.use(ElementUI);
Vue.use(VueRouter);

Vue.config.productionTip = false;
window.axios = axios;
Vue.prototype.qs = qs;
window.$ = jq;
window.HOST = HOST;
window.zwHOST = "真我接口";
window.pageSize = 15

//设置cookie,增加到vue实例方便全局调用
//vue全局调用的理由是，有些组件所用到的接口可能需要session验证，session从cookie获取
//当然，如果session保存到vuex的话除外
Vue.prototype.setCookie = (c_name, value, expiredays) => {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
}

//获取cookie、
function getCookie(name) {
  var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg))
    return (arr[2]);
  else
    return null;
}
Vue.prototype.getCookie = getCookie;

//删除cookie
Vue.prototype.delCookie = (name) => {
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval = getCookie(name);
  if (cval != null)
    document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}
Vue.prototype.formatDate = function (date) {
  if (date != "" && date != null && date != undefined) {
    const y = new Date(date).getFullYear();
    let m = new Date(date).getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    let d = new Date(date).getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d;
  }else{
    return ""
  }
}
Vue.prototype.formatDateTime = function (dateTime) {
  if (dateTime != "" && dateTime != null && dateTime != undefined) {
    const y = new Date(dateTime).getFullYear();
    let m = new Date(dateTime).getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    let d = new Date(dateTime).getDate();
    d = d < 10 ? ('0' + d) : d;
    let h = new Date(dateTime).getHours();
    h = h < 10 ? ('0' + h) : h;
    let minute = new Date(dateTime).getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    let s = new Date(dateTime).getSeconds();
    s = s < 10 ? ('0' + s) : s;
    return y + '-' + m + '-' + d + " " + h + ":" + minute + ":" + s;
  }else{
    return '';
  }

}
Vue.prototype.getListTime = function (value) {
  if (value) {
    var start = new Date(value).getTime();
    return this.formatDate(start);
  } else {
    return ""
  }
}
Vue.prototype.xxisNullOrEmpty=function (name) {
  "use strict";
  if(name!=""||name!=0||name!=null){
    return true;
  }
}
new Vue({
  el: '#app',
  router,
  store,
  watch: {
    "$route": 'checkLogin'
  },
  created() {
    this.checkLogin();
  },
  methods: {
    checkLogin(){
      //检查是否存在session
      if (!this.getCookie('cookieSid')) {
        this.$router.push('/');
      }
    }
  },
  template: '<App/>',
  components: {App}
})
