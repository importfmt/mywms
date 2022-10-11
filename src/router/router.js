import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'

import Users from '../components/user/Users.vue'
import RecoverUsers from '../components/user/RecoverUsers.vue'
import QueryUsers from '../components/user/QueryUsers.vue'

import Cars from '../components/car/Cars.vue'
import RecoverCars from '../components/car/RecoverCars.vue'
import QueryCars from '../components/car/QueryCars.vue'

import Roles from '../components/system/Roles.vue'
import Wips from '../components/system/Wips.vue'
import Admins from '../components/system/Admins.vue'


import QueryGoods from '../components/produce/QueryGoods.vue'
import RecoverGoods from '../components/produce/RecoverGoods.vue'
import Goods from '../components/produce/Goods.vue'

import Add from '../components/order/Add.vue'
import Orders from '../components/order/Orders.vue'
import RecoverOrders from '../components/order/RecoverOrders.vue'
import QueryOrders from '../components/order/QueryOrders.vue'

Vue.use(Router)

const router =  new Router({
    routes: [
        {path: '/', redirect: '/login'},
        {path: '/login', component: Login},
        {path: '/home', component: Home, redirect: '/welcome',
            children:[
                {path: '/welcome', component: Welcome},

                {path: '/users', component: Users},
                {path: '/recoverusers', component: RecoverUsers},
                {path: '/queryusers', component: QueryUsers},

                {path: '/cars', component: Cars},
                {path: '/recovercars', component: RecoverCars},
                {path: '/querycars', component: QueryCars},

                {path: '/roles', component: Roles},
                {path: '/wips', component: Wips},
                {path: '/admins', component: Admins},

                {path: '/goods', component: Goods},
                {path: '/querygoods', component: QueryGoods},
                {path: '/recovergoods', component: RecoverGoods},

                {path: '/orders/add', component: Add},
                {path: '/orders', component: Orders},
                {path: '/recoverorders', component: RecoverOrders},
                {path: '/queryorders', component: QueryOrders},

            ]
        },
    ]
})
// Mount router navigation guard
router.beforeEach((to, from, next) => {
    if(to.path === '/login')    return next()
    const token = window.sessionStorage.getItem('token')
    if(!token) return next('/login')
    next()
})

export default router
