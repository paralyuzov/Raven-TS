<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { gifService } from '../../services/gif.service';
import type { GifObject } from '../../types/Gif';

const emit = defineEmits<{
  selectGif: [gif: GifObject]
  close: []
}>();

const searchQuery = ref('');
const gifs = ref<GifObject[]>([]);
const loading = ref(false);
const error = ref('');
const selectedCategory = ref<'trending' | 'search'>('trending');
const currentPage = ref(0);
const hasMore = ref(true);

const searchTimeout = ref<number | null>(null);

const hasSearchQuery = computed(() => searchQuery.value.trim().length > 0);

async function loadTrendingGifs(append = false) {
  try {
    loading.value = true;
    error.value = '';
    const offset = append ? currentPage.value * 20 : 0;
    const response = await gifService.getTrendingGifs(20, offset);
    
    if (append) {
      gifs.value = [...gifs.value, ...response.data];
    } else {
      gifs.value = response.data;
      currentPage.value = 0;
    }
    
    hasMore.value = response.data.length === 20;
    if (append) currentPage.value++;
  } catch (err) {
    error.value = 'Failed to load trending GIFs';
    console.error('Error loading trending GIFs:', err);
  } finally {
    loading.value = false;
  }
}

async function searchGifs(query: string, append = false) {
  if (!query.trim()) {
    await loadTrendingGifs();
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    const offset = append ? currentPage.value * 20 : 0;
    const response = await gifService.searchGifs(query, 20, offset);
    
    if (append) {
      gifs.value = [...gifs.value, ...response.data];
    } else {
      gifs.value = response.data;
      currentPage.value = 0;
    }
    
    hasMore.value = response.data.length === 20;
    if (append) currentPage.value++;
  } catch (err) {
    error.value = 'Failed to search GIFs';
    console.error('Error searching GIFs:', err);
  } finally {
    loading.value = false;
  }
}

function handleSearchInput() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  
  searchTimeout.value = setTimeout(() => {
    if (hasSearchQuery.value) {
      selectedCategory.value = 'search';
      searchGifs(searchQuery.value);
    } else {
      selectedCategory.value = 'trending';
      loadTrendingGifs();
    }
  }, 300);
}

function selectGif(gif: GifObject) {
  emit('selectGif', gif);
  emit('close');
}

function handleClose() {
  emit('close');
}

watch(searchQuery, handleSearchInput);

onMounted(() => {
  loadTrendingGifs();
});
</script>

<template>
  <div class="gif-picker bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl">
    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">
        {{ hasSearchQuery ? 'Search Results' : 'Trending GIFs' }}
      </h3>
      <button
        @click="handleClose"
        class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="relative">
        <input
          v-model="searchQuery"
          placeholder="Search for GIFs..."
          class="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500 dark:placeholder-gray-400 text-sm"
        />
        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
    </div>

    <div v-else-if="error" class="p-8 text-center">
      <div class="text-red-500 dark:text-red-400 mb-2">{{ error }}</div>
      <button
        @click="loadTrendingGifs(false)"
        class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
      >
        Try again
      </button>
    </div>

    <div v-else class="gif-grid p-4 max-h-80 overflow-y-auto">
      <div v-if="gifs.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8">
        No GIFs found
      </div>
      <div v-else class="grid grid-cols-2 gap-3">
        <div
          v-for="gif in gifs"
          :key="gif.id"
          @click="selectGif(gif)"
          class="gif-container cursor-pointer rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 hover:scale-105 transition-transform duration-200"
        >
          <img
            :src="gif.images.fixed_width_small.url"
            :alt="gif.title"
            class="gif-thumbnail"
            loading="lazy"
          />
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
* {
  font-family: "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.gif-picker {
  width: 320px;
  max-height: 480px;
}

.gif-container {
  width: 100%;
  height: 120px;
  position: relative;
  display: block;
}

.gif-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Custom scrollbar */
.gif-grid::-webkit-scrollbar {
  width: 6px;
}

.gif-grid::-webkit-scrollbar-track {
  background: transparent;
}

.gif-grid::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.dark .gif-grid::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.gif-grid::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark .gif-grid::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
