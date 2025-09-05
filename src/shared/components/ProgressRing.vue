<template>
  <svg 
    :class="svgClass" 
    :viewBox="viewBox"
  >
    <ScoreGradients />
    <circle
      :cx="centerX"
      :cy="centerY"
      :r="radius"
      stroke="currentColor"
      :stroke-width="strokeWidth"
      fill="none"
      class="text-surface"
    />
    <circle
      :cx="centerX"
      :cy="centerY"
      :r="radius"
      :stroke-width="strokeWidth"
      fill="none"
      stroke-linecap="round"
      :stroke-dasharray="`${2 * Math.PI * radius}`"
      :stroke-dashoffset="`${2 * Math.PI * radius * (1 - (getScorePercentage(score, format) / 100))}`"
      :stroke="getScoreGradient(score, format)"
      class="progress-ring"
      :style="`--final-offset: ${2 * Math.PI * radius * (1 - (getScorePercentage(score, format) / 100))}px`"
    />
  </svg>
</template>

<script setup>
import { getScoreGradient, getScorePercentage } from '../utils/scoreHelpers.js'
import ScoreGradients from './ScoreGradients.vue'

const props = defineProps({
  score: {
    type: Number,
    required: true
  },
  format: {
    type: String,
    default: 'BP'
  },
  size: {
    type: String,
    default: 'large',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const sizeConfigs = {
  small: {
    svgClass: 'w-8 h-8 transform rotate-270',
    viewBox: '0 0 24 24',
    centerX: 12,
    centerY: 12,
    radius: 10,
    strokeWidth: 2
  },
  medium: {
    svgClass: 'w-12 h-12 transform rotate-270',
    viewBox: '0 0 48 48',
    centerX: 24,
    centerY: 24,
    radius: 20,
    strokeWidth: 3
  },
  large: {
    svgClass: 'w-16 h-16 transform rotate-270',
    viewBox: '0 0 64 64',
    centerX: 32,
    centerY: 32,
    radius: 28,
    strokeWidth: 4
  }
}

const config = sizeConfigs[props.size]
const { svgClass, viewBox, centerX, centerY, radius, strokeWidth } = config
</script>
