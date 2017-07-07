<template>
  <div class="home">
    <v-header></v-header>
    <Row class="homeContent">
      <div class="v-home-left">
        <v-left></v-left>
      </div>
      <div id="rightPart"  class="v-home-right">
        <div class="layout-content">
          <div class="layout-content-main">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </Row>
    <!--<v-footer></v-footer>-->
  </div>
</template>
<script>
  import vHeader from '../components/common/header'
  import vLeft from '../components/common/left'
  import vFooter from '../components/common/footer'
  import Index from '@/views/index/index'
  export default{
    data(){
      return {
        isLoading: false,
        height:600
      }
    },
    beforeCreate: function () {
      document.getElementById('body').style.backgroundColor = '';
      this.height=$(document.body).height();
      $("#rightPart").height($(document.body).height()-100);
    },
    created(){
        window.onload=function () {
            this.isLoading=!this.isLoading
        }
    },
    components: {
      vHeader
      , vLeft
      , vFooter
    },
    methods:{

    },
    watch(){
      window.onscroll = function(){
        var scrollTop = document.body.scrollTop;
        if(scrollTop >= 0){
          // 你想做的事
          $("#rightPart").on("scroll")
        }
      }
    }
  }
</script>
<style scoped>
  .home {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .homeContent{
    width: 100%;
    height: 100%;
    min-width: 1400px;
    overflow-x: hidden;
  }
  .layout-content {
    min-height: 200px;
    margin: 15px auto;
    background: #fff;
    border-radius: 4px;
  }

  .layout-content-main {
    padding: 10px 0px;
  }

  .layout-copy {
    text-align: center;
    padding: 10px 0 20px;
    color: #9ea7b4;
  }

  .v-home-left {
    width: 15%;
    overflow: hidden;
    height: 100%;
    float: left;
    z-index: 2;
  }
  .v-home-right{
    width: 84%;
    float: left;
    padding-left: 1%;
    overflow-y: auto;
    height: 100%;
    background: rgb(255, 255, 255);
    padding-top: 52px;
  }
</style>
