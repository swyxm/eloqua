<template>
  <div 
    :class="[
      'analysis-panel rounded-xl p-6 backdrop-blur-sm transition-all duration-300',
      'border shadow-lg',
      isDark 
        ? 'bg-dark-card/50 border-dark-border text-dark-text' 
        : 'bg-ui-card-bg/50 border-brown-muted/20 text-gray-900'
    ]"
  >
    <div class="space-y-6">
      <div class="bg-ice-blue-50 p-4 rounded-lg">
        <h3 class="text-lg font-semibold text-ice-blue-700 mb-2">Score:</h3>
        <p class="text-3xl font-bold text-ice-blue-600">{{ analysis.score }}</p>
      </div>

      <div>
        <h3 class="text-lg font-semibold text-slate-800 mb-2">Speech Statistics</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="stat-card">
            <span class="text-slate-600">Duration</span>
            <span class="text-xl font-semibold">{{ analysis.duration_seconds }}s</span>
          </div>
          <div class="stat-card">
            <span class="text-slate-600">Word Count</span>
            <span class="text-xl font-semibold">{{ analysis.transcript_stats.word_count }}</span>
          </div>
        </div>
      </div>

      <div>
        <!-- <h3 class="text-lg font-semibold text-slate-800 mb-2">Transcript</h3> -->
        <!--<p class="text-slate-700 whitespace-pre-wrap">{{ analysis.transcript }}</p>-->
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '../../shared/composables/useTheme.js';
const { isDark } = useTheme()
const props = defineProps({
  analysis: {
    type: Object,
    required: true
  }
})
</script>