<template>
  <div class="rechargeOrange">
    <!--title-->
    <div class="title clearfix">
      <div class="left">
        <Select v-model="rechargeCondition" style="width:120px">
          <Option v-for="item in rechargeConditionList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Input v-model="value" placeholder="请输入..." style="width:180px"></Input>
        <Select v-model="userType" style="width:120px">
          <Option v-for="item in auditStatusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Button type="success" class="search" @click="changeTableColumns">查询</Button>
        &nbsp;&nbsp;
        <Button type="primary" class="btnSize" @click="batchRecharge">批量充值</Button>

      </div>
    </div>
    <div class="table">
      <Table border :columns="columns4" :data="data1" ref="table" size="small"></Table>
    </div>
    <!--充值-->
    <Modal v-model="recharge" title="充值提示" class="agency clearfix">
      <form>
        <p>
          <label>手机号</label> <strong>{{xPhone}}</strong>
        </p>
        <p>
          <label>名称</label><strong>{{xName}}</strong>
        </p>
        <p>
          <label>类型</label>
          <Select v-model="rechargeType" style="width:112px" name="rechargeType">
            <Option v-for="item in typeList" :value="item.value" :key="item">{{ item.label }}</Option>
          </Select>
          <Input v-model="amount" style="width: 40%" placeholder="10" name="amount"></Input>
        </p>
        <p>
          <label><span>*</span>充值金橙数</label><em>10个金橙价值人民币：1.00元</em>
        </p>
        <p>
          <label class="textarea">备注</label>
          <textarea placeholder="请输入内容" v-model="remark"></textarea>
        </p>
      </form>
      <div slot="footer">
        <Button type="primary" @click="rechargeSubmit">确定</Button>
      </div>
    </Modal>
    <!--批量充值-->
    <Modal v-model="multiRecharge" title="批量充值提示" class="batch">
      <form id="formId" enctype="multipart/form-data" :action="uploadFile" method="post" target="ifm"
            style="overflow: hidden;">
        <div class="">
          <div>
            <label>选择文件</label>
            <input id="uploadIpt" name="file" type="file" value="浏览"/>
            <button class="waringBtn" type="submit" style="background-color: #f30;border-color:#f30;color: #fff;"
                    @click="uploadBtn">上传
            </button>
            <Button type="primary" @click.native="downloadTemplate">下载模板</Button>
          </div>
        </div>
      </form>
      <iframe id='ifm' name='ifm' style="display:none"/>
      <div slot="footer">
        <!--<Button type="success" style="background-color: #18A689;border-color:#18A689" @click="uploadBtn">上传</Button>-->
      </div>
    </Modal>
  </div>
</template>
<script>
  import http from '../../assets/js/http'

  export default {
    name: 'rechargeOrange',
    data () {
      return {
        rechargeConditionList: this.$store.state.rechargeOrange.rechargeConditionList,
        rechargeCondition: "",
        value: "",
        auditStatusList: this.$store.state.rechargeOrange.auditStatusList,
        userType: "",
        columns4: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: '手机号',
            key: 'phone',
            width: 160
          },
          {
            title: '名称',
            key: 'userName'
          },
          {
            title: '用户类型',
            key: 'userTypeX'
          },
          {
            title: '金橙数',
            key: 'amount'
          },
          {
            title: '操作',
            key: 'operation',
            render(row, column, index){
              return `<span size="small" @click="todoRecharge(${index})" style="cursor:pointer;">充值</span>`
            },
            width: 90
          }
        ],
        data1: this.getRechargeOrangeData(),
        recharge: false,
        multiRecharge: false,
        typeList: [
          {
            value: 1,
            label: '餐补'
          },
          {
            value: 2,
            label: '活动'
          }
        ],
        rechargeType: 0,
        xPhone: '',
        xName: '',
        amount: 10,
        remark: "",
        rechgIndex: 0,
        uploadFile: HOST + "/api/ops/rechargeRest/upload?format=json&sid=" + this.getCookie("cookieSid")
      }
    },
    methods: {
      midConvert(data){
        switch (data.userType) {
          case "PERSONAL":
            data.userTypeX = "个人";
            break;
          case "ENTERPRISE":
            data.userTypeX = "企业";
            break;
          case "AGENT":
            data.userTypeX = "代理商";
            break;
        }
      },
      getRechargeOrangeData(){
        var datas = [], self = this;
        if(!/^[0-9]+$/.test(this.rechargeCondition)){
          this.rechargeCondition=0;
        }
        if(!/^[0-9]+$/.test(this.userType)){
          this.userType=0;
        }
        var dataJson = {
          format: "json"
          ,
          searchType: this.rechargeCondition//条件类型 1:手机号 2用户名 3企业名
          ,
          condition: this.value//条件
          ,
          userType: this.userType//用户类型 1个人 2企业 3代理商
          ,
          sid: this.getCookie("cookieSid")
        }
        this.apiPost('/api/ops/rechargeRest/account/list', this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              res.data.forEach(function (data) {
                self.midConvert(data);
                datas.push(data);
              })
            } else {
              self.$Message.error(res.msg);
            }
          }).catch(function (e) {
          console.log(e);
        });
