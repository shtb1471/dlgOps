<template>
  <div class="InvoiceManagement">
    <!--title-->
    <div class="title clearfix">
      <div class="">
        <Select v-model="condition" style="width:120px;">
          <Option v-for="item in conditionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-if="condition===0" v-model="phone" placeholder="请输入手机号" style="width:180px"></Input>
        <Input v-else-if="condition===1" v-model="name" placeholder="请输入姓名" style="width:180px"></Input>
        <Input v-else v-model="expressCompany" placeholder="请输入企业名" style="width:180px"></Input>
        <Select v-model="auditStatus" style="width:120px;">
          <Option v-for="item in auditStatusList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Button type="success" class="search" @click="search">查询</Button>
      </div>
    </div>
    <div class="table">
      <Table border :columns="columns4" :data="data1" ref="table"></Table>
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
    <!--开票-->
    <Modal v-model="modalExpressDelivery" title="开票提示" class="modal">
      <p>
        <label>快递</label>
        <Select v-model="expressDelivery" name="expressDelivery" style="width:60%">
          <Option v-for="item in expressDeliveryList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
      </p>
      <p>
        <label>单号</label>
        <Input v-model="billValue" name="billValue" placeholder="请输入..." style="width: 60%"></Input>
      </p>
      <div slot="footer">
        <Button type="primary" size="large" long @click="openBill">确定</Button>
      </div>
    </Modal>
    <!--驳回-->
    <Modal v-model="reject" title="驳回原因" class="modal">
      <textarea placeholder="请输入驳回原因" v-model="xxRemark" name="remark"></textarea>
      <div slot="footer">
        <Button type="primary" @click="todoRefuse">确定</Button>
      </div>
    </Modal>
    <!--查看-->
    <Modal v-model="examine" title="查看详情" class="modal modalW">
      <h4><span>发票信息</span></h4>
      <Table class="tabord" border :columns="examineHeader" :data="examineHData" ref="table" size="small"></Table>
      <h4><span>收件人</span></h4>
      <Table class="tabord" border :columns="audit" :data="examineHData" ref="table" size="small"></Table>
      <h4><span>审核信息</span></h4>
      <Table class="tabord" border :columns="info" :data="examineHData" ref="table" size="small"></Table>
    </Modal>
  </div>
