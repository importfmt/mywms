<template>
    <div>
        <!-- Breadcrumb -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>恢复用户</el-breadcrumb-item>
        </el-breadcrumb>
          <!-- Card -->
        <el-card>
            <!-- Input -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @keyup.enter.native="getUserList" @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
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
                <el-table-column label="操作" width="200px">
                    <template slot-scope="scope">
                            <!-- Button -->
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="recoverUser(scope.row.id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- Pagination -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 25, 50]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="userListSize">
            </el-pagination>
        </el-card>
    </div> 
</template>

<script>
    export default {
        data() {
            return{
                queryInfo: {
                    query: "",
                    pagenum: 1,
                    pagesize: 10,
                    status: "deleted",
                },
                userList: [],
                userInfo: {},
                userListSize: 0,
            }
        },
        created() {this.getUserList()},
        methods: {
            async getUserList() {
                var result = await this.$http.get('/users', {params: this.queryInfo})
                console.log(result.data)
                if(result.data.code !==200) return this.$message.error(result.data.msg)
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
            async recoverUser(userId) {
                const confirmResult =  await this.$confirm('此操作将恢复该用户信息, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).catch(err => err)
                if (confirmResult !== 'confirm') return this.$message.info('取消恢复用户信息')
                const result = await this.$http.patch('/users/' + userId + "/recover")
                if(result.data.code !== 201) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)
                this.getUserList()
            },
        },
    }
</script>

<style scoped>
</style>