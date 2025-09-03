<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        Tournament Name
      </label>
      <input
        v-model="tournamentName"
        type="text"
        placeholder="Enter tournament name"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        @keyup.enter="addTournament"
      />
    </div>

    <div class="grid grid-cols-2 gap-3">
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
    </div>

    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        Format
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
      <textarea
        v-model="description"
        placeholder="Tournament description..."
        rows="3"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
      ></textarea>
    </div>

    <button
      @click="addTournament"
      :disabled="!tournamentName || !format || isAdding"
      :class="[
        'w-full py-2 px-4 rounded-lg font-medium transition-colors',
        (!tournamentName || !format || isAdding)
          ? 'bg-surface-hover text-muted cursor-not-allowed'
          : 'bg-accent text-white hover:bg-accent/90'
      ]"
    >
      <span v-if="isAdding" class="flex items-center justify-center">
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        Adding...
      </span>
      <span v-else>
        Add Tournament
      </span>
    </button>

    <div v-if="recentTournaments.length > 0" class="mt-4">
      <div class="text-sm text-primary font-medium mb-2">Recently Added Tournaments</div>
      <div class="space-y-2 max-h-32 overflow-y-auto">
        <div
          v-for="tournament in recentTournaments"
          :key="tournament.id"
          class="p-2 bg-surface-hover rounded-lg"
        >
          <div class="flex items-center justify-between mb-1">
            <div class="text-sm text-primary font-medium">{{ tournament.name }}</div>
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
import { ref, onMounted } from 'vue'
import { getSupabaseClient } from '../lib/supabaseClient.js'

const emit = defineEmits(['tournament-added'])

const tournamentName = ref('')
const startDate = ref('')
const endDate = ref('')
const format = ref('')
const location = ref('')
const description = ref('')
const isAdding = ref(false)
const recentTournaments = ref([])

let supabase

const formatDateRange = (start, end) => {
  if (!start) return 'No date specified'
  
  const startFormatted = new Date(start).toLocaleDateString()
  if (!end || start === end) {
    return startFormatted
  }
  
  const endFormatted = new Date(end).toLocaleDateString()
  return `${startFormatted} - ${endFormatted}`
}

const loadRecentTournaments = async () => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error
    recentTournaments.value = data || []
  } catch (error) {
    console.error('Error loading recent tournaments:', error)
  }
}

const addTournament = async () => {
  if (!tournamentName.value.trim() || !format.value) return
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

    const { data, error } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select()

    if (error) throw error

    const addedTournament = data[0]
    
    emit('tournament-added', addedTournament)

    tournamentName.value = ''
    startDate.value = ''
    endDate.value = ''
    format.value = ''
    location.value = ''
    description.value = ''

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
