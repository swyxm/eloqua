const { spawn } = require('child_process');
const path = require('path');
const { app } = require('electron');

class SpeechAnalyzer {
  constructor() {
    if (app && app.isPackaged) {
      this.scriptPath = path.join(process.resourcesPath, 'python', 'speech_analyzer.py');
    } else {
      this.scriptPath = path.join(__dirname, '..', 'python', 'speech_analyzer.py');
    }
  }

  async analyze(audioPath, motion, format, position, placeInRound, specificFeedback) {
    return new Promise((resolve, reject) => {
      const pythonArgs = [
        this.scriptPath,
        audioPath,
        motion,
        format,
        position,
      ];

      if (placeInRound) {
        pythonArgs.push(placeInRound);
      }
      if (specificFeedback) {
        pythonArgs.push(specificFeedback);
      }

      let runner;
      if (app && app.isPackaged) {
        const binDir = path.join(process.resourcesPath, 'bin');
        if (process.platform === 'win32') runner = path.join(binDir, 'win', 'speech_analyzer.exe');
        else if (process.platform === 'darwin') runner = path.join(binDir, 'mac', 'speech_analyzer');
        else runner = path.join(binDir, 'linux', 'speech_analyzer');
      }
      const useBundled = runner && require('fs').existsSync(runner);
      const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';

      console.log('Launching Python for analysis:', {
        pythonExecutable,
        scriptPath: this.scriptPath,
        audioPath,
        motion,
        format,
        position,
        placeInRound,
        specificFeedback: Boolean(specificFeedback),
        hasGeminiKey: !!process.env.GEMINI_API_KEY
      });

      const env = { 
        ...process.env,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
      };

      const cmd = useBundled ? runner : pythonExecutable;
      const args = useBundled ? pythonArgs.slice(1) : pythonArgs;
      const pythonProcess = spawn(cmd, args, { env });

      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        console.log('Python process closed with code:', code);
        if (error) console.error('Python stderr:', error);
        if (output) console.log('Python stdout (tail):', output.split('\n').slice(-5).join('\n'));
        
        if (code === 0) {
          try {
            try {
              const analysis = JSON.parse(output.trim());
              resolve(analysis);
              return;
            } catch (_) {
            }
            
            const outputStr = output.trim();
            const jsonStart = outputStr.lastIndexOf('{');
            const jsonEnd = outputStr.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
              const jsonStr = outputStr.substring(jsonStart, jsonEnd + 1);
              try {
                const analysis = JSON.parse(jsonStr);
                resolve(analysis);
                return;
              } catch (e) {
                console.error('Failed to parse extracted JSON:', e);
              }
            }
            
            const lines = output.trim().split('\n');
            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i].trim();
              if (line && line.startsWith('{') && line.endsWith('}')) {
                try {
                  const analysis = JSON.parse(line);
                  resolve(analysis);
                  return;
                } catch (_) {
                }
              }
            }
            
            reject(new Error('No valid JSON found in output'));
          } catch (e) {
            console.error('JSON parsing error:', e);
            reject(new Error(`Failed to parse analysis output: ${e.message}`));
          }
        } else {
          reject(new Error(`Analysis failed with code ${code}: ${error}`));
        }
      });

      pythonProcess.on('error', (err) => {
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
    });
  }
}

module.exports = SpeechAnalyzer;