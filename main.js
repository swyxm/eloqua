const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');


// Import services
const SpeechAnalyzer = require('./src/main/services/speechAnalyzer.js');
const speechAnalyzer = new SpeechAnalyzer();

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
ipcMain.handle('transcribe', async (event, { audioPath }) => {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, 'src', 'main', 'python', 'transcribe.py');
      const pythonExecutable = '/Library/Frameworks/Python.framework/Versions/3.12/bin/python3';
      const pythonProcess = spawn(pythonExecutable, [pythonScript, audioPath]);
  
  
      let stdout = '';
      let stderr = '';
  
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
  
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
  
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`transcription failed ${code}: ${stderr}`));
          return;
        }
  
        try {
          const lines = stdout.trim().split('\n');
          const jsonLine = lines[lines.length - 1];
          const result = JSON.parse(jsonLine);
          resolve(result);
        } catch (error) {
          reject(new Error(`failed to parse transcription output: ${error.message}`));
        }
      });
  
      pythonProcess.on('error', (error) => {
        reject(new Error(`failed to start transcription process: ${error.message}`));
      });
    });
  });
  

ipcMain.handle('select-file', () => fileService.selectAudioFile());

ipcMain.handle('analyze-speech', async (event, { audioPath, motion, format, position, placeInRound, specificFeedback }) => {
  return speechAnalyzer.analyze(audioPath, motion, format, position, placeInRound, specificFeedback);
});

ipcMain.handle('chat', async (event, { analysis, message }) => {
  return chatService.getResponse(analysis, message);
}); 