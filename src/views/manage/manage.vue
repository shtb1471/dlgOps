<template>
  <div>
    <v-header></v-header>
    <div id="manage">
      <v-left isSelect="首页"></v-left>
    </div>
    <v-footer></v-footer>
  </div>
</template>
<script>
  import vHeader from '../../components/common/header.vue'
  import vFooter from '../../components/common/footer.vue'
  import vLeft from '../../components/common/left.vue'
  export default{
    data(){
      return {}
    },
    components:{
      vHeader,vFooter,vLeft
    }
  }
</script>
<style scoped>

</style>
