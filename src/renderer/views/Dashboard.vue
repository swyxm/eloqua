<template>
  <div class="min-h-screen p-8 font-sans overflow-auto bg-bg text-primary">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Success Message -->
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

      <!-- Header with Stats -->
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl"></div>
        <div class="relative bg-card backdrop-blur-md rounded-3xl shadow-xl p-8 border border-border">
          <div class="text-center mb-8">
            <h1 class="text-6xl font-black mb-4 tracking-tight text-primary">
              Debate Timeline
            </h1>
            <p class="text-xl text-muted mb-6">
              Your journey through competitive debate
            </p>
            <router-link
              to="/"
              class="inline-flex items-center px-8 py-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <div class="w-6 h-6 mr-3 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
                </svg>
              </div>
              Record New Speech
            </router-link>
          </div>

          <!-- Statistics Grid -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="bg-card backdrop-blur-md rounded-2xl p-6 border border-border">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-muted text-sm font-medium">Total Speeches</p>
                  <p class="text-3xl font-black text-primary">{{ stats.total }}</p>
                </div>
                <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-card backdrop-blur-md rounded-2xl p-6 border border-border">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-muted text-sm font-medium">Victories</p>
                  <p class="text-3xl font-black text-success">{{ stats.victories }}</p>
                </div>
                <div class="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-card backdrop-blur-md rounded-2xl p-6 border border-border">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-muted text-sm font-medium">Average Score</p>
                  <p class="text-3xl font-black text-warning">{{ stats.averageScore }}</p>
                </div>
                <div class="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-warning" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-card backdrop-blur-md rounded-2xl p-6 border border-border">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-muted text-sm font-medium">This Month</p>
                  <p class="text-3xl font-black text-accent">{{ stats.thisMonth }}</p>
                </div>
                <div class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- View Toggle -->
      <div class="flex justify-center mb-8">
        <div class="flex items-center space-x-2 bg-surface rounded-xl p-1 shadow-lg">
          <button
            @click="viewMode = 'timeline'"
            class="flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium"
            :class="viewMode === 'timeline' ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-primary hover:bg-surface-hover'"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
            </svg>
            <span>Timeline</span>
          </button>
          <button
            @click="viewMode = 'calendar'"
            class="flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium"
            :class="viewMode === 'calendar' ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-primary hover:bg-surface-hover'"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
            </svg>
            <span>Calendar</span>
          </button>
          <button
            @click="viewMode = 'tournaments'"
            class="flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium"
            :class="viewMode === 'tournaments' ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-primary hover:bg-surface-hover'"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
            </svg>
            <span>Tournaments</span>
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-card backdrop-blur-md rounded-2xl shadow-xl p-6 border border-border">
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search speeches, motions, tournaments, positions, or metadata (e.g., 'first place', '>500 words', 'prime minister')..."
                class="w-full px-6 py-4 pl-12 border border-border rounded-xl bg-surface text-primary focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all duration-300 text-lg"
              />
              <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <div class="flex gap-4">
            <select
              v-model="filters.format"
              class="px-6 py-4 border border-border rounded-xl bg-surface text-primary focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all duration-300"
            >
              <option value="">All Formats</option>
              <option value="BP">British Parliamentary</option>
              <option value="WSDC">World Schools</option>
            </select>

            <select
              v-model="filters.dateRange"
              class="px-6 py-4 border border-border rounded-xl bg-surface text-primary focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all duration-300"
            >
              <option value="">All Time</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 3 months</option>
              <option value="year">Last year</option>
            </select>

            <button
              @click="clearFilters"
              class="px-6 py-4 bg-surface hover:bg-surface-hover text-primary rounded-xl border border-border transition-all duration-300 font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Timeline View -->
      <div v-if="viewMode === 'timeline'" class="space-y-8">
        <div v-for="(group, date) in groupedSpeeches" :key="date" class="space-y-4">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
              <div class="text-center">
                <div class="text-lg font-black text-primary">{{ new Date(date).getDate() }}</div>
                <div class="text-xs text-muted uppercase tracking-wide">{{ new Date(date).toLocaleDateString('en-US', { month: 'short' }) }}</div>
              </div>
            </div>
            <div>
              <h3 class="text-xl font-bold text-primary">{{ new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</h3>
              <p class="text-muted">{{ group.length }} speech{{ group.length !== 1 ? 'es' : '' }}</p>
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

      <!-- Calendar View -->
      <div v-if="viewMode === 'calendar'" class="space-y-6">
        <div class="text-center py-12">
          <div class="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-primary mb-2">Calendar View</h3>
          <p class="text-muted">Visualize your debate activity across time</p>
          <p class="text-sm text-muted mt-2">Coming soon...</p>
        </div>
      </div>

      <!-- Tournaments View -->
      <div v-if="viewMode === 'tournaments'" class="space-y-6">
        <div class="text-center py-12">
          <div class="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-primary mb-2">Tournament Organization</h3>
          <p class="text-muted">Group and manage speeches by tournament</p>
          <p class="text-sm text-muted mt-2">Coming soon...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredSpeeches.length === 0" class="text-center py-16">
        <div class="max-w-md mx-auto">
          <div class="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-3xl flex items-center justify-center">
            <svg class="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-primary mb-4">No speeches found</h3>
          <p class="text-muted mb-8 text-lg">
            {{ searchQuery || filters.format || filters.dateRange 
              ? 'Try adjusting your search or filters to find more speeches.' 
              : 'Start your debate journey by recording your first speech!' 
            }}
          </p>
          <router-link
            to="/"
            class="inline-flex items-center px-8 py-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
            </svg>
            Record Your First Speech
          </router-link>
        </div>
      </div>
    </div>

    <!-- Speech Detail Modal -->
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
            <!-- Analysis Results -->
            <div>
              <h3 class="text-xl font-bold text-primary mb-6">Analysis Results</h3>
              <div class="space-y-6">
                <div class="bg-accent/10 p-6 rounded-2xl border border-accent/20">
                  <div class="text-sm text-accent font-medium mb-2">Overall Score</div>
                  <div class="text-4xl font-black text-accent">{{ selectedSpeech.analysis_result?.score || 'N/A' }}</div>
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

                <div v-if="selectedSpeech.analysis_result?.detailed_feedback" class="bg-surface p-6 rounded-xl">
                  <div class="text-sm text-muted mb-3 font-medium">Detailed Feedback</div>
                  <div class="text-primary whitespace-pre-wrap leading-relaxed">{{ selectedSpeech.analysis_result.detailed_feedback }}</div>
                </div>
              </div>
            </div>

            <!-- Transcript -->
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
import { createClient } from '@supabase/supabase-js'
import SpeechCard from '../components/SpeechCard.vue'

const router = useRouter()
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const speeches = ref([])
const isLoading = ref(true)
const showSuccessMessage = ref(false)
const viewMode = ref('timeline')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 12

const filters = ref({
  format: '',
  dateRange: ''
})

const sortBy = ref('date-desc')

// Stats
const stats = ref({
  total: 0,
  victories: 0,
  averageScore: 0,
  thisMonth: 0
})

// Computed properties
const filteredSpeeches = computed(() => {
  let filtered = speeches.value

  // Search filter with advanced metadata support
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    
    filtered = filtered.filter(speech => {
      // Basic text search
      const basicMatch = 
        speech.motion.toLowerCase().includes(query) ||
        speech.tournament_name?.toLowerCase().includes(query) ||
        speech.position.toLowerCase().includes(query)
      
      if (basicMatch) return true
      
      // Metadata search patterns
      const patterns = [
        // Word count search (e.g., ">500 words", "<300 words", "500+ words")
        /(?:>|<|>=|<=)?(\d+)\s*(?:words?|w)/i,
        // Position search (e.g., "prime minister", "first speaker", "opposition")
        /(prime minister|deputy prime minister|leader of opposition|deputy leader|government|opposition|first speaker|second speaker|third speaker|reply)/i,
        // Placement search (e.g., "first place", "won round", "second place")
        /(first place|second place|third place|fourth place|won round|lost round|practice)/i,
        // Score search (e.g., ">8", "<6", "high score")
        /(?:>|<|>=|<=)?(\d+(?:\.\d+)?)\s*(?:score|points?)/i,
        // Duration search (e.g., ">5 minutes", "<3 min")
        /(?:>|<|>=|<=)?(\d+)\s*(?:minutes?|mins?|seconds?|s)/i
      ]
      
      for (const pattern of patterns) {
        const match = query.match(pattern)
        if (match) {
          const value = parseFloat(match[1])
          const operator = query.match(/(>|<|>=|<=)/)?.[0]
          
          // Word count search
          if (pattern.source.includes('words')) {
            const wordCount = speech.analysis_result?.transcript_stats?.word_count || 0
            if (operator === '>') return wordCount > value
            if (operator === '<') return wordCount < value
            if (operator === '>=') return wordCount >= value
            if (operator === '<=') return wordCount <= value
            return wordCount === value
          }
          
          // Score search
          if (pattern.source.includes('score')) {
            const score = speech.analysis_result?.score || 0
            if (operator === '>') return score > value
            if (operator === '<') return score < value
            if (operator === '>=') return score >= value
            if (operator === '<=') return score <= value
            return score === value
          }
          
          // Duration search
          if (pattern.source.includes('minutes') || pattern.source.includes('seconds')) {
            const duration = speech.analysis_result?.duration_seconds || 0
            const durationInSeconds = pattern.source.includes('minutes') ? value * 60 : value
            if (operator === '>') return duration > durationInSeconds
            if (operator === '<') return duration < durationInSeconds
            if (operator === '>=') return duration >= durationInSeconds
            if (operator === '<=') return duration <= durationInSeconds
            return duration === durationInSeconds
          }
          
          // Position search
          if (pattern.source.includes('prime minister') || pattern.source.includes('speaker') || pattern.source.includes('opposition')) {
            return speech.position.toLowerCase().includes(match[0])
          }
          
          // Placement search
          if (pattern.source.includes('place') || pattern.source.includes('round')) {
            return speech.place_in_round?.toLowerCase().includes(match[0]) || 
                   (speech.place_in_round === null && match[0].includes('practice'))
          }
        }
      }
      
      return false
    })
  }

  // Format filter
  if (filters.value.format) {
    filtered = filtered.filter(speech => speech.debate_format === filters.value.format)
  }

  // Date range filter
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
        return (b.analysis_result?.score || 0) - (a.analysis_result?.score || 0)
      case 'score-asc':
        return (a.analysis_result?.score || 0) - (b.analysis_result?.score || 0)
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

// Methods
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
  const speechesWithScores = speeches.value.filter(s => s.analysis_result?.score !== null && s.analysis_result?.score !== undefined)
  const averageScore = speechesWithScores.length > 0 
    ? (speechesWithScores.reduce((sum, s) => sum + s.analysis_result.score, 0) / speechesWithScores.length).toFixed(1)
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
  // Navigate to speech detail view or show modal
  console.log('Viewing speech:', speech)
  // TODO: Implement speech detail view
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

const scrollTimeline = (direction) => {
  if (!timelineContainer.value) return
  
  const container = timelineContainer.value
  const scrollAmount = 400
  
  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatFullDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Watchers
watch([searchQuery, filters, sortBy], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadSpeeches()
  
  // Show success message if coming from analysis
  if (store.analysisData) {
    showSuccessMessage.value = true
    // Clear the store data after showing message
    setTimeout(() => {
      store.analysisData = null
      store.sessionData = null
    }, 5000)
  }
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style> 