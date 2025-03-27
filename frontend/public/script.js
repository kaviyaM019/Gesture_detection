console.log('Gesture Control System Initialized');

document.addEventListener('DOMContentLoaded', function() {
    const videoInput = document.getElementById('videoInput');
    const videoPlayer = document.getElementById('videoPlayer');
    const webcam = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const startButton = document.getElementById('startCamera');
    const volumeLevel = document.getElementById('volumeLevel');
    const detectedGesture = document.getElementById('detectedGesture');
    let isGestureControlActive = false;
    let stream = null;

    // Video Input Handler
    videoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const videoUrl = URL.createObjectURL(file);
            videoPlayer.src = videoUrl;
            videoPlayer.play(); // Automatically start playing
        }
    });

    // Start Gesture Control
    startButton.addEventListener('click', async function() {
        if (!isGestureControlActive) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480 } 
                });
                webcam.srcObject = stream;
                isGestureControlActive = true;
                startButton.textContent = 'Stop Gesture Control';
                startGestureDetection();
            } catch (err) {
                console.error('Error accessing camera:', err);
                alert('Camera access denied. Please allow camera access.');
            }
        } else {
            stopGestureControl();
        }
    });

    let detectionInterval;

    function startGestureDetection() {
        detectionInterval = setInterval(() => {
            if (videoPlayer.src && !videoPlayer.paused) {
                captureAndProcessGesture();
            }
        }, 300); // More frequent checks (300ms)
    }

    function stopGestureControl() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            webcam.srcObject = null;
        }
        clearInterval(detectionInterval);
        isGestureControlActive = false;
        startButton.textContent = 'Start Gesture Control';
    }

    async function captureAndProcessGesture() {
        const context = canvas.getContext('2d');
        canvas.width = webcam.videoWidth;
        canvas.height = webcam.videoHeight;
        context.drawImage(webcam, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async function(blob) {
            const formData = new FormData();
            formData.append('file', blob, 'gesture.jpg');

            try {
                const response = await fetch('http://localhost:8000/predict', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                handleGesture(data.gesture);
            } catch (error) {
                console.error('Error:', error);
            }
        }, 'image/jpeg');
    }

    function handleGesture(gesture) {
        detectedGesture.textContent = gesture;
        console.log('Detected:', gesture); // Debug log

        if (videoPlayer.src) {
            switch(gesture) {
                case 'Thumbs Up':
                    videoPlayer.volume = Math.min(1, videoPlayer.volume + 0.2); // Bigger volume change
                    console.log('Volume Up:', Math.round(videoPlayer.volume * 100) + '%');
                    break;
                case 'Thumbs Down':
                    videoPlayer.volume = Math.max(0, videoPlayer.volume - 0.2); // Bigger volume change
                    console.log('Volume Down:', Math.round(videoPlayer.volume * 100) + '%');
                    break;
                case 'Left Swipe':
                    videoPlayer.currentTime -= 10;
                    console.log('Rewinding');
                    break;
                case 'Right Swipe':
                    videoPlayer.currentTime += 10;
                    console.log('Forwarding');
                    break;
                case 'Stop':
                    if (videoPlayer.paused) {
                        videoPlayer.play();
                        console.log('Playing');
                    } else {
                        videoPlayer.pause();
                        console.log('Paused');
                    }
                    break;
            }
        }
    }

    function updateVolumeDisplay() {
        volumeLevel.textContent = Math.round(videoPlayer.volume * 100) + '%';
    }

    // Initialize volume display
    updateVolumeDisplay();
});