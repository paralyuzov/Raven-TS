<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { socketService } from '../../services/socket.service';
import { uploadFile } from '../../services/api';
import data from 'emoji-mart-vue-fast/data/all.json';
import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src';
import 'emoji-mart-vue-fast/css/emoji-mart.css';
import GifPicker from '../ui/GifPicker.vue';
import type { GifObject } from '../../types/Gif';

const props = defineProps<{
  conversationId: string;
}>();

const emit = defineEmits<{
  messageSent: []
}>();

const newMessage = ref("");
const emojiIndex = new EmojiIndex(data);
const showEmojiPicker = ref(false);
const showGifPicker = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const uploadProgress = ref(0);

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

function handleSend() {
  if (!newMessage.value.trim()) return;
  socketService.sendMessage(props.conversationId, newMessage.value, "text");
  newMessage.value = "";
  emit('messageSent');
}

function addEmoji(emoji: any) {
  newMessage.value += emoji.native;
  showEmojiPicker.value = false;
}

function handleGifSelect(gif: GifObject) {
  socketService.sendMessage(props.conversationId, gif.images.original.url, "gif");
  showGifPicker.value = false;
  emit('messageSent');
}

function handleFileSelect() {
  fileInputRef.value?.click();
}

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
  }

  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
  const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);
  
  if (!isImage && !isVideo) {
    return 'File type not supported. Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, MPEG, MOV, AVI, WebM)';
  }

  return null;
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  const validationError = validateFile(file);
  if (validationError) {
    alert(validationError);
    target.value = '';
    return;
  }

  try {
    isUploading.value = true;
    uploadProgress.value = 0;

    const uploadResult = await uploadFile(file, (progress) => {
      uploadProgress.value = progress;
    });

    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
    const fileType = isImage ? 'image' : 'video';

    socketService.sendMediaMessage(
      props.conversationId,
      uploadResult.url,
      fileType,
      file.name,
      file.size,
      file.type
    );

    emit('messageSent');
    
    target.value = '';
    
  } catch (error) {
    alert('Failed to upload file. Please try again.');
    target.value = '';
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    showEmojiPicker.value = false;
    showGifPicker.value = false;
  }
  
  if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
    event.preventDefault();
    showGifPicker.value = !showGifPicker.value;
    showEmojiPicker.value = false;
  }
  
  if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault();
    showEmojiPicker.value = !showEmojiPicker.value;
    showGifPicker.value = false;
  }
}
function handleClickOutside(event: MouseEvent) {
  const emojiContainer = (event.target as Element)?.closest('.emoji-picker-container');
  const gifContainer = (event.target as Element)?.closest('.gif-picker-container');
  
  if (!emojiContainer && showEmojiPicker.value) {
    showEmojiPicker.value = false;
  }
  
  if (!gifContainer && showGifPicker.value) {
    showGifPicker.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl">
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
      @change="handleFileUpload"
      class="hidden"
    />
    
    <div v-if="isUploading" class="mb-2">
      <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
        <span>Uploading file...</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          class="bg-blue-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        @click="handleFileSelect"
        :disabled="isUploading"
        :class="[
          'p-2 rounded-full transition-colors',
          isUploading 
            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
        title="Upload image or video"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
      </button>

      <div class="flex-1 relative">
        <input
          v-model="newMessage"
          @keyup.enter="handleSend"
          :disabled="isUploading"
          :class="[
            'w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-full px-4 py-2 pr-20 focus:outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400 text-sm',
            isUploading 
              ? 'cursor-not-allowed opacity-50' 
              : showGifPicker || showEmojiPicker 
                ? 'focus:ring-2 focus:ring-purple-500' 
                : 'focus:ring-2 focus:ring-blue-500'
          ]"
          :placeholder="isUploading ? 'Uploading file...' : 'Type a message... (⌘+G for GIFs, ⌘+E for emojis)'"
          autocomplete="off"
        />

        <div class="relative inline-block gif-picker-container">
          <button
            class="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-blue-600 transition-colors text-gray-200 dark:text-gray-200"
            @click.prevent="showGifPicker = !showGifPicker"
            type="button"
            title="Send GIF"
          >
            <div class="w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-white text-xs font-bold rounded">
              GIF
            </div>
          </button>
          <div v-if="showGifPicker" class="absolute bottom-12 right-0 z-50">
            <GifPicker @selectGif="handleGifSelect" @close="showGifPicker = false" />
          </div>
        </div>

        <div class="relative inline-block emoji-picker-container">
          <button
            class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-500 transition-colors text-gray-200 dark:text-gray-200"
            @click.prevent="showEmojiPicker = !showEmojiPicker"
            type="button"
            title="Add emoji"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <div v-if="showEmojiPicker" class="absolute bottom-12 right-0 z-50">
            <Picker :data="emojiIndex" set="apple" @select="addEmoji" :showPreview="false" theme="auto" />
          </div>
        </div>
      </div>

      <button
        @click="handleSend"
        :disabled="!newMessage.trim() || isUploading"
        :class="[
          'p-2 rounded-full transition-all text-white',
          newMessage.trim() && !isUploading
            ? 'bg-blue-500 hover:bg-blue-600 shadow-sm'
            : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed',
        ]"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
