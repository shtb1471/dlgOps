import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/login.vue'
import NotFoundComponent from '@/views/404.vue'
import Main from '@/views/home.vue'
import Index from '@/views/index/index.vue'
import Order from '@/views/manage/order.vue'
import User from '@/views/user/user.vue'
import Role from '@/views/user/role.vue'
import Resource from '@/views/user/resource.vue'
import evaluateInfo from '@/views/manage/evaluateInfo'
import campaign from '@/views/manage/campaign'
import InvoiceManagement from '@/views/manage/InvoiceManagement'
import orangeDetails from '@/views/manage/orangeDetails'
import companyInfo from '@/views/manage/companyInfo'
import personageInfo from '@/views/manage/personageInfo'
import agentInfo from '@/views/manage/agentInfo'
import transactionDetail from '@/views/financialManagement/transactionDetail'
import rechargeOrange from '@/views/financialManagement/rechargeOrange'
import rechargeRecord from '@/views/financialManagement/rechargeRecord'
import Feedback from '@/views/comprehensiveApplication/Feedback'
import newVersion from '@/views/comprehensiveApplication/newVersion'
import changePassword from '@/views/comprehensiveApplication/changePassword'
import toReview from '@/views/financialManagement/toReview'
import toReviewOld from '@/views/financialManagement/toReviewOld'
// 真我
import Pend from '@/views/pending/pending.vue'
import PendOld from '@/views/pending/pendOld.vue'
import PendDetail from '@/views/pending/detail.vue'
import Info from '@/views/information/info.vue'
import BaseData from '@/views/base/baseData.vue'
import BaseDetail from '@/views/base/detail.vue'
import BaseTitle from '@/views/base/baseTitle.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/main',
      name: Main,
      component: Main,
      children: [
        {path: '/', meta: {name: '1-1'}, component: Index},
        {path: '/order', meta: {name: '2-1'}, component: Order},
        {path: '/evaluateInfo',meta: {name: '2-2'}, component: evaluateInfo},
        {path: '/InvoiceManagement', meta: {name: '2-3'},component: InvoiceManagement},
        {path: '/campaign',meta: {name: '2-4'}, component: campaign},
        {path: '/orangeDetails', meta: {name: '2-5'},component: orangeDetails},
        {path: '/companyInfo',meta: {name: '3-1'}, component: companyInfo},
        {path: '/personageInfo',meta: {name: '3-2'}, component: personageInfo},
        {path: '/agentInfo', meta: {name: '3-3'},component: agentInfo},
        {path: '/transactionDetail', meta: {name: '4-1'},component: transactionDetail},
        {path: '/rechargeOrange',meta: {name: '4-2'}, component: rechargeOrange},
        {path: '/rechargeRecord',meta: {name: '4-3'}, component: rechargeRecord},
        {path: '/Feedback',meta: {name: '5-1'}, component: Feedback},
        {path: '/newVersion', meta: {name: '5-2'},component: newVersion},
        {path: '/changePassword',meta: {name: '5-3'}, component: changePassword},
        {path: '/user',meta: {name: '6-1'}, component: User},
        {path: '/role',meta: {name: '6-2'}, component: Role},
        {path: '/resource',meta: {name: '6-3'}, component: Resource},
        {path: '/toReview',meta: {name: '4-4'}, component: toReviewOld}
        // {path: '/toReview',meta: {name: '4-4'}, component: toReview}
      ]
    }, {//真我
      path: '/index',
      name: Main,
      component: Main,
      children: [
        // {path: '/', meta: {name: '1'}, component: PendOld},
        {path: '/', meta: {name: '1'}, component: Pend},
        {path:'/pend/detail/:tag/:id',component: PendDetail},
        {path: '/index/information', meta: {name: '2'}, component: Info},
        {path: '/index/baseData', meta: {name: '3'}, component: BaseData},
        {path:'/index/baseDetail/:id',component: BaseDetail},
        {path: '/index/baseTitle', meta: {name: '4'}, component: BaseTitle}
      ]
    }, {
      path: '*',
      name: '404',
      component: NotFoundComponent
    }
  ]
})

export default router;
