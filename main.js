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

const Store = require('electron-store');
const store = new Store({
  name: 'eloqua-settings',
  encryptionKey: 'eloqua-secure-key',
});

const loadSettingsToEnv = () => {
  try {
    const geminiApiKey = store.get('geminiApiKey');
    const supabaseUrl = store.get('supabaseUrl');
    const supabaseAnonKey = store.get('supabaseAnonKey');
    
    if (geminiApiKey) process.env.GEMINI_API_KEY = geminiApiKey;
    if (supabaseUrl) process.env.SUPABASE_URL = supabaseUrl;
    if (supabaseAnonKey) process.env.SUPABASE_ANON_KEY = supabaseAnonKey;
    

  } catch (error) {
    console.error('Error loading settings:', error);
  }
};

loadSettingsToEnv();



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
  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

  if (isDev) {
    mainWindow.loadURL(devUrl);
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

function registerIpcHandlers() {
  console.log('[Main] Registering IPC handlers...')
  ipcMain.handle('get-settings', async () => {
    try {
      return {
        geminiApiKey: store.get('geminiApiKey', ''),
        supabaseUrl: store.get('supabaseUrl', ''),
        supabaseAnonKey: store.get('supabaseAnonKey', ''),
        databaseMode: store.get('databaseMode', 'local'),
        whisperModel: store.get('whisperModel', 'small')
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  });

  ipcMain.handle('save-settings', async (event, settings) => {
    try {
      if (settings.geminiApiKey !== undefined) store.set('geminiApiKey', settings.geminiApiKey);
      if (settings.supabaseUrl !== undefined) store.set('supabaseUrl', settings.supabaseUrl);
      if (settings.supabaseAnonKey !== undefined) store.set('supabaseAnonKey', settings.supabaseAnonKey);
      if (settings.databaseMode !== undefined) store.set('databaseMode', settings.databaseMode);
      if (settings.whisperModel !== undefined) store.set('whisperModel', settings.whisperModel);
      
      if (settings.geminiApiKey) process.env.GEMINI_API_KEY = settings.geminiApiKey;
      if (settings.supabaseUrl) process.env.SUPABASE_URL = settings.supabaseUrl;
      if (settings.supabaseAnonKey) process.env.SUPABASE_ANON_KEY = settings.supabaseAnonKey;
      if (settings.whisperModel) process.env.WHISPER_MODEL = settings.whisperModel;

      
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('install-whisper-model', async (event, modelName) => {
    console.log('[Main] install-whisper-model invoked with:', modelName)
    try {
      let pythonScript;
      if (app.isPackaged) {
        pythonScript = path.join(process.resourcesPath, 'python', 'model_manager.py');
      } else {
        pythonScript = path.join(__dirname, 'src', 'main', 'python', 'model_manager.py');
      }
      
      let pythonExecutable = process.env.PYTHON_EXECUTABLE;
      if (!pythonExecutable) {
        if (app.isPackaged) {
          if (process.platform === 'win32') {
            pythonExecutable = 'python';
          } else {
            pythonExecutable = 'python3';
          }
        } else {
          pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
        }
      }
      
      if (!require('fs').existsSync(pythonScript)) {
        return { success: false, error: 'Model manager script not found' };
      }
      
      const env = { 
        ...process.env,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
      };
      
      const pythonProcess = spawn(pythonExecutable, [pythonScript, modelName, 'install'], { env });
      
      return new Promise((resolve, reject) => {
        let output = '';
        let error = '';
        
        pythonProcess.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
          const chunk = data.toString();
          error += chunk;
          // Try to extract percentage from tqdm-like output (e.g., " 63%|")
          const match = chunk.match(/(\d{1,3})%/);
          if (match) {
            const percent = Math.max(0, Math.min(100, parseInt(match[1], 10)));
            const windows = BrowserWindow.getAllWindows();
            if (windows.length > 0) {
              windows[0].webContents.send('whisper-install-progress', { model: modelName, progress: percent });
            }
          }
        });
        
        pythonProcess.on('close', (code) => {
          if (code === 0) {
            try {
              const result = JSON.parse(output.trim());
              console.log('[Main] Model install result:', result);
              resolve({ success: true, result });
            } catch (e) {
              resolve({ success: false, error: 'Failed to parse model manager output' });
            }
          } else {
            resolve({ success: false, error: `Model installation failed: ${error}` });
          }
        });
        
        pythonProcess.on('error', (err) => {
          resolve({ success: false, error: `Failed to start model manager: ${err.message}` });
        });
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('transcribe', async (event, { audioPath }) => {
    return new Promise((resolve, reject) => {
      let pythonScript;
      if (app.isPackaged) {
        pythonScript = path.join(process.resourcesPath, 'python', 'transcribe.py');
      } else {
        pythonScript = path.join(__dirname, 'src', 'main', 'python', 'transcribe.py');
      }
      
      let pythonExecutable = process.env.PYTHON_EXECUTABLE;
      if (!pythonExecutable) {
        if (app.isPackaged) {
          if (process.platform === 'win32') {
            pythonExecutable = 'python';
          } else {
            pythonExecutable = 'python3';
          }
        } else {
          pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
        }
      }
      
      if (!require('fs').existsSync(pythonScript)) {
        reject(new Error(`Python script not found: ${pythonScript}`));
        return;
      }
      
      const whisperModel = store.get('whisperModel', 'small');
      const env = { 
        ...process.env,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
      };
      
      const pythonProcess = spawn(pythonExecutable, [pythonScript, audioPath, whisperModel], { env });

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

  // File selection handler
  ipcMain.handle('select-file', () => fileService.selectAudioFile());

  ipcMain.handle('analyze-speech', async (event, { audioPath, motion, format, position, placeInRound, specificFeedback }) => {
    try {
      console.log('Analyze speech called with:', { audioPath, motion, format, position, placeInRound, specificFeedback });
      
      if (!speechAnalyzer) {
        console.error('SpeechAnalyzer service not loaded');
        return { success: false, error: 'Speech analyzer service not available' };
      }
      
      const whisperModel = store.get('whisperModel', 'small');
      const result = await speechAnalyzer.analyze(audioPath, motion, format, position, placeInRound, specificFeedback);
      console.log('Analysis result:', result);
      return { success: true, result };
    } catch (error) {
      console.error('Speech analysis error:', error);
      return { success: false, error: error.message };
    }
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
}

app.whenReady().then(() => {
  registerIpcHandlers();
  
  if (app.isPackaged) {
    const pythonDir = path.join(process.resourcesPath, 'python');
    const transcribeScript = path.join(pythonDir, 'transcribe.py');
    const speechAnalyzerScript = path.join(pythonDir, 'speech_analyzer.py');
    
    console.log('Checking Python scripts in packaged app:');
    console.log('Python directory:', pythonDir);
    console.log('Transcribe script exists:', require('fs').existsSync(transcribeScript));
    console.log('Speech analyzer script exists:', require('fs').existsSync(speechAnalyzerScript));
  }
  
  createWindow();
});

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