//        this.data1 = datas;
        return datas;
      },
      changeTableColumns(){
        this.data1 = this.getRechargeOrangeData();
      },
      //充值
      todoRecharge(index) {
        this.rechgIndex = index;
        this.xPhone = this.data1[index].phone;
        this.xName = this.data1[index].userName;
        this.amount = this.amount;
        this.remark = "";
        this.rechargeType = 0;
        this.recharge = true;
      },
      todoVerify(){
        if (this.rechargeType=="") {
          $(".ivu-select-selection")
            .css("border-color","#d7dde4");
          this.$Message.error('请选择类型!');
          this.addModal = true;
          $("[name='rechargeType']").find(".ivu-select-selection")
            .css("border-color","red");
          return false;
        }
        if (this.amount=="") {
          $(".ivu-select-selection")
            .css("border-color","#d7dde4");
          this.$Message.error('请输入金橙数!');
          this.addModal = true;
          $("[name='amount']").find(".ivu-input")
            .css("border-color","red");
          return false;
        }
        $(".ivu-input")
          .css("border-color","#d7dde4");
        return true;
      },
      rechargeSubmit(){
        var self = this,userTypeX;
        switch (this.data1[this.rechgIndex].userType) {
          case "PERSONAL":
            userTypeX = 1;
            break;
          case "ENTERPRISE":
            userTypeX = 2;
            break;
          case "AGENT":
            userTypeX = 3;
            break;
        }
        if(!this.todoVerify()){
            return false;
        }
        var dataJson = {
          format: "json"
          , payeeId: this.data1[this.rechgIndex].id     //Id
          , payeePhone: this.data1[this.rechgIndex].phone
          , payeeName: this.data1[this.rechgIndex].userName
          , rechargeType: this.rechargeType//1:餐补 2：活动
          ,payeeType:userTypeX
          ,amount:this.amount
          , remark: this.remark   //备注
          , sid: this.getCookie("cookieSid")
        }
        if(this.amount==""||this.amount<10){
            dataJson.amount= 10//充值金额
        }
        this.apiPost("/api/ops/rechargeRest/audit", this.qs.stringify(dataJson))
          .then(function (res) {
            self.recharge = false;
            if (res.code == 1) {
              self.$Message.info(res);
            }
          }).catch(function (e) {
          self.$Message.error(e);
        })
        window.location.reload();
      },
      batchRecharge() {
        this.multiRecharge = true;
      },
      uploadBtn(){
        if ($("#uploadIpt").val()) {
          this.multiRecharge = false;
        } else {
          this.$Message.error("请上传文件！");
        }
        window.location.reload();
      },
      downloadTemplate(){
        window.location.href = HOST + "/api/ops/rechargeRest/download?format=json&sid=" + this.getCookie("cookieSid");
      }
    },
    mixins: [http]
  }
</script>
<style>
  .rechargeOrange .left {
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

  .agency form p {
    margin: 0 0 10px 0;
    text-align: left;
    overflow: hidden;
  }

  .agency form p .uploadLabe {
    float: left;
    margin-left: 38px;
  }

  .agency form p label {
    width: 68px;
    text-align: right;
    margin-right: 10px;
    display: inline-block;
  }

  .agency form p label span {
    color: red;
  }

  .agency form p textarea {
    border-color: #e3e8ee;
    width: 78%;
    padding: 10px;
    height: 80px;
    float: right;
  }

  .agency form p .textarea {
    position: relative;
    top: 0;
  }

  .batch .file {
    width: 81px;
    height: 50px;
    background-color: #18A689;
    border: none;
    color: #fff;
  }

  .batch p a {
    border-radius: 3px;
    text-align: center;
    display: inline-block;
    width: 70px;
    height: 30px;
    line-height: 30px;
    background-color: #18A689;
    border: none;
    color: #fff;
    position: relative;
    overflow: hidden;
    font-size: 12px;
    top: 12px;
  }

  .batch p input {
    opacity: 0;
    position: absolute;
    top: -80px;
    left: 0;
    cursor: pointer;
  }

  .waringBtn {
    color: #fff;
    background-color: #f30;
    border-color: #f30;
    display: inline-block;
    margin-bottom: 0;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    background-image: none;
    border: 1px solid transparent;
    white-space: nowrap;
    line-height: 1.5;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    padding: 6px 15px;
    font-size: 12px;
    border-radius: 4px;
    transform: translate3d(0, 0, 0);
    transition: color .2s linear, background-color .2s linear, border .2s linear;
    color: #657180;
    background-color: #f7f7f7;
    border-color: #d7dde4;
  }
</style>
