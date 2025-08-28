<template>
  <div class="min-h-screen p-8 font-sans overflow-auto bg-bg text-primary">
    <div class="max-w-7xl mx-auto space-y-8">
      <div v-if="showSuccessMessage" class="bg-success/10 border border-success/20 rounded-2xl p-6 mb-6 shadow-lg">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-success rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <h3 class="text-lg font-semibold text-success">Analysis Complete!</h3>
            <p class="text-success/80 mt-1">Your speech has been analyzed and saved to your timeline.</p>
          </div>
          <button
            @click="showSuccessMessage = false"
            class="text-success hover:text-success/80 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="relative">
        <div class="relative bg-card/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-border/50">
          <div class="text-center mb-6">
            <div class="flex flex-col items-center space-y-4 mb-6">
              <div class="flex items-center space-x-3">
                <h1 class="text-4xl font-semibold tracking-tight text-primary">
                  Your Speech Saga
                </h1>
              </div>
            </div>
            <router-link
              to="/"
              class="inline-flex items-center px-6 py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
              </svg>
              Record New Speech
            </router-link>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div class="bg-surface/60 backdrop-blur-sm rounded-lg p-4 border border-border/30">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-muted text-xs font-medium">Total Speeches</p>
                  <p class="text-2xl font-semibold text-primary">{{ stats.total }}</p>
                </div>
                <div class="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
                  <MicVocal class="w-5 h-5 text-primary/70" />
                </div>
              </div>
            </div>

            <div class="bg-surface/60 backdrop-blur-sm rounded-lg p-4 border border-border/30">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-muted text-xs font-medium">Victories</p>
                  <p class="text-2xl font-semibold text-success">{{ stats.victories }}</p>
                </div>
                <div class="w-10 h-10 bg-success/5 rounded-lg flex items-center justify-center">
                  <Trophy class="w-5 h-5 text-success/70" />
                </div>
              </div>
            </div>

            <div class="bg-surface/60 backdrop-blur-sm rounded-lg p-4 border border-border/30">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-muted text-xs font-medium">Average Score</p>
                  <p class="text-2xl font-semibold text-warning">{{ stats.averageScore }}</p>
                </div>
                <div class="w-10 h-10 bg-warning/5 rounded-lg flex items-center justify-center">
                  <Target class="w-5 h-5 text-warning/70" />
                </div>
              </div>
            </div>

            <div class="bg-surface/60 backdrop-blur-sm rounded-lg p-4 border border-border/30">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-muted text-xs font-medium">This Month</p>
                  <p class="text-2xl font-semibold text-accent">{{ stats.thisMonth }}</p>
                </div>
                <div class="w-10 h-10 bg-accent/5 rounded-lg flex items-center justify-center">
                  <Calendar class="w-5 h-5 text-accent/70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center mb-6">
        <div class="flex items-center space-x-1 bg-surface/40 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-border/20">
          <button
            @click="viewMode = 'timeline'"
            class="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium"
            :class="viewMode === 'timeline' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-primary hover:bg-surface/60'"
          >
            <Clock class="w-4 h-4" />
            <span>Timeline</span>
          </button>
          <button
            @click="viewMode = 'calendar'"
            class="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium"
            :class="viewMode === 'calendar' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-primary hover:bg-surface/60'"
          >
            <CalendarDays class="w-4 h-4" />
            <span>Calendar</span>
          </button>
          <button
            @click="viewMode = 'tournaments'"
            class="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium"
            :class="viewMode === 'tournaments' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-primary hover:bg-surface/60'"
          >
            <BarChart3 class="w-4 h-4" />
            <span>Tournaments</span>
          </button>
        </div>
      </div>

      <div class="bg-card backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/10">
        <div class="flex flex-col lg:flex-row gap-3">
          <div class="flex-1">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search speeches, motions, tournaments, positions, or use: >70 score, >5min, >500 words..."
                class="w-full px-4 py-3 pl-10 border border-border rounded-lg bg-surface text-primary placeholder:text-muted/60 focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all duration-200 text-sm"
              />
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <div class="flex gap-3">
            <select
              v-model="filters.format"
              class="px-4 py-3 border border-border rounded-lg bg-surface text-primary focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all duration-200 text-sm"
            >
              <option value="">All Formats</option>
              <option value="BP">British Parliamentary</option>
              <option value="WSDC">World Schools</option>
            </select>

            <select
              v-model="filters.dateRange"
              class="px-4 py-3 border border-border rounded-lg bg-surface text-primary focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all duration-200 text-sm"
            >
              <option value="">All Time</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 3 months</option>
              <option value="year">Last year</option>
            </select>

            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="px-4 py-3 bg-surface hover:bg-surface-hover text-primary rounded-lg border border-border transition-all duration-200 text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div v-if="viewMode === 'timeline'" class="space-y-6">
        <div v-for="(group, date) in groupedSpeeches" :key="date" class="space-y-3">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-surface/40 rounded-lg flex items-center justify-center border border-border/30">
              <div class="text-center">
                <div class="text-base font-semibold text-primary">{{ new Date(date).getDate() }}</div>
                <div class="text-xs text-muted/70 uppercase tracking-wide">{{ new Date(date).toLocaleDateString('en-US', { month: 'short' }) }}</div>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-medium text-primary">{{ new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</h3>
              <p class="text-sm text-muted">{{ group.length }} speech{{ group.length !== 1 ? 'es' : '' }}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <SpeechCard
              v-for="speech in group"
              :key="speech.id"
              :speech="speech"
              @view="viewSpeech"
              @delete="deleteSpeech"
            />
          </div>
        </div>
      </div>

      <div v-if="viewMode === 'calendar'" class="space-y-6">
        <div class="text-center py-12">
          <div class="w-24 h-24 bg-surface rounded-lg flex items-center justify-center mx-auto mb-6 border border-border">
            <svg class="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-primary mb-2">Calendar View</h3>
          <p class="text-muted">Visualize your debate activity across time</p>
          <p class="text-sm text-muted mt-2">Coming soon...</p>
        </div>
      </div>

      <div v-if="viewMode === 'tournaments'" class="space-y-6">
        <div class="text-center py-12">
          <div class="w-24 h-24 bg-surface rounded-lg flex items-center justify-center mx-auto mb-6 border border-border">
            <svg class="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-primary mb-2">Tournament Organization</h3>
          <p class="text-muted">Group and manage speeches by tournament</p>
          <p class="text-sm text-muted mt-2">Coming soon...</p>
        </div>
      </div>

      <div v-if="filteredSpeeches.length === 0" class="text-center py-12">
        <div class="max-w-md mx-auto">
          <div class="w-16 h-16 mx-auto mb-4 bg-primary/5 rounded-lg flex items-center justify-center">
            <svg class="w-8 h-8 text-primary/60" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h3 class="text-xl font-medium text-primary mb-3">No speeches found</h3>
          <p class="text-muted mb-6 text-base">
            {{ searchQuery || filters.format || filters.dateRange 
              ? 'Try adjusting your search or filters to find more speeches.' 
              : 'Start your debate journey by recording your first speech!' 
            }}
          </p>
          <router-link
            to="/"
            class="inline-flex items-center px-6 py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
            </svg>
            Record Your First Speech
          </router-link>
        </div>
      </div>
    </div>

    <div
      v-if="selectedSpeech"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click="selectedSpeech = null"
    >
      <div
        class="bg-card rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-8 border-b border-border">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-3xl font-bold text-primary mb-3">{{ selectedSpeech.motion }}</h2>
              <div class="flex items-center space-x-6 text-sm text-muted">
                <span>{{ formatDate(selectedSpeech.created_at) }}</span>
                <span class="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">{{ selectedSpeech.debate_format }}</span>
                <span>{{ selectedSpeech.position }}</span>
                <span v-if="selectedSpeech.tournament_name" class="px-3 py-1 bg-info/10 text-info rounded-full">{{ selectedSpeech.tournament_name }}</span>
              </div>
            </div>
            <button
              @click="selectedSpeech = null"
              class="p-3 text-muted hover:text-primary hover:bg-surface rounded-xl transition-colors duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 class="text-xl font-bold text-primary mb-6">Analysis Results</h3>
              <div class="space-y-6">
                <div class="bg-accent/10 p-6 rounded-2xl border border-accent/20">
                  <div class="text-sm text-accent font-medium mb-2">Overall Score</div>
                  <div class="text-4xl font-black text-accent">{{ selectedSpeech.llm_analysis?.score || 'N/A' }}</div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-surface p-4 rounded-xl">
                    <div class="text-sm text-muted mb-1">Duration</div>
                    <div class="text-xl font-bold text-primary">{{ selectedSpeech.analysis_result?.duration_seconds || 'N/A' }}s</div>
                  </div>
                  <div class="bg-surface p-4 rounded-xl">
                    <div class="text-sm text-muted mb-1">Word Count</div>
                    <div class="text-xl font-bold text-primary">{{ selectedSpeech.analysis_result?.transcript_stats?.word_count || 'N/A' }}</div>
                  </div>
                </div>
                <div v-if="selectedSpeech.llm_analysis?.feedback" class="bg-surface p-6 rounded-xl">
                  <div class="text-sm text-muted mb-3 font-medium">AI Feedback</div>
                  <div class="text-primary leading-relaxed prose prose-sm max-w-none markdown-content" v-html="renderMarkdown(selectedSpeech.llm_analysis.feedback)"></div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-xl font-bold text-primary mb-6">Transcript</h3>
              <div class="bg-surface p-6 rounded-xl max-h-96 overflow-y-auto">
                <div class="text-primary whitespace-pre-wrap leading-relaxed">{{ selectedSpeech.analysis_result?.transcript || 'No transcript available' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store.js'
import { getSupabaseClient } from '../lib/supabaseClient.js'
import SpeechCard from '../components/SpeechCard.vue'
import EloquaLogo from '../components/EloquaLogo.vue'
import { MicVocal, Trophy, Target, Calendar, Clock, CalendarDays, BarChart3 } from 'lucide-vue-next'

const router = useRouter()
let supabase

const speeches = ref([])
const isLoading = ref(true)
const showSuccessMessage = ref(false)
const viewMode = ref('timeline')
const searchQuery = ref('')
const currentPage = ref(1)

const filters = ref({
  format: '',
  dateRange: ''
})

const sortBy = ref('date-desc')

const stats = ref({
  total: 0,
  victories: 0,
  averageScore: 0,
  thisMonth: 0
})

const filteredSpeeches = computed(() => {
  let filtered = speeches.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    
    filtered = filtered.filter(speech => {
      const basicMatch = 
        speech.motion.toLowerCase().includes(query) ||
        speech.tournament_name?.toLowerCase().includes(query) ||
        speech.position.toLowerCase().includes(query)
      
      if (basicMatch) return true
      
      if (query.includes('>') || query.includes('<') || query.includes('=')) {
        if (query.includes('score') || query.includes('point')) {
          const score = speech.llm_analysis?.score || 0
          if (query.includes('>')) {
            const value = parseFloat(query.match(/>(\d+)/)?.[1])
            return !isNaN(value) && score > value
          }
          if (query.includes('<')) {
            const value = parseFloat(query.match(/<(\d+)/)?.[1])
            return !isNaN(value) && score < value
          }
          if (query.includes('=')) {
            const value = parseFloat(query.match(/=(\d+)/)?.[1])
            return !isNaN(value) && score === value
          }
        }
        
        if (query.includes('min') || query.includes('sec')) {
          const duration = speech.analysis_result?.duration_seconds || 0
          if (query.includes('>')) {
            const value = parseFloat(query.match(/>(\d+)/)?.[1])
            const durationInSeconds = query.includes('min') ? value * 60 : value
            return !isNaN(value) && duration > durationInSeconds
          }
          if (query.includes('<')) {
            const value = parseFloat(query.match(/<(\d+)/)?.[1])
            const durationInSeconds = query.includes('min') ? value * 60 : value
            return !isNaN(value) && duration < durationInSeconds
          }
        }
      }
      
      if (query.includes('words') || query.includes('word')) {
        const wordCount = speech.analysis_result?.transcript_stats?.word_count || 0
        if (query.includes('>')) {
          const value = parseFloat(query.match(/>(\d+)/)?.[1])
          return !isNaN(value) && wordCount > value
        }
        if (query.includes('<')) {
          const value = parseFloat(query.match(/<(\d+)/)?.[1])
          return !isNaN(value) && wordCount < value
        }
      }
      
      return false
    })
  }

  if (filters.value.format) {
    filtered = filtered.filter(speech => speech.debate_format === filters.value.format)
  }

  if (filters.value.dateRange) {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (filters.value.dateRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    filtered = filtered.filter(speech => new Date(speech.created_at) >= cutoffDate)
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'date-asc':
        return new Date(a.created_at) - new Date(b.created_at)
      case 'score-desc':
        return (b.llm_analysis?.score || 0) - (a.llm_analysis?.score || 0)
      case 'score-asc':
        return (a.llm_analysis?.score || 0) - (b.llm_analysis?.score || 0)
      default:
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredSpeeches.value.length / pageSize)
})

const paginatedSpeeches = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredSpeeches.value.slice(start, end)
})

