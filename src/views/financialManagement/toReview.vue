<template>
  <div class="transactionDetail">
    <div class="title">
      <div class="zhiFB">
        <ul class="clearfix">
          <li>中金提现金额：￥<span>{{totalAmount.cpcnTotalAmount}}</span></li>
          <li>支付宝提现金额：￥<span>{{totalAmount.alipayTotalAmount}}</span></Icon></li>
          <li>微信提现金额：￥<span>{{totalAmount.wchatTotalAmount}}</span></Icon></li>
          <li>
            <Button type="primary" class="btnSize button" @click="batchReview">批量审核</Button>
          </li>
        </ul>
      </div>
    </div>
    <div>
      <div style="color: red;margin-bottom: 2px;">*请谨慎操作提现审核</div>
      <Table border :columns="columns4" :data="data1" ref="table" highlight-row
             @on-selection-change="selectItem" style="width: 99%"></Table>
    </div>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <!--<Page :total="pageTotal*10" :current="1" @on-change="changePage"></Page>-->
      </div>
    </div>
    <!--查看-->
    <Modal v-model="withdrawModal" title="查看详情" class="modal modalW" style="padding: 10px;">
      <h4><span>提现信息</span></h4>
      <Table class="tabord" :columns="columnsWithdraw0" :data="dataTodoInfo" border ref="table" size="small"></Table>
      <Table class="tabord" :columns="columnsWithdraw" :data="dataTodoInfo" border ref="table" size="small"></Table>
      <Table class="tabord" :columns="columnsWithdraw1" :data="dataTodoInfo" border ref="table" size="small"></Table>

      <div slot="footer">
        <Button type="success" @click="withdrawModal=false" style="background-color: #18A689;border-color:#18A689">关闭
        </Button>
      </div>
    </Modal>
    <!--拒绝-->
    <Modal v-model="rejectModal" title="拒绝提示" class="modal">
      <textarea placeholder="请输入拒绝原因" v-model="refReason"></textarea>
      <div slot="footer">
        <Button type="primary" size="large" @click="todoCertify(refuseIndex)">确定</Button>
      </div>
    </Modal>
    <!--支付页面-->
    <Modal v-model="payModal" title="支付" class="modal">
      <div id="payForm"></div>
      <div slot="footer">
      </div>
    </Modal>
  </div>
