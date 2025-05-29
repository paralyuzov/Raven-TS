<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import ContactsList from './ContactsList.vue';
import ChatWindow from '../chat/ChatWindow.vue';
import { useContactsStore } from '../../store/contacts';
import { useAuthStore } from '../../store/auth';
import { useNavigation } from '../../composables/useNavigation';
import api from '../../services/api';
import { socketService } from '../../services/socket.service';
import type { Contact } from '../../types/Contact';

const contactsStore = useContactsStore();
const authStore = useAuthStore();
const { hideNavigation, showNavigation } = useNavigation();
const contacts = computed<Contact[]>(() => contactsStore.contacts || []);
const isLoading = computed(() => contactsStore.loading);
const selectedContact = computed(() => contactsStore.selectedContact);
const selectedConversationId = computed(() => contactsStore.selectedConversationId);

onMounted(async () => {
  if (authStore.isAuthenticated && authStore.accessToken) {
    socketService.connect();
  }
  await contactsStore.fetchContacts();
  
  if (!selectedContact.value) {
    showNavigation();
  }
  
  setTimeout(() => {
    contacts.value.forEach(contact => {
      contactsStore.requestFriendStatus(contact._id);
    });
  }, 500);
});

onUnmounted(() => {
  contactsStore.cleanup();
});

async function handleSelectContact(contact: any) {
  contactsStore.selectContact(contact);
  
  hideNavigation();
  
  try {
    const res = await api.post('/conversation/get-or-create', {
      participantId: contact._id
    });
    contactsStore.setConversationId(res.data._id);
  } catch (e) {
    console.error('Failed to get/create conversation', e);
  }
}
</script>

<template>
  <div class="min-h-screen dark:bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200">
    <div class="flex h-screen">
      <div v-if="isLoading" class="w-full flex items-center justify-center">
        <div class="flex flex-col items-center gap-4">
          <div
            class="w-16 h-16 border-4 border-t-purple-500 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full animate-spin">
          </div>
          <p class="text-lg text-purple-300">Loading contacts...</p>
        </div>
      </div>
      <template v-else>
        <ContactsList 
          :contacts="contacts" 
          :selectedContactId="selectedContact?._id"
          @select-contact="handleSelectContact" 
          :class="{'hidden md:block': selectedContact && selectedConversationId}"
        />
        <ChatWindow 
          v-if="selectedContact && selectedConversationId" 
          :conversationId="selectedConversationId"
          :recipient="selectedContact" 
          :class="{'w-full': selectedContact && selectedConversationId}"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>