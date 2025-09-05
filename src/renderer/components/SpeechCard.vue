<template>
  <div
    class="bg-card backdrop-blur-md rounded-lg shadow-lg border border-border p-4 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] group relative overflow-hidden"
    @click="$emit('view', speech)"
  >
    
    <div class="relative z-10">
      <div class="flex items-center justify-end mb-4">
        <div class="flex items-center space-x-2">
          <span class="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
            {{ speech.debate_format }}
          </span>
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
      </div>

      <div class="text-center mb-4">
        <h1 class="text-xs text-secondary line-clamp-2 leading-tight mb-1">Motion</h1>
        <h3 class="text-base font-bold text-primary line-clamp-2 leading-tight px-2">
          {{ speech.motion }}
        </h3>
      </div>

      <div class="mb-4">
        <div class="text-center mb-3">
          <span class="text-xs text-muted tracking-wide font-medium">RhetorIQ™ Score</span>
        </div>
        <div class="flex items-center justify-center mb-3">
          <div class="relative w-16 h-16">
            <!-- Circular Progress Ring -->
            <ProgressRing 
              :score="speech.llm_analysis?.score" 
              :format="speech.debate_format" 
              size="large"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-lg font-bold text-primary">
                {{ speech.llm_analysis?.score || 'N/A' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="String(speech.id || '').startsWith('round_')" class="grid grid-cols-2 gap-3 mb-6">
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-2 bg-surface rounded-lg flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
            </svg>
          </div>
          <div class="text-sm font-bold text-primary">{{ mapPosition(speech.position) || '—' }}</div>
          <div class="text-xs text-muted">Position</div>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-2 bg-surface rounded-lg flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
          </div>
          <div class="text-sm font-bold text-primary">{{ speech.partner || '—' }}</div>
          <div class="text-xs text-muted">Partner</div>
        </div>
      </div>

      <div v-else class="grid grid-cols-4 gap-3 mb-6">
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-2 bg-surface rounded-lg flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
            </svg>
          </div>
          <div class="text-sm font-bold text-primary">{{ mapPosition(speech.position) }}</div>
          <div class="text-xs text-muted">Position</div>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-2 bg-surface rounded-lg flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="text-sm font-bold text-primary">{{ formatDuration(speech.analysis_result?.duration_seconds) }}</div>
          <div class="text-xs text-muted">Duration</div>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-2 bg-surface rounded-lg flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path>
              <path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="text-sm font-bold text-primary">{{ speech.analysis_result?.transcript_stats?.word_count || 'N/A' }}</div>
          <div class="text-xs text-muted">Words</div>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-2 bg-surface rounded-lg flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
          </div>
          <div class="text-sm font-bold text-primary">{{ speech.partner || 'N/A' }}</div>
          <div class="text-xs text-muted">Partner</div>
        </div>
      </div>

      <div class="flex items-center justify-between text-xs text-muted border-t border-border/50 pt-4">
        <span class="truncate font-medium">{{ speech.tournament_name || 'Practice Session' }}</span>
        <div class="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            @click.stop="$emit('view', speech)"
            class="text-accent hover:text-accent/80 font-medium px-2 py-1 rounded-md hover:bg-accent/10 transition-colors"
          >
            View
          </button>
          <button
            @click.stop="$emit('delete', speech.id)"
            class="text-error hover:text-error/80 font-medium px-2 py-1 rounded-md hover:bg-error/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { mapPosition } from '../../shared/utils/positionMapping.js'
import ProgressRing from '../../shared/components/ProgressRing.vue'

const props = defineProps({
  speech: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view', 'delete'])

const formatDuration = (seconds) => {
  if (!seconds) return 'N/A'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (minutes === 0) {
    return `${remainingSeconds}s`
  } else if (remainingSeconds === 0) {
    return `${minutes}m`
  } else {
    return `${minutes}m ${remainingSeconds}s`
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.progress-ring {
  animation: progressAnimation 1.5s ease-out forwards;
}

@keyframes progressAnimation {
  from {
    stroke-dashoffset: 175.93; /* Full circle (2 * π * 28) */
  }
  to {
    stroke-dashoffset: var(--final-offset);
  }
}
</style> 