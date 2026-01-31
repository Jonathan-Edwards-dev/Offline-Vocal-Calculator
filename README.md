# Offline-Vocal-Calculator
---

Offline Vocal Calculator is a fully offline voice-controlled calculator that recognizes spoken digits and arithmetic operators without using any internet connection, cloud speech APIs, or machine-learning services.

The project demonstrates how classical audio signal processing techniques can be used to build a practical voice-driven system using MFCC feature extraction and Dynamic Time Warping (DTW) for pattern matching.

---

## Problem Overview

Most modern voice applications depend on online speech-to-text services and large machine-learning models. This project intentionally avoids those approaches and instead focuses on understanding how voice recognition can be implemented offline using traditional, explainable algorithms.

---

## How the System Works

1. Voice samples are recorded for digits (0–9) and arithmetic operators (+, −, ×, ÷)
2. Mel-Frequency Cepstral Coefficients (MFCC) are extracted from each template audio file
3. Delta and delta-delta features are added to capture temporal changes
4. Live audio input is recorded from the microphone
5. Features are extracted and normalized
6. Dynamic Time Warping (DTW) compares live input against stored templates
7. The closest matching template is selected
8. The recognized value is appended to the calculator expression
9. The final expression is evaluated and displayed

---

## Audio Processing Details

- Sample rate: 16 kHz
- Mono channel input
- Fixed recording duration for consistency
- Aggressive silence trimming
- Feature normalization for stable distance comparison

### Feature Set
- MFCC (13 coefficients)
- Delta MFCC
- Delta-Delta MFCC

### Matching Method
- Dynamic Time Warping (DTW)
- Euclidean distance metric
- Robust to variations in speaking speed and timing

---

## Key Features

- Completely offline operation
- No external APIs or internet dependency
- Voice recognition using MFCC + DTW
- Flask-based backend
- Web-based calculator interface
- Voice-driven arithmetic input
- Expression evaluation and playback
- Light / dark theme slider
- Controlled voice capture loop with manual stop

---

## Technology Stack

**Backend**
- Python
- Flask
- PyAudio
- Librosa
- NumPy
- FastDTW
- SciPy

**Frontend**
- HTML
- CSS
- JavaScript

---

## Project Structure

OfflineVocalCalculator/
│── app.py
│── record_audio.py
│── README.md
│
├── static/
│   ├── audio/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
│
└── templates/
    └── index.html

---

## Running the Project

Install the required dependencies:

```bash
pip install flask pyaudio librosa numpy fastdtw scipy
````

Record template audio samples (one-time setup):

```bash
python record_audio.py
```

Start the application:

```bash
python app.py
```

Access the interface at:

```
http://127.0.0.1:5000
```

---

## Limitations

* Speaker-dependent recognition
* Fixed vocabulary (digits and basic operators)
* Sensitive to background noise

These constraints are intentional to keep the system fully offline, interpretable, and focused on classical signal-processing techniques.

---

## Future Enhancements

* Speaker-independent normalization
* Noise-robust preprocessing
* Expanded command vocabulary
* Adaptive template updating
* Comparison with offline ML classifiers

---

## Disclaimer

This project is built for educational and experimental purposes to explore offline speech processing and pattern recognition using classical algorithms.
