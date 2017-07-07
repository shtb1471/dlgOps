<template>
  <div class="pendDetail">
    <Breadcrumb separator=">">
      <Breadcrumb-item href="/index">真我</Breadcrumb-item>
      <Breadcrumb-item v-if="$route.params.tag==0" href="/index?name=1">待处理</Breadcrumb-item>
      <Breadcrumb-item v-if="$route.params.tag==1" href="/index/information?name=2">个人信息</Breadcrumb-item>
      <Breadcrumb-item>详情</Breadcrumb-item>
    </Breadcrumb>
    <div class="modal modalW">
      <div class="listDetail">
        <h4><span>个人信息</span></h4>
        <Table class="tabord" border :columns="detailHeader" :data="detailData" ref="table" size="small"></Table>
        <Table class="tabord" border :columns="detailHeader1" :data="detailData" ref="table" size="small"></Table>
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
          <div class="form-group">
            <label style="top: -26px;position: relative;">备注</label>
            <textarea class="ivu-input" style="width: 240px;" v-model="remark" placeholder="请输入右手食指"/>
          </div>
        </div>

        <div slot="footer" style="text-align: right">
          <span style="display: inline-block;width: 20px;">&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <Button type="success" @click="todoSubmit">保存</Button>
          <span v-if="$route.params.tag==0" style="display: inline-block;width: 20px;">&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <Button v-if="$route.params.tag==0" type="warning" @click="refuseModal=true">驳回</Button>
          <span style="display: inline-block;width: 20px;">&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <Button type="primary" @click="goBack()">返回</Button>
        </div>
      </div>
    </div>
    <!--添加数据-->
    <Modal v-model="refuseModal" width="420">
      <p slot="header">
        <span>驳回</span>
      </p>
      <Form ref="formItem" style="margin: 0px auto">
        <Form-item>
          <textarea class="ivu-input" style="height:160px" v-model="formItem.reason" name="name"
                    placeholder="请输入驳回原因"></textarea>
        </Form-item>
      </Form>
      <div slot="footer">
        <Button type="primary" size="large" long @click="todoRefuse">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import http from '../../assets/js/http'
  export default{
    data(){
      return {
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
            key: 'username',
            render(row, column, index){
                return `<span>${row.userRestVo.username}</span>`
            }
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
                       <div v-show="${row.isShowImg}"><img style="width: 40px;" src="${row.rightH}" /></div>
                      <div slot="content" style="width: 100%;overflow: auto">
                       <img src="${row.rightH}" style='width:100%'>
                      </div>
                       </Tooltip>
              `
            }
          }
        ],
        detailHeader1: [
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
        detailData: this.todoCaculate(),
        userIndex: 0,
        ringFingerLength: 0,
        indexFingerLength: 0,
        personalityName: "",
        personalityId: "",
        remark: "",
        refuseModal: false,
        formItem: {
          reason: ""
        }
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
        }
      },
      /*详情*/
      todoCaculate(){
        this.detailData = [];
        var self = this, datas = [];
        var dataJson = {
          format: "json"
          , id: this.$route.params.id
          , sid: this.getCookie("cookieSid")
        }
        this.apiPost(zwHOST + "/zw/userHandApi/handleForm", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              res.data.forEach(function (data) {
                data.userRestVo.createTime = self.formatDateTime(data.userRestVo.createTime);
                self.midConvertData(data);
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
                self.ringFingerLength = data.ringFingerLength;
                self.indexFingerLength = data.indexFingerLength;
                self.personalityName = data.personalityName
                self.remark = data.remark
                datas.push(data);
              })
            }
          }).catch(function (e) {
          console.log(e);
        })
        return datas;
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
      todoSubmit(){
        var self = this, name = "", html = "";
        if (!this.todoVerify()) {
          return false;
        }
        if (this.detailData[this.userIndex].isXex == null||this.detailData[this.userIndex].isXex == 3) {
          this.detailData[this.userIndex].isXex = 1
        }
        if(self.ringFingerLength / this.indexFingerLength){
          html = "<div style='margin: 6px auto;font-size: 14px;'>右手食指长度:" + self.ringFingerLength + "</div>" +
            "<div style='margin: 6px auto;font-size: 14px;'>右手无名指长度:" + self.indexFingerLength + "</div>" +
            "<div style='margin: 6px auto;font-size: 14px;'>食指 / 无名指：" + self.ringFingerLength / this.indexFingerLength + "</div>"
          ;
          this.apiGet(zwHOST + "/zw/personalityApi/searchPersonalityByRange?format=json&sid=" + this.getCookie("cookieSid")
            + "&sex=" + this.detailData[this.userIndex].isXex
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
                  , id: self.$route.params.id
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
                      self.apiPost(zwHOST + "/zw/userHandApi/handle", self.qs.stringify(dataJson))
                        .then(function (res) {
                          if (res.code == 0) {
                            self.$Message.info(res.msg);
                            this.openPend = false;
                          }
                        }).catch(function (e) {
                        console.log(e);
                      })
                    } else {
                      self.$Message.error("性格不匹配");
                    }
                    window.location.reload();
                  }
                })
              }
            }).catch(function (e) {
            console.log(e);
          })
        }else{
            $("[name='ringFingerLength']").css("border-color", "red");
            this.$Message.error("请输入手指长度");
        }
      },
      /*返回*/
      goBack(){
        if (this.$route.params.tag == 0) {
          this.$router.replace({path: '/index', query: {name: 1}})
        } else {
          this.$router.replace({path: '/index/information', query: {name: 2}})
        }
      },
      /*驳回*/
      todoRefuse(){
        var self = this;
        var dataJson = {
          format: "json"
          , rejectReason: this.formItem.reason //驳回原因
          , userId: this.detailData[0].userId //用户id
          , imgType: 0 //照片类型  0 右手掌 1 右手背 2 左手掌 3 左手背 4 头像
          , sid: this.getCookie("cookieSid")
        }
        this.apiPost(zwHOST + "/zw/userHandApi/reject", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              self.refuseModal = false;
              self.$Message.info(res.msg);
            }
          }).catch(function (e) {
          console.log(e)
        })
        window.location.reload();
      }
    },
    mixins: [http]
  }
</script>
<style scoped>
  .modalW h4 {
    position: relative;
  }

  .modalW h4 i {
    color: #18a689;
    font-size: 28px;
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
  }

  .listDetail {
    width: 90%;
    margin-top: 12px;
  }

  .itemList li {
    padding: 12px;
    color: #657180;
    font-size: 12px;
  }

  .vue-content {
    padding: 12px 18px;
    line-height: 24px;
  }
</style>
