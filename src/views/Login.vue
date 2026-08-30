<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Wrench } from 'lucide-vue-next'

const router = useRouter()
const username = ref('')
const password = ref('')

const handleLogin = () => {
  // Mock login, redirect to dashboard
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
      <div class="flex flex-col items-center text-center mb-8">
        <div class="p-4 bg-teal-50 text-teal-600 rounded-full mb-4">
          <Wrench class="w-10 h-10" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Admin Lab TKJ</h2>
        <p class="text-gray-500 mt-2 text-sm">Masuk untuk mengelola inventaris dan peminjaman</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Username / NIP</label>
          <input 
            type="text" 
            v-model="username" 
            required 
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            placeholder="Masukkan username"
          >
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            v-model="password" 
            required 
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            placeholder="••••••••"
          >
        </div>

        <div class="pt-2">
          <button type="submit" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-teal-200 transition-all active:scale-[0.98]">
            Masuk
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
