<template>
  <div class="chat-interface rounded-b-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-200 flex flex-col h-full">
    <div 
      ref="chatContainer"
      class="messages-container flex-1 p-4 overflow-y-auto"
    >
      <div 
        v-for="message in messages"
        :key="message.id"
        :class="[
          'message p-3 rounded-lg mb-3 max-w-[80%]',
          'transition-all duration-200 shadow-sm',
          message.isUser 
            ? 'ml-auto bg-chat-user text-chat-user-text rounded-tr-none border border-border/30'
            : 'mr-auto bg-chat-bot text-chat-bot-text rounded-tl-none border border-border/30'
        ]"
      >
        <div 
          :class="[
            'break-words',
            message.isUser ? 'whitespace-pre-wrap' : 'markdown-content'
          ]"
          v-html="message.isUser ? message.text : renderMarkdown(message.text)"
        ></div>
        <div 
          v-if="message.timestamp" 
          :class="[
            'text-xs mt-1 text-right',
            message.isUser ? 'text-chat-user-text/70' : 'text-chat-bot-text/70'
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
          <span v-if="!isLoading">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </span>
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

const renderMarkdown = (text) => {
  if (!text) return '';
  
  let html = text;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-primary mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-primary mb-3 mt-4">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-semibold text-primary mb-4 mt-6">$1</h1>');
  
  // Bold and Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  
  const lines = html.split('\n');
  let inList = false;
  let listType = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.match(/^(\d+\.|-)\s+/)) {
      // Start of a list
      if (!inList) {
        inList = true;
        listType = line.match(/^\d+\./) ? 'ol' : 'ul';
        lines[i] = `<${listType} class="list-${listType} ml-4 mb-3">\n<li class="ml-4 mb-1">${line.replace(/^(\d+\.|-)\s+/, '')}</li>`;
      } else {
        // Continue list
        lines[i] = `<li class="ml-4 mb-1">${line.replace(/^(\d+\.|-)\s+/, '')}</li>`;
      }
    } else if (inList && line === '') {
      // End of list
      inList = false;
      lines[i] = `</${listType}>\n`;
    } else if (inList && !line.match(/^(\d+\.|-)\s+/)) {
      // End of list (non-list item encountered)
      inList = false;
      lines[i] = `</${listType}>\n${line}`;
    } else if (!inList && line !== '') {
      // Regular paragraph
      lines[i] = `<p class="mb-3 leading-relaxed">${line}</p>`;
    }
  }
  
  if (inList) {
    lines.push(`</${listType}>`);
  }
  
  html = lines.join('\n');
  
  // Clean up
  html = html.replace(/<p class="mb-3 leading-relaxed"><\/p>/g, '');
  html = html.replace(/<p class="mb-3 leading-relaxed"><br><\/p>/g, '');
  
  return html;
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

<style scoped>
.message {
  position: relative;
}

.message:not(.message:last-child) {
  margin-bottom: 1rem;
}

/* AI Message specific styling - distinct dark bubble */
.message:not(.ml-auto) {
  background: rgb(var(--chat-bot));
  backdrop-filter: blur(8px);
  border: 1px solid rgb(var(--border) / 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* User Message specific styling - clean surface bubble */
.message.ml-auto {
  background: rgb(var(--chat-user));
  border: 1px solid rgb(var(--border) / 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

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

.markdown-content :deep(em) {
  @apply italic;
}

.markdown-content :deep(ul) {
  @apply list-disc ml-4 mb-3;
}

.markdown-content :deep(ol) {
  @apply list-decimal ml-4 mb-3;
}

.markdown-content :deep(.list-ul) {
  @apply list-disc ml-4 mb-3;
}

.markdown-content :deep(.list-ol) {
  @apply list-decimal ml-4 mb-3;
}

.messages-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>