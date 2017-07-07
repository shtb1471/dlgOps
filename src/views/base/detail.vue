<template>
  <div>
    <Breadcrumb separator=">">
      <Breadcrumb-item href="/">真我</Breadcrumb-item>
      <Breadcrumb-item href="/index/baseData">基础数据</Breadcrumb-item>
      <Breadcrumb-item>编辑</Breadcrumb-item>
    </Breadcrumb>
    <div class="modal modalW">
      <div class="listDetail">
        <h4><span>基本信息</span></h4>
        <Table class="tabord" border :columns="columns" :data="detailData" ref="table" size="small"></Table>
      </div>
    </div>
    <div class="modal modalW">
      <div class="listDetail" v-for="(item,index) in items" :key="item.title">
        <h4><span>{{item.title}}</span>
          <Icon type="plus-circled" @click.native="addCats(index)"></Icon>
        </h4>
        <div v-if="item.cats&&item.cats.length>0" class="tabord ivu-table-wrapper">
          <div class="ivu-table ivu-table-small ivu-table-border">
            <div class="ivu-table-body">
              <table class="itemList" cellspacing="0" cellpadding="0" border="0">
                <tbody class="ivu-table-tbody">
                <tr class="ivu-table-row" v-for="cat in item.cats" :key="cat.id">
                  <td>
                    <div class="ivu-table-cell vue-content">{{cat.content}}</div>
                  </td>
                  <td style="width: 120px;">
                    <button type="button" class="ivu-btn ivu-btn-text ivu-btn-small" @click="addCats(index,cat)"><span>编辑</span>
                    </button>
                    <button type="button" class="ivu-btn ivu-btn-text ivu-btn-small" @click="deleteData(cat)">
                      <span>删除</span></button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="listDetail" style="overflow: hidden">
      <Button type="primary" @click="getList" style="float: right">返回</Button>
    </div>
    <!--添加、编辑数据-->
    <Modal v-model="addModal" width="420">
      <p slot="header">
        <span v-if="isAdd">新增</span>
        <span v-if="!isAdd">编辑</span>
      </p>
      <Form ref="formItem" :label-width="36" style="margin: 0px auto">
        <Form-item label="内容">
          <textarea class="ivu-input" v-model="formItem.content" name="content" placeholder="请输入内容"
                    style="height: 120px;"></textarea>
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
  export default{
    data(){
      return {
        columns: [
          {
            title: '性格',
            key: 'name',
            render(row, column, index){
              return `<span>${row.personalityRpcVo.name}</span>`
            }
          },
          {
            title: '类型',
            key: 'type',
            render(row, column, index){
              return `<span>${row.personalityRpcVo.type}</span>`
            }
          },
          {
            title: '区间',
            key: '',
            render(row, column, index){
              return `<span>${row.personalityRpcVo.min}</span>~<span>${row.personalityRpcVo.max}</span>`
            }
          },
        ],
        detailData: this.getDetail(),
        items: [],
        addModal: false,
        isAdd: false,
        formItem: {content: ""},
        itemIndex: 0,
        catId: ""
      }
    },
    methods: {
      getDetail(){
        var datas = [], self = this;
        var dataJson = {
          format: "json",
          personalityId: this.$route.params.id,
          sid: this.getCookie("cookieSid")
        }
        this.apiPost(zwHOST + "/zw/personalityInfoApi/perinfoDetail", this.qs.stringify(dataJson)).then(function (res) {
          res.data.forEach(function (data) {
            datas.push(data);
            self.items=data.items;
          })
        }).catch(function (e) {
          console.log(e);
        })
        return datas;
      },
      getList(){
        this.$router.replace({path: '/index/baseData', query: {name: 3}})
      },
      addCats(index, value){
        this.itemIndex = index;
        if (value) {
            this.isAdd=false;
          this.catId = value.id;
          this.formItem.content = value.content;
        }else{
          this.isAdd=true;
          this.catId="";
          this.formItem.content ="";
        }
        this.addModal = true;
      },
      addModalOk(){
        var self = this;
        if (this.formItem.content == "") {
          $("[name='content']").parents(".ivu-form-item").addClass("ivu-form-item-error");
          this.$Message.error("请输入内容！");
          return false;
        } else {
          $("[name='content']").parents(".ivu-form-item").removeClass("ivu-form-item-error");
          var dataJson = {
            format: "json",
            personalityId: this.detailData[0].personalityRpcVo.id,// 性格Id
            title: this.items[this.itemIndex].title,//标题
            content: this.formItem.content,//内容
//            titlePriority: this.items[0].cats[0].titlePriority,
            sid: this.getCookie("cookieSid")
          }
          if(this.catId){
            dataJson.id=this.catId;
          }
          this.apiPost(zwHOST + "/zw/personalityInfoApi/perInfoAdd", this.qs.stringify(dataJson))
            .then(function (res) {
              self.addModal = false;
              window.location.reload();
            }).catch(function (e) {
            console.log(e);
          })
        }
      },
      deleteData(value){
        var self = this;
        var dataJson = {
          format: "json",
          id: value.id,
          sid: this.getCookie("cookieSid")
        }
        this.$Modal.confirm({
          content: "确定删除当前数据？",
          onOk: function () {
            self.apiPost(zwHOST + "/zw/personalityInfoApi/perInfoDelete", self.qs.stringify(dataJson))
              .then(function (res) {
//                console.log(res);
                window.location.reload();
              }).catch(function (e) {
              console.log(e);
            })
          }
        })
      },
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
    width: 80%;
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
