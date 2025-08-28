<template>
    <button
    @click="toggleTheme"
    :class="[
      'w-6 h-6 rounded-full transition-all duration-500 ease-out focus:outline-none select-none flex items-center justify-center',
      isDark ? 'bg-accent text-[rgb(var(--accent-text))]' : 'bg-accent text-[rgb(var(--accent-text))]'
    ]"
  >
    <svg 
      class="w-3 h-3 transition-all duration-500 ease-out" 
      :class="isDark ? 'rotate-0' : 'rotate-180'"
      fill="currentColor" 
      viewBox="0 0 20 20"
    >
      <path v-if="!isDark" fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707-.707a1 1 0 011.414 1.414zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />

      <path v-else d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  </button>
</template>
  
  <script setup>
import { useTheme } from '../../shared/composables/useTheme.js';
  
  const { isDark, toggleTheme } = useTheme()
  </script>
  
  <style scoped>
.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

button {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-drag: none;
}
</style>