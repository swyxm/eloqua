<template>
  <div class="min-h-screen font-sans overflow-auto bg-bg text-primary">

      <header class="text-center mb-8">
        <div class="flex flex-col items-center space-y-4">
          <div class="flex items-center space-x-4">
            <EloquaLogo class="w-20 h-14" />
            <h1 class="text-5xl font-extrabold text-primary tracking-tight">Eloqua</h1>
          </div>
          <p class="text-secondary text-lg">Your AI Debate Coach</p>
        </div>
      </header>

      <div class="max-w-5xl mx-auto">
        <div class="bg-card rounded-lg shadow-xl p-8 border border-border">
        <h2 class="text-2xl text-center font-bold text-primary mb-6">Upload Speech</h2>
                  <div class="space-y-6">
          <FileUpload
            @file-selected="handleFileSelected"
            @file-removed="handleFileRemoved"
          />
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="form-label">Debate Motion <span class="text-red-500">*</span></label>
              <div class="relative">
                <input
                  v-model="motion"
                  type="text"
                  required
                  class="form-input h-11"
                  placeholder="e.g., THB in universal basic income"
                  @focus="showMotionSuggestions = false"
                />
                <div v-if="showMotionSuggestions && recentMotions.length > 0" 
                     class="absolute z-10 w-full mt-1 bg-surface rounded-md shadow-lg border border-border">
                  <div v-for="m in recentMotions" 
                       :key="m"
                       @click="motion = m; showMotionSuggestions = false"
                       class="px-3 py-2 hover:bg-surface-hover cursor-pointer">
                    {{ m }}
                  </div>
                </div>
                
              </div>
            </div>

            <div>
              <label class="form-label">Debate Format <span class="text-red-500">*</span></label>
              <select
                v-model="format"
                required
                class="form-input h-11"
              >
                <option value="">Select a format</option>
                <option value="BP">British Parliamentary</option>
                <option value="WSDC">World Schools Debate Championship</option>
              </select>
            </div>

            <div>
              <label class="form-label">Date <span class="text-red-500">*</span></label>
              <div class="relative">
                <input
                  v-model="speechDate"
                  type="date"
                  required
                  class="form-input h-11"
                  :max="new Date().toISOString().split('T')[0]"
                />
              </div>
            </div>

          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div class="lg:col-span-4">
              <div class="bg-surface-hover rounded-lg p-4 h-full">
                <label class="form-label mb-3 text-md">Round Type <span class="text-red-500">*</span></label>
                <div class="flex flex-col space-y-3">
                  <div class="flex flex-col space-y-2">
                    <label class="inline-flex items-center cursor-pointer">
                      <input type="radio" v-model="roundType" value="practice" class="hidden">
                      <div class="w-5 h-5 rounded-full border-2 bg-surface border-border transition-all duration-200 ease-in-out" :class="{ 'border-accent bg-accent': roundType === 'practice' }">
                        <div v-if="roundType === 'practice'" class="w-full h-full rounded-full bg-white transform scale-50 transition-transform duration-200 ease-in-out"></div>
                      </div>
                      <span class="ml-2 text-secondary text-lg">Practice</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer">
                      <input type="radio" v-model="roundType" value="tournament" class="hidden">
                      <div class="w-5 h-5 rounded-full border-2 bg-surface border-border transition-all duration-200 ease-in-out" :class="{ 'border-accent bg-accent': roundType === 'tournament' }">
                        <div v-if="roundType === 'tournament'" class="w-full h-full rounded-full bg-white transform scale-50 transition-transform duration-200 ease-in-out"></div>
                      </div>
                      <span class="ml-2 text-secondary text-lg">Tournament</span>
                    </label>
                  </div>

                  <div v-if="roundType === 'tournament'" class="grid grid-cols-2 gap-4">
                    <div class="relative">
                      <input
                        v-model="tournamentName"
                        type="text"
                        class="form-input py-1.5 text-sm"
                        placeholder="e.g., World Championships 2023"
                        @input="searchTournaments($event.target.value)"
                        @focus="showTournamentSuggestions = true"
                      />
                      <div v-if="showTournamentSuggestions && tournamentSuggestions.length > 0" 
                           class="absolute z-10 w-full mt-1 bg-surface rounded-md shadow-lg border-border">
                        <div v-for="tournament in tournamentSuggestions" 
                             :key="tournament.id"
                             @click="tournamentName = tournament.name; showTournamentSuggestions = false"
                             class="px-3 py-2 hover:bg-surface-hover cursor-pointer">
                          {{ tournament.name }}
                        </div>
                      </div>
                    </div>
                    <div>
                      <select v-model="roundNumber" class="form-input py-1.5 text-sm">
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
            <div class="lg:col-span-8">
              <div class="bg-surface-hover rounded-lg p-4 h-full flex flex-col gap-3">
                <div>
                  <label class="form-label">Your Position <span class="text-red-500">*</span></label>
                  <select v-model="position" required class="form-input h-11">
                    <option value="">Select your position</option>
                    <option v-for="pos in debatePositions" :key="pos" :value="pos">{{ pos }}</option>
                  </select>
                </div>
                <div v-if="roundType === 'tournament'">
                  <label class="form-label">Place in Round (Optional)</label>
                  <div class="grid gap-2" :class="{ 'grid-cols-2 lg:grid-cols-4': format === 'BP', 'grid-cols-2 justify-center': format === 'WSDC' }">
                    <button
                      v-for="place in roundPlacements" 
                      :key="place.value"
                      @click="rank = place.value"
                      class="flex items-center justify-center text-sm gap-2 py-2 rounded-md transition-all duration-200 ease-in-out border-2"
                      :class="rank === place.value ? 'bg-accent border-accent text-white shadow-lg scale-105' : 'bg-surface/60 border-surface-hover text-secondary hover:bg-surface hover:border-accent/40'"
                    >
                      <component :is="components[place.iconComponent]" class="w-4 h-4" />
                      <span>{{ place.label }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div>
              <label class="form-label">Specific Feedback (Optional)</label>
              <textarea
                v-model="specificFeedback"
                class="form-input min-h-[100px]"
                placeholder="e.g., Focus on my rebuttal structure or clarity of my arguments."
              ></textarea>
            </div>
          </div>

          <button @click="handleAnalyze" :disabled="!canAnalyze" class="button-primary w-full text-xl py-4">
            <span v-if="!isLoading">Analyze Speech</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
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

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { store } from '../store.js';
import FileUpload from '../components/FileUpload.vue';
import EloquaLogo from '../components/EloquaLogo.vue';
import { ChevronsUp, ChevronUp, ChevronDown, ChevronsDown } from 'lucide-vue-next';

const components = {
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown
};
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const router = useRouter();

const selectedFile = ref(null);
const motion = ref('');
const format = ref('');
const position = ref('');
const roundType = ref('practice');
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
const speechDate = ref(new Date().toISOString().split('T')[0]);

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
      { label: 'First Place', value: 'First Place', iconComponent: 'ChevronsUp' },
      { label: 'Second Place', value: 'Second Place', iconComponent: 'ChevronUp' },
      { label: 'Third Place', value: 'Third Place', iconComponent: 'ChevronDown' },
      { label: 'Fourth Place', value: 'Fourth Place', iconComponent: 'ChevronsDown' }
    ];
  } else if (format.value === 'WSDC') {
    return [
      { label: 'Won Round', value: 'Won Round', iconComponent: 'ChevronsUp' },
      { label: 'Lost Round', value: 'Lost Round', iconComponent: 'ChevronsDown' }
    ];
  } else {
    return [];
  }
});

