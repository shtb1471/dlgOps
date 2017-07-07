<template>
  <div class="login loginform card-box">
    <h1 class="login-title">打零工运营后台V1.1</h1>
    <Form id="formCustom" ref="formCustom" :model="formCustom" :rules="ruleCustom" method="post">
      <Form-item prop="username">
        <input class="ivu-input login-input" type="text" v-model="formCustom.username" auto-complete="off"
               placeholder="用户名"/>
      </Form-item>
      <Form-item prop="passwd">
        <input class="ivu-input login-input" type="password" v-model="formCustom.passwd" auto-complete="off"
               placeholder="密码"/>
      </Form-item>
      <Form-item style="text-align: left;padding-left: 12px;">
        <input type="checkbox" v-model="formCustom.checked" checked="checked" disabled="disabled"/>
        <span>记住密码</span>
      </Form-item>
      <Form-item style="margin-bottom: 0px;">
        <Button type="primary" @click="handleSubmit('formCustom')">提交</Button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Button type="ghost" @click="handleReset('formCustom')" style="color: #ccc">重置</Button>
      </Form-item>
    </Form>
  </div>
</template>
<script>
  import http from "../assets/js/http"
  export default {
    data () {
      return {
        formCustom: {
          username: '',
          passwd: ''
        },
        ruleCustom: {
          username: [
            {required: true, message: '请填写用户名', trigger: 'blur'},
            {type: 'email', message: '用户名正确格式，eg:abc@def.com', trigger: 'blur'}
          ],
          passwd: [
            {required: true, message: '请填写密码', trigger: 'blur'},
            {type: 'string', min: 6, message: '密码长度不能小于6位', trigger: 'blur'}
          ]
        }
      }
    },
    beforeCreate: function () {
      document.getElementById('body').style.backgroundColor = '#23262E';
    },
    methods: {
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            var username = this.formCustom.username,
              password = this.formCustom.passwd;
            const dataJson = {
              principal: username,
              credentials: password,
              type: 1,
              sms: ""
            }
            localStorage.setItem('principal', username);
            localStorage.setItem('credentials', password);

            this.apiPost("/login?format=json", this.qs.stringify(dataJson)).then((res) => {
              if (res.code == 0) {
                  localStorage.setItem('cookieSid', res.sid);
                  localStorage.setItem('userID', JSON.parse(res.data).id);
                  localStorage.setItem('name',JSON.parse(res.data).name);
                //登录状态12小时后过期
                let expireDays = 1000 * 60 * 60 * 2;
                this.setCookie('cookieSid', res.sid, expireDays);
                //登录成功后
                this.$router.push({path: "/order",query: {name: '2-1'}});
//                首页
//                this.$router.push({path: "/main"});
                this.$Message.success('提交成功!');
              }else{
                this.$Message.error(res.msg);
              }
            }).catch(function (e) {
              console.log(e);
            })
          } else {
            this.$Message.error('表单验证失败!');
          }
        })
      },
      handleReset (name) {
        this.$refs[name].resetFields();
      }
    },
    mounted() {
      window.addEventListener('keyup', (e) => {
        if (e.keyCode === 13) {
          this.handleSubmit('formCustom')
        }
      })
    },
    mixins: [http],
    created:function () {
      this.formCustom.username=localStorage.principal;
      this.formCustom.passwd=localStorage.credentials;
    }
  }
</script>
<style scoped>
  body {
    background-color: #23262E;
  }

  input::-webkit-input-placeholder { /* WebKit browsers */
    color: #657180;
  }

  input:-moz-placeholder { /* Mozilla Firefox 4 to 18 */
    color: #657180;
    opacity: 1;
  }

  input::-moz-placeholder { /* Mozilla Firefox 19+ */
    color: #657180;
    opacity: 1;
  }

  input:-ms-input-placeholder { /* Internet Explorer 10+ */
    color: #657180;
  }

  form {
    margin-top: 24px;
  }

  .loginform {
    width: 36%;
    min-width: 460px;
    padding: 35px 35px 15px;
    text-align: center;
  }

  .login-title {
    font-weight: normal;
    font-size: 16px;
  }

  .card-box {
    padding: 32px 4%;
    border-radius: 6px;
    -moz-border-radius: 6px;
    background-clip: padding-box;
    background-color: transparent;
    margin: 0px auto;
    width: 36%;
    min-width: 460px;
    border: 1px solid #555;
    color: #ccc;
    box-shadow: 1px 2px 6px rgba(200, 200, 200, .2);
    position: relative;
    top: 120px;
  }

  .login-input {
    background-color: transparent;
    border: 1px solid #888;
    color: #ccc;
  }

  .ivu-form-item-content input[type='checkbox'] {
    vertical-align: middle;
  }
</style>
