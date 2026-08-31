<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Trash2, Wrench, AlertCircle } from 'lucide-vue-next'
import { supabase } from '../../supabase'

const form = ref({
  id_siswa: '',
  id_petugas: '',
  tgl_batas_kembali: '',
  items: [
    { id_alat: '', jumlah: 1 }
  ]
})

const dataSiswa = ref([])
const dataAlat = ref([])
const dataPetugas = ref([])
const isLoading = ref(true)

const fetchData = async () => {
  isLoading.value = true
  
  // Fetch parallel to save time
  const [resSiswa, resAlat, resPetugas] = await Promise.all([
    supabase.from('siswa').select('id_siswa, nis, nama_siswa, kelas').order('nama_siswa'),
    supabase.from('alat').select('id_alat, nama_alat, jumlah_tersedia').gt('jumlah_tersedia', 0).order('nama_alat'),
    supabase.from('petugas').select('id_petugas, nama_petugas').order('nama_petugas')
  ])

  if (resSiswa.data) dataSiswa.value = resSiswa.data
  if (resAlat.data) dataAlat.value = resAlat.data
  if (resPetugas.data) dataPetugas.value = resPetugas.data
  
  isLoading.value = false
}

onMounted(() => {
  fetchData()
})

const addItem = () => {
  form.value.items.push({ id_alat: '', jumlah: 1 })
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
}

const isSubmitting = ref(false)

const submitForm = async () => {
  if (form.value.items.some(i => !i.id_alat)) {
    return alert('Harap pilih alat dengan benar')
  }

  isSubmitting.value = true

  // 1. Buat Peminjaman Induk
  const { data: pinjamData, error: pinjamError } = await supabase
    .from('peminjaman')
    .insert([{
      id_siswa: form.value.id_siswa,
      id_petugas: form.value.id_petugas,
      tgl_batas_kembali: form.value.tgl_batas_kembali,
      status: 'Dipinjam'
    }])
    .select('id_pinjam')
    .single()

  if (pinjamError) {
    alert('Gagal membuat peminjaman: ' + pinjamError.message)
    isSubmitting.value = false
    return
  }

  // 2. Buat Detail Peminjaman (Bulk Insert)
  const detailPayload = form.value.items.map(item => ({
    id_pinjam: pinjamData.id_pinjam,
    id_alat: item.id_alat,
    jumlah_pinjam: item.jumlah,
    kondisi_saat_dikembalikan: 'Belum Kembali'
  }))

  const { error: detailError } = await supabase
    .from('detail_peminjaman')
    .insert(detailPayload)

  if (detailError) {
    alert('Peminjaman terbuat, tapi gagal menyimpan detail alat: ' + detailError.message)
  } else {
    alert('Form peminjaman berhasil disubmit!')
    // Reset form
    form.value = {
      id_siswa: '',
      id_petugas: '',
      tgl_batas_kembali: '',
      items: [{ id_alat: '', jumlah: 1 }]
    }
    // Refresh stok alat (akan berkurang otomatis via Trigger)
    fetchData()
  }

  isSubmitting.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-sky-400 px-8 py-6 text-white flex items-center gap-4">
        <div class="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10">
          <Wrench class="w-8 h-8" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Form Peminjaman Alat</h1>
          <p class="text-blue-50 mt-1 text-sm font-medium">Laboratorium Teknik Komputer dan Jaringan</p>
        </div>
      </div>

      <!-- Warning if no petugas -->
      <div v-if="!isLoading && dataPetugas.length === 0" class="bg-amber-50 p-4 flex items-start gap-3 border-b border-amber-100">
        <AlertCircle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div class="text-sm text-amber-800">
          <p class="font-bold">Perhatian: Data Petugas Kosong</p>
          <p>Anda belum memiliki data Petugas di database Supabase. Transaksi tidak dapat diproses jika ID Petugas kosong. Harap tambahkan data petugas secara manual di tabel Supabase terlebih dahulu.</p>
        </div>
      </div>

      <!-- Form Body -->
      <div class="p-8 relative">
        <div v-if="isLoading" class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <p class="text-gray-500 font-medium">Memuat data...</p>
        </div>
        
        <form @submit.prevent="submitForm" class="space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1">
              <label class="text-sm font-medium text-gray-700">Nama Siswa</label>
              <select v-model="form.id_siswa" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                <option value="" disabled>Pilih Siswa</option>
                <option v-for="siswa in dataSiswa" :key="siswa.id_siswa" :value="siswa.id_siswa">
                  {{ siswa.nis }} - {{ siswa.nama_siswa }} ({{ siswa.kelas }})
                </option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-sm font-medium text-gray-700">Petugas Jaga</label>
              <select v-model="form.id_petugas" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" :disabled="dataPetugas.length === 0">
                <option value="" disabled>Pilih Petugas</option>
                <option v-for="petugas in dataPetugas" :key="petugas.id_petugas" :value="petugas.id_petugas">
                  {{ petugas.nama_petugas }}
                </option>
              </select>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-700">Tanggal Rencana Kembali</label>
            <input type="date" v-model="form.tgl_batas_kembali" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
          </div>

          <div class="border-t border-gray-200 pt-6 mt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-800">Daftar Alat</h3>
              <button type="button" @click="addItem" class="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors">
                <Plus class="w-4 h-4" /> Tambah Alat
              </button>
            </div>

            <div class="space-y-3">
              <div v-for="(item, index) in form.items" :key="index" class="flex items-start gap-3">
                <div class="flex-1">
                  <select v-model="item.id_alat" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                    <option value="" disabled>Pilih Alat</option>
                    <option v-for="alat in dataAlat" :key="alat.id_alat" :value="alat.id_alat">
                      {{ alat.nama_alat }} (Tersedia: {{ alat.jumlah_tersedia }})
                    </option>
                  </select>
                </div>
                <div class="w-24">
                  <input type="number" min="1" v-model="item.jumlah" required placeholder="Jml" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center">
                </div>
                <button type="button" @click="removeItem(index)" :disabled="form.items.length === 1" class="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div class="pt-6">
            <button type="submit" :disabled="isSubmitting || dataPetugas.length === 0" class="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
              {{ isSubmitting ? 'Memproses...' : 'Ajukan Peminjaman' }}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  </div>
</template>
