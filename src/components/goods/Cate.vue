<template>
  <div class="cate">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index border index-text="#" :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color:lightgreen" v-if="scope.row.cat_deleted===true"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level==0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level==1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类"
      :visible.sync="addCateDialogVisible"
      @close="addCateDialogClose"
      width="50%" >
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options 数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            clearable
            :options="parentCateList"
            v-model="selectedkeys"
            :props="cascaderProps"
            @change="parentCateChange" >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data(){
    return {
      //查询条件
      queryinfo:{
        type:3,
        pagenum:1,
        pagesize:5
      },
      //商品分类的数据
      cateList:[],
      //总数据条数
      total:0,
      //为table列的定义
      columns:[
        {
          label:'分类名称',
          prop:'cat_name',
        },
        {
          label:'是否有效',
          //表示将当前列自定义为模板列
          type:'template',
          template:'isok'
        },
        {
          label:'排序',
          //表示将当前列自定义为模板列
          type:'template',
          template:'order'
        },
        {
          label:'操作',
          //表示将当前列自定义为模板列
          type:'template',
          template:'opt'
        }
      ],
      //添加分类的对话框 显示或隐藏的属性
      addCateDialogVisible:false,
      //添加分类的表单数据对象
      addCateForm:{
        //将要添加分类的名称
        cat_name:'',
        //分类的id
        cat_pid:0,
        //分类的等级
        cat_level:0
      },
      //添加验证表单的规则对象
      addCateFormRules:{
        cat_name:[
          {required:true,message:'请输入分类名称',triggle:'blur'}
        ]
      },
      //父级分类数据
      parentCateList:[],
      cascaderProps:{
        value:'cat_id',
        label:'cat_name',
        children:'children',
        expandTrigger: 'hover',
        checkStrictly:true
      },
      selectedkeys:[],
    }
  },
  methods:{
    //获取商品分类的数据
    getCateList(){
      this.axios.get('/categories',{params:this.queryinfo}).then(res=>{
        let {data,meta}=res.data;
        if(meta.status!==200){
          return this.$message.error('查询商品分类失败');
        }
        //保存商品分类数据
        this.cateList=data.result;
        this.total=data.total;
      })
    },
    //监听 pagesize 的改变
    handleSizeChange(newPageSize){
      this.queryinfo.pagesize=newPageSize;
      this.getCateList();
    },
    //监听 pagenum 的改变
    handleCurrentChange(newPageNum){
      this.queryinfo.pagenum=newPageNum;
      this.getCateList();
    },
    //点击按钮显示添加分类的对话框
    showAddCateDialog(){
      //获取父级分类数据
      this.getParentCateList()
      //再显示对话框
     this.addCateDialogVisible=true; 
    },
    getParentCateList(){
      this.axios.get('/categories',{params:{type:2}}).then(res=>{
        let {data,meta}=res.data;
        if(meta.status!==200){
          return this.$message.error('获取父级分类数据失败')
        }
        this.parentCateList=data;
      })
    },
    parentCateChange(){
      //selectedkeys数组长度大于0 说明有选择父级分类
      if(this.selectedkeys.length>0){
        this.addCateForm.cat_pid=this.selectedkeys[this.selectedkeys.length-1];
        //为当前分类等级赋值
        this.addCateForm.cat_level=this.selectedkeys.length
        return
      }else{
        this.addCateForm.cat_pid==0;
        this.addCateForm.cat_level=0
      }
    },
    //点击按钮添加新的分类
    addCate(){
      this.$refs.addCateFormRef.validate(valid=>{
        if(!valid) return
        this.axios.post('/categories',this.addCateForm).then(res=>{
          let {data,meta}=res.data;
          if(meta.status!==201){
            return this.$message.error('添加分类失败')
          }
          this.$message.success('添加分类成功');
          this.getCateList();
          this.addCateDialogVisible=false
        })
      })
    },
    //监听对话框关闭事件,重置对话框
    addCateDialogClose(){
      this.$refs.addCateFormRef.resetFields();
      this.selectedkeys=[];
      this.addCateForm.cat_level=0;
      this.addCateForm.cat_pid=0
    }
  },
  mounted(){
    this.getCateList()
  },
}
</script>
<style>
.cate .treeTable{
  margin-top: 15px;
}
.cate .el-cascader{
  width: 100%;
}
</style>