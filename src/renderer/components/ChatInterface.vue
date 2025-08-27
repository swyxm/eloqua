<template>
  <div class="chat-interface rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-200 flex flex-col h-full">
    <div 
      ref="chatContainer"
      class="messages-container flex-1 p-4 overflow-y-auto"
    >
      <div 
        v-for="message in messages"
        :key="message.id"
        :class="[
          'message p-3 rounded-md mb-3 max-w-[80%]',
          'transition-all duration-200',
          message.isUser 
            ? 'ml-auto bg-accent text-white rounded-tr-none'
            : 'mr-auto bg-surface text-primary rounded-tl-none'
        ]"
      >
        <div class="whitespace-pre-wrap break-words">{{ message.text }}</div>
        <div 
          v-if="message.timestamp" 
          :class="[
            'text-xs mt-1 text-right',
            message.isUser ? 'text-white/70' : 'text-secondary'
          ]"
        >
          {{ formatTime(message.timestamp) }}
        </div>
      </div>
      
      <div 
        v-if="isTyping"
        class="typing-indicator flex items-center space-x-1 p-3 bg-surface rounded-md w-24 mb-3"
      >
        <div class="w-2 h-2 bg-secondary rounded-full animate-bounce" style="animation-delay: 0ms"></div>
        <div class="w-2 h-2 bg-secondary rounded-full animate-bounce" style="animation-delay: 150ms"></div>
        <div class="w-2 h-2 bg-secondary rounded-full animate-bounce" style="animation-delay: 300ms"></div>
      </div>
    </div>

    <div class="input-area border-t border-border p-4 bg-card/50 backdrop-blur-sm">
      <div class="flex gap-2">
        <input
          v-model="input"
          @input="handleInput"
          @keyup.enter="handleSubmit"
          :disabled="isLoading"
          placeholder="Type your message..."
          class="form-input flex-1"
        />
        <button
          @click="handleSubmit"
          :disabled="!input.trim() || isLoading"
          class="button-primary"
        >
          <span v-if="!isLoading">Send</span>
          <span v-else class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
const props = defineProps({
  messages: {
    type: Array,
    required: true,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isTyping: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['send-message']);

const input = ref('');
const chatContainer = ref(null);

const handleSubmit = () => {
  if (!input.value.trim()) return;
  emit('send-message', input.value);
  input.value = '';
};

const handleInput = () => {
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

watch(
  () => props.messages,
  () => {
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    });
  },
  { deep: true, immediate: true }
);
</script>