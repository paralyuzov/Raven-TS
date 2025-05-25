import { ref } from 'vue';

const isNavigationVisible = ref(true);

export function useNavigation() {
  const hideNavigation = () => {
    isNavigationVisible.value = false;
  };

  const showNavigation = () => {
    isNavigationVisible.value = true;
  };

  const toggleNavigation = () => {
    isNavigationVisible.value = !isNavigationVisible.value;
  };

  return {
    isNavigationVisible,
    hideNavigation,
    showNavigation,
    toggleNavigation
  };
}
