<script setup>
import { ref, onMounted } from 'vue'
import { Wrench, Package, ArrowRightLeft, AlertTriangle, MessageCircle } from 'lucide-vue-next'
import Sidebar from '../components/Sidebar.vue'
import Navbar from '../components/Navbar.vue'
import StatCard from '../components/StatCard.vue'
import { supabase } from '../supabase'

const totalAlat = ref(0)
const stokTersedia = ref(0)
const alatDipinjam = ref(0)
const totalTerlambat = ref(0)
const overduePeminjaman = ref([])
const isLoading = ref(true)

const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    // 1. Fetch data alat (stok dan tersedia)
    const { data: alatData } = await supabase.from('alat').select('jumlah_stok, jumlah_tersedia')
    if (alatData) {
      totalAlat.value = alatData.reduce((sum, item) => sum + (item.jumlah_stok || 0), 0)
      stokTersedia.value = alatData.reduce((sum, item) => sum + (item.jumlah_tersedia || 0), 0)
    }

    // 2. Fetch data alat yang sedang dipinjam
    const { data: detailData } = await supabase.from('detail_peminjaman')
      .select('jumlah_pinjam')
      .eq('kondisi_saat_dikembalikan', 'Belum Kembali')
    if (detailData) {
      alatDipinjam.value = detailData.reduce((sum, item) => sum + (item.jumlah_pinjam || 0), 0)
    }

    // 3. Fetch data peminjaman yang terlambat
    const today = new Date().toISOString().split('T')[0]
    const { data: overdueData } = await supabase.from('peminjaman')
      .select(`
        id_pinjam,
        tgl_batas_kembali,
        siswa ( nama_siswa, kelas, no_telp ),
        detail_peminjaman ( alat ( nama_alat ) )
      `)
      .in('status', ['Dipinjam', 'Terlambat'])
      .lt('tgl_batas_kembali', today)

    if (overdueData) {
      totalTerlambat.value = overdueData.length
      
      overduePeminjaman.value = overdueData.map(pinjam => {
        // Hitung telat berapa hari
        const batas = new Date(pinjam.tgl_batas_kembali)
        const sekarang = new Date(today)
        const diffTime = Math.abs(sekarang - batas)
        const telat_hari = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // Gabungkan nama alat (jika lebih dari 1)
        const namaAlat = pinjam.detail_peminjaman.map(d => d.alat?.nama_alat).join(', ')

        // Pastikan format nomor telepon benar untuk WhatsApp (hapus 0 di depan, ganti 62)
        let phone = pinjam.siswa?.no_telp || ''
        if (phone.startsWith('0')) {
          phone = '62' + phone.substring(1)
        }

        return {
          id: pinjam.id_pinjam,
          siswa: pinjam.siswa?.nama_siswa,
          kelas: pinjam.siswa?.kelas,
          alat: namaAlat,
          tgl_batas: pinjam.tgl_batas_kembali,
          telat_hari: telat_hari,
          no_telp: phone
        }
      })
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
  isLoading.value = false
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <Sidebar />
    <div class="flex-1">
      <Navbar />
      
      <main class="p-8 ml-64">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-500 mt-1">Ringkasan inventaris dan peminjaman alat laboratorium</p>
        </div>

        <div v-if="isLoading" class="flex justify-center items-center py-10">
          <p class="text-gray-500 font-medium">Memuat data dashboard...</p>
        </div>

        <div v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Alat"
              :value="totalAlat"
              :icon="Wrench"
              colorClass="text-blue-600 bg-blue-50"
            />
            <StatCard 
              title="Stok Tersedia"
              :value="stokTersedia"
              :icon="Package"
              colorClass="text-emerald-600 bg-emerald-50"
            />
            <StatCard 
              title="Alat Dipinjam"
              :value="alatDipinjam"
              :icon="ArrowRightLeft"
              colorClass="text-amber-600 bg-amber-50"
            />
            <StatCard 
              title="Terlambat"
              :value="totalTerlambat"
              :icon="AlertTriangle"
              colorClass="text-red-600 bg-red-50"
            />
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-800">Peminjaman Melebihi Batas Waktu</h2>
              <span v-if="overduePeminjaman.length > 0" class="bg-red-50 text-red-600 px-3 py-1 text-xs font-bold rounded-full">Perlu Tindakan</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                    <th class="py-3 px-6 font-medium">Siswa</th>
                    <th class="py-3 px-6 font-medium">Alat</th>
                    <th class="py-3 px-6 font-medium">Batas Waktu</th>
                    <th class="py-3 px-6 font-medium">Keterlambatan</th>
                    <th class="py-3 px-6 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in overduePeminjaman" :key="item.id" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td class="py-4 px-6">
                      <p class="font-medium text-gray-900">{{ item.siswa }}</p>
                      <p class="text-xs text-gray-500">{{ item.kelas }}</p>
                    </td>
                    <td class="py-4 px-6 text-gray-700">{{ item.alat }}</td>
                    <td class="py-4 px-6 text-gray-700">{{ item.tgl_batas }}</td>
                    <td class="py-4 px-6">
                      <span class="text-red-600 font-medium bg-red-50 px-2.5 py-1 rounded-md text-xs">
                        Telat {{ item.telat_hari }} hari
                      </span>
                    </td>
                    <td class="py-4 px-6">
                      <div class="flex items-center justify-end gap-3">
                        <a v-if="item.no_telp" :href="`https://wa.me/${item.no_telp}?text=Halo ${item.siswa}, tolong segera kembalikan alat lab (${item.alat}) karena sudah terlambat ${item.telat_hari} hari.`" target="_blank" class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Hubungi via WhatsApp">
                          <MessageCircle class="w-5 h-5" />
                        </a>
                        <router-link :to="`/pengembalian/${item.id}`" class="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                          Proses Kembali
                        </router-link>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="overduePeminjaman.length === 0">
                    <td colspan="5" class="py-8 text-center text-gray-500">
                      Tidak ada peminjaman yang terlambat. Hebat! 🎉
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