</template>
<script>
  import http from '../../assets/js/http'

  export default {
    name: 'transactionDetail',
    create(){
    },
    data () {
      return {
        columns4: [
          {
            type: 'selection',
            width: 50,
            align: 'center',
            fixed: 'left'
          },
          {
            type: 'index',
            width: 40,
            align: 'center'
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
              return `<span title="${row.businessNumber}">${row.XbusinessNumber}</span>`
            }
          },
          {
            title: '可提现余额',
            key: 'withdrawCashAmount',
            width: 160
          },
          {
            title: '不可提现余额',
            key: 'noWithdrawAmount',
            width: 160
          },
          {
            title: '冻结金额',
            key: 'forzenAmount',
            width: 160
          },
          {
            title: '提现',
            key: 'amount',
            width: 160
          },
          {
            title: '手续费',
            key: 'fee',
            width: 160

          },
          {
            title: '交易渠道',
            key: 'payType',
            width: 160
          },
          {
            title: '账户信息',
            key: 'payAccount',
            width: 160,
            render(row, column, index){
              return `<span @click="toShowDetail(${index})">${row.payAccount}</span>`
            }
          },
          {
            title: "状态",
            key: "isStatus",
            width: 160
          },
          {
            title: '摘要',
            key: 'xRemark',
            render(row, column, index){
              return `<span title="${row.remark}">${row.xRemark}</span>`
            },
            width: 160
          },
          {
            title: '操作',
            key: 'operating',
            render (row, column, index) {
              return `<i-button v-if="${row.status}==0" type="text" size="small" @click="batchReview(${index})">同意</i-button>
                      <i-button v-if="${row.status}==0"type="text" size="small" @click="todoWithRefuse(${index})">拒绝</i-button>
                      <i-button type="text" size="small" @click="todoDetail(${index})">查看</i-button></span>`;
            },
            fixed: 'right',
            width: 160
          }
        ],
        data1: this.getWithdrawData(),
        rejectModal: false,
        zhognjinRecharge: false,
        pass: false,
        multiply: [],
        withdrawModal: false,
        refReason: "",
        refuseIndex: 0,
        totalAmount: this.getAmount(),
        columnsWithdraw0: [
          {
            title: '交易号',
            key: "businessNumber",
            align: 'left',
          }
        ],
        columnsWithdraw: [
          {
            title: "交易时间",
            key: "createTime",
            width: 160
          },
          {
            title: "交易渠道",
            key: "payType"
          },
          {
            title: '手续费',
            key: "fee",
            align: 'center'
          },
          {
            title: "可提现余额",
            key: "withdrawCashAmount"
          },
          {
            title: '不可提现余额',
            key: "noWithdrawAmount",
            align: 'center'
          },
          {
            title: "冻结余额",
            key: "forzenAmount"
          },
          {
            title: "提现金额",
            key: "amount"
          }
        ],
        columnsWithdraw1: [
          {
            title: '付款账户',
            key: "payerAccount",
            align: 'center'
          },
          {
            title: "收款账户",
            key: "payAccount"
          },
          {
            title: "摘要",
            key: "remark"
          }
        ],
        dataTodoInfo: [],
        payModal:false,
        pageTotal: 0,
        size: 10,
        page: 0
      }
    },
    methods: {
      //获取总价
      getAmount(){
        var totalAmount = {
          cpcnTotalAmount: 0
          , alipayTotalAmount: 0
          , wchatTotalAmount: 0
        }, self = this;
        var dataJson = {
          format: "json",
          sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/withdrawAuditRest/totalAmount", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.jsonResult.code == 0) {
              res.jsonResult.data.forEach(function (data) {
                totalAmount.cpcnTotalAmount = data.cpcnTotalAmount == null ? data.cpcnTotalAmount = 0 : data.cpcnTotalAmount = data.cpcnTotalAmount
                totalAmount.alipayTotalAmount = data.alipayTotalAmount == null ? data.alipayTotalAmount = 0 : data.alipayTotalAmount = data.alipayTotalAmount
                totalAmount.wchatTotalAmount = data.wchatTotalAmount == null ? data.wchatTotalAmount = 0 : data.wchatTotalAmount = data.wchatTotalAmount
              })
            } else {
              self.$Message.error(res.msg);
            }
          }).catch(function (e) {
          self.$Message.error(e);
        })
        return totalAmount
      },
      midConvert(data){
        var self = this;
        data.createTime = self.formatDateTime(data.createTime);
        data.isPay = data.payType;//判断禁止启用状态
        data.isTradeStatus = data.tradeStatus;//判断流水状态
        data.isTradeType = data.tradeType;//判断交易方式
        //流水状态
        switch (data.status) {//0.待审核,1.进行中,2.成功,3.失败
          case 0:
            data.isStatus = "待审核";
            break;
          case 1:
            data.isStatus = "进行中";
            break;
          case 2:
            data.isStatus = "支付成功";
            break;
          case 3:
            data.isStatus = "支付失败";
            break;
          case 4:
            data.isStatus = "取消";
            break;
        }
        switch (data.payType) {
          case 1:
            data.payType = "支付宝";
            break;
          case 2:
            data.payType = "微信";
            break;
          case 3:
            data.payType = "中金";
            break;
          case 4:
            data.payType = "一网通";
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
        }
      },
      //data
      getWithdrawData: function () {
        var datas = [], self = this;
        var dataJson = {
          format: "json"
          , pageSize: this.size
          , pageNumber: this.page
          , minId: 0		//上一页最小id（选填）
          , sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/withdrawAuditRest/list", this.qs.stringify(dataJson)).then(function (res) {
          res.data.forEach(function (data) {
            self.pageTotal = res.totalpage;
            self.midConvert(data);
            data.XbusinessNumber = "";
            if (data.businessNumber) {
              data.XbusinessNumber = data.businessNumber.substr(0, 4) + ".." + data.businessNumber.substr(data.businessNumber.length - 4, data.businessNumber.length);
            }
            if (data.payAccount) {
              data.payAccount = data.payAccount.substr(0, 4) + '..' + data.payAccount.substr(data.payAccount.length - 4, data.payAccount.length);
            }

            if (data.remark != undefined) {
              if (data.remark.length > 6) {
                data.xRemark = data.remark.substr(0, 5) + "...";
              } else {
                data.xRemark = data.xRemark;
              }
            } else {
              data.xRemark = "";
              data.remark = "";
            }

            data.eWithdraw = data.accountAmount - data.noWithdrawAmount - data.forzenAmount;
            datas.push(data);
          })
        }).catch(function (e) {
          console.log(e);
        })
        return datas;
      },
      //checkbox
      selectItem: function (val) {
        this.multiply = val;
      },
      //审核同意（批量）
      batchReview(index){
        var self = this;
        if (/^[0-9]+$/.test(index)) {
          this.$Modal.confirm({
            content: "<div>确定同意该提现？</div>",
            onOk: function () {
              init(self.data1[index].id);
            },
            onCancel: function () {
            }
          })
        } else {
          if (this.multiply.length == 0) {
            this.$Message.error("请选择批量审核数据");
          } else {
            this.$Modal.confirm({
              title: '批量审核',
              content: `<div style="font-size: 16px;padding:10px 0;"><div>您确定批量审核？</div><div style="color: red;font-size:12px;">注：支付宝不能提现</div></div>`,
              onOk: function () {
                var ids = "";
                self.multiply.forEach(function (id) {
                  if ($.trim(id.payType) != "支付宝") {
                    ids += id.id + ",";
                  }
                })
                ids = ids.substr(0, ids.length - 1);
                if (ids) {
                  init(ids);
                } else {
                  this.$Message.error("支付宝不能体现！");
                }
              },
              onCancel: function () {
              }
            })
          }
        }
        function init(id) {
          var xSelf = self;
          var dataJson = {
            format: "json"
            , ids: id
            , sid: self.getCookie("cookieSid")
          }
          self.apiPost("/api/ops/withdrawAuditRest/pass", self.qs.stringify(dataJson))
            .then(function (res) {
              if (res.code == 0) {
                $("#payForm").append(res.data[0].data.auditForm);
                setTimeout(function () {
                  window.location.reload();
                },1000);
              } else {
                xSelf.$Message.error(res.msg);
              }
            }).catch(function (e) {
            console.log(e);
          })
        }

      },
      //拒绝
      todoWithRefuse(index){
        this.refuseIndex = index;
        this.rejectModal = true;
      },
      //拒绝操作
      todoCertify: function (index) {
        var self = this;
        var dataJson = {
          format: "json"
          , id: this.data1[index].id		//id
          , auditReason: this.refReason// 备注
          , sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/withdrawAuditRest/noPass", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              self.$Message.info("拒绝成功！");
              self.rejectModal = false;
            }
          }).catch(function (e) {
          console.log(e);
        })
        window.location.reload();
      },
      todoDetail(index){
        var self = this;
        self.dataTodoInfo = []
        var dataJson = {
          format: "json",
          id: this.data1[index].id,
          sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/withdrawAuditRest/view", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              res.data.forEach(function (data) {
                switch (data.payType) {
                  case 1:
                    data.payType = "支付宝";
                    break;
                  case 2:
                    data.payType = "微信";
                    break;
                  case 3:
                    data.payType = "中金";
                    break;
                  case 4:
                    data.isStatus = "一网通";
                    break;
                }
                data.eWithdraw = data.accountAmount - data.noWithdrawAmount - data.forzenAmount;
                data.createTime = self.formatDateTime(data.createTime);
                if (data.remark != undefined) {
                  if (data.remark.length > 6) {
                    data.xRemark = data.remark.substr(0, 5) + "...";
                  } else {
                    data.xRemark = data.xRemark;
                  }
                } else {
                  data.xRemark = "";
                  data.remark = "";
                }
                self.dataTodoInfo.push(data);
              })
            } else {
              self.$Message.error(res.msg);
            }
          }).catch(function (e) {
          self.$Message.error(e);
        })
        this.withdrawModal = true;
      },
      toShowDetail(index){
      },
      changePage(page){
        this.page = parseInt(page - 1);
        this.data1 = this.getWithdrawData();
      }
    },
    mixins: [http]

  }
</script>
<style>
  @import "../../assets/css/reset.css";

  .zhiFB ul li {
    float: left;
    padding: 5px;
    margin-right: 1.2%;
    font-size: 14px;
  }

  .zhiFB ul li:last-child {
    padding: 0;
  }

  .zhiFB ul li i {
    margin-left: 8px;
    font-size: 16px;
    cursor: pointer;
  }

  .zhiFB ul li i:before {
    color: #18A689;
  }

  .zhiFB ul li .button {
    padding: 5px 15px;
    font-size: 12px;
    border: none;
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
