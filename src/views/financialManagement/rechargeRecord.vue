<template>
  <div class="rechargeRecord">
    <!--title-->
    <div class="title clearfix">
      <div class="">
        <Select v-model="searchType" style="width:120px">
          <Option v-for="item in rechargeConditionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-model="value" placeholder="请输入..." style="width:180px"></Input>
        <Select v-model="auditStatus" style="width:120px">
          <Option v-for="item in auditStatusList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Select v-model="status" style="width:120px">
          <Option v-for="item in statusTypeList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Select v-model="rechargeType" style="width:120px">
          <Option v-for="item in rechargeTypeList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Button type="success" class="search" @click="search">查询</Button>
        &nbsp;&nbsp;
        <Button type="primary" class="btnSize" @click="todoUnabled">批量审核</Button>
      </div>
    </div>
    <div class="table">
      <Table border :columns="columns4" :data="data1" ref="table"
             @on-selection-change="selectItem"></Table>
    </div>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <!--<Page :total="pageTotal*10" :current="1" @on-change="changePage"></Page>-->
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-size="size"
          layout="prev, pager, next"
          :total="pageTotal">
        </el-pagination>
      </div>
    </div>
    <!--拒绝 refuse-->
    <Modal v-model="rechargeRefuseModal" width="460">
      <p slot="header">
        <span>拒绝</span>
      </p>
      <Form :model="refuseForm" style="margin: 0px auto">
        <Form-item>
          <Input name="rechargeDesc" v-model="refuseForm.rechargeDesc" type="textarea"
                 :autosize="{minRows:4,maxRows: 8}" placeholder="请输入您的拒绝原因"></Input>
        </Form-item>
        <Form-item>
          <Button type="primary" size="large" long @click="refuseSubmit">确定</Button>
        </Form-item>
      </Form>
      <div slot="footer" class="cancelFooter"></div>
    </Modal>
  </div>

