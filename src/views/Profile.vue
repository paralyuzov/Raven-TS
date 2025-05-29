<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { useAuthStore } from '../store/auth';
import { useContactsStore } from '../store/contacts';
import { useToastStore } from '../store/toast';
import { useRouter } from 'vue-router';
import Avatar from '../components/ui/Avatar.vue';
import { processAvatarImage, getAvatarUploadErrorMessage } from '../utils/avatarUpload';

const authStore = useAuthStore();
const contactsStore = useContactsStore();
const toastStore = useToastStore();
const router = useRouter();

const user = computed(() => authStore.getUser);
const friends = computed(() => contactsStore.contacts);
const onlineFriends = computed(() => friends.value.filter(friend => friend.isOnline));
const offlineFriends = computed(() => friends.value.filter(friend => !friend.isOnline));

const isEditing = ref(false);
const isUpdating = ref(false);
const showDeleteConfirm = ref(false);
const activeTab = ref('profile');
const avatarInput = ref<HTMLInputElement>();
const isUploadingAvatar = ref(false);

const profileSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  nickname: yup.string().required('Nickname is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  avatar: yup.string().nullable(),
});

const { handleSubmit, errors, meta, setFieldValue, resetForm } = useForm({
  validationSchema: profileSchema,
  initialValues: {
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    avatar: '',
  },
});

const { value: firstName } = useField<string>('firstName');
const { value: lastName } = useField<string>('lastName');
const { value: nickname } = useField<string>('nickname');
const { value: email } = useField<string>('email');

onMounted(() => {
  if (user.value) {
    resetForm({
      values: {
        firstName: user.value.firstName || '',
        lastName: user.value.lastName || '',
        nickname: user.value.nickname || '',
        email: user.value.email || '',
        avatar: user.value.avatar || '',
      },
    });
  }
  contactsStore.fetchContacts();
});

const toggleEdit = () => {
  if (isEditing.value && user.value) {
    resetForm({
      values: {
        firstName: user.value.firstName || '',
        lastName: user.value.lastName || '',
        nickname: user.value.nickname || '',
        email: user.value.email || '',
        avatar: user.value.avatar || '',
      },
    });
  }
  isEditing.value = !isEditing.value;
};


const onSubmit = handleSubmit(async (formValues) => {
  isUpdating.value = true;
  try {
    await authStore.updateProfile(formValues);
    isEditing.value = false;
    await contactsStore.fetchContacts();
    toastStore.success('Profile updated successfully');
  } catch (error: any) {
    toastStore.error(error?.response?.data?.message || 'Failed to update profile');
  } finally {
    isUpdating.value = false;
  }
});

const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

const handleAvatarUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  isUploadingAvatar.value = true;
  toastStore.info('Processing avatar...', 3000);
  try {
    const { base64 } = await processAvatarImage(file);
    setFieldValue('avatar', base64);
    if (!isEditing.value) {
      await authStore.updateProfile({ avatar: base64 });
      await contactsStore.fetchContacts();
    
    } else {
      toastStore.success('Avatar ready to save with profile changes');
    }
  } catch (error) {
    toastStore.error(getAvatarUploadErrorMessage(error));
  } finally {
    isUploadingAvatar.value = false;
    toastStore.success('Avatar updated successfully!',5000);
    if (event.target) (event.target as HTMLInputElement).value = '';
  }
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
    toastStore.success('Logged out successfully');
  } catch (error) {
    toastStore.error('Failed to log out');
  }
};

const confirmDeleteAccount = () => {
  showDeleteConfirm.value = true;
};

