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
              key: 'username',
              render(row, column, index){
                return `<span>${row.userRestVo.username}</span>`
              }
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
              title: '来源',
              key: 'origin'
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
        /*查询*/
        changeTableColumns(){
          this.currentPage = 1;
          this.dataPend = this.getListData();
        },
        todoCaculate(index){
          this.$router.replace({path: '/pend/detail/0/' + this.dataPend[index].id});
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
        window.addEventListener('keyup', (e) => {
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
