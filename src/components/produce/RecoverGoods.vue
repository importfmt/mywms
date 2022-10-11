<template>
    <div>
        <!-- Breadcrumb -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>恢复商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- Card -->
        <el-card>
            <el-row :gutter="20">
                <!-- Input -->
                <el-col :span="8">
                    <el-input placeholder="请输入货物名称" v-model="queryInfo.query" @keyup.enter.native="getGoodsList" @clear="getGoodsList" clearable>
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- Table -->
            <el-table :data="goodsList" stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="商品名称" prop="name"></el-table-column>
                <el-table-column label="价格（元）" prop="price"></el-table-column>
                <el-table-column label="重量" prop="weight"></el-table-column>
                <el-table-column label="出发城市" prop="from_city"></el-table-column>
                <el-table-column label="到达城市" prop="to_city"></el-table-column>
                <el-table-column label="运输单号" prop="courier_number" width="200px"></el-table-column>
                <el-table-column label="是否到达">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.status">已到达</el-tag>
                        <el-tag v-else type="danger">未到达</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="recoverGoods(scope.row.id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 25, 50]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="goodsListSize">
            </el-pagination>
        </el-card>
    </div>
</template>
<script>
export default {
    data() {
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10,
                status: 'deleted',
            },
            goodsList: [],
            goodsListSize: 0,
        }
    },
    created() {this.getGoodsList()},
    methods: {
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
        },
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage    
            this.getGoodsList()
        },
        async getGoodsList() {
            const result = await this.$http.get('/goods',{params: this.queryInfo})
            console.log(result)
            if(result.data.code !== 200) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.goodsList = result.data.data.goods
            this.goodsListSize = result.data.data.total
        },
        async recoverGoods(id) {
            const confirmResult =  await this.$confirm('此操作将永久恢复该商品信息, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).catch(err => err)
            if (confirmResult !== 'confirm') return this.$message.info('取消恢复商品信息')
            const result = await this.$http.patch('/goods/' + id + '/recover')
            console.log(result)
            if(result.data.code !== 201) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.getGoodsList()
        },
    },
}
</script>

<style scoped>

</style>