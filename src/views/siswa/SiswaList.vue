<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, Search, Edit2, Trash2, X, Download, Upload } from 'lucide-vue-next'
import Sidebar from '../../components/Sidebar.vue'
import Navbar from '../../components/Navbar.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
import { supabase } from '../../supabase'
import { useToast } from '../../composables/useToast'

const { addToast } = useToast()

const dataSiswa = ref([])
const searchQuery = ref('')
const filterKelas = ref('')
const isModalOpen = ref(false)
const modalMode = ref('add') // 'add' or 'edit'
const isLoading = ref(true)

const showConfirmDelete = ref(false)
const itemToDelete = ref(null)

const fileInput = ref(null)

const formSiswa = ref({
  id_siswa: null,
  nis: '',
  nama_siswa: '',
  kelas: '',
  no_telp: '',
  alamat: ''
})

const fetchSiswa = async () => {
  isLoading.value = true
  const { data, error } = await supabase.from('siswa').select('*').order('id_siswa', { ascending: false })
  if (error) {
    console.error('Error fetching siswa:', error)
  } else {
    dataSiswa.value = data || []
  }
  isLoading.value = false
}

onMounted(() => {
  fetchSiswa()
})

const filteredSiswa = computed(() => {
  let result = dataSiswa.value
  
  if (filterKelas.value) {
    result = result.filter(s => s.kelas === filterKelas.value)
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s => 
      s.nis.toLowerCase().includes(q) || 
      s.nama_siswa.toLowerCase().includes(q)
    )
  }
  
  return result
})

