<template>
    <div>
        <!-- Breadcrumb -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>查询订单</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- Card -->
        <el-card>
            <el-row :gutter="20">
                <!-- Input -->
                <el-col :span="8">  
                    <el-input placeholder="请输入部分订单编号" v-model="queryInfo.query" @clear="getOrderList" clearable>
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <el-table :data="orderList" stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="ID" prop="id"></el-table-column>
                <el-table-column label="订单编号" prop="number"></el-table-column>
                <el-table-column label="运输单号" prop="courier_number" width="200px"></el-table-column>
                <el-table-column label="承运用户" prop="username"></el-table-column>
                <el-table-column label="承运车辆" prop="license"></el-table-column>
                <el-table-column label="货物名称" prop="goodsname"></el-table-column>
                <el-table-column label="出发城市" prop="from_city"></el-table-column>
                <el-table-column label="到达城市" prop="to_city"></el-table-column>
                <el-table-column label="是否出发">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.courier_status == 1" type="success">已出发</el-tag>
                        <el-tag v-if="scope.row.courier_status == 0" type="danger">未出发</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否到达">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.status == 1" type="success">已到达</el-tag>
                        <el-tag v-if="scope.row.status == 0" type="danger">未到达</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="下单时间" prop="created_at"></el-table-column>
                <el-table-column label="操作">
                        <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="recoverOrder(scope.row.id)"></el-button>
                        </template>
                </el-table-column>
            </el-table>  
            <!-- Pagination -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 25, 50]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="orderListSize">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            queryInfo: {query: '', pagesize: 10, pagenum: 1, status: 'deleted'},
            orderList: [],
            orderListSize: 0,
            editOrderDialogVisible: false,
            editOrderFormRules: {
                address1: [{required: true,  message: '请填写省市区', trigger: 'blur' },],
                address2: [{required: true,  message: '请填写地址', trigger: 'blur' },]
            },
            editOrderForm: {
                address1: '',
                address2: '',
            },
            currentOrder: {},
            viewLogisticsDialogVisible: false,
            LogisticsInfo: [],

        }
    },
    created() {this.getOrderList()},
    methods: {
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getOrderList()
        },
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getOrderList()
        },
        async getOrderList() {
            const result = await this.$http.get('orders',{params: this.queryInfo})
            console.log(result)
            if(result.data.code !== 200) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.orderList = result.data.data.orders
            this.orderListSize = result.data.data.total
        },
        async recoverOrder(orderID) {
                const confirmResult =  await this.$confirm('此操作将恢复该订单信息, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).catch(err => err)
                if (confirmResult !== 'confirm') return this.$message.info('取消恢复订单信息')
                const result = await this.$http.patch('/orders/' + orderID + "/recover")
                if(result.data.code !== 201) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)  
                this.getOrderList()     
        }
    }
}
</script>

<style scoped>

</style>