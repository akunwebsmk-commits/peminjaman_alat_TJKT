<script setup>
import { ref, computed } from 'vue'
import { Search, ExternalLink, CalendarDays } from 'lucide-vue-next'
import Sidebar from '../../components/Sidebar.vue'
import Navbar from '../../components/Navbar.vue'

// Mock Data
const dataPeminjaman = ref([
  { 
    id: 1, 
    siswa: { nama: 'Budi Santoso', kelas: 'XII TKJ 1' },
    petugas: { nama: 'Pak Guru A' },
    tgl_pinjam: '2023-10-20',
    tgl_batas_kembali: '2023-10-25',
    status: 'Terlambat',
    detail_peminjaman: [
      { alat: { nama: 'LAN Tester' }, jumlah_pinjam: 1 }
    ]
  },
  { 
    id: 2, 
    siswa: { nama: 'Siti Aminah', kelas: 'XII TKJ 2' },
    petugas: { nama: 'Pak Guru B' },
    tgl_pinjam: '2023-10-24',
    tgl_batas_kembali: '2023-10-30',
    status: 'Dipinjam',
    detail_peminjaman: [
      { alat: { nama: 'Tang Crimping' }, jumlah_pinjam: 2 },
      { alat: { nama: 'Kabel UTP' }, jumlah_pinjam: 10 }
    ]
  },
  { 
    id: 3, 
    siswa: { nama: 'Andi Setiawan', kelas: 'XI TKJ 1' },
    petugas: { nama: 'Pak Guru A' },
    tgl_pinjam: '2023-10-15',
    tgl_batas_kembali: '2023-10-18',
    status: 'Dikembalikan',
    detail_peminjaman: [
      { alat: { nama: 'Switch Hub' }, jumlah_pinjam: 1 }
    ]
  }
])

const filterStatus = ref('')
const searchQuery = ref('')

const filteredPeminjaman = computed(() => {
  let result = dataPeminjaman.value

  if (filterStatus.value) {
    result = result.filter(p => p.status === filterStatus.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.siswa.nama.toLowerCase().includes(q) || 
      p.siswa.kelas.toLowerCase().includes(q)
    )
  }

  return result
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <Sidebar />
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <Navbar />
      
      <main class="flex-1 p-8 ml-64 overflow-y-auto">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Riwayat Peminjaman</h1>
            <p class="text-gray-500 mt-1">Daftar transaksi peminjaman alat laboratorium</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div class="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <div class="relative w-full md:w-96">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" v-model="searchQuery" placeholder="Cari Nama Siswa atau Kelas..." class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all">
            </div>
            <select v-model="filterStatus" class="w-full md:w-48 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-gray-700">
              <option value="">Semua Status</option>
              <option value="Dipinjam">Dipinjam</option>
              <option value="Terlambat">Terlambat</option>
              <option value="Dikembalikan">Dikembalikan</option>
            </select>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th class="py-4 px-6 font-medium">Siswa</th>
                  <th class="py-4 px-6 font-medium">Alat Dipinjam</th>
                  <th class="py-4 px-6 font-medium">Tanggal</th>
                  <th class="py-4 px-6 font-medium">Status</th>
                  <th class="py-4 px-6 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pinjam in filteredPeminjaman" :key="pinjam.id" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td class="py-4 px-6">
                    <p class="font-medium text-gray-900">{{ pinjam.siswa.nama }}</p>
                    <p class="text-xs text-gray-500">{{ pinjam.siswa.kelas }}</p>
                  </td>
                  <td class="py-4 px-6">
                    <ul class="text-sm text-gray-700 space-y-1">
                      <li v-for="(detail, i) in pinjam.detail_peminjaman" :key="i" class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                        {{ detail.jumlah_pinjam }}x {{ detail.alat.nama }}
                      </li>
                    </ul>
                  </td>
                  <td class="py-4 px-6">
                    <div class="text-sm">
                      <p class="flex items-center gap-1.5 text-gray-600 mb-1"><CalendarDays class="w-3.5 h-3.5" /> {{ pinjam.tgl_pinjam }}</p>
                      <p class="flex items-center gap-1.5 text-gray-500 text-xs">s/d {{ pinjam.tgl_batas_kembali }}</p>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <span class="px-2.5 py-1 rounded-md text-xs font-medium inline-block" :class="{
                      'bg-blue-50 text-blue-700': pinjam.status === 'Dipinjam',
                      'bg-red-50 text-red-700': pinjam.status === 'Terlambat',
                      'bg-emerald-50 text-emerald-700': pinjam.status === 'Dikembalikan'
                    }">
                      {{ pinjam.status }}
                    </span>
                  </td>
                  <td class="py-4 px-6">
                    <div class="flex items-center justify-end gap-2">
                      <router-link v-if="pinjam.status !== 'Dikembalikan'" :to="`/pengembalian/${pinjam.id}`" class="text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                        <ExternalLink class="w-4 h-4" /> Kembalikan
                      </router-link>
                      <span v-else class="text-sm text-gray-400 italic">Selesai</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredPeminjaman.length === 0">
                  <td colspan="5" class="py-8 text-center text-gray-500">Data peminjaman tidak ditemukan.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
