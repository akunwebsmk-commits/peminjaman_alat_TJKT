<script setup>
import { AlertTriangle, X } from 'lucide-vue-next'

defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Konfirmasi Hapus'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Hapus'
  },
  cancelText: {
    type: String,
    default: 'Batal'
  }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
      @click="emit('cancel')"
    ></div>

    <!-- Modal -->
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
      <div class="p-6">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-red-50 text-red-600 rounded-full">
              <AlertTriangle class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
          </div>
          <button @click="emit('cancel')" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <p class="text-gray-600 mb-6 text-sm">{{ message }}</p>
        
        <div class="flex gap-3 justify-end">
          <button 
            @click="emit('cancel')" 
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm"
          >
            {{ cancelText }}
          </button>
          <button 
            @click="emit('confirm')" 
            class="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors shadow-sm shadow-red-200 text-sm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
