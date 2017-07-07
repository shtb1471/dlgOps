<template>
  <div id="header">
    <div class="gr-main-header">
      <h4 class="header-lft">
        运营后台V1.0
      </h4>
      <div v-if="false" class="header-mid">
        <a class="on">打 零 工</a>
        <a>真 我</a>
      </div>
      <div class="header-rht" @click="todoShow" @mouseleave="todoHide">
        <Dropdown class="v-dropDw">
          <a href="javascript:void(0)">
            <span>{{username}}</span>
            <Icon type="arrow-down-b"></Icon>
          </a>
          <Dropdown-menu slot="list">
            <Dropdown-item @click.native="changePWD">修改密码</Dropdown-item>
            <Dropdown-item @click.native="logout">退出</Dropdown-item>
          </Dropdown-menu>
        </Dropdown>
      </div>
    </div>
  </div>
</template>
<script>
  import http from "../../assets/js/http"
  export default{
    data(){
      return {
          username:this.getUserName(),
        isShow: false
      }
    },
    methods: {
      getUserName(){
          if(localStorage.getItem("name")){
            return localStorage.getItem("name");
          }else{
            return '管理员';
          }
      },
      todoShow() {
        this.isShow = !this.isShow;
      },
      todoHide() {
        this.isShow = false;
      },
      logout() {
        var self = this;
        var dataJson = {
          format: "json"
          , sid: this.getCookie("cookieSid")
        }
        this.$Modal.confirm({
          content: "<div>确定要登出吗？</div>",
          onOk: function () {
            self.apiPost('/logout', self.qs.stringify(dataJson)).then(function (res) {
              if (res.code == "20000010") {
                self.delCookie("cookieSid");
                self.$router.replace({path: '/'})
              }
            })
          }
        });
      },
      changePWD() {
        this.$router.replace({path: '/changePassword'});
      }
    },
    mixins: [http]
  }
</script>
<style scoped>
  .gr-header-100 {
    height: 100%;
  }

  #header {
    width: 100%;
    position: fixed;
    top: 0px;
    z-index: 1000;
  }

  .gr-main-header {
    height: 52px;
    width: 100%;
    text-overflow: ellipsis;
    text-align: left;
    position: relative;
    background: #23262E;
    z-index: 11;
    box-shadow: 0 0px 2px rgba(0, 0, 0, .2);
    -moz-box-shadow: 0 0px 2px rgba(0, 0, 0, .2);
    -webkit-box-shadow: 0 0px 2px rgba(0, 0, 0, .2);
    -ms-box-shadow: 0 0px 2px rgba(0, 0, 0, .2);
    border-bottom: 1px solid #000000;
  }

  .header-lft {
    width: 25%;
    line-height: 52px;
    float: left;
    margin: 0px auto;
    padding-left: 28px;
    font-weight: bold;
    color: #ffffff;
    font-size: 20px;
  }

  .header-mid {
    width: 55%;
    line-height: 52px;
    float: left;
    margin: 0px auto;
    padding-left: 28px;
    color: #ffffff;
  }

  .header-mid a {
    display: inline-block;
    margin-right: 40px;
    position: relative;
    height: 52px;
    line-height: 52px;
    font-size: 14px;
    padding: 0 4px;
    color: #fff;
    opacity: .69;
    cursor: pointer;
    transition: all .2s ease-in-out;
  }

  .header-mid a.on, .header-mid a:hover {
    color: #fff;
    opacity: 1;
  }

  .header-mid a.on:after {
    content: "";
    display: block;
    width: 100%;
    height: 4px;
    background-color: #39f;
    position: absolute;
    bottom: 0;
    left: 0;
  }

  .gr-main-logo {
    max-width: 260px;
    width: 100%;
    padding: 16px 22px;
    background: #444;
    border-bottom: 1px solid #303030;
  }

  .header-rht {
    float: right;
    width: 16%;
    height: 52px;
    line-height: 52px;
    color: #c2c2c2;
    font-size: 12px;
    text-align: right;
    margin-right: 2%;
  }

  .header-rht span {
    display: inline-block;
    cursor: pointer;
    line-height: 42px;
    margin-bottom: 4px;
  }

  .header-rht span.active {
    color: #ffffff;
    border-bottom: 2px solid #26c1e6;
  }

  .header-rht .v-dropDw {
    /*background: #ffffff;*/
    /*color: #333333;*/
    color: #fff;
    border-radius: 6px;
    overflow: hidden;
    /*border: 1px solid #eee;*/
    /*box-shadow: 0px 0px 5px #ddd;*/
  }

  .header-rht .v-dropDw div {
    line-height: 36px;
    border-bottom: 1px solid #eee;
    text-align: center;
  }

  .header-rht .v-dropDw div:hover {
    background: #eeeeee;
    cursor: pointer;
  }

  .header-rht .v-dropDw div a, .header-rht .v-dropDw div a:hover {
    display: block;
    color: #fff;
  }

</style>