const groupedSpeeches = computed(() => {
  const groups = {}
  
  filteredSpeeches.value.forEach(speech => {
    const date = new Date(speech.created_at).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(speech)
  })
  
  return groups
})

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || filters.value.format !== '' || filters.value.dateRange !== ''
})

const loadSpeeches = async () => {
  try {
    isLoading.value = true
    
    const { data, error } = await supabase
      .from('speeches')
      .select(`
        *,
        tournaments(name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    speeches.value = data.map(speech => ({
      ...speech,
      tournament_name: speech.tournaments?.name || 'Practice Session'
    }))

    calculateStats()
  } catch (error) {
    console.error('Error loading speeches:', error)
  } finally {
    isLoading.value = false
  }
}

const calculateStats = () => {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Calculate average score only from speeches that have scores
  const speechesWithScores = speeches.value.filter(s => {
    const score = s.llm_analysis?.score
    return score !== null && score !== undefined
  })
  const averageScore = speechesWithScores.length > 0 
    ? (speechesWithScores.reduce((sum, s) => sum + s.llm_analysis.score, 0) / speechesWithScores.length).toFixed(1)
    : 'N/A'

  stats.value = {
    total: speeches.value.length,
    victories: speeches.value.filter(s => 
      s.place_in_round === 'First Place' || s.place_in_round === 'Won Round'
    ).length,
    averageScore: averageScore,
    thisMonth: speeches.value.filter(s => new Date(s.created_at) >= thisMonth).length
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    format: '',
    dateRange: ''
  }
  sortBy.value = 'date-desc'
  currentPage.value = 1
}

const viewSpeech = (speech) => {
  router.push(`/speech/${speech.id}`)
}

const deleteSpeech = async (speechId) => {
  if (!confirm('Are you sure you want to delete this speech? This action cannot be undone.')) {
    return
  }

  try {
    const { error } = await supabase
      .from('speeches')
      .delete()
      .eq('id', speechId)

    if (error) throw error

    // Remove from local state
    speeches.value = speeches.value.filter(s => s.id !== speechId)
    
    // Recalculate stats
    calculateStats()
  } catch (error) {
    console.error('Error deleting speech:', error)
    alert('Failed to delete speech. Please try again.')
  }
}



const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const parseFeedback = (feedback) => {
  if (!feedback) return {}
  
  const sections = {
    introThoughts: '',
    contentAnalysis: '',
    deliveryFeedback: '',
    roleSpecificAdvice: ''
  }
  
  const lines = feedback.split('\n')
  let currentSection = 'introThoughts'
  let currentContent = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line.startsWith('# ')) {
      currentSection = 'introThoughts'
      currentContent = []
    } else if (/^##+\s+content analysis:?$/i.test(line)) {
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim()
      }
      currentSection = 'contentAnalysis'
      currentContent = []
    } else if (/^##+\s+delivery feedback:?$/i.test(line)) {
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim()
      }
      currentSection = 'deliveryFeedback'
      currentContent = []
    } else if (/^##+\s+role-?specific advice/i.test(line)) {
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim()
      }
      currentSection = 'roleSpecificAdvice'
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }
  
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim()
  }
  
  return sections
}

// Simple markdown renderer
const renderMarkdown = (text) => {
  if (!text) return ''
  
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-primary mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-primary mb-3 mt-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-semibold text-primary mb-4 mt-6">$1</h1>')
    // Lists
    .replace(/^\d+\.\s+(.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
    .replace(/^-\s+(.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n/g, '<br>')
    // Wrap in paragraphs
    .replace(/^(.+)$/gm, '<p class="mb-3">$1</p>')
    // Clean up empty paragraphs
    .replace(/<p class="mb-3"><\/p>/g, '')
    .replace(/<p class="mb-3"><br><\/p>/g, '')
}

watch([searchQuery, filters, sortBy], () => {
  currentPage.value = 1
})



onMounted(async () => {
  supabase = await getSupabaseClient()
  loadSpeeches()
  
  if (store.analysisData) {
    showSuccessMessage.value = true
    setTimeout(() => {
      store.analysisData = null
      store.sessionData = null
    }, 5000)
  }
})
</script>

<style scoped>
.markdown-content :deep(h1) {
  @apply text-2xl font-semibold text-primary mb-4 mt-6;
}

.markdown-content :deep(h2) {
  @apply text-xl font-semibold text-primary mb-3 mt-4;
}

.markdown-content :deep(h3) {
  @apply text-lg font-semibold text-primary mb-2;
}

.markdown-content :deep(p) {
  @apply mb-3 leading-relaxed;
}

.markdown-content :deep(li) {
  @apply ml-4 mb-1;
}

.markdown-content :deep(strong) {
  @apply font-semibold;
}
</style>

 