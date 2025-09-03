<template>
  <div 
    :class="[
      'bg-card backdrop-blur-md rounded-xl shadow-lg border border-border p-6 transition-all duration-200 hover:shadow-xl',
      `col-span-${gridSpan}`
    ]"
  >
    <div class="flex items-center space-x-3 mb-4">
      <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10">
        <component :is="iconComponent" :size="18" class="text-accent" />
      </div>
      <h3 class="text-lg font-semibold text-primary">{{ title }}</h3>
    </div>
    
    <div class="space-y-4">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Globe, Users, Trophy, Upload, MessageCircle, Database } from 'lucide-vue-next'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  gridSpan: {
    type: Number,
    default: 4
  },
  icon: {
    type: String,
    default: 'database'
  }
})

const iconComponent = computed(() => {
  switch (props.icon) {
    case 'globe': return Globe
    case 'users': return Users
    case 'trophy': return Trophy
    case 'upload': return Upload
    case 'message-circle': return MessageCircle
    default: return Database
  }
})
</script>

<style scoped>
.col-span-1 { grid-column: span 1; }
.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }
.col-span-4 { grid-column: span 4; }
.col-span-5 { grid-column: span 5; }
.col-span-6 { grid-column: span 6; }
.col-span-7 { grid-column: span 7; }
.col-span-8 { grid-column: span 8; }
.col-span-9 { grid-column: span 9; }
.col-span-10 { grid-column: span 10; }
.col-span-11 { grid-column: span 11; }
.col-span-12 { grid-column: span 12; }
</style>
