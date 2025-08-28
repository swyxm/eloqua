import whisper
import opensmile
import pandas as pd
import spacy
import json
import sys
import os
import ssl
import urllib.request
import requests
from dotenv import load_dotenv

def transcribe(audio_path, pre_text=None, pre_duration=None, model_name=None):
    if pre_text is not None and pre_duration is not None:
        return pre_text, pre_duration
    
    original_context = ssl._create_default_https_context
    ssl._create_default_https_context = ssl._create_unverified_context
    
    try:
        selected_model = model_name or os.getenv("WHISPER_MODEL", "small")
        model = whisper.load_model(selected_model)
    finally:
        ssl._create_default_https_context = original_context
    
    r = model.transcribe(audio_path)
    
    duration = 0
    if 'segments' in r and r['segments']:
        duration = max(segment['end'] for segment in r['segments'])
    else:
        audio = whisper.load_audio(audio_path)
        duration = len(audio) / 16000  
    
    return r["text"], duration



def extract_characteristics(audio_path):
    smile = opensmile.Smile(
        feature_set=opensmile.FeatureSet.eGeMAPSv02,
        feature_level=opensmile.FeatureLevel.Functionals
    )
    return smile.process_file(audio_path)

# nlp stats - wip
def analyze_transcript(text):
    nlp = spacy.load("en_core_web_sm")
    doc = nlp(text)
    sentences = [sent.text for sent in doc.sents]
    word_count = sum(1 for t in doc if t.is_alpha)
    return {"sentences": sentences, "word_count": word_count}


def get_system_prompt():
    return """You are a world-class debate coach. Analyze debate speeches and provide scores with detailed feedback.

SCORING GUIDELINES:
- British Parliamentary (BP): 85=perfect, 80-83=strong, 77-80=above avg, 74-76=avg, 70-73=below avg
- World Schools (WSDC): 74-75=perfect, 71-73=strong, 68-70=above avg, <68=developing

PROSODY CONTEXT (use to guide feedback, but don't explicitly mention numbers):
- Pitch stddev: ideal = 0.15–0.4 (lower = monotone, higher = unstable)
- Volume mean: ideal = 1.5–3.5
- Jitter: ideal = 0.01–0.04 (higher = shaky voice)
- Voiced segments/sec: ideal = 1.3–2.0 (higher = rushed, lower = slow)

FEEDBACK STRUCTURE (always use this exact markdown format inside the feedback field):
# Intro thoughts

## Content Analysis:

## Delivery Feedback:

## Role-Specific Advice (Position):

ANALYSIS REQUIREMENTS:
1. Content Analysis: How well they addressed the motion, argument structure, missing elements, knowledge gaps
2. Delivery Feedback: Prosody improvements while playing to their natural speaking style
3. Role-Specific Advice: Tailor feedback to their position (PM vs DPM, Whip vs Extension, etc.)

IMPORTANT: The response structure is JSON, but the feedback content should be rich markdown with headers, lists, bold text, etc. for proper frontend rendering.

Return JSON: {"score": number, "feedback": "detailed analysis with markdown formatting (headers, lists, bold, etc.)"}"""

def get_user_prompt(transcript, features, duration, motion, format, position, place_in_round=None, specific_feedback=None):
    context_info = ""
    if position:
        context_info += f"Position: {position}"
    if place_in_round:
        context_info += f" | Place: {place_in_round}"
    if specific_feedback:
        context_info += f" | Focus: {specific_feedback}"
    
    return f"""ANALYZE THIS {format} DEBATE SPEECH:

Motion: {motion}
{context_info}
Duration: {duration:.1f}s

Prosody Analysis:
- Pitch: {features['F0semitoneFrom27.5Hz_sma3nz_stddevNorm']:.2f} (ideal: 0.15-0.4)
- Volume: {features['loudness_sma3_amean']:.2f} (ideal: 1.5-3.5)
- Jitter: {features['jitterLocal_sma3nz_amean']:.4f} (ideal: 0.01-0.04)
- Pace: {features['VoicedSegmentsPerSec']:.2f} (ideal: 1.3-2.0)

Transcript: {transcript}"""

def call_gemini_api(system_prompt, user_prompt):
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
    
    if not GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY not found in environment variables")
        return {"error": "API key not configured"}
    
    headers = {
        'Content-Type': 'application/json',
    }
    
    combined_prompt = f"{system_prompt}\n\n{user_prompt}"
    
    data = {
        "contents": [{
            "parts": [{
                "text": combined_prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 8192,
            "response_mime_type": "application/json",
            "response_schema": {
                "type": "object",
                "properties": {
                    "score": {
                        "type": "integer",
                        "description": "Numerical score for the debate speech"
                    },
                    "feedback": {
                        "type": "string",
                        "description": "Detailed analysis and feedback in markdown format"
                    }
                },
                "required": ["score", "feedback"]
            }
        }
    }
    
    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                generated_text = result['candidates'][0]['content']['parts'][0]['text']
                
                # With structured output, the response should be pure JSON
                try:
                    return json.loads(generated_text)
                except json.JSONDecodeError as e:
                    return {
                        "error": f"JSON parsing failed: {str(e)}", 
                        "raw_text": generated_text
                    }
            else:
                return {"error": "No response generated", "details": result}
        else:
            return {"error": f"API call failed with status {response.status_code}", "details": response.text}
            
    except requests.exceptions.RequestException as e:
        return {"error": f"Request failed: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

def main(audio_path, motion, format, position, place_in_round=None, specific_feedback=None):
    load_dotenv()
    
    format = format.upper()
    if format not in ["BP", "WSDC"]:
        print(f"Error: Unsupported format '{format}'. Supported formats are: BP, WSDC")
        sys.exit(1)
    if not os.path.isfile(audio_path):
        print(f"Error: Audio file not found: {audio_path}")
        sys.exit(1)
    
    whisper_model = os.getenv("WHISPER_MODEL", "small")
    transcript, duration = transcribe(audio_path, model_name=whisper_model)
    prosody_df = extract_characteristics(audio_path)
    transcript_stats = analyze_transcript(transcript)
    features = prosody_df.to_dict(orient="records")[0]
    
    system_prompt = get_system_prompt()
    user_prompt = get_user_prompt(transcript, features, duration, motion, format, position, place_in_round, specific_feedback)
    
    llm_analysis = call_gemini_api(system_prompt, user_prompt)
    
    output = {
        "transcript": transcript,
        "duration_seconds": duration,
        "transcript_stats": transcript_stats,
        "prosody_stats": prosody_df.to_dict(orient="records")[0],
        "llm_analysis": llm_analysis
    }
    print(json.dumps(output, indent=2))

if __name__=="__main__":
    if len(sys.argv) < 5:
        print("Usage: python speech_analyzer.py <audio_path> <motion> <format> <position> [place_in_round] [specific_feedback]")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    motion = sys.argv[2]
    format = sys.argv[3]
    position = sys.argv[4]
    
    place_in_round = sys.argv[5] if len(sys.argv) > 5 else None
    specific_feedback = sys.argv[6] if len(sys.argv) > 6 else None
    
    main(audio_path, motion, format, position, place_in_round, specific_feedback)
