<template>
  <div class="report">
    <div id="main" style="width:700px;height:550px"></div>
  </div>
</template>
<script>
import echarts from 'echarts'
import _ from 'lodash'
export default {
  data(){
    return {
      options: {
          title: {
            text: '用户来源'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#E9EEF3'
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              boundaryGap: false
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ]
        }
    }
  },
  mounted(){
    this.axios.get('/reports/type/1').then(res=>{
      let {data,meta}=res.data;
      if(meta.status!==200){
        return this.$message.error('获取折线图数据失败')
      }
      // for( var key in data){
      //   this.options[key]=data[key];
      // }
      let mychart=echarts.init(document.getElementById('main'));
      let result=_.merge(data,this.options)
      mychart.setOption(result)
      console.log(result)
    })
  },
}
</script>