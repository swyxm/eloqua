<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        Tabbycat Tournament URL
      </label>
      <input
        v-model="tabbycatUrl"
        type="url"
        placeholder="https://your-tournament.calicotab.com"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
      />
      <p class="text-xs text-muted mt-1">
        Enter the Heroku URL of your Tabbycat tournament
      </p>
    </div>

    <div class="bg-surface-hover rounded-lg p-4 space-y-3">
      <div class="text-sm font-medium text-primary">Your Debater Information</div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-primary mb-1">
            First Name *
          </label>
          <input
            v-model="firstName"
            type="text"
            placeholder="Your first name"
            class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-primary mb-1">
            Last Name *
          </label>
          <input
            v-model="lastName"
            type="text"
            placeholder="Your last name"
            class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-primary mb-1">
          Institution/School (Optional)
        </label>
        <input
          v-model="institution"
          type="text"
          placeholder="Your institution for better matching"
          class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm font-medium text-primary mb-2">
          Tournament Name (Optional)
        </label>
        <input
          v-model="tournamentName"
          type="text"
          placeholder="Tournament Name"
          class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-primary mb-2">
          Date (Optional)
        </label>
        <input
          v-model="tournamentDate"
          type="date"
          class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </div>
    </div>

    <button
      @click="startScraping"
      :disabled="!tabbycatUrl || !firstName || !lastName || isScraping"
      :class="[
        'w-full py-2 px-4 rounded-lg font-medium transition-colors',
        (!tabbycatUrl || !firstName || !lastName || isScraping)
          ? 'bg-surface-hover text-muted cursor-not-allowed'
          : 'bg-accent text-white hover:bg-accent/90'
      ]"
    >
      <span v-if="isScraping" class="flex items-center justify-center">
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        Extracting...
      </span>
      <span v-else>
        Extract Tournament Data
      </span>
    </button>

    <div v-if="lastScrapeInfo" class="mt-4 p-4 bg-surface-hover rounded-lg space-y-4">
      <div class="text-sm text-primary font-medium">Last Scrape Results</div>
      <div class="bg-surface rounded p-4 text-sm">
        <div class="text-sm font-medium text-primary mb-2">General Information</div>
        <!-- First Row: Tournament + Date stacked, Debater, Speeches Found, Speaker Rank, Total Speaker Score -->
        <div class="grid grid-cols-1 md:grid-cols-12 items-start">
          <!-- Tournament (wide) with Date stacked under it -->
          <div class="md:col-span-3">
            <div class="mb-1 min-w-0 flex items-baseline gap-2">
              <span class="text-muted">Tournament Name:</span>
              <div 
                @dblclick="startEditGeneral('tournamentName')"
                class="min-w-0 flex items-center cursor-pointer hover:bg-background/50 px-2 py-0.5 rounded"
              >
                <span v-if="!generalEditing || generalEditing !== 'tournamentName'" class="text-primary font-semibold truncate">{{ editableGeneral.tournamentName || '-' }}</span>
                <input 
                  v-else
                  v-model="editableGeneral.tournamentName" 
                  @blur="finishEditGeneral('tournamentName')"
                  @keyup.enter="finishEditGeneral('tournamentName')"
                  type="text" 
                  class="px-2 py-1 text-sm bg-background border border-border rounded"
                  :style="{ width: computeWidthCh(editableGeneral.tournamentName, 18, 56) }"
                  v-focus
                />
        </div>
        </div>
            <div class="min-w-0 flex items-baseline gap-2">
          <span class="text-muted">Date:</span>
              <div 
                @dblclick="startEditGeneral('date')"
                class="min-w-0 flex items-center cursor-pointer hover:bg-background/50 px-2 py-0.5 rounded"
              >
                <span v-if="!generalEditing || generalEditing !== 'date'" class="text-primary truncate">{{ new Date(editableGeneral.date || lastScrapeInfo.date).toLocaleDateString() }}</span>
                <input 
                  v-else
                  v-model="editableGeneral.date" 
                  @blur="finishEditGeneral('date')"
                  @keyup.enter="finishEditGeneral('date')"
                  type="date" 
                  class="px-2 py-1 text-sm bg-background border border-border rounded"
                  v-focus
                />
        </div>
      </div>
          </div>
          <!-- Debater (wide-ish) -->
          <div class="md:col-span-3 min-w-0">
            <div class="min-w-0 flex items-baseline gap-2">
              <span class="text-muted">Debater Name:</span>
              <div 
                @dblclick="startEditGeneral('debaterName')"
                class="min-w-0 flex items-center cursor-pointer hover:bg-background/50 px-2 py-0.5 rounded"
              >
                <span v-if="!generalEditing || generalEditing !== 'debaterName'" class="text-primary truncate">{{ editableGeneral.debaterName || '-' }}</span>
                <input 
                  v-else
                  v-model="editableGeneral.debaterName" 
                  @blur="finishEditGeneral('debaterName')"
                  @keyup.enter="finishEditGeneral('debaterName')"
                  type="text" 
                  class="px-2 py-1 text-sm bg-background border border-border rounded"
                  :style="{ width: computeWidthCh(editableGeneral.debaterName, 12, 40) }"
                  v-focus
                />
              </div>
          </div>
          </div>
          <!-- Numbers (compact) -->
          <div class="md:col-span-2 min-w-0">
            <div class="flex items-baseline gap-2">
              <span class="text-muted">Speeches Found:</span>
              <div 
                @dblclick="startEditGeneral('speechesFound')"
                class="flex items-center cursor-pointer hover:bg-background/50 px-2 py-0.5 rounded"
              >
                <span v-if="!generalEditing || generalEditing !== 'speechesFound'" class="text-primary">{{ editableGeneral.speechesFound ?? '-' }}</span>
                <input 
                  v-else
                  v-model="editableGeneral.speechesFound" 
                  @blur="finishEditGeneral('speechesFound')"
                  @keyup.enter="finishEditGeneral('speechesFound')"
                  type="number" 
                  class="px-2 py-1 text-sm bg-background border border-border rounded"
                  :style="{ width: computeWidthCh(editableGeneral.speechesFound, 2, 6) }"
                  v-focus
                />
        </div>
      </div>
          </div>
          <div class="md:col-span-1">
            <div class="flex items-baseline gap-2">
              <span class="text-muted">Rank:</span>
              <div 
                @dblclick="startEditGeneral('speakerRank')"
                class="flex items-center cursor-pointer hover:bg-background/50 pl-2 py-0.5 rounded"
              >
                <span v-if="!generalEditing || generalEditing !== 'speakerRank'" class="text-primary">{{ editableGeneral.speakerRank ?? '-' }}</span>
                <input 
                  v-else
                  v-model="editableGeneral.speakerRank" 
                  @blur="finishEditGeneral('speakerRank')"
                  @keyup.enter="finishEditGeneral('speakerRank')"
                  type="number" 
                  class="px-2 py-1 text-sm bg-background border border-border rounded"
                  :style="{ width: computeWidthCh(editableGeneral.speakerRank, 2, 6) }"
                  v-focus
                />
        </div>
      </div>
          </div>
          <div class="md:col-span-3 min-w-0">
            <div class="flex items-baseline gap-2 pl-2">
              <span class="text-muted">Total Speaker Score:</span>
              <div 
                @dblclick="startEditGeneral('individualSpeakerScore')"
                class="flex items-center cursor-pointer hover:bg-background/50 px-2 py-0.5 rounded"
              >
                <span v-if="!generalEditing || generalEditing !== 'individualSpeakerScore'" class="text-primary">{{ editableGeneral.individualSpeakerScore ?? '-' }}</span>
                <input 
                  v-else
                  v-model="editableGeneral.individualSpeakerScore" 
                  @blur="finishEditGeneral('individualSpeakerScore')"
                  @keyup.enter="finishEditGeneral('individualSpeakerScore')"
                  type="number" step="0.1"
                  class="px-2 py-1 text-sm bg-background border border-border rounded"
                  :style="{ width: computeWidthCh(editableGeneral.individualSpeakerScore, 4, 8) }"
                  v-focus
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Second Row: Partner, Team, Team Total Points, Team Total Speaker Score -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
          <div>
            <span class="text-muted">Partner Name:</span>
            <div 
              @dblclick="startEditGeneral('partner')"
              class="ml-2 inline-block cursor-pointer hover:bg-background/50 px-2 py-0.5 rounded"
            >
              <span v-if="!generalEditing || generalEditing !== 'partner'" class="text-primary">{{ editableGeneral.partner || '-' }}</span>
              <input 
                v-else
                v-model="editableGeneral.partner" 
                @blur="finishEditGeneral('partner')"
                @keyup.enter="finishEditGeneral('partner')"
                type="text" 
                class="px-2 py-1 text-sm bg-background border border-border rounded"
                :style="{ width: computeWidthCh(editableGeneral.partner, 8, 32) }"
                v-focus
              />
      </div>
          </div>
          <div>
            <span class="text-muted">Team Name:</span>
            <div 
              @dblclick="startEditGeneral('teamName')"
              class="ml-2 inline-block cursor-pointer hover:bg-background/50 px-2 py-0.5 rounded"
            >
              <span v-if="!generalEditing || generalEditing !== 'teamName'" class="text-primary">{{ editableGeneral.teamName || '-' }}</span>
              <input 
                v-else
                v-model="editableGeneral.teamName" 
                @blur="finishEditGeneral('teamName')"
                @keyup.enter="finishEditGeneral('teamName')"
                type="text" 
                class="px-2 py-1 text-sm bg-background border border-border rounded"
                :style="{ width: computeWidthCh(editableGeneral.teamName, 8, 32) }"
                v-focus
              />
            </div>
          </div>
          <div>
            <span class="text-muted">Team Total Points:</span>
            <div 
              @dblclick="startEditGeneral('teamTotalPoints')"
              class="ml-2 inline-block cursor-pointer hover:bg-background/50 px-2 py-0.5 rounded"
            >
              <span v-if="!generalEditing || generalEditing !== 'teamTotalPoints'" class="text-primary">{{ editableGeneral.teamTotalPoints ?? '-' }}</span>
              <input 
                v-else
                v-model="editableGeneral.teamTotalPoints" 
                @blur="finishEditGeneral('teamTotalPoints')"
                @keyup.enter="finishEditGeneral('teamTotalPoints')"
                type="number" 
                class="px-2 py-1 text-sm bg-background border border-border rounded"
                :style="{ width: computeWidthCh(editableGeneral.teamTotalPoints, 3, 6) }"
                v-focus
              />
            </div>
          </div>
          <div>
            <span class="text-muted">Team Total Speaker Score:</span>
            <div 
              @dblclick="startEditGeneral('teamTotalSpeakerScore')"
              class="ml-2 inline-block cursor-pointer hover:bg-background/50 px-2 py-0.5 rounded"
            >
              <span v-if="!generalEditing || generalEditing !== 'teamTotalSpeakerScore'" class="text-primary">{{ editableGeneral.teamTotalSpeakerScore ?? '-' }}</span>
              <input 
                v-else
                v-model="editableGeneral.teamTotalSpeakerScore" 
                @blur="finishEditGeneral('teamTotalSpeakerScore')"
                @keyup.enter="finishEditGeneral('teamTotalSpeakerScore')"
                type="number" step="0.1"
                class="px-2 py-1 text-sm bg-background border border-border rounded"
                :style="{ width: computeWidthCh(editableGeneral.teamTotalSpeakerScore, 4, 10) }"
                v-focus
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Round Information (Editable rows) -->
      <div v-if="(editableSpeeches || []).length > 0" class="border-t border-border pt-3">
        <div class="flex justify-between items-center mb-3">
          <div class="text-sm font-medium text-primary">Round Information</div>
          <div class="flex items-center gap-2">
            <button @click="addRoundRow" class="px-2 py-1 text-xs bg-surface border border-border rounded hover:bg-surface-hover">+ Add Round</button>
            <button 
              @click="saveToDatabase" 
              :disabled="isSaving"
              class="px-3 py-1.5 bg-accent text-accent-text rounded text-sm hover:bg-accent-hover disabled:opacity-50"
            >
              {{ isSaving ? 'Saving...' : 'Save to Database' }}
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left p-2 text-muted font-medium">Round</th>
                <th class="text-left p-2 text-muted font-medium">Motion</th>
                <th class="text-left p-2 text-muted font-medium">Position</th>
                <th class="text-left p-2 text-muted font-medium">Speaker Score</th>
                <th class="text-left p-2 text-muted font-medium">Team Result</th>
                <th class="text-left p-2 text-muted font-medium">Team Points</th>
                <th class="text-right p-2 text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(speech, idx) in editableSpeeches" :key="`${speech.round}-${idx}`" class="border-b border-border/50 hover:bg-surface/50">
                <td class="p-2">
                  <div 
                    @dblclick="startEditSpeech(speech, 'round')"
                    class="cursor-pointer hover:bg-background/50 px-2 py-1 rounded"
                  >
                    <span v-if="!speech.editing || speech.editing !== 'round'">{{ speech.round }}</span>
                    <input 
                      v-else
                      v-model="speech.round" 
                      @blur="finishEditSpeech(speech, 'round')"
                      @keyup.enter="finishEditSpeech(speech, 'round')"
                      type="text" 
                      class="w-16 px-2 py-1 text-sm bg-background border border-border rounded"
                      v-focus
                    />
                  </div>
                </td>
                <td class="p-2">
                  <div 
                    @dblclick="startEditSpeech(speech, 'motion')"
                    class="cursor-pointer hover:bg-background/50 px-2 py-1 rounded"
                  >
                    <span v-if="!speech.editing || speech.editing !== 'motion'" class="truncate block max-w-xs">{{ speech.motion || '-' }}</span>
                    <textarea 
                      v-else
                      v-model="speech.motion" 
                      @blur="finishEditSpeech(speech, 'motion')"
                      @keyup.ctrl-enter="finishEditSpeech(speech, 'motion')"
                      class="w-full px-2 py-1 text-sm bg-background border border-border rounded resize-none"
                      rows="2"
                      v-focus
                    ></textarea>
                  </div>
                </td>
                <td class="p-2">
                  <div 
                    @dblclick="startEditSpeech(speech, 'position')"
                    class="cursor-pointer hover:bg-background/50 px-2 py-1 rounded"
                  >
                    <span v-if="!speech.editing || speech.editing !== 'position'">{{ speech.position || 'N/A' }}</span>
                    <select 
                      v-else
                      v-model="speech.position" 
                      @blur="finishEditSpeech(speech, 'position')"
                      @change="finishEditSpeech(speech, 'position')"
                      class="w-full px-2 py-1 text-sm bg-background border border-border rounded"
                      v-focus
                    >
                      <option v-for="option in positionOptions" :key="option" :value="option">{{ option }}</option>
                    </select>
                  </div>
                </td>
                <td class="p-2">
                  <div 
                    @dblclick="startEditSpeech(speech, 'speaker_score')"
                    class="cursor-pointer hover:bg-background/50 px-2 py-1 rounded"
                  >
                    <span v-if="!speech.editing || speech.editing !== 'speaker_score'">{{ speech.speaker_score || '-' }}</span>
                    <input 
                      v-else
                      v-model="speech.speaker_score" 
                      @blur="finishEditSpeech(speech, 'speaker_score')"
                      @keyup.enter="finishEditSpeech(speech, 'speaker_score')"
                      type="number" 
                      step="0.1"
                      class="w-24 px-2 py-1 text-sm bg-background border border-border rounded"
                      v-focus
                    />
                  </div>
                </td>
                <td class="p-2">
                  <div 
                    @dblclick="startEditSpeech(speech, 'team_placement')"
                    class="cursor-pointer hover:bg-background/50 px-2 py-1 rounded"
                  >
                    <span v-if="!speech.editing || speech.editing !== 'team_placement'">{{ speech.team_placement || '-' }}</span>
                    <select 
                      v-else
                      v-model="speech.team_placement" 
                      @blur="finishEditSpeech(speech, 'team_placement')"
                      @change="finishEditSpeech(speech, 'team_placement')"
                      class="w-full px-2 py-1 text-sm bg-background border border-border rounded"
                      v-focus
                    >
                      <option value="">Select...</option>
                      <option value="1st">1st</option>
                      <option value="2nd">2nd</option>
                      <option value="3rd">3rd</option>
                      <option value="4th">4th</option>
                    </select>
                  </div>
                </td>
                <td class="p-2">
                  <div class="px-2 py-1">
                    {{ getPointsForPlacement(speech.team_placement) ?? '-' }}
                  </div>
                </td>
                <td class="p-2">
                  <div class="flex justify-end">
                    <button @click="removeRoundRow(idx)" class="text-muted hover:text-red-500" aria-label="Delete row" title="Delete row">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                        <path fill-rule="evenodd" d="M9 3a1 1 0 00-1 1v1H5.5a.75.75 0 000 1.5h13a.75.75 0 000-1.5H16V4a1 1 0 00-1-1H9zm-2 6.25a.75.75 0 011.5 0v8.5a.75.75 0 01-1.5 0v-8.5zm4.75-.75a.75.75 0 00-.75.75v8.5a.75.75 0 001.5 0v-8.5a.75.75 0 00-.75-.75zm3.25.75a.75.75 0 011.5 0v8.5a.75.75 0 01-1.5 0v-8.5z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getSupabaseClient } from '../lib/supabaseClient.js'
