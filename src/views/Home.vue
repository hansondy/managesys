<template>
  <div class="home">
    <el-container class="home_container">
      <!-- 头部区域 -->
      <el-header>
        <div>
          <img src="../assets/logo_header.png">
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px':'200px'">
          <div class="toggle_btn" @click="toggle_collapse">|||</div>
          <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened :collapse="isCollapse"
            :collapse-transition="false" router :default-active="activePath">
            <!-- 一级菜单 -->
            <el-submenu :index="item.id+''" v-for="(item,i) of menuList" :key="i">
              <!-- 一级菜单模板区 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{item.authName}}</span>
              </template>
              <!-- 耳机菜单 -->
              <el-menu-item :index="'/'+subItem.path" v-for="(subItem,j) of item.children" :key="j"
                @click="saveNavState('/'+subItem.path)">
                <!-- 二级菜单模板区 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧内容区域 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
export default {
  data(){
    return {
      menuList:[],
      iconObj:{
        '125':"iconfont icon-icon_user",
        '103':"iconfont icon-quanxianguanli",
        '101':"iconfont icon-shangpinguanli",
        '102':"iconfont icon-dingdanguanli",
        '145':"iconfont icon-shujutongjixuanzhong"
      },
      isCollapse:false,
      activePath:'',
    }
  },
  methods:{
    logout(){
      window.sessionStorage.clear();
      this.$router.push('/login')
    },
    getMenuList(){
      this.axios.get('/menus').then(res=>{
        let {data}=res;
        if(data.meta.status!==200) return this.$message.error(data.meta.msg);
        this.menuList=data.data
        console.log(data.data)
      })
    },
    //点击折叠或展开侧边栏菜单
    toggle_collapse(){
      this.isCollapse=!this.isCollapse
    },
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath);
      this.activePath=activePath
    }
  },
  created(){
    this.activePath=window.sessionStorage.getItem('activePath')
  },
  mounted(){
    this.getMenuList()
  }
}
</script>
<style>
.home,.home .home_container{
  height: 100%;
}
.home .el-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #373d41;
  padding-left: 0;
}
.home .el-header>div{
  display: flex;
  align-items: center;
  font-size: 20px;
  color: #fff;
}
.home .el-header>div>img{width: 20%;}
.home .el-header>div>span{
  margin-left: 15px;
}
.home .el-aside{
  background: #333744;
}
.home .el-main{
  background: #eaedf1;
}
.home .el-aside>.el-menu{
  border-right: none;
}
.iconfont{
  margin-right: 10px;
}
.home .toggle_btn{
  background: #4a5064;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: #fff;
  line-height: 24px;
  text-align: center;
}
</style>