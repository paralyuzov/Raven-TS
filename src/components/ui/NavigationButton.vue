<script lang="ts" setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

defineProps({
  icon: {
    type: Object as () => IconDefinition,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  badgeCount: {
    type: Number,
    default: null
  },
  showBadge: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<template>
  <button @click="$emit('click')"
    class="relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-[64px]"
    :class="isActive ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-700/30 hover:shadow-xl hover:shadow-sky-700/40' : 'text-gray-400 hover:text-blue-600'">
    <div class="relative flex items-center justify-center h-10 w-10 rounded-full transition-transform"
      :class="isActive ? 'scale-110' : 'hover:scale-110'">
      <FontAwesomeIcon :icon="icon" class="text-xl sm:text-2xl" />
      <span v-if="showBadge && badgeCount !== null && badgeCount > 0"
        class="absolute -top-2 -right-2 w-5 h-5 flex justify-center items-center bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/30 animate-pulse">
        {{ badgeCount }}
      </span>
    </div>
    <span class="text-[10px] mt-1 font-medium tracking-wide">{{ label }}</span>
  </button>
</template>