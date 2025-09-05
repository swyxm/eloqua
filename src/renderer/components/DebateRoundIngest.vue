<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm font-medium text-primary mb-2">
          Tournament
        </label>
        <select
          v-model="selectedTournament"
          class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        >
          <option value="">Select tournament</option>
          <option v-for="tournament in tournaments" :key="tournament.id" :value="tournament.id">
            {{ tournament.name }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-primary mb-2">
          Round
        </label>
        <input
          v-model="round"
          type="text"
          placeholder="Round 1, Semi-final, etc."
          class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        Motion/Topic
      </label>
      <textarea
        v-model="motion"
        placeholder="Enter the debate motion or topic..."
        rows="2"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
      ></textarea>
    </div>

    <!-- Teams Section -->
    <div class="space-y-3">
      <div class="text-sm font-medium text-primary">Teams & Results</div>
      
      <div v-for="(team, index) in teams" :key="index" class="p-3 bg-surface-hover rounded-lg space-y-2">
        <div class="flex items-center justify-between">
          <div class="text-sm font-medium text-primary">Team {{ index + 1 }}</div>
          <button
            v-if="teams.length > 2"
            @click="removeTeam(index)"
            class="text-muted hover:text-red-400 text-sm"
          >
            Remove
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-2">
          <input
            v-model="team.speaker1"
            type="text"
            placeholder="Speaker 1"
            class="px-2 py-1 bg-surface border border-border rounded text-sm text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
          <input
            v-model="team.speaker2"
            type="text"
            placeholder="Speaker 2"
            class="px-2 py-1 bg-surface border border-border rounded text-sm text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
        
        <div class="grid grid-cols-3 gap-2">
          <select
            v-model="team.position"
            class="px-2 py-1 bg-surface border border-border rounded text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
          >
            <option value="">Position</option>
            <option value="Opening Government">OG</option>
            <option value="Opening Opposition">OO</option>
            <option value="Closing Government">CG</option>
            <option value="Closing Opposition">CO</option>
            <option value="Government">Gov</option>
            <option value="Opposition">Opp</option>
          </select>
          <select
            v-model="team.result"
            class="px-2 py-1 bg-surface border border-border rounded text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
          >
            <option value="">Result</option>
            <option value="First Place">1st</option>
            <option value="Second Place">2nd</option>
            <option value="Third Place">3rd</option>
            <option value="Fourth Place">4th</option>
            <option value="Won Round">Won</option>
            <option value="Lost Round">Lost</option>
          </select>
          <input
            v-model="team.teamScore"
            type="number"
            placeholder="Team Score"
            class="px-2 py-1 bg-surface border border-border rounded text-sm text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <input
            v-model="team.speaker1Score"
            type="number"
            placeholder="Speaker 1 Score"
            class="px-2 py-1 bg-surface border border-border rounded text-sm text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
          <input
            v-model="team.speaker2Score"
            type="number"
            placeholder="Speaker 2 Score"
            class="px-2 py-1 bg-surface border border-border rounded text-sm text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
      </div>

      <button
        @click="addTeam"
        class="w-full py-2 border-2 border-dashed border-border rounded-lg text-muted hover:border-accent hover:text-accent transition-colors"
      >
        + Add Team
      </button>
    </div>

    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        Date
      </label>
      <input
        v-model="roundDate"
        type="date"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        Notes (Optional)
      </label>
      <textarea
        v-model="notes"
        placeholder="Additional notes about this round..."
        rows="2"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
      ></textarea>
    </div>

    <button
      @click="addRound"
      :disabled="!selectedTournament || !round || teams.length < 2 || isAdding"
      :class="[
        'w-full py-2 px-4 rounded-lg font-medium transition-colors',
        (!selectedTournament || !round || teams.length < 2 || isAdding)
          ? 'bg-surface-hover text-muted cursor-not-allowed'
          : 'bg-accent text-white hover:bg-accent/90'
      ]"
    >
      <span v-if="isAdding" class="flex items-center justify-center">
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        Adding Round...
      </span>
      <span v-else>
        Add Debate Round
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getSupabaseClient } from '../lib/supabaseClient.js'

