import pyaudio
import wave
from pathlib import Path

# ================== Configuration ==================
BASE_DIR = Path(__file__).resolve().parent
AUDIO_DIR = BASE_DIR / "static" / "audio"

SAMPLE_RATE = 16000
CHUNK = 1024        # Size of audio chunks
RECORD_SECONDS = 2  # Duration of the recording
# ===================================================

def record_audio(filename):
    """Record audio and save as WAV file in static/audio"""
    audio = pyaudio.PyAudio()

    stream = audio.open(
        format=pyaudio.paInt16,
        channels=1,
        rate=SAMPLE_RATE,
        input=True,
        frames_per_buffer=CHUNK
    )

    frames = []

    print(f"Recording {filename} for {RECORD_SECONDS} seconds... Speak now!")
    for _ in range(0, int(SAMPLE_RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK, exception_on_overflow=False)
        frames.append(data)

    stream.stop_stream()
    stream.close()
    audio.terminate()

    # Ensure the folder exists
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    filepath = AUDIO_DIR / filename
    with wave.open(str(filepath), 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(audio.get_sample_size(pyaudio.paInt16))
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(b''.join(frames))

    print(f"Saved recording to {filepath}")


def main():
    filenames = [
        '0.wav', '1.wav', '2.wav', '3.wav', '4.wav',
        '5.wav', '6.wav', '7.wav', '8.wav', '9.wav',
        'plus.wav', 'minus.wav', 'multiply.wav', 'divide.wav'
    ]

    for filename in filenames:
        print(f"\nReady to record: {filename}")
        response = input("Type 's' and press Enter to start recording: ").strip().lower()
        if response == 's':
            record_audio(filename)
        else:
            print("Skipped.")

    print("\nAll recordings are completed.")


if __name__ == "__main__":
    main()
