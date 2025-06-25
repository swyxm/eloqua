<template>
  <div class="min-h-screen transition-colors duration-200 bg-bg text-primary">
    <AppLayout>
      <template #title>Eloqua</template>
      
      <template #navigation>
        <nav class="flex space-x-6">
          <router-link 
            to="/" 
            :class="[
              'text-sm font-medium transition-colors px-3 py-2 rounded-md',
              $route.path === '/' 
                ? 'bg-accent text-white' 
                : 'text-secondary hover:bg-surface-hover'
            ]"
          >
            Upload
          </router-link>
          <router-link 
            to="/coach" 
            :class="[
              'text-sm font-medium transition-colors px-3 py-2 rounded-md',
              $route.path === '/coach' 
                ? 'bg-accent text-white' 
                : 'text-secondary hover:bg-surface-hover'
            ]"
          >
            Coach
          </router-link>
        </nav>
      </template>

      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </AppLayout>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import AppLayout from './AppLayout.vue';

// The useRoute composable is still needed for navigation link styling.
const route = useRoute();

// All theme initialization and management logic has been moved to 
// `useTheme.js` and `main.js` to ensure it runs before any components mount.
// This component no longer needs to manage theme state.
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>