const openModal = (mode, data = null) => {
  modalMode.value = mode
  if (mode === 'edit' && data) {
    formSiswa.value = { ...data }
  } else {
    formSiswa.value = { id_siswa: null, nis: '', nama_siswa: '', kelas: '', no_telp: '', alamat: '' }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const submitForm = async () => {
  if (modalMode.value === 'add') {
    const { id_siswa, ...insertData } = formSiswa.value
    const { error } = await supabase.from('siswa').insert([insertData])
    if (error) {
      addToast('Gagal menambahkan data: ' + error.message, 'error')
      return
    }
    addToast('Data siswa berhasil ditambahkan!', 'success')
  } else {
    const { id_siswa, ...updateData } = formSiswa.value
    const { error } = await supabase.from('siswa').update(updateData).eq('id_siswa', id_siswa)
    if (error) {
      addToast('Gagal mengubah data: ' + error.message, 'error')
      return
    }
    addToast('Data siswa berhasil diubah!', 'success')
  }
  closeModal()
  fetchSiswa()
}

const confirmDelete = (id) => {
  itemToDelete.value = id
  showConfirmDelete.value = true
}

const executeDelete = async () => {
  const id = itemToDelete.value
  if (!id) return
  
  showConfirmDelete.value = false
  
  const { error } = await supabase.from('siswa').delete().eq('id_siswa', id)
  if (error) {
    if (error.code === '23503') {
      addToast('Gagal menghapus: Siswa memiliki riwayat peminjaman.', 'error')
    } else {
      addToast('Gagal menghapus data: ' + error.message, 'error')
    }
  } else {
    addToast('Data siswa berhasil dihapus!', 'success')
    fetchSiswa()
  }
}

// === CSV EXPORT & IMPORT ===

const exportCSV = () => {
  if (dataSiswa.value.length === 0) return addToast('Tidak ada data untuk diexport.', 'warning')
  
  const headers = ['nis', 'nama_siswa', 'kelas', 'no_telp', 'alamat']
  const rows = dataSiswa.value.map(s => {
    // Tambahkan tanda kutip untuk menangani koma atau newline di teks (misal: alamat)
    const name = `"${(s.nama_siswa || '').replace(/"/g, '""')}"`
    const address = `"${(s.alamat || '').replace(/"/g, '""')}"`
    return [s.nis, name, s.kelas, s.no_telp || '', address].join(',')
  })
  
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'data_siswa.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const triggerImport = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const text = e.target.result
      const lines = text.split('\n').filter(line => line.trim() !== '')
      if (lines.length <= 1) return addToast('File CSV kosong atau hanya berisi header.', 'error')

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^"|"$/g, ''))
      const expectedHeaders = ['nis', 'nama_siswa', 'kelas', 'no_telp', 'alamat']
      
      const isHeaderValid = expectedHeaders.every(h => headers.includes(h))
      if (!isHeaderValid) {
        return addToast('Format header CSV tidak valid. Pastikan baris pertama: nis, nama_siswa, kelas, no_telp, alamat', 'error')
      }

      const payload = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        
        // Parsing CSV yang lebih aman untuk menangani teks dengan koma dalam tanda kutip
        const rowValues = []
        let inQuotes = false
        let currentValue = ''
        
        for (let char of line) {
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            rowValues.push(currentValue.trim())
            currentValue = ''
          } else {
            currentValue += char
          }
        }
        rowValues.push(currentValue.trim())

        const obj = {}
        headers.forEach((header, index) => {
          if (expectedHeaders.includes(header)) {
            // Hilangkan quotes jika terbawa
            let val = rowValues[index] || ''
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.substring(1, val.length - 1)
            }
            // Tangani double quotes
            val = val.replace(/""/g, '"')
            obj[header] = val || null
          }
        })
        
        if (obj.nis && obj.nama_siswa) {
          payload.push(obj)
        }
      }

      if (payload.length === 0) return addToast('Tidak ada baris data siswa yang ditemukan.', 'error')

      isLoading.value = true
      const { error } = await supabase.from('siswa').insert(payload)
      
      if (error) {
        if (error.code === '23505') {
          addToast('Gagal mengimpor: Ada NIS yang sudah terdaftar (Duplikat).', 'error')
        } else {
          addToast('Gagal mengimpor data: ' + error.message, 'error')
        }
      } else {
        addToast(`Berhasil mengimpor ${payload.length} data siswa!`, 'success')
        fetchSiswa()
      }
    } catch (err) {
      addToast('Terjadi kesalahan saat memproses file CSV.', 'error')
      console.error(err)
    } finally {
      isLoading.value = false
      event.target.value = '' // Reset input file
    }
  }
  reader.readAsText(file)
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
          <div class="flex flex-wrap gap-3">
            <button @click="triggerImport" class="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm">
              <Upload class="w-5 h-5 text-gray-500" /> Import CSV
            </button>
            <input type="file" ref="fileInput" accept=".csv" class="hidden" @change="handleImport">
            
            <button @click="exportCSV" class="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm">
              <Download class="w-5 h-5 text-gray-500" /> Export CSV
            </button>

            <button @click="openModal('add')" class="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-blue-200">
              <Plus class="w-5 h-5" /> Tambah Siswa
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div class="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <div class="relative w-full md:w-96">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" v-model="searchQuery" placeholder="Cari NIS atau Nama..." class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
            </div>
            
            <div class="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
              <select v-model="filterKelas" class="w-full md:w-48 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-700 shrink-0">
                <option value="">Semua Kelas</option>
                <option value="X TKJ 1">X TKJ 1</option>
                <option value="X TKJ 2">X TKJ 2</option>
                <option value="XI TKJ 1">XI TKJ 1</option>
                <option value="XI TKJ 2">XI TKJ 2</option>
                <option value="XII TKJ 1">XII TKJ 1</option>
                <option value="XII TKJ 2">XII TKJ 2</option>
              </select>
              
            </div>
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
                <tr v-if="isLoading">
                  <td colspan="5" class="py-8 text-center text-gray-500">Memuat data...</td>
                </tr>
                <tr v-else v-for="siswa in filteredSiswa" :key="siswa.id_siswa" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td class="py-4 px-6 font-medium text-gray-900">{{ siswa.nis }}</td>
                  <td class="py-4 px-6 text-gray-700">{{ siswa.nama_siswa }}</td>
                  <td class="py-4 px-6">
                    <span class="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">{{ siswa.kelas }}</span>
                  </td>
                  <td class="py-4 px-6 text-gray-600 text-sm">{{ siswa.no_telp || '-' }}</td>
                  <td class="py-4 px-6">
                    <div class="flex items-center justify-end gap-2">
                      <button @click="openModal('edit', siswa)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 class="w-4 h-4" />
                      </button>
                      <button @click="confirmDelete(siswa.id_siswa)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!isLoading && filteredSiswa.length === 0">
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
              <input type="text" v-model="formSiswa.nis" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Nama Lengkap</label>
              <input type="text" v-model="formSiswa.nama_siswa" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Kelas</label>
              <select v-model="formSiswa.kelas" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                <option value="X TKJ 1">X TKJ 1</option>
                <option value="X TKJ 2">X TKJ 2</option>
                <option value="XI TKJ 1">XI TKJ 1</option>
                <option value="XI TKJ 2">XI TKJ 2</option>
                <option value="XII TKJ 1">XII TKJ 1</option>
                <option value="XII TKJ 2">XII TKJ 2</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">No. WhatsApp</label>
              <input type="text" v-model="formSiswa.no_telp" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Alamat</label>
              <textarea v-model="formSiswa.alamat" rows="2" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
            </div>
            <div class="pt-4 flex gap-3">
              <button type="button" @click="closeModal" class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
              <button type="submit" class="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">Simpan Data</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Confirm Delete Modal -->
    <ConfirmModal 
      :is-open="showConfirmDelete"
      title="Hapus Data Siswa"
      message="Yakin ingin menghapus data siswa ini? Tindakan ini tidak dapat dibatalkan."
      @confirm="executeDelete"
      @cancel="showConfirmDelete = false"
    />
  </div>
</template>
