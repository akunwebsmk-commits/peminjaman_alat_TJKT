<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-vue-next'
import Sidebar from '../../components/Sidebar.vue'
import Navbar from '../../components/Navbar.vue'
import { supabase } from '../../supabase'

const dataPetugas = ref([])
const searchQuery = ref('')
const isModalOpen = ref(false)
const modalMode = ref('add')
const isLoading = ref(true)

const formPetugas = ref({
  id_petugas: null,
  nip: '',
  nama_petugas: '',
  jabatan: '',
  no_telp: ''
})

const fetchPetugas = async () => {
  isLoading.value = true
  const { data, error } = await supabase.from('petugas').select('*').order('id_petugas', { ascending: false })
  if (error) {
    console.error('Error fetching petugas:', error)
  } else {
    dataPetugas.value = data || []
  }
  isLoading.value = false
}

onMounted(() => {
  fetchPetugas()
})

const filteredPetugas = computed(() => {
  let result = dataPetugas.value
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      (p.nip && p.nip.toLowerCase().includes(q)) || 
      (p.nama_petugas && p.nama_petugas.toLowerCase().includes(q))
    )
  }
  
  return result
})

const openModal = (mode, data = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    formPetugas.value = { ...data }
  } else {
    formPetugas.value = { id_petugas: null, nip: '', nama_petugas: '', jabatan: '', no_telp: '' }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const submitForm = async () => {
  if (modalMode.value === 'add') {
    const { id_petugas, ...insertData } = formPetugas.value
    const { error } = await supabase.from('petugas').insert([insertData])
    if (error) {
      alert('Gagal menambahkan data: ' + error.message)
      return
    }
  } else {
    const { id_petugas, ...updateData } = formPetugas.value
    const { error } = await supabase.from('petugas').update(updateData).eq('id_petugas', id_petugas)
    if (error) {
      alert('Gagal mengubah data: ' + error.message)
      return
    }
  }
  closeModal()
  fetchPetugas()
}

const deletePetugas = async (id) => {
  if(confirm('Yakin ingin menghapus data petugas ini?')) {
    const { error } = await supabase.from('petugas').delete().eq('id_petugas', id)
    if (error) {
      alert('Gagal menghapus data: (Mungkin petugas ini sedang terikat dengan data peminjaman) ' + error.message)
    } else {
      fetchPetugas()
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
            <h1 class="text-2xl font-bold text-gray-900">Data Petugas</h1>
            <p class="text-gray-500 mt-1">Kelola data petugas dan admin laboratorium</p>
          </div>
          <button @click="openModal('add')" class="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-blue-200">
            <Plus class="w-5 h-5" /> Tambah Petugas
          </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div class="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <div class="relative w-full md:w-96">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" v-model="searchQuery" placeholder="Cari NIP atau Nama..." class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th class="py-4 px-6 font-medium">NIP / ID</th>
                  <th class="py-4 px-6 font-medium">Nama Petugas</th>
                  <th class="py-4 px-6 font-medium">Jabatan</th>
                  <th class="py-4 px-6 font-medium">No. Telp</th>
                  <th class="py-4 px-6 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="5" class="py-8 text-center text-gray-500">Memuat data...</td>
                </tr>
                <tr v-else v-for="petugas in filteredPetugas" :key="petugas.id_petugas" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td class="py-4 px-6 font-medium text-gray-900">{{ petugas.nip }}</td>
                  <td class="py-4 px-6 text-gray-700">{{ petugas.nama_petugas }}</td>
                  <td class="py-4 px-6">
                    <span class="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">{{ petugas.jabatan || '-' }}</span>
                  </td>
                  <td class="py-4 px-6 text-gray-600 text-sm">{{ petugas.no_telp || '-' }}</td>
                  <td class="py-4 px-6">
                    <div class="flex items-center justify-end gap-2">
                      <button @click="openModal('edit', petugas)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 class="w-4 h-4" />
                      </button>
                      <button @click="deletePetugas(petugas.id_petugas)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!isLoading && filteredPetugas.length === 0">
                  <td colspan="5" class="py-8 text-center text-gray-500">Data petugas tidak ditemukan.</td>
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
          <h3 class="text-lg font-bold text-gray-900">{{ modalMode === 'add' ? 'Tambah Petugas' : 'Edit Petugas' }}</h3>
          <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6">
          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">NIP / ID Petugas</label>
              <input type="text" v-model="formPetugas.nip" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Nama Lengkap</label>
              <input type="text" v-model="formPetugas.nama_petugas" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Jabatan</label>
              <input type="text" v-model="formPetugas.jabatan" placeholder="Contoh: Toolman, Kepala Lab, Guru" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">No. WhatsApp / Telepon</label>
              <input type="text" v-model="formPetugas.no_telp" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
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
