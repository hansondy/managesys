<template>
  <div class="roles">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist">
        <!-- 索引列 -->
        <el-table-column type="expand">
          <!-- 展开列 -->
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1==0? 'bdtop':'' , 'vcenter']" v-for="(items1, i1) of scope.row.children" :key="items1.id">
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,items1.id)">{{items1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              
              <el-col :span="19">
                <!-- 通过for循环渲染二级权限 -->
                <el-row :class="[i2==0? '':'bdtop']" v-for="(items2,i2) of items1.children" :key="items2.id">
                  <el-col :span="6">
                    <el-tag closable @close="removeRightById(scope.row,items2.id)" type="success">{{items1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- <pre>{{scope.row}}</pre> -->
                    <el-tag closable @close="removeRightById(scope.row,items3.id)" type="warning" v-for="(items3,i3) of items2.children" :key="items3.id">
                      {{items3.authName}}
                      
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%" @close="setRightDialogclose">
      <!-- 树形控件 -->
      <el-tree :data="rightlist" :props="treeProps" show-checkbox node-key='id' default-expand-all ref="treeRef" :default-checked-keys="defkeys"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data(){
    return {
      rolelist:[],
      setRightDialogVisible:false,
      //所有权限的数据
      rightlist:[],
      //树形控件的属性
      treeProps:{
        label:'authName',
        children:'children'
      },
      //默认选中的节点id值数组
      defkeys:[],
      //即将分配权限的id
      roleId:''
    }
  },
  methods:{
    getRolelist(){
      this.axios.get('roles').then(res=>{
        let {data,meta}=res.data;
        if(meta.status!==200) return this.$message.error('获取角色列表失败');
        this.rolelist=data;
      })
    },
    removeRightById(role,rightId){
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.axios.delete(`/roles/${role.id}/rights/${rightId}`).then(res=>{
            let {data,meta}=res.data;
            if(meta.status!==200) return this.$message.error('删除权限失败');
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            role.children=data
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    },
    showSetRightDialog(role){
      this.roleId=role.id
      // 获取所有权限的数据
      this.axios.get('/rights/tree').then(res=>{
        let {data,meta}=res.data;
        if(meta.status!==200) return this.$message.error('获取权限数据失败');
        //将获取到的权限数据保存到data中
        this.rightlist=data;
      });
      //调用getLeafKeys 获取三级权限的id
      this.getLeafKeys(role,this.defkeys)
      this.setRightDialogVisible=true;
    },
    //获取角色下所有权限的id 并保存到defkeys数组中
    getLeafKeys(node,arr){
      //如果node节点不包含children属性 则是三级节点
      if(!node.children){
         return arr.push(node.id)
      }
      //通过递归的方式获取其他节点的id
      node.children.forEach(item=>{
        this.getLeafKeys(item,arr)
      })
    },
    // 关闭分配权限时 清空保存权限id的数组defkeys
    setRightDialogclose(){
      this.defkeys=[];
    },
    //点击为角色分配权限
    allotRight(){
      const keys=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const idStr=keys.join(',');
      this.axios.post(`/roles/${this.roleId}/rights`,{rids:idStr}).then(res=>{
        let {meta}=res.data;
        if(meta.status!==200) return this.$message.error('分配权限失败');
        this.$message.success('分配权限成功');
        this.getRolelist();
        this.setRightDialogVisible=false;
      })

    }
  },
  mounted(){
    //获取角色列表
    this.getRolelist()
  }
}
</script>

<style>
.roles .el-tag{
  margin: 7px;
}
.roles .bdbottom{
  border-bottom: 1px solid #eee;
}
.roles .bdtop{
  border-top: 1px solid #eee;
}
.roles .vcenter{
  display: felx;
  align-items: center;
}
</style>