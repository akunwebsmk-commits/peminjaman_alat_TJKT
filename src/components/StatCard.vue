<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: Object,
  colorClass: {
    type: String,
    default: 'text-blue-600 bg-blue-50'
  }
})
</script>

<template>
  <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
    <div>
      <p class="text-sm font-medium text-gray-500">{{ title }}</p>
      <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ value }}</h3>
    </div>
    <div :class="['w-12 h-12 rounded-lg flex items-center justify-center', colorClass]">
      <component :is="icon" class="w-6 h-6" />
    </div>
  </div>
</template>