import { mapPosition } from '../../shared/utils/positionMapping.js'

const emit = defineEmits(['scrape-started', 'scrape-completed'])

// Custom directive for auto-focus
const vFocus = {
  mounted: (el) => el.focus()
}

const tabbycatUrl = ref('')
const firstName = ref('')
const lastName = ref('')
const institution = ref('')
const tournamentName = ref('')
const tournamentDate = ref('')
const lastScrapeInfo = ref(null)
const isSaving = ref(false)
const isScraping = ref(false)

// Editable data
const editableRounds = ref([])
const editableSpeeches = ref([])
const editableGeneral = ref({
  tournamentName: '',
  debaterName: '',
  speakerRank: null,
  speechesFound: null,
  individualSpeakerScore: null,
  partner: '',
  teamName: '',
  date: '',
  teamTotalPoints: null,
  teamTotalSpeakerScore: null
})
const generalEditing = ref(null)

const positionOptions = ref([
  'N/A',
  'PM',
  'LO', 
  'DPM',
  'DLO',
  'MG',
  'MO',
  'GW',
  'OW',
  'Prop 1st',
  'Prop 2nd', 
  'Prop 3rd',
  'Opp 1st',
  'Opp 2nd',
  'Opp 3rd'
])

const populateEditableRounds = () => {
  if (!lastScrapeInfo.value?.roundResults) return
  
  editableGeneral.value.tournamentName = lastScrapeInfo.value.tournament || ''
  editableGeneral.value.debaterName = lastScrapeInfo.value.debaterName || ''
  editableGeneral.value.speakerRank = lastScrapeInfo.value.speakerStats?.rank ?? lastScrapeInfo.value.speakerRank ?? null
  editableGeneral.value.speechesFound = lastScrapeInfo.value.speechesFound ?? null
  editableGeneral.value.individualSpeakerScore = lastScrapeInfo.value.speakerStats?.total_score ?? lastScrapeInfo.value.speakerStats?.average_score ?? null
  editableGeneral.value.partner = lastScrapeInfo.value.teamInfo?.partner || ''
  editableGeneral.value.teamName = lastScrapeInfo.value.teamInfo?.team_name || ''
  editableGeneral.value.date = lastScrapeInfo.value.date || ''
  editableGeneral.value.teamTotalPoints = lastScrapeInfo.value.teamStats?.total_points ?? null
  editableGeneral.value.teamTotalSpeakerScore = lastScrapeInfo.value.teamStats?.total_speaker_score ?? null
  
  editableRounds.value = lastScrapeInfo.value.roundResults.map(round => ({
    round: round.round || '',
    motion: round.motion || '',
    position: '',
    speakerScore: round.score || '',
    teamResult: round.placement || '',
    teamPoints: round.team_points || '',
    teamSpeakerScore: round.team_debate_score || '',
    editing: null 
  }))
  
  if (lastScrapeInfo.value.speeches) {
    editableSpeeches.value = lastScrapeInfo.value.speeches.map(speech => ({
      ...speech,
      team_points: speech.team_points ?? getPointsForPlacement(speech.team_placement),
      position: speech.position || 'N/A', 
      editing: null
    }))
  }
}

