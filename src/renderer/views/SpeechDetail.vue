<template>
  <div class="min-h-screen p-8 font-sans overflow-auto bg-bg text-primary">
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Back Button -->
      <div class="flex items-center space-x-4">
        <router-link
          to="/dashboard"
          class="inline-flex items-center px-4 py-2 bg-surface hover:bg-surface-hover text-primary rounded-lg transition-all duration-200 border border-border"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Dashboard
        </router-link>
      </div>

      <div v-if="isLoading" class="text-center py-16">
        <div class="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-lg flex items-center justify-center">
          <svg class="w-8 h-8 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
        <h3 class="text-xl font-medium text-primary mb-2">Loading speech details...</h3>
      </div>

      <div v-else-if="!speech" class="text-center py-16">
        <div class="w-16 h-16 mx-auto mb-6 bg-error/10 rounded-lg flex items-center justify-center">
          <svg class="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-medium text-primary mb-2">Speech not found</h3>
        <p class="text-muted mb-6">The speech you're looking for doesn't exist or has been removed.</p>
        <router-link
          to="/dashboard"
          class="inline-flex items-center px-6 py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-all duration-200"
        >
          Return to Dashboard
        </router-link>
      </div>

      <div v-else class="space-y-8">
        <div class="bg-card backdrop-blur-md rounded-xl shadow-lg p-6 border border-border">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 class="text-4xl font-semibold text-primary mb-3">{{ speech.motion }}</h1>
              <div class="flex flex-wrap items-center gap-3 text-sm text-muted">
                <span class="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">{{ speech.debate_format }}</span>
                <span class="px-3 py-1 bg-surface text-secondary rounded-full">{{ speech.position }}</span>
                <span v-if="speech.tournament_name" class="px-3 py-1 bg-info/10 text-info rounded-full">{{ speech.tournament_name }}</span>
                <span v-if="speech.place_in_round" class="px-3 py-1 bg-success/10 text-success rounded-full">{{ speech.place_in_round }}</span>
                <span class="text-muted">{{ formatDate(speech.created_at) }}</span>
              </div>
            </div>
            
            <div class="flex items-center space-x-3">
              <button
                @click="deleteSpeech"
                class="px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-all duration-200 border border-error/20"
              >
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-card backdrop-blur-md rounded-xl shadow-lg p-6 border border-border">
              <h2 class="text-2xl font-semibold text-primary mb-4">Analysis Results</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-accent/10 p-6 rounded-xl border border-accent/20">
                  <div class="text-sm text-accent font-medium mb-2">Overall Score</div>
                  <div class="text-4xl font-black text-accent">{{ speech.llm_analysis?.score || 'N/A' }}</div>
                  <div class="text-sm text-accent/70 mt-1">out of {{ speech.debate_format === 'BP' ? '85' : '75' }}</div>
                </div>
                
                <div class="space-y-4">
                  <div class="bg-surface p-4 rounded-lg">
                    <div class="text-sm text-muted mb-1">Duration</div>
                    <div class="text-xl font-semibold text-primary">{{ speech.analysis_result?.duration_seconds || 'N/A' }}s</div>
                  </div>
                  <div class="bg-surface p-4 rounded-lg">
                    <div class="text-sm text-muted mb-1">Word Count</div>
                    <div class="text-xl font-semibold text-primary">{{ speech.analysis_result?.transcript_stats?.word_count || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <div v-if="speech.llm_analysis?.feedback" class="mt-6">
                <h3 class="text-lg font-semibold text-primary mb-3">AI Feedback</h3>
                
                <div v-if="parsedFeedback.introThoughts" class="mb-4">
                  <div class="bg-surface p-4 rounded-lg">
                    <div class="text-primary leading-relaxed markdown-content" v-html="renderMarkdown(parsedFeedback.introThoughts)"></div>
                  </div>
                </div>
                
                <div v-if="parsedFeedback.contentAnalysis" class="mb-4">
                  <details class="group">
                    <summary class="flex items-center justify-between cursor-pointer p-4 bg-surface hover:bg-surface-hover rounded-lg border border-border/30 transition-colors">
                      <span class="font-semibold text-primary">Content Analysis</span>
                      <svg class="w-5 h-5 text-muted group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </summary>
                    <div class="p-4 bg-surface/50 rounded-b-lg border-t border-border/20">
                      <div class="text-primary leading-relaxed markdown-content" v-html="renderMarkdown(parsedFeedback.contentAnalysis)"></div>
                    </div>
                  </details>
                </div>
                
                <div v-if="parsedFeedback.deliveryFeedback" class="mb-4">
                  <details class="group">
                    <summary class="flex items-center justify-between cursor-pointer p-4 bg-surface hover:bg-surface-hover rounded-lg border border-border/30 transition-colors">
                      <span class="font-semibold text-primary">Delivery Feedback</span>
                      <svg class="w-5 h-5 text-muted group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </summary>
                    <div class="p-4 bg-surface/50 rounded-b-lg border-t border-border/20">
                      <div class="text-primary leading-relaxed markdown-content" v-html="renderMarkdown(parsedFeedback.deliveryFeedback)"></div>
                    </div>
                  </details>
                </div>
                
                <div v-if="parsedFeedback.roleSpecificAdvice" class="mb-4">
                  <details class="group">
                    <summary class="flex items-center justify-between cursor-pointer p-4 bg-surface hover:bg-surface-hover rounded-lg border border-border/30 transition-colors">
                      <span class="font-semibold text-primary">Role-Specific Advice</span>
                      <svg class="w-5 h-5 text-muted group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </summary>
                    <div class="p-4 bg-surface/50 rounded-b-lg border-t border-border/20">
                      <div class="text-primary leading-relaxed markdown-content" v-html="renderMarkdown(parsedFeedback.roleSpecificAdvice)"></div>
                    </div>
                  </details>
                </div>
              </div>
            </div>

            <div class="bg-card backdrop-blur-md rounded-xl shadow-lg p-6 border border-border">
              <h2 class="text-2xl font-semibold text-primary mb-4">Transcript</h2>
              <div class="bg-surface p-6 rounded-lg max-h-96 overflow-y-auto">
                <div class="text-primary whitespace-pre-wrap leading-relaxed">{{ speech.analysis_result?.transcript || 'No transcript available' }}</div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-card backdrop-blur-md rounded-xl shadow-lg p-6 border border-border">
              <h3 class="text-lg font-semibold text-primary mb-4">Speech Details</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted">Format:</span>
                  <span class="font-medium">{{ speech.debate_format }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Position:</span>
                  <span class="font-medium">{{ speech.position }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Round Type:</span>
                  <span class="font-medium">{{ speech.round_type }}</span>
                </div>
                <div v-if="speech.round_number" class="flex justify-between">
                  <span class="text-muted">Round Number:</span>
                  <span class="font-medium">{{ speech.round_number }}</span>
                </div>
                <div v-if="speech.place_in_round" class="flex justify-between">
                  <span class="text-muted">Place in Round:</span>
                  <span class="font-medium text-success">{{ speech.place_in_round }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Date:</span>
                  <span class="font-medium">{{ formatDate(speech.speech_date) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Created:</span>
                  <span class="font-medium">{{ formatDate(speech.created_at) }}</span>
                </div>
              </div>
            </div>

            <div v-if="speech.prosody_stats" class="bg-card backdrop-blur-md rounded-xl shadow-lg p-6 border border-border">
              <h3 class="text-lg font-semibold text-primary mb-4">Speech Metrics</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted">Pitch Variation:</span>
                  <span class="font-medium">{{ speech.prosody_stats.pitch || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Volume:</span>
                  <span class="font-medium">{{ speech.prosody_stats.volume || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Jitter:</span>
                  <span class="font-medium">{{ speech.prosody_stats.jitter || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Pace:</span>
                  <span class="font-medium">{{ speech.prosody_stats.pace || 'N/A' }}</span>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createClient } from '@supabase/supabase-js'

const route = useRoute()
const router = useRouter()
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const speech = ref(null)
const isLoading = ref(true)
const parsedFeedback = ref({
  introThoughts: '',
  contentAnalysis: '',
  deliveryFeedback: '',
  roleSpecificAdvice: ''
})

const loadSpeech = async () => {
  try {
    isLoading.value = true
    const speechId = route.params.id
    
    const { data, error } = await supabase
      .from('speeches')
      .select(`
        *,
        tournaments(name)
      `)
      .eq('id', speechId)
      .single()

    if (error) throw error

    speech.value = {
      ...data,
      tournament_name: data.tournaments?.name || 'Practice Session'
    }
    if (data.llm_analysis?.feedback) {
      parsedFeedback.value = parseFeedback(data.llm_analysis.feedback)
    }
  } catch (error) {
    console.error('Error loading speech:', error)
    speech.value = null
  } finally {
    isLoading.value = false
  }
}

const deleteSpeech = async () => {
  if (!confirm('Are you sure you want to delete this speech? This action cannot be undone.')) {
    return
  }

  try {
    const { error } = await supabase
      .from('speeches')
      .delete()
      .eq('id', speech.value.id)

    if (error) throw error

    router.push('/dashboard')
  } catch (error) {
    console.error('Error deleting speech:', error)
    alert('Failed to delete speech. Please try again.')
  }
}
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
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
    } else if (line.startsWith('### Content Analysis:')) {
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim()
      }
      currentSection = 'contentAnalysis'
      currentContent = []
    } else if (line.startsWith('### Delivery Feedback:')) {
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim()
      }
      currentSection = 'deliveryFeedback'
      currentContent = []
    } else if (line.startsWith('### Role-Specific Advice')) {
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

onMounted(() => {
  loadSpeech()
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
