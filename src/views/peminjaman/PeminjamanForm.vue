<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Plus, Trash2, Wrench, AlertCircle, Calendar, MessageCircle } from 'lucide-vue-next'
import Sidebar from '../../components/Sidebar.vue'
import Navbar from '../../components/Navbar.vue'
import { supabase } from '../../supabase'
import { useToast } from '../../composables/useToast'

const { addToast } = useToast()
import logoSmk from '../../assets/logo smk.png'

const todayDate = new Date().toISOString().split('T')[0]

const dateInputRef = ref(null)
const openDatePicker = () => {
  if (dateInputRef.value && typeof dateInputRef.value.showPicker === 'function') {
    dateInputRef.value.showPicker()
  } else if (dateInputRef.value) {
    dateInputRef.value.focus()
  }
}

const form = ref({
  id_siswa: '',
  id_petugas: '',
  tgl_batas_kembali: '',
  no_telp_aktual: '',
  items: [
    { id_alat: '', jumlah: 1, searchQuery: '', isOpen: false }
  ]
})

const selectedKelas = ref('')
const dataSiswa = ref([])
const dataAlat = ref([])
const dataPetugas = ref([])
const isLoading = ref(true)

const fetchData = async () => {
  isLoading.value = true
  
  // Fetch parallel to save time
  const [resSiswa, resAlat, resPetugas] = await Promise.all([
    supabase.from('siswa').select('id_siswa, nis, nama_siswa, kelas, no_telp').order('nama_siswa'),
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

// Dapatkan daftar kelas yang unik dari data siswa
const daftarKelas = computed(() => {
  const kelasSet = new Set(dataSiswa.value.map(s => s.kelas))
  return Array.from(kelasSet).sort()
})

// Filter siswa berdasarkan kelas yang dipilih
const filteredSiswa = computed(() => {
  if (!selectedKelas.value) return []
  return dataSiswa.value.filter(s => s.kelas === selectedKelas.value)
})

// Reset nama siswa saat kelas diganti
watch(selectedKelas, () => {
  form.value.id_siswa = ''
  form.value.no_telp_aktual = ''
})

// Auto-fill nomor WA saat nama siswa dipilih
watch(() => form.value.id_siswa, (newId) => {
  if (newId) {
    const student = dataSiswa.value.find(s => s.id_siswa === newId)
    if (student) {
      form.value.no_telp_aktual = student.no_telp || ''
    }
  } else {
    form.value.no_telp_aktual = ''
  }
})

const addItem = () => {
  form.value.items.push({ id_alat: '', jumlah: 1, searchQuery: '', isOpen: false })
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
}

const filteredAlatList = (query) => {
  if (!query) return dataAlat.value
  const lowerQ = query.toLowerCase()
  return dataAlat.value.filter(a => {
    const nama = a.nama_alat ? a.nama_alat.toLowerCase() : ''
    const kode = a.kode_alat ? a.kode_alat.toLowerCase() : ''
    return nama.includes(lowerQ) || kode.includes(lowerQ)
  })
}

const selectAlat = (item, alat) => {
  item.id_alat = alat.id_alat
  item.searchQuery = alat.nama_alat
  item.isOpen = false
}

const isSubmitting = ref(false)

const submitForm = async () => {
  if (!form.value.id_siswa) {
    return addToast('Pilih Nama Siswa terlebih dahulu.', 'warning')
  }
  if (!form.value.no_telp_aktual || form.value.no_telp_aktual.trim() === '') {
    return addToast('No. WhatsApp wajib diisi.', 'warning')
  }
  if (!form.value.id_petugas) {
    return addToast('Pilih Petugas Jaga terlebih dahulu.', 'warning')
  }
  if (!form.value.tgl_batas_kembali) {
    return addToast('Pilih Tanggal Rencana Kembali.', 'warning')
  }
  if (form.value.tgl_batas_kembali < todayDate) {
    return addToast('Tanggal Rencana Kembali tidak boleh di masa lalu.', 'warning')
  }
  if (form.value.items.length === 0) {
    return addToast('Harap tambahkan minimal satu alat untuk dipinjam.', 'warning')
  }
  for (const item of form.value.items) {
    if (!item.id_alat) {
      return addToast('Harap pilih alat dengan benar dari daftar pencarian yang muncul.', 'warning')
    }
    if (!item.jumlah || item.jumlah < 1) {
      return addToast('Jumlah pinjam alat minimal 1.', 'warning')
    }
  }
  
  // Validasi stok sebelum submit
  for (const item of form.value.items) {
    const alatTerpilih = dataAlat.value.find(a => a.id_alat === item.id_alat)
    if (alatTerpilih && item.jumlah > alatTerpilih.jumlah_tersedia) {
      return addToast(`Gagal: Jumlah pinjam "${alatTerpilih.nama_alat}" (${item.jumlah}) melebihi stok tersedia (${alatTerpilih.jumlah_tersedia}).`, 'error')
    }
  }

  isSubmitting.value = true

  // 1. Update kontak siswa (No. WA) jika diisi/berubah di form ini
  if (form.value.id_siswa && form.value.no_telp_aktual) {
    await supabase
      .from('siswa')
      .update({ no_telp: form.value.no_telp_aktual })
      .eq('id_siswa', form.value.id_siswa)
  }

  // 2. Buat Peminjaman Induk
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
    addToast('Gagal membuat peminjaman: ' + pinjamError.message, 'error')
    isSubmitting.value = false
    return
  }

  // 3. Buat Detail Peminjaman (Bulk Insert)
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
    addToast('Peminjaman terbuat, tapi gagal menyimpan detail alat: ' + detailError.message, 'error')
  } else {
    addToast('Form peminjaman berhasil disubmit!', 'success')
    // Reset form
    selectedKelas.value = ''
    form.value = {
      id_siswa: '',
      id_petugas: '',
      tgl_batas_kembali: '',
      no_telp_aktual: '',
      items: [{ id_alat: '', jumlah: 1, searchQuery: '', isOpen: false }]
    }
    // Refresh stok alat dan data siswa (kalau ada update no WA)
    fetchData()
  }

  isSubmitting.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-sky-400 px-8 py-6 text-white flex flex-col items-center justify-center text-center">
        <div class="p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10 mb-4 inline-block">
          <img :src="logoSmk" alt="Logo SMK" class="h-16 w-auto object-contain drop-shadow-sm" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight">Form Peminjaman Alat</h1>
        <p class="text-blue-50 mt-1 text-sm font-medium">Laboratorium Teknik Komputer dan Jaringan</p>
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
          
          <div class="bg-blue-50/50 p-5 rounded-xl border border-blue-100 mb-6">
            <h3 class="text-sm font-semibold text-blue-800 mb-4">Informasi Peminjam</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Filter Kelas (New) -->
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">Pilih Kelas</label>
                <select v-model="selectedKelas" class="w-full border border-gray-300 bg-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                  <option value="">-- Pilih Kelas Dahulu --</option>
                  <option v-for="kelas in daftarKelas" :key="kelas" :value="kelas">
                    {{ kelas }}
                  </option>
                </select>
              </div>

              <!-- Pilihan Siswa -->
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">Nama Siswa</label>
                <select v-model="form.id_siswa" :disabled="!selectedKelas" class="w-full border border-gray-300 bg-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500">
                  <option value="" disabled>{{ selectedKelas ? 'Pilih Nama Siswa' : 'Pilih kelas terlebih dahulu' }}</option>
                  <option v-for="siswa in filteredSiswa" :key="siswa.id_siswa" :value="siswa.id_siswa">
                    {{ siswa.nis }} - {{ siswa.nama_siswa }}
                  </option>
                </select>
              </div>

              <!-- Input Kontak / No. Telp (New) -->
              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">No. WhatsApp</label>
                <input type="text" v-model="form.no_telp_aktual" :disabled="!form.id_siswa" placeholder="Contoh: 628123456789" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500">
                <p class="text-[11px] text-gray-500 mt-1">Bisa diisi/diperbarui jika kosong.</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm font-medium text-gray-700">Petugas Jaga</label>
                <select v-model="form.id_petugas" class="w-full border border-gray-300 bg-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" :disabled="dataPetugas.length === 0">
                  <option value="" disabled>Pilih Petugas</option>
                  <option v-for="petugas in dataPetugas" :key="petugas.id_petugas" :value="petugas.id_petugas">
                    {{ petugas.nama_petugas }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-700">Tanggal Rencana Kembali</label>
            <div class="relative cursor-pointer" @click="openDatePicker">
              <input type="date" ref="dateInputRef" v-model="form.tgl_batas_kembali" :min="todayDate" class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer bg-white appearance-none">
              <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none" />
            </div>
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
                <div class="relative flex-1">
                  <!-- Searchable Input -->
                  <div class="relative">
                    <input 
                      type="text" 
                      v-model="item.searchQuery"
                      @focus="item.isOpen = true"
                      @blur="item.isOpen = false"
                      @input="item.id_alat = ''"
                      placeholder="Ketik nama atau kode alat..." 
                      class="w-full border border-gray-300 bg-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      :class="{'border-red-400': !item.id_alat && item.searchQuery}"
                    >
                    <!-- Dropdown List -->
                    <div v-if="item.isOpen" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      <div v-if="filteredAlatList(item.searchQuery).length === 0" class="px-4 py-3 text-sm text-gray-500 text-center bg-gray-50">
                        Alat tidak ditemukan
                      </div>
                      <div 
                        v-for="alat in filteredAlatList(item.searchQuery)" 
                        :key="alat.id_alat"
                        @mousedown.prevent="selectAlat(item, alat)"
                        class="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center border-b border-gray-50 last:border-0"
                      >
                        <div>
                          <p class="font-medium text-gray-800">{{ alat.nama_alat }}</p>
                          <p class="text-[10px] text-gray-500">{{ alat.kode_alat }}</p>
                        </div>
                        <span class="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">Stok: {{ alat.jumlah_tersedia }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="w-24">
                  <input type="number" min="1" v-model="item.jumlah" placeholder="Jml" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center">
                </div>
                <button type="button" @click="removeItem(index)" :disabled="form.items.length === 1" class="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div class="pt-6 border-t border-gray-200 mt-6">
            <button type="submit" :disabled="isSubmitting || dataPetugas.length === 0" class="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
              {{ isSubmitting ? 'Memproses...' : 'Ajukan Peminjaman' }}
            </button>
          </div>
          
        </form>
      </div>
    </div>

    <!-- Floating Chat Toolman Button -->
    <a 
      href="https://wa.me/6289525779548" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center group z-50 hover:-translate-y-1"
    >
      <MessageCircle class="w-6 h-6" />
      <span class="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2 font-medium">
        Chat Toolman
      </span>
    </a>
  </div>
</template>
