<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, Search, Edit2, Trash2, X, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import Sidebar from '../../components/Sidebar.vue'
import Navbar from '../../components/Navbar.vue'
import { supabase } from '../../supabase'

const dataAlat = ref([])
const searchQuery = ref('')
const filterKondisi = ref('')
const isModalOpen = ref(false)
const modalMode = ref('add') 
const isLoading = ref(true)

const formAlat = ref({
  id_alat: null,
  kode_alat: '',
  nama_alat: '',
  jumlah_stok: 1,
  kondisi: 'Baik',
  keterangan: ''
})

const fetchAlat = async () => {
  isLoading.value = true
  const { data, error } = await supabase.from('alat').select('*').order('id_alat', { ascending: false })
  if (error) {
    console.error('Error fetching alat:', error)
  } else {
    dataAlat.value = data || []
  }
  isLoading.value = false
}

onMounted(() => {
  fetchAlat()
})

const filteredAlat = computed(() => {
  let result = dataAlat.value

  if (filterKondisi.value) {
    result = result.filter(a => a.kondisi === filterKondisi.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(a => 
      a.kode_alat.toLowerCase().includes(q) || 
      a.nama_alat.toLowerCase().includes(q)
    )
  }

  return result
})

const openModal = (mode, data = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    formAlat.value = { ...data }
  } else {
    formAlat.value = { id_alat: null, kode_alat: '', nama_alat: '', jumlah_stok: 1, kondisi: 'Baik', keterangan: '' }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const submitForm = async () => {
  if (modalMode.value === 'add') {
    const { id_alat, ...insertData } = formAlat.value
    // jumlah_tersedia sama dengan jumlah_stok saat awal ditambah
    insertData.jumlah_tersedia = insertData.jumlah_stok
    
    const { error } = await supabase.from('alat').insert([insertData])
    if (error) {
      alert('Gagal menambahkan data: ' + error.message)
      return
    }
  } else {
    const { id_alat, ...updateData } = formAlat.value
    // Menyesuaikan jumlah_tersedia jika stok berubah
    const oldData = dataAlat.value.find(a => a.id_alat === id_alat)
    if (oldData) {
      const selisih = updateData.jumlah_stok - oldData.jumlah_stok
      updateData.jumlah_tersedia = oldData.jumlah_tersedia + selisih
    }

    const { error } = await supabase.from('alat').update(updateData).eq('id_alat', id_alat)
    if (error) {
      alert('Gagal mengubah data: ' + error.message)
      return
    }
  }
  closeModal()
  fetchAlat()
}

const deleteAlat = async (id) => {
  if(confirm('Yakin ingin menghapus data alat ini?')) {
    const { error } = await supabase.from('alat').delete().eq('id_alat', id)
    if (error) {
      alert('Gagal menghapus data: ' + error.message)
    } else {
      fetchAlat()
    }
  }
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
            <h1 class="text-2xl font-bold text-gray-900">Inventaris Alat</h1>
            <p class="text-gray-500 mt-1">Kelola data alat dan perlengkapan laboratorium</p>
          </div>
          <button @click="openModal('add')" class="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-blue-200">
            <Plus class="w-5 h-5" /> Tambah Alat
          </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div class="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <div class="relative w-full md:w-96">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" v-model="searchQuery" placeholder="Cari Kode atau Nama Alat..." class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
            </div>
            <select v-model="filterKondisi" class="w-full md:w-48 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-700">
              <option value="">Semua Kondisi</option>
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th class="py-4 px-6 font-medium">Kode</th>
                  <th class="py-4 px-6 font-medium">Nama Alat</th>
                  <th class="py-4 px-6 font-medium text-center">Stok Total</th>
                  <th class="py-4 px-6 font-medium text-center">Ketersediaan</th>
                  <th class="py-4 px-6 font-medium">Kondisi</th>
                  <th class="py-4 px-6 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="6" class="py-8 text-center text-gray-500">Memuat data...</td>
                </tr>
                <tr v-else v-for="alat in filteredAlat" :key="alat.id_alat" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors" :class="{'bg-red-50/30': alat.jumlah_tersedia <= 0}">
                  <td class="py-4 px-6 font-medium text-gray-900">{{ alat.kode_alat }}</td>
                  <td class="py-4 px-6 text-gray-700 font-medium">{{ alat.nama_alat }}</td>
                  <td class="py-4 px-6 text-center text-gray-600">{{ alat.jumlah_stok }}</td>
                  <td class="py-4 px-6 text-center">
                    <span v-if="alat.jumlah_tersedia > 0" class="inline-flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-md text-xs">
                      <CheckCircle2 class="w-3.5 h-3.5" /> {{ alat.jumlah_tersedia }} Tersedia
                    </span>
                    <span v-else class="inline-flex items-center gap-1 text-red-600 font-medium bg-red-50 px-2.5 py-1 rounded-md text-xs">
                      <AlertCircle class="w-3.5 h-3.5" /> Habis
                    </span>
                  </td>
                  <td class="py-4 px-6">
                    <span class="px-2.5 py-1 rounded-md text-xs font-medium" :class="{
                      'bg-emerald-50 text-emerald-700': alat.kondisi === 'Baik',
                      'bg-amber-50 text-amber-700': alat.kondisi === 'Rusak Ringan',
                      'bg-red-50 text-red-700': alat.kondisi === 'Rusak Berat'
                    }">
                      {{ alat.kondisi }}
                    </span>
                  </td>
                  <td class="py-4 px-6">
                    <div class="flex items-center justify-end gap-2">
                      <button @click="openModal('edit', alat)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 class="w-4 h-4" />
                      </button>
                      <button @click="deleteAlat(alat.id_alat)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!isLoading && filteredAlat.length === 0">
                  <td colspan="6" class="py-8 text-center text-gray-500">Data alat tidak ditemukan.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900">{{ modalMode === 'add' ? 'Tambah Data Alat' : 'Edit Data Alat' }}</h3>
          <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6">
          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Kode Alat</label>
              <input type="text" v-model="formAlat.kode_alat" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Nama Alat</label>
              <input type="text" v-model="formAlat.nama_alat" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Total Stok</label>
                <input type="number" min="1" v-model="formAlat.jumlah_stok" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Kondisi</label>
                <select v-model="formAlat.kondisi" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                  <option value="Baik">Baik</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                </select>
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Keterangan (Opsional)</label>
              <textarea v-model="formAlat.keterangan" rows="2" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
            </div>
            <div class="pt-4 flex gap-3">
              <button type="button" @click="closeModal" class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
              <button type="submit" class="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">Simpan Data</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
