<template>
  <div class="evaluateInfo">
    <!--title-->
    <div class="title clearfix">
      <div class="left">
        <Select v-model="condition" style="width:120px;">
          <Option v-for="item in conditionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-if="condition===0" v-model="phone" placeholder="请输入手机号" style="width:180px;"></Input>
        <Input v-else-if="condition===1" v-model="name" placeholder="请输入姓名" style="width:180px;"></Input>
        <Input v-else v-model="orderId" placeholder="请输入零工订单编号" style="width:180px;"></Input>
        <Select v-model="status" style="width:120px;">
          <Option v-for="item in auditStatusList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <label>发布日期</label>
        <div class="Query clearfix" :style="query">
          <Date-picker id="startDate" v-model="startTime" type="date" :options="startDate" placeholder="选择日期"
                       style="width: 140px;display: inline-block"></Date-picker>
          <label>~</label>
          <Date-picker type="date" :options="endDate" placeholder="选择日期" style="width: 140px;display: inline-block"
                       v-model="endTime"></Date-picker>
        </div>
      </div>
      <div class="rightBut">
        <Button type="success" class="search" @click="search">查询</Button>
        &nbsp;&nbsp;
        <Button type="primary" class="btnSize" @click="batchVerify">批量审核</Button>
      </div>
    </div>
    <div class="table">
      <Table border :columns="columns4" :data="data1" ref="table" @on-selection-change="selectItem"></Table>
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
  </div>
