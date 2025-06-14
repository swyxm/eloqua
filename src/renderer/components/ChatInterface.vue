<template>
  <div class="mt-6 border-t border-slate-200 pt-6">
    <div class="space-y-4">
      <div class="space-y-4 max-h-96 overflow-y-auto" ref="chatContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="[
            'p-4 rounded-lg',
            message.role === 'user' ? 'bg-ice-blue-50 ml-12' : 'bg-slate-50 mr-12'
          ]"
        >
          <p class="text-slate-700">{{ message.content }}</p>
          <p class="text-xs text-slate-500 mt-1">
            {{ new Date(message.timestamp).toLocaleTimeString() }}
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="flex gap-2">
        <input
          v-model="input"
          type="text"
          placeholder="Ask a question..."
          class="input-field flex-1"
        />
        <button
          type="submit"
          :disabled="!input.trim()"
          class="btn-primary"
        >
          Send
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatInterface',
  props: {
    messages: {
      type: Array,
      required: true
    }
  },
  emits: ['send-message'],
  data() {
    return {
      input: ''
    }
  },
  methods: {
    handleSubmit() {
      if (!this.input.trim()) return;
      
      this.$emit('send-message', this.input);
      this.input = '';
    }
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          const container = this.$refs.chatContainer;
          container.scrollTop = container.scrollHeight;
        });
      },
      deep: true
    }
  }
}
</script> 