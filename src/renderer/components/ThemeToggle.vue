<template>
  <button
    @click="toggleTheme"
    :class="[
      'relative inline-flex items-center',
      'w-12 h-6 rounded-full transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
      'bg-surface'
    ]"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <span
      :class="[
        'absolute w-5 h-5 rounded-full transition-transform duration-300 ease-in-out',
        'flex items-center justify-center shadow-lg',
        'bg-accent text-white',
        isDark ? 'translate-x-6' : 'translate-x-1'
      ]"
    >
      <svg v-show="!isDark" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
      </svg>
      <svg v-show="isDark" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    </span>
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
  </style>