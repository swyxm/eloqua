<!-- src/components/AppLayout.vue -->
<template>
    <div 
      :class="[
        'min-h-screen transition-colors duration-300',
        isDark 
          ? 'bg-gradient-to-br from-dark-bg to-dark-surface text-dark-text' 
          : 'bg-gradient-to-br from-creme-light to-beige-warm text-gray-900'
      ]"
    >
      <header 
        :class="[
          'sticky top-0 z-50 backdrop-blur-md transition-all duration-300',
          'border-b',
          isDark 
            ? 'bg-dark-card/80 border-dark-border' 
            : 'bg-ui-card-bg/80 border-brown-muted/20'
        ]"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 
                :class="[
                  'text-xl font-semibold',
                  isDark ? 'text-dark-text' : 'text-blue-gray-dark'
                ]"
              >
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

      <main 
        :class="[
          'flex-1 transition-all duration-300',
          'px-4 sm:px-6 lg:px-8 py-8'
        ]"
      >
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>

      <footer 
        v-if="$slots.footer"
        :class="[
          'border-t transition-colors duration-300',
          isDark 
            ? 'bg-dark-card border-dark-border text-dark-text-muted' 
            : 'bg-ui-card-bg border-brown-muted/20 text-blue-gray-light'
        ]"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <slot name="footer" />
        </div>
      </footer>
    </div>
  </template>
  
  <script setup>
import { useTheme } from '../../shared/composables/useTheme.js';
import ThemeToggle from './ThemeToggle.vue'
  
  const { isDark } = useTheme()
  </script>