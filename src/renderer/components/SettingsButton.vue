<template>
  <div>
    <button
      @click="showSettings = true"
      class="p-2 rounded-full bg-surface hover:bg-surface-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
      title="Settings"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-if="showSettings"
        class="fixed inset-0 z-[9999] overflow-y-auto"
      >
        <div 
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          @click="showSettings = false"
        ></div>
        
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            class="relative bg-surface border border-border rounded-md p-6 w-full max-w-md shadow-xl transform transition-all"
            @click.stop
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-foreground">Settings</h3>
              <button
                @click="showSettings = false"
                class="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-primary mb-2">
                  Gemini API Key
                </label>
                <input
                  v-model="workingSettings.geminiApiKey"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  class="w-full px-3 py-2 border border-border rounded-md bg-background text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                                  <p class="text-xs text-muted mt-1">
                    Required for AI speech analysis and coaching
                  </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-primary mb-2">
                  Supabase URL
                </label>
                <input
                  v-model="workingSettings.supabaseUrl"
                  type="url"
                  placeholder="https://your-project.supabase.co"
                  class="w-full px-3 py-2 border border-border rounded-md bg-background text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-primary mb-2">
                  Supabase Anon Key
                </label>
                <input
                  v-model="workingSettings.supabaseAnonKey"
                  type="password"
                  placeholder="Enter your Supabase anon key"
                  class="w-full px-3 py-2 border border-border rounded-md bg-background text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p class="text-xs text-muted mt-1">
                  Optional - enables cloud sync and backup
                </p>
              </div>

                              <div>
                  <label class="block text-sm font-medium text-primary mb-2">
                    Database Mode
                  </label>
                  <select
                    v-model="workingSettings.databaseMode"
                    class="w-full px-3 py-2 border border-border rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="local">Local Only (SQLite)</option>
                    <option value="cloud">Cloud Sync (Supabase)</option>
                    <option value="hybrid">Hybrid (Local + Cloud)</option>
                  </select>
                  <p class="text-xs text-muted mt-1">
                    Choose how your data is stored and synced
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-primary mb-2">
                    Whisper Model
                  </label>
                  <select
                    v-model="workingSettings.whisperModel"
                    class="w-full px-3 py-2 border border-border rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="tiny">Tiny (39 MB) - Fastest, least accurate</option>
                    <option value="base">Base (74 MB) - Fast, good for basic transcription</option>
                    <option value="small">Small (244 MB) - Balanced speed/accuracy</option>
                    <option value="medium">Medium (769 MB) - Better accuracy, slower</option>
                    <option value="large">Large (1550 MB) - Best accuracy, slowest</option>
                  </select>
                  <p class="text-xs text-muted mt-1">
                    Choose the Whisper model for speech transcription. Larger models are more accurate but slower.
                  </p>
                </div>

              <div v-if="saveStatus" class="mt-2 text-center">
                <p 
                  class="text-sm py-1 px-2 rounded-md" 
                  :class="saveStatus.includes('Error') ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'"
                >
                  {{ saveStatus }}
                </p>
              </div>
              
              <div class="flex gap-3 pt-4">
                <button
                  @click="saveSettings"
                  class="flex-1 px-4 py-2 bg-accent text-accent-text rounded-md hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  Save Settings
                </button>
                <button
                  @click="showSettings = false"
                  class="flex-1 px-4 py-2 bg-surface border border-border text-primary rounded-md hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, watch, inject } from 'vue'

const showSettings = ref(false)

// Working copy - what user types in the form
const workingSettings = reactive({
  geminiApiKey: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  databaseMode: 'local',
  whisperModel: 'small'
})

// Watch for when settings modal opens and load saved settings
watch(showSettings, async (newValue) => {
  if (newValue === true) {
    // Modal is opening, load saved settings into working copy
    await loadSettings()
  } else {
    // Modal is closing, reset working copy to empty
    resetWorkingSettings()
  }
})

const saveSettings = async () => {
  try {
    const prevSettings = await window.electron.ipcRenderer.invoke('get-settings')

    const settingsToSave = {
      geminiApiKey: workingSettings.geminiApiKey,
      supabaseUrl: workingSettings.supabaseUrl,
      supabaseAnonKey: workingSettings.supabaseAnonKey,
      databaseMode: workingSettings.databaseMode,
      whisperModel: workingSettings.whisperModel
    }
    
    const result = await window.electron.ipcRenderer.invoke('save-settings', settingsToSave)
    
    if (result.success) {
      if (prevSettings?.whisperModel !== workingSettings.whisperModel) {
        if (showModelInstall) showModelInstall(workingSettings.whisperModel)
        
        try {
          const installResult = await window.electron.ipcRenderer.invoke('install-whisper-model', workingSettings.whisperModel)
          
          if (installResult.success) {
            if (updateModelInstallProgress) updateModelInstallProgress(100)
            setTimeout(() => {
              if (hideModelInstall) hideModelInstall()
            }, 1200)
          } else {
            console.error('Model installation failed:', installResult.error)
            if (hideModelInstall) hideModelInstall()
          }
        } catch (error) {
          console.error('Failed to install model:', error)
          if (hideModelInstall) hideModelInstall()
        }
      }
      saveStatus.value = 'Settings saved successfully!'
      setTimeout(() => {
        saveStatus.value = ''
        showSettings.value = false
      }, 1500)
    } else {
      saveStatus.value = `Error: ${result.error || 'Failed to save settings'}`
      setTimeout(() => {
        saveStatus.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Failed to save settings:', error)
    saveStatus.value = 'Error: Failed to save settings'
    setTimeout(() => {
      saveStatus.value = ''
    }, 3000)
  }
}

const resetWorkingSettings = () => {
  workingSettings.geminiApiKey = ''
  workingSettings.supabaseUrl = ''
  workingSettings.supabaseAnonKey = ''
  workingSettings.databaseMode = 'local'
  workingSettings.whisperModel = 'small'
}

const saveStatus = ref('')

const showModelInstall = inject('showModelInstall')
const updateModelInstallProgress = inject('updateModelInstallProgress')
const hideModelInstall = inject('hideModelInstall')

if (window.electronAPI && typeof window.electronAPI.onWhisperInstallProgress === 'function') {
  window.electronAPI.onWhisperInstallProgress(({ model, progress }) => {
    if (updateModelInstallProgress) updateModelInstallProgress(progress)
    if (progress >= 100 && hideModelInstall) hideModelInstall()
  })
}

const loadSettings = async () => {
  try {
    const savedSettings = await window.electron.ipcRenderer.invoke('get-settings')
    if (savedSettings) {
      // Load saved settings into working copy
      workingSettings.geminiApiKey = savedSettings.geminiApiKey || ''
      workingSettings.supabaseUrl = savedSettings.supabaseUrl || ''
      workingSettings.supabaseAnonKey = savedSettings.supabaseAnonKey || ''
      workingSettings.databaseMode = savedSettings.databaseMode || 'local'
      workingSettings.whisperModel = savedSettings.whisperModel || 'small'
      
      console.log('Loaded saved settings into working copy:', savedSettings)
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}
</script>