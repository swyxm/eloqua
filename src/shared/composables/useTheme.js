import { ref, computed, watch } from 'vue'

const isDarkMode = ref(false)
const initializeTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('eloqua-theme')
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark'
    } else {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
        updateDocumentTheme()
  }
}

const updateDocumentTheme = () => {
  if (typeof window !== 'undefined') {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('eloqua-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('eloqua-theme', 'light')
    }
  }
}

watch(isDarkMode, updateDocumentTheme)

export function useTheme() {
  if (typeof window !== 'undefined' && !document.documentElement.classList.contains('dark') && isDarkMode.value) {
    initializeTheme()
  }
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
  }
  const setTheme = (theme) => {
    isDarkMode.value = theme === 'dark'
  }
  const theme = computed(() => isDarkMode.value ? 'dark' : 'light')

  return {
    isDark: computed(() => isDarkMode.value),
    theme,
    toggleTheme,
    setTheme
  }
}
if (typeof window !== 'undefined') {
  initializeTheme()
}