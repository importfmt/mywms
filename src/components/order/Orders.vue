<template>
    <div>
        <!-- Breadcrumb -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- Card -->
        <el-card>
            <el-row :gutter="20">
                <!-- Input -->
                <el-col :span="8">  
                    <el-input placeholder="请输入部分订单编号或所需条件" v-model="queryInfo.query" @clear="getOrderList"  @keyup.enter.native="getOrderList" clearable>
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-select v-model="queryInfo.category" placeholder="请选择" @change="getOrderList">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-button @click="redirectToAddOrderPage" type="primary">新建订单</el-button>
                </el-col>
            </el-row>
            <el-table :data="orderList" stripe>
                <!-- <el-table-column type="index" label="#"></el-table-column> -->
                <el-table-column width="50px" label="ID" prop="id"></el-table-column>
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
                <el-table-column label="创建时间" prop="created_at">
                </el-table-column>
                <el-table-column label="操作" width="200px">
                    <template slot-scope="scope">
                        <!-- <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditOrderDialog(scope.row)"></el-button> -->
                        <el-button type="success" icon="el-icon-position" size="mini" @click="showViewLogisticsDialog(scope.row)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteOrder(scope.row.id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>  
            <!-- Pagination -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 25, 50]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="orderListSize">
            </el-pagination>
        </el-card>
        <!-- Edit order Dialog -->
        <!-- <el-dialog title="修改地址" :visible.sync="editOrderDialogVisible" width="40%" @close="editOrderCloseDialog">
            <el-form :model="editOrderForm" ref="editOrderFormRef" :rules="editOrderFormRules">
                <el-form-item label="省市区/县" prop="address1">
                    <el-input v-model="editOrderForm.address1"></el-input>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="editOrderForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editOrderDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editOrder">确 定</el-button>
            </span>
        </el-dialog> -->
        <!-- View logistics dialog -->
        <el-dialog title="物流信息" :visible.sync="viewLogisticsDialogVisible" width="40%" @close="viewLogisticsCloseDialog">
            <!-- Timeline -->
            <el-timeline>
                <el-timeline-item   v-for="(item, index) in LogisticsInfo" :key="index"   :timestamp="item.time">
                    {{item.context}}
                </el-timeline-item>
            </el-timeline>
            <span slot="footer" class="dialog-footer">                
                <el-button type="primary" @click="viewLogisticsDialogVisible = false">关 闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            queryInfo: {query: '', pagesize: 10, pagenum: 1, category: "all"},
                options: [
                    {value: 'all', label: '全部'},
                    {value: 'username', label: '承运用户'},
                    {value: 'license', label: '承运车辆'},
                    {value: 'goodsname', label: '承运货物'},
                    {value: 'from_city', label: '出发城市'},
                    {value: 'to_city', label: '目标城市'},
                    {value: 'courier_true', label: '正在运输'},
                    {value: 'courier_false', label: '暂未运输'},
                    {value: 'goods_true', label: '已经到达'},
                    {value: 'goods_false', label: '还未到达'},
                ],
            orderList: [],
            orderListSize: 0,
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
            this.orderList.splice(0, this.orderList.length)
            const result = await this.$http.get('orders',{params: this.queryInfo})
            console.log(result)
            if(result.data.code !== 200) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.orderList = result.data.data.orders
            this.orderListSize = result.data.data.total
        },
        viewLogisticsCloseDialog() {
            this.viewLogisticsDialogVisible = false
        },
        async showViewLogisticsDialog(item) {
            this.viewLogisticsDialogVisible = true
            const result = await this.$http.get('/kuaidi/1106975712662')
            console.log(result)
            if(result.data.meta.status !== 200) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.LogisticsInfo = result.data.data

        },
        async deleteOrder(orderId) {
            const confirmResult =  await this.$confirm('此操作将永久删除该订单信息, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).catch(err => err)
            if (confirmResult !== 'confirm') return this.$message.info('取消删除车辆信息')
            const result = await this.$http.delete('/orders/' + orderId)
            if(result.data.code !== 204) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.getOrderList()
        },
        redirectToAddOrderPage() {
            this.$router.push('/orders/add');
        }
    }
}
</script>

<style scoped>

</style>