const emit = defineEmits(['round-added'])

const selectedTournament = ref('')
const round = ref('')
const motion = ref('')
const roundDate = ref(new Date().toISOString().split('T')[0])
const notes = ref('')
const isAdding = ref(false)
const tournaments = ref([])

const teams = ref([
  {
    speaker1: '',
    speaker2: '',
    position: '',
    result: '',
    teamScore: '',
    speaker1Score: '',
    speaker2Score: ''
  },
  {
    speaker1: '',
    speaker2: '',
    position: '',
    result: '',
    teamScore: '',
    speaker1Score: '',
    speaker2Score: ''
  }
])

let supabase

const addTeam = () => {
  teams.value.push({
    speaker1: '',
    speaker2: '',
    position: '',
    result: '',
    teamScore: '',
    speaker1Score: '',
    speaker2Score: ''
  })
}

const removeTeam = (index) => {
  if (teams.value.length > 2) {
    teams.value.splice(index, 1)
  }
}

const loadTournaments = async () => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('id, name')
      .order('created_at', { ascending: false })

    if (error) throw error
    tournaments.value = data || []
  } catch (error) {
    console.error('Error loading tournaments:', error)
  }
}

const addRound = async () => {
  if (!selectedTournament.value || !round.value || teams.value.length < 2) return

  isAdding.value = true

  try {
    // First create the round record
    const roundData = {
      tournament_id: selectedTournament.value,
      round: round.value,
      motion: motion.value || null,
      date: roundDate.value,
      notes: notes.value || null,
      created_at: new Date().toISOString()
    }

    const { data: roundResult, error: roundError } = await supabase
      .from('debate_rounds')
      .insert([roundData])
      .select()

    if (roundError) throw roundError

    const roundId = roundResult[0].id

    // Then create team/result records
    const resultsData = []
    teams.value.forEach((team, index) => {
      if (team.speaker1 || team.speaker2) {
        resultsData.push({
          round_id: roundId,
          tournament_id: selectedTournament.value,
          team_number: index + 1,
          speaker1_name: team.speaker1 || null,
          speaker2_name: team.speaker2 || null,
          position: team.position || null,
          result: team.result || null,
          team_score: team.teamScore ? parseFloat(team.teamScore) : null,
          speaker1_score: team.speaker1Score ? parseFloat(team.speaker1Score) : null,
          speaker2_score: team.speaker2Score ? parseFloat(team.speaker2Score) : null,
          created_at: new Date().toISOString()
        })
      }
    })

    if (resultsData.length > 0) {
      const { error: resultsError } = await supabase
        .from('debate_results')
        .insert(resultsData)

      if (resultsError) throw resultsError
    }

    const tournamentName = tournaments.value.find(t => t.id === selectedTournament.value)?.name || 'Unknown Tournament'
    
    emit('round-added', {
      round: round.value,
      tournament: tournamentName,
      teams: resultsData.length
    })

    // Reset form
    selectedTournament.value = ''
    round.value = ''
    motion.value = ''
    notes.value = ''
    roundDate.value = new Date().toISOString().split('T')[0]
    teams.value = [
      {
        speaker1: '',
        speaker2: '',
        position: '',
        result: '',
        teamScore: '',
        speaker1Score: '',
        speaker2Score: ''
      },
      {
        speaker1: '',
        speaker2: '',
        position: '',
        result: '',
        teamScore: '',
        speaker1Score: '',
        speaker2Score: ''
      }
    ]

  } catch (error) {
    console.error('Error adding round:', error)
    alert('Failed to add debate round: ' + error.message)
  } finally {
    isAdding.value = false
  }
}

onMounted(async () => {
  supabase = await getSupabaseClient()
  await loadTournaments()
})
</script>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>
