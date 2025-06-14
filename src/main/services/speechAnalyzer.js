const { spawn } = require('child_process');
const path = require('path');

class SpeechAnalyzer {
  constructor() {
    this.scriptPath = path.join(__dirname, '../../main/python/speech_analyzer.py');
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

      // Use python3 instead of python
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
        if (code === 0) {
          try {
            const analysis = JSON.parse(output);
            resolve(analysis);
          } catch (e) {
            reject(new Error('Failed to parse analysis output'));
          }
        } else {
          reject(new Error(`Analysis failed: ${error}`));
        }
      });
    });
  }
}

// Export the class
module.exports = SpeechAnalyzer;