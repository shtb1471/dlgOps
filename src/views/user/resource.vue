<template>
  <div class="resource">
    <!--列表-->
    <div class="table">
      <div style="padding-bottom:12px">
        <Button type="primary" class="btnSize" @click="updateData">新增</Button>
      </div>
      <Table border :columns="columnsUser" :data="dataResource" ref="table" size="small" highlight-row></Table>
    </div>

    <!--新增 修改-->
    <Modal v-model="addModal" width="460">
      <p slot="header">
        <span v-if="isAdd">新增</span>
        <span v-else>修改</span>
      </p>
      <Form ref="formItem" :rules="ruleValidate" :label-width="80" style="margin: 0px auto">
        <Form-item label="父节点">
          <Select v-model="formItem.list" name="parentList">
            <Option v-for="item in dataResource" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
        </Form-item>
        <Form-item label="菜单名">
          <Input v-model="formItem.name" name="name" placeholder="请输入姓名菜单名"></Input>
        </Form-item>
        <Form-item label="路径">
          <Input v-model="formItem.router" name="router" placeholder="请输入姓名路径"></Input>
        </Form-item>
        <Form-item label="顺序">
          <Input v-model="formItem.sourceSort" name="sort" placeholder="请输入姓名路径"></Input>
          <span style="font-size: 12px;color: red;">菜单顺序（1-127 数字）越小排越前面</span>
        </Form-item>
      </Form>
      <div slot="footer">
        <Button v-if="isAdd" type="primary" size="large" long @click="addResource()">确定</Button>
        <Button v-else type="primary" size="large" long @click="todoUpdate(0)">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import http from '../../assets/js/http'
  export default({
    name: "resource",
    data(){
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
          list: '',
          name: '',
          router: '',
          sourceSort: ''
        },
        ruleValidate: {
          name: [
            {required: true, message: '菜单名不能为空', trigger: 'blur'}
          ],
          router: [
            {required: true, message: '路径不能为空', trigger: 'blur'}
          ],
          sourceSort: [
            {required: true, message: '顺序不能为空', trigger: 'blur'}
          ]
        },
        roleList: [],
        columnsUser: [
          {
            type: 'index',
            width: 60,
            algin: "center"
          }, {
            title: '菜单名',
            key: 'name',
            render(row, column, index){
              return `<span>${row.level}</span><span>${row.name}</span>`
            }
          }, {
            title: '路径',
            key: 'url'
          }, {
            title: '状态',
            key: 'xStatus'
          }, {
            title: '创建时间',
            key: 'createTime'
          }, {
            title: '操作',
            key: 'action',
            render (row, column, index) {
              return `<i-button v-show="row.status!=0" type="text" size="small" @click="updateData(${index})">修改</i-button>
                    <i-button v-show="row.status!=0" type="text" size="small" @click="deleteResource(${index})">删除</i-button>
                    <i-button v-show="row.status!=0" type="text" size="small" @click="unableTodo(${index})">禁用</i-button>
                    <i-button v-show="row.status==0" type="text" size="small" @click="unableTodo(${index})">启用</i-button>`;
            },
            width: "23%"
          }
        ],
        dataResource: this.getResourceData(),
        hasRoleData: false,
        isAdd: false,
        addIndex: 0
      }
    },
    methods: {
      midConvert(data){
        data.createTime = this.formatDateTime(data.createTime);
        switch (data.status) {
          case 0:
            data.xStatus = "禁用";
            break;
          case 1:
            data.xStatus = "正常";
            break;
        }
      },
      getResourceData(){
        var datas = [];
        var self = this;
        var dataJson = {
          format: "json"
//        ,parentId:"0"
          , sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/resourceRestApi/list", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              if (res.data && res.data.length > 0) {
                res.data.forEach(function (data) {
                  data.level = "";
                  if(data.status==1){
                    if (data.children) {
                      if (data.children.length > 0) {
                        data.children.forEach(function (child) {
                          self.midConvert(child);
                          child.level = "--  ";
                          child.parentName = data.name;
                          if(child.status==1)
                          datas.push(child);
                        })
                      }
                    }
                  }

                  self.midConvert(data);
                  datas.push(data);
                })
              }
            } else {
              self.$Message.error(res.msg);
            }
          }).catch(function (e) {
          self.$Message.error(e);
        })
        datas.reverse();
        return datas;
      },
      updateData(index){
        if (/^[0-9]+$/.test(index)) {
          this.isAdd = false;
          this.formItem.list = this.dataResource[index].parentId;
          if (this.dataResource[index].parentName) {
            $(".ivu-select-selected-value").html(this.dataResource[index].parentName);
          } else {
            $(".ivu-select-selected-value").html("请选择");
          }
          this.formItem.name = this.dataResource[index].name;
          this.formItem.router = this.dataResource[index].url;
          this.formItem.sourceSort = this.dataResource[index].priority;
          this.addIndex = index;
        } else {
          this.isAdd = true;
          this.formItem.list = "";
          this.formItem.name = "";
          this.formItem.router = "";
          this.formItem.sourceSort = "";
        }
        this.addModal = true;
      },
      todoVerify(){
        /*  if (this.formItem.list=="") {
         this.$Message.error('菜单名不为空!');
         this.addModal = true;
         $("[name='parentList']").parents(".ivu-form-item")
         .addClass("ivu-form-item-error");
         return false;
         }*/
        if (this.formItem.name == "") {
          $(".ivu-form-item")
            .removeClass("ivu-form-item-error");
          this.$Message.error('请选择父节点!');
          this.addModal = true;
          $("[name='name']").parents(".ivu-form-item")
            .addClass("ivu-form-item-error");
          return false;
        }
        if (this.formItem.router == "") {
          $(".ivu-form-item")
            .removeClass("ivu-form-item-error");
          this.$Message.error('路径不为空!');
          this.addModal = true;
          $("[name='router']").parents(".ivu-form-item")
            .addClass("ivu-form-item-error");
          return false;
        }
        if (this.formItem.sourceSort == "") {
          $(".ivu-form-item")
            .removeClass("ivu-form-item-error");
          this.$Message.error('顺序不为空!');
          this.addModal = true;
          $("[name='sort']").parents(".ivu-form-item")
            .addClass("ivu-form-item-error");
          return false;
        }
        return true;
      },
      //添加
      addResource(){
        var self = this;
        if (!this.todoVerify()) {
          return false;
        }
        var dataJson = {
          format: "json"
          , name: this.formItem.name//资源名称
          , url: this.formItem.router//资源地址
          , parentId: this.formItem.list//父菜单id
          , priority: this.formItem.sourceSort //菜单顺序
          , sid: this.getCookie("cookieSid")
        }
        if (this.formItem.list == "") {
          dataJson.parentId = 0;
        }
        this.apiPost("/api/ops/resourceRestApi/add", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              self.$Message.info("添加成功！");
              this.addModal = false;
            } else {
              self.$Message.error(res.msg);
            }
          }).catch(function (e) {
          self.$Message.error(e);
        })
        window.location.reload();
      },
      deleteResource(index){
        var self = this;
        this.$Modal.confirm({
          content: '确定删除菜单！',
          onOk: function () {
            var dataJson = {
              format: "json"
              , id: self.dataResource[index].id
              , sid: self.getCookie("cookieSid")
            }
            self.apiPost("/api/ops/resourceRestApi/delete", self.qs.stringify(dataJson))
              .then(function (res) {
                if (res.data[0]) {
                  self.$Message.info("删除成功！");
                }
              }).catch(function (e) {
              self.$Message.error(e);
            })
            window.location.reload();
          }
        })

      },
      //禁用、启用
      unableTodo(index){
        var self = this;
        this.addIndex=index;
        var html = "<div>您确定要启用该菜单？</div>"
        if (this.dataResource[index].status == 0) {
          html = "<div>您确定要停用该菜单？</div>"
        }
        this.$Modal.confirm({
          content: html,
          onOk: function () {
            self.todoUpdate();
          }
        })
      },
      todoUpdate(value){
        var self = this;
        var dataJson = {
          format: "json"
          , id: this.dataResource[this.addIndex].id
          , sid: this.getCookie("cookieSid")
        }
        if (value == 0) {
          dataJson.parentId = this.formItem.list//父菜单id
          dataJson.name = this.formItem.name//资源名称
          dataJson.url = this.formItem.router//资源地址
          dataJson.priority = this.formItem.sourceSort //菜单顺序
          if (this.formItem.list == "") {
            dataJson.priority = 0;
          }
        }
        else {
          if (this.dataResource[this.addIndex].status == 0) {
            dataJson.status = 1
          } else {
            dataJson.status = 0
          }
//          dataJson.status = this.dataResource[this.addIndex].status//资源状态 0禁用 1启用
        }
        this.apiPost("/api/ops/resourceRestApi/update", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              self.$Message.info(res.msg);
            }
          })
          .catch(function (e) {
            self.$Message.error(e);
          })
        window.location.reload();
      }
    },
    mixins: [http]

  })
</script>
