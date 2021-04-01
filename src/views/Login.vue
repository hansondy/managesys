<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avater_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登陆表单区域 -->
      <el-form ref="loginFormRef" class="login_form" :model="loginForm" :rules="loginFormRules">
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-icon_user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="iconfont icon-Password" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data(){
    return {
      //这是登录表单的数据绑定对象
      loginForm:{
        username:'',
        password:''
      },
      //这是登录表单的验证规则对象
      loginFormRules:{
        //登录名的验证
        username:[
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        //登录密码的验证
        password:[
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods:{
    resetLoginForm(){
      this.$refs.loginFormRef.resetFields();
    },
    login(){
      this.$refs.loginFormRef.validate((valid)=>{
        if(!valid) return;
        this.axios.post('/login',this.loginForm)
        .then(res=>{
          if(res.data.meta.status==200){
            this.$message.success("登陆成功")
            window.sessionStorage.setItem("token",res.data.data.token);
            this.$router.push('/home')
          }else{
            this.$message.error('登录失败')
          }
        })
      });
    }
  }
}
</script>
<style>
.login_container{
  height: 100%;
  background: #2b4b6b;
}
.login_container>.login_box{
  width: 450px;height: 300px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  background: #fff;
  border-radius: 3px;
}
.login_container .avater_box{
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  background: #fff ;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%,-50%);
}
.login_container .avater_box>img{
  width: 100%;height: 100%;
  background: #eee;
  border-radius: 50%;
}
.login_container .login_form{
  width: 100%;
  position: absolute;
  bottom: 0;
  box-sizing: border-box;
  padding: 20px;
}
.login_container .btns{
  display: flex;
  justify-content: flex-end;
}
</style>
