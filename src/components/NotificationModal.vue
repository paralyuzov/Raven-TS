<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useFriendsStore } from "../store/friends";
import { useContactsStore } from "../store/contacts";
import Avatar from "./ui/Avatar.vue";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const contactsStore = useContactsStore();
const friendsStore = useFriendsStore();

const processingRequest = ref<string | null>(null);

const friendRequests = computed(() => friendsStore.pendingRequests);
const loading = computed(() => friendsStore.loading);

const acceptRequest = async (requestId: string) => {
  try {
    processingRequest.value = requestId;
    await friendsStore.acceptFriendRequest(requestId);

    await contactsStore.fetchContacts();

    console.log("Friend request accepted successfully!");
  } catch (error: any) {
    console.error("Error accepting friend request:", error);
    alert("Failed to accept friend request");
  } finally {
    processingRequest.value = null;
  }
};

const rejectRequest = async (requestId: string) => {
  try {
    processingRequest.value = requestId;
    await friendsStore.rejectFriendRequest(requestId);

    console.log("Friend request rejected successfully!");
  } catch (error: any) {
    console.error("Error rejecting friend request:", error);
    alert("Failed to reject friend request");
  } finally {
    processingRequest.value = null;
  }
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
};

const closeModal = () => {
  emit("close");
};

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      friendsStore.fetchPendingRequests();
    }
  }
);

onMounted(() => {
  if (props.show) {
    friendsStore.fetchPendingRequests();
  }
});
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
            class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400"
          >
            Notifications
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

      <div class="max-h-96 overflow-y-auto">
        <div v-if="loading" class="px-6 py-8 text-center">
          <div
            class="inline-block w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"
          ></div>
          <p class="mt-2 text-slate-400">Loading notifications...</p>
        </div>

        <div
          v-else-if="friendRequests.length === 0"
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
              d="M15 17h5l-5 5v-5zM4 14l6-6m2 2l6-6M4 4l16 16"
            ></path>
          </svg>
          <p class="text-slate-400">No notifications</p>
          <p class="text-slate-500 text-sm mt-1">You're all caught up!</p>
        </div>

        <div v-else class="divide-y divide-slate-700/50">
          <div
            v-for="request in friendRequests"
            :key="request._id"
            class="px-6 py-4 hover:bg-slate-700/30 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <Avatar
                    :src="request.userId?.avatar"
                    :firstName="request.userId?.firstName"
                    :lastName="request.userId?.lastName"
                    size="md"
                    class="shadow-lg"
                  />
                  <div
                    class="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <svg
                      class="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"
                      ></path>
                    </svg>
                  </div>
                </div>

                <div class="flex-1">
                  <div class="font-medium text-slate-200">
                    {{ request.userId?.firstName }}
                    {{ request.userId?.lastName }}
                  </div>
                  <div class="text-sm text-slate-400">
                    Sent you a friend request
                  </div>
                  <div class="text-xs text-slate-500 mt-1">
                    {{ formatTimeAgo(request.createdAt) }}
                  </div>
                </div>
              </div>

              <div class="flex space-x-2">
                <button
                  @click="acceptRequest(request._id)"
                  :disabled="processingRequest === request._id"
                  class="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs font-medium rounded-full transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <svg
                    v-if="processingRequest === request._id"
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
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <span>Accept</span>
                </button>

                <button
                  @click="rejectRequest(request._id)"
                  :disabled="processingRequest === request._id"
                  class="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-full transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <svg
                    class="w-3 h-3"
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
                  <span>Decline</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-slate-700/50 text-center">
        <p class="text-xs text-slate-500">
          Friend requests and notifications appear here
        </p>
      </div>
    </div>
  </div>
</template>
