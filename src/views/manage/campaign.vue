<template>
  <div class="campaign">
    <!--title-->
    <div class="title clearfix">
      <div class="left">
        <Select v-model="condition" style="width:120px;">
          <Option v-for="item in conditionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-if="condition ===0" v-model="titleInfo" placeholder="请输入标题" style="width: 180px;"></Input>
        <Input v-else v-model="companyName" placeholder="请输入所属公司" style="width: 180px;"></Input>
        <Select v-model="auditStatus" style="width:120px;">
          <Option v-for="item in auditStatusList" :value="item.dataCode" :key="item">{{ item.dataName }}</Option>
        </Select>
        <label>创建日期</label>
        <div class="Query clearfix" :style="query">
          <Date-picker id="startDate" v-model="startTimeX" type="date" :options="startDate" placeholder="选择日期"
                       style="width: 140px;display: inline-block"></Date-picker>
          <label>~</label>
          <Date-picker type="date" :options="endDate" placeholder="选择日期" style="width: 140px;display: inline-block"
                       v-model="endTimeX"></Date-picker>
        </div>
      </div>
      <div class="rightBtn">
        <Button type="success" class="search" @click="search">查询</Button>
        &nbsp;&nbsp;
        <Button type="primary" class="btnSize" @click="updateData">新增</Button>
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
    <!--新增-->
    <Modal v-model="append" class="append modalX clearfix">
      <div slot="header">
        <span v-show="addC">新增提示</span>
        <span v-show="!addC">修改提示</span>
      </div>
      <form id="addForm" name="addForm" :action="actHttp" method="post" enctype="multipart/form-data" target="ifm">
        <p>
          <label><span>*</span> 模块</label>
          <Select id="platform" v-model="auditStatusM" style="width:75%;text-align: left;">
            <Option v-for="item in auditStatusMList" :value="item.dataCode" :key="item">{{ item.dataName }}</Option>
          </Select>
          <input type="hidden" name="platform"/>
          <input type="hidden" name="platformName"/>
          <input type="hidden" name="id"/>
        </p>
        <p>
          <label><span>*</span> 显示顺序</label>
          <Input v-model="order" placeholder="1" style="width: 75%" name="sequencing"></Input>
        </p>
        <p>
          <label><span>*</span> 标题</label>
          <Input v-model="title" style="width: 75%" name="title"></Input>
        </p>
        <p>
          <label><span>*</span>所属公司</label>
          <Input v-model="firm" style="width: 75%" name="companyName"></Input>
        </p>
        <div class="dtaeQuery">
          <p class="query clearfix">
            <label class="label"><span>*</span>有效期</label>
          </p>
          <div class="Query modalDate clearfix" :style='[query,modelDate]'>
            <Date-picker id="startDate1" v-model="startTime" type="date" :options="startDate1"
                         placeholder="选择日期"
                         style="width: 105px;display: inline-block"></Date-picker>
            <label>~</label>
            <Date-picker type="date" :options="endDate1" placeholder="选择日期" style="width: 105px;display: inline-block"
                         v-model="endTime"></Date-picker>
            <input type="hidden" name="startTime"/>
            <input type="hidden" name="endTime"/>
          </div>
        </div>
        <p>
          <label><span>*</span>URL</label>
          <Input v-model="url" style="width: 75%" name="url"></Input>
        </p>
        <p class="clearfix">
          <label class="uploadLabe" style="margin-top: 20px;"><span>*</span>图片</label>
          <span style="float: left;width: 75%;text-align: left">
            <input id="imgFile" name="img" style="margin-top: 20px;-webkit-margin-top:-20px;margin-left: 0px;"
                   type="file"
                   accept="image/*"
                   @click="uploadImg('imgContent','imgFile')"/>
            <span id="imgContent" style="display: block;overflow: hidden">
                <img style="float:left;width:35px;" class="resize-image" src="" alt=""/>
            </span>
          </span>

        </p>
        <p>
          <label class="textarea">摘要</label>
          <textarea v-model="content" placeholder="请输入内容" name="content"></textarea>
        </p>
        <p>
          <button class="ivu-btn ivu-btn-primary" type="button" @click="addCampaign">确定</button>
        </p>
      </form>
      <iframe id='ifm' name='ifm' style="display:none"/>
      <div slot="footer">
      </div>
    </Modal>
  </div>