const startEdit = (round, field) => {
  // Stop editing any other fields
  editableRounds.value.forEach(r => r.editing = null)
  round.editing = field
}

const finishEdit = (round, field) => {
  round.editing = null
}

const startEditGeneral = (field) => {
  generalEditing.value = field
}

const finishEditGeneral = (field) => {
  generalEditing.value = null
}

const computeWidthCh = (value, minCh = 6, maxCh = 40) => {
  const str = (value ?? '').toString()
  const len = str.length > 0 ? str.length : minCh
  const bounded = Math.min(Math.max(len, minCh), maxCh)
  return `${bounded}ch`
}

const startEditSpeech = (speech, field) => {
  editableSpeeches.value.forEach(s => s.editing = null)
  speech.editing = field
}

//todo: move to utils + wsdc compatability.
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

const finishEditSpeech = (speech, field) => {
  speech.editing = null
  if (field === 'team_placement') {
    speech.team_points = getPointsForPlacement(speech.team_placement)
  }
}

const addRoundRow = () => {
  const existingRounds = editableSpeeches.value
    .map(s => parseInt(s.round, 10))
    .filter(n => !Number.isNaN(n))
  const nextRound = existingRounds.length ? Math.max(...existingRounds) + 1 : (editableSpeeches.value.length + 1)
  editableSpeeches.value.push({
    round: String(nextRound),
    motion: '',
    position: 'N/A',
    speaker_score: null,
    team_placement: '',
    team_points: null,
    team_debate_score: null,
    editing: null
  })
}

