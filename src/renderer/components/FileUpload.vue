<template>
  <div class="w-full">
    <div
      class="relative border border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer bg-surface border-border/60"
      :class="{ 'border-accent/60 bg-accent/5': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleFileDrop"
      @click="triggerFileInput"
    >
      <input
        type="file"
        ref="fileInput"
        class="hidden"
        accept=".wav,.mp3"
        @change="handleFileSelect"
      />
      
      <div v-if="!selectedFile" class="space-y-4 pointer-events-none">
        <div class="flex flex-col items-center space-y-2">
          <svg class="w-12 h-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div class="text-secondary text-lg">
            Drag and drop your audio file here, or click to upload
          </div>
        </div>
        <p class="text-secondary text-sm">Accepted formats: .wav, .mp3</p>
      </div>

      <div v-else class="space-y-4">
        <div class="flex items-center justify-between bg-surface rounded-md p-4 border border-border/60">
          <div class="flex items-center space-x-4">
            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <div class="text-left">
              <p class="text-primary font-medium truncate max-w-xs">{{ selectedFile.name }}</p>
              <p class="text-secondary text-sm">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
          <button
            @click.stop="removeFile"
            class="text-secondary hover:text-primary transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['file-selected', 'file-removed']);

const fileInput = ref(null);
const selectedFile = ref(null);
const isDragging = ref(false);
const error = ref('');

const validateFile = (file) => {
  error.value = '';
  
  const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/wave'];
  if (!validTypes.includes(file.type)) {
    error.value = 'Please upload a valid audio file (.wav or .mp3)';
    return false;
  }

  const maxSize = 100 * 1024 * 1024; // 100mb
  if (file.size > maxSize) {
    error.value = 'File size must be less than 100MB';
    return false;
  }

  return true;
};

const handleFile = (file) => {
  if (!validateFile(file)) {
    return;
  }
  selectedFile.value = file;
  emit('file-selected', file);
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) handleFile(file);
};

const handleFileDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) handleFile(file);
};

const triggerFileInput = () => {
  if (!selectedFile.value) {
    fileInput.value.click();
  }
};

const removeFile = () => {
  selectedFile.value = null;
  error.value = '';
  emit('file-removed');
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
</script> 