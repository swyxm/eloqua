import { ref, computed, watch } from 'vue';

// This singleton ref holds the current theme state.
const isDark = ref(false);

/**
 * Initializes the theme based on localStorage or system preference.
 * This function has a side effect: it adds/removes the 'dark' class from the root element.
 * It MUST be called once, at application startup, before the Vue app is mounted.
 */
export const initializeTheme = () => {
  if (typeof window === 'undefined') return;

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  isDark.value = savedTheme ? savedTheme === 'dark' : prefersDark;
  
  document.documentElement.classList.toggle('dark', isDark.value);
};

/**
 * A Vue composable that provides reactive theme state and methods to change it.
 */
export function useTheme() {
  // When the theme is changed programmatically (e.g., by the toggle button),
  // update the DOM class and localStorage.
  watch(isDark, (newVal) => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', newVal);
      localStorage.setItem('theme', newVal ? 'dark' : 'light');
    }
  });

  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  const setTheme = (theme) => {
    isDark.value = theme === 'dark';
  };

  return {
    isDark: computed(() => isDark.value),
    theme: computed(() => (isDark.value ? 'dark' : 'light')),
    toggleTheme,
    setTheme,
  };
}