const deleteAccount = async () => {
  try {
    showDeleteConfirm.value = false;
    await authStore.logout();
    router.push('/login');
    toastStore.success('Account deleted successfully');
  } catch (error) {
    toastStore.error('Failed to delete account');
  }
};
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <main class="max-w-4xl mx-auto px-4 py-8">
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
      >
        <div
          class="bg-gradient-to-r from-slate-200/30 to-slate-200/50 px-8 py-12 text-white relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-black/10"></div>

          <div class="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div class="relative">
              <Avatar
                :src="user?.avatar"
                :firstName="user?.firstName"
                :lastName="user?.lastName"
                size="2xl"
                className="bg-white/20 backdrop-blur-sm shadow-2xl ring-4 ring-white/30"
              />
              <button
                @click="triggerAvatarUpload"
                :disabled="isUploadingAvatar"
                class="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg
                  v-if="isUploadingAvatar"
                  class="w-5 h-5 animate-spin"
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
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              </button>

              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                @change="handleAvatarUpload"
                class="hidden"
              />
            </div>

            <div class="text-center md:text-left">
              <h2 class="text-3xl font-bold mb-2">
                {{ user?.firstName }} {{ user?.lastName }}
              </h2>
              <p class="text-white/90 text-lg mb-1">@{{ user?.nickname }}</p>
              <p class="text-white/75">{{ user?.email }}</p>
              <div class="flex items-center gap-4 mt-4 text-white/80">
                <div class="flex items-center gap-1">
                  <svg
                    class="w-4 h-4"
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
                  <span class="text-sm">{{ friends.length }} friends</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span class="text-sm">{{ onlineFriends.length }} online</span>
                </div>
                <div class="flex  items-center gap-3">
                  <button
                    v-if="!isEditing && activeTab === 'profile'"
                    @click="toggleEdit"
                    class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-sm"
                  >
                    Edit Profile
                  </button>

                  <div
                    v-else-if="activeTab === 'profile'"
                    class="flex items-center gap-2"
                  >
                    <button
                      @click="toggleEdit"
                      class="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-full transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      @click="onSubmit"
                      :disabled="!meta.valid || isUpdating"
                      class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-sm flex items-center gap-2"
                    >
                      <svg
                        v-if="isUpdating"
                        class="w-4 h-4 animate-spin"
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
                      <span>{{ isUpdating ? 'Saving...' : 'Save Changes' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="flex">
            <button
              @click="activeTab = 'profile'"
              :class="[
                'flex-1 px-6 py-4 text-center font-medium transition-all duration-200',
                activeTab === 'profile'
                  ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50',
              ]"
            >
              <div class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                Profile
              </div>
            </button>
            <button
              @click="activeTab = 'friends'"
              :class="[
                'flex-1 px-6 py-4 text-center font-medium transition-all duration-200',
                activeTab === 'friends'
                  ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50',
              ]"
            >
              <div class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
                Friends ({{ friends.length }})
              </div>
            </button>
          </nav>
        </div>

        <div v-if="activeTab === 'profile'" class="p-8">
          <form @submit.prevent="onSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  v-if="isEditing"
                  v-model="firstName"
                  type="text"
                  class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  :class="{ 'border-red-500 focus:ring-red-500': errors.firstName }"
                />
                <div
                  v-else
                  class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 font-medium"
                >
                  {{ user?.firstName }}
                </div>
                <p v-if="errors.firstName" class="text-red-500 text-sm mt-1">
                  {{ errors.firstName }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  v-if="isEditing"
                  v-model="lastName"
                  type="text"
                  class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  :class="{ 'border-red-500 focus:ring-red-500': errors.lastName }"
                />
                <div
                  v-else
                  class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 font-medium"
                >
                  {{ user?.lastName }}
                </div>
                <p v-if="errors.lastName" class="text-red-500 text-sm mt-1">
                  {{ errors.lastName }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nickname
              </label>
              <input
                v-if="isEditing"
                v-model="nickname"
                type="text"
                class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                :class="{ 'border-red-500 focus:ring-red-500': errors.nickname }"
              />
              <div
                v-else
                class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 font-medium"
              >
                @{{ user?.nickname }}
              </div>
              <p v-if="errors.nickname" class="text-red-500 text-sm mt-1">
                {{ errors.nickname }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                v-if="isEditing"
                v-model="email"
                type="email"
                class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                :class="{ 'border-red-500 focus:ring-red-500': errors.email }"
              />
              <div
                v-else
                class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 font-medium"
              >
                {{ user?.email }}
              </div>
              <p v-if="errors.email" class="text-red-500 text-sm mt-1">
                {{ errors.email }}
              </p>
            </div>

            <div v-if="isEditing" class="pt-2">
              <button
                type="submit"
                class="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                :disabled="!meta.valid || isUpdating"
              >
                <span>{{ isUpdating ? 'Saving...' : 'Save Changes' }}</span>
              </button>
            </div>
          </form>

          <div class="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Account Settings
            </h3>

            <div class="space-y-4">
              <div
                class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
              >
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white">
                    Change Password
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Update your account password
                  </p>
                </div>
                <button
                  class="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                >
                  Change
                </button>
              </div>

              <div
                class="flex items-center justify-between p-4 rounded-xl border border-orange-200 dark:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
              >
                <div>
                  <h4 class="font-semibold text-orange-800 dark:text-orange-400">
                    Logout
                  </h4>
                  <p class="text-sm text-orange-600 dark:text-orange-500">
                    Sign out of your account
                  </p>
                </div>
                <button
                  @click="handleLogout"
                  class="px-4 py-2 bg-orange-100 dark:bg-orange-900/50 hover:bg-orange-200 dark:hover:bg-orange-900/70 text-orange-700 dark:text-orange-400 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                >
                  Logout
                </button>
              </div>

              <div
                class="flex items-center justify-between p-4 rounded-xl border border-red-200 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <div>
                  <h4 class="font-semibold text-red-800 dark:text-red-400">
                    Delete Account
                  </h4>
                  <p class="text-sm text-red-600 dark:text-red-500">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button
                  @click="confirmDeleteAccount"
                  class="px-4 py-2 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/70 text-red-700 dark:text-red-400 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

  
        <div v-else-if="activeTab === 'friends'" class="p-8">

          <div class="mb-6">
            <div class="relative">
              <input
                type="text"
                placeholder="Search friends..."
                class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 pl-10 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <svg
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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

          <div v-if="onlineFriends.length > 0" class="mb-8">
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
            >
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              Online ({{ onlineFriends.length }})
            </h3>
            <div class="grid gap-3">
              <div
                v-for="friend in onlineFriends"
                :key="friend._id"
                class="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
              >
                <div class="relative">
                  <div
                    class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold overflow-hidden"
                  >
                    <img
                      v-if="friend.avatar"
                      :src="friend.avatar"
                      :alt="`${friend.firstName} ${friend.lastName}`"
                      class="w-full h-full object-cover"
                    />
                    <span v-else>
                      {{ friend.firstName?.charAt(0) }}{{ friend.lastName?.charAt(0) }}
                    </span>
                  </div>
                  <div
                    class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"
                  ></div>
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 dark:text-white">
                    {{ friend.firstName }} {{ friend.lastName }}
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ friend.email }}
                  </p>
                </div>
              
              </div>
            </div>
          </div>

          <div v-if="offlineFriends.length > 0">
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
            >
              <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
              Offline ({{ offlineFriends.length }})
            </h3>
            <div class="grid gap-3">
              <div
                v-for="friend in offlineFriends"
                :key="friend._id"
                class="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer opacity-75"
              >
                <div class="relative">
                  <div
                    class="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold overflow-hidden"
                  >
                    <img
                      v-if="friend.avatar"
                      :src="friend.avatar"
                      :alt="`${friend.firstName} ${friend.lastName}`"
                      class="w-full h-full object-cover"
                    />
                    <span v-else>
                      {{ friend.firstName?.charAt(0) }}{{ friend.lastName?.charAt(0) }}
                    </span>
                  </div>
                  <div
                    class="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 border-2 border-white dark:border-gray-800 rounded-full"
                  ></div>
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 dark:text-white">
                    {{ friend.firstName }} {{ friend.lastName }}
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ friend.email }}
                  </p>
                </div>
               
              </div>
            </div>
          </div>

          <div v-if="friends.length === 0" class="text-center py-12">
            <div
              class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-gray-400"
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
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No friends yet
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Start chatting with people to add them as friends
            </p>
          </div>
        </div>
      </div>
    </main>

    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 p-6"
      >
        <div class="text-center">
          <div
            class="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Delete Account
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete your account? This action cannot be
            undone and all your data will be permanently lost.
          </p>
          <div class="flex gap-3 justify-center">
            <button
              @click="showDeleteConfirm = false"
              class="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              @click="deleteAccount"
              class="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200"
            >
              Delete Account
            </button>
          </div>
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
}

input:focus {
  transform: scale(1.01);
}

button:active {
  transform: scale(0.95);
}
</style>
