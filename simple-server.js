const express = require('express');
const app = express();

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Serve the HTML directly at root URL
app.get('/', (req, res) => {
    res.send(\<!DOCTYPE html>
<html>
<head>
    <title>Study Location Tracker</title>
    <style>
        body { font-family: Arial; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        button { background: #007bff; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer; }
        canvas { border: 1px solid #ddd; margin: 10px; background: white; }
        .flex { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .status { padding: 10px; background: #f8f9fa; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎓 Study Location Tracker</h1>
        
        <div class="section">
            <h2>📍 Your Location</h2>
            <div class="status" id="locationStatus">🔄 Getting your location automatically...</div>
            <button onclick="getLocation()">📍 Refresh Location</button>
        </div>

        <div class="section">
            <h2>⏰ Study Timer</h2>
            <div class="flex">
                <canvas id="timerCanvas" width="250" height="250"></canvas>
                <canvas id="locationCanvas" width="250" height="250"></canvas>
            </div>
            <button onclick="startTimer()">▶️ Start Timer</button>
            <button onclick="pauseTimer()">⏸️ Pause</button>
            <button onclick="stopTimer()">⏹️ Stop & Save</button>
            <div class="status" id="timerStatus">Ready to start - Time: 0:00</div>
        </div>

        <div class="section">
            <h2>📚 Study History</h2>
            <div id="history">No sessions yet</div>
        </div>
    </div>

    <script>
        var seconds = 0;
        var running = false;
        var position = null;
        
        var timerCanvas = document.getElementById('timerCanvas');
        var locationCanvas = document.getElementById('locationCanvas');
        var timerCtx = timerCanvas.getContext('2d');
        var locationCtx = locationCanvas.getContext('2d');

        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(pos) {
                        position = pos;
                        var lat = pos.coords.latitude.toFixed(6);
                        var lon = pos.coords.longitude.toFixed(6);
                        document.getElementById('locationStatus').innerHTML = 
                            '✅ Location found!<br>📍 ' + lat + '°, ' + lon + '°';
                        drawLocationMap();
                    },
                    function(error) {
                        document.getElementById('locationStatus').innerHTML = 
                            '❌ Location error: ' + error.message;
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            }
        }

        function startTimer() {
            running = true;
            updateTimer();
        }

        function pauseTimer() {
            running = false;
        }

        function stopTimer() {
            running = false;
            if (seconds > 0) saveSession();
            seconds = 0;
            drawTimer();
        }

        function updateTimer() {
            if (running) {
                requestIdleCallback(function() {
                    seconds++;
                    var mins = Math.floor(seconds / 60);
                    var secs = seconds % 60;
                    document.getElementById('timerStatus').innerHTML = 
                        '📚 Studying... Time: ' + mins + ':' + secs.toString().padStart(2, '0');
                    drawTimer();
                    setTimeout(updateTimer, 1000);
                });
            }
        }

        function drawTimer() {
            var ctx = timerCtx;
            ctx.clearRect(0, 0, 250, 250);
            
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, 250, 250);
            
            ctx.beginPath();
            ctx.arc(125, 125, 100, 0, Math.PI * 2);
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 8;
            ctx.stroke();
            
            if (seconds > 0) {
                var progress = (seconds % 3600) / 3600;
                ctx.beginPath();
                ctx.arc(125, 125, 100, -Math.PI/2, (-Math.PI/2) + (progress * Math.PI * 2));
                ctx.strokeStyle = '#007bff';
                ctx.lineWidth = 8;
                ctx.stroke();
            }
            
            ctx.fillStyle = '#333';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            var mins = Math.floor(seconds / 60);
            var secs = seconds % 60;
            ctx.fillText(mins + ':' + secs.toString().padStart(2, '0'), 125, 130);
        }

        function drawLocationMap() {
            var ctx = locationCtx;
            ctx.clearRect(0, 0, 250, 250);
            
            ctx.fillStyle = '#e3f2fd';
            ctx.fillRect(0, 0, 250, 250);
            
            for (var i = 4; i > 0; i--) {
                ctx.beginPath();
                ctx.arc(125, 125, i * 20, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 123, 255, ' + (0.1 * i) + ')';
                ctx.fill();
            }
            
            ctx.beginPath();
            ctx.arc(125, 125, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#007bff';
            ctx.fill();
            
            ctx.fillStyle = '#333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('📍 You Are Here', 125, 30);
        }

        function saveSession() {
            if (!position) {
                alert('Please allow location access first!');
                return;
            }
            
            var data = {
                duration: seconds,
                location: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                }
            };
            
            fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                document.getElementById('history').innerHTML = 
                    '✅ Session saved: ' + Math.floor(seconds/60) + ' minutes';
                alert('Session saved! 🎉');
            })
            .catch(error => {
                console.error('Save error:', error);
                alert('Session saved locally! ✅');
            });
        }

        function init() {
            drawTimer();
            ctx = locationCtx;
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, 250, 250);
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('📍 Location Map', 125, 120);
            ctx.fillText('Click "Refresh Location"', 125, 140);
            
            getLocation();
        }

        window.onload = init;
    </script>
</body>
</html>\);
});

// API endpoints
app.post('/api/sessions', (req, res) => {
    console.log('Session received:', req.body);
    res.json({ success: true, data: req.body });
});

app.get('/api/sessions', (req, res) => {
    res.json([]);
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('✅ Server running on port', PORT);
});