const removeRoundRow = (idx) => {
  if (idx >= 0 && idx < editableSpeeches.value.length) {
    editableSpeeches.value.splice(idx, 1)
  }
}

const saveToDatabase = async () => {
  isSaving.value = true

  const normalizeDate = (d) => {
    if (!d) return null
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
      const dt = new Date(d)
      if (Number.isNaN(dt.getTime())) return null
      return dt.toISOString().slice(0, 10)
    } catch (_) {
      return null
    }
  }

  try {
    const supabase = await getSupabaseClient()

    const tournamentNameFinal = (editableGeneral.value.tournamentName || lastScrapeInfo.value?.tournament || '').trim()
    if (!tournamentNameFinal) {
      throw new Error('Tournament name is required')
    }
    const debaterNameFinal = (editableGeneral.value.debaterName || lastScrapeInfo.value?.debaterName || '').trim()
    const partnerNameFinal = (editableGeneral.value.partner || lastScrapeInfo.value?.teamInfo?.partner || '').trim()
    const dateFinal = normalizeDate(editableGeneral.value.date || lastScrapeInfo.value?.date)

    // 1) Upsert tournament by name
    const tournamentRow = {
      name: tournamentNameFinal,
      start_date: dateFinal,
      format: 'BP',
      tabbycat_url: String(tabbycatUrl.value || '') || null
    }
    const { data: tournamentsData, error: tErr } = await supabase
      .from('tournaments')
      .upsert(tournamentRow, { onConflict: 'name,start_date' })
      .select()
    if (tErr) throw tErr
    const tournamentInserted = Array.isArray(tournamentsData) ? tournamentsData[0] : tournamentsData
    const tournamentId = tournamentInserted?.id
    if (!tournamentId) throw new Error('Failed to resolve tournament id')

    const { error: delResultsErr } = await supabase
      .from('debate_results')
      .delete()
      .eq('tournament_id', tournamentId)
    if (delResultsErr) throw delResultsErr

    const { error: delRoundsErr } = await supabase
      .from('debate_rounds')
      .delete()
      .eq('tournament_id', tournamentId)
    if (delRoundsErr) throw delRoundsErr

    const roundsUnique = []
    const seen = new Set()
    for (const s of editableSpeeches.value) {
      const r = String(s.round ?? '').trim()
      if (!r || seen.has(r)) continue
      seen.add(r)
      roundsUnique.push({
        tournament_id: tournamentId,
        round: r,
        motion: (s.motion || '').trim() || null,
        date: dateFinal
      })
    }

    let roundIdByLabel = {}
    if (roundsUnique.length) {
      const { data: insertedRounds, error: insRErr } = await supabase
        .from('debate_rounds')
        .insert(roundsUnique)
        .select()
      if (insRErr) throw insRErr
      roundIdByLabel = (insertedRounds || []).reduce((acc, row) => {
        acc[row.round] = row.id
        return acc
      }, {})
    }

    const resultsRows = editableSpeeches.value.map((s) => {
      const roundLabel = String(s.round ?? '').trim()
      const roundId = roundIdByLabel[roundLabel] || null
      const teamScore = (s.team_debate_score != null && s.team_debate_score !== '')
        ? Number(s.team_debate_score)
        : (getPointsForPlacement(s.team_placement) ?? (s.team_points != null ? Number(s.team_points) : null))
      
      const positionValue = s.position && s.position !== 'N/A' ? mapPosition(s.position) : null
      
      return {
        round_id: roundId,
        tournament_id: tournamentId,
        speaker1_name: debaterNameFinal || null,
        speaker2_name: partnerNameFinal || null,
        position: positionValue,
        result: s.team_placement || null,
        team_score: teamScore,
        speaker1_score: (s.speaker_score != null && s.speaker_score !== '') ? Number(s.speaker_score) : null,
        speaker2_score: null
      }
    })

    if (resultsRows.length) {
      const { error: insResErr } = await supabase
        .from('debate_results')
        .insert(resultsRows)
      if (insResErr) throw insResErr
    }

    const teamStatsRow = {
      tournament_id: tournamentId,
      team_name: (editableGeneral.value.teamName || lastScrapeInfo.value?.teamInfo?.team_name || null),
      partner_name: partnerNameFinal || null,
      total_points: (editableGeneral.value.teamTotalPoints != null ? Number(editableGeneral.value.teamTotalPoints) : null),
      total_speaker_score: (editableGeneral.value.teamTotalSpeakerScore != null ? Number(editableGeneral.value.teamTotalSpeakerScore) : null),
      first_places: null,
      second_places: null
    }
    const { error: teamStatsErr } = await supabase
      .from('team_statistics')
      .upsert(teamStatsRow, { onConflict: 'tournament_id' })
    if (teamStatsErr) throw teamStatsErr

    alert('Saved to database')
  } catch (error) {
    console.error('Error saving:', error)
    alert(`Error saving data: ${error.message || error}`)
  } finally {
    isSaving.value = false
  }
}

