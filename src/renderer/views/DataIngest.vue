<template>
  <div class="min-h-screen p-8 font-sans overflow-auto bg-bg text-primary">
    <div class="max-w-7xl mx-auto space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-primary mb-2">Data Ingest</h1>
          <p class="text-secondary text-lg">Import and manage debate data from various sources</p>
        </div>
      </div>

      <Loader v-if="isLoading" />

      <div 
        v-else
        class="grid grid-cols-12 gap-6 auto-rows-min"
      >
        <IngestCard 
          title="Tabbycat Tournament Scraper" 
          :grid-span="12"
          icon="globe"
        > 
          <TabbycatScraper @scrape-started="onScrapeStarted" @scrape-completed="onScrapeCompleted" />
        </IngestCard>

        <IngestCard 
          title="Add Partner" 
          :grid-span="3"
          icon="users"
        >
          <PartnerIngest @partner-added="onPartnerAdded" />
        </IngestCard>

        <IngestCard 
          title="Add Tournament" 
          :grid-span="3"
          icon="trophy"
        >
          <TournamentIngest @tournament-added="onTournamentAdded" />
        </IngestCard>

        <IngestCard 
          title="Bulk Data Import" 
          :grid-span="6"
          icon="upload"
        >
          <BulkDataIngest @data-imported="onDataImported" />
        </IngestCard>

        <IngestCard 
          title="Add Debate Round" 
          :grid-span="6"
          icon="message-circle"
        >
          <DebateRoundIngest @round-added="onRoundAdded" />
        </IngestCard>
      </div>

      <div v-if="statusMessages.length > 0" class="space-y-2">
        <div 
          v-for="(message, index) in statusMessages" 
          :key="index"
          :class="[
            'p-4 rounded-lg border',
            message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
            message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            'bg-blue-500/10 border-blue-500/20 text-blue-400'
          ]"
        >
          <div class="flex justify-between items-start">
            <span>{{ message.text }}</span>
            <button @click="removeMessage(index)" class="text-muted hover:text-primary ml-4">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getSupabaseClient } from '../lib/supabaseClient.js'
import IngestCard from '../components/IngestCard.vue'
import TabbycatScraper from '../components/TabbycatScraper.vue'
import PartnerIngest from '../components/PartnerIngest.vue'
import TournamentIngest from '../components/TournamentIngest.vue'
import BulkDataIngest from '../components/BulkDataIngest.vue'
import DebateRoundIngest from '../components/DebateRoundIngest.vue'
import Loader from '../components/LoadingState.vue'

let supabase

const isLoading = ref(false)
const statusMessages = ref([])

const addStatusMessage = (text, type = 'info') => {
  statusMessages.value.push({ text, type, timestamp: Date.now() })
  setTimeout(() => {
    statusMessages.value = statusMessages.value.filter(m => m.timestamp !== statusMessages.value[statusMessages.value.length - 1]?.timestamp)
  }, 5000)
}

const removeMessage = (index) => {
  statusMessages.value.splice(index, 1)
}
const onScrapeStarted = (url) => {
  addStatusMessage(`Started scraping Tabbycat tournament: ${url}`, 'info')
}

const onScrapeCompleted = (result) => {
  if (result.success) {
    addStatusMessage(`Successfully scraped ${result.data.speechesAdded} speeches from ${result.data.tournament}`, 'success')
  } else {
    addStatusMessage(`Failed to scrape tournament: ${result.error}`, 'error')
  }
}

const onPartnerAdded = (partner) => {
  addStatusMessage(`Successfully added partner: ${partner.name}`, 'success')
}

const onTournamentAdded = (tournament) => {
  addStatusMessage(`Successfully added tournament: ${tournament.name}`, 'success')
}

const onDataImported = (result) => {
  addStatusMessage(`Successfully imported ${result.count} records`, 'success')
}

const onRoundAdded = (round) => {
  addStatusMessage(`Successfully added debate round for ${round.tournament}`, 'success')
}

onMounted(async () => {
  supabase = await getSupabaseClient()
})
</script>

<style scoped>
.grid {
  display: grid;
  gap: 1.5rem;
}
.grid-cols-12 {
  grid-template-columns: repeat(12, minmax(0, 1fr));
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