</template>
<script>
  import http from "../../assets/js/http"

  export default {
    name: 'campaign',
    data () {
      return {
        conditionList: this.$store.state.manage.campaign.conditionList,
        condition: '',
        title: '',
        firm: '',
        order: '',
        auditStatusList: this.queryGroup(),//模块下拉
        auditStatus: '',
        auditStatusM: '',
        auditStatusMList: this.queryGroup(),//模块下拉
        columns4: [
          {
            title: 'ID',
            key: 'id'
          },
          {
            title: '模块ID',
            width: 80,
            key: 'platform'
          },
          {
            title: '模块',
            key: 'platformName'
          },
          {
            title: '顺序',
            width: 70,
            key: 'sequencing'
          },
          {
            title: '标题',
            key: 'title'
          },
          {
            title: '所属公司',
            width: 90,
            key: 'companyName'
          },
          {
            title: '有效期',
            width: 160,
            key: 'endTime',
            render(row, column, index){
              return `<span>${row.startTime}</span>-</span>${row.endTime}</span>`
            }
          }, {
            title: '创建时间',
            width: 160,
            key: 'createTime'
          },
          {
            title: '创建人',
            width: 80,
            key: 'auditUserName'
          },
          {
            title: '状态',
            width: 80,
            key: 'status'
          },
          {
            title: '操作',
            key: 'operation',
            render (row, column, index) {
              return `<i-button type="text" size="small" @click="updateData(${index})">编辑</i-button>
                      <i-button v-if="${row.isAStatus}==0" type="text" size="small" @click="startUsing(${index})">启用</i-button>
                      <i-button v-else type="text" size="small" @click="startUsing(${index})">禁用</i-button>`;
            }
          }
        ],
        data1: this.getData(),
        append: false,
        uploadimg: {
          float: 'left'
        },
        platform: "", //模块id（必填）
        platformName: "", //模块名字（必填）
        sequencing: "",  // 顺序
        title: "", //标题（必填）
        companyName: "", //所属公司（必填）
        startTimeX: "", //开始时间（必填）
        endTimeX: "", //结束时间（必填）
        startDate1: {},//日历
        endDate1: {
          disabledDate (date) {
            return date && date.valueOf() < new Date($("#startDate1").find("input").val()).getTime() - 86400000;
          }
        },//日历
        startTime: "", //开始时间（必填）
        endTime: "", //结束时间（必填）
        url: "", //url（必填）
        imageUrl: "", //图片url（选填）
        content: "",  //摘要
        query: {
          width: '315px',
          display: 'inline-block'
        },//日历插件样式
        startDate: {},//日历
        endDate: {
          disabledDate (date) {
            return date && date.valueOf() < new Date($("#startDate").find("input").val()).getTime() - 86400000;
          }
        },//日历
        modelDate: {
          width: '235px!important',
          position: 'absolute',
          right: '0px',
          top: '0px'
        }//modal日历插件样式
        , addC: false
        , actHttp: ""
        , isStatus: 0,
        refuseIndex: 0,
        currentPage: 1,
        pageTotal: 0,
        page: 0,
        size: 10
      }
    },
    methods: {
      /*数据列表*/
      getData: function (page) {
        var datas = [], self = this;
        this.todoWithPage();
        var dataJson = {
          createTimeStart: this.getListTime(this.startTimeX)//开始时间（选填）
          , createTimeEnd: this.getListTime(this.endTimeX)//结束时间（选填）
          , companyName: this.companyName//所属公司（选填）
          , title: this.titleInfo//活动标题（选填）
          , platform: this.auditStatus //模块（选填）
          , page: 0
          , size: this.size//条数（选填）
          , sid: this.getCookie("cookieSid")
        };
        if (page) {
          dataJson.page = this.page;
        }
        this.apiPost('/api/ops/activityRestApi/findPage?format=json', this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              self.pageTotal = res.total;
              res.data.forEach(function (data) {
                //data.status = 0;
                data.createTime = self.formatDateTime(data.createTime);
                data.startTime = self.formatDate(data.startTime);
                data.endTime = self.formatDate(data.endTime);
                data.isAStatus = data.status;
                switch (data.status) {
                  case 0:
                    data.status = "禁用";
                    break;
                  case 1:
                    data.status = "正常";
                    break;
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
      /*获取字典列表*/
      queryGroup(){
        var datas = [];
        var dataJson = {
          format: 'json',
          groupCode: "activity.platform",
          sid: this.getCookie("cookieSid")
        }
        this.apiPost('/api/ops/dictionaryRest/queryGroup', this.qs.stringify(dataJson)).then(function (res) {
          res.data.forEach(function (data) {
            datas.push(data);
          })
        }).catch(function (e) {
          console.log(e);
        })
        return datas;
      },
      //分页
      todoWithPage(){
        if (!this.size) {//如果分页大小为空则设置为10
          this.size = 10;
        }
        if (!this.page) {//如果分页大小为空则设置为10
          this.page = 0;
        }
      },
      handleCurrentChange(val){
        this.changePage(val);
      },
      changePage(page){
        this.page = parseInt(page - 1);
        this.data1 = this.getData(1);
      },
      /*添加活动*/
      updateData(index){
        var self = this;
        if (/^[0-9]+$/.test(index)) {//修改
          this.addC = false;
          this.actHttp = HOST + "/api/ops/activityRestApi/update?format=json&sid=" + this.getCookie("cookieSid")
          this.auditStatusM = this.data1[index].platform
          $("[name='id']").val(this.data1[index].id);
          $("[name='platformName']").val(this.data1[index].platformName);
          $("[name='selectM'] .ivu-select-selected-value").html(this.data1[index].platformName);
          this.order = this.data1[index].sequencing
          this.title = this.data1[index].title
          this.firm = this.data1[index].companyName
          this.startTime = this.formatDate(this.data1[index].startTime)
          this.endTime = this.formatDate(this.data1[index].endTime)
          this.url = this.data1[index].url;
          $("#imgContent img").attr("src", this.data1[index].imageUrl);
          this.content = this.data1[index].content;
        } else {//增加
          this.addC = true;
          this.actHttp = HOST + "/api/ops/activityRestApi/add?format=json&sid=" + this.getCookie("cookieSid")
          this.auditStatusM = ""
          this.order = ""
          this.title = ""
          this.firm = ""
          this.startTime = ""
          this.endTime = ""
          this.url = ""
          this.imageUrl = ""
          $("#imgFile").val("");
          $("#imgContent img").attr("src", "");
          this.content = ""
        }
        this.append = true;
      },
      todoVerify(){
        if (this.auditStatusM == "") {
          $(".ivu-select-selection")
            .css("border-color", "#d7dde4");
          this.$Message.error('请选择模块!');
          this.addModal = true;
          $("[name='platform']").find(".ivu-select-selection")
            .css("border-color", "red");
          return false;
        }
        if (this.order == "" || !/^[1-9]+$/.test($("[name='sequencing']").val())) {
          $(".ivu-select-selection")
            .css("border-color", "#d7dde4");
          this.$Message.error('请输入正确顺序!');
          this.addModal = true;
          $("[name='sequencing']").css("border-color", "red");
          return false;
        }
        if (this.title == "") {
          $(".ivu-input")
            .css("border-color", "#d7dde4");
          this.$Message.error('请输入标题!');
          this.addModal = true;
          $("[name='title']").css("border-color", "red");
          return false;
        }
        if (this.firm == "") {
          $(".ivu-input")
            .css("border-color", "#d7dde4");
          this.$Message.error('请输入所属公司!');
          this.addModal = true;
          $("[name='companyName']").css("border-color", "red");
          return false;
        }
        if (this.startTime == "") {
          $(".ivu-input")
            .css("border-color", "#d7dde4");
          this.$Message.error('请输入有效期!');
          this.addModal = true;
          $("[name='startTime']").find(".ivu-input").css("border-color", "red");
          return false;
        }
        if (this.endTime == "") {
          $(".ivu-input")
            .css("border-color", "#d7dde4");
          this.$Message.error('请输入有效期!');
          this.addModal = true;
          $("[name='endTime']").find(".ivu-input").css("border-color", "red");
          return false;
        }
        if (this.url == "") {
          $(".ivu-input")
            .css("border-color", "#d7dde4");
          this.$Message.error('请输入URL!');
          this.addModal = true;
          $("[name='url']").css("border-color", "red");
          return false;
        }
        if ($("[name='imageUrl']").val() == "") {
          $(".ivu-input")
            .css("border-color", "#d7dde4");
          this.$Message.error('请上传图片!');
          this.addModal = true;
          $("[name='imageUrl']").focus();
          return false;
        } else {
          $(".ivu-input")
            .css("border-color", "#d7dde4");
          return true;
        }

      },
      addCampaign(){
        if (!this.todoVerify()) {
          return false;
        } else {
          if (this.auditStatusM) {
            $("[name='platform']").val(this.auditStatusM);
          } else {
            $("[name='platform']").val("activity.platform_1");
          }
          $("[name='platformName']").val($("#platform").find(".ivu-select-selected-value").html());
          $("[name='startTime']").val(this.formatDate(this.startTime));
          $("[name='endTime']").val(this.formatDate(this.endTime));
          $("#addForm").submit();
          this.$Message.info("添加成功！");
          setTimeout(function () {
            window.location.reload();
          },1000);
        }

      },
      uploadImg(imgObj, inputFile) {
        var imgContent = document.getElementById(imgObj); //获取显示图片的div元素
        var input = document.getElementById(inputFile);//获取选择图片的input元素

        //这边是判断本浏览器是否支持这个API。
        if (typeof FileReader === 'undefined') {
          imgContent.innerHTML = "抱歉，你的浏览器不支持 FileReader";
          input.setAttribute('disabled', 'disabled');
        } else {
          input.addEventListener('change', readFile, false); //如果支持就监听改变事件，一旦改变了就运行readFile函数。
        }
        function readFile() {
          var file = this.files[0]; //获取file对象

          //判断file的类型是不是图片类型。
          if (!/image\/\w+/.test(file.type)) {
            alert("文件必须为图片！");
            return false;
          }
          var reader = new FileReader(); //声明一个FileReader实例
          reader.readAsDataURL(file); //调用readAsDataURL方法来读取选中的图像文件
          //最后在onload事件中，获取到成功读取的文件内容，并以插入一个img节点的方式显示选中的图片
          reader.onload = function (e) {
            imgContent.innerHTML = '<img style="float:left;width:35px;" class="resize-image" src="' + this.result + '" alt=""/>'
          }
        }
      },
      /*搜索*/
      search()
      {
        this.currentPage = 1;
        this.data1 = this.getData();
      }
      ,
      /*启用/禁用*/
      startUsing(index)
      {
        var xStatus = 1;
        var self = this,
          html = "<div>您确定启用该广告？</div><div>启用后广告恢复正常</div>";
        if (this.data1[index].isAStatus != 0) {
          html = "<div>您确定停用该广告？</div><div>停用后广告将不在前台显示</div>";
          xStatus = 0;
        }
        this.$Modal.confirm({
          content: html,
          onOk: function () {
            self.upDate(index, xStatus);
          }
        })
      }
      ,
      /*公共状态*/
      upDate(index, xxStatus)
      {
        var self = this;
        var dataJson = {
          format: 'json',
          id: self.data1[index].id,
          status: xxStatus,
          sid: this.getCookie('cookieSid')
        }
        this.apiPost('/api/ops/activityRestApi/updateStatu', this.qs.stringify(dataJson)).then(function (res) {
          if (res.code != 0) {
            console.log(res.msg);
          }
        }).catch(function (e) {
          console.log(e);
        })
        window.location.reload();
      }
    },
    mixins: [http],
  }
</script>
<style>
  @import "../../assets/css/reset.css";

  .campaign .left {
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

  .append .ivu-modal-body {
    padding: 20px 20%;
  }

  .append form p {
    margin: 0 0 10px 0;
    text-align: right;
    overflow: hidden;
  }

  .append form p .uploadLabe {
    float: left;
    margin-left: 38px;
  }

  .append form p label {
    margin-right: 10px;
  }

  .append form p label span {
    color: red;
  }

  .append form .query label {
    height: 34px;
    line-height: 34px;
    display: inline-block;
    padding: 0 5px;
    float: right;
    margin: 0;
  }

  .append form .query .label {
    margin-right: 10px;
  }

  .append form .dtaeQuery {
    position: relative;
  }

  .append form .dtaeQuery .query {
    width: 80px;
  }

  .append form p textarea {
    border-color: #e3e8ee;
    width: 75%;
    padding: 10px;
    height: 80px;
  }

  .append form p .textarea {
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
</style>
