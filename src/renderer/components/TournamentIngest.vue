<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div>
      <label class="block text-sm font-medium text-primary mb-2">
          Tournament Name *
      </label>
        <div class="relative">
      <input
        v-model="tournamentName"
        type="text"
        placeholder="Enter tournament name"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        @keyup.enter="addTournament"
            @input="onTournamentNameInput"
            @focus="showAutocomplete = true"
            @blur="hideAutocomplete"
          />
          <div 
            v-if="showAutocomplete && autocompleteOptions.length > 0"
            class="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            <div
              v-for="(tournament, index) in autocompleteOptions"
              :key="tournament.id"
              @mousedown="selectTournament(tournament)"
              :class="[
                'px-3 py-2 cursor-pointer hover:bg-surface-hover',
                index === 0 ? 'rounded-t-lg' : '',
                index === autocompleteOptions.length - 1 ? 'rounded-b-lg' : ''
              ]"
            >
              <div class="text-sm text-primary font-medium">{{ tournament.name }}</div>
              <div class="text-xs text-muted">{{ tournament.format }} • {{ formatDateRange(tournament.start_date, tournament.end_date) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-primary mb-2">
          Format *
        </label>
        <select
          v-model="format"
          class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        >
          <option value="">Select format</option>
          <option value="BP">British Parliamentary (BP)</option>
          <option value="WSDC">World Schools Debate Championship (WSDC)</option>
          <option value="PF">Public Forum</option>
          <option value="LD">Lincoln-Douglas</option>
          <option value="Policy">Policy Debate</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <label class="block text-sm font-medium text-primary mb-2">
          Start Date
        </label>
        <input
          v-model="startDate"
          type="date"
          class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-primary mb-2">
          End Date
        </label>
        <input
          v-model="endDate"
          type="date"
          class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </div>
    <div>
      <label class="block text-sm font-medium text-primary mb-2">
          Number of Preliminary Rounds *
      </label>
      <select
          v-model="preliminaryRounds"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
      >
          <option value="">Select rounds</option>
          <option v-for="i in 10" :key="i" :value="i">{{ i }} {{ i === 1 ? 'Round' : 'Rounds' }}</option>
      </select>
      </div>
    </div>

    <div v-if="preliminaryRounds" class="space-y-3">
      <div class="text-sm font-medium text-primary">
        Break Rounds (Optional)
        <span v-if="selectedBreakRounds.length > 0" class="text-accent">🎉 Congrats on Breaking! 🎉</span>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <label
          v-for="breakRound in getBreakRounds()"
          :key="breakRound"
          class="flex items-center space-x-2 cursor-pointer"
        >
          <input
            v-model="selectedBreakRounds"
            :value="breakRound"
            type="checkbox"
            class="w-4 h-4 text-accent bg-surface border-border rounded focus:ring-accent/50 focus:ring-2"
          />
          <span class="text-sm text-primary">{{ breakRound }}</span>
        </label>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-primary mb-2">
          Location (Optional)
        </label>
        <input
          v-model="location"
          type="text"
          placeholder="City, Country or Online"
          class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-primary mb-2">
          Description (Optional)
        </label>
        <input
          v-model="description"
          type="text"
          placeholder="Brief tournament description"
          class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </div>
    </div>
    <div v-if="preliminaryRounds && roundList.length > 0" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-primary">Round Information</h3>
        <div class="text-sm text-muted">
          {{ roundList.length }} {{ roundList.length === 1 ? 'Round' : 'Rounds' }} Total
        </div>
      </div>
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div
          v-for="(round, index) in roundList"
          :key="round"
          class="bg-surface-hover rounded-lg p-4 space-y-4"
        >
          <div class="flex items-center justify-between">
            <h4 class="font-medium text-primary">{{ round }}</h4>
            <span v-if="isBreakRound(round)" class="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Break</span>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-primary mb-2">
              Motion
            </label>
            <textarea
              v-model="roundData[round].motion"
              :placeholder="`Enter the ${round} motion...`"
              rows="2"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
      ></textarea>
    </div>

          <div class="space-y-3">
            <div class="text-sm font-medium text-primary">Your Team's Performance</div>
            
            <div class="p-3 bg-surface rounded space-y-3">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-medium text-primary mb-1">Your Name</label>
                  <input
                    v-model="roundData[round].yourName"
                    type="text"
                    placeholder="Your name"
                    class="w-full px-2 py-1 bg-background border border-border rounded text-sm text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
                    @input="syncYourNameAcrossRounds"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-primary mb-1">Partner Name</label>
                  <div class="relative">
                    <input
                      v-model="roundData[round].partnerName"
                      type="text"
                      placeholder="Partner name"
                      class="w-full px-2 py-1 bg-background border border-border rounded text-sm text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
                      @input="onPartnerNameInput(round)"
                      @focus="showPartnerAutocompleteForRound(round)"
                      @blur="hidePartnerAutocompleteForRound(round)"
                    />
                    <div 
                      v-if="showPartnerAutocomplete[round] && partnerAutocompleteOptions[round]?.length > 0"
                      class="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-32 overflow-y-auto"
                    >
                      <div
                        v-for="(partner, index) in partnerAutocompleteOptions[round]"
                        :key="partner"
                        @mousedown="selectPartner(round, partner)"
                        :class="[
                          'px-2 py-1 cursor-pointer hover:bg-surface-hover text-sm',
                          index === 0 ? 'rounded-t-lg' : '',
                          index === partnerAutocompleteOptions[round].length - 1 ? 'rounded-b-lg' : ''
                        ]"
                      >
                        {{ partner }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-medium text-primary mb-1">Position</label>
                  <select
                    v-model="roundData[round].position"
                    class="w-full px-2 py-1 bg-background border border-border rounded text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
                  >
                    <option value="N/A">N/A</option>
                    <option value="PM">PM</option>
                    <option value="LO">LO</option>
                    <option value="DPM">DPM</option>
                    <option value="DLO">DLO</option>
                    <option value="MG">MG</option>
                    <option value="MO">MO</option>
                    <option value="GW">GW</option>
                    <option value="OW">OW</option>
                    <option value="Prop 1st">Prop 1st</option>
                    <option value="Prop 2nd">Prop 2nd</option>
                    <option value="Prop 3rd">Prop 3rd</option>
                    <option value="Opp 1st">Opp 1st</option>
                    <option value="Opp 2nd">Opp 2nd</option>
                    <option value="Opp 3rd">Opp 3rd</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-primary mb-1">Speaker Score</label>
                  <input
                    v-model="roundData[round].speakerScore"
                    type="number"
                    step="0.1"
                    placeholder="Your speaker score"
                    class="w-full px-2 py-1 bg-background border border-border rounded text-sm text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-medium text-primary mb-1">Team Result</label>
                  <select
                    v-model="roundData[round].teamResult"
                    class="w-full px-2 py-1 bg-background border border-border rounded text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
                  >
                    <option value="">Select result</option>
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                    <option value="3rd">3rd</option>
                    <option value="4th">4th</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-primary mb-1">Team Points</label>
                  <input
                    v-model="roundData[round].teamPoints"
                    type="number"
                    placeholder="Team points"
                    class="w-full px-2 py-1 bg-background border border-border rounded text-sm text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
                    readonly
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-primary mb-2">
              Date
            </label>
            <input
              v-model="roundData[round].date"
              type="date"
              class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-primary mb-2">
              Notes (Optional)
            </label>
            <textarea
              v-model="roundData[round].notes"
              :placeholder="`Additional notes about ${round}...`"
              rows="2"
              class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-end space-x-3">
      <button
        @click="clearForm"
        :disabled="isAdding"
        class="px-4 py-2 text-sm border border-border rounded-lg text-primary hover:bg-surface-hover disabled:opacity-50"
      >
        Clear Form
      </button>
    <button
      @click="addTournament"
        :disabled="!canSubmit || isAdding"
      :class="[
          'px-6 py-2 rounded-lg font-medium transition-colors',
          (!canSubmit || isAdding)
          ? 'bg-surface-hover text-muted cursor-not-allowed'
          : 'bg-accent text-white hover:bg-accent/90'
      ]"
    >
        <span v-if="isAdding" class="flex items-center">
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Adding Tournament...
      </span>
      <span v-else>
          Add Tournament & Rounds
      </span>
    </button>
    </div>

    <div v-if="recentTournaments.length > 0" class="mt-6">
      <div class="text-sm text-primary font-medium mb-3">Recently Added Tournaments</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="tournament in recentTournaments"
          :key="tournament.id"
          class="p-3 bg-surface-hover rounded-lg"
        >
          <div class="flex items-center justify-between mb-1">
            <div class="text-sm text-primary font-medium truncate">{{ tournament.name }}</div>
            <div class="text-xs text-muted">{{ tournament.format }}</div>
          </div>
          <div class="text-xs text-muted">
            {{ formatDateRange(tournament.start_date, tournament.end_date) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getSupabaseClient } from '../lib/supabaseClient.js'
import { generateRoundList, isBreakRound, getBreakRounds } from '../../shared/utils/breakRounds.js'

const emit = defineEmits(['tournament-added'])
const tournamentName = ref('')
const startDate = ref('')
const endDate = ref('')
const format = ref('')
const location = ref('')
const description = ref('')
const preliminaryRounds = ref('')
const selectedBreakRounds = ref([])
const isAdding = ref(false)
const recentTournaments = ref([])
const showAutocomplete = ref(false)
const autocompleteOptions = ref([])
const allTournaments = ref([])
const showPartnerAutocomplete = ref({}) 
const partnerAutocompleteOptions = ref({})
const allPartners = ref([]) 
const formPartners = ref(new Set()) 
const roundList = ref([])
const roundData = ref({})

let supabase

const canSubmit = computed(() => {
  return tournamentName.value.trim() && 
         format.value && 
         preliminaryRounds.value && 
         !isAdding.value
})

watch([preliminaryRounds, selectedBreakRounds], ([newPrelim, newBreak]) => {
  if (newPrelim) {
    roundList.value = generateRoundList(parseInt(newPrelim), selectedBreakRounds.value)
    initializeRoundData()
  } else {
    roundList.value = []
    roundData.value = {}
  }
}, { deep: true })

const formatDateRange = (start, end) => {
  if (!start) return 'No date specified'
  
  const startFormatted = new Date(start).toLocaleDateString()
  if (!end || start === end) {
    return startFormatted
  }
  
  const endFormatted = new Date(end).toLocaleDateString()
  return `${startFormatted} - ${endFormatted}`
}

const initializeRoundData = () => {
  const newRoundData = {}
  roundList.value.forEach(round => {
    newRoundData[round] = {
      motion: '',
      date: '',
      notes: '',
      yourName: '',
      partnerName: '',
      position: 'N/A',
      speakerScore: null,
      teamResult: '',
      teamPoints: null
    }
  })
  roundData.value = newRoundData
}

const getPointsForPlacement = (placement) => {
  switch ((placement || '').toString().toLowerCase()) {
    case '1st':
    case '1':
    case 'first':
      return 3
    case '2nd':
    case '2':
    case 'second':
      return 2
    case '3rd':
    case '3':
    case 'third':
      return 1
    case '4th':
    case '4':
    case 'fourth':
      return 0
    default:
      return null
  }
}

// Watch for team result changes to auto-update team points
watch(() => roundData.value, (newData) => {
  Object.keys(newData).forEach(round => {
    const roundInfo = newData[round]
    if (roundInfo && roundInfo.teamResult) {
      roundInfo.teamPoints = getPointsForPlacement(roundInfo.teamResult)
    }
  })
}, { deep: true })

const onTournamentNameInput = () => {
  const query = tournamentName.value.trim().toLowerCase()
  if (query.length < 2) {
    autocompleteOptions.value = []
    return
  }
  
  autocompleteOptions.value = allTournaments.value
    .filter(t => t.name.toLowerCase().includes(query))
    .slice(0, 5)
}

const selectTournament = (tournament) => {
  tournamentName.value = tournament.name
  format.value = tournament.format
  startDate.value = tournament.start_date || ''
  endDate.value = tournament.end_date || ''
  location.value = tournament.location || ''
  description.value = tournament.description || ''
  showAutocomplete.value = false
}

const hideAutocomplete = () => {
  setTimeout(() => {
    showAutocomplete.value = false
  }, 200)
}

const onPartnerNameInput = (round) => {
  const query = roundData.value[round]?.partnerName?.trim().toLowerCase() || ''
  showPartnerAutocomplete.value[round] = true
  if (query.length < 1) {
    partnerAutocompleteOptions.value[round] = []
    return
  }
  
  const allPartnerOptions = [...allPartners.value, ...Array.from(formPartners.value)]
  const filtered = allPartnerOptions
    .filter(partner => partner.toLowerCase().includes(query))
    .slice(0, 5)
  
  partnerAutocompleteOptions.value = {
    ...partnerAutocompleteOptions.value,
    [round]: filtered
  }
}

const showPartnerAutocompleteForRound = (round) => {
  showPartnerAutocomplete.value[round] = true
  onPartnerNameInput(round)
}

const hidePartnerAutocompleteForRound = (round) => {
  setTimeout(() => {
    showPartnerAutocomplete.value[round] = false
  }, 200)
}

const selectPartner = (round, partnerName) => {
  roundData.value[round].partnerName = partnerName
  showPartnerAutocomplete.value[round] = false
  if (partnerName.trim()) {
    formPartners.value.add(partnerName.trim())
  }
}

const syncYourNameAcrossRounds = () => {
const currentValue = Object.values(roundData.value).find(round => round.yourName)?.yourName || ''
  
  Object.keys(roundData.value).forEach(round => {
    roundData.value[round].yourName = currentValue
  })
}

const loadRecentTournaments = async () => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) throw error
    recentTournaments.value = data || []
    
    const { data: allData, error: allError } = await supabase
      .from('tournaments')
      .select('*')
      .order('name', { ascending: true })
    
    if (!allError) {
      allTournaments.value = allData || []
    }

    const { data: partnersData, error: partnersError } = await supabase
      .from('partners')
      .select('name')
      .order('name', { ascending: true })
    
    if (!partnersError) {
      allPartners.value = partnersData?.map(p => p.name) || []
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

const clearForm = () => {
  tournamentName.value = ''
  startDate.value = ''
  endDate.value = ''
  format.value = ''
  location.value = ''
  description.value = ''
  preliminaryRounds.value = ''
  selectedBreakRounds.value = []
  roundList.value = []
  roundData.value = {}
  showAutocomplete.value = false
  
  showPartnerAutocomplete.value = {}
  partnerAutocompleteOptions.value = {}
  formPartners.value.clear()
}

const addTournament = async () => {
  if (!canSubmit.value) return
  isAdding.value = true

  try {
    const tournamentData = {
      name: tournamentName.value.trim(),
      start_date: startDate.value || null,
      end_date: endDate.value || null,
      format: format.value,
      location: location.value.trim() || null,
      description: description.value.trim() || null,
      created_at: new Date().toISOString()
    }

    const { data: tournamentResult, error: tournamentError } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select()

    if (tournamentError) throw tournamentError

    const addedTournament = tournamentResult[0]
    if (roundList.value.length > 0) {
      for (const round of roundList.value) {
        const roundInfo = roundData.value[round]
        if (!roundInfo) continue
        const roundRecord = {
          tournament_id: addedTournament.id,
          round: round,
          motion: roundInfo.motion?.trim() || null,
          date: roundInfo.date || null,
          notes: roundInfo.notes?.trim() || null,
          created_at: new Date().toISOString()
        }

        const { data: roundResult, error: roundError } = await supabase
          .from('debate_rounds')
          .insert([roundRecord])
          .select()

        if (roundError) throw roundError
        const roundId = roundResult[0].id

        const resultData = {
          round_id: roundId,
          tournament_id: addedTournament.id,
          team_number: 1,
          speaker1_name: roundInfo.yourName?.trim() || null,
          speaker2_name: roundInfo.partnerName?.trim() || null,
          position: roundInfo.position !== 'N/A' ? roundInfo.position : null,
          result: roundInfo.teamResult || null,
          team_score: roundInfo.teamPoints ? parseFloat(roundInfo.teamPoints) : null,
          speaker1_score: roundInfo.speakerScore ? parseFloat(roundInfo.speakerScore) : null,
          speaker2_score: null,
          created_at: new Date().toISOString()
        }

        const { error: resultsError } = await supabase
          .from('debate_results')
          .insert([resultData])

        if (resultsError) throw resultsError
      }
    }
    
    emit('tournament-added', addedTournament)
    clearForm()
    await loadRecentTournaments()

  } catch (error) {
    console.error('Error adding tournament:', error)
    alert('Failed to add tournament: ' + error.message)
  } finally {
    isAdding.value = false
  }
}

onMounted(async () => {
  supabase = await getSupabaseClient()
  await loadRecentTournaments()
})
</script>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>