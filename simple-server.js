const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send(\<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Study Tracker</title>
    <style>
        body { font-family: Arial; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .btn { background: #007bff; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer; }
        .btn:hover { background: #0056b3; }
        canvas { border: 1px solid #ddd; margin: 10px; background: white; }
        .flex { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .status { padding: 10px; background: #f8f9fa; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Study Location Tracker</h1>
        
        <div class="section">
            <h2>Location</h2>
            <div class="status" id="loc">Click button to get location</div>
            <div class="btn" id="getLocBtn">Get Location</div>
        </div>

        <div class="section">
            <h2>Study Timer</h2>
            <div class="flex">
                <canvas id="timer" width="200" height="200"></canvas>
                <canvas id="map" width="200" height="200"></canvas>
            </div>
            <div class="btn" id="startBtn">Start Timer</div>
            <div class="btn" id="stopBtn">Stop Timer</div>
            <div class="status" id="time">Time: 0:00</div>
        </div>

        <div class="section">
            <h2>Sessions</h2>
            <div id="sessions">No sessions yet</div>
        </div>
    </div>

    <script>
        var seconds = 0;
        var running = false;
        var pos = null;
        
        var timerCanvas = document.getElementById('timer');
        var mapCanvas = document.getElementById('map');
        var timerCtx = timerCanvas.getContext('2d');
        var mapCtx = mapCanvas.getContext('2d');

        // Get DOM elements
        var locDiv = document.getElementById('loc');
        var timeDiv = document.getElementById('time');
        var sessionsDiv = document.getElementById('sessions');
        
        var getLocBtn = document.getElementById('getLocBtn');
        var startBtn = document.getElementById('startBtn');
        var stopBtn = document.getElementById('stopBtn');

        // Add click listeners
        getLocBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            getLocation();
        });

        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            startTimer();
        });

        stopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            stopTimer();
        });

        function getLocation() {
            locDiv.innerHTML = 'Getting location...';
            
            if (!navigator.geolocation) {
                locDiv.innerHTML = 'Geolocation not supported';
                return;
            }

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    pos = position;
                    var lat = position.coords.latitude.toFixed(6);
                    var lon = position.coords.longitude.toFixed(6);
                    locDiv.innerHTML = 'Location: ' + lat + ', ' + lon;
                    drawMap();
                },
                function(error) {
                    locDiv.innerHTML = 'Location error: ' + error.message;
                }
            );
        }

        function startTimer() {
            if (!running) {
                running = true;
                updateTimer();
            }
        }

        function stopTimer() {
            running = false;
            if (seconds > 0) {
                saveSession();
            }
            seconds = 0;
            drawTimer();
        }

        function updateTimer() {
            if (running) {
                requestIdleCallback(function() {
                    seconds++;
                    var mins = Math.floor(seconds / 60);
                    var secs = seconds % 60;
                    timeDiv.innerHTML = 'Time: ' + mins + ':' + secs.toString().padStart(2, '0');
                    drawTimer();
                    setTimeout(updateTimer, 1000);
                });
            }
        }

        function drawTimer() {
            timerCtx.clearRect(0, 0, 200, 200);
            
            timerCtx.fillStyle = '#f0f0f0';
            timerCtx.fillRect(0, 0, 200, 200);
            
            timerCtx.beginPath();
            timerCtx.arc(100, 100, 80, 0, Math.PI * 2);
            timerCtx.strokeStyle = '#ddd';
            timerCtx.lineWidth = 6;
            timerCtx.stroke();
            
            if (seconds > 0) {
                var progress = (seconds % 60) / 60;
                timerCtx.beginPath();
                timerCtx.arc(100, 100, 80, -Math.PI/2, (-Math.PI/2) + (progress * Math.PI * 2));
                timerCtx.strokeStyle = '#007bff';
                timerCtx.lineWidth = 6;
                timerCtx.stroke();
            }
            
            timerCtx.fillStyle = 'black';
            timerCtx.font = '20px Arial';
            timerCtx.textAlign = 'center';
            var mins = Math.floor(seconds / 60);
            var secs = seconds % 60;
            timerCtx.fillText(mins + ':' + secs.toString().padStart(2, '0'), 100, 105);
        }

        function drawMap() {
            mapCtx.clearRect(0, 0, 200, 200);
            
            mapCtx.fillStyle = '#e0f0ff';
            mapCtx.fillRect(0, 0, 200, 200);
            
            for (var i = 3; i > 0; i--) {
                mapCtx.beginPath();
                mapCtx.arc(100, 100, i * 25, 0, Math.PI * 2);
                mapCtx.fillStyle = 'rgba(0, 100, 200, ' + (0.2 * i) + ')';
                mapCtx.fill();
            }
            
            mapCtx.beginPath();
            mapCtx.arc(100, 100, 5, 0, Math.PI * 2);
            mapCtx.fillStyle = '#007bff';
            mapCtx.fill();
            
            mapCtx.fillStyle = 'black';
            mapCtx.font = '12px Arial';
            mapCtx.textAlign = 'center';
            mapCtx.fillText('You are here', 100, 25);
        }

        function saveSession() {
            if (!pos) {
                sessionsDiv.innerHTML = 'No location available';
                return;
            }
            
            var data = {
                duration: seconds,
                location: {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                }
            };
            
            fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(result) {
                var mins = Math.floor(seconds / 60);
                sessionsDiv.innerHTML = 'Session saved: ' + mins + ' minutes';
            })
            .catch(function(error) {
                sessionsDiv.innerHTML = 'Session saved locally';
            });
        }

        function init() {
            drawTimer();
            mapCtx.fillStyle = '#f0f0f0';
            mapCtx.fillRect(0, 0, 200, 200);
            mapCtx.fillStyle = 'gray';
            mapCtx.font = '14px Arial';
            mapCtx.textAlign = 'center';
            mapCtx.fillText('Location Map', 100, 90);
            mapCtx.fillText('Click Get Location', 100, 110);
        }

        // Prevent any page navigation
        window.addEventListener('beforeunload', function(e) {
            // Just log, don't prevent
        });

        // Prevent form submissions
        document.addEventListener('submit', function(e) {
            e.preventDefault();
            return false;
        });

        // Initialize
        init();
        
        // Auto get location after 2 seconds
        setTimeout(function() {
            getLocation();
        }, 2000);
    </script>
</body>
</html>\);
});

app.post('/api/sessions', (req, res) => {
    console.log('Session:', req.body);
    res.json({ success: true });
});

app.get('/api/sessions', (req, res) => {
    res.json([]);
});

app.listen(process.env.PORT || 5000, () => {
    console.log('Server running');
});
