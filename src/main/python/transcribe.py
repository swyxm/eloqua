
import sys
import os
import json
import ssl
import whisper

def transcribe(audio_path, model_name="small"):
    original_context = ssl._create_default_https_context
    ssl._create_default_https_context = ssl._create_unverified_context
    
    try:
        model = whisper.load_model(model_name)
    finally:
        ssl._create_default_https_context = original_context
    
    r = model.transcribe(audio_path)
    duration = 0
    if 'segments' in r and r['segments']:
        duration = max(segment['end'] for segment in r['segments'])
    else:
        # fallback: calculate from audio file
        audio = whisper.load_audio(audio_path)
        duration = len(audio) / 16000  # 16kHz sample rate
    return r["text"], duration


def main(audio_path, model_name="small"):
    try:
        if not os.path.isfile(audio_path):
            print(f"fnf: {audio_path}", file=sys.stderr)
            sys.exit(1)
                
        transcript, duration = transcribe(audio_path, model_name)
        
        output = {
            "transcript": transcript,
            "duration": duration,
        }
        
        print(json.dumps(output))
        
    except Exception as e:
        sys.exit(1)

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            sys.exit(1)
        
        audio_path = sys.argv[1]
        model_name = sys.argv[2] if len(sys.argv) > 2 else os.getenv("WHISPER_MODEL", "small")
        main(audio_path, model_name)
        
    except Exception as e:
        print(f"Fatal error: {e}", file=sys.stderr)
        sys.exit(1)