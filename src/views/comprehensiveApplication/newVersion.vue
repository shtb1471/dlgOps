<template>
  <div class="newVersion">
    <!--title-->
    <div class="title clearfix">
      <div class="left">
        <Select v-model="type" style="width:120px">
          <Option v-for="item in typeList" :value="item.value" :key="item">{{ item.label }}</Option>
        </Select>
        <Input v-model="value" placeholder="请输入..." style="width:180px"></Input>
        <label>发布日期</label>
        <Query></Query>
      </div>
      <div class="rightBtn">
        <Button type="success" class="search">查询</Button>
        <Button type="primary" class="btnSize" @click="updateModal">新增</Button>
      </div>
    </div>
    <div class="table">
      <Table border :columns="columns4" :data="data1" ref="table"></Table>
    </div>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :total="100" :current="1" @on-change="changePage"></Page>
      </div>
    </div>
    <!--新增-->
    <Modal v-model="append" title="新增提示" class="append clearfix" @on-ok="submit">
      <form>
        <p>
          <label>类型</label>
          <Select v-model="type" style="width:75%;text-align: left;">
            <Option v-for="item in typeList" :value="item.value" :key="item">{{ item.label }}</Option>
          </Select>
        </p>
        <p>
          <label><span>*</span> 版本号</label>
          <Input v-model="versionNumber" style="width: 75%" ref="versionNumber" class="122"></Input>
        </p>
        <p>
          <label><span>*</span>URL</label>
          <Input v-model="url" style="width: 75%" ref="url"></Input>
        </p>
        <p class="clearfix">
          <label>强制更新</label>
          <input type="checkbox" class="checkboxW">
        </p>
        <p>
          <label class="textarea"><span>*</span>更新内容</label>
          <textarea v-model="textarea" placeholder="请输入内容" ref="textarea"></textarea>
        </p>
      </form>
    </Modal>
  </div>
</template>
<script>
  import http from '../../assets/js/http'

  export default {
    name: 'newVersion',
    data () {
      return {
        typeList: this.$store.state.feedBack.sourceList,
        type: '',
        value: '',
        columns4: [
          {
            type: 'index',
            width: 40,
            align: 'center'
          },
          {
            title: '上线时间',
            key: 'onlineTime'
          },
          {
            title: '类型',
            key: 'type'
          },
          {
            title: '版本号',
            key: 'versionNumber'
          },
          {
            title: '内容',
            key: 'content'
          },
          {
            title: '操作',
            key: 'operation',
            render(row,column,index){
              return `<i-button type="text" size="small" @click="updateModal(${index})">修改</i-button>
                      <i-button type="text" size="small" @click="deleteModal(${index})">删除</i-button>`
            }
          }
        ],
        data1: this.getNewVersionData(),
        append: false,
        versionNumber: '',
        url: '',
        textarea:''
      }
    },
    methods: {
      getNewVersionData(){
        var datas = [];
        this.apiGet('static/db.json').then(function (res) {
          var dataJson = res.newVersionList;
          dataJson.forEach(function (data) {
            datas.push(data);
          })
        }).catch(function (e) {
          console.log(e);
        });
        return datas;
      },
      updateModal(index){
        if(index!=undefined){

        }
        this.append = true;
      },
      deleteModal(index){
          this.$Modal.info({
              content:"<div>您确定要删除该版本更新？</div>"
          })
      },
      changePage(){
        this.data1 = this.getNewVersionData();
      },
      submit(){
        console.log(this.$refs.versionNumber.find('ivu-input'));
        if(this.versionNumber == "" && this.url == "" && this.textarea == ""){
          //this.$refs.versionNumber.find('input').addClass('borderRed');
        }
      }
    },
    mixins: [http]
  }
</script>
<style>
  .newVersion .left{width:675px;}

  /*弹窗*/
  .del .ivu-modal-body {
    padding: 40px;
  }

  .append form p .checkboxW {
    margin-right: 70.5%;
    cursor: pointer;
  }

  .del p {
    margin: 0 0 10px 0;
    overflow: hidden;
    font-size: 16px;
  }
  .borderRed{border-color:red!important;}
</style>
