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
            to="/dashboard" 
            :class="[
              'text-sm font-medium transition-colors px-3 py-2 rounded-md',
              $route.path === '/dashboard' 
                ? 'bg-accent text-white' 
                : 'text-secondary hover:bg-surface-hover'
            ]"
          >
            Dashboard
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

const route = useRoute();
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