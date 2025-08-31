<template>
  <div class="chart-legend">
    <div v-if="type === 'dots'" class="flex flex-wrap justify-center gap-4">
      <div 
        v-for="i in items" 
        :key="i.label"
        class="flex items-center space-x-1 text-xs"
      >
        <div 
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: i.color }"
        ></div>
        <span class="text-muted">{{ i.label }}</span>
      </div>
    </div>

    <div v-else-if="type === 'lineStyles'" class="flex justify-center space-x-6 text-xs text-muted">
      <div class="flex items-center space-x-1">
        <div class="w-4 h-0.5 bg-gray-400"></div>
        <span>Speaker Score</span>
      </div>
      <div class="flex items-center space-x-1">
        <div 
          class="w-4 h-0.5" 
          style="background-image: repeating-linear-gradient(to right, rgb(156 163 175) 0px, rgb(156 163 175) 2px, transparent 2px, transparent 4px);"
        ></div>
        <span>Round Points</span>
      </div>
    </div>
    <div v-else-if="type === 'partnerColors'" class="flex flex-wrap justify-center gap-2 mt-2">
      <div 
        v-for="p in partners" 
        :key="p.name"
        class="flex items-center space-x-1 text-xs"
      >
        <div 
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: p.color }"
        ></div>
        <span class="text-muted">{{ p.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['dots', 'lineStyles', 'partnerColors'].includes(value)
  },
  items: {
    type: Array,
    default: () => []
  },
  partners: {
    type: Array,
    default: () => []
  }
})
</script>
<style scoped>
.chart-legend {
  position: relative;
  z-index: 1;
}
</style>
