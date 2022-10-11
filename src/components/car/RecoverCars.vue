<template>
    <div>
        <!-- Breadcrumb -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>车辆管理</el-breadcrumb-item>
            <el-breadcrumb-item>恢复车辆</el-breadcrumb-item>
        </el-breadcrumb>
          <!-- Card -->
        <el-card>
            <!-- Input -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input v-model="queryInfo.query" placeholder="请输入车辆牌照号码" clearable @keyup.enter.native="getCarList" @clear="getCarList">
                        <el-button slot="append" icon="el-icon-search" @click="getCarList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- Table -->
            <el-table :data="carList" stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="品牌" prop="brand"></el-table-column>
                <el-table-column label="车牌" prop="license"></el-table-column>
                <el-table-column label="载重量" prop="dead_weight"></el-table-column>
                <el-table-column label="地区" prop="city"></el-table-column>
                <el-table-column label="操作" width="200px">
                    <template slot-scope="scope">
                            <!-- Button -->
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="recoverCar(scope.row.id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- Pagination -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 25, 50]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="carListSize">
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
                carList: [],
                carInfo: {},
                carListSize: 0,
            }
        },
        created() {this.getCarList()},
        methods: {
            async getCarList() {
                var result = await this.$http.get('/cars', {params: this.queryInfo})
                console.log(result.data)
                if(result.data.code !== 200) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)
                this.carList = result.data.data.cars
                this.carListSize = result.data.data.total
            },
            handleSizeChange:function(newSize) {
                this.queryInfo.pagesize = newSize
                this.getCarList()
            },
            handleCurrentChange:function(newPage) {
                this.queryInfo.pagenum = newPage
                this.getCarList()
            },
            async recoverCar(carId) {
                const confirmResult =  await this.$confirm('此操作将恢复该车辆信息, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).catch(err => err)
                if (confirmResult !== 'confirm') return this.$message.info('取消恢复车辆信息')
                const result = await this.$http.patch('/cars/' + carId + "/recover")
                if(result.data.code !== 201) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)  
                this.getCarList()
            },
        },
    }
</script>

<style scoped>
</style>