<script setup>
import { Bell, Search } from 'lucide-vue-next'
</script>

<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 ml-64">
    <div class="flex items-center gap-4 bg-gray-100 px-3 py-2 rounded-lg w-96">
      <Search class="w-5 h-5 text-gray-400" />
      <input 
        type="text" 
        placeholder="Cari alat atau siswa..." 
        class="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
      >
    </div>
    
    <div class="flex items-center gap-4">
      <button class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors relative">
        <Bell class="w-5 h-5" />
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
      
      <div class="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
          A
        </div>
        <div class="hidden md:block">
          <p class="text-sm font-medium text-gray-700 leading-none">Admin Lab</p>
          <p class="text-xs text-gray-500 mt-1">Toolman TKJ</p>
        </div>
      </div>
    </div>
  </header>
</template>
