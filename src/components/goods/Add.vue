<template>
  <div class="add">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <!-- 商品分类 -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
            </el-form-item>
            
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染商品参数的item项 -->
            <el-form-item :label="item.attr_name" v-for="item of manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) of item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item of onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 上传图片到后台api接口的地址 -->
            <el-upload
              class="upload-demo" :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove"
              list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑区域 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible"
  width="50%">
  <img :src="previewPath" class="previewImg">
</el-dialog>
  </div>
</template>
<script>
export default {
  data(){
    return {
      activeIndex:'0',
      //添加商品的表单数据对象
      addForm:{
        goods_name:'',
        goods_price:0,
        goods_weight:0,
        goods_number:0,
        //商品所属分类的数组
        goods_cat:[], 
        //商品图片的数组
        pics:[],
        //商品详情
        goods_introduce:'',
        //动态参数和静态属性
        attrs:[]
      },
      //商品参数
      manyTableData:[],
      //静态属性
      onlyTableData:[],
      //表单验证规则对象
      addFormRules:{
        goods_name:[
          {required:true,message:'请输入商品名称',trigger:'blur'}
        ],
        goods_price:[
          {required:true,message:'请输入商品价格',trigger:'blur'}
        ],
        goods_weight:[
          {required:true,message:'请输入商品重量',trigger:'blur'}
        ],
        goods_number:[
          {required:true,message:'请输入商品数量',trigger:'blur'}
        ],
        goods_cat:[
          {required:true,message:'请选择商品分类',trigger:'blur'}
        ]
      },
      //商品分类的数据
      cateList:[],
      cateProps:{
        label:'cat_name',
        value:'cat_id',
        children:'children',
        expandTrigger: 'hover'
      },
      //上传图片的地址
      uploadURL:'https://www.liulongbin.top:8888/api/private/v1/upload',
      //图片上传的header请求头对象
      headerObj:{
        Authorization:window.sessionStorage.getItem("token")
      },
      //图片预览对话框
      previewVisible:false,
      //图片预览url
      previewPath:'',
    }
  },
  methods:{
    //获取所有商品分类的数据
    getCateList(){
      this.axios.get('/categories').then(res=>{
        let {data,meta}=res.data;
        if(meta.status!==200){
          return this.$message.error('获取商品分类数据失败')
        }
        this.cateList=data;
        console.log(this.cateList)
      })
    },
    //级联选择器发生变化时 会触发这个函数
    handleChange(){
      if(this.addForm.goods_cat.length!==3){
        this.addForm.goods_cat=[];
      }
    },
    //离开标签页是的事件
    beforeTabLeave(activeName,oldActiveNmae){
      if(oldActiveNmae=='0'&&this.addForm.goods_cat.length!==3){
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    //获取商品参数
    tabClicked(){
      if(this.activeIndex=='1'){
        this.axios.get(`/categories/${this.cateId}/attributes`,{params:{sel:'many'}}).then(res=>{
          let {data,meta}=res.data;
          if(meta.status!==200){
            return this.$message.error('获取参数列表失败')
          }
          data.forEach(item=>{
            item.attr_vals=item.attr_vals.length==0?[]:item.attr_vals.split(' ')
          })
          this.manyTableData=data;
        })
        //静态属性面板
      }else if(this.activeIndex=='2'){
        this.axios.get(`/categories/${this.cateId}/attributes`,{params:{sel:'only'}}).then(res=>{
          let {data,meta}=res.data;
          if(meta.status!==200){
            return this.$message.error('获取参数列表失败')
          }
          console.log(data);
          this.onlyTableData=data;
        })
      }
    },
    //处理图片预览效果
    handlePreview(file){
      this.previewPath=file.response.data.url;
      this.previewVisible=true
    },
    //处理移除图片的操作
    handleRemove(file){
      let filePath=file.response.data.tmp_path;
      let i=this.addForm.pics.findIndex(x=>x.pic===filePath);
      this.addForm.pics.splice(i,1)
    },
    //监听图片上传成功后的事件
    handleSuccess(response){
      let picInfo={pic:response.data.tmp_path};
      this.addForm.pics.push(picInfo);
    },
    //添加商品的事件
    add(){
      this.$refs.addFormRef.validate(valid=>{
        if(!valid){
          return this.$message.error('请填写必要的表单项')
        }
        //执行添加的业务逻辑
        //克隆表单数据
        // let form=_.cloneDeep(this.addForm);
        // form.goods_cat=form.goods_cat.join(',')
        //console.log(form)
        let submitForm={...this.addForm};
        let submitGoods_cat=[...this.addForm.goods_cat];
        submitForm.goods_cat=submitGoods_cat.join(',');
        //处理动态参数
        this.manyTableData.forEach(item=>{
          let newInfo={
            attr_id:item.attr_id,
            attr_value:item.attr_vals.join(',')
          };
          this.addForm.attrs.push(newInfo);
        });
        //处理静态属性
        this.onlyTableData.forEach(item=>{
          let newInfo={
            attr_id:item.attr_id,
            attr_value:item.attr_vals
          };
          this.addForm.attrs.push(newInfo);
        });
        submitForm.attrs=this.addForm.attrs
        //发起请求 添加商品
        this.axios.post('/goods',submitForm).then(res=>{
          let {meta}=res.data;
          console.log(res.data)
          //console.log(form)
          if(meta.status!==201){
            return this.$message.error('添加商品失败')
          }
          this.$message.success('添加商品成功');
          this.$router.push('/goods')
        })
      })
      
    }
  },
  computed:{
    cateId(){
      if(this.addForm.goods_cat.length==3){
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  mounted(){
    this.getCateList()
  }
}
</script>

<style>
.add .el-checkbox{
  margin: 0 10px 0 0 !important;
}
.add .previewImg{
  width: 100%;
}
.add .btnAdd{
  margin-top: 15px;
}
</style>