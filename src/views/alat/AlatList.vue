<script setup>
import { ref } from 'vue'
import { Plus, Search, Edit2, Trash2, X, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import Sidebar from '../../components/Sidebar.vue'
import Navbar from '../../components/Navbar.vue'

// Mock Data
const dataAlat = ref([
  { id: 1, kode: 'ALT-001', nama: 'LAN Tester', stok: 5, tersedia: 5, kondisi: 'Baik', keterangan: '-' },
  { id: 2, kode: 'ALT-002', nama: 'Tang Crimping', stok: 10, tersedia: 8, kondisi: 'Baik', keterangan: '-' },
  { id: 3, kode: 'ALT-003', nama: 'Switch Hub 8 Port', stok: 2, tersedia: 0, kondisi: 'Rusak Ringan', keterangan: 'Port 1 error' },
])

const searchQuery = ref('')
const filterKondisi = ref('')
const isModalOpen = ref(false)
const modalMode = ref('add') 

const formAlat = ref({
  kode: '',
  nama: '',
  stok: 1,
  kondisi: 'Baik',
  keterangan: ''
})

const openModal = (mode, data = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    formAlat.value = { ...data }
  } else {
    formAlat.value = { kode: '', nama: '', stok: 1, kondisi: 'Baik', keterangan: '' }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const submitForm = () => {
  if (modalMode.value === 'add') {
    dataAlat.value.push({
      id: Date.now(),
      tersedia: formAlat.value.stok,
      ...formAlat.value
    })
  } else {
    const index = dataAlat.value.findIndex(a => a.id === formAlat.value.id)
    if (index !== -1) {
      const selisih = formAlat.value.stok - dataAlat.value[index].stok
      dataAlat.value[index] = { 
        ...formAlat.value,
        tersedia: dataAlat.value[index].tersedia + selisih
      }
    }
  }
  closeModal()
}

const deleblueat = (id) => {
  if(confirm('Yakin ingin menghapus data alat ini?')) {
    dataAlat.value = dataAlat.value.filter(a => a.id !== id)
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
                <tr v-for="alat in dataAlat" :key="alat.id" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors" :class="{'bg-red-50/30': alat.tersedia === 0}">
                  <td class="py-4 px-6 font-medium text-gray-900">{{ alat.kode }}</td>
                  <td class="py-4 px-6 text-gray-700 font-medium">{{ alat.nama }}</td>
                  <td class="py-4 px-6 text-center text-gray-600">{{ alat.stok }}</td>
                  <td class="py-4 px-6 text-center">
                    <span v-if="alat.tersedia > 0" class="inline-flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-md text-xs">
                      <CheckCircle2 class="w-3.5 h-3.5" /> {{ alat.tersedia }} Tersedia
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
                      <button @click="deleblueat(alat.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="dataAlat.length === 0">
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
              <input type="text" v-model="formAlat.kode" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Nama Alat</label>
              <input type="text" v-model="formAlat.nama" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Total Stok</label>
                <input type="number" min="1" v-model="formAlat.stok" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
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
