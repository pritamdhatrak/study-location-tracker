const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    const html = <!DOCTYPE html>
<html>
<head>
    <title>Study Tracker - Working Version</title>
    <style>
        body { font-family: Arial; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background: #fafafa; }
        button { background: #007bff; color: white; border: none; padding: 12px 20px; margin: 5px; border-radius: 5px; cursor: pointer; font-size: 14px; }
        button:hover { background: #0056b3; }
        canvas { border: 2px solid #ddd; margin: 10px; background: white; border-radius: 5px; }
        .status { padding: 10px; margin: 10px 0; background: #e9ecef; border-radius: 5px; }
        .flex { display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Study Location Tracker</h1>
        
        <div class="section">
            <h2>Your Location</h2>
            <div class="status" id="locationStatus">Click button to get your location</div>
            <button onclick="getMyLocation()">Get My Location</button>
            <button onclick="trackLocation()">Track Location</button>
        </div>

        <div class="section">
            <h2>Study Timer</h2>
            <div class="flex">
                <canvas id="timer" width="250" height="250"></canvas>
                <canvas id="map" width="250" height="250"></canvas>
            </div>
            <div>
                <button onclick="startStudy()">Start Studying</button>
                <button onclick="pauseStudy()">Pause</button>
                <button onclick="stopStudy()">Stop and Save</button>
            </div>
            <div class="status" id="timerStatus">Ready to start studying</div>
        </div>

        <div class="section">
            <h2>Study Sessions</h2>
            <div id="sessions">No sessions yet</div>
        </div>
    </div>

    <script>
        var studyTime = 0;
        var isStudying = false;
        var currentPos = null;
        var watchId = null;
        
        var timerCanvas = document.getElementById('timer');
        var mapCanvas = document.getElementById('map');
        var timerCtx = timerCanvas.getContext('2d');
        var mapCtx = mapCanvas.getContext('2d');

        function init() {
            console.log('Page loaded');
            drawTimerChart(0);
            drawMapPlaceholder();
        }

        function getMyLocation() {
            console.log('Getting location...');
            document.getElementById('locationStatus').innerHTML = 'Getting your location...';
            
            if (!navigator.geolocation) {
                document.getElementById('locationStatus').innerHTML = 'Geolocation not supported';
                return;
            }

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    console.log('Location found:', position);
                    currentPos = position;
                    var lat = position.coords.latitude.toFixed(6);
                    var lon = position.coords.longitude.toFixed(6);
                    var acc = Math.round(position.coords.accuracy);
                    
                    document.getElementById('locationStatus').innerHTML = 
                        'Location found!<br>Lat: ' + lat + ', Lon: ' + lon + '<br>Accuracy: ' + acc + 'm';
                    drawMap(position);
                },
                function(error) {
                    console.log('Location error:', error);
                    var msg = 'Location error: ';
                    switch(error.code) {
                        case 1: msg += 'Permission denied'; break;
                        case 2: msg += 'Position unavailable'; break;
                        case 3: msg += 'Request timeout'; break;
                        default: msg += 'Unknown error';
                    }
                    document.getElementById('locationStatus').innerHTML = msg;
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }

        function trackLocation() {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
                document.getElementById('locationStatus').innerHTML += '<br>Stopped tracking';
                return;
            }

            if (!navigator.geolocation) return;
            
            watchId = navigator.geolocation.watchPosition(
                function(position) {
                    currentPos = position;
                    var lat = position.coords.latitude.toFixed(6);
                    var lon = position.coords.longitude.toFixed(6);
                    document.getElementById('locationStatus').innerHTML = 'Tracking... ' + lat + ', ' + lon;
                    drawMap(position);
                },
                function(error) {
                    console.log('Watch error:', error);
                }
            );
            
            document.getElementById('locationStatus').innerHTML = 'Started location tracking...';
        }

        function startStudy() {
            console.log('Starting study...');
            if (!isStudying) {
                isStudying = true;
                updateTimer();
                document.getElementById('timerStatus').innerHTML = 'Studying... Time: 0:00';
            }
        }

        function pauseStudy() {
            console.log('Pausing study...');
            isStudying = false;
            document.getElementById('timerStatus').innerHTML = 'Paused at ' + formatTime(studyTime);
        }

        function stopStudy() {
            console.log('Stopping study...');
            isStudying = false;
            
            if (studyTime > 0) {
                saveSession();
                studyTime = 0;
                drawTimerChart(0);
                document.getElementById('timerStatus').innerHTML = 'Session saved! Ready for next session.';
            } else {
                document.getElementById('timerStatus').innerHTML = 'No time to save. Start studying first!';
            }
        }

        function updateTimer() {
            if (isStudying) {
                requestIdleCallback(function() {
                    studyTime++;
                    drawTimerChart(studyTime);
                    document.getElementById('timerStatus').innerHTML = 'Studying... Time: ' + formatTime(studyTime);
                    setTimeout(updateTimer, 1000);
                });
            }
        }

        function drawTimerChart(seconds) {
            var ctx = timerCtx;
            var centerX = 125;
            var centerY = 125;
            var radius = 100;

            ctx.clearRect(0, 0, 250, 250);

            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, 250, 250);

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#dee2e6';
            ctx.lineWidth = 8;
            ctx.stroke();

            if (seconds > 0) {
                var progress = (seconds % 3600) / 3600;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, -Math.PI/2, (-Math.PI/2) + (progress * Math.PI * 2));
                ctx.strokeStyle = '#007bff';
                ctx.lineWidth = 8;
                ctx.stroke();
            }

            ctx.fillStyle = '#495057';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(formatTime(seconds), centerX, centerY + 5);
            
            ctx.font = '14px Arial';
            ctx.fillText('Study Time', centerX, centerY + 35);
        }

        function drawMapPlaceholder() {
            var ctx = mapCtx;
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, 250, 250);
            
            ctx.fillStyle = '#6c757d';
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Location Map', 125, 110);
            ctx.font = '14px Arial';
            ctx.fillText('Click "Get My Location"', 125, 140);
            ctx.fillText('to see your position', 125, 160);
        }

        function drawMap(position) {
            var ctx = mapCtx;
            var centerX = 125;
            var centerY = 125;

            ctx.fillStyle = '#e3f2fd';
            ctx.fillRect(0, 0, 250, 250);

            for (var i = 4; i > 0; i--) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, i * 20, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(33, 150, 243, ' + (0.1 * i) + ')';
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#1976d2';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#424242';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('You Are Here', centerX, 30);
            
            ctx.font = '10px Arial';
            var lat = position.coords.latitude.toFixed(4);
            var lon = position.coords.longitude.toFixed(4);
            ctx.fillText(lat + ', ' + lon, centerX, 220);
        }

        function formatTime(seconds) {
            var mins = Math.floor(seconds / 60);
            var secs = seconds % 60;
            return mins + ':' + secs.toString().padStart(2, '0');
        }

        function saveSession() {
            if (!currentPos) {
                document.getElementById('timerStatus').innerHTML = 'Please get your location first!';
                return;
            }

            var sessionData = {
                duration: studyTime,
                location: {
                    latitude: currentPos.coords.latitude,
                    longitude: currentPos.coords.longitude,
                    accuracy: currentPos.coords.accuracy
                },
                timestamp: new Date().toISOString()
            };

            fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Session saved:', data);
                loadSessions();
            })
            .catch(error => {
                console.error('Save error:', error);
                var sessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
                sessions.unshift(sessionData);
                localStorage.setItem('studySessions', JSON.stringify(sessions.slice(0, 10)));
                loadSessions();
            });
        }

        function loadSessions() {
            fetch('/api/sessions')
                .then(response => response.json())
                .then(sessions => displaySessions(sessions))
                .catch(() => {
                    var localSessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
                    displaySessions(localSessions);
                });
        }

        function displaySessions(sessions) {
            var container = document.getElementById('sessions');
            
            if (sessions.length === 0) {
                container.innerHTML = 'No study sessions yet. Start studying to create your first session!';
                return;
            }

            var html = '';
            sessions.slice(0, 5).forEach(function(session, index) {
                var duration = formatTime(session.duration);
                var date = new Date(session.timestamp || session.startTime).toLocaleString();
                var lat = session.location.latitude.toFixed(4);
                var lon = session.location.longitude.toFixed(4);
                
                html += '<div style="margin: 10px 0; padding: 15px; background: white; border-left: 4px solid #007bff; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
                html += '<div style="font-weight: bold; color: #007bff;">Session ' + (index + 1) + '</div>';
                html += '<div style="margin: 5px 0;"><strong>Date:</strong> ' + date + '</div>';
                html += '<div style="margin: 5px 0;"><strong>Duration:</strong> ' + duration + '</div>';
                html += '<div style="margin: 5px 0;"><strong>Location:</strong> ' + lat + ', ' + lon + '</div>';
                html += '</div>';
            });
            
            container.innerHTML = html;
        }

        window.onload = function() {
            console.log('Page fully loaded');
            init();
        };

        init();
    </script>
</body>
</html>;
    
    res.send(html);
});

app.post('/api/sessions', (req, res) => {
    console.log('Session saved:', req.body);
    res.json({ success: true, id: Date.now(), data: req.body });
});

app.get('/api/sessions', (req, res) => {
    res.json([]);
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
    console.log('Open your browser and go to: http://localhost:' + PORT);
});
