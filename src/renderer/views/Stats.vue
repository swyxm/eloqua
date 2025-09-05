    <template>
    <div class="min-h-screen p-8 font-sans overflow-auto bg-bg text-primary">
        <div class="max-w-7xl mx-auto space-y-8">
        <div class="flex items-center justify-between">
            <div>
            <h1 class="text-4xl font-bold text-primary mb-2">Statistics Dashboard</h1>
            <p class="text-secondary text-lg">Track your debate performance and progress</p>
            </div>
        </div>

        <div v-if="isLoading" class="flex justify-center items-center py-16">
            <div class="relative">
            <div class="w-10 h-10 border-4 border-surface-hover rounded-full"></div>
            <div class="absolute top-0 left-0 w-10 h-10 border-4 border-transparent border-t-accent rounded-full animate-spin"></div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-card backdrop-blur-md rounded-xl shadow-lg border border-border p-6">
                <div class="text-sm font-semibold text-primary mb-3">Overall Performance</div>
                <div class="text-xs text-muted mb-1">Avg Speaks</div>
                <div class="text-2xl font-bold text-primary mb-3">{{ overallAvgScore.toFixed(2) }}</div>
                <div class="text-xs text-muted mb-1">Avg Points</div>
                <div class="text-2xl font-bold text-primary">{{ overallAvgPoints.toFixed(2) }}</div>
                </div>
            <div class="bg-card backdrop-blur-md rounded-xl shadow-lg border border-border p-6">
                <div class="text-sm font-semibold text-primary mb-3">Tournament Comparison</div>
                <div v-if="tournamentOptions.length === 0" class="text-center text-muted py-4">
                    No tournaments to compare
                </div>
                <div v-else class="flex items-stretch">
                    <div class="flex-1 pr-3">
                    <select v-model="compTournamentA" class="w-full px-2 py-1 bg-bg border border-border rounded text-xs mb-2">
                        <option v-for="t in tournamentOptions" :key="'qa'+(t.id || t.name)" :value="t.id || t.name">{{ t.name }}</option>
                    </select>
                    <div class="text-xs text-muted">Speaks</div>
                    <div class="text-lg font-bold text-primary">{{ compTournamentAStats.avgScore.toFixed(1) }}</div>
                    <div class="text-xs text-muted mt-1">Points</div>
                    <div class="text-lg font-bold text-primary">{{ compTournamentAStats.avgPoints.toFixed(1) }}</div>
                    </div>
                    
                    <div class="w-px bg-border mx-2"></div>
                    
                    <div class="flex-1 pl-3">
                    <select v-model="compTournamentB" class="w-full px-2 py-1 bg-bg border border-border rounded text-xs mb-2">
                        <option v-for="t in tournamentOptions" :key="'qb'+(t.id || t.name)" :value="t.id || t.name">{{ t.name }}</option>
                    </select>
                    <div class="text-xs text-muted">Speaks</div>
                    <div class="text-lg font-bold text-primary">{{ compTournamentBStats.avgScore.toFixed(1) }}</div>
                    <div class="text-xs text-muted mt-1">Points</div>
                    <div class="text-lg font-bold text-primary">{{ compTournamentBStats.avgPoints.toFixed(1) }}</div>
                    </div>
                </div>
                </div>
            <div class="bg-card backdrop-blur-md rounded-xl shadow-lg border border-border p-6">
                <div class="text-sm font-semibold text-primary mb-3">Partner Comparison</div>
                <div v-if="availablePartners.length === 0" class="text-center text-muted py-4">
                    No partners to compare
                </div>
                <div v-else class="flex items-stretch">
                    <div class="flex-1 pr-3">
                    <select v-model="compPartnerA" class="w-full px-2 py-1 bg-bg border border-border rounded text-xs mb-2">
                        <option v-for="p in availablePartners" :key="'pqa'+p" :value="p">{{ p }}</option>
                    </select>
                    <div class="text-xs text-muted">Speaks</div>
                    <div class="text-lg font-bold text-primary">{{ compPartnerAStats.avgScore.toFixed(1) }}</div>
                    <div class="text-xs text-muted mt-1">Points</div>
                    <div class="text-lg font-bold text-primary">{{ compPartnerAStats.avgPoints.toFixed(1) }}</div>
                    </div>
                    
                    <div class="w-px bg-border mx-2"></div>
                    
                    <div class="flex-1 pl-3">
                    <select v-model="compPartnerB" class="w-full px-2 py-1 bg-bg border border-border rounded text-xs mb-2">
                        <option v-for="p in availablePartners" :key="'pqb'+p" :value="p">{{ p }}</option>
                    </select>
                    <div class="text-xs text-muted">Speaks</div>
                    <div class="text-lg font-bold text-primary">{{ compPartnerBStats.avgScore.toFixed(1) }}</div>
                    <div class="text-xs text-muted mt-1">Points</div>
                    <div class="text-lg font-bold text-primary">{{ compPartnerBStats.avgPoints.toFixed(1) }}</div>
                    </div>
                </div>
                </div>
            <div class="bg-card backdrop-blur-md rounded-xl shadow-lg border border-border p-6">
            <div class="text-sm font-semibold text-primary mb-3">Quick Stats</div>
            <div class="space-y-2">
                <div class="flex justify-between">
                <span class="text-xs text-muted">Total Speeches:</span>
                <span class="text-sm font-semibold text-primary">{{ totalSpeeches }}</span>
            </div>
                <div class="flex justify-between">
                <span class="text-xs text-muted">Avg Score:</span>
                <span class="text-sm font-semibold text-primary">{{ avgScore.toFixed(1) }}</span>
            </div>
                <div class="flex justify-between">
                <span class="text-xs text-muted">Tournaments:</span>
                <span class="text-sm font-semibold text-primary">{{ totalTournaments }}</span>
                </div>
                <div class="flex justify-between">
                <span class="text-xs text-muted">Win Rate:</span>
                <span class="text-sm font-semibold text-primary">{{ winRate.toFixed(1) }}%</span>
                </div>
                    </div>
                </div>
                </div>

        <div v-if="isLoading" class="flex justify-center items-center py-16">
            <div class="relative">
            <div class="w-10 h-10 border-3 border-surface-hover rounded-full"></div>
            <div class="absolute top-0 left-0 w-10 h-10 border-3 border-transparent border-t-accent rounded-full animate-spin"></div>
            </div>
            </div>
        
        <div 
            v-else
            ref="statsContainer"
            class="grid grid-cols-12 gap-6 auto-rows-min"
        >
            <StatCard 
            title="Tournament Performance" 
            :grid-span="4"
            :draggable="true"
            @dragstart="handleDragStart"
            @dragend="handleDragEnd"
            @drop="handleDrop"
            > 
            <Filter
                :filters="cardFilters.tournament"
                card-type="tournament"
                :available-partners="availablePartners"
                :tournament-options="tournamentOptions"
            />
            
            <div v-if="tournamentStats.length > 0">
                <div v-for="tournament in tournamentStats" :key="tournament.id" class="bg-surface rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold text-primary">{{ tournament.name }}</h4>
                    <span class="text-sm text-muted">{{ tournament.speechCount }} speeches</span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                    <span class="text-muted">Avg Score:</span>
                    <span class="ml-2 font-semibold text-primary">{{ tournament.avgScore.toFixed(1) }}</span>
                    </div>
                    <div>
                    <span class="text-muted">Avg Points:</span>
                    <span class="ml-2 font-semibold text-primary">{{ tournament.avgPoints.toFixed(1) }}</span>
                    </div>
                </div>
                </div>
            </div>
            <div v-else class="text-center text-muted py-8">
                No data matches the current filters.
            </div>
            </StatCard>

            <StatCard 
            title="Partner Performance" 
            :grid-span="4"
            :draggable="true"
            @dragstart="handleDragStart"
            @dragend="handleDragEnd"
            @drop="handleDrop"
            >
            <Filter
                :filters="cardFilters.partner"
                card-type="partner"
                :available-partners="availablePartners"
                :tournament-options="tournamentOptions"
                @update:filters="(newFilters) => cardFilters.partner = newFilters"
            />
            
            <div v-if="partnerStats.length > 0" class="space-y-2">
                <div 
                v-for="(partner, index) in partnerStats" 
                :key="partner.name" 
                class="group relative bg-surface-hover rounded-lg p-2 transition-all duration-200 hover:shadow-sm leaderboard-item"
                :style="{ animationDelay: `${index * 100}ms` }"
                >
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center space-x-3 min-w-0 flex-1">
                    <span class="text-sm font-semibold text-accent">#{{ index + 1 }}</span>
                    <h4 class="font-semibold text-primary text-sm truncate">{{ partner.name || 'No Partner' }}</h4>
            </div>
                    <div class="flex items-center space-x-3 flex-shrink-0">
                    <div class="group/stat relative flex items-center space-x-1">
                        <div class="relative w-8 h-8">
                        <ProgressRing 
                          :score="partner.avgScore" 
                          format="BP" 
                          size="small"
                        />
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-sm font-bold text-primary">
                            {{ partner.avgScore.toFixed(0) }}
                            </span>
                </div>
                    </div>
                        
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg text-xs opacity-0 group-hover/stat:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        <div class="font-semibold text-primary">{{ partner.avgScore.toFixed(1) }} average score</div>
                        <div class="text-muted">from {{ partner.speechCount }} speeches</div>
                        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-card"></div>
            </div>
            </div>

                    <div class="group/stat relative flex items-center space-x-1">
                        <svg class="w-6 h-6 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="12" y1="19" x2="12" y2="23" />
                        <line stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                        <span class="text-sm font-semibold text-primary cursor-help">{{ partner.speechCount }}</span>
                        
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg text-xs opacity-0 group-hover/stat:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        <div class="font-semibold text-primary">{{ partner.speechCount }} total speeches</div>
                        <div class="text-muted">with {{ partner.name }}</div>
                        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-card"></div>
            </div>
            </div>

                    <div class="group/stat relative flex items-center space-x-1">
                        <svg class="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3v18h18" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                        </svg>
                        <span class="text-sm font-semibold text-primary cursor-help">{{ (partner.winRate * 100).toFixed(1) }}%</span>
                        
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg text-xs opacity-0 group-hover/stat:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        <div class="font-semibold text-primary">{{ (partner.winRate * 100).toFixed(1) }}% win rate</div>
                        <div class="text-muted">{{ Math.round(partner.winRate * partner.speechCount) }} wins out of {{ partner.speechCount }} speeches</div>
                        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-card"></div>
            </div>
                </div>
                
                    <div class="group/stat relative flex items-center justify-center">
                        <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 11 5-5 5 5" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 17 5-5 5 5" />
                        </svg>
                        <span class="text-sm font-semibold text-primary cursor-help">{{ partner.avgPoints?.toFixed(1) || '0' }}</span>
                        
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg text-xs opacity-0 group-hover/stat:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        <div class="font-semibold text-primary">{{ partner.avgPoints?.toFixed(1) || '0.0' }} average points</div>
                        <div class="text-muted">per round with {{ partner.name }}</div>
                        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-card"></div>
                    </div>
                    </div>
                </div>
                    </div>
                </div>
                </div>
            <div v-else class="text-center text-muted py-8">
                Nothing to show yet — add a partner to your speeches to see this populate.
            </div>
            </StatCard>
            <StatCard 
            title="Position Performance" 
            :grid-span="4"
            :draggable="true"
            @dragstart="handleDragStart"
            @dragend="handleDragEnd"
            @drop="handleDrop"
            >
            <Filter
                :filters="cardFilters.position"
                card-type="position"
                :available-partners="availablePartners"
                :tournament-options="tournamentOptions"
                @update:filters="(newFilters) => cardFilters.position = newFilters"
            />
            
            <div v-if="hasPositionData" class="h-64 flex flex-col">
                <ChartLegend 
                type="dots"
                :items="positionLegendItems"
                />
                <div class="relative flex-1 min-h-0 overflow-hidden">
                <canvas ref="positionChart" class="w-full h-full"></canvas>
            </div>
            </div>
            <div v-else class="text-center text-muted py-8">
                No position data available
            </div>
            </StatCard>
            <StatCard 
            title="Progress Over Time" 
            :grid-span="6"
            :draggable="true"
            @dragstart="handleDragStart"
            @dragend="handleDragEnd"
            @drop="handleDrop"
            >


            <Filter
                :filters="cardFilters.progress"
                card-type="progress"
                :available-partners="availablePartners"
                :tournament-options="tournamentOptions"
                @update:filters="(newFilters) => cardFilters.progress = newFilters"
            />

            <div class="h-64 flex flex-col">
                <ChartLegend 
                v-if="hasProgressData"
                type="dots"
                :items="progressLegendItems"
                />
                <div class="relative flex-1 min-h-0 overflow-hidden">
                <canvas ref="progressChart" class="w-full h-full"></canvas>
            </div>
            </div>
            </StatCard>
            <StatCard 
            title="Partner Progress" 
            :grid-span="6"
            :draggable="true"
            @dragstart="handleDragStart"
            @dragend="handleDragEnd"
            @drop="handleDrop"
            >          
            <Filter
                :filters="cardFilters.partnerProgress"
                card-type="partnerProgress"
                :available-partners="availablePartners"
                :tournament-options="tournamentOptions"
                @update:filters="(newFilters) => cardFilters.partnerProgress = newFilters"
            />
            <div v-if="hasPartnerProgressData" class="h-64 flex flex-col">
                <ChartLegend 
                type="lineStyles"
                />
                
                <ChartLegend 
                type="partnerColors"
                :partners="partnerLegendItems"
                />
                
                <div class="relative flex-1 min-h-0 overflow-hidden">
                <canvas ref="partnerProgressChart" class="w-full h-full"></canvas>
                </div>
                </div>
            <div v-else class="text-center text-muted py-8">
                No partner progress data available
                </div>
            </StatCard>
        </div>
        </div>
    </div>
    </template>

    <script setup>
    import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue'
