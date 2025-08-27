# Eloqua - AI Debate Coach

## 🎯 What is Eloqua?

Eloqua is an intelligent debate speech analysis **desktop application** that helps competitive debaters improve their performance through AI-powered feedback. Built with Electron, it provides a native desktop experience while transcribing your debate speeches, analyzing your argumentation, and providing detailed insights to help you become a better debater.

### ✨ Key Features

- **🎤 Speech Recording & Upload**: Record or upload your debate speeches in various audio formats
- **🤖 AI-Powered Analysis**: Uses OpenAI's Whisper models for accurate transcription and analysis
- **📊 Performance Scoring**: Get detailed scores and feedback on your debate performance
- **🎵 Prosody Analysis**: Advanced audio analysis including pitch, volume, jitter, and speaking pace metrics
- **📈 Progress Tracking**: Visual timeline of your debate journey with statistics and trends
- **🔍 Advanced Search**: Search through your speeches by motion, tournament, position, or metadata
- **🏆 Tournament Management**: Organize speeches by tournaments and track your competitive record
- **📱 Modern Interface**: Beautiful, responsive design with light and dark modes

### 🎪 Supported Debate Formats

- **British Parliamentary (BP)**
- **World Schools Debate Championship (WSDC)**

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Python** (v3.8 or higher) - for speech analysis
- **Git**

### System Requirements

- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 2GB free space for models and dependencies
- **Audio**: Microphone for recording speeches
- **Internet**: Required for initial setup and model downloads

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/swyxm/eloqua.git
   cd eloqua
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   LLM_API_KEY=your_llm_api_key
   ```

5. **Set up your database**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL scripts in `database/schema.sql` to create the required tables
   - The schema includes:
     - `analysis_result` column (JSONB) for transcript, duration, and prosody data
     - `llm_analysis` column (JSONB) for AI-generated scores and feedback
     - `prosody_stats` column (JSONB) for detailed speech analysis metrics

### Running the Application

1. **Start the Electron app**
   ```bash
   npm start
   # or
   yarn start
   ```

2. **The desktop application will open automatically**
   - No browser needed - Eloqua runs as a native desktop app
   - The app window will appear with the full interface

3. **Start analyzing speeches!**
   - Click "Record New Speech" to upload or record a debate speech
   - Fill in the debate details (motion, format, position, etc.)
   - Get instant AI-powered feedback and analysis

## 📖 How to Use Eloqua

### Recording a Speech

1. **Navigate to the Upload page**
   - Click "Record New Speech" from the Dashboard
   - Or go to the Upload tab in the navigation

2. **Add your speech**
   - Upload an audio file or record directly in the browser
   - Supported formats: MP3, WAV, M4A, OGG

3. **Fill in debate details**
   - **Motion**: The debate topic you're speaking on
   - **Format**: Choose between BP or WSDC
   - **Position**: Your role in the debate (e.g., Prime Minister, First Speaker)
   - **Date**: When the speech was given
   - **Tournament**: Optional tournament information
   - **Place in Round**: Your result (First Place, Second Place, etc.)

4. **Get analysis**
   - Click "Analyze Speech" to process your audio
   - Wait for transcription and analysis (typically 1-3 minutes)
   - Review your detailed feedback, score, and prosody metrics
   - Prosody analysis includes pitch variation, volume, jitter, and speaking pace

### Using the Dashboard

The Dashboard provides a comprehensive view of your debate journey:

- **📊 Statistics**: Total speeches, victories, average score, monthly activity
- **📅 Timeline View**: Chronological view of all your speeches
- **🔍 Advanced Search**: Find speeches by content, metadata, or performance
- **🎯 Filtering**: Filter by format, date range, or other criteria
- **📈 Progress Tracking**: Visual representation of your improvement over time

### Search Examples

Eloqua supports powerful metadata search:

- `"first place"` - Find all winning speeches
- `">500 words"` - Find speeches with more than 500 words
- `"prime minister"` - Find all Prime Minister speeches
- `">8 score"` - Find high-scoring speeches
- `"<3 minutes"` - Find short speeches
- `"opposition"` - Find all opposition speeches

## 🤖 Whisper Model Configuration

Eloqua uses OpenAI's Whisper models for speech transcription and analysis. You can choose different model sizes based on your needs:

### Available Whisper Models
| Model | Size | VRAM | Speed | Accuracy | Best For |
|-------|------|------|-------|----------|----------|
| `tiny` | 39 MB | ~1 GB | Fastest | Lowest | Quick testing |
| `base` | 74 MB | ~1 GB | Fast | Good | Sacrifices some accuracy, but faster |
| `small` | 244 MB | ~2 GB | Medium | Better | **Default choice** - Best balance |
| `medium` | 769 MB | ~5 GB | Slow | High | Prone to hallucinating but stable. Will take time to process |
| `large` | 1550 MB | ~10 GB | Slowest | Highest | **Bulkiest** but best possible accuracy |
| `turbo` | 809 MB | ~6 GB | Fast | High | Fastest large model = hallucinates a lot |

### Changing the Model
In your `speech_analyzer.py`, find this line:
```python
model = whisper.load_model("base")
```

- First download may take 1-5 minutes depending on model size and then you're chilling after that.
- Models are cached after first download

## 📄 License

This project is licensed under the MIT License.
