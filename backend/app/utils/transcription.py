# backend/app/utils/transcription.py

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
import os
import tempfile
from app.services.whisper_transcriber_service import transcribe_audio_file


async def transcribe_audio_from_gridfs(db, file_id_str):
    print(f"🔍 Starting transcription for file_id: {file_id_str}")
    
    fs = AsyncIOMotorGridFSBucket(db)
    file_id = ObjectId(file_id_str)
    
    # Get file metadata from the files collection
    try:
        file_info = await db.fs.files.find_one({"_id": file_id})
        filename = file_info.get("filename", "audio.wav") if file_info else "audio.wav"
        print(f"📁 File metadata: {file_info}")
    except Exception as e:
        print(f"⚠️ Warning: Could not get file metadata: {e}")
        filename = "audio.wav"
    
    # Download the file content
    print(f"📥 Downloading file content...")
    grid_out = await fs.open_download_stream(file_id)
    contents = await grid_out.read()
    print(f"📦 Downloaded {len(contents)} bytes")
    
    # Extract extension from filename
    _, ext = os.path.splitext(filename)
    if not ext:
        ext = ".wav"  # Default to wav if no extension found
    
    print(f"📄 File extension: {ext}")
    
    # Create a temporary file with the correct extension
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
        temp_file.write(contents)
        temp_file_path = temp_file.name
        print(f"💾 Created temporary file: {temp_file_path}")

    try:
        # Transcribe the audio file using Whisper
        print(f"🎤 Starting audio transcription for file: {filename}")
        result = transcribe_audio_file(temp_file_path)
        print(f"✅ Transcription completed successfully")
        print(f"📝 Transcribed text length: {len(result.get('text', ''))}")
        print(f"📝 Transcribed text preview: {result.get('text', '')[:200]}...")
        print(f"📝 Number of segments: {len(result.get('segments', []))}")
        
        # Check if we got actual transcription or placeholder
        if "Audio file uploaded successfully" in result.get('text', ''):
            print("⚠️ WARNING: Still getting placeholder text instead of actual transcription!")
            print("🔍 This suggests Whisper transcription is not working properly")
        
        return result
    except Exception as e:
        print(f"❌ Error during transcription: {e}")
        import traceback
        traceback.print_exc()
        # Return a fallback structure
        return {
            "text": f"Transcription failed: {str(e)}. Please try again.",
            "segments": [
                {
                    "start": 0,
                    "end": 1,
                    "text": f"Transcription failed: {str(e)}. Please try again."
                }
            ]
        }
    finally:
        # Clean up the temporary file
        try:
            os.unlink(temp_file_path)
            print(f"🧹 Cleaned up temporary file: {temp_file_path}")
        except:
            pass
