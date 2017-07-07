<template>
  <div class="oddIndent">
    <!--title-->
    <div class="title clearfix">
      <div class="left">
        <Select v-model="condition" style="width:120px;">
          <Option v-for="item in conditionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-if="condition===0" v-model="userPhone" placeholder="请输入手机号" style="width: 180px;"></Input>
        <Input v-else v-model="userName" placeholder="请输入姓名" style="width: 180px;"></Input>
        <Select v-model="auditStatus" style="width:120px;">
          <Option v-for="item in auditStatusList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Select v-model="sheng" style="width:120px;">
          <Option v-for="item in shengList" :value="item.areaCode" :key="item">{{ item.areaName }}</Option>
        </Select>
        <label>创建日期</label>
        <div class="Query clearfix" :style="query">
          <Date-picker id="startDate" v-model="startTime" type="date" :options="startDate" placeholder="选择日期"
                       style="width: 140px;display: inline-block"></Date-picker>
          <label>~</label>
          <Date-picker type="date" :options="endDate" placeholder="选择日期" style="width: 140px;display: inline-block"
                       v-model="endTime"></Date-picker>
        </div>
      </div>
      <div cl="rightBtn">
        <Button type="success" class="search" @click="searchData()">查询</Button>
        <Button type="primary" @click="batchAll">批量审核</Button>
        <Button type="primary" @click="exportData">导出</Button>
      </div>
    </div>
    <div class="table">
      <Table border :columns="columns4" :data="data1" ref="table" size="small" highlight-row
             @on-selection-change="selectItem"></Table>
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
    <!--查看-->
    <Modal v-model="examine" title="查看详情" class="modal modalW" style="padding: 10px;">
      <h4><span>订单信息</span></h4>
      <Table class="tabord" border :columns="examineHeader" :data="examineHData" ref="table" size="small"></Table>
      <Table class="tabord" border :columns="examinebdy" :data="examineBData" ref="table" size="small"></Table>
      <h4><span>审核信息</span></h4>
      <Table class="tabord" border :columns="audit" :data="auditData" ref="table" size="small"></Table>
    </Modal>
    <!--拒绝-->
    <Modal v-model="refuse" title="拒绝提示" class="modal" @on-ok="getStatusData(refuseIndex)">
      <textarea placeholder="请输入拒绝原因" v-model="remark"></textarea>
    </Modal>
  </div>