</template>
<script>
  import http from "../../assets/js/http"
  export default {
    name: 'evaluateInfo',
    data () {
      return {
        condition: '',
        conditionList: this.$store.state.manage.evaluate.conditionList,
        phone: '',
        name: '',
        orderId: '',
        value: '',
        startTime: '',
        endTime: '',
        auditStatusList: this.$store.state.manage.auditStatusList,
        status: '',
        columns4: [
          {
            type: 'selection',
            width: 50,
            align: 'center'
          },
          {
            type: 'index',
            width: 40,
            align: 'center'
          },
          {
            title: '评价时间',
            key: 'createTime'
          },
          {
            title: '零工编号',
            key: 'orderBusinessNumber'
          },
          {
            title: '评价人',
            key: 'appraiserName',
           render (row,column,index) {
           return `<div size="small" class="xsuccess">${row.appraiserPhone}</div><div size="small">${row.appraiserName}</div>`;
           },
            width:120
          },
          {
            title: '被评人',
            key: 'accepterName',
            render (row,column,index) {
              return `<div size="small" class="xsuccess">${row.accepterPhone}</div><div size="small">${row.accepterName}</div>`;
            },
            width:120
          },
          {
            title: '评价内容',
            key: 'XevaluateContent',
            render(row, column, index){
              return `<span  style="cursor: pointer" title="${row.evaluateContent}">${row.XevaluateContent}</span>`
            }
          },
          {
            title: '星级',
            width: 76,
            key: 'evaluateLevel'
          },
          {
            title: '审核人',
            width: 76,
            key: 'auditUserName'
          }, {
            title: '审核时间',
            key: 'modifyTime'
          },
          {
            title: '审核状态',
            width: 90,
            key: 'auditStatus',
            render(row, column, index){
              return `<span v-if="${row.isAStatus}==1" class="xsuccess">${row.auditStatus}</span>
                      <span v-if="${row.isAStatus}==2" class="xfail">${row.auditStatus}</span>
                      <span v-if="${row.isAStatus}==0">${row.auditStatus}</span>
                      `
            }
          },
          {
            title: '操作',
            key: 'operation',
            width: 118,
            render (row, column, index) {
              return `<i-button v-if="${row.isAStatus}==0" type="text" size="small" @click="showShield(${index})">通过</i-button>
                      <i-button v-else type="text" size="small" @click="showShield(${index})">屏蔽</i-button>`;
            }
          }
        ],
        data1: this.getEvaluateData(),
        batch: false,
        multipleSelection: [],
        query: {
          width: '315px',
          display: 'inline-block'
        },
        startDate: {},
        endDate: {
          disabledDate (date) {
            return date && date.valueOf() < new Date($("#startDate").find("input").val()).getTime() - 86400000;
          }
        }
        , orderEvaluateIds: '',
        auditRemark: ''
        , currentPage: 1
        , pageTotal: 0
        , size: 10//
        , page: 0//
      }
    },
    methods: {
      /*数据列表*/
      getEvaluateData(page){
        var self = this;
        var datas = [];
        this.todoWithPage();
        var dataJson = {
          phone: this.phone//电话
          , name: this.name//姓名
          , status: this.status//状态
          , startTime: this.getListTime(this.startTime)//开始时间
          , endTime: this.getListTime(this.endTime)//结束时间
          , orderId: this.orderId//订单id
          , size: this.size//
          , page: 0
          , sid: this.getCookie("cookieSid")
        };
        if (page) {
          dataJson.page = this.page;
        }
        this.apiPost('/api/ops/orderEvaluateRestApi/findAllEvaluate?format=json', this.qs.stringify(dataJson)).then(function (res) {
          if (res.code == 0) {
            self.pageTotal=res.total;
            res.data.forEach(function (data) {
              data.isAStatus = data.auditStatus;
              data.createTime = self.formatDateTime(data.createTime);
              data.modifyTime = self.formatDateTime(data.modifyTime);
              switch (data.evaluateType) {
                case 0:
                  data.evaluateType = "雇主评价雇员";
                  break;
                case 1:
                  data.evaluateType = "雇员评价雇主";
                  break;
              }
              switch (data.auditStatus) {
                case 0:
                  data.auditStatus = "已拒绝";
                  break;
                case 1:
                  data.auditStatus = "已审核";
                  break;
                case 2:
                  data.auditStatus = "待审核";
                  break;
              }
              if (data.evaluateContent != undefined) {
                if (data.evaluateContent.length > 6) {
                  data.XevaluateContent = data.evaluateContent.substr(0, 5) + "...";
                } else {
                  data.XevaluateContent = data.evaluateContent;
                }
              } else {
                data.XevaluateContent = "";
                data.evaluateContent = "";
              }
              /*
               if (data.evaluateContent.length > 6) {
               data.addressSub = data.evaluateContent.substr(0, 6) + "..."
               } else {
               data.addressSub = data.evaluateContent
               }*/
              datas.push(data);
            })
          } else {
            console.log(res.msg);
          }

        }).catch(function (e) {
          console.log(e);
        });
        return datas;
      },
      /*查询*/
      search(){
          this.currentPage=1;
        this.data1 = this.getEvaluateData();
      },
      selectItem(val) {//checked变化时
        this.multipleSelection = val
      },
      /*屏蔽*/
      showShield(index){
        var self = this;
        var html = "<p style=\"font-size: 16px;margin: 10px 0;\">您确定屏蔽该评论？</p>"
          + "<p style=\"color:#666;\">屏蔽后，只有评论人能看到该评论。</p>";
        if (this.data1[index].isAStatus == 0) {
          html = "您确定通过该评论？";
        }
        this.$Modal.confirm({
          content: html,
          onOk: function () {
            self.todoStatus(index);
          }
        })
      },
      /*批量审核*/
      batchVerify: function () {
        if (this.multipleSelection.length > 0) {
          var self = this;
          this.batch = true;
          this.$Modal.confirm({
            title: '批量审核',
            content: `<p style="font-size: 16px;margin: 10px 0;">您确定批量审核？</p>`,
            onOk: function () {
              self.todoStatus();
            }
          })
        } else {
          this.$Message.error('请选择评价信息');
        }
      },
      /*通过,拒绝,批量操作*/
      todoStatus(index){
        var dataJson = {
          format: "json"
          , sid: this.getCookie("cookieSid")
        }, ids = "";
        if (/^[0-9]+$/.test(index)) {
          dataJson.orderEvaluateIds = this.data1[index].id//订单评价id数组
          if (this.data1[index].isAStatus == 1 || this.data1[index].isAStatus == 2) {
            dataJson.status = 0;
          } else {
            dataJson.auditRemark = "";
            dataJson.status = 1;
          }
        } else {
          this.multipleSelection.forEach(function (data) {
            ids += data.id + ",";
          })
          dataJson.orderEvaluateIds = ids.substr(0, ids.length - 1);
          dataJson.status = 1;
        }
        this.apiPost("/api/ops/orderEvaluateRestApi/updateAuditStatus", this.qs.stringify(dataJson))
          .then(function (res) {
            console.log(res);
          }).catch(function (e) {
          this.$Message.error(e);
        })
        window.location.reload();
      },
      /*分页*/
      todoWithPage(){
        if (!this.page) {//如果当前页为空则设置为1
          this.page = 0;
        }
        if (!this.size) {//如果分页大小为空则设置为10
          this.size = 10;
        }
      },
      handleCurrentChange(val){
        this.changePage(val);
      },
      changePage(page){
       this.page=parseInt(page-1);
        this.data1 = this.getEvaluateData(this.minId);
      }
    },
    mixins: [http]

  }
</script>
<style>
  .evaluateInfo .left {
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
</style>
