<script setup>
import { ref } from 'vue'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-vue-next'
import Sidebar from '../../components/Sidebar.vue'
import Navbar from '../../components/Navbar.vue'

// Mock Data
const dataSiswa = ref([
  { id: 1, nis: '1001', nama: 'Budi Santoso', kelas: 'XII TKJ 1', no_telp: '08123456789', alamat: 'Jl. Merdeka No.1' },
  { id: 2, nis: '1002', nama: 'Siti Aminah', kelas: 'XII TKJ 2', no_telp: '08987654321', alamat: 'Jl. Sudirman No.5' },
])

const searchQuery = ref('')
const filterKelas = ref('')
const isModalOpen = ref(false)
const modalMode = ref('add') // 'add' or 'edit'

const formSiswa = ref({
  nis: '',
  nama: '',
  kelas: '',
  no_telp: '',
  alamat: ''
})

const openModal = (mode, data = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    formSiswa.value = { ...data }
  } else {
    formSiswa.value = { nis: '', nama: '', kelas: '', no_telp: '', alamat: '' }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const submitForm = () => {
  if (modalMode.value === 'add') {
    dataSiswa.value.push({
      id: Date.now(),
      ...formSiswa.value
    })
  } else {
    const index = dataSiswa.value.findIndex(s => s.id === formSiswa.value.id)
    if (index !== -1) {
      dataSiswa.value[index] = { ...formSiswa.value }
    }
  }
  closeModal()
}

const deleteSiswa = (id) => {
  if(confirm('Yakin ingin menghapus data siswa ini?')) {
    dataSiswa.value = dataSiswa.value.filter(s => s.id !== id)
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
            <h1 class="text-2xl font-bold text-gray-900">Data Siswa</h1>
            <p class="text-gray-500 mt-1">Kelola data siswa yang terdaftar di lab</p>
          </div>
          <button @click="openModal('add')" class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-teal-200">
            <Plus class="w-5 h-5" /> Tambah Siswa
          </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div class="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <div class="relative w-full md:w-96">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" v-model="searchQuery" placeholder="Cari NIS atau Nama..." class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all">
            </div>
            <select v-model="filterKelas" class="w-full md:w-48 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-gray-700">
              <option value="">Semua Kelas</option>
              <option value="XII TKJ 1">XII TKJ 1</option>
              <option value="XII TKJ 2">XII TKJ 2</option>
            </select>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th class="py-4 px-6 font-medium">NIS</th>
                  <th class="py-4 px-6 font-medium">Nama Lengkap</th>
                  <th class="py-4 px-6 font-medium">Kelas</th>
                  <th class="py-4 px-6 font-medium">Kontak</th>
                  <th class="py-4 px-6 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="siswa in dataSiswa" :key="siswa.id" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td class="py-4 px-6 font-medium text-gray-900">{{ siswa.nis }}</td>
                  <td class="py-4 px-6 text-gray-700">{{ siswa.nama }}</td>
                  <td class="py-4 px-6">
                    <span class="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">{{ siswa.kelas }}</span>
                  </td>
                  <td class="py-4 px-6 text-gray-600 text-sm">{{ siswa.no_telp }}</td>
                  <td class="py-4 px-6">
                    <div class="flex items-center justify-end gap-2">
                      <button @click="openModal('edit', siswa)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 class="w-4 h-4" />
                      </button>
                      <button @click="deleteSiswa(siswa.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="dataSiswa.length === 0">
                  <td colspan="5" class="py-8 text-center text-gray-500">Data siswa tidak ditemukan.</td>
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
          <h3 class="text-lg font-bold text-gray-900">{{ modalMode === 'add' ? 'Tambah Data Siswa' : 'Edit Data Siswa' }}</h3>
          <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6">
          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">NIS</label>
              <input type="text" v-model="formSiswa.nis" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Nama Lengkap</label>
              <input type="text" v-model="formSiswa.nama" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Kelas</label>
              <select v-model="formSiswa.kelas" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all">
                <option value="XII TKJ 1">XII TKJ 1</option>
                <option value="XII TKJ 2">XII TKJ 2</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">No. WhatsApp</label>
              <input type="text" v-model="formSiswa.no_telp" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Alamat</label>
              <textarea v-model="formSiswa.alamat" rows="2" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none"></textarea>
            </div>
            <div class="pt-4 flex gap-3">
              <button type="button" @click="closeModal" class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
              <button type="submit" class="flex-1 px-4 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200">Simpan Data</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
