import { ref, onMounted, watch } from 'vue'

const isDark = ref(false)

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateTheme()
  }

  const setTheme = (dark) => {
    isDark.value = dark
    updateTheme()
  }

  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateTheme()
  }

  const themeSwitcheroo = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        isDark.value = e.matches
        updateTheme()
      }
    })
  }

  onMounted(() => {
    initTheme()
    themeSwitcheroo()
  })

  return {
    isDark,
    toggleTheme,
    setTheme,
    initTheme
  }
}