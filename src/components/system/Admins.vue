<template>
    <div>
        <!-- Breadcrumb -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>系统管理</el-breadcrumb-item>
            <el-breadcrumb-item>管理员列表</el-breadcrumb-item>
        </el-breadcrumb>
          <!-- Card -->
        <el-card>
            <!-- Input -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input v-model="queryInfo.query" placeholder="请输入用户名或地区" clearable @keyup.enter.native="getUserList" @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                    <!-- Select -->
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- Table -->
            <el-table :data="userList" stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role"></el-table-column>
                <el-table-column label="地区" prop="city"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <!-- Switch -->
                        <el-switch v-model="scope.row.status" @change="changeUserStatus(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200px">
                    <template slot-scope="scope">
                            <!-- Button -->
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
                            <!-- Tooltip -->
                            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                                <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRoleDialog(scope.row)"></el-button>
                            </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- Pagination -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 25, 50]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="userListSize">
            </el-pagination>
        </el-card>
        <!-- Add user dialog -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="40%" @close="addUserCloseDialog">
            <el-form :model="addUserForm" :rules="addUserRules" ref="addUserFormRef" label-width="80px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addUserForm.username" @keyup.enter.native="addUser"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addUserForm.password" @keyup.enter.native="addUser" type="password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addUserForm.email" @keyup.enter.native="addUser"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="mobile">
                    <el-input v-model="addUserForm.mobile"  @keyup.enter.native="addUser"></el-input>
                </el-form-item>
                <el-form-item label="地区" prop="city">
                    <el-input v-model="addUserForm.city"  @keyup.enter.native="addUser"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
        <!-- Edit user dialog -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="40%" @close="editUserCloseDialog">
            <el-form :model="editUserForm" :rules="editUserRules" ref="editUserFormRef" label-width="80px">
                <el-form-item label="用户名">
                    <el-input v-model="editUserForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editUserForm.email" @keyup.enter.native="editUser"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="mobile">
                    <el-input v-model="editUserForm.mobile"  @keyup.enter.native="editUser"></el-input>
                </el-form-item>
                <el-form-item label="地区" prop="city">
                    <el-input v-model="editUserForm.city"  @keyup.enter.native="editUser"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>
        <!-- Set role dialog -->
        <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="40%" @close="setRoleCloseDialog">
            <el-form>
                <p>当前的用户：{{ userInfo.username }}</p>
                <p>当前的角色：{{ userInfo.role }}</p>
                <p>请选择新角色：
                    <el-select v-model="selectedRole" placeholder="请选择">
                        <el-option v-for="(item, index) in roleList" :key="index" :label="item.name" :value="item.name"> </el-option>
                    </el-select>
                </p>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="setRole">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            var checkEmail = (rules,value,callback) => {
                const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
                if(regEmail.test(value)) return callback()
                callback(new Error('请输入合法的邮箱'))
            }
            var checkMobile = (rules,value,callback) => {
                const regMobile = /^(0|86|17951)?(13[0-9]|14[57]|15[012356789]|17[678]|18[0-9])[0-9]{8}$/
                if(regMobile.test(value)) return callback()
                callback(new Error('请输入合法的号码'))
            }
            return{
                queryInfo: {
                    query: "",
                    pagenum: 1,
                    pagesize: 10,
                    category: "admin",
                },
                addUserForm: {
                    username: '',
                    password: '',
                    email: '',
                    mobile: '',
                    city: '',
                },
                editUserForm: {
                    username: '',
                    email: '',
                    mobile: '',
                    city: '',
                },
                addUserRules: {
                    username: [{required: true, message: '请输入用户名', trigger: 'blur'},{min: 3, max: 10, message: '用户名的长度在3到10个字符之间', trigger: 'blur'}],
                    password: [{required: true, message: '请输入密码', trigger: 'blur'},{min: 6, max: 16, message: '密码的长度在6到16个字符之间', trigger: 'blur'}],
                    email: [{required: true, message: '请输入邮箱', trigger: 'blur'},{validator: checkEmail, trigger: 'blur'}],
                    mobile: [{required: true, message: '请输入电话', trigger: 'blur'},{validator: checkMobile, trigger: 'blur'}],
                    city: [{required:true,message: '请输入地区', trigger: 'blur'}],
                },
                editUserRules: {
                    email: [{required: true, message: '请输入邮箱', trigger: 'blur'},{validator: checkEmail, trigger: 'blur'}],
                    mobile: [{required: true, message: '请输入电话', trigger: 'blur'},{validator: checkMobile, trigger: 'blur'}],
                    city: [{required:true,message: '请输入地区', trigger: 'blur'}],
                },
                userList: [],
                userInfo: {},
                roleList: [],
                userListSize: 0,
                addDialogVisible: false,
                editDialogVisible: false,
                setRoleDialogVisible: false,
                selectedRole: '',
            }
        },
        created() {this.getUserList()},
        methods: {
            async getUserList() {
                this.userList.splice(0, this.userList.length)
                var result = await this.$http.get('/users', {params: this.queryInfo})
                console.log(result.data)
                if(result.data.code !== 200) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)
                this.userList = result.data.data.users
                this.userListSize = result.data.data.total
            },
            handleSizeChange:function(newSize) {
                this.queryInfo.pagesize = newSize
                this.getUserList()
            },
            handleCurrentChange:function(newPage) {
                this.queryInfo.pagenum = newPage
                this.getUserList()
            },
            async changeUserStatus(userInfo) {
                const result = await this.$http.patch("/users/" + userInfo.id + "/status", {"status": userInfo.status})
                console.log(result)
                if(result.data.code !== 201){
                    userInfo.status = !userInfo.status
                    return this.$message.error(result.data.msg)
                }
                this.$message.success(result.data.msg)
                this.getUserList()
            },
            addUserCloseDialog:function() {
                this.$refs.addUserFormRef.resetFields()
            },
            editUserCloseDialog:function() {
                this.$refs.editUserFormRef.resetFields()
            },
            setRoleCloseDialog:function() {
                this.selectedRoleId = ''
                this.userInfo = {}
            },
            addUser() {
                this.$refs.addUserFormRef.validate(async valid => {
                    if(!valid) return
                    const result = await this.$http.post('/register',this.addUserForm)
                    console.log(result)
                    if(result.data.code !== 201) return this.$message.error(result.data.msg)
                    this.$message.success(result.data.msg)
                    this.addDialogVisible = false
                    this.getUserList()
                })
            },
            async showEditDialog(id) {
                this.editDialogVisible = true
                const result = await this.$http.get('/users/' + id)
                console.log(result)
                if(result.data.code !== 200) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)
                this.editUserForm = result.data.data
            },
            editUser() {
                this.$refs.editUserFormRef.validate(async valid => {
                    if(!valid) return
                    const result = await this.$http.put('/users/' + this.editUserForm.id , this.editUserForm)
                    console.log(result)
                    if(result.data.code !== 201) return this.$message.error(result.data.msg)
                    this.$message.success(result.data.msg)
                    this.editDialogVisible = false
                    this.getUserList()
                })
            },
            async deleteUser(userID) {
                const confirmResult =  await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).catch(err => err)
                if (confirmResult !== 'confirm') return this.$message.info('取消删除用户')
                const result = await this.$http.delete('/users/' + userID)
                if(result.data.code !== 204) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)
                this.getUserList()

            },
            async showSetRoleDialog(userInfo) {
                this.userInfo = userInfo
                this.setRoleDialogVisible = true
                const result = await this.$http.get('roles')
                console.log(result)
                if(result.data.code !== 200) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)
                this.roleList = result.data.data
            },
            async setRole() {
                const result = await this.$http.patch('users/' + this.userInfo.id + '/role',{role: this.selectedRole})
                console.log(result)
                if(result.data.code !== 201) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)
                this.setRoleDialogVisible = false
                this.getUserList()
            }
        },
    }
</script>

<style scoped>
</style>