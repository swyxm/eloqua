<template>
  <div class="mb-4 flex items-center gap-2 flex-wrap">
    <div v-if="showMetricToggle" class="relative">
      <button
        type="button"
        class=" z-[999] flex items-center gap-2 rounded border border-border p-1 text-xs text-muted bg-bg hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
        @click="openDropdown('metric')"
      >
        <span>Metric</span>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-if="metricDropdownOpen" class="z-[999] absolute left-0 bg-bg border border-border rounded-lg shadow-lg p-1 min-w-[125px] mt-1">
        <label :class="['flex items-center gap-1 px-1 py-1 cursor-pointer text-xs rounded hover:bg-surface-hover', filters.metric === 'score' ? 'bg-surface-hover text-primary' : 'text-muted']">
          <input
            type="radio"
            name="metric"
            :checked="filters.metric === 'score'"
            @change="updateFilter('metric', 'score')"
            class="border-border"
          />
          <span>Speaker Score</span>
        </label>
        <label :class="['flex items-center gap-1 px-1 py-1 cursor-pointer text-xs rounded hover:bg-surface-hover', filters.metric === 'points' ? 'bg-surface-hover text-primary' : 'text-muted']">
          <input
            type="radio"
            name="metric"
            :checked="filters.metric === 'points'"
            @change="updateFilter('metric', 'points')"
            class="border-border"
          />
          <span>Round Points</span>
        </label>
      </div>
    </div>
    
    <div class="relative">
      <button
        type="button"
        class="flex items-center gap-2 rounded border border-border p-1 text-xs text-muted bg-bg hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
        @click="openDropdown('format')"
      >
        <span>{{ (filters.formats || []).length === 0 ? 'Format' : (filters.formats || []).length === 1 ? filters.formats[0] : `${(filters.formats || []).length} Formats` }}</span>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-if="formatDropdownOpen" class="z-[999] absolute left-0 bg-bg border border-border rounded-lg shadow-lg p-1 min-w-[60px] mt-1">
        <label :class="['flex items-center gap-1 px-1 py-1 cursor-pointer text-xs rounded hover:bg-surface-hover', filters.formats && filters.formats.includes('BP') ? 'bg-surface-hover text-primary' : 'text-muted']">
          <input
            type="checkbox"
            :checked="filters.formats && filters.formats.includes('BP')"
            @change="updateFormatFilter('BP', $event.target.checked)"
            class="rounded border-border"
          />
          <span>BP</span>
        </label>
        <label :class="['flex items-center gap-1 px-1 py-1 cursor-pointer text-xs rounded hover:bg-surface-hover', filters.formats && filters.formats.includes('WSDC') ? 'bg-surface-hover text-primary' : 'text-muted']">
          <input
            type="checkbox"
            :checked="filters.formats && filters.formats.includes('WSDC')"
            @change="updateFormatFilter('WSDC', $event.target.checked)"
            class="rounded border-border"
          />
          <span>WSDC</span>
        </label>
      </div>
    </div>
    
    <div class="relative">
      <button
        type="button"
        class="flex items-center gap-2 rounded border border-border px-1 py-1 text-xs text-muted bg-bg hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
        @click="openDropdown('types')"
      >
        <span>Types</span>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-if="typesDropdownOpen" class="z-[999] absolute left-0 bg-bg border border-border rounded-lg shadow-lg p-1 min-w-[100px] mt-1">
        <label :class="['flex items-center gap-1 px-1 py-1 cursor-pointer text-xs rounded hover:bg-surface-hover', filters.showTournaments ? 'bg-surface-hover text-primary' : 'text-muted']">
          <input
            type="checkbox"
            v-model="filters.showTournaments"
            @change="updateFilter('showTournaments', $event.target.checked)"
            class="rounded border-border"
          />
          <span>Tournaments</span>
        </label>
        <label :class="['flex items-center gap-1 px-1 py-1 cursor-pointer text-xs rounded hover:bg-surface-hover', filters.showPractice ? 'bg-surface-hover text-primary' : 'text-muted']">
          <input
            type="checkbox"
            v-model="filters.showPractice"
            @change="updateFilter('showPractice', $event.target.checked)"
            class="rounded border-border"
          />
          <span>Practice</span>
        </label>
      </div>
    </div>
    
    <div class="relative">
      <button
        type="button"
        class="flex items-center gap-1 rounded border border-border pl-1 py-1 text-xs text-muted bg-bg hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
        @click="openDropdown('date')"
      >
        <span class="font-regular">{{ displayDate() }}</span>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-if="dateDropdownOpen" class="z-[999] absolute left-0 z-50 bg-bg border border-border rounded-lg pt-2 pb-2 shadow-lg min-w-[150px] max-h-56 overflow-y-auto mt-1">
        <label
          v-for="option in dateOptions"
          :key="option.value || 'all'"
          :class="['flex items-center gap-2 px-2 py-1 cursor-pointer text-xs rounded hover:bg-surface-hover', filters.dateRange === option.value ? 'bg-surface-hover text-primary' : 'text-muted']"
        >
          <input
            type="radio"
            name="date-filter"
            :checked="filters.dateRange === option.value"
            @change="updateDateFilter(option.value)"
            class="border-border"
          />
          <span>{{ option.label }}</span>
        </label>
        
        <div v-if="filters.dateRange === 'custom'" class="flex items-center gap-1 mt-2 px-2">
          <input
            type="date"
            v-model="filters.startDate"
            @change="updateFilter('startDate', $event.target.value)"
            class="w-20 rounded border border-border pl-1 py-1 text-xs bg-bg focus:outline-none focus:ring-1 focus:ring-accent/20"
          />
          <span class="text-xs text-muted">to</span>
          <input
            type="date"
            v-model="filters.endDate"
            @change="updateFilter('endDate', $event.target.value)"
            class="w-20 rounded border border-border pl-1 py-1 text-xs bg-bg focus:outline-none focus:ring-1 focus:ring-accent/20"
          />
        </div>
      </div>
    </div>
    
    <div v-if="showPartnerSelector" class="relative">
      <button
        type="button"
        class="flex items-center gap-2 rounded border border-border pl-1 py-1 text-xs text-muted bg-bg hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
        @click="openDropdown('partners')"
      >
        <span>{{ displayPartnerText() }}</span>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-if="partnersDropdownOpen" class="z-[999] absolute left-0 z-50 bg-bg border border-border rounded-lg shadow-lg p-1 min-w-[135px] mt-1">
        <div class="mb-2">
          <input
            type="text"
            v-model="partnerSearch"
            placeholder="Search partners..."
            class="w-full p-1 text-xs bg-bg border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent/20"
          />
        </div>
        
        <div v-if="filteredPartners.length > 0" class="max-h-32 overflow-y-auto">
          <label
            v-for="partner in filteredPartners"
            :key="partner"
            :class="['flex items-center gap-1 px-1 py-1 cursor-pointer text-xs rounded hover:bg-surface-hover', (filters.selectedPartners || []).includes(partner) ? 'bg-surface-hover text-primary' : 'text-muted']"
          >
            <input
              type="checkbox"
              :checked="(filters.selectedPartners || []).includes(partner)"
              @change="updatePartnerFilter(partner, $event.target.checked)"
              class="rounded border-border"
            />
            <span>{{ partner }}</span>
          </label>
        </div>
        
        <div v-else class="p-1 text-xs text-muted text-center">
          {{ availablePartners.length === 0 ? 'No partners available' : 'No partners found' }}
        </div>
      </div>
    </div>
    
    <div v-if="showTournamentCheckboxes" class="relative">
      <button
        type="button"
        class="flex items-center gap-2 rounded border border-border pl-1 py-1 text-xs text-muted bg-bg hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
        @click="openDropdown('tournaments')"
      >
        <span>{{ displayTournamentText() }}</span>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-if="tournamentsDropdownOpen" class="z-[999] absolute left-0 z-50 bg-bg border border-border rounded-lg shadow-lg p-1 w-[155px] mt-1">
        <div class="mb-2">
          <input
            type="text"
            v-model="tournamentSearch"
            placeholder="Search tournaments..."
            class="w-full p-1 text-xs bg-bg border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent/20"
          />
        </div>
        
        <div v-if="filteredTournaments.length > 0" class="max-h-32 overflow-y-auto">
          <label
            v-for="tournament in filteredTournaments"
            :key="tournament.id || tournament.name"
            :class="['flex items-center gap-2 px-1 py-1 cursor-pointer text-xs rounded hover:bg-surface-hover', (filters.selectedTournaments || []).includes(tournament.id || tournament.name) ? 'bg-surface-hover text-primary' : 'text-muted']"
          >
            <input
              type="checkbox"
              :checked="(filters.selectedTournaments || []).includes(tournament.id || tournament.name)"
              @change="updateTournamentFilter(tournament.id || tournament.name, $event.target.checked)"
              class="rounded border-border flex-shrink-0"
            />
            <span class="truncate">{{ tournament.name }}</span>
          </label>
        </div>
        
        <div v-else class="p-1 text-xs text-muted text-center">
          {{ tournamentOptions.length === 0 ? 'No tournaments available' : 'No tournaments found' }}
        </div>
      </div>
    </div>

    <button 
      @click="resetFilters"
      class="p-1 text-xs bg-surface border border-border rounded text-muted hover:text-primary transition-colors"
      title="Reset filters"
    >
      <RotateCcw class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>


