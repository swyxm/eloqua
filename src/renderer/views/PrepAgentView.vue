<template>
  <div class="min-h-screen p-8 font-sans overflow-auto bg-bg text-primary">
    <div class="max-w-5xl mx-auto space-y-8">

      <header class="text-center mb-8">
        <div class="flex flex-col items-center space-y-4">
          <div class="flex items-center space-x-2">
            <EloquaLogo class="w-17 h-14" />
            <h1 class="text-5xl font-extrabold text-primary tracking-tight">Prep Agent</h1>
          </div>
          <p class="text-secondary text-lg">Multi-agent research pipeline for debate preparation</p>
        </div>
      </header>

      <!-- Step 1: Motion Input -->
      <div class="bg-card rounded-lg shadow-xl p-8 border border-border">
        <h2 class="text-2xl text-center font-bold text-primary mb-6">Enter Motion</h2>
        <div class="space-y-4">
          <div>
            <label for="motion-input" class="form-label">Debate Motion <span class="text-error">*</span></label>
            <input
              id="motion-input"
              type="text"
              v-model="motion"
              :disabled="phase !== 'idle'"
              class="form-input h-11"
              placeholder="e.g., This House Believes That the EU should centralize fiscal policy"
              @keyup.enter="planQueries"
            />
          </div>
          <div>
            <label class="form-label">Your Side <span class="text-error">*</span></label>
            <div class="flex space-x-3">
              <button
                @click="side = 'proposition'"
                :disabled="phase !== 'idle'"
                class="flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 border-2"
                :class="side === 'proposition' ? 'bg-accent border-accent text-accent-text' : 'bg-surface/60 border-border text-secondary hover:border-accent/40'"
              >
                Proposition / Government
              </button>
              <button
                @click="side = 'opposition'"
                :disabled="phase !== 'idle'"
                class="flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 border-2"
                :class="side === 'opposition' ? 'bg-accent border-accent text-accent-text' : 'bg-surface/60 border-border text-secondary hover:border-accent/40'"
              >
                Opposition
              </button>
            </div>
          </div>
          <div class="flex justify-end">
            <button
              v-if="phase === 'idle'"
              @click="planQueries"
              :disabled="!motion.trim() || !side"
              class="button-primary px-6 py-2.5"
            >
              Generate Search Queries
            </button>
            <button
              v-else
              @click="resetAll"
              class="px-4 py-2 text-sm bg-surface hover:bg-surface-hover text-secondary rounded-lg border border-border transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>

      <!-- Loading: Planning -->
      <div v-if="phase === 'planning'" class="bg-card backdrop-blur-md rounded-xl shadow-lg p-6 border border-border">
        <div class="flex items-center space-x-4">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
          <div>
            <p class="font-semibold text-primary">Analyzing motion...</p>
            <p class="text-sm text-muted">The Planner Agent is breaking down the debate and crafting targeted search queries...</p>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="bg-error/10 border border-error/30 rounded-lg p-4">
        <div class="flex items-start space-x-3">
          <svg class="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <div>
            <h3 class="text-sm font-semibold text-error">Processing Error</h3>
            <p class="mt-1 text-sm text-error/80">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Step 2: Confirm / Edit Queries -->
      <div v-if="phase === 'confirm'" class="bg-card backdrop-blur-md rounded-xl shadow-lg p-6 border border-border">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-primary">Search Queries</h3>
              <p class="text-sm text-muted">Edit, remove, or add queries before researching</p>
            </div>
          </div>
        </div>
        <div class="space-y-3">
          <div
            v-for="(query, idx) in editableQueries"
            :key="idx"
            class="flex items-center space-x-3"
          >
            <span class="flex-shrink-0 w-6 h-6 bg-accent/10 text-accent text-xs font-semibold rounded-full flex items-center justify-center">{{ idx + 1 }}</span>
            <input
              type="text"
              v-model="editableQueries[idx]"
              class="form-input h-10 text-sm flex-1"
            />
            <button
              @click="removeQuery(idx)"
              class="p-2 hover:bg-error/10 rounded-lg transition-colors"
              :disabled="editableQueries.length <= 1"
              :class="editableQueries.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''"
            >
              <svg class="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <button
            @click="addQuery"
            class="flex items-center space-x-2 text-sm text-accent hover:text-accent-hover transition-colors px-2 py-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Add query</span>
          </button>
        </div>

        <div class="mt-6 flex justify-end">
          <button @click="startResearch" class="button-primary px-6 py-2.5">
            Start Research
          </button>
        </div>
      </div>

      <!-- Loading: Researching -->
      <div v-if="phase === 'researching'" class="bg-card backdrop-blur-md rounded-xl shadow-lg p-6 border border-border">
        <div class="space-y-3">
          <!-- Step list -->
          <div
            v-for="(step, idx) in researchSteps"
            :key="idx"
            class="flex items-center space-x-3 py-1.5"
          >
            <!-- Done -->
            <svg v-if="step.status === 'done'" class="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <!-- Active spinner -->
            <div v-else-if="step.status === 'active'" class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent flex-shrink-0"></div>
            <!-- Pending dot -->
            <div v-else class="w-5 h-5 rounded-full border-2 border-border flex-shrink-0"></div>

            <span :class="step.status === 'active' ? 'text-primary font-medium' : step.status === 'done' ? 'text-muted' : 'text-muted/50'">
              {{ step.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Step 3: Result Document -->
      <div v-if="phase === 'done' && prepDoc" class="space-y-4">
        <div class="bg-card backdrop-blur-md rounded-xl shadow-lg border border-border">
          <div class="p-6">
            <div v-for="(section, idx) in parsedSections" :key="idx" class="mb-4">
              <details class="group" :open="idx < 3">
                <summary class="flex items-center justify-between cursor-pointer p-4 bg-surface hover:bg-surface-hover rounded-lg border border-border/30 transition-colors">
                  <span class="font-semibold text-primary">{{ section.title }}</span>
                  <svg class="w-5 h-5 text-muted group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </summary>
                <div class="p-4 bg-surface/50 rounded-b-lg border-t border-border/20">
                  <div class="text-primary leading-relaxed markdown-content" v-html="renderMarkdown(section.content)"></div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import EloquaLogo from '../components/EloquaLogo.vue';
import { renderMarkdown } from '../../shared/utils/markdownRenderer.js';

const motion = ref('');
const side = ref(''); // proposition | opposition
const phase = ref('idle'); // idle | planning | confirm | researching | done
const error = ref(null);
const editableQueries = ref([]);
const prepDoc = ref('');
const researchSteps = ref([]);

// Parse document into collapsible sections (skip redundant title)
const parsedSections = computed(() => {
  if (!prepDoc.value) return [];

  const lines = prepDoc.value.split('\n');
  const sections = [];
  let currentTitle = '';
  let currentContent = [];

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    const h1Match = line.match(/^#\s+(.+)$/);

    if (h2Match) {
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentContent.join('\n').trim() });
      }
      currentTitle = h2Match[1].replace(/^\d+\.\s*/, '');
      currentContent = [];
    } else if (h1Match) {
      // Skip "#" level headings entirely (document title is redundant)
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentContent.join('\n').trim() });
      }
      currentTitle = '';
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentTitle) {
    sections.push({ title: currentTitle, content: currentContent.join('\n').trim() });
  }

  return sections;
});

