const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class DebateCoachService {
  async getChatResponse(speechData, userMessage, conversationHistory = []) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, '../python/debate_chat.py');
      const cleanSpeechData = {
        motion: speechData.motion || '',
        debate_format: speechData.debate_format || '',
        position: speechData.position || '',
        score: speechData.score || null,
        duration: speechData.duration || null,
        llm_feedback: speechData.llm_feedback || ''
      };
      
      const cleanConversationHistory = Array.isArray(conversationHistory) 
        ? conversationHistory.map(msg => ({
            role: msg.role || 'user',
            content: msg.content || ''
          }))
        : [];
      
      let speechDataJson, conversationHistoryJson;
      
      try {
        speechDataJson = JSON.stringify(cleanSpeechData);
        conversationHistoryJson = JSON.stringify(cleanConversationHistory);
      } catch (error) {
        console.error('JSON serialization error:', error);
        reject(new Error(`Failed to serialize data: ${error.message}`));
        return;
      }
      
      let pythonExecutable = '/Library/Frameworks/Python.framework/Versions/3.12/bin/python3';
      
      if (!fs.existsSync(pythonExecutable)) {
        pythonExecutable = 'python3';
      }
      
      const env = { 
        ...process.env,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
      };

      const pythonProcess = spawn(pythonExecutable, [
        scriptPath,
        speechDataJson,
        userMessage,
        conversationHistoryJson
      ], { env });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timeout = setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Python process timed out after 30 seconds'));
      }, 30000);
      
      pythonProcess.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          if (stdout.trim()) {
            resolve(stdout.trim());
          } else {
            reject(new Error('Python process returned no output'));
          }
        } else {
          reject(new Error(`Python process failed with code ${code}: ${stderr}`));
        }
      });
    });
  }
}

module.exports = new DebateCoachService();
