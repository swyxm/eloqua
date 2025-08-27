<template>
  <div class="min-h-screen p-8 font-sans overflow-auto bg-bg text-primary">
    <div class="max-w-7xl mx-auto space-y-8">
      <header class="text-center mb-8">
        <div class="flex flex-col items-center space-y-4">
          <div class="flex items-center space-x-4">
            <EloquaLogo class="w-20 h-14" />
            <h1 class="text-5xl font-extrabold tracking-tight text-primary">
              Eloqua
            </h1>
          </div>
          <p class="text-lg text-muted">
            Your AI Debate Coach
          </p>
        </div>
        <button 
          @click="goBack"
          class="mt-4 px-6 py-2 rounded-lg transition-colors duration-200 bg-surface text-primary hover:bg-surface-hover"
        >
          ← Back to Form
        </button>
      </header>

      <!-- Session Info Summary -->
      <div class="backdrop-blur-md rounded-lg shadow-lg p-6 border bg-card border-border">
        <h3 class="text-xl font-semibold mb-4 text-primary">
          Session Information
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="font-medium text-muted">
              Motion:
            </span>
            <p class="text-primary">
              {{ sessionInfo.motion }}
            </p>
          </div>
          <div>
            <span class="font-medium text-muted">
              Format:
            </span>
            <p class="text-primary">
              {{ sessionInfo.format }}
            </p>
          </div>
          <div>
            <span class="font-medium text-muted">
              Position:
            </span>
            <p class="text-primary">
              {{ sessionInfo.position }}
            </p>
          </div>
          <div v-if="sessionInfo.tournamentName">
            <span class="font-medium text-muted">
              Tournament:
            </span>
            <p class="text-primary">
              {{ sessionInfo.tournamentName }}
            </p>
          </div>
          <div v-if="sessionInfo.place_in_round">
            <span class="font-medium text-muted">
              Result:
            </span>
            <p class="text-primary">
              {{ sessionInfo.place_in_round }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="analysis-section">
          <div class="backdrop-blur-md rounded-lg shadow-xl p-8 border transform transition-all duration-300 hover:scale-[1.01] bg-card border-border">
            <h2 class="text-2xl text-center font-bold mb-6 text-primary">
              Analysis Results
            </h2>
            
            <div v-if="isLoading" class="flex flex-col items-center justify-center space-y-4 py-20 text-muted">
              <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-accent"></div>
              <p class="text-xl">Loading analysis...</p>
            </div>

            <template v-else-if="analysisData">
              <AnalysisPanel :analysis="analysisData" class="mb-8" />
            </template>

            <div v-else class="text-center py-20 text-muted">
              <p class="text-xl font-medium">No analysis data available</p>
              <p class="text-md mt-2">Please go back and run the analysis again.</p>
            </div>
          </div>
        </div>

        <div class="chat-section">
          <div v-if="analysisData" class="backdrop-blur-md rounded-lg shadow-xl p-8 border transform transition-all duration-300 hover:scale-[1.01] min-h-[400px] flex flex-col bg-card border-border">
            <h2 class="text-2xl text-center font-bold mb-6 text-primary">
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
import { useRouter } from 'vue-router';
import { store } from '../store.js';
import AnalysisPanel from '../components/AnalysisPanel.vue'
import ChatInterface from '../components/ChatInterface.vue'
import EloquaLogo from '../components/EloquaLogo.vue'

const router = useRouter()


const analysisData = ref(null)
const sessionInfo = ref({})
const chatMessages = ref([])
const isLoading = ref(false)

onMounted(() => {
  analysisData.value = store.analysisData;
  sessionInfo.value = store.sessionData;

  if (analysisData.value) {
    chatMessages.value.push({
      role: 'assistant',
      content: 'Hello! I am Eloqua, your AI debate coach. How can I help you with this analysis?'
    });
  }
});

const goBack = () => {
  router.push('/');
};

const handleSendMessage = (message) => {
  chatMessages.value.push({ role: 'user', content: message });
  setTimeout(() => {
    chatMessages.value.push({ 
      role: 'assistant', 
      content: `I've received your message: "${message}". I'm still in training, but I'm learning to provide helpful feedback!`
    });
  }, 1000);
};
</script>