<template>
  <div id="leftMenu">
    <Row style="height: 100%">
      <Col style="height: 100%">
      <dl class="navList">
        <dd v-for="list in navLists" :key="list.id" :class="{'on':list.id==1}">
          <div :id="'title'+list.id" class="ivu-list-title-xx" @click="handleToggle('title'+list.id)">
            <Icon type="grid"></Icon>
            {{list.value}}
          </div>
          <Menu v-if="list.id==1" :theme="theme2" accordion :open-names="['+openN+']" :active-name="leftActive"
                style="width: 100%;">
            <Submenu v-for="nav in navs" :name="nav.meta" :key="nav.name">
              <template slot="title">
                <Icon :type="nav.icon"></Icon>
                {{nav.name}}
              </template>
              <Menu-item v-for="child in nav.children" :name="child.meta" :key="child.id"
                         @click.native="routerChange(child)">{{child.name}}
              </Menu-item>
            </Submenu>
          </Menu>
          <Menu v-if="list.id==2" :theme="theme2" style="width: 100%;">
            <Menu-item v-for="nav in thNavs" :name="nav.name" :key="nav.name"
                       @click.native="routerChange(nav)">
              <Icon :type="nav.icon"></Icon>
              {{nav.name}}
            </Menu-item>
          </Menu>
        </dd>

      </dl>

      </Col>
    </Row>
  </div>

