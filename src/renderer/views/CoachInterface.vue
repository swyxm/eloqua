<template>
  <div class="min-h-screen bg-creme-light p-8 font-sans overflow-auto">
    <div class="max-w-7xl mx-auto space-y-8">
      <header class="text-center mb-8">
        <h1 class="text-5xl font-extrabold text-blue-gray-dark mb-2 tracking-tight">Eloqua</h1>
        <p class="text-blue-gray-dark/80 text-lg">Your AI Debate Coach</p>
        <button 
          @click="goBack"
          class="mt-4 px-6 py-2 bg-blue-gray-dark/10 text-blue-gray-dark rounded-lg hover:bg-blue-gray-dark/20 transition-colors duration-200"
        >
          ← Back to Form
        </button>
      </header>

      <!-- Session Info Summary -->
      <div class="bg-ui-card-bg backdrop-blur-md rounded-xl shadow-lg p-6 border border-blue-gray-light">
        <h3 class="text-xl font-semibold text-blue-gray-dark mb-4">Session Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="font-medium text-blue-gray-dark/80">Motion:</span>
            <p class="text-blue-gray-dark">{{ sessionInfo.motion }}</p>
          </div>
          <div>
            <span class="font-medium text-blue-gray-dark/80">Format:</span>
            <p class="text-blue-gray-dark">{{ sessionInfo.format }}</p>
          </div>
          <div>
            <span class="font-medium text-blue-gray-dark/80">Position:</span>
            <p class="text-blue-gray-dark">{{ sessionInfo.position }}</p>
          </div>
          <div v-if="sessionInfo.tournamentName">
            <span class="font-medium text-blue-gray-dark/80">Tournament:</span>
            <p class="text-blue-gray-dark">{{ sessionInfo.tournamentName }}</p>
          </div>
          <div v-if="sessionInfo.rank">
            <span class="font-medium text-blue-gray-dark/80">Result:</span>
            <p class="text-blue-gray-dark">{{ sessionInfo.rank }}</p>
          </div>
        </div>
      </div>

      <!-- Analysis Results Panel -->
      <div class="bg-ui-card-bg backdrop-blur-md rounded-xl shadow-xl p-8 border border-blue-gray-light transform transition-all duration-300 hover:scale-[1.01]">
        <h2 class="text-2xl text-center font-bold text-blue-gray-dark mb-6">Analysis Results</h2>
        
        <div v-if="isLoading" class="flex flex-col items-center justify-center space-y-4 py-20 text-blue-gray-dark/70">
          <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-gray-dark"></div>
          <p class="text-xl">Loading analysis...</p>
        </div>

        <template v-else-if="analysis">
          <AnalysisPanel :analysis="analysis" class="mb-8" />
        </template>

        <div v-else class="text-center py-20 text-blue-gray-dark/70">
          <p class="text-xl font-medium">No analysis data available</p>
          <p class="text-md mt-2">Please go back and run the analysis again.</p>
        </div>
      </div>

      <!-- Chat Interface -->
      <div v-if="analysis" class="bg-ui-card-bg backdrop-blur-md rounded-xl shadow-xl p-8 border border-blue-gray-light transform transition-all duration-300 hover:scale-[1.01] min-h-[400px] flex flex-col">
        <h2 class="text-2xl text-center font-bold text-blue-gray-dark mb-6">Debate Coach Chat</h2>
        <ChatInterface
          :messages="chatMessages"
          @send-message="handleChatMessage"
          class="flex-grow"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AnalysisPanel from '../components/AnalysisPanel.vue';
import ChatInterface from '../components/ChatInterface.vue';

export default {
  name: 'CoachInterface',
  components: {
    AnalysisPanel,
    ChatInterface
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    const analysis = ref(null);
    const sessionInfo = ref({});
    const chatMessages = ref([]);
    const isLoading = ref(false);

    onMounted(async () => {
      // Load analysis data from route params
      if (route.params.analysisData) {
        try {
          analysis.value = JSON.parse(route.params.analysisData);
        } catch (error) {
          console.error('Failed to parse analysis data:', error);
        }
      }

      // Load session info from route params
      if (route.params.sessionData) {
        try {
          sessionInfo.value = JSON.parse(route.params.sessionData);
        } catch (error) {
          console.error('Failed to parse session data:', error);
        }
      }

      // Initialize chat if we have analysis
      if (analysis.value) {
        chatMessages.value = [];
      }
    });

    const handleChatMessage = async (message) => {
      const newMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      chatMessages.value.push(newMessage);
      
      try {
        const response = await window.electron.ipcRenderer.invoke('chat', {
          analysis: analysis.value,
          message
        });
        
        chatMessages.value.push({
          role: 'assistant',
          content: response,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Chat error:', error);
        chatMessages.value.push({
          role: 'error',
          content: 'Failed to get response',
          timestamp: new Date()
        });
      }
    };

    const goBack = () => {
      router.push({ name: 'Home' });
    };

    return {
      analysis,
      sessionInfo,
      chatMessages,
      isLoading,
      handleChatMessage,
      goBack
    };
  }
};
</script>