function resetAll() {
  phase.value = 'idle';
  error.value = null;
  editableQueries.value = [];
  prepDoc.value = '';
  side.value = '';
  researchSteps.value = [];
}

async function planQueries() {
  if (!motion.value.trim()) return;

  phase.value = 'planning';
  error.value = null;
  editableQueries.value = [];

  try {
    const result = await window.electronAPI.prepPlan(motion.value, side.value);
    if (result.success) {
      editableQueries.value = result.queries || [];
      phase.value = 'confirm';
    } else {
      error.value = result.error;
      phase.value = 'idle';
    }
  } catch (e) {
    error.value = e.message;
    phase.value = 'idle';
  }
}

function removeQuery(idx) {
  if (editableQueries.value.length > 1) {
    editableQueries.value.splice(idx, 1);
  }
}

function addQuery() {
  editableQueries.value.push('');
}

async function startResearch() {
  const validQueries = editableQueries.value.filter(q => q.trim());
  if (validQueries.length === 0) return;

  phase.value = 'researching';
  error.value = null;
  prepDoc.value = '';

  // Build step list from queries
  researchSteps.value = [
    ...validQueries.map(q => ({ label: `Researching: ${q}`, status: 'pending' })),
    { label: 'Drafting prep document', status: 'pending' }
  ];
  // Mark first as active
  if (researchSteps.value.length > 0) {
    researchSteps.value[0].status = 'active';
  }

  try {
    const result = await window.electronAPI.prepResearch(motion.value, validQueries, side.value);
    if (result.success) {
      prepDoc.value = result.document || '';
      phase.value = 'done';
    } else {
      error.value = result.error;
      phase.value = 'confirm';
    }
  } catch (e) {
    error.value = e.message;
    phase.value = 'confirm';
  }
}

function handleProgress(data) {
  if (data.phase === 'research') {
    const queryIdx = data.query_index;
    // Mark all previous queries as done, current as active
    researchSteps.value.forEach((step, i) => {
      if (i < queryIdx) step.status = 'done';
      else if (i === queryIdx) step.status = 'active';
    });
  } else if (data.phase === 'drafting') {
    // Mark all research steps done, drafting step active
    researchSteps.value.forEach((step, i) => {
      if (i < researchSteps.value.length - 1) step.status = 'done';
      else step.status = 'active';
    });
  }
}

onMounted(() => {
  if (window.electronAPI?.onPrepProgress) {
    window.electronAPI.onPrepProgress(handleProgress);
  }
});

onUnmounted(() => {
  if (window.electronAPI?.offPrepProgress) {
    window.electronAPI.offPrepProgress();
  }
});
</script>
