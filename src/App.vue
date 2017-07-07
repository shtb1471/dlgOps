<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import http from "./assets/js/http"
  export default {
    name: 'app',
    data(){
      return {
        isLogin: false,
        userInfo: { //保存用户信息
          username: "",
          password: "",
          status: 1,
          sid:""
        }
      }
    },
    methods: {
      //请求用户的一些信息
      getUserInfo(){
        //发送http请求获取，这里写死作演示
        this.userInfo = {
          username: localStorage.principal,
          password:localStorage.credentials,
          status: 1,
          sid: localStorage.cookieSid
        }
        //提交mutation到Store
        this.$store.commit('updateUserInfo', this.userInfo);
      }
    },
    mounted(){
      //组件开始挂载时获取用户信息
      this.getUserInfo();
    },
    mixins:[http]
  }
</script>

<style>
  @import './assets/css/reset.css';
  #app {
    font-family: 'Microsoft YaHei', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #333;
  }
</style>
