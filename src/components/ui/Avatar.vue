<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  src?: string;
  alt?: string;
  firstName?: string;
  lastName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showOnlineStatus: false,
  isOnline: false
});

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-32 h-32 text-4xl'
};

const statusSizes = {
  xs: 'w-2 h-2 ring-1 ring-white dark:ring-gray-900',
  sm: 'w-2.5 h-2.5 ring-1 ring-white dark:ring-gray-900',
  md: 'w-3 h-3 ring-1 ring-white dark:ring-gray-800',
  lg: 'w-3.5 h-3.5 ring-0.5 ring-white dark:ring-gray-900',
  xl: 'w-5 h-5 ring-1 ring-white dark:ring-gray-900',
  '2xl': 'w-8 h-8 ring-2 ring-white dark:ring-gray-900'
};

const initials = computed(() => {
  if (!props.firstName) return '?';
  const first = props.firstName.charAt(0) || '';
  const last = props.lastName?.charAt(0) || '';
  return (first + last).toUpperCase();
});

const imageError = ref(false);
const onImageError = () => {
  imageError.value = true;
};

const showImage = computed(() => {
  return props.src && !imageError.value;
});
</script>

<template>
  <div class="relative inline-block">
    <div 
      :class="[
        sizeClasses[size],
        'rounded-full flex items-center justify-center font-semibold shadow-lg ring-2 ring-white dark:ring-gray-900 transition-all duration-200',
        className
      ]"
    >
      <img
        v-if="showImage"
        :src="src"
        :alt="alt || `${firstName} ${lastName}`"
        :class="[
          sizeClasses[size],
          'rounded-full object-cover'
        ]"
        @error="onImageError"
        loading="lazy"
      />
      

      <div
        v-else
        :class="[
          sizeClasses[size],
          'rounded-full bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white font-bold'
        ]"
      >
        {{ initials }}
      </div>
    </div>

    <div
      v-if="showOnlineStatus"
      :class="[
        statusSizes[size],
        'absolute -bottom-0.5 -right-0.5 rounded-full shadow-sm',
        isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
      ]"
    ></div>
  </div>
</template>

<style scoped>
img {
  transition: opacity 0.2s ease-in-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
