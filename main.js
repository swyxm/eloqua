const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');


let SpeechAnalyzer, debateCoach, speechAnalyzer;

try {
  SpeechAnalyzer = require('./src/main/services/speechAnalyzer.js');
  debateCoach = require('./src/main/services/debateCoach.js');
  speechAnalyzer = new SpeechAnalyzer();
  
  if (debateCoach && typeof debateCoach.getChatResponse === 'function') {  
    debateCoach.getChatResponse(
      { motion: 'test', debate_format: 'BP', position: 'PM', score: 75, duration: 120, llm_feedback: 'test' },
      'test message',
      []
    ).then(response => {
    }).catch(error => {
    });
  }
} catch (error) {
  console.error('Failed to load services:', error.message);}
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

  const distExists = require('fs').existsSync(path.join(__dirname, 'dist', 'index.html'));
  
  if (isDev && !distExists) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    console.log('Loading from production build:', path.join(__dirname, 'dist', 'index.html'));
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Renderer failed to load:', errorCode, errorDescription);
    });
    mainWindow.webContents.on('console-message', (e, level, message, line, sourceId) => {
      console.log('Renderer console:', { level, message, line, sourceId });
    });
    mainWindow.webContents.openDevTools();
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

ipcMain.handle('chat', async (event, { speechData, message, conversationHistory }) => {
  
  try {
    if (!debateCoach || typeof debateCoach.getChatResponse !== 'function') {
      console.error('debateCoach service not properly loaded');
      return { success: false, error: 'Debate coach service not available' };
    }
    
    const response = await debateCoach.getChatResponse(speechData, message, conversationHistory);
    return { success: true, response };
  } catch (error) {
    console.error('Chat error:', error);
    return { success: false, error: error.message };
  }
}); 