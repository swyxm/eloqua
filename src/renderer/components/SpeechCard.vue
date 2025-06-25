<template>
  <div
    class="bg-card backdrop-blur-md rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] group relative overflow-hidden"
    @click="$emit('view', speech)"
  >
    <!-- Background gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <!-- Content -->
    <div class="relative z-10">
      <!-- Header with Status and Format -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <div
            :class="[
              'w-3 h-3 rounded-full shadow-sm',
              speech.place_in_round === 'First Place' || speech.place_in_round === 'Won Round'
                ? 'bg-success shadow-success/30'
                : 'bg-warning shadow-warning/30'
            ]"
          ></div>
          <span
            :class="[
              'px-3 py-1 text-xs font-bold rounded-full border',
              speech.place_in_round === 'First Place' || speech.place_in_round === 'Won Round'
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-warning/10 text-warning border-warning/20'
            ]"
          >
            {{ speech.place_in_round || 'Practice' }}
          </span>
        </div>
        <span class="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
          {{ speech.debate_format }}
        </span>
      </div>

      <!-- Motion - Centered and prominent -->
      <div class="text-center mb-6">
        <h3 class="text-base font-bold text-primary line-clamp-2 leading-tight px-2">
          {{ speech.motion }}
        </h3>
      </div>

      <!-- Analysis Score - Prominent Display -->
      <div class="mb-6">
        <div class="text-center mb-3">
          <span class="text-xs text-muted uppercase tracking-wide font-medium">Performance Score</span>
        </div>
        <div class="flex items-center justify-center space-x-3 mb-3">
          <div
            :class="[
              'w-3 h-3 rounded-full shadow-sm',
              getScoreColor(speech.analysis_result?.score)
            ]"
          ></div>
          <span class="text-2xl font-black text-primary">
            {{ speech.analysis_result?.score || 'N/A' }}
          </span>
          <span class="text-sm text-muted">/ 10</span>
        </div>
        
        <!-- Score Progress Bar -->
        <div class="w-full bg-surface rounded-full h-2 shadow-inner">
          <div
            :class="[
              'h-2 rounded-full transition-all duration-500 shadow-sm',
              getScoreBarColor(speech.analysis_result?.score)
            ]"
            :style="{ width: `${getScorePercentage(speech.analysis_result?.score)}%` }"
          ></div>
        </div>
      </div>

      <!-- Key Metrics Grid -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-2 bg-surface rounded-xl flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
            </svg>
          </div>
          <div class="text-sm font-bold text-primary">{{ speech.position.split(' ').pop() }}</div>
          <div class="text-xs text-muted">Position</div>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-2 bg-surface rounded-xl flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="text-sm font-bold text-primary">{{ speech.analysis_result?.duration_seconds || 'N/A' }}s</div>
          <div class="text-xs text-muted">Duration</div>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-2 bg-surface rounded-xl flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path>
              <path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="text-sm font-bold text-primary">{{ speech.analysis_result?.transcript_stats?.word_count || 'N/A' }}</div>
          <div class="text-xs text-muted">Words</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between text-xs text-muted border-t border-border/50 pt-4">
        <span class="truncate font-medium">{{ speech.tournament_name || 'Practice Session' }}</span>
        <div class="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            @click.stop="$emit('view', speech)"
            class="text-accent hover:text-accent/80 font-medium px-2 py-1 rounded-lg hover:bg-accent/10 transition-colors"
          >
            View
          </button>
          <button
            @click.stop="$emit('delete', speech.id)"
            class="text-error hover:text-error/80 font-medium px-2 py-1 rounded-lg hover:bg-error/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  speech: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view', 'delete'])

const getScoreColor = (score) => {
  if (!score) return 'bg-muted shadow-muted/30'
  if (score >= 8) return 'bg-success shadow-success/30'
  if (score >= 6) return 'bg-warning shadow-warning/30'
  return 'bg-error shadow-error/30'
}

const getScoreBarColor = (score) => {
  if (!score) return 'bg-muted'
  if (score >= 8) return 'bg-gradient-to-r from-success to-success/80'
  if (score >= 6) return 'bg-gradient-to-r from-warning to-warning/80'
  return 'bg-gradient-to-r from-error to-error/80'
}

const getScorePercentage = (score) => {
  if (!score) return 0
  return Math.min((score / 10) * 100, 100)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 