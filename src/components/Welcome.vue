<template>
    <div>
        <el-row>
            <el-card>
                <h1 class="align_center">系统概况</h1>
            </el-card><br><br>
            <el-col :span="2">&nbsp;</el-col>
            <el-col :span="9">
                <el-card>
                    <h3>订单概况</h3>
                    <p class="align_center">目前全部订单总数为：{{ orderList.length }}</p>
                    <p class="align_center">目前未开始的订单数为：{{ unstartedOrder }}</p>
                    <p class="align_center">目前未结束的订单数为：{{ undoneOrder }}</p>
                </el-card><br><br>
                <el-card>
                    <h3>用户概况</h3>
                    <p class="align_center">目前全部用户总数为：{{ userList.length }}</p>
                    <p class="align_center">目前正在作业用户数为：{{ undoneUser }}</p>
                    <p class="align_center">目前未在作业用户数为：{{ unstartedUser }}</p>
                </el-card><br><br>
                <el-card>
                    <h3>货物概况</h3>
                    <p class="align_center">目前全部货物总数为：{{ goodsList.length }}</p>
                    <p class="align_center">目前未开始运输的货物数为：{{ unstartedGoods}}</p>
                    <p class="align_center">目前未结束运输的货物数为：{{ undoneGoods }}</p>
                </el-card>
            </el-col>
            <el-col :span="2">&nbsp;</el-col>
            <el-col :span="9">
                <el-card>
                    <h3>车辆概况</h3>
                    <p class="align_center">目前全部车辆总数为：{{ carList.length }}</p>
                    <p class="align_center">目前未开始作业的车辆数为：{{ unstartedCar }}</p>
                    <p class="align_center">目前未结束作业的车辆数为：{{ undoneCar }}</p>
                </el-card><br><br>
                <el-card>
                    <h3>工单概况</h3>
                    <p class="align_center">目前全部工单总数为：{{ wipList.length }}</p>
                    <p class="align_center">目前未处理的工单数为：{{ doneWip }}</p>
                    <p class="align_center">目前已处理的工单数为：{{ undoneWip }}</p>
                </el-card><br><br>
            </el-col>
            <el-col :span="2">&nbsp;</el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    data() {
        return {
            queryInfo: {query: '', pagesize: 10000, pagenum: 1, category: "all"},
            orderList: [],
            undoneOrder: 0,
            doneOrder: 0,
            unstartedOrder: 0,
            goodsList: [],
            undoneGoods: 0,
            unstartedGoods: 0,
            doneGoods: 0,
            userList: [],
            undoneUser: 0,
            unstartedUser: 0,
            carList: [],
            undoneCar: 0,
            unstartedCar: 0,
            wipList: [],
            doneWip: 0,
            undoneWip: 0,
        }
    },
    created() {this.init()},
    methods: {
        init() {
            this.getOrderList()
            this.getGoodsList()
            this.getUserList()
            this.getCarList()
            this.getWipList()
        },
        async getOrderList() {
            const result = await this.$http.get('orders',{params: this.queryInfo})
            if(result.data.code !== 200) return this.$message.error(result.data.msg)
            console.log(result)
            this.$message.success(result.data.msg)
            this.orderList = result.data.data.orders
            for (var i = 0; i < this.orderList.length; i++) {
                if (this.orderList[i].courier_status == 0) this.unstartedOrder++
                if (this.orderList[i].courier_status == 1 && this.orderList[i].status == 1) this.doneOrder++
            }
            this.undoneOrder = this.orderList.length - (this.unstartedOrder + this.doneOrder)
            
        },
        async getGoodsList() {
            const result = await this.$http.get('/goods',{params: this.queryInfo})
            console.log(result)
            if(result.data.code !== 200) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.goodsList = result.data.data.goods
            for (var i = 0; i < this.goodsList.length; i++) {
                if (this.goodsList[i].status == 0 && this.goodsList[i].courier_status == 1) this.undoneGoods++
                if (this.goodsList[i].status == 1 && this.goodsList[i].courier_status == 1) this.doneGoods++
                
            }
            this.unstartedGoods = this.goodsList.length - this.undoneGoods  - this.doneGoods 
        },
        async getUserList() {
            const result = await this.$http.get('/users',{params: this.queryInfo})
            console.log(result)
            if(result.data.code !== 200) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.userList = result.data.data.users
            for (var i = 0; i < this.userList.length; i++) {
                if (this.userList[i].status == 1) this.undoneUser++
            }
            this.unstartedUser = this.userList.length - this.undoneUser
        },
        async getCarList() {
            const result = await this.$http.get('/cars',{params: this.queryInfo})
            console.log(result)
            if(result.data.code !== 200) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.carList = result.data.data.cars
            for (var i = 0; i < this.carList.length; i++) {
                if (this.carList[i].status == 1) this.undoneCar++
            }
            this.unstartedCar = this.carList.length - this.undoneCar
        },
        async getWipList() {
            const result = await this.$http.get('/wips',{params: this.queryInfo})
            console.log(result)
            if(result.data.code !== 200) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.wipList = result.data.data.wips
            for (var i = 0; i < this.wipList.length; i++) {
                if (this.wipList[i].status == 1) this.doneWip++
            }
            this.undoneWip = this.wipList.length - this.doneWip
        },
    }
}
</script>

<style scoped>
    .align_center{text-align: center;}
</style>