const startScraping = async () => {
  if (!tabbycatUrl.value || !firstName.value || !lastName.value) return

  isScraping.value = true
  editableRounds.value = []
  editableSpeeches.value = []
  editableGeneral.value = {
    tournamentName: '',
    debaterName: '',
    speakerRank: null,
    speechesFound: null,
    individualSpeakerScore: null,
    partner: '',
    teamName: '',
    date: '',
    teamTotalPoints: null,
    teamTotalSpeakerScore: null
  }
  generalEditing.value = null
  
  emit('scrape-started', tabbycatUrl.value)

  try {
    const scrapeData = {
      url: String(tabbycatUrl.value || ''),
      firstName: String(firstName.value || ''),
      lastName: String(lastName.value || ''),
      institution: institution.value ? String(institution.value) : '',
      tournamentName: tournamentName.value ? String(tournamentName.value) : '',
      tournamentDate: tournamentDate.value ? String(tournamentDate.value) : ''
    }

    const payload = JSON.parse(JSON.stringify(scrapeData))

    const hasElectronInvoke = !!(window.electron && window.electron.ipcRenderer && window.electron.ipcRenderer.invoke)
    const hasElectronAPI = !!(window.electronAPI && (window.electronAPI.scrapeTabbycat || window.electronAPI.invoke))
    let result
    if (hasElectronInvoke) {
      result = await window.electron.ipcRenderer.invoke('scrape-tabbycat', payload)
    } else if (hasElectronAPI && window.electronAPI.scrapeTabbycat) {
      result = await window.electronAPI.scrapeTabbycat(payload)
    } else if (hasElectronAPI && window.electronAPI.invoke) {
      result = await window.electronAPI.invoke('scrape-tabbycat', payload)
    } else {
      throw new Error('IPC bridge unavailable. Ensure preload exposes scrape-tabbycat.')
    }
    
    if (result.success) {
      lastScrapeInfo.value = {
        tournament: result.data.tournamentName || 'Unknown Tournament',
        debaterName: result.data.debaterName || `${firstName.value} ${lastName.value}`,
        speechesFound: result.data.speechesFound || 0,
        speakerRank: result.data.speakerRank,
        teamRank: result.data.teamRank,
        speakerStats: result.data.rawData?.speaker_stats || {},
        teamInfo: result.data.rawData?.team_info || {},
        teamStats: result.data.rawData?.team_stats || {},
        roundResults: result.data.rawData?.round_results || [],
        rankings: result.data.rawData?.rankings || {},
        speeches: result.data.speeches || [],
        motions: result.data.rawData?.motions || {},
        date: new Date().toISOString()
      }

      populateEditableRounds()

      emit('scrape-completed', {
        success: true,
        data: result.data
      })

      tabbycatUrl.value = ''
      firstName.value = ''
      lastName.value = ''
      institution.value = ''
      tournamentName.value = ''
      tournamentDate.value = ''
    } else {
      throw new Error(result.error || 'Unknown scraping error')
    }

  } catch (error) {
  
    emit('scrape-completed', {
      success: false,
    })
  }
  isScraping.value = false
}
</script>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>
