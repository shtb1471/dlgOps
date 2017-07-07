<template>
  <div class="changePassword">
    <form>
      <p>
        <label>当前用户</label><strong>{{userName}}</strong>
      </p>
      <p>
        <label>原密码</label>
        <input type="password" v-model="oldPwd" name="oldPwd"/>
      </p>
      <p>
        <label>新密码</label>
        <input type="password" v-model="newPwd" name="newPwd"/>
      </p>
      <p>
        <label>确认密码</label>
        <input type="password" class="okpas" v-model="aPwd" name="aPwd" />
      </p>
      <div class="changeBut">
        <Button type="primary" size="large" @click="updatePWD">确定</Button>
      </div>
    </form>
  </div>
</template>
<script>
  import http from "../../assets/js/http"
  export default{
    name:'changePassword',
    data(){
      return {
        userName:this.getUserName(),
        oldPwd:'',
        newPwd:'',
        aPwd:''
      }
    },
    methods:{
        getUserName(){
          return localStorage.getItem("principal");
        },
        updatePWD() {
            if(!this.oldPwd){
              $("[name='oldPwd']").css("border-color","red");
              return false;
            }
            if(!this.newPwd){
              $("input").css("border-color","#e3e8ee");
                $("[name='newPwd']").css("border-color","red");
                return false;
            }
            if(!this.aPwd||this.aPwd!=this.newPwd){
              $("input").css("border-color","#e3e8ee");
              $("[name='aPwd']").css("border-color","red");
              return false;
            }
          $("input").css("border-color","#e3e8ee");
          var dataJson={
              format:"json",
              userName:this.userName , //用户邮箱
              oldPassword:this.oldPwd ,//旧密码
              newPassword:this.newPwd, //新密码
              sid:this.getCookie("cookieSid")
          }
          this.apiPost("/api/ops/userManager/updatePassword", this.qs.stringify(dataJson))
            .then(function (res) {
                if(res.code!=0){
                    this.$Message.error(res.msg);
                }
            }).catch(function (e) {
            console.log(e);
          })
        }
    },
    mixins:[http]
  }
</script>
<style scoped>
  .changePassword{border:1px solid #e3e8ee;background: #f5f7f9;padding:5.5% 15%;}
  .changePassword form{width:70%;margin:0 auto;}
  .changePassword p{margin:1% 2% 4%;}
  .changePassword form p:last-child{margin-bottom: 60px;}
  .changePassword p strong{display: inline-block;width:75%;}

  .changePassword p label{display: inline-block;width:10%;text-align: right;margin-right: 3%;}
  .changePassword p input{width: 70%;height:40px;border:1px solid #e3e8ee;border-radius:5px;padding:0 5px;}
  .okpas{margin-bottom: 60px;}
  .changeBut{width:15%;margin:0 auto;}
  .changeBut .cancel{margin-right: 1%;}
</style>
