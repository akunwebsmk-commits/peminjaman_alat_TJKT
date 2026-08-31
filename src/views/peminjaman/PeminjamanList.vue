
<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, ExternalLink, CalendarDays } from 'lucide-vue-next'
import Sidebar from '../../components/Sidebar.vue'
import Navbar from '../../components/Navbar.vue'
import { supabase } from '../../supabase'

const dataPeminjaman = ref([])
const filterStatus = ref('')
const searchQuery = ref('')
const isLoading = ref(true)

const fetchPeminjaman = async () => {
  isLoading.value = true
  const { data, error } = await supabase
    .from('peminjaman')
    .select(`
      id_pinjam,
      tgl_pinjam,
      tgl_batas_kembali,
      status,
      siswa (
        nama_siswa,
        kelas
      ),
      detail_peminjaman (
        jumlah_pinjam,
        kondisi_saat_dikembalikan,
        alat (
          nama_alat
        )
      )
    `)
    .order('tgl_pinjam', { ascending: false })

  if (error) {
    console.error('Error fetching peminjaman:', error)
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    dataPeminjaman.value = (data || []).map(p => {
      // Jika statusnya dipinjam tapi tanggal hari ini sudah melewati batas kembali, anggap terlambat
      if (p.status === 'Dipinjam') {
        const batas = new Date(p.tgl_batas_kembali)
        if (today > batas) {
          p.status = 'Terlambat'
        }
      }
      return p
    })
  }
  isLoading.value = false
}

onMounted(() => {
  fetchPeminjaman()
})

const filteredPeminjaman = computed(() => {
  let result = dataPeminjaman.value

  if (filterStatus.value) {
    result = result.filter(p => p.status === filterStatus.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.siswa?.nama_siswa?.toLowerCase().includes(q) || 
      p.siswa?.kelas?.toLowerCase().includes(q)
    )
  }

  return result
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toISOString().split('T')[0]
}
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
              <input type="text" v-model="searchQuery" placeholder="Cari Nama Siswa atau Kelas..." class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
            </div>
            <select v-model="filterStatus" class="w-full md:w-48 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-700">
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
                <tr v-if="isLoading">
                  <td colspan="5" class="py-8 text-center text-gray-500">Memuat data...</td>
                </tr>
                <tr v-else v-for="pinjam in filteredPeminjaman" :key="pinjam.id_pinjam" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td class="py-4 px-6">
                    <p class="font-medium text-gray-900">{{ pinjam.siswa?.nama_siswa }}</p>
                    <p class="text-xs text-gray-500">{{ pinjam.siswa?.kelas }}</p>
                  </td>
                  <td class="py-4 px-6">
                    <ul class="text-sm text-gray-700 space-y-1">
                      <li v-for="(detail, i) in pinjam.detail_peminjaman" :key="i" class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full" :class="detail.kondisi_saat_dikembalikan === 'Belum Kembali' ? 'bg-blue-400' : 'bg-gray-300'"></span>
                        {{ detail.jumlah_pinjam }}x {{ detail.alat?.nama_alat }}
                      </li>
                    </ul>
                  </td>
                  <td class="py-4 px-6">
                    <div class="text-sm">
                      <p class="flex items-center gap-1.5 text-gray-600 mb-1">
                        <CalendarDays class="w-3.5 h-3.5" /> 
                        {{ formatDate(pinjam.tgl_pinjam) }}
                      </p>
                      <p class="flex items-center gap-1.5 text-gray-500 text-xs">
                        s/d {{ formatDate(pinjam.tgl_batas_kembali) }}
                      </p>
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
                      <router-link v-if="pinjam.status !== 'Dikembalikan'" :to="`/pengembalian/${pinjam.id_pinjam}`" class="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                        <ExternalLink class="w-4 h-4" /> Kembalikan
                      </router-link>
                      <span v-else class="text-sm text-gray-400 italic">Selesai</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="!isLoading && filteredPeminjaman.length === 0">
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