import { getSupabaseClient } from '../lib/supabaseClient.js'
import Chart from 'chart.js/auto'
import { mapPosition } from '../../shared/utils/positionMapping.js'
import ProgressRing from '../../shared/components/ProgressRing.vue'
import StatCard from '../components/StatCard.vue'
import Filter from '../components/Filter.vue'
import ChartLegend from '../components/ChartLegend.vue'
import { MicVocal, TrendingUp, ChevronsUp, ChevronUp, ChevronsDown, ChevronDown, Clock, RefreshCw, Trophy } from 'lucide-vue-next'

    let supabase

    const allSpeeches = ref([])
    const isLoading = ref(false)
    const tournamentStats = ref([])
    const partnerStats = ref([])
    const availablePartners = ref([])
    const totalSpeeches = ref(0)
    const avgScore = ref(0)
    const totalTournaments = ref(0)
    const winRate = ref(0)
    const overallAvgScore = ref(0)
    const overallAvgPoints = ref(0)
    const tournamentOptions = ref([])
    const compTournamentA = ref('')
    const compTournamentB = ref('')
    const compPartnerA = ref('')
    const compPartnerB = ref('')
    const compTournamentAStats = ref({ avgScore: 0, avgPoints: 0 })
    const compTournamentBStats = ref({ avgScore: 0, avgPoints: 0 })
    const compPartnerAStats = ref({ avgScore: 0, avgPoints: 0 })
    const compPartnerBStats = ref({ avgScore: 0, avgPoints: 0 })


    const cardFilters = reactive({
    tournament: {
        formats: [],
        showTournaments: true,
        showPractice: true,
        startDate: '',
        endDate: '',
        dateRange: null,
        selectedTournaments: []
    },
    partner: {
        formats: [],
        showTournaments: true,
        showPractice: true,
        startDate: '',
        endDate: '',
        dateRange: null,
        selectedTournaments: [],
        selectedPartners: []
    },
    position: {
        formats: [],
        showTournaments: true,
        showPractice: true,
        startDate: '',
        endDate: '',
        dateRange: null,
        selectedTournaments: []
    },
    progress: {
        formats: [],
        showTournaments: true,
        showPractice: true,
        startDate: '',
        endDate: '',
        dateRange: null,
        selectedTournaments: [],
        metric: 'score'
    },
    partnerProgress: {
        formats: [],
        showTournaments: true,
        showPractice: true,
        startDate: '',
        endDate: '',
        dateRange: null,
        selectedTournaments: [],
        selectedPartner: ''
    }
    })

    const progressChart = ref(null)
    const partnerProgressChart = ref(null)
    const positionChart = ref(null)
    let progressChartInstance = null
    let partnerProgressChartInstance = null
    let positionChartInstance = null

    const isDragging = ref(false)
    const draggedCard = ref(null)
    const statsContainer = ref(null)

    const loadStats = async () => {
    isLoading.value = true
    try {
        const { data: uploaded, error: uploadedErr } = await supabase
        .from('speeches')
        .select(`
            *,
            tournaments(name)
        `)
        .order('speech_date', { ascending: true })

        if (uploadedErr) throw uploadedErr

        const uploadedMapped = (uploaded || []).map(speech => ({
            ...speech,
            tournament_name: speech.tournaments?.name || 'Practice Session'
        }))

        // 2) Tournament round results → map to speech-like objects
        const { data: results, error: resultsErr } = await supabase
        .from('debate_results')
        .select(`
            id,
            result,
            team_score,
            speaker1_score,
            speaker2_score,
            speaker1_name,
            speaker2_name,
            position,
            tournament_id,
            round_id,
            tournaments:tournament_id ( name ),
            debate_rounds:round_id ( id, motion, date, created_at )
        `)
        .order('created_at', { referencedTable: 'debate_rounds', ascending: true })

        if (resultsErr) throw resultsErr

        const tournamentMapped = (results || []).map(r => ({
            id: `round_${r.round_id}_${r.id}`,
            tournament_id: r.tournament_id,
            round_number: r.debate_rounds?.round || '',
            round_type: 'tournament',
            debate_format: 'BP',
            position: r.position || '',
            motion: r.debate_rounds?.motion || '—',
            partner: r.speaker2_name || '-',
            llm_analysis: r.speaker1_score != null ? { score: Number(r.speaker1_score) } : (r.team_score != null ? { score: Number(r.team_score) } : {}),
            analysis_result: {},
            speech_date: r.debate_rounds?.date || r.debate_rounds?.created_at || new Date().toISOString(),
            place_in_round: r.result || null,
            team_score: r.team_score != null ? Number(r.team_score) : null,
            created_at: r.debate_rounds?.created_at || r.debate_rounds?.date || new Date().toISOString(),
            tournament_name: r.tournaments?.name || ''
        }))

        allSpeeches.value = [...uploadedMapped, ...tournamentMapped]
        
        if (allSpeeches.value.length > 0) {
        const tSet = new Map()
        
        // Add tournaments from speeches
        allSpeeches.value.forEach(s => {
            if (s.tournament_id && s.tournament_name) {
                const id = s.tournament_id
                const name = s.tournament_name
                if (!tSet.has(id)) tSet.set(id, { id, name })
            }
        })
        
        const { data: tournaments, error: tournamentsErr } = await supabase
            .from('tournaments')
            .select('id, name')
            .order('name')
        
        if (!tournamentsErr && tournaments) {
            tournaments.forEach(t => {
                if (!tSet.has(t.id)) tSet.set(t.id, { id: t.id, name: t.name })
            })
        }
        
        tournamentOptions.value = Array.from(tSet.values())
        
        updateAvailablePartners()
        compTournamentA.value = tournamentOptions.value[0]?.id || ''
        compTournamentB.value = tournamentOptions.value[1]?.id || compTournamentA.value
        compPartnerA.value = availablePartners.value[0] || ''
        compPartnerB.value = availablePartners.value[1] || compPartnerA.value

        updateTournamentStats()
        updatePartnerStats()

        updateGlobalStats()
        nextTick(() => {
            updateProgressChart()
            updatePartnerProgressChart()
            updatePositionChart()
        })
        updatePinnedComparisons()
        }
    } catch (error) {
        console.error('Error loading stats:', error)
    } finally {
        isLoading.value = false
    }
    }

    const applyCardFilters = (speeches, cardName) => {
    const filters = cardFilters[cardName]
    if (!filters) return speeches
    
    let filtered = speeches
    
    if (filters.formats && filters.formats.length > 0) {
        const formatSet = new Set(filters.formats)
        filtered = filtered.filter(s => formatSet.has(s.debate_format))
    }
    
    filtered = filtered.filter(s => {
        const hasTournamentId = Boolean(s.tournament_id)
        const hasTournamentName = Boolean(s.tournament_name)
        const isPractice = !hasTournamentId && !hasTournamentName
        const isTournament = hasTournamentId && hasTournamentName
        
        if (!filters.showPractice && !filters.showTournaments) {
        return false
        }
        
        if (!filters.showPractice && isPractice) {
        return false
        }
        
        if (!filters.showTournaments && isTournament) {
        return false
        }
        
        return true
    })
    
    if (filters.selectedTournaments && filters.selectedTournaments.length > 0 && filters.showTournaments) {
        const set = new Set(filters.selectedTournaments)
        filtered = filtered.filter(s => {
        const hasTournamentId = Boolean(s.tournament_id)
        const hasTournamentName = Boolean(s.tournament_name)
        const isPractice = !hasTournamentId && !hasTournamentName
        if (isPractice) return true 
        return set.has(s.tournament_id || s.tournament_name)
        })
    }
    
    if (filters.startDate) {
        filtered = filtered.filter(s => s.speech_date >= filters.startDate)
    }
    if (filters.endDate) {
        filtered = filtered.filter(s => s.speech_date <= filters.endDate)
    }
    
    if (filters.selectedPartners && filters.selectedPartners.length > 0) {
        const partnerSet = new Set(filters.selectedPartners)
        filtered = filtered.filter(s => partnerSet.has(s.partner))
    }
    if (filters.selectedPartner && filters.selectedPartner.trim() !== '') {
        filtered = filtered.filter(s => s.partner === filters.selectedPartner)
    }
    
    return filtered
    }

    const updateGlobalStats = () => {
    const speeches = allSpeeches.value
    totalSpeeches.value = speeches.length
    
    const scores = speeches.map(s => s.llm_analysis?.score).filter(Boolean)
    avgScore.value = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    overallAvgScore.value = avgScore.value
    
    const totalWins = speeches.filter(s => isWinPosition(s.place_in_round, s.debate_format)).length
    winRate.value = totalSpeeches.value > 0 ? (totalWins / totalSpeeches.value) * 100 : 0
    
    const tournamentMap = new Map()
    const tournamentIds = new Set()

    speeches.forEach(speech => {
        const tournamentId = speech.tournament_id
        if (tournamentId) tournamentIds.add(tournamentId)
    })
    totalTournaments.value = tournamentIds.size

    const pointsArr = speeches.map(s => calculatePoints(s))
    overallAvgPoints.value = pointsArr.length ? pointsArr.reduce((a,b)=>a+b,0)/pointsArr.length : 0
    }

    const updateTournamentStats = () => {
    const speeches = applyCardFilters(allSpeeches.value, 'tournament')
    
    const tournamentMap = new Map()
    
    speeches.forEach(speech => {
        if (speech.tournament_id && speech.tournament_name) {
        const tournamentId = speech.tournament_id
        const tournamentName = speech.tournament_name
        
        if (!tournamentMap.has(tournamentId)) {
            tournamentMap.set(tournamentId, {
            id: tournamentId,
            name: tournamentName,
            speeches: [],
            scores: [],
            points: []
            })
        }
        
        const tournament = tournamentMap.get(tournamentId)
        tournament.speeches.push(speech)
        
        if (speech.llm_analysis?.score) {
            tournament.scores.push(speech.llm_analysis.score)
        }
        
        const points = calculatePoints(speech)
        tournament.points.push(points)
        }
    })
    
    tournamentStats.value = Array.from(tournamentMap.values()).map(t => ({
        ...t,
        speechCount: t.speeches.length,
        avgScore: t.scores.length > 0 ? t.scores.reduce((a, b) => a + b, 0) / t.scores.length : 0,
        avgPoints: t.points.length > 0 ? t.points.reduce((a, b) => a + b, 0) / t.points.length : 0
    }))
    }

    const updatePartnerStats = () => {
    const speeches = applyCardFilters(allSpeeches.value, 'partner')
    const partnerMap = new Map()
    
    speeches.forEach(speech => {
        if (speech.partner && speech.partner.trim() !== '') {
        const partnerName = speech.partner
        
        if (!partnerMap.has(partnerName)) {
            partnerMap.set(partnerName, {
            name: partnerName,
            speeches: [],
            scores: [],
            wins: 0,
            total: 0
            })
        }
        
        const partner = partnerMap.get(partnerName)
        partner.speeches.push(speech)
        
        if (speech.llm_analysis?.score) {
            partner.scores.push(speech.llm_analysis.score)
        }
        
        const isWin = isWinPosition(speech.place_in_round, speech.debate_format)
        if (isWin) partner.wins++
        partner.total++
        }
    })
    
    partnerStats.value = Array.from(partnerMap.values()).map(p => ({
        ...p,
        speechCount: p.speeches.length,
        avgScore: p.scores.length > 0 ? p.scores.reduce((a, b) => a + b, 0) / p.scores.length : 0,
        winRate: p.total > 0 ? p.wins / p.total : 0,
        avgPoints: p.speeches.length > 0 ? p.speeches.map(s => calculatePoints(s)).reduce((a, b) => a + b, 0) / p.speeches.length : 0
    }))
    }

    const updateAvailablePartners = () => {
    const allPartnerNames = new Set()
    
    allSpeeches.value.forEach(speech => {
        if (speech.partner && speech.partner.trim() !== '') {
        allPartnerNames.add(speech.partner)
        }
    })
    
    availablePartners.value = Array.from(allPartnerNames).filter(p => p && p.trim() !== '')
    }

    const computeAgg = (speeches) => {
    const scores = speeches.map(s => s.llm_analysis?.score).filter(Boolean)
    const pts = speeches.map(s => calculatePoints(s))
    return {
        avgScore: scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : 0,
        avgPoints: pts.length ? pts.reduce((a,b)=>a+b,0)/pts.length : 0
    }
    }

    const updatePinnedComparisons = () => {
    const a = allSpeeches.value.filter(s => (s.tournament_id || s.tournament_name || 'Practice Session') === compTournamentA.value)
    const b = allSpeeches.value.filter(s => (s.tournament_id || s.tournament_name || 'Practice Session') === compTournamentB.value)
    compTournamentAStats.value = computeAgg(a)
    compTournamentBStats.value = computeAgg(b)

    const pa = allSpeeches.value.filter(s => (s.partner || 'No Partner') === compPartnerA.value)
    const pb = allSpeeches.value.filter(s => (s.partner || 'No Partner') === compPartnerB.value)
    compPartnerAStats.value = computeAgg(pa)
    compPartnerBStats.value = computeAgg(pb)
    }

    const calculatePoints = (speech) => {
    if (speech.round_type === 'tournament' && speech.team_score != null) {
        return Number(speech.team_score)
    }
    const placeInRound = speech.place_in_round
    const format = speech.debate_format
    
    if (!placeInRound) return 0
    if (format === 'BP') {
        switch (placeInRound) {
        case 'First Place': return 3
        case 'Second Place': return 2
        case 'Third Place': return 1
        case 'Fourth Place': return 0
        default: return 0
        }
    } else if (format === 'WSDC') {
        return placeInRound === 'Won Round' ? 1 : 0
    }
    
    return 0
    }

    const CHART_COLORS = {
    primary: 'rgb(147, 197, 253)',    
    secondary: 'rgb(134, 239, 172)', 
    accent: 'rgb(252, 165, 165)',    
    purple: 'rgb(196, 181, 253)',     
    yellow: 'rgb(253, 224, 71)',     
    pink: 'rgb(251, 182, 209)',      
    teal: 'rgb(110, 231, 183)',      
    orange: 'rgb(251, 146, 60)'       
    }

    const PARTNER_COLORS = [
    CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.accent,
    CHART_COLORS.purple, CHART_COLORS.yellow, CHART_COLORS.pink,
    CHART_COLORS.teal, CHART_COLORS.orange
    ]

    const getBackgroundColor = (color, opacity = 0.1) => {
    if (color.startsWith('rgb(')) {
        const rgbValues = color.match(/\d+/g)
        return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`
    }
    return color
    }

    const CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
        display: true,
        position: 'top',
        labels: {
            usePointStyle: true,
            pointStyle: 'line',
            padding: 10
        }
        }
    },
    scales: {
        y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
            color: 'rgba(156, 163, 175, 0.1)'
        }
        }
    }
    }

    const processSpeechData = (speeches, dataType, dateField = 'created_at') => {
    if (!speeches || speeches.length === 0) return { labels: [], datasets: [] }
    
    const dateGroups = new Map()
    speeches.forEach(speech => {
        const speechDate = speech[dateField]
        const formattedDate = new Date(speechDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (!dateGroups.has(formattedDate)) {
        dateGroups.set(formattedDate, [])
        }
        dateGroups.get(formattedDate).push(speech)
    })
    const uniqueFormattedDates = [...dateGroups.keys()].sort((a, b) => {
        const dateA = new Date(a + ' 2025')
        const dateB = new Date(b + ' 2025')
        return dateA - dateB
    })
    
    const labels = uniqueFormattedDates
    
    const processedData = uniqueFormattedDates.map(formattedDate => {
        const speechesOnDate = dateGroups.get(formattedDate)
        if (!speechesOnDate || speechesOnDate.length === 0) return null
        
        if (dataType === 'score') {
        const scores = speechesOnDate.map(s => s.llm_analysis?.score).filter(Boolean)
        return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
        } else if (dataType === 'points') {
        const points = speechesOnDate.map(s => calculatePoints(s))
        return points.length > 0 ? points.reduce((a, b) => a + b, 0) / points.length : null
        }
        
        return null
    })
    
    return { labels, processedData }
    }

    const processDataByCategory = (speeches, categoryField, dataType) => {
    if (!speeches || speeches.length === 0) return { labels: [], processedData: [] }
    
    const categoryGroups = new Map()
    speeches.forEach(speech => {
        const category = speech[categoryField]
        if (!category) return
        
        if (!categoryGroups.has(category)) {
        categoryGroups.set(category, [])
        }
        categoryGroups.get(category).push(speech)
    })
    
    const categories = [...categoryGroups.keys()].sort()
    
    const processedData = categories.map(category => {
        const speechesInCategory = categoryGroups.get(category)
        if (!speechesInCategory || speechesInCategory.length === 0) return 0
        
        if (dataType === 'score') {
        const scores = speechesInCategory.map(s => s.llm_analysis?.score).filter(Boolean)
        return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
        } else if (dataType === 'points') {
        const points = speechesInCategory.map(s => calculatePoints(s))
        return points.length > 0 ? points.reduce((a, b) => a + b, 0) / points.length : 0
        }
        
        return 0
    })
    
    return { labels: categories, processedData }
    }

    const isWinPosition = (placeInRound, format) => {
    if (!placeInRound) return false
    
    if (format === 'BP') {
        return placeInRound === 'First Place' || placeInRound === 'Second Place'
    } else if (format === 'WSDC') {
        return placeInRound === 'Won Round'
    }
    
    return false
    }

    const updateProgressChart = () => {
    if (!progressChart.value) return
    
    if (progressChartInstance) {
        progressChartInstance.destroy()
    }
    
    const ctx = progressChart.value.getContext('2d')
    const speeches = applyCardFilters(allSpeeches.value, 'progress')
    
    
    if (speeches.length === 0) {
        progressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
        labels: ['No Data'],
        datasets: [{
            label: 'No Data Available',
            data: [0],
            borderColor: CHART_COLORS.primary,
                        backgroundColor: getBackgroundColor(CHART_COLORS.primary, 0.1),
            tension: 0.4,
            fill: true
        }]
        },
        options: {
        ...CHART_OPTIONS,
        plugins: {
            legend: {
            display: false
            }
        }
        }
    })
        return
    }
    

    const scoreData = processSpeechData(speeches, 'score', 'speech_date')
    const pointData = processSpeechData(speeches, 'points', 'speech_date')
    

    const labels = scoreData.labels
    

    let data = []
    if (cardFilters.progress.metric === 'score') {
        data = scoreData.processedData
    } else if (cardFilters.progress.metric === 'points') {
        data = pointData.processedData
    } else {
        data = scoreData.processedData
    }
    
    progressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
        labels: labels,
        datasets: [{
            label: cardFilters.progress.metric === 'score' ? 'Average Score' : 
                cardFilters.progress.metric === 'points' ? 'Average Points' : 'Average Duration',
            data: data,
            borderColor: CHART_COLORS.primary,
            backgroundColor: getBackgroundColor(CHART_COLORS.primary, 0.1),
            tension: 0.4,
            fill: true
        }]
        },
        options: {
        ...CHART_OPTIONS,
        plugins: {
            legend: {
            display: false
            }
        },
        scales: {
            y: {
            ...CHART_OPTIONS.scales.y,
            min: cardFilters.progress.metric === 'score' ? 60 : 0,
            title: {
                display: true,
                text: cardFilters.progress.metric === 'score' ? 'Speaker Score' : 'Round Points'
            }
            },
            x: {
            grid: {
                color: 'rgba(156, 163, 175, 0.1)'
            }
            }
        }
        }
    })
    }


    const updatePartnerProgressChart = () => {
    if (!partnerProgressChart.value) return
    
    if (partnerProgressChartInstance) {
        partnerProgressChartInstance.destroy()
    }
    
    const ctx = partnerProgressChart.value.getContext('2d')
    
    const speechesWithPartners = allSpeeches.value
        .filter(s => s.partner && s.partner.trim() !== '')
    
    if (speechesWithPartners.length === 0) {
    partnerProgressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['No Data'],
        datasets: [
            {
                label: 'No Data Available',
                data: [0],
                borderColor: CHART_COLORS.primary,
                backgroundColor: getBackgroundColor(CHART_COLORS.primary, 0.1),
            tension: 0.4,
                fill: false
            }
        ]
        },
        options: {
            ...CHART_OPTIONS,
            plugins: {
            legend: {
                display: true
            }
            }
        }
        })
        return
    }
    
    const partnerGroups = new Map()
    speechesWithPartners.forEach(speech => {
        const partner = speech.partner
        if (!partnerGroups.has(partner)) {
        partnerGroups.set(partner, [])
        }
        partnerGroups.get(partner).push(speech)
    })
    
    const datasets = []
    const timeline = processSpeechData(speechesWithPartners, 'score')
    const labels = timeline.labels
        
    let colorIndex = 0
    partnerGroups.forEach((speeches, partner) => {

        const alignedScores = labels.map(dateLabel => {
        const speechesOnDate = speeches.filter(s => {
            const speechDate = s.created_at || s.date
            if (!speechDate) return false
            const speechDateFormatted = new Date(speechDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            return speechDateFormatted === dateLabel
        })
        
        if (speechesOnDate.length === 0) return null
        const scores = speechesOnDate.map(s => s.llm_analysis?.score).filter(Boolean)
        return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
        })
        
        const alignedPoints = labels.map(dateLabel => {
        const speechesOnDate = speeches.filter(s => {
            const speechDate = s.created_at || s.date
            if (!speechDate) return false
            const speechDateFormatted = new Date(speechDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            return speechDateFormatted === dateLabel
        })
        
        if (speechesOnDate.length === 0) return null
        const points = speechesOnDate.map(s => calculatePoints(s))
        return points.length > 0 ? points.reduce((a, b) => a + b, 0) / points.length : null
        })
        
        datasets.push({
        label: `${partner} - Speaker Score`,
        data: alignedScores,
        borderColor: PARTNER_COLORS[colorIndex % PARTNER_COLORS.length],
        backgroundColor: getBackgroundColor(PARTNER_COLORS[colorIndex % PARTNER_COLORS.length], 0.1),
        tension: 0.4,
        fill: false,
        yAxisID: 'y',
        spanGaps: true
        })
        
        datasets.push({
        label: `${partner} - Round Points`,
        data: alignedPoints,
        borderColor: PARTNER_COLORS[colorIndex % PARTNER_COLORS.length],
        backgroundColor: getBackgroundColor(PARTNER_COLORS[colorIndex % PARTNER_COLORS.length], 0.1),
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
        borderDash: [5, 5],
        spanGaps: true
        })
        
        colorIndex++
    })
    
    partnerProgressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
        labels: labels,
        datasets: datasets
        },
        options: {
        ...CHART_OPTIONS,
        plugins: {
            legend: {
            display: false
            }
        },
        scales: {
            y: {
            ...CHART_OPTIONS.scales.y,
            title: {
            display: true,
                text: 'Speaker Score'
            }
            },
            y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            title: {
                display: true,
                text: 'Round Points'
            },
            grid: {
                drawOnChartArea: false
            }
            }
        }
        }
    })
    }

    const updatePositionChart = () => {
    if (!positionChart.value) return
    
    if (positionChartInstance) {
        positionChartInstance.destroy()
    }
    
    const ctx = positionChart.value.getContext('2d')
    const filteredSpeeches = applyCardFilters(allSpeeches.value, 'position')
    
    const bpSpeeches = filteredSpeeches.filter(s => s.debate_format === 'BP')
    const wsdcSpeeches = filteredSpeeches.filter(s => s.debate_format === 'WSDC')
    
    const bpScoreData = processDataByCategory(bpSpeeches, 'position', 'score')
    const bpPointData = processDataByCategory(bpSpeeches, 'position', 'points')
    const wsdcScoreData = processDataByCategory(wsdcSpeeches, 'position', 'score')
    const wsdcPointData = processDataByCategory(wsdcSpeeches, 'position', 'points')
    
    const labels = []
    const scoreData = []
    const pointData = []
    
    if (bpScoreData.labels.length > 0) {
        bpScoreData.labels.forEach((position, index) => {
        const shortPosition = mapPosition(position)
        labels.push(`BP ${shortPosition}`)
        scoreData.push(bpScoreData.processedData[index])
        pointData.push(bpPointData.processedData[index])
        })
    }
    
    if (bpScoreData.labels.length > 0 && wsdcScoreData.labels.length > 0) {
        labels.push('') 
        scoreData.push(0)
        pointData.push(0)
    }
        if (wsdcScoreData.labels.length > 0) {
        wsdcScoreData.labels.forEach((position, index) => {
        const shortPosition = mapPosition(position)
        labels.push(`WSDC ${shortPosition}`)
        scoreData.push(wsdcScoreData.processedData[index])
        pointData.push(wsdcPointData.processedData[index])
        })
    }
    
    if (labels.length === 0 || (scoreData.every(d => d === 0) && pointData.every(d => d === 0))) {
        positionChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['No Data'],
            datasets: [
            {
                label: 'No Data Available',
                data: [0],
                backgroundColor: CHART_COLORS.primary + '80',
                borderColor: CHART_COLORS.primary,
                borderWidth: 1
            }
            ]
        },
        options: {
            ...CHART_OPTIONS,
            plugins: {
            legend: {
                display: false
            }
            }
        }
        })
        return
    }
    
    positionChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
        labels: labels,
        datasets: [
            {
            label: 'Average Speaker Score',
            data: scoreData,
            backgroundColor: CHART_COLORS.primary + '80',
            borderColor: CHART_COLORS.primary,
            borderWidth: 1
            },
            {
            label: 'Average Points',
            data: pointData,
            backgroundColor: CHART_COLORS.secondary + '80',
            borderColor: CHART_COLORS.secondary,
            borderWidth: 1
            }
        ]
        },
        options: {
        ...CHART_OPTIONS,
        plugins: {
            legend: {
            display: false
            },
            tooltip: {
            filter: function(tooltipItem) {
                return tooltipItem.label !== ''
            }
            }
        },
        scales: {
            y: {
            ...CHART_OPTIONS.scales.y,
            title: {
                display: true,
                text: 'Score / Points'
            }
            },
            x: {
            grid: {
                color: (context) => {
                if (context.tick && context.tick.label === '') {
                    return 'rgba(156, 163, 175, 0.8)'
                }
                return 'rgba(156, 163, 175, 0.1)'
                },
                lineWidth: (context) => {
                if (context.tick && context.tick.label === '') {
                    return 3
                }
                return 1
                }
            }
            }
        }
        }
    })
    }
    const hasPartnerProgressData = computed(() => partnerStats.value && partnerStats.value.length > 0)
    const hasPositionData = computed(() => {
    return allSpeeches.value.length > 0
    })
    const hasProgressData = computed(() => {
    return allSpeeches.value.length > 0
    })
    const partnerLegendItems = computed(() => {
    if (!allSpeeches.value.length) return []
    
    const speechesWithPartners = allSpeeches.value.filter(s => s.partner && s.partner.trim() !== '')
    const uniquePartners = [...new Set(speechesWithPartners.map(s => s.partner))]
    
    return uniquePartners.map((partner, index) => ({
        name: partner,
        color: PARTNER_COLORS[index % PARTNER_COLORS.length]
    }))
    })

    const positionLegendItems = computed(() => [
    {
        label: 'Average Speaker Score',
        color: CHART_COLORS.primary
    },
    {
        label: 'Average Points', 
        color: CHART_COLORS.secondary
    }
    ])

    const progressLegendItems = computed(() => {
    const metric = cardFilters.progress.metric
    if (metric === 'score') {
        return [{ label: 'Average Score', color: CHART_COLORS.primary }]
    } else if (metric === 'points') {
        return [{ label: 'Average Points', color: CHART_COLORS.primary }]
    } else {
        return [{ label: 'Average Duration', color: CHART_COLORS.primary }]
    }
    })

    const handleDragStart = ({ event, cardRef }) => {
    isDragging.value = true
    draggedCard.value = cardRef
    cardRef.style.opacity = '0.5'
    }

    const handleDragEnd = ({ event, cardRef }) => {
    isDragging.value = false
    draggedCard.value = null
    cardRef.style.opacity = '1'
    }

    const handleDrop = ({ event, cardRef }) => {
    event.preventDefault()
    
    if (!draggedCard.value) return
    
    const containerRect = statsContainer.value.getBoundingClientRect()
    const dropX = event.clientX - containerRect.left
    const dropY = event.clientY - containerRect.top
    const gridSize = 100 
    const col = Math.floor(dropX / gridSize) + 1
    const row = Math.floor(dropY / gridSize) + 1
    }

    watch(() => cardFilters.tournament, () => {
    updateTournamentStats()
    }, { deep: true })

    watch(() => cardFilters.partner, () => {
    updatePartnerStats()
    }, { deep: true })

    watch(() => cardFilters.position, () => {
    updatePositionChart()
    }, { deep: true })

    watch(() => cardFilters.progress, () => {
    updateProgressChart()
    }, { deep: true })

    watch(() => cardFilters.partnerProgress, () => {
    updatePartnerProgressChart()
    }, { deep: true })

    watch([compTournamentA, compTournamentB, compPartnerA, compPartnerB], () => updatePinnedComparisons())
    onMounted(async () => {
    supabase = await getSupabaseClient()
    loadStats()
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
    .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    canvas {
    max-width: 100%;
    height: auto;
    }

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

    .leaderboard-item {
    animation: slideUpFade 0.6s ease-out forwards;
    opacity: 0;
    }

    .progress-ring {
    animation: progressAnimation 1.5s ease-out forwards;
    }

    @keyframes progressAnimation {
    from {
        stroke-dashoffset: 62.83; /* Full circle (2 * π * 10) */
    }
    to {
        stroke-dashoffset: var(--final-offset);
    }
    }
    </style>
