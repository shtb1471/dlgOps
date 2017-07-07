<template>
  <div class="transactionDetail">
    <!--title-->
    <div class="title clearfix">
      <div class="left">
        <Select v-model="condition" style="width:120px;">
          <Option v-for="item in conditionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-model="search" placeholder="请输入..." style="width: 180px;"></Input>
        <Select v-model="tradeType" style="width:120px;">
          <Option v-for="item in meansTransactionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Select v-model="paymentType" style="width:120px;">
          <Option v-for="item in OwnedPlatformList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Select v-model="status" style="width:120px;">
          <Option v-for="item in tradingStatusList" :value="item.value" :key="item">{{ item.label }}</Option>
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
      <div class="rightBtn">
        <Button type="success" class="search" @click="changeTableColumns">查询</Button>
        &nbsp;&nbsp;
        <Button type="primary" class="btnSize" @click="exportData">导出</Button>
      </div>
    </div>
    <div class="table">
      <Table border :columns="columns4" :data="data1" ref="table" size="small"></Table>
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
    <!--查看-->
    <Modal v-model="searchDetailModal" title="查看详情" class="modal modalW" style="padding: 10px;">
      <h4><span>提现信息</span></h4>
      <Table class="tabord" :columns="columnsWithdraw" :data="dataTodoInfo" border ref="table" size="small"></Table>
      <h4><span>处理信息</span></h4>
      <Table class="tabord" border ref="table" :columns="columnsTodoInfo" :data="dataTodoInfo" size="small"></Table>
      <div slot="footer">
        <Button type="success" size="large" long @click="searchDetailModal=false"
                style="background-color: #18A689;border-color:#18A689;">关闭
        </Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import http from '../../assets/js/http'

  export default {
    name: 'transactionDetail',
    data () {
      return {
        conditionList: this.$store.state.financial.conditionList,
        condition: '',
        search: '',
        meansTransactionList: this.$store.state.financial.meansTransactionList,
        tradeType: '',
        OwnedPlatformList: this.$store.state.financial.OwnedPlatformList,
        paymentType: '',
        tradingStatusList: this.$store.state.financial.tradingStatusList,
        status: '',
        startTime: "",//注册日期开始时间(选填)
        endTime: "",//注册日期结束时间(选填)
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
        columns4: [
          {
            type: 'index',
            width: 60,
            align: 'center',
            fixed: "left"
          },
          {
            title: '交易时间',
            key: 'createTime',
            width: 160
          },
          {
            title: '交易号',
            key: 'businessNumber',
            width: 160,
            render(row, column, index){
              return `<span title="${row.businessNumber}">${row.businessNumberS}</span>`
            }
          },
          {
            title: '提现',
            key: 'withdrawAmount',
            width: 90
          },
          {
            title: '充值',
            key: 'rechargeAmount',
            width: 90
          },
          {
            title: '交易方式',
            width: 90,
            key: 'tradeType'
          },
          {
            title: '交易渠道',
            key: 'paymentType',
            width: 90
          },
          {
            title: '账户信息',
            key: 'accountInfo',
            width: 160,
            render(row,column,index){
              return `<span @click="toShowDetail(${index})">${row.accountInfo}</span>`
            }
          },
          {
            title: '交易状态',
            key: 'tradeStatus',
            width: 90,
            render(row,column,index){
                return `<span v-if="${row.isTradeStatus}==3" class="xfail">${row.tradeStatus}</span><span v-else>${row.tradeStatus}</span>`
            }
          },
          {
            title: '摘要',
            key: 'errorMessage',
            render(row, column, index){
              return `<span v-if="${row.isTradeStatus}==3" class="xfail" title="${row.errorMessage}">${row.xRemark}</span>
                      <span v-else title="${row.errorMessage}">${row.xRemark}</span>`
            },
            width: 160
          },
          {
            title: '操作',
            key: 'operating',
            render (row, column, index) {
              return `<i-button type="text" size="small" @click="todoDetail(${index})">查看</i-button>`;
            },
            width: 120,
            fixed: "right"
          }
        ],
        data1: this.getTradeData(),
        searchDetailModal: false,
        columnsWithdraw: [
          {
            title: '付款账户',
            key: "payerName"
          },
          {
            title: "收款账户",
            key: "payeeName"
          },
          {
            title: '交易号',
            key: "businessNumber"
          },
          {
            title: "交易时间",
            key: "createTime"
          },
          {
            title: "交易渠道",
            key: "paymentType"
          },
          {
            title: '手续费',
            key: ""
          },
          {
            title: "可提现余额",
            key: "withdrawCashAmount"
          },
          {
            title: "不可提现余额",
            key: "noWithdrawAmount"
          },
          {
            title: "冻结余额",
            key: "forzenAmount"
          },
          {
            title: "提现金额",
            key: "amount"
          },
          {
            title: "摘要",
            key: "remark"
          }
        ],
        columnsTodoInfo: [
          {
            title: "处理状态",
            key: "tradeStatus"
          },
          {
            title: "审核时间",
            key: "auditTime"
          },
          {
            title: "审核人",
            key: "auditUserName"
          },
          {
            title: "处理开始时间",
            key: "auditCreateTime"
          },
          {
            title: "处理结束时间",
            key: "auditTime"
          }
        ],
        dataTodoInfo: [],
        currentPage: 1,
        pageTotal: 0,
        pageSize: 10,//条数
        page: 0//页数
      }
    },
    methods: {
      midConvert(data){
        var self = this;
        data.createTime = self.formatDateTime(data.createTime);
        data.auditCreateTime = self.formatDateTime(data.auditCreateTime);
        data.isPay = data.paymentType;//判断禁止启用状态
        data.isTradeStatus = data.tradeStatus;//判断流水状态
        data.isTradeType = data.tradeType;//判断交易方式
        //流水状态
        switch (data.tradeStatus) {
          case 1:
            data.tradeStatus = "处理中";
            break;
          case 2:
            data.tradeStatus = "成功";
            break;
          case 3:
            data.tradeStatus = "失败";
            break;
          case 4:
            data.tradeStatus = "取消";
            break;
        }
        switch (data.paymentType) {
          case 0:
            data.paymentType = "橙子";
            break;
          case 1:
            data.paymentType = "支付宝";
            break;
          case 2:
            data.paymentType = "微信";
            break;
          case 3:
            data.paymentType = "中金";
            break;
          case 4:
            data.paymentType = "一网通";
            break;
        }
        //交易方式
        switch (data.tradeType) {
          case 1:
            data.tradeType = "充值";
            break;
          case 2:
            data.tradeType = "提现";
            break;
          case 3:
            data.tradeType = "交易";
            break;
        }
      },
      getTradeData: function (index) {
        var datas = [], self = this;
        var dataJson = {
          format: "json"
          , startTime: this.getListTime(this.startTime)//开始时间(选填)
          , endTime: this.getListTime(this.endTime)//结束时间(选填)
          , payType: this.paymentType //提现方式 1.支付宝,2.微信,3.银行卡
          , tradeType: this.tradeType //交易方式（1：充值，2：提现）
          , status: this.status //交易状态（0.待审核,1.进行中,2.成功,3.失败）
          , pageSize: this.pageSize//条数
          , pageNumber: 0//页数
          , searchType: this.condition //条件类型（1：收款方、2：付款方、3：交易号、4：摘要）
          , search: this.search//条件内容
          , sid: this.getCookie("cookieSid")
        }
        if (index) {
          dataJson.pageNumber = this.page;
        }
        this.apiPost('/api/ops/financeRest/trans/list', this.qs.stringify(dataJson)).then(function (res) {
          if (res.code == 0) {
            self.pageTotal = res.total;
            res.data.forEach(function (data) {
              self.midConvert(data);
              if (data.businessNumber) {
                data.businessNumberS = data.businessNumber.substr(0, 4) + ".." + data.businessNumber.substr(data.businessNumber.length - 4, data.businessNumber.length);
              }
              if (data.payAccount) {
                data.XpayAccount = data.payAccount.substr(0, 4) + '..' + data.payAccount.substr(data.payAccount.length - 4, data.payAccount.length);
              }
              data.accountInfo = data.XpayAccount;
              if (data.payAccountName) {
                data.accountInfo = data.payAccountName;
              }
              if (data.errorMessage != undefined) {
                if (data.errorMessage.length > 6) {
                  data.xRemark = data.errorMessage.substr(0, 5) + "...";
                } else {
                  data.xRemark = data.errorMessage;
                }
              } else {
                data.xRemark = "";
                data.errorMessage = "";
              }
              datas.push(data);
            })
          } else {
            self.$Message.error(res.msg);
          }
        }).catch(function (e) {
          self.$Message.error(e);
        });
        return datas;
      },
      //查询
      changeTableColumns(){
        this.currentPage = 1;
        this.data1 = this.getTradeData();
      },
      //导出
      exportData () {
        window.location.href = HOST + "/api/ops/financeRest/trans/export?format=json&sid=" + this.getCookie("cookieSid")
          + "&startTime=" + this.getListTime(this.startTime)
          + "&endTime=" + this.getListTime(this.endTime)
          + "&tradeType=" + this.tradeType
          + "&status=" + this.status
          + "&searchType=" + this.condition
          + "&search=" + this.search
          + "&payType=" + this.paymentType
         /* + "&minId=" + (this.minId == undefined ? 0 : this.minId)
          + "&pageSize=" + (this.pageSize == undefined ? 10 : this.pageSize)
          + "&pageNumber=" + (this.pageNumber == undefined ? 0 : this.pageNumber)*/
      },
      //详情
      todoDetail(index){
        var self = this;
        self.dataTodoInfo = [];
        var dataJson = {
          format: "json"
          , id: this.data1[index].id
          , sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/financeRest/trans/view", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              res.data.forEach(function (data) {
                data.createTime = self.formatDateTime(data.createTime);
                data.auditTime = self.formatDateTime(data.auditTime);
                switch (data.payeeType) {
                  case 1:
                    data.payeeType = "个人";
                    break;
                  case 2:
                    data.payeeType = "企业";
                    break;
                  case 3:
                    data.payeeType = "代理商";
                    break;
                }
                switch (data.status) {
                  case 1:
                    data.status = "处理中";
                    break;
                  case 2:
                    data.status = "成功";
                    break;
                  case 3:
                    data.status = "失败";
                    break;
                  case 4:
                    data.status = "取消";
                    break;
                }
                if (!data.payerName) {
                  data.payerName = data.payerId;
                }
                if (!data.payeeName) {
                  data.payeeName = data.payeeId;
                }
                switch (data.paymentType) {
                  case 1:
                    data.paymentType = "支付宝";
                    break;
                  case 2:
                    data.paymentType = "微信";
                    break;
                  case 3:
                    data.paymentType = "中金";
                    break;
                  case 4:
                    data.paymentType = "一网通";
                    break;
                }
                data.eWithdraw = data.accountAmount - data.noWithdrawAmount - data.forzenAmount;
                data.auditTime = self.formatDateTime(data.auditTime);
                data.auditCreateTime = self.formatDateTime(data.auditCreateTime);


                switch (data.tradeStatus) {
                  case 1:
                    data.tradeStatus = "处理中";
                    break;
                  case 2:
                    data.tradeStatus = "成功";
                    break;
                  case 3:
                    data.tradeStatus = "失败";
                    break;
                  case 4:
                    data.tradeStatus = "取消";
                    break;
                }
                self.dataTodoInfo.push(data);
              })
              self.searchDetailModal = true;
            } else {
              self.$Message.error(res.msg);
            }
          }).catch(function (e) {
          self.$Message.error(e);
        })
      },
      toShowDetail(index){

      },
      handleCurrentChange(val) {
        this.currentPage = val;
        this.changePage(val);
      },
      changePage(page){
        this.page = parseInt(page - 1);
        this.data1 = this.getTradeData(1);
      }
    },
    mixins: [http]

  }
</script>
<style>
  @import "../../assets/css/reset.css";

  .transactionDetail .left {
    width: 1050px;
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

  .zhognjinRecharge p strong {
    margin-left: 10px;
    display: inline-block;
  }

  .zhognjinRecharge label span {
    color: red;
  }
</style>
