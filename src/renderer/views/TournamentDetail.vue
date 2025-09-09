<template>
  <div class="min-h-screen p-8 font-sans overflow-auto bg-bg text-primary">
    <div class="max-w-6xl mx-auto space-y-8">
      <div class="flex items-center space-x-4">
        <router-link
          to="/speeches"
          class="inline-flex items-center px-4 py-2 bg-surface hover:bg-surface-hover text-primary rounded-lg transition-all duration-200 border border-border"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Speeches
        </router-link>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div class="relative">
          <div class="w-10 h-10 border-4 border-surface-hover rounded-full"></div>
          <div class="absolute top-0 left-0 w-10 h-10 border-4 border-transparent border-t-accent rounded-full animate-spin"></div>
        </div>
      </div>

      <div v-else-if="!tournament" class="text-center py-16">
        <div class="text-6xl mb-4">🏆</div>
        <h2 class="text-2xl font-semibold text-primary mb-2">Tournament Not Found</h2>
        <p class="text-muted">This tournament doesn't exist or has been removed.</p>
      </div>

      <div v-else>
        <div class="bg-surface border border-border rounded-lg p-8 mb-8">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h1 class="text-3xl font-bold text-primary mb-2">{{ tournament.name }}</h1>
              <div class="flex items-center space-x-6 text-muted">
                <span class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(tournament.start_date) }}
                </span>
                <span v-if="tournament.tabbycat_url" class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <a :href="tournament.tabbycat_url" target="_blank" class="text-accent hover:underline">
                    View on Tabbycat
                  </a>
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-4xl font-bold text-accent">{{ tournamentStats.totalRounds }}</div>
              <div class="text-muted">Total Rounds</div>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="bg-accent/10 rounded-lg p-4">
              <div class="text-sm text-muted mb-1">Total Points</div>
              <div class="text-2xl font-bold text-primary">{{ tournamentStats.totalPoints }}</div>
            </div>
            <div class="bg-accent/10 rounded-lg p-4">
              <div class="text-sm text-muted mb-1">Average Score</div>
              <div class="text-2xl font-bold text-primary">{{ tournamentStats.averageScore.toFixed(1) }}</div>
            </div>
            <div class="bg-accent/10 rounded-lg p-4">
              <div class="text-sm text-muted mb-1">First Places</div>
              <div class="text-2xl font-bold text-green-500">{{ tournamentStats.firstPlaces }}</div>
            </div>
            <div class="bg-accent/10 rounded-lg p-4">
              <div class="text-sm text-muted mb-1">Second Places</div>
              <div class="text-2xl font-bold text-blue-500">{{ tournamentStats.secondPlaces }}</div>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-2xl font-semibold text-primary mb-6">Rounds</h2>
          <div v-if="rounds.length === 0" class="text-center py-12 bg-surface border border-border rounded-lg">
            <div class="text-4xl mb-4">🎯</div>
            <h3 class="text-lg font-semibold text-primary mb-2">No Rounds Found</h3>
            <p class="text-muted">This tournament doesn't have any recorded rounds yet.</p>
          </div>

          <div v-else class="grid gap-4">
            <div
              v-for="round in rounds"
              :key="round.id"
              @click="navigateToSpeech(round.id)"
              class="bg-surface border border-border rounded-lg p-4 hover:bg-surface-hover transition-all duration-200 cursor-pointer group"
            >
              <div class="flex items-center justify-between">
                <div class="flex flex-col items-start space-x-4">
                  <div class="bg-accent/20 text-accent px-2 py-2 mb-2 rounded-md text-xs">
                    Round {{ round.round_number }}
                  </div>
                  <div>
                    <h3 class="font-semibold text-primary group-hover:text-accent transition-colors">
                      {{ round.motion || 'No motion recorded' }}
                    </h3>
                    <div class="flex items-center space-x-4 text-sm text-muted mt-1">
                      <span v-if="round.position">{{ mapPosition(round.position) }}</span>
                      <span v-if="round.partner">Partner: {{ round.partner }}</span>
                      <span>{{ formatDate(round.speech_date) }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div v-if="round.llm_analysis?.score" class="text-right">
                    <div class="text-lg font-semibold text-primary">{{ round.llm_analysis.score }}</div>
                    <div class="text-xs text-muted">Score</div>
                  </div>
                  <div v-if="round.place_in_round" class="text-right">
                    <div class="text-lg font-semibold text-accent">{{ round.place_in_round }}</div>
                    <div class="text-xs text-muted">Place</div>
                  </div>
                  <svg class="w-5 h-5 text-muted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSupabaseClient } from '../lib/supabaseClient.js'
import { mapPosition } from '../../shared/utils/positionMapping.js'

const route = useRoute()
const router = useRouter()

const supabase = ref(null)
const isLoading = ref(true)
const tournament = ref(null)
const rounds = ref([])

const tournamentStats = computed(() => {
  if (!rounds.value.length) {
    return {
      totalRounds: 0,
      totalPoints: 0,
      averageScore: 0,
      firstPlaces: 0,
      secondPlaces: 0
    }
  }

  const totalRounds = rounds.value.length

    const totalPoints = rounds.value.reduce((sum, round) => {
    const place = round.place_in_round
    if (place === 1) return sum + 3
    if (place === 2) return sum + 2
    if (place === 3) return sum + 1
    return sum + 0
  }, 0)
    const scores = rounds.value
    .map(round => round.llm_analysis?.score)
    .filter(score => score != null)
  const totalScore = scores.reduce((sum, score) => sum + Number(score), 0)
  const averageScore = scores.length > 0 ? totalScore / scores.length : 0
  
  const firstPlaces = rounds.value.filter(round => round.place_in_round === 1).length
  const secondPlaces = rounds.value.filter(round => round.place_in_round === 2).length

  return {
    totalRounds,
    totalPoints,
    averageScore,
    firstPlaces,
    secondPlaces
  }
})

const loadTournament = async () => {
  try {
    const tournamentId = route.params.id
    
    const { data: tournamentData, error: tournamentError } = await supabase.value
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (tournamentError) throw tournamentError
    tournament.value = tournamentData

    const { data: roundsData, error: roundsError } = await supabase.value
      .from('debate_results')
      .select(`
        id,
        position,
        speaker2_name,
        result,
        speaker1_score,
        team_score,
        debate_rounds!inner(
          id,
          round,
          motion,
          date,
          created_at
        )
      `)
      .eq('tournament_id', tournamentId)

    if (roundsError) throw roundsError

    const mappedRounds = (roundsData || []).map(r => {
      const score = r.speaker1_score || r.team_score
      return {
        id: `round_${r.debate_rounds.id}_${r.id}`,
        round_number: r.debate_rounds?.round || '',
        motion: r.debate_rounds?.motion || '—',
        position: r.position || '',
        partner: r.speaker2_name || '-',
        speech_date: r.debate_rounds?.date || null,
        place_in_round: r.result || null,
        llm_analysis: score ? { score: Number(score) } : {},
        created_at: r.debate_rounds?.created_at || r.debate_rounds?.date || new Date().toISOString()
      }
    })
    
    rounds.value = mappedRounds.sort((a, b) => {
      const roundA = parseInt(a.round_number) || 0
      const roundB = parseInt(b.round_number) || 0
      return roundA - roundB
    })

  } catch (error) {
    console.error('Error loading tournament:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'No date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const navigateToSpeech = (speechId) => {
  router.push(`/speech/${speechId}`)
}

onMounted(async () => {
  supabase.value = await getSupabaseClient()
  loadTournament()
})
</script>
