<template>
  <div class="user">
    <!--title-->
    <div class="title clearfix">
      <div class="left">
        <Select v-model="condition" style="width:120px;">
          <Option v-for="item in conditionList" :value="item.value" :key="item">{{ item.name }}</Option>
        </Select>
        <Input v-if="condition==2" v-model="name" placeholder="请输入姓名" style="width: 180px;"></Input>
        <Input v-else v-model="username" placeholder="请输入用户名" style="width: 180px;"></Input>
        <Select v-model="status" style="width:120px;">
          <Option v-for="item in auditStatusList" :value="item.value" :key="item">{{ item.name }}</Option>
        </Select>
      </div>
      <div class="rightBtn">
        <Button type="success" class="search" @click="changeTableColumns">查询</Button>
        &nbsp;&nbsp;
        <Button type="primary" class="btnSize" @click="updateData">新增</Button>
      </div>
    </div>
    <!--列表-->
    <div class="table">
      <Table border :columns="columnsUser" :data="dataUser" ref="table" size="small" highlight-row></Table>
    </div>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-size="size"
          layout="prev, pager, next"
          :total="pageTotal">
        </el-pagination>
      </div>
    </div>
    <!--新增 修改-->
    <Modal v-model="addModal" width="360">
      <p slot="header">
        <span v-if="isAdd">新增</span>
        <span v-else>修改</span>
      </p>
      <Form ref="formItem" :label-width="80" style="margin: 0px auto">
        <Form-item label="用户名">
          <Input v-model="formItem.username" name="username" placeholder="请输入用户名"></Input>
        </Form-item>
        <Form-item label="姓名">
          <Input v-model="formItem.name" name="name" placeholder="请输入姓名"></Input>
        </Form-item>
      </Form>
      <div slot="footer">
        <Button type="primary" size="large" long @click="addModalOk">确定</Button>
      </div>
    </Modal>
    <!--授权-->
    <Modal v-model="accreditModal" width="360">
      <p slot="header">
        <span>授权</span>
      </p>
      <Form ref="roleFormItem" :label-width="80" style="margin: 0px auto">
        <Form-item label="用户名">
          <span v-model="roleFormItem.username">{{roleFormItem.username}}</span>
        </Form-item>
        <Form-item label="角色">
          <Checkbox-group v-if="hasRoleData" v-model="roleFormItem.roles">
            <Checkbox v-if="role.status==1" v-for="role in roleList" :label="role.id" :key="role.id">
              <span :id="role.id">{{role.roleName}}</span>
            </Checkbox>
          </Checkbox-group>
          <span v-else style="color: red" v-model="roleFormItem.noRoles">暂无角色</span>
        </Form-item>
      </Form>
      <div slot="footer">
        <Button type="primary" size="large" long @click="accreditModalOk">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import http from '../../assets/js/http'
  import jq from 'jquery'
  export default {
    name: 'user',
    data () {
      return {
        addModal: false,
        accreditModal: false,
        conditionList: this.$store.state.system.conditionList,
        condition: "",
        username: "",
        name: "",
        auditStatusList: this.$store.state.system.statusList,
        status: '',
        formItem: {
          username: '',
          name: ''
        },
        roleFormItem: {
          username: '',
          roles: [],
          noRoles: []
        },
        roleList: [],
        accreditIndex: 0,
        columnsUser: [
          {
            type: 'index',
            width: 50
          }, {
            title: '用户名',
            key: 'userName'
          }, {
            title: '姓名',
            key: 'name'
          }, {
            title: '角色',
            key: 'userRole'
          }, {
            title: '状态',
            key: 'status'
          }, {
            title: '创建时间',
            key: 'createTime'
          }, {
            title: '操作',
            key: 'action',
            render (row, column, index) {
              return `<i-button v-show="row.isStatus!=2" type="text" size="small" @click="updateData(${index})">修改</i-button>
                    <i-button v-show="row.isStatus!=2" type="text" size="small" @click="accreditTodo(${index})">授权</i-button>
                    <i-button v-show="row.isStatus!=2" type="text" size="small" @click="resetPWD(${index})">重置密码</i-button>
                    <i-button v-show="row.isStatus!=2" type="text" size="small" @click="unableTodo(${index})">禁用</i-button>
                    <i-button v-show="row.isStatus==2" type="text" size="small" @click="unableTodo(${index})">启用</i-button>`;
            },
            width: "23%"
          }
        ],
        dataUser: this.getDataU(),
        hasRoleData: true,
        isAdd: false,
        updtAdd: {},
        currentPage: 1,
        pageTotal: 0,
        size: 10,
        minId: ""
      }
    },
    methods: {
      midConvert(data){
        data.createTime = this.formatDateTime(data.createTime);
        data.isStatus = data.status;
        switch (data.status) {
          case 0:
            data.status = "新建";
            break;
          case 1:
            data.status = "正常";
            break;
          case 2:
            data.status = "禁用";
            break;
        }
        switch (data.auditStatus) {
          case 0:
            data.auditStatus = "未审核";
            break;
          case 1:
            data.auditStatus = "审核中";
            break;
          case 2:
            data.auditStatus = "审核通过";
            break;
          case 3:
            data.auditStatus = "审核失败";
            break;
        }
      },
      getDataU: function (page) {
        var datas = [];
        var self = this;
        this.todoWithPage();
        var dataJson = {
          format: "json"
          , userName: this.username//用户邮箱
          , name: this.name  //用户真实姓名
          , status: this.status
          , size: this.size
          , page: 0
          , sid: this.getCookie("cookieSid")
        }
        if (page) {
          dataJson.page = this.page;
        }
        this.apiPost("/api/ops/userManager/userList", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              self.pageTotal = res.total;
              res.data.forEach(function (data) {
                self.midConvert(data);
                datas.push(data);
              })
            } else {
              self.$Message.error(res.msg);
            }
          }).catch(function (e) {
          self.$Message.error(e);
        })
        return datas;
      },
      changeTableColumns(){
        this.dataUser = this.getDataU();
      },
      //新增 接口
      addModalOk(){
        if (this.formItem.username == '') {
          this.$Message.error('请输入正确格式用户名!');
          this.addModal = true;
          jq("input[name='username']")
            .parents(".ivu-form-item")
            .addClass("ivu-form-item-error");
          return false;
        }
        if (this.formItem.name == "") {
          jq("input[name='username']")
            .parents(".ivu-form-item")
            .removeClass("ivu-form-item-error");
          this.$Message.error('请输入姓名!');
          this.addModal = true;
          jq("input[name='name']")
            .parents(".ivu-form-item")
            .addClass("ivu-form-item-error");
          return false;
        }
        else {
          jq(".ivu-form-item")
            .removeClass("ivu-form-item-error");
        }
        this.updtAdd.userName = this.formItem.username //用户邮箱
        this.updtAdd.name = this.formItem.name  //用户真实姓名
        this.apiPost("/api/ops/userManager/add", this.qs.stringify(this.updtAdd))
          .then(function (res) {
            if (res.code != 0) {
              self.$Message.error(res.msg);
            }
            window.location.reload();
          }).catch(function (e) {
          self.$Message.error(e);
        })
        this.addModal = false;
      },
      //新增&修改
      updateData(index){
        this.addModal = true;
        var dataJson = {
          format: "json"
          , sid: this.getCookie("cookieSid")
        }
        if (/^[0-9]+$/.test(index)) {
          this.isAdd = false;
          this.formItem.username = this.dataUser[index].userName;
          this.formItem.name = this.dataUser[index].name;
          dataJson.id = this.dataUser[index].id;
        } else {
          this.isAdd = true;
          this.formItem.username = "";
          this.formItem.name = "";
        }
        this.updtAdd = dataJson;
      },
      //禁止/启动操作
      unableTodo(index){
        var self = this
          , html = "<div>您确定要启用该用户？</div>"
          , toValue = 1;
        if (this.dataUser[index].isStatus != 2) {
          html = "<div>您确定要停用该企业？</div>"
            + "<div>停用后该企业将不能登录打零工系统。</div>"
          toValue = 2
        }
        this.$Modal.confirm({
          content: html,
          onOk: function () {
            self.todoProhibit(index, toValue);
          }
        })
      },
      todoProhibit(index, toValue){
        var dataJson = {
          format: "json",
          userName: this.dataUser[index].userName,
          status: toValue,
          sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/userManager/updateStatus", this.qs.stringify(dataJson))
          .then(function (res) {
            console.log(res.msg);
            window.location.reload();
          }).catch(function (e) {
          console.log(e);
        })
      },
      //重置密码
      resetPWD(index) {
        var self = this;
        this.$Modal.confirm({
          title: '重置密码',
          content: `<div>您确定把密码重置为123456吗？</div>`,
          onOk: () => {
            init(index);
          }
        })
        function init(index) {
          var dataJson = {
            format: "json"
            , userName: self.dataUser[index].userName
            , sid: self.getCookie("cookieSid")
          }
          self.apiPost("/api/ops/userManager/resetPassword", self.qs.stringify(dataJson))
            .then(function (res) {
              if (res.code == 0) {
                this.$Message.info("重置成功")
                window.location.reload();
              } else {
                this.$Message.error(res.msg);
              }
            }).catch(function (e) {
            console.log(e);
          })
        }
      },
      accreditTodo(index){
        this.roleFormItem.username = this.dataUser[index].userName;
        this.accreditIndex = index;
        var self = this;
        self.roleList = [];
        self.getRoleList(index);
        this.apiGet("/api/ops/roleRestApi/list?format=json&sid=" + this.getCookie("cookieSid") + "&page=0&size=10")
          .then(function (res) {
            if (res.code == 0) {
              if (res.data.length > 0) {
                self.hasRoleData = true;
                res.data.forEach(function (data) {
                  self.roleList.push(data);
                })
              } else {
                self.hasRoleData = false;
              }
            }
          }).catch(function (e) {
          console.log(e)
        })
        this.accreditModal = true;
      },
      //授权
      getRoleList(index){
        var Xself = this;
        var dataJson = {
          format: "json"
          , userId: this.dataUser[index].id
          , sid: this.getCookie("cookieSid")
        }
        Xself.roleFormItem.roles = [];
        this.apiPost("/api/ops/roleUserRestApi/list/roles", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              if (res.data && res.data.length > 0) {
                res.data.forEach(function (data) {
                  Xself.roleFormItem.roles.push(data.roleId);
                })
              }
            }
          }).catch(function (e) {
          console.log(e);
        })
      },
      accreditModalOk(){
        var roleFormItem = [];
        if (this.roleFormItem.roles.length > 0) {
          for (var i = 0; i < this.roleFormItem.roles.length; i++) {
            var items = {};
            items.id = this.roleFormItem.roles[i];
            items.tag = $("#" + this.roleFormItem.roles[i]).html();
            roleFormItem.push(items);
          }
          var dataJson = {
            userId: this.dataUser[this.accreditIndex].id
            , roles: roleFormItem
          }
          $.ajax({
            url: HOST + "/api/ops/roleUserRestApi/add?format=json&sid=" + this.getCookie("cookieSid"),
            type: "post",
            crossDomain: true,
            contentType: "application/json",
            data: JSON.stringify(dataJson),
            dataType: "json",
            xhrFields: {
              withCredentials: true
            },
            success: function (res) {
              console.log(res);
            },
            error: function (e) {
              console.log(e);
            }
          })
        }
        this.accreditModal = false;
        window.location.reload();
      },
      //分页
      todoWithPage(){
        if (!this.size) {//如果分页大小为空则设置为10
          this.size = 10;
        }
        if (!this.page) {//如果分页大小为空则设置为10
          this.page = 0;
        }
      },
      handleCurrentChange(val) {
        this.currentPage = val;
        this.changePage(val);
      },
      changePage(page){
        this.page = parseInt(page - 1);
        this.dataUser = this.getDataU(1);
      }
    },
    mounted() {
      window.addEventListener('keyup', (e) => {
        if (e.keyCode === 13) {
          this.changeTableColumns();
        }
      })
    },
    mixins: [http]
  }
</script>
<!--<style scoped>-->
<style>
  .user .left {
    width: 440px;
  }
</style>
