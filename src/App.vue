<script setup lang="ts">
import BottomNavigation from './components/BottomNavigation.vue';
import Toast from './components/ui/Toast.vue';
import { onMounted } from 'vue';
import { useAuthStore } from './store/auth';
import AppLoader from './components/AppLoader.vue';

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.checkAuth();
});
</script>

<template>
  <AppLoader :show="!authStore.isAuthReady" />
  <Toast />
  <router-view v-if="authStore.isAuthReady" />
  <BottomNavigation />
</template>
