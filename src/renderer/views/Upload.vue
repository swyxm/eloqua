<template>
  <div class="min-h-screen bg-creme-light p-8 font-sans overflow-auto">
    <div class="max-w-7xl mx-auto space-y-8">
      <header class="text-center mb-8">
        <h1 class="text-5xl font-extrabold text-blue-gray-dark mb-2 tracking-tight">Eloqua</h1>
        <p class="text-blue-gray-dark/80 text-lg">Your AI Debate Coach</p>
      </header>

      <div class="bg-ui-card-bg backdrop-blur-md rounded-xl shadow-xl p-8 border border-blue-gray-light transform transition-all duration-300 hover:scale-[1.01]">
        <h2 class="text-2xl text-center font-bold text-blue-gray-dark mb-6">Upload Speech</h2>
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
                  @click="rank = place.value"
                  :class="{
                    'bg-blue-gray-dark text-creme-light': rank === place.value,
                    'bg-white/60 text-blue-gray-dark hover:bg-blue-gray-light/10': rank !== place.value
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
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import FileUpload from '../components/FileUpload.vue';
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
    ChevronsUp,
    ChevronUp,
    ChevronDown,
    ChevronsDown
  },
  setup() {
    const router = useRouter();
    
    const selectedFile = ref(null);
    const motion = ref('');
    const format = ref(''); 
    const position = ref('');
    const roundType = ref(''); 
    const tournamentName = ref('');
    const rank = ref('');
    const specificFeedback = ref('');
    const isLoading = ref(false);
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

    // reset check
    watch(format, (newFormat) => {
      if (position.value && !debatePositions.value.includes(position.value)) {
        position.value = '';
      }
      if (rank.value && !roundPlacements.value.map(p => p.value).includes(rank.value)) {
        rank.value = '';
      }
    });

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
          tournament_id: tournamentName.value ? await fetchTournamentID(tournamentName.value) : null,
          round_number: roundNumber.value,
          round_type: roundType.value,
          debate_format: format.value,
          position: position.value,
          motion: motion.value,
          rank: rank.value,
          audio_path: selectedFile.value,
          analysis_result: analysisResult
        });

      if (!error) {
        await loadRecentData();
      }
    };

    const fetchTournamentID = async (tournamentName) => {
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

      const filePath = file.path || file.webkitRelativePath || file.name;
      selectedFile.value = filePath;
      
      // Background transcription
      isAnalyzing.value = true;
      try {
        backgroundAnalysis.value = await window.electron.ipcRenderer.invoke('transcribe', {
          audioPath: file.path
        });
      } catch (error) {
        console.error('Background transcription error:', error);
      } finally {
        isAnalyzing.value = false;
      }
    };

    const handleFileRemoved = () => {
      selectedFile.value = null;
      backgroundAnalysis.value = null;
      isAnalyzing.value = false;
    };

    const handleAnalyze = async () => {
      if (!canAnalyze.value) return;

      isLoading.value = true;
      try {
        let result;
        // check for pre-existing transcript
        if (backgroundAnalysis.value && backgroundAnalysis.value.transcript) {
          result = await window.electron.ipcRenderer.invoke('analyze-speech-with-transcript', {
            audioPath: selectedFile.value,
            motion: motion.value,
            format: format.value,
            position: position.value,
            roundType: roundType.value,
            tournamentName: tournamentName.value,
            rank: rank.value,
            specificFeedback: specificFeedback.value,
            preTranscript: backgroundAnalysis.value.transcript,
            preDuration: backgroundAnalysis.value.duration_seconds
          });
        } else {
          result = await window.electron.ipcRenderer.invoke('analyze-speech', {
            audioPath: selectedFile.value,
            motion: motion.value,
            format: format.value,
            position: position.value,
            roundType: roundType.value,
            tournamentName: tournamentName.value,
            rank: rank.value,
            specificFeedback: specificFeedback.value
          });
        }
        
        await saveSpeechData(result);
        
        // navigate to analysis page
        router.push({
          name: 'CoachInterface',
          params: {
            analysisData: JSON.stringify(result),
            sessionData: JSON.stringify({
              motion: motion.value,
              format: format.value,
              position: position.value,
              roundType: roundType.value,
              tournamentName: tournamentName.value,
              rank: rank.value,
              specificFeedback: specificFeedback.value
            })
          }
        });
        
      } catch (error) {
        console.error('Analysis error:', error);
        // Handle error appropriately
      } finally {
        isLoading.value = false;
      }
    };

    return {
      selectedFile,
      motion,
      format,
      position,
      roundType,
      tournamentName,
      rank,
      specificFeedback,
      isLoading,
      debatePositions,
      roundPlacements,
      canAnalyze,
      handleAnalyze,
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