</template>
<script>
  import http from "../../assets/js/http"
  import jq from "jquery"
  export default {
    name: 'InvoiceManagement',
    data () {
      return {
        conditionList: this.$store.state.manage.billList.conditionList,
        condition: '',
        value: '',
        billValue: '',
        auditStatusList: this.$store.state.manage.billList.auditStatusList,
        auditStatus: '',//状态
        expressDeliveryList: this.$store.state.manage.billList.expressDeliveryList,
        expressDelivery: '',
        columns4: [
          {
            type: 'index',
            width: 40,
            align: 'center'
          },
          {
            title: '手机号',
            key: 'phone'
          },
          {
            title: '发票抬头',
            key: 'companyName'
          },
          {
            title: '发票类型',
            key: 'XinvoiceType'
          },
          {
            title: '金额（元）',
            key: 'invoiceAmount'
          },
          {
            title: '税额（元）',
            key: 'invoiceTax'
          },
          {
            title: '申请时间',
            key: 'createTime'
          },
          {
            title: '状态',
            width: 76,
            key: 'status'
          }, {
            title: '快递',
            key: 'expressCompanyX'
          },
          {
            title: '操作',
            key: 'operation',
            render (row, column, index) {
              return `
                      <i-button v-if="${row.isStatus}!=5" type="text" size="small" @click="openBillModal(${index})">开票</i-button>
                      <i-button v-if="${row.isStatus}!=5" type="text" size="small" @click="rejectFn(${index})">驳回</i-button>
                      <i-button type="text" size="small" @click="viewDetails(${index})">查看</i-button>
                      `;
            }
          }
        ],
        data1: this.getBillData(),
        examineHeader: [
          {
            title: '发票抬头',
            key: 'companyName'
          },
          {
            title: '状态',
            key: 'status',
            render(row, column, index){
              return `<span v-if="${row.isAStatus}==3" class="xsuccess">${row.status}</span>
                      <span v-else-if="${row.isAStatus}==0" class="xfail">${row.status}</span>
                      <span v-else>${row.status}</span>
                      `
            }
          },
          {
            title: '发票类型',
            key: 'XinvoiceType'
          },
          {
            title: '科目',
            key: ''
          },
          {
            title: '纳税人识别码',
            key: 'taxpayerIdentificationCode'
          },
          {
            title: '注册地址',
            key: 'registerAddress'
          },
          {
            title: '注册电话',
            key: 'registerPhone'
          },
          {
            title: '开户银行',
            key: 'bankName'
          },
          {
            title: '银行账户',
            key: 'bankAccount'
          },
          {
            title: '发票金额(元)',
            key: 'invoiceAmount',
            render(row, column, index){
              return `<span v-if="${row.invoiceAmount}" class="xfail">${row.invoiceAmount}</span>`
            }
          },
          {
            title: '发票税额(元)',
            key: 'invoiceTax',
            render(row, column, index){
              return `<span v-if="${row.invoiceTax}" class="xfail">${row.invoiceTax}</span>`
            }
          }
        ],
        examineHData: [],
        audit: [
          {
            title: '姓名',
            key: 'name',
            render(row,column,index){
              return `<span>${row.informationRpcVo.checkTakerName}</span>`
            }
          },
          {
            title: '联系方式',
            key: 'phone',
            render(row,column,index){
              return `<span>${row.informationRpcVo.checkTakerPhone}</span>`
            }
          },
          {
            title: '邮编',
            key: 'postcode'
          },
          {
            title: '地址',
            key: 'site',
            render(row,column,index){
                return `<span>${row.informationRpcVo.checkTakerAddress}</span>`
            }
          }
        ],
        info: [
          {
            title: '开票人',
            key: 'checkTakerName'
          },
          {
            title: '开票时间',
            key: 'invoiceTime'
          },
          {
            title: '备注',
            key: 'remark'
          }
        ],
        reject: false,
        modalExpressDelivery: false,
        examine: false,
        openIndex: 0,
        phone: "",//电话
        name: "",//姓名
        expressCompany: "",//快递公司
        currentPage: 1,
        pageTotal: 0,
        size: 10,//
        page: 0,//
        xxRemark: ''
      }
    },
    methods: {
      //数据列表
      getBillData(page){
        var datas = [], self = this;
        this.todoWithPage();
        var dataJson = {
          phone: this.phone,//电话
          name: this.name,//姓名
          status: this.auditStatus,//状态
          expressCompany: this.expressCompany,//快递公司
          size: this.size,//
          page: 0,
          sid: this.getCookie("cookieSid")
        }
        if (page) {
          dataJson.page = this.page;
        }
        this.apiPost('/api/ops/invoiceRestApi/getAllInvoice?format=json', this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              self.pageTotal = res.total;
              res.data.forEach(function (data) {
                data.invoiceType = data.informationRpcVo.invoiceType ? data.informationRpcVo.invoiceType : "";
                data.companyName = data.informationRpcVo.companyName;
                data.isStatus = data.status;
                switch (data.status) {
                  case 0:
                    data.status = "待开票";
                    break;
                  case 1:
                    data.status = "申请中";
                    break;
                  case 2:
                    data.status = "已驳回";
                    break;
                  case 3:
                    data.status = "已开票";
                    break;
                  case 4:
                    data.status = "已签收";
                    break;
                  case 5:
                    data.status = "已驳回";
                    break;
                }
                switch (data.informationRpcVo.invoiceType) {
                  case 1:
                    data.XinvoiceType = "普通发票";
                    break;
                  case 2:
                    data.XinvoiceType = "增值税发票";
                    break;
                }
                switch (data.expressCompany) {
                  case 'zhongtong':
                    data.expressCompanyX = "中通快递";
                    break;
                  case 'shunfeng':
                    data.expressCompanyX = "顺风快递";
                    break;
                }
                data.createTime = self.formatDateTime(data.informationRpcVo.createTime);
                datas.push(data);
              });
            }
          }).catch(function (e) {
          console.log(e);
        });
        return datas;
      },
      /*查看*/
      viewDetails(index){
        var self = this;
        this.examine = true;
        this.examineHData = [];
        var dataJson = {
          format: 'json',
          invoiceId: this.data1[index].id, //发票id
          status: this.data1[index].isStatus,//状态
          expressCompany: this.data1[index].expressCompany,//快递公司
          expressOrderNumber: this.data1[index].expressOrderNumber,//快递单号
          sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/invoiceRestApi/findInvoiceDetailById", this.qs.stringify(dataJson)).then(function (res) {
          if (res.code == 0) {
            res.data.forEach(function (data) {
              data.invoiceType = data.informationRpcVo.invoiceType ? data.informationRpcVo.invoiceType : "";
              data.companyName = data.informationRpcVo.companyName;
              data.createTime = self.formatDateTime(data.informationRpcVo.createTime);
              data.taxpayerIdentificationCode = data.informationRpcVo.taxpayerIdentificationCode;
              data.registerAddress = data.informationRpcVo.registerAddress;
              data.registerPhone = data.informationRpcVo.registerPhone;
              data.bankAccount = data.informationRpcVo.bankAccount;
              data.bankName = data.informationRpcVo.bankName;
              data.checkTakerName = data.informationRpcVo.checkTakerName;
              data.isAStatus=data.status;
              switch (data.status) {
                case 0:
                  data.status = "待开票";
                  break;
                case 1:
                  data.status = "申请中";
                  break;
                case 2:
                  data.status = "已驳回";
                  break;
                case 3:
                  data.status = "已开票";
                  break;
                case 4:
                  data.status = "已签收";
                  break;
                case 5:
                  data.status = "已驳回";
                  break;
              }
              switch (data.informationRpcVo.invoiceType) {
                case 1:
                  data.XinvoiceType = "普通发票";
                  break;
                case 2:
                  data.XinvoiceType = "增值税发票";
                  break;
              }
              self.examineHData.push(data);
            })
          } else {
            alert(res.msg);
          }
        })
      },

      /*驳回*/
      rejectFn(index){
        this.reject = true;
        this.openIndex = index;
      },
      todoRefuse(){
        var self = this;
        if (this.xxRemark == "") {
          $("[name='remark']").css("border-color", "red");
          self.$Message.error("请输入驳回原因！");
          this.reject = true;
          return false;
        } else {
          $("[name='remark']").css("border-color", "#e3e8ee");
        }
        var dataJson = {
          format: 'json',
          invoiceId: this.data1[this.openIndex].id, //发票id
          status: 5,//状态
          sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/invoiceRestApi/updateInvoice", this.qs.stringify(dataJson)).then(function (res) {
          if (res.code == 0) {
            self.reject = false;
          } else {
            console.log(res.msg);
          }
        })
        window.location.reload();
      },
      search(){
        this.currentPage = 1;
        this.data1 = this.getBillData();
      },
      //      开发票
      openBillModal: function (index) {
        this.openIndex = index;
        this.modalExpressDelivery = true
      },
      openBill(index){
        var index = this.openIndex;
        var self = this;
        if (this.expressDelivery == "") {
          $("[name='expressDelivery']").find(".ivu-select-selection").css("border-color", "red");
          this.modalExpressDelivery = true;
          this.$Message.error("请选择快递类型");
          return false;
        } else if (this.billValue == "") {
          $("[name='expressDelivery']").find(".ivu-select-selection").css("border-color", "#d7dde4");
          $("[name='billValue']").css("border-color", "red");
          this.modalExpressDelivery = true;
          this.$Message.error("请选择单号");
          return false;
        } else {
          $("[name='billValue']").find(".ivu-select-selection").css("border-color", "#d7dde4");

          var dataJson = {
            format: "json"
            , invoiceId: this.data1[index].id//发票id
            , status: 3  //状态   3表示已开票
            , expressCompany: this.expressDelivery//快递公司
            , expressOrderNumber: this.billValue//快递单号
            , sid: this.getCookie("cookieSid")
          }
          this.apiPost("/api/ops/invoiceRestApi/updateInvoice", this.qs.stringify(dataJson)).then(function (res) {
            if (res.code == 0) {
              self.modalExpressDelivery = false;
            } else {
              console.log(res.msg)
            }
          })
          window.location.reload();
        }
      },//分页
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
        this.data1 = this.getBillData();
      }
    },
    mixins: [http]
  }
</script>
<style>
  .InvoiceManagement .left {
    width: 800px;
  }

  .title .table .ivu-table-wrapper .ivu-table ivu-table-border table {
    width: 100% !important;
  }

  /*弹窗*/
  .modal .ivu-modal-body {
    padding: 40px 20%;
  }

  .modal p {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    margin-bottom: 20px;
    color: #333;
    font-weight: normal;
  }

  .modal p label {
    margin-right: 10px;
    font-size: 16px;
    color: #333;
  }
</style>
