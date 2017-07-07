<template>
  <div class="agentInfo">
    <!--title-->
    <div class="title clearfix">
      <div class="left">
        <Select v-model="condition" style="width:120px;">
          <Option v-for="item in conditionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-if="condition===0" v-model="name" placeholder="请输入企业名" style="width:180px;"/>
        <Input v-else-if="condition===1" v-model="number" placeholder="请输入营业执照" style="width:180px;"/>
        <Input v-else-if="condition===3" v-model="contact" placeholder="请输入联系人" style="width:180px;"/>
        <Input v-else-if="condition===4" v-model="contactPhone" placeholder="请输入联系人手机号" style="width:180px;"/>
        <Input v-else v-model="phone" placeholder="请输入注册手机号" style="width:180px;"/>
        <Select v-model="agentStatus" style="width:120px;">
          <Option v-for="item in OwnedPlatformList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <label>代理日期</label>
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
    <!--查看-->
    <Modal v-model="agentInfoModal" title="查看详情" class="modal modalW" style="padding: 10px;">
      <h4><span>企业信息</span></h4>
      <Table class="tabord" border :columns="personalHeader" :data="personalHData" ref="table" size="small"
      ></Table>
      <h4><span>代理信息</span></h4>
      <Table class="tabord" border :columns="personalBody" :data="personalHData" ref="table" size="small"></Table>
      <h4 style="display: none"><span>绑定账户账户</span></h4>
      <Table style="display: none" class="tabord" border :columns="personalFoot" :data="personalHData" ref="table"
             size="small"></Table>
      <div slot="footer">
        <Button type="success" size="large" long @click="agentInfoModal = false"
                style="background-color: #18A689;border-color: #18A689;">关闭
        </Button>
      </div>
    </Modal>
    <!--禁用-->
    <Modal v-model="forbidden" title="屏蔽提示" class="modal">
      <p>您确定要禁用用该用户？</p>
      <p>停用后该用户将不能登录打零工系统。</p>
    </Modal>
    <!--拒绝-->
    <Modal v-model="reject" title="拒绝提示" class="modal">
      <textarea placeholder="请输入拒绝原因"></textarea>
    </Modal>
    <!--设为代理商-->
    <Modal v-model="agency" title="设为供应商" class="agent clearfix">
      <Form :label-width="80">
        <Form-item label="代理等级">
          <Select v-model="agentLevel" style="width:22%;text-align: left;" @on-change="changeRate(agentLevel)">
            <Option v-for="item in agentLevelList" :value="item.value" :key="item">{{ item.label }}</Option>
          </Select>
          <div style="color: red;text-align: left">省级运营中心，需要选择负责的省份</div>
        </Form-item>
        <Form-item label="负责区域">
          <Select name="province" v-model="sheng" style="width:39%;margin-bottom: 10px;"
                  @on-change="getAdrress(sheng,2)">
            <Option v-for="item in shengList" :value="item.areaCode" :key="item">{{ item.areaName }}</Option>
          </Select>
          <Select name="city" v-show="agentLevel==2||agentLevel==3||agentLevel==4" v-model="shi"
                  style="width:39%;margin-bottom: 10px;" @on-change="getAdrress(shi,3)">
            <Option v-for="item in shiList" :value="item.areaCode" :key="item">{{ item.areaName }}</Option>
          </Select>
          <Select name="area" v-show="agentLevel==3||agentLevel==4" v-model="qu" style="width:39%;"
                  @on-change="getAdrress(qu,4)">
            <Option v-for="item in quList" :value="item.areaCode" :key="item">{{ item.areaName }}</Option>
          </Select>
          <Select name="village" v-show="agentLevel==4" v-model="xian" style="width:39%;">
            <Option v-for="item in xianList" :value="item.areaCode" :key="item">{{ item.areaName }}</Option>
          </Select>
        </Form-item>
        <Form-item label="服务费">
          <Input v-model="fee" style="width: 22%" disabled/><span>&nbsp;%</span>
        </Form-item>
        <Form-item label="备注">
          <Input v-model="marks" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入内容"
                 style="width: 80%"></Input>
        </Form-item>
      </Form>
      <div slot="footer">
        <Button size="large" @click="agency=false">关闭
        </Button>
        <Button type="success" size="large" @click="setAgentTodo('formValidate')"
                style="background-color: #18A689;border-color: #18A689;">确定
        </Button>
      </div>
    </Modal>

  </div>
