<template>
    <div class="min-h-screen transition-colors duration-300 bg-bg text-primary">
      <header 
        class="sticky top-0 z-50 backdrop-blur-md transition-all duration-300 border-b bg-card/80 border-border"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-3">
              <EloquaLogo class="w-5 h-4" />
              <h1 class="text-xl font-semibold text-primary">
                <slot name="title">Eloqua</slot>
              </h1>
            </div>
  
            <nav class="flex items-center space-x-4">
              <slot name="navigation" />
              
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      <main class="flex-1 transition-all duration-300 px-4 sm:px-6 lg:px-8 py-8">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>

      <footer 
        v-if="$slots.footer"
        class="border-t transition-colors duration-300 bg-card border-border text-muted"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <slot name="footer" />
        </div>
      </footer>
    </div>
  </template>
  
  <script setup>
import ThemeToggle from './ThemeToggle.vue'
import EloquaLogo from './EloquaLogo.vue'
</script>