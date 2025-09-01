<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        Data Type
      </label>
      <select
        v-model="dataType"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
      >
        <option value="">Select data type</option>
        <option value="speeches">Speech Records</option>
        <option value="partners">Partners</option>
        <option value="tournaments">Tournaments</option>
        <option value="results">Debate Results</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-primary mb-2">
        File Format
      </label>
      <select
        v-model="fileFormat"
        class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
      >
        <option value="csv">CSV (.csv)</option>
        <option value="json">JSON (.json)</option>
        <option value="xlsx">Excel (.xlsx)</option>
      </select>
    </div>

    <!-- File Upload Area -->
    <div
      @drop.prevent="handleFileDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @click="selectFile"
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
        isDragOver || selectedFile
          ? 'border-accent bg-accent/5'
          : 'border-border hover:border-accent/50 hover:bg-surface-hover'
      ]"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="getAcceptedFileTypes()"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div v-if="selectedFile" class="space-y-2">
        <div class="text-accent text-lg">📁</div>
        <div class="text-primary font-medium">{{ selectedFile.name }}</div>
        <div class="text-muted text-sm">{{ formatFileSize(selectedFile.size) }}</div>
        <button
          @click.stop="clearFile"
          class="text-muted hover:text-primary text-sm underline"
        >
          Remove file
        </button>
      </div>
      
      <div v-else class="space-y-2">
        <div class="text-4xl text-muted">📁</div>
        <div class="text-primary">Drop your {{ fileFormat.toUpperCase() }} file here</div>
        <div class="text-muted text-sm">or click to select a file</div>
      </div>
    </div>

    <!-- Column Mapping (for CSV) -->
    <div v-if="selectedFile && fileFormat === 'csv' && previewData.length > 0" class="space-y-3">
      <div class="text-sm font-medium text-primary">Column Mapping</div>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <div
          v-for="(column, index) in previewData[0]"
          :key="index"
          class="flex items-center space-x-3 p-2 bg-surface-hover rounded"
        >
          <div class="text-sm text-primary min-w-0 flex-1">{{ column }}</div>
          <select
            v-model="columnMapping[column]"
            class="px-2 py-1 bg-surface border border-border rounded text-xs text-primary"
          >
            <option value="">Ignore</option>
            <option v-for="field in getAvailableFields()" :key="field" :value="field">
              {{ field }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Data Preview -->
    <div v-if="previewData.length > 0" class="space-y-2">
      <div class="text-sm font-medium text-primary">Data Preview (First 3 rows)</div>
      <div class="bg-surface-hover rounded-lg p-3 text-xs overflow-x-auto">
        <pre class="text-muted">{{ JSON.stringify(previewData.slice(0, 3), null, 2) }}</pre>
      </div>
    </div>

    <button
      @click="importData"
      :disabled="!selectedFile || !dataType || isImporting"
      :class="[
        'w-full py-2 px-4 rounded-lg font-medium transition-colors',
        (!selectedFile || !dataType || isImporting)
          ? 'bg-surface-hover text-muted cursor-not-allowed'
          : 'bg-accent text-white hover:bg-accent/90'
      ]"
    >
      <span v-if="isImporting" class="flex items-center justify-center">
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        Importing...
      </span>
      <span v-else>
        Import Data
      </span>
    </button>

    <!-- Import Progress -->
    <div v-if="importProgress.total > 0" class="space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-primary">Imported: {{ importProgress.current }}/{{ importProgress.total }}</span>
        <span class="text-muted">{{ Math.round((importProgress.current / importProgress.total) * 100) }}%</span>
      </div>
      <div class="w-full bg-surface-hover rounded-full h-2">
        <div
          class="bg-accent h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(importProgress.current / importProgress.total) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { getSupabaseClient } from '../lib/supabaseClient.js'

const emit = defineEmits(['data-imported'])

const dataType = ref('')
const fileFormat = ref('csv')
const selectedFile = ref(null)
const isDragOver = ref(false)
const isImporting = ref(false)
const previewData = ref([])
const columnMapping = reactive({})
const fileInput = ref(null)

let supabase

const importProgress = reactive({
  current: 0,
  total: 0
})

const getAcceptedFileTypes = () => {
  switch (fileFormat.value) {
    case 'csv': return '.csv'
    case 'json': return '.json'
    case 'xlsx': return '.xlsx'
    default: return '*'
  }
}

const getAvailableFields = () => {
  switch (dataType.value) {
    case 'speeches':
      return ['title', 'content', 'tournament_id', 'partner', 'position', 'speech_date', 'debate_format', 'place_in_round']
    case 'partners':
      return ['name', 'school', 'email']
    case 'tournaments':
      return ['name', 'start_date', 'end_date', 'format', 'location', 'description']
    case 'results':
      return ['tournament_id', 'round', 'position', 'team_name', 'speaker', 'partner', 'score', 'place']
    default:
      return []
  }
}

const selectFile = () => {
  fileInput.value?.click()
}

const clearFile = () => {
  selectedFile.value = null
  previewData.value = []
  Object.keys(columnMapping).forEach(key => delete columnMapping[key])
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleFileDrop = (event) => {
  isDragOver.value = false
  const files = event.dataTransfer.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

const handleFileSelect = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

const handleFile = async (file) => {
  selectedFile.value = file
  await processFilePreview(file)
}

const processFilePreview = async (file) => {
  try {
    const text = await file.text()
    
    if (fileFormat.value === 'csv') {
      const lines = text.split('\n').filter(line => line.trim())
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        previewData.value = [headers]
        
        // Initialize column mapping
        headers.forEach(header => {
          columnMapping[header] = ''
        })
        
        // Process a few data rows
        for (let i = 1; i < Math.min(4, lines.length); i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          previewData.value.push(values)
        }
      }
    } else if (fileFormat.value === 'json') {
      const jsonData = JSON.parse(text)
      previewData.value = Array.isArray(jsonData) ? jsonData.slice(0, 3) : [jsonData]
    }
  } catch (error) {
    console.error('Error processing file preview:', error)
    alert('Error reading file: ' + error.message)
  }
}

const importData = async () => {
  if (!selectedFile.value || !dataType.value) return

  isImporting.value = true
  importProgress.current = 0
  importProgress.total = 100

  try {
    const supabase = await getSupabaseClient()
    const text = await selectedFile.value.text()
    let dataToImport = []

    if (fileFormat.value === 'csv') {
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const row = {}
        
        headers.forEach((header, index) => {
          const mappedField = columnMapping[header]
          if (mappedField && values[index]) {
            row[mappedField] = values[index]
          }
        })
        
        if (Object.keys(row).length > 0) {
          dataToImport.push(row)
        }
      }
    } else if (fileFormat.value === 'json') {
      dataToImport = JSON.parse(text)
      if (!Array.isArray(dataToImport)) {
        dataToImport = [dataToImport]
      }
    }

    importProgress.total = dataToImport.length

    // Import in batches
    const batchSize = 100
    let imported = 0
    
    for (let i = 0; i < dataToImport.length; i += batchSize) {
      const batch = dataToImport.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from(dataType.value)
        .insert(batch)

      if (error) {
        console.error('Batch import error:', error)
        // Continue with next batch
      } else {
        imported += batch.length
      }
      
      importProgress.current = imported
    }

    emit('data-imported', { count: imported, type: dataType.value })
    
    // Reset form
    clearFile()
    dataType.value = ''

  } catch (error) {
    console.error('Import error:', error)
    alert('Import failed: ' + error.message)
  } finally {
    isImporting.value = false
  }
}

// Watch file format changes to reset file
watch(fileFormat, () => {
  clearFile()
})
</script>
