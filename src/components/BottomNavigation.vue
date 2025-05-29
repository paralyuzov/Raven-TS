<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUsers, faAddressBook, faUser, faBell, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import NavigationButton from '../components/ui/NavigationButton.vue';
import FindUsers from './FindUsers.vue';
import NotificationModal from './NotificationModal.vue';
import { useNavigation } from '../composables/useNavigation';
import { useFriendsStore } from '../store/friends';

const showModal = ref(false);
const showUserSearchModal = ref(false);

const { isNavigationVisible, toggleNavigation } = useNavigation();
const friendsStore = useFriendsStore();

const hasPendingRequests = computed(() => {
  return friendsStore.hasPendingRequests;
});

const pendingRequestsCount = computed(() => {
  return friendsStore.pendingRequestsCount;
});

watch(() => friendsStore.pendingRequests, () => {
}, { deep: true });

const toggleModal = () => {
  showModal.value = !showModal.value;
};

const toggleUserSearch = () => {
  showUserSearchModal.value = !showUserSearchModal.value;
};

const handleNotificationModalClose = () => {
  showModal.value = false;
  friendsStore.fetchPendingRequests();
};

onMounted(() => {
  friendsStore.initialize();
});

onUnmounted(() => {
  friendsStore.cleanup();
});
</script>

<template>
  <transition 
    enter-active-class="transition duration-300 ease-out" 
    enter-from-class="opacity-0 translate-y-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100" 
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100" 
    leave-to-class="opacity-0 translate-y-4 scale-95">
    <nav v-show="isNavigationVisible"
      class="fixed bottom-36 right-4 z-40 w-auto px-5 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700/50 backdrop-blur-md">
      <div class="flex flex-col items-center justify-center space-y-3">
        <NavigationButton :icon="faUsers" label="Find" @click="toggleUserSearch" />

        <router-link to="/contacts" custom v-slot="{ isActive, navigate }">
          <NavigationButton :icon="faAddressBook" label="Contacts" :isActive="isActive" @click="navigate" />
        </router-link>

        <router-link to="/profile" custom v-slot="{ isActive, navigate }">
          <NavigationButton :icon="faUser" label="Profile" :isActive="isActive" @click="navigate" />
        </router-link>

        <NavigationButton :icon="faBell" label="Notifications" :showBadge="hasPendingRequests"
          :badgeCount="pendingRequestsCount" @click="toggleModal" />
      </div>
    </nav>
  </transition>

  <button @click="toggleNavigation"
    class="fixed bottom-20 right-4 z-50 w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110"
    :class="isNavigationVisible 
      ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/30' 
      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-white shadow-gray-300 dark:shadow-slate-400/90 border border-gray-200 dark:border-slate-600'"
    >
    <FontAwesomeIcon :icon="isNavigationVisible ? faChevronDown : faChevronUp" class="text-lg" />
  </button>

  <NotificationModal :show="showModal" @close="handleNotificationModalClose" />
  <FindUsers :show="showUserSearchModal" @close="toggleUserSearch" />
</template>