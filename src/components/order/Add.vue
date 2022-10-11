<template>
    <div>
        <!-- Breadcrumb -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加订单</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- Card -->
        <el-card>
            <!-- Alert -->
            <el-alert title="添加订单信息" type="info" center show-icon :closable="false"></el-alert>
            <!-- Step -->
            <el-steps :space="300" :active="activeStep - 0" finish-status="success" align-center >
                <el-step title="基本信息"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- Form -->
            <el-form label-width="100px" lable-position="top">
                <!-- Tab -->
                <el-tabs tab-position="left" v-model="activeStep">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="请选择承运货物" label-width="200px">
                                <el-select v-model="selectedGoods" placeholder="请选择" @change="getCarList()">
                                    <el-option v-for="(item, index) in goodsList" :key="index" :label="item.name" :value="item.id"> </el-option>
                                </el-select>
                        </el-form-item>
                        <el-form-item label="请选择承运车辆" label-width="200px">
                                <el-select v-model="selectedCar" placeholder="请选择">
                                    <el-option v-for="(item, index) in carList" :key="index" :label="item.license" :value="item.id"> </el-option>
                                </el-select>
                        </el-form-item>
                        <el-form-item label="请选择承运用户" label-width="200px">
                                <el-select v-model="selectedUser" placeholder="请选择">
                                    <el-option v-for="(item, index) in userList" :key="index" :label="item.username" :value="item.id"> </el-option>
                                </el-select>
                        </el-form-item>
                        <el-button type="primary" class="submitButton" @click="addOrder">添加订单</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
    </div>
</template>


<script>
import _ from 'lodash'
export default {
    data() {
        return{
            goodsQueryInfo: {
                    query: "",
                    pagenum: 1,
                    pagesize: 10000,
                    category: "courier_false"
            },
            queryInfo: {
                    query: "",
                    pagenum: 1,
                    pagesize: 10000,
                    category: "city"
            },
            weight: "",
            activeStep: 0,
            selectedUser: null,
            selectedCar: null,
            selectedGoods: null,
            userList: [],
            carList: [],
            goodsList: [],
            headerObject: {Authorization: window.sessionStorage.getItem('token')},
        }
    },
    created(){this.getGoodsList()},
    methods: {
        async addOrder() {
            const result = await this.$http.post('orders',{"carrieruserid": this.selectedUser, "carriercarid": this.selectedCar, "goodsid": this.selectedGoods})
            console.log(result)
            if(result.data.code !== 201) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.$router.push('/orders')
        },
        async getUserList() {
            this.userList.splice(0, this.userList.length)
            const result = await this.$http.get('users',{params: this.queryInfo})
            console.log(result)
            if(result.data.code !== 200) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.userList = result.data.data.users
            for (var i = 0; i < this.userList.length; i++) {
                if (this.userList[i].status) {
                    this.userList.splice(i, 1)
                    i --
                }
            }
        },
        async getCarList() {
            this.carList.splice(0, this.carList.length)
            var goodsIndex = 0
            for ( goodsIndex = 0; goodsIndex < this.goodsList.length; goodsIndex ++) {
                if (this.goodsList[goodsIndex].id == this.selectedGoods) {
                    this.queryInfo.query = this.goodsList[goodsIndex].from_city
                    console.log(this.queryInfo.query)
                    break
                }
            }
            
            const result = await this.$http.get('cars',{params: this.queryInfo})
            console.log(result)
            if(result.data.code !== 200) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.carList = result.data.data.cars
            for (var i = 0; i < this.carList.length; i++) { 
                console.log(this.carList[i].status)
                if (this.carList[i].dead_weight < this.goodsList[goodsIndex].weight || this.carList[i].status) {
                    this.carList.splice(i, 1)
                    i-- 
                }
            }
            this.getUserList()
        },
        async getGoodsList() {
            const result = await this.$http.get('goods',{params: this.goodsQueryInfo})
            console.log(result)
            if(result.data.code !== 200) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.goodsList = result.data.data.goods
            for (var i = 0; i < this.goodsList.length; i++) {
                console.log(this.goodsList[i].courier_number)
                if (this.goodsList[i].courier_number.length > 0) {
                    this.goodsList.splice(i, 1)
                    i-- 
                }
            }
            
        },
    },
}
</script>

<style scoped>
    .el-steps{margin: 15px 0px;}
    .submitButton{ margin: 15px 0px;}
</style>