<template>
  <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
    <transition-group name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-[280px] max-w-sm transform transition-all duration-300 bg-white"
        :class="{
          'border-emerald-200 bg-emerald-50/50': toast.type === 'success',
          'border-red-200 bg-red-50/50': toast.type === 'error',
          'border-amber-200 bg-amber-50/50': toast.type === 'warning',
          'border-blue-200 bg-blue-50/50': toast.type === 'info'
        }"
      >
        <div 
          class="shrink-0 flex items-center justify-center p-1.5 rounded-full"
          :class="{
            'bg-emerald-100 text-emerald-600': toast.type === 'success',
            'bg-red-100 text-red-600': toast.type === 'error',
            'bg-amber-100 text-amber-600': toast.type === 'warning',
            'bg-blue-100 text-blue-600': toast.type === 'info'
          }"
        >
          <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5" />
          <AlertCircle v-if="toast.type === 'error'" class="w-5 h-5" />
          <AlertTriangle v-if="toast.type === 'warning'" class="w-5 h-5" />
          <Info v-if="toast.type === 'info'" class="w-5 h-5" />
        </div>
        
        <p class="text-sm font-medium text-gray-800 flex-1 leading-snug">{{ toast.message }}</p>
        
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600 shrink-0 p-1.5 rounded-lg hover:bg-black/5 transition-colors">
          <X class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
