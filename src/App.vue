<!-- src/renderer/App.vue -->
<template>
  <AppLayout>
    <template #title>
      Eloqua
    </template>
    
    <template #navigation>
      <nav class="flex space-x-6">
        <router-link 
          to="/upload" 
          :class="navLinkClass"
        >
          Upload
        </router-link>
        <router-link 
          to="/analysis" 
          :class="navLinkClass"
        >
          Analysis
        </router-link>
        <router-link 
          to="/coach" 
          :class="navLinkClass"
        >
          Coach
        </router-link>
      </nav>
    </template>

    <router-view />
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import AppLayout from './components/AppLayout.vue'
import { useTheme } from './shared/composables/useTheme.js'

const { isDark } = useTheme()

const navLinkClass = computed(() => [
  'text-sm font-medium transition-colors hover:text-opacity-80 px-3 py-2 rounded-md',
  'router-link-active:font-bold',
  isDark.value ? 'text-dark-text hover:bg-dark-surface' : 'text-blue-gray-dark hover:bg-beige-warm/50'
])
</script>