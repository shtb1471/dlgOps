<template>
  <div class="Feedback">
    <!--title-->
    <div class="title clearfix">
      <div class="left">
        <Select v-model="source" style="width:120px">
          <Option v-for="item in sourceList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-model="value" placeholder="请输入..." style="width:180px"></Input>
        <label>发布日期</label>
        <div class="Query clearfix" :style="query">
          <Date-picker id="startDate" v-model="startTime" type="date" :options="startDate" placeholder="选择日期"
                       style="width: 140px;display: inline-block"></Date-picker>
          <label>~</label>
          <Date-picker type="date" :options="endDate" placeholder="选择日期" style="width: 140px;display: inline-block"
                       v-model="endTime"></Date-picker>
        </div>
      </div>
      <div class="rightBtn">
        <Button type="success" class="search" @click="getFeedBackData">查询</Button>
      </div>
    </div>
    <div class="table">
      <Table border :columns="columns4" :data="data1" ref="table" size="small"></Table>
    </div>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="100" :current="1" @on-change="changePage"></Page>
      </div>
    </div>
  </div>
</template>
<script>
  import http from '../../assets/js/http'

  export default {
    name: 'Feedback',
    data () {
      return {
        sourceList: this.$store.state.feedBack.sourceList,
        source: '',
        value: '',
        startTime: "",//注册日期开始时间(选填)
        endTime: "",//注册日期结束时间(选填)
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
            title: '时间',
            key: 'createTime'
          },
          {
            title: '来源',
            key: 'originSystem'
          }
          ,
          {
            title: '版本号',
            key: 'versionNumber'
          }
          ,
          {
            title: '手机号',
            key: 'phone'
          }
          ,
          {
            title: '内容',
            key: 'content'
          }
        ],
        data1: this.getFeedBackData(),
        size:10,
        page:0
      }
    },
    methods: {
      getDate(date){
        console.log('子组件传的数据'+date);
      },
      getFeedBackData: function () {
        var self = this;
        var datas = [];
        var dataJson = {
          size:"",  //返回的记录数
          originSystem:"", // 系统来源 1 andriod  2 ios  3 H5页面
          startTime:"", //反馈日期开始时间
          endTime:"",  //反馈日期结束时间
          sid:this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/suggestionApi/query?format=json", this.qs.stringify(dataJson)).then(function (res) {
          if (res.code == 0) {
            res.data.forEach(function (data) {
              data.createTime = self.formatDate(data.createTime);
              datas.push(data);
            });
          }
        }).catch(function (e) {
          console.log(e);
        })

//        data.createTime = formatDate(data.createTime);
        return datas;
      },
      changePage(){
        this.data1 = this.getFeedBackData();
      }
    },
    mixins: [http]

  }
</script>
<style>
  .Feedback .left {
    width: 675px;
  }
</style>
