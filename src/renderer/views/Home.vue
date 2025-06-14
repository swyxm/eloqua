<template>
  <div class="min-h-screen bg-creme-light p-8 font-sans overflow-auto">
    <div class="max-w-7xl mx-auto space-y-8">
      <header class="text-center mb-8">
        <h1 class="text-5xl font-extrabold text-blue-gray-dark mb-2 tracking-tight">Eloqua</h1>
        <p class="text-blue-gray-dark/80 text-lg">AI-powered analysis for your debate speeches</p>
      </header>

      <!-- Analyze Speech Panel (Full Width at Top) -->
      <div class="bg-ui-card-bg backdrop-blur-md rounded-xl shadow-xl p-8 border border-blue-gray-light transform transition-all duration-300 hover:scale-[1.01]">
        <h2 class="text-3xl font-bold text-blue-gray-dark mb-6">Analyze Speech</h2>
        <div class="space-y-6">
          <FileUpload
            @file-selected="handleFileSelected"
            @file-removed="handleFileRemoved"
          />
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-blue-gray-dark/80 text-lg font-medium mb-2">Debate Motion <span class="text-red-500">*</span></label>
              <div class="relative">
                <input
                  v-model="motion"
                  type="text"
                  required
                  class="w-full px-5 py-3 border border-blue-gray-light rounded-xl bg-white/60 text-blue-gray-dark focus:ring-4 focus:ring-beige-warm focus:border-transparent transition-all duration-200 placeholder-blue-gray-light italic"
                  placeholder="e.g., This House believes in universal basic income"
                  @focus="showMotionSuggestions = true"
                />
                <div v-if="showMotionSuggestions && recentMotions.length > 0" 
                     class="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-blue-gray-light">
                  <div v-for="motion in recentMotions" 
                       :key="motion"
                       @click="motion = motion; showMotionSuggestions = false"
                       class="px-3 py-2 hover:bg-blue-gray-light/10 cursor-pointer">
                    {{ motion }}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-blue-gray-dark/80 text-lg font-medium mb-2">Debate Format <span class="text-red-500">*</span></label>
              <select
                v-model="format"
                required
                class="w-full px-5 py-3 border border-blue-gray-light rounded-xl bg-white/60 text-blue-gray-dark focus:ring-4 focus:ring-beige-warm focus:border-transparent transition-all duration-200"
              >
                <option value="">Select a format</option>
                <option value="BP">British Parliamentary</option>
                <option value="WSDC">World Schools Debate Championship</option>
              </select>
            </div>

            <div>
              <div class="bg-brown-muted/20 rounded-xl p-4">
                <label class="block text-blue-gray-dark/80 text-lg font-medium mb-3">Round Type <span class="text-red-500">*</span></label>
                <div class="flex flex-col space-y-4">
                  <div class="flex flex-col space-y-2">
                    <label class="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        v-model="roundType"
                        value="practice"
                        class="hidden"
                      >
                      <div 
                        class="w-5 h-5 border-2 border-blue-gray-light rounded-md flex items-center justify-center transition-all duration-200"
                        :class="{
                          'bg-blue-gray-dark border-blue-gray-dark': roundType === 'practice',
                          'bg-white/60': roundType !== 'practice'
                        }"
                      >
                        <div v-if="roundType === 'practice'" class="w-3 h-3 bg-creme-light rounded-sm"></div>
                      </div>
                      <span class="ml-2 text-blue-gray-dark/80 text-lg">Practice</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        v-model="roundType"
                        value="tournament"
                        class="hidden"
                      >
                      <div 
                        class="w-5 h-5 border-2 border-blue-gray-light rounded-md flex items-center justify-center transition-all duration-200"
                        :class="{
                          'bg-blue-gray-dark border-blue-gray-dark': roundType === 'tournament',
                          'bg-white/60': roundType !== 'tournament'
                        }"
                      >
                        <div v-if="roundType === 'tournament'" class="w-3 h-3 bg-creme-light rounded-sm"></div>
                      </div>
                      <span class="ml-2 text-blue-gray-dark/80 text-lg">Tournament</span>
                    </label>
                  </div>

                  <div v-if="roundType === 'tournament'" class="grid grid-cols-2 gap-4">
                    <div class="relative">
                      <input
                        v-model="tournamentName"
                        type="text"
                        class="w-full px-3 py-2 border border-blue-gray-light rounded-lg bg-white/60 text-blue-gray-dark focus:ring-2 focus:ring-beige-warm focus:border-transparent transition-all duration-200 placeholder-blue-gray-light italic text-sm"
                        placeholder="Tournament name"
                        @input="searchTournaments($event.target.value)"
                        @focus="showTournamentSuggestions = true"
                      />
                      <div v-if="showTournamentSuggestions && tournamentSuggestions.length > 0" 
                           class="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-blue-gray-light">
                        <div v-for="tournament in tournamentSuggestions" 
                             :key="tournament.id"
                             @click="tournamentName = tournament.name; showTournamentSuggestions = false"
                             class="px-3 py-2 hover:bg-blue-gray-light/10 cursor-pointer">
                          {{ tournament.name }}
                        </div>
                      </div>
                    </div>
                    <div>
                      <select
                        v-model="roundNumber"
                        class="w-full px-3 py-2 border border-blue-gray-light rounded-lg bg-white/60 text-blue-gray-dark focus:ring-2 focus:ring-beige-warm focus:border-transparent transition-all duration-200 text-sm"
                      >
                        <option value="">Select round</option>
                        <option v-for="n in 8" :key="`round-${n}`" :value="`Round ${n}`">Round {{ n }}</option>
                        <option value="Double Octofinals">Double Octofinals</option>
                        <option value="Octofinals">Octofinals</option>
                        <option value="Quarterfinals">Quarterfinals</option>
                        <option value="Semifinals">Semifinals</option>
                        <option value="Finals">Finals</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="format" class="space-y-6">
            <div>
              <label class="block text-blue-gray-dark/80 text-lg font-medium mb-2">Your Position <span class="text-red-500">*</span></label>
              <select
                v-model="position"
                required
                class="w-full px-5 py-3 border border-blue-gray-light rounded-xl bg-white/60 text-blue-gray-dark focus:ring-4 focus:ring-beige-warm focus:border-transparent transition-all duration-200"
              >
                <option value="">Select your position</option>
                <option v-for="pos in debatePositions" :key="pos" :value="pos">{{ pos }}</option>
              </select>
            </div>

            <div>
              <label class="block text-blue-gray-dark/80 text-lg font-medium mb-2">Place in Round (Optional)</label>
              <div 
                class="grid gap-3"
                :class="{
                  'grid-cols-2 lg:grid-cols-4': format === 'BP',
                  'grid-cols-2 justify-center': format === 'WSDC'
                }"
              >
                <button
                  v-for="place in roundPlacements" 
                  :key="place.value"
                  @click="placeInRound = place.value"
                  :class="{
                    'bg-blue-gray-dark text-creme-light': placeInRound === place.value,
                    'bg-white/60 text-blue-gray-dark hover:bg-blue-gray-light/10': placeInRound !== place.value
                  }"
                  class="px-4 py-2 border border-blue-gray-light rounded-lg transition-all duration-200 text-center font-medium flex items-center justify-center space-x-1"
                >
                  <component :is="place.iconComponent" class="w-5 h-5" />
                  <span>{{ place.label }}</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-blue-gray-dark/80 text-lg font-medium mb-2">Specific Feedback (Optional)</label>
              <textarea
                v-model="specificFeedback"
                class="w-full px-5 py-3 border border-blue-gray-light rounded-xl bg-white/60 text-blue-gray-dark focus:ring-4 focus:ring-beige-warm focus:border-transparent transition-all duration-200 placeholder-blue-gray-light italic min-h-[100px]"
                placeholder="e.g., Focus on my rebuttal structure or clarity of my arguments."
              ></textarea>
            </div>
          </div>

          <button
            @click="handleAnalyze"
            :disabled="!canAnalyze"
            class="w-full bg-blue-gray-dark hover:opacity-90 text-creme-light font-bold py-4 px-6 rounded-2xl text-xl shadow-lg transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">Analyze Speech</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-3 text-creme-light" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          </button>
        </div>
      </div>

      <!-- Analysis Results Panel (Below Form) -->
      <div class="bg-ui-card-bg backdrop-blur-md rounded-xl shadow-xl p-8 border border-blue-gray-light transform transition-all duration-300 hover:scale-[1.01]">
        <h2 class="text-3xl font-bold text-blue-gray-dark mb-6">Analysis Results</h2>
        
        <div v-if="isLoading" class="flex flex-col items-center justify-center space-y-4 py-20 text-blue-gray-dark/70">
          <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-gray-dark"></div>
          <p class="text-xl">Analyzing your speech, please wait...</p>
        </div>

        <template v-else-if="analysis">
          <AnalysisPanel :analysis="analysis" class="mb-8" />
        </template>

        <div v-else class="text-center py-20 text-blue-gray-dark/70">
          <svg class="w-24 h-24 mx-auto mb-6 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
          </svg>
          <p class="text-xl font-medium">Select an audio file and enter the debate motion to begin analysis.</p>
          <p class="text-md mt-2">Get AI-powered insights into your speaking style, prosody, and content.</p>
        </div>
      </div>

      <!-- Chat Interface (Full Width at Bottom) -->
      <div v-if="analysis" class="bg-ui-card-bg backdrop-blur-md rounded-xl shadow-xl p-8 border border-blue-gray-light transform transition-all duration-300 hover:scale-[1.01] min-h-[400px] flex flex-col">
        <h2 class="text-3xl font-bold text-blue-gray-dark mb-6">Debate Coach Chat</h2>
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
import { ref, computed, watch, onMounted } from 'vue';
import FileUpload from '../components/FileUpload.vue';
import AnalysisPanel from '../components/AnalysisPanel.vue';
import ChatInterface from '../components/ChatInterface.vue';
import { ChevronsUp, ChevronUp, ChevronDown, ChevronsDown } from 'lucide-vue-next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default {
  name: 'Home',
  components: {
    FileUpload,
    AnalysisPanel,
    ChatInterface,
    ChevronsUp,
    ChevronUp,
    ChevronDown,
    ChevronsDown
  },
  setup() {
    const selectedFile = ref(null);
    const motion = ref('');
    const format = ref(''); // Initialize as empty for "Select a format" option
    const position = ref('');
    const roundType = ref(''); // New: 'practice' or 'tournament'
    const tournamentName = ref(''); // New: Name of the tournament if roundType is 'tournament'
    const placeInRound = ref('');
    const specificFeedback = ref('');
    const analysis = ref(null);
    const isLoading = ref(false);
    const chatMessages = ref([]);
    const roundNumber = ref('');
    const tournamentSuggestions = ref([]);
    const recentPositions = ref([]);
    const recentMotions = ref([]);
    const showTournamentSuggestions = ref(false);
    const showMotionSuggestions = ref(false);
    const backgroundAnalysis = ref(null);
    const isAnalyzing = ref(false);

    const debatePositions = computed(() => {
      if (format.value === 'BP') {
        return [
          'Prime Minister',
          'Deputy Prime Minister',
          'Leader of the Opposition',
          'Deputy Leader of the Opposition',
          'Government Extension',
          'Government Whip',
          'Opposition Extension',
          'Opposition Whip'
        ];
      } else if (format.value === 'WSDC') {
        return [
          'Proposition - First Speaker',
          'Proposition - Second Speaker',
          'Proposition - Third Speaker',
          'Proposition - Reply',
          'Opposition - First Speaker',
          'Opposition - Second Speaker',
          'Opposition - Third Speaker',
          'Opposition - Reply'
        ];
      } else {
        return [];
      }
    });

    const roundPlacements = computed(() => {
      if (format.value === 'BP') {
        return [
          { label: 'First Place', value: 'First Place', iconComponent: ChevronsUp },
          { label: 'Second Place', value: 'Second Place', iconComponent: ChevronUp },
          { label: 'Third Place', value: 'Third Place', iconComponent: ChevronDown },
          { label: 'Fourth Place', value: 'Fourth Place', iconComponent: ChevronsDown }
        ];
      } else if (format.value === 'WSDC') {
        return [
          { label: 'Won Round', value: 'Won Round', iconComponent: ChevronsUp },
          { label: 'Lost Round', value: 'Lost Round', iconComponent: ChevronsDown }
        ];
      } else {
        return [];
      }
    });

    // Watch for format changes to reset relevant fields
    watch(format, (newFormat) => {
      // Reset position if format changes and previously selected position is invalid for new format
      if (position.value && !debatePositions.value.includes(position.value)) {
        position.value = '';
      }
      // Reset placeInRound if format changes and previously selected placement is invalid for new format
      if (placeInRound.value && !roundPlacements.value.map(p => p.value).includes(placeInRound.value)) {
        placeInRound.value = '';
      }
    });

    // Watch for roundType changes to reset tournamentName if type is 'practice'
    watch(roundType, (newType) => {
      if (newType === 'practice') {
        tournamentName.value = '';
      }
    });

    const canAnalyze = computed(() => {
      const baseRequirements = [
        selectedFile.value,
        motion.value.trim() !== '',
        format.value.trim() !== '',
        position.value.trim() !== '',
        roundType.value.trim() !== '',
      ];

      if (roundType.value === 'tournament') {
        return (
          baseRequirements.every(Boolean) &&
          tournamentName.value.trim() !== '' &&
          roundNumber.value.trim() !== ''
        );
      } else {
        return baseRequirements.every(Boolean);
      }
    });

    // Load recent data when component mounts
    onMounted(async () => {
      await loadRecentData();
    });

    // Search tournaments as user types
    const searchTournaments = async (query) => {
      if (query.length < 2) {
        tournamentSuggestions.value = [];
        showTournamentSuggestions.value = false;
        return;
      }
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(5);
        
      if (!error) {
        tournamentSuggestions.value = data;
        showTournamentSuggestions.value = true;
      }
    };

    // Load recent positions and motions
    const loadRecentData = async () => {
      const { data: speeches } = await supabase
        .from('speeches')
        .select('position, motion')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (speeches) {
        recentPositions.value = [...new Set(speeches.map(s => s.position))];
        recentMotions.value = [...new Set(speeches.map(s => s.motion))];
      }
    };

    // Save speech data after analysis
    const saveSpeechData = async (analysisResult) => {
      const { data, error } = await supabase
        .from('speeches')
        .insert({
          tournament_id: tournamentName.value ? await getOrCreateTournamentId(tournamentName.value) : null,
          round_number: roundNumber.value,
          round_type: roundType.value,
          debate_format: format.value,
          position: position.value,
          motion: motion.value,
          place_in_round: placeInRound.value,
          audio_path: selectedFile.value,
          analysis_result: analysisResult
        });

      if (!error) {
        await loadRecentData(); // Refresh recent data
      }
    };

    // Get or create tournament ID
    const getOrCreateTournamentId = async (tournamentName) => {
      const { data: existing } = await supabase
        .from('tournaments')
        .select('id')
        .eq('name', tournamentName)
        .single();

      if (existing) return existing.id;

      const { data: newTournament } = await supabase
        .from('tournaments')
        .insert({ name: tournamentName })
        .select('id')
        .single();

      return newTournament.id;
    };

    const handleFileSelected = async (file) => {


      console.log('File object received:', file);
      console.log('File properties:', Object.keys(file));
      console.log('File path:', file.path);
      console.log('File name:', file.name);
      
      // Try different possible file properties
      const filePath = file.path || file.webkitRelativePath || file.name;
      console.log('Resolved file path:', filePath);
      
      selectedFile.value = filePath;
      console.log('selectedFile.value after setting:', selectedFile.value);
      // Start background analysis
      isAnalyzing.value = true;
      try {
        backgroundAnalysis.value = await window.electron.ipcRenderer.invoke('analyze-speech', {
          audioPath: file.path,
          motion: motion.value,
          format: format.value,
          position: position.value,
          roundType: roundType.value,
          tournamentName: tournamentName.value,
          placeInRound: placeInRound.value,
          specificFeedback: specificFeedback.value
        });
      } catch (error) {
        console.error('Background analysis error:', error);
        chatMessages.value.push({
          role: 'error',
          content: `Error analyzing speech: ${error.message}`,
          timestamp: new Date()
        });
      } finally {
        isAnalyzing.value = false;
      }
    };

    const handleFileRemoved = () => {
      selectedFile.value = null;
      backgroundAnalysis.value = null;
      isAnalyzing.value = false;
    };

    // Modify handleAnalyze to use background analysis if available
    const handleAnalyze = async () => {
      if (!canAnalyze.value) return;

      isLoading.value = true;
      try {
        let result;
        if (backgroundAnalysis.value) {
          result = backgroundAnalysis.value;
          backgroundAnalysis.value = null;
        } else {
          result = await window.electron.ipcRenderer.invoke('analyze-speech', {
            audioPath: selectedFile.value,
            motion: motion.value,
            format: format.value,
            position: position.value,
            roundType: roundType.value,
            tournamentName: tournamentName.value,
            placeInRound: placeInRound.value,
            specificFeedback: specificFeedback.value
          });
        }
        
        analysis.value = result;
        await saveSpeechData(result);
        chatMessages.value = [];
      } catch (error) {
        console.error('Analysis error:', error);
        chatMessages.value.push({
          role: 'error',
          content: `Error analyzing speech: ${error.message}`,
          timestamp: new Date()
        });
      } finally {
        isLoading.value = false;
      }
    };

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

    return {
      selectedFile,
      motion,
      format,
      position,
      roundType,
      tournamentName,
      placeInRound,
      specificFeedback,
      analysis,
      isLoading,
      chatMessages,
      debatePositions,
      roundPlacements,
      canAnalyze,
      handleAnalyze,
      handleChatMessage,
      roundNumber,
      tournamentSuggestions,
      recentPositions,
      recentMotions,
      showTournamentSuggestions,
      searchTournaments,
      showMotionSuggestions,
      isAnalyzing,
      handleFileSelected,
      handleFileRemoved,
    };
  }
};
</script> 