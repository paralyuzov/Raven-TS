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
  <button @click="toggleNavigation"
    class="fixed bottom-20 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-slate-700 to-slate-900 shadow-lg shadow-sky-400/90 text-white transition-all duration-300 hover:scale-110"
    :class="isNavigationVisible ? 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-xl shadow-sky-700/30' : 'bg-gradient-to-r from-slate-700 to-slate-900'"
    >
    
    <FontAwesomeIcon :icon="isNavigationVisible ? faChevronDown : faChevronUp" />
  </button>

  <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-10"
    enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100" leave-to-class="opacity-0 translate-y-10">
    <nav v-show="isNavigationVisible"
      class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-auto px-5 py-3 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-xl border border-slate-700/50 backdrop-blur-md">
      <div class="flex items-center justify-center space-x-3 sm:space-x-3">
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

  <NotificationModal :show="showModal" @close="handleNotificationModalClose" />
  <FindUsers :show="showUserSearchModal" @close="toggleUserSearch" />
</template>