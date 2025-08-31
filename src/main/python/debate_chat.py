import json
import sys
import requests
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_API_URL = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}'

def call_gemini_api(messages):
    contents = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg["content"]}]
        })
    
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 2048,
        }
    }
    
    try:
        response = requests.post(GEMINI_API_URL, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        if 'candidates' in result and result['candidates']:
            return result['candidates'][0]['content']['parts'][0]['text']
        else:
            return "I apologize, but I couldn't generate a response. Please try again."
            
    except Exception as e:
        print(f"Error calling Gemini API: {e}", file=sys.stderr)
        return "I'm having trouble connecting right now. Please try again."

def get_coach_response(speech_data, user_message, conversation_history=[]):    
    recent_context = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
    
    recent_context_text = ""
    if recent_context:
        recent_context_text = "\n\nRECENT CONVERSATION CONTEXT:\n"
        for msg in recent_context:
            role_name = "User" if msg["role"] == "user" else "Debbie"
            recent_context_text += f"{role_name}: {msg['content']}\n"
    
    system_prompt = f"""You are Debbie, an expert debate coach providing personalized feedback and advice. 

SPEECH CONTEXT:
- Motion: {speech_data.get('motion', 'N/A')}
- Format: {speech_data.get('debate_format', 'N/A')}
- Position: {speech_data.get('position', 'N/A')}
- Partner: {speech_data.get('partner', 'N/A')}
- Score: {speech_data.get('score', 'N/A')}
- Duration: {speech_data.get('duration', 'N/A')} seconds

ANALYSIS SUMMARY:
{speech_data.get('llm_feedback', 'No analysis available')}{recent_context_text}

COACHING GUIDELINES:
- Be specific and actionable in your advice
- Tailor responses exactly to what the user asks
- Reference their actual speech performance and score
- Provide concrete techniques and strategies
- Keep responses clear, succinct, and focused
- Always maintain an encouraging but honest coaching tone
- Reference previous conversation context when relevant
- Unless told otherwise, BP speeches are 5 mins w/ 15 secs grace, WSDC speeches are 8 mins w/ 30 secs grace (rebuttals are 4 mins).
- To justify the score given, in BP: 65-70 is abysmal & irrelevant to the motion or anything, 71-75 is solid, you're a beginner getting better, 75-80 is you are a strong consistent above average debater, 80-85 is national team, national champion caliber. 
- For WSDC the scale is condensed. 63-65 = bad, 65-68 is beginner, 68-72 is strong, 72-75 is top tier caliber.
"""

    messages = [{"role": "system", "content": system_prompt}]
    for msg in conversation_history:
        messages.append(msg)
    
    messages.append({"role": "user", "content": user_message})
    
    return call_gemini_api(messages)

def main():
    if len(sys.argv) < 3:
        print("Usage: python debate_chat.py <speech_data_json> <user_message> [conversation_history_json]")
        sys.exit(1)
    
    try:
        speech_data = json.loads(sys.argv[1])
        user_message = sys.argv[2]
        conversation_history = json.loads(sys.argv[3]) if len(sys.argv) > 3 else []
        
        response = get_coach_response(speech_data, user_message, conversation_history)
        print(response)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 