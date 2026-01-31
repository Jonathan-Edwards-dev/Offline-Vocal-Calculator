let continueLoop = true; // Flag to control the loop
let isLoopActive = false; // Flag to track if the loop is currently active

function appendToResult(value) {
    document.getElementById('result').value += value;
}

function clearResult() {
    document.getElementById('result').value = '';
}

function undo() {
    let result = document.getElementById('result').value;
    document.getElementById('result').value = result.slice(0, -1);
}

function calculateResult() {
    const result = document.getElementById('result').value;
    try {
        const output = eval(result);
        document.getElementById('result').value = output;
        playResultAudio(output);
    } catch (error) {
        document.getElementById('result').value = 'Error';
    }
}

function playResultAudio(result) {
    const resultStr = result.toString();
    let index = 0;

    function playNextDigit() {
        if (index < resultStr.length && continueLoop) {
            const digit = resultStr[index];

            // Handle negative sign and decimal point (skip them as they don't have associated audio)
            if (digit === '-') {
                index++;
                playNextDigit();
                return;
            } else if (digit === '.') {
                index++;
                playNextDigit();
                return;
            }

            let audioElement = document.getElementById('audio-' + digit);
            if (!audioElement) {
                // Handle cases for operators
                switch (digit) {
                    case '+':
                        audioElement = document.getElementById('audio-plus');
                        break;
                    case '-':
                        audioElement = document.getElementById('audio-minus');
                        break;
                    case '*':
                        audioElement = document.getElementById('audio-multiply');
                        break;
                    case '/':
                        audioElement = document.getElementById('audio-divide');
                        break;
                }
            }

            if (audioElement) {
                audioElement.play();
                audioElement.onended = playNextDigit;  // When the current audio ends, play the next one
            }
            index++;
        }
    }

    playNextDigit();  // Start playing the first digit's audio
}

function activateVoice() {
    return fetch('/record', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.value !== null) {
                appendToResult(data.value);
            } else {
                console.error('No matching audio found');
            }
        })
        .catch(error => console.error('Error:', error));
}

function activateVoiceMultipleTimes(times, delay = 0) {
    if (isLoopActive) {
        console.warn('Loop is already active.');
        return Promise.resolve(); // Exit if loop is already active
    }
    
    isLoopActive = true; // Indicate that the loop is active
    let promiseChain = Promise.resolve();

    for (let i = 0; i < times; i++) {
        promiseChain = promiseChain
            .then(() => {
                if (continueLoop) {
                    return activateVoice();
                } else {
                    return Promise.reject('Loop stopped');
                }
            })
            .then(() => {
                if (i < times - 1 && continueLoop) { // Delay only between calls, not after the last one
                    return new Promise(resolve => setTimeout(resolve, delay));
                }
            })
            .catch(error => {
                if (error !== 'Loop stopped') {
                    console.error('Error:', error);
                }
            });
    }

    return promiseChain
        .finally(() => {
            isLoopActive = false; // Indicate that the loop is no longer active
	    continueLoop = true;
        });
}

function stopLoop() {
    continueLoop = false; // Set the flag to false to stop the loop
}

document.addEventListener('DOMContentLoaded', () => {
    const activateVoiceButton = document.getElementById('activateVoiceButton');
    const stopButton = document.querySelector('.stop');

    // Reset continueLoop only when specific buttons are clicked (like the activateVoiceButton)
    if (activateVoiceButton) {
        activateVoiceButton.addEventListener('click', () => {
            continueLoop = true; // Reset the loop to start when voice is activated
            activateVoiceMultipleTimes(5, 1000); // Activate voice 5 times with a 1-second delay
        });
    } else {
        console.error('Button with ID "activateVoiceButton" not found.');
    }

    if (stopButton) {
        stopButton.addEventListener('click', () => {
            stopLoop(); // Stop the loop when stop button is clicked
        });
    } else {
        console.error('Stop button with class "stop" not found.');
    }

    // Reset continueLoop for buttons other than the stop button
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Ensure the stop button does not reset continueLoop to true
            if (!button.classList.contains('stop')) {
                continueLoop = true; // Reset the loop for all other buttons
            }
        });
    });
});































document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('themeSlider');
    const body = document.body;
    const calculator = document.querySelector('.calculator');
    const displayInput = document.querySelector('.display input');
    const buttons = document.querySelectorAll('.button, .equal-button, .stop');

    function updateTheme(percentage) {
        // Calculate the interpolated colors
        const lightBackground = '255, 255, 255'; // RGB for light mode background
        const darkBackground = '26, 26, 26'; // RGB for dark mode background
        const lightTextColor = '0, 0, 0'; // RGB for light mode text
        const darkTextColor = '255, 255, 255'; // RGB for dark mode text

        const r1 = parseInt(lightBackground.split(',')[0]);
        const g1 = parseInt(lightBackground.split(',')[1]);
        const b1 = parseInt(lightBackground.split(',')[2]);
        const r2 = parseInt(darkBackground.split(',')[0]);
        const g2 = parseInt(darkBackground.split(',')[1]);
        const b2 = parseInt(darkBackground.split(',')[2]);

        const rText1 = parseInt(lightTextColor.split(',')[0]);
        const gText1 = parseInt(lightTextColor.split(',')[1]);
        const bText1 = parseInt(lightTextColor.split(',')[2]);
        const rText2 = parseInt(darkTextColor.split(',')[0]);
        const gText2 = parseInt(darkTextColor.split(',')[1]);
        const bText2 = parseInt(darkTextColor.split(',')[2]);

        // Interpolate colors
        const r = Math.round(r1 + (r2 - r1) * percentage);
        const g = Math.round(g1 + (g2 - g1) * percentage);
        const b = Math.round(b1 + (b2 - b1) * percentage);

        const rText = Math.round(rText1 + (rText2 - rText1) * percentage);
        const gText = Math.round(gText1 + (gText2 - gText1) * percentage);
        const bText = Math.round(bText1 + (bText2 - bText1) * percentage);

        // Apply the styles
        body.style.background = `linear-gradient(135deg, rgb(${r}, ${g}, ${b}), rgb(${r}, ${g}, ${b}))`;
        calculator.style.background = `rgba(${r}, ${g}, ${b}, 0.2)`;
        calculator.style.boxShadow = `0px 10px 30px rgba(${r}, ${g}, ${b}, 0.5)`;
        displayInput.style.color = `rgb(${rText}, ${gText}, ${bText})`;
        buttons.forEach(button => {
            button.style.color = `rgb(${rText}, ${gText}, ${bText})`;
        });
    }

    slider.addEventListener('input', (event) => {
        const value = event.target.value;
        const percentage = value / 100;
        updateTheme(percentage);
    });

    // Initialize theme
    updateTheme(slider.value / 100);
});

