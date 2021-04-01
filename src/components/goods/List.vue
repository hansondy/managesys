<template>
  <div class="list">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goodAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" width="115px" prop="goods_price"></el-table-column>
        <el-table-column label="商品重量" width="80px" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" width="140px" prop="add_time">
          <template slot-scope="scope">
            {{scope.row.add_time|dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete"></el-button>
          </template>
          
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data(){
    return {
      //查询参数对象
      queryInfo:{
        query:'',
        pagenum:1,
        pagesize:10
      },
      //商品列表
      goodsList:[],
      //商品总数
      total:0,
    }
  },
  methods:{
    //查询商品列表
    getGoodList(){
      this.axios.get('/goods',{params:this.queryInfo}).then(res=>{
        let {data,meta}=res.data;
        console.log(res.data)
        if(meta.status!==200){
          return this.$message.error('获取商品列表失败')
        }
        this.goodsList=data.goods;
        this.total=data.total;
        //console.log(data.goods)
      })
    },
    goodAddPage(){
      this.$router.push('/good/add')
    }
  },
  mounted(){
    this.getGoodList();
  }
}
</script>