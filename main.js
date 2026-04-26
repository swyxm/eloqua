const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const dbService = require('./src/main/services/database');

let SpeechAnalyzer, debateCoach, speechAnalyzer;

try {
  SpeechAnalyzer = require('./src/main/services/speechAnalyzer.js');
  debateCoach = require('./src/main/services/debateCoach.js');
  speechAnalyzer = new SpeechAnalyzer();
} catch (error) {
  console.error('Failed to load services:', error.message);
}

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



let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
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
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Renderer failed to load:', errorCode, errorDescription);
    });
    mainWindow.webContents.on('console-message', (e, level, message, line, sourceId) => {
    });
    mainWindow.webContents.openDevTools();
  }
}

function registerIpcHandlers() {
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

  ipcMain.handle('db-query', async (event, table, operations) => {
    return await dbService.query(table, operations);
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
    try {
      let pythonScript;
      if (app.isPackaged) {
        pythonScript = path.join(process.resourcesPath, 'python', 'model_manager.py');
      } else {
        pythonScript = path.join(__dirname, 'src', 'main', 'python', 'model_manager.py');
      }
      
      let runner;
      if (app.isPackaged) {
        const binDir = path.join(process.resourcesPath, 'bin');
        if (process.platform === 'win32') {
          runner = path.join(binDir, 'win', 'model_manager', 'model_manager.exe');
        } else if (process.platform === 'darwin') {
          runner = path.join(binDir, 'mac', 'model_manager', 'model_manager');
        } else {
          runner = path.join(binDir, 'linux', 'model_manager', 'model_manager');
        }
      }
      const useBundled = runner && require('fs').existsSync(runner);
      let pythonExecutable = process.env.PYTHON_EXECUTABLE;
      if (!pythonExecutable) pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
      
      if (!require('fs').existsSync(pythonScript)) {
        return { success: false, error: 'Model manager script not found' };
      }
      
      const env = { 
        ...process.env,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
      };

      // Add bundled bin directory to PATH so Python can find ffmpeg/ffprobe
      if (app.isPackaged) {
        const binDir = path.join(process.resourcesPath, 'bin', process.platform === 'win32' ? 'win' : (process.platform === 'darwin' ? 'mac' : 'linux'));
        const pathVar = process.platform === 'win32' ? 'Path' : 'PATH';
        env[pathVar] = `${binDir}${path.delimiter}${process.env[pathVar] || ''}`;
      }
      
      const args = useBundled ? [modelName, 'install'] : [pythonScript, modelName, 'install'];
      const cmd = useBundled ? runner : pythonExecutable;
      const pythonProcess = spawn(cmd, args, { env });
      
      return new Promise((resolve, reject) => {
        let output = '';
        let error = '';
        
        pythonProcess.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
          const chunk = data.toString();
          error += chunk;
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
      
      let runner;
      if (app.isPackaged) {
        const binDir = path.join(process.resourcesPath, 'bin');
        if (process.platform === 'win32') {
          runner = path.join(binDir, 'win', 'transcribe', 'transcribe.exe');
        } else if (process.platform === 'darwin') {
          runner = path.join(binDir, 'mac', 'transcribe', 'transcribe');
        } else {
          runner = path.join(binDir, 'linux', 'transcribe', 'transcribe');
        }
      }
      const useBundled = runner && require('fs').existsSync(runner);
      let pythonExecutable = process.env.PYTHON_EXECUTABLE;
      if (!pythonExecutable) pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
      
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

      if (app.isPackaged) {
        const binDir = path.join(process.resourcesPath, 'bin', process.platform === 'win32' ? 'win' : (process.platform === 'darwin' ? 'mac' : 'linux'));
        const pathVar = process.platform === 'win32' ? 'Path' : 'PATH';
        env[pathVar] = `${binDir}${path.delimiter}${process.env[pathVar] || ''}`;
      }
      
      const args = useBundled ? [audioPath, whisperModel] : [pythonScript, audioPath, whisperModel];
      const cmd = useBundled ? runner : pythonExecutable;

      const pythonProcess = spawn(cmd, args, { env });

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
    try {
      
      if (!speechAnalyzer) {
        console.error('SpeechAnalyzer service not loaded');
        return { success: false, error: 'Speech analyzer service not available' };
      }
      
      const whisperModel = store.get('whisperModel', 'small');
      const result = await speechAnalyzer.analyze(audioPath, motion, format, position, placeInRound, specificFeedback);
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

  ipcMain.handle('scrape-tabbycat', async (event, scrapeData) => {
    try {
      let pythonScript;
      if (app.isPackaged) {
        pythonScript = path.join(process.resourcesPath, 'python', 'tabbycat_scraper.py');
      } else {
        pythonScript = path.join(__dirname, 'src', 'main', 'python', 'tabbycat_scraper.py');
      }
      
      let runner;
      if (app.isPackaged) {
        const binDir = path.join(process.resourcesPath, 'bin');
        if (process.platform === 'win32') {
          runner = path.join(binDir, 'win', 'tabbycat_scraper', 'tabbycat_scraper.exe');
        } else if (process.platform === 'darwin') {
          runner = path.join(binDir, 'mac', 'tabbycat_scraper', 'tabbycat_scraper');
        } else {
          runner = path.join(binDir, 'linux', 'tabbycat_scraper', 'tabbycat_scraper');
        }
      }
      const useBundled = runner && require('fs').existsSync(runner);
      let pythonExecutable = process.env.PYTHON_EXECUTABLE;
      if (!pythonExecutable) pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
      
      if (!require('fs').existsSync(pythonScript)) {
        return { success: false, error: 'Tabbycat scraper script not found' };
      }
      
      return new Promise((resolve, reject) => {
        const args = [
          scrapeData.url,
          scrapeData.firstName,
          scrapeData.lastName
        ];
        
        if (scrapeData.institution) {
          args.push(scrapeData.institution);
        } else {
          args.push('');
        }
      
        const cmdArgs = useBundled ? args : [pythonScript, ...args];
        const cmd = useBundled ? runner : pythonExecutable;

        const env = { ...process.env };
        if (app.isPackaged) {
          const binDir = path.join(process.resourcesPath, 'bin', process.platform === 'win32' ? 'win' : (process.platform === 'darwin' ? 'mac' : 'linux'));
          const pathVar = process.platform === 'win32' ? 'Path' : 'PATH';
          env[pathVar] = `${binDir}${path.delimiter}${process.env[pathVar] || ''}`;
        }

        const pythonProcess = spawn(cmd, cmdArgs, { env });
        let outputData = '';
        let errorData = '';
        
        pythonProcess.stdout.on('data', (data) => {
          outputData += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
          errorData += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
          if (code === 0) {
            try {
              const result = JSON.parse(outputData);
              resolve(result);
            } catch (parseError) {
              resolve({ success: false, error: `Failed to parse scraper output: ${parseError.message}` });
            }
          } else {
            resolve({ success: false, error: `Scraper failed with code ${code}: ${errorData}` });
          }
        });
        
        pythonProcess.on('error', (error) => {
          resolve({ success: false, error: `Failed to start scraper: ${error.message}` });
        });
      });
      
    } catch (error) {
      console.error('Tabbycat scraping error:', error);
      return { success: false, error: error.message };
    }
  });

  function getPrepAgentCmd(extraArgs) {
    let pythonScript;
    if (app.isPackaged) {
      pythonScript = path.join(process.resourcesPath, 'python', 'prep_agent.py');
    } else {
      pythonScript = path.join(__dirname, 'src', 'main', 'python', 'prep_agent.py');
    }
    
    let runner;
    if (app.isPackaged) {
      const binDir = path.join(process.resourcesPath, 'bin');
      if (process.platform === 'win32') {
        runner = path.join(binDir, 'win', 'prep_agent', 'prep_agent.exe');
      } else if (process.platform === 'darwin') {
        runner = path.join(binDir, 'mac', 'prep_agent', 'prep_agent');
      } else {
        runner = path.join(binDir, 'linux', 'prep_agent', 'prep_agent');
      }
    }
    
    const useBundled = runner && require('fs').existsSync(runner);
    const pythonExecutable = process.env.PYTHON_EXECUTABLE || (process.platform === 'win32' ? 'python' : 'python3');
    
    if (!useBundled && !require('fs').existsSync(pythonScript)) {
      return null;
    }
    
    const cmd = useBundled ? runner : pythonExecutable;
    const baseArgs = useBundled ? [] : [pythonScript];
    return { cmd, args: [...baseArgs, ...extraArgs] };
  }
  
  function getPrepEnv() {
    const env = { 
      ...process.env,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || store.get('geminiApiKey')
    };

    if (app.isPackaged) {
      const binDir = path.join(process.resourcesPath, 'bin', process.platform === 'win32' ? 'win' : (process.platform === 'darwin' ? 'mac' : 'linux'));
      const pathVar = process.platform === 'win32' ? 'Path' : 'PATH';
      env[pathVar] = `${binDir}${path.delimiter}${process.env[pathVar] || ''}`;
    }

    return env;
  }

  // Phase 1: Plan only — returns search queries
  ipcMain.handle('prep-plan', async (event, motion, side) => {
    try {
      const cmdInfo = getPrepAgentCmd([motion, '--mode', 'plan', '--side', side || 'proposition']);
      if (!cmdInfo) return { success: false, error: 'Prep Agent script not found' };
      
      return new Promise((resolve) => {
        const pythonProcess = spawn(cmdInfo.cmd, cmdInfo.args, { env: getPrepEnv() });
        let outputData = '';
        let errorData = '';
        
        pythonProcess.stdout.on('data', (data) => { outputData += data.toString(); });
        pythonProcess.stderr.on('data', (data) => { errorData += data.toString(); });
        
        pythonProcess.on('close', (code) => {
          if (code === 0) {
            try { resolve(JSON.parse(outputData)); }
            catch (e) { resolve({ success: false, error: `Parse error: ${e.message}` }); }
          } else {
            resolve({ success: false, error: `Plan failed (code ${code}): ${errorData}` });
          }
        });
        pythonProcess.on('error', (err) => {
          resolve({ success: false, error: `Failed to start: ${err.message}` });
        });
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Phase 2: Research + Draft — takes user-confirmed queries
  ipcMain.handle('prep-research', async (event, motion, queries, side) => {
    try {
      const queriesJson = JSON.stringify(queries);
      const cmdInfo = getPrepAgentCmd([motion, '--mode', 'research', '--queries', queriesJson, '--side', side || 'proposition']);
      if (!cmdInfo) return { success: false, error: 'Prep Agent script not found' };
      
      return new Promise((resolve) => {
        const pythonProcess = spawn(cmdInfo.cmd, cmdInfo.args, { env: getPrepEnv() });
        let outputData = '';
        
        pythonProcess.stdout.on('data', (data) => { outputData += data.toString(); });
        
        pythonProcess.stderr.on('data', (data) => {
          const lines = data.toString().split('\n').filter(l => l.trim());
          for (const line of lines) {
            try {
              const progress = JSON.parse(line);
              if (mainWindow && mainWindow.webContents) {
                mainWindow.webContents.send('prep-progress', progress);
              }
            } catch (e) {
            }
          }
        });
        
        pythonProcess.on('close', (code) => {
          if (code === 0) {
            try { resolve(JSON.parse(outputData)); }
            catch (e) { resolve({ success: false, error: `Parse error: ${e.message}` }); }
          } else {
            resolve({ success: false, error: `Research failed (code ${code})` });
          }
        });
        pythonProcess.on('error', (err) => {
          resolve({ success: false, error: `Failed to start: ${err.message}` });
        });
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

}

app.whenReady().then(() => {
  dbService.init();
  registerIpcHandlers();
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

