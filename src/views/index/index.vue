<template>
  <div class="index">
    <div class="today">
      <h4><span>今日统计</span></h4>
      <ul class="clearfix">
        <li>
          <a href="javascript:void (0);" class="blue">
            <p>580</p>
            <p>今日零工数</p>
          </a>
        </li>
        <li>
          <a href="javascript:void (0);" class="red">
            <p>98</p>
            <p>今日新用户</p>
          </a>
        </li>
        <li>
          <a href="javascript:void (0);" class="qing01">
            <p>3000</p>
            <p>今日订单总额（元）</p>
          </a>
        </li>
        <li>
          <a href="javascript:void (0);" class="zi">
            <p>30</p>
            <p>今日平台收入（元）</p>
          </a>
        </li>
        <li>
          <a href="javascript:void (0);" class="qing02">
            <p>30</p>
            <p>今日充值（元）</p>
          </a>
        </li>
        <li>
          <a href="javascript:void (0);" class="blue02">
            <p>30</p>
            <p>今日提现（元）</p>
          </a>
        </li>
      </ul>
    </div>
    <!--零工统计-->
    <div class="today">
      <h4><span>零工统计</span></h4>
      <ul class="clearfix">
        <li>
          <a href="javascript:void (0);" class="blue">
            <p>580</p>
            <p>零工数</p>
          </a>
        </li>
        <li>
          <a href="javascript:void (0);" class="red">
            <p>98</p>
            <p>待抢单</p>
          </a>
        </li>
        <li>
          <a href="javascript:void (0);" class="qing01">
            <p>3000</p>
            <p>进行中</p>
          </a>
        </li>
        <li>
          <a href="javascript:void (0);" class="zi">
            <p>30</p>
            <p>待付款</p>
          </a>
        </li>
        <li>
          <a href="javascript:void (0);" class="qing02">
            <p>30</p>
            <p>待评价</p>
          </a>
        </li>
        <li>
          <a href="javascript:void (0);" class="blue02">
            <p>30</p>
            <p>已完成</p>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
  export default{
      name:'index',
      data(){
          return {}
      }
  }
</script>
<style scoped>
  .index{}
  .today{margin-bottom: 3%;}
  .today > h4{border-bottom:1px solid #18A689;font-weight: 100;font-size: 14px;}
  .today > h4 span{background-color: #18A689;display: inline-block;padding:5px;color:#fff;}
  .today li{float:left;margin:15px 0 0 1%;width:15%;height:5%;}
  .today li a{display:block;color:#333;padding:10px;}
  .today li a p{text-align: right;color:#fff;line-height: 24px;height:24px;}
  .today li a p:first-child{font-size: 18px;line-height: 28px;height:28px;}
</style>
