<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch, onUnmounted } from 'vue';
import { useMessageStore } from '../../store/message';
import { socketService } from '../../services/socket.service';
import Avatar from '../ui/Avatar.vue';
import type { Message } from '../../types/Message';

const props = defineProps<{
  conversationId: string;
  recipient: any;
}>();

const messageStore = useMessageStore();
const messagesEnd = ref<HTMLElement | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | null = null;

const messages = computed<Message[]>(() => messageStore.messages);

function scrollToBottom(delay = 0) {
  const scrollFn = () => {
    messagesEnd.value?.scrollIntoView({ behavior: "smooth" });
    
    setTimeout(() => {
      messagesEnd.value?.scrollIntoView({ behavior: "auto" });
    }, 50);
  };
  
  if (delay > 0) {
    setTimeout(scrollFn, delay);
  } else {
    scrollFn();
  }
}

async function fetchMessages() {
  await messageStore.fetchMessages(props.conversationId);
  await nextTick();
  scrollToBottom();
}

function openGifFullscreen(gifUrl: string) {
  window.open(gifUrl, '_blank');
}

function handleGifError() {
}

function handleGifLoad() {
  nextTick().then(() => scrollToBottom());
}

watch(messages, () => {
  const lastMessage = messages.value[messages.value.length - 1];
  
  if (lastMessage?.type === 'gif' || lastMessage?.type === 'image' || lastMessage?.type === 'video') {
    nextTick().then(() => scrollToBottom(150));
  } else {
    nextTick().then(() => scrollToBottom());
  }
});

onMounted(() => {
  fetchMessages();
  nextTick().then(() => scrollToBottom());
  
  if (messagesContainer.value) {
    let lastHeight = messagesContainer.value.scrollHeight;
    
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const currentHeight = entry.target.scrollHeight;
        if (currentHeight > lastHeight + 10) {
          setTimeout(() => {
            nextTick().then(() => scrollToBottom());
          }, 50);
          lastHeight = currentHeight;
        }
      }
    });
    resizeObserver.observe(messagesContainer.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

watch(
  () => props.conversationId,
  async (newId, oldId) => {
    if (newId !== oldId) {
      await fetchMessages();
      socketService.joinConversation(newId);
    }
  }
);

defineExpose({
  scrollToBottom
});
</script>

<template>
  <div
    ref="messagesContainer"
    class="flex-1 overflow-y-auto px-4 py-4 flex flex-col space-y-2"
    style="min-height: 0"
  >
    <div
      v-for="(msg) in messages"
      :key="msg._id"
      :class="[
        'flex',
        msg.senderId === recipient._id ? 'justify-start' : 'justify-end',
      ]"
    >
      <Avatar
        v-if="msg.senderId === recipient._id"
        :src="recipient.avatar"
        :firstName="recipient.firstName"
        :lastName="recipient.lastName"
        size="md"
        className="flex-shrink-0 mr-2"
      />

      <div
        :class="[
          'max-w-sm text-base leading-6 message-text',
          (msg.type === 'gif' || msg.type === 'image' || msg.type === 'video') ? 'p-1' : 'px-4 py-3',
          msg.senderId === recipient._id
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md'
            : 'bg-blue-500 text-white rounded-2xl rounded-br-md',
        ]"
      >
        <div v-if="msg.type === 'text'" class="break-words">
          {{ msg.content }}
        </div>
        
        <div v-else-if="msg.type === 'gif'" class="gif-message">
          <img
            :src="msg.content"
            alt="GIF"
            class="max-w-full h-auto rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
            style="max-height: 200px; min-width: 150px;"
            loading="lazy"
            @click="openGifFullscreen(msg.content)"
            @error="handleGifError"
            @load="handleGifLoad"
          />
        </div>
        
        <div v-else-if="msg.type === 'image'" class="image-message">
          <img
            :src="msg.content"
            :alt="msg.originalFileName || 'Image'"
            class="max-w-full h-auto rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
            style="max-height: 300px; min-width: 150px;"
            loading="lazy"
            @click="openGifFullscreen(msg.content)"
            @error="handleGifError"
            @load="handleGifLoad"
          />
          <div v-if="msg.originalFileName" class="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
            {{ msg.originalFileName }}
          </div>
        </div>
        
        <div v-else-if="msg.type === 'video'" class="video-message">
          <video
            :src="msg.content"
            controls
            class="max-w-full h-auto rounded-xl"
            style="max-height: 300px; min-width: 200px;"
            @loadeddata="handleGifLoad"
          >
            Your browser does not support the video tag.
          </video>
          <div v-if="msg.originalFileName" class="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
            {{ msg.originalFileName }}
          </div>
        </div>
        
        <div v-else class="break-words">
          {{ msg.content }}
        </div>
      </div>
    </div>

    <div v-if="messages.length > 0" class="flex justify-center py-2">
      <span class="text-xs text-gray-500 dark:text-gray-400">
        {{
          new Date(
            messages[messages.length - 1]?.createdAt ?? Date.now()
          ).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        }}
      </span>
    </div>
    <div ref="messagesEnd"></div>
  </div>
</template>

<style scoped>
* {
  font-family: "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica,
    Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.message-text {
  font-family: "SF Pro Text", system-ui, sans-serif;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.gif-message img {
  border-radius: 0.75rem;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.gif-message img:hover {
  transform: scale(1.02);
}

.image-message img {
  border-radius: 0.75rem;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.image-message img:hover {
  transform: scale(1.02);
}

.video-message video {
  border-radius: 0.75rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(-600px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.flex>div {
  animation: fadeInUp 0.8s ease-out;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
