const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Import services
//const fileService = require('./src/backend/services/fileService');
const SpeechAnalyzer = require('./src/main/services/speechAnalyzer.js');
const speechAnalyzer = new SpeechAnalyzer();
//const chatService = require('./src/backend/services/chatService');
const fileService = {
    selectAudioFile: async () => {
      const { dialog } = require('electron');
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Audio Files', extensions: ['mp3', 'wav', 'mp4', 'avi'] }
        ]
      });
      return result.filePaths[0];
    }
  };
  
  const chatService = {
    getResponse: async (analysis, message) => {
      // Placeholder - implement your chat logic here
      return {
        response: "Chat service not implemented yet",
        analysis: analysis,
        userMessage: message
      };
    }
  };

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html from the dist folder in production
  // or the dev server in development
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('select-file', () => fileService.selectAudioFile());

ipcMain.handle('analyze-speech', async (event, { audioPath, motion, format, position, placeInRound, specificFeedback }) => {
  return speechAnalyzer.analyze(audioPath, motion, format, position, placeInRound, specificFeedback);
});

ipcMain.handle('chat', async (event, { analysis, message }) => {
  return chatService.getResponse(analysis, message);
}); 