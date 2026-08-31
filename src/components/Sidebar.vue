<script setup>
import { LayoutDashboard, Users, Wrench, FileText, CheckSquare, LogOut } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Data Siswa', path: '/siswa', icon: Users },
  { name: 'Inventaris Alat', path: '/alat', icon: Wrench },
  { name: 'Peminjaman', path: '/peminjaman', icon: FileText }
]

const handleLogout = () => {
  // Mock logout, redirect to home
  router.push('/')
}
</script>

<template>
  <aside class="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
    <div class="h-16 flex items-center px-6 border-b border-gray-200">
      <div class="flex items-center gap-2 text-blue-600 font-bold text-lg">
        <Wrench class="w-6 h-6" />
        <span>LabTKJ</span>
      </div>
    </div>
    
    <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
        :class="[
          route.path.startsWith(item.path) 
            ? 'bg-blue-50 text-blue-700' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        ]"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.name }}
      </router-link>
    </nav>
    
    <div class="p-4 border-t border-gray-200">
      <button 
        @click="handleLogout"
        class="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut class="w-5 h-5" />
        Keluar
      </button>
    </div>
  </aside>
</template>