</template>
<script>
  import http from "../../assets/js/http"
  export default{
    data(){
      return {
        theme2: 'dark',
        openN: 1,
        leftActive: "1-1",
        navs: [
          /* {
           content: '首页信息',
           icon: 'ios-home',
           name: '1',
           children: [
           {
           href: '/main',
           content: '首页',
           name: '1-1'
           }
           ]
           },*/
          {
            content: '运营管理',
            icon: 'person-stalker',
            name: '2',
            children: [
              {
                href: '/order',
                content: '零工订单',
                name: '2-1'
              },
              {
                href: '/evaluateInfo',
                content: '评价信息',
                name: '2-2'
              },
              {
                href: '/campaign',
                content: '广告活动',
                name: '2-3'
              },
              {
                href: '/InvoiceManagement',
                content: '发票管理',
                name: '2-4'
              },
              {
                href: '/orangeDetails',
                content: '橙子明细',
                name: '2-5'
              }
            ]
          },
          {
            content: '账户信息',
            icon: 'radio-waves',
            name: '3',
            children: [
              {
                href: '/companyInfo',
                content: '企业信息',
                name: '3-1'
              },
              {
                href: '/personageInfo',
                content: '个人信息',
                name: '3-2'
              },
              {
                href: '/agentInfo',
                content: '代理商信息',
                name: '3-3'
              }
            ]
          },
          {
            content: '财务管理',
            icon: 'card',
            name: '4',
            children: [
              {
                href: '/toReview',
                content: '提现审核',
                name: '4-4'
              },
              {
                href: '/transactionDetail',
                content: '交易明细',
                name: '4-1'
              },
              {
                href: '/rechargeOrange',
                content: '充金橙',
                name: '4-2'
              },
              {
                href: '/rechargeRecord',
                content: '充值记录',
                name: '4-3'
              }
            ]
          },
          /*{
           content: '综合应用',
           icon: 'android-apps',
           name: '5',
           children: [
           {
           href: '/Feedback',
           content: '意见反馈',
           name: '5-1'
           },
           {
           href: '/newVersion',
           content: '版本更新',
           name: '5-2'
           },
           {
           href: '/changePassword',
           content: '修改密码',
           name: '5-3'
           }
           ]
           },*/
          {
            content: '系统管理',
            icon: 'social-windows',
            name: '6',
            children: [
              {
                href: '/resource',
                content: "菜单管理",
                name: '6-3'
              },
              {
                href: '/user',
                content: '用户管理',
                name: '6-1'
              },
              {
                href: '/role',
                content: '角色管理',
                name: '6-2'
              }
            ]
          }
        ],
        thNavs: [
          {
            name: '待处理',
            icon: 'help-circled',
            meta: '1',
            url: '/index'
          },
          {
            name: '个人信息',
            icon: 'information-circled',
            url: '/index/information',
            meta: '2'
          },
          {
            name: '基础数据',
            icon: 'ios-pricetag',
            url: '/index/baseData',
            meta: '3'
          },
          {
            name: '基础模块',
            icon: 'leaf',
            url: '/index/baseTitle',
            meta: '4'
          }
        ],
        navLists: [
          {
            id: 1,
            value: "打零工"
          },
          {
            id: 2,
            value: "真我"
          }
        ]
      }
    },
    created(){
      this.getMenuList();
    },
    methods: {
      getMenuList(){
        var self = this, datas = [];
        self.navs = [];
        var dataJson = {
          format: "json",
          userId: localStorage.getItem('userID'),
          sid: this.getCookie("cookieSid")
        }
        this.apiPost("/api/ops/roleResourceRestApi/list", this.qs.stringify(dataJson))
          .then(function (res) {
            if (res.code == 0) {
              if (res.data && res.data.length > 0) {
                res.data.forEach(function (data) {
                  data.meta = data.priority;
                  if (data.children && data.children.length > 0) {
                    data.children.forEach(function (child) {
                      child.meta = data.priority + "-" + child.priority;
                    })
                  }
                  datas.push(data);
                  self.navs.push(data);
                })
              }

            } else {
              console.log(res.msg);
            }
          }).catch(function (e) {
          console.log(e);
        })
        return datas;
      },
      routerChange: function (item) {
        // 与当前页面路由相等则刷新页面
        if (item.url != this.$route.path) {
          this.$router.push({path: item.url, query: {name: item.meta}});
        } else {
          this.$router.replace({path: item.url, query: {name: item.meta}});
        }
      },
      changeActive(){
        var length = document.location.href.split("/").length;
        if (document.location.href.split("/")[length - 1].indexOf("?") > -1) {
          var nameString = document.location.href.split("/")[length - 1].split("?")[1];
          var nameJson = nameString;
          this.leftActive = nameJson.split("=")[1];
          this.openN = nameJson.split("=")[1].split("-")[0];
        }
        if (document.location.href.split("/")[length - 1].indexOf("index") > -1) {
          $(".navList dd").removeClass("on");
          $(".navList dd").find("ul").hide();
          $("#title2").parent("dd").addClass("on");
          $("#title2").next().show();
        } else {
          $("#title2").parent("dd").removeClass("on");
          $("#title2").next().hide();
        }
      },
      handleToggle(id){
        $(".navList").find("dd").removeClass("on");
        $(".ivu-menu-dark").hide();
        $("#" + id).parent().toggleClass("on");
        $("#" + id).next().toggle();
      }
    },
    mounted(){
      this.changeActive();
    },
    watch: {
      // 如果路由有变化，会再次执行该方法
      "$route": "changeActive",
    },
    mixins: [http]
  }
</script>

<style scoped>
  #leftMenu {
    height: 100%;
    top: 52px;
    position: relative;
  }

  .navList {
    height: 100%;
    min-height: 677px;
    text-align: left;
    background: #23262E;
    color: #ffffff;
  }

  .navList > li:hover {
    background: #464c5b;
  }

  ul.ivu-menu-dark {
    background: #23262E;
    color: #ffffff;
  }

  ul li {
    background: #23262E;
    color: #ffffff;
  }

  .ivu-list-title-xx {
    padding: 14px 12px;
    position: relative;
    cursor: pointer;
    z-index: 1;
    transition: all .2s ease-in-out;
  }

  .ivu-list-title-xx i {
    margin-right: 8px;
    font-size: 18px;
    vertical-align: middle;
    margin-top: -3px;
  }

  .on {
    background: #464c5b;
  }
</style>
