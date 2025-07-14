const express = require('express');
const app = express();

app.use(express.json());

// Serve HTML at root URL
app.get('/', (req, res) => {
    res.send(\<!DOCTYPE html>
<html>
<head>
    <title>Study Tracker</title>
    <style>
        body { font-family: Arial; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        button { background: #007bff; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0056b3; }
        canvas { border: 1px solid #ddd; margin: 10px; background: white; }
        .flex { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .status { padding: 10px; background: #f8f9fa; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Study Location Tracker</h1>
        
        <div class="section">
            <h2>📍 Your Location</h2>
            <div class="status" id="locationStatus">Click button to get your location</div>
            <button onclick="getMyLocation()">📍 Get My Location</button>
            <button onclick="watchMyLocation()">🔄 Track Location</button>
        </div>

        <div class="section">
            <h2>⏰ Study Timer & Maps</h2>
            <div class="flex">
                <canvas id="timerCanvas" width="250" height="250"></canvas>
                <canvas id="locationCanvas" width="250" height="250"></canvas>
            </div>
            <div>
                <button onclick="startStudyTimer()">▶️ Start Timer</button>
                <button onclick="pauseStudyTimer()">⏸️ Pause Timer</button>
                <button onclick="stopStudyTimer()">⏹️ Stop & Save</button>
            </div>
            <div class="status" id="timerStatus">Ready to start studying - Time: 0:00</div>
        </div>

        <div class="section">
            <h2>📖 Study History</h2>
            <div id="historyList">No study sessions yet. Start your first session!</div>
        </div>
    </div>

    <script>
        // Variables
        var studySeconds = 0;
        var isStudying = false;
        var currentPosition = null;
        var watchId = null;
        
        // Canvas elements
        var timerCanvas = document.getElementById('timerCanvas');
        var locationCanvas = document.getElementById('locationCanvas');
        var timerCtx = timerCanvas.getContext('2d');
        var locationCtx = locationCanvas.getContext('2d');

        // Location functions
        function getMyLocation() {
            console.log('Getting location...');
            document.getElementById('locationStatus').innerHTML = '🔄 Getting your location...';
            
            if (!navigator.geolocation) {
                document.getElementById('locationStatus').innerHTML = '❌ Geolocation not supported';
                return;
            }

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    console.log('Location success:', position);
                    currentPosition = position;
                    showLocationInfo(position);
                    drawLocationMap(position);
                },
                function(error) {
                    console.log('Location error:', error);
                    var msg = '❌ Location error: ';
                    switch(error.code) {
                        case 1: msg += 'Permission denied. Please allow location access.'; break;
                        case 2: msg += 'Position unavailable.'; break;
                        case 3: msg += 'Request timeout.'; break;
                        default: msg += 'Unknown error.';
                    }
                    document.getElementById('locationStatus').innerHTML = msg;
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }

        function showLocationInfo(position) {
            var lat = position.coords.latitude.toFixed(6);
            var lon = position.coords.longitude.toFixed(6);
            var acc = Math.round(position.coords.accuracy);
            
            document.getElementById('locationStatus').innerHTML = 
                '✅ <strong>Location Found!</strong><br>' +
                '📍 Latitude: ' + lat + '°<br>' +
                '📍 Longitude: ' + lon + '°<br>' +
                '🎯 Accuracy: ' + acc + ' meters';
        }

        function watchMyLocation() {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
                document.getElementById('locationStatus').innerHTML += '<br>🛑 Stopped tracking';
                return;
            }

            if (!navigator.geolocation) return;
            
            watchId = navigator.geolocation.watchPosition(
                function(position) {
                    currentPosition = position;
                    showLocationInfo(position);
                    drawLocationMap(position);
                    document.getElementById('locationStatus').innerHTML += '<br>🔄 Tracking active...';
                },
                function(error) {
                    console.log('Watch error:', error);
                }
            );
        }

        // Timer functions
        function startStudyTimer() {
            console.log('Starting timer...');
            if (!isStudying) {
                isStudying = true;
                updateStudyTimer();
            }
        }

        function pauseStudyTimer() {
            console.log('Pausing timer...');
            isStudying = false;
            document.getElementById('timerStatus').innerHTML = '⏸️ Paused at ' + formatTime(studySeconds);
        }

        function stopStudyTimer() {
            console.log('Stopping timer...');
            isStudying = false;
            
            if (studySeconds > 0) {
                saveStudySession();
                studySeconds = 0;
                drawTimerCanvas(0);
                document.getElementById('timerStatus').innerHTML = '✅ Session saved! Ready for next session.';
            } else {
                document.getElementById('timerStatus').innerHTML = '⚠️ No time to save. Start studying first!';
            }
        }

        function updateStudyTimer() {
            if (isStudying) {
                // Using Background Tasks API
                requestIdleCallback(function() {
                    studySeconds++;
                    drawTimerCanvas(studySeconds);
                    document.getElementById('timerStatus').innerHTML = '📚 Studying... Time: ' + formatTime(studySeconds);
                    setTimeout(updateStudyTimer, 1000);
                });
            }
        }

        // Canvas drawing functions
        function drawTimerCanvas(seconds) {
            var ctx = timerCtx;
            var centerX = 125;
            var centerY = 125;
            var radius = 100;

            // Clear canvas
            ctx.clearRect(0, 0, 250, 250);

            // Background
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, 250, 250);

            // Outer circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#dee2e6';
            ctx.lineWidth = 8;
            ctx.stroke();

            // Progress arc
            if (seconds > 0) {
                var progress = (seconds % 3600) / 3600; // Reset every hour
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, -Math.PI/2, (-Math.PI/2) + (progress * Math.PI * 2));
                ctx.strokeStyle = '#007bff';
                ctx.lineWidth = 8;
                ctx.stroke();
            }

            // Center text
            ctx.fillStyle = '#495057';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(formatTime(seconds), centerX, centerY + 5);
            
            // Label
            ctx.font = '14px Arial';
            ctx.fillText('Study Time', centerX, centerY + 35);
        }

        function drawLocationMap(position) {
            var ctx = locationCtx;
            var centerX = 125;
            var centerY = 125;

            // Clear and set background
            ctx.fillStyle = '#e3f2fd';
            ctx.fillRect(0, 0, 250, 250);

            // Draw location rings
            for (var i = 4; i > 0; i--) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, i * 20, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(33, 150, 243, ' + (0.15 * i) + ')';
                ctx.fill();
            }

            // Center point (your location)
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#1976d2';
            ctx.fill();

            // White border for center point
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Labels
            ctx.fillStyle = '#424242';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('📍 You Are Here', centerX, 30);
            
            // Coordinates
            ctx.font = '10px Arial';
            var lat = position.coords.latitude.toFixed(4);
            var lon = position.coords.longitude.toFixed(4);
            ctx.fillText(lat + '°, ' + lon + '°', centerX, 220);
        }

        function drawLocationPlaceholder() {
            var ctx = locationCtx;
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, 250, 250);
            
            ctx.fillStyle = '#6c757d';
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('📍 Location Map', 125, 110);
            ctx.font = '14px Arial';
            ctx.fillText('Click "Get My Location"', 125, 140);
            ctx.fillText('to see your position', 125, 160);
        }

        // Helper functions
        function formatTime(seconds) {
            var mins = Math.floor(seconds / 60);
            var secs = seconds % 60;
            return mins + ':' + secs.toString().padStart(2, '0');
        }

        // Session management
        function saveStudySession() {
            if (!currentPosition) {
                document.getElementById('timerStatus').innerHTML = '❌ Please get your location first!';
                return;
            }

            var sessionData = {
                duration: studySeconds,
                location: {
                    latitude: currentPosition.coords.latitude,
                    longitude: currentPosition.coords.longitude,
                    accuracy: currentPosition.coords.accuracy
                },
                timestamp: new Date().toISOString()
            };

            // Try to save to server
            fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData)
            })
            .then(function(response) { return response.json(); })
            .then(function(data) {
                console.log('Session saved to server:', data);
                loadStudySessions();
            })
            .catch(function(error) {
                console.error('Server save failed, saving locally:', error);
                // Save locally as backup
                var sessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
                sessions.unshift(sessionData);
                localStorage.setItem('studySessions', JSON.stringify(sessions.slice(0, 10)));
                loadStudySessions();
            });
        }

        function loadStudySessions() {
            // Try server first, fallback to localStorage
            fetch('/api/sessions')
                .then(function(response) { return response.json(); })
                .then(function(sessions) { displaySessions(sessions); })
                .catch(function() {
                    var localSessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
                    displaySessions(localSessions);
                });
        }

        function displaySessions(sessions) {
            var container = document.getElementById('historyList');
            
            if (sessions.length === 0) {
                container.innerHTML = '📭 No study sessions yet. Start studying to create your first session!';
                return;
            }

            var html = '';
            sessions.slice(0, 5).forEach(function(session, index) {
                var duration = formatTime(session.duration);
                var date = new Date(session.timestamp || session.startTime).toLocaleString();
                var lat = session.location.latitude.toFixed(4);
                var lon = session.location.longitude.toFixed(4);
                
                html += '<div style="margin: 10px 0; padding: 15px; background: white; border-left: 4px solid #007bff; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
                html += '<div style="font-weight: bold; color: #007bff;">📚 Session ' + (index + 1) + '</div>';
                html += '<div style="margin: 5px 0;"><strong>📅 Date:</strong> ' + date + '</div>';
                html += '<div style="margin: 5px 0;"><strong>⏱️ Duration:</strong> ' + duration + '</div>';
                html += '<div style="margin: 5px 0;"><strong>📍 Location:</strong> ' + lat + '°, ' + lon + '°</div>';
                html += '</div>';
            });
            
            container.innerHTML = html;
        }

        // Initialize when page loads
        function initApp() {
            console.log('App initializing...');
            drawTimerCanvas(0);
            drawLocationPlaceholder();
            loadStudySessions();
            console.log('App ready!');
        }

        // Start when page loads
        window.onload = initApp;
        
        // Also try immediate initialization
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
        } else {
            initApp();
        }
    </script>
</body>
</html>\);
});

// API endpoints
app.post('/api/sessions', (req, res) => {
    console.log('📚 Session received:', req.body);
    res.json({ success: true, id: Date.now(), data: req.body });
});

app.get('/api/sessions', (req, res) => {
    res.json([]);
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log('✅ Server running successfully!');
    console.log('🌐 Open your browser and go to: http://localhost:' + PORT);
    console.log('📱 The app should load immediately');
});
