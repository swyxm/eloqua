<template>
  <div class="min-h-screen p-8 font-sans overflow-auto bg-bg text-primary">
    <div class="max-w-6xl mx-auto space-y-8">
      <div class="flex items-center space-x-4">
        <router-link
          to="/speeches"
          class="inline-flex items-center px-4 py-2 bg-surface hover:bg-surface-hover text-primary rounded-lg transition-all duration-200 border border-border"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Speeches
        </router-link>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div class="relative">
          <div class="w-10 h-10 border-4 border-surface-hover rounded-full"></div>
          <div class="absolute top-0 left-0 w-10 h-10 border-4 border-transparent border-t-accent rounded-full animate-spin"></div>
        </div>
      </div>

      <div v-else-if="!speech" class="text-center py-16">
        <div class="w-16 h-16 mx-auto mb-6 bg-error/10 rounded-lg flex items-center justify-center">
          <svg class="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-medium text-primary mb-2">Speech not found</h3>
        <p class="text-muted mb-6">The speech you're looking for doesn't exist or has been removed.</p>
        <router-link
          to="/speeches"
          class="inline-flex items-center px-6 py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-all duration-200"
        >
          Return to Speeches
        </router-link>
      </div>

      <div v-else class="space-y-8">
        <div class="bg-card backdrop-blur-md rounded-xl shadow-lg p-4 border border-border">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div class="relative group flex-1">
              <h1 v-if="editingField !== 'motion'" class="text-4xl font-semibold text-primary mb-3">{{ speech.motion }}</h1>
              <input 
                v-else
                v-model="editingValue"
                @keyup.enter="saveField"
                @keyup.escape="cancelEditing"
                class="text-4xl font-semibold text-primary bg-transparent border-b-2 border-accent focus:outline-none w-full mb-3"
                autofocus
              />
              
              <!-- Edit Controls for Motion -->
              <div class="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div v-if="editingField !== 'motion'" class="flex space-x-1">
                  <button @click="startEditing('motion', speech.motion)" class="p-1 hover:bg-accent/20 rounded">
                    <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                </div>
                <div v-else class="flex space-x-1">
                  <button @click="saveField" class="p-1 hover:bg-success/20 rounded">
                    <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </button>
                  <button @click="cancelEditing" class="p-1 hover:bg-error/20 rounded">
                    <svg class="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-3 text-sm text-muted">
                <span class="px-3 py-1 bg-primary/10 text-primary rounded-full">{{ speech.debate_format }}</span>
                <span v-if="speech.tournament_name" class="px-3 py-1 bg-info/10 text-info rounded-full">{{ speech.tournament_name }}</span>
                <span class="text-muted">{{ formatDate(speech.created_at) }}</span>
                <span v-if="speech.position" class="px-3 py-1 bg-surface/60 text-primary rounded-full">{{ mapPosition(speech.position) }}</span>
                <span v-if="speech.partner" class="px-3 py-1 bg-surface/60 text-primary rounded-full">Partner: {{ speech.partner }}</span>
              </div>
            </div>
            
            <div class="flex items-center space-x-3">
              <button
                @click="deleteSpeech"
                class="px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-all duration-200 border border-error/20"
              >
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>

        <div class="bg-card backdrop-blur-md rounded-xl shadow-lg border border-border">
          <div 
            @click="toggleChat"
            class="flex items-center justify-between p-4 cursor-pointer hover:bg-surface/30 transition-colors rounded-t-xl"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-primary">Debbie</h3>
                <p class="text-sm text-muted">Ask specific questions about your speech performance</p>
              </div>
            </div>
            <svg 
              :class="['w-5 h-5 text-muted transition-transform duration-200', isChatExpanded ? 'rotate-180' : '']"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          
          <div 
            v-if="isChatExpanded"
            class="border-t border-border"
          >
            <div class="h-96">
              <ChatInterface
                :messages="chatMessages"
                :isLoading="isChatLoading"
                :isTyping="isChatTyping"
                @send-message="handleChatMessage"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8">
          <div class="space-y-6">
            <div class="bg-card backdrop-blur-md rounded-xl shadow-lg p-6 border border-border">
              <h2 class="text-2xl font-semibold text-primary mb-4">Analysis Results</h2>
                <div class="analysis-grid gap-4 w-full">
                  <div class="bg-accent/10 pt-3 pb-2 rounded-lg">
                    <div class="flex items-center justify-center">
                      <div class="relative w-16 h-16">
                        <ProgressRing 
                          :score="speech.llm_analysis?.score" 
                          :format="speech.debate_format" 
                          size="large"
                        />
                        <div class="absolute inset-0 flex items-center justify-center">
                          <span class="text-3xl font-semibold text-primary">
                            {{ speech.llm_analysis?.score || 'N/A' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="bg-accent/10 p-4 rounded-lg">
                    <div class="text-sm text-muted mb-1">Duration</div>
                    <div class="text-2xl font-semibold text-primary">{{ formatDuration(speech.analysis_result?.duration_seconds) }}</div>
                  </div>
                  
                  <div class="bg-accent/10 p-4 rounded-lg">
                    <div class="text-sm text-muted mb-1">Words</div>
                    <div class="text-2xl font-semibold text-primary">{{ speech.analysis_result?.transcript_stats?.word_count || 'N/A' }}</div>
                  </div>
                  
                  <div class="bg-accent/10 p-4 rounded-lg relative group">
                    <div class="text-sm text-muted mb-1">Position</div>
                    <div v-if="editingField !== 'position'" class="text-2xl font-semibold text-primary">
                      {{ mapPosition(speech.position) }}
                    </div>
                    <div v-else class="relative">
                      <button
                        type="button"
                        class="flex items-center justify-between w-full text-2xl font-semibold text-primary bg-transparent border-b-2 border-accent focus:outline-none"
                        @click="positionDropdownOpen = !positionDropdownOpen"
                      >
                        <span>{{ mapPosition(editingValue) }}</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div v-if="positionDropdownOpen" class="absolute top-full left-0 bg-bg border border-border rounded-lg shadow-lg p-1 min-w-[200px] max-h-40 overflow-y-auto mt-1 z-[9999]">
                        <label 
                          v-for="position in getValidPositions(editingField === 'format' ? editingValue : speech.debate_format)" 
                          :key="position.value"
                          :class="['flex items-center gap-1 px-1 py-1 cursor-pointer text-sm rounded hover:bg-surface-hover', editingValue === position.value ? 'bg-surface-hover text-primary' : 'text-muted']"
                          @click="editingValue = position.value"
                        >
                          <input
                            type="radio"
                            name="position"
                            :checked="editingValue === position.value"
                            class="border-border"
                            readonly
                          />
                          <span>{{ position.label }}</span>
                        </label>
                      </div>
                    </div>                    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div v-if="editingField !== 'position'" class="flex space-x-1">
                        <button @click="startEditingPosition" class="p-1 hover:bg-accent/20 rounded">
                          <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                      </div>
                      <div v-else class="flex space-x-1">
                        <button @click="saveField" class="p-1 hover:bg-success/20 rounded">
                          <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </button>
                        <button @click="cancelEditing" class="p-1 hover:bg-error/20 rounded">
                          <svg class="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                                    <div class="bg-accent/10 p-4 rounded-lg relative group">
                    <div class="text-sm text-muted mb-1">Partner</div>
                    <div v-if="editingField !== 'partner'" class="text-2xl font-semibold text-primary">
                      {{ speech.partner || 'N/A' }}
                    </div>
                    <input 
                      v-else
                      v-model="editingValue"
                      @keyup.enter="saveField"
                      @keyup.escape="cancelEditing"
                      class="text-2xl font-semibold text-primary bg-transparent border-b-2 border-accent focus:outline-none w-full"
                      autofocus
                    />
                    
                    <!-- Edit Controls -->
                    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div v-if="editingField !== 'partner'" class="flex space-x-1">
                        <button @click="startEditing('partner', speech.partner)" class="p-1 hover:bg-accent/20 rounded">
                          <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                      </div>
                      <div v-else class="flex space-x-1">
                        <button @click="saveField" class="p-1 hover:bg-success/20 rounded">
                          <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </button>
                        <button @click="cancelEditing" class="p-1 hover:bg-error/20 rounded">
                          <svg class="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="bg-accent/10 p-4 rounded-lg relative group">
                    <div class="text-sm text-muted mb-1">Date</div>
                    <div v-if="editingField !== 'date'" class="text-2xl font-semibold text-primary">
                      {{ formatDate(speech.speech_date) }}
                    </div>
                    <input 
                      v-else
                      v-model="editingValue"
                      type="date"
                      @keyup.enter="saveField"
                      @keyup.escape="cancelEditing"
                      class="text-2xl font-semibold text-primary bg-transparent border-b-2 border-accent focus:outline-none w-full"
                      autofocus
                    />
                    
                    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div v-if="editingField !== 'date'" class="flex space-x-1">
                        <button @click="startEditing('date', speech.speech_date)" class="p-1 hover:bg-accent/20 rounded">
                          <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                      </div>
                      <div v-else class="flex space-x-1">
                        <button @click="saveField" class="p-1 hover:bg-success/20 rounded">
                          <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </button>
                        <button @click="cancelEditing" class="p-1 hover:bg-error/20 rounded">
                          <svg class="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="bg-accent/10 p-4 rounded-lg relative group">
                    <div class="text-sm text-muted mb-1">Format</div>
                    <div v-if="editingField !== 'format'" class="text-2xl font-semibold text-primary">
                      {{ speech.debate_format }}
                    </div>
                    <div v-else class="relative">
                      <button
                        type="button"
                        class="flex items-center justify-between w-full text-2xl font-semibold text-primary bg-transparent border-b-2 border-accent focus:outline-none"
                        @click="formatDropdownOpen = !formatDropdownOpen"
                      >
                        <span>{{ editingValue }}</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div v-if="formatDropdownOpen" class="absolute top-full left-0 bg-bg border border-border rounded-lg shadow-lg p-1 min-w-[80px] mt-1 z-[9999]">
                        <label 
                          v-for="format in ['BP', 'WSDC']" 
                          :key="format"
                          :class="['flex items-center gap-1 px-1 py-1 cursor-pointer text-sm rounded hover:bg-surface-hover', editingValue === format ? 'bg-surface-hover text-primary' : 'text-muted']"
                          @click="editingValue = format"
                        >
                          <input
                            type="radio"
                            name="format"
                            :checked="editingValue === format"
                            class="border-border"
                            readonly
                          />
                          <span>{{ format }}</span>
                        </label>
                      </div>
                    </div>
                    
                    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div v-if="editingField !== 'format'" class="flex space-x-1">
                        <button @click="startEditingFormat" class="p-1 hover:bg-accent/20 rounded">
                          <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                      </div>
                      <div v-else class="flex space-x-1">
                        <button @click="saveField" class="p-1 hover:bg-success/20 rounded">
                          <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </button>
                        <button @click="cancelEditing" class="p-1 hover:bg-error/20 rounded">
                          <svg class="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              <div v-if="speech.llm_analysis?.feedback" class="mt-6">
                <h3 class="text-lg mb-2 font-semibold text-primary">RhetorIQ™ Analysis</h3>
                
                <div v-if="parsedFeedback.introThoughts" class="mb-4">
                  <div class="bg-surface rounded-lg">
                    <div class="text-primary leading-relaxed markdown-content" v-html="renderMarkdown(parsedFeedback.introThoughts)"></div>
                  </div>
                </div>
                
                <div v-if="parsedFeedback.contentAnalysis" class="mb-4">
                  <details class="group">
                    <summary class="flex items-center justify-between cursor-pointer p-4 bg-surface hover:bg-surface-hover rounded-lg border border-border/30 transition-colors">
                      <span class="font-semibold text-primary">Content Analysis</span>
                      <svg class="w-5 h-5 text-muted group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </summary>
                    <div class="p-4 bg-surface/50 rounded-b-lg border-t border-border/20">
                      <div class="text-primary leading-relaxed markdown-content" v-html="renderMarkdown(parsedFeedback.contentAnalysis)"></div>
                    </div>
                  </details>
                </div>
                
                <div v-if="parsedFeedback.deliveryFeedback" class="mb-4">
                  <details class="group">
                    <summary class="flex items-center justify-between cursor-pointer p-4 bg-surface hover:bg-surface-hover rounded-lg border border-border/30 transition-colors">
                      <span class="font-semibold text-primary">Delivery Feedback</span>
                      <svg class="w-5 h-5 text-muted group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </summary>
                    <div class="p-4 bg-surface/50 rounded-b-lg border-t border-border/20">
                      <div class="text-primary leading-relaxed markdown-content" v-html="renderMarkdown(parsedFeedback.deliveryFeedback)"></div>
                    </div>
                  </details>
                </div>
                
                <div v-if="parsedFeedback.roleSpecificAdvice" class="mb-4">
                  <details class="group">
                    <summary class="flex items-center justify-between cursor-pointer p-4 bg-surface hover:bg-surface-hover rounded-lg border border-border/30 transition-colors">
                      <span class="font-semibold text-primary">Role-Specific Advice</span>
                      <svg class="w-5 h-5 text-muted group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </summary>
                    <div class="p-4 bg-surface/50 rounded-b-lg border-t border-border/20">
                      <div class="text-primary leading-relaxed markdown-content" v-html="renderMarkdown(parsedFeedback.roleSpecificAdvice)"></div>
                    </div>
                  </details>
                </div>
              </div>
            </div>

            <div class="bg-card backdrop-blur-md rounded-xl shadow-lg p-6 border border-border">
              <h2 class="text-2xl font-semibold text-primary mb-4">Transcript</h2>
              <div class="bg-surface p-6 rounded-lg max-h-96 overflow-y-auto">
                <div class="text-primary whitespace-pre-wrap leading-relaxed">{{ speech.analysis_result?.transcript || 'No transcript available' }}</div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div v-if="speech.prosody_stats" class="bg-card backdrop-blur-md rounded-xl shadow-lg p-6 border border-border">
              <h3 class="text-lg font-semibold text-primary mb-4">Speech Metrics</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted">Pitch Variation:</span>
                  <span class="font-medium">{{ speech.prosody_stats.pitch || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Volume:</span>
                  <span class="font-medium">{{ speech.prosody_stats.volume || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Jitter:</span>
                  <span class="font-medium">{{ speech.prosody_stats.jitter || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Pace:</span>
                  <span class="font-medium">{{ speech.prosody_stats.pace || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSupabaseClient } from '../lib/supabaseClient.js'
import ChatInterface from '../components/ChatInterface.vue'
import { mapPosition } from '../../shared/utils/positionMapping.js'
import { renderMarkdown } from '../../shared/utils/markdownRenderer.js'
import ProgressRing from '../../shared/components/ProgressRing.vue'

const route = useRoute()
const router = useRouter()
let supabase

const speech = ref(null)
const isLoading = ref(true)
const parsedFeedback = ref({
  introThoughts: '',
  contentAnalysis: '',
  deliveryFeedback: '',
  roleSpecificAdvice: ''
})

const isChatExpanded = ref(false)
const chatMessages = ref([])
const isChatLoading = ref(false)
const isChatTyping = ref(false)
const conversationHistory = ref([])
const chatContext = ref([])
const editingField = ref(null)
const editingValue = ref('')
const isScrapedTournament = ref(false)
const formatDropdownOpen = ref(false)
const positionDropdownOpen = ref(false)

const loadSpeech = async () => {
  try {
    isLoading.value = true
    const speechId = String(route.params.id || '')
    if (speechId.startsWith('round_')) {
      const parts = speechId.split('_')
      const resultId = parts.length >= 3 ? parts[2] : null

      if (!resultId) throw new Error('Invalid round id format')

      const { data: r, error: rErr } = await supabase
        .from('debate_results')
        .select(`
          id,
          result,
          team_score,
          speaker1_score,
          speaker2_name,
          position,
          tournament_id,
          round_id,
          tournaments:tournament_id ( name ),
          debate_rounds:round_id ( id, round, motion, date, created_at )
        `)
        .eq('id', resultId)
        .single()

      if (rErr) throw rErr

      const mapped = {
        id: speechId,
        tournament_id: r.tournament_id,
        motion: r.debate_rounds?.motion || '—',
        debate_format: 'BP',
        position: r.position || '',
        partner: r.speaker2_name || '-',
        llm_analysis: r.speaker1_score != null ? { score: Number(r.speaker1_score) } : (r.team_score != null ? { score: Number(r.team_score) } : {}),
        analysis_result: {},
        prosody_stats: null,
        chat_context: [],
        speech_date: r.debate_rounds?.date || null,
        created_at: r.debate_rounds?.created_at || r.debate_rounds?.date || new Date().toISOString(),
        place_in_round: r.result || null,
        tournament_name: r.tournaments?.name || ''
      }

      speech.value = mapped
      isScrapedTournament.value = true
      return
    }
    const { data, error } = await supabase
      .from('speeches')
      .select(`
        *,
        tournaments(name)
      `)
      .eq('id', speechId)
      .single()

    if (error) throw error

    speech.value = {
      ...data,
      tournament_name: data.tournaments?.name || 'Practice Session'
    }
    isScrapedTournament.value = false
    if (data.llm_analysis?.feedback) {
      parsedFeedback.value = parseFeedback(data.llm_analysis.feedback)
    }
    
    if (data.chat_context && Array.isArray(data.chat_context)) {
      chatContext.value = data.chat_context
      chatMessages.value = data.chat_context.map((msg, index) => ({
        id: index,
        text: msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date().toISOString()
      }))
      conversationHistory.value = data.chat_context
    }
  } catch (error) {
    console.error('Error loading speech:', error)
    speech.value = null
  } finally {
    isLoading.value = false
  }
}

const deleteSpeech = async () => {
  if (!speech.value) return
  if (String(speech.value.id || '').startsWith('round_')) {
    alert('This item comes from tournament results and cannot be deleted here.')
    return
  }

  if (!confirm('Are you sure you want to delete this speech? This action cannot be undone.')) {
    return
  }

  try {
    const { error } = await supabase
      .from('speeches')
      .delete()
      .eq('id', speech.value.id)

    if (error) throw error

    router.push('/speeches')
  } catch (error) {
    console.error('Error deleting speech:', error)
    alert('Failed to delete speech. Please try again.')
  }
}
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDuration = (seconds) => {
  if (!seconds) return 'N/A'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (minutes === 0) {
    return `${remainingSeconds}s`
  } else if (remainingSeconds === 0) {
    return `${minutes}m`
  } else {
    return `${minutes}m ${remainingSeconds}s`
  }
}

const parseFeedback = (feedback) => {
  if (!feedback) return {}
  
  const sections = {
    introThoughts: '',
    contentAnalysis: '',
    deliveryFeedback: '',
    roleSpecificAdvice: ''
  }
  
  const lines = feedback.split('\n')
  let currentSection = 'introThoughts'
  let currentContent = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lower = line.toLowerCase()
    
    if (line.startsWith('# ')) {
      currentSection = 'introThoughts'
      currentContent = []
    } else if (/^##+\s+content analysis:?$/i.test(line)) {
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim()
      }
      currentSection = 'contentAnalysis'
      currentContent = []
    } else if (/^##+\s+delivery feedback:?$/i.test(line)) {
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim()
      }
      currentSection = 'deliveryFeedback'
      currentContent = []
    } else if (/^##+\s+role-?specific advice/i.test(line)) {
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim()
      }
      currentSection = 'roleSpecificAdvice'
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }
  
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim()
  }
  
  return sections
}



const toggleChat = async () => {
  isChatExpanded.value = !isChatExpanded.value
  if (isChatExpanded.value && chatMessages.value.length === 0) {
    const welcomeMessage = {
      id: Date.now(),
      text: `Hello! I'm your AI Debate Coach. I've analyzed your ${speech.value?.debate_format || 'debate'} speech on "${speech.value?.motion || 'the motion'}" where you spoke as ${speech.value?.position || 'your position'}. Your score was ${speech.value?.llm_analysis?.score || 'N/A'}. Ask me anything specific about your performance, argument structure, delivery, or how to improve!`,
      isUser: false,
      timestamp: new Date().toISOString()
    };
    chatMessages.value.push(welcomeMessage);
    conversationHistory.value.push({ role: 'assistant', content: welcomeMessage.text })
    await saveChatContext()
  }
}

const handleChatMessage = async (message) => {
  if (!speech.value) return
  if (!window.electronAPI || !window.electronAPI.chat) {
    console.error('electronAPI.chat is not available');
    const errorMessage = {
      id: Date.now() + 1,
      text: "Chat service is not available. Please restart the application.",
      isUser: false,
      timestamp: new Date().toISOString()
    };
    chatMessages.value.push(errorMessage);
    return;
  }
  
  const userMessage = {
    id: Date.now(),
    text: message,
    isUser: true,
    timestamp: new Date().toISOString()
  }
  chatMessages.value.push(userMessage)
  
  conversationHistory.value.push({ role: 'user', content: message })
  isChatLoading.value = true
  isChatTyping.value = true
  
  try {
    const speechData = {
      motion: speech.value.motion || '',
      debate_format: speech.value.debate_format || '',
      position: speech.value.position || '',
      partner: speech.value.partner || null,
      score: speech.value.llm_analysis?.score || null,
      duration: speech.value.analysis_result?.duration_seconds || null,
      llm_feedback: speech.value.llm_analysis?.feedback || ''
    }
    const cleanConversationHistory = conversationHistory.value.map(msg => {
      try {
        return {
          role: String(msg.role || 'user'),
          content: String(msg.content || '')
        };
      } catch (error) {
        console.warn('Failed to clean message:', msg, error);
        return {
          role: 'user',
          content: 'Message content unavailable'
        };
      }
    }).filter(msg => msg.content && msg.content.trim() !== '');
    const result = await window.electronAPI.chat({
      speechData,
      message,
      conversationHistory: cleanConversationHistory
    })
    if (result.success) {
      const coachMessage = {
        id: Date.now() + 1,
        text: result.response,
        isUser: false,
        timestamp: new Date().toISOString()
      }
      chatMessages.value.push(coachMessage)
      
      conversationHistory.value.push({ role: 'assistant', content: result.response })
      await saveChatContext()
    } else {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date().toISOString()
      }
      chatMessages.value.push(errorMessage)
    }
  } catch (error) {
    console.error('Chat error:', error)
    const errorMessage = {
      id: Date.now() + 1,
      text: "Sorry, I encountered an error. Please try again.",
      isUser: false,
      timestamp: new Date().toISOString()
    }
    chatMessages.value.push(errorMessage)
  } finally {
    isChatLoading.value = false
    isChatTyping.value = false
  }
}

const saveChatContext = async () => {
  if (!speech.value?.id) return
  
  try {
    const contextToSave = conversationHistory.value.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
    const { error } = await supabase
      .from('speeches')
      .update({ chat_context: contextToSave })
      .eq('id', speech.value.id)
    
    if (error) {
      console.error('Error saving chat context:', error)
    }
  } catch (error) {
    console.error('Error saving chat context:', error)
  }
}

const startEditing = (field, currentValue) => {
  editingField.value = field
  editingValue.value = String(currentValue || '')
}
const cancelEditing = () => {
  editingField.value = null
  editingValue.value = ''
  formatDropdownOpen.value = false
  positionDropdownOpen.value = false
}
const saveField = async () => {
  if (!speech.value || !editingField.value) return
  
  try {
    const newValue = editingValue.value.trim()
    
    if (isScrapedTournament.value) {
      const resultId = speech.value.id.split('_')[2]
      let updateData = {}
      
      if (editingField.value === 'partner') {
        updateData.speaker2_name = newValue
      } else if (editingField.value === 'position') {
        updateData.position = newValue
      } else if (editingField.value === 'format') {
        speech.value = { ...speech.value, debate_format: newValue }
        cancelEditing()
        return
      } else if (editingField.value === 'motion') {
        const roundId = speech.value.id.split('_')[1]
        await supabase
          .from('debate_rounds')
          .update({ motion: newValue })
          .eq('id', roundId)
        speech.value = { ...speech.value, motion: newValue }
        cancelEditing()
        return
      } else if (editingField.value === 'date') {
        const roundId = speech.value.id.split('_')[1]
        await supabase
          .from('debate_rounds')
          .update({ date: newValue })
          .eq('id', roundId)
        
        speech.value = { ...speech.value, speech_date: newValue }
        cancelEditing()
        return
      }
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('debate_results')
          .update(updateData)
          .eq('id', resultId)
        if (error) throw error
                if (editingField.value === 'partner') {
          speech.value = { ...speech.value, partner: newValue }
        } else if (editingField.value === 'position') {
          speech.value = { ...speech.value, position: newValue }
        }
      }
    } else {
      let updateData = {}
      
      if (editingField.value === 'partner') {
        updateData.partner = newValue
      } else if (editingField.value === 'position') {
        updateData.position = newValue
      } else if (editingField.value === 'motion') {
        updateData.motion = newValue
      } else if (editingField.value === 'date') {
        updateData.speech_date = newValue
      } else if (editingField.value === 'format') {
        updateData.debate_format = newValue
      }
      
      const { error } = await supabase
        .from('speeches')
        .update(updateData)
        .eq('id', speech.value.id)
      
      if (error) throw error
      
      const fieldKey = editingField.value === 'date' ? 'speech_date' : editingField.value
      speech.value = { ...speech.value, [fieldKey]: newValue }
    }
    
    cancelEditing()
  } catch (error) {
    console.error('Error saving field:', error)
    alert('Failed to save changes. Please try again.')
  }
}

const startEditingFormat = () => {
  editingField.value = 'format'
  editingValue.value = speech.value.debate_format || 'BP'
  formatDropdownOpen.value = true
}

const startEditingPosition = () => {
  editingField.value = 'position'
  editingValue.value = speech.value.position || ''
  positionDropdownOpen.value = true
}

const getValidPositions = (format) => {
  if (format === 'BP') {
    return [
      { value: 'Prime Minister', label: 'Prime Minister (PM)' },
      { value: 'Deputy Prime Minister', label: 'Deputy Prime Minister (DPM)' },
      { value: 'Member of Government', label: 'Member of Government (MG)' },
      { value: 'Government Whip', label: 'Government Whip (GW)' },
      { value: 'Leader of Opposition', label: 'Leader of Opposition (LO)' },
      { value: 'Deputy Leader of the Opposition', label: 'Deputy Leader of the Opposition (DLO)' },
      { value: 'Member of the Opposition', label: 'Member of the Opposition (MO)' },
      { value: 'Opposition Whip', label: 'Opposition Whip (OW)' }
    ]
  } else if (format === 'WSDC') {
    return [
      { value: 'Proposition First Speaker', label: 'Proposition First Speaker (Prop 1st)' },
      { value: 'Proposition Second Speaker', label: 'Proposition Second Speaker (Prop 2nd)' },
      { value: 'Proposition Third Speaker', label: 'Proposition Third Speaker (Prop 3rd)' },
      { value: 'Opposition First Speaker', label: 'Opposition First Speaker (Opp 1st)' },
      { value: 'Opposition Second Speaker', label: 'Opposition Second Speaker (Opp 2nd)' },
      { value: 'Opposition Third Speaker', label: 'Opposition Third Speaker (Opp 3rd)' }
    ]
  }
  return []
}

onMounted(async () => {
  supabase = await getSupabaseClient()
  loadSpeech()
})
</script>

<style scoped>
.markdown-content :deep(h1) {
  @apply text-2xl font-semibold text-primary mb-4 mt-6;
}

.markdown-content :deep(h2) {
  @apply text-xl font-semibold text-primary mb-3 mt-4;
}

.markdown-content :deep(h3) {
  @apply text-lg font-semibold text-primary mb-2;
}

.markdown-content :deep(p) {
  @apply mb-3 leading-relaxed;
}

.markdown-content :deep(li) {
  @apply ml-4 mb-1;
}

.markdown-content :deep(strong) {
  @apply font-semibold;
}

.progress-ring {
  animation: progressAnimation 1.5s ease-out forwards;
}

@keyframes progressAnimation {
  from {
    stroke-dashoffset: 175.93; /* Full circle (2 * π * 28) */
  }
  to {
    stroke-dashoffset: var(--final-offset);
  }
}

.analysis-grid {
  display: grid;
  grid-template-columns: 0.5fr 0.7fr 0.5fr 0.8fr 1.4fr 1.0fr 0.7fr;
  grid-template-rows: 1fr;
}
</style>
