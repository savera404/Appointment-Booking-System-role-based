# backend/app/services/whisper_transcriber.py

import whisper
from typing import Dict, Any, List
import tempfile
import os

# Load the Whisper model once globally
print("Loading Whisper model...")
try:
    model = whisper.load_model("base")  # You can also use "small", "medium", or "large"
    print("Whisper model loaded successfully")
except Exception as e:
    print(f"❌ Error loading Whisper model: {e}")
    model = None


def test_whisper_installation():
    """Test if Whisper is properly installed and working"""
    try:
        import whisper
        print("✅ Whisper import successful")
        
        # Try to load a small model for testing
        test_model = whisper.load_model("tiny")
        print("✅ Whisper model loading successful")
        
        # Create a simple test audio file (silence)
        import numpy as np
        import soundfile as sf
        
        # Generate 1 second of silence
        sample_rate = 16000
        audio_data = np.zeros(sample_rate)
        
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            sf.write(temp_file.name, audio_data, sample_rate)
            temp_path = temp_file.name
        
        try:
            # Try to transcribe the silence
            result = test_model.transcribe(temp_path)
            print("✅ Whisper transcription test successful")
            print(f"📝 Test result: {result.get('text', '')}")
            
            # Clean up
            os.unlink(temp_path)
            return True
        except Exception as e:
            print(f"❌ Whisper transcription test failed: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Whisper installation test failed: {e}")
        return False


def transcribe_audio_file(audio_file_path: str) -> Dict[str, Any]:
    """
    Transcribe an audio file using Whisper
    """
    if model is None:
        print("❌ Whisper model not loaded")
        return {
            "text": "Transcription failed: Whisper model not loaded",
            "segments": [
                {
                    "start": 0,
                    "end": 1,
                    "text": "Transcription failed: Whisper model not loaded"
                }
            ]
        }
    
    try:
        print(f"Transcribing audio file: {audio_file_path}")
        
        # Check if file exists
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
        
        # Check file size
        file_size = os.path.getsize(audio_file_path)
        print(f"Audio file size: {file_size} bytes")
        
        if file_size == 0:
            raise ValueError("Audio file is empty")
        
        # Transcribe the audio file
        result = model.transcribe(audio_file_path)
        
        print(f"Transcription successful. Text length: {len(result.get('text', ''))}")
        print(f"Number of segments: {len(result.get('segments', []))}")
        
        return result
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        import traceback
        traceback.print_exc()
        # Return a fallback structure
        return {
            "text": f"Transcription failed: {str(e)}",
            "segments": [
                {
                    "start": 0,
                    "end": 1,
                    "text": f"Transcription failed: {str(e)}"
                }
            ]
        }


def merge_segments_by_token_limit(segments, max_tokens=300) -> List[Dict[str, Any]]:
    merged_chunks = []
    current_chunk = {"start": None, "end": None, "text": "", "token_count": 0}

    for seg in segments:
        # Estimate token count (rough approximation: 1 token ≈ 4 characters)
        token_len = len(seg.get("text", "")) // 4
        if current_chunk["token_count"] + token_len <= max_tokens:
            if current_chunk["start"] is None:
                current_chunk["start"] = seg["start"]
            current_chunk["end"] = seg["end"]
            current_chunk["text"] += " " + seg["text"]
            current_chunk["token_count"] += token_len
        else:
            # Finalize current chunk
            if current_chunk["text"]:
                merged_chunks.append({
                    "start": current_chunk["start"],
                    "end": current_chunk["end"],
                    "text": current_chunk["text"].strip()
                })
            # Start new chunk
            current_chunk = {
                "start": seg["start"],
                "end": seg["end"],
                "text": seg["text"],
                "token_count": token_len
            }

    if current_chunk["text"]:
        merged_chunks.append({
            "start": current_chunk["start"],
            "end": current_chunk["end"],
            "text": current_chunk["text"].strip()
        })

    return merged_chunks