//----------------------------------------

import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RotateCcw } from 'lucide-vue-next'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  cardType: {
    type: String,
    required: true,
    validator: (value) => ['tournament', 'partner', 'position', 'progress', 'partnerProgress'].includes(value)
  },
  availablePartners: {
    type: Array,
    default: () => []
  },
  tournamentOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:filters'])
const typesDropdownOpen = ref(false)
const metricDropdownOpen = ref(false)
const formatDropdownOpen = ref(false)
const partnersDropdownOpen = ref(false)
const tournamentsDropdownOpen = ref(false)
const dateDropdownOpen = ref(false)
const partnerSearch = ref('')
const tournamentSearch = ref('')

const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    typesDropdownOpen.value = false
    metricDropdownOpen.value = false
    formatDropdownOpen.value = false
    partnersDropdownOpen.value = false
    tournamentsDropdownOpen.value = false
    dateDropdownOpen.value = false
  }
}
const openDropdown = (dropdownType) => {
  metricDropdownOpen.value = dropdownType === 'metric' ? !metricDropdownOpen.value : false
  formatDropdownOpen.value = dropdownType === 'format' ? !formatDropdownOpen.value : false
  typesDropdownOpen.value = dropdownType === 'types' ? !typesDropdownOpen.value : false
  partnersDropdownOpen.value = dropdownType === 'partners' ? !partnersDropdownOpen.value : false
  tournamentsDropdownOpen.value = dropdownType === 'tournaments' ? !tournamentsDropdownOpen.value : false
  dateDropdownOpen.value = dropdownType === 'date' ? !dateDropdownOpen.value : false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const showMetricToggle = computed(() => props.cardType === 'progress')
const showPartnerSelector = computed(() => ['partner', 'partnerProgress'].includes(props.cardType))
const showTournamentCheckboxes = computed(() => props.cardType === 'tournament')
const dateOptions = [
  { value: null, label: 'All Time', display: 'All Time' },
  { value: '7d', label: 'Last 7 days', display: 'Week' },
  { value: '30d', label: 'Last 30 days', display: 'Month' },
  { value: '90d', label: 'Last 90 days', display: '3 Months' },
  { value: '6m', label: 'Last 6 months', display: '6 Months' },
  { value: '1y', label: 'Last year', display: 'Year' },
  { value: 'custom', label: 'Custom', display: 'Custom' }
]
const updateFilter = (key, value) => {
  const newFilters = { ...props.filters, [key]: value }
  emit('update:filters', newFilters)
}
const updateFormatFilter = (format, checked) => {
  const currentFormats = props.filters.formats || []
  const newFormats = checked 
    ? [...currentFormats, format]
    : currentFormats.filter(f => f !== format)
  emit('update:filters', { ...props.filters, formats: newFormats })
}
const updatePartnerFilter = (partner, checked) => {
  const currentPartners = props.filters.selectedPartners || []
  const newPartners = checked 
    ? [...currentPartners, partner]
    : currentPartners.filter(p => p !== partner)
  emit('update:filters', { ...props.filters, selectedPartners: newPartners })
}
const updateTournamentFilter = (tournament, checked) => {
  const currentTournaments = props.filters.selectedTournaments || []
  const newTournaments = checked 
    ? [...currentTournaments, tournament]
    : currentTournaments.filter(t => t !== tournament)
  emit('update:filters', { ...props.filters, selectedTournaments: newTournaments })
}
const displayPartnerText = () => {
  const partners = props.filters.selectedPartners || []
  if (partners.length === 0) return 'Partners'
  if (partners.length === 1) return partners[0]
  return `${partners.length} Partners`
}
const displayTournamentText = () => {
  const tournaments = props.filters.selectedTournaments || []
  if (tournaments.length === 0) return 'Tournaments'
  if (tournaments.length === 1) {
    const tournament = props.tournamentOptions.find(t => (t.id || t.name) === tournaments[0])
    return tournament?.name || tournaments[0]
  }
  return `${tournaments.length} Tournaments`
}
const displayDate = () => {
  if (props.filters.dateRange === 'custom') {
    if (props.filters.startDate && props.filters.endDate) {
      const startDate = new Date(props.filters.startDate + 'T00:00:00')
      const endDate = new Date(props.filters.endDate + 'T00:00:00')
      const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const endFormatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return `${startFormatted} to ${endFormatted}`
    }
    return 'Custom range'
  }
  return dateOptions.find(opt => opt.value === props.filters.dateRange)?.display || 'All Time'
}
const updateDateFilter = (value) => {
  let newFilters = { ...props.filters, dateRange: value }
    if (value !== 'custom') {
    newFilters.startDate = ''
    newFilters.endDate = ''
  }
  if (value && value !== 'custom') {
    const endDate = new Date()
    let startDate = new Date()
    
    switch (value) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '6m':
        startDate.setMonth(endDate.getMonth() - 6)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }
    
    newFilters.startDate = startDate.toISOString().split('T')[0]
    newFilters.endDate = endDate.toISOString().split('T')[0]
  }
  emit('update:filters', newFilters)
}
const filteredPartners = computed(() => {
  if (!partnerSearch.value) return props.availablePartners
  return props.availablePartners.filter(partner => 
    partner.toLowerCase().includes(partnerSearch.value.toLowerCase())
  )
})
const filteredTournaments = computed(() => {
  if (!tournamentSearch.value) return props.tournamentOptions
  return props.tournamentOptions.filter(tournament => 
    tournament.name.toLowerCase().includes(tournamentSearch.value.toLowerCase())
  )
})
const resetFilters = () => {
  const defaults = {
    formats: [],
    showTournaments: true,
    showPractice: true,
    startDate: '',
    endDate: '',
    dateRange: null,
    selectedTournaments: [],
    metric: 'score',
    selectedPartners: []
  }
  const relevant = Object.fromEntries(
    Object.entries(defaults).filter(([key]) => {
      if (key === 'metric' && !showMetricToggle.value) return false
      if (key === 'selectedPartner' && !showPartnerSelector.value) return false
      if (key === 'selectedTournaments' && !showTournamentCheckboxes.value) return false
      return true
    })
  )
  emit('update:filters', relevant)
}
</script>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}
input[type="date"]::-webkit-inner-spin-button,
input[type="date"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="date"] {
  -webkit-appearance: none;
  appearance: none;
}
</style>
