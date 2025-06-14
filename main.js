const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');


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
  
  // Handler for full analysis with pre-computed transcription
  ipcMain.handle('analyze-speech-with-transcript', async (event, { 
    audioPath, motion, format, position, roundType, tournamentName, rank, specificFeedback, preTranscript, preDuration 
  }) => {
    return new Promise((resolve, reject) => {
      const args = [
        path.join(__dirname, '../python/speech_analyzer.py'),
        audioPath,
        motion,
        format,
        position,
        rank || 'null',
        specificFeedback || 'null',
        preTranscript || 'null',
        preDuration ? preDuration.toString() : 'null'
      ];
  
      const pythonExecutable = '/Library/Frameworks/Python.framework/Versions/3.12/bin/python3';
      const pythonProcess = spawn(pythonExecutable, [pythonScript, audioPath]);
  
      let stdout = '';
      let stderr = '';
  
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
  
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log('Analysis stderr:', data.toString());
      });
  
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Analysis process stderr:', stderr);
          reject(new Error(`Analysis failed with code ${code}: ${stderr}`));
          return;
        }
  
        try {
          // Parse the JSON output from stdout
          const lines = stdout.trim().split('\n');
          const jsonLine = lines[lines.length - 1]; // Last line should be JSON
          const result = JSON.parse(jsonLine);
          resolve(result);
        } catch (error) {
          console.error('Failed to parse analysis output:', error);
          console.error('Raw stdout:', stdout);
          reject(new Error(`Failed to parse analysis output: ${error.message}`));
        }
      });
  
      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start analysis process: ${error.message}`));
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