</template>
<script>
  import http from '../../assets/js/http'
  import jq from 'jquery'

  export default {
    name: 'rechargeRecord',
    mounted: function () {
      $(".cancelFooter").parent(".ivu-modal-footer").css({
        border: 0,
        padding: 0
      })
    },
    data () {
      return {
        rechargeConditionList: this.$store.state.rechargeOrange.rechargeConditionList,
        searchType: '',
        value: '',
        auditStatusList: this.$store.state.rechargeOrange.auditStatusList,
        auditStatus: '',
        statusTypeList: this.$store.state.rechargeRecord.statusList,
        status: '',
        rechargeTypeList: this.$store.state.rechargeRecord.rechargeTypeList,
        rechargeType: '',
        columns4: [
          {
            type: 'selection',
            width: 50,
            align: 'center',
            fixed: "left"
          },
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: '手机号',
            key: 'payeePhone',
            width: 160,
            render(row, column, index){
              return `<span @child-tell-msg="toShowDetail(${index},${row.payeeType})">${row.payeePhone}</span>`
            }
          },
          {
            title: '名称',
            key: 'payeeName',
            width: 200
          },
          {
            title: '用户类型',
            key: 'xPayeeType',
            width: 90
          },
          {
            title: '金橙数',
            key: 'amount',
            width: 90
          },
          {
            title: '类型',
            key: 'XrechargeType',
            width: 80
          },
          {
            title: '状态',
            key: 'xStatus',
            width: 80,
            render(row,column,index){
                return `<span v-if="${row.status}==0" class="xfail">${row.xStatus}</span>
                        <span v-else-if="${row.status}==2" class="xsuccess">${row.xStatus}</span>
                        <span v-else>${row.xStatus}</span>`
            }
          },
          {
            title: '代充人',
            key: 'agentUserName',
            width: 160
          },
          {
            title: '充值时间',
            key: 'agentTime',
            width: 160
          }, {
            title: '审核人',
            key: 'auditUserName',
            width: 160
          },
          {
            title: '审核时间',
            key: 'auditTime',
            width: 160
          },
          {
            title: '备注',
            width: 90,
            key: 'remark',
            render(row, column, index){
              return `<span title="${row.remark}">${row.xRemark}</span>`
            }

          },
          {
            title: '操作',
            key: 'operation',
            width: 118,
            render (row, column, index) {
              return `<i-button type="text" v-if="${row.status}==0||${row.status}==1" size="small" @click="todoUnabled(${index})">确认</i-button>
                      <i-button type="text" v-if="${row.status}==0||${row.status}==1" size="small" @click="openRefuseModal(${index})">拒绝</i-button>`;
            },
            fixed: "right"
          }
        ],
        data1: this.getRechargeRecordData(),
        multipleSelection: [],
        rechargeRefuseModal: false,
        refuseForm: {
          rechargeDesc: ""
        },
        refuseIndex: 0,
        currentPage: 1,
        pageTotal: 0,
        page: 0,
        size: 20,
        childWorlds:[]
      }
    },
    methods: {
      midConvert(data){
        data.agentTime = this.formatDateTime(data.agentTime);
        data.auditTime = this.formatDateTime(data.auditTime);
        switch (data.payeeType) {
          case 1:
            data.xPayeeType = "个人";
            break;
          case 2:
            data.xPayeeType = "企业";
            break;
          case 3:
            data.xPayeeType = "代理商";
            break;
        }
        switch (data.status) {
          case 0:
            data.xStatus = "待审核";
            break;
          case 1:
            data.xStatus = "处理中";
            break;
          case 2:
            data.xStatus = "已通过";
            break;
          case 3:
            data.xStatus = "已拒绝";
            break;
          case 4:
            data.xStatus = "取消";
            break;
        }
        switch (data.rechargeType) {
          case 1:
            data.XrechargeType = "餐补";
            break;
          case 2:
            data.XrechargeType = "活动";
            break;
        }
      },
      getRechargeRecordData: function (index) {
        var datas = [], self = this;
        this.todoWithPage();
        var dataJson = {
          format: "json"
          , searchType: this.searchType    //条件类型 （1：手机号、2：姓名、3：企业名）
          , searchContent: this.value  //条件内容
          , userType: this.auditStatus       //用户类型 1：个人 2企业 3代理商
          , status: this.status
          , rechargeType: this.rechargeType
          , pageNumber: 0  //页码
          , pageSize: this.size      //大小
          , minId: 0          //最小Id
          , sid: this.getCookie("cookieSid")
        }
        if (index) {
          dataJson.pageNumber = this.page;
        }
        this.apiPost('/api/ops/rechargeRest/list', this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              self.pageTotal = res.total;
              res.data.forEach(function (data) {
                self.midConvert(data);
                data.xRemark=data.remark;
                if(data.remark&&data.remark.length>6){
                  data.xRemark = data.remark.substr(0, 5) + "...";
                }
                datas.push(data);
              });
            } else {
              self.$Message.error(res.msg);
            }

          }).catch(function (e) {
          self.$Message.error(e);
        })
        return datas;
      },
      selectItem(vle) {
        this.multipleSelection = vle;
      },
      search(){
        this.currentPage = 1;
        this.data1 = this.getRechargeRecordData();
      },
      //拒绝
      openRefuseModal(index){
        this.rechargeRefuseModal = true;
        this.refuseForm.rechargeDesc = '';
        this.refuseIndex = index;
      },
      refuseSubmit(){
        var chian = /^[\u2E80-\u9FFF]+$/, self = this;
        if (this.refuseForm.rechargeDesc == "") {
          this.$Message.error('请输入拒绝原因');
        } else if (!chian) {
          this.$Modal.error({
            content: `<div>请输入中文</div>`
          });
        } else {
          this.rechargeRefuseModal = false;
        }
        var dataJson = {
          format: "json"
          , id: this.data1[this.refuseIndex].id
          , auditReason: this.refuseForm.rechargeDesc
          , sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/rechargeRest/refuse", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              window.location.reload();
            } else {
              console.log(res.msg);
            }
          }).catch(function (e) {
          console.log(e);
        })
      },
      todoWithPage(){
        if (!this.page) {//如果当前页为空则设置为1
          this.page = 0;
        }
        if (!this.size) {//如果分页大小为空则设置为10
          this.size = 20;
        }
      },
      handleCurrentChange(val) {
        this.currentPage = val;
        this.changePage(val);
      },
      changePage(page){
        this.page = parseInt(page - 1);
        this.data1 = this.getRechargeRecordData(1);
      },
      //同意，批量审核
      todoUnabled(index){
        var self = this, ids = "", html = "<div>您确认已核对橙子数及用户信息？</div><div>确认后橙子直接到账</div>";

        var dataJson = {
          format: "json"
          , sid: self.getCookie("cookieSid")
        }

        if (/^[0-9]+$/.test(index)) {
          dataJson.ids = self.data1[index].id;
        } else {
          html = "<p>您确认已批量核对橙子数及用户信息？</p><p>确认后橙子直接到账</p>";
          if (this.multipleSelection.length == 0) {
            this.$Modal.error({
              content: `<div>请选择待审核的充值记录</div>`
            })
          } else {
            this.multipleSelection.forEach(function (data) {
              ids += data.id + ",";
            })
            ids = ids.substr(0, ids.length - 1);
            dataJson.ids = ids;
          }
        }
        this.$Modal.confirm({
          content: html,
          onOk: function () {
            init(dataJson)
          }
        })
        function init(data) {
          self.apiPost("/api/ops/rechargeRest/pass", self.qs.stringify(data))
            .then(function (res) {
              if (res.code != 0) {
                console.log(res.msg);
              }
            }).catch(function (e) {
            console.log(e);
          })
          window.location.reload();
        }
      },
      toShowDetail(index, status){
        var self = this;
        self.companyHData = [];
        self.personalHData = [];
        self.agentHData = [];
        var dataJson = {
          format: "json",
          sid: this.getCookie("cookieSid")
        }
        if (status == 1) {//个人信息
          dataJson.userId = this.data1[index].payeeId;
          this.apiPost("/api/ops/accountInformationRestApi/findPersonalUserDetail", this.qs.stringify(dataJson))
            .then(function (res) {
              if (res.code == 0) {
                res.data.forEach(function (data) {
                  self.personalHData.push(data);
                })
              } else {
                console.log(res.msg);
              }
            }).catch(function (e) {
            console.log(e);
          })
        }
        if (status == 2) {//企业信息
          dataJson.userId = this.data1[index].payeeId;
          this.apiPost("/api/ops/accountInformationRestApi/findEnterpriseUserDetail", this.qs.stringify(dataJson))
            .then(function (res) {
              if (res.code == 0) {
                res.data.forEach(function (data) {
                  self.companyHData.push(data);
                })
              } else {
                console.log(res.msg);
              }
            }).catch(function (e) {
            console.log(e);
          })
        }
        if (status == 3) {//代理商信息
          dataJson.enterpriseId = this.data1[index].payeeId;
          this.apiPost("/api/ops/accountInformationRestApi/findEnterpriseAgentDetail", this.qs.stringify(dataJson))
            .then(function (res) {
              if (res.code == 0) {
                res.data.forEach(function (data) {
                  self.midConvert(data);
                  self.agentHData.push(data);
                })
              } else {
                console.log(res.msg);
              }
            }).catch(function (e) {
            console.log(e);
          })
        }
      }
    },
    events: {//主要针对$dispatch事件
      'child-tell-msg'(msg){
        this.childWorlds = msg;
      }
    },
    mixins: [http]

  }
</script>
<style>
  .rechargeRecord .left {
    width: 800px;
  }

  /*弹窗*/
  .modal .ivu-modal-body, .batch .ivu-modal-body {
    padding: 40px;
  }

  .modal p, .batch p {
    height: 30px;
    line-height: 30px;
    font-size: 16px;
  }

  .modal p:last-child {
    font-size: 14px;
    color: #aaa;
  }

  /*
  if (this.refuseForm.rechargeDesc == "") {
    this.$Message.error('请输入您的拒绝原因!');
    jq("[name=\"rechargeDesc\"]").parent().addClass("ivu-form-item-error");
  } else {
    jq("[name=\"rechargeDesc\"]").parent().removeClass("ivu-form-item-error");
    this.rechargeRefuseModal = false;
  }
  */
</style>
