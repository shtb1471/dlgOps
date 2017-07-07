<template>
  <div class="personageInfo">
    <!--title-->
    <div class="title clearfix">
      <div class="left">
        <Select v-model="condition" style="width:120px;">
          <Option v-for="item in conditionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-if="condition===2" v-model="name" placeholder="请输入姓名" style="width:180px;"/>
        <Input v-else-if="condition===3" v-model="number" placeholder="请输入身份证" style="width:180px;"/>
        <Input v-else v-model="phone" placeholder="请输入手机号" style="width:180px;"/>
        <Select v-model="auditStatus" style="width:120px;">
          <Option v-for="item in auditStatusList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Select v-model="status" style="width:120px;">
          <Option v-for="item in stateList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Select v-model="location" style="width:120px;">
          <Option v-for="item in locationList" :value="item.areaName" :key="item">{{ item.areaName }}</Option>
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
        <Button type="primary" class="btnSize" @click="exportData()">导出</Button>
      </div>
    </div>
    <!--list 列表-->
    <div class="table">
      <Table border :columns="columns4" :data="data1" ref="table"></Table>
    </div>
    <!--page 分页-->
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
    <Modal v-model="personalInfoModal" title="查看详情" class="modal modalW" style="padding: 10px;">
      <h4><span>个人信息</span></h4>
      <Table class="tabord" border :columns="personalHeader" :data="personalHData" ref="table" size="small"></Table>
      <Table class="tabord" border :columns="personalHeader1" :data="personalHData" ref="table" size="small"></Table>
      <h4><span>三方账户</span></h4>
      <Table class="tabord" border :columns="personalBody" :data="personalBData" ref="table" size="small"></Table>
      <div slot="footer">
        <Button type="success" size="large" long @click="personalInfoModal=false"
                style="background-color: #18A689;border-color: #18A689;">关闭
        </Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import http from '../../assets/js/http'
  export default {
    name: 'personageInfo',
    data () {
      return {
        conditionList: this.$store.state.company.personalInfo.conditionList,
        condition: '',
        name: "",//姓名
        phone: "",//手机号
        number: "",//身份证号
        auditStatusList: this.$store.state.company.personalInfo.auditStatusList,
        auditStatus: '',
        stateList: this.$store.state.company.companyInfo.OwnedPlatformList,
        status: '',
        locationList: this.getCityInfo(),
        location: '',
        startTime: '',
        endTime: '',
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
            width: 40,
            align: 'center'
          },
          {
            title: '所在地',
            key: 'location'
          },
          {
            title: '手机号',
            key: 'phone'
          },
          {
            title: '姓名',
            key: 'name'
          },
          {
            title: '性别',
            width: 76,
            key: 'sex'
          },
          {
            title: '身份证号',
            key: 'certificateNumber',
            render(row,column,index){
                return ` <Tooltip :disabled="${row.isShowImgList}" placement="left">
                          <span class="xpublish">${row.certificateNumber}</span>
                          <div slot="content" style="width:100%;overflow: auto">
                           <img src="${row.idcardAliyunUrl}" style='width:100%'>
                          </div>
                         </Tooltip>`
            }
          },
          {
            title: '注册时间',
            key: 'createTime'
          },
          {
            title: '认证状态',
            key: 'auditStatus',
            render(row,column,index){
                return `<span v-if="${row.isAStatus}==1" class="xfail">${row.auditStatus}</span>
                        <span v-else>${row.auditStatus}</span>
                        `
            }
          },
          {
            title: '状态',
            width: 76,
            key: 'status'
          },
          {
            title: '操作',
            key: 'operation',
            render (row, column, index) {
              return `<i-button type="text" size="small" @click="todoDetail(${index})">查看</i-button>
                      <i-button v-if="${row.isStart}==2" type="text" size="small" @click="unabledTodo(${index})">启用</i-button>
                      <i-button v-else type="text" size="small" @click="unabledTodo(${index})">禁用</i-button>`;
            }
          }
        ],
        data1: this.getPersonalInfoData(),
        modalShield: false,
        forbidden: false,
        personalInfoModal: false,
        personalHeader: [
          {
            title: '手机号',
            key: 'phone'
          }, {
            title: '实名认证',
            key: 'auditStatus',
            render(row,column,index){
              return `<span v-if="${row.isAStatus}==1" class="xfail">${row.auditStatus}</span>
                        <span v-else>${row.auditStatus}</span>
                        `
            }
          },
          {
            title: '姓名',
            key: 'name',
            render(row,column,index){
                return `<span>${row.personalUserAttributeRestVo.name}</span>`
            }
          },
          {
            title: '昵称',
            width: 76,
            key: 'username'
          },
          {
            title: '身份',
            key: 'certificateNumber',
            render(row,column,index){
              return `<span>${row.personalUserAttributeRestVo.location}</span>`
            }
          },
         /* {
            title: '用户类型',
            key: 'certificateType',
            render(row,column,index){
              return `<span>${row.personalUserAttributeRestVo.location}</span>`
            }
          },*/
          {
            title: '身高(cm)',
            key: 'height',
            render(row,column,index){
              return `<span>${row.personalUserAttributeRestVo.height}</span>`
            }
          },
          {
            title: '体重(kg)',
            key: 'weight',
            render(row,column,index){
              return `<span>${row.personalUserAttributeRestVo.weight}</span>`
            }
          }, {
            title: "所在地",
            key: "location",
            render(row,column,index){
              return `<span>${row.personalUserAttributeRestVo.location}</span>`
            }
          }, {
            title: "性别",
            key: "sex"
          }, {
            title: "邮箱",
            key: "email"
          }, {
            title: "Q Q",
            key: "oicq"
          }],
        personalHeader1: [
          {
            title: '身份证号',
            key: 'certificateNumber',
            render(row,column,index){
              return `<span>${row.personalUserAttributeRestVo.certificateNumber}</span>`
            }
          },
          {
            title: '个性签名',
            key: 'personalizedSignature',
            render(row,column,index){
              return `<span>${row.personalUserAttributeRestVo.personalizedSignature}</span>`
            }
          },
          {
            title: '注册时间',
            key: 'createTime'
          },
          {
            title: '学历',
            key: 'degree',
            render(row,column,index){
              return `<span>${row.personalUserAttributeRestVo.degree}</span>`
            }
          },
          {
            title: '身份证',
            key: 'idcardAliyunUrl',
            render(row, column, index){
              return ` <Tooltip placement="left">
                       <div v-show="${row.isShowImg}" style="color: red;font-size: 12px;">*查看</div>
                       <img v-show="${row.isShowImg}" style="width: 40px;" src="${row.personalUserAttributeRestVo.idcardAliyunUrl}" />
                      <div slot="content" style="width:100%;overflow: auto">
                       <img src="${row.personalUserAttributeRestVo.idcardAliyunUrl}" style='width:100%'>
                      </div>
                     </Tooltip>
              `
            }
          }
        ],
        personalHData: [],
        personalBody: [
          {
            title: '支付宝',
            key: 'threealipay'
          }, {
            title: '绑定时间',
            key: 'alipayBindDate'
          },
          {
            title: '微信',
            key: 'threeweChat'
          },
          {
            title: '绑定时间',
            key: 'weChatBindDate'
          },
          {
            title: 'QQ',
            key: 'threeoicq'
          },
          {
            title: '绑定时间',
            key: 'oicqBindDate'
          }],
        personalBData: [],
        currentPage: 0
        , pageTotal: 0
        , size: 10//条数(选填)
        , page: 0//页数(选填)
      }
    },
    methods: {
      //中间参数转换
      midConvert: function (data) {
        var self = this;
        data.location = data.location ? data.location : "未填写";
        data.createTime = self.formatDateTime(data.createTime);
        data.isStart = data.status;
        data.isAStatus = data.auditStatus;
        switch (data.auditStatus) {
          case 0:
            data.auditStatus = "未认证";
            break;
          case 1:
            data.auditStatus = "待认证";
            break;
          case 2:
            data.auditStatus = "已认证";
            break;
          case 3:
            data.auditStatus = "已拒绝";
            break;
        }
        switch (data.status) {
          case 0:
            data.status = "新建";
            break;
          case 1:
            data.status = "正常";
            break;
          case 2:
            data.status = "禁止";
            break;
        }
        switch (data.sex) {
          case 1:
            data.sex = "男";
            break;
          case 2:
            data.sex = "女";
            break;
          case 3:
            data.sex = "保密";
            break;
          default:
            data.sex = "未知";
            break;

        }
        switch (data.type) {
          case "ENTERPRISE":
            data.type = "企业";
            break;
          case "PERSONAL":
            data.type = "个人";
            break;
        }
      },
      //获取列表信息
      getPersonalInfoData(page){
        var self = this;
        var datas = [];
        self.todoWithPage();
        var dataJson = {
          name: this.name//姓名(选填)
          , number: this.number//身份证号(选填)
          , phone: this.phone//手机号(选填)
          , location: $.trim(this.location)//所在地(选填)
          , auditStatus: this.auditStatus//认证状态(选填)
          , status: this.status//状态(选填)
          , startTime: this.getListTime(this.startTime)//注册日期开始时间(选填)
          , endTime: this.getListTime(this.endTime)//注册日期结束时间(选填)
          , page: 0
          , size: this.size//条数(选填)
          , sid: this.getCookie("cookieSid")
        };
        if (page) {
          dataJson.page = this.page//页数(选填)
        }
        this.apiPost("/api/ops/accountInformationRestApi/findPersonalList?format=json", this.qs.stringify(dataJson)).then(function (res) {
          if (res.code == 0) {
            self.pageTotal = res.total;
            res.data.forEach(function (data) {
              self.midConvert(data);
              if(!data.certificateNumber){
                data.certificateNumber=""
              }
              data.isShowImgList=false;
              if(!data.idcardAliyunUrl){
                data.isShowImgList=true;
              }
              datas.push(data);
            })
          } else {
            console.log(res.msg);
          }
        }).catch(function (e) {
          console.log(e);
        })
        return datas;
      },
      changeTableColumns(){
        this.currentPage = 1;
        this.data1 = this.getPersonalInfoData();
      },
      getCityInfo(){
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
      //导出功能
      exportData () {
        window.location.href = HOST + "/api/ops/accountInformationRestApi/exportPersonalList?format=json&sid=" + this.getCookie("cookieSid")
          + "&name=" + encodeURI(encodeURI(this.name))
          + "&phone=" + this.phone
          + "&number=" + this.number
          + "&location=" + encodeURI(encodeURI(this.location))
          + "&auditStatus=" + this.auditStatus
          + "&status=" + this.status
          + "&startTime=" + this.formatDate(this.startTime)
          + "&endTime=" + this.formatDate(this.endTime)
          + "&size=" + this.pageTotal
      },
      //查看详情
      todoDetail(index) {
        var self = this;
        var dataJson = {
          format: "json",
          userId: this.data1[index].userId, //用户ID
          sid: this.getCookie("cookieSid")
        }
        this.personalHData = [];
        this.personalBData = [];
        this.apiPost("/api/ops/accountInformationRestApi/findPersonalUserDetail", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              res.data.forEach(function (data) {
                self.midConvert(data);
                data.threealipay = data.thirdInfoRpcVo.alipay;
                data.threeweChat = data.thirdInfoRpcVo.weChat;
                data.threeoicq = data.thirdInfoRpcVo.oicq;
                data.alipayBindDate = data.thirdInfoRpcVo.alipayBindDate;//支付宝绑定时间
                data.weChatBindDate = data.thirdInfoRpcVo.weChatBindDate;//微信绑定时间
                data.oicqBindDate = data.thirdInfoRpcVo.oicqBindDate;//qq绑定时间

                switch (data.identity) {
                  case 0:
                    data.identity = "学生";
                    break;
                  case 1:
                    data.identity = "自由工作者";
                    break;
                  case 2:
                    data.identity = "兼职人员";
                    break;
                }
                data.isShowImg=true;
                if(!data.personalUserAttributeRestVo.logo){
                  data.isShowImg=false;
                }
                self.personalHData.push(data);
                self.personalBData.push(data);
              })
            } else {
              console.log(res.msg);
            }
          }).catch(function (e) {
          console.log(e);
        })
        this.personalInfoModal = true;
      },
      //禁用和启用
      unabledTodo(index){
        var self = this, isFalse = true
          , html = "<div>您确定要启用该用户？</div>";
        if (this.data1[index].isStart != 2) {
          isFalse = false;
          html = "<div>您确定要禁用该用户？</div>"
            + "<div>停用后该用户将不能登录打零工系统</div>"
        }
        this.$Modal.confirm({
          content: html,
          onOk: function () {
            self.todoProhibit(index, isFalse)
          }
        })
      },
      todoProhibit(index, isFalse){
        var dataJson = {
          userId: this.data1[index].userId,
          relieve: isFalse,
          sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/accountInformationRestApi/forbiddenOrRelieve", this.qs.stringify(dataJson))
          .then(function (res) {
            console.log(res.msg);
          }).catch(function (e) {
          console.log(e);
        });
        window.location.reload();
      },
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
        this.data1 = this.getPersonalInfoData(1);
      }
    },
    mixins: [http]
  }
</script>
<style>
  .personageInfo .left {
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
</style>
