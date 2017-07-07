<template>
  <div class="baseData">
    <div style="padding-bottom:12px">
      <Button type="primary" class="search" @click="addBaseData">新增</Button>
    </div>
    <!--列表-->
    <div class="table" style="width: 60%;">
      <Table border :columns="columns" :data="baseData" ref="table" size="small" highlight-row></Table>
    </div>
    <!--添加数据-->
    <Modal v-model="addModal" width="360">
      <p slot="header">
        <span v-if="isAdd">新增</span>
        <span v-if="!isAdd">编辑</span>
      </p>
      <Form ref="formItem" :label-width="46" style="margin: 0px auto">
        <Form-item label="名称">
          <Input v-model="formItem.name" name="name" placeholder="请输入名称"></Input>
        </Form-item>
        <Form-item label="排序">
          <Input v-model="formItem.titleDesc" name="titleDesc" placeholder="请输入排序"></Input>
          <div class="xfail" style="font-size: 12px;">请输入正整数</div>
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
        columns: [
          {
            type: 'index',
            width: 60
          }, {
            title: "名称",
            key: "title"
          }, {
            title: "排序",
            key: "titleDesc"
          }, {
            title: "操作",
            key: "action",
            render(row, column, index){
              return `<i-button  type="text" size="small" @click="addBaseData(${index})">编辑</i-button>`
            },
            width: 120
          }
        ],
        isAdd: false,
        baseData: this.getListData(),
        addModal: false,
        formItem: {
          name: "",
          titleDesc: ""
        },
        updateIndex: ""
      }
    },
    methods: {
      getListData(){
        var datas = [], self = this;
        var dataJson = {
          format: "json"
          , sid: this.getCookie("cookieSid")
        }
        this.apiPost(zwHOST + "/zw/personalityTitleApi/findTitle", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.data.length > 0) {
              res.data.forEach(function (data) {
                datas.push(data);
              })
            }
          }).catch(function (e) {
          console.log(e);
        })
        return datas;
      },
      addBaseData(index){
        if (/^[0-9]+$/.test(index)) {
          this.isAdd = false;
          this.formItem.name = this.baseData[index].title;//性格
          this.formItem.titleDesc = this.baseData[index].titleDesc;
          this.updateIndex = index;
        } else {
          this.updateIndex ="";
          this.formItem.name = "";//性格
          this.formItem.titleDesc = "";
          this.isAdd = true;
        }
        this.addModal = true;
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
        if (this.formItem.titleDesc == '' || !/^[1-9]\d*$/.test(this.formItem.titleDesc)) {
          $(".ivu-form-item")
            .removeClass("ivu-form-item-error");
          this.$Message.error('请输入正确排序!');
          this.addModal = true;
          $("input[name='titleDesc']")
            .parents(".ivu-form-item")
            .addClass("ivu-form-item-error");
          return false;
        } else {
          $(".ivu-form-item")
            .removeClass("ivu-form-item-error");
          return true;
        }
      },
      addModalOk(){
        if (!this.todoVerify()) {
          return false;
        }
        var self = this;
        var dataJson = {
          format: "json"
          , title: this.formItem.name//性格
          , titleDesc: this.formItem.titleDesc
          , sid: this.getCookie("cookieSid")
        }
        if (/\d/.test(this.updateIndex)) {
          dataJson.id = this.baseData[this.updateIndex].id;
        }
        this.apiPost(zwHOST + "/zw/personalityTitleApi/addTitle", this.qs.stringify(dataJson)).then(function (res) {
          if (res.code == 0) {
            self.addModal = false;
            this.$Message.info(res.msg);
          }
        }).catch(function (e) {
          console.log(e);
        })
        window.location.reload();
      }
    },
    mixins: [http]
  }
</script>

<style>

</style>
