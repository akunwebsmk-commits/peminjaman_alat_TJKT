<script setup>
import Toast from './components/Toast.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    <router-view />
    <Toast />
  </div>
</template>
