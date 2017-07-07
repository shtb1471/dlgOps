<template>
  <div class="pending">
    <div class="title clearfix">
      <div class="left">
        <Select v-model="condition" style="width:120px;">
          <Option v-for="item in conditionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-if="condition==1" v-model="name" placeholder="请输入姓名" style="width: 180px;"></Input>
        <Input v-else-if="condition==2" v-model="identityCard" placeholder="请输入身份证号" style="width: 180px;"></Input>
        <Input v-else v-model="phone" placeholder="请输入手机号" style="width: 180px;"></Input>
        <label>创建日期</label>
        <div class="Query clearfix" :style="query" style="display: inline-block">
          <Date-picker id="startDate" v-model="startTime" type="date" :options="startDate" placeholder="选择日期"
                       style="width: 140px;display: inline-block"></Date-picker>
          <label>~</label>
          <Date-picker type="date" :options="endDate" placeholder="选择日期" style="width: 140px;display: inline-block"
                       v-model="endTime"></Date-picker>
        </div>
        <Button type="success" class="search" @click="changeTableColumns">查询</Button>
      </div>
    </div>
    <!--列表-->
    <div class="table">
      <Table border :columns="columns" :data="dataInfo" ref="table" size="small" highlight-row></Table>
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
    <!--详情-->
    <Modal v-model="openInfoDetail" title="查看详情" class="modal modalW" style="padding: 10px;">
      <h4><span>详情</span></h4>
      <Table class="tabord" border :columns="searchDetail" :data="detailData" ref="table" size="small"></Table>
      <Table class="tabord" border :columns="searchDetailX" :data="detailData" ref="table" size="small"></Table>
      <Table class="tabord" border :columns="updateHeader1" :data="detailData" ref="table" size="small"></Table>
      <h4><span>真我</span></h4>
      <Table class="tabord" border :columns="searchDetailZW0" :data="detailData" ref="table" size="small"></Table>
      <div class="listDetail" v-for="(item,index) in items" :key="item.title">
        <div class="tabord ivu-table-wrapper">
          <div class="ivu-table ivu-table-small ivu-table-border">
            <div class="ivu-table-body">
              <div class="vue-title">{{item.title}}</div>
              <ul class="itemList" cellspacing="0" cellpadding="0" border="0">
                <li class="ivu-table-row" v-for="(cat,indexx) in item.cats" :key="cat.id">
                  <div class="ivu-table-cell vue-content">
                    <b v-if="item.cats.length>1">{{indexx+1}}.</b>&nbsp;
                    {{cat.content}}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" @click="openInfoDetail=false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import http from '../../assets/js/http'
  export default({
      data(){
        return {
          conditionList: this.$store.state.information.conditionList,
          condition: "",
          name: "",
          phone: "",
          identityCard: "",
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
          columns: [
            {
              type: 'index',
              width: 56,
              align: 'center'
            },
            {
              title: '手机号',
              key: 'phone',
              width: 130
            },
            {
              title: '姓名',
              key: 'name',
              width: 74
            },
            {
              title: '昵称',
              key: 'username',
              render(row, column, index){
                return `<span>${row.userRestVo.username}</span>`
              },
              width: 74
            },
            {
              title: '性别',
              width: 76,
              key: 'sex'
            },
            {
              title: '性格',
              key: 'personalityName',
              width: 74
            },
            {
              title: '得分',
              key: 'fingerDiff',
              width: 130
            },
            {
              title: '右手无名指(cm)',
              key: 'ringFingerLength',
              width: 130
            },
            {
              title: '右手食指(cm)',
              key: 'indexFingerLength',
              width: 120
            },
            {
              title: '测试时间',
              key: 'createTime',
              width: 160
            },
            {
              title: '实名认证',
              key: 'auditStatus',
              width: 120
            },
            {
              title: '来源',
              key: 'origin'
            },
            {
              title: '状态',
              key: 'status',
              width: 74
            },
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render (row, column, index) {
                return `<i-button  type="text" size="small" @click="todoDetail(${index})">查看</i-button>
                        <i-button  type="text" size="small" @click="todoCaculate(${index})">编辑</i-button>`
              },
              fixed: "right"
            }
          ],
          dataInfo: this.getListData(),
          //查看
          openInfoDetail: false,
          searchDetail: [
            {
              title: '手机号',
              key: 'phone',
              width: 120
            }, {
              title: '实名认证',
              key: 'auditStatus'
            }, {
              title: '姓名',
              key: 'name'
            }, {
              title: '昵称',
              key: 'username',
              render(row, column, index){
                return `<span>${row.userRestVo.username}</span>`
              }
            }, {
              title: '身份',
              key: 'identity',
              render(row, column, index){
                return `<span>${row.personalUserAttributeRestVo.identity}</span>`
              }
            }, {
              title: '用户类型',
              key: 'userType',
              render(row, column, index){
                return `<span>${row.userRestVo.userType}</span>`
              }
            }, {
              title: '身高',
              key: 'height',
              render(row, column, index){
                return `<span>${row.personalUserAttributeRestVo.height}</span>`
              }
            }, {
              title: '体重',
              key: 'weight',
              render(row, column, index){
                return `<span>${row.personalUserAttributeRestVo.weight}</span>`
              }
            }, {
              title: '性别',
              key: 'sex'
            }, {
              title: '学历',
              key: 'degree',
              render(row, column, index){
                return `<span>${row.personalUserAttributeRestVo.degree}</span>`
              }
            }
          ],
          searchDetailX: [
            {
              title: '身份证号',
              key: 'identityCard'
            }, {
              title: '所在地',
              key: 'location',
              render(row, column, index){
                return `<span>${row.personalUserAttributeRestVo.location}</span>`
              }
            }, {
              title: '个性签名',
              key: 'personalizedSignature',
              render(row, column, index){
                return `<span>${row.personalUserAttributeRestVo.personalizedSignature}</span>`
              }
            }, {
              title: '注册时间',
              key: 'createTime',
              render(row, column, index){
                return `<span>${row.createTime}</span>`
              },
              width: 160
            }
          ],
          searchDetailZW0: [
            {
              title: '右手无名指(cm)',
              key: 'indexFingerLength'
            }, {
              title: '右手食指(cm)',
              key: 'ringFingerLength'
            }, {
              title: '性格',
              key: 'personalityName'
            }, {
              title: '类型',
              key: 'type',
              render(row, column, index){
                return `<span>${row.personalityRestVo.type}</span>`
              }
            }, {
              title: '得分',
              key: 'fingerDiff'
            }
          ],
          items: [],
          detailData: [],
          updateHeader1: [
            {
              title: '右手掌',
              key: "handPicUrl",
              render(row, column, index){
                return ` <Tooltip placement="right">
                       <div v-show="${row.isShowImg}"><img style="width: 40px;" src="${row.rightH}" /></div>
                      <div slot="content" style="width: 100%;overflow: auto">
                       <img src="${row.rightH}" style='width:100%'>
                      </div>
                       </Tooltip>
              `
              }
            },

            {
              title: '右手背',
              key: "handPicUrl",
              render(row, column, index){
                return ` <Tooltip placement="right">
                       <div v-show="${row.isShowImg1}"><img style="width: 40px;" src="${row.rightH1}" /></div>
                      <div slot="content" style="width: 100%;overflow: auto">
                       <img src="${row.rightH1}" style='width:100%'>
                      </div>
                       </Tooltip>
              `
              }
            },

            {
              title: '左手掌',
              key: "handPicUrl",
              render(row, column, index){
                return ` <Tooltip placement="right">
                       <div v-show="${row.isShowImg2}"><img style="width: 40px;" src="${row.leftH}" /></div>
                      <div slot="content" style="width: 100%;overflow: auto">
                       <img src="${row.leftH}" style='width:100%'>
                      </div>
                       </Tooltip>
              `
              }
            }, {
              title: '左手背',
              key: "handPicUrl",
              render(row, column, index){
                return ` <Tooltip placement="left">
                       <div v-show="${row.isShowImg3}"><img style="width: 40px;" src="${row.leftH1}" /></div>
                      <div slot="content" style="width: 100%;overflow: auto">
                       <img src="${row.leftH1}" style='width:100%'>
                      </div>
                       </Tooltip>
              `
              }
            }, {
              title: '头像',
              key: "handPicUrl",
              render(row, column, index){
                return ` <Tooltip placement="left">
                       <div v-show="${row.isShowLogo}"><img style="width: 40px;" src="${row.Logo}" /></div>
                      <div slot="content" style="width: 100%;overflow: auto">
                       <img src="${row.Logo}" style='width:100%'>
                      </div>
                       </Tooltip>
              `
              }
            }, {
              title: '身份证',
              key: "handPicUrl",
              render(row, column, index){
                return ` <Tooltip placement="left">
                       <div v-show="${row.isIDCard}"><img style="width: 40px;" src="${row.IDCard}" /></div>
                      <div slot="content" style="width: 100%;overflow: auto">
                       <img src="${row.IDCard}" style='width:100%'>
                      </div>
                       </Tooltip>
              `
              }
            }
          ],
          page: 0,
          size: 20,
          pageTotal: 0,
          currentPage: 1
        }
      },
      methods: {
        midConvertData(data){
          data.createTime = this.formatDateTime(data.createTime);
          data.isXex = data.personalUserAttributeRestVo.sex;
          switch (data.personalUserAttributeRestVo.sex) {
            case 1:
              data.sex = "男";
              break;
            case 2:
              data.sex = "女";
              break;
            default:
              data.sex = "未知";
              break;

          }
          //status": 1, //状态   0.新建,1.正常,2.冻结
          switch (data.status) {
            case 0:
              data.status = "新建";
              break;
            case 1:
              data.status = "正常";
              break;
            case 2:
              data.status = "冻结";
              break;
          }
          switch (data.userRestVo.auditStatus) {
            case 0:
              data.auditStatus = "未审核";
              break;
            case 1:
              data.auditStatus = "审核中";
              break;
            case 2:
              data.auditStatus = "审核通过";
              break;
            case 3:
              data.auditStatus = "审核失败";
              break;
            default:
              data.auditStatus = "未处理";
              break;
          }
          if (data.ringFingerLength && data.indexFingerLength) {
            data.fingerDiff = data.ringFingerLength / data.indexFingerLength;
          } else {
            data.fingerDiff = 0;
          }
        },
        getListData(index){
          var datas = [], self = this;
          var dataJson = {
            format: "json"
            , phone: this.phone
            , name: this.name
            , identityCard: this.identityCard
            , startTime: this.getListTime(this.startTime)
            , endTime: this.getListTime(this.endTime)
            , size: 20
            , page: 0
//            , status: 1
            , sid: this.getCookie("cookieSid")
          }
          if (index) {
            dataJson.page = this.page;
          }
          this.apiPost(zwHOST + "/zw/userHandApi/userList", this.qs.stringify(dataJson))
            .then(function (res) {
              if (res.code == 0) {
                self.pageTotal = res.total;
                res.data.forEach(function (data) {
                  self.midConvertData(data);
                  datas.push(data);
                })
              }
            }).catch(function (e) {
            console.log(e);
          })
          return datas;
        },
        changeTableColumns(){
          this.currentPage = 1;
          this.dataInfo = this.getListData();
        },
        todoDetail(index){
          var self = this;
          this.openInfoDetail = true;
          this.detailData = [];
          this.items = [];
          var self = this;
          var dataJson = {
            format: "json"
            , id: this.dataInfo[index].id
            , sid: this.getCookie("cookieSid")
          }
          this.apiPost(zwHOST + "/zw/userHandApi/userHand", this.qs.stringify(dataJson))
            .then(function (res) {
              if (res.code == 0) {
                res.data.forEach(function (data) {
                  data.createTime = self.formatDateTime(data.createTime);
                  self.midConvertData(data);
                  switch (data.personalUserAttributeRestVo.identity) {//0.学生,1.自由工作者,2.兼职人员
                    case 0:
                      data.personalUserAttributeRestVo.identity = "学生";
                      break;
                    case 1:
                      data.personalUserAttributeRestVo.identity = "自由工作者";
                      break;
                    case 2:
                      data.personalUserAttributeRestVo.identity = "兼职人员";
                      break;
                  }
                  data.isShowImg = true;
                  data.isShowImg1 = true;
                  data.isShowImg2 = true;
                  data.isShowImg3 = true;
                  data.isIDCard = true;
                  data.isShowLogo = true;
                  data.rightH = "";
                  data.rightH1 = "";
                  data.leftH = "";
                  data.leftH1 = "";
                  data.IDCard = "";
                  data.Logo = "";
                  if (data.handImgRestVoList.length > 0) {
                    for (var i = 0; i < data.handImgRestVoList.length; i++) {
                      switch (i) {
                        case 0:
                          data.rightH = data.handImgRestVoList[0].imgUrl;
                          break;
                        case 1:
                          data.rightH1 = data.handImgRestVoList[1].imgUrl;
                          break;
                        case 2:
                          data.leftH = data.handImgRestVoList[2].imgUrl;
                          break;
                        case 3:
                          data.leftH1 = data.handImgRestVoList[3].imgUrl;
                          break;
                        case 4:
                          data.IDCard = data.handImgRestVoList[4].imgUrl;
                          break;
                        case 5:
                          data.Logo = data.handImgRestVoList[5].imgUrl;
                          break;
                      }
                    }
                  }
                  if (!data.rightH) data.isShowImg = false;
                  if (!data.rightH1) data.isShowImg1 = false;
                  if (!data.leftH) data.isShowImg2 = false;
                  if (!data.leftH1) data.isShowImg3 = false;
                  if (!data.IDCard) data.isIDCard = false;
                  if (!data.Logo) data.isShowLogo = false;
                  if (data.ringFingerLength && data.indexFingerLength) {
                    data.fingerDiff = data.ringFingerLength / data.indexFingerLength;
                  } else {
                    data.fingerDiff = 0;
                  }
                  self.detailData.push(data);
                  if(data.personalityInfoRestVo.items&&data.personalityInfoRestVo.items.length>0){
                    data.personalityInfoRestVo.items.forEach(function (item) {
                      self.items.push(item);
                    })
                  }

                })
              }
            }).catch(function (e) {
            console.log(e);
          })
        },
        /*编辑*/
        todoCaculate(index){
          this.$router.replace({path: '/pend/detail/1/' + this.dataInfo[index].id});
        },
        handleCurrentChange(val){
          this.page = parseInt(val - 1);
          this.dataInfo = this.getListData(1);
        },
        todoWithPage(){
          if (!this.page) {//如果当前页为空则设置为1
            this.page = 0;
          }
          if (!this.size) {//如果分页大小为空则设置为10
            this.size = 20;
          }
        }
      },
      mixins: [http]
    }
  )
</script>
<style scoped>
  .vue-title {
    font-weight: bold;
    background: #f5f7f9;
    padding: 12px;
  }

  ul.itemList li {
    border-top: 1px solid #e3e8ee;
  }

  .vue-content {
    padding: 6px 18px;
    line-height: 24px;
  }
</style>
