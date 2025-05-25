<script setup lang="ts">
import { ref, watch } from 'vue';
import Avatar from '../ui/Avatar.vue';
import type { Contact } from '../../types/Contact';

const props = defineProps({
  contacts: {
    type: Array as () => Contact[],
    required: true
  },
  selectedContactId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['select-contact']);

const searchQuery = ref('');
const filteredContacts = ref<Contact[]>(props.contacts);

watch(() => props.contacts, () => {
  searchContacts();
}, { deep: true });

const searchContacts = () => {
  if (searchQuery.value.trim() === '') {
    filteredContacts.value = props.contacts;
  } else {
    filteredContacts.value = props.contacts.filter(contact => 
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
};

const selectContact = (contact: Contact) => {
  emit('select-contact', contact);
};
</script>

<template>
  <div class="w-full md:w-80 flex-shrink-0 flex flex-col bg-gray-50/80 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50">
    <header class="sticky top-0 z-30 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 px-6 py-5">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Messages
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Stay connected</p>
        </div>
        
        <button class="relative p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/25 group">
          <svg class="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
      
      <div class="relative">
        <input 
          v-model="searchQuery" 
          @input="searchContacts"
          type="text" 
          placeholder="Search conversations" 
          class="w-full bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 rounded-2xl px-4 py-3.5 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium shadow-sm border border-gray-200/50 dark:border-gray-700/50 focus:border-blue-300 dark:focus:border-blue-500"
        />
        <div class="absolute left-4 top-1/2 transform -translate-y-1/2 p-1">
          <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </header>

    <div class="overflow-y-auto flex-grow">
      <div class="px-4 py-3 space-y-1">
        <div 
          v-for="contact in filteredContacts" 
          :key="contact._id" 
          class="relative group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99] backdrop-blur-sm"
          :class="{
            'bg-blue-500 text-white shadow-lg shadow-blue-500/25': selectedContactId === contact._id,
            'bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/30 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-md': selectedContactId !== contact._id
          }"
          @click="selectContact(contact)"
        >
          <Avatar
            :src="contact.avatar"
            :firstName="contact.firstName"
            :lastName="contact.lastName"
            :showOnlineStatus="true"
            :isOnline="contact.isOnline"
            size="lg"
            className="transition-all duration-200 group-hover:scale-105"
          />
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-semibold text-lg truncate transition-colors duration-200"
                  :class="selectedContactId === contact._id ? 'text-white' : 'text-gray-900 dark:text-white'">
                {{ contact.firstName }} {{ contact.lastName }}
              </h3>
              
              <div v-if="contact.unreadCount && contact.unreadCount > 0" 
                   class="flex items-center justify-center min-w-6 h-6 rounded-full text-xs font-bold transition-all duration-200 group-hover:scale-110"
                   :class="selectedContactId === contact._id ? 'bg-white/20 text-white' : 'bg-red-500 text-white shadow-sm'">
                {{ contact.unreadCount > 99 ? '99+' : contact.unreadCount }}
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <span 
                class="text-sm font-medium truncate transition-colors duration-200"
                :class="{
                  'text-green-600 dark:text-green-400': contact.isOnline && selectedContactId !== contact._id,
                  'text-gray-500 dark:text-gray-400': !contact.isOnline && selectedContactId !== contact._id,
                  'text-white/80': selectedContactId === contact._id
                }"
              >
                {{ contact.isOnline ? 'Active now' : 'Offline' }}
              </span>
            </div>
          </div>
          
          <div class="opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0">
            <svg class="w-5 h-5 transition-colors duration-200" 
                 :class="selectedContactId === contact._id ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        <div v-if="filteredContacts.length === 0" class="py-20 px-6 text-center">
          <div class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg class="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">No Conversations</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">
            Start a new conversation to get chatting with your friends
          </p>
          <button class="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/25">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Start New Chat
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  font-family: 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: -0.01em;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: all 0.2s ease;
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

input:focus {
  transform: scale(1.005);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

button:active {
  transform: scale(0.96);
}


.group:hover .w-14 {
  transform: scale(1.05);
}


.backdrop-blur-xl {
  backdrop-filter: blur(20px) saturate(180%);
}


.shadow-lg {
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-md {
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}


.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

h1 {
  font-weight: 900;
  letter-spacing: -0.025em;
}

h3 {
  font-weight: 600;
  letter-spacing: -0.01em;
}

@media (max-width: 768px) {
  .md\:w-80 {
    width: 100%;
  }
  
 
  .group {
    padding: 1rem 1.25rem;
  }
  
  h1 {
    font-size: 1.875rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-contrast: high) {
  .group {
    border: 2px solid currentColor;
  }
  
  .border {
    border-width: 2px;
  }
}

@media (prefers-color-scheme: dark) {
  .shadow-lg {
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  }
}
</style>