<template>
    <div>
        <!-- Breadcrumb -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品查询</el-breadcrumb-item>
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
                <el-col :span="4">
                    <el-select v-model="queryInfo.category" placeholder="请选择" @change="getGoodsList">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-col>
                <!-- Button -->
                <el-col :span="4"><el-button type="primary" @click="showAddGoodsDialog">添加商品</el-button></el-col>
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
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 25, 50]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="goodsListSize">
            </el-pagination>
        </el-card>
        <!-- Add goods dialog -->
        <el-dialog title="添加商品" :visible.sync="addGoodsDialogVisible" width="40%" @close="addGoodsCloseDialog">
            <el-form :model="addGoodsForm" :rules="addGoodsRules" ref="addGoodsFormRef" label-width="80px">
                <el-form-item label="货物名称" prop="name">
                    <el-input v-model="addGoodsForm.name" @keyup.enter.native="addGoods"></el-input>
                </el-form-item>
                <el-form-item label="货物价格" prop="price">
                    <el-input v-model.number="addGoodsForm.price" @keyup.enter.native="addGoods"></el-input>
                </el-form-item>
                <el-form-item label="货物重量" prop="weight">
                    <el-input v-model.number="addGoodsForm.weight" @keyup.enter.native="addGoods"></el-input>
                </el-form-item>
                <el-form-item label="出发城市" prop="fromcity">
                    <el-input v-model="addGoodsForm.fromcity"  @keyup.enter.native="addGoods"></el-input>
                </el-form-item>
                <el-form-item label="到达城市" prop="tocity">
                    <el-input v-model="addGoodsForm.tocity"  @keyup.enter.native="addGoods"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addGoodsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addGoods">确 定</el-button>
            </span>
        </el-dialog>
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
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10,
                category: "all",
            },
                options: [
                    {value: 'all', label: '全部'},
                    {value: 'price_asc', label: '价格正序'},
                    {value: 'price_desc', label: '价格倒序'},
                    {value: 'price_more', label: '价格大于'},
                    {value: 'price_less', label: '价格小于'},
                    {value: 'weight_asc', label: '重量正序'},
                    {value: 'weight_desc', label: '重量倒序'},
                    {value: 'weight_more', label: '重量大于'},
                    {value: 'weight_less', label: '重量小于'},
                    {value: 'from_city', label: '出发城市'},
                    {value: 'to_city', label: '目标城市'},
                    {value: 'courier_true', label: '正在运输'},
                    {value: 'courier_false', label: '暂未运输'},
                    {value: 'goods_true', label: '已经到达'},
                    {value: 'goods_false', label: '还未到达'},
                ],
            editGoodsForm: {},
            addGoodsForm: {
                name: "",
                price: null,
                weight: null,
                fromcity: "",
                tocity: "",
            },
            addGoodsRules:{
                name: [{required: true,  message: '请填写商品名称', trigger: 'blur' }],
                price: [{type: 'number', required: true,  message: '请填写商品价格', trigger: 'blur' }],
                weight: [{type: 'number', required: true,  message: '请填写商品重量', trigger: 'blur' }],
                fromcity: [{required: true,  message: '请填写商品出发城市', trigger: 'blur' }],
                tocity: [{required: true,  message: '请填写商品到达城市', trigger: 'blur' }],
            },
            editGoodsRules:{
                name: [{required: true,  message: '请填写商品名称', trigger: 'blur' }],
                price: [{type: 'number', required: true,  message: '请填写商品价格', trigger: 'blur' }],
                weight: [{type: 'number', required: true,  message: '请填写商品重量', trigger: 'blur' }],
                from_city: [{required: true,  message: '请填写商品出发城市', trigger: 'blur' }],
                to_city: [{required: true,  message: '请填写商品到达城市', trigger: 'blur' }],
            },
            goodsList: [],
            goodsListSize: 0,
            editGoodsDialogVisible: false,
            addGoodsDialogVisible: false,
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
            this.goodsList.splice(0, this.goodsList.length)
            const result = await this.$http.get('/goods',{params: this.queryInfo})
            console.log(result)
            if(result.data.code !== 200) return this.$message.error(result.data.msg)
            this.$message.success(result.data.msg)
            this.goodsList = result.data.data.goods
            this.goodsListSize = result.data.data.total
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
        showAddGoodsDialog() {
            this.addGoodsDialogVisible = true
        },
        editGoodsCloseDialog() {
            this.$refs.editGoodsFormRef.resetFields()
            this.editGoodsForm.goods_id = 0
        },
        addGoodsCloseDialog() {
            this.$refs.addGoodsFormRef.resetFields()
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
        async addGoods() {
            this.$refs.addGoodsFormRef.validate(async valid => {
                if(!valid) return
                const result = await this.$http.post('/goods', this.addGoodsForm)
                console.log(result)
                if(result.data.code !== 201) return this.$message.error(result.data.msg)
                this.$message.success(result.data.msg)
                this.getGoodsList()
                this.addGoodsDialogVisible = false
            })
        },
    },
}
</script>

<style scoped>

</style>