<template>
  <div class="orangeDetails">
    <!--title-->
    <div class="title clearfix">
      <div class="left">
        <Select v-model="condition" style="width:120px">
          <Option v-for="item in conditionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-model="value" placeholder="请输入..." style="width:180px"></Input>
        <Select v-model="meansTransaction" style="width:120px">
          <Option v-for="item in meansTransactionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <!--  <Select v-model="OwnedPlatform" style="width:120px">
            <Option v-for="item in OwnedPlatformList" :value="item.value" :key="item">{{ item.label }}</Option>
          </Select>-->
        <label>创建日期</label>
        <div class="Query clearfix" :style="query">
          <Date-picker id="startDate" v-model="startTime" type="date" :options="startDate" placeholder="选择日期"
                       style="width: 140px;display: inline-block"></Date-picker>
          <label>~</label>
          <Date-picker type="date" :options="endDate" placeholder="选择日期" style="width: 140px;display: inline-block"
                       v-model="endTime"></Date-picker>
        </div>
      </div>
      <div class="rightBtn">
        <Button type="success" class="search" @click="search">查询</Button>
        &nbsp;&nbsp;
        <Button type="primary" class="btnSize" @click="exportData()">导出</Button>
      </div>
    </div>
    <div class="table">
      <Table border :columns="columns4" :data="data1" ref="table" size="small"></Table>
    </div>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="totalPage">
        </el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
  import http from '../../assets/js/http'
  export default {
    name: 'orangeDetails',
    data () {
      return {
        conditionList: this.$store.state.manage.orangeList.conditionList,
        condition: '',
        value: "",
        meansTransactionList: this.$store.state.manage.orangeList.meansTransactionList,
        meansTransaction: '',
        /* OwnedPlatformList: this.$store.state.manage.orangeList.OwnedPlatformList,
         OwnedPlatform: '',*/
        columns4: [
          {
            type: 'index',
            width: 40,
            align: 'center'
          },
          {
            title: '交易日期',
            key: 'createTime'
          },
          {
            title: '交易号',
            key: 'businessNumber',
            render(row, column, index){
              return `<span title="${row.businessNumber}" style="cursor: pointer">${row.xBusinessNumber}</span>`
            }
          },
          {
            title: '支出（个）',
            width: 100,
            key: 'outAmmount'
          },
          {
            title: '收入（个）',
            width: 100,
            key: 'inAmount'
          },
          {
            title: '收橙子方',
            key: 'payeeName'
          },
          {
            title: '付橙子方',
            key: 'payerName'
          },
          {
            title: '交易方式',
            width: 90,
            key: 'xTradeType'
          }/*,
           {
           title: '所属平台',
           width: 90,
           key: 'OwnedPlatform'
           }*/,
          {
            title: '备注',
            key: 'remark',
            render(row, column, index){
              return `<span title="${row.remark}">${row.Xremark}</span>`
            }
          }
        ],
        data1: this.getOrangeData(),
        modalShield: false,
        reject: false,
        query: {
          width: '315px',
          display: 'inline-block'
        },
        startDate: {},
        startTime: "",
        endDate: {
          disabledDate (date) {
            return date && date.valueOf() < new Date($("#startDate").find("input").val()).getTime() - 86400000;
          }
        },
        endTime: ""
        , currentPage: 1
        , totalPage: 0
        , pageSize: 10//最小id
        , pageNumber: 1//页数
      }
    },
    methods: {
      /*数据列表*/
      getOrangeData: function (index) {
        var datas = [], self = this;
        this.todoWithPage();
        var dataJson = {
          format: 'json'
          , conditionType: this.condition//条件类型： 1：收款方 2：付款方
          , condition: this.value//条件内容
          , tradeType: this.meansTransaction//交易方式（1：充值、2：提现）
//          , originSystem: this.OwnedPlatform//所属平台
          , startTime: this.getListTime(this.startTime)//开始时间
          , endTime: this.getListTime(this.endTime)//结束时间
          , minId: this.minId//最小id
          , size: this.pageSize//最小id
          , page: 0//页数
          , sid: this.getCookie("cookieSid")
        }
        if (index) {
          dataJson.page = this.pageNumber;
        }
        this.apiPost('/api/ops/financeRest/orange/list', this.qs.stringify(dataJson)).then(function (res) {
          if (res.code == 0) {
            self.totalPage = res.total;
            res.data.forEach(function (data) {
              data.createTime = self.formatDateTime(data.createTime);
              /*data.xData = self.formatDateTime(data.createTime).split(" ")[0];
               data.xTime = self.formatDateTime(data.createTime).split(" ")[1];*/
              switch (data.tradeType) {
                case 1:
                  data.xTradeType = "充值";
                  break;
                case 2:
                  data.xTradeType = "提现";
                  break;
                case 3:
                  data.xTradeType = "交易";
                  break;
              }
              data.xBusinessNumber = "";
              if (data.businessNumber && data.businessNumber.length > 9) {
                data.xBusinessNumber = data.businessNumber.substr(0, 4) + ".." + data.businessNumber.substr(data.businessNumber.length - 4, data.businessNumber.length);
              } else {
                data.businessNumber = "";
              }
              if (data.remark) {
                data.Xremark = data.remark;
                if (data.remark.length > 6) {
                  data.Xremark = data.businessNumber.substr(0, 6) + ".."
                }
              } else {
                data.Xremark = "";
              }

              datas.push(data);
            })
          }
        }).catch(function (e) {
          console.log(e);
        });
        return datas;
      },
      /*查询*/
      search(){
        this.currentPage = 1;
        this.data1 = this.getOrangeData();
      },
      /*导出*/
      exportData () {
        window.location.href = HOST + "/api/ops/financeRest/orange/export?format=json&sid=" + this.getCookie("cookieSid")
          + "&conditionType=" + this.condition
          + "&condition=" + this.value
          + "&tradeType=" + this.meansTransaction
//          + "&originSystem=" + this.OwnedPlatform
          + "&startTime=" + this.getListTime(this.startTime)
          + "&endTime=" + this.getListTime(this.endTime)
          + "&pageSize=" + this.pageSize
          + "&pageNumber=" + this.pageNumber
      },
      /*分页*/
      todoWithPage(){
        if (!this.pageSize) {//如果分页大小为空则设置为10
          this.pageSize = 10;
        }
        if (!this.pageNumber) {//如果分页大小为空则设置为10
          this.pageNumber = 0;
        }
      },
      handleCurrentChange(val){
        this.changePage(val);
      },
      changePage(page){
        this.pageNumber = parseInt(page - 1);
        this.data1 = this.getOrangeData(1);
      }
    },
    mixins: [http]

  }
</script>
<style>

  .orangeDetails .left {
    width: 925px;
  }

  /*弹窗*/
  .modal .ivu-modal-body {
    padding: 40px;
  }

  .modal p {
    height: 30px;
    line-height: 30px;
    font-size: 16px;
  }

  .modal p:last-child {
    font-size: 14px;
    color: #aaa;
  }

  .modal textarea {
    border-color: #e3e8ee;
    width: 100%;
    padding: 10px;
    height: 120px;
  }
</style>
