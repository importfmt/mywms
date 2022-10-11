<template>
    <div>
        <!-- Breadcrumb -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>工单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- Card -->
        <el-row>
            <el-col :span="7">
                <!-- Input -->
                <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @keyup.enter.native="getWipList" @clear="getWipList">
                    <el-button slot="append" icon="el-icon-search" @click="getWipList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <!-- Select -->
                <el-select v-model="queryInfo.category" placeholder="请选择" @change="getWipList">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
            </el-col>
        </el-row>
        <!-- Table -->
        <el-table :data="wipList" stripe>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="工单标题" prop="title"></el-table-column>
            <el-table-column label="工单描述" prop="desc"></el-table-column>
            <el-table-column label="工单回复" prop="reply"></el-table-column>
            <el-table-column label="工单时间" prop="created_at"></el-table-column>
            <el-table-column label="工单状态">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.status == 1" type="success">已处理</el-tag>
                    <el-tag v-if="scope.row.status == 0" type="danger">未处理</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showWipDialog(scope.row.id)">回复</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- Pagination -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 25, 50]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="wipListSize">
        </el-pagination>
        <!-- Reply dialog -->
        <el-dialog title="回复工单" :visible.sync="wipDialogVisible" width="40%" @close="setWipCloseDialog">
            <el-form>
                <el-input type="textarea" rows="5" v-model="reply" placeholder="请输入内容" maxlength="50" height="50"></el-input>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="wipDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="replyWip">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return{
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10,
                    category: "all",
                },
                wipList: [],
                options: [
                    {value: 'all', label: '全部'},
                    {value: 'processed', label: '已处理'},
                    {value: 'untreated', label: '未处理'},
                    {value: 'asc', label: '时间正序'},
                    {value: 'desc', label: '时间倒序'},
                ],
                wipListSize: 0,
                wipDialogVisible: false,
                reply: "",
                wipID: 0,

            }
        },
        created() {this.getWipList()},
        methods: {
            handleSizeChange:function(newSize) {
                this.queryInfo.pagesize = newSize
                this.getWipList()
            },
            handleCurrentChange:function(newPage) {
                this.queryInfo.pagenum = newPage
                this.getWipList()
            },
            async getWipList() {
                this.wipList.splice(0, this.wipList.length)
                const result = await this.$http.get('/wips', {params: this.queryInfo})
                console.log(result)
                if(result.data.code !== 200) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)
                this.wipList = result.data.data.wips
                this.wipListSize = result.data.data.total
            },
            setWipCloseDialog() {
                this.reply = ""
                this.wipID = 0
            },
            async replyWip() {
                    const result = await this.$http.patch('/wips/' + this.wipID + '/reply', {"reply": this.reply})
                    console.log(result)
                    if(result.data.code !== 201) return this.$message.error(result.data.msg)
                    this.$message.success(result.data.msg)
                    this.wipDialogVisible = false
                    this.getWipList()
            },
            showWipDialog(id) {
                this.wipID = id
                this.wipDialogVisible = true
            }
        }
    }
</script>

<style scoped>
.el-tag{margin: 8px;}
.borderBottom{border-bottom:1px solid #eeeeee;}
.borderTop{border-top: 1px solid #eeeeee;}
.vcenter{display: flex; align-items: center;}
</style>