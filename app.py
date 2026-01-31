from flask import Flask, render_template, request, jsonify
import os
import wave
import pyaudio
import numpy as np
import librosa
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean

# ================== Configuration ==================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(BASE_DIR, "static", "audio")  # Shared folder for templates & recordings
SAMPLE_RATE = 16000         # Match recorded audio
CHUNK = 1024
RECORD_SECONDS = 2           # Match template length for accurate DTW
RECORD_FILE = 'calc.wav'
# ===================================================

# Dictionary for template files
FILE_VALUES = {
    '0.wav': 0, '1.wav': 1, '2.wav': 2, '3.wav': 3, '4.wav': 4,
    '5.wav': 5, '6.wav': 6, '7.wav': 7, '8.wav': 8, '9.wav': 9,
    'plus.wav': '+', 'minus.wav': '-', 'multiply.wav': '*', 'divide.wav': '/'
}

app = Flask(__name__)

# ================== Record Audio ==================
def record_audio(filename):
    """Record audio and save as WAV file"""
    audio = pyaudio.PyAudio()
    stream = audio.open(
        format=pyaudio.paInt16,
        channels=1,
        rate=SAMPLE_RATE,
        input=True,
        frames_per_buffer=CHUNK
    )

    frames = []
    for _ in range(0, int(SAMPLE_RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK, exception_on_overflow=False)
        frames.append(data)

    stream.stop_stream()
    stream.close()
    audio.terminate()

    filepath = os.path.join(AUDIO_DIR, filename)
    with wave.open(filepath, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(audio.get_sample_size(pyaudio.paInt16))
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(b''.join(frames))


# ================== Feature Extraction ==================
def extract_features(filepath):
    """Extract MFCC + delta + delta-delta features, normalized"""
    y, sr = librosa.load(filepath, sr=SAMPLE_RATE)

    # Trim silence aggressively
    y, _ = librosa.effects.trim(y, top_db=25)

    # MFCC
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13, n_fft=400, hop_length=160)

    # Delta & delta-delta
    delta = librosa.feature.delta(mfcc)
    delta2 = librosa.feature.delta(mfcc, order=2)

    features = np.vstack([mfcc, delta, delta2])

    # Normalize per feature
    features = (features - np.mean(features, axis=1, keepdims=True)) / (np.std(features, axis=1, keepdims=True) + 1e-6)

    return features.T


# ================== Precompute Template Features ==================
TEMPLATE_FEATURES = {}
for filename in FILE_VALUES.keys():
    path = os.path.join(AUDIO_DIR, filename)
    if os.path.exists(path):
        TEMPLATE_FEATURES[filename] = extract_features(path)
    else:
        print(f"Warning: template file not found -> {filename}")


# ================== Compare Features ==================
def compare_features(f1, f2):
    """Compute DTW distance"""
    distance, _ = fastdtw(f1, f2, dist=euclidean)
    return distance


# ================== Match Audio ==================
def find_matching_file(new_features):
    """Find the template with the smallest DTW distance"""
    best_match = None
    best_score = float('inf')

    for filename, template_features in TEMPLATE_FEATURES.items():
        distance = compare_features(new_features, template_features)
        if distance < best_score:
            best_score = distance
            best_match = filename

    if best_match:
        return FILE_VALUES.get(best_match)
    return None


# ================== Flask Routes ==================
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/record', methods=['POST'])
def record():
    record_audio(RECORD_FILE)
    features = extract_features(os.path.join(AUDIO_DIR, RECORD_FILE))
    value = find_matching_file(features)
    return jsonify({'value': value})


# ================== Main ==================
if __name__ == "__main__":
    app.run(debug=True)
