<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        Partner Name
      </label>
      <input
        v-model="partnerName"
        type="text"
        placeholder="Enter partner's name"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        @keyup.enter="addPartner"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        School/Institution (Optional)
      </label>
      <input
        v-model="partnerSchool"
        type="text"
        placeholder="School or institution"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        Email (Optional)
      </label>
      <input
        v-model="partnerEmail"
        type="email"
        placeholder="partner@example.com"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
      />
    </div>

    <button
      @click="addPartner"
      :disabled="!partnerName || isAdding"
      :class="[
        'w-full py-2 px-4 rounded-lg font-medium transition-colors',
        (!partnerName || isAdding)
          ? 'bg-surface-hover text-muted cursor-not-allowed'
          : 'bg-accent text-white hover:bg-accent/90'
      ]"
    >
      <span v-if="isAdding" class="flex items-center justify-center">
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        Adding...
      </span>
      <span v-else>
        Add Partner
      </span>
    </button>

    <div v-if="recentPartners.length > 0" class="mt-4">
      <div class="text-sm text-primary font-medium mb-2">Recently Added Partners</div>
      <div class="space-y-2 max-h-32 overflow-y-auto">
        <div
          v-for="partner in recentPartners"
          :key="partner.id"
          class="flex items-center justify-between p-2 bg-surface-hover rounded-lg"
        >
          <div>
            <div class="text-sm text-primary">{{ partner.name }}</div>
            <div v-if="partner.school" class="text-xs text-muted">{{ partner.school }}</div>
          </div>
          <div class="text-xs text-muted">
            {{ new Date(partner.created_at).toLocaleDateString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSupabaseClient } from '../lib/supabaseClient.js'

const emit = defineEmits(['partner-added'])

const partnerName = ref('')
const partnerSchool = ref('')
const partnerEmail = ref('')
const isAdding = ref(false)
const recentPartners = ref([])

let supabase

const loadRecentPartners = async () => {
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error
    recentPartners.value = data || []
  } catch (error) {
    console.error('Error loading recent partners:', error)
  }
}

const addPartner = async () => {
  if (!partnerName.value.trim()) {
    return
  }

  isAdding.value = true

  try {
    const partnerData = {
      name: partnerName.value.trim(),
      school: partnerSchool.value.trim() || null,
      email: partnerEmail.value.trim() || null,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('partners')
      .insert([partnerData])
      .select()

    if (error) throw error

    const addedPartner = data[0]
    
    emit('partner-added', addedPartner)

    partnerName.value = ''
    partnerSchool.value = ''
    partnerEmail.value = ''

    await loadRecentPartners()

  } catch (error) {
    console.error('Error adding partner:', error)
    alert('Failed to add partner: ' + error.message)
  } finally {
    isAdding.value = false
  }
}

onMounted(async () => {
  supabase = await getSupabaseClient()
  await loadRecentPartners()
})
</script>
