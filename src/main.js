import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import moment from 'moment'
import TreeTable from 'vue-table-with-tree-grid'
//导入全局样式表
import './assets/css/common.css'
//导入字体图标
import './assets/fonts/iconfont.css'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(ElementUI)
Vue.use(VueQuillEditor)

Vue.prototype.moment=moment;
Vue.component('tree-table',TreeTable)

//配置axios基础路径 https://www.liulongbin.top:8888/api/private/v1
axios.defaults.baseURL='http://www.ysqorz.top:8888/api/private/v1'
axios.interceptors.request.use(config=>{
  config.headers.Authorization=window.sessionStorage.getItem("token");
  return config;
})
Vue.prototype.axios=axios
Vue.config.productionTip = false
//时间的过滤器
Vue.filter('dateFormat',function(orginVal){
  let dt=new Date(orginVal);
  let y=dt.getFullYear();
  let m=(dt.getMonth()+1+'').padStart(2,'0');
  let d=(dt.getDate()+'').padStart(2,'0');
  let hh=(dt.getHours()+'').padStart(2,'0');
  let mm=(dt.getMinutes()+'').padStart(2,'0');
  let ss=(dt.getSeconds()+'').padStart(2,'0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
