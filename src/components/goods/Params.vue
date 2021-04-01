<template>
  <div class="params">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert show-icon :closable="false" title="注意:只允许为第三级分类设置相关参数" type="warning">
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>添加商品分类:</span>
          <!-- 选择商品分类的级联选择器 -->
          <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button :disabled="isBtnDisable" type="primary" size="mini" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable @close="handleClose(i,scope.row)" v-for="(item,i) of scope.row.attr_vals" :key="i">{{item}}</el-tag>
                <!-- 添加的input文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
              
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
          
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button :disabled="isBtnDisable" type="primary" size="mini" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable @close="handleClose(i,scope.row)" v-for="(item,i) of scope.row.attr_vals" :key="i">{{item}}</el-tag>
                <!-- 添加的input文本框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
              
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
          
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed">
      <!-- 添加参数的form表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <!-- 添加参数的form表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data(){
    return {
      //商品列表
      cateList:[],
      //级联选择框的配置对象
      cateProps:{
        value:"cat_id",
        label:"cat_name",
        children:"children",
        expandTrigger: 'hover',
      },
      //级联选择框双向绑定到的数组
      selectedCateKeys:[],
      //被激活的页签名称
      activeName:'many',
      //动态参数的数据
      manyTableData:[],
      //静态属性的数据
      onlyTableData:[],
      //显示与隐藏对话框
      addDialogVisible:false,
      //表单数据对象
      addForm:{
        attr_name:''
      },
      //表单验证规则对象
      addFormRules:{
        attr_name:[
          {required:true,message:'请输入参数名称',trigger:'blur'}
        ]
      },
      //控制修改对话框的显示与隐藏
      editDialogVisible:false,
      editForm:{attr_name:''},
      //修改表单的验证规则对象
      editFormRules:{
        attr_name:[
          {required:true,message:'请输入参数名称',trigger:'blur'}
        ]
      },
      //文本框中输入的内容
      inputValue:'',
      //文本框和button切换显示
      inputVisible:false,
    }
  },
  methods:{
    getCateList(){
      this.axios.get('/categories').then(res=>{
        let {data,meta}=res.data;
        if(meta.status!==200){
          return this.$message.error('获取商品分类失败')
        }
        this.cateList=data;
      })
    },
    //点击标签切换
    handleTabClick(){
      this.getParamsData()
    },
    //级联选择框的选项发生变化时,会触发这个函数
    handleChange(){
      //如果不是三级分类
      if(this.selectedCateKeys.length!==3){
        this.selectedCateKeys=[];
        this.manyTableData=[];
        this.onlyTableData=[];
        return
      }
      this.getParamsData()
    },
    getParamsData(){
      //根据所选id 和对应的面板 获取对应的参数
      this.axios.get(`/categories/${this.cateId}/attributes`,{params:{sel:this.activeName}})
      .then(res=>{
        let {data,meta}=res.data;
        if(meta.status!==200){
          return this.$message.error('获取商品分类失败')
        }
        data.forEach(item=>{
          item.attr_vals=item.attr_vals? item.attr_vals.split(' '):[];
          //控制文本和按钮的切换显示
          item.inputVisible=false;
          //文本框输入的内容
          item.inputValue='';
        });
        if(this.activeName=='many'){
          this.manyTableData=data;
        }else{
          this.onlyTableData=data;
        }
      })
    },
    //关闭对话框后重置对话框
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    //点击按钮 添加参数
    addParams(){
      this.$refs.addFormRef.validate(valid=>{
        if(!valid) return
      });
      this.axios.post(`/categories/${this.cateId}/attributes`,{
        attr_name:this.addForm.attr_name,
        attr_sel:this.activeName,
      }).then(res=>{
        let {data,meta}=res.data;
        if(meta.status!==201){
          return this.$message.error('添加参数失败');
        }
        this.$message.success('添加参数成功');
        this.addDialogVisible=false;
        this.getParamsData()
      })
    },
    //点击按钮显示修改对话框
    showEditDialog(attr_id){
      //查询参数信息
      this.axios.get(`/categories/${this.cateId}/attributes/${attr_id}`,{
        params:{attr_sel:this.activeName}
      }).then(res=>{
        let {data,meta}=res.data;
        if(meta.status!==200){
          return this.$message.error('查询参数信息失败')
        }
        this.editForm=data;
      })
      this.editDialogVisible=true;
    },
    //重置修改表单
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    //点击按钮修改参数信息
    editParams(){
      this.$refs.editFormRef.validate(valid=>{
        if(!valid) return
        this.axios.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
        attr_name:this.editForm.attr_name,
        attr_sel:this.activeName
        }).then(res=>{
          let {data,meta}=res.data;
          if(meta.status!==200){
            return this.$message.error('修改参数失败');
          }
          this.$message.success('修改参数成功');
          this.getParamsData();
          this.editDialogVisible=false
        })
      })
    },
    //点击按钮删除对应id的参数项
    removeParams(attr_id){
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.axios.delete(`/categories/${this.cateId}/attributes/${attr_id}`,).then(res=>{
            let {meta}=res.data;
            if(meta.status!==200){
              return this.$message.error('删除参数失败')
            }
            this.getParamsData();
            this.$message({
            type: 'success',
            message: '删除成功!'
            });
          })
          
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
      });
    },
    //回车键抬起 或 失去焦点时触发
    handleInputConfirm(row){
      //判断输入的内容是否为空
      if(row.inputValue.trim().length==0){
        row.inputValue='';
        row.inputVisible=false;
        return
      }
      //如果没有return 则输入的内容需要做下一步处理
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue='';
      row.inputVisible=false;
      //发起请求 将内容添加到数据库
      this.saveAttrVals(row)
    }, 
    //点击按钮 切换为文本框
    showInput(row){
      row.inputVisible=true;
      this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    saveAttrVals(row){
      //发起请求 将内容添加到数据库
      this.axios.put(`/categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals:row.attr_vals.join(' ')
      }).then(res=>{
        let {meta}=res.data;
        if(meta.status!==200){
          return this.$message.error('修改参数项失败');
        }
        this.$message.success('修改参数项成功')
      })
    },
    //删除标签的事件
    handleClose(i,row){
      row.attr_vals.splice(i,1);
      this.saveAttrVals(row)
    }
  },
  computed:{
    //如果数组selectedCateKeys长度不是3 返回true 否则返回false
    isBtnDisable(){
      if(this.selectedCateKeys.length!==3){
        return true
      }
      return false
    },
    //获取当前选中的三级分类id
    cateId(){
      if(this.selectedCateKeys.length==3){
        return this.selectedCateKeys[2]
      };
      return null
    },
    //动态计算添加标题的文本
    titleText(){
      if(this.activeName=='many'){
        return '动态参数'
      }else{
        return '静态属性'
      }
    }
    
  },
  mounted(){
    this.getCateList();
  },
}
</script>

<style>
.params .cat_opt{
  margin: 15px 0;
}
.params .el-tag{
  margin: 10px;
}
.params .input-new-tag{
  width: 120px;
}
</style>