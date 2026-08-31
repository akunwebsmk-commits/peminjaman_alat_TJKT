import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import AlatList from '../views/alat/AlatList.vue'
import PeminjamanForm from '../views/peminjaman/PeminjamanForm.vue'
import PeminjamanList from '../views/peminjaman/PeminjamanList.vue'
import PengembalianForm from '../views/pengembalian/PengembalianForm.vue'
import SiswaList from '../views/siswa/SiswaList.vue'
import PetugasList from '../views/petugas/PetugasList.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: PeminjamanForm // Directly show PeminjamanForm for students
  },
  {
    path: '/admin',
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
    path: '/petugas',
    name: 'PetugasList',
    component: PetugasList
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
