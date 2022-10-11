<template>
    <div>
        <!-- Breadcrumb -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>查询商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- Card -->
        <el-card>
            <el-row :gutter="20">
                <!-- Input -->
                <el-col :span="8">
                    <el-input placeholder="请输入货物 ID" v-model="goodID" @clear="getGoodsList" @keyup.enter.native="getGoodsList" clearable >
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
                <el-table-column label="运输状态">
                    <template slot-scope="scope">
                        <!-- Switch -->
                        <el-switch v-model="scope.row.courier_status" @change="changeGoodsStatus(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="是否到达">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.status">已到达</el-tag>
                        <el-tag v-else type="danger">未到达</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditGoodsDialog(scope.row)"></el-button>
                        <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteGoods(scope.row.id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- Edit good dialog -->
        <el-dialog title="修改商品" :visible.sync="editGoodsDialogVisible" width="40%" @close="editGoodsCloseDialog">
            <el-form :model="editGoodsForm" ref="editGoodsFormRef" :rules="editGoodsRules" label-width="80px">
                <el-form-item label="商品名称" prop="name"><el-input v-model="editGoodsForm.name" @keyup.enter.native="editGoods" ></el-input></el-form-item>
                <el-form-item label="商品价格" prop="price"><el-input v-model.number="editGoodsForm.price" type="number" @keyup.enter.native="editGoods" ></el-input></el-form-item>
                <el-form-item label="商品重量" prop="weight"><el-input v-model.number="editGoodsForm.weight" @keyup.enter.native="editGoods" ></el-input></el-form-item>
                <el-form-item label="出发城市" prop="from_city"><el-input v-model="editGoodsForm.from_city" @keyup.enter.native="editGoods" ></el-input></el-form-item>
                <el-form-item label="到达城市" prop="to_city"><el-input v-model="editGoodsForm.to_city" @keyup.enter.native="editGoods" ></el-input></el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editGoods">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            goodID: null,
            editGoodsForm: {},
            editGoodsRules:{
                name: [{required: true,  message: '请填写商品名称', trigger: 'blur' }],
                price: [{type: 'number', required: true,  message: '请填写商品价格', trigger: 'blur' }],
                weight: [{type: 'number', required: true,  message: '请填写商品重量', trigger: 'blur' }],
                from_city: [{required: true,  message: '请填写商品出发城市', trigger: 'blur' }],
                to_city: [{required: true,  message: '请填写商品到达城市', trigger: 'blur' }],
            },
            goodsList: [],
            editGoodsDialogVisible: false,
        }
    },
    methods: {
        async getGoodsList() {
            this.goodsList.splice(0, this.goodsList.length)
            const result = await this.$http.get('/goods/' + this.goodID)
            console.log(result)
            if(result.data.code !== 200) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.goodsList.push(result.data.data)
        },
        async deleteGoods(id) {
            const confirmResult =  await this.$confirm('此操作将永久删除该商品信息, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).catch(err => err)
            if (confirmResult !== 'confirm') return this.$message.info('取消删除商品信息')
            const result = await this.$http.delete('goods/' + id)
            console.log(result)
            if(result.data.code !== 204) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.getGoodsList()
        },
        async changeGoodsStatus(item) {
            const result = await this.$http.patch('/goods/' + item.id + '/courierstatus', {"courierstatus": item.courier_status})
            console.log(result)
            if(result.data.code !== 201) {
                item.courier_status = !item.courier_status
                return this.$message.error(result.data.msg)
            }
            this.$message.success(result.data.msg)
            this.getGoodsList()
        },
        showEditGoodsDialog(item) {
            this.editGoodsDialogVisible = true
            this.editGoodsForm = item
        },
        editGoodsCloseDialog() {
            this.$refs.editGoodsFormRef.resetFields()
            this.editGoodsForm.goods_id = 0
        },
        async editGoods() {
            this.editGoodsForm.fromcity = this.editGoodsForm.from_city
            this.editGoodsForm.tocity = this.editGoodsForm.to_city
            const result = await this.$http.put('/goods/' + this.editGoodsForm.id, this.editGoodsForm)
            console.log(result)
            if(result.data.code !== 201) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.getGoodsList()
            this.editGoodsDialogVisible = false
        },
    },
}
</script>

<style scoped>

</style>