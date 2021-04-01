<template>
  <div class="users">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            clearable
            v-model="queryInfo.query"
            @clear="getUserlist"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserlist"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              content="修改用户"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>

            <el-tooltip
              class="item"
              effect="dark"
              content="删除"
              placement="top"
              :enterable="false">
              <el-button @click="removeUserById(scope.row.id)"
                type="danger"
                icon="el-icon-delete"
                size="mini"
              ></el-button>
            </el-tooltip>

            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button @click="setRole(scope.row)"
                type="warning"
                icon="el-icon-setting"
                size="mini"></el-button>
            </el-tooltip>
          </template>
          
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClose"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%">
      <div>
        <p>{{userinfo.username}}</p>
        <p>{{userinfo.role_name}}</p>
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        //合法的邮箱
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };
    //验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        // 合法的手机号
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };
    return {
      // 获取用户列表对象的参数
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      userlist: [],
      total: 0,
      addDialogVisible: false,
      editDialogVisible:false,
      // 添加用户表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 添加表单验证规则对象
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", triggle: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名长度在3~10个字符之间",
            triggle: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", triggle: "blur" },
          {
            min: 6,
            max: 15,
            message: "密码长度在6~15个字符之间",
            triggle: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", triggle: "blur" },
          { validator: checkEmail, triggle: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", triggle: "blur" },
          { validator: checkMobile, triggle: "blur" },
        ],
      },
      // 查询到的用户信息对象
      editForm:{},
      //修改表单的验证规则对象
      editFormRules:{
        email:[
          {required:true,message:'请输入用户邮箱',triggle:'blur'},
          {validator:checkEmail,message:'请输入合法的邮箱',triggle:'blur'}
        ],
        mobile:[
          {required:true,message:'请输入用户手机',triggle:'blur'},
          {validator:checkMobile,message:'请输入合法的手机',triggle:'blur'}
        ]
      },
      //控制分配角色对话框的显示 隐藏
      setRoleDialogVisible:false,
      //需要被分配角色的用户信息
      userinfo:{},
      //角色列表数据
      roleList:[],
      //已选中的角色ID值
      selectedRoleId:'',
    };
  },
  methods: {
    //获取用户列表
    getUserlist() {
      this.axios.get("/users", { params: this.queryInfo }).then((res) => {
        let { data, meta } = res.data;
        if (meta.status !== 200) return this.$message.error("获取用户列表失败");
        this.userlist = data.users;
        this.total = data.total;
        console.log(this.queryInfo);
      });
    },
    //监听pagesize 改变的时间
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserlist();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserlist();
    },
    //监听用户状态的改变
    userStateChange(userinfo) {
      this.axios
        .put(`/users/${userinfo.id}/state/${userinfo.mg_state}`)
        .then((res) => {
          let { data, meta } = res.data;
          if (meta.status !== 200) {
            userinfo.mg_state = !userinfo.mg_state;
            return this.$message.error("更新用户状态失败");
          }
          this.$message.success("更新用户状态成功");
        });
    },
    // 监听对话框关闭的事件
    addDialogClose() {
      console.log(this.$refs.addFormRef);
      this.$refs.addFormRef.resetFields();
    },
    //点击按钮添加新用户
    addUser() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return;
        this.axios.post("users", this.addForm).then((res) => {
          let { data, meta } = res.data;
          if (meta.status == 201) {
            this.$message.success("添加用户成功");
            //隐藏对话框
            this.addDialogVisible = false;
            //重新获取用户列表
            this.getUserlist();
          } else {
            this.$message.error("添加用户失败");
          }
        });
      });
    },
    // 展示修改对话框
    showEditDialog(id){
      this.axios.get('users/'+id).then(res=>{
        let {data,meta}=res.data;
        if(meta.status!==200){
          return this.$message.error('查询用户失败')
        }
        this.editForm=data;
      })
      this.editDialogVisible=true
    },
    //监听修改用户对话框关闭的事件
    editDialogClose(){
      this.$refs.editFormRef.resetFields()
    },
    //修改用户信息并提交
    editUserInfo(){
      this.$refs.editFormRef.validate(valid=>{
        if(!valid) return;
        //发起修改请求
        this.axios.put('users/'+this.editForm.id,{
          email:this.editForm.email,
          mobile:this.editForm.mobile
        }).then(res=>{
          let {meta}=res.data
          if(meta.status!==200){
            return this.$message.error('更新用户信息失败')
          }
          //关闭对话框
          this.editDialogVisible=false;
          //更新用户列表
          this.getUserlist();
          //提示更新成功
          this.$message.success('更新用户信息成功')
        })
      })
    },
    //点击按钮删除用户的事件
    removeUserById(id){
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.axios.delete('users/'+id).then(res=>{
            let {meta}=res.data;
            if(meta.status!==200){
              return this.$message.error('删除用户失败')
            }
            this.$message({
            type: 'success',
            message: '删除用户成功!'
            });
            this.getUserlist()
          })
          
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });    
    },
    //点击分配角色按钮 显示分配角色对话框
    setRole(userinfo){
      this.userinfo=userinfo;
      //获取角色列表
      this.axios.get('/roles').then(res=>{
        let {data,meta}=res.data;
        if(meta.status!==200) return this.$message.error('获取角色列表失败');
        this.roleList=data;
      })
      //显示分配角色对话框
      this.setRoleDialogVisible=true
    },
    //点击按钮 分配角色
    saveRoleInfo(){
      if(!this.selectedRoleId) return this.$message.error('请选择要分配的角色')
      this.axios.put(`/users/${this.userinfo.id}/role`,{rid:this.selectedRoleId}).then(res=>{
        let {meta}=res.data;
        if(meta.status!==200){
          return this.$message.error('分配角色失败');
        };
        this.$message.success('分配角色成功');
        this.getUserlist();
        this.setRoleDialogVisible=false;
      })
    }
  },
  mounted() {
    this.getUserlist();
  },
};
</script>