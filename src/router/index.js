import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabase'

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
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/siswa',
    name: 'SiswaList',
    component: SiswaList,
    meta: { requiresAuth: true }
  },
  {
    path: '/petugas',
    name: 'PetugasList',
    component: PetugasList,
    meta: { requiresAuth: true }
  },
  {
    path: '/alat',
    name: 'AlatList',
    component: AlatList,
    meta: { requiresAuth: true }
  },
  {
    path: '/peminjaman',
    name: 'PeminjamanList',
    component: PeminjamanList,
    meta: { requiresAuth: true }
  },
  {
    path: '/pengembalian/:id',
    name: 'PengembalianForm',
    component: PengembalianForm,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()

  // Redirect ke /admin jika route butuh auth dan user belum login
  if (to.meta.requiresAuth && !session) {
    next('/admin')
  } 
  // Redirect ke /dashboard jika user sudah login tapi mencoba akses halaman login
  else if (to.path === '/admin' && session) {
    next('/dashboard')
  } 
  else {
    next()
  }
})

export default router
