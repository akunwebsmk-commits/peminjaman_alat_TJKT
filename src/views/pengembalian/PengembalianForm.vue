<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, CheckCircle2 } from 'lucide-vue-next'
import Sidebar from '../../components/Sidebar.vue'
import Navbar from '../../components/Navbar.vue'
import { supabase } from '../../supabase'

const router = useRouter()
const route = useRoute()

const detailPinjam = ref(null)
const isLoading = ref(true)

const formPengembalian = ref({
  tgl_kembali_aktual: new Date().toISOString().split('T')[0],
  status_denda: 'Tidak Ada Denda'
})

const itemConditions = ref({})

const DENDA_PER_HARI = 2000

const fetchDetail = async () => {
  isLoading.value = true
  const { data, error } = await supabase
    .from('peminjaman')
    .select(`
      id_pinjam,
      tgl_batas_kembali,
      status,
      siswa ( nama_siswa, kelas ),
      detail_peminjaman (
        id_detail,
        jumlah_pinjam,
        kondisi_saat_dikembalikan,
        alat ( id_alat, nama_alat )
      )
    `)
    .eq('id_pinjam', route.params.id)
    .single()

  if (error) {
    alert('Gagal mengambil data peminjaman: ' + error.message)
    router.push('/peminjaman')
    return
  }
  
  if (data.status === 'Dikembalikan') {
    alert('Peminjaman ini sudah diselesaikan!')
    router.push('/peminjaman')
    return
  }

  detailPinjam.value = data
  
  // Set default condition to 'Baik' for all items
  data.detail_peminjaman.forEach(detail => {
    itemConditions.value[detail.id_detail] = 'Baik'
  })

  isLoading.value = false
}

onMounted(() => {
  fetchDetail()
})

// Hitung Keterlambatan dan Denda secara otomatis
const kalkulasi = computed(() => {
  if (!detailPinjam.value) return { telatHari: 0, totalDenda: 0 }
  
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

const isSubmitting = ref(false)

const submitForm = async () => {
  isSubmitting.value = true
  
  // 1. Insert ke tabel pengembalian
  const { error: kembaliError } = await supabase.from('pengembalian').insert([{
    id_pinjam: detailPinjam.value.id_pinjam,
    tgl_kembali_aktual: formPengembalian.value.tgl_kembali_aktual,
    jumlah_hari_telat: kalkulasi.value.telatHari,
    total_denda: kalkulasi.value.totalDenda,
    status_denda: kalkulasi.value.totalDenda > 0 ? formPengembalian.value.status_denda : 'Tidak Ada Denda'
  }])

  if (kembaliError) {
    alert('Gagal memproses pengembalian: ' + kembaliError.message)
    isSubmitting.value = false
    return
  }

  // 2. Update kondisi per alat di detail_peminjaman
  const updatePromises = detailPinjam.value.detail_peminjaman.map(detail => {
    const condition = itemConditions.value[detail.id_detail]
    return supabase
      .from('detail_peminjaman')
      .update({ kondisi_saat_dikembalikan: condition })
      .eq('id_detail', detail.id_detail)
  })

  await Promise.all(updatePromises)
  // trigger_kembalikan_stok akan otomatis mengubah status peminjaman jadi Dikembalikan dan update stok

  alert('Pengembalian berhasil diproses!')
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
          <button @click="router.back()" class="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium mb-4">
            <ArrowLeft class="w-4 h-4" /> Kembali
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Form Pengembalian Alat</h1>
          <p class="text-gray-500 mt-1">Proses pengembalian alat dan perhitungan denda (jika ada)</p>
        </div>

        <div v-if="isLoading" class="flex justify-center items-center py-20">
          <p class="text-gray-500 font-medium">Memuat data peminjaman...</p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Detail Peminjaman (Read Only) -->
          <div class="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 class="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-4 mb-4">Detail Peminjaman</h3>
            <div class="space-y-4">
              <div>
                <p class="text-xs text-gray-500 font-medium">Nama Siswa</p>
                <p class="text-gray-900 font-medium">{{ detailPinjam.siswa.nama_siswa }}</p>
                <p class="text-sm text-gray-500">{{ detailPinjam.siswa.kelas }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium">Batas Kembali</p>
                <p class="text-gray-900 font-medium">{{ detailPinjam.tgl_batas_kembali }}</p>
              </div>
            </div>
          </div>

          <!-- Form Input Pengembalian -->
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <form @submit.prevent="submitForm" class="space-y-6">
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-1 md:col-span-2">
                  <label class="text-sm font-medium text-gray-700">Tanggal Aktual Kembali</label>
                  <input type="date" v-model="formPengembalian.tgl_kembali_aktual" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                </div>
              </div>

              <!-- Kondisi Per Alat -->
              <div class="border-t border-gray-100 pt-6">
                <h4 class="text-sm font-bold text-gray-700 mb-4">Cek Kondisi Alat</h4>
                <div class="space-y-3">
                  <div v-for="detail in detailPinjam.detail_peminjaman" :key="detail.id_detail" class="bg-gray-50 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p class="font-medium text-gray-900">{{ detail.alat.nama_alat }}</p>
                      <p class="text-xs text-gray-500">Jumlah dipinjam: {{ detail.jumlah_pinjam }}x</p>
                    </div>
                    <div class="w-full md:w-48">
                      <select v-model="itemConditions[detail.id_detail]" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                        <option value="Baik">Baik</option>
                        <option value="Rusak Ringan">Rusak Ringan</option>
                        <option value="Rusak Berat">Rusak Berat</option>
                        <option value="Hilang">Hilang</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Denda Calculator Section -->
              <div class="bg-gray-50 rounded-xl p-5 border border-gray-200 mt-6">
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
                      class="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                    >
                      <option value="Tidak Ada Denda">Tidak Ada Denda</option>
                      <option v-if="kalkulasi.totalDenda > 0" value="Belum Lunas">Belum Lunas</option>
                      <option v-if="kalkulasi.totalDenda > 0" value="Lunas">Lunas</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" :disabled="isSubmitting" class="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                  <CheckCircle2 class="w-5 h-5" /> {{ isSubmitting ? 'Memproses...' : 'Selesaikan Pengembalian' }}
                </button>
              </div>

            </form>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>
