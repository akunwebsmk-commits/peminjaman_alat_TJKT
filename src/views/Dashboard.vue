<script setup>
import { Wrench, Package, ArrowRightLeft, AlertTriangle, MessageCircle } from 'lucide-vue-next'
import Sidebar from '../components/Sidebar.vue'
import Navbar from '../components/Navbar.vue'
import StatCard from '../components/StatCard.vue'

// Mock Data
const stats = [
  { title: 'Total Alat', value: '150', icon: Wrench, colorClass: 'text-blue-600 bg-blue-50' },
  { title: 'Stok Tersedia', value: '110', icon: Package, colorClass: 'text-emerald-600 bg-emerald-50' },
  { title: 'Alat Dipinjam', value: '40', icon: ArrowRightLeft, colorClass: 'text-amber-600 bg-amber-50' },
  { title: 'Terlambat', value: '5', icon: AlertTriangle, colorClass: 'text-red-600 bg-red-50' }
]

const overduePeminjaman = [
  { id: 1, siswa: 'Budi Santoso', kelas: 'XII TKJ 1', alat: 'LAN Tester', tgl_batas: '2023-10-25', telat_hari: 3, no_telp: '628123456789' },
  { id: 2, siswa: 'Siti Aminah', kelas: 'XII TKJ 2', alat: 'Tang Crimping', tgl_batas: '2023-10-26', telat_hari: 2, no_telp: '628987654321' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <Sidebar />
    <div class="flex-1">
      <Navbar />
      
      <main class="p-8 ml-64">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-500 mt-1">Ringkasan inventaris dan peminjaman alat laboratorium</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            v-for="(stat, index) in stats" 
            :key="index"
            :title="stat.title"
            :value="stat.value"
            :icon="stat.icon"
            :colorClass="stat.colorClass"
          />
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">Peminjaman Melebihi Batas Waktu</h2>
            <span class="bg-red-50 text-red-600 px-3 py-1 text-xs font-bold rounded-full">Perlu Tindakan</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                  <th class="py-3 px-6 font-medium">Siswa</th>
                  <th class="py-3 px-6 font-medium">Alat</th>
                  <th class="py-3 px-6 font-medium">Batas Waktu</th>
                  <th class="py-3 px-6 font-medium">Keterlambatan</th>
                  <th class="py-3 px-6 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in overduePeminjaman" :key="item.id" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td class="py-4 px-6">
                    <p class="font-medium text-gray-900">{{ item.siswa }}</p>
                    <p class="text-xs text-gray-500">{{ item.kelas }}</p>
                  </td>
                  <td class="py-4 px-6 text-gray-700">{{ item.alat }}</td>
                  <td class="py-4 px-6 text-gray-700">{{ item.tgl_batas }}</td>
                  <td class="py-4 px-6">
                    <span class="text-red-600 font-medium bg-red-50 px-2.5 py-1 rounded-md text-xs">
                      Telat {{ item.telat_hari }} hari
                    </span>
                  </td>
                  <td class="py-4 px-6">
                    <div class="flex items-center justify-end gap-3">
                      <a :href="`https://wa.me/${item.no_telp}?text=Halo ${item.siswa}, tolong segera kembalikan ${item.alat} karena sudah terlambat ${item.telat_hari} hari.`" target="_blank" class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Hubungi via WhatsApp">
                        <MessageCircle class="w-5 h-5" />
                      </a>
                      <router-link :to="`/pengembalian/${item.id}`" class="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                        Proses Kembali
                      </router-link>
                    </div>
                  </td>
                </tr>
                <tr v-if="overduePeminjaman.length === 0">
                  <td colspan="5" class="py-8 text-center text-gray-500">
                    Tidak ada peminjaman yang terlambat.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
