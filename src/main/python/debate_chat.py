import json
import sys
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def load_analysis(analysis_file):
    with open(analysis_file, 'r') as f:
        return json.load(f)

def get_initial_feedback(analysis):
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "You are a debate coach providing detailed feedback on speeches."},
            {"role": "user", "content": analysis['llm_prompt']}
        ]
    )
    return response.choices[0].message.content

def chat_loop(analysis):
    print("\n=== Debate Coach Chat Interface ===")
    print("Type 'exit' to quit, 'analysis' to see the original analysis")
    
    feedback = get_initial_feedback(analysis)
    print("\nInitial Feedback:")
    print(feedback)
    
    while True:
        user_input = input("\nYour question (or 'exit'/'analysis'): ").strip()
        
        if user_input.lower() == 'exit':
            break
        elif user_input.lower() == 'analysis':
            print("\nOriginal Analysis:")
            print(json.dumps(analysis, indent=2))
            continue
        
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are a debate coach providing detailed feedback on speeches."},
                {"role": "user", "content": analysis['llm_prompt']},
                {"role": "assistant", "content": feedback},
                {"role": "user", "content": user_input}
            ]
        )
        
        print("\nCoach's Response:")
        print(response.choices[0].message.content)

def main():
    if len(sys.argv) != 2:
        print("Usage: python debate_chat.py <analysis_file.json>")
        sys.exit(1)
    
    analysis_file = sys.argv[1]
    if not os.path.exists(analysis_file):
        print(f"Error: Analysis file not found: {analysis_file}")
        sys.exit(1)
    
    try:
        analysis = load_analysis(analysis_file)
        chat_loop(analysis)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 