<script setup lang="ts">
defineProps({
  show: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center dark:bg-slate-900/90 backdrop-blur-sm">
      <div class="flex flex-col items-center">
        <div class="w-20 h-20 border-4 border-t-blue-500 border-r-transparent border-b-sky-500 border-l-transparent rounded-full animate-spin"></div>
        <div class="mt-8">
          <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">RAVEN</h1>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>