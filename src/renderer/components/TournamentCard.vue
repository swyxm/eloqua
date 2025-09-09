<template>
  <div 
    @click="navigateToTournament"
    class="bg-surface border border-border rounded-lg p-6 hover:bg-surface-hover transition-all duration-200 cursor-pointer group"
  >
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <h3 class="text-xl font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
          {{ tournament.name }}
        </h3>
        <div class="flex items-center space-x-4 text-sm text-muted">
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ formatDate(tournament.start_date) }}
          </span>
          <span v-if="tournament.tabbycat_url" class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Tabbycat
          </span>
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold text-accent">{{ stats.totalRounds }}</div>
        <div class="text-sm text-muted">Rounds</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="bg-accent/10 rounded-lg p-3">
        <div class="text-sm text-muted mb-1">Total Points</div>
        <div class="text-lg font-semibold text-primary">{{ stats.totalPoints }}</div>
      </div>
      <div class="bg-accent/10 rounded-lg p-3">
        <div class="text-sm text-muted mb-1">Avg Score</div>
        <div class="text-lg font-semibold text-primary">{{ stats.averageScore.toFixed(1) }}</div>
      </div>
    </div>

    <div class="flex items-center justify-between text-sm">
      <div class="flex items-center space-x-4">
        <span v-if="stats.firstPlaces > 0" class="flex items-center text-green-500">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {{ stats.firstPlaces }} 1st
        </span>
        <span v-if="stats.secondPlaces > 0" class="flex items-center text-blue-500">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {{ stats.secondPlaces }} 2nd
        </span>
      </div>
      <div class="flex items-center text-muted">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        View Details
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  tournament: {
    type: Object,
    required: true
  },
  stats: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const formatDate = (dateString) => {
  if (!dateString) return 'No date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const navigateToTournament = () => {
  router.push(`/tournament/${props.tournament.id}`)
}
</script>
