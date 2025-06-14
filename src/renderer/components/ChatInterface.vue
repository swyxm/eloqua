<template>
  <div 
    :class="[
      'chat-interface rounded-xl backdrop-blur-sm transition-all duration-300',
      'border',
      isDark 
        ? 'bg-dark-surface/50 border-dark-border' 
        : 'bg-ui-card-bg/50 border-brown-muted/20'
    ]"
  >
    <div 
      ref="chatContainer"
      :class="[
        'messages-container p-4 h-96 overflow-y-auto',
        isDark ? 'scrollbar-dark' : 'scrollbar-light'
      ]"
    >
      <div 
        v-for="message in messages"
        :key="message.id"
        :class="[
          'message p-3 rounded-lg mb-2 max-w-xs',
          message.isUser 
            ? [
                'ml-auto',
                isDark ? 'bg-dark-accent text-white' : 'bg-blue-gray-dark text-white'
              ]
            : [
                'mr-auto', 
                isDark ? 'bg-dark-card text-dark-text' : 'bg-beige-warm text-gray-900'
              ]
        ]"
      >
        {{ message.text }}
      </div>
    </div>

    <!-- input section -->
    <div 
      :class="[
        'input-area border-t p-4 flex gap-2',
        isDark ? 'border-dark-border' : 'border-brown-muted/20'
      ]"
    >
      <input
        v-model="input"
        @keyup.enter="handleSubmit"
        :class="[
          'flex-1 px-4 py-2 rounded-lg border transition-colors',
          isDark 
            ? 'bg-dark-surface border-dark-border text-dark-text placeholder-dark-text-muted' 
            : 'bg-white border-brown-muted/30 text-gray-900 placeholder-blue-gray-light'
        ]"
        placeholder="Type your message..."
      />
      <button
        @click="handleSubmit"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-colors',
          isDark
            ? 'bg-dark-accent hover:bg-dark-accent/80 text-white'
            : 'bg-blue-gray-dark hover:bg-blue-gray-dark/80 text-white'
        ]"
      >
        Send
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useTheme } from '../../shared/composables/useTheme.js';

const props = defineProps({
  messages: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['send-message'])
const { isDark } = useTheme()
const input = ref('')
const chatContainer = ref(null)

const handleSubmit = () => {
  if (!input.value.trim()) return;
  emit('send-message', input.value);
  input.value = '';
}
watch(
  () => props.messages,
  () => {
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    });
  },
  { deep: true }
)
</script>