</template>
<script>
  import http from '../../assets/js/http'

  export default {
    name: 'oddIndent',
    data () {
      return {
        refuse: false,
        examine: false,
        conditionList: this.$store.state.manage.conditionList,
        condition: '',
        postName: '',
        userPhone: ''//手机号
        , name: ''//姓名
        , provinceId: ""//省份id
        , startTime: ""//开始时间
        , endTime: ""//结束时间
        , userName: '',
        auditStatus: '',//审核状态
        auditStatusList: this.$store.state.manage.auditStatusList,
        taskDescription: '',
        shengList: this.getCityList(),
        sheng: 0,
        columns4: [
          {
            type: 'selection',
            width: 50,
            align: 'center'
          },
          {
            type: 'index',
            width: 56,
            align: 'center'
          },
          {
            title: '零工编号',
            key: 'id'
          },
          {
            title: '零工名',
            key: 'postName',
            width: 74,
          },
          {
            title: '零工描述',
            key: 'XtaskDescription',
            render(row, column, index){
              return `<span title="${row.taskDescription}">${row.XtaskDescription}</span>`
            }
          },
          {
            title: '区域',
            width: 76,
            key: 'provinceName'
          },
          {
            title: '来源',
            width: 76,
            key: 'client'
          },
          {
            title: '发布人',
            key: 'userName',
            render(row, column, index){
              return `<span @click="toShowDetail(${index})">${row.userName}<br/>${row.userPhone}</span>`
            }
          },
          {
            title: '发布时间',
            key: 'createTime'
          },
          {
            title: '审核人',
            width: 76,
            key: 'auditUserName'
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
            width: 200,
            render (row, column, index) {
              return `<i-button v-if="${row.isAStatus}==0" type="text" size="small" @click="todoAgree(${index})">通过</i-button>
                      <i-button v-else type="text" size="small" @click="reject(${index})">拒绝</i-button>
                      <i-button type="text" size="small" @click="todoDetail(${index})">查看</i-button>`;
              //<i-button v-if="${row.isAStatus}==1 || ${row.isAStatus}==2 || ${row.isAStatus}==0" type="text" size="small" @click="todoAgree(${index})">屏蔽</i-button>
            }
          }
        ],
        data1: this.getOrderData(),
        examineHeader: [
          {
            title: '手机号',
            key: 'userPhone'
          },
          {
            title: '发布时间',
            key: 'createTime'
          },
          {
            title: '姓名/企业',
            key: 'userName'
          },
          {
            title: '时间分类',
            key: 'demandType'
          },
          {
            title: '零工名',
            key: 'postName'
          },
          {
            title: '零工类型',
            key: 'postTypeName'
          },
          {
            title: '零工描述',
            key: 'taskDescription',
            width: 260
          }
        ],
        examineHData: [],
        examinebdy: [
          {
            title: '人数',
            key: 'recruitNumber'
          },
          {
            title: '薪酬(元)',
            key: 'totalPrice'
          },
          {
            title: '联系人',
            key: 'contact'
          },
          {
            title: '性别',
            key: 'sex'
          },
          {
            title: '开工日期',
            key: 'startYear'
          },
          {
            title: '开工时间',
            key: 'startTime'
          },
          {
            title: '地址',
            key: 'workAddress',
            width: 260
          }
        ],
        examineBData: [],
        contactTelePhone: "",
        audit: [
          {
            title: '零工订单状态',
            key: 'auditStatus'
          },
          {
            title: '审核人',
            key: 'auditUserName'
          },
          {
            title: '审核时间',
            key: 'modifyTime'
          }
        ],
        auditData: [],
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
        },
        //拒绝弹框
        remark: "",
        refuseIndex: 0,
        isStatusParam: 2,
        currentPage: 1,
        pageTotal: 0,
        page: 0,
        size: 10,
      }
    },
    methods: {
      /*列表查询*/
      getOrderData: function (page) {
        var datas = [];
        var self = this;
        this.todoWithPage();
        var dataJson = {
          userPhone: this.userPhone//手机号
          , name: this.userName//姓名
          , auditStatus: this.auditStatus//审核状态
          , provinceId: this.sheng//省份id
          , startTime: this.getListTime(this.startTime)//开始时间
          , endTime: this.getListTime(this.endTime)//结束时间
          , page: 0
          , size: this.size
          , sid: this.getCookie("cookieSid")
        }
        if (page) {
          dataJson.page = this.page;
        }
        this.apiPost("/api/ops/jobTaskRestApi/queryJobTask", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              self.pageTotal = res.total;
              res.data.forEach(function (data) {
                data.createTime = self.formatDateTime(data.createTime);
                data.isAStatus = data.auditStatus;
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
                if (data.taskDescription != undefined) {
                  if (data.taskDescription.length > 6) {
                    data.XtaskDescription = data.taskDescription.substr(0, 5) + "...";
                  } else {
                    data.XtaskDescription = data.xRemark;
                  }
                }
                else {
                  data.XtaskDescription = "";
                  data.taskDescription = "";
                }
                datas.push(data);
              })
            }
          }).catch(function (e) {
          console.log(e);
        })
        return datas;
      },
      searchData(){
        this.currentPage = 1;
        this.data1 = this.getOrderData();
      },
      /*详情查看*/
      todoDetail: function (index) {
        var self = this;
        this.examineHData = [];
        this.examineBData = [];
        this.auditData = [];
        var dataJson = {
          jobTaskId: this.data1[index].id,
          sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/jobTaskRestApi/findJobTaskById?format=json", this.qs.stringify(dataJson)).then(function (res) {
          res.data.forEach(function (data) {
            data.createTime = self.formatDateTime(data.createTime);
            data.startTime = self.formatDateTime(data.startTime).substr(10, 13);
            data.modifyTime = self.formatDateTime(data.modifyTime);
            data.startYear = data.startYear + '-' + data.startMonth + '-' + data.startDay;
            data.contact = data.contact + ' ' + data.contactTelePhone;
            switch (data.sex) {
              case 1:
                data.sex = "男";
                break;
              case 2:
                data.sex = "女";
                break;
              case 3:
                data.sex = "男女不限";
                break;
            }
            ;
            switch (data.auditStatus) {
              case 0:
                data.auditStatus = "已拒绝";
                break;
              case 1:
                data.auditStatus = "已审核";
                break;
              case 2:
                data.auditStatus = "审核中";
                break;
            }
            switch (data.demandType) {
              // 1.工作日,2.双休日,3.计件
              case 1:
                data.demandType = "工作日";
                break;
              case 2:
                data.demandType = "双休日";
                break;
              case 3:
                data.demandType = "计件";
                break;
            }
            self.examineHData.push(data);
            self.examineBData.push(data);
            self.auditData.push(data);
          })
        }).catch(function (e) {
          console.log(e);
        })
        this.examine = true;
      },
      /*状态修改（拒绝通过）*/
      reject(index){//拒绝
        this.refuse = true;
        this.refuseIndex = index;
        this.isStatusParam = 0;
      },
      /*通过*/
      todoAgree(index, num){
        this.remark = "";
        var self = this, html = "<div>确定通过？</div>";
        this.isStatusParam = 1;
        //console.log(this.isStatusParam)
        /*if (num) {
         html = "<div>您确定屏蔽该零工订单？</div>"
         + "<div>屏蔽后，只有发布人能看到该零工订单</div>";
         this.isStatusParam = 0;
         }*/
        this.$Modal.confirm({
          content: html,
          onOk: function () {
            self.getStatusData(index);
          }
        })
      },
      getStatusData(index){//公用状态数据
        var self = this;
        var dataJson = {
          format: 'json'
          , status: this.isStatusParam//状态
          , auditRemark: this.remark//审核备注
          , sid: this.getCookie('cookieSid')
        }
        if (this.multipleSelection.length == 0) {
          dataJson.jobTaskIds = this.data1[index].id;
        } else {
          var ids = "";
          this.multipleSelection.forEach(function (data) {
            ids += data.id + ","
          })
          dataJson.jobTaskIds = ids.substr(0, ids.length - 1);
          this.isStatusParam = 1;
        }
        dataJson.status = this.isStatusParam;
        this.apiPost('/api/ops/jobTaskRestApi/updateJobTask', this.qs.stringify(dataJson))
          .then(function (data) {
            console.log(data);
          }).catch(function (e) {
          console.log(e);
        })
        window.location.reload();
      },
      /*批量审核*/
      batchAll(){
        var self = this;
        this.remark = "";
        if (this.multipleSelection.length > 0) {
          this.$Modal.confirm({
            content: "<div>您确定批量审核？</div>",
            onOk: function () {
              self.getStatusData();
            }
          })
        } else {
          this.$Message.error('请选择需要审核数据！');
        }
      },
      /*城市查询*/
      getCityList(){
        var dataJson = {
          format: "json",
          parentId: 0,
          areaLevel: 1,
          sid: this.getCookie("cookieSid")
        }
        var datas = [];
        this.apiPost("/api/ops/districtAreaRest/findArearByParentId", this.qs.stringify(dataJson))
          .then(function (res) {
            res.data.forEach(function (data) {
              datas.push(data);
            })
          }).catch(function (e) {
          console.log(e);
        })
        return datas;
      },
      /*数据导出*/
      exportData(){
        window.location.href = HOST + '/api/ops/jobTaskRestApi/exportJobTask?format=json&sid=' + this.getCookie('cookieSid')
          + '&userPhone=' + this.userPhone//手机号
          + '&name=' + this.userName//姓名
          + '&auditStatus=' + this.auditStatus//审核状态
          + '&provinceId=' + ''//省份id
          + '&startTime=' + this.getListTime(this.startTime)//开始时间
          + '&endTime=' +  this.getListTime(this.endTime)//结束时间
          /*+ '&size=' + this.size
          + '&page=' + this.page*/
      },
      /*个人信息详情*/
      toShowDetail(index){
        /*  this.$Modal.error({
              content:`内容待开发！`
          })*/
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
        this.page = parseInt(page - 1);
        this.data1 = this.getOrderData(1);
      },
      selectItem(val) {
        this.multipleSelection = val;
      },
      show (index) {
        this.$Modal.confirm({
          title: '屏蔽提示',
          content: `
            <p style="font-size: 16px;margin: 10px 0;">您确定屏蔽该零工订单？</p>
            <p style="color:#666;">对话框内容屏蔽后，只有发布人能看到该零工订单。</p>
           `
        })
      },
      ok(index){
        this.$Modal.confirm({
          title: '通过提示',
          content: `
            <p style="font-size: 16px;margin: 10px 0;">您确定审核通过？</p>
          `
        });
      },
      no(index){
        this.$Modal.confirm({
          title: '通过提示',
          content: `
            <p style="font-size: 16px;margin: 10px 0;">您确定屏蔽该零工？</p>
            <p style="color:#666;">屏蔽后，只有发布人能看到该零工</p>
          `
        });
      }
    },
    mixins: [http]
  }
