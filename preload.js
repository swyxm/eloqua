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
        'install-whisper-model'
      ];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      throw new Error(`Invalid channel: ${channel}`);
    }
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  analyzeSpeech: (data) => ipcRenderer.invoke('analyze-speech', data),
  chat: (data) => ipcRenderer.invoke('chat', data),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  onWhisperInstallProgress: (cb) => {
    ipcRenderer.removeAllListeners('whisper-install-progress')
    ipcRenderer.on('whisper-install-progress', (_event, data) => cb?.(data))
  }
}); 