* {
  font-family: "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica,
    Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

input:focus {
  transform: scale(1.01);
}

button:active {
  transform: scale(0.95);
}

:deep(.emoji-mart) {
  font-family: "SF Pro Text", system-ui, sans-serif;
  font-weight: 500;
  letter-spacing: 0.02em;
  background: white !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 1rem !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.dark :deep(.emoji-mart) {
  background: #1f2937 !important;
  border: 1px solid #374151 !important;
}

:deep(.emoji-mart-bar) {
  background: #f9fafb !important;
  border-bottom: 1px solid #e5e7eb !important;
  padding: 0.75rem 1rem !important;
}

.dark :deep(.emoji-mart-bar) {
  background: #111827 !important;
  border-bottom: 1px solid #374151 !important;
}

:deep(.emoji-mart-anchors) {
  background: transparent !important;
  border-bottom: none !important;
  padding: 0.5rem 1rem !important;
  display: flex;
  justify-content: space-between;
}

:deep(.emoji-mart-anchor) {
  padding: 0.5rem !important;
  border-radius: 0.5rem !important;
  transition: all 0.2s ease !important;
  border: none !important;
}

:deep(.emoji-mart-anchor:hover) {
  background: #f3f4f6 !important;
  transform: scale(1.05);
}

.dark :deep(.emoji-mart-anchor:hover) {
  background: #374151 !important;
}

:deep(.emoji-mart-anchor-selected) {
  background: #dbeafe !important;
  border-radius: 0.5rem !important;
}

.dark :deep(.emoji-mart-anchor-selected) {
  background: #1e3a8a !important;
}

:deep(.emoji-mart-anchor-selected svg) {
  color: #2563eb !important;
  fill: #2563eb !important;
}

.dark :deep(.emoji-mart-anchor-selected svg) {
  color: #60a5fa !important;
  fill: #60a5fa !important;
}

:deep(.emoji-mart-anchor:hover svg) {
  color: #374151 !important;
  fill: #374151 !important;
}

.dark :deep(.emoji-mart-anchor:hover svg) {
  color: #d1d5db !important;
  fill: #d1d5db !important;
}

:deep(.emoji-mart .emoji-mart-anchor-bar) {
  background: #2563eb !important;
  height: 2px !important;
  border-radius: 1px !important;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2) !important;
  margin-top: 0.25rem !important;
  transition: all 0.2s ease !important;
}

.dark :deep(.emoji-mart .emoji-mart-anchor-bar) {
  background: #60a5fa !important;
  box-shadow: 0 2px 4px rgba(96, 165, 250, 0.3) !important;
}

:deep(.emoji-mart-scroll) {
  background: transparent !important;
  padding: 0.5rem !important;
  max-height: 280px !important;
}

:deep(.emoji-mart-category) {
  padding: 0.25rem 0 !important;
}

:deep(.emoji-mart-category-label) {
  display: none !important;
}

:deep(.emoji-mart-emoji) {
  border-radius: 0.375rem !important;
  transition: all 0.15s ease !important;
  margin: 0.125rem !important;
  padding: 0.25rem !important;
}

:deep(.emoji-mart-emoji:hover) {
  background: #f3f4f6 !important;
  transform: scale(1.1) !important;
}

.dark :deep(.emoji-mart-emoji:hover) {
  background: #374151 !important;
}

:deep(.emoji-mart-search) {
  background: transparent !important;
  padding: 0.75rem 1rem 0.5rem !important;
  border-bottom: 1px solid #e5e7eb !important;
}

.dark :deep(.emoji-mart-search) {
  border-bottom: 1px solid #374151 !important;
}

:deep(.emoji-mart-search input) {
  background: #f9fafb !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 0.5rem !important;
  padding: 0.5rem 0.75rem !important;
  font-size: 0.875rem !important;
  color: #374151 !important;
  transition: all 0.2s ease !important;
}

.dark :deep(.emoji-mart-search input) {
  background: #111827 !important;
  border: 1px solid #374151 !important;
  color: #d1d5db !important;
}

:deep(.emoji-mart-search input:focus) {
  outline: none !important;
  border-color: #2563eb !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
}

.dark :deep(.emoji-mart-search input:focus) {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1) !important;
}

:deep(.emoji-mart-search input::placeholder) {
  color: #9ca3af !important;
}

.dark :deep(.emoji-mart-search input::placeholder) {
  color: #6b7280 !important;
}

:deep(.emoji-mart-scroll)::-webkit-scrollbar {
  width: 6px;
}

:deep(.emoji-mart-scroll)::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.emoji-mart-scroll)::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.dark :deep(.emoji-mart-scroll)::-webkit-scrollbar-thumb {
  background: #4b5563;
}

:deep(.emoji-mart-scroll)::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark :deep(.emoji-mart-scroll)::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
