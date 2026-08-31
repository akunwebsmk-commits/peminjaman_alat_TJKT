<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Wrench } from 'lucide-vue-next'
import { supabase } from '../supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  
  // Login menggunakan Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    alert('Gagal login: Cek kembali email dan password Anda.')
  } else {
    router.push('/dashboard')
  }
  
  isLoading.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
      <div class="flex flex-col items-center text-center mb-8">
        <div class="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
          <Wrench class="w-10 h-10" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Admin Lab TKJ</h2>
        <p class="text-gray-500 mt-2 text-sm">Masuk untuk mengelola inventaris dan peminjaman</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Email Admin</label>
          <input 
            type="email" 
            v-model="email" 
            required 
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="admin@sekolah.com"
          >
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            v-model="password" 
            required 
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="••••••••"
          >
        </div>

        <div class="pt-2">
          <button type="submit" :disabled="isLoading" class="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
            {{ isLoading ? 'Mengecek...' : 'Masuk' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
