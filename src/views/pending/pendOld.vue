<template>
  <div class="pending">
    <div class="title clearfix">
      <div class="left">
        <Select v-model="condition" style="width:120px;">
          <Option v-for="item in conditionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-if="condition==2" v-model="name" placeholder="请输入姓名" style="width: 180px;"></Input>
        <Input v-else v-model="phone" placeholder="请输入手机号" style="width: 180px;"></Input>
        <Button type="success" class="search" @click="changeTableColumns">查询</Button>
      </div>
    </div>
    <!--列表-->
    <div class="table">
      <Table border :columns="columns" :data="dataPend" ref="table" size="small" highlight-row></Table>
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
    <Modal v-model="openPend" title="查看详情" class="modal modalW" style="padding: 10px;">
      <h4><span>个人信息</span></h4>
      <Table class="tabord" border :columns="detailHeader" :data="detailData" ref="table" size="small"></Table>
      <h4><span>手指长度</span></h4>
      <div class="tabord">
        <div class="form-group">
          <label>右手无名指(cm)</label>
          <input class="ivu-input" name="ringFingerLength" v-model="ringFingerLength" placeholder="请输入右手无名指"/>
        </div>
        <div class="form-group">
          <label>右手食指(cm)</label>
          <input class="ivu-input" name="indexFingerLength" v-model="indexFingerLength" placeholder="请输入右手食指"/>
        </div>
        <div class="form-group">
          <label>食指/无名指比例</label>
          <input class="ivu-input" :value="ringFingerLength/indexFingerLength?ringFingerLength/indexFingerLength:0"
                 placeholder="请输入食指/无名指" disabled/>
        </div>
        <!--<div class="form-group">
          <label style="top: -26px;position: relative;">性格</label>
          <textarea class="ivu-input" name="personalityName" style="width: 240px;" v-model="personalityName"
                    placeholder="请输入右手食指" disabled/>
        </div>-->
        <div class="form-group">
          <label style="top: -26px;position: relative;">备注</label>
          <textarea class="ivu-input" style="width: 240px;" v-model="remark" placeholder="请输入右手食指"/>
        </div>
      </div>

      <div slot="footer">
        <Button type="text" @click="openPend=false">关闭</Button>
        <Button type="primary" @click="todoSubmit">保存</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import http from '../../assets/js/http'
  export default({
      data(){
        return {
          conditionList: this.$store.state.pend.conditionList,
          condition: "",
          name: "",
          phone: "",
          columns: [
            {
              type: 'index',
              width: 56,
              align: 'center'
            },
            {
              title: '手机号',
              key: 'phone'
            },
            {
              title: '姓名',
              key: 'name',
              width: 120,
            },
            {
              title: '昵称',
              key: 'userName'
            },
            {
              title: '性别',
              width: 76,
              key: 'sex'
            },
            {
              title: '身份证号',
              key: 'identityCard'
            },
            {
              title: '测试时间',
              key: 'createTime'
            },
            {
              title: '操作',
              key: 'operation',
              width: 200,
              render (row, column, index) {
                return `<i-button  type="text" size="small" @click="todoCaculate(${index})">处理</i-button>`
              }
            }
          ],
          dataPend: this.getListData(),
          openPend: false,
          detailHeader: [
            {
              title: '手机号',
              key: 'phone'
            }, {
              title: '实名认证',
              key: 'auditStatus'
            }, {
              title: '姓名',
              key: 'name'
            }, {
              title: '昵称',
              key: 'userName'
            }, {
              title: '性别',
              key: 'sex'
            }, {
              title: '身份证号',
              key: 'identityCard'
            }, {
              title: '注册时间',
              key: 'createTime',
              render(row, column, index){
                return `<span>${row.userRestVo.createTime}</span>`
              }
            }, {
              title: '提交时间',
              key: 'createTime'
            },
            {
              title: '右手掌',
              key: "handPicUrl",
              render(row, column, index){
                return ` <Tooltip placement="left">
                       <div v-show="${row.isShowImg}"><img style="width: 40px;" src="${row.handPicUrl}" /></div>
                      <div slot="content" style="width: 100%;overflow: auto">
                       <img src="${row.handPicUrl}" style='width:100%'>
                      </div>
                       </Tooltip>
              `
              }
            }
          ],
          detailData: [],
          userIndex: 0,
          ringFingerLength: 0,
          indexFingerLength: 0,
          personalityName: "",
          personalityId: "",
          remark: "",
          page: 0,
          size: 20,
          pageTotal: 0,
          currentPage: 1
        }
      },
      methods: {//http://zw.dalinggong.com:8520   http://10.20.31.201:8066
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
          switch (data.auditStatus) {
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
          }
        },
        /*列表*/
        getListData(index){
          var datas = [], self = this;
          this.todoWithPage();
          var dataJson = {
            format: "json"
            , phone: this.phone
            , name: this.name
            , size: this.size
            , page: 0
            , status: 0
            , sid: this.getCookie("cookieSid")
          }
          if (index) {
            dataJson.page = this.page;
          }
          this.apiPost(zwHOST+"/api/zw/userHandApi/userList", this.qs.stringify(dataJson))
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
        /*查询*/
        changeTableColumns(){
          this.currentPage = 1;
          this.dataPend = this.getListData();
        },
        /*详情*/
        todoCaculate(index){
          this.detailData = [];
          this.userIndex = index;
          var self = this;
          var dataJson = {
            format: "json"
            , id: this.dataPend[index].id
            , sid: this.getCookie("cookieSid")
          }
          this.apiPost(zwHOST+"/api/zw/userHandApi/handleForm", this.qs.stringify(dataJson))
            .then(function (res) {
              if (res.code == 0) {
                res.data.forEach(function (data) {
                  data.userRestVo.createTime = self.formatDateTime(data.userRestVo.createTime);
                  self.midConvertData(data);
                  data.isShowImg = true;
                  if (!data.handPicUrl) {
                    data.isShowImg = false;
                  }
                  data.isShowLogo = true;
                  if (!data.personalUserAttributeRestVo.logo) {
                    data.isShowLogo = false;
                  }
                  self.ringFingerLength = data.ringFingerLength;
                  self.indexFingerLength = data.indexFingerLength;
                  self.personalityName = data.personalityName
                  self.remark = data.remark
                  self.detailData.push(data);
                })
              }
            }).catch(function (e) {
            console.log(e);
          })
          this.openPend = true;
        },
        /*判断*/
        todoVerify(){
          if (this.ringFingerLength == 0) {
            $("[name='ringFingerLength']").css("border-color", "red");
            this.$Message.error("请输入右手无名指");
            return false;
          }
          if (this.indexFingerLength == 0) {
            $("input,textarea").css("border-color", "#d7dde4");
            $("[name='indexFingerLength']").css("border-color", "red");
            this.$Message.error("请输入右手食指");
            return false;
          }
          $("input,textarea").css("border-color", "#d7dde4");
          return true;
        },
        /*保存*/
        getPersonal(){
          var self = this;
          if (this.dataPend[this.userIndex].isXex == null) {
            this.dataPend[this.userIndex].isXex = 1
          }
          this.apiGet(zwHOST+"/api/zw/personalityApi/searchPersonalityByRange?format=json&sid=" + this.getCookie("cookieSid")
            + "&sex=" + this.dataPend[this.userIndex].isXex
            + "&proportion=" + this.ringFingerLength / this.indexFingerLength)
            .then(function (res) {
              if (res.code == 0) {
                self.personalityName = res.data.name;
                self.personalityId = res.data.id;
              }
            }).catch(function (e) {
            console.log(e);
          })
        },
        todoSubmit(){
          var self = this, name = "", html = "";
          if (!this.todoVerify()) {
            return false;
          }
          if (this.dataPend[this.userIndex].isXex == null) {
            this.dataPend[this.userIndex].isXex = 1
          }
          html = "<div style='margin: 6px auto;font-size: 14px;'>右手食指长度:" + self.ringFingerLength + "</div>" +
            "<div style='margin: 6px auto;font-size: 14px;'>右手无名指长度:" + self.indexFingerLength + "</div>" +
            "<div style='margin: 6px auto;font-size: 14px;'>食指 / 无名指：" + self.ringFingerLength / this.indexFingerLength + "</div>"
          ;
          this.apiGet(zwHOST+"/api/zw/personalityApi/searchPersonalityByRange?format=json&sid=" + this.getCookie("cookieSid")
            + "&sex=" + this.dataPend[this.userIndex].isXex
            + "&proportion=" + this.ringFingerLength / this.indexFingerLength)
            .then(function (res) {
              if (res.code == 0) {
                if (res.data) {
                  self.personalityName = res.data.name;
                  self.personalityId = res.data.id;
                } else {
                  self.personalityName = "暂无匹配性格！"
                }

                html += "<div style='margin: 6px auto;font-size: 14px;'>性格:" + self.personalityName + "</div>"
                var dataJson = {
                  format: "json"
                  , id: self.dataPend[self.userIndex].id
                  , ringFingerLength: self.ringFingerLength
                  , indexFingerLength: self.indexFingerLength
                  , personalityName: self.personalityName
                  , remark: self.remark
                  , sid: self.getCookie("cookieSid")
                }
                if (self.personalityId) {
                  dataJson.status = 0;
                  dataJson.personalityId = self.personalityId;
                }
                self.$Modal.confirm({
                  content: html,
                  onOk(){
                    if (self.personalityId) {
                      self.apiPost(zwHOST+"/api/zw/userHandApi/handle", self.qs.stringify(dataJson))
                        .then(function (res) {
                          if (res.code == 0) {
                            self.$Message.info(res.msg);
                            this.openPend = false;
                          }
                        }).catch(function (e) {
                        console.log(e);
                      })
//                    window.location.reload();
                    }else{
                      self.$Message.error("性格不匹配");
                    }

                  }
                })
              }
            }).catch(function (e) {
            console.log(e);
          })


        },
        handleCurrentChange(val){
          this.page = parseInt(val - 1);
          this.dataPend = this.getListData(1);
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
      mounted() {
        window.addEventListener('keyup', function(e){
          if (e.keyCode === 13) {
            this.changeTableColumns();
          }
        })
      },
      mixins: [http]
    }
  )
</script>
<style>
  .form-group {
    padding: 6px 0px;
    overflow: hidden;
  }

  .form-group label {
    font-weight: bold;
    width: 120px;
    display: inline-block;
    text-align: right;
  }

  .form-group input, .form-group textarea {
    display: inline-block;
    width: 240px;
    margin-left: 15px;
  }
</style>
