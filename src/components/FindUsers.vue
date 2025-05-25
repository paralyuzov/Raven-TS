<script setup lang="ts">
import { ref, watch } from "vue";
import api from "../services/api";
import Avatar from "./ui/Avatar.vue";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const searchQuery = ref("");
const users = ref<any[]>([]);
const loading = ref(false);
const sendingRequest = ref<string | null>(null);

let searchTimeout: number;

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    if (searchQuery.value.trim().length >= 2) {
      await searchUsers();
    } else {
      users.value = [];
    }
  }, 300);
};

const searchUsers = async () => {
  try {
    loading.value = true;
    const response = await api.get("/friends/search-users", {
      params: { query: searchQuery.value.trim() },
    });
    users.value = response.data;
  } catch (error) {
    console.error("Error searching users:", error);
    users.value = [];
  } finally {
    loading.value = false;
  }
};

const sendFriendRequest = async (receiverId: string) => {
  try {
    sendingRequest.value = receiverId;
    await api.post("/friends/send-request", { receiverId });

    const user = users.value.find((u) => u._id === receiverId);
    if (user) {
      user.friendshipStatus = "pending";
      user.requestSent = true;
    }

    console.log("Friend request sent successfully!");
  } catch (error: any) {
    console.error("Error sending friend request:", error);
    alert(error.response?.data?.message || "Failed to send friend request");
  } finally {
    sendingRequest.value = null;
  }
};

const closeModal = () => {
  searchQuery.value = "";
  users.value = [];
  emit("close");
};

watch(
  () => props.show,
  (newValue) => {
    if (!newValue) {
      searchQuery.value = "";
      users.value = [];
      loading.value = false;
      sendingRequest.value = null;
    }
  }
);
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="closeModal"
  >
    <div
      class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md mx-4 transform transition-all duration-300"
      @click.stop
    >
      <div class="px-6 py-4 border-b border-slate-700/50">
        <div class="flex items-center justify-between">
          <h2
            class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-300"
          >
            Find Users
          </h2>
          <button
            @click="closeModal"
            class="p-2 rounded-full hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
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
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="px-6 py-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Search by name, email, or nickname..."
            class="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 pl-10 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
          <svg
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <div v-if="loading" class="px-6 py-8 text-center">
          <div
            class="inline-block w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"
          ></div>
          <p class="mt-2 text-slate-400">Searching...</p>
        </div>

        <div
          v-else-if="searchQuery && users.length === 0 && !loading"
          class="px-6 py-8 text-center"
        >
          <svg
            class="w-12 h-12 mx-auto text-slate-600 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
          <p class="text-slate-400">No users found</p>
          <p class="text-slate-500 text-sm mt-1">
            Try searching with different keywords
          </p>
        </div>

        <div v-else-if="!searchQuery" class="px-6 py-8 text-center">
          <svg
            class="w-12 h-12 mx-auto text-slate-600 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
          <p class="text-slate-400">Start typing to search for users</p>
        </div>

        <div v-else-if="users.length > 0" class="divide-y divide-slate-700/50">
          <div
            v-for="user in users"
            :key="user._id"
            class="px-6 py-4 hover:bg-slate-700/30 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Avatar
                  :src="user.avatar"
                  :firstName="user.firstName"
                  :lastName="user.lastName"
                  size="md"
                />

                <div class="flex-1">
                  <div class="font-medium text-slate-200">
                    {{ user.firstName }} {{ user.lastName }}
                  </div>
                  <div class="text-sm text-slate-400">
                    {{ user.email }}
                  </div>
                  <div v-if="user.username" class="text-xs text-slate-500">
                    @{{ user.username }}
                  </div>
                </div>
              </div>

              <div class="flex-shrink-0">
                <div
                  v-if="user.friendshipStatus === 'accepted'"
                  class="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium flex items-center space-x-1"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <span>Friends</span>
                </div>

                <div
                  v-else-if="
                    user.friendshipStatus === 'pending' && user.requestSent
                  "
                  class="px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium flex items-center space-x-1"
                >
                  <svg
                    class="w-3 h-3 animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <span>Pending</span>
                </div>

                <div
                  v-else-if="
                    user.friendshipStatus === 'pending' && !user.requestSent
                  "
                  class="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium flex items-center space-x-1"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <span>Respond</span>
                </div>

                <button
                  v-else
                  @click="sendFriendRequest(user._id)"
                  :disabled="sendingRequest === user._id"
                  class="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-medium rounded-full transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <svg
                    v-if="sendingRequest === user._id"
                    class="w-3 h-3 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  <svg
                    v-else
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  <span>{{
                    sendingRequest === user._id ? "Sending..." : "Add Friend"
                  }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-slate-700/50 text-center">
        <p class="text-xs text-slate-500">
          Search for users to connect and chat with them
        </p>
      </div>
    </div>
  </div>
</template>
