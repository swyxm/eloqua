<template>
  <div 
    :class="[
      'min-h-screen p-8 font-sans overflow-auto',
      isDark ? 'bg-gray-900' : 'bg-creme-light'
    ]"
  >
    <div class="max-w-7xl mx-auto space-y-8">
      <header class="text-center mb-8">
        <h1 :class="[
          'text-5xl font-extrabold mb-2 tracking-tight',
          isDark ? 'text-white' : 'text-blue-gray-dark'
        ]">
          Eloqua
        </h1>
        <p :class="[
          'text-lg',
          isDark ? 'text-gray-300' : 'text-blue-gray-dark/80'
        ]">
          Your AI Debate Coach
        </p>
        <button 
          @click="goBack"
          :class="[
            'mt-4 px-6 py-2 rounded-lg transition-colors duration-200',
            isDark 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
              : 'bg-blue-gray-dark/10 text-blue-gray-dark hover:bg-blue-gray-dark/20'
          ]"
        >
          ← Back to Form
        </button>
      </header>

      <!-- Session Info Summary -->
      <div :class="[
        'backdrop-blur-md rounded-xl shadow-lg p-6 border',
        isDark 
          ? 'bg-gray-800/80 border-gray-600' 
          : 'bg-ui-card-bg border-blue-gray-light'
      ]">
        <h3 :class="[
          'text-xl font-semibold mb-4',
          isDark ? 'text-white' : 'text-blue-gray-dark'
        ]">
          Session Information
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span :class="[
              'font-medium',
              isDark ? 'text-gray-300' : 'text-blue-gray-dark/80'
            ]">
              Motion:
            </span>
            <p :class="isDark ? 'text-gray-200' : 'text-blue-gray-dark'">
              {{ sessionInfo.motion }}
            </p>
          </div>
          <div>
            <span :class="[
              'font-medium',
              isDark ? 'text-gray-300' : 'text-blue-gray-dark/80'
            ]">
              Format:
            </span>
            <p :class="isDark ? 'text-gray-200' : 'text-blue-gray-dark'">
              {{ sessionInfo.format }}
            </p>
          </div>
          <div>
            <span :class="[
              'font-medium',
              isDark ? 'text-gray-300' : 'text-blue-gray-dark/80'
            ]">
              Position:
            </span>
            <p :class="isDark ? 'text-gray-200' : 'text-blue-gray-dark'">
              {{ sessionInfo.position }}
            </p>
          </div>
          <div v-if="sessionInfo.tournamentName">
            <span :class="[
              'font-medium',
              isDark ? 'text-gray-300' : 'text-blue-gray-dark/80'
            ]">
              Tournament:
            </span>
            <p :class="isDark ? 'text-gray-200' : 'text-blue-gray-dark'">
              {{ sessionInfo.tournamentName }}
            </p>
          </div>
          <div v-if="sessionInfo.rank">
            <span :class="[
              'font-medium',
              isDark ? 'text-gray-300' : 'text-blue-gray-dark/80'
            ]">
              Result:
            </span>
            <p :class="isDark ? 'text-gray-200' : 'text-blue-gray-dark'">
              {{ sessionInfo.rank }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="analysis-section">
          <div :class="[
            'backdrop-blur-md rounded-xl shadow-xl p-8 border transform transition-all duration-300 hover:scale-[1.01]',
            isDark 
              ? 'bg-gray-800/80 border-gray-600' 
              : 'bg-ui-card-bg border-blue-gray-light'
          ]">
            <h2 :class="[
              'text-2xl text-center font-bold mb-6',
              isDark ? 'text-white' : 'text-blue-gray-dark'
            ]">
              Analysis Results
            </h2>
            
            <div v-if="isLoading" :class="[
              'flex flex-col items-center justify-center space-y-4 py-20',
              isDark ? 'text-gray-400' : 'text-blue-gray-dark/70'
            ]">
              <div :class="[
                'animate-spin rounded-full h-12 w-12 border-t-4 border-b-4',
                isDark ? 'border-gray-400' : 'border-blue-gray-dark'
              ]"></div>
              <p class="text-xl">Loading analysis...</p>
            </div>

            <template v-else-if="analysisData">
              <AnalysisPanel :analysis="analysisData" class="mb-8" />
            </template>

            <div v-else :class="[
              'text-center py-20',
              isDark ? 'text-gray-400' : 'text-blue-gray-dark/70'
            ]">
              <p class="text-xl font-medium">No analysis data available</p>
              <p class="text-md mt-2">Please go back and run the analysis again.</p>
            </div>
          </div>
        </div>

        <div class="chat-section">
          <div v-if="analysisData" :class="[
            'backdrop-blur-md rounded-xl shadow-xl p-8 border transform transition-all duration-300 hover:scale-[1.01] min-h-[400px] flex flex-col',
            isDark 
              ? 'bg-gray-800/80 border-gray-600' 
              : 'bg-ui-card-bg border-blue-gray-light'
          ]">
            <h2 :class="[
              'text-2xl text-center font-bold mb-6',
              isDark ? 'text-white' : 'text-blue-gray-dark'
            ]">
              Debate Coach Chat
            </h2>
            <ChatInterface
              :messages="chatMessages"
              @send-message="handleSendMessage"
              class="flex-grow"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AnalysisPanel from '../components/AnalysisPanel.vue'
import ChatInterface from '../components/ChatInterface.vue'
import { useTheme } from '../../shared/composables/useTheme.js';

const { isDark } = useTheme()
const router = useRouter()
const route = useRoute()

const analysisData = ref(null)
const sessionInfo = ref({})
const chatMessages = ref([])
const isLoading = ref(false)

onMounted(async () => {
  if (route.params.analysisData) {
    try {
      analysisData.value = JSON.parse(route.params.analysisData)
    } catch (error) {
      console.error('Failed to parse analysis data:', error)
    }
  }

  if (route.params.sessionData) {
    try {
      sessionInfo.value = JSON.parse(route.params.sessionData)
    } catch (error) {
      console.error('Failed to parse session data:', error)
    }
  }

  if (analysisData.value) {
    chatMessages.value = []
  }
})

const handleSendMessage = async (message) => {
  const newMessage = {
    id: Date.now(),
    role: 'user',
    content: message,
    text: message, 
    isUser: true,
    timestamp: new Date()
  }
  chatMessages.value.push(newMessage)
  
  try {
    if (window.electron?.ipcRenderer) {
      const response = await window.electron.ipcRenderer.invoke('chat', {
        analysis: analysisData.value,
        message
      })
      
      chatMessages.value.push({
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        text: response,
        isUser: false,
        timestamp: new Date()
      })
    } else {
      // fallback for web environment or testing
      chatMessages.value.push({
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I would help you with your debate analysis, but this requires the full Eloqua application.',
        text: 'I would help you with your debate analysis, but this requires the full Eloqua application.',
        isUser: false,
        timestamp: new Date()
      })
    }
  } catch (error) {
    console.error('Chat error:', error)
    chatMessages.value.push({
      id: Date.now() + 1,
      role: 'error',
      content: 'Failed to get response',
      text: 'Failed to get response',
      isUser: false,
      timestamp: new Date()
    })
  }
}

const goBack = () => {
  router.push({ name: 'Home' })
}
</script>

<style scoped>
.coach-interface-container {
  transition: background-color 0.3s ease;
}

.analysis-section,
.chat-section {
  height: fit-content;
}

@media (max-width: 1024px) {
  .grid-cols-1.lg\\:grid-cols-2 {
    gap: 1.5rem;
  }
}
</style>