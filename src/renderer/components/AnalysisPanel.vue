<template>
  <div 
    :class="[
      'analysis-panel rounded-xl p-6 backdrop-blur-sm transition-all duration-300',
      'border shadow-lg',
      'bg-card border-default text-primary'
    ]"
  >
    <div class="space-y-6">
      <div class="bg-surface-hover p-4 rounded-lg">
        <h3 class="text-lg font-semibold text-accent mb-2">Score:</h3>
        <p class="text-3xl font-bold text-accent">{{ analysis?.score || 'N/A' }}</p>
      </div>

      <div>
        <h3 class="text-lg font-semibold text-primary mb-2">Speech Statistics</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="stat-card">
            <span class="text-secondary">Duration: </span>
            <span class="text-xl font-semibold">{{ analysis?.duration_seconds || 'N/A' }}s</span>
          </div>
          <div class="stat-card">
            <span class="text-secondary">Word Count: </span>
            <span class="text-xl font-semibold">{{ analysis?.transcript_stats?.word_count || 'N/A' }}</span>
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
const props = defineProps({
  analysis: {
    type: Object,
    required: true
  }
})
</script>