<template>
    <div>
        <!-- Breadcrumb -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>车辆管理</el-breadcrumb-item>
            <el-breadcrumb-item>车辆列表</el-breadcrumb-item>
        </el-breadcrumb>
          <!-- Card -->
        <el-card>
            <!-- Input -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input v-model="carid" placeholder="请输入车辆 ID" clearable @keyup.enter.native="getCarList" @clear="getCarList">
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
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <!-- Switch -->
                        <el-switch v-model="scope.row.status" @change="changeCarStatus(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200px">
                    <template slot-scope="scope">
                            <!-- Button -->
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCar(scope.row.id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- Edit car dialog -->
        <el-dialog title="修改车辆" :visible.sync="editDialogVisible" width="40%" @close="editCarCloseDialog">
            <el-form :model="editCarForm" :rules="editCarRules" ref="editCarFormRef" label-width="80px">
                <el-form-item label="品牌" prop="brand">
                    <el-input v-model="editCarForm.brand" @keyup.enter.native="editCar"></el-input>
                </el-form-item>
                <el-form-item label="车牌" prop="license">
                    <el-input v-model="editCarForm.license"  @keyup.enter.native="editCar"></el-input>
                </el-form-item>
                <el-form-item label="载重量" prop="dead_weight">
                    <el-input v-model.number="editCarForm.dead_weight"  @keyup.enter.native="editCar"></el-input>
                </el-form-item>
                <el-form-item label="地区" prop="city">
                    <el-input v-model="editCarForm.city"  @keyup.enter.native="editCar"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCar">确 定</el-button>
            </span>
        </el-dialog>
    </div> 
</template>

<script>
    export default {
        data() {
            return {
                carid: '',
                editCarForm: {
                    brand: '',
                    license: '',
                    dead_weight: 0,
                    city: '',
                },
                editCarRules: {
                    brand: [{required: true, message: '请输入车辆品牌', trigger: 'blur'},],
                    license: [{required: true, message: '请输入车辆车牌', trigger: 'blur'},],
                    dead_weight: [{required: true, message: '请输入载重量', trigger: 'blur'},],
                    city: [{required:true,message: '请输入地区', trigger: 'blur'}],
                },
                carList: [],
                carInfo: {},
                editDialogVisible: false,
            }
        },
        methods: {
            async getCarList() {
                this.carList.splice(0,this.carList.length)
                var result = await this.$http.get('/cars/' + this.carid)
                console.log(result.data)
                if(result.data.code !== 200) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)
                this.carList.push(result.data.data)
            },
            async changeCarStatus(carInfo) {
                const result = await this.$http.patch("/cars/" + carInfo.id + "/status", {"status": carInfo.status})
                console.log(result)
                if(result.data.code !== 201){
                    carInfo.status = !carInfo.status
                    return this.$message.error(result.data.msg)
                }
                this.$message.success(result.data.msg)
                this.getCarList()
            },
            editCarCloseDialog:function() {
                this.$refs.editCarFormRef.resetFields()
            },
            async showEditDialog(id) {
                this.editDialogVisible = true
                const result = await this.$http.get('/cars/' + id)
                console.log(result)
                if(result.data.code !== 200) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)
                this.editCarForm = result.data.data

            },
            editCar() {
                this.$refs.editCarFormRef.validate(async valid => {
                    if(!valid) return
                    this.editCarForm.deadweight = this.editCarForm.dead_weight
                    const result = await this.$http.put('/cars/' + this.editCarForm.id , this.editCarForm)
                    console.log(result)
                    if(result.data.code !== 201) return this.$message.error(result.data.msg)
                    this.$message.success(result.data.msg)
                    this.editDialogVisible = false
                    this.getCarList()
                })
            },
            async deleteCar(carId) {
                const confirmResult =  await this.$confirm('此操作将永久删除该车辆信息, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).catch(err => err)
                if (confirmResult !== 'confirm') return this.$message.info('取消删除车辆信息')
                const result = await this.$http.delete('/cars/' + carId)
                if(result.data.code !== 204) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)
                this.carList.splice(0,this.carList.length)

            },
        },
    }
</script>

<style scoped>
</style>