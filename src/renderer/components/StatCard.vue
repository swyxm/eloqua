<template>
  <div
    ref="cardRef"
    :class="[
      'stat-card bg-card backdrop-blur-md rounded-xl shadow-lg border border-border p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl',
      gridClass
    ]"
    :draggable="draggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @drop="handleDrop"
    @dragover.prevent
  >
    <div class="mb-4">
      <h3 class="text-xl font-semibold text-primary">{{ title }}</h3>
      <slot name="header-extra"></slot>
    </div>
    
    <div class="h-full">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  gridSpan: {
    type: Number,
    default: 1
  },
  draggable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['dragstart', 'dragend', 'drop'])

const cardRef = ref(null)

const gridClass = computed(() => {
  // Map grid span to Tailwind CSS classes
  const spanMap = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    6: 'col-span-6',
    8: 'col-span-8',
    12: 'col-span-12'
  }
  return spanMap[props.gridSpan] || 'col-span-1'
})

const handleDragStart = (event) => {
  emit('dragstart', { event, cardRef: cardRef.value })
}

const handleDragEnd = (event) => {
  emit('dragend', { event, cardRef: cardRef.value })
}

const handleDrop = (event) => {
  emit('drop', { event, cardRef: cardRef.value })
}
</script>

<style scoped>
.stat-card {
  min-height: 300px;
}

.stat-card[draggable="true"] {
  cursor: grab;
}

.stat-card[draggable="true"]:active {
  cursor: grabbing;
}
</style>
