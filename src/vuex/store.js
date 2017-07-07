import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
Vue.use(Vuex)

export default new Vuex.Store({
    state:state,
    mutations: {
    //更新用户信息
    updateUserInfo(state, newUserInfo) {
      state.userInfo = newUserInfo;
    }
}
})
