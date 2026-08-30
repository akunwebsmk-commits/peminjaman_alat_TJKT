import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import AlatList from '../views/alat/AlatList.vue'
import PeminjamanForm from '../views/peminjaman/PeminjamanForm.vue'
import PeminjamanList from '../views/peminjaman/PeminjamanList.vue'
import PengembalianForm from '../views/pengembalian/PengembalianForm.vue'
import SiswaList from '../views/siswa/SiswaList.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: PeminjamanForm // Directly show PeminjamanForm for students
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/siswa',
    name: 'SiswaList',
    component: SiswaList
  },
  {
    path: '/alat',
    name: 'AlatList',
    component: AlatList
  },
  {
    path: '/peminjaman',
    name: 'PeminjamanList',
    component: PeminjamanList
  },
  {
    path: '/pengembalian/:id',
    name: 'PengembalianForm',
    component: PengembalianForm
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
