<template>
    <div>
        <!-- Breadcrumb -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- Card -->
        <!-- Table -->
        <el-table :data="roleList" stripe>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="角色名称" prop="name"></el-table-column>
            <el-table-column label="角色描述" prop="desc"></el-table-column>
            <!-- <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoleDialog(scope.row.id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id)">删除</el-button>
                    <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column> -->
        </el-table>
    </div>
</template>

<script>
    export default {
        data() {
            return{
                roleList: [],
            }
        },
        created() {this.getRoleList()},
        methods: {
            async getRoleList() {
                const result = await this.$http.get('/roles')
                console.log(result)
                if(result.data.code !== 200) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)
                this.roleList = result.data.data
            },
        }
    }
</script>

<style scoped>
.el-tag{margin: 8px;}
.borderBottom{border-bottom:1px solid #eeeeee;}
.borderTop{border-top: 1px solid #eeeeee;}
.vcenter{display: flex; align-items: center;}
</style>