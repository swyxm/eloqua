import whisper
import opensmile
import pandas as pd
import spacy
import json
import sys
import os
import ssl
import urllib.request

# transcription
def transcribe(audio_path):
    # Store original SSL context
    original_context = ssl._create_default_https_context
    
    # Temporarily disable SSL verification for model download
    ssl._create_default_https_context = ssl._create_unverified_context
    
    try:
        model = whisper.load_model("small")
    finally:
        # Always restore original SSL context
        ssl._create_default_https_context = original_context
    
    # Transcribe the audio file
    r = model.transcribe(audio_path)
    
    # Get duration from segments (most reliable method)
    duration = 0
    if 'segments' in r and r['segments']:
        # Get the end time of the last segment
        duration = max(segment['end'] for segment in r['segments'])
    else:
        # Fallback: calculate from audio file
        audio = whisper.load_audio(audio_path)
        duration = len(audio) / 16000  # Whisper uses 16kHz sample rate
    
    return r["text"], duration



# extracting audio features w/ opensmile
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


# prompt
def prompt(transcript, features, duration, motion, format, position, place_in_round=None, specific_feedback=None):

    #dict for score scales // update as format support increases
    speaker_score = {
        "BP": """
        Scoring Guide (British Parliamentary):
        - 85: Practically perfect speech
        - 80–83: Very strong speaker
        - 77–80: Above average
        - 74–76: Average
        - 70–73: Below average / weak speech
        """,
        "WSDC": """
        Scoring Guide (World Schools):
        - 74–75: Practically perfect speech
        - 71–73: Very strong speaker
        - 68–70: Above average
        - Below 68: Developing / needs improvement
        """
    }[format]

    context_info = ""
    if position:
        context_info += f"\nSpeaker Position: {position}"
    if place_in_round:
        context_info += f"\nPlace in Round: {place_in_round}"
    if specific_feedback:
        context_info += f"\nSpecific Feedback Requested: {specific_feedback}"

    return f"""
You are a world class debate coach familiar in two major debating formats, including British Parliamentary Debate (5:30 minute speeches), 
World Schools Debate (8-9 min speeches).

This speaker's speech duration was {duration}.
{context_info}

Here is the delivery analysis for a debater:

Definitions:
- Pitch stddev: ideal = 0.15–0.4 (lower = monotone, higher = unstable)
- Volume mean: ideal = 1.5–3.5
- Jitter: ideal = 0.01–0.04 (higher = shaky voice)
- Voiced segments/sec: ideal = 1.3–2.0 (higher = rushed, lower = slow)

Speaker Profile:
- Pitch StdDev: {features['F0semitoneFrom27.5Hz_sma3nz_stddevNorm']:.2f}
- Volume Mean: {features['loudness_sma3_amean']:.2f}
- Jitter: {features['jitterLocal_sma3nz_amean']:.4f}
- Voiced Segments/sec (Pace): {features['VoicedSegmentsPerSec']:.2f}

Debate Motion:
{motion}

Transcript:
\"\"\"{transcript}\"\"\"

Speaker Score System: {speaker_score}

Your feedback must focus on two things:
1. Critically dissecting and analyzing how well the speaker addressed the motion and structured their arguments. 
What was missing? What could make the content stronger. Suggest any pieces of knowledge relevant to the motion that they can add to their argument toolkit. 
Suggest preemptive refutation or ways to mitigate the opposing bench based on their position as a speaker. 
Tailor your criticism on whether they are a content role or a refutation role (i.e Prime Minister vs. Deputy Prime Minister in British Parliamentary).
For Whip speakers, suggest forms of weighing. If their case was completely flawed, suggest what you think is the strongest case and articulate why.

2. Give feedback on their speaker profile. How can they improve the way they speak to sound more engaging, passionate, etc. But play to their strengths. 
If the speaker has a generally quieter register, there is no point in forcing them to speak much louder. Rather tailor your feedback within their realm.

Please return your result in this exact JSON format:
{{
  "score": <speaker_score>,
  "feedback": "<thorough paragraph explanation>"
}}

Only return JSON. Do not include extra commentary or prefixes.
"""

def main(audio_path, motion, format, position, place_in_round=None, specific_feedback=None):
    format = format.upper()
    if format not in ["BP", "WSDC"]:
        print(f"Error: Unsupported format '{format}'. Supported formats are: BP, WSDC")
        sys.exit(1)
    if not os.path.isfile(audio_path):
        print(f"Error: Audio file not found: {audio_path}")
        sys.exit(1)
    transcript, duration = transcribe(audio_path)
    prosody_df      = extract_characteristics(audio_path)
    transcript_stats = analyze_transcript(transcript)
    features = prosody_df.to_dict(orient="records")[0]
    llm_prompt = prompt(transcript, features, duration, motion, format, position, place_in_round, specific_feedback)

    output = {
        "transcript": transcript,
        "duration_seconds": duration,
        "transcript_stats": transcript_stats,
        "prosody_stats": prosody_df.to_dict(orient="records")[0],
        "llm_prompt": llm_prompt
    }
    print(json.dumps(output, indent=2))

if __name__=="__main__":
    # Expected arguments: audio_path, motion, format, position, [place_in_round], [specific_feedback]
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
