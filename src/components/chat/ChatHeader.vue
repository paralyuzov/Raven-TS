<script setup lang="ts">
import { computed } from 'vue';
import { useContactsStore } from '../../store/contacts';
import { useNavigation } from '../../composables/useNavigation';
import Avatar from '../ui/Avatar.vue';

const props = defineProps<{
  recipient: any;
}>();

const contactsStore = useContactsStore();
const { showNavigation } = useNavigation();

const recipientStatus = computed(() => {
  const contact = contactsStore.contacts.find(c => c._id === props.recipient._id);
  return contact?.isOnline ?? false;
});

const statusText = computed(() => {
  return recipientStatus.value ? 'Online' : 'Offline';
});

const statusIndicatorClasses = computed(() => {
  return recipientStatus.value
    ? 'bg-green-500 animate-pulse'
    : 'bg-gray-500';
});

const statusTextClasses = computed(() => {
  return recipientStatus.value
    ? 'text-green-600 dark:text-green-400'
    : 'text-gray-500 dark:text-gray-400';
});

function handleBackToContacts() {
  contactsStore.selectedContact = null;
  contactsStore.selectedConversationId = null;
  showNavigation();
}
</script>

<template>
  <div
    class="relative flex items-center gap-3 px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 backdrop-blur-xl"
  >
    <button
      @click="handleBackToContacts"
      class="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
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
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>

    <Avatar
      :src="recipient.avatar"
      :firstName="recipient.firstName"
      :lastName="recipient.lastName"
      :showOnlineStatus="true"
      :isOnline="recipientStatus"
      size="md"
    />

    <div class="flex-1">
      <div class="font-semibold text-base text-gray-900 dark:text-white">
        {{ recipient.firstName }} {{ recipient.lastName }}
      </div>
      <div class="flex items-center gap-1.5 text-xs">
        <div
          :class="[
            'w-1.5 h-1.5 rounded-full',
            statusIndicatorClasses
          ]"
        ></div>
        <span
          :class="[
            'font-medium',
            statusTextClasses
          ]"
        >
          {{ statusText }}
        </span>
      </div>
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
</style>
