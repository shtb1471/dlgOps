<template>
  <div class="baseData">
    <div class="title clearfix">
      <div class="left">
        <Select v-model="condition" style="width:120px;">
          <Option v-for="item in conditionList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-if="condition==0" v-model="name" placeholder="请输入性格" style="width: 180px;"></Input>
        <Input v-if="condition==1" v-model="type" placeholder="请输入类型" style="width: 180px;"></Input>
        <Button type="success" class="search" @click="changeTableColumns">查询</Button>
        <Button type="primary" class="search" @click="addBaseData">新增</Button>
      </div>
    </div>
    <!--列表-->
    <div class="table">
      <Table border :columns="columns" :data="baseData" ref="table" size="small" highlight-row></Table>
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
    <!--添加数据-->
    <Modal v-model="addModal" width="460">
      <p slot="header">
        <span v-if="isAdd">新增</span>
      </p>
      <Form ref="formItem" :label-width="80" style="margin: 0px auto">
        <Form-item label="性格">
          <Input v-model="formItem.name" name="name" placeholder="请输入性格"></Input>
        </Form-item>
        <Form-item label="类型">
          <Input v-model="formItem.type" name="type" placeholder="请输入类型"></Input>
        </Form-item>
        <Form-item label="性别">
          <Radio-group v-model="formItem.radio">
            <Radio label="1">男</Radio>
            <Radio label="2">女</Radio>
          </Radio-group>
        </Form-item>
        <Form-item label="最小值">
          <Input v-model="formItem.min" name="min" placeholder="请输入最小值"></Input>
        </Form-item>
        <Form-item label="最大值">
          <Input v-model="formItem.max" name="max" placeholder="请输入最大值"></Input>
        </Form-item>
      </Form>
      <div slot="footer">
        <Button type="primary" size="large" long @click="addModalOk">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import http from '../../assets/js/http'
  export default {
    data() {
      return {
        conditionList: this.$store.state.baseData.conditionList,
        condition: "",
        name: "",
        type: "",
        columns: [
          {
            type: 'index',
            width: 50
          }, {
            title: "性格",
            key: "name"
          }, {
            title: "类型",
            key: "type"
          }, {
            title: "性别",
            key: "sex"
          }, {
            title: "区间值",
            key: "",
            render(row, column, index){
              return `<span>${row.min}</span>~<span>${row.max}</span>`
            }
          }, {
            title: "操作",
            key: "action",
            render(row, column, index){
              return `<i-button  type="text" size="small" @click="todoUpdate(${index})">编辑</i-button>`
            }
          }
        ],
        baseData: this.getListData(),
        addModal: false,
        formItem: {
          name: "",
          type: "",
          radio:1,
          max: "",
          min: ""
        }
      }
    },
    methods: {
      midConvertData(data){
        switch (data.sex) {
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
      },
      getListData(index){
        var datas = [], self = this;
        var dataJson = {
          format: "json"
          , size: 10
          , page: 0
          , sid: this.getCookie("cookieSid")
        }
        if (this.condition == 0) {
          if (this.name) {
            dataJson.name = this.name//性格
          }
        } else {
          if (this.type) {
            dataJson.type = this.type//类型
          }
        }
        if (index) {
          dataJson.page = this.page;
        }
        this.apiPost(zwHOST + "/zw/personalityApi/findDetail", this.qs.stringify(dataJson))
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
        this.baseData = this.getListData();
      },
      addBaseData(){
        this.addModal = true;
        this.formItem.type=""//类型
        this.formItem.name=""//性格
        this.formItem.radio=1
        this.formItem.min=""//类型
        this.formItem.max=""//性格
      },
      todoVerify(){
        if (this.formItem.name == '') {
          this.$Message.error('请输入性格!');
          this.addModal = true;
          $("input[name='name']")
            .parents(".ivu-form-item")
            .addClass("ivu-form-item-error");
          return false;
        }
        if (this.formItem.type == "") {
          $(".ivu-form-item")
            .removeClass("ivu-form-item-error");
          this.$Message.error('请输入姓名!');
          this.addModal = true;
          $("input[name='type']")
            .parents(".ivu-form-item")
            .addClass("ivu-form-item-error");
          return false;
        }
        if (this.formItem.min == "" || !/^\d+(?:\.\d)?$/.test(this.formItem.min)) {
          $(".ivu-form-item")
            .removeClass("ivu-form-item-error");
          this.$Message.error('请输入最小值!');
          this.addModal = true;
          $("input[name='min']")
            .parents(".ivu-form-item")
            .addClass("ivu-form-item-error");
          return false;
        }
        if (this.formItem.max == "" || !/^\d+(?:\.\d)?$/.test(this.formItem.max)) {
          $(".ivu-form-item")
            .removeClass("ivu-form-item-error");
          this.$Message.error('请输入最大值!');
          this.addModal = true;
          $("input[name='max']")
            .parents(".ivu-form-item")
            .addClass("ivu-form-item-error");
          return false;
        }
        if($("input[name='max']").val()<=$("input[name='min']").val()){
          $(".ivu-form-item")
            .removeClass("ivu-form-item-error");
          this.$Message.error('最大值必须大于最小值!');
          this.addModal = true;
          $("input[name='max']")
            .parents(".ivu-form-item")
            .addClass("ivu-form-item-error");
          return false;
        }
        else {
          $(".ivu-form-item")
            .removeClass("ivu-form-item-error");
          return true;
        }
      },
      addModalOk(){
        if (!this.todoVerify()) {
          return false;
        }
        var dataJson = {
          format: "json"
          , type: this.formItem.type//类型
          , name: this.formItem.name//性格
          , sex: this.formItem.radio
          , min: this.formItem.min//类型
          , max: this.formItem.max//性格
          , sid: this.getCookie("cookieSid")
        }
        this.apiPost(zwHOST + "/zw/personalityApi/personalityAdd", this.qs.stringify(dataJson)).then(function (res) {
          if (res.code == 0) {
            this.$Message.info(res.msg);
          }
        }).catch(function (e) {
          console.log(e);
        })
        window.location.reload();
      },
      todoUpdate(index){
        this.$router.replace({path: '/index/baseDetail/' + this.baseData[index].id});
      },
      handleCurrentChange(val){
        this.page = parseInt(val - 1);
        this.baseData = this.getListData(1);
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
</script>

<style>

</style>