</script>
<style>
  .oddIndent {
  }

  .oddIndent .green {
    color: green;
  }

  .title {
    width: 99%;
    background-color: #f5f7f9;
    border: 1px solid #e3e8ee;
    padding: 15px 10px;
    margin-bottom: 20px;
  }

  .title .left {
    float: left;
    /*width: 1050px;*/
    padding: 0;
  }

  .title .rightBtn {
    float: left;
    padding-top: 2px;
  }

  .btnSize {
    height: 34px;
    padding: 0 15px;
  }
  .table{
    width: 99%;
  }
  /*查看*/
  .modalW .ivu-modal {
    top: 52px;
  }

  .modalW .ivu-modal .ivu-modal-body {
    padding: 20px 30px;
  }

  .modalW .ivu-modal-wrap .ivu-modal {
    width: 70% !important;
  }

  .modalW .ivu-modal-wrap .ivu-modal .ivu-table-header table, .modalW .ivu-modal-wrap .ivu-modal .ivu-table-body table {
    width: 100% !important;
  }

  .modalW .tabord {
    margin: 10px 0 20px;
  }

  .modalW h4 {
    border-bottom: 1px solid #18A689;
    font-weight: 100;
    font-size: 14px;
    margin: 0px auto;
  }

  .modalW h4 span {
    background-color: #18A689;
    display: inline-block;
    padding: 5px;
    color: #fff;
  }

  .operation {
    width: 182px;
    margin: 3% auto 1%;
  }

  .Query label {
    height: 34px;
    line-height: 34px;
    display: inline-block;
    padding: 0 5px;
  }

  .Query button {
    margin-left: 5px;
    height: 32px;
  }

  .Query .search {
    background-color: #18A689;
    border-color: #18A689;
  }

  .Query .ivu-row {
    float: left;
  }
</style>
