const { spawn } = require('child_process');
const path = require('path');

class SpeechAnalyzer {
  constructor() {
    this.scriptPath = path.join(__dirname, '../../../main/python/speech_analyzer.py');
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

      const pythonProcess = spawn('python3', pythonArgs);

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
        console.log('Python stdout:', output);
        console.log('Python stderr:', error);
        
        if (code === 0) {
          try {
            // Try to find the last valid JSON in the output
            const lines = output.trim().split('\n');
            let jsonOutput = '';
            
            // Look for the last line that contains valid JSON
            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i].trim();
              if (line && line.startsWith('{') && line.endsWith('}')) {
                try {
                  const parsed = JSON.parse(line);
                  jsonOutput = line;
                  break;
                } catch (e) {
                  // Continue to next line
                }
              }
            }
            
            if (jsonOutput) {
              const analysis = JSON.parse(jsonOutput);
              resolve(analysis);
            } else {
              reject(new Error('No valid JSON found in output'));
            }
          } catch (e) {
            console.error('JSON parsing error:', e);
            reject(new Error(`Failed to parse analysis output: ${e.message}`));
          }
        } else {
          reject(new Error(`Analysis failed with code ${code}: ${error}`));
        }
      });
    });
  }
}

module.exports = SpeechAnalyzer;