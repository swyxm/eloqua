<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="transform translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform translate-y-0 opacity-100 sm:translate-x-0"
    leave-to-class="transform translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
  >
    <div
      v-if="show"
      class="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-surface border border-border rounded-lg shadow-lg"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="ml-3 w-0 flex-1">
            <p class="text-sm font-medium text-primary">
              Installing Whisper Model
            </p>
            <p class="mt-1 text-sm text-muted">
              {{ modelName }} ({{ modelSize }})
            </p>
            <div class="mt-3">
              <div class="bg-surface-hover rounded-full h-2">
                <div
                  class="bg-accent h-2 rounded-full transition-all duration-300 ease-out"
                  :style="{ width: `${progress}%` }"
                ></div>
              </div>
              <p class="mt-2 text-xs text-muted text-center">
                {{ progress }}% Complete
              </p>
            </div>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="close"
              class="bg-surface rounded-md inline-flex text-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  modelName: { type: String, default: 'small' },
  progress: { type: Number, default: 0 }
})

const emit = defineEmits(['close'])

const modelSize = computed(() => {
  const sizes = { tiny: '39 MB', base: '74 MB', small: '244 MB', medium: '769 MB', large: '1550 MB' }
  return sizes[props.modelName] || 'Unknown'
})

const close = () => emit('close')
</script>
