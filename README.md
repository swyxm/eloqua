# Whisper Model Configuration Guide

## Overview
This speech analyzer runs OpenAI's Whisper models locally for transcription & analysis. This was done to save costs from API calls and offer the user modularity on their model choice. You can choose different model sizes based on how much you're willing to download. I will say, I've run all of them, default is set to Small because it hallucinated the least but even Base works just fine. Larger models may risk hallucination but have the best accuracy. If you are willing to wait for the extra processing time for a deeper understanding of your argumentation and flow, use the Large model.

## Available Whisper Models
| Model | Size | VRAM | Speed | Accuracy | Best For |
|-------|------|------|-------|----------|----------|
| `tiny` | 39 MB | ~1 GB | Fastest | Lowest | Quick testing |
| `base` | 74 MB | ~1 GB | Fast | Good | Sacrifices some accuracy, but faster |
| `small` | 244 MB | ~2 GB | Medium | Better | **Default choice** - Best balance |
| `medium` | 769 MB | ~5 GB | Slow | High | Prone to hallucinating but stable. Will take time to process |
| `large` | 1550 MB | ~10 GB | Slowest | Highest | **Bulkiest** but best possible accuracy |
| `turbo` | 809 MB | ~6 GB | Fast | High | Fastest large model = hallucinates a lot |

## Changing the Model
In your `speech_analyzer.py`, find this line:
```python
model = whisper.load_model("base")
```
## Troubleshooting

### Model Download Issues
If you get SSL certificate errors:
- I gotchu! the code includes automatic SSL handling
- First download may take 1-5 minutes depending on model size and then you're chilling after that.
- Models are cached after first download

### Memory Issues
If you get out-of-memory errors:
```
RuntimeError: [enforce fail at alloc_cpu.cpp:75] data. DefaultCPUAllocator: not enough memory
```

**Solutions:**
1. Use a smaller model (`tiny` or `base`)
2. Close other applications
3. Process shorter audio files
4. Add swap space to your system

### Slow Performance
If transcription is very slow:
1. **Use `turbo` model** - best speed/accuracy tradeoff
2. **Use GPU** if available
3. **Use `tiny` or `base`** for fastest processing
4. **Process shorter clips** (split long audio files)

## Recommendations by Use Case

### For Development/Testing:
```python
model = whisper.load_model("base")  # Fast, good enough
```

### For Production/High Accuracy:
```python
model = whisper.load_model("turbo")  # Best balance of speed and accuracy
```

### For Best Possible Quality:
```python
model = whisper.load_model("large")  # Highest accuracy, slow
```

### For Low-Resource Systems:
```python
model = whisper.load_model("tiny")  # Minimal resource usage
```

## Model Performance Comparison
*Times approximate for 10-minute audio on MacBook Pro M1*

- **tiny:** ~30 seconds, decent quality
- **base:** ~1 minute, good quality  
- **small:** ~2 minutes, better quality
- **turbo:** ~2.5 minutes, high quality ⭐ **Recommended**
- **medium:** ~4 minutes, very high quality
- **large:** ~8 minutes, best quality