</template>
<script>
  import http from '../../assets/js/http'
  export default {
    name: 'agentInfo',
    data () {
      return {
        conditionList: this.$store.state.company.companyInfo.conditionList,
        OwnedPlatformList: this.$store.state.company.companyInfo.OwnedPlatformList,
        condition: '',
        name: "" //企业名(选填)
        , number: ""//营业执照(选填)
        , phone: ""//注册手机号(选填)
        , contact: ""//联系人(选填)
        , contactPhone: ""//联系人手机号(选填)
        , agentStatus: ""//状态(选填)
        , startTime: ""//注册日期开始时间(选填)
        , endTime: ""//注册日期结束时间(选填)
        , query: {
          width: '315px',
          display: 'inline-block'
        }
        , startDate: {}
        , endDate: {
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
            title: '企业名称',
            key: 'name',
            render (row, column, index) {
              return `<div size="small">${row.name}</div><div size="small" class="xpublish">${row.registrationNumber}</div>`;
            }
          },
          {
            title: '注册手机号',
            key: 'phone'
          },
          {
            title: '联系信息',
            key: 'telInfo',
            render (row, column, index) {
              return `<div size="small">${row.contact}</div><div size="small">${row.contactTelephone}</div>`;
            }
          },
          {
            title: '代理区域',
            key: '',
            render (row, column, index) {
              return `<span size="small">${row.agentProvinceName}</span>&nbsp;
                      <span size="small">${row.agentCityName}</span>&nbsp;
                      <span size="small">${row.agentAreaName}</span>&nbsp;
                      <span size="small">${row.agentVillageName}</span>`;
            }
          },
          {
            title: '服务费（%）',
            width: 90,
            key: 'agentTaxRate'
          },
          {
            title: '代理时间',
            key: 'operateTime'
          },
          {
            title: '金橙数',
            width: 80,
            key: 'orangeCount'
          },
          {
            title: '状态',
            width: 90,
            key: 'agentStatus'
          },
          {
            title: '审核人',
            width: 90,
            key: 'operateUsername'
          },
          {
            title: '操作',
            key: 'operation',
            render (row, column, index) {
              return `<i-button type="text" size="small" @click="todoAgentDetail(${index})">查看</i-button>
                      <i-button type="text" size="small" @click="toShowAgent(${index})">修改</i-button>
                      <i-button type="text" size="small" @click="cancelData(${index})">取消</i-button>
                      <i-button v-if="${row.isStart}==0" type="text" size="small" @click="unabledTodo(${index})">启用</i-button>
                      <i-button v-else type="text" size="small" @click="unabledTodo(${index})">禁用</i-button>`;
            }
          }
        ],
        data1: this.getAgentInfoData(),
        agentInfoModal: false//查看详情
        , personalHeader: [
          {
            title: "注册手机号",
            key: "contactTelephone",
            render(row, column, index){
              return `<span>${row.enterpriseUserAttributeRestVo.contactTelephone}</span>`
            }
          }
          , {
            title: "认证状态",
            key: "auditStatus",
            render(row, column, index){
              return `<span v-if="${row.isIdentify == 1}" class="xfail">${row.auditStatus}</span>
                        <span v-else >${row.auditStatus}</span>`
            }
          }
          , {
            title: "企业名称",
            key: "name",
            render(row, column, index){
              return `<span>${row.enterpriseUserAttributeRestVo.name}</span>`
            }
          }
          /*, {
           title: "用户类型",
           key: "",
           render(row, column, index){
           return `<span>代理商</span>`
           }
           }*/
          , {
            title: "所在地址",
            key: 'location',
            render (row, column, index) {
              return `<span size="small">${row.enterpriseUserAttributeRestVo.provinceName}</span>
                      -<span size="small">${row.enterpriseUserAttributeRestVo.cityName}</span>
                      -<span size="small">${row.enterpriseUserAttributeRestVo.areaName}</span>`;
            }
          }
          , {
            title: "详细地址",
            key: "address",
            render(row, column, index){
              return `<span>${row.enterpriseUserAttributeRestVo.address}</span>`
            }
          }
          , {
            title: "联系人姓名",
            key: "contact",
            render(row, column, index){
              return `<span>${row.enterpriseUserAttributeRestVo.contact}</span>`
            }
          }
          , {
            title: "联系方式",
            key: "contactTelephone",
            render(row, column, index){
              return `<span>${row.enterpriseUserAttributeRestVo.contactTelephone}</span>`
            }
          }
          , {
            title: "营业执照",
            key: "registrationNumber"
          }
          , {
            title: "注册时间",
            key: "createTime"
          }
          , {
            title: "营业执照",
            key: "",
            render(row, column, index){
              return `<Tooltip placement="left">
                        <div v-show="${row.isShowImg}" style="color: red;font-size: 12px;">*查看</div>
                        <img v-show="${row.isShowImg}" style="width: 40px;" src="${row.enterpriseUserAttributeRestVo.businessLicense}" />
                        <div slot="content" style="width:100%;overflow: auto">
                         <img src="${row.enterpriseUserAttributeRestVo.businessLicense}" style='width:100%'>
                        </div>
                      </Tooltip>`
            }
          }
        ]
        , personalHeader1: []
        , personalBody: [
          {
            title: "操作人",
            key: "operateUsername"
          },
          {
            title: "代理时间",
            key: "operateTime"
          },
          {
            title: "代理等级",
            key: "agentLevel"
          },
          {
            title: "负责区域",
            key: "agentArea"
          },
          {
            title: "备注",
            key: "operateRemark"
          }
        ]
        , personalFoot: [
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
          }
        ]
        , personalHData: []
        , showImg: false
        , agentLevelList: [
          {
            value: 1,
            label: '省'
          },
          {
            value: 2,
            label: '市'
          },
          {
            value: 3,
            label: '区'
          },
          {
            value: 4,
            label: '县'
          }
        ],
        shengList: this.getAdrress(0, 1),
        shiList: [],
        quList: [],
        xianList: [],
        agentLevel: 4,
        sheng: 0,
        shi: 0,
        qu: 0,
        xian: 0
        , fee: 0
        , marks: "",
        agency: false,
        agentIndex: 0
        , currentPage: 0
        , pageTotal: 0
        , size: 10//条数(选填)
        , page: 0//页数(选填)
      }
    },
    methods: {
      midConvert(data){
        var self = this;
        data.createTime = self.formatDateTime(data.createTime);
        data.operateTime = self.formatDateTime(data.operateTime);
        data.isStart = data.agentStatus;//判断禁止启用状态
        data.isIdentify = data.auditStatus;//判断是否认证
        //认证状态
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
        //用户状态
        switch (data.agentStatus) {
          case 0:
            data.agentStatus = "禁用";
            break;
          case 1:
            data.agentStatus = "正常";
            break;
        }
        data.dataLevel = data.agentLevel;
        switch (data.agentLevel) {//1.省,2.市,3.区,4.乡镇
          case 1:
            data.agentLevel = "省";
            break;
          case 2:
            data.agentLevel = "市";
            break;
          case 3:
            data.agentLevel = "区";
            break;
          case 4:
            data.agentLevel = "乡镇";
            break;
        }
      },
      getAgentInfoData(index){
        var self = this;
        var datas = [];
        this.todoWithPage();
        var dataJson = {
          name: this.name//企业名(选填)
          , number: this.number//营业执照(选填)
          , phone: this.phone//注册手机号(选填)
          , contact: this.contact//联系人(选填)
          , contactPhone: this.contactPhone//联系人手机号(选填)
          , status: this.agentStatus//状态(选填)
          , startTime: this.getListTime(this.startTime)//注册日期开始时间(选填)
          , endTime: this.getListTime(this.endTime)//注册日期结束时间(选填)
          , page: 0//页数(选填)
          , size: this.size//条数(选填)
          , sid: this.getCookie("cookieSid")
        };
        if (index) {
          dataJson.page = this.page;//页数(选填)
        }
        this.apiPost("/api/ops/accountInformationRestApi/findEnterpriseAgentList?format=json", this.qs.stringify(dataJson)).then(function (res) {
          if (res.code == 0) {
            self.pageTotal = res.total;
            res.data.forEach(function (xData) {
              self.midConvert(xData);
              datas.push(xData);
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
        this.data1 = this.getAgentInfoData();
      },
      //获取四级联动
      getAdrress: function (indexCd, level) {
        var dataJson = {
          format: "json",
          parentId: indexCd,
          areaLevel: level,
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
        if (level == 1) {
          return datas;
        } else if (level == 2) {
          this.shiList = datas;
        } else if (level == 3) {
          this.quList = datas;
        } else if (level == 4) {
          this.xianList = datas;
        }
      },
      //手动计算服务费
      changeRate: function (value) {
        switch (value) {
          case 1:
            this.fee = 3;
            break;
          case 2:
            this.fee = 5;
            break;
          case 3:
            this.fee = 10;
            break;
          case 4:
            this.fee = 52;
            break;
        }
      },
      exportData () {
        window.location.href = HOST + "/api/ops/accountInformationRestApi/exportEnterpriseAgentList?format=json&sid=" + this.getCookie("cookieSid")
          + "&name=" + encodeURI(encodeURI(this.name))
          + "&number=" + this.number
          + "&phone=" + this.phone
          + "&contact=" + encodeURI(encodeURI(this.contact))
          + "&contactPhone=" + this.contactPhone
          + "&status=" + this.agentStatus
          + "&startTime=" + this.formatDate(this.startTime)
          + "&endTime=" + this.formatDate(this.endTime)
          + "&size=" + this.pageTotal
        /*+ "&page=" + this.page*/
      },
      todoAgentDetail(index){
        var self = this;
        self.personalHData = [];
        var dataJson = {
          format: "json",
          enterpriseId: this.data1[index].userEnterpriseAttributeId,
          sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/accountInformationRestApi/findEnterpriseAgentDetail", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              res.data.forEach(function (data) {
                self.midConvert(data);
                data.operateTime = self.formatDateTime(data.operateTime);
                self.detImg = data.enterpriseUserAttributeRestVo.businessLicense;
                //代理区域
                var agentProvinceName = data.agentProvinceName ? data.agentProvinceName : "";
                var agentCityName = data.agentCityName ? "-" + data.agentCityName : "";
                var agentAreaName = data.agentAreaName ? "-" + data.agentAreaName : "";
                var agentVillageName = data.agentVillageName ? "-" + data.agentVillageName : "";
                data.agentArea = agentProvinceName + agentCityName + agentAreaName + agentVillageName
                data.threealipay = data.thirdInfoRpcVo.alipay;
                data.threeweChat = data.thirdInfoRpcVo.weChat;
                data.threeoicq = data.thirdInfoRpcVo.oicq;
                data.alipayBindDate = self.formatDateTime(data.thirdInfoRpcVo.alipayBindDate);//支付宝绑定时间
                data.weChatBindDate = self.formatDateTime(data.thirdInfoRpcVo.weChatBindDate);//微信绑定时间
                data.oicqBindDate = self.formatDateTime(data.thirdInfoRpcVo.oicqBindDate);//qq绑定时间

                data.address = data.enterpriseUserAttributeRestVo.address
                data.contact = data.enterpriseUserAttributeRestVo.contact
                data.contactTelephone = data.enterpriseUserAttributeRestVo.contactTelephone
                data.registrationNumber = data.enterpriseUserAttributeRestVo.registrationNumber

                data.isShowImg = true;
                if (!data.enterpriseUserAttributeRestVo.businessLicense) {
                  data.isShowImg = false;
                }
                self.personalHData.push(data);
              })
              self.agentInfoModal = true;
            } else {
              console.log(res.msg);
            }
          }).catch(function (e) {
          console.log(e);
        })

      },
      unabledTodo(index){
        var self = this, isFalse = true, html = "<div>您确定要启用该用户？</div>";
        if (this.data1[index].isStart != 0) {
          isFalse = false;
          html = "<div>您确定要禁用用该用户？</div>"
            + "<div>停用后该用户将不能登录打零工系统</div>"
        }
        this.$Modal.confirm({
          content: html,
          onOk: function () {
            init();
          }
        })
        function init() {
          var dataJson = {
            format: "json",
            userEnterpriseAttributeId: self.data1[index].userEnterpriseAttributeId,
            relieve: isFalse,
            sid: self.getCookie("cookieSid")
          }
          self.apiPost("/api/ops/accountInformationRestApi/forbiddenOrRelieveAgent", self.qs.stringify(dataJson))
            .then(function (res) {
              console.log(res.msg);
            }).catch(function (e) {
            console.log(e);
          })
          window.location.reload();
        }

      },
      cancelData(index){
        var self = this;
        this.$Modal.confirm({
          content: "<div>您确定要取消该企业代理商资格？</div>"
          + "<div>取消后该供应商降级为企业用户。</div>",
          onOk: function () {
            init();
          }
        })
        function init() {
          var dataJson = {
            format: "json",
            enterpriseId: self.data1[index].userEnterpriseAttributeId, //企业id
            userId: self.data1[index].userId,//用户ID
            sid: self.getCookie("cookieSid")
          }
          self.apiPost("/api/ops/accountInformationRestApi/cancelAgent", self.qs.stringify(dataJson))
            .then(function (res) {
              console.log(res);
              window.location.reload();
            }).catch(function (e) {
            console.log(e);
          })
        }

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
        this.data1 = this.getAgentInfoData(1);
      },
      toShowAgent: function (index) {
        this.agentIndex = index;
        this.agentLevel = this.data1[index].dataLevel;
        this.sheng = this.data1[index].agentProvinceId;
        this.shi = this.data1[index].agentCityId;
        this.qu = this.data1[index].agentAreaId;
        this.xian = this.data1[index].agentVillageId;
        this.fee = this.data1[index].agentTaxRate;
        this.marks = this.data1[index].agentComment;
        this.agency = true;
      },

      todoVerify(){
        if (this.agentLevel == "") {
          $(".ivu-select-selection")
            .css("border-color", "#d7dde4");
          this.$Message.error('请选择代理等级!');
          this.addModal = true;
          $("[name='agentLevel']").find(".ivu-select-selection")
            .css("border-color", "red");
          return false;
        }
        if (this.sheng == "") {
          $(".ivu-select-selection")
            .css("border-color", "#d7dde4");
          this.$Message.error('请选择省!');
          this.addModal = true;
          $("[name='province']").find(".ivu-select-selection")
            .css("border-color", "red");
          return false;
        }
        if (this.agentLevel == 2) {
          if (this.shi == "") {
            $(".ivu-select-selection")
              .css("border-color", "#d7dde4");
            this.$Message.error('请选择市!');
            this.addModal = true;
            $("[name='city']").find(".ivu-select-selection")
              .css("border-color", "red");
            return false;
          }
        }
        if (this.agentLevel == 3) {
          if (this.shi == "") {
            $(".ivu-select-selection")
              .css("border-color", "#d7dde4");
            this.$Message.error('请选择市!');
            this.addModal = true;
            $("[name='city']").find(".ivu-select-selection")
              .css("border-color", "red");
            return false;
          }
          if (this.qu == "") {
            $(".ivu-select-selection")
              .css("border-color", "#d7dde4");
            this.$Message.error('请选择区!');
            this.addModal = true;
            $("[name='area']").find(".ivu-select-selection")
              .css("border-color", "red");
            return false;
          }
        }
        if (this.agentLevel == 4) {
          if (this.shi == "") {
            $(".ivu-select-selection")
              .css("border-color", "#d7dde4");
            this.$Message.error('请选择市!');
            this.addModal = true;
            $("[name='city']").find(".ivu-select-selection")
              .css("border-color", "red");
            return false;
          }
          if (this.qu == "") {
            $(".ivu-select-selection")
              .css("border-color", "#d7dde4");
            this.$Message.error('请选择区!');
            this.addModal = true;
            $("[name='area']").find(".ivu-select-selection")
              .css("border-color", "red");
            return false;
          }
          if (this.xian == "") {
            $(".ivu-select-selection")
              .css("border-color", "#d7dde4");
            this.$Message.error('请选择县!');
            this.addModal = true;
            $("[name='village']").find(".ivu-select-selection")
              .css("border-color", "red");
            return false;
          }
        }
        $(".ivu-select-selection")
          .css("border-color", "#d7dde4");
        return true;
      },
      setAgentTodo: function () {
        var index = this.agentIndex, self = this;
        var agentProvinceName = $.trim($("[name='province']").find("span.ivu-select-selected-value").html()),
            agentCityName = $.trim($("[name='city']").find("span.ivu-select-selected-value").html()),
            agentAreaName = $.trim($("[name='area']").find("span.ivu-select-selected-value").html()),
            agentVillageName = $.trim($("[name='village']").find("span.ivu-select-selected-value").html());
        if (!this.todoVerify()) {
          return false;
        }
        switch (this.agentLevel) {//1.省,2.市,3.区,4.县
          case 3:
            this.xian = "";
            agentVillageName ="";
            break;
          case 2:
            this.qu = "";
            this.xian = "";
            agentAreaName = "";
            agentVillageName ="";
            break;
          case 1:
            this.shi = "";
            this.qu = "";
            this.xian = "";
            agentCityName = "";
            agentAreaName = "";
            agentVillageName ="";
            break;
          case 4:
            break;
         /* default:
              this.sheng = "";
              this.shi = "";
              this.qu = "";
              this.xian = "";
              agentProvinceName ="";
              agentCityName = "";
              agentAreaName = "";
              agentVillageName ="";
              break;*/
        }
        var params = {
          formar: "json"
          , agentLevel: this.agentLevel//代理级别(1.省,2.市,3.区,4.乡镇)
          , agentProvinceId: this.sheng //代理省id
          , agentCityId: this.shi //代理市id
          , agentAreaId: this.qu//代理区id
          , agentVillageId: this.xian //代理县id
          , sid: this.getCookie("cookieSid")
        }
        var dataJson = {
          format: "json"
          , id: this.data1[index].id //ID
          , userEnterpriseAttributeId: this.data1[index].userEnterpriseAttributeId
          , agentLevel: this.agentLevel//代理级别(1.省,2.市,3.区,4.乡镇)
          , description: "" //代理描述
          , agentProvinceId: this.sheng //代理省id
          , agentProvinceName: agentProvinceName//代理省名
          , agentCityId: this.shi//代理城市id
          , agentCityName: agentCityName//代理城市名
          , agentAreaId: this.qu//代理区县id
          , agentAreaName: agentAreaName//代理区县名
          , agentVillageId: this.xian//代理乡id
          , agentVillageName: agentVillageName//代理乡名
          , agentComment: this.marks //代理备注
          , agentTaxRate: this.fee //代理商税率(省3%,市5%,区10%,乡镇52%)
          , sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/accountInformationRestApi/findExistAgent", this.qs.stringify(params))
          .then(function (res) {
            if (res.code == 0) {
              if (!res.data[0]) {
                self.apiPost("/api/ops/accountInformationRestApi/updateEnterpriseAgent", self.qs.stringify(dataJson))
                  .then(function (res) {
                    if (res.code == 0) {
                      window.location.reload();
                    } else {
                      self.$Message.error(res.msg);
                    }
                    self.agency = false;
                  }).catch(function (e) {
                  self.$Message.error(e);
                })
              } else {
                self.addModal = false;
                self.$Modal.info({
                  content: "该区域已有代理商，请选择其他区域",
                  onOk: function () {
                    this.addModal = true;
                  }
                });
              }
            }
          }).catch(function (e) {
          console.log(e);
        })
      }
    },
    mount(){
      $("#yyzz").hover(function () {
        $("#bigYyzz").toggle();
      })
    },
    mixins: [http]
  }
</script>
<style>
  .title {
    background-color: #f5f7f9;
    border: 1px solid #e3e8ee;
    padding: 15px 10px;
    margin-bottom: 20px;
  }

  .agentInfo .left {
    width: 800px;
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

  .agency .ivu-modal-body {
    padding: 20px 15%;
  }

  .agency form p {
    margin: 0 0 10px 0;
    text-align: right;
    overflow: hidden;
  }

  .agency form p .uploadLabe {
    float: left;
    margin-left: 38px;
  }

  .agency form p label {
    margin-right: 10px;
  }

  .agency form p label span {
    color: red;
  }

  .agency form .query label {
    height: 34px;
    line-height: 34px;
    display: inline-block;
    padding: 0 5px;
    float: right;
    margin: 0;
  }

  .agency form .query .label {
    margin-right: 10px;
  }

  .agency form p textarea {
    border-color: #e3e8ee;
    width: 80%;
    padding: 10px;
    height: 80px;
  }

  .agency form p .textarea {
    position: relative;
    top: -65px;
  }

  .query .label {
    float: right;
  }

  .query button {
    margin-left: 5px;
    height: 32px;
  }

  .query .search {
    background-color: #18A689;
    border-color: #18A689;
  }

  .query .ivu-row {
    float: right;
  }

  .ivu-tooltip-popper .ivu-tooltip-inner, .ivu-tooltip-inner {
    max-width: 800px;
    background-color: transparent;
  }
</style>

