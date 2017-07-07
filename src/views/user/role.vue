<template>
  <div class="roles">
    <!--title-->
    <div class="title clearfix">
      <div class="">
        <div>
          <Select v-model="condition" style="width:10%">
            <Option v-for="item in conditionList" :value="item.value" :key="item">{{ item.name }}</Option>
          </Select>
          <Input v-model="value" placeholder="请输入..." style="width: 16%"></Input>
          <Select v-model="auditStatus" style="width:10%">
            <Option v-for="item in auditStatusList" :value="item.value" :key="item">{{ item.name }}</Option>
          </Select>
          <Button type="success" class="search" @click="searchBtn">查询</Button>
          &nbsp;&nbsp;
          <Button type="primary" @click="updateData">新增</Button>
        </div>
      </div>
    </div>
    <!--列表-->
    <div class="table">
      <Table border :columns="columnsUser" :data="dataRole" ref="table" size="small" highlight-row></Table>
    </div>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage1"
          :page-size="size"
          layout="prev, pager, next"
          :total="pageTotal">
        </el-pagination>
      </div>
    </div>
    <!--新增 修改-->
    <Modal v-model="addModal" width="520">
      <p slot="header">
        <span v-if="updateOrAdd">新增</span>
        <span v-else>修改</span>
      </p>
      <Form ref="formItem" :label-width="80" style="margin: 0px auto">
        <Form-item label="角色名">
          <Input v-model="formItem.roleName" name="roleName" placeholder="请输入用户名"></Input>
        </Form-item>
        <Form-item label="编码">
          <Input v-if="updateOrAdd" v-model="formItem.xxCode" name="xxCode" placeholder="请输入编码"></Input>
          <Input v-else v-model="formItem.xxCode" name="xxCode" placeholder="请输入编码" disabled="disabled"></Input>
        </Form-item>
        <Form-item label="菜单">
          <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;" v-for="item in menuList"
               :key="item.id">
            <input type="checkbox"
                   @click="handleCheckAll(item)"
                   :label="item.id+','+item.url"
                   :id="item.id">
            {{item.name}}
            </input>
            <div v-if="itemChildren.status==1" style="margin-left: 15px;" v-for="(itemChildren,index) in item.children" :key="itemChildren.id">
              <input type="checkbox" :label="itemChildren.id+','+item.url"
                     :id="itemChildren.id" @click="checkAllGroupChange(itemChildren)">
              <span>{{itemChildren.name}}</span>
              </input>
            </div>
          </div>
        </Form-item>
      </Form>
      <div slot="footer">
        <Button type="primary" size="large" long @click="addModalOk()">确定</Button>
      </div>
    </Modal>

    <!--拥有者-->
    <Modal v-model="showOwnerModal" width="460">
      <p slot="header">
        <span>拥有者</span>
      </p>
      <Table :context="self" :data="forChildData" :columns="columnsOwner" size="small" border
             @on-row-click="removeChildData"></Table>
      <div slot="footer">
        <Button type="primary" size="large" long @click="showOwnerModal=false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import http from '../../assets/js/http'
  export default {
    name: 'roles',
    data () {
      return {
        //search...
        addModal: false,
        showOwnerModal: false,
        conditionList: this.$store.state.system.rolesCondtList,
        condition: '',
        value: '',
        auditStatusList: this.$store.state.system.auditStatusList,
        auditStatus: "",
        //tableList
        columnsUser: [
          {
            type: 'index',
            width: 50
          }, {
            title: '角色名',
            key: 'roleName'
          }, {
            title: '拥有者',
            key: 'usersCount',
            render(row, column, index){
              return `<i-button type="text" v-if="${row.usersCount}==0" style="color:#18A689">${row.usersCount}</i-button>
                      <i-button v-else type="text" size="small" @click="showOwner(${index})" style="color:#18A689">${row.usersCount}</i-button>`
            }
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
              return `<i-button v-show="${row.status}==1" type="text" size="small" @click="updateData(${index})">修改</i-button>
                    <i-button v-if="${row.status}==0" type="text" size="small" @click="todoUnable(${index})">启用</i-button>
                    <i-button v-else type="text" size="small" @click="todoUnable(${index})">停用</i-button>`;
            },
            width: "23%"
          }
        ],
        dataRole: this.getDataR(),
        //add modal 新增
        formItem: {
          roleName: '朱',
          xxCode: 'test',
          selectModal: []
        },
        menuList: this.getMenuList(),
        updateOrAdd: false,
        updateIndex: 0,
        columnsOwner: [
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
            title: '操作',
            key: 'action',
            render: function (row, column, index) {
              return `<i-button type="text" size="small" @click="removeIndex=${index}">移除</i-button>`
            }
            ,
            width: "23%"
          }
        ],
        removeIndex: 0,
        forChildData: [],
        ownerId: "",
        currentPage1: 1,
        pageTotal: 0,
        size: 10,
        page: 0
      }
    },
    methods: {
      midConvert(data)
      {
        data.createTime = this.formatDateTime(data.createTime);
        switch (data.status) {
          case 0:
            data.xStatus = "禁用";
            break;
          case 1:
            data.xStatus = "正常";
            break;
        }
      }
      ,
      //获取table 数据
      getDataR: function (index) {
        var datas = [], self = this, pageNumber = 0;
        this.value == undefined ? this.value = "" : this.value = this.value
        this.auditStatus == undefined ? this.auditStatus = "" : this.auditStatus = this.auditStatus
        this.todoWithPage();
        if (index) {
          pageNumber = this.page;
        }
        this.apiGet('/api/ops/roleRestApi/list?format=json&sid=' + this.getCookie("cookieSid")
          + "&page=" + pageNumber
          + "&size=" + this.size
          + "&roleName=" + this.value
          + "&status=" + this.auditStatus)
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
        });
        return datas;
      }
      ,
      //查询
      searchBtn()
      {
        this.currentPage1 = 1;
        this.dataRole = this.getDataR();
      }
      ,
      //添加/修改modal
      addModalOk()
      {
        if (this.formItem.roleName == "") {
          $("input[name='roleName']")
            .parents(".ivu-form-item")
            .addClass("ivu-form-item-error");
          this.$Message.error('请输入角色名!');
          this.addModal = true;
          return false;
        }
        if (this.formItem.xxCode == "") {
          $("input[name='roleName']")
            .parents(".ivu-form-item")
            .removeClass("ivu-form-item-error");
          $("input[name='xxCode']")
            .parents(".ivu-form-item").eq(0)
            .addClass("ivu-form-item-error");
          this.$Message.error('请输入编码!');
          this.addModal = true;
          return false;
        }
        if (this.formItem.selectModal.length == 0) {
          $("input[name='xxCode']")
            .parents(".ivu-form-item")
            .removeClass("ivu-form-item-error");
          $("[name='selectModal']")
            .parents(".ivu-form-item").eq(0)
            .addClass("ivu-form-item-error");
          this.$Message.error('请选择菜单!');
          this.addModal = true;
          return false;
        }
        var roleFormItem = [];
        if (this.formItem.selectModal.length > 0) {
          for (var i = 0; i < this.formItem.selectModal.length; i++) {
            var items = {};
            var id = this.formItem.selectModal[i].split(",")[0]
              , url = this.formItem.selectModal[i].split(",")[1];
            items.resourceId = id;
            items.resourceUrl = url;
            roleFormItem.push(items);
          }
          var dataJson = {
            "roleName": this.formItem.roleName   //角色名
            , "tag": this.formItem.xxCode         //角色标签，用于后台角色权限判断
            , "resources": roleFormItem
          }
        }
        if (!this.updateOrAdd) {
          dataJson.id = this.dataRole[this.updateIndex].id;
        }
        console.log(dataJson)
        $.ajax({
          url: HOST + "/api/ops/roleRestApi/add?format=json&sid=" + this.getCookie("cookieSid"),
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
        this.addModal = false;
        window.location.reload();
      }
      ,
      //添加/修改操作
      updateData(index)
      {
        var self = this;
        this.addModal = true;
        if (/^[0-9]+$/.test(index)) {
          this.formItem.roleName = this.dataRole[index].roleName;
          this.formItem.xxCode = this.dataRole[index].tag;
          this.updateOrAdd = false;
          this.updateIndex = index;
          var dataJson = {
            format: "json"
            , roleId: this.dataRole[index].id
            , sid: this.getCookie("cookieSid")
          }
          this.apiPost("/api/ops/roleResourceRestApi/list", this.qs.stringify(dataJson))
            .then(function (res) {
              if (res.code == 0) {
                if (res.data && res.data.length > 0) {
                  res.data.forEach(function (data) {
                    $("#" + data.id).prop("checked", true);
                    if (data.children && data.children.length > 0) {
                      data.children.forEach(function (child) {
                        $("#" + child.id).prop("checked", true);
                        self.formItem.selectModal.push(child.id + "," + child.url);
                      })
                    }
                    self.formItem.selectModal.push(data.id + "," + data.url);
                  })
                }
              }
            }).catch(function (e) {
            console.log(e);
          })

        } else {
          this.formItem.roleName = "";
          this.formItem.xxCode = "";
          this.updateOrAdd = true;
          $("input[type='checkbox']").prop("checked", false);
          this.formItem.selectModal = [];
        }
      }
      ,
      //获取新增菜单列表
      getMenuList()
      {
        var datas = [];
        var self = this;
        var dataJson = {
          format: "json"
//          ,parentId:"0"
          , sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/resourceRestApi/list", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              res.data.forEach(function (data) {
                if (data.status == 1) {
                  datas.push(data);
                }
              })
            } else {
              self.$Message.error(res.msg);
            }
          }).catch(function (e) {
          self.$Message.error(e);
        })
        return datas;
      }
      ,
      handleCheckAll(item)
      {
        var self = this;
        var checkAll = $("#" + item.id).prop("checked");
        var ids = item.id + "," + item.url;
        if (checkAll) {
          self.formItem.selectModal.push(ids);
          if (item.children && item.children.length > 0) {
            item.children.forEach(function (child) {
              var xIds = child.id + "," + child.url;
              $("#" + child.id).prop("checked", true);
              self.formItem.selectModal.push(xIds);
            })
          }
        } else {
          $("#" + item.id).siblings("div").find("input").prop("checked", false);
          self.formItem.selectModal.splice($.inArray(ids, self.formItem.selectModal), 1);
          if (item.children && item.children.length > 0) {
            item.children.forEach(function (child) {
              var xIds = child.id + "," + child.url;
              self.formItem.selectModal.splice($.inArray(xIds, self.formItem.selectModal), 1);
            })
          }
        }
      }
      ,
      checkAllGroupChange(data)
      {
        var self = this;
        var childCheck = $("#" + data.id).prop("checked");
        var ids = data.id + "," + data.url;
        var xIds = $("#" + data.parentId).attr("label");
        if (childCheck) {
          $("#" + data.parentId).prop("checked", true);
          self.formItem.selectModal.push(ids);
          self.formItem.selectModal.push(xIds);
        } else {
          var sum = $("#" + data.parentId).siblings().find("input[type='checkbox']").length, isFalse = false;
          for (var i = 0; i < sum; i++) {
            var input = $("#" + data.parentId).siblings().find("input[type='checkbox']").eq(i);
            if ($(input).prop("checked") == true) {
              isFalse = true;
            }
          }
          if (!isFalse) {
            $("#" + data.parentId).prop("checked", false);
            self.formItem.selectModal.splice($.inArray(xIds, self.formItem.selectModal), 1);
          } else {
            self.formItem.selectModal.splice($.inArray(ids, self.formItem.selectModal), 1);
          }
        }

      }
      ,
      //禁用、启用
      todoUnable(index)
      {
        var self = this;
        var isFalse = 0, html = "<div>您确定要停用该角色？</div>";
        if (this.dataRole[index].status == 0) {
          html = "<div>您确定要启用该角色？</div>";
          isFalse = 1;
        }
        this.$Modal.confirm({
          content: html,
          onOk: function () {
            xxInit();
          }
        })
        function xxInit() {
          var dataJson = {
            format: "json",
            id: self.dataRole[index].id,
            status: isFalse,
            sid: self.getCookie("cookieSid")
          }
          console.log(dataJson);
          self.apiPost("/api/ops/roleRestApi/update", self.qs.stringify(dataJson))
            .then(function (res) {
              console.log(res);
            }).catch(function (e) {
            console.log(e);
          })
          window.location.reload();
        }
      }
      ,
      //显示拥有者modal
      showOwner(index)
      {
        var xSelf = this;
        xSelf.ownerId = xSelf.dataRole[index].id;
        xSelf.forChildData = [];
        var xxDataJson = {
          format: "json"
          , roleId: xSelf.ownerId
          , sid: xSelf.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/roleUserRestApi/list/users", this.qs.stringify(xxDataJson)).then(function (res) {
          if (res.code == 0) {
            res.data.forEach(function (data) {
              xSelf.forChildData.push(data);
            })
          }
        }).catch(function (e) {
          console.log(e);
        });
        this.showOwnerModal = true;
      }
      ,
      removeChildData()
      {
        var oSelf = this;
        this.$Modal.confirm({
          title: '移除',
          content: `<div>您确定要移除该用户吗？</div>`,
          onOk: function () {
            var oDataJson = {
              format: "json"
              , roleId: oSelf.ownerId//角色id
              , userId: oSelf.forChildData[oSelf.removeIndex].id//用户id
              , sid: oSelf.getCookie("cookieSid")
            }
            oSelf.apiPost("/api/ops/roleUserRestApi/delete/roleUser", oSelf.qs.stringify(oDataJson))
              .then(function (res) {
                if (res.code == 0) {
                  this.$Message.info('移除成功！');
                  oSelf.showOwnerModal = false;
                }
              }).catch(function (e) {
              console.log(e);
            })
            window.location.reload();
          }
        });
      }
      ,
      handleCurrentChange(val) {
        this.changePage(val);
      },
      todoWithPage(){
        if (!this.page) {//如果当前页为空则设置为1
          this.page = 0;
        }
        if (!this.size) {//如果分页大小为空则设置为10
          this.size = 10;
        }
        this.page = parseInt(this.page);//当前页数
      },
      changePage(page){
        this.page = parseInt(page - 1);
        this.data1 = this.getDataU(1);
      }
    }
    ,
    mounted()
    {
      var self = this;
      window.addEventListener('keyup', function (e) {
        if (e.keyCode === 13) {
          self.searchBtn();
        }
      })
    }

    ,
    mixins: [http]
  }
</script>
<style scoped>

</style>
