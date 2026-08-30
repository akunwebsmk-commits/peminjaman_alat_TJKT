<script setup>
import { ref } from 'vue'
import { Plus, Trash2, Wrench } from 'lucide-vue-next'

const form = ref({
  id_siswa: '',
  id_petugas: '',
  tgl_batas_kembali: '',
  items: [
    { id_alat: '', jumlah: 1 }
  ]
})

// Mock data
const dummySiswa = [
  { id: 1, nama: 'Budi Santoso', nis: '1001', kelas: 'XII TKJ 1' },
  { id: 2, nama: 'Siti Aminah', nis: '1002', kelas: 'XII TKJ 2' }
]

const dummyAlat = [
  { id: 1, nama: 'Tang Crimping', tersedia: 5 },
  { id: 2, nama: 'LAN Tester', tersedia: 3 },
  { id: 3, nama: 'Kabel UTP (Meter)', tersedia: 50 }
]

const dummyPetugas = [
  { id: 1, nama: 'Pak Guru A', jabatan: 'Kepala Lab' },
  { id: 2, nama: 'Pak Guru B', jabatan: 'Toolman' }
]

const addItem = () => {
  form.value.items.push({ id_alat: '', jumlah: 1 })
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
}

const submitForm = () => {
  alert('Form peminjaman berhasil disubmit! (Mock)')
  // Reset form
  form.value = {
    id_siswa: '',
    id_petugas: '',
    tgl_batas_kembali: '',
    items: [{ id_alat: '', jumlah: 1 }]
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="bg-teal-600 px-8 py-6 text-white flex items-center gap-4">
        <div class="p-3 bg-white/20 rounded-xl">
          <Wrench class="w-8 h-8" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">Form Peminjaman Alat</h1>
          <p class="text-teal-100 mt-1">Laboratorium Teknik Komputer dan Jaringan</p>
        </div>
      </div>

      <!-- Form Body -->
      <div class="p-8">
        <form @submit.prevent="submitForm" class="space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1">
              <label class="text-sm font-medium text-gray-700">Nama Siswa</label>
              <select v-model="form.id_siswa" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all">
                <option value="" disabled>Pilih Siswa</option>
                <option v-for="siswa in dummySiswa" :key="siswa.id" :value="siswa.id">
                  {{ siswa.nis }} - {{ siswa.nama }}
                </option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-sm font-medium text-gray-700">Petugas Jaga</label>
              <select v-model="form.id_petugas" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all">
                <option value="" disabled>Pilih Petugas</option>
                <option v-for="petugas in dummyPetugas" :key="petugas.id" :value="petugas.id">
                  {{ petugas.nama }}
                </option>
              </select>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-700">Tanggal Rencana Kembali</label>
            <input type="date" v-model="form.tgl_batas_kembali" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all">
          </div>

          <div class="border-t border-gray-200 pt-6 mt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-800">Daftar Alat</h3>
              <button type="button" @click="addItem" class="text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors">
                <Plus class="w-4 h-4" /> Tambah Alat
              </button>
            </div>

            <div class="space-y-3">
              <div v-for="(item, index) in form.items" :key="index" class="flex items-start gap-3">
                <div class="flex-1">
                  <select v-model="item.id_alat" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all">
                    <option value="" disabled>Pilih Alat</option>
                    <option v-for="alat in dummyAlat" :key="alat.id" :value="alat.id">
                      {{ alat.nama }} (Sisa: {{ alat.tersedia }})
                    </option>
                  </select>
                </div>
                <div class="w-24">
                  <input type="number" min="1" v-model="item.jumlah" required placeholder="Jml" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-center">
                </div>
                <button type="button" @click="removeItem(index)" :disabled="form.items.length === 1" class="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div class="pt-6">
            <button type="submit" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-teal-200 transition-all active:scale-[0.98]">
              Ajukan Peminjaman
            </button>
          </div>
          
        </form>
      </div>
    </div>
  </div>
</template>
