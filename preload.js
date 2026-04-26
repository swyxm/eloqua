const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => {
      const validChannels = [
        'transcribe',
        'select-file', 
        'analyze-speech', 
        'chat',
        'get-settings',
        'save-settings',
        'install-whisper-model',
        'scrape-tabbycat',
        'prep-plan',
        'prep-research',
        'db-query'
      ];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      throw new Error(`Invalid channel: ${channel}`);
    }
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  dbQuery: (table, operations) => ipcRenderer.invoke('db-query', table, operations),
  selectFile: () => ipcRenderer.invoke('select-file'),
  analyzeSpeech: (data) => ipcRenderer.invoke('analyze-speech', data),
  chat: (data) => ipcRenderer.invoke('chat', data),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  scrapeTabbycat: (data) => ipcRenderer.invoke('scrape-tabbycat', data),
  prepPlan: (motion, side) => ipcRenderer.invoke('prep-plan', motion, side),
  prepResearch: (motion, queries, side) => ipcRenderer.invoke('prep-research', motion, queries, side),
  onPrepProgress: (cb) => {
    ipcRenderer.removeAllListeners('prep-progress');
    ipcRenderer.on('prep-progress', (_event, data) => cb?.(data));
  },
  offPrepProgress: () => {
    ipcRenderer.removeAllListeners('prep-progress');
  },
  onWhisperInstallProgress: (cb) => {
    ipcRenderer.removeAllListeners('whisper-install-progress')
    ipcRenderer.on('whisper-install-progress', (_event, data) => cb?.(data))
  }
}); 