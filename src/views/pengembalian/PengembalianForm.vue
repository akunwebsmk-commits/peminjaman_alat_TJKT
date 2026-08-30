<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, CheckCircle2 } from 'lucide-vue-next'
import Sidebar from '../../components/Sidebar.vue'
import Navbar from '../../components/Navbar.vue'

const router = useRouter()
const route = useRoute()

// Mock Detail Peminjaman (berdasarkan id dari params)
const detailPinjam = ref({
  id: route.params.id,
  siswa: { nama: 'Budi Santoso', kelas: 'XII TKJ 1' },
  tgl_batas_kembali: '2023-10-25',
  detail_peminjaman: [
    { alat: { nama: 'LAN Tester' }, jumlah_pinjam: 1 }
  ]
})

const formPengembalian = ref({
  tgl_kembali_aktual: new Date().toISOString().split('T')[0],
  kondisi_alat: 'Baik',
  status_denda: 'Tidak Ada Denda'
})

const DENDA_PER_HARI = 2000

// Hitung Keterlambatan dan Denda secara otomatis
const kalkulasi = computed(() => {
  const batas = new Date(detailPinjam.value.tgl_batas_kembali)
  const aktual = new Date(formPengembalian.value.tgl_kembali_aktual)
  
  // Menghitung selisih hari
  const diffTime = aktual - batas
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const telatHari = diffDays > 0 ? diffDays : 0
  const totalDenda = telatHari * DENDA_PER_HARI

  if (telatHari > 0 && formPengembalian.value.status_denda === 'Tidak Ada Denda') {
    // Auto set default denda status if overdue
    formPengembalian.value.status_denda = 'Belum Lunas'
  }

  return { telatHari, totalDenda }
})

const submitForm = () => {
  alert('Pengembalian berhasil diproses! (Mock)')
  router.push('/peminjaman')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <Sidebar />
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <Navbar />
      
      <main class="flex-1 p-8 ml-64 overflow-y-auto">
        <div class="mb-8">
          <button @click="router.back()" class="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors text-sm font-medium mb-4">
            <ArrowLeft class="w-4 h-4" /> Kembali
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Form Pengembalian Alat</h1>
          <p class="text-gray-500 mt-1">Proses pengembalian alat dan perhitungan denda (jika ada)</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Detail Peminjaman (Read Only) -->
          <div class="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 class="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-4 mb-4">Detail Peminjaman</h3>
            <div class="space-y-4">
              <div>
                <p class="text-xs text-gray-500 font-medium">Nama Siswa</p>
                <p class="text-gray-900 font-medium">{{ detailPinjam.siswa.nama }}</p>
                <p class="text-sm text-gray-500">{{ detailPinjam.siswa.kelas }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium">Batas Kembali</p>
                <p class="text-gray-900 font-medium">{{ detailPinjam.tgl_batas_kembali }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium mb-2">Alat yang Dipinjam</p>
                <ul class="text-sm text-gray-700 space-y-1.5 bg-gray-50 p-3 rounded-lg">
                  <li v-for="(detail, i) in detailPinjam.detail_peminjaman" :key="i" class="flex justify-between items-center">
                    <span>{{ detail.alat.nama }}</span>
                    <span class="font-medium bg-white px-2 py-0.5 rounded border border-gray-200">{{ detail.jumlah_pinjam }}x</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Form Input Pengembalian -->
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <form @submit.prevent="submitForm" class="space-y-6">
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700">Tanggal Aktual Kembali</label>
                  <input type="date" v-model="formPengembalian.tgl_kembali_aktual" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all">
                </div>

                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700">Kondisi Alat Saat Kembali</label>
                  <select v-model="formPengembalian.kondisi_alat" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all">
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                    <option value="Hilang">Hilang</option>
                  </select>
                </div>
              </div>

              <!-- Denda Calculator Section -->
              <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 class="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  Kalkulasi Keterlambatan
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Jumlah Hari Telat</p>
                    <p class="text-xl font-bold" :class="kalkulasi.telatHari > 0 ? 'text-red-600' : 'text-emerald-600'">
                      {{ kalkulasi.telatHari }} Hari
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Total Denda (Rp 2000/hari)</p>
                    <p class="text-xl font-bold" :class="kalkulasi.totalDenda > 0 ? 'text-red-600' : 'text-emerald-600'">
                      Rp {{ kalkulasi.totalDenda.toLocaleString('id-ID') }}
                    </p>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs text-gray-500 font-medium block">Status Denda</label>
                    <select 
                      v-model="formPengembalian.status_denda" 
                      :disabled="kalkulasi.totalDenda === 0"
                      class="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none disabled:bg-gray-100"
                    >
                      <option value="Tidak Ada Denda">Tidak Ada Denda</option>
                      <option v-if="kalkulasi.totalDenda > 0" value="Belum Lunas">Belum Lunas</option>
                      <option v-if="kalkulasi.totalDenda > 0" value="Lunas">Lunas</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" class="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-teal-200 transition-all flex items-center gap-2">
                  <CheckCircle2 class="w-5 h-5" /> Selesaikan Pengembalian
                </button>
              </div>

            </form>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>