watch(format, () => {
  position.value = '';
  rank.value = '';
});

watch(roundType, (newType) => {
  if (newType === 'practice') {
    tournamentName.value = '';
    roundNumber.value = '';
    rank.value = '';
  }
});

const canAnalyze = computed(() => {
  const baseRequirements = 
    selectedFile.value &&
    motion.value.trim() !== '' &&
    format.value.trim() !== '' &&
    position.value.trim() !== '' &&
    roundType.value.trim() !== '' &&
    speechDate.value.trim() !== '';

  if (roundType.value === 'tournament') {
    return baseRequirements && tournamentName.value.trim() !== '' && roundNumber.value.trim() !== '';
  }
  return baseRequirements;
});

onMounted(async () => {
  await loadRecentData();
});



const searchTournaments = async (query) => {
  if (query.length < 2) {
    tournamentSuggestions.value = [];
    return;
  }
  const { data, error } = await supabase
    .from('tournaments')
    .select('id, name')
    .ilike('name', `%${query}%`)
    .limit(5);
  if (!error) {
    tournamentSuggestions.value = data;
  }
};

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

const getTournamentId = async (name) => {
  if (!name) return null;
  let { data: tournament } = await supabase.from('tournaments').select('id').eq('name', name).single();
  if (tournament) return tournament.id;
  const { data: newTournament } = await supabase.from('tournaments').insert({ name }).select('id').single();
  return newTournament.id;
};

const handleFileSelected = (file) => {
  selectedFile.value = file;
};

const handleFileRemoved = () => {
  selectedFile.value = null;
};

// Analyze speech and persist results
const handleAnalyze = async () => {
  if (!canAnalyze.value) return;
  isLoading.value = true;

  try {
    if (!window.electron || !window.electron.ipcRenderer) {
      throw new Error('Electron IPC is not available. This feature only works in the desktop app.');
    }

    const payload = {
      audioPath: selectedFile.value.path,
      motion: motion.value,
      format: format.value,
      position: position.value,
      placeInRound: rank.value || null,
      specificFeedback: specificFeedback.value,
    };

    const analysisResult = await window.electron.ipcRenderer.invoke('analyze-speech', payload);
    const tournamentId = await getTournamentId(tournamentName.value);

    const speechData = {
      tournament_id: tournamentId,
      round_number: roundNumber.value,
      round_type: roundType.value,
      debate_format: format.value,
      position: position.value,
      motion: motion.value,
      audio_path: selectedFile.value.name, 
      analysis_result: {
        transcript: analysisResult.transcript,
        duration_seconds: analysisResult.duration_seconds,
        transcript_stats: analysisResult.transcript_stats,
        prosody_stats: analysisResult.prosody_stats
      },
      llm_analysis: analysisResult.llm_analysis,
      speech_date: speechDate.value,
    };

    if (rank.value) {
      speechData.place_in_round = rank.value;
    }

    const { error } = await supabase.from('speeches').insert(speechData);
    if (error) throw error;

    const sessionData = {
      motion: motion.value,
      format: format.value,
      position: position.value,
      tournamentName: tournamentName.value,
      place_in_round: rank.value,
    };

    store.analysisData = analysisResult;
    store.sessionData = sessionData;

    router.push({ name: 'Dashboard' });

  } catch (error) {
    console.error('Analysis or save error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    // TODO: Show an error message to the user in the UI
  } finally {
    isLoading.value = false;
  }
};
</script>